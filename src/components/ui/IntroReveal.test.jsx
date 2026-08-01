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

beforeEach(() => {
  mockReduced = false
  sessionStorage.clear()
  document.body.style.overflow = ''
})

afterEach(() => {
  vi.useRealTimers()
  sessionStorage.clear()
  document.body.style.overflow = ''
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
