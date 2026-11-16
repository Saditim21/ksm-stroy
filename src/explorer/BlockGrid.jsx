import { useRef, useState } from 'react'
import { cellTitle, statusText } from '../components/ui/cellTitle'
import { statusLook } from '../components/ui/status'
import useMotion from '../motion/useMotion'
import { formatArea } from '../utils/format'
import useExplorer from './useExplorer'

// A block in numbers (spec §6.16; M3 §4.4; extract §4.27; the concept's
// gr.js:185-210): its apartments as a grid of squares, sized from the
// explorer's project (useExplorer.js): a row a floor, its top floor first,
// and a column a number on the floor (Golden Residence 12 × 8, floors 8 → 1;
// Многофамилна 8 × 9, floors 10 → 2). Each square is a button in its status's
// pattern (the page's stylesheet, gr.css), named „А 501, Продаден“ and titled
// „А 501 · 2-стаен · 62,18 м² · Продаден“, by the project's unit label
// („А-101“ on Многофамилна's floor 2). The floor numbers stand on the seam's
// side: after block А's grid, before block Б's. A click opens the unit
// (onUnit, with its label and the square, for the focus to come back to as
// the unit panel closes: Safari and Firefox on a Mac do not focus a button
// they click).
//
// The keyboard (ruling T8a): a grid is one tab stop, the square last
// focused, else its first, so the squares of both blocks never stand between
// a visitor and the gallery; the stop stays inside the grid, even when the
// grid shrinks under it (F22). ← and → move along a floor, ↑ and ↓ between
// floors, Home and End to the floor's ends; Enter and Space open the unit, as
// a button's own keys do. One handler for the whole grid.
//
// `model` is buildModel()'s, or null until the data arrives: every square is
// there before it, in a neutral outline and named by its unit alone, so
// nothing moves when the statuses arrive; a unit the sheets do not have reads
// „Няма информация“, drawn as blocked. It renders with the page, so it stays
// lean (ruling C8.5).
//
// The squares come in once as the block comes up from below (spec §5.7,
// extract §4.27): from opacity 0 over 0.5 s power2.out, 4 ms apart, from the
// seam out (block А from its last square, block Б from its first). A block
// already on screen stays as it is.

// The place in its grid of the square an event came from: a floor's squares
// in a row, the top floor's first.
const indexIn = (event) => [...event.currentTarget.children].indexOf(event.target)

export default function BlockGrid({ model, block, onUnit }) {
  const { project } = useExplorer()
  const { perFloor, floors: { min, max } } = project
  const floors = Array.from({ length: max - min + 1 }, (_, i) => max - i)
  const numbers = Array.from({ length: perFloor }, (_, i) => String(i + 1).padStart(2, '0'))
  const last = floors.length * perFloor - 1
  const ref = useRef(null)
  // The square in the tab order: its place in the grid, within it.
  const [stop, setStop] = useState(0)
  const tabStop = Math.min(stop, last)
  // The block's units by floor and number: a few dozen, cheaper to build at
  // each render than to keep.
  const units = new Map((model?.units ?? []).filter((unit) => unit.block === block).map((unit) => [`${unit.floor}${unit.suffix}`, unit]))

  useMotion(ref, ({ gsap }) => {
    const half = ref.current?.closest('.blk') ?? ref.current
    if (!half || half.getBoundingClientRect().top < window.innerHeight) return
    gsap.from(ref.current.querySelectorAll('.blk__grid button'), {
      opacity: 0,
      duration: 0.5,
      ease: 'power2.out',
      stagger: { each: 0.004, from: block === 'А' ? 'end' : 'start' },
      clearProps: 'opacity',
      scrollTrigger: { trigger: half, start: 'top 75%', once: true },
    })
  }, [block])

  // The step a key of the grid's takes from square i: along its floor, to the
  // floor above or below (a floor's squares), or to the floor's ends; none at
  // the grid's edge. The page never scrolls for one, even there; a key with
  // Alt or ⌘ (Back) is the browser's.
  const onKeyDown = (event) => {
    const i = indexIn(event)
    const column = i % perFloor
    const step = {
      ArrowLeft: column ? -1 : 0,
      ArrowRight: column < perFloor - 1 ? 1 : 0,
      ArrowUp: i >= perFloor ? -perFloor : 0,
      ArrowDown: i <= last - perFloor ? perFloor : 0,
      Home: -column,
      End: perFloor - 1 - column,
    }[event.key]
    if (step === undefined || event.altKey || event.metaKey) return
    event.preventDefault()
    event.currentTarget.children[i + step].focus()
  }

  const numbered = (
    <div className="blk__fl" aria-hidden="true">
      {floors.map((floor) => (
        <span key={floor}>{floor}</span>
      ))}
    </div>
  )

  return (
    <div ref={ref} className="blk__floors">
      {block === 'А' ? null : numbered}
      <div
        className="blk__grid"
        role="group"
        aria-label={`Апартаментите на блок\u00a0${block}`}
        onFocus={(event) => setStop(indexIn(event))}
        onKeyDown={onKeyDown}
      >
        {floors.flatMap((floor, row) => numbers.map((number, column) => {
          const label = project.unitLabel({ block, floor, suffix: number })
          const unit = units.get(`${floor}${number}`)
          const known = Boolean(model)
          const status = known ? statusText(unit) : null
          return (
            <button
              key={label}
              type="button"
              className={known ? `s-${statusLook(unit?.status)}` : 's-none'}
              aria-label={known ? `${label}, ${status}` : label}
              title={known ? cellTitle(label, unit?.type, unit?.totalArea != null ? formatArea(unit.totalArea) : null, status) : undefined}
              tabIndex={row * perFloor + column === tabStop ? 0 : -1}
              onClick={(event) => onUnit(unit?.label ?? label, event.currentTarget)}
            />
          )
        }))}
      </div>
      {block === 'А' ? numbered : null}
    </div>
  )
}
