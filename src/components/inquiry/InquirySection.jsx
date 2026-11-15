import { useRef } from 'react'
import { SITE } from '../../config/site'
import useReveals from '../../motion/useReveals'
import Seam from '../ui/Seam'
import InquiryForm from './InquiryForm'
import './inquiry.css'

// The closing inquiry (spec §6.12, §8.1, §8.2; extract §4.14), a split on the
// seam: on the left, #zapitvane, the heading, the lead, the phones, the email
// on Golden Residence and the hours; on the right, the form (InquiryForm).
// `page` picks the copy and the form's options: Home's from production's
// contact page (Contact:506–509), Golden Residence's from decision A1, its
// inquiries going to КСМ Строй. Non-breaking spaces after the one-letter
// words (spec §3.3).
//
// The headings rise line by line, the copy fades in and the seam draws as the
// section comes into view (useReveals); the markup is the final state.

const COPY = {
  home: {
    title: (
      <>
        Готови сте да започнете своя <em>проект</em>?
      </>
    ),
    lead: <>Нашият екип е готов да ви помогне да реализирате мечтания проект с&nbsp;качество и&nbsp;професионализъм.</>,
    email: false,
  },
  'golden-residence': {
    title: (
      <>
        Запитване за Golden <em>Residence</em>
      </>
    ),
    lead: (
      <>
        Запитванията за Golden Residence приема КСМ Строй. Обадете се или изпратете запитване и&nbsp;ще се свържем
        с&nbsp;вас.
      </>
    ),
    email: true,
  },
}

export default function InquirySection({ page = 'home' }) {
  const ref = useRef(null)
  useReveals(ref)
  const copy = COPY[page] ?? COPY.home
  const [primary, second] = SITE.phones

  return (
    <section ref={ref} className="sec contact split" id="kontakti" aria-labelledby="contact-h">
      <Seam draw />
      <div className="contact__l" id="zapitvane">
        <h2 className="h2" id="contact-h" data-split="">
          {copy.title}
        </h2>
        <p className="lead" data-fade="">
          {copy.lead}
        </p>
        <a className="contact__tel tab hit" href={`tel:${primary.tel}`} data-fade="">
          <span>{primary.label}</span>
        </a>
        <a className="small tab hit" href={`tel:${second.tel}`} data-fade="">
          <span>{second.label}</span>
        </a>
        {copy.email ? (
          <a className="small hit" href={`mailto:${SITE.email}`} data-fade="">
            <span>{SITE.email}</span>
          </a>
        ) : null}
        <p className="small" data-fade="">
          {SITE.hours.join(', ')}
        </p>
      </div>
      <div className="contact__r">
        <InquiryForm page={page} />
      </div>
    </section>
  )
}
