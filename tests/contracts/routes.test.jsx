import { screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { goOffline, pageText, renderSiteAt } from './site'

// Production contract (main @151c060): every URL the site serves today keeps
// rendering its page, under the same address.
//
// The one exception is /projects/:id. On main, /projects/1 to /projects/12
// show placeholder projects that KSM Stroy never built; the redesign removes
// them and sends their URLs to /projects instead.

// "Блок А" / "БЛОК A" (Cyrillic or Latin letter), but not the word "блока".
const BLOCK_A = /блок\s+[аa](?![а-яёa-z])/i
const BLOCK_B = /блок\s+[бb](?![а-яёa-z])/i

const ROUTES = [
  { path: '/', shows: [/BG16RFPR001-1\.012-1485-C01/] },
  { path: '/about', shows: [/основана през месец септември 2008/i] },
  { path: '/projects', shows: [/Golden Residence/i, /Многофамилна/i] },
  { path: '/projects/golden-residence', shows: [/Golden Residence/i, BLOCK_A, BLOCK_B] },
  { path: '/projects/golden-residence/block-a', shows: [/Golden Residence/i, BLOCK_A] },
  { path: '/projects/golden-residence/block-b', shows: [/Golden Residence/i, BLOCK_B] },
  { path: '/projects/mnogofamilna-sgrada', shows: [/Многофамилна/i, BLOCK_A, BLOCK_B] },
  { path: '/projects/mnogofamilna-sgrada/block-a', shows: [/Многофамилна/i, BLOCK_A] },
  { path: '/projects/mnogofamilna-sgrada/block-b', shows: [/Многофамилна/i, BLOCK_B] },
  { path: '/blog', shows: [/Айвазовски Парк/i] },
]

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
    for (const text of shows) expect(pageText()).toMatch(text)
  }, { timeout: 15000 })
  expect(window.location.pathname).toBe(path)
}, 30000)

it('/contact renders the inquiry form', async () => {
  renderSiteAt('/contact')

  expect(await screen.findByRole('textbox', { name: /съобщение/i }, { timeout: 15000 })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /изпрати/i })).toBeInTheDocument()
  expect(window.location.pathname).toBe('/contact')
}, 30000)

// The redirect replaces the history entry, so Back does not land on the old
// URL and bounce straight back to /projects.
it.each(['/projects/1', '/projects/12'])('%s redirects to /projects', async (path) => {
  const entries = window.history.length
  renderSiteAt(path)

  await waitFor(() => {
    expect(window.location.pathname).toBe('/projects')
    expect(pageText()).toMatch(/Golden Residence/i)
    expect(pageText()).toMatch(/Многофамилна/i)
  }, { timeout: 15000 })
  expect(window.history.length).toBe(entries)
}, 30000)
