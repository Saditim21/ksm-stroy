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

// The path of each block's page in `project`, without the leading slash, as
// src/routes.js writes paths: projects/<project>/<block>.
export const blockPaths = (project) => PROJECT_BLOCKS[project].map(({ id }) => `projects/${project}/${id}`)

// The block whose page `pathname` is, by its last segment (a trailing slash
// aside: the prerender asks for /projects/golden-residence/block-a/).
// src/routes.js routes only these paths to a block page.
export function blockAt(project, pathname) {
  const id = pathname.replace(/\/+$/, '').split('/').pop()
  const block = PROJECT_BLOCKS[project].find((candidate) => candidate.id === id)
  if (!block) throw new Error(`${pathname} is not a block of ${project}`)
  return block
}
