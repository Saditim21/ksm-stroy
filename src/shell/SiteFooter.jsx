import { useId } from 'react'
import { Link } from 'react-router'
import Logo from '../components/brand/Logo'
import Seam from '../components/ui/Seam'
import { SITE, hoursShort, mapsUrl } from '../config/site'
import { bindAddress } from '../utils/format'
import EuLine from './EuLine'
import { NAV } from './nav'

// The site's footer (spec §6.5; extract §4.15), two halves on the seam:
// - left, on onyx: the logo and production's blurb (Footer on main), then the
//   phones, the hours, the email, the two offices, each with a link to it on
//   Google Maps, and the quick links, so every page's HTML keeps crawlable
//   links to the five pages;
// - right, on umber: the EU line in full, the copyright and Facebook.
// The labels are production's (the contact page, the footer on main). Its
// small links have 44 px hit boxes; page links prefetch on intent. The look
// is src/styles/shell.css's.

// Spec §3.3: a non-breaking space after the one-letter words.
const BLURB =
  'Водеща строителна компания в България с над 15 години опит. Специализираме се в жилищно и комерсиално строителство, предлагайки иновативни решения и високо качество на изпълнение.'

// The year of this build of the site (ruling C4.9): Vite writes it into the
// code (vite.config.js), so the prerendered HTML and the browser show the
// same year, and the next year's build says so.
/* global BUILD_YEAR */

export default function SiteFooter() {
  const quickLinks = useId()

  return (
    <footer className="ftr">
      <div className="ftr__grid">
        <Seam />
        <div className="ftr__half ftr__half--l">
          <Link to="/" prefetch="intent" aria-label="КСМ Строй, начална страница" className="ftr__logo">
            <Logo markClassName="text-brass" />
          </Link>
          <p className="ftr__blurb">{BLURB}</p>
          <div className="ftr__cols">
            <div>
              <h2>Телефон</h2>
              {SITE.phones.map(({ label, tel }) => (
                <a key={tel} href={`tel:${tel}`} className="ftr__link tab hit">
                  <span>{label}</span>
                </a>
              ))}
            </div>
            <div>
              <h2>Работно време</h2>
              {hoursShort().map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
            <div>
              <h2>Имейл</h2>
              <a href={`mailto:${SITE.email}`} className="ftr__link hit">
                <span>{SITE.email}</span>
              </a>
            </div>
            <div>
              <h2>Адреси</h2>
              {SITE.offices.map((office) => (
                <div key={office} className="ftr__office">
                  <p>{bindAddress(office)}</p>
                  <a href={mapsUrl(office)} target="_blank" rel="noopener noreferrer" className="ftr__maps hit">
                    <span>Отвори в&nbsp;Google Maps</span>
                  </a>
                </div>
              ))}
            </div>
            <nav aria-labelledby={quickLinks}>
              <h2 id={quickLinks}>Бързи връзки</h2>
              <ul>
                {NAV.map(({ label, href }) => (
                  <li key={href}>
                    <Link to={href} prefetch="intent" className="ftr__link hit">
                      <span>{label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
        <div className="ftr__half ftr__half--r">
          <EuLine variant="footer" />
          <p className="ftr__copy">
            <span>
              © {BUILD_YEAR} {SITE.name} · {SITE.legalName}
            </span>
            <a href={SITE.facebook} target="_blank" rel="noopener noreferrer" className="hit">
              <span>Facebook</span>
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
