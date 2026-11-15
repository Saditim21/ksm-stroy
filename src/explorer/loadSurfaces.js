// Loads the full facade's surfaces (surfaces.js), once, for every facade on
// the page and every later visit to it.

let loaded = null
let loading = null

/** The surfaces' module once it has loaded, else null. */
export const loadedSurfaces = () => loaded

/** Loads the surfaces, once; a failed load may be tried again. */
export function loadSurfaces() {
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
  return loading
}
