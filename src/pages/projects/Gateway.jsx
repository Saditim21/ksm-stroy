import Button from '../../components/ui/Button'
import ResponsivePicture from '../../components/ui/ResponsivePicture'
import RollingNumber from '../../components/ui/RollingNumber'
import Seam from '../../components/ui/Seam'
import { STATUS_ORDER, statusWord } from '../../components/ui/status'
import grImages from '../../data/images/golden-residence.json'
import mnNight from '../../data/images/mn-night.json'
import { formatDecimal } from '../../utils/format'
import { typeWord } from '../../utils/roomTypes'

// Продажби's opening, #top, the page's one moment (polish spec §3): the two
// buildings at dusk side by side on the seam (one under the other on a
// phone), the H1 „Продажби“ over the seam. Each half, on its photograph and
// so dark in both themes (.dark): its place, its name, its free apartments of
// all (Golden Residence's live, „—“ until the store has its rows;
// Многофамилна's from the dated snapshot), a bar of its statuses and the rest
// in words, its free apartments by type, the range of their areas, its page
// and its free apartments alone (`onOnly`, the list below filtered to it).
// Every line is there from the first paint, „—“ or empty, so nothing moves
// when the data comes. The entrance is projects.css's, CSS from the first
// paint; a mouse on a half widens it (projects.css).

const LOOK = {
  gr: {
    image: grImages['gr-dusk'],
    alt: 'Golden Residence по здрач, визуализация',
    place: 'жк\u00a0Левски\u00a0Г, София',
    types: ['Ателие', '2-стаен', '3-стаен'],
  },
  mn: {
    image: mnNight['mn-dusk'],
    alt: 'Многофамилна сграда по здрач, визуализация',
    place: 'ж.к.\u00a0Връбница-1, София',
    types: ['2-стаен', '3-стаен'],
  },
}
const SIZES = '(max-width: 900px) 100vw, 62vw'

function Arrow() {
  return (
    <svg className="arr" viewBox="0 0 18 10" width="18" height="10" aria-hidden="true" focusable="false">
      <path d="M0 5h16M12 1l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  )
}

/** A building's statuses as segments of one bar, each its share; nothing
 * until the counts are known. */
export function StatusBar({ counts }) {
  if (!counts) return <div className="sbar" aria-hidden="true" />
  const shown = STATUS_ORDER.filter((status) => counts[status])
  const label = shown.map((status) => `${counts[status]} ${statusWord(status, counts[status])}`).join(', ')
  return (
    <div className="sbar" role="img" aria-label={label}>
      {shown.map((status) => (
        <i key={status} className={`sbar__${status}`} style={{ flexGrow: counts[status] }} />
      ))}
    </div>
  )
}

function Half({ building, model, dated, total, onOnly }) {
  const { key, name, page, explorer } = building
  const look = LOOK[key]
  const counts = model?.totals ?? null
  const free = counts ? counts.available : null
  const freeUnits = model ? model.units.filter((unit) => unit.status === 'available') : null
  const areas = freeUnits?.map((unit) => unit.totalArea).filter((area) => area != null) ?? []
  const rest = counts ? ['reserved', 'sold', 'blocked'].filter((s) => counts[s]).map((s) => `${counts[s]} ${statusWord(s, counts[s])}`).join(', ') : ''

  return (
    <article className={`gw__half gw__half--${key} dark`} aria-labelledby={`gw-${key}`}>
      <ResponsivePicture image={look.image} alt={look.alt} sizes={SIZES} priority={key === 'gr'} eager={key !== 'gr'} className="gw__ph" />
      <div className="gw__body">
        <p className="gw__place">{look.place}</p>
        <h2 className="gw__name" id={`gw-${key}`}>{name}</h2>
        <p className="gw__count">
          <RollingNumber value={free} className="num" />{' '}
          <span className="gw__of">
            {statusWord('available', free)} {free === 1 ? 'апартамент' : 'апартамента'} от&nbsp;{total}
            {dated ? `, по данни към ${dated}` : null}
          </span>
        </p>
        <StatusBar counts={counts} />
        <p className="gw__rest">{rest}</p>
        <ul className="gw__types">
          {look.types.map((type) => {
            const n = freeUnits ? freeUnits.filter((unit) => unit.type === type).length : null
            return (
              <li key={type}>
                <b className={n === 0 ? 'zero' : undefined}>{n ?? '—'}</b> {typeWord(type, n ?? 0)}
              </li>
            )
          })}
        </ul>
        <p className="gw__area">
          {areas.length ? `Свободните са от ${formatDecimal(Math.min(...areas))} до ${formatDecimal(Math.max(...areas))}\u00a0м².` : null}
        </p>
        <div className="gw__act">
          <Button to={`${page}${explorer}`} variant="solid">Разгледайте сградата</Button>
          <a
            className="gw__only"
            href="#svobodni"
            onClick={(event) => {
              event.preventDefault()
              onOnly(key)
            }}
          >
            Само свободните <Arrow />
          </a>
        </div>
      </div>
    </article>
  )
}

export default function Gateway({ buildings, onOnly }) {
  return (
    <section className="gw" id="top" aria-labelledby="pz-h">
      <div className="gw__title">
        <h1 className="gw__h1" id="pz-h">Продажби</h1>
        <p className="gw__sub">Апартаменти в&nbsp;две нови сгради в&nbsp;София</p>
      </div>
      <Seam className="gw__seam" />
      {buildings.map((each) => (
        <Half key={each.building.key} {...each} onOnly={onOnly} />
      ))}
    </section>
  )
}
