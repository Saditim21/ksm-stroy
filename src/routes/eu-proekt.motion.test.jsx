import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { recordingMotion, stubIdle } from '../test/gsap'
import { mockMatchMedia } from '../test/media'
import EuProekt from './eu-proekt'

// The motion of the EU page (spec M3/M4 §7.5, §4.2; Diptych §5.5, §5.7;
// rulings M4-PF11, T6b, T6d). The opening's entrance is CSS (eu.css.test.js),
// and the page sets up none of the system's motion: #plakat is still (T6d).
// Its one moment is #byudzhet's: when the band is first seen, its seam
// travels from the centre to the grant's 70 % in 1.5 s, expo.inOut, by the
// registered --split. The wait and the travel are eu.css's (a keyframe's
// starting state from the first paint, then a transition); the page marks
// when, on the band's own data-band (data-split is the system's SplitText
// marker, which never goes above the fold): waiting once it has hydrated,
// then where the concept's js/eu-proekt.js has it (:13-17, :31): landed
// where the list has landed with its top within 86 % of the screen (it
// travels as the arrival's last beat), else seen once its top has come up
// to 78 %. Under reduced motion it rests at 70 %, unmarked.
//
// The motion engine is a recording stand-in (src/test/gsap.js), as the
// engine module useMotion() loads, so a test can tell that nothing asks for
// it; the matchMedia mock allows motion. The IntersectionObserver is a
// stand-in that, as a browser's does, reports where its target is when it
// starts to watch it, and again as the visitor scrolls (scrollTo). jsdom lays
// nothing out, so each element is placed by hand: the opening at the top of
// the screen, everything under it `place.rest` px down.

const engine = vi.hoisted(() => ({ motion: null }))
vi.mock('../motion/engine.js', () => ({ default: engine.motion }))
vi.mock('../motion/useMotionNow', () => ({ default: () => () => engine.motion }))
const recorder = recordingMotion()
engine.motion = recorder.motion

const ON_SCREEN = 300
// A place on the screen, a share of its height down from its top.
const down = (share) => window.innerHeight * share

let place
let observers
// The observers the page makes: each with its options, what it watches and
// whether it was let go.
class Observer {
  constructor(callback, options) {
    this.callback = callback
    this.options = options
    this.targets = []
    this.disconnected = false
    observers.push(this)
  }

  // As a browser's does, it reports where the target is as it starts to
  // watch it, a moment after.
  observe(target) {
    this.targets.push(target)
    queueMicrotask(() => this.report())
  }

  unobserve() {}

  disconnect() { this.disconnected = true }

  // Each target, in view or not: in view when its top is above the screen's
  // foot, which the bottom margin raises (`0px 0px -22% 0px`: 78 % down), and
  // its bottom below the screen's top.
  report() {
    if (this.disconnected) return
    const margin = /^0px 0px -(\d+)% 0px$/.exec(this.options?.rootMargin ?? '')
    if (!margin) throw new Error(`the stand-in reads a bottom margin only, not ${this.options?.rootMargin}`)
    const foot = window.innerHeight * (1 - Number(margin[1]) / 100)
    this.callback(this.targets.map((target) => {
      const { top, bottom } = target.getBoundingClientRect()
      return { target, isIntersecting: top < foot && bottom > 0 }
    }), this)
  }
}

// The visitor scrolls: everything under the opening comes to `rest` px down,
// and every observer still watching reports.
function scrollTo(rest) {
  place.rest = rest
  for (const observer of observers.filter(({ disconnected }) => !disconnected)) observer.report()
}

let restoreMedia
let flushMotion
beforeEach(() => {
  recorder.reset()
  observers = []
  place = { rest: down(0.9) }
  vi.stubGlobal('IntersectionObserver', Observer)
  vi.stubGlobal('fetch', vi.fn(async () => { throw new TypeError('offline') }))
  flushMotion = stubIdle()
})
afterEach(async () => {
  await flushMotion()
  restoreMedia?.()
  restoreMedia = undefined
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

// The page, with everything under the opening `rest` px down the screen.
function renderPage({ rest = down(0.9), media = {} } = {}) {
  place.rest = rest
  restoreMedia = mockMatchMedia(media)
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function where() {
    const y = this.closest('#top') ? ON_SCREEN : place.rest
    return { top: y, bottom: y + 100, left: 0, right: 1440, width: 1440, height: 100, x: 0, y }
  })
  return render(
    <MemoryRouter initialEntries={['/eu-proekt']}>
      <EuProekt />
    </MemoryRouter>,
  )
}

const band = () => document.querySelector('#byudzhet .fund__list')
const watching = () => observers.filter((observer) => observer.targets.includes(band()))
const live = () => watching().filter(({ disconnected }) => !disconnected)

describe('#byudzhet, the seam that moves to the grant’s share', () => {
  // The concept's rule for landing (js/eu-proekt.js:13-17): a band whose
  // list lands with its top within 86 % of the screen (a tall window,
  // 1680 × 1050) is seen on landing, without a scroll, and travels as the
  // arrival's last beat (data-band="landed", which eu.css starts 0.75 s
  // later). Nothing is fired by hand: the observer reports, as it starts to
  // watch, that the band is in view.
  it('marks a band that lands with its top within 86 % of the screen landed, to travel without a scroll', async () => {
    renderPage({ rest: down(0.82) })
    await flushMotion()

    expect(band().dataset.band).toBe('landed')
    expect(watching()).toHaveLength(1)
    expect(live()).toEqual([])
  })

  // The concept's rule for scrolling (js/eu-proekt.js:31): a band that lands
  // lower (1440 × 900: the list's top 90 % down) waits at the centre until
  // its top has come up to 78 % of the screen, then travels, once.
  it('holds a band that lands lower at the centre until its top has come up to 78 %, once', async () => {
    renderPage({ rest: down(0.9) })
    await flushMotion()

    expect(band().dataset.band).toBe('wait')
    expect(live()).toHaveLength(1)
    scrollTo(down(0.82))
    expect(band().dataset.band).toBe('wait')
    scrollTo(down(0.79))
    expect(band().dataset.band).toBe('wait')
    scrollTo(down(0.76))
    expect(band().dataset.band).toBe('seen')
    expect(live()).toEqual([])
    scrollTo(down(0.9))
    expect(band().dataset.band).toBe('seen')
  })

  // Every phone: the band lands well below the fold.
  it('holds a band far below the fold the same way', async () => {
    renderPage({ rest: 2000 })
    await flushMotion()

    expect(band().dataset.band).toBe('wait')
    scrollTo(down(0.7))
    expect(band().dataset.band).toBe('seen')
  })

  // The band's state is its own attribute. data-split is the system's
  // SplitText marker (Diptych §5.7, src/motion/useReveals.js), never used
  // above the fold, and the band's total is in the first viewport at
  // 1440 × 900: nothing on the page carries it, waiting or seen.
  it('marks the band’s state as data-band, and nothing on the page as data-split', async () => {
    renderPage({ rest: down(0.9) })
    await flushMotion()

    expect(band().dataset.band).toBe('wait')
    expect(document.querySelectorAll('[data-split]')).toHaveLength(0)
    scrollTo(down(0.7))
    expect(band().dataset.band).toBe('seen')
    expect(document.querySelectorAll('[data-split]')).toHaveLength(0)
  })

  // The band's keyframe as the browser reports it (getAnimations, which jsdom
  // lacks), `localTime` ms into it; restore() puts things back.
  function arrivalAt(localTime) {
    const had = Object.getOwnPropertyDescriptor(Element.prototype, 'getAnimations')
    const arrival = { animationName: 'eu-split', effect: { getComputedTiming: () => ({ delay: 4000, localTime }) } }
    Object.defineProperty(Element.prototype, 'getAnimations', {
      configurable: true,
      value() { return this.matches('.fund__list') ? [arrival] : [] },
    })
    return function restore() {
      if (had) Object.defineProperty(Element.prototype, 'getAnimations', had)
      else delete Element.prototype.getAnimations
    }
  }

  // A slow first load: the keyframe has begun to bring the band to 70 % on
  // its own before the page hydrated. It is left to finish, never sent back
  // to the centre.
  it('leaves the band to its keyframe once that has begun to move it', async () => {
    const restore = arrivalAt(4200)
    try {
      renderPage()
      await flushMotion()

      expect(band().hasAttribute('data-band')).toBe(false)
      expect(watching()).toEqual([])
    } finally {
      restore()
    }
  })

  it('waits as usual while the keyframe is still holding the centre', async () => {
    const restore = arrivalAt(600)
    try {
      renderPage()
      await flushMotion()

      expect(band().dataset.band).toBe('wait')
    } finally {
      restore()
    }
  })

  // Leaving the page lets the band go.
  it('lets go of the band when the page goes', async () => {
    const { unmount } = renderPage()
    await flushMotion()
    const [observer] = live()

    unmount()
    expect(observer.disconnected).toBe(true)
  })
})

// Spec §4.2 and ruling T6d: the opening's entrance is CSS, and #plakat is
// still, so the page sets up none of the system's motion (useMotion, the
// reveals) and loads none of it: no setup, no tween, no split, and nothing
// on the page marked for a reveal.
it('sets up none of the system’s motion: the opening is CSS and #plakat is still', async () => {
  renderPage({ rest: down(0.82) })
  await flushMotion()

  expect(recorder.motion.gsap.context).not.toHaveBeenCalled()
  expect(recorder.tweens).toEqual([])
  expect(recorder.timelines).toEqual([])
  expect(recorder.triggers).toEqual([])
  expect(recorder.motion.SplitText.create).not.toHaveBeenCalled()
  expect(document.querySelectorAll('[data-split], [data-fade], [data-draw], [data-wipe]')).toHaveLength(0)
})

// Spec §7.5, Diptych §5.8: under reduced motion the band rests at 70 %,
// unmarked, even in view, and the page is its final state.
it('runs no motion under reduced motion, the band resting at 70 %', async () => {
  renderPage({ rest: down(0.82), media: { reduce: true } })
  await flushMotion()

  expect(band().hasAttribute('data-band')).toBe(false)
  expect(watching()).toEqual([])
  expect(recorder.motion.gsap.context).not.toHaveBeenCalled()
  expect(recorder.tweens).toEqual([])
  expect(band().hasAttribute('style')).toBe(false)
  expect(document.querySelectorAll('[style*="opacity"], [style*="transform"], [style*="clip"]')).toHaveLength(0)
})
