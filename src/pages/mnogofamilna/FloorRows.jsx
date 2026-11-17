import Button from '../../components/ui/Button'
import { FloorCounts, FloorMeta, FloorRange } from '../../explorer/FloorFacts'
import { floorKey } from '../../explorer/model'
import PlanSvg from '../../explorer/PlanSvg'

// A Многофамилна block's floors as a ledger (spec M3 §6.5; the concept's
// mnogofamilna-block-a.js:31-58, :79-95 and css/mnogofamilna-block-a.css:32-51):
// a row a floor, from the top floor down, each with
// - its number, large, in the serif („10“ over „етаж“), its name „Етаж 10“
//   for assistive technology;
// - its meta, „8 апартамента“, the attic's „тавански етаж“ before it
//   (FloorMeta);
// - its counts by status (FloorCounts);
// - its plan, every apartment in its status's colour (a mini PlanSvg),
//   whose units open their apartment;
// - its range line, or „Разпродаден етаж“ (FloorRange), and „Отворете
//   плана“, described by the floor's name.
// The numbers are the explorer's model (model.js): the dated snapshot until
// Многофамилна's sheets are live, so the prerendered rows show them.
//
// A row is the page's hot floor (`hotState`, the page's useHotFloor(), which
// the facade beside the rows shows too) while a hovering pointer is on it or
// the focus is in it: it takes the hot class, which draws the brass rule
// down its seam side (mn-block.css). A finger passing over a row lights
// nothing. The pointer leaving the rows, or the focus, lets it go after the
// hot floor's 320 ms; the pointer back on a row before then keeps it.
//
// `onOpen(row, unitLabel?)` opens the row's floor, or one of its units: the
// page grows the stage from the row's plan, and gives the focus back to the
// row's „Отворете плана“ (MnBlockPage.jsx). `rowsRef` is the rows' box,
// which the page reads as it scrolls.

// The floor a row is of, by its key.
const keyOf = (event) => event.target.closest?.('.mbr')?.dataset.k

export default function FloorRows({ project, model, block, plan, hotState, onOpen, rowsRef }) {
  const { hot, setHot, scheduleClose, cancelClose } = hotState
  const { min, max } = project.floors
  const floors = Array.from({ length: max - min + 1 }, (_, i) => max - i)

  // A hovering pointer, never a finger or a pen passing over. A row the
  // pointer has already made hot stays hot without a new render, and a
  // close its leaving set off is called off.
  const onPointerOver = (event) => {
    if (event.pointerType === 'touch' || event.pointerType === 'pen') return
    const key = keyOf(event)
    if (!key) return
    if (hot?.key === key && hot.source === 'mouse') cancelClose()
    else setHot(key, 'mouse')
  }
  const onPointerLeave = (event) => {
    if (event.pointerType === 'mouse') scheduleClose()
  }
  // The keyboard's focus shows as the facade's dashed lens.
  const onFocus = (event) => {
    const key = keyOf(event)
    if (key) setHot(key, event.target.matches?.(':focus-visible') ? 'kbd' : 'mouse')
  }
  const onBlur = (event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) scheduleClose()
  }

  return (
    <div ref={rowsRef} className="mbl__rows" onPointerOver={onPointerOver} onPointerLeave={onPointerLeave} onFocus={onFocus} onBlur={onBlur}>
      {floors.map((floor) => {
        const key = floorKey(block, floor)
        const stats = model?.floors.get(key) ?? { block, floor, units: [], counts: null }
        const name = `mbr-${floor}`
        return (
          <article key={key} className={hot?.key === key ? 'mbr is-hot' : 'mbr'} data-k={key} aria-labelledby={name}>
            <p className="mbr__no" aria-hidden="true">
              <b>{floor}</b>
              <span>етаж</span>
            </p>
            <div className="mbr__body">
              <h3 className="sr-only" id={name}>
                Етаж {floor}
              </h3>
              <FloorMeta project={project} plan={plan} floor={stats} className="mbr__meta" />
              <FloorCounts counts={stats.counts} className="mbr__counts" />
              <div className="mbr__plan">
                <PlanSvg plan={plan} units={stats.units} mode="mini" onUnit={(unit, event) => onOpen(event.target.closest('.mbr'), unit.label)} />
              </div>
              <div className="mbr__foot">
                <FloorRange floor={stats} className="mbr__range" />
                <Button variant="link" arrow className="mbr__go" aria-describedby={name} onClick={(event) => onOpen(event.currentTarget.closest('.mbr'))}>
                  Отворете плана
                </Button>
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}
