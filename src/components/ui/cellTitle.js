import { STATUS_LABEL } from '../../utils/propertyStatus'
import { statusKeyOf } from './status'

// What the pictures of a project's places say to a pointer: the block
// grids' squares (src/explorer/BlockGrid.jsx), „А 501 · 2-стаен · 62,18 м² ·
// Продаден“ on Golden Residence's page, „А-101 · …“ on Многофамилна's, and
// Golden Residence's parking cells
// (src/pages/golden-residence/ParkingSection.jsx), „Г-001 · 34,01 м² ·
// Продаден“. Only those two import this, so it travels with the block grids,
// in the chunk the two projects' pages share.

// What a place's status reads, as StatusChip has it (spec §7.9, ruling R1):
// its label, or for a status the rules do not know the place's own text
// („Скоро“), else „Няма информация“.
export function statusText(unit) {
  const key = statusKeyOf(unit?.status)
  return key === 'unknown' ? unit?.statusText?.trim() || STATUS_LABEL.unknown : STATUS_LABEL[key]
}

// A title from what is known of a place, the unknown parts left out.
export const cellTitle = (...parts) => parts.filter(Boolean).join(' · ')
