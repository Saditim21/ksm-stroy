import { Link } from 'react-router'
import InquirySection from '../components/inquiry/InquirySection'
import Seam from '../components/ui/Seam'
import { GR_FACTS } from '../config/facts'
import { availabilityPreload } from '../data/availability/useAvailability'
import { preloadWithDocument } from '../utils/documentPreloads'
import { DISPLAY_FONT_PRELOADS } from '../utils/fontLinks'
import { ExplorerProvider } from './ExplorerContext'
import ExplorerSection from './ExplorerSection'

// A Golden Residence block page, /projects/golden-residence/block-a and
// block-b (spec §7.11, §8.3): the way back to the building, the H1 „Golden
// Residence, блок *А*“ and the block's facts, hinged on the seam; then the
// explorer, starting on its own block, and the Golden Residence inquiry. The
// page's ExplorerProvider writes the block's own floors bare in the address
// (?floor=5), and reads a deep link to a floor or a unit once it has hydrated.
//
// Why that order: the routes contract looks for „блок А“ followed by anything
// but a letter in the page's run-together text, and the facts line starts
// with a digit.
//
// The availability API, for the counts, and both display faces, which the
// title sets in the first viewport, are preloaded with the document the page
// is first loaded as, never again on a client-side visit (ruling C5.4,
// src/utils/documentPreloads.js).

const PRELOADS = [availabilityPreload, ...DISPLAY_FONT_PRELOADS]
const PER_BLOCK = GR_FACTS.apartments / GR_FACTS.blocks
const FACTS = `${PER_BLOCK} апартамента · ${GR_FACTS.floors} етажа · ${GR_FACTS.perFloor} на етаж`

// The way back's arrow, drawn as the actions' arrow is (Button), pointing back.
const BACK = (
  <svg className="arr" viewBox="0 0 18 10" width="18" height="10" aria-hidden="true" focusable="false">
    <path d="M18 5H2M6 1L2 5l4 4" fill="none" stroke="currentColor" strokeWidth="1.2" />
  </svg>
)

export default function BlockPage({ block }) {
  preloadWithDocument(PRELOADS)
  return (
    <ExplorerProvider routeBlock={block}>
      <div className="bp hinge">
        <div className="bp__id">
          <Link to="/projects/golden-residence" prefetch="intent" className="link bp__back">
            {BACK}
            Към Golden Residence
          </Link>
          <h1 className="bp__title">
            Golden Residence, блок&nbsp;<em>{block}</em>
          </h1>
        </div>
        <div>
          <p className="bp__facts">{FACTS}</p>
        </div>
        <Seam />
      </div>
      <ExplorerSection initialBlock={block} />
      <InquirySection page="golden-residence" />
    </ExplorerProvider>
  )
}
