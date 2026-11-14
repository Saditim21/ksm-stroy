import { screen } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { goOffline, renderSiteAt } from './site'

// /dev/tracer is the polygon tracer for the explorer maps (src/data/maps), a
// tool for whoever edits the maps. src/routes.js routes it only when
// import.meta.env.DEV is true, so the dev server has it and ksmstroy.com does
// not. scripts/check-dist.mjs fails the build check if it reaches the build.

// vi.unstubAllEnvs() would also undo the blank sheet URLs of src/test/setup.js,
// so DEV is put back by hand.
const DEV = import.meta.env.DEV

beforeEach(() => {
  goOffline()
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  vi.stubEnv('DEV', DEV)
  vi.resetModules()
})

it('/dev/tracer opens the map tracer under the dev server', async () => {
  renderSiteAt('/dev/tracer')

  expect(await screen.findByText(/Изберете изображение/, undefined, { timeout: 15000 })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'draw' })).toBeInTheDocument()
}, 30000)

it('a production build has no /dev/tracer route', async () => {
  vi.stubEnv('DEV', false)
  vi.resetModules()
  const site = await import('./site')

  site.renderSiteAt('/dev/tracer')

  // The URL matches no page, so it shows the 404 page.
  expect(await screen.findByRole('heading', { name: 'Тази страница я няма в чертежа.' }, { timeout: 15000 })).toBeInTheDocument()
  expect(screen.queryByText(/Изберете изображение/)).not.toBeInTheDocument()
}, 30000)
