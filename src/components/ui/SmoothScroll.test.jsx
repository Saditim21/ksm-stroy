import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'

// SmoothScroll refuses to touch Lenis when `import.meta.env.MODE === 'test'`,
// which is exactly the branch these tests need to exercise. `vi.stubEnv`
// rewrites `import.meta.env` for the duration of the test, so the real init
// path runs here — against a mocked Lenis, since the library needs real scroll
// physics jsdom does not have.
const mocks = vi.hoisted(() => ({
  instances: [],
  reduce: false,
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
      this.resize = vi.fn()
      this.destroy = vi.fn()
      mocks.instances.push(this)
    }
  },
}))

vi.mock('framer-motion', async (importOriginal) => ({
  ...(await importOriginal()),
  useReducedMotion: () => mocks.reduce,
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

// The rAF loop that drives Lenis would spin forever under jsdom, and the
// observer callback is rAF-throttled — so hold the frames by hand. Cancelling
// really removes the frame, so "was the pending one cancelled?" is testable.
let frames = new Map()
let nextFrameId = 0

beforeEach(() => {
  vi.stubEnv('MODE', 'production')
  mocks.instances = []
  mocks.reduce = false
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
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

// Runs only the frames queued so far — the Lenis loop re-queues itself, so
// draining until empty would never terminate.
function flushFrames() {
  const queued = [...frames.values()]
  frames = new Map()
  queued.forEach((cb) => cb(0))
}

function renderScroll() {
  return render(
    <SmoothScroll>
      <div data-testid="child">page</div>
    </SmoothScroll>
  )
}

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

test('re-measures Lenis when the observed content grows', () => {
  renderScroll()
  const lenis = mocks.instances[0]
  const before = lenis.dimensions.resize.mock.calls.length

  observers[0].fire()
  flushFrames()

  expect(lenis.dimensions.resize.mock.calls.length).toBeGreaterThan(before)
})

test('falls back to lenis.resize() when the instance exposes no dimensions', () => {
  renderScroll()
  const lenis = mocks.instances[0]
  lenis.dimensions = undefined

  observers[0].fire()
  flushFrames()

  expect(lenis.resize).toHaveBeenCalled()
})

test('coalesces a burst of observer callbacks into a single re-measure', () => {
  renderScroll()
  const lenis = mocks.instances[0]
  lenis.dimensions.resize.mockClear()

  observers[0].fire()
  observers[0].fire()
  observers[0].fire()
  flushFrames()

  expect(lenis.dimensions.resize).toHaveBeenCalledTimes(1)
})

test('disconnects the observer and destroys Lenis on unmount', () => {
  const { unmount } = renderScroll()
  const lenis = mocks.instances[0]

  unmount()

  expect(observers[0].disconnected).toBe(true)
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
})

test('under reduced motion Lenis never starts and nothing is observed', () => {
  mocks.reduce = true
  renderScroll()

  expect(mocks.instances).toHaveLength(0)
  expect(observers).toHaveLength(0)
  // Children still render — the wrapper is unconditional so the DOM shape does
  // not change between the smooth and the native-scroll paths.
  expect(screen.getByTestId('child')).toBeInTheDocument()
})
