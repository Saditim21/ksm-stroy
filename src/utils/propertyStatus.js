/**
 * Property status — the single source of truth for the "Статус" column.
 *
 * The owner picks one of four dropdown values in the Google Sheets tabs
 * (Блок А, Блок Б, Гаражи, Паркоместа):
 *
 *   Свободен · Резервиран · Продаден · Блокиран
 *
 * Every value the site renders or counts passes through normalizeStatus()
 * first, so casing, stray whitespace, the plural "Продадени" and the English
 * equivalents all collapse to one canonical value per status.
 */

export const STATUS = Object.freeze({
  AVAILABLE: 'Свободен',
  RESERVED: 'Резервиран',
  // Kept plural on purpose: it is the spelling every existing UI comparison expects.
  SOLD: 'Продадени',
  BLOCKED: 'Блокиран',
});

// Order matters only in that "свободен" is checked last, so a value such as
// "Свободен - блокиран" resolves to the more restrictive status.
const MATCHERS = [
  [STATUS.SOLD, ['продаден', 'sold']],
  [STATUS.RESERVED, ['резервиран', 'reserved']],
  [STATUS.BLOCKED, ['блокиран', 'blocked']],
  [STATUS.AVAILABLE, ['свободен', 'available', 'free']],
];

/**
 * Map a raw sheet cell to a canonical status.
 * Empty cells mean available. Unknown text (e.g. "Скоро") passes through
 * untouched so nothing is silently hidden.
 */
export function normalizeStatus(raw) {
  if (raw === null || raw === undefined) return STATUS.AVAILABLE;
  const text = String(raw).trim();
  if (text === '') return STATUS.AVAILABLE;

  const lower = text.toLowerCase();
  for (const [canonical, needles] of MATCHERS) {
    if (needles.some((needle) => lower.includes(needle))) return canonical;
  }
  return text;
}

/**
 * Count a list of raw or canonical statuses.
 * Returns { total, available, reserved, sold, blocked }.
 */
export function summarizeStatuses(statuses) {
  const summary = { total: 0, available: 0, reserved: 0, sold: 0, blocked: 0 };

  for (const raw of statuses) {
    summary.total += 1;
    switch (normalizeStatus(raw)) {
      case STATUS.AVAILABLE: summary.available += 1; break;
      case STATUS.RESERVED: summary.reserved += 1; break;
      case STATUS.SOLD: summary.sold += 1; break;
      case STATUS.BLOCKED: summary.blocked += 1; break;
      default: break;
    }
  }

  return summary;
}
