import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { resetInquiry } from '../../components/inquiry/inquiryStore'
import Contact from '../../routes/contact'
import { recordingMotion, stubIdle } from '../../test/gsap'
import { mockMatchMedia } from '../../test/media'

// The motion of Контакти (spec M3/M4 §7.3, §4.2; Diptych §5.5, §5.7; ruling
// M4-PF11): the opening's is CSS (contact.css.test.js); under it, each
// section reveals what it holds once, as it comes up from below: the
// headings rise line by line, the copy fades up, the seams draw
// (useReveals), and the offices' mark draws itself, stroke by stroke, as
// its band reaches 72 % of the screen. What is already on screen when the
// motion runs stays as it is: the first viewport never moves for JS, and
// neither does a landing's form.
//
// The motion engine is a recording stand-in (src/test/gsap.js), as the
// engine module useMotion() loads and as what useMotionNow() hands over; the
// matchMedia mock allows motion and answers a desktop. jsdom lays nothing
// out, so every element is placed at one height of its 768 px screen.

const engine = vi.hoisted(() => ({ motion: null }))
vi.mock('../../motion/engine.js', () => ({ default: engine.motion }))
vi.mock('../../motion/useMotionNow', () => ({ default: () => () => engine.motion }))
const recorder = recordingMotion()
engine.motion = recorder.motion

const BELOW = 2000
const ON_SCREEN = 300

let restoreMedia
let flushMotion
beforeEach(() => {
  recorder.reset()
  vi.stubGlobal('fetch', vi.fn(async () => { throw new TypeError('offline') }))
  vi.spyOn(console, 'log').mockImplementation(() => {})
  flushMotion = stubIdle()
})
afterEach(async () => {
  await flushMotion()
  restoreMedia?.()
  restoreMedia = undefined
  resetInquiry()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

// The page, with every element `top` px down the screen.
function renderPage(top, media = {}) {
  restoreMedia = mockMatchMedia(media)
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({ top, bottom: top + 600, left: 0, right: 1440, width: 1440, height: 600, x: 0, y: top })
  render(
    <MemoryRouter initialEntries={['/contact']}>
      <Contact />
    </MemoryRouter>,
  )
  return [...document.querySelectorAll('main section, section')]
}

const all = (selector) => [...document.querySelectorAll(selector)]
const fromsWith = (key) => recorder.tweens.filter((tween) => tween.method === 'from' && key in tween.vars)
const targetsOf = (tweens) => tweens.flatMap(({ targets }) => (targets instanceof Element ? [targets] : [...targets]))
const sameElements = (targets, elements) => targets.length === elements.length && elements.every((element) => targets.includes(element))

describe('the sections coming up from below', () => {
  it('raise each heading line by line, fade the copy up and draw the seams, once', async () => {
    renderPage(BELOW)
    await flushMotion()

    const split = recorder.motion.SplitText.create.mock.calls.map(([element]) => element)
    expect(sameElements(split, all('[data-split]'))).toBe(true)
    expect(split.map((element) => element.textContent.replace(/\s+/g, ' ').trim())).toEqual(expect.arrayContaining([
      'Изпратете запитване', 'Нашите офиси', 'София', 'Гоце Делчев', 'Готови сте да започнете своя проект?',
    ]))
    const fades = fromsWith('y')
    expect(sameElements(targetsOf(fades), all('[data-fade]'))).toBe(true)
    for (const { vars } of fades) expect(vars).toMatchObject({ opacity: 0, y: 16, scrollTrigger: { start: 'top 92%', once: true } })
    const draws = fromsWith('scaleY')
    expect(sameElements(targetsOf(draws), all('[data-draw]'))).toBe(true)
    expect(draws).toHaveLength(3)
  })

  // Spec §7.3 (the concept's kontakti.js:334-339): the mark draws itself,
  // stroke by stroke, 1.2 s, once the band reaches 72 % of the screen; what
  // the draw set goes with it.
  it('draw the offices’ mark stroke by stroke as its band comes up', async () => {
    renderPage(BELOW)
    await flushMotion()

    const marks = recorder.tweens.filter((tween) => tween.method === 'fromTo' && 'strokeDashoffset' in tween.vars)
    expect(marks).toHaveLength(1)
    const [mark] = marks
    expect(sameElements([...mark.targets], all('.doorway__node path'))).toBe(true)
    expect(mark.targets.length).toBe(26)
    expect(mark.from).toEqual({ strokeDasharray: '1 1', strokeDashoffset: 1 })
    const { scrollTrigger, stagger, ...vars } = mark.vars
    expect(vars).toEqual({ strokeDashoffset: 0, duration: 1.2, ease: 'power2.inOut', clearProps: 'strokeDasharray,strokeDashoffset' })
    expect([stagger(0), stagger(1), stagger(13), stagger(14)].map((delay) => Math.round(delay * 1000))).toEqual([0, 35, 0, 35])
    expect(scrollTrigger).toEqual({ trigger: document.querySelector('.doorway'), start: 'top 72%', once: true })
  })

  // Spec §4.2: the opening is CSS only: nothing in #top is split or tweened.
  it('leave the opening to its CSS', async () => {
    renderPage(BELOW)
    await flushMotion()

    const opening = document.getElementById('top')
    expect(opening.querySelectorAll('[data-split], [data-fade], [data-draw]')).toHaveLength(0)
    expect(targetsOf(recorder.tweens).some((element) => opening.contains(element))).toBe(false)
  })
})

// Spec §5.7, Diptych §5.5: no replays, and the first viewport never moves
// for JS. Sections already on screen when the motion runs stay as they are.
it('leaves sections already on screen as they are', async () => {
  renderPage(ON_SCREEN)
  await flushMotion()

  expect(recorder.motion.gsap.context).toHaveBeenCalled()
  expect(recorder.motion.SplitText.create).not.toHaveBeenCalled()
  expect(recorder.tweens).toEqual([])
})

// Diptych §5.8: reduced motion leaves the final state, nothing hidden or
// moved, and no motion set up at all.
it('runs no motion under reduced motion, the page in its final state', async () => {
  renderPage(BELOW, { reduce: true })
  await flushMotion()

  expect(recorder.motion.gsap.context).not.toHaveBeenCalled()
  expect(recorder.tweens).toEqual([])
  expect(document.querySelectorAll('[style*="opacity"], [style*="transform"]')).toHaveLength(0)
})
