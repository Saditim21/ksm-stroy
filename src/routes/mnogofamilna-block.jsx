import MnogofamilnaSingleBlock from '../components/MnogofamilnaSingleBlock'
import { matchedBlock } from '../config/blocks'
import { pageMeta } from '../seo/meta'
import BlockRoute from './BlockRoute'
import { meta as notFoundMeta } from './not-found'

// The page of one block of the Многофамилна жилищна сграда, the legacy page
// until M3 rebuilds it. src/routes.js routes each block's own path here (no
// `:block` param), with the path as the route's id, so the matched route names
// the block; a route that names none is the 404 page (BlockRoute).
const PROJECT = 'mnogofamilna-sgrada'

// How the site's shell frames this page (src/shell/handle.js).
export const handle = { header: 'solid', project: PROJECT, legacy: true }

// The page's head (root.jsx <Meta/>).
export const meta = ({ matches }) => {
  const block = matchedBlock(PROJECT, matches)
  if (!block) return notFoundMeta()
  const { id, letter } = block
  return pageMeta({
    title: `Многофамилна жилищна сграда, блок ${letter} - KSM Stroy`,
    description: `Етажите и апартаментите на многофамилната жилищна сграда в ж.к. Връбница-1, гр. София, блок ${letter}: 72 апартамента на 9 етажа.`,
    path: `/projects/${PROJECT}/${id}`,
  })
}

export default function MnogofamilnaBlockPage() {
  return <BlockRoute project={PROJECT} render={(block) => <MnogofamilnaSingleBlock block={block.id} />} />
}
