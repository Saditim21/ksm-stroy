// The motion vocabulary shared by every animation, from the Golden Residence
// landing (golden-residence src/utils/motion.js @944bb03). It imports no GSAP:
// GSAP loads after first paint, and only src/motion/ imports it. There is no
// generic scroll drift (parallax): spec §5.2.5 rules it out.

// GSAP ease names and staggers.
export const EASE_OUT = 'expo.out' // reveals
export const EASE_IN_OUT = 'expo.inOut' // wipes and line draws
export const EASE_FOLLOW = 'power3' // pointer followers
export const LINE_STAGGER = 0.1
export const CHAR_STAGGER = 0.035

// Tailwind's md breakpoint (768px) as a media query, for gsap.matchMedia(),
// window.matchMedia, useMediaQuery and <source media>. One spelling for every
// caller, so a change of breakpoint is one edit.
export const MD_UP = '(min-width: 768px)'

// The clip-path pair for a picture uncovered bottom-up: tween CLIP_HIDDEN to
// CLIP_SHOWN.
export const CLIP_HIDDEN = 'inset(100% 0% 0% 0%)'
export const CLIP_SHOWN = 'inset(0% 0% 0% 0%)'
