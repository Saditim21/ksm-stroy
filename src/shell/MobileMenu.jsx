import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router'
import Logo from '../components/brand/Logo'
import Button from '../components/ui/Button'
import { PRIMARY_PHONE, SITE } from '../config/site'
import useScrollLock from '../hooks/useScrollLock'
import { PALETTE } from '../styles/palette'
import EuLine from './EuLine'
import Icon, { CLOSE } from './Icon'
import { NAV, currentFor } from './nav'

// The mobile menu (spec §8.1): a full-screen sheet on umber, the site's pages
// set large in the display face, then „Запитване“, the phone, the email, both
// offices and the EU line. The header renders it only while it is open, so it
// is never in the prerendered HTML.
//
// - It is a portal on <body>, never inside the fixed header: an ancestor with
//   a transform or a backdrop-filter would make a fixed sheet the size of that
//   ancestor (the v1 bug).
// - It is a modal dialog: it takes the focus to its close button, keeps Tab
//   inside, and Esc or the close button closes it; the header then gives the
//   focus back to the menu button. Following any of its links closes it too.
// - The page under it holds still (useScrollLock, which stops Lenis); the
//   sheet scrolls on its own when it is taller than the screen, so Lenis must
//   leave its wheel alone (data-lenis-prevent).
// <html> takes the sheet's umber while the lock holds, so the scrollbar's
// strip matches the sheet.
const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'

export default function MobileMenu({ id, pathname, inquiry, onClose }) {
  const sheet = useRef(null)
  const closeButton = useRef(null)
  useScrollLock(PALETTE.umber)

  useEffect(() => {
    closeButton.current?.focus()
  }, [])

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key !== 'Tab') return
      const stops = [...sheet.current.querySelectorAll(FOCUSABLE)]
      const first = stops[0]
      const last = stops[stops.length - 1]
      const active = document.activeElement
      if (!sheet.current.contains(active)) {
        event.preventDefault()
        first.focus()
      } else if (event.shiftKey && active === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  // Following a link closes the menu; the links' clicks bubble up to the sheet.
  const onClick = (event) => {
    if (event.target.closest('a')) onClose()
  }

  return createPortal(
    <div
      ref={sheet}
      id={id}
      role="dialog"
      aria-modal="true"
      aria-label="Меню"
      data-lenis-prevent=""
      onClick={onClick}
      className="fixed inset-0 z-50 flex flex-col overflow-y-auto overscroll-contain bg-umber font-text text-ivory"
    >
      <div className="site-wrap flex h-[var(--header-h)] shrink-0 items-center justify-between pt-[var(--eu-h)]">
        <Link to="/" aria-label="КСМ Строй, начална страница" className="shrink-0">
          <Logo className="h-[46px] w-auto stroke-[3.45]" />
        </Link>
        <button
          ref={closeButton}
          type="button"
          aria-label="Затворете менюто"
          onClick={onClose}
          className="-mr-2.5 inline-flex size-11 items-center justify-center"
        >
          <Icon d={CLOSE} />
        </button>
      </div>

      <div className="site-wrap">
        <nav aria-label="Основна навигация" className="mt-7">
          <ul>
            {NAV.map(({ label, href }) => {
              const current = currentFor(href, pathname)
              return (
                <li key={href}>
                  <Link
                    to={href}
                    aria-current={current}
                    className={`block py-1 font-display text-[40px] font-[450] leading-[1.15] ${
                      current ? 'underline decoration-ivory/50 decoration-1 underline-offset-[0.16em]' : ''
                    }`}
                  >
                    {label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
        {/* On a phone the menu is the one way to the form that is always at
            hand, so „Запитване“ follows the pages at once. */}
        <Button to={inquiry} className="mt-7 w-full">
          Запитване
        </Button>
        <div className="mt-8 grid gap-4 pb-7 text-[15px]">
          {/* The display face's „+“ is a hairline, so the sign is set in the
              text face. */}
          <a href={`tel:${PRIMARY_PHONE.tel}`} className="nums justify-self-start font-display text-[28px] leading-tight">
            <span className="align-[0.1em] font-text text-[0.75em]">+</span>
            {PRIMARY_PHONE.label.slice(1)}
          </a>
          <a href={`mailto:${SITE.email}`} className="justify-self-start">
            {SITE.email}
          </a>
          {SITE.offices.map((office) => (
            <p key={office} className="text-ivory/75">
              {office}
            </p>
          ))}
        </div>
      </div>

      <div className="site-wrap mt-auto border-t border-ivory/15 pb-[max(1.75rem,env(safe-area-inset-bottom))] pt-6">
        <EuLine tone="dusk" />
      </div>
    </div>,
    document.body,
  )
}
