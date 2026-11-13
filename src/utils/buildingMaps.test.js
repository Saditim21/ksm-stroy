import { polygonToPoints, polygonCentroid, findFloorMap, unitKeyForShape } from './buildingMaps'
import { normalizeUnitId } from './units'

test('polygonToPoints formats SVG points', () => {
  expect(polygonToPoints([[10, 20], [30, 40], [50, 60]])).toBe('10,20 30,40 50,60')
})

test('polygonToPoints rounds to hundredths, as polygon.js toPoints does', () => {
  expect(polygonToPoints([[1, 2], [3.456, 4.001]])).toBe('1,2 3.46,4')
})

test('polygonCentroid is the centre of a square', () => {
  expect(polygonCentroid([[0, 0], [10, 0], [10, 10], [0, 10]])).toEqual({ x: 5, y: 5 })
})

test('polygonCentroid is the area centre, not the mean of the vertices', () => {
  // Extra vertices along the right edge would drag a vertex mean to x 7.5.
  const c = polygonCentroid([[0, 0], [10, 0], [10, 2], [10, 4], [10, 6], [10, 8], [10, 10], [0, 10]])
  expect(c.x).toBeCloseTo(5)
  expect(c.y).toBeCloseTo(5)
})

const maps = [
  { image: 'a.webp', appliesTo: { project: 'golden-residence', blocks: ['А'], floors: [2, 3, 4] }, shapes: [] },
  { image: 'b.webp', appliesTo: { project: 'golden-residence', blocks: ['Б'], floors: [1] }, shapes: [] },
]

describe('findFloorMap', () => {
  test('matches project + block + floor', () => {
    expect(findFloorMap(maps, 'golden-residence', 'А', 3)?.image).toBe('a.webp')
    expect(findFloorMap(maps, 'golden-residence', 'Б', 1)?.image).toBe('b.webp')
  })
  test('returns null when nothing matches', () => {
    expect(findFloorMap(maps, 'golden-residence', 'А', 9)).toBeNull()
    expect(findFloorMap(maps, 'other', 'А', 3)).toBeNull()
  })
})

describe('unitKeyForShape', () => {
  test('suffix shapes compose block + unit floor + suffix, normalized', () => {
    expect(unitKeyForShape({ unitSuffix: '01' }, 'А', 3)).toBe('А301')
  })
  test('unit floor number may differ from display floor (Многофамилна)', () => {
    expect(unitKeyForShape({ unitSuffix: '05' }, 'Б', 9)).toBe('Б905')
  })
  test('explicit unit wins and is normalized', () => {
    expect(unitKeyForShape({ unit: 'А 112', unitSuffix: '99' }, 'А', 1)).toBe('А112')
  })
  test('keys match the sheet ids however they are typed', () => {
    expect(unitKeyForShape({ unitSuffix: '01' }, 'А', 9)).toBe(normalizeUnitId('А-901'))
    expect(unitKeyForShape({ unitSuffix: '05' }, 'Б', 3)).toBe(normalizeUnitId('B 305'))
  })
})
