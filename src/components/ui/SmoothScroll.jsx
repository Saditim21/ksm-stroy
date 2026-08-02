import { useEffect } from 'react'
import { useReducedMotion } from 'framer-motion'
import Lenis from 'lenis'
import { setLenis, clearLenis } from '../../utils/lenis'

// Lenis drives real scroll + rAF browser APIs that jsdom doesn't implement (no
// native scroll physics, and an uninterrupted rAF loop would never settle in a
// test run). Vitest sets `import.meta.env.MODE` to 'test', so that is the
// primary, deterministic gate: the test environment never even attempts to
// touch Lenis, rather than relying on it happening to throw. The try/catch
// around init is a second line of defense for any other non-browser/headless
// context (e.g. a future SSR pass) this component hasn't been audited for.
//
// The instance is published to src/utils/lenis.js on init and retracted on
// destroy, so code outside the React tree (App's route-change scroll) can
// cancel an in-flight fling instead of being overwritten by it.
export default function SmoothScroll({ children }) {
  const reduce = useReducedMotion()

  useEffect(() => {
    if (reduce || import.meta.env.MODE === 'test') return undefined

    let lenis
    let rafId
    try {
      lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 })
      setLenis(lenis)
      const raf = (time) => {
        lenis.raf(time)
        rafId = requestAnimationFrame(raf)
      }
      rafId = requestAnimationFrame(raf)
    } catch {
      // Non-browser/unsupported environment — degrade to native scroll.
      return undefined
    }

    return () => {
      if (rafId !== undefined) cancelAnimationFrame(rafId)
      clearLenis(lenis)
      lenis.destroy()
    }
  }, [reduce])

  // Renders children directly — SmoothScroll is a behavior-only provider, not
  // a layout wrapper, so it must not introduce an extra DOM element.
  return <>{children}</>
}
