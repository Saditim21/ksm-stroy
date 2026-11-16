import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { buildModel } from '../../explorer/model'
import { MN_PROJECT } from '../../explorer/projects/mn'
import { ExplorerContext } from '../../explorer/useExplorer'
import { recordingMotion, stubIdle } from '../../test/gsap'
import { mockMatchMedia } from '../../test/media'
import MnBlocks from './MnBlocks'
import MnBuilding from './MnBuilding'
import MnGallery from './MnGallery'

// The motion of the Многофамилна page's sections under its opening (spec M3
// §4.2, §6.2 #2, #4, #5; Diptych §5.7): the blocks, the building and the
// gallery. Each reveals what it holds once, as it comes up from below: the
// headings rise line by line, the copy fades up, the seams draw (useReveals),
// each block's squares come in (BlockGrid), the gallery's stage opens from
// its seam (Spreads), and the building's picture opens from the seam beside
// it (useWipes, the page's own reveal: M3 §4.2, ruling PF8). What is already
// on screen when the motion runs stays as it is: the first viewport never
// moves for JS.
//
// The motion engine is a recording stand-in (src/test/gsap.js), both as the
// engine module useMotion() loads and as what useMotionNow() hands over, as
// in gr.motion.test.jsx; the matchMedia mock allows motion and answers a
// desktop (no phone query matches). jsdom lays nothing out, so every element
// is placed at one height of its 768 px screen.

const engine = vi.hoisted(() => ({ motion: null }))
vi.mock('../../motion/engine.js', () => ({ default: engine.motion }))
vi.mock('../../motion/useMotionNow', () => ({ default: () => () => engine.motion }))
const recorder = recordingMotion()
engine.motion = recorder.motion

const MODEL = buildModel(MN_PROJECT.modelData({}), MN_PROJECT)
const BELOW = 2000
const ON_SCREEN = 300
const PHONE = '(max-width: 900px)'

let restoreMedia
let flushMotion
beforeEach(() => {
  recorder.reset()
  restoreMedia = mockMatchMedia()
  flushMotion = stubIdle()
})
// The runtime's idle queue outlives a test: every test drains it before the
// page goes.
afterEach(async () => {
  await flushMotion()
  restoreMedia()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

// The three sections, inside the page's explorer (its context, stood in
// for), with every element `top` px down the screen.
function renderSections(top) {
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({ top, bottom: top + 600, left: 0, right: 1440, width: 1440, height: 600, x: 0, y: top })
  render(
    <MemoryRouter>
      <ExplorerContext.Provider value={{ project: MN_PROJECT, model: MODEL, dated: '01.12.2025', openUnit: () => {} }}>
        <MnBlocks />
        <MnBuilding />
        <MnGallery />
      </ExplorerContext.Provider>
    </MemoryRouter>,
  )
  return ['blokove', 'sgradata', 'galeriya'].map((id) => document.getElementById(id))
}

const all = (sections, selector) => sections.flatMap((section) => [...section.querySelectorAll(selector)])
const fromsWith = (key) => recorder.tweens.filter((tween) => tween.method === 'from' && key in tween.vars)
const targetsOf = (tweens) => tweens.flatMap(({ targets }) => (targets instanceof Element ? [targets] : [...targets]))
// Whether `targets` are exactly `elements`, compared as elements are, by
// identity (src/test/gsap.js), in any order.
const sameElements = (targets, elements) => targets.length === elements.length && elements.every((element) => targets.includes(element))

describe('the sections coming up from below', () => {
  it('raise each heading line by line, fade the copy up and draw the seams, once', async () => {
    const sections = renderSections(BELOW)
    await flushMotion()

    expect(sameElements(recorder.motion.SplitText.create.mock.calls.map(([element]) => element), all(sections, 'h2'))).toBe(true)
    const fades = fromsWith('y')
    expect(sameElements(targetsOf(fades), all(sections, '[data-fade]'))).toBe(true)
    for (const { vars } of fades) expect(vars).toMatchObject({ opacity: 0, y: 16, scrollTrigger: { start: 'top 92%', once: true } })
    const draws = fromsWith('scaleY')
    expect(sameElements(targetsOf(draws), all(sections, '[data-draw]'))).toBe(true)
    expect(draws).toHaveLength(3)
  })

  it('bring each block’s 72 squares in, and open the gallery’s stage from its seam', async () => {
    const [blocks, , gallery] = renderSections(BELOW)
    await flushMotion()

    const squares = recorder.tweens.filter((tween) => tween.targets?.[0]?.closest?.('.blk__grid'))
    expect(squares.map(({ targets }) => targets.length)).toEqual([72, 72])
    expect(sameElements(targetsOf(squares), all([blocks], '.blk__grid button'))).toBe(true)
    for (const { vars } of squares) {
      const { scrollTrigger, ...rest } = vars
      expect(rest).toMatchObject({ opacity: 0, duration: 0.5 })
      expect([scrollTrigger.start, scrollTrigger.once]).toEqual(['top 75%', true])
    }

    const stage = recorder.tweens.filter((tween) => tween.targets?.[0]?.classList?.contains('gal__half'))
    expect(stage).toHaveLength(1)
    expect(sameElements([...stage[0].targets], [...gallery.querySelectorAll('.gal__half')])).toBe(true)
    const { scrollTrigger, ...opening } = stage[0].vars
    expect(opening).toMatchObject({ duration: 1.2, ease: 'expo.inOut' })
    expect(scrollTrigger.trigger).toBe(gallery.querySelector('.gal__stage'))
    expect([scrollTrigger.start, scrollTrigger.once]).toEqual(['top 80%', true])
  })

  // M3 §4.2 (the concept's data-wipe, core.js:210-217): the building's
  // picture, left of the seam, opens from its right edge, the seam's, 1.2 s
  // expo.inOut, settling from 1.14 over 1.6 s, once, at 84 % of the screen;
  // what the opening set goes with it.
  it('open the building’s picture from the seam, settling from 1.14', async () => {
    const [, building] = renderSections(BELOW)
    await flushMotion()

    const figure = building.querySelector('[data-wipe]')
    expect(figure).toHaveClass('mns__media')
    expect(recorder.timelines).toHaveLength(1)
    const [wipe] = recorder.timelines
    expect(wipe.vars).toEqual({ scrollTrigger: { trigger: figure, start: 'top 84%', once: true } })
    expect(wipe.steps).toEqual([
      { method: 'fromTo', targets: figure, from: { clipPath: 'inset(0% 0% 0% 100%)' }, vars: { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, ease: 'expo.inOut', clearProps: 'clipPath' }, position: undefined },
      { method: 'fromTo', targets: figure.querySelector('img'), from: { scale: 1.14 }, vars: { scale: 1, duration: 1.6, ease: 'expo.out', clearProps: 'transform' }, position: 0.1 },
    ])
  })

  // On a phone the halves stack and the seam hides: the picture opens from
  // its top, as the gallery's spreads do there.
  it('open the building’s picture from its top on a phone', async () => {
    const media = window.matchMedia
    window.matchMedia = (query) => (query === PHONE ? { ...media(query), matches: true } : media(query))
    renderSections(BELOW)
    await flushMotion()

    const [wipe] = recorder.timelines
    expect(wipe.steps[0].from).toEqual({ clipPath: 'inset(0% 0% 100% 0%)' })
  })
})

// Spec §5.7, Diptych §5.5: no replays, and the first viewport never moves
// for JS. Sections already on screen when the motion runs stay as they are.
it('leaves sections already on screen as they are', async () => {
  renderSections(ON_SCREEN)
  await flushMotion()

  expect(recorder.motion.gsap.context).toHaveBeenCalled()
  expect(recorder.motion.SplitText.create).not.toHaveBeenCalled()
  expect(recorder.tweens).toEqual([])
  expect(recorder.timelines).toEqual([])
})
