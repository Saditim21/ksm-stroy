import StatusCount from '../components/ui/StatusCount'
import { STATUS_ORDER } from '../components/ui/status'
import { formatArea, formatDecimal, plural } from '../utils/format'
import { rangeLine } from './surfaceModel'

// What a floor's surfaces say of it (spec §7.3, §7.6; M3 §6.5): its counts,
// the range of its free areas and its meta line, as the edge panel
// (FloorPanel.jsx), the sheet (FloorSheet.jsx), the plan stage
// (PlanStage.jsx) and a block page's rows (FloorRows.jsx) show them. A module
// of their own, apart from the edge panel and its motion, and apart from the
// project's plans' loading (plans.js), so a block page, which prerenders a row
// of each floor, carries these alone in its first-load JS, with the mini
// plans' renderer, in a chunk it shares with the surfaces' (surfaces.js).

/** The floor's four counts, `—` until the data arrives. */
export function FloorCounts({ counts, className }) {
  return (
    <div className={className}>
      {STATUS_ORDER.map((status) => (
        <StatusCount key={status} status={status} count={counts ? counts[status] : null} />
      ))}
    </div>
  )
}

/** The range line (spec §7.3), nothing until the data arrives. */
export function FloorRange({ floor, className }) {
  const line = floor.counts ? rangeLine(floor) : null
  if (!line) return null
  let words
  if (line.kind === 'range') {
    words = <>свободни от <b>{formatDecimal(line.min)}</b> до <b>{formatArea(line.max)}</b></>
  } else if (line.kind === 'single') {
    words = <>{line.one ? 'свободен' : 'свободни'}: <b>{formatArea(line.area)}</b></>
  } else if (line.kind === 'reserved') {
    words = 'Няма свободни, има резервирани.'
  } else {
    words = <span className="fxp__soldout">Разпродаден етаж</span>
  }
  return <p className={className}>{words}</p>
}

/** The floor's meta line: its apartments, „12 апартамента“, after the
 * project's word on the floor where it has one (`plan`, its block's plan:
 * its floorMeta, plans.js: „кота +3,06“ where the drawings give Golden
 * Residence's level, spec §9, only А1; „тавански етаж“ on Многофамилна's top
 * floor, M3 §2).
 * With `free`, the plan stage's, its free apartments after it („· 4
 * свободни“, `—` until the data arrives), and with `dated`, the date of
 * numbers that are not live („· по данни към 01.12.2025“, M3 §6.4). */
export function FloorMeta({ project, plan, floor, free = false, dated = null, className }) {
  const count = floor.units.length || project.perFloor
  const parts = [`${count} ${plural(count, 'апартамент', 'апартамента')}`]
  const word = plan?.floorMeta(floor)
  if (word) parts.unshift(word)
  if (free) {
    const n = floor.counts ? floor.counts.available : null
    parts.push(`${n ?? '—'} ${plural(n, 'свободен', 'свободни')}`)
  }
  if (dated) parts.push(`по данни към ${dated}`)
  return <p className={className}>{parts.join(' · ')}</p>
}
