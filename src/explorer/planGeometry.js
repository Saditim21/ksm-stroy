// The plans' geometry (spec §7.4, §7.7; the concept's explorer.js:15-79,
// :702-712), on the floor plans' own grid (a project's floors map,
// src/data/maps/*.floors.json): polygons in image pixels, each plan at its
// drawing's size. What the edge panels, the sheet, the plan stage and the
// unit panel draw: only modules of the surfaces' lazy chunk (surfaces.js)
// import it, and a Многофамилна block page, whose rows prerender mini plans
// (MnBlockPage.jsx), so it travels in a chunk those two share and in no other
// route's first-load JS, as surfaceModel.js does (rulings C7.7, FR5). The
// facade's geometry is geometry.js's.
import { bbox, pathD } from './geometry'

/** The plan of a block: the floors map's entry that applies to it (one
 * typical floor serves all of a block's floors, spec §9). */
export function planFor(floorsMap, block) {
  return floorsMap.find((entry) => entry.appliesTo.blocks.includes(block))
}

const pointsOf = (plan) => plan.shapes.filter((shape) => shape.type === 'apartment').flatMap((shape) => shape.polygons[0])

/** The box around a plan's apartments, `pad` wider on every side: a plan's
 * viewBox (spec §7.4: 14, or 4 in mini). */
export function planBox(plan, pad) {
  const box = bbox(pointsOf(plan))
  return { x: box.x - pad, y: box.y - pad, w: box.w + pad * 2, h: box.h + pad * 2 }
}

// Whether [x, y] lies inside the polygon (even-odd).
function inside(x, y, polygon) {
  let hit = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i += 1) {
    const [xi, yi] = polygon[i]
    const [xj, yj] = polygon[j]
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit
  }
  return hit
}

// The distance from [px, py] to the segment from [ax, ay] to [bx, by].
function segmentDistance(px, py, ax, ay, bx, by) {
  const dx = bx - ax
  const dy = by - ay
  const t = Math.min(1, Math.max(0, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy || 1)))
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy))
}

/** Where a unit's label goes: the point of a grid over the polygon (step
 * max(2, min(w, h) / 26)) that lies inside it, farthest from its edges, an
 * approximation of its pole of inaccessibility. */
export function labelPoint(polygon) {
  const box = bbox(polygon)
  const step = Math.max(2, Math.min(box.w, box.h) / 26)
  let best = [box.x + box.w / 2, box.y + box.h / 2]
  let bestDistance = -1
  for (let y = box.y + step / 2; y < box.y + box.h; y += step) {
    for (let x = box.x + step / 2; x < box.x + box.w; x += step) {
      if (!inside(x, y, polygon)) continue
      let distance = Infinity
      for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i += 1) {
        distance = Math.min(distance, segmentDistance(x, y, polygon[j][0], polygon[j][1], polygon[i][0], polygon[i][1]))
      }
      if (distance > bestDistance) {
        bestDistance = distance
        best = [x, y]
      }
    }
  }
  return best
}

const shapeCache = new WeakMap()

/** A plan's units, in its order: { suffix, points, d, bbox, label }. Worked
 * out once a plan. */
export function planShapes(plan) {
  if (!shapeCache.has(plan)) {
    shapeCache.set(plan, plan.shapes
      .filter((shape) => shape.type === 'apartment')
      .map(({ unitSuffix, polygons: [points] }) => ({ suffix: unitSuffix, points, d: pathD(points), bbox: bbox(points), label: labelPoint(points) })))
  }
  return shapeCache.get(plan)
}

/** The crop that frames a unit's box (spec §7.7): a margin of
 * max(w, h) × 0.42 + 30 around it, widened or heightened to `aspect`
 * (width / height), centred on the box. */
export function cropFor(box, aspect) {
  const margin = Math.max(box.w, box.h) * 0.42 + 30
  let w = box.w + margin * 2
  let h = box.h + margin * 2
  if (w / h < aspect) w = h * aspect
  else h = w / aspect
  return { x: box.x + box.w / 2 - w / 2, y: box.y + box.h / 2 - h / 2, w, h }
}
