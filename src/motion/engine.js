import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import Lenis from 'lenis'

// The motion engine: GSAP with ScrollTrigger and SplitText, and Lenis (spec
// §5.1). This is the only module that imports them. Nothing imports it
// statically: src/motion/runtime.js loads it with import() after the page
// has loaded, so all of it is one deferred chunk, never part of a route's
// first-load JS (scripts/check-dist.mjs fails the build if it is).
//
// Only a browser where motion is allowed ever loads it, and such a browser has
// matchMedia, which registering ScrollTrigger calls at once.
gsap.registerPlugin(ScrollTrigger, SplitText)

// Mobile address bars resize the viewport as they slide; re-measuring every
// trigger for that would make the page jump mid-scroll.
ScrollTrigger.config({ ignoreMobileResize: true })

export default { gsap, ScrollTrigger, SplitText, Lenis }
