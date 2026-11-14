import { STATUS_LABEL } from '../../utils/propertyStatus'

// A unit's status (plan Task 7): a dot in the status colour, then the label.
// Colour never stands alone (spec §7.9). The dot is round, the one shape
// Diptych lets be round besides the focus ring (spec §2.2). Free, reserved,
// sold and blocked take the status tokens, each at least 3:1 on onyx and on
// umber (src/styles/tokens.test.js); unknown is a hollow ring in the text
// colour.
//
// Ruling R1: a status the rules do not know shows the text the owner wrote in
// the sheet (the unit's statusText, „Скоро"), as production does; without it,
// „Няма информация". Every known status keeps its own label.
const DOT = {
  available: 'bg-status-free',
  reserved: 'bg-status-reserved',
  sold: 'bg-status-sold',
  blocked: 'bg-status-blocked',
  unknown: 'border border-current',
}

const isKnownKey = (status) => Object.prototype.hasOwnProperty.call(DOT, status)

export default function StatusChip({ status, text, className = '' }) {
  const key = isKnownKey(status) ? status : 'unknown'
  const label = key === 'unknown' ? text?.trim() || STATUS_LABEL.unknown : STATUS_LABEL[key]
  return (
    <span className={`inline-flex items-center gap-2 font-text text-label font-medium ${className}`}>
      <span aria-hidden="true" className={`h-2 w-2 shrink-0 rounded-full ${DOT[key]}`} />
      {label}
    </span>
  )
}
