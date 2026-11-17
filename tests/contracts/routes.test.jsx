import { screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { ROUTES, goOffline, mainText, renderSiteAt } from './site'

// Production contract (main @151c060): every URL the site serves today keeps
// rendering its page, under the same address.
//
// The one exception is /projects/:id. On main, /projects/1 to /projects/12
// show placeholder projects that KSM Stroy never built; the redesign removes
// them and sends their URLs to /projects instead.
//
// What a page shows is read from the page alone (mainText): the header and
// footer every page shares must not answer for it.

beforeEach(() => {
  goOffline()
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

it.each(ROUTES)('$path renders its page', async ({ path, shows }) => {
  renderSiteAt(path)

  await waitFor(() => {
    for (const text of shows) expect(mainText()).toMatch(text)
  }, { timeout: 15000 })
  expect(window.location.pathname).toBe(path)
}, 30000)

it('/contact renders the inquiry form', async () => {
  renderSiteAt('/contact')

  expect(await screen.findByRole('textbox', { name: /съобщение/i }, { timeout: 15000 })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Изпратете запитване' })).toBeInTheDocument()
  expect(window.location.pathname).toBe('/contact')
}, 30000)

// The redirect replaces the history entry, so Back does not land on the old
// URL and bounce straight back to /projects.
it.each(['/projects/1', '/projects/12'])('%s redirects to /projects', async (path) => {
  const entries = window.history.length
  renderSiteAt(path)

  await waitFor(() => {
    expect(window.location.pathname).toBe('/projects')
    expect(mainText()).toMatch(/Golden Residence/i)
    expect(mainText()).toMatch(/Многофамилна/i)
  }, { timeout: 15000 })
  expect(window.history.length).toBe(entries)
}, 30000)
