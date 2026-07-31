import { render, screen, waitFor } from '@testing-library/react'
import { vi } from 'vitest'

vi.mock('../services/googleSheets', () => ({
  fetchApartmentData: vi.fn(async () => null),
  fetchGarageData: vi.fn(async () => null),
  calculateStats: vi.fn(() => ({ total: 0, available: 0, reserved: 0, sold: 0 })),
  calculateGarageStats: vi.fn(() => ({ total: 0, available: 0, reserved: 0, sold: 0 })),
  clearCache: vi.fn(),
}))

import { ApartmentProvider } from '../context/ApartmentContext'
import useSiteAvailability from './useSiteAvailability'

function Probe() {
  const { available, total, byProject, loading } = useSiteAvailability()
  if (loading) return <div>loading</div>
  return (
    <div>
      <div data-testid="total">{total}</div>
      <div data-testid="available">{available}</div>
      <div data-testid="mnogo-total">{byProject['mnogofamilna-sgrada'].total}</div>
    </div>
  )
}

test('sums fallback availability across both projects, excluding mnogo garages', async () => {
  render(<ApartmentProvider><Probe /></ApartmentProvider>)
  await waitFor(() => expect(screen.queryByText('loading')).not.toBeInTheDocument())
  // Golden fallback = 192 apartments; mnogo residential fallback = 144 (NOT 151)
  expect(screen.getByTestId('mnogo-total')).toHaveTextContent('144')
  expect(Number(screen.getByTestId('total').textContent)).toBe(192 + 144)
  expect(Number(screen.getByTestId('available').textContent)).toBeGreaterThan(0)
})
