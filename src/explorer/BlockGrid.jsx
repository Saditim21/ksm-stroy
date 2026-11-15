import { useRef, useState } from 'react'
import { cellTitle, statusText } from '../components/ui/cellTitle'
import { statusLook } from '../components/ui/status'
import useMotion from '../motion/useMotion'
import { formatArea } from '../utils/format'

// A block in numbers (spec §6.16; extract §4.27; the concept's gr.js:185-210):
// its 96 apartments as a 12 × 8 grid of squares, floors 8 → 1 from the top,
// numbers 01 → 12 across, each square a button in its status's pattern
// (gr.css), named „А 501, Продаден“ and titled „А 501 · 2-стаен · 62,18 м² ·
// Продаден“. The floor numbers stand on the seam's side: after block А's
// grid, before block Б's. A click opens the unit (onUnit, with its label and
// the square, for the focus to come back to as the unit panel closes:
// Safari and Firefox on a Mac do not focus a button they click).
//
// The keyboard (ruling T8a): a grid is one tab stop, the square last
// focused, else its first, so the 192 squares never stand between a visitor
// and the gallery. ← and → move along a floor, ↑ and ↓ between floors, Home
// and End to the floor's ends; Enter and Space open the unit, as a button's
// own keys do. One handler for the whole grid.
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

const FLOORS = [8, 7, 6, 5, 4, 3, 2, 1]
const NUMBERS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'))

// The place in its grid of the square an event came from: twelve a floor,
// floor 8's first.
const indexIn = (event) => [...event.currentTarget.children].indexOf(event.target)

export default function BlockGrid({ model, block, onUnit }) {
  const ref = useRef(null)
  // The square in the tab order: its place in the grid.
  const [stop, setStop] = useState(0)
  // The block's units by floor and number: 96 at most, cheaper to build at
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
  // floor above or below (twelve squares), or to the floor's ends; none at
  // the grid's edge. The page never scrolls for one, even there; a key with
  // Alt or ⌘ (Back) is the browser's.
  const onKeyDown = (event) => {
    const i = indexIn(event)
    const column = i % 12
    const step = {
      ArrowLeft: column ? -1 : 0,
      ArrowRight: column < 11 ? 1 : 0,
      ArrowUp: i > 11 ? -12 : 0,
      ArrowDown: i < 84 ? 12 : 0,
      Home: -column,
      End: 11 - column,
    }[event.key]
    if (step === undefined || event.altKey || event.metaKey) return
    event.preventDefault()
    event.currentTarget.children[i + step].focus()
  }

  const floors = (
    <div className="blk__fl" aria-hidden="true">
      {FLOORS.map((floor) => (
        <span key={floor}>{floor}</span>
      ))}
    </div>
  )

  return (
    <div ref={ref} className="blk__floors">
      {block === 'А' ? null : floors}
      <div
        className="blk__grid"
        role="group"
        aria-label={`Апартаментите на блок\u00a0${block}`}
        onFocus={(event) => setStop(indexIn(event))}
        onKeyDown={onKeyDown}
      >
        {FLOORS.flatMap((floor, row) => NUMBERS.map((number, column) => {
          const label = `${block} ${floor}${number}`
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
              tabIndex={row * 12 + column === stop ? 0 : -1}
              onClick={(event) => onUnit(unit?.label ?? label, event.currentTarget)}
            />
          )
        }))}
      </div>
      {block === 'А' ? floors : null}
    </div>
  )
}
