import { useLocation } from 'react-router'
import GoldenResidenceSingleBlock from '../components/GoldenResidenceSingleBlock'
import { blockAt } from '../config/blocks'
import { pageMeta } from '../seo/meta'

// The page of one Golden Residence block, the legacy page until M2 rebuilds
// it. src/routes.js routes each block's own path here (no `:block` param), so
// the path names the block.
const PROJECT = 'golden-residence'

// How the site's shell frames this page (src/shell/handle.js).
export const handle = { header: 'solid', project: PROJECT, object: 'Golden Residence' }

// The page's head (root.jsx <Meta/>).
export const meta = ({ location }) => {
  const { id, letter } = blockAt(PROJECT, location.pathname)
  return pageMeta({
    title: `Golden Residence, блок ${letter} - KSM Stroy`,
    description: `Етажите и апартаментите на Golden Residence, блок ${letter}: 96 апартамента на 8 етажа в жк Левски Г, гр. София.`,
    path: `/projects/${PROJECT}/${id}`,
  })
}

export default function GoldenResidenceBlockPage() {
  return <GoldenResidenceSingleBlock block={blockAt(PROJECT, useLocation().pathname).id} />
}
