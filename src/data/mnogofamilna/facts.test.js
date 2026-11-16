import { afterEach, describe, expect, it, vi } from 'vitest'
import { MN_FACTS } from './facts'
import { MN_SNAPSHOT_DATA } from './snapshot'

const MN = 'mnogofamilna-sgrada'

// An apartment row as the store gives it (src/services/sheetsCore.js).
const row = (unit, floor, type, total) => ({
  unit, floor, type, area: { built: '', ideal: '', total }, exposure: '', status: 'Свободен', price: '',
})

afterEach(() => {
  vi.doUnmock('./snapshot')
  vi.resetModules()
})

describe('MN_FACTS', () => {
  it('MN_FACTS derive from the snapshot', () => {
    const rows = Object.values(MN_SNAPSHOT_DATA[MN]).flat()
    const areas = rows.map((r) => Number.parseFloat(r.area.total))

    expect(MN_FACTS).toEqual({
      blocks: 2,
      floors: { min: 2, max: 10 },
      residentialFloors: 9,
      perFloor: 8,
      perBlock: 72,
      apartments: 144,
      types: { '2-стаен': 72, '3-стаен': 72 },
      minArea: Math.min(...areas),
      maxArea: Math.max(...areas),
    })
    // Обща площ from 59,48 to 101,98 m² as of 01.12.2025.
    expect([MN_FACTS.minArea, MN_FACTS.maxArea]).toEqual([59.48, 101.98])
  })

  it('follow the snapshot when its rows change: no count is written in', async () => {
    vi.resetModules()
    vi.doMock('./snapshot', () => ({
      MN_SNAPSHOT_DATA: {
        [MN]: {
          'block-a': [row('А-201', '3', '2-стаен', '61.5'), row('А-202', '3', '3-стаен', '88'), row('А-301', '4', '2-стаен', '60')],
          'block-b': [row('Б-401', '5', 'Ателие', '42.25')],
        },
      },
    }))

    const { MN_FACTS: facts } = await import('./facts')

    expect(facts).toEqual({
      blocks: 2,
      floors: { min: 3, max: 5 },
      residentialFloors: 3,
      perFloor: 2,
      perBlock: 3,
      apartments: 4,
      types: { '2-стаен': 2, '3-стаен': 1, 'Ателие': 1 },
      minArea: 42.25,
      maxArea: 88,
    })
  })

  it('cannot be changed by a page', () => {
    expect(Object.isFrozen(MN_FACTS)).toBe(true)
    expect(Object.isFrozen(MN_FACTS.floors)).toBe(true)
    expect(Object.isFrozen(MN_FACTS.types)).toBe(true)
  })
})
