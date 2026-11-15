import { STATUS_LABEL } from '../../utils/propertyStatus'
import { statusKeyOf } from './status'

// What the Golden Residence page's pictures of its places say to a pointer:
// the block grids' squares (src/explorer/BlockGrid.jsx), „А 501 · 2-стаен ·
// 62,18 м² · Продаден“, and the parking cells
// (src/pages/golden-residence/ParkingSection.jsx), „Г-001 · 34,01 м² ·
// Продаден“. Only those two import this, so it travels once, in that page's
// own chunk.

// What a place's status reads, as StatusChip has it (spec §7.9, ruling R1):
// its label, or for a status the rules do not know the place's own text
// („Скоро“), else „Няма информация“.
export function statusText(unit) {
  const key = statusKeyOf(unit?.status)
  return key === 'unknown' ? unit?.statusText?.trim() || STATUS_LABEL.unknown : STATUS_LABEL[key]
}

// A title from what is known of a place, the unknown parts left out.
export const cellTitle = (...parts) => parts.filter(Boolean).join(' · ')
