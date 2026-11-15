import { STATUS_KEY, statusKey, summarizeStatuses } from './propertyStatus'

// The explorer's availability helpers. Statuses follow production's rules in
// propertyStatus.js: sold beats reserved beats blocked beats available, an
// empty Статус cell is available, and text those rules do not know is
// "unknown". Keys: available / reserved / sold / blocked / unknown.
export const STATUS = STATUS_KEY

export function statusOf(raw) {
  return statusKey(raw)
}

// A floor's colour: green if >=1 available; amber if 0 available and >=1
// reserved; red (sold out) when every unit is sold or blocked; gray otherwise
// (no units, or unknown statuses in the mix).
export function summarizeFloor(apartments = []) {
  const counts = summarizeStatuses(apartments.map((a) => a.status ?? a.статус))
  let color = STATUS.UNKNOWN
  if (counts.available > 0) color = STATUS.AVAILABLE
  else if (counts.reserved > 0) color = STATUS.RESERVED
  else if (counts.total > 0 && counts.sold + counts.blocked === counts.total) color = STATUS.SOLD
  return { ...counts, color }
}
