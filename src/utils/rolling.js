// The odometer behind a rolling counter, from the Golden Residence landing
// (golden-residence src/utils/rolling.js @944bb03, behind its RollingNumber).
// Each digit of a count gets a column stacking 0–9; digit d sits d tenths of
// the column's height down, so the column moves by yPercent -d * 10 to show it.
export function digitColumns(value) {
  const n = Math.max(0, Math.round(Number(value) || 0))
  return String(n).split('').map(Number)
}

// `|| 0` keeps digit 0 at 0 rather than -0.
export const rollOffset = (digit) => -digit * 10 || 0
