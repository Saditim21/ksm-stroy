import { STATUS_LABEL } from '../../utils/propertyStatus'
import { statusKeyOf } from './status'
import StatusSwatch from './StatusSwatch'

// A unit's status (spec §7.9): the status's 16 px swatch, with its pattern
// and glyph, then its label. Colour never stands alone.
//
// Ruling R1: a status the rules do not know shows the text the owner wrote in
// the sheet (the unit's statusText, „Скоро"), as production does; without it,
// „Няма информация". It looks blocked. Every known status keeps its own
// label.
export default function StatusChip({ status, text, className = '' }) {
  const key = statusKeyOf(status)
  const label = key === 'unknown' ? text?.trim() || STATUS_LABEL.unknown : STATUS_LABEL[key]
  return (
    <span className={`st ${className}`.trim()}>
      <StatusSwatch status={key} />
      {label}
    </span>
  )
}
