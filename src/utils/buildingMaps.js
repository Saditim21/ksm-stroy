// Lookups over the explorer maps in src/data/maps. The outline maths is
// polygon.js's and the unit ids are units.js's, so the page, the tracer and
// scripts/validate-maps.mjs all agree. Explicit .js extensions: that script
// loads this file in Node.
import { centroid, toPoints } from './polygon.js'
import { normalizeUnitId } from './units.js'

export function polygonToPoints(polygon) {
  return toPoints(polygon)
}

// Where a shape's label goes: its area centroid. A mean of the vertices drifts
// toward whichever side has more points.
export function polygonCentroid(polygon) {
  const [x, y] = centroid(polygon)
  return { x, y }
}

export function findFloorMap(floorMaps, projectId, blockLetter, floor) {
  return (
    floorMaps.find(
      (m) =>
        m.appliesTo.project === projectId &&
        m.appliesTo.blocks.includes(blockLetter) &&
        m.appliesTo.floors.includes(floor),
    ) || null
  )
}

// unitFloorNumber is the number embedded in unit ids for this display floor —
// per-project mapping (Golden: floor; Многофамилна: floor - 1) lives in config.
export function unitKeyForShape(shape, blockLetter, unitFloorNumber) {
  if (shape.unit) return normalizeUnitId(shape.unit)
  return normalizeUnitId(`${blockLetter}${unitFloorNumber}${shape.unitSuffix}`)
}
