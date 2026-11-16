// The facade's geometry (spec §7.2; the concept's explorer.js:15-79,
// :232-233), on the building map's own grid
// (src/data/maps/golden-residence.building.json): polygons in image pixels,
// the facade at 1200 wide. The plans' geometry, which only an opened floor's
// surfaces draw, is planGeometry.js's, so it stays out of the first load.

// The facade's grid (the building map's image, 1200 × 599, and the sky-cut
// picture drawn over it at that size), its seam, the desktop crop, the phone
// crop of each block, and where each block's rail stands, just outside its
// outer edge.
export const FACADE = Object.freeze({
  width: 1200,
  height: 599,
  seamX: 605,
  vbFull: Object.freeze({ x: 0, y: 112, w: 1200, h: 454 }),
  vbPhone: Object.freeze({
    'А': Object.freeze({ x: 0, y: 132, w: 628, h: 388 }),
    'Б': Object.freeze({ x: 572, y: 132, w: 628, h: 388 }),
  }),
  railX: Object.freeze({ 'А': 71, 'Б': 1129 }),
})

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
