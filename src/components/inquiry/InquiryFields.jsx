// The inquiry form's fields (useInquiryForm.jsx): a text field under its
// label, and the consent, each with its problem under it once a send has
// been tried, named in Bulgarian; the field is marked aria-invalid and names
// the problem as its description. The look is inquiry.css's.

const CONSENT = 'Съгласен съм КСМ Строй да използва данните ми, за да отговори на запитването.'

// An error's id, which its field names as its description.
const errorId = (id) => `${id}-err`

function FieldError({ id, message }) {
  return message ? <p className="field__err" id={errorId(id)}>{message}</p> : null
}

// The props that tie a field to its error.
const invalidProps = (id, message) => (message ? { 'aria-invalid': 'true', 'aria-describedby': errorId(id) } : {})

export function TextField({ id, label, error, ...input }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input id={id} {...input} {...invalidProps(id, error)} />
      <FieldError id={id} message={error} />
    </div>
  )
}

// The consent, checked before anything is sent and never sent itself.
export function ConsentField({ checked, onChange, error }) {
  return (
    <div className="form__consent">
      <label className="consent">
        <input type="checkbox" id="f-consent" name="consent" required checked={checked} onChange={onChange} {...invalidProps('f-consent', error)} />
        <span>{CONSENT}</span>
      </label>
      <FieldError id="f-consent" message={error} />
    </div>
  )
}
