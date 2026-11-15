import { useMatches } from 'react-router'
import GoldenResidenceSingleBlock from '../components/GoldenResidenceSingleBlock'
import { matchedBlock } from '../config/blocks'
import { ApartmentProvider } from '../context/ApartmentContext'
import { pageMeta } from '../seo/meta'
import NotFound, { meta as notFoundMeta } from './not-found'

// The page of one Golden Residence block, the legacy page until M2 rebuilds
// it. src/routes.js routes each block's own path here (no `:block` param),
// with the path as the route's id, so the matched route names the block. A
// route that names none (src/routes.js would have to change) is the 404 page.
const PROJECT = 'golden-residence'

// How the site's shell frames this page (src/shell/handle.js).
export const handle = { header: 'solid', project: PROJECT, legacy: true }

// The page's head (root.jsx <Meta/>).
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

// The legacy block page reads the sheets through ApartmentContext, which only
// it still needs (src/root.jsx): the provider is its own.
export default function GoldenResidenceBlockPage() {
  const block = matchedBlock(PROJECT, useMatches())
  if (!block) return <NotFound />
  return (
    <ApartmentProvider>
      <GoldenResidenceSingleBlock block={block.id} />
    </ApartmentProvider>
  )
}
