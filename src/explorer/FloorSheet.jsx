import { useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Button from '../components/ui/Button'
import useMotionNow from '../motion/useMotionNow'
import { getLenis } from '../utils/lenis'
import { FloorCounts, FloorRange, FloorTitle } from './FloorPanel'
import { floorKey } from './model'
import PlanSvg from './PlanSvg'
import { crossfadePlan, drawPlan } from './planMotion'

// The phone's sheet (spec §7.5; extract §4.25; the concept's
// explorer.js:303-325, :442-480): the floor a first tap chose, at the bottom
// of the screen over the page. Its title and × („Затворете“), its plan, its
// counts and the range of its free areas, then solid „Отворете плана“ and a
// 48 px stepper ▲ „етаж 5“ ▼ through the block's floors, the project's
// (project.floors). A portal on <body>, mounted from its first showing on; it
// never shows from 901 px (explorer.css), where touch uses the edge panel.
//
// `floor` is the facade's floor (model.js) or null, and null closes the
// sheet: it keeps the last floor on show while it slides away; `plan` is its
// block's plan, and `project` the facade's (useExplorer.js). On its first
// showing the page scrolls so `anchor` (the facade's stage) sits above it.
// With motion (useMotionNow) it rises over 0.5 s expo.out, its plan drawing,
// and sinks over 0.35 s expo.in; a new floor crossfades. Without, it is
// there at once.

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

// Scrolls the page so the stage sits whole above the sheet, 14 px clear of
// it, but never under the header's bar (scroll-padding-top), 8 px below it.
function keepAbove(sheet, stage, smooth) {
  requestAnimationFrame(() => {
    const height = sheet.getBoundingClientRect().height
    const rect = stage.getBoundingClientRect()
    const bar = Number.parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0
    const delta = rect.top - Math.max(window.innerHeight - height - rect.height - 14, bar + 8)
    if (Math.abs(delta) <= 4) return
    const lenis = getLenis()
    if (lenis) lenis.scrollTo(lenis.scroll + delta, { duration: 0.8 })
    else window.scrollTo({ top: window.scrollY + delta, behavior: smooth ? 'smooth' : 'auto' })
  })
}

export default function FloorSheet({ project, floor, plan, onClose, onStep, onOpen, onUnit, anchor }) {
  const ref = useRef(null)
  const motionNow = useMotionNow()
  // The floor on show: the last one given, kept while the sheet slides away.
  const [shown, setShown] = useState(floor)
  if (floor && floor !== shown) setShown(floor)
  const open = Boolean(floor)
  const key = shown ? floorKey(shown.block, shown.floor) : null
  const before = useRef({ open: false, key: null })
  const slide = useRef(null)

  useLayoutEffect(() => {
    const was = before.current
    before.current = { open, key }
    const sheet = ref.current
    if (!sheet) return
    const motion = motionNow()
    if (open && !was.open && anchor?.current) keepAbove(sheet, anchor.current, Boolean(motion))
    if (!motion) return
    const { gsap } = motion
    if (open !== was.open) {
      // From the screen's edge, or from wherever a slide it cuts short left it.
      const from = slide.current?.isActive() ? { visibility: 'visible' } : { yPercent: open ? 105 : 0, visibility: 'visible' }
      const to = open ? { yPercent: 0, duration: 0.5, ease: 'expo.out' } : { yPercent: 105, duration: 0.35, ease: 'expo.in' }
      slide.current?.kill()
      slide.current = gsap.fromTo(sheet, from, { ...to, clearProps: 'transform,visibility' })
      if (open) drawPlan(gsap, sheet)
    } else if (open && key !== was.key) {
      crossfadePlan(gsap, sheet)
    }
  }, [open, key, anchor, motionNow])

  if (!shown) return null

  // What a floor opened from here hands on (ruling F5).
  const planRect = () => ref.current?.querySelector('.sheet__plan svg')?.getBoundingClientRect() ?? null

  return createPortal(
    <div ref={ref} className="sheet" role="region" aria-label="Избран етаж" data-open={open ? '' : undefined} inert={!open}>
      <div className="sheet__top">
        <FloorTitle floor={shown} className="sheet__title" />
        <button type="button" className="sheet__x" aria-label="Затворете" onClick={onClose}>
          ×
        </button>
      </div>
      <div className="sheet__plan">
        <PlanSvg project={project} plan={plan} units={shown.units} mode="mini" onUnit={(unit, event) => onUnit(unit, { fromRect: planRect(), opener: event.target })} />
      </div>
      <FloorCounts counts={shown.counts} className="sheet__counts" />
      <FloorRange floor={shown} className="sheet__range" />
      <div className="sheet__act">
        <Button variant="solid" className="sheet__open" onClick={(event) => onOpen({ fromRect: planRect(), opener: event.currentTarget })}>
          Отворете плана
        </Button>
        <div className="step">
          <button type="button" aria-label="По-горен етаж" disabled={shown.floor >= project.floors.max} onClick={() => onStep(1)}>
            {UP}
          </button>
          <output>
            етаж <b>{shown.floor}</b>
          </output>
          <button type="button" aria-label="По-долен етаж" disabled={shown.floor <= project.floors.min} onClick={() => onStep(-1)}>
            {DOWN}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
