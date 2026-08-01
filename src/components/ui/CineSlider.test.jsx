import { render, screen, act, fireEvent, within } from '@testing-library/react'
import { vi } from 'vitest'

// Controllable useReducedMotion mock (see motion2.test.jsx for the rationale:
// framer-motion's real hook lazily caches a matchMedia read jsdom doesn't
// implement, so mocking the hook directly is the deterministic per-test knob).
let mockReduced = false
vi.mock('framer-motion', async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, useReducedMotion: () => mockReduced }
})

// Spy on `new Image()` (used by the next-slide preloader) without touching
// real network/decoding — jsdom's Image already no-ops network loads, but a
// plain spy class lets tests assert exactly which src/srcset got assigned.
const { imageInstances, MockImage } = vi.hoisted(() => {
  const instances = []
  class MockImage {
    constructor() {
      instances.push(this)
    }
  }
  return { imageInstances: instances, MockImage }
})

import CineSlider from './CineSlider'

const SLIDES = [
  { src: '/a.webp', srcSet: '/a-640.webp 640w', sizes: '100vw', alt: 'Слайд едно', caption: 'Първи надпис', sub: 'Първи подтекст' },
  { src: '/b.webp', alt: 'Слайд две', caption: 'Втори надпис' },
  { src: '/c.webp', alt: 'Слайд три' },
]

beforeEach(() => {
  mockReduced = false
  imageInstances.length = 0
  vi.stubGlobal('Image', MockImage)
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
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

  // top-24, not top-8: the site's h-16 fixed navbar floats over the hero and
  // the caption printed straight through the nav links at top-8.
  const { container: tr } = render(<CineSlider slides={SLIDES} interval={1000} captionPosition="top-right" />)
  const trCaption = tr.querySelector('.top-24.right-6')
  expect(trCaption).toBeInTheDocument()
  expect(tr.querySelector('.top-8')).not.toBeInTheDocument()

  // The bottom-up scrim does not reach a top-parked caption, so the caption
  // block carries its own shadow at either position.
  expect(blCaption.className).toMatch(/text-shadow/)
  expect(trCaption.className).toMatch(/text-shadow/)
})

// Regression: a bright sky/facade slide (e.g. Home's slide 1) measured
// 1.05:1 contrast against a bare top-parked caption — the bottom-up scrim
// never reaches the top of the frame. Top positions get a dedicated
// top-down scrim and a stronger sub-line opacity; bottom positions are
// already covered by the bottom-up scrim and keep the lighter sub.
test('top-positioned captions get an extra top-down scrim and a stronger sub opacity; bottom does not', () => {
  const { container: bl } = render(<CineSlider slides={SLIDES} interval={1000} captionPosition="bottom-left" />)
  expect(bl.querySelector('[data-top-scrim]')).not.toBeInTheDocument()
  const blSub = within(bl).getByText('Първи подтекст')
  expect(blSub.className).toMatch(/text-plaster\/60/)
  expect(blSub.className).not.toMatch(/text-plaster\/80/)

  const { container: tr } = render(<CineSlider slides={SLIDES} interval={1000} captionPosition="top-right" />)
  expect(tr.querySelector('[data-top-scrim]')).toBeInTheDocument()
  const trSub = within(tr).getByText('Първи подтекст')
  expect(trSub.className).toMatch(/text-plaster\/80/)
  expect(trSub.className).not.toMatch(/text-plaster\/60/)
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

// Regression: the reduced-motion prev/next wrapper is an `absolute inset-0`
// div that paints ABOVE the {children} overlay in DOM order. Without
// pointer-events-none on that wrapper itself (only the buttons had it), the
// full-bleed wrapper swallowed clicks anywhere over the overlay layer except
// the two 44px button hitboxes — e.g. Task 3's hero CTA sitting under it.
test('reduced-motion nav-button wrapper does not swallow clicks meant for overlay children', () => {
  mockReduced = true
  const onCtaClick = vi.fn()
  const { container } = render(
    <CineSlider slides={SLIDES} interval={1000} overlayClassName="flex items-center justify-center">
      <button type="button" onClick={onCtaClick}>Разгледайте</button>
    </CineSlider>
  )

  const navWrapper = screen.getByRole('button', { name: /следващ/i }).parentElement
  expect(navWrapper.className).toMatch(/pointer-events-none/)
  // The buttons themselves must still opt back in individually.
  expect(screen.getByRole('button', { name: /следващ/i }).className).toMatch(/pointer-events-auto/)
  expect(screen.getByRole('button', { name: /предишен/i }).className).toMatch(/pointer-events-auto/)

  fireEvent.click(screen.getByRole('button', { name: 'Разгледайте' }))
  expect(onCtaClick).toHaveBeenCalledTimes(1)
  expect(container).toBeTruthy()
})

test('preloads the next slide image on mount so the crossfade never animates over a blank download', () => {
  render(<CineSlider slides={SLIDES} interval={1000} />)
  // Mounted on slide 1 (index 0); the preloader should warm slide 2 (index 1).
  expect(imageInstances).toHaveLength(1)
  expect(imageInstances[0].src).toBe(SLIDES[1].src)
})

test('warms the following slide again after each advance', () => {
  vi.useFakeTimers()
  render(<CineSlider slides={SLIDES} interval={1000} />)
  expect(imageInstances.some((img) => img.src === SLIDES[1].src)).toBe(true)

  act(() => {
    vi.advanceTimersByTime(1000)
  })
  // Now on slide 2 (index 1); the preloader should warm slide 3 (index 2).
  expect(imageInstances.some((img) => img.src === SLIDES[2].src)).toBe(true)
})

test('preload assigns srcset when the upcoming slide has one', () => {
  mockReduced = true
  render(<CineSlider slides={SLIDES} interval={1000} />)
  // Jump to the last slide (index 2); the preloader wraps to slide 1 (index 0),
  // which is the only fixture slide carrying a srcSet.
  fireEvent.click(screen.getByRole('button', { name: /следващ/i }))
  fireEvent.click(screen.getByRole('button', { name: /следващ/i }))

  const warmed = imageInstances.find((img) => img.src === SLIDES[0].src)
  expect(warmed).toBeDefined()
  expect(warmed.srcset).toBe(SLIDES[0].srcSet)
})

test('does not attempt to preload when there is only a single slide', () => {
  render(<CineSlider slides={[SLIDES[0]]} interval={1000} />)
  expect(imageInstances).toHaveLength(0)
})
