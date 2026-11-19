// @vitest-environment node
import { JSDOM } from 'jsdom'
import { renderToString } from 'react-dom/server'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { goOffline } from '../../../tests/contracts/site'
import App from '../../root'
import About, { handle } from '../../routes/about'

// The build prerenders За нас in Node, and that HTML is the final visual
// state until the JS runs (polish spec §4): the H1 over the wall, the story,
// the works, the legacy sections. Nothing in the opening is hidden by markup:
// what waits for the zoom (the full photograph, the line after it) waits in
// CSS, under the motion gate (about.css).

const PATH = '/about'
const routes = () => [{ path: '/', Component: App, children: [{ path: PATH.slice(1), Component: About, handle }] }]
const page = () => <RouterProvider router={createMemoryRouter(routes(), { initialEntries: [PATH] })} />
const prerender = () => renderToString(page()).replaceAll('<!-- -->', '')
const parse = (html) => new JSDOM(html).window.document
const textOf = (element) => element.textContent.replace(/\s+/g, ' ').trim()

beforeEach(() => {
  goOffline()
})
afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

it('renders with no window, as the build does', () => {
  expect(typeof window).toBe('undefined')
  expect(prerender()).toContain('реклама за майстора')
})

it('frames the page with the header over its opening, the wall', () => {
  expect(handle).toEqual({ header: 'overlay' })
})

it('prerenders one H1, the motto, in two lines that part at the seam', () => {
  const d = parse(prerender())
  const h1s = d.querySelectorAll('h1')
  expect(h1s).toHaveLength(1)
  expect(textOf(h1s[0])).toBe('Добрата работа – реклама за майстора')
  expect(textOf(h1s[0].querySelector('.wl__l'))).toBe('Добрата работа –')
  expect(textOf(h1s[0].querySelector('.wl__r'))).toBe('реклама за майстора')
})

it('prerenders the wall: 35 photographs, the eighteenth its centre', () => {
  const d = parse(prerender())
  const tiles = [...d.querySelectorAll('.wl__grid > .wl__t')]
  expect(tiles).toHaveLength(35)
  expect(tiles.findIndex((tile) => tile.classList.contains('wl__t--c'))).toBe(17)
  for (const tile of tiles) expect(tile.querySelector('img')).not.toBeNull()
  // The page's first paint is its words (the LCP): every tile is a small file
  // at the lowest priority, fetched as the browser lays out, never ahead of
  // them; the full-size photograph only the zoom shows is not in the page
  // until the zoom is ready (Wall.jsx), so it costs no first load, and never
  // covers the wall where the zoom cannot run.
  for (const img of d.querySelectorAll('.wl__grid img')) {
    expect(img.getAttribute('loading')).toBe('lazy')
    expect(img.getAttribute('fetchpriority')).toBe('low')
  }
  expect(d.querySelector('.wl__full img')).toBeNull()
  expect(d.querySelector('#top').classList.contains('dark')).toBe(true)
})

it('hides nothing in the opening by markup', () => {
  const top = parse(prerender()).querySelector('#top')
  for (const el of top.querySelectorAll('*')) {
    expect(el.hasAttribute('hidden'), el.className).toBe(false)
    expect(el.getAttribute('style') ?? '', el.className).not.toMatch(/opacity:\s*0|visibility:\s*hidden/)
  }
})

it('prerenders the story with the contract’s sentence, the seven works and the legacy sections', () => {
  const d = parse(prerender())
  expect(textOf(d.querySelector('#istoriya'))).toMatch(/основана през месец септември 2008/)
  expect(d.querySelectorAll('#obekti .trk__p')).toHaveLength(7)
  for (const id of ['uslugi', 'cennosti', 'misiya', 'rabota']) expect(d.getElementById(id), id).not.toBeNull()
})
