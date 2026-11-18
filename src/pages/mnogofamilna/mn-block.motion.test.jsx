import { act, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { goOffline } from '../../../tests/contracts/site'
import { resetInquiry } from '../../components/inquiry/inquiryStore'
import { named } from '../../explorer/testing'
import { recordingMotion, stubIdle } from '../../test/gsap'
import { mockMatchMedia } from '../../test/media'
import MnBlockPage from './MnBlockPage'

// A block page's floors follow the reader on a desktop (spec M3 §6.5; the
// concept's mnogofamilna-block-a.js:123-136): once the floors' column has
// come up past 30 % of the screen, the row across the screen's middle (55 %
// down) is the hot floor, its floor lit on the pinned facade, as pointing at
// it would. One ScrollTrigger reads the rows as the page scrolls (useMotion,
// ruling PF15: above the fold, as it moves nothing itself), only where a fine
// pointer hovers; on a touch screen there is none. Before the reader scrolls
// nothing is hot.
//
// The motion engine is a recording stand-in (src/test/gsap.js), as the
// engine module useMotion() loads and as what useMotionNow() hands over; the
// matchMedia mock allows motion. jsdom lays nothing out: each row is placed
// where the case needs it, on jsdom's 768 px screen.

const engine = vi.hoisted(() => ({ motion: null }))
vi.mock('../../motion/engine.js', () => ({ default: engine.motion }))
vi.mock('../../motion/useMotionNow', () => ({ default: () => () => engine.motion }))
const recorder = recordingMotion()
engine.motion = recorder.motion

const SCREEN = 768
const DESKTOP = '(hover: hover) and (pointer: fine) and (min-width: 901px)'

let restoreMedia
let flushMotion
beforeEach(() => {
  goOffline()
  recorder.reset()
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

const place = (element, top, height) => vi.spyOn(element, 'getBoundingClientRect')
  .mockReturnValue({ top, bottom: top + height, left: 0, right: 720, width: 720, height, x: 0, y: top })

async function renderPage(media) {
  restoreMedia = mockMatchMedia(media)
  render(
    <MemoryRouter initialEntries={['/projects/mnogofamilna-sgrada/block-a']}>
      <MnBlockPage block="А" />
    </MemoryRouter>,
  )
  await flushMotion()
  const rows = document.querySelector('#explorer .mbl__rows')
  return { rows, trigger: recorder.triggers.find((vars) => vars.trigger === rows) }
}

// The rows' column `top` px down the screen, its rows 300 px tall each, 10
// down to 2.
function scrolledTo(rows, top) {
  place(rows, top, 9 * 300)
  for (const [i, row] of [...rows.querySelectorAll('.mbr')].entries()) place(row, top + i * 300, 300)
}

const hotRows = () => [...document.querySelectorAll('#explorer .mbr.is-hot')].map((row) => row.getAttribute('data-k'))

it('on a desktop, lights the floor whose row crosses the middle of the screen', async () => {
  const { rows, trigger } = await renderPage({ fine: true })
  expect(window.matchMedia(DESKTOP).matches).toBe(true)
  expect(trigger).toBeDefined()
  expect([trigger.start, trigger.end]).toEqual(['top bottom', 'bottom top'])

  // The column's top at -500 px: floor 7, its fourth row, spans 400–700 px,
  // across the 55 % line (422 px).
  scrolledTo(rows, -500)
  act(() => trigger.onUpdate())

  expect(hotRows()).toEqual(['А-7'])
  expect(document.querySelector('#explorer .fx__cnt[data-k="А-7"]')).toHaveClass('is-hot')
  expect(document.querySelector('#explorer .fx')).toHaveClass('is-hot')

  // Further down, the next floor; past the floors, none.
  scrolledTo(rows, -800)
  act(() => trigger.onUpdate())
  expect(hotRows()).toEqual(['А-6'])
  scrolledTo(rows, -3000)
  act(() => trigger.onLeave())
  expect(hotRows()).toEqual([])
  expect(document.querySelector('#explorer .fx')).not.toHaveClass('is-hot')
})

// Ruling PF15: nothing changes before the visitor scrolls. At the top of
// the page the floors' column starts below 30 % of the screen.
it('lights nothing at scroll 0', async () => {
  const { rows, trigger } = await renderPage({ fine: true })

  scrolledTo(rows, 0.6 * SCREEN)
  act(() => trigger.onUpdate())
  expect(hotRows()).toEqual([])
  expect(document.querySelector('#explorer .fx')).not.toHaveClass('is-hot')
})

// A pointer the reader holds over a floor keeps it: the middle row waits.
// Once the pointer leaves, the middle row comes back after the hot floor's
// 320 ms, in the same update as the pointed floor lets go: the facade's lens
// glides from the pointed floor to the middle row's, and its lit floor never
// goes out on the way (its tint never fades to 0).
it('keeps a floor pointed at while the page scrolls under it, and gives the middle row back once it lets go', async () => {
  const { rows, trigger } = await renderPage({ fine: true })
  const pointed = document.querySelector('#explorer .mbr[data-k="А-3"]')
  const tint = document.querySelector('#explorer .fx__tint')

  fireEvent.pointerOver(pointed, { pointerType: 'mouse' })
  scrolledTo(rows, -500)
  act(() => trigger.onUpdate())
  expect(hotRows()).toEqual(['А-3'])

  vi.useFakeTimers()
  try {
    recorder.reset()
    fireEvent.pointerLeave(rows, { pointerType: 'mouse' })
    act(() => vi.advanceTimersByTime(319))
    expect(hotRows()).toEqual(['А-3'])

    act(() => vi.advanceTimersByTime(1))
    expect(hotRows()).toEqual(['А-7'])
    expect(document.querySelector('#explorer .fx__cnt[data-k="А-7"]')).toHaveClass('is-hot')
    expect(document.querySelector('#explorer .fx')).toHaveClass('is-hot')
    const fades = recorder.tweens.filter((tween) => tween.targets === tint)
    expect(fades.map((tween) => tween.vars.attr)).toEqual([])
    const glides = recorder.tweens.filter((tween) => Array.isArray(tween.targets) && tween.targets.includes(tint))
    expect(glides).toHaveLength(1)
    expect(glides[0].vars.attr).toEqual(expect.objectContaining({ x: expect.any(Number), y: expect.any(Number) }))
  } finally {
    vi.useRealTimers()
  }
})

// A window narrowed to a phone's width lets the middle row go: the facade
// there is not pinned beside the floors.
it('lets the middle row go below 901 px', async () => {
  const { rows, trigger } = await renderPage({ fine: true })
  scrolledTo(rows, -500)
  act(() => trigger.onUpdate())
  expect(hotRows()).toEqual(['А-7'])

  window.matchMedia(DESKTOP).matches = false
  act(() => trigger.onUpdate())
  expect(hotRows()).toEqual([])
})

// M3 minor (MnBlockPage.jsx): reduced motion switched on mid-page reverts
// the ScrollTrigger, and the row it had lit goes with it, rather than stay
// hot with nothing left to move it.
it('lets the middle row go when the motion stops mid-page', async () => {
  const { rows, trigger } = await renderPage({ fine: true })
  scrolledTo(rows, -500)
  act(() => trigger.onUpdate())
  expect(hotRows()).toEqual(['А-7'])

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')
  reduce.matches = true
  act(() => reduce.dispatchEvent(new Event('change')))
  await flushMotion()
  expect(hotRows()).toEqual([])
  expect(document.querySelector('#explorer .fx')).not.toHaveClass('is-hot')
})

it('sets nothing up on a touch screen', async () => {
  await renderPage({ coarse: true })

  expect(recorder.triggers.find((vars) => vars.trigger === document.querySelector('#explorer .mbl__rows'))).toBeUndefined()
})

// Spec M3 §6.5 (M3 minor, mn-block.test.jsx): a floor opened from a row grows
// from that row's plan, the stage's morph (its ghost leaves the row's place),
// and so does one opened on the facade while its row is on the screen; with
// the row off the screen there is no place to grow from, and the stage fades
// in. jsdom lays nothing out: the row's plan is placed where the case needs.
describe('the floor’s stage, as it opens', () => {
  const ghostMoved = () => recorder.tweens.some(({ method, targets }) => method === 'set' && targets?.classList?.contains('ps__ghost'))
  const faded = () => recorder.tweens.some(({ method, targets, from }) => method === 'fromTo' && targets?.classList?.contains('ps') && from?.opacity === 0)
  const planOf = (key) => document.querySelector(`#explorer .mbr[data-k="${key}"] .mbr__plan svg`)

  it('grows from the row’s plan when the row’s „Отворете плана“ opens it', async () => {
    await renderPage({ fine: true })
    const plan = planOf('А-7')
    const measured = place(plan, 420, 180)

    fireEvent.click(document.querySelector('#explorer .mbr[data-k="А-7"] .mbr__go'))
    await screen.findByRole('dialog', { name: named('Блок А · Етаж 7') }, { timeout: 15000 })
    expect(measured).toHaveBeenCalled()
    expect(ghostMoved()).toBe(true)
    expect(faded()).toBe(false)
  }, 30000)

  it.each([
    ['on the screen', 300, true],
    ['off the screen', SCREEN + 200, false],
  ])('grows from the row’s plan when the facade opens a floor whose row is %s', async (_, top, grows) => {
    await renderPage({ fine: true })
    place(planOf('А-7'), top, 180)

    fireEvent.click(document.querySelector('#explorer .fx__cnt[data-k="А-7"]'))
    await screen.findByRole('dialog', { name: named('Блок А · Етаж 7') }, { timeout: 15000 })
    expect(ghostMoved()).toBe(grows)
    expect(faded()).toBe(!grows)
  }, 30000)
})
