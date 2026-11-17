import { presetInquiry } from '../../components/inquiry/inquiryStore'
import { normalizeUnitId } from '../../utils/units'

// The links to Контакти's form: what a link from another page asks the form
// to show (parsePrefill), and the page's own links that bring it up (toForm).
//
// parsePrefill (spec M3/M4 §7.3, §8): the subject, from `?project=`, and the
// apartments, from `?apartment=`, which may repeat. ContactInquiry.jsx
// applies it once the page has hydrated.
//
// - The subject: the slugs the site's links send (handle.js's inquiryHref,
//   Продажби's and Обекти's links) and their short forms, read in lower case
//   first (ruling M4-PF12). Anything else is no subject, and the form keeps
//   its own first one, Golden Residence.
// - The apartments: each kept only if it names a unit of the chosen
//   subject's project (spec §5.6, decision 8: text from the address never
//   reaches the CRM unchecked), written however the link wrote it (Latin A
//   and B read as Cyrillic, spaces and dashes aside: normalizeUnitId), and
//   named as that project names it („А 301“, „Б-702“). Six at most, each
//   once. Construction and anything else take none.
//
// `units` holds each project's unit labels: Golden Residence's (`gr`) once
// the store's data is in, null until then; Многофамилна's (`mn`) from its
// dated snapshot.

const SUBJECTS = new Map([
  ['golden-residence', 'golden-residence'],
  ['gr', 'golden-residence'],
  ['mnogofamilna-sgrada', 'mnogofamilna'],
  ['mnogofamilna', 'mnogofamilna'],
  ['mn', 'mnogofamilna'],
  ['stroitelstvo', 'build'],
  ['remont', 'build'],
  ['build', 'build'],
  ['drugo', 'other'],
  ['other', 'other'],
])

// The project whose apartments go with each subject (inquiryStore.js's
// OPTION_PROJECT), and where its units are in `units`.
const UNITS = {
  'golden-residence': { key: 'gr', project: 'golden-residence' },
  mnogofamilna: { key: 'mn', project: 'mnogofamilna-sgrada' },
}

const MAX_PICKS = 6

/**
 * @param {string} search the address's query, `?project=…&apartment=…`
 * @param {{ gr: Set<string> | null, mn: Set<string> }} units
 * @returns {{ option: string | null, picks: Array<{ project: string, label: string }> }}
 */
export function parsePrefill(search, units) {
  const params = new URLSearchParams(search)
  const slug = params.get('project')
  const option = slug === null ? null : SUBJECTS.get(slug.toLowerCase()) ?? null
  const picks = []
  const subject = UNITS[option ?? 'golden-residence']
  const labels = subject ? units[subject.key] : null
  if (!labels) return { option, picks }
  const byId = new Map([...labels].map((label) => [normalizeUnitId(label), label]))
  for (const raw of params.getAll('apartment')) {
    const label = byId.get(normalizeUnitId(raw))
    if (label && picks.length < MAX_PICKS && !picks.some((pick) => pick.label === label)) picks.push({ project: subject.project, label })
  }
  return { option, picks }
}

// The page's own links to the form, „Изпратете запитване“ in the answer and
// „Получете безплатна оферта“ in the closing (spec §7.3; kontakti.js:321-325):
// a plain left click glides to the form, and „Име“ takes the focus once the
// glide is under way (inquiryStore.js's presetInquiry, with nothing to
// preset); the browser's own jump is taken, and the address stays. A click
// that opens a tab or a window, and the page without its script, follow the
// link to #zapitvane.
export function toForm(event) {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
  event.preventDefault()
  presetInquiry()
}
