import { afterEach, expect, it, vi } from 'vitest'
import { getSnapshot, subscribe } from './store'

// The data built into the site is the store's last resort, for when neither
// the API nor the sheets answer (src/data/availability/store.js). It must not
// need the sheets' own chunk (src/services/googleSheets.js, which the store
// loads for its fetchers): the conditions that took the API and the sheets
// down, offline or a deploy that replaced the chunk, fail that load too (the
// M3 final review's minor, left to M4: the built-in path took
// normalizeFloorData from that chunk, and ended in 'error'). Here the
// sheets' chunk fails to load, as a dynamic import does when the network
// drops, and the API cannot be reached.
vi.mock('../../services/googleSheets', () => {
  throw new TypeError('Failed to fetch dynamically imported module')
})

afterEach(() => {
  vi.unstubAllGlobals()
})

it('falls back to the data built into the site when the sheets’ chunk fails to load too', async () => {
  vi.stubGlobal('fetch', vi.fn(async () => {
    throw new TypeError('Failed to fetch')
  }))
  const unsubscribe = subscribe(() => {})
  try {
    await vi.waitFor(() => expect(getSnapshot().status).not.toBe('loading'), { timeout: 4000 })
  } finally {
    unsubscribe()
  }

  const { status, data, origin } = getSnapshot()
  expect(status).toBe('fallback')
  const gr = data['golden-residence']
  expect([gr['block-a'], gr['block-b'], gr.garages, gr.parking].map((rows) => rows.length)).toEqual([96, 96, 113, 68])
  // Многофамилна's, normalised as a sheet's rows are: floor 0 (its garages)
  // left out, and „Продаден“ read as Продадени.
  const mn = data['mnogofamilna-sgrada']
  expect([mn['block-a'], mn['block-b']].map((rows) => rows.length)).toEqual([72, 72])
  expect([...mn['block-a'], ...mn['block-b']].some((row) => Number(row.floor) === 0)).toBe(false)
  expect(mn['block-a'].find((row) => row.unit === 'А-101').status).toBe('Продадени')
  expect(origin).toEqual({
    'golden-residence': { 'block-a': 'built-in', 'block-b': 'built-in', garages: 'built-in', parking: 'built-in' },
    'mnogofamilna-sgrada': { 'block-a': 'built-in', 'block-b': 'built-in' },
  })
})
