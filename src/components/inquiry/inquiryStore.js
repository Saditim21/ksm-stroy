import { useSyncExternalStore } from 'react'
import { scrollLocked } from '../../utils/lenis'
import { scrollToId } from '../../utils/scroll'

// The inquiry's shared state (spec §10; M3 §8): the option the form's select
// (or Контакти's subjects) shows and the apartments sent to the form, each a
// pick of its project's ({ project, label }: „А 501“ of Golden Residence,
// „А-101“ of Многофамилна). A module-scope store, so any action on the page
// can preset the form without a provider: the Многофамилна half of Home's
// opening, the explorer's units, the parking actions, a link's prefill on
// Контакти. The prerender and the hydration see it empty.
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

// The subjects more than one page offers: the label in the select and the
// subject the lead carries (src/services/inquiry.js). A page whose options
// travel with its own routes builds them from these (Home's,
// src/pages/home/inquiry.jsx; Многофамилна's, src/pages/mnogofamilna/inquiry.jsx).
const option = (value, label, subject = label) => Object.freeze({ value, label, subject })
export const GOLDEN_RESIDENCE = option('golden-residence', `Golden Residence, жк${NBSP}Левски${NBSP}Г`, 'Golden Residence')
export const MNOGOFAMILNA = option('mnogofamilna', 'Многофамилна сграда, ж.к. Връбница-1')
export const BUILD = option('build', 'Строителство или ремонт')
export const OTHER = option('other', 'Друго')

// What Golden Residence's form offers, on its page and its block pages (spec
// §10; M3 §8), its own building first: the options built into the form
// (InquirySection.jsx's `page`). They travel in the first-load JS of every
// page with the form, so any other page's options stay out of them: Home and
// Многофамилна's routes hand theirs to the form (InquirySection.jsx; M3 §10:
// per-page code only on its own routes).
export const INQUIRY_OPTIONS = Object.freeze({
  'golden-residence': Object.freeze([
    option('golden-residence', `Апартамент в${NBSP}Golden Residence`, 'Golden Residence'),
    option('garage', `Гараж или паркомясто в${NBSP}Golden Residence`, 'Golden Residence, гараж или паркомясто'),
    MNOGOFAMILNA,
    OTHER,
  ]),
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
 * Presets the form where it is, with no glide and no focus: what a link to
 * Контакти's form asks for, once the page has hydrated (M3/M4 spec §7.3,
 * src/pages/contact/ContactInquiry.jsx). Merges into the store: the option,
 * when given, replaces the one chosen (null: the form's own first); each
 * pick joins the picks once, as its project and its label.
 * @param {{ option?: string | null, picks?: Array<{ project: string, label: string }> }} preset
 */
export function seedInquiry({ option = state.option, picks = [] } = {}) {
  update({ option, picks: [...state.picks, ...picks.filter((pick) => !state.picks.some(samePick(pick)))] })
}

/**
 * Presets the form, as seedInquiry() does, and glides the page to it. With
 * nothing to preset it only glides, and the form's first field takes the
 * focus once the glide is under way.
 * @param {{ option?: string, pick?: { project: string, label: string } }} preset
 */
export function presetInquiry({ option, pick } = {}) {
  seedInquiry({ option, picks: pick ? [pick] : [] })
  glideToInquiry()
}

// The visitor's own choice in the select, or among Контакти's subjects.
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
