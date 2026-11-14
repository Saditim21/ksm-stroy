import { vi } from 'vitest'
import { mockMatchMedia } from '../test/media'

// engine.js, the deferred motion chunk, registers GSAP's plugins on import.
// Only a browser loads it (runtime.js), and every browser has matchMedia,
// which registering ScrollTrigger calls at once: jsdom gets the mock first.

let restore
afterEach(() => {
  restore?.()
  restore = undefined
  vi.restoreAllMocks()
})

test('is GSAP with ScrollTrigger and SplitText registered, and Lenis', async () => {
  restore = mockMatchMedia()
  // The libraries first, so the spies sit on the very instances the engine
  // registers with.
  const { gsap } = await import('gsap')
  const { ScrollTrigger } = await import('gsap/ScrollTrigger')
  const { SplitText } = await import('gsap/SplitText')
  const { default: Lenis } = await import('lenis')
  const registerPlugin = vi.spyOn(gsap, 'registerPlugin')
  const config = vi.spyOn(ScrollTrigger, 'config')

  const { default: engine } = await import('./engine')

  expect(engine).toEqual({ gsap, ScrollTrigger, SplitText, Lenis })
  expect(registerPlugin.mock.calls).toEqual([[ScrollTrigger, SplitText]])
  // Mobile address bars sliding in and out re-measure nothing.
  expect(config.mock.calls).toEqual([[{ ignoreMobileResize: true }]])
})
