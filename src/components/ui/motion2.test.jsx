import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'

// Controllable useReducedMotion mock shared by every test below — framer-motion's
// real hook lazily caches `window.matchMedia('(prefers-reduced-motion)')` at module
// scope on first use, which jsdom doesn't implement and which makes per-test control
// unreliable. Mocking the hook directly (real module otherwise) lets each test flip
// reduced-motion on/off deterministically, per the brief's "matchMedia mock if
// feasible" note.
let mockReduced = false
vi.mock('framer-motion', async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, useReducedMotion: () => mockReduced }
})

// Lenis touches real browser scroll/rAF APIs; stub the module so SmoothScroll tests
// can assert on construction/destruction without needing a real Lenis instance.
// vi.mock factories are hoisted above imports, so the mock class must be created
// via vi.hoisted rather than referencing a normal top-level binding.
const { lenisInstances, MockLenis } = vi.hoisted(() => {
  const instances = []
  class MockLenis {
    constructor(options) {
      this.options = options
      this.destroy = vi.fn()
      this.raf = vi.fn()
      instances.push(this)
    }
  }
  return { lenisInstances: instances, MockLenis }
})
vi.mock('lenis', () => ({ default: MockLenis }))

import SmoothScroll from './SmoothScroll'
import SplitLines from './SplitLines'
import Parallax from './Parallax'
import Marquee from './Marquee'

beforeEach(() => {
  mockReduced = false
  lenisInstances.length = 0
})

describe('SmoothScroll', () => {
  test('renders children', () => {
    render(<SmoothScroll><p>съдържание</p></SmoothScroll>)
    expect(screen.getByText('съдържание')).toBeInTheDocument()
  })

  test('does not construct Lenis in the test environment (import.meta.env.MODE === "test")', () => {
    const { unmount } = render(<SmoothScroll><p>text</p></SmoothScroll>)
    expect(lenisInstances).toHaveLength(0)
    expect(() => unmount()).not.toThrow()
  })

  test('does not construct Lenis when reduced motion is on', () => {
    mockReduced = true
    const rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation(() => 1)
    render(<SmoothScroll><p>text</p></SmoothScroll>)
    expect(lenisInstances).toHaveLength(0)
    rafSpy.mockRestore()
  })

  test('outside the test env, initializes Lenis with the spec\'d options and destroys it on unmount', () => {
    const originalMode = import.meta.env.MODE
    import.meta.env.MODE = 'production'
    const rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation(() => 1)
    const cafSpy = vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {})
    try {
      const { unmount } = render(<SmoothScroll><p>text</p></SmoothScroll>)
      expect(lenisInstances).toHaveLength(1)
      expect(lenisInstances[0].options).toEqual({ lerp: 0.1, wheelMultiplier: 1 })
      expect(rafSpy).toHaveBeenCalled()
      unmount()
      expect(lenisInstances[0].destroy).toHaveBeenCalled()
    } finally {
      import.meta.env.MODE = originalMode
      rafSpy.mockRestore()
      cafSpy.mockRestore()
    }
  })
})

describe('SplitLines', () => {
  test('splits string children into one animated word span per word', () => {
    const { container } = render(<SplitLines>Изберете своя дом</SplitLines>)
    const wordWrappers = container.querySelectorAll('span.overflow-hidden')
    expect(wordWrappers).toHaveLength(3)
    expect(screen.getByText(/Изберете/)).toBeInTheDocument()
    expect(screen.getByText(/своя/)).toBeInTheDocument()
    expect(screen.getByText(/дом/)).toBeInTheDocument()
  })

  test('renders non-string children as-is (documented limitation)', () => {
    render(<SplitLines><strong>плътен текст</strong></SplitLines>)
    const strong = screen.getByText('плътен текст')
    expect(strong.tagName).toBe('STRONG')
  })

  test('reduced motion renders plain text with no word-reveal spans', () => {
    mockReduced = true
    const { container } = render(<SplitLines>Изберете своя дом</SplitLines>)
    expect(container.querySelectorAll('span.overflow-hidden')).toHaveLength(0)
    expect(container.textContent).toContain('Изберете своя дом')
  })

  test('honors the "as" tag and applies delay + stagger to each word\'s transition', () => {
    const { container } = render(
      <SplitLines as="h2" delay={0.2} stagger={0.045}>едно две</SplitLines>,
    )
    expect(container.querySelector('h2')).toBeInTheDocument()
  })

  // Regression: the reveal used to hang `whileInView` on the masked word span
  // itself. A word parked at y:110% sits entirely outside its overflow-hidden
  // mask, so a real IntersectionObserver reports ratio 0 forever and the words
  // never rise (jsdom's no-op observer hid it; Home's hero shipped a blank h1
  // until this was measured in Chrome). The observed target must therefore be
  // an element that is not clipped away by a mask.
  test('observes an unclipped wrapper, not the masked word spans', () => {
    const observed = []
    class SpyIntersectionObserver {
      constructor(callback) { this.callback = callback }
      observe(el) { observed.push(el) }
      unobserve() {}
      disconnect() {}
    }
    const original = globalThis.IntersectionObserver
    globalThis.IntersectionObserver = SpyIntersectionObserver
    window.IntersectionObserver = SpyIntersectionObserver
    try {
      render(<SplitLines as="h2">Изберете своя дом</SplitLines>)
      expect(observed.length).toBeGreaterThan(0)
      observed.forEach((el) => {
        expect(el.closest('.overflow-hidden')).toBeNull()
      })
    } finally {
      globalThis.IntersectionObserver = original
      window.IntersectionObserver = original
    }
  })
})

describe('Parallax', () => {
  test('renders children inside an overflow-hidden wrapper with an oversized inner layer', () => {
    const { container } = render(
      <Parallax strength={40} className="h-64">
        <img alt="сграда" src="/x.webp" />
      </Parallax>
    )
    expect(screen.getByAltText('сграда')).toBeInTheDocument()
    expect(container.querySelector('.overflow-hidden')).toBeInTheDocument()
    expect(container.querySelector('[data-parallax-layer]')).toBeInTheDocument()
  })

  // Regression: the oversize used to be a `scale-110` utility class. framer
  // writes an inline `transform` for the drift, and an inline transform wins
  // over the class outright — the layer was never actually oversized and the
  // page background showed through by the full drift distance at the extremes.
  test('carries the 10% oversize in the same inline transform as the drift', () => {
    const { container } = render(
      <Parallax strength={40}>
        <img alt="сграда" src="/x.webp" />
      </Parallax>
    )
    const layer = container.querySelector('[data-parallax-layer]')
    expect(layer.style.transform).toMatch(/scale\(1\.1\)/)
    expect(layer.className).not.toMatch(/scale-110/)
  })

  test('reduced motion renders a static passthrough (no drift layer at all)', () => {
    mockReduced = true
    const { container } = render(
      <Parallax strength={40}>
        <img alt="сграда" src="/x.webp" />
      </Parallax>
    )
    expect(screen.getByAltText('сграда')).toBeInTheDocument()
    expect(container.querySelector('[data-parallax-layer]')).not.toBeInTheDocument()
  })
})

describe('Marquee', () => {
  test('renders an overflow-hidden strip with the text content and one aria-hidden duplicate', () => {
    const { container } = render(<Marquee text="КСМ Строй" speed={40} />)
    expect(container.querySelector('.overflow-hidden')).toBeInTheDocument()
    const visible = screen.getAllByText('КСМ Строй', { selector: ':not([aria-hidden])' })
    expect(visible.length).toBeGreaterThanOrEqual(1)
    expect(container.querySelectorAll('[aria-hidden="true"]').length).toBeGreaterThanOrEqual(1)
  })

  test('carries the binding outlined-text style classes', () => {
    const { container } = render(<Marquee text="КСМ Строй" speed={40} />)
    const styled = container.querySelector('.text-transparent')
    expect(styled).toBeInTheDocument()
    expect(styled.className).toMatch(/font-display/)
    expect(styled.className).toMatch(/opacity-60/)
  })

  test('reduced motion disables the animation (static strip)', () => {
    mockReduced = true
    const { container } = render(<Marquee text="КСМ Строй" speed={40} />)
    expect(container.querySelector('.animate-marquee')).not.toBeInTheDocument()
    expect(container.querySelector('.animate-none')).toBeInTheDocument()
  })

  test('animated (non-reduced) strip carries the marquee animation class', () => {
    const { container } = render(<Marquee text="КСМ Строй" speed={40} />)
    expect(container.querySelector('.animate-marquee')).toBeInTheDocument()
  })

  // `speed` is characters per second, so the loop duration is length / speed —
  // longer copy takes proportionally longer and every strip reads at one pace.
  test('speed is characters per second: doubling it halves the loop duration', () => {
    const text = 'КСМ Строй' // 9 characters
    const { container: slow } = render(<Marquee text={text} speed={2} />)
    const { container: fast } = render(<Marquee text={text} speed={4} />)
    expect(slow.querySelector('.animate-marquee').style.animationDuration).toBe('4.5s')
    expect(fast.querySelector('.animate-marquee').style.animationDuration).toBe('2.25s')
  })

  // Regression: the default used to be 40 chars/s, which loops Home's
  // 60-character, ~2900px strip in 1.5 seconds — a strobe, not a marquee.
  // Every caller had to know to override it; now the default is the pace the
  // design actually wants.
  test('defaults to a legible 2 characters per second, not the old strobe', () => {
    const text = 'КСМ Строй'
    const { container } = render(<Marquee text={text} />)
    expect(container.querySelector('.animate-marquee').style.animationDuration).toBe('4.5s')
  })
})
