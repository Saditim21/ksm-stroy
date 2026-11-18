// @vitest-environment node
// Многофамилна's lights-off twin (mn-lights-off.mjs, spec M3 §6.3), made from
// the lit render's own file (sources.json's mn-dusk): the same picture with
// every lit window of the two towers turned to dark glass, and nothing changed
// outside the towers, so that the page can show the lit render through a
// floor's band without a seam. A pixel "changes" when its luminance moves by
// more than 8/255, read from the raw pixels makeTwin returns, so the
// encoder's noise never counts (ruling PF19).
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { makeTwin, stillOf } from './mn-lights-off.mjs'

const here = path.dirname(fileURLToPath(import.meta.url))
const sources = JSON.parse(fs.readFileSync(path.join(here, 'sources.json'), 'utf8'))
const LIT = path.resolve(here, '..', '..', sources.find((entry) => entry.id === 'mn-dusk').src)
// The lit render lives outside the repository, on this machine only.
const present = fs.existsSync(LIT)

const CHANGED = 8
// The towers' light bands on the building map's 1200-wide grid (spec §6.3).
const BANDS = [[70, 516], [700, 1146]]
const luma = (px, i) => 0.2126 * px[i] + 0.7152 * px[i + 1] + 0.0722 * px[i + 2]

describe.skipIf(!present)(present ? 'mn-lights-off' : `mn-lights-off: skipped, the lit render is not on this machine (${LIT})`, () => {
  let tmp
  let out
  let twin
  // Over the pixels that changed: how many, how many outside the towers'
  // bands, the sky (the top 8 %) or the street (the bottom 6 %), and their
  // mean luminance and warmth (red minus blue) before and after.
  const changed = { count: 0, astray: 0, litLuma: 0, twinLuma: 0, litWarmth: 0, twinWarmth: 0 }

  beforeAll(async () => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ksm-twin-'))
    out = path.join(tmp, 'twin.webp')
    twin = await makeTwin(LIT, out)
    const { width, height, lit, twin: dark } = twin
    const scale = width / 1200
    const sky = Math.ceil(height * 0.08)
    const street = Math.floor(height * 0.94)
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 3
        const before = luma(lit, i)
        const after = luma(dark, i)
        if (Math.abs(after - before) <= CHANGED) continue
        changed.count += 1
        const inBand = BANDS.some(([from, to]) => x >= from * scale && x < to * scale)
        if (!inBand || y < sky || y >= street) changed.astray += 1
        changed.litLuma += before
        changed.twinLuma += after
        changed.litWarmth += lit[i] - lit[i + 2]
        changed.twinWarmth += dark[i] - dark[i + 2]
      }
    }
  }, 120_000)

  afterAll(() => {
    if (tmp) fs.rmSync(tmp, { recursive: true, force: true })
  })

  it('the twin keeps size and alignment', async () => {
    const source = await sharp(fs.readFileSync(LIT)).metadata()
    const written = await sharp(fs.readFileSync(out)).metadata()
    expect([written.width, written.height]).toEqual([source.width, source.height])
    expect([twin.width, twin.height]).toEqual([source.width, source.height])
    // Away from the windows the written file is the lit render, pixel for
    // pixel but for the encoder's noise: a shift of one pixel, a crop or a
    // new grade would show here.
    const { data } = await sharp(fs.readFileSync(out)).removeAlpha().raw().toBuffer({ resolveWithObject: true })
    let sum = 0
    let count = 0
    for (let i = 0; i < data.length; i += 3) {
      if (Math.abs(luma(twin.twin, i) - luma(twin.lit, i)) > CHANGED) continue
      sum += Math.abs(luma(data, i) - luma(twin.lit, i))
      count += 1
    }
    expect(sum / count).toBeLessThan(2)
  })

  it('it changes only windows inside the building', () => {
    const share = changed.count / (twin.width * twin.height)
    expect(share).toBeGreaterThanOrEqual(0.01)
    expect(share).toBeLessThanOrEqual(0.12)
    expect(changed.astray).toBe(0)
  })

  it('lit windows become dark glass', () => {
    expect(changed.count).toBeGreaterThan(0)
    const before = changed.litLuma / changed.count
    const after = changed.twinLuma / changed.count
    expect(after).toBeLessThanOrEqual(before * 0.6)
    // Glass, not dimmed lamplight: the warm cast goes too.
    expect(changed.twinWarmth / changed.count).toBeLessThanOrEqual((changed.litWarmth / changed.count) * 0.5)
  })

  // M3 data-images minors: what stays as it is, the guard, and the committed
  // file the pipeline reads.
  it('leaves the street lamps’ heads and блок А’s timber exactly as they are', () => {
    const { mask } = stillOf(twin.width, twin.height)
    let kept = 0
    for (let p = 0; p < mask.length; p++) {
      if (!mask[p]) continue
      kept += 1
      const i = p * 3
      expect([twin.twin[i], twin.twin[i + 1], twin.twin[i + 2]], `pixel ${p % twin.width},${Math.floor(p / twin.width)}`)
        .toEqual([twin.lit[i], twin.lit[i + 1], twin.lit[i + 2]])
    }
    expect(kept).toBeGreaterThan(1000)
  })

  it('refuses a picture whose street lamps are not lit: it is not the lit render', async () => {
    const dark = path.join(tmp, 'dark.png')
    await sharp({ create: { width: twin.width, height: twin.height, channels: 3, background: '#101010' } }).png().toFile(dark)
    await expect(makeTwin(dark, path.join(tmp, 'dark-twin.webp'))).rejects.toThrow(/no street lamp at \d+,\d+/)
  }, 60_000)

  // The pipeline's source for mn-dusk-off is the committed file: it must be
  // this script's output, or an edit to the script without a rerun would
  // stay green. Over the windows the twin repaints, the committed file,
  // decoded, keeps to a fresh twin by the encoder's noise.
  it('is the committed src/assets/mnogofamilna/mn-dusk-off-2400.webp', async () => {
    const committed = path.resolve(here, '..', '..', 'src', 'assets', 'mnogofamilna', 'mn-dusk-off-2400.webp')
    const { data, info } = await sharp(fs.readFileSync(committed)).removeAlpha().raw().toBuffer({ resolveWithObject: true })
    expect([info.width, info.height]).toEqual([twin.width, twin.height])
    let sum = 0
    let count = 0
    for (let i = 0; i < data.length; i += 3) {
      if (Math.abs(luma(twin.twin, i) - luma(twin.lit, i)) <= CHANGED) continue
      sum += Math.abs(luma(data, i) - luma(twin.twin, i))
      count += 1
    }
    expect(count).toBe(changed.count)
    expect(sum / count).toBeLessThan(2)
  })
})
