import { useEffect, useRef, useState } from 'react'
import { PRIMARY_PHONE } from '../../config/site'
import Button from '../ui/Button'
import { chooseInquiryOption, INQUIRY_OPTIONS, OPTION_PROJECT, removePick, resetInquiry, useInquiryState } from './inquiryStore'

// The inquiry form (spec §10; extract §4.14), in the concept's style: fields
// underlined in hair-ctl, a select with a brass chevron (inquiry.css). Name,
// phone and email are required, the message is not, and the consent is
// checked before anything is sent: the browser's own checks are off
// (noValidate), so each problem is named in Bulgarian under its field, which
// is marked aria-invalid, and the focus goes to the first. The checks
// (inquiryChecks.js) are what the lead proxy (api/odoo-lead.js) would
// otherwise drop without a trace; only a send runs them, so they come with
// the send path (below). Once a send has been tried, each problem follows
// the typing until it is fixed.
//
// What the visitor asks about comes from the page's options (`page`'s in
// inquiryStore.js, Golden Residence's, or the `options` any other page hands
// over, InquirySection.jsx), and the page can preset it, with apartments
// picked in the explorer as chips. A pick goes only with its own project's
// subject
// (ruling FR4, extended by M3 §8): Golden Residence's with its apartments or
// its garages, Многофамилна's with Многофамилна (OPTION_PROJECT). Under
// another subject a pick neither shows nor goes with the lead, and it stays
// in the store, so choosing its project again brings it back.
//
// The send path (sendPath.js: the checks, src/services/inquiry.js with
// EmailJS behind it, and the thank-you) is a chunk of its own, out of the
// page's first-load JS (spec §10, ruling T2a): it starts loading as the
// visitor first steps into the form, and a send waits for it, the form busy
// meanwhile. A load that fails fails the send it held up, as a refused email
// does, and is not kept: the next send loads it again.
//
// While an inquiry is on its way (the send path, the EmailJS chunk, the round
// trip) the form is busy and its action reads as the legacy Contact form's
// does then, „Изпращане...“, and takes no second send. A sent inquiry turns
// into the thank-you (InquiryThanks.jsx, from the send path, which a sent
// inquiry has loaded), a status that takes the focus, rising into place with
// motion (spec §5.7); a failed one says so and keeps what was typed. A new
// preset after a thank-you brings the form back.

const CONSENT = 'Съгласен съм КСМ Строй да използва данните ми, за да отговори на запитването.'
// The phone in a sentence, kept on one line.
const PHONE = PRIMARY_PHONE.label.split(' ').join(String.fromCharCode(0xa0))
// The action's label while an inquiry is on its way: the legacy Contact
// form's own (src/pages/Contact.jsx).
const SENDING = 'Изпращане...'

// The fields that can be wrong, in the order the focus looks for the first.
const IDS = { name: 'f-name', phone: 'f-tel', email: 'f-email', consent: 'f-consent' }
const ORDER = ['name', 'phone', 'email', 'consent']

// The send path's module, loading or loaded, for every form on the page and
// every later visit to it, and the module itself once it is in (`sent`): a
// form that has tried a send has loaded it, so its checks and its thank-you
// are there to use. A load that failed is dropped, to be tried again.
let sendPath = null
let sent = null
function loadSendPath() {
  sendPath ??= import('./sendPath').then(
    (module) => {
      sent = module
      return module
    },
    (error) => {
      sendPath = null
      throw error
    },
  )
  return sendPath
}
// The form's focus starts the load; if it fails, the send says so.
const preloadSendPath = () => {
  loadSendPath().catch(() => {})
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

export default function InquiryForm({ page = 'golden-residence', options = INQUIRY_OPTIONS[page] }) {
  const { option, picks } = useInquiryState()
  const chosen = options.some(({ value }) => value === option) ? option : options[0].value
  const shown = picks.filter((pick) => pick.project === OPTION_PROJECT[chosen])
  const [values, setValues] = useState(BLANK)
  // Once a send has been tried, each field's problem shows, and follows the
  // typing until it is fixed.
  const [tried, setTried] = useState(false)
  // 'idle', 'sending', 'sent' or 'failed'.
  const [status, setStatus] = useState('idle')
  const form = useRef(null)
  const mounted = useRef(true)
  // A form that has tried a send has its checks: the send path is in.
  const errors = tried ? sent.validate(values) : {}

  // A preset after the thank-you (the store is cleared on a send) is a new
  // inquiry: the form comes back, with the visitor's details still in it.
  if (status === 'sent' && (option !== null || picks.length > 0)) setStatus('idle')

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

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
    // The checks come with the send path: in already, from the visitor's
    // first step into the form, or loaded now, the form busy until it is in.
    let path = sent
    if (!path) {
      setStatus('sending')
      path = await loadSendPath().catch((error) => {
        console.error('[inquiry] the send did not load:', error)
      })
      if (!mounted.current) return
      if (!path) {
        setStatus('failed')
        return
      }
    }
    const found = path.validate(values)
    setTried(true)
    const first = ORDER.find((key) => found[key])
    if (first) {
      // Not busy: the form as the send found it.
      setStatus(status)
      form.current.querySelector(`#${IDS[first]}`).focus()
      return
    }
    setStatus('sending')
    const subject = options.find(({ value }) => value === chosen).subject
    const { ok } = await path.sendInquiry({
      name: values.name,
      email: values.email,
      phone: values.phone,
      subject,
      picks: shown.map((pick) => pick.label),
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

  const sending = status === 'sending'
  // The thank-you, from the send path a sent inquiry has loaded.
  const Thanks = status === 'sent' ? sent.InquiryThanks : null

  return (
    <>
      <form
        ref={form}
        className="form"
        noValidate
        onSubmit={onSubmit}
        onFocus={preloadSendPath}
        hidden={status === 'sent'}
        aria-busy={sending ? 'true' : undefined}
        data-fade=""
      >
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
        {shown.length > 0 ? (
          <div className="field">
            <span className="field__label" id="f-picks">
              Избрани апартаменти
            </span>
            <ul className="chips" role="list" aria-labelledby="f-picks">
              {shown.map((pick) => (
                <li key={pick.label} className="chip">
                  Апартамент {pick.label}
                  <button type="button" aria-label={`Махнете ${pick.label}`} onClick={unpick(pick)}>
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
          <Button type="submit" variant="solid" arrow={!sending} aria-disabled={sending ? 'true' : undefined}>
            {sending ? SENDING : 'Изпратете запитване'}
          </Button>
        </div>
        {status === 'failed' ? (
          <p className="form__fail" role="alert">
            Запитването не беше изпратено. Опитайте отново или се обадете на {PHONE}.
          </p>
        ) : null}
      </form>
      {Thanks ? <Thanks phone={PHONE} /> : null}
    </>
  )
}
