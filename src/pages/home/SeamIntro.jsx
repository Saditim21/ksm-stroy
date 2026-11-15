import { useEffect, useRef, useState } from 'react'
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
//
// Once it has played it leaves the page (ruling C4.5): the `intro` class
// stays on <html> for the document's life, so reduced motion switched on and
// off again would bring its animation back and play it a second time. It
// leaves on its own animation's end (the doors', the seam's and the mark's
// end inside it, and bubble up), or at once if that end came before the page
// hydrated, which its finished animation, held by its fill, still tells.

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
  const ref = useRef(null)
  const [played, setPlayed] = useState(false)

  // A listener of its own: React names the event by what the browser
  // supports, and would miss a plain `animationend` where AnimationEvent is
  // unknown.
  useEffect(() => {
    const doors = ref.current
    if (!doors) return undefined
    const intro = doors.getAnimations?.().find((animation) => animation.animationName === 'intro-doors')
    if (intro?.playState === 'finished') {
      setPlayed(true)
      return undefined
    }
    const end = (event) => {
      if (event.target === doors) setPlayed(true)
    }
    doors.addEventListener('animationend', end)
    return () => doors.removeEventListener('animationend', end)
  }, [])

  if (played) return null
  return (
    <div ref={ref} className="intro-doors" aria-hidden="true">
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
