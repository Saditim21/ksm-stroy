// Pure outline maths for the explorer's SVG overlays, from the Golden Residence
// landing (golden-residence src/utils/polygon.js @944bb03). No imports on
// purpose: scripts/render-floor-overlay.mjs runs this file in Node, so its
// previews are drawn with exactly the maths the page uses.
export const IDENTITY = Object.freeze({ s: 1, tx: 0, ty: 0 })

// Template coordinates to one plan's own 1200-wide pixels: x′ = s·x + tx, y′ = s·y + ty.
export function transformPolygon(polygon, t = IDENTITY) {
  return polygon.map(([x, y]) => [t.s * x + t.tx, t.s * y + t.ty])
}

const hundredths = (n) => Math.round(n * 100) / 100

export function toPoints(polygon) {
  return polygon.map(([x, y]) => `${hundredths(x)},${hundredths(y)}`).join(' ')
}

// The area centroid (shoelace formula). A vertex mean drifts toward whichever
// side has more points and would pull a unit number off an L-shaped apartment.
export function centroid(polygon) {
  let area = 0
  let cx = 0
  let cy = 0
  for (let i = 0; i < polygon.length; i++) {
    const [x0, y0] = polygon[i]
    const [x1, y1] = polygon[(i + 1) % polygon.length]
    const cross = x0 * y1 - x1 * y0
    area += cross
    cx += (x0 + x1) * cross
    cy += (y0 + y1) * cross
  }
  if (Math.abs(area) < 1e-9) {
    const n = polygon.length || 1
    return [polygon.reduce((sum, p) => sum + p[0], 0) / n, polygon.reduce((sum, p) => sum + p[1], 0) / n]
  }
  return [cx / (3 * area), cy / (3 * area)]
}
