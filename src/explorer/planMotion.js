// The motion of a mini plan as its panel or sheet shows it (spec §5.7;
// extract §4.21, §4.25; the concept's explorer.js:139-156), for the GSAP of
// useMotionNow(). Without the engine the plan is simply there: React renders
// the final state, and these only animate towards it.
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
