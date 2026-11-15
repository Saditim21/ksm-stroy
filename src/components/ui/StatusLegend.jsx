import { Fragment } from 'react'
import { STATUS_ORDER } from './status'
import StatusChip from './StatusChip'

// The key to the status looks (spec §7.9): labels only, each with its
// swatch, by default the four statuses the sheets use in their order
// (available, reserved, sold, blocked); `statuses` picks others. The plan
// stage's side column carries it, the key to the plan's patterns. A space
// between the entries keeps the words apart for anything that reads the
// text, such as a search engine or a copy and paste.
export default function StatusLegend({ statuses = STATUS_ORDER, className = '' }) {
  return (
    <ul aria-label="Легенда" className={`legend ${className}`.trim()}>
      {statuses.map((status, i) => (
        <Fragment key={status}>
          {i > 0 ? ' ' : null}
          <li>
            <StatusChip status={status} />
          </li>
        </Fragment>
      ))}
    </ul>
  )
}
