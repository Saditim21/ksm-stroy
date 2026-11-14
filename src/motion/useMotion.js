import { useLayoutEffect } from 'react'
import useMotionAllowed from '../hooks/useMotionAllowed'
import { getLenis } from '../utils/lenis'
import { loadMotion, scheduleInit } from './runtime'

// How a component declares its motion (spec §5.1):
//
//   useMotion(ref, ({ gsap, ScrollTrigger, SplitText, Lenis, lenis }) => {
//     gsap.from('.line', { yPercent: 110, scrollTrigger: { trigger: ref.current } })
//     return () => { /* undo what GSAP does not, such as a listener */ }
//   }, [deps])
//
// Nothing happens unless useMotionAllowed() says so: not on the server, not
// while hydrating, not under reduced motion or data saver, not in tests that
// leave matchMedia out. The markup is the final state, and the setup only
// ever animates from it. Otherwise the motion engine loads (runtime.js), and
// the setup waits for its turn in the idle queue. It runs inside a
// gsap.context scoped to `scopeRef.current`, so selector text finds only that
// element's descendants. `lenis` is the running Lenis, or null.
//
// When the component unmounts, or a dep changes, the function the setup
// returned is called and the context is reverted, which undoes every
// animation, ScrollTrigger and SplitText the setup created. A setup that
// has not run by then never runs. `deps` works as for useEffect: the setup
// from the render that changed them is the one that runs.
export default function useMotion(scopeRef, setup, deps = []) {
  const allowed = useMotionAllowed()

  useLayoutEffect(() => {
    if (!allowed) return undefined
    let live = true
    let ctx
    let cleanup
    loadMotion().then(
      (motion) => {
        if (!live) return
        scheduleInit(() => {
          if (!live) return
          let failure = null
          ctx = motion.gsap.context(() => {
            try {
              cleanup = setup({ ...motion, lenis: getLenis() })
            } catch (error) {
              failure = { error }
            }
          }, scopeRef.current)
          // Rethrown out here, not from inside the context: GSAP leaves a
          // context whose function throws as the current one, and every
          // animation made after it, anywhere, would join it.
          if (failure) throw failure.error
        })
      },
      () => {
        // The engine could not load (offline, or a new deploy replaced its
        // chunk): the page stays as it is, complete and static.
      },
    )
    return () => {
      live = false
      if (typeof cleanup === 'function') cleanup()
      ctx?.revert()
    }
    // The caller's deps, plus `allowed`, so the motion stops when the visitor
    // switches reduced motion on.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowed, ...deps])
}
