// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import sharp from 'sharp'
import { buildImages } from './build-images.mjs'

let tmp
let outDir
let manifestDir

async function run(sources, opts = {}) {
  return buildImages({ sources, root: tmp, outDir, manifestDir, quiet: true, ...opts })
}

beforeAll(async () => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ksm-img-'))
  outDir = path.join(tmp, 'out')
  manifestDir = path.join(tmp, 'manifests')
  // Left half red, right half blue: a crop can be told apart by colour.
  const left = await sharp({ create: { width: 1000, height: 1000, channels: 3, background: '#ff0000' } }).png().toBuffer()
  await sharp({ create: { width: 2000, height: 1000, channels: 3, background: '#0000ff' } })
    .composite([{ input: left, left: 0, top: 0 }])
    .png()
    .toFile(path.join(tmp, 'fixture.png'))
})

afterAll(() => fs.rmSync(tmp, { recursive: true, force: true }))

describe('build-images', () => {
  it('never upscales and writes a manifest entry', async () => {
    await run([{ id: 'fx', group: 'g', src: 'fixture.png', widths: [640, 1024, 2560] }])
    const files = fs.readdirSync(outDir).sort()
    expect(files).toEqual(['fx-1024.avif', 'fx-1024.webp', 'fx-640.avif', 'fx-640.webp'])
    const manifest = JSON.parse(fs.readFileSync(path.join(manifestDir, 'g.json'), 'utf8'))
    expect(manifest.fx).toMatchObject({ path: '/img/fx', w: 2000, h: 1000, widths: [640, 1024] })
    expect(manifest.fx.color).toMatch(/^#[0-9A-F]{6}$/)
  })

  it('applies the crop before resizing', async () => {
    await run([
      { id: 'cr', group: 'c', src: 'fixture.png', crop: { left: 0, top: 0, width: 1000, height: 1000 }, widths: [500, 2000] },
    ])
    const manifest = JSON.parse(fs.readFileSync(path.join(manifestDir, 'c.json'), 'utf8'))
    expect(manifest.cr).toMatchObject({ w: 1000, h: 1000, widths: [500] })
    const meta = await sharp(fs.readFileSync(path.join(outDir, 'cr-500.webp'))).metadata()
    expect([meta.width, meta.height]).toEqual([500, 500])
    const { dominant } = await sharp(fs.readFileSync(path.join(outDir, 'cr-500.webp'))).stats()
    expect(dominant.r).toBeGreaterThan(200)
    expect(dominant.b).toBeLessThan(60)
  })

  it('skips existing outputs unless forced', async () => {
    const file = path.join(outDir, 'fx-640.webp')
    const before = fs.statSync(file).mtimeMs
    await new Promise((r) => setTimeout(r, 20))
    await run([{ id: 'fx', group: 'g', src: 'fixture.png', widths: [640, 1024, 2560] }])
    expect(fs.statSync(file).mtimeMs).toBe(before)
    await run([{ id: 'fx', group: 'g', src: 'fixture.png', widths: [640, 1024, 2560] }], { force: true })
    expect(fs.statSync(file).mtimeMs).toBeGreaterThan(before)
  })

  it('copies pre-encoded ladders without re-encoding and measures them', async () => {
    const pre = path.join(tmp, 'pre')
    fs.mkdirSync(pre)
    for (const w of [300, 600]) {
      await sharp({ create: { width: w, height: w / 2, channels: 3, background: '#336699' } }).webp().toFile(path.join(pre, `p-${w}.webp`))
      await sharp({ create: { width: w, height: w / 2, channels: 3, background: '#336699' } }).avif().toFile(path.join(pre, `p-${w}.avif`))
    }
    await run([{ id: 'cp', group: 'k', kind: 'copy', src: 'pre/p-{w}', widths: [300, 600] }])
    expect(fs.readFileSync(path.join(outDir, 'cp-600.webp')).equals(fs.readFileSync(path.join(pre, 'p-600.webp')))).toBe(true)
    const manifest = JSON.parse(fs.readFileSync(path.join(manifestDir, 'k.json'), 'utf8'))
    expect(manifest.cp).toMatchObject({ path: '/img/cp', w: 600, h: 300, widths: [300, 600] })
    expect(manifest.cp.color).toMatch(/^#[0-9A-F]{6}$/)
  })
})

// Spec M3/M4 §11, ruling M4-PF6: a page's share image is its own photo's
// entry with an `og` crop, a 40:21 window of the entry's picture (after its
// own crop), rendered as one more file of that entry, 1200 × 630 JPEG, which
// every crawler reads; the manifest entry records it. Still one entry per
// source.
describe('the share image (og)', () => {
  // As the fixture, red on the left and blue on the right, each half 1300 px
  // wide, so a half holds a window larger than 1200 × 630.
  beforeAll(async () => {
    const left = await sharp({ create: { width: 1300, height: 1400, channels: 3, background: '#ff0000' } }).png().toBuffer()
    await sharp({ create: { width: 2600, height: 1400, channels: 3, background: '#0000ff' } })
      .composite([{ input: left, left: 0, top: 0 }])
      .png()
      .toFile(path.join(tmp, 'wide.png'))
  })
  // A 1240 × 651 window inside the blue half.
  const BLUE = { left: 1330, top: 100, width: 1240, height: 651 }

  it('renders the og window as a 1200 × 630 JPEG, recorded in the same entry', async () => {
    await run([{ id: 'sh', group: 's', src: 'wide.png', widths: [640], og: BLUE }])
    const manifest = JSON.parse(fs.readFileSync(path.join(manifestDir, 's.json'), 'utf8'))
    expect(Object.keys(manifest)).toEqual(['sh'])
    expect(manifest.sh).toMatchObject({ path: '/img/sh', w: 2600, h: 1400, widths: [640], og: '/img/sh-og.jpg' })
    const og = fs.readFileSync(path.join(outDir, 'sh-og.jpg'))
    const meta = await sharp(og).metadata()
    expect([meta.format, meta.width, meta.height]).toEqual(['jpeg', 1200, 630])
    const { dominant } = await sharp(og).stats()
    expect(dominant.b).toBeGreaterThan(200)
    expect(dominant.r).toBeLessThan(60)
  })

  it('takes the window after the entry’s own crop', async () => {
    // The crop keeps the red left half, and the window, in the cropped
    // picture's pixels, lies inside it.
    await run([{ id: 'sc', group: 's2', src: 'wide.png', crop: { left: 0, top: 0, width: 1300, height: 1400 }, widths: [500], og: { left: 30, top: 100, width: 1240, height: 651 } }])
    const { dominant } = await sharp(fs.readFileSync(path.join(outDir, 'sc-og.jpg'))).stats()
    expect(dominant.r).toBeGreaterThan(200)
    expect(dominant.b).toBeLessThan(60)
  })

  it('skips an existing share image unless forced', async () => {
    const file = path.join(outDir, 'sh-og.jpg')
    const before = fs.statSync(file).mtimeMs
    await new Promise((r) => setTimeout(r, 20))
    const entry = { id: 'sh', group: 's', src: 'wide.png', widths: [640], og: BLUE }
    await run([entry])
    expect(fs.statSync(file).mtimeMs).toBe(before)
    await run([entry], { force: true })
    expect(fs.statSync(file).mtimeMs).toBeGreaterThan(before)
  })

  it('refuses a window that is not 40:21, smaller than 1200 × 630, or outside the picture', async () => {
    const bad = (og) => run([{ id: 'bad', group: 'b', src: 'wide.png', widths: [640], og }])
    await expect(bad({ left: 0, top: 0, width: 1200, height: 900 })).rejects.toThrow(/bad: og window .* not 1200:630/)
    await expect(bad({ left: 0, top: 0, width: 800, height: 420 })).rejects.toThrow(/bad: og window .* under 1200 × 630/)
    await expect(bad({ left: 1500, top: 800, width: 1200, height: 630 })).rejects.toThrow(/bad: og window .* outside the 2600 × 1400 picture/)
    await expect(run([{ id: 'cpo', group: 'b', kind: 'copy', src: 'pre/p-{w}', widths: [300], og: BLUE }])).rejects.toThrow(/cpo: an og window needs an encoded entry/)
  })

  it('makes none for an entry without an og window', async () => {
    const manifest = JSON.parse(fs.readFileSync(path.join(manifestDir, 'g.json'), 'utf8'))
    expect(manifest.fx).not.toHaveProperty('og')
    expect(fs.existsSync(path.join(outDir, 'fx-og.jpg'))).toBe(false)
  })
})
