import { act, render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { mockMatchMedia } from '../test/media'
import { getLenis } from '../utils/lenis'
import { LENIS_OPTIONS } from '../utils/smoothScroll'
import { loadMotion } from './runtime'
import SmoothScroll from './SmoothScroll'

// From golden-residence src/components/ui/SmoothScroll.test.jsx @944bb03.
//
// SmoothScroll runs Lenis on GSAP's ticker, and takes both from the motion
// engine, which loads after the page has (runtime.js). The engine is a
// stand-in here: a mock Lenis, since the real one needs scroll physics jsdom
// does not have, and a GSAP ticker and ScrollTrigger that record what Lenis is
// wired to. Motion is allowed in every test unless it says otherwise.
const mocks = vi.hoisted(() => {
  const mocks = {
    instances: [],
    ticker: { add: vi.fn(), remove: vi.fn(), lagSmoothing: vi.fn() },
    update: vi.fn(),
    refresh: vi.fn(),
  }
  class MockLenis {
    constructor(options) {
      this.options = options
      // Mirrors the real shape: `dimensions` is a public readonly property
      // (lenis.d.ts) whose `resize()` re-measures without touching scroll
      // state; `resize()` on the instance additionally snaps the animation.
      this.dimensions = { resize: vi.fn() }
      this.resize = vi.fn()
      this.raf = vi.fn()
      this.on = vi.fn()
      this.stop = vi.fn()
      this.start = vi.fn()
      this.destroy = vi.fn()
      mocks.instances.push(this)
    }
  }
  mocks.motion = {
    gsap: { ticker: mocks.ticker },
    ScrollTrigger: { update: mocks.update, refresh: mocks.refresh },
    SplitText: function SplitText() {},
    Lenis: MockLenis,
  }
  return mocks
})

vi.mock('./engine.js', () => ({ default: mocks.motion }))

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

let restoreMedia
beforeEach(() => {
  mocks.instances = []
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
  restoreMedia = mockMatchMedia()
})

afterEach(() => {
  restoreMedia?.()
  restoreMedia = undefined
  vi.unstubAllGlobals()
})

// Runs only the frames queued so far.
function flushFrames() {
  const queued = [...frames.values()]
  frames = new Map()
  queued.forEach((cb) => cb(0))
}

// Lets the engine load, and SmoothScroll start Lenis on it.
const engineLoads = () => act(async () => { await loadMotion() })

function renderScroll() {
  return render(
    <SmoothScroll>
      <div data-testid="child">page</div>
    </SmoothScroll>,
  )
}

async function renderRunning() {
  const view = renderScroll()
  await engineLoads()
  return { ...view, lenis: mocks.instances[0] }
}

// The prerendered HTML, reduced motion, data saver and the tests without
// matchMedia all get the same plain page: the wrapper is a bare block, there
// so that a box in the DOM grows with the page (see the observer tests).
describe('without motion', () => {
  test.each([
    ['no matchMedia (jsdom, the prerender)', () => restoreMedia()],
    ['reduced motion', () => {
      restoreMedia()
      restoreMedia = mockMatchMedia({ reduce: true })
    }],
  ])('%s: the children in a plain wrapper, and no Lenis', async (_, setUp) => {
    setUp()
    const { container } = renderScroll()
    await act(() => new Promise((resolve) => setTimeout(resolve, 0)))
    expect(container.innerHTML).toBe('<div><div data-testid="child">page</div></div>')
    expect(mocks.instances).toHaveLength(0)
    expect(observers).toHaveLength(0)
    expect(mocks.ticker.add).not.toHaveBeenCalled()
    expect(getLenis()).toBeNull()
    expect(document.documentElement.dataset.motion).toBeUndefined()
  })
})

test('creates Lenis only once the engine has loaded', async () => {
  renderScroll()
  expect(mocks.instances).toHaveLength(0)
  expect(observers).toHaveLength(0)
  await engineLoads()
  expect(mocks.instances).toHaveLength(1)
})

test('never starts Lenis when it unmounts before the engine has loaded', async () => {
  const { unmount } = renderScroll()
  unmount()
  await engineLoads()
  expect(mocks.instances).toHaveLength(0)
  expect(mocks.ticker.add).not.toHaveBeenCalled()
  expect(getLenis()).toBeNull()
})

test('creates Lenis without its own rAF loop and drives it from the GSAP ticker', async () => {
  const { lenis } = await renderRunning()

  // The settings and the pinch filter are src/utils/smoothScroll.js's.
  expect(lenis.options).toEqual({ ...LENIS_OPTIONS, virtualScroll: expect.any(Function) })
  expect(mocks.ticker.lagSmoothing).toHaveBeenCalledWith(0)
  const tick = mocks.ticker.add.mock.calls[0][0]
  // The ticker counts in seconds, Lenis in milliseconds.
  tick(1.5)
  expect(lenis.raf).toHaveBeenCalledWith(1500)
})

test('forwards every Lenis scroll to ScrollTrigger', async () => {
  const { lenis } = await renderRunning()
  expect(lenis.on).toHaveBeenCalledWith('scroll', mocks.update)
})

test('publishes the running Lenis and marks the document, until it unmounts', async () => {
  const { lenis, unmount } = await renderRunning()
  expect(getLenis()).toBe(lenis)
  expect(document.documentElement.dataset.motion).toBe('on')
  unmount()
  expect(getLenis()).toBeNull()
  expect(document.documentElement.dataset.motion).toBeUndefined()
})

test('observes an element that grows with the page, not the pinned document element', async () => {
  await renderRunning()

  expect(observers).toHaveLength(1)
  const observed = observers[0].observed[0]
  expect(observed).toBeTruthy()
  // html and body are pinned at height:100% until Lenis runs, so their boxes
  // never grow. The observed element has to be one that wraps the page
  // content instead.
  expect(observed).not.toBe(document.documentElement)
  expect(observed).not.toBe(document.body)
  expect(observed.contains(screen.getByTestId('child'))).toBe(true)
})

test('re-measures Lenis and refreshes ScrollTrigger when the observed content grows', async () => {
  const { lenis } = await renderRunning()
  const before = lenis.dimensions.resize.mock.calls.length

  observers[0].fire()
  flushFrames()

  expect(lenis.dimensions.resize.mock.calls.length).toBeGreaterThan(before)
  expect(mocks.refresh).toHaveBeenCalledTimes(1)
})

test('falls back to lenis.resize() when the instance exposes no dimensions', async () => {
  const { lenis } = await renderRunning()
  lenis.dimensions = undefined

  observers[0].fire()
  flushFrames()

  expect(lenis.resize).toHaveBeenCalled()
})

test('coalesces a burst of observer callbacks into a single re-measure and refresh', async () => {
  const { lenis } = await renderRunning()
  lenis.dimensions.resize.mockClear()

  observers[0].fire()
  observers[0].fire()
  observers[0].fire()
  flushFrames()

  expect(lenis.dimensions.resize).toHaveBeenCalledTimes(1)
  expect(mocks.refresh).toHaveBeenCalledTimes(1)
})

test('disconnects the observer, leaves the ticker and destroys Lenis on unmount', async () => {
  const { lenis, unmount } = await renderRunning()
  const tick = mocks.ticker.add.mock.calls[0][0]

  unmount()

  expect(observers[0].disconnected).toBe(true)
  expect(mocks.ticker.remove).toHaveBeenCalledWith(tick)
  expect(mocks.ticker.lagSmoothing).toHaveBeenLastCalledWith(500, 33)
  expect(lenis.destroy).toHaveBeenCalled()
})

test('a re-measure still queued at unmount never reaches the destroyed instance', async () => {
  const { lenis, unmount } = await renderRunning()

  observers[0].fire() // queues a frame
  lenis.dimensions.resize.mockClear()
  unmount()
  flushFrames()

  expect(lenis.dimensions.resize).not.toHaveBeenCalled()
  expect(mocks.refresh).not.toHaveBeenCalled()
})

test('stops Lenis when the visitor switches reduced motion on', async () => {
  const { lenis } = await renderRunning()
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')

  act(() => {
    reduce.matches = true
    reduce.dispatchEvent(new Event('change'))
  })

  expect(lenis.destroy).toHaveBeenCalled()
  expect(getLenis()).toBeNull()
  expect(document.documentElement.dataset.motion).toBeUndefined()
  expect(screen.getByTestId('child')).toBeInTheDocument()
})
