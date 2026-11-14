import { useLocation } from 'react-router'
import MnogofamilnaSingleBlock from '../components/MnogofamilnaSingleBlock'
import { blockAt } from '../config/blocks'
import { pageMeta } from '../seo/meta'

// The page of one block of the Многофамилна жилищна сграда, the legacy page
// until M2 rebuilds it. src/routes.js routes each block's own path here (no
// `:block` param), so the path names the block.
const PROJECT = 'mnogofamilna-sgrada'

// How the site's shell frames this page (src/shell/handle.js).
export const handle = { header: 'solid', project: PROJECT, object: 'Многофамилна жилищна сграда' }

// The page's head (root.jsx <Meta/>).
export const meta = ({ location }) => {
  const { id, letter } = blockAt(PROJECT, location.pathname)
  return pageMeta({
    title: `Многофамилна жилищна сграда, блок ${letter} - KSM Stroy`,
    description: `Етажите и апартаментите на многофамилната жилищна сграда в ж.к. Връбница-1, гр. София, блок ${letter}: 72 апартамента на 9 етажа.`,
    path: `/projects/${PROJECT}/${id}`,
  })
}

export default function MnogofamilnaBlockPage() {
  return <MnogofamilnaSingleBlock block={blockAt(PROJECT, useLocation().pathname).id} />
}
