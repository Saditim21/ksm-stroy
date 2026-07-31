import { render, screen, waitFor, act } from '@testing-library/react'
import { vi } from 'vitest'

vi.mock('../services/googleSheets', () => ({
  fetchApartmentData: vi.fn(async (key) =>
    key === 'mnogoA' ? { 3: [{ apartment: 'А-201', status: 'Свободен' }] } : null),
  fetchGarageData: vi.fn(async () => null),
  calculateStats: vi.fn(() => ({ total: 1, available: 1, reserved: 0, sold: 0 })),
  calculateGarageStats: vi.fn(() => ({ total: 0, available: 0, reserved: 0, sold: 0 })),
  clearCache: vi.fn(),
}))

import { ApartmentProvider, useApartments } from './ApartmentContext'
import { fetchApartmentData, clearCache } from '../services/googleSheets'
import { getMnogoBFallbackData } from '../constants/mnogofamilnaFallbackData'

function Probe() {
  const { loading, getProjectFloorData } = useApartments()
  if (loading) return <div>loading</div>
  const a = getProjectFloorData('mnogofamilna-sgrada', 'block-a')
  const b = getProjectFloorData('mnogofamilna-sgrada', 'block-b')
  return (
    <div>
      <div data-testid="a-first">{a[3]?.[0]?.apartment}</div>
      <div data-testid="b-floors">{Object.keys(b).length}</div>
    </div>
  )
}

test('background refresh picks up sheet changes after 60s without flipping loading', async () => {
  const loadingSeen = []
  function LoadingProbe() {
    const { loading, getProjectFloorData } = useApartments()
    loadingSeen.push(loading)
    const a = getProjectFloorData('mnogofamilna-sgrada', 'block-a')
    return <div data-testid="a-first">{a[3]?.[0]?.apartment ?? ''}</div>
  }

  vi.useFakeTimers()
  try {
    render(<ApartmentProvider><LoadingProbe /></ApartmentProvider>)
    // Let the initial load settle
    await act(async () => { await vi.advanceTimersByTimeAsync(0) })
    expect(screen.getByTestId('a-first')).toHaveTextContent('А-201')

    // The sheet changes; nobody reloads the page
    const rendersBefore = loadingSeen.length
    clearCache.mockClear()
    fetchApartmentData.mockImplementation(async (key) =>
      key === 'mnogoA' ? { 3: [{ apartment: 'А-999', status: 'Свободен' }] } : null)

    await act(async () => { await vi.advanceTimersByTimeAsync(60_000) })

    expect(screen.getByTestId('a-first')).toHaveTextContent('А-999')
    expect(clearCache).toHaveBeenCalled()
    // No spinner mid-browse: loading never went back to true
    expect(loadingSeen.slice(rendersBefore)).not.toContain(true)
  } finally {
    vi.useRealTimers()
    fetchApartmentData.mockImplementation(async (key) =>
      key === 'mnogoA' ? { 3: [{ apartment: 'А-201', status: 'Свободен' }] } : null)
  }
})

test('mnogofamilna uses fetched data when available, fallback otherwise', async () => {
  render(<ApartmentProvider><Probe /></ApartmentProvider>)
  await waitFor(() => expect(screen.queryByText('loading')).not.toBeInTheDocument())
  // mnogoA fetch succeeded -> fetched data
  expect(screen.getByTestId('a-first')).toHaveTextContent('А-201')
  // mnogoB fetch returned null -> fallback
  expect(Number(screen.getByTestId('b-floors').textContent))
    .toBe(Object.keys(getMnogoBFallbackData()).length)
})
