// @vitest-environment node
import { vi } from 'vitest'

// A pre-render in Node has no window: src/utils/gsap.js must import there and
// register nothing (see gsap.test.js for a browser window).

test('imports with no window and registers no plugin', async () => {
  expect(typeof window).toBe('undefined')
  const { gsap } = await import('gsap')
  const { ScrollTrigger } = await import('gsap/ScrollTrigger')
  const registerPlugin = vi.spyOn(gsap, 'registerPlugin')
  const config = vi.spyOn(ScrollTrigger, 'config')

  const module = await import('./gsap')

  expect(module.gsap).toBe(gsap)
  expect(module.ScrollTrigger).toBe(ScrollTrigger)
  expect(registerPlugin).not.toHaveBeenCalled()
  expect(config).not.toHaveBeenCalled()
})

// They reach for the window only once called, mounted or rendered.
test('every module of the motion foundation imports with no window', async () => {
  const modules = await Promise.all([
    import('./motion'), import('./smoothScroll'), import('./lenis'), import('./scroll'),
    import('./screenHeight'), import('./rolling'), import('./viewer'),
    import('../hooks/useMotionAllowed'), import('../hooks/useMediaQuery'),
    import('../hooks/useFinePointer'), import('../hooks/useCoarsePointer'),
    import('../hooks/useMagnetic'), import('../hooks/useScrollLock'),
    import('../hooks/useSwipe'), import('../hooks/useUnitPanel'),
    import('../components/ui/SmoothScroll'),
  ])
  expect(modules).toHaveLength(16)
  modules.forEach((module) => expect(Object.keys(module).length).toBeGreaterThan(0))
})
