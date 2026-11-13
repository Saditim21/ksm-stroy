import useFinePointer from './useFinePointer'
import useMotionAllowed from './useMotionAllowed'
import { gsap, useGSAP } from '../utils/gsap'
import { EASE_FOLLOW } from '../utils/motion'

// Back to rest when the pointer leaves.
const SPRING = { x: 0, y: 0, duration: 1, ease: 'elastic.out(1, 0.35)' }

// Makes an element lean toward the pointer, from golden-residence
// src/hooks/useMagnetic.js @944bb03: it follows by `strength` of the pointer's
// offset from its centre, and its label (`[data-magnetic-inner]`, when there
// is one) by `inner`, through quickTo at 0.6 s; on leaving, both spring back
// over 1 s. Only with a fine pointer and motion allowed. A ref that holds no
// element does nothing, which is how a component opts out (hooks cannot be
// called conditionally).
//
// GSAP then writes the element's transform every frame, so it must not
// transition `transform` in CSS: that would drag each frame out.
export default function useMagnetic(ref, { strength = 0.35, inner = 0.15 } = {}) {
  const motionOk = useMotionAllowed()
  const fine = useFinePointer()

  useGSAP((context, contextSafe) => {
    const el = ref.current
    if (!motionOk || !fine || !el) return undefined
    const label = el.querySelector('[data-magnetic-inner]')
    const follow = (target, prop) => gsap.quickTo(target, prop, { duration: 0.6, ease: EASE_FOLLOW })
    const xTo = follow(el, 'x')
    const yTo = follow(el, 'y')
    const labelTo = label && { x: follow(label, 'x'), y: follow(label, 'y') }
    let springs = []

    const move = contextSafe((event) => {
      // A spring still running from the last leave would fight the follow.
      springs.forEach((tween) => tween.kill())
      springs = []
      const box = el.getBoundingClientRect()
      const dx = event.clientX - (box.left + box.width / 2)
      const dy = event.clientY - (box.top + box.height / 2)
      xTo(dx * strength)
      yTo(dy * strength)
      if (labelTo) {
        labelTo.x(dx * inner)
        labelTo.y(dy * inner)
      }
    })
    const leave = contextSafe(() => {
      springs = [gsap.to(el, SPRING), label && gsap.to(label, SPRING)].filter(Boolean)
    })

    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    return () => {
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerleave', leave)
    }
  }, { dependencies: [motionOk, fine, ref, strength, inner], revertOnUpdate: true })
}
