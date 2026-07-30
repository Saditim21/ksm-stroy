// Renders every floor map in a <project>.floors.json over its plan image so the
// traced apartment shapes can be checked visually without a browser.
// Usage: node scripts/render-floor-overlay.mjs <floors.json> <image-dir>[,<image-dir>...]
//   node scripts/render-floor-overlay.mjs src/data/maps/mnogofamilna.floors.json "src/assets/продажби/project 1"
import sharp from 'sharp'
import { readFileSync, mkdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'

// imageDir may be a comma-separated list — Golden Residence keeps its Block A and
// Block B plans in sibling directories, so one map file spans several dirs.
const [mapFile, imageDirs] = process.argv.slice(2)
const dirs = imageDirs.split(',')
const resolve = (name) => {
  const dir = dirs.find((d) => existsSync(join(d, name)))
  if (!dir) throw new Error(`image not found in ${imageDirs}: ${name}`)
  return join(dir, name)
}
const maps = JSON.parse(readFileSync(mapFile, 'utf8'))
mkdirSync('scripts/.preview', { recursive: true })

// The app labels a shape at its vertex-average centroid (utils/buildingMaps
// polygonCentroid), so warn when that point falls outside the polygon — those
// labels would render on top of a neighbouring apartment.
const inside = ([px, py], poly) => {
  let hit = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j]
    if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) hit = !hit
  }
  return hit
}

for (const [i, m] of maps.entries()) {
  for (const s of m.shapes) {
    for (const p of s.polygons) {
      const c = p.reduce(([ax, ay], [x, y]) => [ax + x / p.length, ay + y / p.length], [0, 0])
      if (!inside(c, p)) console.warn(`WARN centroid outside polygon: map ${i} shape ${s.unit ?? s.unitSuffix}`)
    }
  }
  const svgShapes = m.shapes.flatMap((s) => s.polygons.map((p) => {
    const pts = p.map(([x, y]) => `${x},${y}`).join(' ')
    const c = p.reduce(([ax, ay], [x, y]) => [ax + x / p.length, ay + y / p.length], [0, 0])
    const label = s.unit ?? s.unitSuffix
    return `<polygon points="${pts}" fill="rgba(16,185,129,0.35)" stroke="red" stroke-width="3"/>` +
      `<text x="${c[0]}" y="${c[1]}" font-size="${m.imageWidth / 50}" text-anchor="middle" fill="black">${label}</text>`
  })).join('')
  const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${m.imageWidth}" height="${m.imageHeight}">${svgShapes}</svg>`)
  const out = `scripts/.preview/floors-${mapFile.split('/').pop()}-${i}.png`
  await sharp(resolve(m.image))
    .resize(m.imageWidth, m.imageHeight, { fit: 'fill' })
    .composite([{ input: svg, top: 0, left: 0 }]) // sharp resizes before compositing; pin the origin
    .png()
    .toFile(out)
  console.log(out)
}
