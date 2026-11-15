import { describe, expect, it } from 'vitest'
import { apartmentUnits, grFree, spotUnits } from './select'

// The pages read availability as units (spec §9): M1's unit model
// (src/utils/units.js) built from the API's rows, which useAvailability()
// gives in data, plus each unit's suffix and price. Statuses go through
// src/utils/propertyStatus.js.

const row = (unit, floor, status, extra = {}) => ({
  unit,
  floor,
  type: '2-стаен',
  area: { built: '54,36', ideal: '7,82', total: '62,18' },
  exposure: '',
  status,
  price: '',
  ...extra,
})

// The API's `projects`, as data holds them.
const projects = ({ a = [], b = [], mnogoA = null, mnogoB = null } = {}) => ({
  'golden-residence': { 'block-a': a, 'block-b': b, garages: [], parking: [] },
  'mnogofamilna-sgrada': { 'block-a': mnogoA, 'block-b': mnogoB },
})

describe('apartmentUnits', () => {
  it('gives each row as M1’s unit, with its suffix and its price', () => {
    const data = {
      'golden-residence': {
        'block-a': [{ unit: 'А 501', floor: '5', type: '2-стаен', area: { built: '54,36', ideal: '7,82', total: '62,18' }, exposure: '', status: 'Продадени', price: '' }],
        'block-b': [],
      },
    }

    expect(apartmentUnits(data)[0]).toEqual({
      id: 'А501',
      label: 'А 501',
      kind: 'apartment',
      block: 'А',
      floor: 5,
      suffix: '01',
      builtArea: 54.36,
      idealParts: 7.82,
      totalArea: 62.18,
      type: '2-стаен',
      exposure: '',
      price: '',
      status: 'sold',
      statusText: 'Продадени',
    })
  })

  it('reads an empty status as free, and keeps a status the rules do not know as written', () => {
    const [free, soon] = apartmentUnits(projects({ a: [row('А 101', '1', ''), row('А 102', '1', 'Скоро')] }))

    expect(free).toMatchObject({ status: 'available', statusText: 'Свободен' })
    expect(soon).toMatchObject({ status: 'unknown', statusText: 'Скоро' })
  })

  it('gives block А’s units, then block Б’s, each with its letter', () => {
    const units = apartmentUnits(projects({ a: [row('А 812', '8', 'Свободен')], b: [row('Б 103', '1', 'Резервиран', { exposure: 'Изток', price: '125 000 €' })] }))

    expect(units.map(({ label, block, floor, suffix }) => [label, block, floor, suffix])).toEqual([
      ['А 812', 'А', 8, '12'],
      ['Б 103', 'Б', 1, '03'],
    ])
    expect(units[1]).toMatchObject({ exposure: 'Изток', price: '125 000 €', status: 'reserved' })
  })

  it('reads a blank or dashed area as no area', () => {
    const [unit] = apartmentUnits(projects({ a: [row('А 201', '2', 'Свободен', { area: { built: '57.46', ideal: '', total: '-' } })] }))

    expect(unit).toMatchObject({ builtArea: 57.46, idealParts: null, totalArea: null })
  })

  it('gives no units for no data, and none for a block without rows', () => {
    expect(apartmentUnits(null)).toEqual([])
    expect(apartmentUnits(projects({ a: null, b: [row('Б 101', '1', 'Свободен')] })).map(({ label }) => label)).toEqual(['Б 101'])
  })

  it('reads another project’s blocks when asked', () => {
    const data = projects({ mnogoA: [row('А-901', '10', 'Свободен')] })

    expect(apartmentUnits(data, 'mnogofamilna-sgrada')).toMatchObject([{ id: 'А901', label: 'А-901', block: 'А', floor: 10, suffix: '01' }])
  })
})

// The Golden Residence page's garages and parking places (spec §6.18): the
// API's spot rows (src/services/sheetsCore.js: { number, type, area, status })
// as places, each status through src/utils/propertyStatus.js.
describe('spotUnits', () => {
  const spots = (garages, parking = []) => ({ 'golden-residence': { 'block-a': [], 'block-b': [], garages, parking } })

  it('gives each row of a slot as a place: its id, label, area, type and status', () => {
    const data = spots([{ number: 'Г-001', type: 'Гараж', area: { total: '34,01' }, status: 'Продадени' }])

    expect(spotUnits(data, 'garages')).toEqual([
      { id: 'Г001', label: 'Г-001', totalArea: 34.01, type: 'Гараж', status: 'sold', statusText: 'Продадени' },
    ])
  })

  it('reads the slot asked for, an empty status as free, and leaves out a row that names no place', () => {
    const data = spots([], [
      { number: 'ПМ-03', type: 'Паркомясто', area: { built: '12.50', ideal: '0', total: '12.50' }, status: '' },
      { number: ' ', type: 'Паркомясто', area: { total: '12.50' }, status: 'Свободен' },
      { number: 'ПМ-04', type: 'Паркомясто', area: { total: '-' }, status: 'Скоро' },
    ])

    expect(spotUnits(data, 'parking')).toEqual([
      { id: 'ПМ03', label: 'ПМ-03', totalArea: 12.5, type: 'Паркомясто', status: 'available', statusText: 'Свободен' },
      { id: 'ПМ04', label: 'ПМ-04', totalArea: null, type: 'Паркомясто', status: 'unknown', statusText: 'Скоро' },
    ])
  })

  it('gives no places for no data, and none for a slot without rows', () => {
    expect(spotUnits(null, 'garages')).toEqual([])
    expect(spotUnits(spots(null), 'garages')).toEqual([])
  })
})

describe('grFree', () => {
  const ready = (status) => ({
    status,
    data: projects({
      a: [row('А 101', '1', 'Свободен'), row('А 102', '1', ''), row('А 103', '1', 'Резервиран'), row('А 104', '1', 'Скоро')],
      b: [row('Б 101', '1', 'Свободен'), row('Б 102', '1', 'Продадени'), row('Б 103', '1', 'Блокиран')],
    }),
  })

  // Spec §9: the count is a placeholder until the data arrives, never a
  // fake zero.
  it.each(['idle', 'loading', 'error'])('is null while the store is %s', (status) => {
    expect(grFree({ status, data: null })).toBeNull()
  })

  it.each(['ready', 'fallback'])('counts the free units of both blocks when the store is %s', (status) => {
    expect(grFree(ready(status))).toBe(3)
  })

  it('is null while a block has no rows, rather than a count of the other alone', () => {
    const snapshot = ready('ready')
    snapshot.data['golden-residence']['block-b'] = null

    expect(grFree(snapshot)).toBeNull()
  })
})
