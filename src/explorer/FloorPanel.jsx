import { useLayoutEffect, useRef, useState } from 'react'
import Button from '../components/ui/Button'
import useMotionNow from '../motion/useMotionNow'
import { FloorCounts, FloorMeta, FloorRange } from './FloorFacts'
import { floorKey } from './model'
import { crossfadePlan, drawPlan } from './planMotion'
import PlanSvg from './PlanSvg'

// The edge panel of a block (spec §7.3; extract §4.21; the concept's
// explorer.js:284-301, :403-440): a floor the pointer or the keyboard is on,
// slid in from its block's outer edge over that block's rail. The floor's
// title, its meta (the project's word on the floor, where it has one: the
// кота the drawings give, the attic), its plan in status colours, its
// counts, the range of its free areas, and „Отворете плана“. A polite live
// region, so the keyboard hears the floor it moves to.
//
// `floor` is the facade's floor (model.js) or null, and null closes the
// panel: it keeps the last floor on show while it slides out; `plan` is its
// block's plan, and `project` the facade's (useExplorer.js). With motion
// (useMotionNow) it slides in over 0.45 s expo.out, its plan drawing, and out
// over 0.35 s expo.in; a new floor crossfades. Without, it is there at once.
// The counts, the range line and the meta are FloorFacts.jsx's.

/** „Блок А · *Етаж 5*“, the panel's and the sheet's title. */
export function FloorTitle({ floor, className }) {
  return (
    <p className={className}>
      Блок&nbsp;{floor.block} · <em>Етаж {floor.floor}</em>
    </p>
  )
}

export default function FloorPanel({ project, side, floor, plan, onOpenFloor, onUnit, onPointerEnter, onPointerLeave }) {
  const ref = useRef(null)
  const motionNow = useMotionNow()
  // The floor on show: the last one given, kept while the panel slides out.
  const [shown, setShown] = useState(floor)
  if (floor && floor !== shown) setShown(floor)
  const open = Boolean(floor)
  const key = shown ? floorKey(shown.block, shown.floor) : null
  const before = useRef({ open: false, key: null })
  const slide = useRef(null)

  useLayoutEffect(() => {
    const was = before.current
    before.current = { open, key }
    const motion = motionNow()
    const panel = ref.current
    if (!motion) return
    const { gsap } = motion
    if (open !== was.open) {
      // From the panel's edge, or from wherever a slide it cuts short left it.
      const off = side === 'А' ? -102 : 102
      const from = slide.current?.isActive() ? { visibility: 'visible' } : { xPercent: open ? off : 0, visibility: 'visible' }
      const to = open ? { xPercent: 0, duration: 0.45, ease: 'expo.out' } : { xPercent: off, duration: 0.35, ease: 'expo.in' }
      slide.current?.kill()
      slide.current = gsap.fromTo(panel, from, { ...to, clearProps: 'transform,visibility' })
      if (open) drawPlan(gsap, panel)
    } else if (open && key !== was.key) {
      crossfadePlan(gsap, panel)
    }
  }, [open, key, side, motionNow])

  // What a floor opened from here hands on (ruling F5): the plan's place on
  // screen, for the stage to grow from, and the element that opened it.
  const planRect = () => ref.current?.querySelector('.fxp__plan svg')?.getBoundingClientRect() ?? null

  return (
    <aside
      ref={ref}
      className={`fxp fxp--${side === 'А' ? 'a' : 'b'}`}
      data-open={open ? '' : undefined}
      inert={!open}
      aria-live="polite"
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      {shown ? (
        <>
          <FloorTitle floor={shown} className="fxp__title" />
          <FloorMeta project={project} plan={plan} floor={shown} className="fxp__meta" />
          <div className="fxp__plan">
            <PlanSvg plan={plan} units={shown.units} mode="mini" onUnit={(unit, event) => onUnit(unit, { fromRect: planRect(), opener: event.target })} />
          </div>
          <FloorCounts counts={shown.counts} className="fxp__counts" />
          <FloorRange floor={shown} className="fxp__range" />
          <Button
            variant="link"
            arrow
            className="fxp__go"
            onClick={(event) => onOpenFloor(shown.block, shown.floor, undefined, { fromRect: planRect(), opener: event.currentTarget })}
          >
            Отворете плана
          </Button>
        </>
      ) : null}
    </aside>
  )
}
