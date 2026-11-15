import { EmblemPaths } from './Emblem.jsx'
import { STROKE_PROPS } from './strokeProps.js'
import { WORDMARK_D } from './wordmark-path.js'

// Placement of the emblem and wordmark inside each lockup, from the masters
// (scripts/logo, logo-horizontal.svg / logo-stacked.svg).
const VARIANTS = {
  horizontal: {
    viewBox: '0 0 342.81 165.45',
    emblem: undefined,
    word: 'translate(170.65 39.22) scale(0.95)',
  },
  stacked: {
    viewBox: '0 0 181.2 293.21',
    emblem: 'translate(18.2 0)',
    word: 'translate(0 180.22)',
  },
}

// `markClassName` goes on the mark alone, whose strokes follow its colour:
// the shell's brass mark beside the wordmark in the text colour (spec §6.2).
export default function Logo({ variant = 'horizontal', className, markClassName }) {
  const v = VARIANTS[variant] ?? VARIANTS.horizontal
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={v.viewBox}
      className={className}
      role="img"
      aria-label="КСМ Строй"
      {...STROKE_PROPS}
    >
      <g transform={v.emblem} className={markClassName}>
        <EmblemPaths />
      </g>
      <path fill="currentColor" stroke="none" fillRule="evenodd" transform={v.word} d={WORDMARK_D} />
    </svg>
  )
}
