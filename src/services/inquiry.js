// An inquiry from the site's own forms (spec §10): one lead, sent the way the
// Contact page sends its form (src/pages/Contact.jsx), to EmailJS and to the
// CRM through the lead proxy (api/odoo-lead.js), in parallel.
//
// The proxy reads exactly six fields and drops a lead without a trace when
// its name is under 2 characters, its email does not match its pattern or
// its message is under 10 characters. A teammate owns the proxy, and it
// never changes, so the lead is made valid here: the name trimmed, and a
// short message given the line „Запитване за: …“ with the lead's subject.
// The form checks the rest before sending (InquiryForm.jsx, with the checks
// of src/components/inquiry/inquiryChecks.js).
//
// Every build but production marks the subject „[ТЕСТ]“, in the CRM and in
// the email (spec §14.3).
//
// The form loads this module only once it is used (spec §10), so it never
// travels with a page's first-load JS.

/* global IS_PRODUCTION_BUILD */

// The proxy's own pattern, emailPattern.js's, which the form's email check
// (src/components/inquiry/inquiryChecks.js) reads too.
export { EMAIL_PATTERN } from './emailPattern'
// The proxy's shortest message.
const MIN_MESSAGE = 10

// Contact's EmailJS service, template and public key: values of the client
// bundle, which the template on emailjs.com reads by these variable names.
const EMAILJS_SERVICE_ID = 'service_qdte1vp'
const EMAILJS_TEMPLATE_ID = 'template_zsun0cc'
const EMAILJS_PUBLIC_KEY = 'iDCcC1JI_k69MIid0'
const TO_EMAIL = 'ksm_str@abv.bg'
const NOT_GIVEN = 'Не е посочен'
const TEST_MARK = '[ТЕСТ] '

/**
 * The lead the form's fields make: the proxy's six fields and the email's
 * template variables.
 * - projectType: the option's subject, then the apartments picked after
 *   „ – “ („Golden Residence – А 301, А 302“); outside production „[ТЕСТ] “
 *   first. It is also the lead's title in Odoo.
 * - budget: none.
 * - message: the visitor's text, trimmed; under 10 characters it gains the
 *   line „Запитване за: {projectType}“.
 * @param {{ name: string, email: string, phone: string, subject: string, picks: string[], message: string }} fields
 * @param {{ production: boolean }} build
 */
export function buildLead({ name, email, phone, subject, picks, message }, { production }) {
  const about = picks.length > 0 ? `${subject} – ${picks.join(', ')}` : subject
  const projectType = production ? about : `${TEST_MARK}${about}`
  const text = (message ?? '').trim()
  const line = `Запитване за: ${projectType}`
  let body = text
  if (text.length < MIN_MESSAGE) body = text ? `${text}\n${line}` : line
  const lead = { name: name.trim(), email: email.trim(), phone: phone.trim() }
  return {
    odoo: { ...lead, projectType, budget: '', message: body },
    emailParams: {
      from_name: lead.name,
      from_email: lead.email,
      reply_to: lead.email,
      phone: lead.phone || NOT_GIVEN,
      project_type: projectType,
      budget: NOT_GIVEN,
      message: body,
      to_email: TO_EMAIL,
    },
  }
}

// The email, through EmailJS, loaded only when an inquiry is sent.
async function sendEmail(params) {
  const { default: emailjs } = await import('@emailjs/browser')
  return emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, params, EMAILJS_PUBLIC_KEY)
}

// The lead, to the CRM through the proxy. Best effort: a failure here is
// reported on the console only, since the email carries the inquiry too.
async function sendToCrm(lead) {
  const response = await fetch('/api/odoo-lead', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(lead),
  })
  if (!response.ok) throw new Error(`CRM отговори с ${response.status}`)
  return response
}

/**
 * Sends an inquiry to EmailJS and the CRM, in parallel. Only the email
 * decides what the visitor sees: { ok: true } once EmailJS has sent it,
 * whatever the CRM answered; { ok: false } when EmailJS failed.
 */
export async function sendInquiry(fields) {
  const { odoo, emailParams } = buildLead(fields, { production: IS_PRODUCTION_BUILD })
  const [email, crm] = await Promise.allSettled([sendEmail(emailParams), sendToCrm(odoo)])
  if (crm.status === 'rejected') console.error('CRM sync failed (запитването е изпратено по имейл):', crm.reason)
  if (email.status === 'rejected') {
    console.error('Inquiry email failed:', email.reason)
    return { ok: false }
  }
  return { ok: true }
}
