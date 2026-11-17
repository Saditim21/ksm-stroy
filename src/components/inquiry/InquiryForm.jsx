import { chooseInquiryOption, INQUIRY_OPTIONS } from './inquiryStore'
import useInquiryForm from './useInquiryForm'

// The inquiry form (spec §10; extract §4.14) as the closing inquiry sets it
// out (InquirySection.jsx): its fields (useInquiryForm.jsx, which holds the
// form's state, checks, send and thank-you) with the subject as a select,
// with a brass chevron (inquiry.css), after the email. The page's options
// (`page`'s in inquiryStore.js, Golden Residence's, or the `options` any
// other page hands over) fill the select; a sent inquiry hides the form and
// shows the thank-you in its place.

export default function InquiryForm({ page = 'golden-residence', options = INQUIRY_OPTIONS[page] }) {
  const { status, chosen, form, fields, thanks } = useInquiryForm(options)

  return (
    <>
      <form className="form" {...form} hidden={status === 'sent'} data-fade="">
        {fields(
          <div className="field">
            <label htmlFor="f-project">Интересувам се от</label>
            <select id="f-project" name="project" value={chosen} onChange={(event) => chooseInquiryOption(event.target.value)}>
              {options.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>,
        )}
      </form>
      {thanks}
    </>
  )
}
