import { useEffect, useRef } from 'react'
import { SITE } from '../../config/site'
import useReveals from '../../motion/useReveals'
import Seam from '../ui/Seam'
import InquiryForm from './InquiryForm'
import { clearInquiryOption } from './inquiryStore'
import './inquiry.css'

// The closing inquiry (spec §6.12, §8.1, §8.2; M3 §6.2 #6, §8; extract
// §4.14), a split on the seam: on the left, #zapitvane, the heading, the
// lead, the phones, the email on the projects' pages and the hours; on the
// right, the form (InquiryForm). `page` picks the copy and the form's
// options built in, Golden Residence's, which its page and its block pages
// share: decision A1, its inquiries going to КСМ Строй. Non-breaking spaces
// after the one-letter words (spec §3.3).
//
// Every other page hands its own over, `copy` ({ title, lead, email }) and
// `options` (inquiryStore.js's shape), so they travel with its own route and
// in no other page's first-load JS (M3 §10): Home's HOME_INQUIRY, from
// production's contact page (src/pages/home/inquiry.jsx), and Многофамилна's
// routes' MN_INQUIRY (src/pages/mnogofamilna/inquiry.jsx), as
// `<InquirySection {...MN_INQUIRY} />`. Golden Residence's stay built in: a
// module of their own, which its page and its block pages would share, would
// be a chunk of its own on its first load, and cost it more than it saves.
//
// The headings rise line by line, the copy fades in and the seam draws as the
// section comes into view (useReveals); the markup is the final state.
//
// The form's state is a store that outlives the page (inquiryStore.js), so
// the section clears the option it leaves (ruling C5.1): each page's form
// starts on its own subject.

const COPY = {
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

export default function InquirySection({ page = 'golden-residence', copy = COPY[page], options }) {
  const ref = useRef(null)
  useReveals(ref)
  useEffect(() => clearInquiryOption, [])
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
        <InquiryForm page={page} options={options} />
      </div>
    </section>
  )
}
