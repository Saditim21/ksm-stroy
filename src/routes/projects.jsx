import { useRef } from 'react'
import Seam from '../components/ui/Seam'
import Ways from '../components/ui/Ways.jsx?projects'
import { PRIMARY_PHONE } from '../config/site'
import { availabilityPreload } from '../data/availability/useAvailability'
import grImages from '../data/images/golden-residence.json'
import useReveals from '../motion/useReveals'
import BuildingRows from '../pages/projects/BuildingRows'
import SalesBoard from '../pages/projects/SalesBoard'
import { pageMeta } from '../seo/meta'
import { preloadWithDocument } from '../utils/documentPreloads'
import { DISPLAY_FONT_PRELOADS } from '../utils/fontLinks'
import '../pages/projects/projects.css'

// Продажби, /projects (spec M3/M4 §7.1; the concept's prodazhbi.html): the
// sales board, every apartment of both buildings as a square in its status's
// colour, each opening that apartment on its building's page
// (SalesBoard.jsx, #top, the page's moment); the two buildings compared row
// by row (BuildingRows.jsx, #sgradite); and the closing, production's call
// to action as the system's two ways, the first solid (ruling M4-PF14).
//
// Ways comes in under a query of its own (Ways.jsx?projects), as Контакти's
// does (src/routes/contact.jsx): the build gives this page its own copy
// rather than a chunk shared with Home's teaser, which would add about 260 B
// to Home's first load (spec M3/M4 §4.4: an extracted piece never grows
// Home's). The pages still share ways.css, a stylesheet of its own.

// How the site's shell frames this page (src/shell/handle.js): below the
// solid header. It has no inquiry of its own: the header's „Запитване“ goes
// to the contact page's form (M3/M4 spec §8).
export const handle = { header: 'solid' }

// The availability API, which Golden Residence's squares and counts read,
// and the upright display face, which the title and the buildings' names
// set in the first viewport (it has no italic word): preloaded with the
// document the page is first loaded as, never again on a client-side visit
// (ruling C5.4, src/utils/documentPreloads.js).
const PRELOADS = [availabilityPreload, DISPLAY_FONT_PRELOADS[0]]

// Production's head (its Projects.jsx). Its share image is the page's first
// picture, Golden Residence's render over the buildings' rows (spec M3/M4
// §11; gr-corner's og).
export const meta = () => pageMeta({
  title: 'Продажби - KSM Stroy',
  description: 'Открийте нашите атрактивни обекти за продажба - модерни апартаменти и жилищни сгради в престижни райони на София.',
  path: '/projects',
  image: grImages['gr-corner'].og,
})

// The closing's two ways (spec §7.1): the contact page's form, to ask the
// prices, and the contact page, with the phone under it (ruling M4-PF14).
const WAYS = [
  { title: 'Попитайте за цени', sub: 'Към запитването', to: '/contact#zapitvane' },
  { title: 'Свържете се с нас', sub: PRIMARY_PHONE.label, to: '/contact' },
]

// The closing: production's „Търсите нов *дом*?“ and its line, as a hinge,
// then the ways. A no-break space after each one-letter word and between the
// lead's last two words (spec §4.5, src/styles/diptych.css).
function Closing() {
  const ref = useRef(null)
  useReveals(ref)

  return (
    <section ref={ref} className="sec pz-close" aria-labelledby="pz-close-h">
      <div className="hinge">
        <h2 className="h2" id="pz-close-h" data-split="">
          Търсите нов <em>дом</em>?
        </h2>
        <p className="lead" data-fade="">
          Свържете се с&nbsp;нас за консултация и&nbsp;да обсъдим наличните апартаменти и&nbsp;бъдещи&nbsp;проекти.
        </p>
        <Seam draw />
      </div>
      <Ways label="Два начина да се свържете с нас" ways={WAYS} />
    </section>
  )
}

export default function Projects() {
  preloadWithDocument(PRELOADS)
  return (
    <>
      <SalesBoard />
      <BuildingRows />
      <Closing />
    </>
  )
}
