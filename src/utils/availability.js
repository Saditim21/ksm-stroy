export const STATUS = {
  AVAILABLE: 'available',
  RESERVED: 'reserved',
  SOLD: 'sold',
  UNKNOWN: 'unknown',
}

export function statusOf(raw) {
  const s = (raw ?? '').toString().trim().toLowerCase()
  if (!s) return STATUS.UNKNOWN
  if (s.includes('свободен') || s.includes('available') || s.includes('free')) return STATUS.AVAILABLE
  if (s.includes('резервиран') || s.includes('reserved')) return STATUS.RESERVED
  if (s.includes('продаден') || s.includes('sold')) return STATUS.SOLD
  return STATUS.UNKNOWN
}

// Spec §3.2: green if >=1 available; amber if 0 available and >=1 reserved;
// red only if ALL apartments are sold; gray otherwise (empty/unknown mixes).
export function summarizeFloor(apartments = []) {
  const counts = { total: apartments.length, available: 0, reserved: 0, sold: 0 }
  for (const a of apartments) {
    const s = statusOf(a.status ?? a.статус)
    if (s !== STATUS.UNKNOWN) counts[s] += 1
  }
  let color = STATUS.UNKNOWN
  if (counts.available > 0) color = STATUS.AVAILABLE
  else if (counts.reserved > 0) color = STATUS.RESERVED
  else if (counts.total > 0 && counts.sold === counts.total) color = STATUS.SOLD
  return { ...counts, color }
}

// Unit ids appear as "А 101" (Golden) and "А-901" (Многофамилна), sometimes
// typed with Latin lookalike letters in the sheets. Canonical form: Cyrillic
// block letter + digits, no separators.
const LATIN_TO_CYRILLIC = { A: 'А', B: 'Б' }

export function normalizeUnitId(raw) {
  return (raw ?? '')
    .toString()
    .toUpperCase()
    .replace(/[\s\-–—.]/g, '')
    .replace(/[A-Z]/g, (ch) => LATIN_TO_CYRILLIC[ch] || ch)
}

export function matchesFilter(apartment, filter = {}) {
  if (!apartment) return false
  if (filter.onlyAvailable && statusOf(apartment.status ?? apartment.статус) !== STATUS.AVAILABLE) return false
  if (filter.type && !(apartment.вид || '').toLowerCase().includes(filter.type.toLowerCase())) return false
  const area = parseFloat(apartment.total)
  if (filter.minArea != null && !(area >= filter.minArea)) return false
  if (filter.maxArea != null && !(area <= filter.maxArea)) return false
  return true
}
