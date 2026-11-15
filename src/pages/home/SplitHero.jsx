import { Link } from 'react-router'
import ResponsivePicture from '../../components/ui/ResponsivePicture'
import RollingNumber from '../../components/ui/RollingNumber'
import { GR_FACTS, MNOGO_DATED } from '../../config/facts'
import { grFree } from '../../data/availability/select'
import { useAvailability } from '../../data/availability/useAvailability'
import grImages from '../../data/images/golden-residence.json'
import homeImages from '../../data/images/home.json'
import { inquiryHref } from '../../shell/handle'
import { plural } from '../../utils/format'

// Home's opening (spec §6.7; extract §4.6): the two buildings, one seam.
// Each half is a link across the whole hero, its picture spanning the hero
// (sizes 100vw) and clipped at the seam, which is the registered number --s
// (home.css): Golden Residence to its page, Многофамилна to the inquiry with
// its project. The slogan (spec §1.2) comes first in the DOM and reads row by
// row across the seam: each part is a nowrap mask, the left one ending .2 em
// before the seam, the right one starting .2 em after it; on a phone, two
// lines broken after „пространства“.
//
// The Golden Residence count is live: `—` in the prerendered HTML and until
// the data arrives (RollingNumber), then the free apartments, rolling once;
// its half's name has no count until then. Многофамилна's counts are dated
// (MNOGO_DATED) and prerendered.
//
// Widening, the entrance and the framing are home.css's, all CSS: nothing
// here reads the pointer, the motion setting or the screen.

const NBSP = ' '
const LEVSKI = `жк${NBSP}Левски${NBSP}Г`
const MN_PROJECT = 'mnogofamilna-sgrada'

// Assistive technology hears each half's name in full (spec §6.7); its
// words are the half's text.
function grName(free) {
  const place = 'Golden Residence, жк Левски Г'
  if (free == null) return `${place}. Изберете апартамент.`
  return `${place}: ${free} ${plural(free, 'свободен апартамент', 'свободни апартамента')} от ${GR_FACTS.apartments}. Изберете апартамент.`
}

const MN_NAME = `Многофамилна сграда, ж.к. Връбница-1: ${MNOGO_DATED.free} ${plural(MNOGO_DATED.free, 'свободен апартамент', 'свободни апартамента')} от ${MNOGO_DATED.total} по данни към ${MNOGO_DATED.date}. Запитване за сградата.`

// The arrow the link action draws (Button's), which moves 4 px on hover.
function Arrow() {
  return (
    <svg className="arr" viewBox="0 0 18 10" width="18" height="10" aria-hidden="true" focusable="false">
      <path d="M0 5h16M12 1l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  )
}

// One part of the slogan: its mask, and the line that rises inside it.
function Part({ side, children }) {
  return (
    <span data-part="" className={`line-mask sl__${side}`}>
      <span className="split-line">{children}</span>
    </span>
  )
}

export default function SplitHero() {
  const free = grFree(useAvailability())

  return (
    <section className="hero" id="proekti" aria-label="Нашите сгради">
      <h1 className="hero__title">
        <span className="sl__row">
          <Part side="l">Създаваме</Part>{' '}
          <Part side="r">пространства</Part>
        </span>{' '}
        <br className="sl__br" />
        <span className="sl__row">
          <Part side="l">
            за <em>мечтания</em>
          </Part>{' '}
          <Part side="r">живот</Part>
        </span>
      </h1>

      <Link to="/projects/golden-residence" prefetch="intent" className="half half--gr" aria-label={grName(free)}>
        <div className="half__media">
          <ResponsivePicture image={grImages['gr-dusk']} alt="" sizes="100vw" priority />
        </div>
        <div className="half__shade" />
        <div className="half__info">
          <h2 className="half__name">Golden Residence</h2>
          <p className="half__count">
            <RollingNumber value={free} className="num" />{' '}
            <span>
              {plural(free, 'свободен', 'свободни')} от {GR_FACTS.apartments} · {LEVSKI}
            </span>
          </p>
          <p className="half__place">ул. Ген. Климент Бояджиев, София</p>
          <span className="link half__cta">
            Изберете апартамент <Arrow />
          </span>
        </div>
      </Link>

      <Link to={inquiryHref(MN_PROJECT)} prefetch="intent" className="half half--mn" aria-label={MN_NAME}>
        <div className="half__media">
          <ResponsivePicture image={homeImages['mn-dusk']} alt="" sizes="100vw" eager />
        </div>
        <div className="half__shade" />
        <div className="half__info">
          <h2 className="half__name">Многофамилна сграда</h2>
          <p className="half__count">
            <span>
              {plural(MNOGO_DATED.free, 'свободен', 'свободни')} от {MNOGO_DATED.total} · по данни към {MNOGO_DATED.date}
            </span>{' '}
            <span className="num">{MNOGO_DATED.free}</span>
          </p>
          <p className="half__place">ж.к. Връбница-1, София</p>
          <span className="link half__cta">
            Запитване за сградата <Arrow />
          </span>
        </div>
      </Link>

      <div className="hero__seam" aria-hidden="true" />
    </section>
  )
}
