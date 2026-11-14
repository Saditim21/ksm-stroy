// @vitest-environment node
import fs from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { createMemoryRouter } from 'react-router'
import { clientRoutesCaseSensitive, keepCaseSensitive } from './client-routes-case.mjs'

// React Router 8.5.1's browser routes drop `caseSensitive` (see
// client-routes-case.mjs); the production build copies it back.

// The installed React Router's createClientRoutes(), in both its builds.
const packageDir = path.dirname(createRequire(import.meta.url).resolve('react-router/package.json'))
const clientRoutesSource = (build) => fs.readFileSync(path.join(packageDir, 'dist', build, 'lib', 'dom', 'ssr', 'routes.js'), 'utf8')

describe('keepCaseSensitive', () => {
  it.each(['production', 'development'])('copies caseSensitive onto each client route in the installed %s build', (build) => {
    const source = clientRoutesSource(build)
    // The client route as React Router creates it: id, index and path only.
    expect(source).toMatch(/let dataRoute = \{\s*id: route\.id,\s*index: route\.index,\s*path: route\.path\s*\};/)

    expect(keepCaseSensitive(source)).toMatch(/let dataRoute = \{\s*id: route\.id,\s*index: route\.index,\s*path: route\.path, caseSensitive: route\.caseSensitive\s*\};/)
  })

  it('fails when the code it patches has changed, rather than leave the routes caseless', () => {
    expect(() => keepCaseSensitive('let dataRoute = { id: route.id, path: route.path };')).toThrow(/createClientRoutes/)
  })

  // What the flag does once the browser's routes carry it.
  it('makes the router match a path by its case', () => {
    const router = (caseSensitive) => createMemoryRouter(
      [{ path: 'about', caseSensitive, Component: () => null }, { path: '*', Component: () => null }],
      { initialEntries: ['/About'] },
    )
    expect(router(undefined).state.matches.at(-1).route.path).toBe('about')
    expect(router(true).state.matches.at(-1).route.path).toBe('*')
  })
})

describe('the plugin', () => {
  const plugin = clientRoutesCaseSensitive()
  const inClient = { environment: { name: 'client' }, error: (message) => { throw new Error(message) } }

  it('runs in the production build only', () => {
    expect(plugin.apply).toBe('build')
  })

  it('patches React Router\'s client routes module and leaves every other module alone', () => {
    const id = path.join(packageDir, 'dist', 'production', 'lib', 'dom', 'ssr', 'routes.js')
    expect(plugin.transform.call(inClient, clientRoutesSource('production'), id).code).toContain('caseSensitive: route.caseSensitive')
    expect(plugin.transform.call(inClient, 'export const x = 1', path.join(packageDir, 'dist', 'production', 'index.js'))).toBeNull()
  })

  it('fails a client build that never reached that module', () => {
    expect(() => clientRoutesCaseSensitive().generateBundle.call(inClient)).toThrow(/never reached/)
    expect(() => clientRoutesCaseSensitive().generateBundle.call({ ...inClient, environment: { name: 'ssr' } })).not.toThrow()
  })
})
