import { useId, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { statusKeyOf } from '../components/ui/status'
import grImages from '../data/images/golden-residence.json'
import { PALETTE } from '../styles/palette'
import { unitButtonLabel } from '../utils/units'
import { planBox, planShapes } from './geometry'
import { PLAN_MODES, sizePlan } from './planModes'
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
// The modes:
// - mini, the edge panel's and the sheet's: the union of the block's 12
//   units, padded 4, hidden from assistive technology; a pointer opens a unit
//   (onUnit);
// - stage, the plan stage's: padded 14, over the block's dark drawing at 0.6.
//   Interactive: a group named `label`, its units buttons named as every unit
//   list names them (unitButtonLabel), which Enter, Space or a click opens
//   (onUnit). Pointing at a unit, or focusing it, makes it hot (onHot);
// - crop, the unit panel's: `viewBox` frames one unit (cropFor), over the
//   drawing at 0.78; hidden from assistive technology.
// The drawing fades in once it has loaded (explorer.css). Its area is the
// plan's box's: whatever holds the plan clips it (extract §8.3.4).
//
// `hot` (a suffix) is the unit a pointer, the keyboard or the stage's table
// is on: a brass-l outline, the other fills dropping back. `focus` (a suffix)
// is the crop's unit: outlined, the others dimmed.
//
// fit(), the explorer's only layout work in JS, keeps the label, its halo,
// the outline and the dash at constant sizes on screen, whatever the plan's
// size: it measures the plan and writes --fs, --hs, --lw and --dash
// (sizePlan, planModes.js) from a ResizeObserver. `fit={false}` leaves them
// to the plan's owner, who writes them with sizePlan() for a scale it knows:
// the morph's ghost, set for where it lands (PlanStage.jsx). Measured while
// it grows, it would read its scaled box, the size it starts at.
//
// The modes' paddings, patterns, label and line sizes and drawings are
// planModes.js's (spec §7.4).

const RESERVED = PALETTE['status-reserved']
const SOLD = PALETTE['status-sold']

// Each block's dark drawing (plan-a, plan-b: 1200 px, the plans' own grid),
// by the block its plan applies to.
const DRAWINGS = { 'А': grImages['plan-a'], 'Б': grImages['plan-b'] }
function drawingOf(plan) {
  const image = DRAWINGS[plan.appliesTo?.blocks?.[0]]
  return image ? `${image.path}-${image.widths[image.widths.length - 1]}.webp` : null
}

// A unit's fill and its opacity, by its status.
function fillOf(status, id) {
  if (status === 'available') return [PALETTE['status-free'], 0.46]
  if (status === 'reserved') return [`url(#${id}r)`, 1]
  if (status === 'sold') return [`url(#${id}s)`, 1]
  if (status === 'none') return ['none', undefined]
  return [PALETTE['status-blocked'], 0.1]
}

export default function PlanSvg({ plan, units, mode = 'mini', viewBox, hot = null, focus = null, label, fit = true, onUnit, onHot }) {
  const ref = useRef(null)
  // The patterns' ids, this plan's own: two plans on a page never share one.
  const id = `pl${useId().replace(/[^\w-]/g, '')}`
  const { pad, pat, drawing } = PLAN_MODES[mode] ?? PLAN_MODES.mini
  const interactive = mode === 'stage'
  const box = useMemo(() => viewBox ?? planBox(plan, pad), [viewBox, plan, pad])
  const shapes = planShapes(plan)
  const bySuffix = new Map(units.map((unit) => [unit.suffix, unit]))
  const href = drawing ? drawingOf(plan) : null
  // The drawing that has loaded: a new block's waits for its own.
  const [loaded, setLoaded] = useState(null)

  // fit(): the sizes for the scale the plan is drawn at, as it changes.
  useLayoutEffect(() => {
    if (!fit) return undefined
    const svg = ref.current
    const measure = () => {
      const { width, height } = svg.getBoundingClientRect()
      if (width && height) sizePlan(svg, Math.min(width / box.w, height / box.h), mode)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(svg)
    return () => observer.disconnect()
  }, [fit, box, mode])

  const unitOf = (event) => bySuffix.get(event.target.closest?.('.u-hit')?.dataset.suffix)
  const openUnit = (event) => {
    const unit = unitOf(event)
    if (unit) onUnit(unit, event)
  }
  const onKeyDown = (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return
    const unit = unitOf(event)
    if (!unit) return
    event.preventDefault()
    onUnit?.(unit, event)
  }
  // A unit is hot while a hovering pointer is on it (never a finger passing
  // over), or while it has the focus.
  const hotFrom = (event) => {
    const suffix = event.target.closest?.('.u-hit')?.dataset.suffix
    if (suffix && bySuffix.has(suffix)) onHot(suffix)
  }
  const handlers = interactive && onHot
    ? {
        onPointerOver: (event) => {
          if (event.pointerType !== 'touch' && event.pointerType !== 'pen') hotFrom(event)
        },
        onPointerLeave: (event) => {
          if (event.pointerType !== 'touch' && event.pointerType !== 'pen') onHot(null)
        },
        onFocus: hotFrom,
        onBlur: () => onHot(null),
      }
    : {}

  return (
    <svg
      ref={ref}
      className={`plan plan--${mode}`}
      viewBox={`${box.x} ${box.y} ${box.w} ${box.h}`}
      preserveAspectRatio="xMidYMid meet"
      role={interactive ? 'group' : undefined}
      aria-label={interactive ? label : undefined}
      aria-hidden={interactive ? undefined : 'true'}
      focusable="false"
      data-has-hot={hot && bySuffix.has(hot) ? '' : undefined}
      data-has-focus={focus ? '' : undefined}
      onClick={onUnit ? openUnit : undefined}
      onKeyDown={interactive ? onKeyDown : undefined}
      {...handlers}
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
      {href ? (
        <image
          className="drawing"
          href={href}
          x="0"
          y="0"
          width={plan.imageWidth}
          height={plan.imageHeight}
          preserveAspectRatio="none"
          data-loaded={loaded === href ? '' : undefined}
          onLoad={() => setLoaded(href)}
        />
      ) : null}
      <g className="units">
        {shapes.map(({ suffix, d, label: point }) => {
          const unit = bySuffix.get(suffix)
          const status = unit ? statusKeyOf(unit.status) : 'none'
          const [fill, fillOpacity] = fillOf(status, id)
          const button = interactive && unit ? { tabIndex: 0, role: 'button', 'aria-label': unitButtonLabel(unit) } : {}
          return (
            <g
              key={suffix}
              className="u"
              data-suffix={suffix}
              data-status={status}
              data-hot={hot === suffix && unit ? '' : undefined}
              data-focus={focus === suffix ? '' : undefined}
            >
              <path className="u-fill" d={d} fill={fill} fillOpacity={fillOpacity} />
              {status === 'blocked' || status === 'unknown' ? <path className="u-blocked" d={d} /> : null}
              <path className="u-shape" d={d} fill="none" pathLength="1" />
              <text className="u-label" x={point[0]} y={point[1]}>
                {unit ? `${unit.floor}${suffix}` : ''}
              </text>
              <path className="u-hit" d={d} data-suffix={suffix} {...button} />
            </g>
          )
        })}
      </g>
    </svg>
  )
}
