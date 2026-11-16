import { afterEach, beforeEach, expect, it, vi } from 'vitest'

// The browser's fetchers of the sheets and the legacy floor maps' last step
// (src/services/googleSheets.js, with sheetsCore.js) are a chunk of their
// own, out of every route's first-load JS (spec §10, M3 §10): the store loads
// them only on the paths that use them, once the API has failed, and for the
// data built into the site.

// The service's stand-in, registered afresh for every case: it counts its
// loads, and its fetchers read nothing.
const sheets = vi.hoisted(() => ({ loads: 0, fetchApartmentData: vi.fn(), fetchGarageData: vi.fn(), clearCache: vi.fn() }))
const SERVICE = '../../services/googleSheets'

const row = (unit, floor, status) => ({
  unit, floor, type: '2-стаен', area: { built: '54.36', ideal: '7.82', total: '62.18' }, exposure: 'Юг', status, price: '',
})
const spot = (number, status) => ({ number, type: 'Гараж', area: { built: '21.07', ideal: '12.94', total: '34.01' }, status })

// What api/availability.js answers: every Golden Residence tab read, so no
// slot takes the built-in rows.
const API_BODY = {
  updatedAt: '2026-11-14T08:00:00.000Z',
  projects: {
    'golden-residence': {
      'block-a': [row('А 301', '3', 'Свободен')],
      'block-b': [row('Б 101', '1', 'Свободен')],
      garages: [spot('Г-001', 'Свободен')],
      parking: [spot('ПМ-01', 'Продадени')],
    },
    'mnogofamilna-sgrada': { 'block-a': null, 'block-b': null },
  },
}

let store
let stop
beforeEach(async () => {
  // A fresh store, and a service no case has loaded yet.
  vi.resetModules()
  sheets.loads = 0
  for (const fetcher of [sheets.fetchApartmentData, sheets.fetchGarageData]) fetcher.mockReset().mockResolvedValue(null)
  sheets.clearCache.mockReset()
  vi.doMock(SERVICE, async (importOriginal) => {
    sheets.loads += 1
    const { fetchApartmentData, fetchGarageData, clearCache } = sheets
    return { ...(await importOriginal()), fetchApartmentData, fetchGarageData, clearCache }
  })
  store = await import('./store')
})

afterEach(() => {
  stop?.()
  stop = null
  vi.doUnmock(SERVICE)
  vi.unstubAllGlobals()
})

it('reads the API without loading the sheets’ fetchers', async () => {
  vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, status: 200, json: async () => API_BODY })))
  stop = store.subscribe(() => {})

  await vi.waitFor(() => expect(store.getSnapshot().status).toBe('ready'))
  expect(store.getSnapshot().origin['golden-residence']['block-a']).toBe('live')
  expect(sheets.loads).toBe(0)
})

it('loads them once the API has failed, reads the sheets, then falls back to the data built into the site', async () => {
  vi.stubGlobal('fetch', vi.fn(async () => {
    throw new TypeError('Failed to fetch')
  }))
  stop = store.subscribe(() => {})

  await vi.waitFor(() => expect(store.getSnapshot().status).toBe('fallback'), { timeout: 5000 })
  expect(sheets.loads).toBe(1)
  expect(sheets.fetchApartmentData.mock.calls.map(([block]) => block).sort()).toEqual(['blockA', 'blockB', 'mnogoA', 'mnogoB'])
  expect(store.getSnapshot().origin['golden-residence']['block-a']).toBe('built-in')
  expect(store.getSnapshot().data['golden-residence']['block-a'].length).toBeGreaterThan(0)
})
