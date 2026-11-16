// Loads the full facade's surfaces (surfaces.js), once, for every facade on
// the page and every later visit to it; given a project, its floor plans too
// (project.plans, the chunk project.loadPlans() loads, or both: plans.js), so
// a surface that draws a plan always has it whole, and only that project's
// plans ever load on its pages.

let loaded = null
let loading = null

/** The surfaces' module once it, and `project`'s plans, whole, have loaded;
 * else null. */
export const loadedSurfaces = (project) => (loaded?.hasPlans(project) ? loaded : null)

/** Loads the surfaces, once, then `project`'s plans, when one is given; a
 * failed load may be tried again. */
export function loadSurfaces(project) {
  loading ??= import('./surfaces').then(
    (module) => {
      loaded = module
      return module
    },
    (error) => {
      loading = null
      throw error
    },
  )
  return project ? loading.then((module) => module.loadPlans(project).then(() => module)) : loading
}
