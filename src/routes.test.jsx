import { render, screen, waitFor } from '@testing-library/react'
import { createMemoryRouter, matchRoutes, RouterProvider } from 'react-router'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import config from '../react-router.config.js'
import { goOffline, mainText, renderSiteAt } from '../tests/contracts/site'
import routes from './routes'
import * as goldenResidenceBlock from './routes/golden-residence-block'
import * as mnogofamilnaBlock from './routes/mnogofamilna-block'

// The route table (src/routes.js) against what the host serves (vercel.json):
// a prerendered page only at its exact path, case included, and the 404 page
// for anything else. The browser's router must agree. Where it matches a page
// the host did not serve, React keeps the prerendered HTML as a dead copy and
// renders the live page beside it.

const NOT_FOUND = 'Тази страница я няма в чертежа.'
const BLOCK_PAGE = /^\/?projects\/[^/]+\/[^/]+$/

beforeEach(() => {
  goOffline()
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

it('matches every path by its case, as the host looks files up', () => {
  const caseless = routes.filter(({ path, caseSensitive }) => path !== undefined && caseSensitive !== true)
  expect(caseless.map(({ path }) => path)).toEqual([])
})

it('routes exactly the block pages it prerenders, each by its own path', () => {
  const routed = routes.filter(({ path }) => BLOCK_PAGE.test(path ?? '')).map(({ path }) => `/${path}`)

  expect(routed).toEqual([
    '/projects/golden-residence/block-a',
    '/projects/golden-residence/block-b',
    '/projects/mnogofamilna-sgrada/block-a',
    '/projects/mnogofamilna-sgrada/block-b',
  ])
  expect(config.prerender.filter((path) => BLOCK_PAGE.test(path))).toEqual(routed)
})

it.each([
  '/About',
  '/PROJECTS',
  '/projects/golden-residence/block-c',
  '/projects/golden-residence/Block-A',
  '/projects/mnogofamilna-sgrada/x',
])('%s, which the host answers with the 404 page, is the 404 page', async (path) => {
  renderSiteAt(path)

  expect(await screen.findByRole('heading', { name: NOT_FOUND }, { timeout: 15000 })).toBeInTheDocument()
  expect(mainText()).not.toMatch(/Golden Residence|Многофамилна|КСМ Строй ООД/)
}, 30000)

// A route module's head at `pathname`, as root.jsx's <Meta/> asks for it: with
// the location and the routes matched there, root first, each with its id.
// { caseSensitive: false } matches as the dev server's router does.
function headAt(module, pathname, { caseSensitive } = {}) {
  const table = caseSensitive === undefined ? routes : routes.map((entry) => ({ ...entry, caseSensitive }))
  const matches = matchRoutes([{ id: 'root', path: '/', children: table }], pathname)
    .map(({ route, params, pathname: matched }) => ({ id: route.id, params, pathname: matched }))
  return module.meta({ location: { pathname }, params: matches.at(-1).params, matches })
}

// Each block page's head names its block, with the canonical link to its own
// path, whether the path ends in a slash (the prerender asks for /…/block-b/)
// or not (the browser).
it.each([
  [goldenResidenceBlock, '/projects/golden-residence/block-a', 'Golden Residence, блок А - KSM Stroy'],
  [goldenResidenceBlock, '/projects/golden-residence/block-b/', 'Golden Residence, блок Б - KSM Stroy'],
  [mnogofamilnaBlock, '/projects/mnogofamilna-sgrada/block-a/', 'Многофамилна жилищна сграда, блок А - KSM Stroy'],
  [mnogofamilnaBlock, '/projects/mnogofamilna-sgrada/block-b', 'Многофамилна жилищна сграда, блок Б - KSM Stroy'],
])('the head of %#: %s', (module, pathname, title) => {
  const head = headAt(module, pathname)

  expect(head).toContainEqual({ title })
  expect(head).toContainEqual({ tagName: 'link', rel: 'canonical', href: `https://www.ksmstroy.com${pathname.replace(/\/$/, '')}` })
})

// The dev server's router matches without regard to case (src/routes.js), so
// there a block's path in another case is that block's route. The page and its
// head take the block from the route, never from the address.
it.each([
  {
    module: goldenResidenceBlock,
    path: '/projects/golden-residence/Block-A',
    shows: ['Golden Residence', 'блок А'],
    title: 'Golden Residence, блок А - KSM Stroy',
    canonical: '/projects/golden-residence/block-a',
  },
  {
    module: mnogofamilnaBlock,
    path: '/projects/mnogofamilna-sgrada/BLOCK-B',
    shows: ['Многофамилна сграда', 'БЛОК B'],
    title: 'Многофамилна жилищна сграда, блок Б - KSM Stroy',
    canonical: '/projects/mnogofamilna-sgrada/block-b',
  },
])('under the dev server, $path shows its block, with its head', async ({ module, path, shows, title, canonical }) => {
  renderSiteAt(path, { caseSensitive: false })

  await waitFor(() => {
    for (const text of shows) expect(mainText()).toContain(text)
  }, { timeout: 15000 })
  expect(screen.queryByRole('heading', { name: 'Възникна грешка' })).not.toBeInTheDocument()

  const head = headAt(module, path, { caseSensitive: false })
  expect(head).toContainEqual({ title })
  expect(head).toContainEqual({ tagName: 'link', rel: 'canonical', href: `https://www.ksmstroy.com${canonical}` })
}, 30000)

// A route whose id names no block of the page's project shows the 404 page,
// with its head, and never throws.
it.each([
  { module: goldenResidenceBlock, project: 'golden-residence', id: 'projects/golden-residence/block-c' },
  { module: mnogofamilnaBlock, project: 'mnogofamilna-sgrada', id: 'projects/golden-residence/block-a' },
])('the $project block page under the route id $id is the 404 page', async ({ module, id }) => {
  expect(module.meta({ location: { pathname: '/x' }, params: {}, matches: [{ id: 'root' }, { id }] }))
    .toContainEqual({ title: 'Страницата не е намерена - KSM Stroy' })

  const router = createMemoryRouter([{ id, path: '/x', Component: module.default }], { initialEntries: ['/x'] })
  render(<RouterProvider router={router} />)
  expect(await screen.findByRole('heading', { name: NOT_FOUND })).toBeInTheDocument()
})
