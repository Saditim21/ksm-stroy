import { useReducedMotion } from 'framer-motion'

// Binding text style for the outlined marquee strip (see task-1-brief.md).
const TEXT_CLASS =
  'font-display text-6xl sm:text-8xl text-transparent [-webkit-text-stroke:1px_#C7A032] opacity-60 py-6'

// Continuous scrolling strip: the text is laid out twice back-to-back and the
// inner flex row is translated from 0 to -50% (exactly one copy's width), so
// the loop restarts seamlessly. The second copy is aria-hidden — it exists
// only to fill the visual loop, not to be announced twice.
export default function Marquee({ text, speed = 40, className = '' }) {
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
