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
