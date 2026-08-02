import { render, act } from '@testing-library/react'
import { vi } from 'vitest'

// Controllable useReducedMotion mock (see motion2.test.jsx for the rationale:
// framer-motion's real hook lazily caches a matchMedia read jsdom doesn't
// implement, so mocking the hook directly is the deterministic per-test knob).
let mockReduced = false
vi.mock('framer-motion', async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, useReducedMotion: () => mockReduced }
})

import IntroReveal from './IntroReveal'
import { getIntroDelayMs, markIntroEnd, INTRO_HANDOFF_MS, INTRO_DONE_DELAY_MS } from '../../utils/introGate'

beforeEach(() => {
  mockReduced = false
  sessionStorage.clear()
  document.body.style.overflow = ''
  markIntroEnd() // the gate is module state; reset it between renders
})

afterEach(() => {
  vi.useRealTimers()
  sessionStorage.clear()
  document.body.style.overflow = ''
  markIntroEnd()
})

test('renders the branded overlay with logo and gold rule when no session flag is present', () => {
  render(<IntroReveal />)
  expect(document.querySelector('[data-intro-reveal]')).toBeInTheDocument()
  expect(document.querySelector('[data-intro-logo]')).toBeInTheDocument()
  expect(document.querySelector('[data-rule]')).toBeInTheDocument()
  expect(document.querySelectorAll('[data-tick]')).toHaveLength(2)
})

test('locks body scroll while the overlay is visible', () => {
  render(<IntroReveal />)
  expect(document.body.style.overflow).toBe('hidden')
})

test('honors an existing session flag by rendering nothing and leaving body scroll untouched', () => {
  sessionStorage.setItem('ksm-intro-seen', 'true')
  render(<IntroReveal />)
  expect(document.querySelector('[data-intro-reveal]')).not.toBeInTheDocument()
  expect(document.body.style.overflow).toBe('')
})

test('reduced motion renders nothing', () => {
  mockReduced = true
  render(<IntroReveal />)
  expect(document.querySelector('[data-intro-reveal]')).not.toBeInTheDocument()
  expect(document.body.style.overflow).toBe('')
})

test('sets the session flag, unmounts, and restores body scroll once the ~1.9s sequence completes', () => {
  vi.useFakeTimers()
  render(<IntroReveal />)
  expect(sessionStorage.getItem('ksm-intro-seen')).toBeNull()

  act(() => {
    vi.advanceTimersByTime(1900)
  })

  expect(sessionStorage.getItem('ksm-intro-seen')).toBe('true')
  expect(document.querySelector('[data-intro-reveal]')).not.toBeInTheDocument()
  expect(document.body.style.overflow).toBe('')
})

test('does not complete the sequence early: mid-sequence the overlay is still present and the flag is not yet set', () => {
  vi.useFakeTimers()
  render(<IntroReveal />)

  act(() => {
    vi.advanceTimersByTime(1000)
  })

  expect(sessionStorage.getItem('ksm-intro-seen')).toBeNull()
  expect(document.querySelector('[data-intro-reveal]')).toBeInTheDocument()
})

// The overlay is opaque for its first beat, so anything the page underneath
// animates on mount is spent behind it — Home's hero word-rise had already
// settled by the time the curtain lifted. IntroReveal therefore publishes how
// much of itself is still to come (utils/introGate.js) and the page below adds
// that as a delay offset.
test('publishes the remaining intro time as a countdown for the page underneath', () => {
  vi.useFakeTimers()
  expect(getIntroDelayMs()).toBe(0) // nothing playing yet
  render(<IntroReveal />)
  expect(getIntroDelayMs()).toBe(INTRO_HANDOFF_MS)
})

test('the countdown winds down as the sequence plays and is spent by the handoff', () => {
  vi.useFakeTimers()
  render(<IntroReveal />)

  act(() => {
    vi.advanceTimersByTime(1000)
  })
  expect(getIntroDelayMs()).toBe(INTRO_HANDOFF_MS - 1000)

  act(() => {
    vi.advanceTimersByTime(INTRO_HANDOFF_MS - 1000)
  })
  expect(getIntroDelayMs()).toBe(0)
})

test('the countdown is retracted once the sequence completes', () => {
  vi.useFakeTimers()
  render(<IntroReveal />)
  act(() => {
    vi.advanceTimersByTime(INTRO_DONE_DELAY_MS)
  })
  expect(getIntroDelayMs()).toBe(0)
})

// A repeat visit and a reduced-motion visit both render no overlay at all, so
// there is nothing for the page below to wait for — it must animate at once.
test('publishes no countdown when the session flag is already set', () => {
  vi.useFakeTimers()
  sessionStorage.setItem('ksm-intro-seen', 'true')
  render(<IntroReveal />)
  expect(getIntroDelayMs()).toBe(0)
})

test('publishes no countdown under reduced motion', () => {
  vi.useFakeTimers()
  mockReduced = true
  render(<IntroReveal />)
  expect(getIntroDelayMs()).toBe(0)
})

test('clears all pending timers on unmount without throwing and without setting the flag', () => {
  vi.useFakeTimers()
  const { unmount } = render(<IntroReveal />)
  unmount()

  expect(() => {
    act(() => {
      vi.advanceTimersByTime(5000)
    })
  }).not.toThrow()
  expect(sessionStorage.getItem('ksm-intro-seen')).toBeNull()
})
