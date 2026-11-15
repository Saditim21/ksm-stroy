import InquirySection from '../components/inquiry/InquirySection'
import { availabilityPreload } from '../data/availability/useAvailability'
import ExplorerSection from '../explorer/ExplorerSection'
import BlocksSection from '../pages/golden-residence/BlocksSection'
import GallerySection from '../pages/golden-residence/GallerySection'
import GrHero from '../pages/golden-residence/GrHero'
import ParkingSection from '../pages/golden-residence/ParkingSection'
import StorySection from '../pages/golden-residence/StorySection'
import { pageMeta } from '../seo/meta'
import { preloadWithDocument } from '../utils/documentPreloads'
import { DISPLAY_FONT_PRELOADS } from '../utils/fontLinks'
import '../pages/golden-residence/gr.css'

// The Golden Residence page, /projects/golden-residence (spec §8.2): the hero,
// where Home's half lands; the building's story; the explorer, floor by
// floor; the two blocks; the gallery; the garages and parking places; and
// the inquiry, which КСМ Строй takes (decision A1). The page never names the
// agency that sells through its own landing, nor links to it.

// How the site's shell frames this page (src/shell/handle.js): under the
// see-through header, a page of the project, with the inquiry the header's
// „Запитване“ goes to.
export const handle = { header: 'overlay', project: 'golden-residence', inquiry: true }

// The availability API, for the free counts, and both display faces, which
// the title sets in the first viewport: preloaded with the document the page
// is first loaded as, never again on a client-side visit (ruling C5.4,
// src/utils/documentPreloads.js).
const PRELOADS = [availabilityPreload, ...DISPLAY_FONT_PRELOADS]

// The page's head (root.jsx <Meta/>), as M1 set it.
export const meta = () => pageMeta({
  title: 'Golden Residence - KSM Stroy',
  description: 'Golden Residence в жк Левски Г, ул. Ген. Климент Бояджиев, гр. София: блок А и блок Б, по 96 апартамента на 8 етажа.',
  path: '/projects/golden-residence',
})

export default function GoldenResidence() {
  preloadWithDocument(PRELOADS)
  return (
    <>
      <GrHero />
      <StorySection />
      <ExplorerSection />
      <BlocksSection />
      <GallerySection />
      <ParkingSection />
      <InquirySection page="golden-residence" />
    </>
  )
}
