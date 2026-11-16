// The form's send path (InquiryForm.jsx; spec §10, FR5): what only a send
// needs, the checks it runs first (inquiryChecks.js), the send itself
// (src/services/inquiry.js, with EmailJS behind it) and the thank-you a sent
// inquiry turns into (InquiryThanks.jsx). A chunk of its own, which the form
// starts loading as the visitor first steps into it, out of the first-load
// JS of every page with the form.
export { validate } from './inquiryChecks'
export { sendInquiry } from '../../services/inquiry'
export { default as InquiryThanks } from './InquiryThanks'
