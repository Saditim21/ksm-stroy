import { useRef } from 'react'
import Seam from '../components/ui/Seam'
import Ways from '../components/ui/Ways.jsx?contact'
import { PRIMARY_PHONE, SITE } from '../config/site'
import { availabilityPreload } from '../data/availability/useAvailability'
import grImages from '../data/images/golden-residence.json'
import useReveals from '../motion/useReveals'
import ContactInquiry from '../pages/contact/ContactInquiry'
import ContactReach from '../pages/contact/ContactReach'
import Offices from '../pages/contact/Offices'
import { toForm } from '../pages/contact/prefill'
import { pageMeta } from '../seo/meta'
import { preloadWithDocument } from '../utils/documentPreloads'
import { DISPLAY_FONT_PRELOADS } from '../utils/fontLinks'
import '../pages/contact/contact.css'

// Контакти, /contact (spec M3/M4 §7.3, §8; the concept's kontakti.html), four
// pairs on one seam: the question | the answer (ContactReach.jsx, #top); what
// the visitor asks about | who they are, the site's one inquiry form across
// both halves (ContactInquiry.jsx, #zapitvane), which every other page's
// „Запитване“ lands on; the two offices (Offices.jsx, #ofisi); and the
// closing, production's call to action as the system's two ways.
//
// Ways comes in under a query of its own (Ways.jsx?contact), as the form's
// photographs and Многофамилна's snapshot do (ContactInquiry.jsx): the build
// gives this page its own copy rather than a chunk shared with Home's
// teaser, which would add about 220 B to Home's first load (ruling M4-PF3).
// The two pages still share ways.css, a stylesheet of its own.

// How the site's shell frames this page (src/shell/handle.js): below the
// solid header, with the inquiry the header's „Запитване“ goes to.
export const handle = { header: 'solid', inquiry: true }

// Both display faces, which the title sets in the first viewport, and the
// availability API, which Golden Residence's count and its apartments read:
// preloaded with the document the page is first loaded as, never again on a
// client-side visit (ruling C5.4, src/utils/documentPreloads.js).
const PRELOADS = [availabilityPreload, ...DISPLAY_FONT_PRELOADS]

// Production's head (its src/utils/seo.js `contact`), the hours of its
// description from the one hours source (ruling M4-PF4) in production's own
// words: „Пн-Пт 8:00-18:00“. Its share image is the page's first picture,
// the form's Golden Residence at dusk, its first subject (spec M3/M4 §11;
// gr-dusk's og).
const [WEEKDAYS] = SITE.hours
const HOURS = `${WEEKDAYS.short} ${WEEKDAYS.from}-${WEEKDAYS.to}`.replaceAll('–', '-')

export const meta = () => pageMeta({
  title: 'Контакти - KSM Stroy | Свържете се с нас за оферта',
  description: `Свържете се с KSM Stroy за безплатна консултация и оферта. Офис в София, телефон: ${PRIMARY_PHONE.tel}, имейл: ${SITE.email}. Работно време: ${HOURS}.`,
  path: '/contact',
  image: grImages['gr-dusk'].og,
})

// The closing's two ways (spec §7.3): the form, which the way brings up and
// whose „Име“ it focuses, and a call.
const WAYS = [
  { title: 'Получете безплатна оферта', sub: 'Към запитването', href: '#zapitvane', onClick: toForm },
  { title: 'Обадете се сега', sub: PRIMARY_PHONE.label, href: `tel:${PRIMARY_PHONE.tel}` },
]

// The closing: production's „Готови сте да започнете своя *проект*?“ and its
// line, as a hinge, then the ways. A no-break space after each one-letter
// word (spec §4.5).
function Closing() {
  const ref = useRef(null)
  useReveals(ref)

  return (
    <section ref={ref} className="sec closing" aria-labelledby="closing-h">
      <div className="hinge">
        <h2 className="h2" id="closing-h" data-split="">
          Готови сте да започнете своя <em>проект</em>?
        </h2>
        <p className="lead" data-fade="">
          Нашият екип е&nbsp;готов да ви помогне да реализирате мечтания проект с&nbsp;качество и&nbsp;професионализъм.
        </p>
        <Seam draw />
      </div>
      <Ways label="Два начина да започнете" ways={WAYS} />
    </section>
  )
}

export default function Contact() {
  preloadWithDocument(PRELOADS)
  return (
    <>
      <ContactReach />
      <ContactInquiry />
      <Offices />
      <Closing />
    </>
  )
}
