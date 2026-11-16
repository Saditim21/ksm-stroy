import { lazy, Suspense } from 'react'
import { useMatches } from 'react-router'
import { matchedBlock } from '../config/blocks'

// The 404 page, for a route that names no block: a chunk loaded only then, so
// it never travels with a block page's first-load JS (spec §10).
const NotFound = lazy(() => import('./not-found'))

// The block of `project` a block page's route names, for the page `render`
// makes of it (`render(block)`, block being { id, letter, label } from
// src/config/blocks.js), or the 404 page. src/routes.js routes each block's
// own path to its project's block module, with the path as the route's id,
// so the matched route names the block (matchedBlock), never the address. A
// route that names none (src/routes.js would have to change) is the 404
// page, which shows once its chunk is in. Both projects' block modules share
// it.
export default function BlockRoute({ project, render }) {
  const block = matchedBlock(project, useMatches())
  if (block) return render(block)
  return (
    <Suspense>
      <NotFound />
    </Suspense>
  )
}
