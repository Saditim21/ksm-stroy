// The elevation mark, кота (spec §3.3): an SVG ▽, which neither font draws
// (§3.2), then „етаж n“, and „кота +x,xx“ only where the drawings give the
// level (Golden Residence А1 is +3,06). Elevations are never invented: without
// `elevation` there is no кота. It labels floors in the floor index, the
// explorer header and the Rise gauge, in the colour and size of its row.
//
// The level is signed as on the drawings: +3,06 above the zero level, ±0,00 on
// it, −3,00 below it. The кота is always set in Geologica: Playfair's + ± −
// are hairline-thin at display size (scripts/fonts/REPORT.md).
function formatElevation(level) {
  const sign = level > 0 ? '+' : level < 0 ? '−' : '±'
  return sign + Math.abs(level).toLocaleString('bg-BG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function ElevationMark({ floor, elevation, className = '' }) {
  return (
    <span className={`nums inline-flex flex-wrap items-baseline gap-x-[0.5em] ${className}`}>
      <span className="inline-flex items-baseline gap-[0.35em] whitespace-nowrap">
        <svg
          aria-hidden="true"
          focusable="false"
          viewBox="0 0 12 10"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinejoin="round"
          className="h-[0.6em] w-[0.72em] shrink-0 overflow-visible"
        >
          <path d="M1 1h10L6 9z" />
        </svg>
        <span>етаж {floor}</span>
      </span>
      {elevation == null ? null : <span className="whitespace-nowrap font-text">кота {formatElevation(elevation)}</span>}
    </span>
  )
}
