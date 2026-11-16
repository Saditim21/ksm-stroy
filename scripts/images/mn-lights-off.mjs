// Многофамилна's lights-off twin (spec M3 §6.3; `npm run mn-lights-off`).
//
// The page shows the night render with every window dark, and the lit render
// through the band of each floor that has a free apartment. Both pictures must
// match pixel for pixel, so the dark one is made from the lit one's own file
// (sources.json's mn-dusk): this script finds the lit windows of the two
// towers and repaints them as the unlit glass beside them, and leaves every
// other pixel as it was. Its output, src/assets/mnogofamilna/
// mn-dusk-off-2400.webp, is the image pipeline's source for mn-dusk-off
// (npm run images), which takes the lit render's widths, so both ladders match.
//
// Where it looks: the towers' light bands (x 70–516 for блок А and 700–1146
// for блок Б on the building map's 1200-wide grid, spec §6.3), from the top of
// floor 10 to the foot of floor 2 (src/data/maps/mnogofamilna.building.json).
// The courtyard between the blocks, the sky and the street are never touched,
// nor is light that runs out of a band's side: that is the evening sky
// beside a tower, not a window.
// What it repaints:
// - a lit pane: lamplight through glass, bright and yellow-white, or a dim
//   room's orange behind curtains, a window's worth of it. It becomes the
//   block's unlit glass, lighter at the floor's top than at its foot, keeping
//   the pane's own shading (curtains, a transom) as shades of the glass;
// - around a pane: its frame and sill, tinted by the light, and the glow on
//   the wall, warm or a thin light rim. They become the wall's dark neutral;
// - anywhere in the bands: a surface lamplight tints deep orange (the attic's
//   wall-washers under the canopy). It becomes the wall's neutral too.
// Leaves stay green, and the timber cladding and the heads of the two street
// lamps in front of the towers are left as they are: they are not windows.
//
// The twin is checked by eye (spec §6.3). Run this again only if the lit
// render changes, then `npm run images -- --force` to rebuild mn-dusk-off's
// ladder. `--preview <dir>` writes the mask it used over the lit render to
// <dir>/mask.png.
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import sharp from 'sharp'

sharp.cache(false) // no file handles held on Windows
const here = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(here, '..', '..')
export const TWIN = path.join(repoRoot, 'src', 'assets', 'mnogofamilna', 'mn-dusk-off-2400.webp')
const MAP = path.join(repoRoot, 'src', 'data', 'maps', 'mnogofamilna.building.json')

// The building map's grid, and where the render without its margins sits in
// it (spec §6.3): the full width, from y 56.2, 732.5 high.
const GRID = { width: 1200, top: 56.2, height: 732.5 }
// The towers' light bands on the grid, блок А then блок Б (spec §6.3).
const BANDS = [
  { block: 'А', from: 70, to: 516 },
  { block: 'Б', from: 700, to: 1146 },
]
// Above floor 10's band and below floor 2's, in grid units: the canopy's
// lights and a window's glow reach a little past the map's rectangles.
const REACH = { above: 6, below: 4 }
// What stays as it is, on the grid, measured on this render:
// - the heads of the street lamps in front of блок А and блок Б, both at
//   floor 6, halo included (ellipses);
// - the timber cladding of блок А, whose redder planks have a dim room's
//   orange: the recess between its two volumes, from under the canopy to
//   the shops, and the corner of floor 10 beside the band's edge
//   (rectangles).
const LAMPS = [
  { x: 147, y: 419.2, rx: 8.5, ry: 6.5 },
  { x: 794, y: 424.7, rx: 8.5, ry: 6 },
]
const TIMBER = [
  { x0: 312, x1: 334, y0: 268, y1: 566 },
  { x0: 501, x1: 516, y0: 254, y1: 292 },
]
// In source pixels: how wide a square proves a dim room (2 × ROOM + 1), how
// deep inside a pane a dim warm pixel still counts as its own, how far a
// pane's frame and glow reach, how thin a light line is a glow's rim (under
// 2 × RIM + 1), how wide a neighbourhood gives a pane's mean light, and how
// far from every pane the glass and the walls are sampled.
const ROOM = 6
const INNER = 3
const EDGE = 10
const RIM = 3
const PANE = 10
const CLEAR = 30

const luma = (r, g, b) => 0.2126 * r + 0.7152 * g + 0.0722 * b
const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v)
const smooth = (edge0, edge1, v) => {
  const t = clamp((v - edge0) / (edge1 - edge0), 0, 1)
  return t * t * (3 - 2 * t)
}

// The trees' leaves, lit by the street lamps: green, or yellow-green with no
// less green than red (only the brightest window, near white, has as much).
const isLeaf = (r, g, b) => g > r + 8 || (g >= 0.98 * r && luma(r, g, b) < 190)

// The red's share of a pixel's warmth, (red − blue) / red: lamplight through
// a pane, white to peach, stays under .65; the glow the attic's wall-washers
// throw on its piers is deeper (.6 to .9, .75 on the whole); timber is near
// .4 and the walls near .3.
const depth = (r, b) => (r - b) / Math.max(r, 1)

// How much a pixel looks like lamplight through glass, 0 to 1: light, from
// the peach of a curtained room to yellow-white, warm (red well above blue),
// not the orange of the timber (darker too), a wall-washer's deeper orange,
// nor a leaf.
function litness(r, g, b) {
  if (isLeaf(r, g, b)) return 0
  return smooth(70, 100, luma(r, g, b)) * smooth(18, 35, r - b) * smooth(0.68, 0.76, g / Math.max(r, 1)) * (1 - smooth(0.62, 0.7, depth(r, b)))
}

// A dim room's light: the orange of a lamp behind curtains, redder than most
// timber (green under .72 of red; timber's is near .78) but short of the
// wall-washers' deep orange. One such pixel proves nothing, as the timber's
// grain has a few; a window's worth of them, more than half the pixels side
// by side, is a room. Блок А's redder planks pass even so: TIMBER keeps
// them out by place.
function isRoomGlow(r, g, b) {
  return !isLeaf(r, g, b) && r - b >= 25 && g <= 0.72 * r && depth(r, b) <= 0.66 && luma(r, g, b) >= 40
}

// How orange lamplight has tinted a surface, 0 to 1, by the red's share of
// the warmth: timber stays near .4, the walls near .3.
function tint(r, g, b, from, to) {
  if (isLeaf(r, g, b)) return 0
  return smooth(from, to, depth(r, b)) * smooth(12, 40, r)
}

// Unlit glass: dark, cool or neutral (blue level with red, as the panes
// reflect the dusk sky). The walls: dark, a little warm, grey-olive.
function isGlass(r, g, b) {
  const y = luma(r, g, b)
  return y >= 38 && y <= 125 && b >= r - 3
}
function isWall(r, g, b) {
  const y = luma(r, g, b)
  return y >= 35 && y <= 75 && r - b >= 5 && r - b <= 25 && g >= 0.85 * r
}

// Each block's searched box and its floors' rows, top to bottom, in source
// pixels.
function blocksOf(width, height, map) {
  const sx = width / GRID.width
  const sy = height / GRID.height
  const toY = (gy) => (gy - GRID.top) * sy
  return BANDS.map(({ block, from, to }) => {
    const rows = map.shapes
      .filter((shape) => shape.type === 'floor' && shape.block === block)
      .map((shape) => {
        const ys = shape.polygons.flat().map(([, y]) => y)
        return { top: Math.min(...ys), bottom: Math.max(...ys) }
      })
      .sort((a, b) => a.top - b.top)
    return {
      floors: rows.map((row) => ({ top: toY(row.top), bottom: toY(row.bottom) })),
      x0: Math.round(from * sx),
      x1: Math.round(to * sx),
      y0: Math.max(0, Math.round(toY(rows[0].top - REACH.above))),
      y1: Math.min(height, Math.round(toY(rows[rows.length - 1].bottom + REACH.below))),
    }
  })
}

// What stays (the lamps' heads and the timber) as a mask, and the pixel at
// each lamp head's centre.
function stillOf(width, height) {
  const sx = width / GRID.width
  const sy = height / GRID.height
  const mask = new Uint8Array(width * height)
  const centres = LAMPS.map((lamp) => {
    const cx = lamp.x * sx
    const cy = (lamp.y - GRID.top) * sy
    const rx = lamp.rx * sx
    const ry = lamp.ry * sy
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
      for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
        if (((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1) mask[y * width + x] = 1
      }
    }
    return Math.round(cy) * width + Math.round(cx)
  })
  for (const zone of TIMBER) {
    const x0 = Math.round(zone.x0 * sx)
    const x1 = Math.round(zone.x1 * sx)
    const y0 = Math.max(0, Math.round((zone.y0 - GRID.top) * sy))
    const y1 = Math.min(height, Math.round((zone.y1 - GRID.top) * sy))
    for (let y = y0; y < y1; y++) mask.fill(1, y * width + x0, y * width + x1)
  }
  return { mask, centres }
}

// A box blur, radius r, both ways (a running sum each way).
function blur(field, width, height, r) {
  const tmp = new Float32Array(field.length)
  const out = new Float32Array(field.length)
  const n = 2 * r + 1
  for (let y = 0; y < height; y++) {
    const row = y * width
    let sum = 0
    for (let x = -r; x <= r; x++) sum += field[row + clamp(x, 0, width - 1)]
    for (let x = 0; x < width; x++) {
      tmp[row + x] = sum / n
      sum += field[row + Math.min(width - 1, x + r + 1)] - field[row + Math.max(0, x - r)]
    }
  }
  for (let x = 0; x < width; x++) {
    let sum = 0
    for (let y = -r; y <= r; y++) sum += tmp[clamp(y, 0, height - 1) * width + x]
    for (let y = 0; y < height; y++) {
      out[y * width + x] = sum / n
      sum += tmp[Math.min(height - 1, y + r + 1) * width + x] - tmp[Math.max(0, y - r) * width + x]
    }
  }
  return out
}

// The darkest (pick Math.min) or lightest (Math.max) value within r pixels,
// both ways: a square window, row then column.
function rank(field, width, height, r, pick) {
  const tmp = new Float32Array(field.length)
  const out = new Float32Array(field.length)
  for (let y = 0; y < height; y++) {
    const row = y * width
    for (let x = 0; x < width; x++) {
      let v = field[row + x]
      for (let d = Math.max(0, x - r); d <= Math.min(width - 1, x + r); d++) v = pick(v, field[row + d])
      tmp[row + x] = v
    }
  }
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      let v = tmp[y * width + x]
      for (let d = Math.max(0, y - r); d <= Math.min(height - 1, y + r); d++) v = pick(v, tmp[d * width + x])
      out[y * width + x] = v
    }
  }
  return out
}

// Clears the light that touches a box's left or right side, and all the
// light joined to it: the sky beside a tower.
function clearSky(light, width, box) {
  const stack = []
  for (let y = box.y0; y < box.y1; y++) {
    for (const x of [box.x0, box.x1 - 1]) if (light[y * width + x] > 0) stack.push(y * width + x)
  }
  while (stack.length > 0) {
    const p = stack.pop()
    if (light[p] <= 0) continue
    light[p] = 0
    const x = p % width
    const y = (p - x) / width
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx
        const ny = y + dy
        if (nx >= box.x0 && nx < box.x1 && ny >= box.y0 && ny < box.y1 && light[ny * width + nx] > 0) stack.push(ny * width + nx)
      }
    }
  }
}

function median(values) {
  const sorted = Float64Array.from(values).sort()
  return sorted[sorted.length >> 1]
}

// The median colour of a box's pixels that pass `keep`, or null when fewer
// than `least` do.
function toneOf(lit, width, box, keep, least) {
  const channels = [[], [], []]
  for (let y = box.y0; y < box.y1; y++) {
    for (let x = box.x0; x < box.x1; x++) {
      const p = y * width + x
      if (keep(p)) for (let c = 0; c < 3; c++) channels[c].push(lit[p * 3 + c])
    }
  }
  return channels[0].length >= least ? channels.map(median) : null
}

/**
 * Makes the lights-off twin of the lit render `src` and writes it to `out`
 * (WebP, the same size). Returns { width, height, lit, twin, mask }: the raw
 * RGB pixels before and after, and how much of each pixel was repainted
 * (0–255).
 */
export async function makeTwin(src, out) {
  const map = JSON.parse(fs.readFileSync(MAP, 'utf8'))
  const { data: lit, info } = await sharp(fs.readFileSync(src)).removeAlpha().raw().toBuffer({ resolveWithObject: true })
  const { width, height } = info
  const size = width * height
  const blocks = blocksOf(width, height, map)
  const still = stillOf(width, height)
  for (const p of still.centres) {
    if (luma(lit[p * 3], lit[p * 3 + 1], lit[p * 3 + 2]) < 180) {
      throw new Error(`mn-lights-off: no street lamp at ${p % width},${Math.floor(p / width)}; is ${src} the lit render?`)
    }
  }
  const blockAt = new Uint8Array(size) // the block's index + 1; 0 outside them
  blocks.forEach((box, b) => {
    for (let y = box.y0; y < box.y1; y++) {
      for (let x = box.x0; x < box.x1; x++) if (!still.mask[y * width + x]) blockAt[y * width + x] = b + 1
    }
  })

  // The lamplight, 0 to 1: through a lit pane, then in a dim room.
  const light = new Float32Array(size)
  const room = new Float32Array(size)
  for (let p = 0; p < size; p++) {
    if (!blockAt[p]) continue
    light[p] = litness(lit[p * 3], lit[p * 3 + 1], lit[p * 3 + 2])
    if (isRoomGlow(lit[p * 3], lit[p * 3 + 1], lit[p * 3 + 2])) room[p] = 1
  }
  // A room's heart: more than half its square lit so. The room: any warm
  // pixel up to ROOM pixels from that heart, which reaches the window's
  // corners and its frame.
  const roomShare = blur(room, width, height, ROOM)
  for (let p = 0; p < size; p++) room[p] = roomShare[p] > 0.5 ? 1 : 0
  const roomNear = blur(room, width, height, ROOM)
  for (let p = 0; p < size; p++) {
    if (roomNear[p] <= 0) continue
    const r = lit[p * 3]
    const g = lit[p * 3 + 1]
    const b = lit[p * 3 + 2]
    if (!isLeaf(r, g, b) && depth(r, b) <= 0.66) light[p] = Math.max(light[p], smooth(10, 22, r - b))
  }
  for (const box of blocks) clearSky(light, width, box)
  // The panes, as a set; how near each pixel is to one, and their mean
  // luminance around it.
  const pane = new Float32Array(size)
  const paneLuma = new Float32Array(size)
  for (let p = 0; p < size; p++) {
    if (light[p] < 0.5) continue
    pane[p] = 1
    paneLuma[p] = luma(lit[p * 3], lit[p * 3 + 1], lit[p * 3 + 2])
  }
  const inner = blur(pane, width, height, INNER)
  const near = blur(pane, width, height, EDGE)
  const paneShare = blur(pane, width, height, PANE)
  const paneMean = blur(paneLuma, width, height, PANE)
  const clear = blur(pane, width, height, CLEAR)

  // Clear of every lit pane: each block's wall and its unlit glass.
  const isClear = (b, test) => (p) => blockAt[p] === b + 1 && clear[p] === 0 && test(lit[p * 3], lit[p * 3 + 1], lit[p * 3 + 2])
  const walls = blocks.map((box, b) => toneOf(lit, width, box, isClear(b, isWall), 500))
  const glass = blocks.map((box, b) => toneOf(lit, width, box, isClear(b, isGlass), 500))
  if (walls.includes(null) || glass.includes(null)) throw new Error('mn-lights-off: too little unlit glass or wall to sample')
  // The wall's luminance around each pixel, from the wall clear of the panes.
  const wallSeen = new Float32Array(size)
  const wallLuma = new Float32Array(size)
  for (let p = 0; p < size; p++) {
    const b = blockAt[p] - 1
    if (b >= 0 && isWall(lit[p * 3], lit[p * 3 + 1], lit[p * 3 + 2]) && near[p] === 0) {
      wallSeen[p] = 1
      wallLuma[p] = luma(lit[p * 3], lit[p * 3 + 1], lit[p * 3 + 2])
    }
  }
  const wallShare = blur(wallSeen, width, height, CLEAR)
  const wallMean = blur(wallLuma, width, height, CLEAR)
  // How far each pixel stands above what a square of RIM pixels a side would
  // leave of it (a white top-hat): a thin light line, such as the glow that
  // rims a lit window's frame, stands high; a whole pane of glass does not.
  const lumaOf = new Float32Array(size)
  for (let p = 0; p < size; p++) lumaOf[p] = luma(lit[p * 3], lit[p * 3 + 1], lit[p * 3 + 2])
  const opened = rank(rank(lumaOf, width, height, RIM, Math.min), width, height, RIM, Math.max)

  const twin = Buffer.from(lit)
  const mask = new Uint8Array(size)
  for (let p = 0; p < size; p++) {
    const b = blockAt[p] - 1
    if (b < 0) continue
    const i = p * 3
    const r = lit[i]
    const g = lit[i + 1]
    const bl = lit[i + 2]
    const y = luma(r, g, bl)
    const wall = walls[b]
    const wallHere = wallShare[p] > 0.02 ? wallMean[p] / wallShare[p] : luma(...wall)
    const leaf = isLeaf(r, g, bl)
    // A pane's own pixels: its light, and any warm pixel well inside one (a
    // curtain's fold, a mullion), however dim.
    const paneW = Math.max(light[p], inner[p] > 0.15 && !leaf && depth(r, bl) <= 0.66 ? smooth(8, 25, r - bl) : 0)
    // Next to a pane: its frame, tinted by the light, and the glow on the wall
    // around it, warm or a thin light rim (unlit glass beside a lit pane is
    // neither, and stays). Anywhere: a deep orange.
    const glow = Math.max(smooth(12, 20, r - bl), smooth(6, 18, lumaOf[p] - opened[p]))
    const edgeW = near[p] > 0 && !leaf ? Math.max(tint(r, g, bl, 0.25, 0.5), smooth(wallHere - 4, wallHere + 16, y) * glow) * smooth(0, 0.01, near[p]) : 0
    const deepW = tint(r, g, bl, 0.5, 0.6) * smooth(30, 60, r)
    const restW = Math.max(edgeW, deepW) * (1 - paneW)
    if (paneW <= 0 && restW <= 0) continue
    let rgb = [r, g, bl]
    if (paneW > 0) {
      // The block's glass, lighter at the floor's top and darker at its foot,
      // shaded as the pane was against the panes around it, and never much
      // lighter than the glass: a lamp's hot spot must not stay a light one.
      const x = p % width
      const row = (p - x) / width
      const floors = blocks[b].floors
      const floor = floors.find((f) => row < f.bottom) ?? floors[floors.length - 1]
      const t = clamp((row - floor.top) / (floor.bottom - floor.top), 0, 1)
      const mean = paneShare[p] > 0 ? paneMean[p] / paneShare[p] : y
      const k = clamp(clamp((y / Math.max(mean, 1)) ** 1.6, 0.5, 1.6) * (1.1 - 0.3 * t) * 0.92, 0.45, 1.25)
      rgb = rgb.map((v, c) => v + (glass[b][c] * k - v) * paneW)
    }
    if (restW > 0) {
      // The wall's colour, at the pixel's own luminance, never lighter than
      // the wall around it.
      const k = clamp(luma(...rgb), 0.3 * wallHere, wallHere) / luma(...wall)
      rgb = rgb.map((v, c) => v + (wall[c] * k - v) * restW)
    }
    for (let c = 0; c < 3; c++) twin[i + c] = Math.round(clamp(rgb[c], 0, 255))
    mask[p] = Math.round(255 * Math.max(paneW, restW))
  }

  fs.mkdirSync(path.dirname(out), { recursive: true })
  await sharp(twin, { raw: { width, height, channels: 3 } }).webp({ quality: 92, effort: 6 }).toFile(out)
  return { width, height, lit, twin, mask }
}

// The mask over the lit render, darkened: brass where a pixel was repainted.
export async function writePreview(dir, { width, height, lit, mask }) {
  fs.mkdirSync(dir, { recursive: true })
  const px = Buffer.alloc(width * height * 3)
  for (let p = 0; p < mask.length; p++) {
    const i = p * 3
    const w = mask[p] / 255
    px[i] = Math.round(lit[i] * 0.35 * (1 - w) + 255 * w)
    px[i + 1] = Math.round(lit[i + 1] * 0.35 * (1 - w) + 60 * w)
    px[i + 2] = Math.round(lit[i + 2] * 0.35 * (1 - w) + 40 * w)
  }
  const file = path.join(dir, 'mask.png')
  await sharp(px, { raw: { width, height, channels: 3 } }).png().toFile(file)
  return file
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const sources = JSON.parse(fs.readFileSync(path.join(here, 'sources.json'), 'utf8'))
  const src = path.resolve(repoRoot, sources.find((entry) => entry.id === 'mn-dusk').src)
  const at = process.argv.indexOf('--preview')
  const preview = at > 0 ? path.resolve(process.argv[at + 1]) : path.join(os.tmpdir(), 'ksm-mn-lights-off')
  const result = await makeTwin(src, TWIN)
  // Changed as the test counts it: the luminance moved by more than 8/255.
  let changed = 0
  for (let i = 0; i < result.lit.length; i += 3) {
    if (Math.abs(luma(result.twin[i], result.twin[i + 1], result.twin[i + 2]) - luma(result.lit[i], result.lit[i + 1], result.lit[i + 2])) > 8) changed += 1
  }
  console.log(`mn-lights-off: wrote ${path.relative(repoRoot, TWIN)} (${result.width}×${result.height}); ${(100 * changed / (result.width * result.height)).toFixed(1)} % of its pixels changed`)
  console.log(`mn-lights-off: mask preview ${await writePreview(preview, result)}`)
}
