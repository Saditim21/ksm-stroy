// Recovers floor-band polygons by diffing pre-baked hover images against the
// base render. Usage: node scripts/extract-floor-bands.mjs [--render]
import sharp from 'sharp'
import { writeFileSync, mkdirSync } from 'node:fs'

const GR = 'public/images/golden-residence'
const MN = 'src/assets/продажби/project 1'

const grHovers = []
for (const [b, letter] of [['a', 'А'], ['b', 'Б']]) {
  for (let f = 1; f <= 8; f++) {
    grHovers.push({ block: letter, floor: f, file: `${GR}/building-2-blog-${b}-floor${f}.webp` })
  }
}
const mnHovers = []
for (const [b, letter] of [['A', 'А'], ['B', 'Б']]) {
  for (let img = 1; img <= 9; img++) {
    // FLOOR_DATA floor key = image number + 1 (verified in Step 1 via
    // Projects.jsx onHoverChange: floor === 2 sets isHoveringAFloor1 →
    // building-A-floor-1.webp, ... floor === 10 sets isHoveringAFloor9 →
    // building-A-floor-9.webp)
    mnHovers.push({ block: letter, floor: img + 1, file: `${MN}/building-${b}-floor-${img}.webp` })
  }
}

const JOBS = [
  { out: 'src/data/maps/golden-residence.building.json', base: `${GR}/building-2.webp`, hovers: grHovers },
  { out: 'src/data/maps/mnogofamilna.building.json', base: `${MN}/sgrada1.webp`, hovers: mnHovers },
]

async function loadRaw(file, width, height) {
  let img = sharp(file)
  if (width) img = img.resize(width, height, { fit: 'fill' })
  const { data, info } = await img.ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  return { data, width: info.width, height: info.height }
}

function bandPolygons(base, hover, w, h) {
  const mask = new Uint8Array(w * h)
  for (let i = 0; i < w * h; i++) {
    const d = Math.abs(base.data[i * 4] - hover.data[i * 4]) +
      Math.abs(base.data[i * 4 + 1] - hover.data[i * 4 + 1]) +
      Math.abs(base.data[i * 4 + 2] - hover.data[i * 4 + 2])
    // Threshold tuned up from an initial 60: at 60, a handful of low-magnitude
    // global diff rows (max ~68, well below real band rows which peak >200)
    // dragged the Golden Residence band bounding box (rows spanning ~245px
    // instead of the true ~36px band), starving the column-density check and
    // dropping 3/16 floors (Step 4 visual check caught this). 90 clears the
    // noise floor while staying well under the true band's diff values.
    if (d > 90) mask[i] = 1
  }
  const rowCounts = new Array(h).fill(0)
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) rowCounts[y] += mask[y * w + x]
  const rowThresh = Math.max(20, w * 0.02)
  const ys = []
  for (let y = 0; y < h; y++) if (rowCounts[y] > rowThresh) ys.push(y)
  if (!ys.length) return null
  const minY = ys[0], maxY = ys[ys.length - 1]
  const bandH = maxY - minY + 1
  const colHas = new Array(w).fill(false)
  for (let x = 0; x < w; x++) {
    let c = 0
    for (let y = minY; y <= maxY; y++) c += mask[y * w + x]
    colHas[x] = c > bandH * 0.3
  }
  const polys = []
  let run = null
  for (let x = 0; x <= w; x++) {
    const on = x < w && colHas[x]
    if (on && run === null) run = x
    if (!on && run !== null) {
      if (x - run > w * 0.01) polys.push([[run, minY], [x - 1, minY], [x - 1, maxY], [run, maxY]])
      run = null
    }
  }
  return polys.length ? polys : null
}

const FILL = { А: 'rgba(16,185,129,0.45)', Б: 'rgba(245,158,11,0.45)' }
const render = process.argv.includes('--render')
if (render) mkdirSync('scripts/.preview', { recursive: true })
mkdirSync('src/data/maps', { recursive: true })

for (const job of JOBS) {
  const meta = await sharp(job.base).metadata()
  const base = await loadRaw(job.base)
  const shapes = []
  for (const hv of job.hovers) {
    try {
      const hover = await loadRaw(hv.file, base.width, base.height)
      const polygons = bandPolygons(base, hover, base.width, base.height)
      if (polygons) shapes.push({ type: 'floor', block: hv.block, floor: hv.floor, polygons })
      else console.warn(`no band found: ${hv.file}`)
    } catch (e) {
      console.warn(`skip ${hv.file}: ${e.message}`)
    }
  }
  const map = {
    image: job.base.split('/').pop(),
    imageWidth: meta.width, imageHeight: meta.height, shapes,
  }
  writeFileSync(job.out, JSON.stringify(map, null, 2))
  console.log(`${job.out}: ${shapes.length} floor shapes`)

  if (render) {
    const svgShapes = shapes.flatMap((s) => s.polygons.map((p) =>
      `<polygon points="${p.map(([x, y]) => `${x},${y}`).join(' ')}" fill="${FILL[s.block]}" stroke="black"/>`
    )).join('')
    const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${meta.width}" height="${meta.height}">${svgShapes}</svg>`)
    const out = `scripts/.preview/${job.out.split('/').pop()}.png`
    await sharp(job.base).composite([{ input: svg }]).png().toFile(out)
    console.log(`rendered ${out}`)
  }
}
