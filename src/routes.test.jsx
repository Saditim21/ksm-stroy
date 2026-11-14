import { screen } from '@testing-library/react'
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

// Each block page's head names its block, with the canonical link to its own
// path, whether the path ends in a slash (the prerender asks for /…/block-b/)
// or not (the browser).
it.each([
  [goldenResidenceBlock, '/projects/golden-residence/block-a', 'Golden Residence, блок А - KSM Stroy'],
  [goldenResidenceBlock, '/projects/golden-residence/block-b/', 'Golden Residence, блок Б - KSM Stroy'],
  [mnogofamilnaBlock, '/projects/mnogofamilna-sgrada/block-a/', 'Многофамилна жилищна сграда, блок А - KSM Stroy'],
  [mnogofamilnaBlock, '/projects/mnogofamilna-sgrada/block-b', 'Многофамилна жилищна сграда, блок Б - KSM Stroy'],
])('the head of %#: %s', (module, pathname, title) => {
  const head = module.meta({ location: { pathname } })

  expect(head).toContainEqual({ title })
  expect(head).toContainEqual({ tagName: 'link', rel: 'canonical', href: `https://www.ksmstroy.com${pathname.replace(/\/$/, '')}` })
})
