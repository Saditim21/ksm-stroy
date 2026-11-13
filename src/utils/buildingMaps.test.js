import { polygonToPoints, polygonCentroid, findFloorMap, unitKeyForShape } from './buildingMaps'

test('polygonToPoints formats SVG points', () => {
  expect(polygonToPoints([[10, 20], [30, 40], [50, 60]])).toBe('10,20 30,40 50,60')
})

test('polygonCentroid averages vertices', () => {
  expect(polygonCentroid([[0, 0], [10, 0], [10, 10], [0, 10]])).toEqual({ x: 5, y: 5 })
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
})
