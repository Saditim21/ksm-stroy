import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Button from '../components/ui/Button'
import Seam from '../components/ui/Seam'
import StatusChip from '../components/ui/StatusChip'
import { statusKeyOf } from '../components/ui/status'
import useScrollLock from '../hooks/useScrollLock'
import useMotionNow from '../motion/useMotionNow'
import { PALETTE } from '../styles/palette'
import { formatDecimal } from '../utils/format'
import { STATUS_LABEL } from '../utils/propertyStatus'
import { trapTab } from '../utils/trapTab'
import { cropFor, planShapes } from './planGeometry'
import { findUnit, floorKey } from './model'
import PlanSvg from './PlanSvg'
import { afterimage } from './planMotion'
import { stepUnit } from './surfaceModel'

// The unit panel (spec §7.7; M3 §6.4; extract §4.24; the concept's
// explorer.js:696-809, golden-residence.html:303-310): one apartment, a modal
// dialog over the stage, named for the unit. Two halves on a seam: the
// floor's plan cropped on the unit, outlined, with its caption; then „А
// *501*“ („А-*101*“ on Многофамилна), its block, floor and type with its
// status, its areas in м², its type, exposure („няма данни в таблицата“ when
// the sheet has none), status and price where the sheet has one, the date of
// numbers that are not live, what it offers by its status, and the previous
// and next units on the floor, round from either end. Идеални части shows
// while the project's sheets give any: Многофамилна's give none (M3 §2).
//
// - available: solid „Изпратете запитване“; reserved, and a status the rules
//   do not know: „Попитайте за апартамента“. Either hands the unit to
//   onInquire. Sold and blocked units say why they offer nothing.
// - `unitId` is a label („А 501“), looked up through normalizeUnitId; the
//   parent (ExplorerDialogs.jsx) shows the panel only for a unit the model
//   has. onStep(-1 | 1) asks for the previous or the next. `project` and its
//   `plans` (plans.js) give the plan to crop and its numbers; `dated` is the
//   provider's.
// - Escape closes it, anywhere, and goes no further: the stage under it stays
//   (its own keys wait while it is covered). Tab stays inside; a click on the
//   backdrop closes it too. The focus moves to its action after 500 ms (20 ms
//   without motion), else to its close; the parent gives it back.
// - The page holds still under it (useScrollLock), on umber.
// - With motion (useMotionNow): the backdrop fades in, the halves open
//   outward from the seam and the seam draws; a step fades the details out
//   and the next unit's in; on close a clone of its last frame fades out.

const FOCUS_AFTER_MS = 500
const FOCUS_AT_ONCE_MS = 20
const CLOSE_FADE_S = 0.25
const NBSP = String.fromCharCode(0xa0)

const ACTIONS = {
  available: 'Изпратете запитване',
  reserved: 'Попитайте за апартамента',
  unknown: 'Попитайте за апартамента',
}
// A no-break space after each one-letter word (spec §3.3).
const NOTES = {
  sold: 'Този апартамент е продаден. Свободните на етажа са оцветени в зелено.',
  blocked: 'Този апартамент не се предлага в момента.',
}

const ARROW_BACK = (
  <svg viewBox="0 0 18 10" aria-hidden="true" focusable="false">
    <path d="M18 5H2M6 1L2 5l4 4" fill="none" stroke="currentColor" strokeWidth="1.2" />
  </svg>
)
const ARROW_ON = (
  <svg viewBox="0 0 18 10" aria-hidden="true" focusable="false">
    <path d="M0 5h16M12 1l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.2" />
  </svg>
)

// „А 501“ and „А-101“ as the title sets them: the block's letter with the
// space or the dash after it, and the number in the italic.
function splitLabel(label) {
  const match = /^(\S+?[\s-]+)(.+)$/.exec(label)
  return match ? [match[1], match[2]] : [null, label]
}

// An area: serif figures, a small „м²“ after a no-break space.
function Area({ term, value }) {
  return (
    <div>
      <dt>{term}</dt>
      <dd>
        {value == null ? '—' : (
          <>
            {formatDecimal(value)}
            <small>{NBSP}м²</small>
          </>
        )}
      </dd>
    </div>
  )
}

function Fact({ term, children }) {
  return (
    <div>
      <dt>{term}</dt>
      <dd className="t">{children}</dd>
    </div>
  )
}

/** The panel of the unit `unitId` names, or nothing for a unit the model
 * does not have. */
export default function UnitPanel({ model, unitId, ...handlers }) {
  const unit = findUnit(model, unitId)
  return unit ? <Panel model={model} unit={unit} {...handlers} /> : null
}

function Panel({ project, plans, dated = null, model, unit, onClose, onStep, onInquire }) {
  const rootRef = useRef(null)
  const leftRef = useRef(null)
  const rightRef = useRef(null)
  const titleId = useId()
  const motionNow = useMotionNow()
  useScrollLock(PALETTE.umber)
  const plan = plans[unit.block]
  const shape = planShapes(plan).find(({ suffix }) => suffix === unit.suffix)
  // The crop matches the left half's box, measured (cropFor).
  const [aspect, setAspect] = useState(1)
  const crop = useMemo(() => (shape ? cropFor(shape.bbox, aspect) : undefined), [shape, aspect])

  useLayoutEffect(() => {
    const half = leftRef.current
    if (!half) return undefined
    const measure = () => {
      const { width, height } = (half.querySelector('svg') ?? half).getBoundingClientRect()
      if (width && height) setAspect(width / height)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(half)
    return () => observer.disconnect()
  }, [])

  // The way in, before the first paint.
  useLayoutEffect(() => {
    const motion = motionNow()
    const root = rootRef.current
    if (!motion || !root) return undefined
    const { gsap } = motion
    const halves = [leftRef.current, rightRef.current]
    const seam = root.querySelector('.up__box > .seam')
    const timeline = gsap.timeline({ onComplete: () => gsap.set([root, ...halves, seam], { clearProps: 'opacity,clipPath,transform' }) })
      .fromTo(root, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power2.out' }, 0)
      .fromTo(halves[0], { clipPath: 'inset(0% 0% 0% 100%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.7, ease: 'expo.inOut' }, 0.05)
      .fromTo(halves[1], { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.7, ease: 'expo.inOut' }, 0.05)
      .fromTo(seam, { scaleY: 0 }, { scaleY: 1, duration: 0.6, ease: 'expo.out' }, 0)
    return () => timeline.kill()
    // The way in runs once, as the panel mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // A step's arrival: the next unit's details fade in.
  const shownId = useRef(unit.id)
  useLayoutEffect(() => {
    if (shownId.current === unit.id) return
    shownId.current = unit.id
    motionNow()?.gsap.fromTo(rightRef.current, { opacity: 0 }, { opacity: 1, duration: 0.25, clearProps: 'opacity' })
  }, [unit, motionNow])

  // The way out: a clone of the last frame fades where the panel was, unless
  // the page itself is going. A step still fading out goes with the panel,
  // so it never asks for the next unit once the panel has closed.
  const stepping = useRef(null)
  useLayoutEffect(() => {
    const node = rootRef.current
    const page = window.location.pathname
    return () => {
      stepping.current?.kill()
      const motion = motionNow()
      if (motion && window.location.pathname === page) afterimage(motion.gsap, node, CLOSE_FADE_S)
    }
    // Once, as the panel goes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // The focus moves in: to the action, or to the close where there is none.
  useEffect(() => {
    const timer = setTimeout(() => {
      const root = rootRef.current
      if (!root || root.contains(document.activeElement)) return
      ;(root.querySelector('.up__actions .btn') ?? root.querySelector('.up__close'))?.focus({ preventScroll: true })
    }, motionNow() ? FOCUS_AFTER_MS : FOCUS_AT_ONCE_MS)
    return () => clearTimeout(timer)
    // Once, as the panel opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Escape and Tab, wherever the focus is, before anything under the panel
  // hears them.
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        event.stopPropagation()
        onClose()
      } else if (event.key === 'Tab' && rootRef.current) {
        trapTab(event, rootRef.current)
      }
    }
    document.addEventListener('keydown', onKeyDown, true)
    return () => document.removeEventListener('keydown', onKeyDown, true)
  }, [onClose])

  const status = statusKeyOf(unit.status)
  const action = ACTIONS[status]
  const units = model.floors.get(floorKey(unit.block, unit.floor))?.units ?? [unit]
  const [previous, next] = [stepUnit(model, unit, -1), stepUnit(model, unit, 1)]
  const [letter, number] = splitLabel(unit.label)
  const sub = [`Блок${NBSP}${unit.block}`, `етаж ${unit.floor}`, unit.type].filter(Boolean).join(' · ')
  // Идеални части while the project's sheets give any (M3 §2, §6.4).
  const ideal = model.units.some((each) => each.idealParts != null)

  // A step: the details fade out first, with motion.
  const step = (delta) => {
    const motion = motionNow()
    stepping.current?.kill()
    if (!motion) onStep(delta)
    else stepping.current = motion.gsap.to(rightRef.current, { opacity: 0, duration: 0.12, onComplete: () => onStep(delta) })
  }

  return createPortal(
    <div
      ref={rootRef}
      className="up"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      data-lenis-prevent=""
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="up__box">
        <Seam />
        <div ref={leftRef} className="up__l">
          <PlanSvg project={project} plan={plan} units={units} mode="crop" viewBox={crop} focus={unit.suffix} />
          <p className="up__cap">
            План на етаж {unit.floor}, блок{NBSP}{unit.block}. {unit.label} е{NBSP}очертан.
          </p>
        </div>
        <div ref={rightRef} className="up__r">
          <p className="up__id" id={titleId}>
            {letter}
            <em>{number}</em>
          </p>
          <div className="up__sub">
            <span>{sub}</span> <StatusChip status={unit.status} text={unit.statusText} />
          </div>
          <dl className="up__dl">
            <Area term="Застроена площ" value={unit.builtArea} />
            {ideal ? <Area term="Идеални части" value={unit.idealParts} /> : null}
            <Area term="Обща площ" value={unit.totalArea} />
            <Fact term="Вид">{unit.type || '—'}</Fact>
            <Fact term="Изложение">{unit.exposure || `няма данни в${NBSP}таблицата`}</Fact>
            <Fact term="Статус">{status === 'unknown' ? unit.statusText || STATUS_LABEL.unknown : STATUS_LABEL[status]}</Fact>
            {unit.price ? <Fact term="Цена">{unit.price}</Fact> : null}
          </dl>
          {dated ? <p className="small up__date">По данни към {dated}.</p> : null}
          {NOTES[status] ? <p className="small up__note">{NOTES[status]}</p> : null}
          {action ? (
            <div className="up__actions">
              <Button variant="solid" onClick={() => onInquire(unit)}>
                {action}
              </Button>
            </div>
          ) : null}
          {units.length > 1 ? (
            <nav className="up__nav" aria-label="Апартаменти на етажа">
              <button type="button" onClick={() => step(-1)}>
                {ARROW_BACK}
                {previous.label}
              </button>
              <button type="button" onClick={() => step(1)}>
                {next.label}
                {ARROW_ON}
              </button>
            </nav>
          ) : null}
        </div>
        <button type="button" className="up__close" aria-label="Затворете" onClick={onClose}>
          <i aria-hidden="true" />
        </button>
      </div>
    </div>,
    document.body,
  )
}
