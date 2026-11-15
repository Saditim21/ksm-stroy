import { getLenis } from './lenis'
import { EXPO_IN_OUT } from './motion'

// Scrolling the page to a section by id, through Lenis when it runs, from the
// Golden Residence landing (golden-residence src/utils/scroll.js @944bb03),
// with Diptych's glide (spec §5.3), and the one handler for a link to a
// section of the same page.

// How far the target may drift during a glide before the jump is re-issued.
const DRIFT_PX = 4
// The room left under an element brought up from below the fold.
const REVEAL_GAP = 16
// Every jump to a section glides 1.5 s on expo.inOut, as the concept's do.
const GLIDE = { duration: 1.5, easing: EXPO_IN_OUT }

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
      lenis.scrollTo(restingTop(el, shown), { ...GLIDE, ...options })
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

// Jumps the page to a section by id, at once, with no glide: where a glide to
// it would come to rest (restingTop). A deep link that opens the plan stage
// on arrival lands at #explorer this way first (spec §7.10), so closing the
// stage leaves the reader at the facade. Natively, and through Lenis when it
// runs, measured afresh and forced: a dialog's scroll lock may have stopped
// it, and a stopped Lenis ignores any other jump.
export function jumpToId(id) {
  const el = document.getElementById(id)
  if (!el) return
  const top = restingTop(el)
  window.scrollTo(0, top)
  const lenis = getLenis()
  if (!lenis) return
  lenis.dimensions?.resize()
  lenis.scrollTo(top, { immediate: true, force: true })
}

// The one handler for a link to a section of the same page (spec §5.3).
// Button attaches it to every href that starts with "#"; a plain anchor to a
// section of its page calls it from its own onClick.
//
// For a plain left click (a modifier key opens a tab or a window) on a link
// to an element on this page, it takes the click from the browser and the
// router: their jump is instant, and the router's new location would have
// LenisScrollSync cut any glide short. It glides there instead (scrollToId),
// and moves the focus there without a scroll of its own, so a keyboard or a
// screen reader lands there too; an element that takes no focus gets
// tabindex="-1" for it. The address stays as it is. Anything else, such as a
// link to an element the page does not have, stays the browser's.
export function glideToHash(event) {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
  const href = event.currentTarget.getAttribute('href') ?? ''
  if (!href.startsWith('#') || href.length === 1) return
  let id
  try {
    id = decodeURIComponent(href.slice(1))
  } catch {
    return
  }
  const target = document.getElementById(id)
  if (!target) return
  event.preventDefault()
  scrollToId(id)
  if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1')
  target.focus({ preventScroll: true })
}
