import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { PRIMARY_PHONE } from '../../config/site'
import useMotionNow from '../../motion/useMotionNow'
import { EMAIL_PATTERN, sendInquiry } from '../../services/inquiry'
import { scrollToId } from '../../utils/scroll'
import Button from '../ui/Button'
import { chooseInquiryOption, INQUIRY_OPTIONS, removePick, resetInquiry, useInquiryState } from './inquiryStore'

// The inquiry form (spec §10; extract §4.14), in the concept's style: fields
// underlined in hair-ctl, a select with a brass chevron (inquiry.css). Name,
// phone and email are required, the message is not, and the consent is
// checked here: the browser's own checks are off (noValidate), so each
// problem is named in Bulgarian under its field, which is marked
// aria-invalid, and the focus goes to the first. The rules are what the lead
// proxy (api/odoo-lead.js) would otherwise drop without a trace: a name
// under 2 characters once trimmed, an email outside its pattern (Latin
// letters only, so a Cyrillic or punycode domain gets a message of its own),
// and the phone needs 6 digits. A short message is the lead's to top up
// (src/services/inquiry.js).
//
// What the visitor asks about comes from the page's options
// (inquiryStore.js), and the page can preset it, with apartments picked in
// the explorer as chips. A sent inquiry turns into the thank-you, a status
// that takes the focus, rising into place with motion (spec §5.7); a failed
// one says so and keeps what was typed. A new preset after a thank-you
// brings the form back.

const ERRORS = {
  name: 'Въведете име.',
  phone: 'Въведете телефон, поне 6 цифри.',
  email: 'Въведете имейл, например ime@primer.bg.',
  emailLatin: 'Въведете имейл с латински букви, например ime@primer.bg.',
  consent: 'Отбележете съгласието, за да изпратим запитването.',
}
const CONSENT = 'Съгласен съм КСМ Строй да използва данните ми, за да отговори на запитването.'
// The phone in a sentence, kept on one line.
const PHONE = PRIMARY_PHONE.label.split(' ').join(String.fromCharCode(0xa0))

// The fields that can be wrong, in the order the focus looks for the first.
const IDS = { name: 'f-name', phone: 'f-tel', email: 'f-email', consent: 'f-consent' }
const ORDER = ['name', 'phone', 'email', 'consent']
// A Cyrillic letter, or a domain the browser has turned into punycode.
const NOT_LATIN = /\p{Script=Cyrillic}|(^|[@.])xn--/iu
const MIN_NAME = 2
const MIN_PHONE_DIGITS = 6

function validate({ name, phone, email, consent }) {
  const errors = {}
  if (name.trim().length < MIN_NAME) errors.name = ERRORS.name
  if (phone.replace(/\D/g, '').length < MIN_PHONE_DIGITS) errors.phone = ERRORS.phone
  const mail = email.trim()
  if (!EMAIL_PATTERN.test(mail)) errors.email = NOT_LATIN.test(mail) ? ERRORS.emailLatin : ERRORS.email
  if (!consent) errors.consent = ERRORS.consent
  return errors
}

// An error's id, which its field names as its description.
const errorId = (id) => `${id}-err`

function FieldError({ id, message }) {
  return message ? <p className="field__err" id={errorId(id)}>{message}</p> : null
}

// The props that tie a field to its error.
const invalidProps = (id, message) => (message ? { 'aria-invalid': 'true', 'aria-describedby': errorId(id) } : {})

function TextField({ id, label, error, ...input }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input id={id} {...input} {...invalidProps(id, error)} />
      <FieldError id={id} message={error} />
    </div>
  )
}

const BLANK = { name: '', phone: '', email: '', message: '', consent: false }

export default function InquiryForm({ page = 'home' }) {
  const options = INQUIRY_OPTIONS[page] ?? INQUIRY_OPTIONS.home
  const { option, picks } = useInquiryState()
  const chosen = options.some(({ value }) => value === option) ? option : options[0].value
  const [values, setValues] = useState(BLANK)
  // Once a send has been tried, each field's problem shows, and follows the
  // typing until it is fixed.
  const [tried, setTried] = useState(false)
  // 'idle', 'sending', 'sent' or 'failed'.
  const [status, setStatus] = useState('idle')
  const form = useRef(null)
  const thanks = useRef(null)
  const thanked = useRef(false)
  const mounted = useRef(true)
  const motionNow = useMotionNow()
  const errors = tried ? validate(values) : {}

  // A preset after the thank-you (the store is cleared on a send) is a new
  // inquiry: the form comes back, with the visitor's details still in it.
  if (status === 'sent' && (option !== null || picks.length > 0)) setStatus('idle')

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  // The thank-you takes the focus, once, and comes into view if the form's
  // end was all that showed; with motion it rises into place.
  useLayoutEffect(() => {
    if (status !== 'sent') {
      thanked.current = false
      return undefined
    }
    if (thanked.current) return undefined
    thanked.current = true
    const box = thanks.current
    box.focus({ preventScroll: true })
    const { top, bottom } = box.getBoundingClientRect()
    if (top < 0 || bottom > window.innerHeight) scrollToId('zapitvane')
    const motion = motionNow()
    if (!motion) return undefined
    const rise = motion.gsap.from(box.children, { opacity: 0, y: 18, duration: 0.8, ease: 'expo.out', stagger: 0.08, clearProps: 'opacity,transform' })
    return () => rise.revert()
  }, [status, motionNow])

  const set = (key) => (event) => {
    const { value, checked, type } = event.target
    setValues((current) => ({ ...current, [key]: type === 'checkbox' ? checked : value }))
  }

  // A chip's ×: the focus moves to the next chip, else the one before, else
  // the select, never lost with the chip.
  const unpick = (pick) => (event) => {
    const buttons = [...event.currentTarget.closest('ul').querySelectorAll('button')]
    const at = buttons.indexOf(event.currentTarget)
    const next = buttons[at + 1] ?? buttons[at - 1] ?? form.current.querySelector('#f-project')
    removePick(pick)
    next.focus()
  }

  async function onSubmit(event) {
    event.preventDefault()
    if (status === 'sending') return
    const found = validate(values)
    setTried(true)
    const first = ORDER.find((key) => found[key])
    if (first) {
      form.current.querySelector(`#${IDS[first]}`).focus()
      return
    }
    setStatus('sending')
    const subject = options.find(({ value }) => value === chosen).subject
    const { ok } = await sendInquiry({
      name: values.name,
      email: values.email,
      phone: values.phone,
      subject,
      picks: [...picks],
      message: values.message,
    })
    if (!mounted.current) return
    if (ok) {
      resetInquiry()
      setValues((current) => ({ ...current, message: '' }))
      setTried(false)
      setStatus('sent')
    } else {
      setStatus('failed')
    }
  }

  return (
    <>
      <form ref={form} className="form" noValidate onSubmit={onSubmit} hidden={status === 'sent'} data-fade="">
        <div className="form__row">
          <TextField id="f-name" label="Име" name="name" autoComplete="name" required value={values.name} onChange={set('name')} error={errors.name} />
          <TextField id="f-tel" label="Телефон" name="phone" type="tel" inputMode="tel" autoComplete="tel" required value={values.phone} onChange={set('phone')} error={errors.phone} />
        </div>
        <TextField
          id="f-email"
          label="Имейл"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="off"
          spellCheck={false}
          required
          value={values.email}
          onChange={set('email')}
          error={errors.email}
        />
        <div className="field">
          <label htmlFor="f-project">Интересувам се от</label>
          <select id="f-project" name="project" value={chosen} onChange={(event) => chooseInquiryOption(event.target.value)}>
            {options.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        {picks.length > 0 ? (
          <div className="field">
            <span className="field__label" id="f-picks">
              Избрани апартаменти
            </span>
            <ul className="chips" role="list" aria-labelledby="f-picks">
              {picks.map((pick) => (
                <li key={pick} className="chip">
                  Апартамент {pick}
                  <button type="button" aria-label={`Махнете ${pick}`} onClick={unpick(pick)}>
                    <span aria-hidden="true">×</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        <div className="field">
          <label htmlFor="f-msg">Съобщение</label>
          <textarea id="f-msg" name="message" rows={3} value={values.message} onChange={set('message')} />
        </div>
        <div className="form__consent">
          <label className="consent">
            <input type="checkbox" id="f-consent" name="consent" required checked={values.consent} onChange={set('consent')} {...invalidProps('f-consent', errors.consent)} />
            <span>{CONSENT}</span>
          </label>
          <FieldError id="f-consent" message={errors.consent} />
        </div>
        <div>
          <Button type="submit" variant="solid" arrow>
            Изпратете запитване
          </Button>
        </div>
        {status === 'failed' ? (
          <p className="form__fail" role="alert">
            Запитването не беше изпратено. Опитайте отново или се обадете на {PHONE}.
          </p>
        ) : null}
      </form>
      {status === 'sent' ? (
        <div ref={thanks} className="form__ok" role="status" tabIndex={-1}>
          <p>Благодарим ви.</p>
          <p className="lead">
            Ще се свържем с&nbsp;вас в&nbsp;работно време. За бърз отговор: {PHONE}.
          </p>
        </div>
      ) : null}
    </>
  )
}
