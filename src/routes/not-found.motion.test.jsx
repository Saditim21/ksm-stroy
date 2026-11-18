import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { recordingMotion, stubIdle } from '../test/gsap'
import { mockMatchMedia } from '../test/media'
import NotFound from './not-found'

// The motion of the 404 page (spec M3/M4 §7.6, §4.2; Diptych §5.5; ruling
// M4-PF11). The whole page is its first viewport, so all of it is CSS
// (notfound.css.test.js): the heading rises, the seam draws, the outlines
// draw in turn and the missing apartment shows last. Nothing below the fold
// reveals, so the page sets up no motion of its own, with motion allowed or
// not, and script never hides, fades or moves a thing.
//
// The motion engine is a recording stand-in (src/test/gsap.js), as the
// engine module useMotion() loads; the matchMedia mock allows motion and
// answers a desktop.

const engine = vi.hoisted(() => ({ motion: null }))
vi.mock('../motion/engine.js', () => ({ default: engine.motion }))
vi.mock('../motion/useMotionNow', () => ({ default: () => () => engine.motion }))
const recorder = recordingMotion()
engine.motion = recorder.motion

let restoreMedia
let flushMotion
beforeEach(() => {
  recorder.reset()
  flushMotion = stubIdle()
})
afterEach(async () => {
  await flushMotion()
  restoreMedia?.()
  restoreMedia = undefined
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

function renderPage(media) {
  restoreMedia = mockMatchMedia(media)
  render(
    <MemoryRouter initialEntries={['/nope']}>
      <NotFound />
    </MemoryRouter>,
  )
}

it.each([
  ['motion allowed', { fine: true }],
  ['reduced motion', { reduce: true }],
])('leaves the whole page to its CSS (%s): no motion set up, nothing hidden by script', async (_, media) => {
  renderPage(media)
  await flushMotion()

  expect(recorder.motion.gsap.context).not.toHaveBeenCalled()
  expect(recorder.tweens).toEqual([])
  expect(recorder.timelines).toEqual([])
  expect(document.querySelectorAll('[data-split], [data-fade], [data-draw], [data-wipe]')).toHaveLength(0)
  expect(document.querySelectorAll('[style*="opacity"], [style*="transform"], [style*="clip"]')).toHaveLength(0)
})
