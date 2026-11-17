// The wipes' setup (useWipes.js), a chunk of its own that only a page whose
// motion runs loads, once the motion engine is in: what it does is
// useWipes.js's to say. `motion` is the engine useMotion() hands a setup, and
// `scope` the section whose `data-wipe` pictures open.
const FROM = { l: 'inset(0% 0% 0% 100%)', r: 'inset(0% 100% 0% 0%)' }
const FROM_THE_TOP = 'inset(0% 0% 100% 0%)'
const PHONE = '(max-width: 900px)'

export default function wipes({ gsap }, scope) {
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
}
