// Cross-checks the traced floor maps against the apartment data: every unit in
// the data must have a shape, and every shape must resolve to a real unit.
// Usage: node scripts/validate-maps.mjs
import { readFileSync } from 'node:fs'

const norm = (s) => (s ?? '').toString().toUpperCase().replace(/[\s\-–—.]/g, '').replace(/A/g, 'А').replace(/B/g, 'Б')

// The fallback modules import nothing but images-free plain data, yet they are
// ESM with `export`, so load them through a tiny eval shim rather than adding a
// build step. Both `export const x = ...` and `export function x() {}` are used.
const loadModule = (file, names) => {
  const src = readFileSync(file, 'utf8')
    .replace(/import[^\n]*\n/g, '')
    .replace(/export const (\w+) =/g, 'globalThis.__$1 =')
    .replace(/export function (\w+)/g, 'globalThis.__$1 = function $1')
  new Function(src)()
  return names.map((n) => globalThis[`__${n}`])
}

const [getGoldenA, getGoldenB] = loadModule('src/constants/apartmentFallbackData.js', [
  'getBlockAFallbackData', 'getBlockBFallbackData',
])
const [getMnogoA, getMnogoB] = loadModule('src/constants/mnogofamilnaFallbackData.js', [
  'getMnogoAFallbackData', 'getMnogoBFallbackData',
])

const PROJECTS = [
  {
    id: 'golden-residence',
    floorsFile: 'src/data/maps/golden-residence.floors.json',
    unitFloor: (f) => f, // ids embed the display floor: floor 3 -> "А 301"
    skipFloors: [],
    data: { 'А': getGoldenA(), 'Б': getGoldenB() },
  },
  {
    id: 'mnogofamilna-sgrada',
    floorsFile: 'src/data/maps/mnogofamilna.floors.json',
    unitFloor: (f) => f - 1, // floor key 10 -> "А-9xx" (Task 5 Step 2)
    skipFloors: [0], // floor key 0 holds the garages, not apartments
    data: { 'А': getMnogoA(), 'Б': getMnogoB() },
  },
]

let failures = 0
for (const p of PROJECTS) {
  const maps = JSON.parse(readFileSync(p.floorsFile, 'utf8'))
  for (const [letter, floorData] of Object.entries(p.data)) {
    for (const [floorKey, rows] of Object.entries(floorData)) {
      const floor = Number(floorKey)
      if (p.skipFloors.includes(floor)) continue
      const map = maps.find(
        (m) => m.appliesTo.project === p.id && m.appliesTo.blocks.includes(letter) && m.appliesTo.floors.includes(floor),
      )
      if (!map) { console.error(`MISSING MAP: ${p.id} ${letter} floor ${floor}`); failures++; continue }
      const keyOf = (s) => norm(s.unit ?? `${letter}${p.unitFloor(floor)}${s.unitSuffix}`)
      const shapeKeys = new Set(map.shapes.map(keyOf))
      const dataKeys = new Set(rows.map((r) => norm(r.apartment)))
      for (const row of rows) {
        if (!shapeKeys.has(norm(row.apartment))) {
          console.error(`NO SHAPE for ${row.apartment} (${p.id} ${letter} floor ${floor})`)
          failures++
        }
      }
      for (const s of map.shapes) {
        if (!dataKeys.has(keyOf(s))) {
          console.error(`ORPHAN SHAPE ${keyOf(s)} (${p.id} ${letter} floor ${floor}) — no such unit in the data`)
          failures++
        }
      }
    }
  }
}
console.log(failures ? `FAILED: ${failures} problems` : 'ALL UNITS MAPPED')
process.exit(failures ? 1 : 0)
