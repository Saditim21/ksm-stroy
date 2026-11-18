import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router'
import {
  BUILD,
  GOLDEN_RESIDENCE,
  MNOGOFAMILNA,
  OTHER,
  chooseInquiryOption,
  clearInquiryOption,
  seedInquiry,
  useInquiryState,
} from '../../components/inquiry/inquiryStore'
import useInquiryForm from '../../components/inquiry/useInquiryForm'
import ResponsivePicture from '../../components/ui/ResponsivePicture'
import RollingNumber from '../../components/ui/RollingNumber'
import Seam from '../../components/ui/Seam'
import { MNOGO_DATED } from '../../config/facts'
import { apartmentUnits, grFree } from '../../data/availability/select'
import { useAvailability } from '../../data/availability/useAvailability'
import grImages from '../../data/images/golden-residence.json'
import homeImages from '../../data/images/home.json?contact'
import mnNight from '../../data/images/mn-night.json'
import { MN_SNAPSHOT_DATA } from '../../data/mnogofamilna/snapshot.js?contact'
import { GR_PROJECT } from '../../explorer/projects/gr'
import StaleNotice from '../../explorer/StaleNotice'
import useHydrated from '../../hooks/useHydrated'
import useMotionAllowed from '../../hooks/useMotionAllowed'
import useReveals from '../../motion/useReveals'
import { holdEuRow, releaseOnFirstMove, useFreshArrival } from '../../shell/landingHold'
import { plural } from '../../utils/format'
import { getLenis } from '../../utils/lenis'
import { Mark } from './Offices'
import { parsePrefill } from './prefill'
import '../../components/inquiry/inquiry.css'

// Контакти's inquiry, #zapitvane (spec M3/M4 §7.3, §8; the concept's
// kontakti.html:115-207): one form across both halves, what the visitor asks
// about | who they are. The form is the site's one inquiry form
// (useInquiryForm.jsx: its fields, rules, errors, send and thank-you), set
// out here:
// - left, sticky (with motion, Diptych §5.8), the subject as a radio group
//   under „Интересувам се от“, set over the chosen subject's picture: Golden
//   Residence with its live count, Многофамилна with its dated one, the
//   three service stills for construction, the KSM mark on umber for
//   anything else. The visitor's choice opens its picture from the seam (CSS,
//   1 s; contact.css), at once under reduced motion. The pictures load as
//   the visitor first reaches for the subjects; the chosen one is there from
//   the start. Under the subjects, the stale-data notice says so when Golden
//   Residence's count is not live: the data built into the site, or none
//   (StaleNotice.jsx; spec §5.2, §5.3, Diptych §9);
// - right, the heading, then the fields. Construction brings „Тип проект“
//   and „Бюджет“ (production's six kinds and five ranges; a range is shown
//   typeset and sent as production's string) and production's message hint;
//   the group folds open and closed in 0.55 s, at once without motion. A
//   pick shows only under its own project's subject (§8).
// - the thank-you hides the fields and disables the subjects, the one sent
//   still chosen.
//
// A link's prefill and landing (spec §7.3, §8): once the page has hydrated,
// the address's subject and apartments (prefill.js) seed the form where it
// is, with no glide. Golden Residence's apartments wait for its data, a
// moment at most, and join the form as soon as it is in; nothing else is
// seeded again, so what the visitor changes meanwhile, a chip taken away,
// stays changed. With ?project=, ?apartment= or #zapitvane the page then
// lands on the form, once the prefill has rendered, the header's EU row held
// (src/shell/landingHold.js) until the visitor first moves the page. Only an
// arrival afresh lands (useFreshArrival): Back, Forward and a reload bring the
// visitor back to the place they left, which the page keeps, holding
// nothing. A send is never re-seeded.
//
// The store outlives the page (inquiryStore.js), so the section clears the
// option it leaves (ruling C5.1), as InquirySection does.
//
// Home's photographs (home.json) and Многофамилна's snapshot come in under a
// query of their own (?contact): the build gives this page its own copy of
// what it reads from them, so Home's chunk and Многофамилна's stay as they
// were (ruling M4-PF3).
//
// The heading rises line by line as the section comes up from below
// (useReveals); the markup is the final state.

const INQUIRY = 'zapitvane'
const HEADING = 'ask-h'
// How far the landing's heading keeps below the header (kontakti.js:53).
const CLEAR = 28
// How long a landing waits for Golden Residence's data, when it asks for
// its apartments, before it lands without them.
const LANDING_WAIT_MS = 1200

// Многофамилна's apartments, from its dated snapshot (spec §5.1).
const MN_UNITS = new Set(apartmentUnits(MN_SNAPSHOT_DATA, 'mnogofamilna-sgrada').map(({ label }) => label))

// The four subjects, Home's (inquiryStore.js), by their names.
const SUBJECTS = [
  { option: GOLDEN_RESIDENCE, name: 'Golden Residence' },
  { option: MNOGOFAMILNA, name: 'Многофамилна сграда' },
  { option: BUILD, name: 'Строителство или ремонт' },
  { option: OTHER, name: 'Друго' },
]
const OPTIONS = SUBJECTS.map(({ option }) => option)

// Production's kinds and ranges (its Contact.jsx:171-186). A range is shown
// typeset, no-break spaces inside its numbers and before „лв.“, and sent as
// production's own string, so the CRM's values stay as they were (spec §7.3).
const KINDS = ['Жилищно строителство', 'Комерсиални проекти', 'Индустриални обекти', 'Ремонти и реновации', 'Архитектурно проектиране', 'Консултантски услуги']
const BUDGETS = [
  ['До 50,000 лв', 'До 50\u00a0000\u00a0лв.'],
  ['50,000 - 100,000 лв', '50\u00a0000 – 100\u00a0000\u00a0лв.'],
  ['100,000 - 500,000 лв', '100\u00a0000 – 500\u00a0000\u00a0лв.'],
  ['500,000 - 1,000,000 лв', '500\u00a0000 – 1\u00a0000\u00a0000\u00a0лв.'],
  ['Над 1,000,000 лв', 'Над 1\u00a0000\u00a0000\u00a0лв.'],
]
// Production's message hint, for construction (its Contact.jsx:405).
const HINT = 'Опишете подробно вашия проект, изисквания и\u00a0очаквания.'

// Home's three service stills, each in its third of the construction plate.
const STRIPS = [
  { id: 'svc-residential', caption: 'Жилищно строителство' },
  { id: 'svc-renovation', caption: 'Ремонти и\u00a0реновация' },
  { id: 'svc-commercial', caption: 'Комерсиално строителство' },
]

// Whether an address lands on the form.
const landsOnForm = (search, hash) => /[?&](project|apartment)=/.test(search) || hash === `#${INQUIRY}`

// The landing's jump: the form's top, or higher where its heading would sit
// under the header (a phone), so the heading clears the header. At once,
// natively and through Lenis when it runs, as jumpToId does
// (src/utils/scroll.js).
function jumpToForm() {
  const section = document.getElementById(INQUIRY)
  if (!section) return
  const top = (element) => element.getBoundingClientRect().top + window.scrollY
  const heading = document.getElementById(HEADING)
  const header = document.querySelector('.hdr')?.offsetHeight ?? 0
  const y = Math.round(Math.max(0, Math.min(top(section), heading ? top(heading) - header - CLEAR : Infinity)))
  window.scrollTo(0, y)
  const lenis = getLenis()
  if (!lenis) return
  lenis.dimensions?.resize()
  lenis.scrollTo(y, { immediate: true, force: true })
}

// The picture of each subject (`full`: the pictures are wanted).
function PlateContent({ value, full }) {
  if (value === 'other') return <Mark />
  if (!full) return null
  if (value === 'build') {
    return STRIPS.map(({ id, caption }) => (
      <figure key={id} className={`strip strip--${id}`}>
        <ResponsivePicture image={homeImages[id]} alt="" sizes="(max-width: 900px) 100vw, 50vw" />
        <figcaption>{caption}</figcaption>
      </figure>
    ))
  }
  return value === 'golden-residence'
    ? <ResponsivePicture image={grImages['gr-dusk']} alt="" sizes="(max-width: 900px) 100vw, 175vh" />
    : <ResponsivePicture image={mnNight['mn-dusk']} alt="" sizes="(max-width: 900px) 100vw, 165vh" />
}

// A group of fields that folds open as it arrives and closed as it leaves,
// its words fading (spec §7.3: 0.55 s; contact.css); with `animate` false,
// at once. Closing, it takes no focus.
function Fold({ open, animate, children }) {
  const [phase, setPhase] = useState(open ? 'open' : null)
  if (open && (phase === null || phase === 'closing')) setPhase(animate ? 'opening' : 'open')
  if (!open && (phase === 'open' || phase === 'opening')) setPhase(animate ? 'closing' : null)
  if (phase === null) return null
  const end = (event) => {
    if (event.target !== event.currentTarget) return
    setPhase((current) => (current === 'closing' ? null : 'open'))
  }
  return (
    <div className={phase === 'open' ? 'fold' : `fold is-${phase}`} inert={phase === 'closing'} onAnimationEnd={end}>
      <div className="fold__in">{children}</div>
    </div>
  )
}

export default function ContactInquiry() {
  const ref = useRef(null)
  useReveals(ref)
  const motion = useMotionAllowed()
  const hydrated = useHydrated()
  const fresh = useFreshArrival()
  const { search, hash } = useLocation()
  const snapshot = useAvailability()
  const free = grFree(snapshot)
  // Golden Residence's apartments, once the store's data is in.
  const grUnits = useMemo(() => (snapshot.data ? new Set(apartmentUnits(snapshot.data).map(({ label }) => label)) : null), [snapshot.data])
  const settled = snapshot.status !== 'idle' && snapshot.status !== 'loading'

  // The construction group's choices, which go with the lead under
  // construction only.
  const [kind, setKind] = useState('')
  const [budget, setBudget] = useState('')
  const build = useInquiryState().option === 'build'
  const { status, chosen, form, fields, thanks } = useInquiryForm(OPTIONS, build ? { kind, budget } : undefined)
  const busy = status === 'sending' || status === 'sent'

  // The subject the page shows: the chosen one, held while an inquiry is on
  // its way and after it is sent (the store is cleared then). The visitor's
  // choice opens its picture over the one before (`under`), and folds the
  // construction group, where the page's motion runs: motion is allowed, and
  // the head's gate marked <html> .js as the page loaded, without which the
  // stylesheet plays neither (a page loaded under reduced motion, allowed
  // since). Anything else changes at once. Read as the visitor chooses,
  // never in a render.
  const [view, setView] = useState({ subject: chosen, under: null, animate: false })
  if (!busy && view.subject !== chosen) setView({ subject: chosen, under: null, animate: false })
  const choose = (value) => {
    const animate = motion && document.documentElement.classList.contains('js')
    if (value !== view.subject) setView({ subject: value, under: animate ? view.subject : null, animate })
    chooseInquiryOption(value)
  }
  // The pictures not chosen load once the visitor reaches for the subjects.
  const [warm, setWarm] = useState(false)
  const reach = () => setWarm(true)

  // The address's prefill, seeded once, never after a send: its subject and
  // its apartments. Apartments that wait for their units (prefill.js's
  // `pending`: Golden Residence's, before the store's data) hold the seed a
  // moment at most (LANDING_WAIT_MS); if the data is not in by then, the
  // subject goes alone and they follow as it comes, in a second step that
  // seeds nothing else: what the first gave is the visitor's to change.
  // `prefilled` is the address whose prefill has rendered, for the landing.
  const seeded = useRef({ search: null, pending: false })
  // The subject and the picks are the inquiry store's, which outlives the
  // page: they go as the page does, and the seed with them, so a page that
  // mounts again (as React's StrictMode has it, in development) seeds again.
  useEffect(() => () => {
    clearInquiryOption()
    seeded.current = { search: null, pending: false }
  }, [])
  const [prefilled, setPrefilled] = useState(null)
  const [waited, setWaited] = useState(false)
  useEffect(() => {
    if (!hydrated || settled) return undefined
    const timer = setTimeout(() => setWaited(true), LANDING_WAIT_MS)
    return () => clearTimeout(timer)
  }, [hydrated, settled])
  useEffect(() => {
    if (!hydrated) return
    const first = seeded.current.search !== search
    if (!first && !seeded.current.pending) return
    if (busy) {
      seeded.current = { search, pending: false }
      return
    }
    const prefill = parsePrefill(search, { gr: grUnits, mn: MN_UNITS })
    if (first) {
      if (prefill.pending && !settled && !waited) return
      seedInquiry({ option: prefill.option, picks: prefill.picks })
      setPrefilled(search)
    } else {
      // The second step: the apartments that waited, once their units are
      // in, and only those.
      if (prefill.pending) return
      seedInquiry({ picks: prefill.picks })
    }
    seeded.current = { search, pending: prefill.pending }
  }, [hydrated, search, grUnits, settled, waited, busy])

  // The landing: the EU row held from the moment the page knows it lands
  // until the visitor first moves the page after the jump; a send before
  // the jump ends it there. None where the visitor came back.
  const key = search + hash
  const [landing, setLanding] = useState({ key: null, phase: 'done' })
  useEffect(() => {
    if (!hydrated || !fresh || !landsOnForm(search, hash)) return
    holdEuRow(true)
    setLanding({ key: search + hash, phase: 'waiting' })
  }, [hydrated, fresh, search, hash])
  useEffect(() => {
    if (landing.key !== key || landing.phase !== 'waiting') return
    if (busy) {
      holdEuRow(false)
      setLanding({ key, phase: 'done' })
    } else if (prefilled === search) {
      jumpToForm()
      setLanding({ key, phase: 'held' })
    }
  }, [landing, key, search, prefilled, busy])
  useEffect(() => {
    if (landing.phase !== 'held') return undefined
    return releaseOnFirstMove(() => {
      holdEuRow(false)
      setLanding((current) => ({ ...current, phase: 'done' }))
    })
  }, [landing.phase])
  useEffect(() => () => holdEuRow(false), [])

  const metaOf = {
    'golden-residence': (
      <>
        <RollingNumber value={free} /> {plural(free, 'свободен', 'свободни')} от {GR_PROJECT.total} · жк&nbsp;Левски&nbsp;Г
      </>
    ),
    mnogofamilna: (
      <>
        {MNOGO_DATED.free} {plural(MNOGO_DATED.free, 'свободен', 'свободни')} от {MNOGO_DATED.total} · по данни към {MNOGO_DATED.date} ·
        ж.к.&nbsp;Връбница-1
      </>
    ),
  }
  const opening = (value) => value === view.subject && view.animate
  const clearUnder = (event) => {
    if (event.target === event.currentTarget) setView((current) => ({ ...current, under: null }))
  }

  return (
    <section ref={ref} className="ask" id={INQUIRY} aria-labelledby={HEADING}>
      <form className="ask__grid" {...form}>
        <Seam className="ask__seam" />
        <div className="ask__head">
          <h2 className="h2" id={HEADING} data-split="">
            Изпратете <em>запитване</em>
          </h2>
        </div>
        <div className="ask__media">
          <div className="ask__frame">
            <div className="ask__plates" aria-hidden="true">
              {SUBJECTS.map(({ option: { value } }) => (
                <div
                  key={value}
                  className={`plate plate--${value}${value === view.subject ? ' is-on' : ''}${value === view.under ? ' is-under' : ''}${opening(value) ? ' is-opening' : ''}`}
                  data-plate={value}
                  onAnimationEnd={opening(value) ? clearUnder : undefined}
                >
                  <PlateContent value={value} full={warm || value === view.subject || value === view.under} />
                </div>
              ))}
            </div>
            <fieldset className="subj" disabled={busy} onPointerEnter={reach} onFocus={reach}>
              <legend className="subj__legend">Интересувам се от</legend>
              {/* The chosen subject is the form's #f-project, where the
                  focus goes as a chip's last × takes the chip away
                  (useInquiryForm.jsx). */}
              {SUBJECTS.map(({ option: { value }, name }) => (
                <label key={value} className={value === view.subject ? 'subj__opt is-chosen' : 'subj__opt'}>
                  <input
                    id={value === view.subject ? 'f-project' : undefined}
                    className="sr-only"
                    type="radio"
                    name="project"
                    value={value}
                    checked={value === view.subject}
                    onChange={() => choose(value)}
                    aria-labelledby={`subj-${value}`}
                    aria-describedby={metaOf[value] ? `subj-${value}-meta` : undefined}
                  />
                  <span className="subj__name" id={`subj-${value}`}>
                    {name}
                  </span>
                  {metaOf[value] ? (
                    <span className="subj__meta" id={`subj-${value}-meta`}>
                      {metaOf[value]}
                    </span>
                  ) : null}
                </label>
              ))}
              {/* Golden Residence's count above, when it is not live: the
                  data built into the site, or none (`—`). */}
              <StaleNotice project={GR_PROJECT} className="subj__notice" />
            </fieldset>
          </div>
        </div>
        <div className="ask__fields">
          <div className="form ask__body" hidden={status === 'sent'}>
            {fields(
              null,
              <Fold open={view.subject === 'build'} animate={view.animate}>
                <div className="form__row">
                  <div className="field">
                    <label htmlFor="f-type">Тип проект</label>
                    <select id="f-type" name="projectType" value={kind} onChange={(event) => setKind(event.target.value)}>
                      <option value="">Изберете тип проект</option>
                      {KINDS.map((each) => (
                        <option key={each}>{each}</option>
                      ))}
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor="f-budget">Бюджет</label>
                    <select id="f-budget" name="budget" value={budget} onChange={(event) => setBudget(event.target.value)}>
                      <option value="">Изберете бюджет</option>
                      {BUDGETS.map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </Fold>,
              view.subject === 'build' ? HINT : undefined,
            )}
          </div>
          {thanks}
        </div>
      </form>
    </section>
  )
}
