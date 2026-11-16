import FloorPanel from './FloorPanel'
import FloorSheet from './FloorSheet'
import { floorKey } from './model'
import { plansOf } from './plans'

// The full facade's surfaces (spec §7.3, §7.5; Facade.jsx): the edge panel
// beside each block, and the phone's sheet, each showing the facade's hot
// floor, wired to the facade here, in the surfaces' chunk (surfaces.js), so
// none of it is in a route's first-load JS (ruling C7.7, M3 §10). `fx` is
// what the facade hands over:
//   { project, shape (its floors by key, geometry.js's facadeOf), hot
//     (useHotFloor's), floor (the hot floor: the model's, or its
//     placeholder), lens (the floor the lens is on), block (the block a
//     phone shows), anchor (its stage), rails (its rails by floor key),
//     open(key, unitLabel?, meta?) (the facade's: the sheet gives way, then
//     the floor opens), setHot, clearHot, keep() and leave() (useHotFloor's
//     cancelClose and scheduleClose), over (whether a pointer is over a
//     panel, which the facade's blur reads) }
//
// A floor opened from a panel or the sheet (its button, or a unit of its
// plan) hands on the plan's place and the floor's rail, the opener the stage
// gives the focus back to (ruling F5): the plan is hidden from assistive
// technology, and the sheet's button turns inert as the sheet gives way
// (ruling C7.2).

const BLOCKS = ['А', 'Б']

const openFrom = (fx, key, unitLabel, meta) => fx.open(key, unitLabel, { fromRect: meta?.fromRect ?? null, opener: fx.rails.current.get(key) })
const unitOf = (fx) => (unit, meta) => openFrom(fx, floorKey(unit.block, unit.floor), unit.label, meta)

/** The edge panels: entering one keeps its floor; leaving it (not a finger)
 * clears it after 320 ms. */
export function FacadePanels({ fx }) {
  const plans = plansOf(fx.project)
  if (!plans) return null
  const { hot } = fx
  return BLOCKS.map((block) => (
    <FloorPanel
      key={block}
      project={fx.project}
      side={block}
      floor={hot?.on === 'panel' && fx.shape.get(hot.key).block === block ? fx.floor : null}
      plan={plans[block]}
      onOpenFloor={(b, f, unit, meta) => fx.open(floorKey(b, f), unit, meta)}
      onUnit={unitOf(fx)}
      onPointerEnter={() => {
        fx.over.current = true
        fx.keep()
      }}
      onPointerLeave={(event) => {
        fx.over.current = false
        if (event.pointerType !== 'touch') fx.leave()
      }}
    />
  ))
}

/** The phone's sheet, its stepper moving the hot floor through the
 * project's floors. */
export function FacadeSheet({ fx }) {
  const plans = plansOf(fx.project)
  if (!plans) return null
  const { hot, lens, shape } = fx
  const { min, max } = fx.project.floors
  return (
    <FloorSheet
      project={fx.project}
      floor={hot?.on === 'sheet' ? fx.floor : null}
      plan={plans[lens ? shape.get(lens).block : fx.block]}
      anchor={fx.anchor}
      onClose={fx.clearHot}
      onStep={(step) => {
        if (!hot) return
        const { block, floor } = shape.get(hot.key)
        fx.setHot(floorKey(block, Math.min(max, Math.max(min, floor + step))), 'tap')
      }}
      onOpen={(meta) => hot && openFrom(fx, hot.key, undefined, meta)}
      onUnit={unitOf(fx)}
    />
  )
}
