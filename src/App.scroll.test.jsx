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

// The Lenis handle App reaches for on a route change. SmoothScroll never
// builds a real instance under vitest (see its MODE === 'test' gate), so the
// module is stubbed with a knob the tests move: null models "Lenis isn't
// running" (reduced motion / test / prerender), an object models a live
// scroller mid-fling.
let mockLenis = null
vi.mock('./utils/lenis', () => ({
  getLenis: () => mockLenis,
  setLenis: vi.fn(),
  clearLenis: vi.fn(),
}))

import App from './App'
import { CURTAIN_COVER_MS } from './components/ui/PageTransition'

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
  mockLenis = null
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

// Regression: Lenis (SmoothScroll) runs an uninterrupted rAF loop that writes
// `scrollTop` on every frame while a fling is still gliding. A bare
// `window.scrollTo(0, 0)` fired from this effect was therefore overwritten on
// the very next frame — flinging the page and clicking a nav link inside the
// glide window landed /about at scrollY 2582 instead of 0. The jump has to be
// addressed to the scroller that is actually in charge, with `immediate: true`
// so the in-flight animation is cancelled rather than raced.
test('non-reduced motion: the delayed jump is issued through Lenis with immediate:true when a scroller is live', () => {
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false })))
  vi.useFakeTimers()
  mockLenis = { scrollTo: vi.fn() }

  renderAt('/')
  expect(mockLenis.scrollTo).not.toHaveBeenCalled()

  act(() => {
    vi.advanceTimersByTime(CURTAIN_COVER_MS)
  })

  expect(mockLenis.scrollTo).toHaveBeenCalledWith(0, { immediate: true })
  // Talking to Lenis replaces the window jump — issuing both would let the
  // rAF loop fight the native scroll for a frame.
  expect(window.scrollTo).not.toHaveBeenCalled()
})

test('non-reduced motion: falls back to window.scrollTo when no Lenis instance is running', () => {
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false })))
  vi.useFakeTimers()
  mockLenis = null

  renderAt('/')
  act(() => {
    vi.advanceTimersByTime(CURTAIN_COVER_MS)
  })

  expect(window.scrollTo).toHaveBeenCalledWith(0, 0)
})

// Reduced motion never starts Lenis in the first place (SmoothScroll bails
// before construction), so this path stays on the native jump even if a stale
// handle were somehow still published.
test('reduced motion stays on window.scrollTo and never routes through Lenis', () => {
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true })))
  mockLenis = { scrollTo: vi.fn() }

  renderAt('/')
  expect(window.scrollTo).toHaveBeenCalledWith(0, 0)
  expect(mockLenis.scrollTo).not.toHaveBeenCalled()
})
