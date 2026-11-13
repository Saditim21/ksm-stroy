/**
 * Property status — the single source of truth for the "Статус" column.
 *
 * The owner picks one of four dropdown values in the Google Sheets tabs
 * (Блок А, Блок Б, Гаражи, Паркоместа, Многофамилна Вход А / Вход Б):
 *
 *   Свободен · Резервиран · Продаден · Блокиран
 *
 * Every value the site renders or counts passes through normalizeStatus()
 * first, so casing, stray whitespace, the plural "Продадени" and the English
 * equivalents all collapse to one canonical value per status.
 *
 * The explorer works with status keys (STATUS_KEY) rather than the Bulgarian
 * values; statusKey() derives them from the same rules, so the two never
 * disagree about a unit.
 */

export const STATUS = Object.freeze({
  AVAILABLE: 'Свободен',
  RESERVED: 'Резервиран',
  // Kept plural on purpose: it is the spelling every existing UI comparison expects.
  SOLD: 'Продадени',
  BLOCKED: 'Блокиран',
});

/**
 * One key per canonical status, plus "unknown" for text normalizeStatus()
 * passes through. UI code keys its colours and labels by these.
 */
export const STATUS_KEY = Object.freeze({
  AVAILABLE: 'available',
  RESERVED: 'reserved',
  SOLD: 'sold',
  BLOCKED: 'blocked',
  UNKNOWN: 'unknown',
});

/**
 * What a visitor, or a screen reader, is told for each key. "Продаден" is
 * singular here because a label names one unit. Folded in from the Golden
 * Residence landing (golden-residence src/utils/status.js @944bb03).
 */
export const STATUS_LABEL = Object.freeze({
  available: 'Свободен',
  reserved: 'Резервиран',
  sold: 'Продаден',
  blocked: 'Блокиран',
  unknown: 'Няма информация',
});

// Sold beats reserved beats blocked beats available: "свободен" is checked
// last, so a value such as "Свободен - блокиран" resolves to the more
// restrictive status.
const MATCHERS = [
  [STATUS.SOLD, ['продаден', 'sold']],
  [STATUS.RESERVED, ['резервиран', 'reserved']],
  [STATUS.BLOCKED, ['блокиран', 'blocked']],
  [STATUS.AVAILABLE, ['свободен', 'available', 'free']],
];

const KEY_OF = new Map([
  [STATUS.AVAILABLE, STATUS_KEY.AVAILABLE],
  [STATUS.RESERVED, STATUS_KEY.RESERVED],
  [STATUS.SOLD, STATUS_KEY.SOLD],
  [STATUS.BLOCKED, STATUS_KEY.BLOCKED],
]);

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
 * Map a raw sheet cell, a canonical status or a key to its STATUS_KEY.
 * Same rules as normalizeStatus(): an empty cell is available, and text it
 * passes through is "unknown".
 */
export function statusKey(raw) {
  return KEY_OF.get(normalizeStatus(raw)) ?? STATUS_KEY.UNKNOWN;
}

/**
 * Count a list of raw or canonical statuses (or keys).
 * Returns { total, available, reserved, sold, blocked }; unknown text counts
 * in the total only.
 */
export function summarizeStatuses(statuses) {
  const summary = { total: 0, available: 0, reserved: 0, sold: 0, blocked: 0 };

  for (const raw of statuses) {
    summary.total += 1;
    const key = statusKey(raw);
    if (key !== STATUS_KEY.UNKNOWN) summary[key] += 1;
  }

  return summary;
}
