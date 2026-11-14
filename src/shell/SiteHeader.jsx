import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router'
import Logo from '../components/brand/Logo'
import Button from '../components/ui/Button'
import { PRIMARY_PHONE } from '../config/site'
import { normalizePathname } from '../utils/pathname'
import EuLine from './EuLine'
import Icon, { MENU, PHONE } from './Icon'
import MobileMenu from './MobileMenu'
import { inquiryHref, useRouteHandle } from './handle'
import { NAV, currentFor } from './nav'

// The site's header (spec §8.1): one fixed element holding the EU line (on
// paper, 36 px; 72 px under 640 px, where its text takes a second row) and the
// 72 px bar, so it moves as one, with one translateY. It is excluded from the
// route crossfade (view-transition-name, spec §5.3).
//
// The bar is see-through, with paper text, over a page whose route handle
// asks for an overlay (src/shell/handle.js), until the page has scrolled
// 80 px; from there, and on any other page, it is paper with ink text. Past
// the first screen it slides away while the page scrolls down and comes back
// as soon as it scrolls up, and whenever the keyboard moves into it.
//
// Hidden, it moves up its own height and 1 px more, for the rule under the
// solid bar, which is a shadow outside the box.
//
// Text colours switch at once, never through a fade (§5.2.10). The prerender
// and the first client render show the top-of-page state; the scroll position
// is read only after hydration.
//
// Under 1024 px the bar holds the logo, a phone button and the menu button,
// which opens the mobile menu (MobileMenu.jsx).

const SOLID_AFTER = 80
// A move smaller than this is not a change of direction: it waits until the
// moves add up (a glide's last frames, iOS bouncing at the end of the page).
const TOLERANCE = 2
const MENU_ID = 'site-menu'

function useHeaderScroll() {
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    let last = window.scrollY
    const update = () => {
      const y = window.scrollY
      setScrolled(y > SOLID_AFTER)
      if (y <= window.innerHeight) {
        setHidden(false)
        last = y
      } else if (Math.abs(y - last) >= TOLERANCE) {
        setHidden(y > last)
        last = y
      }
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  return { scrolled, hidden }
}

export default function SiteHeader() {
  const handle = useRouteHandle()
  const location = useLocation()
  const pathname = normalizePathname(location.pathname)
  const { scrolled, hidden } = useHeaderScroll()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuButton = useRef(null)

  const overlay = handle.header === 'overlay' && !scrolled
  const inquiry = inquiryHref(handle.project)

  const closeMenu = useCallback(() => {
    setMenuOpen(false)
    menuButton.current?.focus()
  }, [])

  // Any navigation closes the menu, Back included.
  useEffect(() => {
    setMenuOpen(false)
  }, [location.key])

  const navLink = (active) =>
    `whitespace-nowrap py-1.5 underline decoration-1 underline-offset-[9px] transition-[text-decoration-color] duration-200 ${
      active
        ? overlay ? 'decoration-current' : 'text-gold-ink decoration-gold-ink'
        : 'decoration-transparent hover:decoration-current'
    }`

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[60] focus:bg-paper focus:px-3.5 focus:py-2.5 focus:font-text focus:text-small focus:font-medium focus:text-ink focus:shadow-[0_0_0_1px_theme(colors.ink)]"
      >
        Към съдържанието
      </a>
      <header
        data-look={overlay ? 'overlay' : 'solid'}
        data-hidden={hidden ? '' : undefined}
        className={`fixed inset-x-0 top-0 z-40 font-text transition-transform duration-[380ms] ease-power3-out [view-transition-name:site-header] focus-within:translate-y-0 ${
          hidden ? 'translate-y-[calc(-100%-1px)]' : ''
        }`}
      >
        <EuLine />
        {/* See-through over a dark hero, the bar is a dusk ground (.on-dusk),
            so its focus rings are paper (src/index.css). */}
        <div className={overlay ? 'on-dusk text-paper' : 'bg-paper text-ink shadow-[0_1px_0_theme(colors.rule)]'}>
          <div className="site-wrap flex h-[var(--bar-h)] items-center gap-1 lg:gap-5 xl:gap-7">
            <Link to="/" aria-label="КСМ Строй, начална страница" className={`shrink-0 ${overlay ? '' : 'text-gold-ink'}`}>
              <Logo className="h-[46px] w-auto stroke-[3.45]" />
            </Link>
            <nav aria-label="Основна навигация" className="hidden lg:ml-3 lg:block xl:ml-7">
              <ul className="flex gap-[22px] text-[15px] xl:gap-[30px]">
                {NAV.map(({ label, href }) => {
                  const current = currentFor(href, pathname)
                  return (
                    <li key={href}>
                      <Link to={href} aria-current={current} className={navLink(current !== undefined)}>
                        {label}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </nav>
            <a href={`tel:${PRIMARY_PHONE.tel}`} className="nums ml-auto hidden whitespace-nowrap text-[15px] hover:underline lg:inline">
              {PRIMARY_PHONE.label}
            </a>
            <Button to={inquiry} tone={overlay ? 'dusk' : 'paper'} className="hidden lg:inline-flex">
              Запитване
            </Button>
            <a
              href={`tel:${PRIMARY_PHONE.tel}`}
              aria-label="Обадете се"
              className="ml-auto inline-flex size-11 items-center justify-center lg:hidden"
            >
              <Icon d={PHONE} />
            </a>
            <button
              ref={menuButton}
              type="button"
              aria-label="Меню"
              aria-expanded={menuOpen}
              aria-controls={menuOpen ? MENU_ID : undefined}
              onClick={() => setMenuOpen(true)}
              className="-mr-2.5 inline-flex size-11 items-center justify-center lg:hidden"
            >
              <Icon d={MENU} />
            </button>
          </div>
        </div>
      </header>
      {menuOpen ? <MobileMenu id={MENU_ID} pathname={pathname} inquiry={inquiry} onClose={closeMenu} /> : null}
    </>
  )
}
