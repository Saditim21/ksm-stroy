import { useMatches } from 'react-router'
import MnogofamilnaSingleBlock from '../components/MnogofamilnaSingleBlock'
import { matchedBlock } from '../config/blocks'
import { pageMeta } from '../seo/meta'
import NotFound, { meta as notFoundMeta } from './not-found'

// The page of one block of the Многофамилна жилищна сграда, the legacy page
// until M2 rebuilds it. src/routes.js routes each block's own path here (no
// `:block` param), with the path as the route's id, so the matched route names
// the block. A route that names none (src/routes.js would have to change) is
// the 404 page.
const PROJECT = 'mnogofamilna-sgrada'

// How the site's shell frames this page (src/shell/handle.js).
export const handle = { header: 'solid', project: PROJECT, object: 'Многофамилна жилищна сграда', legacy: true }

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
  const block = matchedBlock(PROJECT, useMatches())
  return block ? <MnogofamilnaSingleBlock block={block.id} /> : <NotFound />
}
