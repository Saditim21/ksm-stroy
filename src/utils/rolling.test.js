import { digitColumns, rollOffset } from './rolling'

// From golden-residence src/utils/rolling.test.js @944bb03.

test('digitColumns gives one column per digit, most significant first', () => {
  expect(digitColumns(34)).toEqual([3, 4])
  expect(digitColumns(146)).toEqual([1, 4, 6])
  expect(digitColumns(7)).toEqual([7])
  expect(digitColumns(0)).toEqual([0])
})

test('digitColumns treats a missing or odd count as 0 and rounds', () => {
  expect(digitColumns(null)).toEqual([0])
  expect(digitColumns(Number.NaN)).toEqual([0])
  expect(digitColumns(-3)).toEqual([0])
  expect(digitColumns(12.6)).toEqual([1, 3])
})

test('rollOffset moves a 0–9 column by tenths of its height', () => {
  expect(rollOffset(0)).toBe(0)
  expect(rollOffset(3)).toBe(-30)
  expect(rollOffset(9)).toBe(-90)
  expect(digitColumns(34).map(rollOffset)).toEqual([-30, -40])
})
