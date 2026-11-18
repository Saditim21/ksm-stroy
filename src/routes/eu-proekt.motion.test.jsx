import { act, render } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { recordingMotion, stubIdle } from '../test/gsap'
import { mockMatchMedia } from '../test/media'
import EuProekt from './eu-proekt'

// The motion of the EU page (spec M3/M4 §7.5, §4.2; Diptych §5.5, §5.7;
// ruling M4-PF11). The opening's entrance is CSS (eu.css.test.js), and no
// motion's scope takes it in. Under it:
// - #byudzhet, the page's one moment: when the band is first seen, its seam
//   travels from the centre to the grant's 70 % in 1.5 s, expo.inOut, by the
//   registered --split. The wait and the travel are eu.css's (a keyframe's
//   starting state from the first paint, then a transition); the page marks
//   when: waiting once it has hydrated, seen as the band's halves reach 88 %
//   of the screen. Under reduced motion it rests at 70 %, unmarked.
// - #plakat: the system's reveals, once, as it comes up from below: the seam
//   draws, the poster's link and the disclaimer fade up (useReveals).
// What is already on screen when the motion runs stays as it is: the first
// viewport never moves for JS.
//
// The motion engine is a recording stand-in (src/test/gsap.js), as the
// engine module useMotion() loads; the matchMedia mock allows motion and
// answers a desktop; the IntersectionObserver is a stand-in that says when
// the band is seen. jsdom lays nothing out, so each element is placed by
// hand: the opening on screen, as it is at the top of the page, and
// everything under it below the fold.

const engine = vi.hoisted(() => ({ motion: null }))
vi.mock('../motion/engine.js', () => ({ default: engine.motion }))
vi.mock('../motion/useMotionNow', () => ({ default: () => () => engine.motion }))
const recorder = recordingMotion()
engine.motion = recorder.motion

const BELOW = 2000
const ON_SCREEN = 300

// The observers the page makes: each with its options, what it watches,
// whether it was let go, and `see(isIntersecting)` to report on its targets.
let observers
class Observer {
  constructor(callback, options) {
    this.callback = callback
    this.options = options
    this.targets = []
    this.disconnected = false
    observers.push(this)
  }
  observe(target) { this.targets.push(target) }
  unobserve() {}
  disconnect() { this.disconnected = true }
  see(isIntersecting) {
    act(() => this.callback(this.targets.map((target) => ({ target, isIntersecting }))))
  }
}

let restoreMedia
let flushMotion
beforeEach(() => {
  recorder.reset()
  observers = []
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

// The page, the opening `top` px down the screen and the rest `rest` px.
function renderPage({ top = ON_SCREEN, rest = BELOW, media = {} } = {}) {
  restoreMedia = mockMatchMedia(media)
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function place() {
    const y = this.closest('#top') ? top : rest
    return { top: y, bottom: y + 100, left: 0, right: 1440, width: 1440, height: 100, x: 0, y }
  })
  return render(
    <MemoryRouter initialEntries={['/eu-proekt']}>
      <EuProekt />
    </MemoryRouter>,
  )
}

const all = (selector) => [...document.querySelectorAll(selector)]
const band = () => document.querySelector('#byudzhet .fund__list')
const watching = () => observers.filter((observer) => observer.targets.includes(document.querySelector('#byudzhet .fund__grant')))
const fromsWith = (key) => recorder.tweens.filter((tween) => tween.method === 'from' && key in tween.vars)
const targetsOf = (tweens) => tweens.flatMap(({ targets }) => (targets instanceof Element ? [targets] : [...targets]))
const sameElements = (targets, elements) => targets.length === elements.length && elements.every((element) => targets.includes(element))

describe('#byudzhet, the seam that moves to the grant’s share', () => {
  // Spec §7.5: the seam waits at the centre until the band is first seen,
  // then travels to 70 % (eu.css), once: the band's halves (a phone's bar
  // just above them) at 88 % of the screen.
  it('holds the band at the centre once the page has hydrated, and lets it travel when its halves are seen', async () => {
    renderPage()
    await flushMotion()

    expect(band().dataset.split).toBe('wait')
    expect(watching()).toHaveLength(1)
    const [observer] = watching()
    expect(observer.options).toEqual({ rootMargin: '0px 0px -12% 0px' })

    observer.see(false)
    expect(band().dataset.split).toBe('wait')
    observer.see(true)
    expect(band().dataset.split).toBe('seen')
    expect(observer.disconnected).toBe(true)
  })

  // A band already in view as the page hydrates (a tall screen) is seen at
  // once: it travels as the arrival's last beat.
  it('lets a band already in view travel at once', async () => {
    renderPage({ rest: ON_SCREEN })
    await flushMotion()

    watching()[0].see(true)
    expect(band().dataset.split).toBe('seen')
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

      expect(band().hasAttribute('data-split')).toBe(false)
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

      expect(band().dataset.split).toBe('wait')
    } finally {
      restore()
    }
  })

  // Leaving the page lets the band go.
  it('lets go of the band when the page goes', async () => {
    const { unmount } = renderPage()
    await flushMotion()
    const [observer] = watching()

    unmount()
    expect(observer.disconnected).toBe(true)
  })
})

// Spec §5.7: the system's reveals, once each, as #plakat comes up from below.
it('draws #plakat’s seam and fades its two halves up, once', async () => {
  renderPage()
  await flushMotion()

  const fades = fromsWith('y')
  expect(sameElements(targetsOf(fades), all('#plakat [data-fade]'))).toBe(true)
  for (const { vars } of fades) expect(vars).toMatchObject({ opacity: 0, y: 16, scrollTrigger: { start: 'top 92%', once: true } })
  const draws = fromsWith('scaleY')
  expect(sameElements(targetsOf(draws), all('#plakat [data-draw]'))).toBe(true)
  expect(draws).toHaveLength(1)
  expect(recorder.motion.SplitText.create).not.toHaveBeenCalled()
})

// Spec §4.2: the opening is CSS only: nothing in #top is split, faded, drawn
// or tweened by script, and no motion's scope takes it in or lies inside it.
it('leaves the opening to its CSS', async () => {
  renderPage()
  await flushMotion()

  const opening = document.getElementById('top')
  expect(opening.querySelectorAll('[data-split], [data-fade], [data-draw], [data-wipe]')).toHaveLength(0)
  expect(targetsOf(recorder.tweens).some((element) => opening.contains(element))).toBe(false)
  const scopes = [...new Set(recorder.motion.gsap.context.mock.calls.map(([, scope]) => scope))]
  expect(scopes.length).toBeGreaterThan(0)
  for (const scope of scopes) expect(scope.contains(opening) || opening.contains(scope)).toBe(false)
})

// Spec §5.7, Diptych §5.5: no replays, and the first viewport never moves
// for JS. Parts already on screen when the motion runs stay as they are.
it('leaves what is already on screen as it is', async () => {
  renderPage({ rest: ON_SCREEN })
  await flushMotion()

  expect(recorder.motion.gsap.context).toHaveBeenCalled()
  expect(recorder.tweens).toEqual([])
  expect(recorder.timelines).toEqual([])
})

// Spec §7.5, Diptych §5.8: under reduced motion the band rests at 70 %,
// unmarked, and the page is its final state, with no motion set up at all.
it('runs no motion under reduced motion, the band resting at 70 %', async () => {
  renderPage({ media: { reduce: true } })
  await flushMotion()

  expect(band().hasAttribute('data-split')).toBe(false)
  expect(watching()).toEqual([])
  expect(recorder.motion.gsap.context).not.toHaveBeenCalled()
  expect(recorder.tweens).toEqual([])
  expect(band().hasAttribute('style')).toBe(false)
  expect(document.querySelectorAll('[style*="opacity"], [style*="transform"], [style*="clip"]')).toHaveLength(0)
})
