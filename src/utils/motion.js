import { gsap } from './gsap'

// The motion vocabulary shared by every animation, from the Golden Residence
// landing (golden-residence src/utils/motion.js @944bb03).

// GSAP ease names and staggers.
export const EASE_OUT = 'expo.out' // reveals
export const EASE_IN_OUT = 'expo.inOut' // wipes and line draws
export const EASE_FOLLOW = 'power3' // pointer followers
export const LINE_STAGGER = 0.1
export const CHAR_STAGGER = 0.035

// Tailwind's md breakpoint (768px) as a media query, for gsap.matchMedia(),
// window.matchMedia, useMediaQuery and <source media>: scroll drift, for one,
// runs from here up. One spelling for every caller, so a change of breakpoint
// is one edit.
export const MD_UP = '(min-width: 768px)'

// The clip-path pair for a picture uncovered bottom-up: tween CLIP_HIDDEN to
// CLIP_SHOWN.
export const CLIP_HIDDEN = 'inset(100% 0% 0% 0%)'
export const CLIP_SHOWN = 'inset(0% 0% 0% 0%)'

// A picture drifting against the scroll: its layer moves from -6 to +6 yPercent
// while the trigger scrubs. Held at scale 1.14 throughout, so there are 7% spare
// on each side against a 6% drift and the frame's edge never shows. `scrollTrigger`
// carries the caller's trigger, start and end; scrub is on unless it says otherwise.
// Call it inside useGSAP, from md up (MD_UP).
export function scrubDrift(el, scrollTrigger) {
  return gsap.fromTo(el, { yPercent: -6, scale: 1.14 }, {
    yPercent: 6,
    scale: 1.14,
    ease: 'none',
    scrollTrigger: { scrub: true, ...scrollTrigger },
  })
}
