import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'

// Regression: on a first visit the branded intro overlay (IntroReveal) covers
// the viewport for its first ~1.2s while Home mounts underneath and plays its
// hero entrance — the word-rise, the container stagger — immediately. By the
// time the overlay lifted at ~1.9s the whole thing had settled, so the first
// impression of the site was a static headline: the centerpiece was spent
// behind a curtain.
//
// The fix hands Home the intro's REMAINING time (utils/introGate.js) as a
// delay offset on the text layer only. framer-motion's animations do not tick
// under vitest's fake clock (its rAF-driven loop never advances, verified: the
// inline transform stays at the initial value forever), so "it animates later"
// is not observable in the DOM here. What IS observable, and is what actually
// broke, is the offset itself — so these tests assert the words start parked
// below their mask AND that the offset the reveal is scheduled with matches
// the intro that is really playing.

let mockReduced = false
vi.mock('framer-motion', async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, useReducedMotion: () => mockReduced }
})

vi.mock('../services/googleSheets', () => ({
  fetchApartmentData: vi.fn(async () => null),
  fetchGarageData: vi.fn(async () => null),
  calculateStats: vi.fn(() => ({ total: 0, available: 0, reserved: 0, sold: 0 })),
  calculateGarageStats: vi.fn(() => ({ total: 0, available: 0, reserved: 0, sold: 0 })),
  clearCache: vi.fn(),
}))

// Record the props Home hands SplitLines while still rendering the real
// component, so one render proves both the wiring and the DOM it produces.
const { splitLinesProps } = vi.hoisted(() => ({ splitLinesProps: [] }))
vi.mock('../components/ui/SplitLines', async (importOriginal) => {
  const actual = await importOriginal()
  const Actual = actual.default
  return {
    default: (props) => {
      splitLinesProps.push(props)
      return <Actual {...props} />
    },
  }
})

import IntroReveal from '../components/ui/IntroReveal'
import { ApartmentProvider } from '../context/ApartmentContext'
import { INTRO_HANDOFF_MS, markIntroEnd } from '../utils/introGate'
import Home from './Home'

class NoopIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.IntersectionObserver = NoopIntersectionObserver
globalThis.IntersectionObserver = NoopIntersectionObserver

// IntroReveal and Home render in the SAME commit here — stricter than
// production, where Home is a lazy chunk that necessarily arrives later. If the
// gate is ever published from an effect instead of the render phase, this is
// the test that catches it.
const renderSite = () =>
  render(
    <MemoryRouter>
      <IntroReveal />
      <ApartmentProvider><Home /></ApartmentProvider>
    </MemoryRouter>,
  )

const heroDelay = () => splitLinesProps.at(-1).delay

beforeEach(() => {
  mockReduced = false
  splitLinesProps.length = 0
  sessionStorage.clear()
  markIntroEnd()
  vi.useFakeTimers() // freezes Date.now, so the countdown is exact
})

afterEach(() => {
  vi.useRealTimers()
  sessionStorage.clear()
  markIntroEnd()
})

test('first visit: the hero word-rise is offset by the whole remaining intro', () => {
  renderSite()

  expect(document.querySelector('[data-intro-reveal]')).toBeInTheDocument()
  expect(heroDelay()).toBeCloseTo(INTRO_HANDOFF_MS / 1000, 3)
  expect(heroDelay()).toBeGreaterThan(1)
})

test('first visit: the headline words start parked below their mask', () => {
  renderSite()
  const h1 = screen.getByRole('heading', { level: 1 })
  const risers = h1.querySelectorAll('span.overflow-hidden > span')
  expect(risers.length).toBeGreaterThan(0)
  risers.forEach((riser) => {
    expect(riser.getAttribute('style')).toMatch(/translateY\(110%\)/)
  })
})

test('repeat visit: the session flag is set, no overlay renders, and the hero animates at once', () => {
  sessionStorage.setItem('ksm-intro-seen', 'true')
  renderSite()

  expect(document.querySelector('[data-intro-reveal]')).not.toBeInTheDocument()
  expect(heroDelay()).toBe(0)
})

test('reduced motion: no overlay, no offset', () => {
  mockReduced = true
  renderSite()

  expect(document.querySelector('[data-intro-reveal]')).not.toBeInTheDocument()
  expect(heroDelay()).toBe(0)
})

// The slider sits BEHIND the overlay content and is the one thing that should
// not wait: by the time the curtain lifts it is already a moving image rather
// than a still frame. Only the text layer is gated.
test('the hero slider is not gated — it is already on its first slide while the overlay is up', () => {
  renderSite()
  expect(document.querySelector('[data-intro-reveal]')).toBeInTheDocument()
  expect(screen.getByAltText('Многофамилна жилищна сграда')).toBeInTheDocument()
})
