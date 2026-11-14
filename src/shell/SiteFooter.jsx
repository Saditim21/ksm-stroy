import { useId } from 'react'
import { Link } from 'react-router'
import Logo from '../components/brand/Logo'
import { SITE, mapsUrl } from '../config/site'
import EuLine from './EuLine'
import TitleBlock from './TitleBlock'
import { useRouteHandle } from './handle'
import { NAV } from './nav'

// The site's footer (spec §8.1), on dusk: two calm columns, then the EU line,
// the copyright and, bottom right, the title block (§3.3).
// - left: the logo and production's blurb (Footer on main), then the phones,
//   the email and the working hours;
// - right: the two offices, each with a link to it on Google Maps, the quick
//   links and Facebook.
// The labels are production's (the contact page, the footer on main).

// Spec §3.2: a non-breaking space after the one-letter words.
const BLURB =
  'Водеща строителна компания в\u00a0България с\u00a0над 15 години опит. Специализираме се в\u00a0жилищно и\u00a0комерсиално строителство, предлагайки иновативни решения и\u00a0високо качество на изпълнение.'

const LINK = 'underline decoration-transparent decoration-1 underline-offset-[3px] hover:decoration-paper/55'

function Label({ id, children }) {
  return (
    <h2 id={id} className="mb-1.5 text-label font-medium text-paper/60">
      {children}
    </h2>
  )
}

export default function SiteFooter() {
  const { project, object } = useRouteHandle()
  const linksLabel = useId()

  return (
    <footer className="on-dusk bg-dusk font-text text-[15px] leading-[1.55] text-paper">
      <div className="site-wrap pb-10 pt-[clamp(64px,8vw,120px)]">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-x-6">
          <div className="lg:col-span-5">
            <Link to="/" aria-label="КСМ Строй, начална страница" className="inline-block">
              <Logo className="h-14 w-auto" />
            </Link>
            <p className="mt-6 max-w-[30em] text-paper/80">{BLURB}</p>
            <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-6 sm:w-max sm:gap-x-14">
              <div>
                <Label>Телефон</Label>
                {SITE.phones.map(({ label, tel }) => (
                  <a key={tel} href={`tel:${tel}`} className={`nums block w-max ${LINK}`}>
                    {label}
                  </a>
                ))}
              </div>
              <div>
                <Label>Работно време</Label>
                {SITE.hours.map((line) => (
                  <p key={line} className="nums">
                    {line}
                  </p>
                ))}
              </div>
              <div>
                <Label>Имейл</Label>
                <a href={`mailto:${SITE.email}`} className={LINK}>
                  {SITE.email}
                </a>
              </div>
            </div>
          </div>

          <div className="grid content-start gap-9 sm:grid-cols-2 lg:col-span-6 lg:col-start-7">
            <div className="sm:col-span-2">
              <Label>Адреси</Label>
              <ul className="space-y-4">
                {SITE.offices.map((office) => (
                  <li key={office}>
                    <p>{office}</p>
                    <a
                      href={mapsUrl(office)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline decoration-paper/40 decoration-1 underline-offset-[3px] hover:decoration-paper"
                    >
                      Отвори в Google Maps
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <nav aria-labelledby={linksLabel}>
              <Label id={linksLabel}>Бързи връзки</Label>
              <ul>
                {NAV.map(({ label, href }) => (
                  <li key={href}>
                    <Link to={href} className={`inline-block py-0.5 ${LINK}`}>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div>
              <Label>Последвайте ни</Label>
              <a href={SITE.facebook} target="_blank" rel="noopener noreferrer" className={LINK}>
                Facebook
              </a>
            </div>
          </div>
        </div>

        <div className="mt-[clamp(64px,8vw,112px)] grid items-end gap-x-10 gap-y-8 lg:grid-cols-[minmax(0,1fr)_auto]">
          <div>
            <EuLine tone="dusk" />
            <p className="mt-4 text-[13px] text-paper/60">© 2026 КСМ Строй</p>
          </div>
          <TitleBlock object={project ? object : undefined} />
        </div>
      </div>
    </footer>
  )
}
