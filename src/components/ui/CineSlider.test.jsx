import { render, screen, act, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'

// Controllable useReducedMotion mock (see motion2.test.jsx for the rationale:
// framer-motion's real hook lazily caches a matchMedia read jsdom doesn't
// implement, so mocking the hook directly is the deterministic per-test knob).
let mockReduced = false
vi.mock('framer-motion', async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, useReducedMotion: () => mockReduced }
})

import CineSlider from './CineSlider'

const SLIDES = [
  { src: '/a.webp', srcSet: '/a-640.webp 640w', sizes: '100vw', alt: 'Слайд едно', caption: 'Първи надпис', sub: 'Първи подтекст' },
  { src: '/b.webp', alt: 'Слайд две', caption: 'Втори надпис' },
  { src: '/c.webp', alt: 'Слайд три' },
]

beforeEach(() => {
  mockReduced = false
})

afterEach(() => {
  vi.useRealTimers()
})

test('renders the first slide with eager loading and the 1-of-n index chrome', () => {
  render(<CineSlider slides={SLIDES} interval={1000} />)
  const img = screen.getByAltText('Слайд едно')
  expect(img).toBeInTheDocument()
  expect(img.getAttribute('loading')).toBe('eager')
  expect(screen.getByText('01 — 03')).toBeInTheDocument()
  expect(screen.getByText('Първи надпис')).toBeInTheDocument()
  expect(screen.getByText('Първи подтекст')).toBeInTheDocument()
})

test('autoplay advances to the next slide when the interval elapses (fake timers)', () => {
  vi.useFakeTimers()
  render(<CineSlider slides={SLIDES} interval={1000} />)
  act(() => {
    vi.advanceTimersByTime(1000)
  })
  expect(screen.getByAltText('Слайд две')).toBeInTheDocument()
  expect(screen.getByText('Втори надпис')).toBeInTheDocument()
})

test('autoplay pauses while the tab is hidden and resumes once visible again', () => {
  vi.useFakeTimers()
  const hiddenSpy = vi.spyOn(document, 'hidden', 'get').mockReturnValue(true)
  render(<CineSlider slides={SLIDES} interval={1000} />)
  act(() => {
    vi.advanceTimersByTime(3000)
  })
  // Still on slide 1: every tick saw document.hidden === true
  expect(screen.getByAltText('Слайд едно')).toBeInTheDocument()

  hiddenSpy.mockReturnValue(false)
  act(() => {
    vi.advanceTimersByTime(1000)
  })
  expect(screen.getByAltText('Слайд две')).toBeInTheDocument()
  hiddenSpy.mockRestore()
})

test('the gold progress line remounts (new DOM node) on every slide change, keyed by index', () => {
  vi.useFakeTimers()
  const { container } = render(<CineSlider slides={SLIDES} interval={1000} />)
  const barBefore = container.querySelector('.bg-gold-accent')
  expect(barBefore).toBeInTheDocument()
  act(() => {
    vi.advanceTimersByTime(1000)
  })
  const barAfter = container.querySelector('.bg-gold-accent')
  expect(barAfter).toBeInTheDocument()
  expect(barAfter).not.toBe(barBefore)
})

test('clears its interval on unmount without throwing', () => {
  vi.useFakeTimers()
  const { unmount } = render(<CineSlider slides={SLIDES} interval={1000} />)
  unmount()
  expect(() => {
    act(() => {
      vi.advanceTimersByTime(5000)
    })
  }).not.toThrow()
})

test('reduced motion disables autoplay and renders reachable prev/next buttons instead', () => {
  mockReduced = true
  vi.useFakeTimers()
  render(<CineSlider slides={SLIDES} interval={1000} />)
  act(() => {
    vi.advanceTimersByTime(5000)
  })
  // No autoplay: still slide 1 after many intervals worth of time.
  expect(screen.getByAltText('Слайд едно')).toBeInTheDocument()

  const prev = screen.getByRole('button', { name: /предишен/i })
  const next = screen.getByRole('button', { name: /следващ/i })
  expect(prev).toBeInTheDocument()
  expect(next).toBeInTheDocument()
})

test('reduced motion prev/next buttons navigate between slides', () => {
  mockReduced = true
  render(<CineSlider slides={SLIDES} interval={1000} />)
  const next = screen.getByRole('button', { name: /следващ/i })
  fireEvent.click(next)
  expect(screen.getByAltText('Слайд две')).toBeInTheDocument()

  const prev = screen.getByRole('button', { name: /предишен/i })
  fireEvent.click(prev)
  expect(screen.getByAltText('Слайд едно')).toBeInTheDocument()
})

test('non-reduced motion renders no prev/next buttons', () => {
  render(<CineSlider slides={SLIDES} interval={1000} />)
  expect(screen.queryByRole('button')).not.toBeInTheDocument()
})

test('captionPosition defaults to bottom-left and can be switched to top-right', () => {
  const { container: bl } = render(<CineSlider slides={SLIDES} interval={1000} />)
  const blCaption = bl.querySelector('.bottom-8.left-6')
  expect(blCaption).toBeInTheDocument()

  const { container: tr } = render(<CineSlider slides={SLIDES} interval={1000} captionPosition="top-right" />)
  const trCaption = tr.querySelector('.top-8.right-6')
  expect(trCaption).toBeInTheDocument()
})

test('only the first slide loads eagerly; subsequent slides are lazy', () => {
  vi.useFakeTimers()
  render(<CineSlider slides={SLIDES} interval={1000} />)
  expect(screen.getByAltText('Слайд едно').getAttribute('loading')).toBe('eager')

  act(() => {
    vi.advanceTimersByTime(1000)
  })
  expect(screen.getByAltText('Слайд две').getAttribute('loading')).toBe('lazy')

  act(() => {
    vi.advanceTimersByTime(1000)
  })
  expect(screen.getByAltText('Слайд три').getAttribute('loading')).toBe('lazy')
})

test('slides without a caption render no caption block', () => {
  // Reduced motion renders the caption via a plain synchronous conditional
  // (no AnimatePresence exit animation to wait out), so navigating to the
  // captionless slide 3 is a deterministic way to assert the `slide.caption`
  // guard without depending on framer-motion's own animation-driven unmount
  // timing settling under fake timers.
  mockReduced = true
  render(<CineSlider slides={SLIDES} interval={1000} />)
  const next = screen.getByRole('button', { name: /следващ/i })
  fireEvent.click(next)
  fireEvent.click(next)
  // Slide 3 (index 2) has no caption/sub in the fixture.
  expect(screen.getByAltText('Слайд три')).toBeInTheDocument()
  expect(screen.queryByText('Първи надпис')).not.toBeInTheDocument()
  expect(screen.queryByText('Втори надпис')).not.toBeInTheDocument()
})

test('renders overlay children above the chrome, positioned via overlayClassName', () => {
  const { container } = render(
    <CineSlider slides={SLIDES} interval={1000} overlayClassName="flex items-end p-10">
      <h1>Headline</h1>
    </CineSlider>
  )
  expect(screen.getByText('Headline')).toBeInTheDocument()
  const overlay = container.querySelector('.flex.items-end.p-10')
  expect(overlay).toBeInTheDocument()
  expect(overlay).toHaveTextContent('Headline')
})

test('root fills its parent and chrome (excluding buttons) is pointer-events-none', () => {
  const { container } = render(<CineSlider slides={SLIDES} interval={1000} className="h-[80vh]" />)
  const root = container.firstChild
  expect(root.className).toMatch(/relative/)
  expect(root.className).toMatch(/h-full/)
  expect(root.className).toMatch(/w-full/)
  expect(root.className).toMatch(/overflow-hidden/)
  expect(root.className).toMatch(/h-\[80vh\]/)
  expect(container.querySelectorAll('.pointer-events-none').length).toBeGreaterThan(0)
})
