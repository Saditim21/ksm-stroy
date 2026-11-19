import { useCallback, useRef, useState } from 'react'
import Seam from '../components/ui/Seam'
import Ways from '../components/ui/Ways.jsx?projects'
import { PRIMARY_PHONE } from '../config/site'
import { availabilityPreload } from '../data/availability/useAvailability'
import grImages from '../data/images/golden-residence.json'
import useReveals from '../motion/useReveals'
import { BUILDINGS, useBuildings } from '../pages/projects/buildings'
import FloorLedger from '../pages/projects/FloorLedger'
import FreeList from '../pages/projects/FreeList'
import Gateway from '../pages/projects/Gateway'
import { pageMeta } from '../seo/meta'
import { preloadWithDocument } from '../utils/documentPreloads'
import { DISPLAY_FONT_PRELOADS } from '../utils/fontLinks'
import { scrollToId } from '../utils/scroll'
import '../pages/projects/projects.css'

// Продажби, /projects, „Две сгради“ (polish spec §3; the concept
// design/2026-11-19-polish-concepts/pz-a.html): the two buildings first
// (Gateway.jsx, #top, the page's moment), floor by floor (FloorLedger.jsx,
// #etazhi), the free apartments of both with their filters (FreeList.jsx,
// #svobodni), and the closing, production's call to action as the system's
// two ways, the first solid (ruling M4-PF14). A building's „Само свободните“
// sets the list's filter to it and glides there: the filter lives here.
//
// Ways comes in under a query of its own (Ways.jsx?projects), as Контакти's
// does (src/routes/contact.jsx): the build gives this page its own copy
// rather than a chunk shared with Home's teaser, which would add about 260 B
// to Home's first load (spec M3/M4 §4.4: an extracted piece never grows
// Home's). The pages still share ways.css, a stylesheet of its own.

// How the site's shell frames this page (src/shell/handle.js): over its
// opening, the two buildings' photographs. It has no inquiry of its own: the
// header's „Запитване“ goes to the contact page's form (M3/M4 spec §8).
export const handle = { header: 'overlay' }

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
// prices, and the contact page, with the phone under it (ruling M4-PF14). A
// no-break space after the one-letter „с“ (spec §4.5).
const WAYS = [
  { title: 'Попитайте за цени', sub: 'Към запитването', to: '/contact#zapitvane' },
  { title: 'Свържете се с нас', sub: PRIMARY_PHONE.label, to: '/contact' },
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

// Each building with its numbers now: Golden Residence's model live (null
// until the store has its rows), Многофамилна's from its dated snapshot.
const TOTALS = { gr: 192, mn: 144 }

export default function Projects() {
  preloadWithDocument(PRELOADS)
  const numbers = useBuildings()
  const buildings = BUILDINGS.map((building) => ({ building, ...numbers[building.key], total: TOTALS[building.key] }))
  const [filter, setFilter] = useState({ building: null, type: null, band: null })
  const only = useCallback((key) => {
    setFilter({ building: key, type: null, band: null })
    scrollToId('svobodni')
  }, [])
  return (
    <>
      <Gateway buildings={buildings} onOnly={only} />
      <FloorLedger buildings={buildings} />
      <FreeList buildings={buildings} filter={filter} onFilter={setFilter} />
      <Closing />
    </>
  )
}
