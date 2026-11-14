import { loadMotion } from './runtime'

// Flip (spec §5.1): a lazy chunk of its own, apart from the motion engine
// (engine.js, whose budget it would strain), for the one place that uses it,
// the „Визуално / По критерии“ switch. It ships inside the gsap package. The
// first call loads it with the engine and registers it on the engine's GSAP;
// every call shares that one promise. Like the engine, only a browser where
// motion is allowed should ask for it (useMotionNow), and nothing loads it
// before then, so it is never in a route's first-load JS
// (scripts/check-dist.mjs).
/** @type {Promise<typeof import('gsap/Flip').Flip> | null} */
let loading = null

export function loadFlip() {
  if (!loading) {
    loading = Promise.all([loadMotion(), import('gsap/Flip')]).then(([{ gsap }, { Flip }]) => {
      gsap.registerPlugin(Flip)
      return Flip
    })
  }
  return loading
}
