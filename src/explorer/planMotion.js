// The motion of the explorer's plans and dialogs (spec §5.7; extract §4.21,
// §4.23-4.25; the concept's explorer.js:139-156, :656-694, :784-806), for the
// GSAP of useMotionNow(): a mini plan as its panel or sheet shows it, and a
// dialog's close. Without the engine the plan is simply there, and a dialog
// simply goes: React renders the final state, and these only animate.
//
// Each plan's tweens are kept, and a new motion kills them first: a draw
// still waiting on its stagger would otherwise hide each fill again as its
// turn came, after a floor's crossfade had shown them (gsap.killTweensOf
// misses a staggered tween that has not started).

const running = new WeakMap()

function replace(scope, tweens) {
  running.get(scope)?.forEach((tween) => tween.kill())
  running.set(scope, tweens)
}

// What changes with the floor: the fills, the labels and the dashed
// outlines.
const changing = (scope) => scope.querySelectorAll('.u-fill, .u-label, .u-blocked')

/** A plan that comes into view: its outlines draw, 0.5 s expo.out, 12 ms
 * apart, and its fills fade in after them, 0.3 s power2.out, 20 ms apart. */
export function drawPlan(gsap, scope) {
  replace(scope, [
    gsap.fromTo(scope.querySelectorAll('.u-shape'), { strokeDasharray: 1, strokeDashoffset: 1 }, {
      strokeDashoffset: 0, duration: 0.5, ease: 'expo.out', stagger: 0.012, clearProps: 'strokeDasharray,strokeDashoffset',
    }),
    gsap.fromTo(changing(scope), { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power2.out', stagger: 0.02, delay: 0.12, clearProps: 'opacity' }),
  ])
}

/** A plan whose floor changes while it is in view: the new floor's fills and
 * labels fade in over 0.15 s, the outlines staying (drawn at once, if a draw
 * was under way), as the concept's two 75 ms halves do. */
export function crossfadePlan(gsap, scope) {
  replace(scope, [
    gsap.set(scope.querySelectorAll('.u-shape'), { clearProps: 'strokeDasharray,strokeDashoffset' }),
    gsap.fromTo(changing(scope), { opacity: 0 }, { opacity: 1, duration: 0.15, ease: 'none', clearProps: 'opacity' }),
  ])
}

/** A dialog that has closed (the plan stage, the unit panel): it went in the
 * commit its parameter left the address, and a clone of its last frame fades
 * over the page in its place, `duration` s on power2.in (extract §4.23:
 * 0.3 s; §4.24: 0.25 s). The clone is no dialog, takes no pointer and no
 * focus, and is gone when it has faded. */
export function afterimage(gsap, node, duration) {
  const clone = node.cloneNode(true)
  for (const name of ['role', 'aria-modal', 'aria-labelledby']) clone.removeAttribute(name)
  clone.setAttribute('aria-hidden', 'true')
  clone.setAttribute('inert', '')
  clone.style.pointerEvents = 'none'
  document.body.appendChild(clone)
  gsap.to(clone, { opacity: 0, duration, ease: 'power2.in', onComplete: () => clone.remove() })
}
