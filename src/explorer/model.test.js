import { describe, expect, it } from 'vitest'
import { buildModel, findUnit, floorKey, rangeLine, stepUnit } from './model'
import { snapshotData } from './testing'

// The explorer's numbers (spec §7.1, §9), from the sheets snapshot the concept
// shows (extract §5.4): per floor its counts by status, its colour and the
// range of its free areas; per block its counts, types and exposures; and the
// totals.

describe('buildModel', () => {
  it('counts the snapshot', () => {
    const m = buildModel(snapshotData())

    expect(m.totals).toEqual({ available: 69, reserved: 8, sold: 115, blocked: 0, total: 192 })
    expect(m.units).toHaveLength(192)
    expect(m.floors.size).toBe(16)
    expect(m.floors.get('А-5')).toMatchObject({
      block: 'А',
      floor: 5,
      counts: { available: 4, reserved: 2, sold: 6, blocked: 0, total: 12 },
      colour: 'available',
      minFree: 63.51,
      maxFree: 108.56,
    })
    expect(m.floors.get('Б-6')).toMatchObject({ colour: 'sold', minFree: null, maxFree: null })
    expect(m.blocks['А'].counts).toEqual({ available: 42, reserved: 6, sold: 48, blocked: 0, total: 96 })
    expect(m.blocks['А'].types).toEqual({ '2-стаен': 56, '3-стаен': 32, 'Ателие': 8 })
    expect(m.blocks['А'].exposure).toEqual({})
    expect(m.blocks['Б'].exposure).toMatchObject({ 'Юг': 24, 'Запад': 24, 'Изток': 16, 'Север': 8 })
  })

  // A plan's shapes are matched by suffix (spec §7.4), so a floor lists its
  // units in the plan's order.
  it('lists each floor’s units by suffix, each of that block and floor', () => {
    const floor = buildModel(snapshotData()).floors.get('Б-2')

    expect(floor.units.map(({ suffix }) => suffix)).toEqual(['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'])
    expect(floor.units.every((unit) => unit.block === 'Б' && unit.floor === 2)).toBe(true)
  })

  // Spec §9: text the status rules do not know stays `unknown`, counted in the
  // total only.
  it('counts an unknown status in the total only', () => {
    const data = snapshotData()
    const [row] = data['golden-residence']['block-a']
    data['golden-residence']['block-a'].push({ ...row, unit: 'А 813', floor: '8', status: 'Скоро' })
    const m = buildModel(data)

    expect(m.totals).toEqual({ available: 69, reserved: 8, sold: 115, blocked: 0, total: 193 })
    expect(m.floors.get('А-8').counts).toEqual({ available: 6, reserved: 0, sold: 6, blocked: 0, total: 13 })
    expect(m.blocks['А'].counts).toEqual({ available: 42, reserved: 6, sold: 48, blocked: 0, total: 97 })
  })

  it('is null without data', () => {
    expect(buildModel(null)).toBeNull()
  })

  // As grFree (src/data/availability/select.js): never half the building's
  // counts while a block has no rows.
  it('is null while a block has no rows', () => {
    const data = snapshotData()
    data['golden-residence']['block-b'] = null

    expect(buildModel(data)).toBeNull()
  })
})

describe('rangeLine (spec §7.3)', () => {
  const m = buildModel(snapshotData())
  const stats = (available, reserved, minFree, maxFree) => ({ counts: { available, reserved, sold: 0, blocked: 0, total: 12 }, minFree, maxFree })

  it('describes the free range', () => {
    expect(rangeLine(m.floors.get('А-5'))).toEqual({ kind: 'range', min: 63.51, max: 108.56 })
    expect(rangeLine(m.floors.get('Б-6'))).toEqual({ kind: 'soldout' })
  })

  it('gives one area when every free unit has it, and says whether one unit is free', () => {
    expect(rangeLine(stats(1, 0, 62.18, 62.18))).toEqual({ kind: 'single', area: 62.18, one: true })
    expect(rangeLine(stats(3, 2, 62.18, 62.18))).toEqual({ kind: 'single', area: 62.18, one: false })
  })

  it('says a floor with none free but some reserved has reserved ones', () => {
    expect(rangeLine(stats(0, 2, null, null))).toEqual({ kind: 'reserved' })
  })
})

it('keys a floor by its block’s letter and its number', () => {
  expect(floorKey('А', 5)).toBe('А-5')
  expect(floorKey('Б', 1)).toBe('Б-1')
})

// Spec §7.1: a unit is named by its label everywhere (?unit, the callbacks,
// the inquiry) and matched through normalizeUnitId, so a hand-written „a501“
// or „А-501“ finds „А 501“.
describe('findUnit', () => {
  const m = buildModel(snapshotData())

  it('finds a unit by its label, however it is written', () => {
    for (const id of ['А 501', 'А501', 'а 501', 'A-501', ' А  501 ']) expect(findUnit(m, id)).toMatchObject({ label: 'А 501', floor: 5, suffix: '01' })
    expect(findUnit(m, 'B 212')).toMatchObject({ label: 'Б 212' })
  })

  it('finds nothing for a unit the sheets do not have, an empty id or no data', () => {
    expect(findUnit(m, 'А 999')).toBeNull()
    expect(findUnit(m, '')).toBeNull()
    expect(findUnit(m, null)).toBeNull()
    expect(findUnit(null, 'А 501')).toBeNull()
  })
})

// Spec §7.7: the unit panel's previous and next go round the floor.
describe('stepUnit', () => {
  const m = buildModel(snapshotData())
  const unit = (label) => findUnit(m, label)

  it('steps to the next and the previous unit on the floor, round from either end', () => {
    expect(stepUnit(m, unit('А 501'), 1).label).toBe('А 502')
    expect(stepUnit(m, unit('А 501'), -1).label).toBe('А 512')
    expect(stepUnit(m, unit('А 512'), 1).label).toBe('А 501')
    expect(stepUnit(m, unit('Б 307'), -1).label).toBe('Б 306')
  })
})
