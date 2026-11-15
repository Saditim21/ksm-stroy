import { statusKeyOf, statusLook } from './status'
import './status.css'

// A status's swatch (spec §7.9; the concept's core.js:24-29 and
// diptych.css:255-270): 16 × 16, the status colour with its pattern and a
// 10 × 10 glyph, so a status is never colour alone:
// - available: solid green, a ✓ in onyx;
// - reserved: orange stripes, a clock on an umber disc;
// - sold: red dots, a ✕ on umber;
// - blocked, and a status the rules do not know: a dashed grey border, a —.
// It always sits beside the status's word, so it is hidden from assistive
// technology. The look is status.css's.

// Each glyph has one path; the clock's face is its circle.
const GLYPHS = {
  available: <path d="M1.6 5.3l2.2 2.2 4.6-4.9" fill="none" stroke="currentColor" strokeWidth="1.7" />,
  reserved: (
    <>
      <circle cx="5" cy="5" r="3.7" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <path d="M5 2.9v2.3l1.6 1" fill="none" stroke="currentColor" strokeWidth="1.2" />
    </>
  ),
  sold: <path d="M2.6 2.6l4.8 4.8M7.4 2.6L2.6 7.4" stroke="currentColor" strokeWidth="1.5" />,
  blocked: <path d="M2 5h6" stroke="currentColor" strokeWidth="1.6" />,
}

/** The bare 10 × 10 glyph of `status`, in the current colour: the facade's
 * rails mark each floor's colour with it (spec §7.2). */
export function StatusGlyph({ status, className }) {
  const key = statusKeyOf(status)
  return (
    <svg className={className} viewBox="0 0 10 10" width="10" height="10" aria-hidden="true" focusable="false">
      {GLYPHS[key === 'unknown' ? 'blocked' : key]}
    </svg>
  )
}

export default function StatusSwatch({ status }) {
  const key = statusKeyOf(status)
  return (
    <span className={`sw sw--${statusLook(key)}`} data-status={key} aria-hidden="true">
      <StatusGlyph status={key} />
    </span>
  )
}
