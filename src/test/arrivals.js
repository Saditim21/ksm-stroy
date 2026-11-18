import { render } from '@testing-library/react'
import { createElement } from 'react'
import { createMemoryRouter, createPath, RouterProvider } from 'react-router'
import App, { ErrorBoundary, HydrateFallback } from '../root'

// How a test's page arrives, for what lands only on an arrival afresh
// (src/shell/landingHold.js: useFreshArrival).

// The browser's account of how it loaded the document, its Navigation Timing
// entry's type ('navigate', 'reload' or 'back_forward'), which jsdom does not
// keep. Returns its undo.
export function loadedBy(type) {
  const own = Object.getOwnPropertyDescriptor(performance, 'getEntriesByType')
  Object.defineProperty(performance, 'getEntriesByType', {
    configurable: true,
    writable: true,
    value: (kind) => (kind === 'navigation' ? [{ type }] : []),
  })
  return () => {
    if (own) Object.defineProperty(performance, 'getEntriesByType', own)
    else delete performance.getEntriesByType
  }
}

// The site's shell (src/root.jsx's App) around `pages`, routes of the test's
// own choosing, opened at `path` in a memory router the test keeps, so that
// it can go Back and Forward (router.navigate(-1)), which renderSiteAt's
// (tests/contracts/site.jsx) cannot. The address bar follows the router, as
// renderSiteAt's does: a link adds a history entry; Back, Forward and a
// redirect move the one on screen. Returns the router with render()'s
// result.
export function renderPagesAt(path, pages) {
  window.history.replaceState(null, '', path)
  const router = createMemoryRouter(
    [{ path: '/', Component: App, HydrateFallback, ErrorBoundary, children: pages }],
    { initialEntries: [path] },
  )
  let shown = path
  router.subscribe(({ location, historyAction }) => {
    const next = createPath(location)
    if (next === shown) return
    shown = next
    if (historyAction === 'PUSH') window.history.pushState(null, '', next)
    else window.history.replaceState(null, '', next)
  })
  return { router, ...render(createElement(RouterProvider, { router })) }
}

// A route module (src/routes/*.jsx) as a route of renderPagesAt's at `path`.
export const pageOf = (path, module) => ({ path, Component: module.default, handle: module.handle })
