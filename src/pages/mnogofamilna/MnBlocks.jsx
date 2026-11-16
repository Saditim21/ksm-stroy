import { useRef } from 'react'
import Button from '../../components/ui/Button'
import Seam from '../../components/ui/Seam'
import StatusCount from '../../components/ui/StatusCount'
import { STATUS_ORDER } from '../../components/ui/status'
import { PROJECT_BLOCKS } from '../../config/blocks'
import { MN_FACTS } from '../../data/mnogofamilna/facts'
import BlockGrid from '../../explorer/BlockGrid'
import useExplorer from '../../explorer/useExplorer'
import useReveals from '../../motion/useReveals'
import { plural } from '../../utils/format'

// Both blocks, apartment by apartment, #blokove (spec M3 §6.2 #2; the
// concept's mnogofamilna.html:87-98 and js/mnogofamilna.js:1075-1097):
// Golden Residence's blocks in numbers, sized for this building, in place of
// production's two block cards. The hinge, its lead production's „Изберете
// блок за преглед“ (MnogofamilnaBlockSelection.jsx:119); then a split on the
// seam, Блок А against it on the left, Блок Б on the right, each with its
// facts, its 72 apartments as squares, 8 a floor, floors 10 down to 2
// (BlockGrid, sized by the project), its counts by status, its room types
// with the date they are from, and „Преглед на блока“ to its page. A square
// opens its unit in the unit panel (the provider's openUnit, with the square
// for the focus to come back to).
//
// The numbers are the dated snapshot until the sheets are live (spec M3
// §5.1), so they are in the prerendered HTML: never `—`, never a zero. The
// headings rise line by line, the lead fades in and the seams draw as the
// section comes into view (useReveals); the squares come in with their grid
// (BlockGrid); the markup is the final state.

const { perBlock, residentialFloors, perFloor } = MN_FACTS
// A no-break space binds each count to its noun (M3 §4.5).
const FACTS = `${perBlock}\u00A0апартамента · ${residentialFloors}\u00A0етажа · ${perFloor}\u00A0на етаж`
const pad = (n) => String(n).padStart(2, '0')
// Each block's half: Блок А's against the seam on the left.
const SIDES = { 'block-a': 'a', 'block-b': 'b' }

// The room types' words (the concept's core.js:56-62), by the sheets' Вид;
// a type they do not know as the sheet writes it.
const TYPE_WORDS = {
  '2-стаен': ['двустаен', 'двустайни'],
  '3-стаен': ['тристаен', 'тристайни'],
}

/** A count of each room type in words, the types in the order of their
 * names: „36 двустайни · 36 тристайни“. `types` is { [Вид]: count }. */
export function TypeCounts({ types }) {
  return Object.entries(types)
    .sort(([a], [b]) => a.localeCompare(b, 'bg'))
    .map(([type, count], i) => (
      <span key={type}>
        {i > 0 ? ' · ' : null}
        <b>{count}</b> {TYPE_WORDS[type] ? plural(count, ...TYPE_WORDS[type]) : type}
      </span>
    ))
}

export default function MnBlocks() {
  const ref = useRef(null)
  useReveals(ref)
  const { project, model, dated, openUnit } = useExplorer()

  return (
    <section ref={ref} className="sec mnb" id="blokove" aria-labelledby="mnb-h">
      <div className="hinge">
        <h2 className="h2" id="mnb-h" data-split="">
          Два блока, по <em>{perBlock}</em> апартамента
        </h2>
        <p className="lead" data-fade="">
          Изберете блок за преглед. Всеки квадрат е&nbsp;апартамент: етажите отгоре надолу, номерата от 01 до{' '}
          {pad(perFloor)}. Кликнете квадрат, за да отворите&nbsp;апартамента.
        </p>
        <Seam draw />
      </div>
      <div className="split">
        <Seam draw />
        {PROJECT_BLOCKS[project.id].map(({ id, letter }) => {
          const stats = model?.blocks[letter]
          return (
            <div key={id} className={`blk blk--${SIDES[id]}`} id={`blk-${SIDES[id]}`}>
              <h3 className="blk__name">
                Блок&nbsp;<em>{letter}</em>
              </h3>
              <p className="blk__sub">{FACTS}</p>
              <BlockGrid model={model} block={letter} onUnit={openUnit} />
              <div className="blk__stats">
                <ul className="legend">
                  {STATUS_ORDER.map((status) => (
                    <li key={status}>
                      <StatusCount status={status} count={stats ? stats.counts[status] : null} />
                    </li>
                  ))}
                </ul>
                <p className="blk__types">
                  {stats ? <TypeCounts types={stats.types} /> : '—'}
                  {dated ? ` · по данни към ${dated}` : null}
                </p>
              </div>
              <Button to={`/projects/${project.id}/${id}`} variant="link" arrow className="blk__go">
                Преглед на блока
              </Button>
            </div>
          )
        })}
      </div>
    </section>
  )
}
