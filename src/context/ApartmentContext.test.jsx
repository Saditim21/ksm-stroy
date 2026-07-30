import { render, screen, waitFor } from '@testing-library/react'
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

test('mnogofamilna uses fetched data when available, fallback otherwise', async () => {
  render(<ApartmentProvider><Probe /></ApartmentProvider>)
  await waitFor(() => expect(screen.queryByText('loading')).not.toBeInTheDocument())
  // mnogoA fetch succeeded -> fetched data
  expect(screen.getByTestId('a-first')).toHaveTextContent('А-201')
  // mnogoB fetch returned null -> fallback
  expect(Number(screen.getByTestId('b-floors').textContent))
    .toBe(Object.keys(getMnogoBFallbackData()).length)
})
