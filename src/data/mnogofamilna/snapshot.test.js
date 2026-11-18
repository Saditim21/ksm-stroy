import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { cwd } from 'node:process'
import { gzipSync } from 'node:zlib'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { summarize } from '../../utils/units'
import { apartmentUnits } from '../availability/select'
import { getSnapshot, subscribe } from '../availability/store'
import { MN_SNAPSHOT_DATA, MN_SNAPSHOT_DATE } from './snapshot'

// The store's direct sheet fetchers fail. The rest of the service is real, so
// the store takes its built-in path as it does on a page.
const sheets = vi.hoisted(() => ({
  fetchApartmentData: vi.fn(async () => { throw new Error('the sheet failed') }),
  fetchGarageData: vi.fn(async () => { throw new Error('the sheet failed') }),
  clearCache: vi.fn(),
}))
vi.mock('../../services/googleSheets', async (importOriginal) => ({ ...(await importOriginal()), ...sheets }))

const MN = 'mnogofamilna-sgrada'
const FLOORS = [2, 3, 4, 5, 6, 7, 8, 9, 10]
// Each floor of each block, as the explorer keys them: 'А-2' … 'Б-10'.
const FLOOR_KEYS = ['А', 'Б'].flatMap((block) => FLOORS.map((floor) => `${block}-${floor}`))
const floorKey = (unit) => `${unit.block}-${unit.floor}`

const units = () => apartmentUnits(MN_SNAPSHOT_DATA, MN)

// What the store shows once its first load has ended. A page's first reader
// starts that load, as useAvailability() does.
async function firstLoad() {
  const unsubscribe = subscribe(() => {})
  try {
    await vi.waitFor(() => expect(getSnapshot().status).not.toBe('loading'), { timeout: 4000 })
  } finally {
    unsubscribe()
  }
  return getSnapshot()
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('MN_SNAPSHOT_DATA', () => {
  it('snapshot matches the built-in rows', async () => {
    // Nothing live answers: the API is unreachable and the sheets fail.
    vi.stubGlobal('fetch', vi.fn(async () => { throw new TypeError('Failed to fetch') }))

    const { status, data, origin } = await firstLoad()

    expect(status).toBe('fallback')
    expect(origin[MN]).toEqual({ 'block-a': 'built-in', 'block-b': 'built-in' })
    // Both blocks' rows, from getMnogoAFallbackData() and getMnogoBFallbackData()
    // through the store: plain objects, in the same order.
    expect(MN_SNAPSHOT_DATA).toStrictEqual({ [MN]: data[MN] })
  })

  it('144 units, floors 2–10, А-101 on floor 2', () => {
    const all = units()
    const perFloor = {}
    for (const unit of all) perFloor[floorKey(unit)] = (perFloor[floorKey(unit)] ?? 0) + 1

    expect(all).toHaveLength(144)
    expect(perFloor).toEqual(Object.fromEntries(FLOOR_KEYS.map((key) => [key, 8])))
    expect(all.find((unit) => unit.label === 'А-101')).toMatchObject({ block: 'А', floor: 2, suffix: '01' })
    expect(all.find((unit) => unit.label === 'Б-908')).toMatchObject({ block: 'Б', floor: 10 })
  })

  it('statuses as of 01.12.2025', () => {
    const all = units()
    const floorsWhere = (test) => FLOOR_KEYS.filter((key) => test(all.filter((unit) => floorKey(unit) === key)))

    expect(MN_SNAPSHOT_DATE).toBe('01.12.2025')
    expect(summarize(all)).toEqual({ total: 144, available: 16, reserved: 6, sold: 122, blocked: 0 })
    // The floors with a free apartment, and the sold-out ones (spec §2).
    expect(floorsWhere((floor) => floor.some((unit) => unit.status === 'available')))
      .toEqual(['А-2', 'А-9', 'Б-2', 'Б-3', 'Б-4', 'Б-5', 'Б-7', 'Б-8', 'Б-9'])
    expect(floorsWhere((floor) => floor.every((unit) => unit.status === 'sold')))
      .toEqual(['А-3', 'А-4', 'А-5', 'А-6', 'А-10', 'Б-6', 'Б-10'])
  })

  it('stays small', () => {
    // As committed, with LF line ends, whatever a checkout makes of them.
    const source = readFileSync(join(cwd(), 'src/data/mnogofamilna/snapshot.js'), 'utf8').replace(/\r\n/g, '\n')

    expect(gzipSync(source).length).toBeLessThanOrEqual(3072)
  })
})
