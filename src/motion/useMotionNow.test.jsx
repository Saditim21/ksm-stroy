import { act, renderHook } from '@testing-library/react'
import { vi } from 'vitest'
import { mockMatchMedia } from '../test/media'

// useMotionNow (spec §5.7): for motion that follows an action (a panel that
// opens, a view that switches). The function it returns gives the engine
// when the action happens, if motion is allowed and the engine has loaded;
// otherwise null, and the change is instant.
const fakeMotion = vi.hoisted(() => ({ gsap: {}, ScrollTrigger: { refresh: () => {} } }))
vi.mock('./engine.js', () => ({ default: fakeMotion }))

let useMotionNow
let runtime
let restoreMedia
beforeEach(async () => {
  vi.resetModules()
  runtime = await import('./runtime')
  useMotionNow = (await import('./useMotionNow')).default
})
afterEach(() => {
  restoreMedia?.()
  restoreMedia = undefined
})

it('gives the engine once it has loaded, while motion is allowed', async () => {
  restoreMedia = mockMatchMedia()
  const { result } = renderHook(() => useMotionNow())
  expect(result.current()).toBeNull()

  await act(() => runtime.loadMotion())
  expect(result.current()).toBe(fakeMotion)
})

it('gives nothing without motion, loaded or not', async () => {
  await runtime.loadMotion()
  const { result } = renderHook(() => useMotionNow())
  expect(result.current()).toBeNull()
})

it('gives nothing once the visitor switches reduced motion on', async () => {
  restoreMedia = mockMatchMedia()
  await runtime.loadMotion()
  const { result } = renderHook(() => useMotionNow())
  expect(result.current()).toBe(fakeMotion)

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')
  act(() => {
    reduce.matches = true
    reduce.dispatchEvent(new Event('change'))
  })
  expect(result.current()).toBeNull()
})
