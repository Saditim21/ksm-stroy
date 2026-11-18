import { useEffect, useRef, useState } from 'react'
import Button from '../../components/ui/Button'
import ResponsivePicture from '../../components/ui/ResponsivePicture'
import RollingNumber from '../../components/ui/RollingNumber'
import Seam from '../../components/ui/Seam'
import { GR_FACTS } from '../../config/facts'
import { spotUnits } from '../../data/availability/select'
import grImages from '../../data/images/golden-residence.json'
import mnNight from '../../data/images/mn-night.json'
import { MN_FACTS } from '../../data/mnogofamilna/facts'
import { GR_PROJECT } from '../../explorer/projects/gr'
import useReveals from '../../motion/useReveals'
import useWipes from '../../motion/useWipes'
import { inquiryHref } from '../../shell/handle'
import { formatDecimal, plural } from '../../utils/format'
import { typeWord } from '../../utils/roomTypes'
import { BUILDINGS, useBuildings } from './buildings'

// The two buildings row by row, #sgradite (spec M3/M4 §7.1; the concept's
// prodazhbi.html:107-179 and its comparable pair): Golden Residence on the
// left, Многофамилна on the right, as on the board. The renders open from
// the seam (useWipes), under them the names and the type and year
// (properties.js's), then a row for each fact, its name on the seam where
// the two answers meet: the address, the blocks and floors (Многофамилна's
// by the data, 2 blocks of 9 residential floors, never production's „10
// етажа“, spec §2), the apartments, their types (Golden Residence's from the
// sheets, `—` until the store has them; Многофамилна's from the snapshot),
// the areas, the free apartments (live by block, or dated), the garages and
// parking places, production's description (Golden Residence's without its
// stale last sentence, Многофамилна's without its floors, spec §2) and its
// features. Last, each building's actions: its apartments (solid) and its
// inquiry, the contact page's form with the building chosen.
//
// A table to assistive technology, row by row. On a desktop the two names
// stay pinned under the header while the rows scroll (the bar, a picture of
// the head, shown between the head leaving and the actions arriving); on a
// phone the rows stack into two spec sheets, each answer under its row's
// name (projects.css). The headings and the copy reveal as everywhere
// (useReveals); the markup is the final state.

// The picture's width: half the page on a desktop, the page on a phone.
const SIZES = '(max-width: 900px) 100vw, 42vw'

// A figure set in the serif, then what it counts: „112 двустайни“.
const Figure = ({ children }) => <b className="n">{children}</b>

// The room types, in the project's order: „112 двустайни, 64 тристайни, 16
// ателиета“, `—` for each until the counts are known.
function Types({ types, counts }) {
  return types.map((type, i) => {
    const count = counts ? counts[type] ?? 0 : null
    return (
      <span key={type}>
        {i > 0 ? ', ' : null}
        <Figure>{count ?? '—'}</Figure> {typeWord(type, count)}
      </span>
    )
  })
}

// How many apartments of each type a model holds, or null without one.
function typesIn(model) {
  if (!model) return null
  const counts = {}
  for (const unit of model.units) counts[unit.type] = (counts[unit.type] ?? 0) + 1
  return counts
}

// The free apartments of a building: the figure, which rolls in when it
// changes, then by block, „в момента: 42 в блок А и 27 в блок Б“, or with the
// date of numbers that are not live.
function Free({ model, dated }) {
  const block = (letter) => (model ? model.blocks[letter].counts.available : '—')
  return (
    <p>
      <span className="fig">
        <RollingNumber value={model ? model.totals.available : null} />
      </span>{' '}
      {dated ? `по данни към ${dated}` : 'в момента'}: {block('А')} в&nbsp;блок&nbsp;А и&nbsp;{block('Б')} в&nbsp;блок&nbsp;Б
    </p>
  )
}

// Golden Residence's garages and parking places, then how many are free now:
// `—` until the store has the slot's rows.
function Parking({ data }) {
  const free = (slot) => (data?.['golden-residence']?.[slot]
    ? spotUnits(data, slot).filter((spot) => spot.status === 'available').length
    : null)
  const [garages, parking] = [free('garages'), free('parking')]
  return (
    <>
      <p>
        <Figure>{GR_FACTS.garages}</Figure> гаража и&nbsp;<Figure>{GR_FACTS.parking}</Figure> паркоместа
      </p>
      <p className="led__sub">
        свободни в&nbsp;момента: {garages ?? '—'} {plural(garages, 'гараж', 'гаража')} и&nbsp;{parking ?? '—'}{' '}
        {plural(parking, 'паркомясто', 'паркоместа')}
      </p>
    </>
  )
}

// A building's features, one a line.
const Features = ({ items }) => (
  <ul className="led__list">
    {items.map((item) => (
      <li key={item}>{item}</li>
    ))}
  </ul>
)

// Each row: its name, then Golden Residence's answer and Многофамилна's.
// A no-break space after each one-letter word and in „блок А“ (spec §4.5).
function rowsOf({ gr, mn, data }) {
  return [
    ['Адрес', <p>{BUILDINGS[0].address}</p>, <p>{BUILDINGS[1].address}</p>],
    [
      'Блокове и етажи',
      <p>Блок&nbsp;А и&nbsp;блок&nbsp;Б, по {GR_FACTS.floors} етажа</p>,
      <p>
        {MN_FACTS.blocks} блока, {MN_FACTS.residentialFloors} жилищни етажа ({MN_FACTS.floors.min}–{MN_FACTS.floors.max})
      </p>,
    ],
    [
      'Апартаменти',
      <p>
        <span className="fig">{GR_FACTS.apartments}</span> по {GR_FACTS.apartments / GR_FACTS.blocks} в&nbsp;блок, {GR_FACTS.perFloor} на етаж
      </p>,
      <p>
        <span className="fig">{MN_FACTS.apartments}</span> по {MN_FACTS.perBlock} в&nbsp;блок, {MN_FACTS.perFloor} на етаж
      </p>,
    ],
    [
      'Видове',
      <p><Types types={GR_PROJECT.types} counts={typesIn(gr.model)} /></p>,
      <p><Types types={Object.keys(MN_FACTS.types).sort()} counts={MN_FACTS.types} /></p>,
    ],
    [
      'Обща площ',
      <p>
        от <Figure>{formatDecimal(GR_FACTS.minArea)}</Figure> до <Figure>{formatDecimal(GR_FACTS.maxArea)}</Figure>&nbsp;м²
      </p>,
      <p>
        от <Figure>{formatDecimal(MN_FACTS.minArea)}</Figure> до <Figure>{formatDecimal(MN_FACTS.maxArea)}</Figure>&nbsp;м²
      </p>,
    ],
    ['Свободни', <Free {...gr} />, <Free {...mn} />],
    ['Гаражи и паркоместа', <Parking data={data} />, <p>Подземни гаражи</p>],
    [
      'За проекта',
      <p>Модерна жилищна сграда с&nbsp;луксозни апартаменти в&nbsp;сърцето на София.</p>,
      <p>
        Модерна многофамилна жилищна сграда с&nbsp;два блока (А&nbsp;и&nbsp;Б), гаражи и&nbsp;луксозни апартаменти в&nbsp;ж.к.&nbsp;Връбница-1.
        Част от апартаментите вече са продадени.
      </p>,
    ],
    [
      'Особености',
      <Features items={['Луксозни апартаменти', 'Централна локация', 'Модерна архитектура']} />,
      <Features items={['Подземни гаражи', 'Престижен район']} />,
    ],
  ]
}

// Each building's render, name, and type and year (properties.js's).
const HEADS = [
  { image: grImages['gr-corner'], alt: 'Golden Residence, визуализация', wipe: 'l', name: 'Golden Residence', type: 'Жилищна сграда, 2025' },
  { image: mnNight['mn-dusk'], alt: 'Многофамилна жилищна сграда по здрач, визуализация', wipe: 'r', name: 'Многофамилна жилищна сграда', type: 'Жилищна сграда, 2024' },
]

// Whether the names are to stay in view: once the head's foot has gone 40 px
// under the header, until the actions come within 120 px of it.
function useKeptNames(head, actions) {
  const [kept, setKept] = useState(false)
  useEffect(() => {
    let frame = 0
    const check = () => {
      frame = 0
      const top = document.querySelector('.hdr')?.getBoundingClientRect().bottom ?? 0
      setKept(head.current.getBoundingClientRect().bottom < top + 40 && actions.current.getBoundingClientRect().top > top + 120)
    }
    const soon = () => {
      frame ||= requestAnimationFrame(check)
    }
    addEventListener('scroll', soon, { passive: true })
    addEventListener('resize', soon)
    soon()
    return () => {
      cancelAnimationFrame(frame)
      removeEventListener('scroll', soon)
      removeEventListener('resize', soon)
    }
  }, [head, actions])
  return kept
}

export default function BuildingRows() {
  const ref = useRef(null)
  const head = useRef(null)
  const actions = useRef(null)
  useReveals(ref)
  useWipes(ref)
  const now = useBuildings()
  const kept = useKeptNames(head, actions)
  const sides = ['gr', 'mn']

  return (
    <section ref={ref} className="pz-led" id="sgradite" aria-label="Golden Residence и Многофамилна жилищна сграда">
      <Seam draw />
      <div className={kept ? 'led__bar is-on' : 'led__bar'} aria-hidden="true">
        {BUILDINGS.map(({ key, name }) => (
          <span key={key}>{name}</span>
        ))}
      </div>
      <div className="led" role="table" aria-label="Golden Residence и Многофамилна жилищна сграда, ред по ред">
        <div ref={head} className="led__row led__row--head" role="row">
          <span className="led__k" role="cell" />
          {HEADS.map(({ image, alt, wipe, name, type }, i) => (
            <div key={name} className={`led__v led__v--${sides[i]}`} role="columnheader">
              <figure className="led__ph" data-wipe={wipe}>
                <ResponsivePicture image={image} alt={alt} sizes={SIZES} />
              </figure>
              <h3 className="led__name">{name}</h3>
              <p className="led__type">{type}</p>
            </div>
          ))}
        </div>
        {rowsOf(now).map(([label, ...answers]) => (
          <div key={label} className="led__row" role="row">
            <span className="led__k" role="rowheader">
              {label}
            </span>
            {answers.map((answer, i) => (
              <div key={sides[i]} className={`led__v led__v--${sides[i]}${label === 'За проекта' ? ' led__v--text' : ''}`} role="cell" data-k={label}>
                {answer}
              </div>
            ))}
          </div>
        ))}
        <div ref={actions} className="led__row led__row--act" role="row">
          <span className="led__k" role="cell" />
          {BUILDINGS.map(({ key, project, page, explorer }) => (
            <div key={key} className={`led__v led__v--${key}`} role="cell">
              <div className="led__act">
                <Button to={`${page}${explorer}`} variant="solid" arrow prefetch="intent">
                  Разгледайте апартаментите
                </Button>
                <Button to={inquiryHref(project.id)}>Запитване</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
