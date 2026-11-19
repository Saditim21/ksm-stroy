// @vitest-environment node
import { JSDOM } from 'jsdom'
import { renderToString } from 'react-dom/server'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { goOffline } from '../../../tests/contracts/site'
import App from '../../root'
import Projects, { handle } from '../../routes/projects'

// The build prerenders Продажби in Node, where there is no window, and that
// HTML is the final visual state until the JS runs (polish spec §3): one H1,
// the two buildings with their pictures, Golden Residence's numbers „—“ until
// the store has its data and Многофамилна's from the dated snapshot; the
// floors of Golden Residence, every square neutral; the free apartments'
// filters; the closing. This file renders as the build does; the HTML is then
// only read. Its hydration is projects.hydration.test.jsx's.

const PATH = '/projects'
const routes = () => [{ path: '/', Component: App, children: [{ path: PATH.slice(1), Component: Projects, handle }] }]
const page = () => <RouterProvider router={createMemoryRouter(routes(), { initialEntries: [PATH] })} />
// React separates neighbouring text nodes with an empty comment.
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
  expect(prerender()).toContain('Продажби')
})

it('frames the page with the header over its opening', () => {
  expect(handle).toEqual({ header: 'overlay' })
})

describe('#top, the two buildings', () => {
  const doc = () => parse(prerender())

  it('prerenders one H1, „Продажби“, and both buildings by name, each on its picture', () => {
    const d = doc()
    expect([...d.querySelectorAll('h1')].map(textOf)).toEqual(['Продажби'])
    expect([...d.querySelectorAll('#top h2')].map(textOf)).toEqual(['Golden Residence', 'Многофамилна сграда'])
    const pictures = [...d.querySelectorAll('#top picture img')]
    expect(pictures.map((img) => img.getAttribute('alt'))).toEqual(['Golden Residence по здрач, визуализация', 'Многофамилна сграда по здрач, визуализация'])
    // Golden Residence's is the page's LCP, fetched first.
    expect(pictures[0].getAttribute('fetchpriority')).toBe('high')
    expect(pictures[1].getAttribute('loading')).toBe('eager')
  })

  it('keeps every half on its photograph dark in both themes', () => {
    for (const article of doc().querySelectorAll('.gw__half')) expect(article.classList.contains('dark')).toBe(true)
  })

  it('reads Golden Residence „—“ before its data, Многофамилна from its snapshot', () => {
    const d = doc()
    expect(textOf(d.querySelector('.gw__half--gr .gw__count'))).toMatch(/^— свободни апартамента от 192$/)
    expect(textOf(d.querySelector('.gw__half--mn .gw__count'))).toBe('16 свободни апартамента от 144, по данни към 01.12.2025')
    // Never a false zero before the data: its types read „—“.
    expect([...d.querySelectorAll('.gw__half--gr .gw__types b')].map(textOf)).toEqual(['—', '—', '—'])
  })

  it('is all there: nothing in the opening hidden by markup', () => {
    const top = doc().querySelector('#top')
    for (const el of top.querySelectorAll('*')) {
      expect(el.hasAttribute('hidden'), el.className).toBe(false)
      expect(el.getAttribute('style') ?? '', el.className).not.toMatch(/opacity:\s*0|visibility:\s*hidden/)
    }
  })
})

it('prerenders Golden Residence’s floors: sixteen rows, every square neutral until the data', () => {
  const ledger = parse(prerender()).querySelector('#etazhi')
  const rows = ledger.querySelectorAll('button.fr')
  expect(rows).toHaveLength(16)
  expect(textOf(ledger.querySelector('h2'))).toBe('Етаж по етаж')
  for (const cell of ledger.querySelectorAll('.fr__c > i')) expect(cell.className).toBe('s-none')
})

it('prerenders the free apartments’ heading and filters, and the closing', () => {
  const d = parse(prerender())
  expect(textOf(d.querySelector('#svobodni h2'))).toBe('Свободни апартаменти')
  expect([...d.querySelectorAll('#svobodni .fl__g')].map((group) => textOf(group.querySelector('.fl__k')))).toEqual(['Сграда', 'Стаи', 'Етаж'])
  expect(textOf(d.querySelector('#pz-close-h'))).toBe('Търсите нов дом?')
})
