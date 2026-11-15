import { availabilityPreload } from '../data/availability/useAvailability'
import { pageMeta } from '../seo/meta'
import { DISPLAY_FONT_PRELOADS } from '../utils/fontLinks'
import { seoData } from '../utils/seo'
import CompanySection from './home/CompanySection'
import EuPosterSection from './home/EuPosterSection'
import SeamIntro from './home/SeamIntro'
import SplitHero from './home/SplitHero'
import './home/home.css'

// Home, `/` (spec §8.1): the seam intro, once per session; the split opening
// with the two buildings and slogan A, under the see-through header; the
// company; and production's EU poster section, always last. Services, works,
// the floor-by-floor teaser and the inquiry come between them in the next
// tasks.

// How the site's shell frames this page (src/shell/handle.js).
export const handle = { header: 'overlay' }

// The availability API, for the Golden Residence count, and both display
// faces, which the opening sets in its first viewport.
export const links = () => [availabilityPreload, ...DISPLAY_FONT_PRELOADS]

// The page's head (root.jsx <Meta/>), with the site's share image
// (src/seo/meta.js).
export const meta = () => pageMeta({
  title: seoData.home.title,
  description: seoData.home.description,
  path: '/',
})

export default function Home() {
  return (
    <>
      <SeamIntro />
      <SplitHero />
      <CompanySection />
      <EuPosterSection />
    </>
  )
}
