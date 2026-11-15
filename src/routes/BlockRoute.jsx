import { useMatches } from 'react-router'
import { matchedBlock } from '../config/blocks'
import NotFound from './not-found'

// The block of `project` a block page's route names, for the page `render`
// makes of it (`render(block)`, block being { id, letter, label } from
// src/config/blocks.js), or the 404 page. src/routes.js routes each block's
// own path to its project's block module, with the path as the route's id,
// so the matched route names the block (matchedBlock), never the address. A
// route that names none (src/routes.js would have to change) is the 404
// page. Both projects' block modules share it.
export default function BlockRoute({ project, render }) {
  const block = matchedBlock(project, useMatches())
  return block ? render(block) : <NotFound />
}
