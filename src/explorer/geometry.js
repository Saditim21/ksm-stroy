// The facade's geometry (spec §7.2; M3 §6.3; the concept's explorer.js:15-79,
// :232-233), on a building map's own grid (src/data/maps/*.building.json, a
// project's facade.map): polygons in image pixels, the facade 1200 wide. A
// project's crops and rails are its stylesheet's (explorer.css holds Golden
// Residence's), its seam its facade's (projects/*.js). The plans' geometry,
// which only an opened floor's surfaces draw, is planGeometry.js's, so it
// stays out of the first load.

/** The box of a list of [x, y] points: { x, y, w, h }. */
export function bbox(points) {
  const xs = points.map(([x]) => x)
  const ys = points.map(([, y]) => y)
  const x = Math.min(...xs)
  const y = Math.min(...ys)
  return { x, y, w: Math.max(...xs) - x, h: Math.max(...ys) - y }
}

/** An SVG path through the points, closed: 'M145 430L605 430…Z'. */
export const pathD = (points) => `M${points.map(([x, y]) => `${x} ${y}`).join('L')}Z`

/** The facade's floors, one per block and floor: { block, floor, key: 'А-5', d, bbox }. */
export function floorShapes(buildingMap) {
  return buildingMap.shapes
    .filter((shape) => shape.type === 'floor')
    .map(({ block, floor, polygons: [points] }) => ({ block, floor, key: `${block}-${floor}`, d: pathD(points), bbox: bbox(points) }))
}

const facades = new WeakMap()

/**
 * A building map's facade, worked out once a map, so what the facade keys its
 * state by keeps its identity from render to render (useHotFloor.js):
 * { shapes: floorShapes(), shape: Map<key, shape>, rails: { 'А': shapes,
 *   'Б': shapes } (each block's top floor first), placeholders: Map<key,
 *   floor> }. A placeholder is a floor the data has not reached: its plan
 * without statuses, `—` counts (model.js's shape).
 */
export function facadeOf(buildingMap) {
  if (!facades.has(buildingMap)) {
    const shapes = floorShapes(buildingMap)
    const rails = { 'А': [], 'Б': [] }
    for (const shape of [...shapes].sort((a, b) => b.floor - a.floor)) rails[shape.block].push(shape)
    facades.set(buildingMap, {
      shapes,
      shape: new Map(shapes.map((shape) => [shape.key, shape])),
      rails,
      placeholders: new Map(shapes.map(({ key, block, floor }) => [
        key,
        Object.freeze({ block, floor, units: [], counts: null, colour: 'unknown' }),
      ])),
    })
  }
  return facades.get(buildingMap)
}
