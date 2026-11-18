import { matchedBlock } from '../config/blocks'
import mnNight from '../data/images/mn-night.json'
import MnBlockPage from '../pages/mnogofamilna/MnBlockPage'
import { pageMeta } from '../seo/meta'
import BlockRoute from './BlockRoute'
import { notFoundMeta } from './notFoundMeta'

// The page of one block of the Многофамилна жилищна сграда, its floors as a
// ledger beside the block's night facade (spec M3 §6.5;
// src/pages/mnogofamilna/MnBlockPage.jsx). src/routes.js routes each block's
// own path here (no `:block` param), with the path as the route's id, so the
// matched route names the block; a route that names none is the 404 page
// (BlockRoute).
const PROJECT = 'mnogofamilna-sgrada'

// How the site's shell frames this page (src/shell/handle.js; ruling PF11):
// below the solid header, a page of the project, with the inquiry the
// header's „Запитване“ goes to.
export const handle = { header: 'solid', project: PROJECT, inquiry: true }

// The page's head (root.jsx <Meta/>): the block's title (spec M3 §6.5), and
// production's description pattern. Its share image is the building lit at
// night, as its facade shows it (spec M3/M4 §11, ruling PF18; mn-dusk's og).
export const meta = ({ matches }) => {
  const block = matchedBlock(PROJECT, matches)
  if (!block) return notFoundMeta()
  const { id, letter } = block
  return pageMeta({
    title: `Многофамилна сграда, блок ${letter} - KSM Stroy`,
    description: `Етажите и апартаментите на многофамилната жилищна сграда в ж.к. Връбница-1, гр. София, блок ${letter}: 72 апартамента на 9 етажа.`,
    path: `/projects/${PROJECT}/${id}`,
    image: mnNight['mn-dusk'].og,
  })
}

export default function MnogofamilnaBlockPage() {
  return <BlockRoute project={PROJECT} render={(block) => <MnBlockPage block={block.letter} />} />
}
