import { afterEach, describe, expect, it, vi } from 'vitest'
import { recordingMotion } from '../test/gsap'
import { afterimage, crossfadePlan, drawPlan } from './planMotion'

// A dialog's close (extract §4.23: 0.3 s; §4.24: 0.25 s): the dialog went in
// the commit its parameter left the address, and a clone of its last frame
// fades over the page in its place, for the GSAP useMotionNow() hands over.
//
// And a mini plan's own motion (extract §4.21, §4.25; ruling C9.10), with a
// recording stand-in for that GSAP (src/test/gsap.js): its draw as its panel
// or sheet shows it, and the crossfade of a new floor.

afterEach(() => {
  vi.restoreAllMocks()
  document.body.replaceChildren()
})

describe('afterimage', () => {
  // The clone stays exactly where the dialog was, whatever changes around it
  // as it fades: a deep link's landing ends with its dialogs, and the room
  // they left the EU row (top: var(--eu-h)) goes with it.
  it('fades a clone of the dialog over its own box, as no dialog, and removes it once faded', () => {
    const dialog = document.createElement('div')
    dialog.className = 'ps'
    dialog.setAttribute('role', 'dialog')
    dialog.setAttribute('aria-modal', 'true')
    dialog.setAttribute('aria-labelledby', 'title')
    dialog.innerHTML = '<button type="button">Към сградата</button>'
    document.body.append(dialog)
    vi.spyOn(dialog, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 36, width: 1440, height: 864, right: 1440, bottom: 900, x: 0, y: 36 })
    const tweens = []
    const gsap = { to: (target, vars) => tweens.push({ target, vars }) }

    afterimage(gsap, dialog, 0.3)
    dialog.remove()
    const [{ target: clone, vars }] = tweens

    expect(clone).not.toBe(dialog)
    expect(clone.isConnected).toBe(true)
    expect(clone).toHaveClass('ps')
    expect(clone.style).toMatchObject({ top: '36px', left: '0px', right: 'auto', bottom: 'auto', width: '1440px', height: '864px', pointerEvents: 'none' })
    for (const name of ['role', 'aria-modal', 'aria-labelledby']) expect(clone).not.toHaveAttribute(name)
    expect(clone).toHaveAttribute('aria-hidden', 'true')
    expect(clone).toHaveAttribute('inert')
    expect(vars).toMatchObject({ opacity: 0, duration: 0.3, ease: 'power2.in' })

    vars.onComplete()
    expect(clone.isConnected).toBe(false)
  })
})

// A mini plan's parts: two outlines, a fill, a label and a blocked unit's
// dashed outline.
function planScope() {
  const scope = document.createElement('div')
  scope.innerHTML = '<svg><path class="u-shape"/><path class="u-shape"/><path class="u-fill"/><text class="u-label">01</text><path class="u-blocked"/></svg>'
  return scope
}
const changing = (scope) => [...scope.querySelectorAll('.u-fill, .u-label, .u-blocked')]

describe('drawPlan', () => {
  it('draws the outlines over 0.5 s expo.out, 12 ms apart, then fades the fills and labels in over 0.3 s power2.out, 20 ms apart, from 0.12 s', () => {
    const { motion: { gsap }, tweens } = recordingMotion()
    const scope = planScope()
    drawPlan(gsap, scope)

    expect(tweens.map(({ method, from, vars }) => ({ method, from, vars }))).toEqual([
      {
        method: 'fromTo',
        from: { strokeDasharray: 1, strokeDashoffset: 1 },
        vars: { strokeDashoffset: 0, duration: 0.5, ease: 'expo.out', stagger: 0.012, clearProps: 'strokeDasharray,strokeDashoffset' },
      },
      { method: 'fromTo', from: { opacity: 0 }, vars: { opacity: 1, duration: 0.3, ease: 'power2.out', stagger: 0.02, delay: 0.12, clearProps: 'opacity' } },
    ])
    expect([...tweens[0].targets]).toEqual([...scope.querySelectorAll('.u-shape')])
    expect([...tweens[1].targets]).toEqual(changing(scope))
  })
})

describe('crossfadePlan', () => {
  it('fades a new floor’s fills and labels in over 0.15 s, the outlines drawn at once', () => {
    const { motion: { gsap }, tweens } = recordingMotion()
    const scope = planScope()
    crossfadePlan(gsap, scope)

    expect(tweens.map(({ method, from, vars }) => ({ method, from, vars }))).toEqual([
      { method: 'set', from: undefined, vars: { clearProps: 'strokeDasharray,strokeDashoffset' } },
      { method: 'fromTo', from: { opacity: 0 }, vars: { opacity: 1, duration: 0.15, ease: 'none', clearProps: 'opacity' } },
    ])
    expect([...tweens[0].targets]).toEqual([...scope.querySelectorAll('.u-shape')])
    expect([...tweens[1].targets]).toEqual(changing(scope))
  })

  // Task 6's bug: a draw still waiting on its stagger hid each fill again as
  // its turn came, after a new floor's crossfade had shown them
  // (gsap.killTweensOf misses a staggered tween that has not started). The
  // plan's own tweens are killed first; another plan's carry on.
  it('kills the plan’s draw still under way first, so no fill vanishes again, and leaves another plan’s alone', () => {
    const { motion: { gsap }, tweens } = recordingMotion()
    const scope = planScope()
    const other = planScope()
    drawPlan(gsap, scope)
    const draw = tweens.slice(0, 2)
    drawPlan(gsap, other)
    const otherDraw = tweens.slice(2, 4)

    crossfadePlan(gsap, scope)
    for (const tween of draw) expect(tween.kill).toHaveBeenCalledTimes(1)
    for (const tween of otherDraw) expect(tween.kill).not.toHaveBeenCalled()

    // And a crossfade's own, by the next floor's.
    const crossfade = tweens.slice(4, 6)
    crossfadePlan(gsap, scope)
    for (const tween of crossfade) expect(tween.kill).toHaveBeenCalledTimes(1)
  })
})
