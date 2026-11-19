import Mission from '../pages/about/Mission'
import Offer from '../pages/about/Offer'
import Origin from '../pages/about/Origin'
import Values from '../pages/about/Values'
import Wall from '../pages/about/Wall'
import Work from '../pages/about/Work'
import WorksTrack from '../pages/about/WorksTrack'
import { PHOTOS } from '../pages/about/photos'
import { pageMeta } from '../seo/meta'
import { preloadWithDocument } from '../utils/documentPreloads'
import { DISPLAY_FONT_PRELOADS } from '../utils/fontLinks'
import '../pages/about/about.css'

// За нас, /about, „Стена“ (polish spec §4; the concept
// design/2026-11-19-polish-concepts/ab-a.html): the motto over a wall of the
// company's own photographs that zooms into one (Wall.jsx, #top, the page's
// moment); how it began, in production's words (Origin.jsx, #istoriya); the
// seven works on a track that slides sideways (WorksTrack.jsx, #obekti); then
// the legacy page's services and why (#uslugi), values (#cennosti), mission
// and vision (#misiya), and the call to action (#rabota).

// How the site's shell frames this page (src/shell/handle.js): over its
// opening, the wall. It has no inquiry of its own: the header's „Запитване“
// goes to the contact page's form (M3/M4 spec §8).
export const handle = { header: 'overlay' }

// Both display faces, which the motto sets in the first viewport, its second
// line italic: preloaded with
// the document the page is first loaded as, never again on a client-side
// visit (ruling C5.4, src/utils/documentPreloads.js). The page shows no
// count, so it reads no availability.
const PRELOADS = DISPLAY_FONT_PRELOADS

// Production's head (its src/utils/seo.js `about`). Its share image is the
// wall's centre, the aerial of Хотел Парадайс that the zoom ends on (spec
// M3/M4 §11; about-slider-2's og).
export const meta = () => pageMeta({
  title: 'За нас - KSM Stroy | 15+ години опит в строителството',
  description: 'Научете повече за екипа на KSM Stroy - експерти в строителството с над 15 години опит, 200+ завършени проекта и 50+ доволни клиенти в София и цяла България.',
  path: '/about',
  image: PHOTOS.aerial.og,
})

export default function About() {
  preloadWithDocument(PRELOADS)
  return (
    <>
      <Wall />
      <Origin />
      <WorksTrack />
      <Offer />
      <Values />
      <Mission />
      <Work />
    </>
  )
}
