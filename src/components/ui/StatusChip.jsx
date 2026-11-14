import { STATUS_LABEL } from '../../utils/propertyStatus'

// A unit's status (plan Task 7): a dot in the status colour, then the label.
// Colour never stands alone (spec §3.1). The dot is round, the one shape §3.4
// lets be round besides the window glyph. Free, reserved, sold and blocked take
// the status tokens; unknown is a hollow ring in the text colour. On dusk, where
// sold red measures 1.9:1 and the others under 3:1, a filled dot gets a thin
// paper ring to stand out from the ground.
//
// Ruling R1: a status the rules do not know shows the text the owner wrote in
// the sheet (the unit's statusText, „Скоро"), as production does; without it,
// „Няма информация". Every known status keeps its own label.
const ON_DUSK = '[.on-dusk_&]:ring-1 [.on-dusk_&]:ring-paper/70'
const DOT = {
  available: `bg-status-free ${ON_DUSK}`,
  reserved: `bg-status-reserved ${ON_DUSK}`,
  sold: `bg-status-sold ${ON_DUSK}`,
  blocked: `bg-status-blocked ${ON_DUSK}`,
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
