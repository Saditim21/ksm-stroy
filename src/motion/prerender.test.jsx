// @vitest-environment node
import { useRef } from 'react'
import { renderToString } from 'react-dom/server'
import { vi } from 'vitest'

// The build prerenders every page in Node, where there is no window. The
// motion runtime and the foundation around it must import there, and reach
// for the window only once called, mounted or rendered.

test('every module of the motion runtime and its foundation imports with no window', async () => {
  expect(typeof window).toBe('undefined')
  const modules = await Promise.all([
    import('./runtime'), import('./useMotion'), import('./SmoothScroll'), import('./LenisScrollSync'),
    import('./useReveals'), import('./useMotionNow'), import('./flip'),
    import('../utils/motion'), import('../utils/smoothScroll'), import('../utils/lenis'), import('../utils/scroll'),
    import('../utils/screenHeight'), import('../utils/rolling'), import('../utils/viewer'),
    import('../utils/motionGate'), import('../utils/viewTransition'),
    import('../hooks/useMotionAllowed'), import('../hooks/useMediaQuery'),
    import('../hooks/useFinePointer'), import('../hooks/useCoarsePointer'),
    import('../hooks/useScrollLock'), import('../hooks/useSwipe'), import('../hooks/useUnitPanel'),
  ])
  expect(modules).toHaveLength(23)
  modules.forEach((module) => expect(Object.keys(module).length).toBeGreaterThan(0))
})

// The prerendered HTML is the final state: no setup has run on it, and the
// engine is a browser's business, after the page has loaded.
test('a page with motion prerenders as its plain markup, and the engine never loads', async () => {
  const { default: SmoothScroll } = await import('./SmoothScroll')
  const { default: useMotion } = await import('./useMotion')
  const { getMotion } = await import('./runtime')
  const setup = vi.fn()
  function Heading() {
    const ref = useRef(null)
    useMotion(ref, setup)
    return <h2 ref={ref}>Нашите проекти</h2>
  }

  const html = renderToString(<SmoothScroll><Heading /></SmoothScroll>)
  await new Promise((resolve) => setTimeout(resolve, 0))

  expect(html).toBe('<div><h2>Нашите проекти</h2></div>')
  expect(setup).not.toHaveBeenCalled()
  expect(getMotion()).toBeNull()
})
