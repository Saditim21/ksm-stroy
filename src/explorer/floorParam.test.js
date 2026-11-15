import { describe, expect, it } from 'vitest'
import { formatFloorParam, parseFloorParam } from './floorParam'

// The ?floor of a deep link (spec §7.10; Review Focus 2): a bare floor names
// the route's own block on a block route, „Б-5“ names the block, a Latin A or
// B reads as Cyrillic, and anything else (a floor outside 1–8, a bare floor
// on the Golden Residence page, an empty or missing value) opens nothing.

describe('parseFloorParam', () => {
  it.each([
    ['3', 'А', { block: 'А', floor: 3 }], ['Б-5', 'А', { block: 'Б', floor: 5 }], ['B-5', null, { block: 'Б', floor: 5 }],
    ['А-8', null, { block: 'А', floor: 8 }], ['9', 'А', null], ['Б-0', null, null], ['5', null, null], ['', 'А', null], [null, 'А', null],
  ])('parseFloorParam(%j, %j)', (value, route, expected) => expect(parseFloorParam(value, route)).toEqual(expected))

  // What a hand-edited address may hold: other cases, spaces, a stray letter.
  it.each([
    ['a-2', null, { block: 'А', floor: 2 }], ['б-4', 'А', { block: 'Б', floor: 4 }], [' 6 ', 'Б', { block: 'Б', floor: 6 }],
    ['В-3', null, null], ['А-', null, null], ['А-3-4', null, null], ['3.5', 'А', null], ['А-03', null, { block: 'А', floor: 3 }],
  ])('reads %j on %j as %j', (value, route, expected) => expect(parseFloorParam(value, route)).toEqual(expected))
})

it('writes bare floors for the route’s own block only', () => {
  expect(formatFloorParam({ block: 'А', floor: 3 }, 'А')).toBe('3')
  expect(formatFloorParam({ block: 'Б', floor: 3 }, 'А')).toBe('Б-3')
  expect(formatFloorParam({ block: 'А', floor: 3 }, null)).toBe('А-3')
})

it('reads back what it writes', () => {
  for (const route of ['А', 'Б', null]) {
    for (const block of ['А', 'Б']) {
      for (const floor of [1, 4, 8]) expect(parseFloorParam(formatFloorParam({ block, floor }, route), route)).toEqual({ block, floor })
    }
  }
})
