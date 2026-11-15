// @vitest-environment node
import { JSDOM } from 'jsdom'
import { renderToString } from 'react-dom/server'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { goOffline } from '../../../tests/contracts/site'
import App from '../../root'
import { availabilityPreload } from '../../data/availability/useAvailability'
import GoldenResidence, { handle } from '../../routes/golden-residence'
import { DISPLAY_FONT_PRELOADS } from '../../utils/fontLinks'

// The build prerenders the Golden Residence page in Node, where there is no
// window, and that HTML is the final visual state until the JS runs (plan,
// global rules; spec §5.5, §6.2): one H1, the free count `—` until the data
// arrives (spec §9), and nothing in the hero hidden, faded or moved, for its
// entrance is CSS under the motion gate (gr.css). This file renders as the
// build does, in Node; the HTML is then only read (jsdom's parser, no window
// of its own). The hydration of that HTML is gr.hydration.test.jsx's.

const PATH = '/projects/golden-residence'
const routes = () => [{ path: '/', Component: App, children: [{ path: PATH.slice(1), Component: GoldenResidence, handle }] }]
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
  expect(prerender()).toContain('Residence')
})

it('prerenders one H1, the building’s name', () => {
  const doc = parse(prerender())

  expect(doc.querySelectorAll('h1')).toHaveLength(1)
  expect(textOf(doc.querySelector('#top h1'))).toBe('Golden Residence')
})

// The free counts arrive at hydration (spec §9): `—` until then, never a
// fake zero.
it('prerenders the free counts as —', () => {
  const doc = parse(prerender())

  expect(textOf(doc.querySelector('#top .fact--r'))).toMatch(/^— свободни в момента$/)
  for (const id of ['blk-a', 'blk-b']) {
    expect([...doc.querySelectorAll(`#${id} .blk__stats .legend li`)].map(textOf)).toEqual(['— свободни', '— резервирани', '— продадени', '— блокирани'])
  }
  expect(textOf(doc.querySelector('#park-g .park__big'))).toMatch(/^— свободни от 113$/)
  expect(textOf(doc.querySelector('#park-g summary'))).toBe('Свободните гаражи (—)')
  expect(textOf(doc.querySelector('#explorer .lead'))).toMatch(/: — от 192\.$/)
  expect([...doc.querySelectorAll('#explorer .legend li')].map(textOf)).toEqual(['— свободни', '— резервирани', '— продадени', '— блокирани'])
  expect([...doc.querySelectorAll('#explorer .fx__cnt .n')].map(textOf)).toEqual(Array(16).fill('—'))
})

// The explorer's facade is in the HTML at rest: its rails, the picture and
// the floors. No edge panel and no sheet: their chunk loads in the browser,
// and only a hot floor shows them. No notice, which only the browser's data
// can call for (spec §9).
it('prerenders the explorer at rest', () => {
  const doc = parse(prerender())
  const explorer = doc.querySelector('#explorer')

  expect(explorer.querySelectorAll('.fx__floor')).toHaveLength(16)
  expect(explorer.querySelector('.fx picture img').getAttribute('loading')).toBe('lazy')
  expect(explorer.querySelector('.fx').getAttribute('data-block')).toBe('А')
  expect(doc.querySelectorAll('.fxp, .sheet')).toHaveLength(0)
  expect(explorer.textContent).not.toMatch(/Наличността не се зареди/)
})

// The two ways in (spec §7.8): the prerendered page is „Визуално“'s, its
// underline under it by CSS alone; the list's panel is there for the tabs
// to name, hidden and empty, for ?view=list is read once the page has
// hydrated (gr.hydration.test.jsx) and the list loads only then (ruling
// C8.5). The list's „етаж 3“ thus comes after the facade's rails, whose own
// „етаж 3“ the availability contract finds first.
it('prerenders the ways in at „Визуално“, the list’s panel hidden and empty', () => {
  const doc = parse(prerender())
  const tabs = doc.querySelector('#explorer [role="tablist"]')

  expect(tabs.getAttribute('aria-label')).toBe('Как да търсите')
  expect(tabs.getAttribute('data-view')).toBe('visual')
  expect([...tabs.querySelectorAll('[role="tab"]')].map((tab) => [textOf(tab), tab.getAttribute('aria-selected')]))
    .toEqual([['Визуално', 'true'], ['По критерии', 'false']])
  const [visual, list] = doc.querySelectorAll('#explorer [role="tabpanel"]')
  expect(visual.hasAttribute('hidden')).toBe(false)
  expect(visual.querySelector('.fx')).not.toBeNull()
  expect(list.hasAttribute('hidden')).toBe(true)
  expect(list.children).toHaveLength(0)
  expect(doc.getElementById(tabs.querySelector('[role="tab"]').getAttribute('aria-controls'))).toBe(visual)
})

// Each block's squares are in the HTML before the data, in a neutral outline
// and named by their unit alone, so nothing moves when the statuses arrive.
it('prerenders each block’s 96 squares before the data', () => {
  const doc = parse(prerender())
  for (const id of ['blk-a', 'blk-b']) {
    const cells = doc.querySelectorAll(`#${id} .blk__grid button`)
    expect(cells).toHaveLength(96)
    expect([...cells].every((cell) => cell.className === 's-none')).toBe(true)
  }
  expect(doc.querySelector('#blk-a .blk__grid button').getAttribute('aria-label')).toBe('А 801')
})

// What an entrance's first frame would write, kept out of the hero: an
// element faded out, collapsed, moved away, clipped or hidden.
it('starts nothing in #top hidden, faded, moved or clipped', () => {
  const hero = parse(prerender()).querySelector('#top')
  const styles = [hero, ...hero.querySelectorAll('[style]')].map((element) => element.getAttribute('style') ?? '')

  expect(styles.filter((style) => /opacity|transform|translate|scale|clip|visibility|(^|;)\s*(width|height):\s*0/.test(style))).toEqual([])
  expect(hero.outerHTML).not.toMatch(/\bopacity-0\b|\binvisible\b/)
  expect(hero.querySelectorAll('[hidden]')).toHaveLength(0)
})

// Ruling C5.4 (C4.10's pattern): the page's preloads, the availability API
// for its counts and both display faces for its title, go out with the
// document it is first loaded as, through React's preload(), and are never
// put in the head again by a client-side navigation (gr.test.jsx).
it('preloads the availability API and both display faces with the document', () => {
  const doc = parse(prerender())
  const preloads = [...doc.querySelectorAll('link[rel="preload"]')].map((link) => ({
    href: link.getAttribute('href'),
    as: link.getAttribute('as'),
    type: link.getAttribute('type'),
    crossOrigin: link.getAttribute('crossorigin'),
  }))
  for (const { href, as, type } of [availabilityPreload, ...DISPLAY_FONT_PRELOADS]) {
    expect(preloads).toContainEqual({ href, as, type: type ?? null, crossOrigin: '' })
  }
})

// The prerendered story shows its first picture's caption and index, and its
// gallery its first spread (gr.test.jsx turns them).
it('prerenders the story at its first block and the gallery at its first spread', () => {
  const doc = parse(prerender())

  expect(textOf(doc.querySelector('#sgradata .story__idx'))).toBe('01 / 04')
  expect(textOf(doc.querySelector('#sgradata .story__cap'))).toBe('Визуализация: входът и градината пред него')
  expect(textOf(doc.querySelector('#galeriya .gal__n'))).toBe('01 / 03')
  expect([...doc.querySelectorAll('#galeriya .gal__img[data-shown]')].map((layer) => layer.getAttribute('data-spread'))).toEqual(['0', '0'])
})
