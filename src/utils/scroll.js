import { getLenis } from './lenis'

// Scrolling the page to a section by id, through Lenis when it runs, from the
// Golden Residence landing (golden-residence src/utils/scroll.js @944bb03).

// How far the target may drift during a glide before the jump is re-issued.
const DRIFT_PX = 4
// The room left under an element brought up from below the fold.
const REVEAL_GAP = 16

const pageTop = (el) => el.getBoundingClientRect().top + window.scrollY

// Where the page comes to rest: the element's top less the gap the page leaves
// under a fixed top bar (`scroll-padding-top` on <html>, 0 where none is set,
// which `scrollIntoView` honours itself, and Lenis too, but only for an
// element).
// With `reveal`, an element inside it, the page goes further down when that
// element would otherwise end below the fold, just far enough to show it, and
// never so far that it goes under the bar: on a phone, a form field that a
// hand-off fills and focuses.
// Rounded: Lenis ends a glide when its rounded value meets the rounded target,
// and its lerp only nears the target, so a target ending in exactly .5 neared
// from below never ends (measured on the landing on a 390x844 phone at DPR 3:
// 14316.5 for its contact form). Lenis then rewrites the scroll position on
// every frame and undoes any native scroll, such as a focused field scrolled
// into view.
function restingTop(el, reveal) {
  const parsed = Number.parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop)
  const padding = Number.isNaN(parsed) ? 0 : parsed
  let top = pageTop(el) - padding
  if (reveal) {
    const shown = reveal.getBoundingClientRect().bottom + window.scrollY + REVEAL_GAP - window.innerHeight
    top = Math.max(top, Math.min(shown, pageTop(reveal) - padding))
  }
  return Math.round(top)
}

// Lenis would overwrite a native scroll mid-fling, so go through it when it runs.
//
// The target is a fixed y once the glide starts. If the page grows above the
// section during the glide (the availability sheets arriving), the glide ends
// short, so it is re-issued once from where it ended. Only once: the retry
// carries no onComplete, so this can never loop.
//
// Lenis also clamps the target to a page height it caches, and only refreshes
// that cache a frame or more after the page grows. A jump made in the same task
// as the growth (a deep link re-applied when the sheets land) would stop at the
// old bottom, so each jump re-measures first: measurement only, the same call
// SmoothScroll makes.
//
// `reveal` is the id of an element inside the section to bring on screen too
// (see restingTop); when it is not in the page, the section alone counts.
export function scrollToId(id, { reveal } = {}) {
  const el = document.getElementById(id)
  if (!el) return
  const shown = reveal ? document.getElementById(reveal) : null
  const lenis = getLenis()
  if (lenis) {
    const jump = (options) => {
      lenis.dimensions?.resize()
      lenis.scrollTo(restingTop(el, shown), options)
    }
    const startTop = pageTop(el)
    jump({
      onComplete: () => {
        if (Math.abs(pageTop(el) - startTop) > DRIFT_PX) jump()
      },
    })
  } else {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true
    const behavior = reduce ? 'auto' : 'smooth'
    if (shown) window.scrollTo({ top: restingTop(el, shown), behavior })
    else el.scrollIntoView({ behavior, block: 'start' })
  }
}
