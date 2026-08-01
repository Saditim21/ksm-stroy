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

// IntroReveal (mounted once above the routes in App.jsx) plays a ~1.9s branded
// splash on a fresh session and locks body scroll while it plays — real,
// deliberate behavior, already covered on its own in IntroReveal.test.jsx.
// Here it would only add timing noise to route-content assertions that have
// nothing to do with the intro. This is test infra, not a weakening of the
// behavior under test: pre-seed the flag so every route test below sees the
// app the way a visitor would after IntroReveal has already played once this
// session (its ordinary steady state).
beforeEach(() => {
  sessionStorage.setItem('ksm-intro-seen', 'true')
})

afterEach(() => {
  sessionStorage.clear()
})

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

test('IntroReveal is mounted above the routes and plays on a fresh session (no flag)', () => {
  sessionStorage.removeItem('ksm-intro-seen')
  renderAt('/')
  expect(document.querySelector('[data-intro-reveal]')).toBeInTheDocument()
})

test('IntroReveal renders nothing once the session has already seen it', () => {
  renderAt('/') // beforeEach already seeded the flag
  expect(document.querySelector('[data-intro-reveal]')).not.toBeInTheDocument()
})
