// Each project's blocks: the one list the block pages' routes (src/routes.js),
// the prerendered paths (react-router.config.js) and the project data
// (src/config/projects.js) read. It imports nothing, because React Router
// loads src/routes.js and react-router.config.js at build time, and the smoke
// run and scripts/postbuild.mjs import react-router.config.js in plain Node.
export const PROJECT_BLOCKS = {
  'golden-residence': [
    { id: 'block-a', letter: 'А', label: 'Блок А' },
    { id: 'block-b', letter: 'Б', label: 'Блок Б' },
  ],
  'mnogofamilna-sgrada': [
    { id: 'block-a', letter: 'А', label: 'Блок А' },
    { id: 'block-b', letter: 'Б', label: 'Блок Б' },
  ],
}

// The path of a block's page, without the leading slash, as src/routes.js
// writes paths: projects/<project>/<block>.
const blockPath = (project, id) => `projects/${project}/${id}`

// The path of each block's page in `project`.
export const blockPaths = (project) => PROJECT_BLOCKS[project].map(({ id }) => blockPath(project, id))

// The block of `project` whose page the matched routes are, by route id:
// src/routes.js gives each block's route the id of its path, and React Router
// hands the matched routes, ids included, to a page's `meta` and to
// useMatches(). Never by the address, which the dev server's router matches
// without regard to case (/projects/golden-residence/Block-A is block A's
// route there). Undefined, never an error, when no matched route is a block
// page of `project`.
export function matchedBlock(project, matches) {
  const ids = new Set(matches.map(({ id }) => id))
  return PROJECT_BLOCKS[project]?.find(({ id }) => ids.has(blockPath(project, id)))
}
