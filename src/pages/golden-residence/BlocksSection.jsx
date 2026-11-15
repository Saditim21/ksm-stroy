import { useRef } from 'react'
import Seam from '../../components/ui/Seam'
import StatusCount from '../../components/ui/StatusCount'
import { STATUS_ORDER } from '../../components/ui/status'
import { PROJECT_BLOCKS } from '../../config/blocks'
import { GR_FACTS } from '../../config/facts'
import BlockGrid from '../../explorer/BlockGrid'
import useExplorer from '../../explorer/useExplorer'
import useReveals from '../../motion/useReveals'
import { plural } from '../../utils/format'

// The two blocks in numbers, #blokove (spec §6.16, §8.2 #4; extract §4.27;
// the concept's gr.js:185-210): the hinge, then a split on the seam, Блок А
// against it on the left, Блок Б on the right, each with its facts, its 96
// apartments as squares (BlockGrid), its counts by status, its room types
// („56 двустайни · 32 тристайни · 8 ателиета“), and its exposures, the
// largest first, or the note that the sheet gives none (block А's). A square
// opens its unit in the unit panel (the provider's openUnit; the section sits
// inside the page's ExplorerProvider, src/routes/golden-residence.jsx).
//
// Until the data arrives the counts and the room types read `—`, never a
// zero, and the squares wait in a neutral outline. What follows keeps its
// room too (ruling C8.11), so nothing under it moves when the data lands
// late (Review Focus 1): block А's note, which spec §6.16 gives that block,
// is there from the start, and block Б's exposures wait in empty rows
// (gr.css); the data then tells which a block has. The headings rise line by
// line, the copy fades in and the seams draw as the section comes into view
// (useReveals); the markup is the final state.

const PER_BLOCK = GR_FACTS.apartments / GR_FACTS.blocks
const FACTS = `${PER_BLOCK} апартамента · ${GR_FACTS.floors} етажа · ${GR_FACTS.perFloor} на етаж`
// Each block's half: Блок А's against the seam on the left.
const SIDES = { 'block-a': 'a', 'block-b': 'b' }

// A count of a room type in words (the concept's core.js:56-62), by the
// sheets' Вид: „56 двустайни“, „1 ателие“; a type the words do not know as
// the sheet writes it.
const TYPE_WORDS = {
  '2-стаен': ['двустаен', 'двустайни'],
  '3-стаен': ['тристаен', 'тристайни'],
  'Ателие': ['ателие', 'ателиета'],
}
const typeWord = (type, count) => (TYPE_WORDS[type] ? plural(count, ...TYPE_WORDS[type]) : type)

// The block's counts by status, its room types, and its exposures or the
// note; `stats` is the model's block (buildModel()'s `blocks[letter]`), or
// null until the data arrives: the types then read `—`, block А has its note
// and block Б its exposures' empty rows.
function BlockStats({ letter, stats }) {
  const types = stats ? Object.entries(stats.types) : Object.keys(TYPE_WORDS).map((type) => [type, '—'])
  // Sorted the largest first; equal counts keep the sheet's order.
  const exposures = stats ? Object.entries(stats.exposure).sort((a, b) => b[1] - a[1]) : []
  const note = stats ? !exposures.length : letter === 'А'
  return (
    <>
      <div className="blk__stats">
        <ul className="legend">
          {STATUS_ORDER.map((status) => (
            <li key={status}>
              <StatusCount status={status} count={stats ? stats.counts[status] : null} />
            </li>
          ))}
        </ul>
        <p className="blk__types">
          {types.map(([type, count], i) => (
            <span key={type}>
              {i > 0 ? ' · ' : null}
              <b>{count}</b> {typeWord(type, count)}
            </span>
          ))}
        </p>
      </div>
      {note ? (
        <p className="blk__note">Изложението на блок&nbsp;{letter} не е&nbsp;попълнено в&nbsp;таблицата.</p>
      ) : (
        <ul className="blk__expo">
          {exposures.map(([exposure, count]) => (
            <li key={exposure}>
              <b>{count}</b> {exposure.toLowerCase()}
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

export default function BlocksSection() {
  const ref = useRef(null)
  useReveals(ref)
  const { model, openUnit } = useExplorer()

  return (
    <section ref={ref} className="sec blocks" id="blokove" aria-labelledby="blk-h">
      <div className="hinge">
        <h2 className="h2" id="blk-h" data-split="">
          Два блока, по <em>{PER_BLOCK}</em> апартамента
        </h2>
        <p className="lead" data-fade="">
          Всеки квадрат е&nbsp;апартамент: етажите отгоре надолу, номерата от 01 до 12. Кликнете квадрат, за да отворите
          апартамента.
        </p>
        <Seam draw />
      </div>
      <div className="split">
        <Seam draw />
        {PROJECT_BLOCKS['golden-residence'].map(({ id, letter }) => (
          <div key={id} className={`blk blk--${SIDES[id]}`} id={`blk-${SIDES[id]}`}>
            <h3 className="blk__name">
              Блок&nbsp;<em>{letter}</em>
            </h3>
            <p className="blk__sub">{FACTS}</p>
            <BlockGrid model={model} block={letter} onUnit={openUnit} />
            <BlockStats letter={letter} stats={model ? model.blocks[letter] : null} />
          </div>
        ))}
      </div>
    </section>
  )
}
