import { describe, expect, it } from 'vitest'
import building from '../data/maps/golden-residence.building.json'
import floors from '../data/maps/golden-residence.floors.json'
import mnBuilding from '../data/maps/mnogofamilna.building.json'
import { bbox, facadeOf, floorShapes } from './geometry'
import { cropFor, labelPoint, planBox, planFor, planShapes } from './planGeometry'
import { GR_PROJECT } from './projects/gr'

// The explorer's geometry (spec §7.2, §7.4, §7.7; extract §4.20, §4.22, §5.3):
// the facade's grid, the floors on it, the plan of a block, where a unit's
// label sits, and the crop that frames one unit. A project's crops and rails
// are its stylesheet's (explorer.css holds Golden Residence's, pinned by
// explorer.css.test.js).

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

// Spec §7.2: Golden Residence's facade is drawn on its building map's grid,
// 1200 × 599, the seam at x 605 from y 120 to 520.
it('keeps Golden Residence’s facade on its building map’s grid, its seam at x 605 (spec §7.2)', () => {
  expect(GR_PROJECT.facade.map).toBe(building)
  expect([building.imageWidth, building.imageHeight]).toEqual([1200, 599])
  expect(GR_PROJECT.facade.seam).toEqual({ x: 605, top: 120, bottom: 520 })
})

// The facade's floors are worked out once a building map, so the facade's
// state keeps the identities it is keyed by (useHotFloor.js): each floor by
// its key, each block's rail from its top floor down, and a stand-in for
// each floor until the data reaches it (`—`, never a zero).
describe('facadeOf', () => {
  it('works a map’s facade out once, and each map’s its own', () => {
    expect(facadeOf(building)).toBe(facadeOf(building))
    expect(facadeOf(mnBuilding)).not.toBe(facadeOf(building))
    expect(facadeOf(building).shapes).toEqual(floorShapes(building))
  })

  it('keys the floors, runs each rail from the top floor down, and stands in for each floor', () => {
    const facade = facadeOf(building)
    expect(facade.shape.get('А-5')).toBe(facade.shapes.find(({ key }) => key === 'А-5'))
    expect(facade.rails['А'].map(({ floor }) => floor)).toEqual([8, 7, 6, 5, 4, 3, 2, 1])
    expect(facade.rails['Б'].map(({ key }) => key)).toEqual(['Б-8', 'Б-7', 'Б-6', 'Б-5', 'Б-4', 'Б-3', 'Б-2', 'Б-1'])
    expect(facade.placeholders.get('Б-3')).toEqual({ block: 'Б', floor: 3, units: [], counts: null, colour: 'unknown' })
    expect(Object.isFrozen(facade.placeholders.get('Б-3'))).toBe(true)
  })

  // Многофамилна's map: floors 2–10 in each block.
  it('takes any project’s map', () => {
    const facade = facadeOf(mnBuilding)
    expect(facade.shapes).toHaveLength(18)
    expect(facade.rails['А'].map(({ floor }) => floor)).toEqual([10, 9, 8, 7, 6, 5, 4, 3, 2])
  })
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
