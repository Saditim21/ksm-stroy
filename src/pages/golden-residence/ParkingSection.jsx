import { useRef } from 'react'
import { presetInquiry } from '../../components/inquiry/inquiryStore'
import Button from '../../components/ui/Button'
import { cellTitle, statusText } from '../../components/ui/cellTitle'
import RollingNumber from '../../components/ui/RollingNumber'
import Seam from '../../components/ui/Seam'
import StatusCount from '../../components/ui/StatusCount'
import { STATUS_ORDER, statusLook } from '../../components/ui/status'
import { GR_FACTS } from '../../config/facts'
import { spotUnits } from '../../data/availability/select'
import { useAvailability } from '../../data/availability/useAvailability'
import useReveals from '../../motion/useReveals'
import { formatArea, plural } from '../../utils/format'
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
// The legend is the site's status counts (StatusCount, spec §7.9): the
// swatch with its pattern and glyph, the count and the word (ruling C6.1).

const PLACES = [
  { slot: 'garages', id: 'park-g', side: 'a', name: 'Гаражи', total: GR_FACTS.garages, list: 'Свободните гаражи', action: 'Запитване за гараж' },
  { slot: 'parking', id: 'park-p', side: 'b', name: 'Паркоместа', total: GR_FACTS.parking, list: 'Свободните паркоместа', action: 'Запитване за паркомясто' },
]

// What a cell says to a pointer: „Г-001 · 34,01 м² · Продаден“, as the block
// grids' squares say theirs (cellTitle.js).
const titleOf = (unit) => cellTitle(unit.label, unit.totalArea == null ? null : formatArea(unit.totalArea), statusText(unit))

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
  const shownInLegend = STATUS_ORDER.filter((status) => status === 'available' || status === 'sold' || counts?.[status] > 0)

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
        {shownInLegend.map((status) => (
          <li key={status}>
            <StatusCount status={status} count={counts ? counts[status] : null} />
          </li>
        ))}
      </ul>
      <div className="park__cells" aria-hidden="true">
        {units
          ? units.map((unit, i) => <i key={i} className={`s-${statusLook(unit.status)}`} title={titleOf(unit)} />)
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
          Свободните места в&nbsp;момента, по данни от таблиците на КСМ&nbsp;Строй.
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
