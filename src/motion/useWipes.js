import { useState } from 'react'
import useMotion from './useMotion'

// The pictures of a section that open from the seam as they come into view
// (spec M3 §4.2; the concept's data-wipe, c2-diptych js/core.js:210-217): a
// reveal of its own, for the pages that use it, so useReveals, which ships
// on Home and Golden Residence, does not grow (ruling PF8). Once the page
// has loaded, and where motion is allowed, one setup for the section
// (useMotion) finds each `data-wipe` picture inside it:
// - data-wipe="l", a picture left of the seam, opens from its right edge,
//   the seam's; "r", right of it, from its left edge; with no side, from
//   its top. On a phone, where the halves stack and the seam hides, it
//   opens from its top, as a gallery's spreads do there (Spreads.jsx).
// - It opens over 1.2 s expo.inOut, its picture settling from 1.14 over
//   1.6 s, once, as the picture's top reaches 84 % of the screen.
// What the opening sets goes with it. What is already on screen when the
// setup runs stays as it is: the first viewport never moves for JS (its
// motion is CSS, spec §5.5). The markup is the final state.
//
// The setup is a chunk of its own (wipes.js), out of the page's first-load
// JS (M3 §10, ruling T2a: Многофамилна's main page offsets the bytes its
// block pages' shared code costs it): the first run of the motion loads it,
// where motion runs at all, and the setup runs once it is in, long before
// the section comes up from below. A chunk that does not load leaves the
// pictures as they are, open.
export default function useWipes(scopeRef) {
  const [wipes, setWipes] = useState(null)
  useMotion(scopeRef, (motion) => {
    if (wipes) return wipes(motion, scopeRef.current)
    import('./wipes').then((module) => setWipes(() => module.default), () => {})
    return undefined
  }, [wipes])
}
