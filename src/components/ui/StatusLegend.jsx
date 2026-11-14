import { STATUS_KEY } from '../../utils/propertyStatus'
import StatusChip from './StatusChip'

// The key to the status colours, from golden-residence
// src/components/availability/StatusLegend.jsx @944bb03: by default the four
// statuses the sheets use, in their order; `statuses` picks others.
const KNOWN = [STATUS_KEY.AVAILABLE, STATUS_KEY.RESERVED, STATUS_KEY.SOLD, STATUS_KEY.BLOCKED]

export default function StatusLegend({ statuses = KNOWN, className = '' }) {
  return (
    <ul aria-label="Легенда" className={`flex flex-wrap gap-x-5 gap-y-2 ${className}`}>
      {statuses.map((status) => (
        <li key={status}>
          <StatusChip status={status} />
        </li>
      ))}
    </ul>
  )
}
