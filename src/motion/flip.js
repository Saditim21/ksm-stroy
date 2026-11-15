import { loadMotion } from './runtime'

// Flip (spec §5.1): a lazy chunk of its own, apart from the motion engine
// (engine.js, whose budget it would strain), for the one place that uses it,
// the „Визуално / По критерии“ switch. It ships inside the gsap package. The
// first call loads it with the engine and registers it on the engine's GSAP;
// every call shares that one promise, and a load that failed may be tried
// again. Like the engine, only a browser where motion is allowed should ask
// for it (useMotionNow, or the motion gate's `js`), and nothing loads it
// before then, so it is never in a route's first-load JS
// (scripts/check-dist.mjs). This loader is not either: only the explorer's
// surfaces' chunk imports it (src/explorer/surfaces.js), which preloads Flip
// and hands this to the switch (ruling C8.6).
/** @type {Promise<typeof import('gsap/Flip').Flip> | null} */
let loading = null

export function loadFlip() {
  loading ??= Promise.all([loadMotion(), import('gsap/Flip')]).then(
    ([{ gsap }, { Flip }]) => {
      gsap.registerPlugin(Flip)
      return Flip
    },
    (error) => {
      loading = null
      throw error
    },
  )
  return loading
}
