import Figures from '../pages/about/Figures'
import Lineage from '../pages/about/Lineage'
import Mission from '../pages/about/Mission'
import Offer from '../pages/about/Offer'
import Team from '../pages/about/Team'
import Tradition from '../pages/about/Tradition'
import Values from '../pages/about/Values'
import Work from '../pages/about/Work'
import { pageMeta } from '../seo/meta'
import { preloadWithDocument } from '../utils/documentPreloads'
import { DISPLAY_FONT_PRELOADS } from '../utils/fontLinks'
import '../pages/about/about.css'

// За нас, /about (spec M3/M4 §7.4; the concept's za-nas.html): the company
// page, where the seam is the family line. It opens on the founding drawn
// on the seam (Lineage.jsx, #top, the page's moment), then reads in pairs:
// the tradition and what the founders promised, outside | inside
// (#traditsiya); who works here (#koi-sme-nie); the legacy figures at the
// foot of two aerial photos (#opit); three values across the seam
// (#cennosti); what | why (#uslugi); mission | vision (#misiya); and the call
// to action beside a finished project (#rabota). Every word is the legacy
// page's (src/pages/About.jsx on main) or the client's own text for it
// (src/assets/for-us/content.txt), with the spelling fixes QUESTIONS.md
// lists.

// How the site's shell frames this page (src/shell/handle.js): below the
// solid header. It has no inquiry of its own: the header's „Запитване“ goes
// to the contact page's form (M3/M4 spec §8).
export const handle = { header: 'solid' }

// Both display faces, which the title (and its italic word), the brothers'
// names and the „и“ between them set in the first viewport: preloaded with
// the document the page is first loaded as, never again on a client-side
// visit (ruling C5.4, src/utils/documentPreloads.js). The page shows no
// count, so it reads no availability.
const PRELOADS = DISPLAY_FONT_PRELOADS

// Production's head (its src/utils/seo.js `about`). Its share image is the
// site's for now (spec §11: the rebuilt pages' own come with M4's pass).
export const meta = () => pageMeta({
  title: 'За нас - KSM Stroy | 15+ години опит в строителството',
  description: 'Научете повече за екипа на KSM Stroy - експерти в строителството с над 15 години опит, 200+ завършени проекта и 50+ доволни клиенти в София и цяла България.',
  path: '/about',
})

export default function About() {
  preloadWithDocument(PRELOADS)
  return (
    <>
      <Lineage />
      <Tradition />
      <Team />
      <Figures />
      <Values />
      <Offer />
      <Mission />
      <Work />
    </>
  )
}
