import { useRef } from 'react'
import Button from '../../components/ui/Button'
import RollingNumber from '../../components/ui/RollingNumber'
import Seam from '../../components/ui/Seam'
import { PROJECT_BLOCKS } from '../../config/blocks'
import { GR_FACTS } from '../../config/facts'
import { apartmentUnits, blockFree, grFree } from '../../data/availability/select'
import { useAvailability } from '../../data/availability/useAvailability'
import useReveals from '../../motion/useReveals'
import { plural } from '../../utils/format'

// The two blocks, #blokove (spec §6.16, §8.2; extract §4.27): the hinge, then
// a split on the seam, Блок А against it on the left, Блок Б on the right,
// each with its facts, its free apartments now (live: `—` until the data
// arrives, then the count, rolling once) and the way to its apartments, the
// block's own page. Task 8 puts each block's grid of apartments and its
// figures here, in the place of that way.
//
// The headings rise line by line, the copy fades in and the seams draw as
// the section comes into view (useReveals); the markup is the final state.

const PER_BLOCK = GR_FACTS.apartments / GR_FACTS.blocks
const FACTS = `${PER_BLOCK} апартамента · ${GR_FACTS.floors} етажа · ${GR_FACTS.perFloor} на етаж`
// Each block's half: Блок А's against the seam on the left.
const SIDES = { 'block-a': 'a', 'block-b': 'b' }

export default function BlocksSection() {
  const ref = useRef(null)
  useReveals(ref)
  const availability = useAvailability()
  // A count only once both blocks have rows (grFree), never a fake zero.
  const counted = grFree(availability) !== null
  const units = counted ? apartmentUnits(availability.data) : []

  return (
    <section ref={ref} className="sec blocks" id="blokove" aria-labelledby="blk-h">
      <div className="hinge">
        <h2 className="h2" id="blk-h" data-split="">
          Два блока, по <em>{PER_BLOCK}</em> апартамента
        </h2>
        <p className="lead" data-fade="">
          Всеки квадрат е апартамент: етажите отгоре надолу, номерата от 01 до 12. Кликнете квадрат, за да отворите
          апартамента.
        </p>
        <Seam draw />
      </div>
      <div className="split">
        <Seam draw />
        {PROJECT_BLOCKS['golden-residence'].map(({ id, letter }) => {
          const free = counted ? blockFree(units, letter) : null
          return (
            <div key={id} className={`blk blk--${SIDES[id]}`} id={`blk-${SIDES[id]}`}>
              <h3 className="blk__name">
                Блок&nbsp;<em>{letter}</em>
              </h3>
              <p className="blk__sub">{FACTS}</p>
              <p className="blk__free">
                <RollingNumber value={free} className="num" />{' '}
                <span>
                  {plural(free, 'свободен', 'свободни')} от {PER_BLOCK}
                </span>
              </p>
              <Button to={`/projects/golden-residence/${id}`} prefetch="intent" variant="link" arrow>
                Изберете апартамент в&nbsp;блок&nbsp;{letter}
              </Button>
            </div>
          )
        })}
      </div>
    </section>
  )
}
