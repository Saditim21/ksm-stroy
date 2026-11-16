import { useSyncExternalStore } from 'react'
import { scrollLocked } from '../../utils/lenis'
import { scrollToId } from '../../utils/scroll'

// The inquiry's shared state (spec §10; M3 §8): the option the form's select
// shows and the apartments sent to the form, each a pick of its project's
// ({ project, label }: „А 501“ of Golden Residence, „А-101“ of
// Многофамилна). A module-scope store, so any action on the page can preset
// the form without a provider: the Многофамилна half of Home's opening, the
// explorer's units, the parking actions. The prerender and the hydration see
// it empty.
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
const GOLDEN_RESIDENCE = option('golden-residence', `Golden Residence, жк${NBSP}Левски${NBSP}Г`, 'Golden Residence')
const MNOGOFAMILNA = option('mnogofamilna', 'Многофамилна сграда, ж.к. Връбница-1')
const BUILD = option('build', 'Строителство или ремонт')
const OTHER = option('other', 'Друго')

// What each page's form offers (spec §10; M3 §6.2 #6, §8): the label in the
// select and the subject the lead carries (src/services/inquiry.js), the
// page's own first.
export const INQUIRY_OPTIONS = Object.freeze({
  home: Object.freeze([GOLDEN_RESIDENCE, MNOGOFAMILNA, BUILD, OTHER]),
  'golden-residence': Object.freeze([
    option('golden-residence', `Апартамент в${NBSP}Golden Residence`, 'Golden Residence'),
    option('garage', `Гараж или паркомясто в${NBSP}Golden Residence`, 'Golden Residence, гараж или паркомясто'),
    MNOGOFAMILNA,
    OTHER,
  ]),
  mnogofamilna: Object.freeze([MNOGOFAMILNA, GOLDEN_RESIDENCE, BUILD, OTHER]),
})

// The project whose apartments go with each subject (M3 §8, extending ruling
// FR4): Golden Residence's with its apartments and its garages, Многофамилна's
// with Многофамилна. A pick shows, and goes with the lead, only under its
// own project's subject; the other subjects take none.
export const OPTION_PROJECT = Object.freeze({
  'golden-residence': 'golden-residence',
  garage: 'golden-residence',
  mnogofamilna: 'mnogofamilna-sgrada',
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

/** @returns {{ option: string | null, picks: Array<{ project: string, label: string }> }} */
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

// Whether two picks are one: the same project, and the same label.
const samePick = (a) => (b) => a.project === b.project && a.label === b.label

/**
 * Presets the form and glides the page to it. Merges into the store: the
 * option, when given, replaces the one chosen; a pick joins the picks once,
 * as its project and its label.
 * @param {{ option?: string, pick?: { project: string, label: string } }} preset
 */
export function presetInquiry({ option: chosen, pick } = {}) {
  let next = state
  if (chosen !== undefined && chosen !== next.option) next = { ...next, option: chosen }
  if (pick !== undefined && !next.picks.some(samePick(pick))) next = { ...next, picks: [...next.picks, pick] }
  update(next)
  glideToInquiry()
}

// The visitor's own choice in the select.
export function chooseInquiryOption(chosen) {
  if (chosen !== state.option) update({ ...state, option: chosen })
}

/** Drops a pick ({ project, label }). */
export function removePick(pick) {
  const same = samePick(pick)
  if (state.picks.some(same)) update({ ...state, picks: state.picks.filter((each) => !same(each)) })
}

// Clears the store, and calls off a glide on its way (after a sent inquiry).
export function resetInquiry() {
  cancelGlide()
  update(EMPTY)
}

// For the inquiry's section as it leaves the page (ruling C5.1): the store
// outlives the page, and an option preset on one page (Home's Многофамилна)
// would still be chosen on the next page's form, which may offer it too, and
// file that page's inquiry under the wrong subject. So the option goes, and a
// glide on its way to the section that left with it, whose focus would land
// on the next page's form. The picks stay: the explorer pages hand them on.
export function clearInquiryOption() {
  cancelGlide()
  if (state.option !== null) update({ ...state, option: null })
}
