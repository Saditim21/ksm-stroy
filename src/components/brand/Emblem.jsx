import { EMBLEM_PATHS } from './emblem-paths.js'
import { STROKE_PROPS } from './strokeProps.js'

export const EMBLEM_VIEWBOX = '0 0 145.13 165.45'

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
