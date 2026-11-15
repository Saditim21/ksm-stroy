import { matchedBlock } from '../config/blocks'
import BlockPage from '../explorer/BlockPage'
import { pageMeta } from '../seo/meta'
import BlockRoute from './BlockRoute'
import { meta as notFoundMeta } from './not-found'

// The page of one Golden Residence block, the explorer on that block (spec
// §7.11, §8.3; src/explorer/BlockPage.jsx). src/routes.js routes each block's
// own path here (no `:block` param), with the path as the route's id, so the
// matched route names the block; a route that names none is the 404 page
// (BlockRoute).
const PROJECT = 'golden-residence'

// How the site's shell frames this page (src/shell/handle.js): below the solid
// header, a page of the project, with the inquiry the header's „Запитване“
// goes to.
export const handle = { header: 'solid', project: PROJECT, inquiry: true }

// The page's head (root.jsx <Meta/>), as M1 set it.
export const meta = ({ matches }) => {
  const block = matchedBlock(PROJECT, matches)
  if (!block) return notFoundMeta()
  const { id, letter } = block
  return pageMeta({
    title: `Golden Residence, блок ${letter} - KSM Stroy`,
    description: `Етажите и апартаментите на Golden Residence, блок ${letter}: 96 апартамента на 8 етажа в жк Левски Г, гр. София.`,
    path: `/projects/${PROJECT}/${id}`,
  })
}

export default function GoldenResidenceBlockPage() {
  return <BlockRoute project={PROJECT} render={(block) => <BlockPage block={block.letter} />} />
}
