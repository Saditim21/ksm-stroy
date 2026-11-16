import { EMAIL_PATTERN } from '../../services/emailPattern'

// The inquiry form's checks (InquiryForm.jsx; spec §10): what the lead proxy
// (api/odoo-lead.js) would otherwise drop without a trace. Name, phone and
// email are required, the message is not, and the consent is checked: a
// name under 2 characters once trimmed, an email outside the proxy's pattern
// (Latin letters only, so a Cyrillic or punycode domain gets a message of its
// own), and a phone with fewer than 6 digits are each named in Bulgarian. A
// short message is the lead's to top up (src/services/inquiry.js).
//
// Only a send uses them, so they travel with the send path (sendPath.js),
// out of the first-load JS of every page with the form (spec §10, FR5;
// ruling T2a).

const ERRORS = {
  name: 'Въведете име.',
  phone: 'Въведете телефон, поне 6 цифри.',
  email: 'Въведете имейл, например ime@primer.bg.',
  emailLatin: 'Въведете имейл с латински букви, например ime@primer.bg.',
  consent: 'Отбележете съгласието, за да изпратим запитването.',
}
// A Cyrillic letter, or a domain the browser has turned into punycode.
const NOT_LATIN = /\p{Script=Cyrillic}|(^|[@.])xn--/iu
const MIN_NAME = 2
const MIN_PHONE_DIGITS = 6

/** The problem with each field the form's values have, by field: { name?,
 * phone?, email?, consent? }, each its message. */
export function validate({ name, phone, email, consent }) {
  const errors = {}
  if (name.trim().length < MIN_NAME) errors.name = ERRORS.name
  if (phone.replace(/\D/g, '').length < MIN_PHONE_DIGITS) errors.phone = ERRORS.phone
  const mail = email.trim()
  if (!EMAIL_PATTERN.test(mail)) errors.email = NOT_LATIN.test(mail) ? ERRORS.emailLatin : ERRORS.email
  if (!consent) errors.consent = ERRORS.consent
  return errors
}
