import { act, fireEvent, render } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { goOffline } from '../../../tests/contracts/site'
import { resetInquiry } from '../../components/inquiry/inquiryStore'
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
it('keeps a floor pointed at while the page scrolls under it', async () => {
  const { rows, trigger } = await renderPage({ fine: true })
  const pointed = document.querySelector('#explorer .mbr[data-k="А-3"]')

  fireEvent.pointerOver(pointed, { pointerType: 'mouse' })
  scrolledTo(rows, -500)
  act(() => trigger.onUpdate())
  expect(hotRows()).toEqual(['А-3'])
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

it('sets nothing up on a touch screen', async () => {
  await renderPage({ coarse: true })

  expect(recorder.triggers.find((vars) => vars.trigger === document.querySelector('#explorer .mbl__rows'))).toBeUndefined()
})
