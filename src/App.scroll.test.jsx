import { render, act } from '@testing-library/react'
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

// Reveal, DimensionLine and AnimatedNumber all observe intersections — absent in jsdom.
class NoopIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.IntersectionObserver = NoopIntersectionObserver
globalThis.IntersectionObserver = NoopIntersectionObserver

// AnimatedRoutes' route-change effect (src/App.jsx) runs on every mount as
// well as on every `location.pathname` change — same effect body, same
// dependency, so exercising it via an initial mount (no click/navigation
// needed) covers the same code path a real route change takes.
//
// Regression: the effect used to call `window.scrollTo(0, 0)` synchronously.
// On a long-scrolled page the jump to the top was visible *before* the
// curtain (PageTransition's ink panel, ~450ms to fully cover, see
// CURTAIN_COVER_MS) had swept up to mask it. The fix delays the scroll by
// CURTAIN_COVER_MS — imported from PageTransition itself so the two values
// can't drift apart — unless the user prefers reduced motion, in which case
// there's no curtain to wait for and the scroll happens immediately.
beforeEach(() => {
  sessionStorage.setItem('ksm-intro-seen', 'true') // skip IntroReveal's own timers/overlay
  window.scrollTo = vi.fn()
})

afterEach(() => {
  sessionStorage.clear()
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

function renderAt(path) {
  window.history.pushState({}, '', path)
  return render(<App />)
}

test('non-reduced motion: scrollTo is delayed until the curtain has had time to cover the viewport', async () => {
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false })))
  vi.useFakeTimers()

  renderAt('/')
  expect(window.scrollTo).not.toHaveBeenCalled()

  act(() => {
    vi.advanceTimersByTime(400)
  })
  expect(window.scrollTo).not.toHaveBeenCalled()

  act(() => {
    vi.advanceTimersByTime(50) // total 450ms
  })
  expect(window.scrollTo).toHaveBeenCalledWith(0, 0)
})

test('reduced motion: scrollTo happens immediately — there is no curtain to wait for', async () => {
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true })))

  renderAt('/')
  expect(window.scrollTo).toHaveBeenCalledWith(0, 0)
})
