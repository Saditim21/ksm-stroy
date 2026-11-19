import { describe, expect, it } from 'vitest'
import { BANDS, TYPES, countFree, freeUnits } from './freeUnits'

// Продажби's free apartments (polish spec §3, #svobodni): both buildings'
// free units, filtered by building, rooms and a band of floors, Golden
// Residence's first, each building's from its lowest floor up.

const unit = (block, floor, suffix, type, status = 'available', totalArea = 60) => ({ block, floor, suffix, type, status, totalArea, exposure: '' })
const GR = {
  key: 'gr',
  project: { unitLabel: (u) => `${u.block} ${u.floor}${u.suffix}` },
  model: { units: [unit('Б', 7, '02', '3-стаен'), unit('А', 1, '01', '2-стаен'), unit('А', 1, '02', '', 'available'), unit('А', 2, '01', 'Ателие', 'sold')] },
}
const MN = {
  key: 'mn',
  project: { unitLabel: (u) => `${u.block}-${u.floor - 1}${u.suffix}` },
  model: { units: [unit('Б', 9, '01', '2-стаен'), unit('А', 2, '06', '3-стаен'), unit('А', 3, '01', '3-стаен', 'reserved')] },
}
const BOTH = [GR, MN]
const labels = (list) => list.map((each) => each.label)

describe('freeUnits', () => {
  it('lists the free apartments, Golden Residence’s first, each building’s from its lowest floor', () => {
    expect(labels(freeUnits(BOTH))).toEqual(['А 101', 'А 102', 'Б 702', 'А-106', 'Б-801'])
  })

  it('names each by its building’s label and keeps its building', () => {
    const [first] = freeUnits(BOTH)
    expect(first).toMatchObject({ label: 'А 101', building: 'gr', unit: { type: '2-стаен' } })
  })

  it('filters by building, rooms and band', () => {
    expect(labels(freeUnits(BOTH, { building: 'mn' }))).toEqual(['А-106', 'Б-801'])
    expect(labels(freeUnits(BOTH, { type: '3-стаен' }))).toEqual(['Б 702', 'А-106'])
    expect(labels(freeUnits(BOTH, { band: 'high' }))).toEqual(['Б 702', 'Б-801'])
    expect(labels(freeUnits(BOTH, { building: 'gr', band: 'low' }))).toEqual(['А 101', 'А 102'])
  })

  // A unit with no type in the sheet is listed under „all“ only.
  it('leaves a unit with no type out of every type', () => {
    for (const { key } of TYPES.filter((t) => t.key)) expect(labels(freeUnits(BOTH, { type: key }))).not.toContain('А 102')
  })

  it('lists nothing for a building whose data has not come', () => {
    expect(labels(freeUnits([{ ...GR, model: null }, MN]))).toEqual(['А-106', 'Б-801'])
  })
})

describe('countFree', () => {
  it('counts what a choice would show, the other choices kept', () => {
    expect(countFree(BOTH, { building: 'mn' }, 'type', '3-стаен')).toBe(1)
    expect(countFree(BOTH, {}, 'building', 'gr')).toBe(3)
    expect(countFree(BOTH, {}, 'band', 'mid')).toBe(0)
  })

  it('is null while a building’s data has not come and the choice would count it', () => {
    expect(countFree([{ ...GR, model: null }, MN], {}, 'building', null)).toBeNull()
    expect(countFree([{ ...GR, model: null }, MN], {}, 'building', 'mn')).toBe(2)
  })
})

it('names its choices in the page’s words', () => {
  expect(TYPES.map((t) => t.label)).toEqual(['Всички', 'Ателие', 'Двустаен', 'Тристаен'])
  expect(BANDS.map((b) => b.label)).toEqual(['Всеки', '1–3', '4–6', '7 и нагоре'])
})
