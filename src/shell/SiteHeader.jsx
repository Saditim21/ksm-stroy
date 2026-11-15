import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router'
import Logo from '../components/brand/Logo'
import Button from '../components/ui/Button'
import { PRIMARY_PHONE } from '../config/site'
import { normalizePathname } from '../utils/pathname'
import EuLine from './EuLine'
import SiteMenu from './SiteMenu'
import { inquiryTarget, useRouteHandle } from './handle'

// The site's header (spec §6.2; extract §4.2): one fixed element holding the
// EU row (EuLine, 36 px) over the bar, which holds the logo, „Меню“, and from
// 901 px the phone and „Запитване“. No page links: they are in the menu and
// the footer. The look is src/styles/shell.css's.
//
// - Over a page whose route handle asks for an overlay (src/shell/handle.js)
//   it is see-through over a scrim until the page has scrolled 40 px; from
//   there, and on any other page, it is solid: onyx at 86 % with a blur and a
//   hairline.
// - Once the page has scrolled 40 px (data-scrolled) it moves up by the EU
//   row, which slides away; the bar stays. It never hides.
// - It is a view-transition group of its own: the doors leave it out, and it
//   takes the new page's look at once, under an open menu as it lies live
//   (src/styles/motion.css).
// - „Запитване“ goes to the page's own inquiry where it has one, else to the
//   contact page with the page's project (inquiryTarget).
//
// The prerender and the first client render show the top-of-page state; the
// scroll position is read only after hydration.

const SOLID_AFTER = 40
const MENU_ID = 'site-menu'

// Whether the page has scrolled past `y`: false until hydration has
// happened, then the window's answer, kept up to date.
function useScrolledPast(y) {
  const [past, setPast] = useState(false)
  useEffect(() => {
    const update = () => setPast(window.scrollY > y)
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [y])
  return past
}

export default function SiteHeader() {
  const handle = useRouteHandle()
  const pathname = normalizePathname(useLocation().pathname)
  const scrolled = useScrolledPast(SOLID_AFTER)
  // The page the menu was opened on (spec §6.4). The menu is mounted only
  // while that page is current, so a page link unmounts it in the commit that
  // shows the new page, and only the old snapshot holds it, which the doors
  // close; Back and Forward close it the same way.
  const [menuFor, setMenuFor] = useState(null)
  const menuButton = useRef(null)

  if (menuFor !== null && menuFor !== pathname) setMenuFor(null)
  const menuOpen = menuFor === pathname

  const closeMenu = useCallback(() => {
    setMenuFor(null)
    menuButton.current?.focus()
  }, [])

  const overlay = handle.header === 'overlay' && !scrolled
  const inquiry = inquiryTarget(handle)

  return (
    <>
      <a href="#main" className="skip">
        Към съдържанието
      </a>
      <header className="hdr" data-look={overlay ? 'overlay' : 'solid'} data-scrolled={scrolled ? '' : undefined}>
        <div className="hdr__eu">
          <EuLine />
        </div>
        <div className="hdr__bar">
          <Link to="/" aria-label="КСМ Строй, начална страница" className="hdr__logo">
            <Logo markClassName="text-brass" />
          </Link>
          <div className="hdr__right">
            <button
              ref={menuButton}
              type="button"
              className="hdr__menu"
              aria-label="Меню"
              aria-expanded={menuOpen}
              aria-controls={menuOpen ? MENU_ID : undefined}
              onClick={() => setMenuFor(pathname)}
            >
              <i aria-hidden="true" />
              Меню
            </button>
            <a href={`tel:${PRIMARY_PHONE.tel}`} className="hdr__tel tab hit">
              <span>{PRIMARY_PHONE.label}</span>
            </a>
            <Button {...(inquiry.startsWith('#') ? { href: inquiry } : { to: inquiry })} size="sm" className="hdr__cta">
              Запитване
            </Button>
          </div>
        </div>
      </header>
      {menuOpen ? <SiteMenu id={MENU_ID} pathname={pathname} onClose={closeMenu} /> : null}
    </>
  )
}
