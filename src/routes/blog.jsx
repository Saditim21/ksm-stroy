import { useRef } from 'react'
import Seam from '../components/ui/Seam'
import Ways from '../components/ui/Ways.jsx?blog'
import { PRIMARY_PHONE, SITE } from '../config/site'
import worksImages from '../data/images/works.json'
import useReveals from '../motion/useReveals'
import Register from '../pages/works/Register'
import { pageMeta } from '../seo/meta'
import { inquiryHref } from '../shell/handle'
import { preloadWithDocument } from '../utils/documentPreloads'
import { DISPLAY_FONT_PRELOADS } from '../utils/fontLinks'
import '../pages/works/works.css'

// Обекти, /blog (spec M3/M4 §7.2; the concept's obekti.html): the register
// of the seven works, each a row across the seam that opens as a book of its
// photos (Register.jsx, #top; the book, Book.jsx, is the page's moment), and
// the closing, production's call to action as the system's two ways. The
// address stays /blog, production's.
//
// Ways comes in under a query of its own (Ways.jsx?blog), as Контакти's and
// Продажби's do (src/routes/contact.jsx): the build gives this page its own
// copy rather than a chunk shared with Home's teaser, which would add to
// Home's first load (spec M3/M4 §4.4). The pages still share ways.css.

// How the site's shell frames this page (src/shell/handle.js): below the
// solid header. It has no inquiry of its own: the header's „Запитване“ goes
// to the contact page's form (M3/M4 spec §8).
export const handle = { header: 'solid' }

// The upright display face, which the title and the first work's name set
// in the first viewport (it has no italic word): preloaded with the
// document the page is first loaded as, never again on a client-side visit
// (ruling C5.4, src/utils/documentPreloads.js).
const PRELOADS = [DISPLAY_FONT_PRELOADS[0]]

// Production's head (its Blog.jsx). Its share image is one of the works the
// page shows, the Читалище „Асен Златаров“ finished, the one work whose
// photos are wide enough for 1200 × 630 (spec M3/M4 §11;
// work-chitalishte-3's og).
export const meta = () => pageMeta({
  title: 'Обекти - KSM Stroy',
  description: 'Разгледайте нашите успешно реализирани строителни проекти - жилищни комплекси, хотелски комплекси и санирания.',
  path: '/blog',
  image: worksImages['work-chitalishte-3'].og,
})

// The closing's two ways (spec §7.2): the contact page, with the phone and
// the email under it, and the contact form with „Строителство или ремонт“
// chosen (its ?project=stroitelstvo, src/pages/contact/prefill.js). A
// no-break space after the one-letter „с“ (spec §4.5).
const WAYS = [
  { title: 'Свържете се с нас', sub:`${PRIMARY_PHONE.label} · ${SITE.email}`, to: '/contact' },
  { title: 'Поръчайте оферта', sub: 'Строителство или ремонт', to: inquiryHref('stroitelstvo') },
]

// The closing: production's „Имате идея за *проект*?“ and its line, as a
// hinge, then the ways. A no-break space after each one-letter word (spec
// §4.5).
function Closing() {
  const ref = useRef(null)
  useReveals(ref)

  return (
    <section ref={ref} className="sec ob-close" aria-labelledby="ob-close-h">
      <div className="hinge">
        <h2 className="h2" id="ob-close-h" data-split="">
          Имате идея за <em>проект</em>?
        </h2>
        <p className="lead" data-fade="">
          Свържете се с&nbsp;нас за консултация и&nbsp;да обсъдим как можем да реализираме вашия&nbsp;проект.
        </p>
        <Seam draw />
      </div>
      <Ways label="Два начина да се свържете с нас" ways={WAYS} />
    </section>
  )
}

export default function Blog() {
  preloadWithDocument(PRELOADS)
  return (
    <>
      <Register />
      <Closing />
    </>
  )
}
