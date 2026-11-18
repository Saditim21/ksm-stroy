import { preload } from 'react-dom'
import Button from '../components/ui/Button'
import Seam from '../components/ui/Seam'
import LostPlan from '../pages/notfound/LostPlan'
import { notFoundMeta } from './notFoundMeta'
import '../pages/notfound/notfound.css'

// Any URL no other route matches (spec M3/M4 §7.6; the concept's 404.html):
// the page that is not in the drawing. Prerendered as /404;
// scripts/postbuild.mjs copies it to build/client/404.html, which the host
// serves, with a 404 status, for any URL that has no page of its own. A block
// page's route that names no block shows it too, loaded only then
// (src/routes/BlockRoute.jsx), so none of it, the drawing least of all, is
// in a block page's first-load JS.
//
// Left of the seam, on the plan stage's umber, the drawing: Golden
// Residence's typical floor of блок А with one apartment cut out
// (LostPlan.jsx), which comes first on a phone, under a brass rule. Right of
// it, the words, the legacy page's own: the heading in its two lines, its
// sentence and the three ways back. The heading comes first in the DOM.
//
// The page is all first viewport, so it arrives in CSS from the first paint
// (notfound.css): the heading's lines rise from their masks (authored by
// hand, spec §4.2), the seam draws down, the sentence and the ways fade up,
// the outlines draw in turn and the missing apartment shows last. Under
// reduced motion it is simply there.
//
// Its head, noindex in every build, is notFoundMeta.js's, which the block
// pages' routes share.
export const meta = notFoundMeta

export const handle = { header: 'solid' }

const WAYS_BACK = [
  { label: 'Начало', to: '/' },
  { label: 'Продажби', to: '/projects' },
  { label: 'Контакти', to: '/contact' },
]

// The heading's sentence as it is spoken: its name for assistive technology,
// and the name the contract finds it by (tests/contracts/dev-routes.test.jsx).
// On the page a no-break space binds „я“ and „в“ to the next words (spec
// §4.5, §7.6), a typesetter's binding a screen reader has no use for.
const SENTENCE = 'Тази страница я няма в чертежа.'

// The upright display face, which the heading sets in the first viewport (it
// has no italic word): preloaded with the document the page is first loaded
// as (ruling C4.10), never on a client-side visit, as preloadWithDocument
// does (src/utils/documentPreloads.js). That helper and DISPLAY_FONT_PRELOADS
// ride in the facade group's chunk (scripts/client-chunks.mjs), which this
// page doesn't load: importing them here would split them out of that chunk,
// into the first load of every page that loads it (ruling M4-PF15), so the
// page asks React for the face itself.
function preloadTitleFace() {
  if (typeof document !== 'undefined') return
  preload('/fonts/ksm-display.woff2', { as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' })
}

// One masked line of the heading: its mask, and the line that rises in it.
function Line({ children }) {
  return (
    <span className="line-mask">
      <span className="split-line">{children}</span>
    </span>
  )
}

export default function NotFound() {
  preloadTitleFace()
  return (
    <section className="lost" id="top" aria-labelledby="lost-h">
      <Seam />
      <div className="lost__text">
        <h1 className="lost__h1" id="lost-h" aria-label={SENTENCE}>
          <Line>Тази страница</Line> <Line>я&nbsp;няма в&nbsp;чертежа.</Line>
        </h1>
        <p className="lost__p">Проверете адреса или започнете от някоя от страниците по-долу.</p>
        <ul className="lost__ways">
          {WAYS_BACK.map(({ label, to }) => (
            <li key={to}>
              <Button to={to} variant="link">
                {label}
              </Button>
            </li>
          ))}
        </ul>
      </div>
      <LostPlan />
    </section>
  )
}
