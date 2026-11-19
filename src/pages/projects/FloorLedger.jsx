import { useId, useRef, useState } from 'react'
import { Link } from 'react-router'
import Seam from '../../components/ui/Seam'
import { statusLook } from '../../components/ui/status'
import { PROJECT_BLOCKS } from '../../config/blocks'
import { floorKey } from '../../explorer/model'
import useReveals from '../../motion/useReveals'
import { formatArea, plural } from '../../utils/format'
import { typeWord } from '../../utils/roomTypes'

// „Етаж по етаж“, #etazhi (polish spec §3): one building at a time (two
// toggles, Golden Residence first), its blocks either side of the seam, a row
// a floor from the top floor down, numbered as its building's page numbers
// it (Многофамилна's 10 → 2). A row is a button: its number, its apartments
// as squares in their statuses' patterns (neutral until the data is in, as
// the explorer's grids are), and „6 свободни“ or „няма свободни“; it opens to
// the floor's free apartments, each a link to it on its building's page
// (unitHref), or, before the numbers are in, says they are on their way. Its
// accessible name says it all: „Блок А, етаж 8: 12 свободни от 12“. Opening
// another building closes every row.

function FloorRow({ building, project, model, block, floor, open, onToggle, panelId }) {
  const stats = model?.floors.get(floorKey(block, floor)) ?? null
  const units = stats?.units ?? []
  const all = stats ? units.length : project.perFloor
  const free = stats ? stats.counts.available : null
  const words = free == null ? '—' : free === 0 ? 'няма свободни' : `${free} ${plural(free, 'свободен', 'свободни')}`
  const cells = stats ? units.map((unit) => statusLook(unit.status)) : Array.from({ length: project.perFloor }, () => 'none')
  const freeUnits = units.filter((unit) => unit.status === 'available')

  return (
    <>
      <button
        type="button"
        className="fr"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-label={`Блок ${block}, етаж ${floor}: ${words} от ${all}`}
        data-free={free ?? undefined}
        onClick={onToggle}
      >
        <span className="fr__n" aria-hidden="true">{floor}</span>
        <span className="fr__c" aria-hidden="true" style={{ '--n': cells.length }}>
          {cells.map((look, i) => (
            // A floor's squares in its numbers' order: a list that never reorders.
            <i key={i} className={`s-${look}`} />
          ))}
        </span>
        <span className="fr__w" aria-hidden="true">
          {free ? <b>{free}</b> : null}
          {free ? ` ${plural(free, 'свободен', 'свободни')}` : words}
        </span>
      </button>
      {open ? (
        <div className="fr__open" id={panelId}>
          {/* Before the numbers are in (a cold API holds them up to 10 s), the
              floor is not sold out: its apartments are on their way. */}
          {!stats ? (
            <p>Зареждаме апартаментите на етажа…</p>
          ) : freeUnits.length ? (
            <ul>
              {freeUnits.map((unit) => {
                const label = project.unitLabel(unit)
                const about = [typeWord(unit.type, 1), unit.totalArea != null ? formatArea(unit.totalArea) : null, unit.exposure?.toLowerCase()].filter(Boolean).join(', ')
                return (
                  <li key={label}>
                    <Link to={building.unitHref(label)} prefetch="intent">
                      <b>{label}</b>
                      <span>{about}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          ) : (
            <p>На този етаж няма свободни апартаменти.</p>
          )}
        </div>
      ) : null}
    </>
  )
}

export default function FloorLedger({ buildings }) {
  const ref = useRef(null)
  useReveals(ref)
  const id = useId()
  const [shown, setShown] = useState(buildings[0].building.key)
  const [open, setOpen] = useState(() => new Set())
  const current = buildings.find((each) => each.building.key === shown)
  const { building, model } = current
  const { project } = building
  const floors = Array.from({ length: project.floors.max - project.floors.min + 1 }, (_, i) => project.floors.max - i)

  const toggle = (key) => setOpen((was) => {
    const next = new Set(was)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    return next
  })

  return (
    <section ref={ref} className="ff" id="etazhi" aria-labelledby="ff-h">
      <div className="ff__head hinge">
        <h2 className="h2" id="ff-h" data-split="">
          Етаж по <em>етаж</em>
        </h2>
        <div>
          <p className="lead" data-fade="">
            Всеки ред е&nbsp;един етаж, всяко квадратче – един апартамент. Вдясно пише колко са свободни. Отворете етаж, за да видите кои&nbsp;са.
          </p>
          <div className="ff__tabs" role="group" aria-label="Сграда">
            {buildings.map(({ building: each }) => (
              <button
                key={each.key}
                type="button"
                aria-pressed={each.key === shown}
                onClick={() => {
                  setShown(each.key)
                  setOpen(new Set())
                }}
              >
                {each.name}
              </button>
            ))}
          </div>
        </div>
        <Seam draw />
      </div>
      <div className="ff__stage" data-building={shown}>
        <Seam className="ff__seam" />
        {PROJECT_BLOCKS[project.id].map(({ letter }) => (
          <div key={letter} className="ff__blk" data-blk={letter}>
            <h3 className="ff__bt">Блок {letter}</h3>
            {floors.map((floor) => {
              const key = `${shown}-${floorKey(letter, floor)}`
              return (
                <FloorRow
                  key={key}
                  building={building}
                  project={project}
                  model={model}
                  block={letter}
                  floor={floor}
                  open={open.has(key)}
                  onToggle={() => toggle(key)}
                  panelId={`${id}-${key}`}
                />
              )
            })}
          </div>
        ))}
      </div>
    </section>
  )
}
