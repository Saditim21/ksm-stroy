import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import Button from '../../components/ui/Button'
import RollingNumber from '../../components/ui/RollingNumber'
import Seam from '../../components/ui/Seam'
import StatusChip from '../../components/ui/StatusChip'
import StatusCount from '../../components/ui/StatusCount'
import { STATUS_ORDER } from '../../components/ui/status'
import { PROJECT_BLOCKS } from '../../config/blocks'
import BlockGrid from '../../explorer/BlockGrid'
import { findUnit, floorKey } from '../../explorer/model'
import StaleNotice from '../../explorer/StaleNotice'
import { formatArea, plural } from '../../utils/format'
import { BUILDINGS, useBuildings } from './buildings'

// Продажби's opening, #top, the sales board and the page's one moment (spec
// M3/M4 §7.1; the concept's prodazhbi.html:80-105 and js/prodazhbi.js): the
// H1 „Продажби“ in a mask authored by hand, production's lead and the board's
// hint, in a desktop's words and a phone's (projects.css shows one). Then
// every apartment of both buildings as a square in its status's colour,
// Golden Residence left of the seam and Многофамилна right, each block a
// BlockGrid of its building's project (buildings.js), standing on one ground
// line, the floor numbers on each building's outer side. Under each: its
// name and address, its free count (Golden Residence's live, `—` until the
// store has its rows; Многофамилна's from the dated snapshot, in the HTML),
// „Разгледайте апартаментите“ and its caption (projects.css draws the
// caption under the link; the markup keeps the concept's order), then the
// stale-data notice when Golden Residence's rows are not live: last, where
// a desktop shows it, so the keyboard reaches the link first.
//
// - Hover or focus on a square lights its floor and dims the rest
//   (projects.css, from the plot's data-hot and data-row and the hot
//   block's --hot); the caption, idle the building's legend with its counts,
//   names the floor with its counts, and the apartment with its type, area,
//   exposure and status. It goes back to the legend as the mouse leaves
//   (260 ms; to the keyboard's square where the focus still is), the focus
//   leaves (120 ms), or on Escape.
// - A click, Enter or Space opens that apartment on its building's page
//   (buildings.js, unitHref). A finger's first tap only previews it, the
//   tapped square taking the focus; a second tap on it opens it, and a tap
//   anywhere off the board lets it go.
// - The keyboard: one tab stop a block (ruling T8a, BlockGrid's own).
// The entrance is projects.css's, all CSS from the first paint (ruling
// M4-PF13: BlockGrid's own reveal, for a block coming up from below,
// returns for a block on screen).

// How long the caption holds after the mouse, or the focus, has left.
const MOUSE_LEFT_MS = 260
const FOCUS_LEFT_MS = 120

// The free count of a building: its number, which rolls in when it changes
// (Diptych §5.7), and its words: „69 свободни от 192 в момента“, or with the
// date of numbers that are not live.
function Count({ id, free, total, dated }) {
  return (
    <p className="bd__count" id={id}>
      <RollingNumber value={free} className="num" />{' '}
      <span className="bd__of">
        {plural(free, 'свободен', 'свободни')} от {total}
        {dated ? `, по данни към ${dated}` : ' в момента'}
      </span>
    </p>
  )
}

// What the caption says: the building's legend with its counts, or the hot
// floor with its counts (the free always, the rest where there are some) and
// the hot apartment, once the store has its rows.
function Caption({ model, hot }) {
  if (!hot) {
    return (
      <ul className="legend">
        {STATUS_ORDER.map((status) => (
          <li key={status}>
            <StatusCount status={status} count={model ? model.totals[status] : null} />
          </li>
        ))}
      </ul>
    )
  }
  const counts = model?.floors.get(floorKey(hot.block, hot.floor))?.counts ?? null
  const unit = findUnit(model, hot.label)
  const about = unit && [unit.type, unit.totalArea != null ? formatArea(unit.totalArea) : null, unit.exposure.toLowerCase()].filter(Boolean).join(', ')
  return (
    <>
      <p className="cap__fl">
        <span className="serif">
          Блок&nbsp;{hot.block}, етаж&nbsp;{hot.floor}
        </span>{' '}
        {STATUS_ORDER.filter((status) => status === 'available' || counts?.[status]).map((status) => (
          <StatusCount key={status} status={status} count={counts ? counts[status] : null} />
        ))}
      </p>
      <p className="cap__u">
        <b>{hot.label}</b>
        {unit ? (
          <>
            {' '}
            <span>{about}</span> <StatusChip status={unit.status} text={unit.statusText} />
          </>
        ) : null}
      </p>
    </>
  )
}

// A building of the board: its blocks' squares, its counts and its caption.
function Building({ building, model, dated }) {
  const { key, project, name, address, page, explorer, unitHref, warm } = building
  const navigate = useNavigate()
  const plot = useRef(null)
  const [hot, setHot] = useState(null)
  // How the square a click lands on was reached, for the click to tell a
  // finger's tap, which previews it first, from a mouse, a key or anything
  // else (a screen reader's), which open it at once; the square a first tap
  // previewed; the caption's pending return to the legend.
  const via = useRef(null)
  const armed = useRef(null)
  const leaving = useRef(0)

  // The square an event came from, as { block, floor, row, label }: its
  // place in its block's grid gives its floor (rows from the top) and its
  // number on it.
  const hotOf = useCallback((target) => {
    const square = target?.closest?.('.blk__grid > button')
    if (!square) return null
    const index = [...square.parentElement.children].indexOf(square)
    const row = Math.floor(index / project.perFloor)
    const floor = project.floors.max - row
    const block = square.closest('[data-block]').dataset.block
    const suffix = String((index % project.perFloor) + 1).padStart(2, '0')
    return { block, floor, row, label: project.unitLabel({ block, floor, suffix }) }
  }, [project])

  const show = useCallback((next) => {
    clearTimeout(leaving.current)
    if (next) setHot((current) => (current?.label === next.label ? current : next))
  }, [])
  const idle = useCallback(() => {
    clearTimeout(leaving.current)
    armed.current = null
    setHot(null)
  }, [])
  const idleIn = (ms) => {
    clearTimeout(leaving.current)
    leaving.current = setTimeout(idle, ms)
  }
  useEffect(() => () => clearTimeout(leaving.current), [])

  // A tap anywhere off the board lets a previewed square go.
  useEffect(() => {
    const away = (event) => {
      if (armed.current && !plot.current?.contains(event.target)) idle()
    }
    document.addEventListener('pointerdown', away)
    return () => document.removeEventListener('pointerdown', away)
  }, [idle])

  const onUnit = useCallback((label, square) => {
    const tapped = via.current === 'touch'
    via.current = null
    if (tapped && armed.current !== label) {
      armed.current = label
      show(hotOf(square))
      square.focus({ preventScroll: true })
      return
    }
    warm().catch(() => {})
    navigate(unitHref(label))
  }, [hotOf, navigate, show, unitHref, warm])

  // The squares render with the data, never with the caption: a hot floor
  // changes only the plot's attributes and the caption.
  const grids = useMemo(() => PROJECT_BLOCKS[project.id].map(({ letter }) => ({
    letter,
    grid: <BlockGrid model={model} block={letter} onUnit={onUnit} project={project} />,
  })), [model, onUnit, project])

  const nameId = `bd-${key}-h`
  const countId = `bd-${key}-count`
  return (
    <div className={`bd bd--${key}`}>
      <h2 className="bd__name" id={nameId}>
        <Link to={page} prefetch="intent">
          {name}
        </Link>
      </h2>
      <p className="bd__addr">{address}</p>
      <div
        ref={plot}
        className="bd__plot"
        role="group"
        aria-labelledby={nameId}
        aria-describedby={`pz-hint ${countId}`}
        data-hot={hot ? '' : undefined}
        data-row={hot?.row}
        onPointerDown={(event) => {
          via.current = event.pointerType
        }}
        onKeyDown={(event) => {
          via.current = 'key'
          if (event.key === 'Escape') idle()
        }}
        onPointerOver={(event) => {
          if (event.pointerType === 'mouse') show(hotOf(event.target))
        }}
        onPointerLeave={(event) => {
          if (event.pointerType !== 'mouse') return
          // The keyboard's square, where the focus still is, else the legend.
          if (plot.current.contains(document.activeElement)) show(hotOf(document.activeElement))
          else idleIn(MOUSE_LEFT_MS)
        }}
        onFocus={(event) => show(hotOf(event.target))}
        onBlur={(event) => {
          if (!plot.current.contains(event.relatedTarget)) idleIn(FOCUS_LEFT_MS)
        }}
      >
        <div className="bd__blocks">
          {grids.map(({ letter, grid }) => (
            <div key={letter} className="bd__blk" data-block={letter} style={hot?.block === letter ? { '--hot': hot.row } : undefined}>
              {grid}
              <p className="bd__bl" aria-hidden="true">
                блок&nbsp;{letter}
              </p>
            </div>
          ))}
        </div>
      </div>
      <Count id={countId} free={model ? model.totals.available : null} total={project.total} dated={dated} />
      <div className="bd__cap" aria-live="polite">
        <Caption model={model} hot={hot} />
      </div>
      <Button to={`${page}${explorer}`} variant="link" arrow className="bd__go" prefetch="intent">
        Разгледайте апартаментите
      </Button>
      <StaleNotice project={project} className="bd__notice" />
    </div>
  )
}

export default function SalesBoard() {
  const now = useBuildings()

  return (
    <section className="pz-open" id="top" aria-labelledby="pz-h">
      <div className="pz-head">
        <h1 className="pz-h1" id="pz-h">
          <span className="line-mask">
            <span className="split-line">Продажби</span>
          </span>
        </h1>
        <p className="lead pz-lead">
          Открийте нашите атрактивни обекти за продажба – модерни апартаменти и&nbsp;жилищни сгради в&nbsp;престижни райони
          на София.
        </p>
        <p className="pz-hint" id="pz-hint">
          Всеки квадрат е&nbsp;апартамент, етажите отгоре надолу.{' '}
          <span className="pz-hint__fine">Посочете квадрат, за да видите етажа му, и&nbsp;кликнете, за да отворите апартамента.</span>
          <span className="pz-hint__touch">
            Докоснете квадрат, за да видите етажа му, и&nbsp;го докоснете отново, за да отворите апартамента.
          </span>
        </p>
      </div>
      <div className="pz-board">
        <Seam />
        {BUILDINGS.map((building) => (
          <Building key={building.key} building={building} {...now[building.key]} />
        ))}
      </div>
    </section>
  )
}
