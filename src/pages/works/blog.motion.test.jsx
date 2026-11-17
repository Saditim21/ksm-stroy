import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { loadFlip } from '../../motion/flip'
import Blog from '../../routes/blog'
import { recordingMotion, stubIdle } from '../../test/gsap'
import { mockMatchMedia } from '../../test/media'

// The motion of Обекти (spec M3/M4 §7.2, §4.2; Diptych §5.5, §5.7; ruling
// M4-PF11): the opening's (the title rising, the seam drawing, the first
// row's cover settling and its smaller plates opening from the seam) is CSS
// (works.css.test.js), and no motion's scope takes it in; under it, each
// row's plates open from the seam as the row comes up from below (useWipes,
// each row its own scope), and the closing reveals what it holds once: its
// heading rises line by line, its line fades up, its seam draws
// (useReveals). What is already on screen when the motion runs stays as it
// is: the first viewport never moves for JS. And the filter folds the
// register with Flip: the rows it drops fade, the gaps close (spec §7.2);
// without Flip, the rows change at once once the fade is done.
//
// The motion engine is a recording stand-in (src/test/gsap.js), as the
// engine module useMotion() loads and as what useMotionNow() hands over;
// Flip is one too; the matchMedia mock allows motion and answers a desktop.
// jsdom lays nothing out, so each element is placed by hand: the opening and
// the first row on screen, as they are at the top of the page, and
// everything under them below the fold.

const engine = vi.hoisted(() => ({ motion: null }))
vi.mock('../../motion/engine.js', () => ({ default: engine.motion }))
vi.mock('../../motion/useMotionNow', () => ({ default: () => () => engine.motion }))
const recorder = recordingMotion()
engine.motion = recorder.motion

const flip = vi.hoisted(() => ({ Flip: null }))
vi.mock('../../motion/flip', () => ({ loadFlip: vi.fn(() => Promise.resolve(flip.Flip)) }))
flip.Flip = { getState: vi.fn((targets) => ({ targets })), from: vi.fn(() => ({ kill: vi.fn() })), fit: vi.fn() }

const BELOW = 2000
const ON_SCREEN = 300

let restoreMedia
let flushMotion
beforeEach(() => {
  recorder.reset()
  // Back to its own implementation (Flip, loaded), should a test have made
  // it fail.
  vi.mocked(loadFlip).mockReset()
  for (const fn of Object.values(flip.Flip)) fn.mockClear()
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

// The page, the opening and the first row `top` px down the screen and the
// rest `rest` px.
function renderPage({ top = ON_SCREEN, rest = BELOW, media = {} } = {}) {
  restoreMedia = mockMatchMedia(media)
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function place() {
    const y = this.closest('.ob__head, .wk:first-child') ? top : rest
    return { top: y, bottom: y + 600, left: 0, right: 1440, width: 1440, height: 600, x: 0, y }
  })
  render(
    <MemoryRouter initialEntries={['/blog']}>
      <Blog />
    </MemoryRouter>,
  )
}

const all = (selector) => [...document.querySelectorAll(selector)]
const fromsWith = (key) => recorder.tweens.filter((tween) => tween.method === 'from' && key in tween.vars)
const targetsOf = (tweens) => tweens.flatMap(({ targets }) => (targets instanceof Element ? [targets] : [...targets]))
const sameElements = (targets, elements) => targets.length === elements.length && elements.every((element) => targets.includes(element))

describe('the rows and the closing, coming up from below', () => {
  // Spec §7.2 (the concept's plates, one timeline a row): the three plates
  // of a row below the first, left of the seam, open together from their
  // right edge, the seam's, once, as the row's media reaches 84 % of the
  // screen (useWipes), the cover's photo settling.
  it('open each row’s plates from the seam, once', async () => {
    renderPage()
    await flushMotion()

    const media = all('#top .wk:not(:first-child) .wk__media')
    expect(media).toHaveLength(6)
    expect(recorder.timelines.map((timeline) => timeline.vars.scrollTrigger.trigger)).toEqual(media)
    expect(recorder.timelines.map((timeline) => timeline.steps[1].targets)).toEqual(media.map((each) => each.querySelector('.wk__ph--cover img')))
    for (const timeline of recorder.timelines) {
      expect(timeline.vars.scrollTrigger).toMatchObject({ start: 'top 84%', once: true })
      expect(timeline.steps[0].from).toEqual({ clipPath: 'inset(0% 0% 0% 100%)' })
    }
  })

  it('raise the closing’s heading line by line, fade its line up and draw its seam, once', async () => {
    renderPage()
    await flushMotion()

    const split = recorder.motion.SplitText.create.mock.calls.map(([element]) => element)
    expect(sameElements(split, all('[data-split]'))).toBe(true)
    expect(split.map((element) => element.textContent.replace(/\s+/g, ' ').trim())).toEqual(['Имате идея за проект?'])
    const fades = fromsWith('y')
    expect(sameElements(targetsOf(fades), all('[data-fade]'))).toBe(true)
    for (const { vars } of fades) expect(vars).toMatchObject({ opacity: 0, y: 16, scrollTrigger: { start: 'top 92%', once: true } })
    const draws = fromsWith('scaleY')
    expect(sameElements(targetsOf(draws), all('[data-draw]'))).toBe(true)
    expect(draws).toHaveLength(1)
  })

  // Spec §4.2: the opening is CSS only: nothing in its head or its first row
  // is split, faded, drawn or tweened by script.
  it('leave the opening and the first row to their CSS', async () => {
    renderPage()
    await flushMotion()

    const opening = [document.querySelector('.ob__head'), document.querySelector('#top .wk:first-child')]
    for (const part of opening) {
      expect(part.querySelectorAll('[data-split], [data-fade], [data-draw], [data-wipe]')).toHaveLength(0)
      expect(targetsOf(recorder.tweens).some((element) => part.contains(element))).toBe(false)
    }
    expect(recorder.timelines.some(({ vars }) => opening.some((part) => part.contains(vars.scrollTrigger.trigger)))).toBe(false)
  })

  // Spec §4.2 (useMotion is never used above the fold): no motion's scope
  // takes in the opening, the head or the first row, nor lies inside it.
  // Each row below the first is the scope of its own wipes, and the closing
  // of its reveals.
  it('scope no motion over the opening: each row below the first is its own', async () => {
    renderPage()
    await flushMotion()

    const scopes = [...new Set(recorder.motion.gsap.context.mock.calls.map(([, scope]) => scope))]
    const opening = [document.querySelector('.ob__head'), document.querySelector('#top .wk:first-child')]
    for (const scope of scopes) {
      for (const part of opening) expect(scope.contains(part) || part.contains(scope)).toBe(false)
    }
    expect(sameElements(scopes, [...all('#top .wk:not(:first-child)'), document.querySelector('.ob-close')])).toBe(true)
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

// Spec §7.2 (the concept's js/obekti.js:30-56): a filter with motion fades
// the rows it drops out (0.28 s), then the rows that stay close the gaps
// with Flip (0.75 s expo.inOut), and the rows it brings fade in (0.6 s,
// 0.3 s late).
describe('the filter, with motion', () => {
  it('fades the rows it drops, then closes the gaps with Flip', async () => {
    renderPage({ media: { fine: true } })
    await flushMotion()
    recorder.reset()
    const filter = screen.getByRole('group', { name: 'Покажи' })
    const rows = all('#top .wk')

    fireEvent.click(within(filter).getByRole('button', { name: 'Груб строеж 1' }))
    expect(within(filter).getByRole('button', { name: 'Груб строеж 1' })).toHaveAttribute('aria-pressed', 'true')
    const fade = recorder.tweens.find((tween) => tween.method === 'to' && tween.vars.opacity === 0)
    expect(targetsOf([fade])).toEqual(rows.filter((row) => row.id !== 'panorama'))
    expect(fade.vars).toMatchObject({ duration: 0.28, ease: 'power2.out' })
    // The register keeps its rows until the fade is done.
    expect(rows.filter((row) => !row.hidden)).toHaveLength(7)

    await act(async () => fade.vars.onComplete())
    await waitFor(() => expect(flip.Flip.from).toHaveBeenCalled())
    expect(loadFlip).toHaveBeenCalled()
    expect(flip.Flip.getState).toHaveBeenCalledWith([rows[2]])
    expect(flip.Flip.from.mock.calls[0][1]).toMatchObject({ duration: 0.75, ease: 'expo.inOut' })
    expect(rows.filter((row) => !row.hidden).map((row) => row.id)).toEqual(['panorama'])
  })

  it('fades the rows it brings back in, 0.3 s late', async () => {
    renderPage({ media: { fine: true } })
    await flushMotion()
    const filter = screen.getByRole('group', { name: 'Покажи' })
    fireEvent.click(within(filter).getByRole('button', { name: 'Груб строеж 1' }))
    await act(async () => recorder.tweens.find((tween) => tween.method === 'to' && tween.vars.opacity === 0).vars.onComplete())
    await waitFor(() => expect(flip.Flip.from).toHaveBeenCalledTimes(1))
    act(() => flip.Flip.from.mock.calls[0][1].onComplete())
    recorder.reset()

    fireEvent.click(within(filter).getByRole('button', { name: 'Всички проекти 7' }))
    // No row leaves: the rows it brings come in at once, faded in.
    await waitFor(() => expect(flip.Flip.from).toHaveBeenCalledTimes(2))
    const rows = all('#top .wk')
    const back = rows.filter((row) => row.id !== 'panorama')
    const fadeIn = recorder.tweens.find((tween) => tween.method === 'to' && tween.vars.opacity === 1)
    expect(targetsOf([fadeIn])).toEqual(back)
    expect(fadeIn.vars).toMatchObject({ duration: 0.6, delay: 0.3, clearProps: 'opacity' })
    expect(rows.every((row) => !row.hidden)).toBe(true)
  })

  // Where Flip cannot load (offline, or a new deploy that replaced its
  // chunk), the fold still lets the fade of the rows it drops end, then
  // changes the rows at once: the dropped rows lose their fade only once it
  // is done (cleared while it plays, the fade would end at opacity 0 and
  // the rows come back unseen), the rows it brings back show at once, and
  // the triggers below are measured again. The filter is then free.
  it('changes the rows at once, once the fade is done, when Flip cannot load', async () => {
    vi.mocked(loadFlip).mockImplementation(() => Promise.reject(new TypeError('Failed to fetch dynamically imported module')))
    renderPage({ media: { fine: true } })
    await flushMotion()
    recorder.reset()
    const filter = screen.getByRole('group', { name: 'Покажи' })
    const rows = all('#top .wk')
    const dropped = rows.filter((row) => row.id !== 'panorama')
    const sets = () => recorder.tweens.filter((tween) => tween.method === 'set')

    fireEvent.click(within(filter).getByRole('button', { name: 'Груб строеж 1' }))
    await waitFor(() => expect(loadFlip).toHaveBeenCalledTimes(1))
    await act(() => new Promise((resolve) => setTimeout(resolve, 0)))
    // Flip has failed and the fade still plays: nothing is cleared, and no
    // row changes, before it ends.
    const fade = recorder.tweens.find((tween) => tween.method === 'to' && tween.vars.opacity === 0)
    expect(targetsOf([fade])).toEqual(dropped)
    expect(sets()).toHaveLength(0)
    expect(rows.filter((row) => !row.hidden)).toHaveLength(7)
    expect(recorder.motion.ScrollTrigger.refresh).not.toHaveBeenCalled()

    await act(async () => fade.vars.onComplete())
    await waitFor(() => expect(rows.filter((row) => !row.hidden).map((row) => row.id)).toEqual(['panorama']))
    expect(sets().map(({ vars }) => vars)).toEqual([{ clearProps: 'opacity' }])
    expect(targetsOf(sets())).toEqual(dropped)
    expect(recorder.motion.ScrollTrigger.refresh).toHaveBeenCalledTimes(1)
    recorder.reset()

    // Flip fails again. No row leaves: the six come back at once, with no
    // fade in, their opacity cleared.
    fireEvent.click(within(filter).getByRole('button', { name: 'Всички проекти 7' }))
    await waitFor(() => expect(rows.every((row) => !row.hidden)).toBe(true))
    await waitFor(() => expect(recorder.motion.ScrollTrigger.refresh).toHaveBeenCalledTimes(1))
    expect(recorder.tweens.filter((tween) => tween.method !== 'set')).toHaveLength(0)
    expect(sets().map(({ vars }) => vars)).toEqual([{ clearProps: 'opacity' }])
    expect(targetsOf(sets())).toEqual(dropped)
    expect(loadFlip).toHaveBeenCalledTimes(2)
    expect(flip.Flip.getState).not.toHaveBeenCalled()
    expect(flip.Flip.from).not.toHaveBeenCalled()
  })
})
