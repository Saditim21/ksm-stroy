import { render, waitFor, act } from '@testing-library/react'
import { vi } from 'vitest'

// The fetchers are mocked; everything else, normalizeFloorData included, is
// the real service.
vi.mock('../services/googleSheets', async (importOriginal) => ({
  ...(await importOriginal()),
  fetchApartmentData: vi.fn(),
  fetchGarageData: vi.fn(async () => null),
  calculateStats: vi.fn(() => ({ total: 1, available: 1, reserved: 0, sold: 0 })),
  calculateGarageStats: vi.fn(() => ({ total: 0, available: 0, reserved: 0, sold: 0 })),
  clearCache: vi.fn(),
}))

import { ApartmentProvider, useApartments } from './ApartmentContext'
import { fetchApartmentData, clearCache } from '../services/googleSheets'

const MNOGO_A = { 3: [{ apartment: 'А-201', status: 'Свободен' }] }
const BLOCK_A = { 3: [{ apartment: 'А 301', status: 'Блокиран' }, { apartment: 'А 302', status: 'Свободен' }] }

// What each sheet answers; a sheet left out answers null (unconfigured, or
// failed once the service's cache is cleared).
const sheets = (answers) => async (key) => answers[key] ?? null

let apartments
function Capture() {
  apartments = useApartments()
  return null
}

// Renders the provider on a fake clock, so any timer it sets is one a test
// moves on, and lets the first load settle. The clock also runs on with real
// time, as the Многофамилна fallback is a dynamic import it cannot hurry.
async function renderLoaded(children = null) {
  vi.useFakeTimers({ shouldAdvanceTime: true })
  render(<ApartmentProvider><Capture />{children}</ApartmentProvider>)
  await waitFor(() => expect(apartments.loading).toBe(false))
}

// The tab's visibility as the browser reports it, and the event it fires.
function setVisibility(state) {
  Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => state })
  Object.defineProperty(document, 'hidden', { configurable: true, get: () => state !== 'visible' })
  document.dispatchEvent(new Event('visibilitychange'))
}

// The visitor leaves the tab for `ms`, then comes back.
async function awayFor(ms) {
  await act(async () => {
    setVisibility('hidden')
    await vi.advanceTimersByTimeAsync(ms)
    setVisibility('visible')
    await vi.advanceTimersByTimeAsync(0)
  })
}

beforeEach(() => {
  fetchApartmentData.mockReset()
  fetchApartmentData.mockImplementation(sheets({ mnogoA: MNOGO_A }))
  clearCache.mockClear()
})

afterEach(() => {
  vi.useRealTimers()
  // Back to jsdom's own visibility.
  delete document.visibilityState
  delete document.hidden
})

test('coming back to the tab after more than a minute re-reads the sheets, without flipping loading', async () => {
  const loadingSeen = []
  function LoadingProbe() {
    loadingSeen.push(useApartments().loading)
    return null
  }
  await renderLoaded(<LoadingProbe />)
  expect(apartments.getProjectFloorData('mnogofamilna-sgrada', 'block-a')).toEqual(MNOGO_A)

  // The sheet changes while the visitor is on another tab.
  const rendersBefore = loadingSeen.length
  const changed = { 3: [{ apartment: 'А-999', status: 'Свободен' }] }
  fetchApartmentData.mockImplementation(sheets({ mnogoA: changed }))

  await awayFor(61_000)

  expect(apartments.getProjectFloorData('mnogofamilna-sgrada', 'block-a')).toEqual(changed)
  expect(clearCache).toHaveBeenCalled()
  // No spinner mid-browse: loading never went back to true
  expect(loadingSeen.slice(rendersBefore)).not.toContain(true)
})

test('nothing is re-read on coming back to data under a minute old, or on a timer', async () => {
  await renderLoaded()
  fetchApartmentData.mockClear()

  // A short trip to another tab: what the page shows is 30 s old.
  await awayFor(30_000)
  expect(fetchApartmentData).not.toHaveBeenCalled()

  // Five minutes on the page.
  await act(async () => { await vi.advanceTimersByTimeAsync(5 * 60_000) })
  expect(fetchApartmentData).not.toHaveBeenCalled()
  expect(clearCache).not.toHaveBeenCalled()
})

test('a failed refresh of Блок А keeps the last good rows', async () => {
  fetchApartmentData.mockImplementation(sheets({ blockA: BLOCK_A }))
  await renderLoaded()
  expect(apartments.getFloorData('block-a')).toEqual(BLOCK_A)

  // Google fails: with its cache cleared, the service answers null.
  fetchApartmentData.mockReset()
  fetchApartmentData.mockImplementation(sheets({}))
  await awayFor(61_000)

  expect(fetchApartmentData).toHaveBeenCalledWith('blockA')
  expect(apartments.getFloorData('block-a')).toEqual(BLOCK_A)
})

test('Многофамилна uses a fetched sheet as it is, and its built-in data normalised like a sheet', async () => {
  await renderLoaded()

  // mnogoA fetch succeeded -> fetched data
  expect(apartments.getProjectFloorData('mnogofamilna-sgrada', 'block-a')).toEqual(MNOGO_A)

  // mnogoB fetch returned null -> the built-in data, read the way a sheet is:
  // no floor 0 (the garages) and canonical statuses („Продадени")
  const b = apartments.getProjectFloorData('mnogofamilna-sgrada', 'block-b')
  expect(Object.keys(b)).toEqual(['2', '3', '4', '5', '6', '7', '8', '9', '10'])
  const statuses = new Set(Object.values(b).flat().map((row) => row.status))
  expect([...statuses].sort()).toEqual(['Продадени', 'Резервиран', 'Свободен'])
})
