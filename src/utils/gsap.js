import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { useGSAP } from '@gsap/react'

// The one place GSAP's plugins are registered, from the Golden Residence
// landing (golden-residence src/utils/gsap.js @944bb03). Components import
// gsap, ScrollTrigger, SplitText and useGSAP from here, never from 'gsap'.
//
// Nothing is registered without a window, so this module is safe to import
// while pre-rendering in Node: there is nothing to animate there, and every
// animation waits for useMotionAllowed, which is false without a window.
if (typeof window !== 'undefined') {
  gsap.registerPlugin(useGSAP, SplitText)

  // Registering ScrollTrigger opens a gsap.matchMedia() context, and that calls
  // window.matchMedia at once. Every browser has it; jsdom does not, so there
  // the registration would throw on import and take every test file with it.
  // Nothing needs the plugin in that window: every ScrollTrigger is created
  // behind useMotionAllowed, which is false without matchMedia. A test that
  // installs src/test/media.js's mock registers the plugin there.
  if (typeof window.matchMedia === 'function') {
    gsap.registerPlugin(ScrollTrigger)
    // Mobile address bars resize the viewport as they slide; re-measuring every
    // trigger for that would make the page jump mid-scroll.
    ScrollTrigger.config({ ignoreMobileResize: true })
  }
}

export { gsap, ScrollTrigger, SplitText, useGSAP }
