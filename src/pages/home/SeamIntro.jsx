import { EMBLEM_VIEWBOX, EmblemPaths } from '../../components/brand/Emblem'

// The seam intro (spec §5.5; extract §4.7), once per session, on the first
// page the app renders: the brass seam draws down the centre, the KSM mark
// draws at its midpoint, split down its axis between two onyx doors, and the
// doors part onto the opening. 1.8 s in all, then hidden.
//
// All CSS (home.css), from first paint: it shows only under the motion
// gate's `:root.js.intro` (src/utils/motionGate.js), on Home's first load in
// the session, and never inside a page that arrived (data-arrive, src/root.jsx),
// so a later return to Home never replays it. Without motion it is never
// shown. Decoration, hidden from assistive technology.

// One door's half of the mark: the whole emblem, 92 × 105, centred on the
// seam and cut by its door, so each door carries one half.
function Mark() {
  return (
    <div className="door__mark">
      <svg
        viewBox={EMBLEM_VIEWBOX}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        focusable="false"
      >
        <EmblemPaths />
      </svg>
    </div>
  )
}

export default function SeamIntro() {
  return (
    <div className="intro-doors" aria-hidden="true">
      <div className="door door--l">
        <Mark />
      </div>
      <div className="door door--r">
        <Mark />
      </div>
      <div className="doors__seam" />
    </div>
  )
}
