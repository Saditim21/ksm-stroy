// @vitest-environment node
import { JSDOM } from 'jsdom'
import { renderToString } from 'react-dom/server'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { goOffline } from '../../../tests/contracts/site'
import App from '../../root'
import { availabilityPreload } from '../../data/availability/useAvailability'
import Mnogofamilna, { handle } from '../../routes/mnogofamilna'
import { DISPLAY_FONT_PRELOADS } from '../../utils/fontLinks'

// The build prerenders the Многофамилна page in Node, where there is no
// window, and that HTML is the final visual state until the JS runs (plan,
// global rules; spec M3 §5.1, §6.3): one H1, the dated snapshot's real
// numbers (never `—`, never a zero), the night facade with its lit floors,
// and nothing in the opening hidden, faded or moved, for its entrance is CSS
// under the motion gate (mn.css, mn-facade.css). This file renders as the
// build does, in Node; the HTML is then only read. Its hydration is
// mn.hydration.test.jsx's.

const PATH = '/projects/mnogofamilna-sgrada'
const routes = () => [{ path: '/', Component: App, children: [{ path: PATH.slice(1), Component: Mnogofamilna, handle }] }]
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
  expect(prerender()).toContain('Многофамилна')
})

// Spec M3 §6.2 #1: the H1 reads across the seam, „Многофамилна | жилищна
// *сграда*“, each part in a mask of its own, authored by hand.
it('prerenders one H1, the building’s name, read across the seam', () => {
  const doc = parse(prerender())
  const h1 = doc.querySelector('h1')

  expect(doc.querySelectorAll('h1')).toHaveLength(1)
  expect(textOf(h1)).toBe('Многофамилна жилищна сграда')
  expect(textOf(h1.querySelector('em'))).toBe('сграда')
  expect([...h1.querySelectorAll('.line-mask')].map(textOf)).toEqual(['Многофамилна', 'жилищна сграда'])
  expect(doc.querySelector('#explorer h1')).toBe(h1)
})

// Spec M3 §2, §6.2 #1: the УПИ address, bound as every address is
// (bindAddress: a number never starts a line).
it('gives the address with its no-break spaces', () => {
  const address = parse(prerender()).querySelector('#explorer .mnx__addr')

  expect(address.textContent).toBe('УПИ V-1344, кв. 33, ж.к. Връбница-1, гр. София')
})

// Review Focus 1: the page shows the snapshot's real numbers, dated, in its
// prerendered HTML: the facts, and on each rail its floor's free count.
it('mn.prerender: the facts and rails show the snapshot’s numbers', () => {
  const doc = parse(prerender())
  const [all, free] = doc.querySelectorAll('#explorer .mnx__fact')

  expect(textOf(all)).toBe('144 апартамента в 2 блока')
  expect(all.textContent).toContain('в 2 блока')
  expect(textOf(free)).toBe('16 свободни по данни към 01.12.2025')

  const rails = [...doc.querySelectorAll('#explorer .fx__cnt')]
  expect(rails).toHaveLength(18)
  const b9 = rails.find((rail) => rail.getAttribute('data-k') === 'Б-9')
  expect(b9.getAttribute('aria-label')).toBe('Блок Б, етаж 9: 3 свободни, 0 резервирани, 5 продадени, 0 блокирани. Enter отваря плана.')
  expect(textOf(b9.querySelector('.n'))).toBe('3')
  expect(rails.map((rail) => textOf(rail.querySelector('.n'))).join(' ')).not.toMatch(/—/)
  expect(doc.querySelector('#explorer').textContent).not.toMatch(/Наличността не се зареди/)
})

// Spec M3 §6.3: the dark twin, with the lit render through the band of every
// floor that has a free apartment, in both blocks, per the snapshot.
it('lights exactly the nine floors with a free apartment', () => {
  const doc = parse(prerender())
  const lit = [...doc.querySelectorAll('#explorer [data-lit]')].map((floor) => floor.getAttribute('data-lit'))

  expect(lit.sort()).toEqual(['А-2', 'А-9', 'Б-2', 'Б-3', 'Б-4', 'Б-5', 'Б-7', 'Б-8', 'Б-9'])
  expect(doc.querySelector('#explorer .fx__lights').getAttribute('aria-hidden')).toBe('true')
})

// The facade at rest (spec M3 §6.3): the night render, its LCP picture
// fetched first and at once, the building named, both blocks' floors, no
// edge panel and no sheet (their chunk loads in the browser).
it('prerenders the facade at rest, its night picture first to load', () => {
  const doc = parse(prerender())
  const facade = doc.querySelector('#explorer .fx')

  expect(facade.classList.contains('fx--mn')).toBe(true)
  expect(facade.getAttribute('data-block')).toBe('А')
  expect(facade.querySelectorAll('.fx__floor')).toHaveLength(18)
  const twin = facade.querySelector('picture.fx__pic img')
  expect(twin.getAttribute('src')).toMatch(/^\/img\/mn-dusk-off-\d+\.webp$/)
  expect(twin.getAttribute('loading')).toBe('eager')
  expect(twin.getAttribute('fetchpriority')).toBe('high')
  expect(facade.querySelector('.fx__stage').getAttribute('aria-label')).toBe('Фасада на Многофамилна жилищна сграда. Изберете етаж.')
  expect(doc.querySelectorAll('.fxp, .sheet')).toHaveLength(0)
  // The caption, with the date, and its desktop and touch words.
  const caption = facade.querySelector('.fx__cap')
  expect(textOf(caption)).toMatch(/^Светят етажите със свободни апартаменти, по данни към 01\.12\.2025\. Цифрите отстрани са свободните апартаменти на всеки етаж\./)
  expect(caption.querySelector('.cap-desk')).not.toBeNull()
  expect(caption.querySelector('.cap-phone')).not.toBeNull()
})

// Spec M3 §6.2: the opening is the explorer, then the list, then the
// inquiry, whose #zapitvane is inside #kontakti.
it('runs #explorer, #spisak and #kontakti, in that order', () => {
  const doc = parse(prerender())

  expect([...doc.querySelectorAll('main section[id]')].map(({ id }) => id)).toEqual(['explorer', 'spisak', 'kontakti'])
  expect(doc.querySelector('#kontakti #zapitvane')).not.toBeNull()
})

// Spec M3 §6.2 #3: the list's heading and lead are in the HTML; the list
// itself loads in the browser.
it('prerenders the list’s heading and lead, and not the list', () => {
  const doc = parse(prerender())
  const list = doc.querySelector('#spisak')

  expect(textOf(list.querySelector('h2'))).toBe('Всички 144 апартамента')
  expect(textOf(list.querySelector('h2 em'))).toBe('144')
  expect(textOf(list.querySelector('.lead'))).toBe('По данни към 01.12.2025. Продадените остават в списъка.')
  expect(list.querySelector('.lead').textContent).toContain('в списъка')
  expect(list.querySelector('.lv')).toBeNull()
})

// Spec M3 §6.2 #6: Многофамилна first, and chosen.
it('presets the inquiry’s subject to Многофамилна', () => {
  const select = parse(prerender()).querySelector('#kontakti select')

  expect(select.value).toBe('mnogofamilna')
  expect([...select.options].map((option) => option.value)).toEqual(['mnogofamilna', 'golden-residence', 'build', 'other'])
})

// What an entrance's first frame would write, kept out of the opening: an
// element faded out, collapsed, moved away, clipped or hidden.
it('starts nothing in #explorer hidden, faded, moved or clipped', () => {
  const opening = parse(prerender()).querySelector('#explorer')
  const styles = [opening, ...opening.querySelectorAll('[style]')].map((element) => element.getAttribute('style') ?? '')

  expect(styles.filter((style) => /opacity|transform|translate|scale|clip|visibility|(^|;)\s*(width|height):\s*0/.test(style))).toEqual([])
  expect(opening.outerHTML).not.toMatch(/\bopacity-0\b|\binvisible\b/)
  expect(opening.querySelectorAll('[hidden]')).toHaveLength(0)
})

// Ruling C5.4 (C4.10's pattern), spec M3 §6.1: only what the page uses at
// load, with the document it is first loaded as: the availability API, which
// its store reads, and both display faces, which its title sets (the root
// adds the text face every page has). No picture: the facade's pictures are
// in the HTML, its night render fetched first.
it('preloads only what the page uses at load', () => {
  const doc = parse(prerender())
  const preloads = [...doc.querySelectorAll('link[rel="preload"]')].map((link) => ({
    href: link.getAttribute('href'),
    as: link.getAttribute('as'),
  }))

  expect(preloads).toEqual(expect.arrayContaining([availabilityPreload, ...DISPLAY_FONT_PRELOADS].map(({ href, as }) => ({ href, as }))))
  expect(preloads).toHaveLength(3)
})
