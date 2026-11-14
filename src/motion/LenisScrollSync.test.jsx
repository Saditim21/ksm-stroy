import { act, render } from '@testing-library/react'
import { MemoryRouter, useLocation, useNavigate } from 'react-router'
import { vi } from 'vitest'

// LenisScrollSync gives a route change's scroll position to Lenis, and has
// ScrollTrigger re-measure the new page once the view transition is over
// (spec §5.3). React Router's <ScrollRestoration/> picks the position (the
// top, a saved position on Back, a #hash target) and sets it with
// window.scrollTo; in root.jsx this renders after it, so its layout effect
// runs after ScrollRestoration's.
const motion = vi.hoisted(() => ({ ScrollTrigger: { refresh: vi.fn() } }))
vi.mock('./engine.js', () => ({ default: motion }))

// Fresh modules for every test: whether the engine has loaded is runtime
// state, and the Lenis handle is module state.
let LenisScrollSync
let runtime
let lenisHandle
beforeEach(async () => {
  vi.resetModules()
  LenisScrollSync = (await import('./LenisScrollSync')).default
  runtime = await import('./runtime')
  lenisHandle = await import('../utils/lenis')
  motion.ScrollTrigger.refresh.mockReset()
})

const scrollY = Object.getOwnPropertyDescriptor(window, 'scrollY')
afterEach(() => {
  Object.defineProperty(window, 'scrollY', scrollY)
  delete document.getAnimations
  vi.useRealTimers()
})

// Where ScrollRestoration has just scrolled the window to.
const scrolledTo = (y) => Object.defineProperty(window, 'scrollY', { configurable: true, value: y })

let navigate
function Navigator() {
  navigate = useNavigate()
  return null
}

function renderSync(path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Navigator />
      <LenisScrollSync />
    </MemoryRouter>,
  )
}

const go = (to) => act(() => navigate(to))
const settle = () => act(async () => {})

// The animations document.getAnimations() reports: the transition's own run
// on its pseudo-elements; any other animation on the page is no part of it.
function deferred() {
  let resolve
  const promise = new Promise((done) => { resolve = done })
  return { promise, resolve }
}
const transitionAnimation = (finished) => ({ effect: { pseudoElement: '::view-transition-new(root)' }, finished })
const pageAnimation = () => ({ effect: { pseudoElement: null }, finished: new Promise(() => {}) })
const runningAnimations = (...animations) => { document.getAnimations = () => animations }

describe('the scroll position', () => {
  // Gliding toward somewhere else, Lenis would overwrite the router's position
  // on its next frame. `immediate` ends the glide; `force` reaches a Lenis a
  // scroll lock has stopped, since the page holding the lock releases it only
  // in a passive effect, after this one.
  test('each navigation hands Lenis the position the router scrolled to, at once', () => {
    const lenis = { dimensions: { resize: vi.fn() }, scrollTo: vi.fn() }
    lenisHandle.setLenis(lenis)
    renderSync('/')
    lenis.scrollTo.mockClear()

    scrolledTo(960)
    go('/about')
    expect(lenis.scrollTo.mock.calls).toEqual([[960, { immediate: true, force: true }]])

    scrolledTo(1400)
    go('/about#team')
    expect(lenis.scrollTo).toHaveBeenLastCalledWith(1400, { immediate: true, force: true })
    expect(lenis.scrollTo).toHaveBeenCalledTimes(2)
  })

  // Lenis 1.3 skips a jump to the target it already has, and the glide toward
  // it runs on: a fling gliding up to the top, as a nav link sends the new page
  // to the top, would carry on over the new page. (Redesign v1 c141d57 pinned
  // the same case.)
  function gliding({ targetScroll }) {
    const lenis = {
      targetScroll,
      isScrolling: 'smooth',
      isStopped: false,
      dimensions: { resize: vi.fn() },
      scrollTo: vi.fn((target, { force = false } = {}) => {
        if (lenis.isStopped && !force) return
        if (target === lenis.targetScroll) return
        lenis.targetScroll = target
        lenis.isScrolling = false
      }),
      // Each resets Lenis, which ends a glide.
      stop: vi.fn(() => { lenis.isStopped = true; lenis.isScrolling = false }),
      start: vi.fn(() => { lenis.isStopped = false; lenis.isScrolling = false }),
    }
    return lenis
  }

  test('a glide already headed where the router scrolled ends too', () => {
    renderSync('/')
    const lenis = gliding({ targetScroll: 0 })
    lenisHandle.setLenis(lenis)

    scrolledTo(0)
    go('/about')

    expect(lenis.isScrolling).toBe(false)
    expect(lenis.isStopped).toBe(false)
  })

  // A scroll lock stopped it, so no glide runs; starting it would break the lock.
  test('a Lenis a scroll lock has stopped stays stopped', () => {
    renderSync('/')
    const lenis = gliding({ targetScroll: 0 })
    lenis.isStopped = true
    lenisHandle.setLenis(lenis)

    scrolledTo(0)
    go('/about')

    expect(lenis.start).not.toHaveBeenCalled()
    expect(lenis.isStopped).toBe(true)
  })

  test('without Lenis, the router\'s scroll stands alone', () => {
    renderSync('/')
    expect(() => go('/contact')).not.toThrow()
  })
})

// Lenis 1.3 clamps every jump to how far the page could scroll when it last
// measured (lenis.mjs: `clamp(0, target, this.limit)`, ahead of the immediate
// branch), and an immediate jump writes the clamped value to the window. Lenis'
// own observers re-measure 250 ms after the page changes, SmoothScroll's a frame
// after; in the commit that swaps the page, Lenis still has the height of the
// page being left. The router's position on a longer page (Back to a point deep
// in it, a #hash target) can lie past that.
describe('a position past where the page being left could scroll', () => {
  // jsdom lays nothing out: the document is as tall as the rendered page says.
  // With jsdom's 768 px window, Home scrolls 4832 px, /about 3332 px and
  // /contact 1532 px.
  const PAGE_HEIGHTS = { '/': 5600, '/about': 4100, '/contact': 2300 }
  function Page() {
    const { pathname } = useLocation()
    return <main data-height={PAGE_HEIGHTS[pathname]} />
  }
  beforeEach(() => {
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      configurable: true,
      get: () => Number(document.querySelector('main')?.dataset.height ?? 0),
    })
  })
  afterEach(() => {
    delete document.documentElement.scrollHeight
  })

  function renderPages(path) {
    return render(
      <MemoryRouter initialEntries={[path]}>
        <Navigator />
        <Page />
        <LenisScrollSync />
      </MemoryRouter>,
    )
  }

  // Lenis 1.3 as far as a jump goes. It measures when it is created.
  // `dimensions.resize()` measures and does nothing else (SmoothScroll's
  // observer calls it); `resize()` measures and also takes the window's position
  // as its own.
  function measuringLenis({ publicDimensions = true } = {}) {
    let limit = 0
    const measure = () => { limit = document.documentElement.scrollHeight - window.innerHeight }
    const lenis = {
      targetScroll: window.scrollY,
      isScrolling: false,
      isStopped: false,
      dimensions: publicDimensions ? { resize: measure } : undefined,
      resize: () => {
        measure()
        lenis.targetScroll = window.scrollY
      },
      scrollTo: (target, { immediate = false, force = false } = {}) => {
        if (lenis.isStopped && !force) return
        const clamped = Math.min(Math.max(target, 0), limit)
        if (clamped === lenis.targetScroll) return
        lenis.targetScroll = clamped
        if (immediate) scrolledTo(clamped)
      },
    }
    measure()
    return lenis
  }

  test('Back to a point deep in a longer page lands there', () => {
    renderPages('/')
    const lenis = measuringLenis()
    lenisHandle.setLenis(lenis)
    lenis.scrollTo(4000, { immediate: true })

    scrolledTo(0)
    go('/contact')
    // A frame later, SmoothScroll's observer has measured /contact.
    lenis.dimensions.resize()

    // ScrollRestoration puts Home back 4000 px down.
    scrolledTo(4000)
    go(-1)
    expect(window.scrollY).toBe(4000)
    expect(lenis.targetScroll).toBe(4000)
  })

  test('a #hash target deep in a longer page stays in view', () => {
    renderPages('/contact')
    const lenis = measuringLenis()
    lenisHandle.setLenis(lenis)

    // ScrollRestoration has brought #team, 2600 px down /about, into view.
    scrolledTo(2600)
    go('/about#team')
    expect(window.scrollY).toBe(2600)
    expect(lenis.targetScroll).toBe(2600)
  })

  test('a Lenis without public dimensions measures through resize()', () => {
    renderPages('/contact')
    const lenis = measuringLenis({ publicDimensions: false })
    lenisHandle.setLenis(lenis)

    scrolledTo(2600)
    go('/about#team')
    expect(window.scrollY).toBe(2600)
    expect(lenis.targetScroll).toBe(2600)
  })
})

describe('ScrollTrigger', () => {
  beforeEach(async () => {
    await runtime.loadMotion()
  })

  test('re-measures once the route change\'s view transition has finished', async () => {
    const transition = deferred()
    runningAnimations(transitionAnimation(transition.promise), pageAnimation())
    renderSync('/')

    go('/about')
    await settle()
    expect(motion.ScrollTrigger.refresh).not.toHaveBeenCalled()

    transition.resolve()
    await settle()
    expect(motion.ScrollTrigger.refresh).toHaveBeenCalledTimes(1)
  })

  test('a transition that was skipped counts as finished', async () => {
    const transition = deferred()
    runningAnimations(transitionAnimation(transition.promise.then(() => { throw new Error('skipped') })))
    renderSync('/')

    go('/about')
    transition.resolve()
    await settle()
    expect(motion.ScrollTrigger.refresh).toHaveBeenCalledTimes(1)
  })

  test('with no transition running, it re-measures at once', async () => {
    runningAnimations(pageAnimation())
    renderSync('/')
    go('/about')
    await settle()
    expect(motion.ScrollTrigger.refresh).toHaveBeenCalledTimes(1)
  })

  test('waits 350 ms at most', async () => {
    vi.useFakeTimers()
    runningAnimations(transitionAnimation(new Promise(() => {})))
    renderSync('/')

    go('/about')
    await act(() => vi.advanceTimersByTimeAsync(349))
    expect(motion.ScrollTrigger.refresh).not.toHaveBeenCalled()
    await act(() => vi.advanceTimersByTimeAsync(1))
    expect(motion.ScrollTrigger.refresh).toHaveBeenCalledTimes(1)
  })

  // jsdom, for one.
  test('where the browser cannot list its animations, it waits the 350 ms', async () => {
    vi.useFakeTimers()
    expect(document.getAnimations).toBeUndefined()
    renderSync('/')

    go('/about')
    await act(() => vi.advanceTimersByTimeAsync(349))
    expect(motion.ScrollTrigger.refresh).not.toHaveBeenCalled()
    await act(() => vi.advanceTimersByTimeAsync(1))
    expect(motion.ScrollTrigger.refresh).toHaveBeenCalledTimes(1)
  })

  test('a navigation during the transition re-measures once, after its own', async () => {
    vi.useFakeTimers()
    renderSync('/')

    go('/about')
    await act(() => vi.advanceTimersByTimeAsync(200))
    go('/contact')
    await act(() => vi.advanceTimersByTimeAsync(200))
    expect(motion.ScrollTrigger.refresh).not.toHaveBeenCalled()
    await act(() => vi.advanceTimersByTimeAsync(150))
    expect(motion.ScrollTrigger.refresh).toHaveBeenCalledTimes(1)
  })

  // The first page's triggers are measured when they are created, and once
  // more when the idle queue drains (runtime.js).
  test('the first page re-measures nothing', async () => {
    vi.useFakeTimers()
    renderSync('/about')
    await act(() => vi.advanceTimersByTimeAsync(1000))
    expect(motion.ScrollTrigger.refresh).not.toHaveBeenCalled()
  })
})

test('before the engine has loaded, there is nothing to re-measure', async () => {
  vi.useFakeTimers()
  renderSync('/')
  go('/about')
  await act(() => vi.advanceTimersByTimeAsync(1000))
  expect(runtime.getMotion()).toBeNull()
  expect(motion.ScrollTrigger.refresh).not.toHaveBeenCalled()
})
