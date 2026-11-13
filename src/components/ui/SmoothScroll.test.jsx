import { useLayoutEffect } from 'react'
import { act, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom'
import { vi } from 'vitest'
import useScrollLock from '../../hooks/useScrollLock'
import { LENIS_OPTIONS } from '../../utils/smoothScroll'

// From golden-residence src/components/ui/SmoothScroll.test.jsx @944bb03,
// rendered inside a router, plus the route change (redesign v1 c141d57).
//
// SmoothScroll refuses to touch Lenis when `import.meta.env.MODE === 'test'`,
// which is exactly the branch these tests need to exercise. `vi.stubEnv`
// rewrites `import.meta.env` for the duration of the test, so the real init
// path runs here — against a mocked Lenis, since the library needs real scroll
// physics jsdom does not have, and a mocked GSAP ticker and ScrollTrigger, so
// a test can see what Lenis is wired to without a running ticker.
const mocks = vi.hoisted(() => ({
  instances: [],
  reduce: false,
  ticker: { add: vi.fn(), remove: vi.fn(), lagSmoothing: vi.fn() },
  update: vi.fn(),
  refresh: vi.fn(),
}))

vi.mock('lenis', () => ({
  default: class MockLenis {
    constructor(options) {
      this.options = options
      // Mirrors the real shape: `dimensions` is a public readonly property
      // (lenis.d.ts) whose `resize()` re-measures without touching scroll
      // state; `resize()` on the instance additionally snaps the animation.
      this.dimensions = { resize: vi.fn() }
      this.raf = vi.fn()
      this.on = vi.fn()
      this.destroy = vi.fn()
      // Where the window is, and where Lenis is headed (a glide in between).
      this.scroll = 0
      this.targetScroll = 0
      this.resize = vi.fn(() => { this.targetScroll = this.scroll })
      // Lenis 1.3 ignores scrollTo while it is stopped, unless it is forced,
      // and skips a jump to the target it already has.
      this.isStopped = false
      this.stop = vi.fn(() => { this.isStopped = true })
      this.start = vi.fn(() => { this.isStopped = false })
      this.scrollTo = vi.fn((target, { force = false } = {}) => {
        if (this.isStopped && !force) return
        if (target === this.targetScroll) return
        this.targetScroll = target
        this.scroll = target
      })
      mocks.instances.push(this)
    }
  },
}))

vi.mock('../../hooks/useMotionAllowed', () => ({ default: () => !mocks.reduce }))

vi.mock('../../utils/gsap', () => ({
  gsap: { ticker: mocks.ticker },
  ScrollTrigger: { update: mocks.update, refresh: mocks.refresh },
}))

import SmoothScroll from './SmoothScroll'

// jsdom has no ResizeObserver. This stub records what was observed and hands
// the callback back so a test can fire it the way a growing page would.
let observers = []
class MockResizeObserver {
  constructor(callback) {
    this.callback = callback
    this.observed = []
    this.disconnected = false
    observers.push(this)
  }
  observe(el) {
    this.observed.push(el)
  }
  unobserve() {}
  disconnect() {
    this.disconnected = true
  }
  // Fire the callback the way the browser would when the box grew. A real
  // observer delivers nothing once disconnected, so neither does this one.
  fire() {
    if (this.disconnected) return
    this.callback([{ target: this.observed[0] }], this)
  }
}

// The observer callback is rAF-throttled, so hold the frames by hand.
// Cancelling really removes the frame, so "was the pending one cancelled?" is
// testable.
let frames = new Map()
let nextFrameId = 0

// vi.unstubAllEnvs() would also undo the blank sheet URLs of
// src/test/setup.js, so MODE is put back by hand.
const MODE = import.meta.env.MODE

beforeEach(() => {
  vi.stubEnv('MODE', 'production')
  mocks.instances = []
  mocks.reduce = false
  vi.clearAllMocks()
  observers = []
  frames = new Map()
  nextFrameId = 0
  vi.stubGlobal('ResizeObserver', MockResizeObserver)
  vi.stubGlobal('requestAnimationFrame', (cb) => {
    const id = ++nextFrameId
    frames.set(id, cb)
    return id
  })
  vi.stubGlobal('cancelAnimationFrame', (id) => frames.delete(id))
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
})

afterEach(() => {
  vi.stubEnv('MODE', MODE)
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

// Runs only the frames queued so far.
function flushFrames() {
  const queued = [...frames.values()]
  frames = new Map()
  queued.forEach((cb) => cb(0))
}

function renderScroll() {
  return render(
    <MemoryRouter>
      <SmoothScroll>
        <div data-testid="child">page</div>
      </SmoothScroll>
    </MemoryRouter>
  )
}

test('creates Lenis without its own rAF loop and drives it from the GSAP ticker', () => {
  renderScroll()
  const lenis = mocks.instances[0]

  // The settings and the pinch filter are src/utils/smoothScroll.js's.
  expect(lenis.options).toEqual({ ...LENIS_OPTIONS, virtualScroll: expect.any(Function) })
  expect(mocks.ticker.lagSmoothing).toHaveBeenCalledWith(0)
  const tick = mocks.ticker.add.mock.calls[0][0]
  // The ticker counts in seconds, Lenis in milliseconds.
  tick(1.5)
  expect(lenis.raf).toHaveBeenCalledWith(1500)
})

test('forwards every Lenis scroll to ScrollTrigger', () => {
  renderScroll()
  expect(mocks.instances[0].on).toHaveBeenCalledWith('scroll', mocks.update)
})

test('marks the document while Lenis runs', () => {
  const { unmount } = renderScroll()
  expect(document.documentElement.dataset.motion).toBe('on')
  unmount()
  expect(document.documentElement.dataset.motion).toBeUndefined()
})

test('observes an element that grows with the page, not the pinned document element', () => {
  renderScroll()

  expect(observers).toHaveLength(1)
  const observed = observers[0].observed[0]
  expect(observed).toBeTruthy()
  // html/body/#root are all pinned at height:100%, so their boxes never grow
  // and an observer on them fires exactly once. The observed element has to be
  // one that wraps the page content instead.
  expect(observed).not.toBe(document.documentElement)
  expect(observed).not.toBe(document.body)
  expect(observed.id).not.toBe('root')
  expect(observed.contains(screen.getByTestId('child'))).toBe(true)
})

test('re-measures Lenis and refreshes ScrollTrigger when the observed content grows', () => {
  renderScroll()
  const lenis = mocks.instances[0]
  const before = lenis.dimensions.resize.mock.calls.length

  observers[0].fire()
  flushFrames()

  expect(lenis.dimensions.resize.mock.calls.length).toBeGreaterThan(before)
  expect(mocks.refresh).toHaveBeenCalledTimes(1)
})

test('falls back to lenis.resize() when the instance exposes no dimensions', () => {
  renderScroll()
  const lenis = mocks.instances[0]
  lenis.dimensions = undefined

  observers[0].fire()
  flushFrames()

  expect(lenis.resize).toHaveBeenCalled()
})

test('coalesces a burst of observer callbacks into a single re-measure and refresh', () => {
  renderScroll()
  const lenis = mocks.instances[0]
  lenis.dimensions.resize.mockClear()

  observers[0].fire()
  observers[0].fire()
  observers[0].fire()
  flushFrames()

  expect(lenis.dimensions.resize).toHaveBeenCalledTimes(1)
  expect(mocks.refresh).toHaveBeenCalledTimes(1)
})

test('disconnects the observer, leaves the ticker and destroys Lenis on unmount', () => {
  const { unmount } = renderScroll()
  const lenis = mocks.instances[0]
  const tick = mocks.ticker.add.mock.calls[0][0]

  unmount()

  expect(observers[0].disconnected).toBe(true)
  expect(mocks.ticker.remove).toHaveBeenCalledWith(tick)
  expect(mocks.ticker.lagSmoothing).toHaveBeenLastCalledWith(500, 33)
  expect(lenis.destroy).toHaveBeenCalled()
})

test('a re-measure still queued at unmount never reaches the destroyed instance', () => {
  const { unmount } = renderScroll()
  const lenis = mocks.instances[0]

  observers[0].fire() // queues a frame
  lenis.dimensions.resize.mockClear()
  unmount()
  flushFrames()

  expect(lenis.dimensions.resize).not.toHaveBeenCalled()
  expect(mocks.refresh).not.toHaveBeenCalled()
})

test('under reduced motion Lenis never starts and nothing is observed', () => {
  mocks.reduce = true
  renderScroll()

  expect(mocks.instances).toHaveLength(0)
  expect(observers).toHaveLength(0)
  expect(mocks.ticker.add).not.toHaveBeenCalled()
  expect(document.documentElement.dataset.motion).toBeUndefined()
  // Children still render — the wrapper is unconditional so the DOM shape does
  // not change between the smooth and the native-scroll paths.
  expect(screen.getByTestId('child')).toBeInTheDocument()
})

test('does not construct Lenis in the test environment (import.meta.env.MODE === "test")', () => {
  vi.stubEnv('MODE', 'test')
  const { unmount } = renderScroll()
  expect(mocks.instances).toHaveLength(0)
  expect(() => unmount()).not.toThrow()
})

describe('a route change', () => {
  // What happened, in order: the jump, each page's layout effects (where
  // useGSAP creates its triggers) and the refresh.
  let log = []
  let navigate

  function Navigator() {
    navigate = useNavigate()
    return null
  }

  function Page({ name }) {
    useLayoutEffect(() => {
      log.push(`mount ${name}`)
    }, [name])
    return <p>{name}</p>
  }

  // A page holding a scroll lock, as a modal over it would.
  function LockedPage() {
    useScrollLock()
    return <p>locked</p>
  }

  function renderApp(path = '/') {
    return render(
      <MemoryRouter initialEntries={[path]}>
        <Navigator />
        <SmoothScroll>
          <Routes>
            <Route path="/" element={<Page name="home" />} />
            <Route path="/about" element={<Page name="about" />} />
            <Route path="/contact" element={<Page name="contact" />} />
            <Route path="/locked" element={<LockedPage />} />
          </Routes>
        </SmoothScroll>
      </MemoryRouter>
    )
  }

  const go = (to) => act(() => navigate(to))

  beforeEach(() => {
    log = []
    mocks.refresh.mockImplementation(() => log.push('refresh'))
  })

  afterEach(() => {
    mocks.refresh.mockReset()
  })

  test('jumps to the top through Lenis at once, cancelling a glide, and never through the window', () => {
    renderApp('/')
    const lenis = mocks.instances[0]
    // Gliding down, at 1800 on the way to 2582.
    lenis.scroll = 1800
    lenis.targetScroll = 2582

    go('/about')

    expect(lenis.scrollTo).toHaveBeenCalledTimes(1)
    expect(lenis.scrollTo).toHaveBeenCalledWith(0, { immediate: true, force: true })
    expect(lenis.scroll).toBe(0)
    // Issuing both would let the Lenis loop fight the native scroll.
    expect(window.scrollTo).not.toHaveBeenCalled()
  })

  // A fling gliding up to the top, or a stale target after the browser
  // restored a position on Back: Lenis' target is already 0, the page is not.
  test('jumps even when Lenis is already headed for the top', () => {
    renderApp('/')
    const lenis = mocks.instances[0]
    lenis.scroll = 600
    lenis.targetScroll = 0

    go('/about')

    expect(lenis.resize.mock.invocationCallOrder[0]).toBeLessThan(lenis.scrollTo.mock.invocationCallOrder[0])
    expect(lenis.scroll).toBe(0)
  })

  test('jumps before the new page\'s layout effects run, and refreshes ScrollTrigger after them', () => {
    renderApp('/')
    const lenis = mocks.instances[0]
    lenis.scrollTo.mockImplementation(() => log.push('top'))
    log = []

    go('/about')

    expect(log).toEqual(['top', 'mount about', 'refresh'])
  })

  test('the first page keeps the position the browser gave it', () => {
    renderApp('/about')
    expect(mocks.instances[0].scrollTo).not.toHaveBeenCalled()
    expect(window.scrollTo).not.toHaveBeenCalled()
    expect(mocks.refresh).not.toHaveBeenCalled()
  })

  test('each new page jumps and refreshes once; a new query or hash on the same page does neither', () => {
    renderApp('/')
    const lenis = mocks.instances[0]

    go('/about')
    go('/about?tab=team')
    go('/about#team')
    go('/contact')
    go('/')

    expect(lenis.scrollTo).toHaveBeenCalledTimes(3)
    expect(mocks.refresh).toHaveBeenCalledTimes(3)
  })

  // The lock is released in a passive effect, after the jump: unforced, Lenis
  // would ignore the jump and the new page would open where the old one was.
  test('reaches a Lenis stopped by a scroll lock on the page being left', () => {
    renderApp('/')
    const lenis = mocks.instances[0]
    go('/locked')
    expect(lenis.isStopped).toBe(true)
    lenis.scroll = 1400

    go('/contact')

    expect(lenis.scroll).toBe(0)
    expect(lenis.start).toHaveBeenCalledTimes(1)
    expect(lenis.start.mock.invocationCallOrder[0]).toBeGreaterThan(lenis.scrollTo.mock.invocationCallOrder.at(-1))
  })

  // index.css gives <html> scroll-behavior: smooth, which a plain
  // window.scrollTo(0, 0) would follow.
  test('without Lenis the window jumps, instantly, and nothing is refreshed without motion', () => {
    mocks.reduce = true
    renderApp('/')

    go('/contact')

    expect(window.scrollTo).toHaveBeenCalledTimes(1)
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'instant' })
    expect(mocks.refresh).not.toHaveBeenCalled()
  })

  test('with motion but no Lenis (the test environment) the window jumps and ScrollTrigger refreshes', () => {
    vi.stubEnv('MODE', 'test')
    renderApp('/')
    log = []

    go('/about')

    expect(mocks.instances).toHaveLength(0)
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'instant' })
    expect(log).toEqual(['mount about', 'refresh'])
  })

  test('once Lenis has stopped for good, the window takes the jump', () => {
    const { rerender } = renderApp('/')
    const lenis = mocks.instances[0]
    // Reduced motion switched on while the page is open.
    mocks.reduce = true
    rerender(
      <MemoryRouter initialEntries={['/']}>
        <Navigator />
        <SmoothScroll>
          <Routes>
            <Route path="/" element={<Page name="home" />} />
            <Route path="/about" element={<Page name="about" />} />
          </Routes>
        </SmoothScroll>
      </MemoryRouter>
    )
    expect(lenis.destroy).toHaveBeenCalled()

    go('/about')

    expect(lenis.scrollTo).not.toHaveBeenCalled()
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'instant' })
  })
})
