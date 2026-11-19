import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import About from '../../routes/about'
import { recordingMotion, stubIdle } from '../../test/gsap'
import { mockMatchMedia } from '../../test/media'

// За нас's motion (polish spec §4): the wall's zoom and the works' sideways
// track, both scrubbed by the scroll and pinned. The engine is a recording
// stand-in (src/test/gsap.js): nothing moves, and what would is kept.

const engine = vi.hoisted(() => ({ motion: null }))
vi.mock('../../motion/engine.js', () => ({ default: engine.motion }))
vi.mock('../../motion/useMotionNow', () => ({ default: () => () => engine.motion }))
const recorder = recordingMotion()
engine.motion = recorder.motion

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
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

const renderPage = async (media) => {
  restoreMedia = mockMatchMedia(media)
  render(<MemoryRouter initialEntries={['/about']}><About /></MemoryRouter>)
  await flushMotion()
}

it('pins the wall and zooms it into its centre with the scroll', async () => {
  await renderPage({ fine: true })

  const zoom = recorder.timelines.find((t) => t.vars.scrollTrigger?.trigger === document.querySelector('.wl__pin'))
  expect(zoom).toBeDefined()
  expect(zoom.vars.scrollTrigger).toMatchObject({ pin: true, start: 'top top' })
  expect(zoom.vars.scrollTrigger.scrub).toBeTruthy()
  const grow = zoom.steps.find((step) => step.targets === document.querySelector('.wl__grid'))
  expect(typeof grow.vars.scale).toBe('function')
})

it('pins the works and slides their track sideways on a desktop', async () => {
  await renderPage({ fine: true })

  const slide = recorder.tweens.find((t) => t.targets === document.querySelector('.trk__track'))
  expect(slide).toBeDefined()
  expect(slide.vars.scrollTrigger).toMatchObject({ pin: true })
})

it('moves nothing under reduced motion', async () => {
  await renderPage({ reduce: true })

  expect(recorder.tweens).toEqual([])
  expect(recorder.timelines).toEqual([])
})
