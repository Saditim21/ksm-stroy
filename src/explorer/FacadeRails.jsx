import { StatusGlyph } from '../components/ui/StatusSwatch'
import { STATUS_ORDER, statusWord } from '../components/ui/status'
import building from '../data/maps/golden-residence.building.json'
import { floorShapes } from './geometry'

// The facade's rails (spec §7.2): on each block's outer edge, the free
// apartments of every floor, as real buttons, top floor first. Each is placed
// at its floor's centre (--cy, on the facade's grid; explorer.css), reads
// floor · glyph · count (mirrored for Блок Б, so the count is nearest the
// facade), and holds its floor as text of its own, „етаж 5“, which the
// availability contract finds. Every count reads `—` until the data arrives,
// never a zero. The handlers are the facade's (Facade.jsx), on the stage
// around them; `railRefs` gets each rail by its floor's key.

const BLOCKS = ['А', 'Б']
const SHAPES = floorShapes(building)
const RAILS = Object.fromEntries(BLOCKS.map((block) => [block, SHAPES.filter((shape) => shape.block === block).sort((a, b) => b.floor - a.floor)]))

// A rail's name: „Блок А, етаж 5: 4 свободни, 2 резервирани, 6 продадени,
// 0 блокирани. Enter отваря плана.“; without the counts until they arrive.
function railName({ block, floor }, stats) {
  const counts = stats ? `: ${STATUS_ORDER.map((status) => `${stats.counts[status]} ${statusWord(status, stats.counts[status])}`).join(', ')}` : ''
  return `Блок ${block}, етаж ${floor}${counts}. Enter отваря плана.`
}

export default function FacadeRails({ model, hotKey, railRefs }) {
  return BLOCKS.map((block) => (
    <div key={block} className={`fx__rail fx__rail--${block === 'А' ? 'a' : 'b'}`}>
      {RAILS[block].map((shape) => {
        const stats = model?.floors.get(shape.key)
        const free = stats ? stats.counts.available : null
        const classes = ['fx__cnt', free === 0 && 'is-zero', hotKey === shape.key && 'is-hot'].filter(Boolean).join(' ')
        return (
          <button
            key={shape.key}
            ref={(node) => {
              if (node) railRefs.current.set(shape.key, node)
              else railRefs.current.delete(shape.key)
            }}
            type="button"
            className={classes}
            data-k={shape.key}
            data-colour={stats ? stats.colour : 'unknown'}
            style={{ '--cy': shape.bbox.y + shape.bbox.h / 2 }}
            aria-label={railName(shape, stats)}
          >
            <span className="f" aria-hidden="true">{shape.floor}</span>
            <span className="d" aria-hidden="true">
              <StatusGlyph status={stats ? stats.colour : 'unknown'} className="g" />
            </span>
            <span className="n">{free ?? '—'}</span>
            <span className="sr-only">етаж {shape.floor}</span>
          </button>
        )
      })}
    </div>
  ))
}
