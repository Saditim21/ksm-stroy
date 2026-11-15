import { useId, useLayoutEffect, useMemo, useRef } from 'react'
import { statusKeyOf } from '../components/ui/status'
import { PALETTE } from '../styles/palette'
import { planBox, planShapes } from './geometry'
import './explorer.css'

// One renderer for every plan of a block (spec §7.4; the concept's
// explorer.js:64-201): the block's typical floor (floors.json), its units
// matched by suffix to the floor's units from the sheets. Each unit is drawn
// in its status (never colour alone):
// - available: green at 0.46;
// - reserved: 45° stripes; sold: dots, each a pattern of this plan's own;
// - blocked, and a status the rules do not know: grey at 0.1 under a dashed
//   outline;
// - a unit the sheet does not have: no fill and no label (data-status none).
// Each has a brass outline (pathLength 1, so it can draw), its number („501“)
// at its pole of inaccessibility and a hit path.
//
// The viewBox is the union of the block's 12 units, padded (4 in mini).
// fit(), the explorer's only layout work in JS, keeps the label, its halo,
// the outline and the dash at constant sizes on screen, whatever the plan's
// size: it writes --fs, --hs, --lw and --dash from a ResizeObserver.
//
// `mode` is mini here, the edge panel's and the sheet's: a picture beside
// the counts, hidden from assistive technology, whose units a pointer can
// open (onUnit). The stage and the crop come with the plan stage.

// Per mode (spec §7.4): the viewBox's padding, the pattern's size, and the
// label and line widths on screen.
const MODES = {
  mini: { pad: 4, pat: 16, labelPx: 10, lineW: 1 },
  stage: { pad: 14, pat: 8, labelPx: 12.5, lineW: 1 },
  crop: { pad: 14, pat: 5, labelPx: 13, lineW: 1.2 },
}

const RESERVED = PALETTE['status-reserved']
const SOLD = PALETTE['status-sold']

// A unit's fill and its opacity, by its status.
function fillOf(status, id) {
  if (status === 'available') return [PALETTE['status-free'], 0.46]
  if (status === 'reserved') return [`url(#${id}r)`, 1]
  if (status === 'sold') return [`url(#${id}s)`, 1]
  if (status === 'none') return ['none', undefined]
  return [PALETTE['status-blocked'], 0.1]
}

export default function PlanSvg({ plan, units, mode = 'mini', onUnit }) {
  const ref = useRef(null)
  // The patterns' ids, this plan's own: two plans on a page never share one.
  const id = `pl${useId().replace(/[^\w-]/g, '')}`
  const { pad, pat, labelPx, lineW } = MODES[mode] ?? MODES.mini
  const box = useMemo(() => planBox(plan, pad), [plan, pad])
  const shapes = planShapes(plan)
  const bySuffix = new Map(units.map((unit) => [unit.suffix, unit]))

  useLayoutEffect(() => {
    const svg = ref.current
    const fit = () => {
      const { width, height } = svg.getBoundingClientRect()
      if (!width || !height) return
      const scale = Math.min(width / box.w, height / box.h)
      svg.style.setProperty('--fs', `${labelPx / scale}px`)
      svg.style.setProperty('--hs', `${3 / scale}px`)
      svg.style.setProperty('--lw', `${lineW / scale}px`)
      svg.style.setProperty('--dash', `${4 / scale} ${3 / scale}`)
    }
    fit()
    const observer = new ResizeObserver(fit)
    observer.observe(svg)
    return () => observer.disconnect()
  }, [box, labelPx, lineW])

  const openUnit = (event) => {
    const unit = bySuffix.get(event.target.closest?.('.u-hit')?.dataset.suffix)
    if (unit) onUnit(unit, event)
  }

  return (
    <svg
      ref={ref}
      className={`plan plan--${mode}`}
      viewBox={`${box.x} ${box.y} ${box.w} ${box.h}`}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
      onClick={onUnit ? openUnit : undefined}
    >
      <defs>
        <pattern id={`${id}r`} width={pat} height={pat} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width={pat} height={pat} fill={RESERVED} fillOpacity="0.16" />
          <rect width={pat * 0.34} height={pat} fill={RESERVED} fillOpacity="0.95" />
        </pattern>
        <pattern id={`${id}s`} width={pat} height={pat} patternUnits="userSpaceOnUse">
          <rect width={pat} height={pat} fill={SOLD} fillOpacity="0.13" />
          <circle cx={pat / 2} cy={pat / 2} r={pat * 0.18} fill={SOLD} />
        </pattern>
      </defs>
      <g className="units">
        {shapes.map(({ suffix, d, label }) => {
          const unit = bySuffix.get(suffix)
          const status = unit ? statusKeyOf(unit.status) : 'none'
          const [fill, fillOpacity] = fillOf(status, id)
          return (
            <g key={suffix} className="u" data-suffix={suffix} data-status={status}>
              <path className="u-fill" d={d} fill={fill} fillOpacity={fillOpacity} />
              {status === 'blocked' || status === 'unknown' ? <path className="u-blocked" d={d} /> : null}
              <path className="u-shape" d={d} fill="none" pathLength="1" />
              <text className="u-label" x={label[0]} y={label[1]}>
                {unit ? `${unit.floor}${suffix}` : ''}
              </text>
              <path className="u-hit" d={d} data-suffix={suffix} />
            </g>
          )
        })}
      </g>
    </svg>
  )
}
