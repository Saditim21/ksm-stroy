import InquirySection from '../components/inquiry/InquirySection'
import { availabilityPreload } from '../data/availability/useAvailability'
import { ExplorerProvider } from '../explorer/ExplorerContext'
import { MN_PROJECT } from '../explorer/projects/mn'
import { MN_INQUIRY } from '../pages/mnogofamilna/inquiry'
import MnHero from '../pages/mnogofamilna/MnHero'
import MnList from '../pages/mnogofamilna/MnList'
import { pageMeta } from '../seo/meta'
import { preloadWithDocument } from '../utils/documentPreloads'
import { DISPLAY_FONT_PRELOADS } from '../utils/fontLinks'
import '../pages/mnogofamilna/mn.css'

// The Многофамилна page, /projects/mnogofamilna-sgrada (spec M3 §6): it opens
// on its explorer, the night facade whose floors with free apartments are
// lit (MnHero.jsx); then all 144 apartments in a list of their own
// (MnList.jsx); and the inquiry, in Многофамилна's words and with its
// subjects, Многофамилна first and chosen (MN_INQUIRY). Its numbers are the
// dated snapshot of 01.12.2025 until its own sheets are live (projects/mn.js).
// The explorer's provider, Многофамилна's (MN_PROJECT), wraps every section:
// it reads a deep link to a floor, a unit or the list (?floor=Б-5,
// ?unit=А-802, ?view=list) once the page has hydrated, and renders the plan
// stage and the unit panel over the page (src/explorer/ExplorerContext.jsx).

// How the site's shell frames this page (src/shell/handle.js; ruling PF11):
// below the solid header, a page of the project, with the inquiry the
// header's „Запитване“ goes to.
export const handle = { header: 'solid', project: 'mnogofamilna-sgrada', inquiry: true }

// The availability API, which the store reads for its live rows once they
// exist, and both display faces, which the title sets in the first
// viewport: preloaded with the document the page is first loaded as, never
// again on a client-side visit (ruling C5.4, src/utils/documentPreloads.js).
// The night render, the page's first picture, is in the HTML, fetched first.
const PRELOADS = [availabilityPreload, ...DISPLAY_FONT_PRELOADS]

// The page's head (root.jsx <Meta/>): production's title and description
// (spec M3 §6.1). Its share image is the site's for now (ruling PF18).
export const meta = () => pageMeta({
  title: 'Многофамилна жилищна сграда - KSM Stroy',
  description: 'Многофамилна жилищна сграда в ж.к. Връбница-1, гр. София: блок А и блок Б, по 72 апартамента на 9 етажа.',
  path: '/projects/mnogofamilna-sgrada',
})

export default function Mnogofamilna() {
  preloadWithDocument(PRELOADS)
  return (
    <ExplorerProvider project={MN_PROJECT} routeBlock={null}>
      <MnHero />
      <MnList />
      <InquirySection page="mnogofamilna" {...MN_INQUIRY} />
    </ExplorerProvider>
  )
}
