import { loadMotion } from './runtime'

// Flip (spec §5.1): a lazy chunk of its own, apart from the motion engine
// (engine.js, whose budget it would strain), for the places that use it: the
// explorer's „Визуално / По критерии“ switch, and Обекти's filter and book
// (M3/M4 §7.2). It ships inside the gsap package. The first call loads it
// with the engine and registers it on the engine's GSAP; every call shares
// that one promise, and a load that failed may be tried again. Like the
// engine, only a browser where motion is allowed should ask for it
// (useMotionNow, or the motion gate's `js`), and nothing loads it before
// then, so it is never in a route's first-load JS (scripts/check-dist.mjs).
// This loader is not either: only lazy chunks import it, the explorer's
// surfaces' chunk (src/explorer/surfaces.js), which preloads Flip and hands
// this to the switch (ruling C8.6), and Обекти's book
// (src/pages/works/Book.jsx); Обекти's register reaches it by import().
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
