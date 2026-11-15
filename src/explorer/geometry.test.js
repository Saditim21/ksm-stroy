import { describe, expect, it } from 'vitest'
import building from '../data/maps/golden-residence.building.json'
import floors from '../data/maps/golden-residence.floors.json'
import { FACADE, bbox, cropFor, floorShapes, labelPoint, planBox, planFor, planShapes } from './geometry'

// The explorer's geometry (spec §7.2, §7.4, §7.7; extract §4.20, §4.22, §5.3):
// the facade's grid and crops, the floors on it, the plan of a block, where a
// unit's label sits, and the crop that frames one unit.

// Whether [x, y] lies inside the polygon (even-odd ray casting).
function inside([x, y], polygon) {
  let hit = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i += 1) {
    const [xi, yi] = polygon[i]
    const [xj, yj] = polygon[j]
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit
  }
  return hit
}

it('keeps the facade’s grid, its crops and its rails (spec §7.2)', () => {
  expect(FACADE).toEqual({
    width: 1200,
    height: 599,
    seamX: 605,
    vbFull: { x: 0, y: 112, w: 1200, h: 454 },
    vbPhone: { 'А': { x: 0, y: 132, w: 628, h: 388 }, 'Б': { x: 572, y: 132, w: 628, h: 388 } },
    railX: { 'А': 71, 'Б': 1129 },
  })
  expect([building.imageWidth, building.imageHeight]).toEqual([FACADE.width, FACADE.height])
})

it('boxes a set of points', () => {
  expect(bbox([[10, 40], [30, 20], [25, 60]])).toEqual({ x: 10, y: 20, w: 20, h: 40 })
})

describe('floorShapes', () => {
  const shapes = floorShapes(building)

  it('gives the 16 floors, each with its key, its path and its box', () => {
    expect(shapes).toHaveLength(16)
    expect(shapes.map(({ key }) => key).sort()).toEqual(
      ['А', 'Б'].flatMap((block) => [1, 2, 3, 4, 5, 6, 7, 8].map((floor) => `${block}-${floor}`)).sort(),
    )
    const first = shapes.find(({ key }) => key === 'А-1')
    expect(first).toMatchObject({ block: 'А', floor: 1, bbox: { x: 145, y: 430, w: 460, h: 27 } })
    expect(first.d).toBe('M145 430L605 430L605 457L145 457Z')
  })

  // --pitch (spec §7.2) is the smallest gap between two floors: 1 and 2.
  it('sets floors 1 and 2 33.5 units apart, the closest pair', () => {
    const centre = (key) => {
      const { bbox: box } = shapes.find((shape) => shape.key === key)
      return box.y + box.h / 2
    }
    const gaps = ['А', 'Б'].flatMap((block) => [1, 2, 3, 4, 5, 6, 7].map((floor) => centre(`${block}-${floor}`) - centre(`${block}-${floor + 1}`)))
    expect(Math.min(...gaps)).toBe(33.5)
  })
})

describe('the plans', () => {
  it('finds each block’s plan by the blocks it applies to', () => {
    expect(planFor(floors, 'А').imageHeight).toBe(845)
    expect(planFor(floors, 'Б').imageHeight).toBe(847)
    expect(planFor(floors, 'Б').appliesTo.blocks).toEqual(['Б'])
  })

  it('boxes the 12 apartments of a plan, with the padding around them', () => {
    const plan = planFor(floors, 'А')
    const points = plan.shapes.flatMap((shape) => shape.polygons[0])
    const tight = bbox(points)
    expect(planBox(plan, 0)).toEqual(tight)
    expect(planBox(plan, 4)).toEqual({ x: tight.x - 4, y: tight.y - 4, w: tight.w + 8, h: tight.h + 8 })
  })

  it('gives each unit of a plan its suffix, path and label point', () => {
    const shapes = planShapes(planFor(floors, 'Б'))
    expect(shapes.map(({ suffix }) => suffix)).toEqual(['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'])
    for (const shape of shapes) {
      expect(shape.d).toMatch(/^M[\d.]+ [\d.]+(L[\d.]+ [\d.]+)+Z$/)
      expect(shape.label).toEqual(labelPoint(shape.points))
    }
  })

  // The label sits at the polygon's pole of inaccessibility (spec §7.4).
  it('places every label inside its unit', () => {
    for (const block of ['А', 'Б']) {
      for (const shape of planFor(floors, block).shapes) {
        const polygon = shape.polygons[0]
        expect(inside(labelPoint(polygon), polygon), `${block} ${shape.unitSuffix}`).toBe(true)
      }
    }
  })
})

describe('cropFor (spec §7.7)', () => {
  it('frames a box with its margin, matched to the aspect and centred on it', () => {
    const crop = cropFor({ x: 0, y: 0, w: 100, h: 50 }, 1)
    expect(crop.w).toBeCloseTo(crop.h)
    expect(crop.x + crop.w / 2).toBeCloseTo(50)
    expect(crop.y + crop.h / 2).toBeCloseTo(25)
    // The margin: max(w, h) × 0.42 + 30 on each side of the longer side.
    expect(crop.w).toBeCloseTo(100 + 2 * (100 * 0.42 + 30))
  })

  it('widens a box for a wide aspect', () => {
    const crop = cropFor({ x: 10, y: 10, w: 40, h: 40 }, 2)
    expect(crop.w / crop.h).toBeCloseTo(2)
    expect(crop.h).toBeCloseTo(40 + 2 * (40 * 0.42 + 30))
  })
})
