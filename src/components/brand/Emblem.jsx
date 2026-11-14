import { EMBLEM_PATHS } from './emblem-paths.js'

export const EMBLEM_VIEWBOX = '0 0 145.13 165.45'

// Stroke styling sits on the <svg> element as presentation attributes so a
// CSS rule on the className (the header sets stroke-width: 3.45) overrides it.
export const STROKE_PROPS = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2.9,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

export function EmblemPaths() {
  return EMBLEM_PATHS.map(([cls, d], i) => <path key={i} className={cls} pathLength="1" d={d} />)
}

export default function Emblem({ className, draw = false }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={EMBLEM_VIEWBOX}
      className={className}
      aria-hidden="true"
      focusable="false"
      data-draw={draw ? '' : undefined}
      {...STROKE_PROPS}
    >
      <EmblemPaths />
    </svg>
  )
}
