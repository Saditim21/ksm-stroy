import { normalizeUnitId } from './availability'

export function polygonToPoints(polygon) {
  return polygon.map(([x, y]) => `${x},${y}`).join(' ')
}

export function polygonCentroid(polygon) {
  const n = polygon.length || 1
  const [sx, sy] = polygon.reduce(([ax, ay], [x, y]) => [ax + x, ay + y], [0, 0])
  return { x: sx / n, y: sy / n }
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
