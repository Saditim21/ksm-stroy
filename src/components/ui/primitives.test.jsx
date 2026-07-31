import { render, screen, act } from '@testing-library/react'
import { MemoryRouter, Link } from 'react-router-dom'
import { vi } from 'vitest'
import DimensionLine from './DimensionLine'
import DisplayHeading from './DisplayHeading'
import Reveal from './Reveal'
import AnimatedNumber from './AnimatedNumber'
import Button from './Button'

// Mock IntersectionObserver for whileInView (DimensionLine, Reveal)
// AnimatedNumber tests handle their own observer setup
class NoopIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
// Only set if not already present (other tests may have set up a different one)
if (typeof globalThis.IntersectionObserver === 'undefined') {
  globalThis.IntersectionObserver = NoopIntersectionObserver
}

// Controllable IntersectionObserver stub for AnimatedNumber tests
// Allows tests to fire intersection callbacks at will
class ControlledIO {
  constructor(cb) {
    this.cb = cb
    ControlledIO.instances.push(this)
  }
  observe(el) {
    this.el = el
  }
  unobserve() {}
  disconnect() {}
  trigger(isIntersecting) {
    this.cb([{ isIntersecting, target: this.el }])
  }
}
ControlledIO.instances = []

test('DimensionLine renders eyebrow label and rule with end ticks', () => {
  const { container } = render(<DimensionLine label="Продажби" />)
  expect(screen.getByText('Продажби')).toBeInTheDocument()
  expect(container.querySelectorAll('[data-tick]')).toHaveLength(2)
  expect(container.querySelector('[data-rule]')).toBeInTheDocument()
})

test('DisplayHeading renders requested tag with display font class', () => {
  render(<DisplayHeading as="h1" size="hero">Изберете своя <em>дом</em></DisplayHeading>)
  const h1 = screen.getByRole('heading', { level: 1 })
  expect(h1.className).toMatch(/font-display/)
  expect(h1.querySelector('em')).toHaveTextContent('дом')
})

test('Reveal renders children', () => {
  render(<Reveal><p>съдържание</p></Reveal>)
  expect(screen.getByText('съдържание')).toBeInTheDocument()
})

test('AnimatedNumber does not flash final value before intersection', () => {
  // Regression test: verify the !inView guard prevents flash to final value on mount
  // When IntersectionObserver is defined but never triggers (not in view),
  // component should stay at 0, not flash to final value
  const oldIO = globalThis.IntersectionObserver
  globalThis.IntersectionObserver = ControlledIO
  window.IntersectionObserver = ControlledIO
  ControlledIO.instances = []

  try {
    render(<AnimatedNumber value={128} />)
    // With canObserve=true and inView=false (callback never fired),
    // effect returns without setting display, stays at initial 0 (CORRECT - no flash)
    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.queryByText('128')).not.toBeInTheDocument()
  } finally {
    globalThis.IntersectionObserver = oldIO
    window.IntersectionObserver = oldIO
  }
})

test('AnimatedNumber animates to final value when scrolled into view', () => {
  // Coverage test: verify intersection → animation → final value path
  // Uses ControlledIO to fire intersection callback mid-test
  const oldIO = globalThis.IntersectionObserver
  globalThis.IntersectionObserver = ControlledIO
  window.IntersectionObserver = ControlledIO
  ControlledIO.instances = []

  vi.useFakeTimers()
  try {
    render(<AnimatedNumber value={128} duration={0.05} />)

    // Initially at 0 (not in view yet)
    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.queryByText('128')).not.toBeInTheDocument()

    // Simulate scrolling into view by triggering all IO instances
    act(() => {
      ControlledIO.instances.forEach(io => io.trigger(true))
    })

    // Advance timers to let animation frames process
    // With duration=0.05s (50ms), advance enough for animation to complete
    act(() => {
      vi.advanceTimersByTime(100)
    })

    // Should now show the final value (animation completed)
    expect(screen.getByText('128')).toBeInTheDocument()
  } finally {
    vi.useRealTimers()
    globalThis.IntersectionObserver = oldIO
    window.IntersectionObserver = oldIO
  }
})

test('AnimatedNumber eases from the current value instead of restarting at 0 when value changes', () => {
  // Regression test for Task 5 finding: hero counter visibly rewinds on cold load.
  // useSiteAvailability yields a fallback total first, then live sheet data resolves
  // ~1s later with a different total. AnimatedNumber must ease from the number it is
  // currently showing to the new value, never snap back to 0 and re-count up.
  const oldIO = globalThis.IntersectionObserver
  globalThis.IntersectionObserver = ControlledIO
  window.IntersectionObserver = ControlledIO
  ControlledIO.instances = []

  vi.useFakeTimers()
  try {
    const { rerender } = render(<AnimatedNumber value={100} duration={0.05} />)

    // Scroll into view and let the first animation run to completion.
    act(() => {
      ControlledIO.instances.forEach(io => io.trigger(true))
    })
    act(() => {
      vi.advanceTimersByTime(100)
    })
    expect(screen.getByText('100')).toBeInTheDocument()

    // Live data resolves with a lower total (fallback 100 -> live 60).
    rerender(<AnimatedNumber value={60} duration={0.05} />)

    // Sample mid-transition, well before the new animation completes.
    act(() => {
      vi.advanceTimersByTime(20)
    })
    const midway = Number(screen.getByText(/^\d+$/).textContent)
    // Guards the restart-from-0 regression: if the animation restarted at 0,
    // this value would be well under 60 (e.g. ~47). Easing from 100 keeps it
    // between the old and new value at all times.
    expect(midway).toBeGreaterThanOrEqual(60)
    expect(midway).toBeLessThanOrEqual(100)

    // Let the second animation finish; should land exactly on the new value.
    act(() => {
      vi.advanceTimersByTime(100)
    })
    expect(screen.getByText('60')).toBeInTheDocument()
  } finally {
    vi.useRealTimers()
    globalThis.IntersectionObserver = oldIO
    window.IntersectionObserver = oldIO
  }
})

test('Button variants render as link or button with gold styling', () => {
  render(
    <MemoryRouter>
      <Button as={Link} to="/projects" variant="gold">Разгледайте сградите</Button>
    </MemoryRouter>,
  )
  const link = screen.getByRole('link', { name: 'Разгледайте сградите' })
  expect(link).toHaveAttribute('href', '/projects')
  expect(link.className).toMatch(/bg-gold-accent/)
  render(<Button variant="ghost">Още</Button>)
  expect(screen.getByRole('button', { name: 'Още' }).className).toMatch(/border-concrete|border-ink/)
})
