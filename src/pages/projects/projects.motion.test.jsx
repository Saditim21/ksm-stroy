import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import Projects from '../../routes/projects'
import { recordingMotion, stubIdle } from '../../test/gsap'
import { mockMatchMedia } from '../../test/media'

// Продажби's motion (polish spec §3): the opening is CSS (projects.css); the
// motion engine only reveals what comes up from below. The engine is a
// recording stand-in (src/test/gsap.js): nothing moves, and what would is kept.

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
  vi.spyOn(console, 'log').mockImplementation(() => {})
  flushMotion = stubIdle()
})
afterEach(async () => {
  await flushMotion()
  restoreMedia?.()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

const targetsOf = (step) => [step.targets].flat(Infinity).filter((t) => t instanceof Element)

it('never moves the opening with the engine: it is CSS', async () => {
  restoreMedia = mockMatchMedia({ fine: true })
  render(<MemoryRouter initialEntries={['/projects']}><Projects /></MemoryRouter>)
  await flushMotion()

  const top = document.getElementById('top')
  const moved = [...recorder.tweens, ...recorder.timelines.flatMap((t) => t.steps)].flatMap(targetsOf)
  expect(moved.filter((el) => top.contains(el))).toEqual([])
})

it('starts nothing under reduced motion', async () => {
  restoreMedia = mockMatchMedia({ reduce: true })
  render(<MemoryRouter initialEntries={['/projects']}><Projects /></MemoryRouter>)
  await flushMotion()

  expect(recorder.tweens).toEqual([])
  expect(recorder.timelines).toEqual([])
})
