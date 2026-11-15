import { useSyncExternalStore } from 'react'
import { scrollLocked } from '../../utils/lenis'
import { scrollToId } from '../../utils/scroll'

// The inquiry's shared state (spec §10): the option the form's select shows
// and the apartments sent to the form. A module-scope store, so any action
// on the page can preset the form without a provider: the Многофамилна half
// of Home's opening, the explorer's units, the parking actions. The
// prerender and the hydration see it empty.
//
// A preset glides the page to the form (spec §5.3): in the first animation
// frame in which no scroll lock is held, because Lenis ignores scrollTo while
// a lock has stopped it (lenis 1.3.27, dist/lenis.mjs:759) and a dialog
// closed by the same click releases its lock only in the effects of the
// commit that closes it. It waits half a second at most: a lock held longer
// is something else that is open, and the page stays where it is. Once the
// glide is under way, 1.5 s later, the form's first field takes the focus,
// without a scroll of its own, which would jump the page if the glide has
// not arrived.

const NBSP = String.fromCharCode(0xa0)

// The section the glide brings up, and the field that then takes the focus
// (InquirySection.jsx, InquiryForm.jsx).
const INQUIRY = 'zapitvane'
const FIRST_FIELD = 'f-name'
const WAIT_MS = 500
const FOCUS_AFTER_MS = 1500

const option = (value, label, subject = label) => Object.freeze({ value, label, subject })
const MNOGOFAMILNA = option('mnogofamilna', 'Многофамилна сграда, ж.к. Връбница-1')
const OTHER = option('other', 'Друго')

// What each page's form offers (spec §10): the label in the select and the
// subject the lead carries (src/services/inquiry.js).
export const INQUIRY_OPTIONS = Object.freeze({
  home: Object.freeze([
    option('golden-residence', `Golden Residence, жк${NBSP}Левски${NBSP}Г`, 'Golden Residence'),
    MNOGOFAMILNA,
    option('build', 'Строителство или ремонт'),
    OTHER,
  ]),
  'golden-residence': Object.freeze([
    option('golden-residence', `Апартамент в${NBSP}Golden Residence`, 'Golden Residence'),
    option('garage', `Гараж или паркомясто в${NBSP}Golden Residence`, 'Golden Residence, гараж или паркомясто'),
    MNOGOFAMILNA,
    OTHER,
  ]),
})

const EMPTY = Object.freeze({ option: null, picks: Object.freeze([]) })
let state = EMPTY
const listeners = new Set()

function update(next) {
  if (next === state) return
  state = next
  listeners.forEach((listener) => listener())
}

function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

const getSnapshot = () => state
const getServerSnapshot = () => EMPTY

/** @returns {{ option: string | null, picks: string[] }} */
export function useInquiryState() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

// The glide a preset has scheduled, so the next preset, or a reset, can call
// it off.
let pending = { frame: 0, giveUp: 0, focus: 0 }

function cancelGlide() {
  cancelAnimationFrame(pending.frame)
  clearTimeout(pending.giveUp)
  clearTimeout(pending.focus)
  pending = { frame: 0, giveUp: 0, focus: 0 }
}

function glideToInquiry() {
  cancelGlide()
  const frame = () => {
    if (scrollLocked()) {
      pending.frame = requestAnimationFrame(frame)
      return
    }
    clearTimeout(pending.giveUp)
    if (!document.getElementById(INQUIRY)) return
    scrollToId(INQUIRY, { reveal: FIRST_FIELD })
    pending.focus = setTimeout(() => document.getElementById(FIRST_FIELD)?.focus({ preventScroll: true }), FOCUS_AFTER_MS)
  }
  pending.frame = requestAnimationFrame(frame)
  pending.giveUp = setTimeout(() => cancelAnimationFrame(pending.frame), WAIT_MS)
}

/**
 * Presets the form and glides the page to it. Merges into the store: the
 * option, when given, replaces the one chosen; a pick joins the picks once.
 * @param {{ option?: string, pick?: string }} preset
 */
export function presetInquiry({ option: chosen, pick } = {}) {
  let next = state
  if (chosen !== undefined && chosen !== next.option) next = { ...next, option: chosen }
  if (pick !== undefined && !next.picks.includes(pick)) next = { ...next, picks: [...next.picks, pick] }
  update(next)
  glideToInquiry()
}

// The visitor's own choice in the select.
export function chooseInquiryOption(chosen) {
  if (chosen !== state.option) update({ ...state, option: chosen })
}

export function removePick(id) {
  if (state.picks.includes(id)) update({ ...state, picks: state.picks.filter((pick) => pick !== id) })
}

// Clears the store, and calls off a glide on its way (after a sent inquiry).
export function resetInquiry() {
  cancelGlide()
  update(EMPTY)
}
