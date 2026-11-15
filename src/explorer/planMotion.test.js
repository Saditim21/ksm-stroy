import { afterEach, describe, expect, it, vi } from 'vitest'
import { afterimage } from './planMotion'

// A dialog's close (extract §4.23: 0.3 s; §4.24: 0.25 s): the dialog went in
// the commit its parameter left the address, and a clone of its last frame
// fades over the page in its place, for the GSAP useMotionNow() hands over.

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
