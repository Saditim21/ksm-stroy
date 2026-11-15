import { describe, expect, it } from 'vitest'
import { AREA_RANGES, filterUnits, sortUnitsBy } from './filterUnits'
import { buildModel } from './model'
import { snapshotData } from './testing'

// The list's filters and its sorts (spec §7.8; the concept's gr.js:158-171),
// on the sheets snapshot the concept shows (extract §5.4): 192 apartments, 69
// of them free, exposures for block Б only.

const { units } = buildModel(snapshotData())
const labels = (list) => list.map((unit) => unit.label)
const distinct = (list, key) => [...new Set(list.map((unit) => unit[key]))]

describe('filterUnits', () => {
  it('keeps all 192 without a filter', () => {
    expect(filterUnits(units)).toHaveLength(192)
    expect(filterUnits(units, {})).toHaveLength(192)
    // Each field null or undefined means any.
    expect(filterUnits(units, { block: null, floor: undefined, type: null, area: null, exposure: null, status: null })).toHaveLength(192)
  })

  it('keeps block Б’s free apartments: 27', () => {
    const kept = filterUnits(units, { block: 'Б', status: 'available' })
    expect(kept).toHaveLength(27)
    expect(distinct(kept, 'block')).toEqual(['Б'])
    expect(distinct(kept, 'status')).toEqual(['available'])
  })

  it('keeps a floor’s 24, both blocks', () => {
    const kept = filterUnits(units, { floor: 5 })
    expect(kept).toHaveLength(24)
    expect(distinct(kept, 'floor')).toEqual([5])
  })

  it('keeps the 16 studios', () => {
    const kept = filterUnits(units, { type: 'Ателие' })
    expect(kept).toHaveLength(16)
    expect(distinct(kept, 'type')).toEqual(['Ателие'])
  })

  // Spec §7.8: [100, 999), the test `totalArea >= a0 && totalArea < a1`.
  it('keeps only a total area of 100 m² or more for „над 100 м²“', () => {
    const kept = filterUnits(units, { area: 'nad-100' })
    expect(kept.length).toBeGreaterThan(0)
    expect(kept.every((unit) => unit.totalArea >= 100)).toBe(true)
    expect(kept).toHaveLength(units.filter((unit) => unit.totalArea >= 100).length)
  })

  it('reads each area range as [a0, a1)', () => {
    expect(AREA_RANGES).toEqual({ 'do-70': [0, 70], '70-100': [70, 100], 'nad-100': [100, 999] })
    expect(Object.isFrozen(AREA_RANGES)).toBe(true)
    const below = filterUnits(units, { area: 'do-70' })
    const middle = filterUnits(units, { area: '70-100' })
    const above = filterUnits(units, { area: 'nad-100' })
    expect(below.every((unit) => unit.totalArea < 70)).toBe(true)
    expect(middle.every((unit) => unit.totalArea >= 70 && unit.totalArea < 100)).toBe(true)
    expect(below.length + middle.length + above.length).toBe(192)
  })

  // Matched by `includes`, so „Юг/Изток“ counts for юг and for изток.
  it('keeps „Юг/Изток“ and „Запад/Юг“ for юг, beside „Юг“', () => {
    const kept = filterUnits(units, { exposure: 'юг' })
    expect(distinct(kept, 'exposure').sort()).toEqual(['Запад/Юг', 'Юг', 'Юг/Изток'])
    expect(kept).toHaveLength(40)
  })

  it('never keeps a unit whose area the sheet does not give for a range, nor a missing exposure', () => {
    const blank = { ...units[0], totalArea: null, exposure: '' }
    expect(filterUnits([blank], { area: 'do-70' })).toEqual([])
    expect(filterUnits([blank], { exposure: 'юг' })).toEqual([])
    expect(filterUnits([blank], {})).toEqual([blank])
  })
})

describe('sortUnitsBy', () => {
  it('orders by the unit’s id by default: block, floor, then number', () => {
    const sorted = sortUnitsBy([...units].reverse())
    expect(labels(sorted).slice(0, 2)).toEqual(['А 101', 'А 102'])
    expect(labels(sorted).at(-1)).toBe('Б 812')
    expect(labels(sortUnitsBy(units, { key: 'id', dir: 'desc' })).slice(0, 2)).toEqual(['Б 812', 'Б 811'])
  })

  it('orders by the total area, largest first going down', () => {
    expect(sortUnitsBy(units, { key: 'total', dir: 'desc' })[0].totalArea).toBe(114.58)
    expect(sortUnitsBy(units, { key: 'total', dir: 'asc' })[0].totalArea).toBe(43.98)
    const areas = sortUnitsBy(units, { key: 'total', dir: 'desc' }).map((unit) => unit.totalArea)
    expect(areas).toEqual([...areas].sort((a, b) => b - a))
  })

  it('orders by the floor, each floor by id', () => {
    const sorted = sortUnitsBy(units, { key: 'floor' })
    expect(labels(sorted).slice(0, 13)).toEqual([...Array(12)].map((_, i) => `А 1${String(i + 1).padStart(2, '0')}`).concat('Б 101'))
    expect(sortUnitsBy(units, { key: 'floor', dir: 'desc' })[0].floor).toBe(8)
  })

  it('leaves the list it is given as it was', () => {
    const copy = [...units]
    sortUnitsBy(units, { key: 'total', dir: 'desc' })
    expect(units).toEqual(copy)
  })
})
