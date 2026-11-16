import { useId, useMemo, useState } from 'react'
import StatusChip from '../components/ui/StatusChip'
import { statusWord } from '../components/ui/status'
import { formatArea } from '../utils/format'
import { filterUnits, sortUnitsBy } from './filterUnits'

// „По критерии“ (spec §7.8; M3 §6.2 #3; extract §4.26; the concept's
// gr.js:106-183): all of a project's apartments in one table, with its
// filters in a bar above it and the live meta „**N** от 192 · K свободни“ at
// the bar's end, out of the project's total.
// - Filters: Блок, Вид and Статус as pills (aria-pressed), Етаж, Площ and
//   Изложение as selects; each starts at its „all“, but Блок at `block`
//   when given: a block page's list starts on its own block (spec §7.11).
//   Вид offers the project's types, Етаж its floors.
// - The table: Имот, Етаж, Вид, Обща площ, Изложение and Статус; Имот, Етаж
//   and Обща площ sort (aria-sort), a second click turning the order; Етаж
//   and Изложение hide on a phone (explorer.css). Rows are in the tab order,
//   named by their unit first; a click, Enter or Space opens the unit
//   (onUnit, with its label, ruling F10). Sold rows are dimmed.
// - An empty list says so. Where the project has a word on its exposures
//   (Golden Residence's), the footnote explains the sold rows and the
//   exposures; Многофамилна's list has none, its section's lead saying the
//   first (the concept's mnogofamilna.html:105).
// `project` is the explorer's (useExplorer.js), `model` buildModel()'s, or
// null until the data arrives: the meta reads `—` then, never a zero, and the
// table has no rows. The list is a lazy chunk of its own (loadUnitList.js,
// ruling C8.5).

const ALL = null
const BLOCKS = [[ALL, 'Всички'], ['А', 'А'], ['Б', 'Б']]
const STATUSES = [[ALL, 'Всички'], ['available', 'Свободни'], ['reserved', 'Резервирани'], ['sold', 'Продадени'], ['blocked', 'Блокирани']]
// A no-break space keeps each area's number with its „м²“ (spec §3.3). The
// values are AREA_RANGES' keys (filterUnits.js).
const AREAS = [['', 'Всяка'], ['do-70', 'до 70\u00a0м²'], ['70-100', '70–100\u00a0м²'], ['nad-100', 'над 100\u00a0м²']]
const EXPOSURES = [['', 'Всяко'], ['юг', 'юг'], ['изток', 'изток'], ['запад', 'запад'], ['север', 'север']]
const NO_FILTERS = Object.freeze({ block: ALL, floor: ALL, type: ALL, area: ALL, exposure: ALL, status: ALL })

function Pills({ label, options, value, onChange }) {
  const id = useId()
  return (
    <div className="lv__f">
      <span id={id}>{label}</span>
      <div className="pills" role="group" aria-labelledby={id}>
        {options.map(([option, words]) => (
          <button key={option ?? 'all'} type="button" aria-pressed={option === value} onClick={() => onChange(option)}>
            {words}
          </button>
        ))}
      </div>
    </div>
  )
}

function Select({ label, options, value, onChange }) {
  const id = useId()
  return (
    <div className="lv__f">
      <label htmlFor={id}>{label}</label>
      <select className="lv__sel" id={id} value={value ?? ''} onChange={(event) => onChange(event.target.value || ALL)}>
        {options.map(([option, words]) => (
          <option key={option} value={option}>
            {words}
          </option>
        ))}
      </select>
    </div>
  )
}

// A sortable column's head: its button turns the order, and the head says
// how the table is sorted by it.
function SortHead({ by, label, sort, onSort, className }) {
  const on = sort.key === by
  return (
    <th scope="col" className={className} aria-sort={on ? (sort.dir === 'asc' ? 'ascending' : 'descending') : undefined}>
      <button type="button" data-dir={on ? sort.dir : undefined} onClick={() => onSort(by)}>
        {label}
      </button>
    </th>
  )
}

// The project's Вид and Етаж options, each with its „all“ first.
function optionsOf({ types, floors: { min, max } }) {
  return {
    types: [[ALL, 'Всички'], ...types.map((type) => [type, type])],
    floors: [['', 'Всички'], ...Array.from({ length: max - min + 1 }, (_, i) => [String(min + i), `етаж ${min + i}`])],
  }
}

export default function UnitList({ project, model, block = ALL, onUnit }) {
  const { types, floors } = useMemo(() => optionsOf(project), [project])
  const [filters, setFilters] = useState(() => ({ ...NO_FILTERS, block }))
  const [sort, setSort] = useState({ key: 'id', dir: 'asc' })
  const rows = useMemo(() => (model ? sortUnitsBy(filterUnits(model.units, filters), sort) : []), [model, filters, sort])
  const free = model ? rows.filter((unit) => unit.status === 'available').length : null

  const filter = (name) => (value) => setFilters((current) => ({ ...current, [name]: value }))
  const sortBy = (key) => setSort((current) => ({ key, dir: current.key === key && current.dir === 'asc' ? 'desc' : 'asc' }))
  const rowKeys = (unit) => (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    onUnit(unit.label)
  }

  return (
    <div className="lv">
      <div className="lv__bar">
        <Pills label="Блок" options={BLOCKS} value={filters.block} onChange={filter('block')} />
        <Select label="Етаж" options={floors} value={filters.floor} onChange={filter('floor')} />
        <Pills label="Вид" options={types} value={filters.type} onChange={filter('type')} />
        <Select label="Площ" options={AREAS} value={filters.area} onChange={filter('area')} />
        <Select label="Изложение" options={EXPOSURES} value={filters.exposure} onChange={filter('exposure')} />
        <Pills label="Статус" options={STATUSES} value={filters.status} onChange={filter('status')} />
        <p className="lv__meta" aria-live="polite">
          <b>{model ? rows.length : '—'}</b> от {project.total} · {free ?? '—'} {statusWord('available', free)}
        </p>
      </div>
      <div className="lv__table" data-lenis-prevent="">
        <table className="utable">
          <thead>
            <tr>
              <SortHead by="id" label="Имот" sort={sort} onSort={sortBy} />
              <SortHead by="floor" label="Етаж" sort={sort} onSort={sortBy} className="c-floor" />
              <th scope="col">Вид</th>
              <SortHead by="total" label="Обща площ" sort={sort} onSort={sortBy} />
              <th scope="col" className="c-expo">Изложение</th>
              <th scope="col">Статус</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((unit) => (
              <tr
                key={unit.id}
                className={unit.status === 'sold' ? 'row is-sold' : 'row'}
                data-status={unit.status}
                tabIndex={0}
                onClick={() => onUnit(unit.label)}
                onKeyDown={rowKeys(unit)}
              >
                <td className="uid">{unit.label}</td>
                <td className="c-floor">{unit.floor}</td>
                <td>{unit.type}</td>
                <td>{formatArea(unit.totalArea)}</td>
                <td className="c-expo">{unit.exposure || '—'}</td>
                <td className="cst">
                  <StatusChip status={unit.status} text={unit.statusText} />
                </td>
              </tr>
            ))}
            {model && rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="lv__empty">
                  Няма апартаменти с&nbsp;тези условия. Махнете някой филтър.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      {project.exposureNote ? (
        <p className="small lv__note">
          Продадените остават в&nbsp;списъка. {project.exposureNote}
        </p>
      ) : null}
    </div>
  )
}
