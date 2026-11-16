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
const FROM = { l: 'inset(0% 0% 0% 100%)', r: 'inset(0% 100% 0% 0%)' }
const FROM_THE_TOP = 'inset(0% 0% 100% 0%)'
const PHONE = '(max-width: 900px)'

export default function useWipes(scopeRef) {
  useMotion(scopeRef, ({ gsap }) => {
    const scope = scopeRef.current
    if (!scope) return
    const phone = window.matchMedia(PHONE).matches
    for (const picture of scope.querySelectorAll('[data-wipe]')) {
      if (picture.getBoundingClientRect().top < window.innerHeight) continue
      const img = picture.querySelector('img')
      const wipe = gsap.timeline({ scrollTrigger: { trigger: picture, start: 'top 84%', once: true } })
      wipe.fromTo(
        picture,
        { clipPath: phone ? FROM_THE_TOP : FROM[picture.dataset.wipe] ?? FROM_THE_TOP },
        { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, ease: 'expo.inOut', clearProps: 'clipPath' },
      )
      if (img) wipe.fromTo(img, { scale: 1.14 }, { scale: 1, duration: 1.6, ease: 'expo.out', clearProps: 'transform' }, 0.1)
    }
  })
}
