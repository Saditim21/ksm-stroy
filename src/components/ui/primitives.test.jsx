import { render, screen } from '@testing-library/react'
import { MemoryRouter, Link } from 'react-router-dom'
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

test('AnimatedNumber starts at 0 and renders when in view', () => {
  // Component starts at 0 when reduce=false and canObserve=true and inView=false
  // When IntersectionObserver never triggers (not in view), it stays at 0
  class NeverTriggeringObserver {
    constructor(callback) {
      this.callback = callback
    }
    observe() {
      // Never call callback - element stays out of view
    }
    unobserve() {}
    disconnect() {}
  }
  const oldIO = globalThis.IntersectionObserver
  globalThis.IntersectionObserver = NeverTriggeringObserver
  window.IntersectionObserver = NeverTriggeringObserver

  try {
    render(<AnimatedNumber value={128} />)
    // Should render 0 initially and stay at 0 since never comes into view
    expect(screen.getByText('0')).toBeInTheDocument()
    // The fix ensures we don't flash to 128 even though 128 is the target value
    expect(screen.queryByText('128')).not.toBeInTheDocument()
  } finally {
    globalThis.IntersectionObserver = oldIO
    window.IntersectionObserver = oldIO
  }
})

test('AnimatedNumber does not flash final value before intersection', () => {
  // With IntersectionObserver defined but not triggering (not in view)
  // Component should stay at 0, not flash to final value (the bug fix)
  class NonTriggeringObserver {
    observe() {
      // Do NOT call callback — element is not in view
    }
    unobserve() {}
    disconnect() {}
  }
  const oldIO = globalThis.IntersectionObserver
  globalThis.IntersectionObserver = NonTriggeringObserver
  window.IntersectionObserver = NonTriggeringObserver

  try {
    render(<AnimatedNumber value={128} />)
    // With canObserve=true and inView=false, effect returns without setting display
    // So it stays at initial 0 (CORRECT - no flash to 128)
    expect(screen.getByText('0')).toBeInTheDocument()
    // Should NOT show final value while not in view
    expect(screen.queryByText('128')).not.toBeInTheDocument()
  } finally {
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
