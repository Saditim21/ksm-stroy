import InquirySection from '../components/inquiry/InquirySection'
import { availabilityPreload } from '../data/availability/useAvailability'
import { pageMeta } from '../seo/meta'
import { preloadWithDocument } from '../utils/documentPreloads'
import { DISPLAY_FONT_PRELOADS } from '../utils/fontLinks'
import { seoData } from '../utils/seo'
import CompanySection from './home/CompanySection'
import EuPosterSection from './home/EuPosterSection'
import SeamIntro from './home/SeamIntro'
import ServicesSection from './home/ServicesSection'
import SplitHero from './home/SplitHero'
import TeaserSection from './home/TeaserSection'
import WorksSection from './home/WorksSection'
import { HOME_INQUIRY } from './home/inquiry'
import './home/home.css'

// Home, `/` (spec §8.1): the seam intro, once per session; the split opening
// with the two buildings and slogan A, under the see-through header; the
// company; the services; the completed works; Golden Residence floor by
// floor, the explorer's teaser; the closing inquiry; and production's EU
// poster section, always last.

// How the site's shell frames this page (src/shell/handle.js): the header's
// „Запитване“ goes to the inquiry on the page.
export const handle = { header: 'overlay', inquiry: true }

// The availability API, for the Golden Residence count, and both display
// faces, which the opening sets in its first viewport: preloaded with the
// document Home is first loaded as, never again on a client-side visit
// (src/utils/documentPreloads.js).
const PRELOADS = [availabilityPreload, ...DISPLAY_FONT_PRELOADS]

// The page's head (root.jsx <Meta/>), with the site's share image
// (src/seo/meta.js).
export const meta = () => pageMeta({
  title: seoData.home.title,
  description: seoData.home.description,
  path: '/',
})

export default function Home() {
  preloadWithDocument(PRELOADS)
  return (
    <>
      <SeamIntro />
      <SplitHero />
      <CompanySection />
      <ServicesSection />
      <WorksSection />
      <TeaserSection />
      <InquirySection page="home" {...HOME_INQUIRY} />
      <EuPosterSection />
    </>
  )
}
