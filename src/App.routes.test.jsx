import { render, screen, waitFor } from '@testing-library/react'
import { vi } from 'vitest'

// No network in tests — every fetch returns null so the context uses fallback data.
vi.mock('./services/googleSheets', () => ({
  fetchApartmentData: vi.fn(async () => null),
  fetchGarageData: vi.fn(async () => null),
  calculateStats: vi.fn(() => ({ total: 0, available: 0, reserved: 0, sold: 0 })),
  calculateGarageStats: vi.fn(() => ({ total: 0, available: 0, reserved: 0, sold: 0 })),
  clearCache: vi.fn(),
}))

import App from './App'

// App's route change effect calls window.scrollTo, which jsdom does not implement.
window.scrollTo = vi.fn()

// Reveal, DimensionLine and AnimatedNumber all observe intersections — also absent in jsdom.
class NoopIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.IntersectionObserver = NoopIntersectionObserver
globalThis.IntersectionObserver = NoopIntersectionObserver

function renderAt(path) {
  window.history.pushState({}, '', path)
  return render(<App />)
}

test('an old indexed project URL redirects to the Продажби list instead of 404ing', async () => {
  renderAt('/projects/1')

  await waitFor(() => expect(screen.getByText('Многофамилна жилищна сграда')).toBeInTheDocument())
  expect(window.location.pathname).toBe('/projects')
})

test('an unknown project id also lands on Продажби', async () => {
  renderAt('/projects/some-unknown-id')

  await waitFor(() => expect(screen.getByText('Golden Residence')).toBeInTheDocument())
  expect(window.location.pathname).toBe('/projects')
})

test('the specific golden-residence route still wins over the :id redirect', async () => {
  renderAt('/projects/golden-residence')

  await waitFor(() => expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Изберете'))
  expect(window.location.pathname).toBe('/projects/golden-residence')
})
