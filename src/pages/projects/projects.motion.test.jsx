import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Projects from '../../routes/projects'
import { recordingMotion, stubIdle } from '../../test/gsap'
import { mockMatchMedia } from '../../test/media'

// The motion of Продажби (spec M3/M4 §7.1, §4.2; Diptych §5.5, §5.7; ruling
// M4-PF11): the opening's, the sales board rising floor by floor, is CSS
// (projects.css.test.js); under it, each section reveals what it holds once,
// as it comes up from below: the headings rise line by line, the copy fades
// up, the seams draw (useReveals), and the two renders open from the seam
// (useWipes). What is already on screen when the motion runs stays as it
// is: the first viewport never moves for JS, the board's squares included
// (ruling M4-PF13: BlockGrid's own reveal returns for a block on screen).
//
// The motion engine is a recording stand-in (src/test/gsap.js), as the
// engine module useMotion() loads and as what useMotionNow() hands over; the
// matchMedia mock allows motion and answers a desktop. jsdom lays nothing
// out, so each element is placed by hand: the board on screen, as it is at
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
  vi.spyOn(console, 'log').mockImplementation(() => {})
  flushMotion = stubIdle()
})
afterEach(async () => {
  await flushMotion()
  restoreMedia?.()
  restoreMedia = undefined
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

// The page, the board `board` px down the screen and the rest `rest` px.
function renderPage({ board = ON_SCREEN, rest = BELOW, media = {} } = {}) {
  restoreMedia = mockMatchMedia(media)
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function place() {
    const top = this.closest('#top') ? board : rest
    return { top, bottom: top + 600, left: 0, right: 1440, width: 1440, height: 600, x: 0, y: top }
  })
  render(
    <MemoryRouter initialEntries={['/projects']}>
      <Projects />
    </MemoryRouter>,
  )
}

const all = (selector) => [...document.querySelectorAll(selector)]
const fromsWith = (key) => recorder.tweens.filter((tween) => tween.method === 'from' && key in tween.vars)
const targetsOf = (tweens) => tweens.flatMap(({ targets }) => (targets instanceof Element ? [targets] : [...targets]))
const sameElements = (targets, elements) => targets.length === elements.length && elements.every((element) => targets.includes(element))

describe('the sections coming up from below', () => {
  it('raise each heading line by line, fade the copy up and draw the seams, once', async () => {
    renderPage()
    await flushMotion()

    const split = recorder.motion.SplitText.create.mock.calls.map(([element]) => element)
    expect(sameElements(split, all('[data-split]'))).toBe(true)
    expect(split.map((element) => element.textContent.replace(/\s+/g, ' ').trim())).toEqual(['Търсите нов дом?'])
    const fades = fromsWith('y')
    expect(sameElements(targetsOf(fades), all('[data-fade]'))).toBe(true)
    for (const { vars } of fades) expect(vars).toMatchObject({ opacity: 0, y: 16, scrollTrigger: { start: 'top 92%', once: true } })
    const draws = fromsWith('scaleY')
    expect(sameElements(targetsOf(draws), all('[data-draw]'))).toBe(true)
    expect(draws).toHaveLength(2)
  })

  // Spec §7.1 (the concept's data-wipe): Golden Residence's render, left of
  // the seam, opens from its right edge; Многофамилна's, right of it, from
  // its left; once, at 84 % of the screen.
  it('open the two renders from the seam', async () => {
    renderPage()
    await flushMotion()

    const figures = all('#sgradite [data-wipe]')
    expect(figures).toHaveLength(2)
    expect(recorder.timelines.map((timeline) => timeline.vars.scrollTrigger.trigger)).toEqual(figures)
    expect(recorder.timelines.map((timeline) => timeline.steps[0].from)).toEqual([
      { clipPath: 'inset(0% 0% 0% 100%)' },
      { clipPath: 'inset(0% 100% 0% 0%)' },
    ])
    for (const timeline of recorder.timelines) expect(timeline.vars.scrollTrigger).toMatchObject({ start: 'top 84%', once: true })
  })

  // Spec §4.2: the opening is CSS only: nothing in #top is split, faded,
  // drawn or tweened by script, its squares included.
  it('leave the opening to its CSS', async () => {
    renderPage()
    await flushMotion()

    const opening = document.getElementById('top')
    expect(opening.querySelectorAll('[data-split], [data-fade], [data-draw], [data-wipe]')).toHaveLength(0)
    expect(targetsOf(recorder.tweens).some((element) => opening.contains(element))).toBe(false)
  })
})

// A block of the board that starts below the fold, as Многофамилна's do on a
// phone: its squares come in as the block comes up (BlockGrid's reveal),
// once, at 75 % of the screen.
it('brings a board’s squares in as their block comes up from below', async () => {
  renderPage({ board: BELOW })
  await flushMotion()

  const squares = fromsWith('opacity').filter(({ vars }) => vars.duration === 0.5)
  expect(squares).toHaveLength(4)
  expect(sameElements(targetsOf(squares), all('#top .blk__grid button'))).toBe(true)
  for (const { vars } of squares) expect(vars.scrollTrigger).toMatchObject({ start: 'top 75%', once: true })
})

// Spec §5.7, Diptych §5.5: no replays, and the first viewport never moves
// for JS. Sections already on screen when the motion runs stay as they are.
it('leaves sections already on screen as they are', async () => {
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
  expect(document.querySelectorAll('[style*="opacity"], [style*="transform"]')).toHaveLength(0)
})
