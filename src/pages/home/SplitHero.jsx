import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import ResponsivePicture from '../../components/ui/ResponsivePicture'
import RollingNumber from '../../components/ui/RollingNumber'
import { GR_FACTS, MNOGO_DATED } from '../../config/facts'
import { grFree } from '../../data/availability/select'
import { useAvailability } from '../../data/availability/useAvailability'
import grImages from '../../data/images/golden-residence.json'
import mnNight from '../../data/images/mn-night.json'
import { plural } from '../../utils/format'
import { cutNextTransition } from '../../utils/viewTransition'

// Home's opening (spec §6.7; extract §4.6): the two buildings, one seam.
// Each half is a link across the whole hero, its picture spanning the hero
// (sizes 100vw) and clipped at the seam, which is the registered number --s
// (home.css), and each takes the action „Изберете апартамент“ to its
// building's page: Golden Residence's, where on a desktop it first grows
// over the whole hero (the hero move), and Многофамилна's, through the
// doors, as any page changes (spec M3 §6.6: the move is Golden Residence's
// alone). The slogan (spec §1.2) comes first in the DOM and reads row by row
// across the seam: each part is a nowrap mask, the left one ending .2 em
// before the seam, the right one starting .2 em after it; on a phone, two
// lines broken after „пространства“.
//
// The Golden Residence count is live: `—` in the prerendered HTML and until
// the data arrives (RollingNumber), then the free apartments, rolling once;
// its half's name has no count until then. Многофамилна's counts are dated
// (MNOGO_DATED) and prerendered.
//
// Widening, the entrance and the framing are home.css's, all CSS: nothing
// here reads the pointer, the motion setting or the screen to render. Only a
// click on the Golden Residence half asks, for the hero move (below).

const NBSP = ' '
const LEVSKI = `жк${NBSP}Левски${NBSP}Г`

// Assistive technology hears each half's name in full (spec §6.7); its
// words are the half's text.
function grName(free) {
  const place = 'Golden Residence, жк Левски Г'
  if (free == null) return `${place}. Изберете апартамент.`
  return `${place}: ${free} ${plural(free, 'свободен апартамент', 'свободни апартамента')} от ${GR_FACTS.apartments}. Изберете апартамент.`
}

const MN_NAME = `Многофамилна сграда, ж.к. Връбница-1: ${MNOGO_DATED.free} ${plural(MNOGO_DATED.free, 'свободен апартамент', 'свободни апартамента')} от ${MNOGO_DATED.total} по данни към ${MNOGO_DATED.date}. Изберете апартамент.`

// The arrow the link action draws (Button's), which moves 4 px on hover.
function Arrow() {
  return (
    <svg className="arr" viewBox="0 0 18 10" width="18" height="10" aria-hidden="true" focusable="false">
      <path d="M0 5h16M12 1l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  )
}

// The hero move (spec §6.7): the Golden Residence half grows over the whole
// hero, --s to 1 over 0.8 s (home.css, `data-moving`), and the page that
// follows lands on the same picture, framed the same: the Golden Residence
// hero (gr.css), with the doors cut and its title rising.
const MOVE_MS = 800
const FINE_POINTER = '(hover: hover) and (pointer: fine)'
const SIDE_BY_SIDE = 901
const AT_THE_TOP = 8

// Whether a click on the Golden Residence half makes the move (ruling F12): a
// plain left click (a modifier opens a tab or a window), with a fine pointer
// that hovers, the halves side by side, under the motion gate's `js`, and the
// page at its top, where the half fills the screen. And no reduced-motion
// preference now: the gate's class stays on <html> when the visitor switches
// reduced motion on after the page has loaded, and the move's CSS (inside
// no-preference, ruling F3) would then stand still for 0.8 s before the page
// changed. Any other click follows the link through the doors.
function makesTheMove(event) {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false
  if (typeof window.matchMedia !== 'function') return false
  return window.matchMedia(FINE_POINTER).matches
    && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    && window.innerWidth >= SIDE_BY_SIDE
    && document.documentElement.classList.contains('js')
    && window.scrollY <= AT_THE_TOP
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
  const navigate = useNavigate()
  const [moving, setMoving] = useState(false)
  const move = useRef(0)

  // A move given up (another page taken, or Back, before it lands) leaves no
  // navigation behind it. Back to another document (Home the tab's first
  // entry) may keep the page in the back/forward cache with the timer
  // pending, so pagehide, before the page is frozen, gives the move up too:
  // Forward then shows the halves as they were, and nothing fires late
  // (Review Focus 4, ruling C9.7).
  useEffect(() => {
    const giveUp = () => {
      clearTimeout(move.current)
      setMoving(false)
    }
    window.addEventListener('pagehide', giveUp)
    return () => {
      window.removeEventListener('pagehide', giveUp)
      clearTimeout(move.current)
    }
  }, [])

  // The click takes the link from the browser and the router while the half
  // grows (a second click starts nothing more), then changes the page itself:
  // the doors cut for this one change, the page arriving as the hero
  // (src/root.jsx: data-arrive="hero", which starts its entrance at once).
  function toGoldenResidence(event) {
    if (moving) {
      event.preventDefault()
      return
    }
    if (!makesTheMove(event)) return
    event.preventDefault()
    setMoving(true)
    move.current = setTimeout(() => {
      cutNextTransition()
      navigate('/projects/golden-residence', { state: { arrive: 'hero' } })
    }, MOVE_MS)
  }

  return (
    <section
      className="hero dark"
      id="proekti"
      aria-label="Нашите сгради"
      data-moving={moving ? '' : undefined}
      style={moving ? { '--s': 1 } : undefined}
    >
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

      <Link
        to="/projects/golden-residence"
        prefetch="intent"
        className="half half--gr"
        aria-label={grName(free)}
        onClick={toGoldenResidence}
      >
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

      <Link to="/projects/mnogofamilna-sgrada" prefetch="intent" className="half half--mn" aria-label={MN_NAME}>
        <div className="half__media">
          <ResponsivePicture image={mnNight['mn-dusk']} alt="" sizes="100vw" eager fetchPriority="low" />
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
            Изберете апартамент <Arrow />
          </span>
        </div>
      </Link>

      <div className="hero__seam" aria-hidden="true" />
    </section>
  )
}
