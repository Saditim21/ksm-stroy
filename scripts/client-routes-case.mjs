// React Router 8.5.1 builds the browser's routes from the route manifest
// without their `caseSensitive` flag: createClientRoutes() in
// react-router/dist/*/lib/dom/ssr/routes.js copies a route's id, index and
// path only, while its server routes (the prerender) keep the flag. In the
// browser every route then matched any case: /About matched `about`
// (src/routes.js asks for case-sensitive routes), while the host answers
// /About with the 404 page, so the router waited for a page the HTML is not
// and React's hydration failed (#418).
//
// clientRoutesCaseSensitive(), a Vite plugin for the production build, puts
// the flag back on each client route. It fails the build when React Router's
// code no longer has the shape it patches, and when the client build never
// reached that code, so an upgrade cannot drop the fix without a word. The
// dev server keeps React Router's own matching.

// The module that holds createClientRoutes(), in either build of the package.
const CLIENT_ROUTES_MODULE = /[\\/]react-router[\\/]dist[\\/](?:production|development)[\\/]lib[\\/]dom[\\/]ssr[\\/]routes\.js(?:\?.*)?$/

// The client route it creates, before its components and handlers are added.
const CLIENT_ROUTE = /let dataRoute = \{\s*id: route\.id,\s*index: route\.index,\s*path: route\.path\s*\};/

// createClientRoutes()'s source with `caseSensitive` copied onto each route.
export function keepCaseSensitive(code) {
  if (!CLIENT_ROUTE.test(code)) {
    throw new Error('client-routes-case: React Router\'s createClientRoutes() no longer creates `let dataRoute = { id, index, path }`; check whether it keeps `caseSensitive` now and update or remove scripts/client-routes-case.mjs')
  }
  return code.replace(CLIENT_ROUTE, (literal) => literal.replace('path: route.path', 'path: route.path, caseSensitive: route.caseSensitive'))
}

export function clientRoutesCaseSensitive() {
  const patchedIn = new Set()
  return {
    name: 'ksm-client-routes-case-sensitive',
    apply: 'build',
    transform(code, id) {
      if (!CLIENT_ROUTES_MODULE.test(id)) return null
      patchedIn.add(this.environment?.name ?? 'client')
      return { code: keepCaseSensitive(code), map: null }
    },
    generateBundle() {
      const environment = this.environment?.name ?? 'client'
      if (environment === 'client' && !patchedIn.has(environment)) {
        this.error('client-routes-case: the client build never reached React Router\'s createClientRoutes(); its routes would match any case')
      }
    },
  }
}
