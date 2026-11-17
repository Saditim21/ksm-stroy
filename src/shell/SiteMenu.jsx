import { useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router'
import Seam from '../components/ui/Seam'
import { SITE, hoursShort } from '../config/site'
import { grFree } from '../data/availability/select'
import { useAvailability } from '../data/availability/useAvailability'
import useScrollLock from '../hooks/useScrollLock'
import useMotionNow from '../motion/useMotionNow'
import { PALETTE } from '../styles/palette'
import { bindAddress, plural } from '../utils/format'
import { EASE_IN_OUT, EASE_OUT } from '../utils/motion'
import { normalizePathname } from '../utils/pathname'
import { trapTab } from '../utils/trapTab'
import EuLine from './EuLine'
import { NAV, currentFor } from './nav'

// The menu (spec §6.4; extract §4.3), a diptych of its own: on onyx, the
// pages, right-aligned against the seam, Golden Residence with its live free
// count; on umber, production's details and the EU line. „Затвори“ sits in
// the header's bar, where „Меню“ was. The look is src/styles/shell.css's.
//
// - The header mounts it only while it is open, and only while the page it
//   was opened on is current (SiteHeader.jsx): never in the HTML. A portal on
//   <body>, so no transformed or blurred ancestor (the header) sizes it.
// - A modal dialog: focus moves to the first page, Tab stays inside, and
//   Escape or „Затвори“ closes it; the header gives „Меню“ the focus back.
// - The page holds still under it (useScrollLock, which stops Lenis), and
//   a classic scrollbar's kept gutter takes the umber of its right half
//   (src/index.css); on a phone the menu scrolls on its own, so Lenis leaves
//   its wheel alone.
// - A page link needs nothing of its own: the router commits the new page,
//   the header unmounts the menu in that same commit, and only the old view
//   transition snapshot holds it, which the doors close over the header, as
//   it lay (its group, `site-menu`, src/styles/motion.css). A link to the
//   page already shown closes it at once, then the router follows it.
//
// With motion (useMotionNow), the halves slide in from above and below, the
// seam draws and the items rise; closing, the items fade and the halves slide
// back. „Затвори“ fades in with the items, once the halves cover the header's
// „Запитване“ under it. Without motion it is there at once, and a fade of
// 0.2 s brings it in (src/index.css, which keeps the fade past the
// reduced-motion clamp); it closes at once.

const PAGES = [NAV[0], { label: 'Golden Residence', href: '/projects/golden-residence', live: true }, ...NAV.slice(1)]
// When the first page takes the focus: once the halves are in, or at once
// without the motion.
const FOCUS_AFTER_MS = 650
const FOCUS_AT_ONCE_MS = 50

// A plain left click, which React Router's Link follows in this tab.
const followsInPlace = (event, link) =>
  event.button === 0 && !event.metaKey && !event.altKey && !event.ctrlKey && !event.shiftKey && (!link.target || link.target === '_self')

function partsOf(menu) {
  return {
    left: menu.querySelector('.menu__half--l'),
    right: menu.querySelector('.menu__half--r'),
    seam: menu.querySelector('.menu__seam'),
    items: [...menu.querySelectorAll('.menu__pages li, .menu__info > *')],
    close: menu.querySelector('.menu__close'),
  }
}

export default function SiteMenu({ id, pathname, onClose }) {
  const root = useRef(null)
  const timeline = useRef(null)
  const focusTimer = useRef(0)
  const closing = useRef(false)
  const motionNow = useMotionNow()
  const free = grFree(useAvailability())
  useScrollLock(PALETTE.umber)

  // The opening, before the menu's first paint, so the motion starts from
  // its first frame; then the focus moves in, unless the keyboard has already
  // taken it there.
  useLayoutEffect(() => {
    const menu = root.current
    const motion = motionNow()
    if (motion) {
      const { gsap } = motion
      const { left, right, seam, items, close } = partsOf(menu)
      timeline.current = gsap.timeline({
        onComplete: () => gsap.set([left, right, seam, ...items, close], { clearProps: 'transform,opacity' }),
      })
        .fromTo(left, { yPercent: -100 }, { yPercent: 0, duration: 0.75, ease: EASE_IN_OUT }, 0)
        .fromTo(right, { yPercent: 100 }, { yPercent: 0, duration: 0.75, ease: EASE_IN_OUT }, 0)
        .fromTo(seam, { scaleY: 0 }, { scaleY: 1, duration: 0.9, ease: EASE_OUT }, 0.45)
        .fromTo(items, { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.8, ease: EASE_OUT, stagger: 0.04 }, 0.5)
        .fromTo(close, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: EASE_OUT }, 0.5)
    }
    focusTimer.current = setTimeout(() => {
      if (!menu.contains(document.activeElement)) menu.querySelector('.menu__pages a')?.focus({ preventScroll: true })
    }, motion ? FOCUS_AFTER_MS : FOCUS_AT_ONCE_MS)
    return () => {
      clearTimeout(focusTimer.current)
      timeline.current?.kill()
    }
    // It opens once, as it mounts: motion allowed or not later changes nothing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Closes, with the motion unless `instant`, then hands over to the header.
  const close = useCallback((instant = false) => {
    if (closing.current) return
    closing.current = true
    clearTimeout(focusTimer.current)
    timeline.current?.kill()
    const motion = instant ? null : motionNow()
    if (!motion) {
      onClose()
      return
    }
    const { gsap } = motion
    const { left, right, items, close: closeButton } = partsOf(root.current)
    timeline.current = gsap.timeline({ onComplete: onClose })
      .to([...items, closeButton], { opacity: 0, duration: 0.2 }, 0)
      .to(left, { yPercent: -100, duration: 0.6, ease: EASE_IN_OUT }, 0.05)
      .to(right, { yPercent: 100, duration: 0.6, ease: EASE_IN_OUT }, 0.05)
  }, [motionNow, onClose])

  // Escape closes; Tab goes round inside the menu.
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        close()
        return
      }
      if (event.key === 'Tab') trapTab(event, root.current)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [close])

  // A link to the page already shown: the router keeps the page, so the menu
  // closes itself, at once. The link's own click runs first and follows it.
  const onClick = (event) => {
    const link = event.target.closest('a[href]')
    if (!link || !followsInPlace(event, link)) return
    const url = new URL(link.href, window.location.href)
    if (url.origin === window.location.origin && normalizePathname(url.pathname) === pathname) close(true)
  }

  return createPortal(
    <div
      ref={root}
      id={id}
      className="menu"
      role="dialog"
      aria-modal="true"
      aria-label="Меню"
      data-lenis-prevent=""
      onClick={onClick}
    >
      <Seam className="menu__seam" />
      <div className="menu__half menu__half--l">
        <nav aria-label="Страници">
          <ol className="menu__pages">
            {PAGES.map(({ label, href, live }) => (
              <li key={href}>
                <Link to={href} prefetch="intent" aria-current={currentFor(href, pathname)}>
                  {label}
                </Link>
                {live ? <span className="sub">жк&nbsp;Левски&nbsp;Г · {free ?? '—'} {plural(free, 'свободен', 'свободни')}</span> : null}
              </li>
            ))}
          </ol>
        </nav>
      </div>
      <div className="menu__half menu__half--r">
        <div className="menu__info">
          <div>
            <h2>Телефон</h2>
            {SITE.phones.map(({ label, tel }) => (
              <a key={tel} href={`tel:${tel}`} className="menu__tel tab hit">
                <span>{label}</span>
              </a>
            ))}
          </div>
          <div>
            <h2>Работно време</h2>
            <p>{hoursShort().join(' · ')}</p>
          </div>
          <div>
            <h2>Адреси</h2>
            {SITE.offices.map((office) => (
              <p key={office}>{bindAddress(office)}</p>
            ))}
          </div>
          <div>
            <h2>Имейл</h2>
            <a href={`mailto:${SITE.email}`} className="hit">
              <span>{SITE.email}</span>
            </a>
          </div>
          <EuLine variant="menu" />
        </div>
      </div>
      <button type="button" className="menu__close" onClick={() => close()}>
        <i aria-hidden="true" />
        Затвори
      </button>
    </div>,
    document.body,
  )
}
