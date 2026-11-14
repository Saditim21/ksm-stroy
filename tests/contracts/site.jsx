import { render } from '@testing-library/react'
import { createMemoryRouter, createPath, RouterProvider } from 'react-router'
import { vi } from 'vitest'
import App, { ErrorBoundary, HydrateFallback } from '../../src/root'
import routes from '../../src/routes'

// Helpers for the contract tests that open the whole site, not one component.

// The site's modules by path. src/routes.js names each route's file relative
// to src/, the way React Router's build resolves it. Test files are not part
// of the site.
const modules = import.meta.glob(['/src/**/*.jsx', '!/src/**/*.test.jsx'], { eager: true })

// One entry of src/routes.js as the route the browser runs: the module's page,
// with its clientLoader as the loader.
function toRoute({ path, index, file, children }) {
  const module = modules[`/src/${file}`]
  if (!module) throw new Error(`src/routes.js names ${file}, which is not a .jsx module under src/`)
  return {
    path,
    index,
    Component: module.default,
    loader: module.clientLoader,
    HydrateFallback: module.HydrateFallback,
    ErrorBoundary: module.ErrorBoundary,
    children: children?.map(toRoute),
  }
}

// Opens `path` the way a visitor does: the real route table under the root
// route's App, the site's shell and providers. (root.jsx's Layout, the <html>
// document around them, is jsdom's own document here.)
//
// The address bar follows the router, as a browser's does: a navigation adds a
// history entry, a redirect that replaces the entry (/projects/1) does not.
export function renderSiteAt(path) {
  window.history.replaceState(null, '', path)
  const router = createMemoryRouter(
    [{ path: '/', Component: App, HydrateFallback, ErrorBoundary, children: routes.map(toRoute) }],
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
  return render(<RouterProvider router={router} />)
}

// No network: every fetch fails, so the apartment availability falls back to
// the data built into the site (src/test/setup.js already blanks the sheet
// URLs). The sheets service reports the fallback on console.log; mute it.
export function goOffline() {
  vi.stubGlobal('fetch', vi.fn(async () => {
    throw new TypeError('Failed to fetch (tests run offline)')
  }))
  vi.spyOn(console, 'log').mockImplementation(() => {})
}

// All the text on the page with whitespace collapsed. It ignores the markup,
// so a redesign that keeps the words keeps these tests green.
export const pageText = () => document.body.textContent.replace(/\s+/g, ' ')
