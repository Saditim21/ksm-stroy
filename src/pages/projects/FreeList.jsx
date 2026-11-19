import { useRef, useState } from 'react'
import { Link } from 'react-router'
import useReveals from '../../motion/useReveals'
import { formatArea } from '../../utils/format'
import { typeWord } from '../../utils/roomTypes'
import { BANDS, countFree, freeUnits, TYPES } from './freeUnits'

// „Свободни апартаменти“, #svobodni (polish spec §3): the free apartments of
// both buildings, filtered by building, rooms and floor. Each choice is a
// toggle with the count it would show, „—“ while a building it counts has no
// data yet; the list shows ten, then „Покажи още N“; a row is a link to the
// apartment on its building's page: its number, its building, its type, its
// area, its floor and its exposure (two lines on a phone). An empty list
// says what to do. The filter lives with the page, so a building's „Само
// свободните“ above sets it (`filter`, `onFilter`).

const SHOWN = 10
const NAMES = { gr: 'Golden Residence', mn: 'Многофамилна' }
const BUILDING_CHOICES = [{ key: null, label: 'Двете сгради' }, { key: 'gr', label: 'Golden Residence' }, { key: 'mn', label: 'Многофамилна' }]

function Choices({ label, field, choices, buildings, filter, onFilter }) {
  const id = `fl-${field}`
  return (
    <div className="fl__g">
      <p className="fl__k" id={id}>{label}</p>
      <div className="fl__chips" role="group" aria-labelledby={id}>
        {choices.map(({ key, label: text }) => {
          const n = countFree(buildings, filter, field, key)
          return (
            <button key={text} type="button" aria-pressed={filter[field] === key} onClick={() => onFilter({ ...filter, [field]: key })}>
              {text} <b>{n ?? '—'}</b>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function Row({ entry, buildings }) {
  const { unit, label, building } = entry
  const { building: target } = buildings.find((each) => each.building.key === building)
  const type = typeWord(unit.type, 1) || '—'
  const area = unit.totalArea != null ? formatArea(unit.totalArea) : '—'
  const exposure = unit.exposure || '—'
  return (
    <Link className="fl__row" to={target.unitHref(label)} prefetch="intent">
      <span className="fl__id">{label}</span>
      <span className="fl__b">{NAMES[building]}</span>
      <span className="fl__c">{type}</span>
      <span className="fl__c fl__n">{area}</span>
      <span className="fl__c">етаж&nbsp;{unit.floor}</span>
      <span className="fl__c">{exposure}</span>
      <span className="fl__meta">
        {[type, area, `етаж\u00a0${unit.floor}`, unit.exposure].filter(Boolean).join(', ')}
      </span>
      <span className="fl__go" aria-hidden="true">
        Вижте
        <svg className="arr" viewBox="0 0 18 10" width="18" height="10" focusable="false">
          <path d="M0 5h16M12 1l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      </span>
    </Link>
  )
}

export default function FreeList({ buildings, filter, onFilter }) {
  const ref = useRef(null)
  useReveals(ref)
  const [all, setAll] = useState(false)
  const ready = buildings.every(({ model }) => model)
  const counted = buildings.map(({ building, model }) => ({ key: building.key, project: building.project, model }))
  const list = ready ? freeUnits(counted, filter) : []
  const total = countFree(counted, {}, 'building', null)
  const shown = all ? list : list.slice(0, SHOWN)
  const change = (next) => {
    setAll(false)
    onFilter(next)
  }

  return (
    <section ref={ref} className="fl" id="svobodni" aria-labelledby="fl-h">
      <div className="fl__head">
        <h2 className="h2" id="fl-h" data-split="">
          Свободни <em>апартаменти</em>
        </h2>
        <p className="fl__sum" aria-live="polite">
          {ready ? (
            <>
              <b>{list.length}</b> от {total} свободни в&nbsp;двете сгради
            </>
          ) : (
            'Зареждаме свободните апартаменти…'
          )}
        </p>
      </div>
      <div className="fl__filters">
        <Choices label="Сграда" field="building" choices={BUILDING_CHOICES} buildings={counted} filter={filter} onFilter={change} />
        <Choices label="Стаи" field="type" choices={TYPES} buildings={counted} filter={filter} onFilter={change} />
        <Choices label="Етаж" field="band" choices={BANDS} buildings={counted} filter={filter} onFilter={change} />
      </div>
      <div className="fl__list">
        {!ready ? null : list.length === 0 ? (
          <p className="fl__empty">Няма свободни апартаменти с&nbsp;тези условия. Махнете едно от тях или ни попитайте за следващите&nbsp;етапи.</p>
        ) : (
          <div className="fl__rows">
            {shown.map((entry) => (
              <Row key={`${entry.building}-${entry.label}`} entry={entry} buildings={buildings} />
            ))}
          </div>
        )}
        {ready && list.length > shown.length ? (
          <div className="fl__more">
            <button type="button" className="btn" onClick={() => setAll(true)}>
              Покажи още {list.length - shown.length}
            </button>
          </div>
        ) : null}
      </div>
    </section>
  )
}
