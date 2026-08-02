import { useReducedMotion } from 'framer-motion'

// Binding text style for the outlined marquee strip (see task-1-brief.md).
const TEXT_CLASS =
  'font-display text-6xl sm:text-8xl text-transparent [-webkit-text-stroke:1px_#C7A032] opacity-60 py-6'

// Continuous scrolling strip: the text is laid out twice back-to-back and the
// inner flex row is translated from 0 to -50% (exactly one copy's width), so
// the loop restarts seamlessly. The second copy is aria-hidden — it exists
// only to fill the visual loop, not to be announced twice.
//
// `speed` is in CHARACTERS PER SECOND — the loop duration is the copy's length
// divided by it, so longer copy takes proportionally longer and every strip on
// the site reads at the same pace regardless of what it says. The default is
// deliberately slow: at 40 chars/s a typical 60-character strip loops its whole
// ~2900px width in 1.5 seconds, which is a strobe, not a marquee. 2 gives
// roughly 90px/s — legible, and calm enough to sit behind other content.
export default function Marquee({ text, speed = 2, className = '' }) {
  const reduce = useReducedMotion()
  const duration = text.length / speed

  return (
    <div className={`overflow-hidden whitespace-nowrap ${className}`.trim()}>
      <div
        className={`inline-flex ${reduce ? 'animate-none' : 'animate-marquee'}`}
        style={reduce ? undefined : { animationDuration: `${duration}s` }}
      >
        <span className={TEXT_CLASS}>{text}</span>
        <span className={TEXT_CLASS} aria-hidden="true">{text}</span>
      </div>
    </div>
  )
}
