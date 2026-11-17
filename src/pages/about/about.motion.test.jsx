import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import About from '../../routes/about'
import { recordingMotion, stubIdle } from '../../test/gsap'
import { mockMatchMedia } from '../../test/media'

// The motion of За нас (spec M3/M4 §7.4, §4.2; Diptych §5.5, §5.7; ruling
// M4-PF11): the opening's, the founding drawing itself on the seam, is CSS
// (about.css.test.js), and no motion's scope takes it in; under it, each
// section reveals what it holds once, as it comes up from below: the
// headings rise line by line, the copy fades up, the seams draw
// (useReveals), and the photos open from the seam (useWipes). What is
// already on screen when the motion runs stays as it is: the first viewport
// never moves for JS.
//
// The motion engine is a recording stand-in (src/test/gsap.js), as the
// engine module useMotion() loads and as what useMotionNow() hands over; the
// matchMedia mock allows motion and answers a desktop. jsdom lays nothing
// out, so each element is placed by hand: the opening on screen, as it is at
// the top of the page, and everything under it below the fold.

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
    return { top: y, bottom: y + 600, left: 0, right: 1440, width: 1440, height: 600, x: 0, y }
  })
  render(
    <MemoryRouter initialEntries={['/about']}>
      <About />
    </MemoryRouter>,
  )
}

const all = (selector) => [...document.querySelectorAll(selector)]
const fromsWith = (key) => recorder.tweens.filter((tween) => tween.method === 'from' && key in tween.vars)
const targetsOf = (tweens) => tweens.flatMap(({ targets }) => (targets instanceof Element ? [targets] : [...targets]))
const sameElements = (targets, elements) => targets.length === elements.length && elements.every((element) => targets.includes(element))
const textOf = (element) => element.textContent.replace(/\s+/g, ' ').trim()

describe('the sections coming up from below', () => {
  it('raise each heading line by line, fade the copy up and draw the seams, once', async () => {
    renderPage()
    await flushMotion()

    const split = recorder.motion.SplitText.create.mock.calls.map(([element]) => element)
    expect(sameElements(split, all('[data-split]'))).toBe(true)
    expect(split.map(textOf)).toEqual(expect.arrayContaining([
      'Традиция и иновации от 2008', '„Добрата работа – реклама за майстора“', 'Обещани дейности', 'от учредителите',
      'Екстериор', 'Интериор', 'Кои сме ние?', 'Какво ни прави различни', 'Качество', 'Точност', 'Иновации',
      'Какво предлагаме?', 'Защо да изберете КСМ Строй ООД?', 'Мисия', 'и визия', 'Готови сте да работите с нас?',
    ]))
    const fades = fromsWith('y')
    expect(sameElements(targetsOf(fades), all('[data-fade]'))).toBe(true)
    for (const { vars } of fades) expect(vars).toMatchObject({ opacity: 0, y: 16, scrollTrigger: { start: 'top 92%', once: true } })
    const draws = fromsWith('scaleY')
    expect(sameElements(targetsOf(draws), all('[data-draw]'))).toBe(true)
    expect(draws).toHaveLength(10)
  })

  // Spec §7.4, §4.2 (the concept's data-wipe): the photos open from the
  // seam, once, at 84 % of the screen: a photo left of the seam from its
  // right edge, a photo right of it from its left, each settling.
  it('open the five photos from the seam, once', async () => {
    renderPage()
    await flushMotion()

    const photos = all('[data-wipe]')
    expect(photos.map((photo) => [photo.className, photo.getAttribute('data-wipe')])).toEqual([
      ['deed__ph', 'l'], ['deed__ph', 'r'], ['band__ph band__ph--l', 'l'], ['band__ph band__ph--r', 'r'], ['cta__ph', 'r'],
    ])
    expect(recorder.timelines.map((timeline) => timeline.vars.scrollTrigger.trigger)).toEqual(photos)
    expect(recorder.timelines.map((timeline) => timeline.steps[0].from.clipPath)).toEqual([
      'inset(0% 0% 0% 100%)', 'inset(0% 100% 0% 0%)', 'inset(0% 0% 0% 100%)', 'inset(0% 100% 0% 0%)', 'inset(0% 100% 0% 0%)',
    ])
    expect(recorder.timelines.map((timeline) => timeline.steps[1].targets)).toEqual(photos.map((photo) => photo.querySelector('img')))
    for (const timeline of recorder.timelines) expect(timeline.vars.scrollTrigger).toMatchObject({ start: 'top 84%', once: true })
  })

  // Spec §4.2: the opening is CSS only: nothing in #top is split, faded,
  // drawn or tweened by script, and no motion's scope takes it in or lies
  // inside it.
  it('leave the opening to its CSS', async () => {
    renderPage()
    await flushMotion()

    const opening = document.getElementById('top')
    expect(opening.querySelectorAll('[data-split], [data-fade], [data-draw], [data-wipe]')).toHaveLength(0)
    expect(targetsOf(recorder.tweens).some((element) => opening.contains(element))).toBe(false)
    const scopes = [...new Set(recorder.motion.gsap.context.mock.calls.map(([, scope]) => scope))]
    expect(scopes.length).toBeGreaterThan(0)
    for (const scope of scopes) expect(scope.contains(opening) || opening.contains(scope)).toBe(false)
  })
})

// Spec §5.7, Diptych §5.5: no replays, and the first viewport never moves
// for JS. Sections already on screen when the motion runs stay as they are.
it('leaves what is already on screen as it is', async () => {
  renderPage({ rest: ON_SCREEN })
  await flushMotion()

  expect(recorder.motion.gsap.context).toHaveBeenCalled()
  expect(recorder.motion.SplitText.create).not.toHaveBeenCalled()
  expect(recorder.tweens).toEqual([])
  expect(recorder.timelines).toEqual([])
})

// Diptych §5.8: reduced motion leaves the final state, nothing hidden or
// moved, and no motion set up at all.
it('runs no motion under reduced motion, the page in its final state', async () => {
  renderPage({ media: { reduce: true } })
  await flushMotion()

  expect(recorder.motion.gsap.context).not.toHaveBeenCalled()
  expect(recorder.tweens).toEqual([])
  expect(recorder.timelines).toEqual([])
  expect(document.querySelectorAll('[style*="opacity"], [style*="transform"], [style*="clip"]')).toHaveLength(0)
})
