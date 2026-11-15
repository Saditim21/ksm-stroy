import { useRef } from 'react'
import { presetInquiry } from '../../components/inquiry/inquiryStore'
import Button from '../../components/ui/Button'
import RollingNumber from '../../components/ui/RollingNumber'
import Seam from '../../components/ui/Seam'
import { GR_FACTS } from '../../config/facts'
import { spotUnits } from '../../data/availability/select'
import { useAvailability } from '../../data/availability/useAvailability'
import useReveals from '../../motion/useReveals'
import { formatArea, plural } from '../../utils/format'
import { STATUS_LABEL } from '../../utils/propertyStatus'
import { summarize } from '../../utils/units'

// The garages and parking places, #garazhi (spec §6.18, §8.2; extract
// §4.29): the hinge, then a split on the seam, the garages against it on the
// left, the parking places on the right. Each half has its free places now
// out of all of them (113 and 68, the project's fixed facts), a legend of
// the statuses with their counts (free and sold always, reserved and blocked
// where there are any), a cell for each place in its status's pattern, the
// list of the free places, and the inquiry with the garage option chosen.
//
// The counts are live, from the sheets (spotUnits): `—` until the data
// arrives, never a zero it has not read, and the cells wait in plain hair
// outlines, as many as the places, so nothing moves when they arrive. The
// cells are a picture of the counts and the list, hidden from assistive
// technology; each names its place, area and status to a pointer.
//
// The legend draws the concept's status chips (core.js:23-50,
// diptych.css:255-270), the swatch with its pattern and glyph, the count and
// the word (spec §7.9), until the explorer's status vocabulary comes.

const PLACES = [
  { slot: 'garages', id: 'park-g', side: 'a', name: 'Гаражи', total: GR_FACTS.garages, list: 'Свободните гаражи', action: 'Запитване за гараж' },
  { slot: 'parking', id: 'park-p', side: 'b', name: 'Паркоместа', total: GR_FACTS.parking, list: 'Свободните паркоместа', action: 'Запитване за паркомясто' },
]

// The statuses in their order (spec §7.9), each with its look's name (the
// concept's), its words and its glyph (10 × 10). A status the rules do not
// know looks blocked.
const STATUSES = ['available', 'reserved', 'sold', 'blocked']
const LOOK = { available: 'free', reserved: 'reserved', sold: 'sold', blocked: 'blocked', unknown: 'blocked' }
const WORDS = {
  available: ['свободен', 'свободни'],
  reserved: ['резервиран', 'резервирани'],
  sold: ['продаден', 'продадени'],
  blocked: ['блокиран', 'блокирани'],
}
const GLYPHS = {
  available: <path d="M1.6 5.3l2.2 2.2 4.6-4.9" fill="none" stroke="currentColor" strokeWidth="1.7" />,
  reserved: (
    <>
      <circle cx="5" cy="5" r="3.7" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <path d="M5 2.9v2.3l1.6 1" fill="none" stroke="currentColor" strokeWidth="1.2" />
    </>
  ),
  sold: <path d="M2.6 2.6l4.8 4.8M7.4 2.6L2.6 7.4" stroke="currentColor" strokeWidth="1.5" />,
  blocked: <path d="M2 5h6" stroke="currentColor" strokeWidth="1.6" />,
}

// What a cell says to a pointer: „Г-001 · 34,01 м² · Продаден“.
const statusOf = (unit) => (unit.status === 'unknown' ? unit.statusText || STATUS_LABEL.unknown : STATUS_LABEL[unit.status])
const cellTitle = (unit) => [unit.label, unit.totalArea == null ? null : formatArea(unit.totalArea), statusOf(unit)].filter(Boolean).join(' · ')

// Both actions choose the garage option, which glides the page to the form
// (spec §5.3), and take the jump from the browser and the router, so the
// address stays as it was. A click that opens a tab or a window, and the
// page without its script, follow the link to #zapitvane.
function toInquiry(event) {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
  event.preventDefault()
  presetInquiry({ option: 'garage' })
}

function Half({ place, availability }) {
  const { slot, id, side, name, total, list, action } = place
  const live = availability.status === 'ready' || availability.status === 'fallback'
  const units = live && availability.data?.['golden-residence']?.[slot] ? spotUnits(availability.data, slot) : null
  const counts = units ? summarize(units) : null
  const free = counts ? counts.available : null
  const shownInLegend = STATUSES.filter((status) => status === 'available' || status === 'sold' || counts?.[status] > 0)

  return (
    <div className={`park__half park__half--${side}`} id={id}>
      <h3 className="blk__name">{name}</h3>
      <p className="park__big">
        <RollingNumber value={free} className="num" />{' '}
        <span>
          {plural(free, 'свободен', 'свободни')} от {total}
        </span>
      </p>
      <ul className="legend">
        {shownInLegend.map((status) => {
          const count = counts ? counts[status] : null
          return (
            <li key={status} className={`st st--${LOOK[status]}`}>
              <span className="sw" aria-hidden="true">
                <svg viewBox="0 0 10 10" focusable="false">
                  {GLYPHS[status]}
                </svg>
              </span>
              <b>{count ?? '—'}</b> {WORDS[status][count === 1 ? 0 : 1]}
            </li>
          )
        })}
      </ul>
      <div className="park__cells" aria-hidden="true">
        {units
          ? units.map((unit, i) => <i key={i} className={`s-${LOOK[unit.status] ?? 'blocked'}`} title={cellTitle(unit)} />)
          : Array.from({ length: total }, (_, i) => <i key={i} />)}
      </div>
      <details>
        <summary>
          {list} ({free ?? '—'})
        </summary>
        <ul className="park__list">
          {(units ?? []).filter((unit) => unit.status === 'available').map((unit, i) => (
            <li key={i}>
              <span>{unit.label}</span> <span>{formatArea(unit.totalArea)}</span>
            </li>
          ))}
        </ul>
      </details>
      <Button href="#zapitvane" variant="link" arrow onClick={toInquiry}>
        {action}
      </Button>
    </div>
  )
}

export default function ParkingSection() {
  const ref = useRef(null)
  useReveals(ref)
  const availability = useAvailability()

  return (
    <section ref={ref} className="sec park" id="garazhi" aria-labelledby="park-h">
      <div className="hinge">
        <h2 className="h2" id="park-h" data-split="">
          Гаражи и&nbsp;<em>паркоместа</em>
        </h2>
        <p className="lead" data-fade="">
          Свободните места в&nbsp;момента, по данни от таблиците на КСМ Строй.
        </p>
        <Seam draw />
      </div>
      <div className="split">
        <Seam draw />
        {PLACES.map((place) => (
          <Half key={place.slot} place={place} availability={availability} />
        ))}
      </div>
    </section>
  )
}
