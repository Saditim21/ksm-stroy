import { render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { goOffline, renderSiteAt } from './site'

// /dev/tracer is the polygon tracer for the explorer maps (src/data/maps), a
// tool for whoever edits the maps. src/App.jsx routes it only when
// import.meta.env.DEV is true, so the dev server has it and ksmstroy.com does
// not. scripts/check-dist.mjs fails the build check if it reaches dist/.

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
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
  vi.stubEnv('DEV', false)
  vi.resetModules()
  const { default: App } = await import('../../src/App')

  window.history.replaceState(null, '', '/dev/tracer')
  render(<App />)

  // React Router reports a URL that matches no route.
  await waitFor(() => {
    expect(warn.mock.calls.flat().join(' ')).toMatch(/No routes matched location "\/dev\/tracer"/)
  }, { timeout: 15000 })
  expect(screen.queryByText(/Изберете изображение/)).not.toBeInTheDocument()
}, 30000)
