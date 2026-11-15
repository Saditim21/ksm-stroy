// The views' switch with motion (spec §5.7, §7.8; extract §4.19; the concept's
// gr.js:79-93), played once the switch has committed, from the state Flip
// recorded just before it (ExplorerSection.jsx): the views go from their old
// size to their new over 0.7 s expo.inOut, the tabs' underline from the old
// tab to the new over its own 0.25 s, and the panel coming in rises 26 px over
// 0.7 s expo.out, 0.12 s late. onDone() runs once the views have settled.
//
// A switch with motion always involves the list, so this travels in the
// list's lazy chunk (listChunk.js), out of the route's first-load JS (ruling
// C8.5). Flip and GSAP come from the caller (loadFlip, useMotionNow).
export function playSwitch({ Flip, gsap, state, views, bar, panel, onDone }) {
  Flip.from(state, { targets: views, duration: 0.7, ease: 'expo.inOut', scale: false, simple: true, onComplete: onDone })
  Flip.from(state, { targets: bar, duration: 0.25, ease: 'power2.out', scale: false, simple: true })
  gsap.fromTo(panel, { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.7, ease: 'expo.out', delay: 0.12, clearProps: 'opacity,transform' })
}
