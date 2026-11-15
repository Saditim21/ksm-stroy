import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import StatusChip from '../components/ui/StatusChip'
import StatusLegend from '../components/ui/StatusLegend'
import { GR_FACTS } from '../config/facts'
import useScrollLock from '../hooks/useScrollLock'
import useMotionNow from '../motion/useMotionNow'
import { PALETTE } from '../styles/palette'
import { formatArea } from '../utils/format'
import { trapTab } from '../utils/trapTab'
import { FloorCounts, FloorMeta } from './FloorPanel'
import { planBox } from './geometry'
import { floorKey } from './model'
import { sizePlan } from './planModes'
import { PLANS } from './plans'
import PlanSvg from './PlanSvg'
import { afterimage, crossfadePlan } from './planMotion'

// The plan stage (spec §7.6; extract §4.23; the concept's explorer.js:560-694,
// golden-residence.html:283-300): one floor in full over the page, a modal
// dialog named for it. The bar: the title „Блок А · *Етаж 5*“ and the meta
// (кота where known, the apartments, the free ones), the block switch, the
// stepper ▲ „етаж 5“ ▼ (its output live), and „Към сградата“. The body: the
// floor's plan over its drawing, with an inspector of the unit pointed at;
// beside it, on umber-2, the counts, the key to the patterns, the table of
// the floor's units and the hint. A unit on the plan or a row of the table
// opens the unit (onUnit, with its label), and pointing at either marks both.
//
// What it shows is the parent's (ExplorerContext.jsx, from the address):
// `block` and `floor`, the floor's units from `model` (null until the data
// arrives: `—`, and the plan without statuses), and onFloor, onBlock and
// onClose to change them. `covered`: the unit panel lies over it, so it is
// inert and hidden, and its keys wait (spec §7.7).
//
// - Keys, anywhere while it is open: Escape closes it, Tab stays inside, and
//   PageUp and PageDown step the floor, except inside the table.
// - The focus moves to „Към сградата“ after 700 ms, 30 ms without motion,
//   unless it is inside already; the parent gives it back on close.
// - The page holds still under it (useScrollLock), on umber.
// - With motion (useMotionNow): `fromRect`, the mini plan the floor was opened
//   from, grows into the stage's plan (the morph, extract §4.23); without
//   one, the stage fades in. A new block fades its plan in, a new floor
//   crossfades its fills, and on close a clone of its last frame fades out
//   (afterimage). Without motion everything is at once.

const BLOCKS = ['А', 'Б']
const MINI_PAD = 4
const STAGE_PAD = 14
const FOCUS_AFTER_MS = 700
const FOCUS_AT_ONCE_MS = 30
const CLOSE_FADE_S = 0.3

const UP = (
  <svg viewBox="0 0 12 8" width="12" height="8" aria-hidden="true" focusable="false">
    <path d="M1 7l5-5 5 5" fill="none" stroke="currentColor" strokeWidth="1.4" />
  </svg>
)
const DOWN = (
  <svg viewBox="0 0 12 8" width="12" height="8" aria-hidden="true" focusable="false">
    <path d="M1 1l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.4" />
  </svg>
)
// The hint's ▲ and ▼, drawn: neither face has them (spec §3.3). Their text
// stays for assistive technology, out of sight.
const TRIANGLE_UP = (
  <svg className="tri" viewBox="0 0 10 8" aria-hidden="true" focusable="false">
    <path d="M5 0l5 8H0z" fill="currentColor" />
  </svg>
)
const TRIANGLE_DOWN = (
  <svg className="tri" viewBox="0 0 10 8" aria-hidden="true" focusable="false">
    <path d="M0 0h10L5 8z" fill="currentColor" />
  </svg>
)

// Where a plan's box lies inside an element of `rect` that fits it whole
// (preserveAspectRatio meet), centred.
function fitted(rect, box) {
  const scale = Math.min(rect.width / box.w, rect.height / box.h)
  const width = box.w * scale
  const height = box.h * scale
  return { left: rect.left + (rect.width - width) / 2, top: rect.top + (rect.height - height) / 2, width, height, scale }
}

// The morph (extract §4.23): the mini plan, drawn again in `ghost` (z 51),
// leaves `fromRect` for the place its units take in the stage's plan, while
// the stage's ground comes up; then the stage's plan, its bar and its side
// come in over it, and its drawing after them.
//
// The ghost's outline, halo and dash are set for that place, as the concept
// sets its clone's line for the target (explorer.js:664, extract §4.23 "--lw
// corrected"): it lands with the stage's 1 px outline, which is thinner
// while it is small and never thickens as it grows. Its PlanSvg leaves them
// to this (fit={false}).
function morph(gsap, { root, svg, ghost, plan, fromRect, onDone }) {
  const mini = planBox(plan, MINI_PAD)
  const full = planBox(plan, STAGE_PAD)
  const from = fitted(fromRect, mini)
  const into = fitted(svg.getBoundingClientRect(), full)
  const to = {
    left: into.left + (mini.x - full.x) * into.scale,
    top: into.top + (mini.y - full.y) * into.scale,
    width: mini.w * into.scale,
    height: mini.h * into.scale,
  }
  Object.assign(ghost.style, { left: `${to.left}px`, top: `${to.top}px`, width: `${to.width}px`, height: `${to.height}px` })
  const ghostPlan = ghost.querySelector('svg')
  if (ghostPlan) sizePlan(ghostPlan, into.scale, 'mini')
  const drawing = svg.querySelector('.drawing')
  const rest = [root.querySelector('.ps__bar'), root.querySelector('.ps__side')]
  gsap.set(ghost, { x: from.left - to.left, y: from.top - to.top, scale: from.width / to.width })
  gsap.set(svg, { opacity: 0, pointerEvents: 'none' })
  gsap.set(rest, { opacity: 0 })
  if (drawing) gsap.set(drawing, { opacity: 0 })
  const timeline = gsap.timeline({
    onComplete: () => {
      gsap.set([root, svg, ...rest, drawing].filter(Boolean), { clearProps: 'opacity,backgroundColor,pointerEvents' })
      onDone()
    },
  })
    .fromTo(root, { backgroundColor: 'rgba(26, 23, 20, 0)' }, { backgroundColor: 'rgba(26, 23, 20, 1)', duration: 0.45, ease: 'power2.out' }, 0)
    .to(ghost, { x: 0, y: 0, scale: 1, duration: 0.8, ease: 'expo.inOut' }, 0)
    .to(svg, { opacity: 1, duration: 0.25, ease: 'power1.inOut' }, 0.55)
    .to(ghost, { opacity: 0, duration: 0.25, ease: 'power1.inOut' }, 0.55)
    .to(rest, { opacity: 1, duration: 0.5, ease: 'power2.out', stagger: 0.06 }, 0.55)
    .set(svg, { pointerEvents: 'auto' }, 0.8)
  if (drawing) timeline.to(drawing, { opacity: 0.6, duration: 0.4, ease: 'power2.out' }, 0.6)
  return timeline
}

// A unit's figures, as the inspector shows them while it is pointed at.
function Inspector({ unit, on }) {
  return (
    <div className="ps__inspect" aria-hidden="true" data-on={on ? '' : undefined}>
      {unit ? (
        <>
          <p className="serif">{unit.label}</p>
          <dl>
            <dt>Вид</dt>
            <dd>{unit.type || '—'}</dd>
            <dt>Обща площ</dt>
            <dd>{formatArea(unit.totalArea)}</dd>
            <dt>Изложение</dt>
            <dd>{unit.exposure || '—'}</dd>
            <dt>Статус</dt>
            <dd>
              <StatusChip status={unit.status} text={unit.statusText} />
            </dd>
          </dl>
        </>
      ) : null}
    </div>
  )
}

export default function PlanStage({ model, block, floor, fromRect = null, covered = false, onClose, onFloor, onBlock, onUnit }) {
  const rootRef = useRef(null)
  const ghostRef = useRef(null)
  const upRef = useRef(null)
  const downRef = useRef(null)
  const titleId = useId()
  const motionNow = useMotionNow()
  useScrollLock(PALETTE.umber)
  const data = model?.floors.get(floorKey(block, floor)) ?? { block, floor, units: [], counts: null }
  // The unit pointed at, on the plan or in the table; and the last one, which
  // the inspector keeps while it fades.
  const [hot, setHot] = useState(null)
  const [inspected, setInspected] = useState(null)
  const hotUnit = hot ? data.units.find((unit) => unit.suffix === hot) ?? null : null
  if (hotUnit && hotUnit !== inspected) setInspected(hotUnit)
  // The mini plan that grows into the stage's: only on the way in, with motion.
  const [ghost, setGhost] = useState(() => Boolean(fromRect && motionNow()))
  // The step a click made, so the focus can leave a stepper button the step
  // disabled (the top or the bottom floor) for the other.
  const stepped = useRef(0)

  const step = (delta, byClick = false) => {
    const next = Math.min(GR_FACTS.floors, Math.max(1, floor + delta))
    if (next === floor) return
    stepped.current = byClick ? delta : 0
    onFloor(next)
  }

  // The way in, before the first paint: the morph, or the fade.
  useLayoutEffect(() => {
    const motion = motionNow()
    const root = rootRef.current
    if (!motion) return undefined
    const { gsap } = motion
    if (ghostRef.current && fromRect) {
      const timeline = morph(gsap, {
        root,
        svg: root.querySelector('.ps__plan svg'),
        ghost: ghostRef.current,
        plan: PLANS[block],
        fromRect,
        onDone: () => setGhost(false),
      })
      return () => timeline.kill()
    }
    const fade = gsap.fromTo(root, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: 'power2.out', clearProps: 'opacity' })
    return () => fade.kill()
    // The way in runs once, as the stage mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // The way out: the stage goes with its parameter, and a clone of its last
  // frame fades where it was, unless the page itself is going.
  useLayoutEffect(() => {
    const node = rootRef.current
    const page = window.location.pathname
    return () => {
      const motion = motionNow()
      if (motion && window.location.pathname === page) afterimage(motion.gsap, node, CLOSE_FADE_S)
    }
    // Once, as the stage goes: never on a change of the motion setting.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // A new block or a new floor: no unit is pointed at; with motion, a new
  // block's plan fades in and a new floor's fills crossfade.
  const shown = useRef({ block, floor })
  useLayoutEffect(() => {
    const was = shown.current
    shown.current = { block, floor }
    if (was.block === block && was.floor === floor) return
    setHot(null)
    setInspected(null)
    const motion = motionNow()
    const plan = rootRef.current.querySelector('.ps__plan')
    if (motion && was.block !== block) motion.gsap.fromTo(plan.querySelector('svg'), { opacity: 0 }, { opacity: 1, duration: 0.35, ease: 'power2.out', clearProps: 'opacity' })
    else if (motion) crossfadePlan(motion.gsap, plan)
    // A click on ▲ that reached the top floor (▼ at the bottom) leaves the
    // button disabled, and the focus with nowhere to be: it goes to the other.
    const delta = stepped.current
    stepped.current = 0
    const [from, to] = delta > 0 ? [upRef.current, downRef.current] : [downRef.current, upRef.current]
    if (delta && from?.disabled && (document.activeElement === from || document.activeElement === document.body)) to?.focus()
  }, [block, floor, motionNow])

  // The focus moves in, unless the keyboard has taken it there already, or
  // the unit panel has come over the stage.
  useEffect(() => {
    const timer = setTimeout(() => {
      const root = rootRef.current
      if (!root || root.hasAttribute('inert') || root.contains(document.activeElement)) return
      root.querySelector('.ps__close')?.focus({ preventScroll: true })
    }, motionNow() ? FOCUS_AFTER_MS : FOCUS_AT_ONCE_MS)
    return () => clearTimeout(timer)
    // Once, as the stage opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // The keys, wherever the focus is while the stage is on top.
  useEffect(() => {
    if (covered) return undefined
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      } else if (event.key === 'Tab') {
        trapTab(event, rootRef.current)
      } else if ((event.key === 'PageUp' || event.key === 'PageDown') && !event.target.closest?.('.ps__list')) {
        event.preventDefault()
        step(event.key === 'PageUp' ? 1 : -1)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  })

  const rowKeys = (unit) => (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    onUnit(unit.label)
  }
  const pointing = (event) => event.pointerType !== 'touch' && event.pointerType !== 'pen'

  return createPortal(
    <>
      <div
        ref={rootRef}
        className="ps"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-hidden={covered ? 'true' : undefined}
        inert={covered}
        data-lenis-prevent=""
      >
        <div className="ps__bar">
          <div className="ps__id">
            <h2 className="ps__title" id={titleId}>
              Блок&nbsp;{block} · <em>Етаж {floor}</em>
            </h2>
            <FloorMeta floor={data} free className="ps__meta" />
          </div>
          <div className="ps__mid">
            <div className="seg ps__blocks" role="group" aria-label="Блок">
              {BLOCKS.map((letter) => (
                <button key={letter} type="button" aria-pressed={letter === block} onClick={() => letter !== block && onBlock(letter)}>
                  Блок&nbsp;{letter}
                </button>
              ))}
            </div>
            <div className="step ps__step">
              <button ref={upRef} type="button" aria-label="По-горен етаж" disabled={floor >= GR_FACTS.floors} onClick={() => step(1, true)}>
                {UP}
              </button>
              <output aria-live="polite">
                етаж <b>{floor}</b>
              </output>
              <button ref={downRef} type="button" aria-label="По-долен етаж" disabled={floor <= 1} onClick={() => step(-1, true)}>
                {DOWN}
              </button>
            </div>
          </div>
          <button type="button" className="ps__close" onClick={onClose}>
            <span>Към сградата</span>
            <i aria-hidden="true" />
          </button>
        </div>
        <div className="ps__body">
          <div className="ps__plan">
            <PlanSvg
              plan={PLANS[block]}
              units={data.units}
              mode="stage"
              hot={hot}
              label={`План на етажа, блок ${block}`}
              onHot={setHot}
              onUnit={(unit) => onUnit(unit.label)}
            />
            <Inspector unit={inspected} on={Boolean(hotUnit)} />
          </div>
          <div className="ps__side">
            <FloorCounts counts={data.counts} className="ps__counts" />
            <StatusLegend className="ps__legend" />
            <div className="ps__list" data-lenis-prevent="">
              <table className="utable">
                <thead>
                  <tr>
                    <th scope="col">Имот</th>
                    <th scope="col">Вид</th>
                    <th scope="col">Обща площ</th>
                    <th scope="col">Статус</th>
                  </tr>
                </thead>
                <tbody onPointerLeave={(event) => pointing(event) && setHot(null)}>
                  {data.units.map((unit) => (
                    <tr
                      key={unit.suffix}
                      className={['row', unit.status === 'sold' && 'is-sold', hot === unit.suffix && 'is-hot'].filter(Boolean).join(' ')}
                      tabIndex={0}
                      data-suffix={unit.suffix}
                      onClick={() => onUnit(unit.label)}
                      onKeyDown={rowKeys(unit)}
                      onPointerOver={(event) => pointing(event) && setHot(unit.suffix)}
                      onFocus={() => setHot(unit.suffix)}
                      onBlur={() => setHot(null)}
                    >
                      <td className="uid">{unit.label}</td>
                      <td>{unit.type}</td>
                      <td>{formatArea(unit.totalArea)}</td>
                      <td className="cst">
                        <StatusChip status={unit.status} text={unit.statusText} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="ps__hint">
              Посочете апартамент на плана или в&nbsp;списъка. {TRIANGLE_UP}
              <span className="sr-only">▲</span> {TRIANGLE_DOWN}
              <span className="sr-only">▼</span> сменят етажа, без да се връщате.
            </p>
          </div>
        </div>
      </div>
      {ghost ? (
        <div ref={ghostRef} className="ps__ghost" aria-hidden="true">
          <PlanSvg plan={PLANS[block]} units={data.units} mode="mini" fit={false} />
        </div>
      ) : null}
    </>,
    document.body,
  )
}
