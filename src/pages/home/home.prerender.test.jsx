// @vitest-environment node
import { JSDOM } from 'jsdom'
import { renderToString } from 'react-dom/server'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { goOffline } from '../../../tests/contracts/site'
import App from '../../root'
import { availabilityPreload } from '../../data/availability/useAvailability'
import { DISPLAY_FONT_PRELOADS } from '../../utils/fontLinks'
import Home, { handle } from '../Home'

// The build prerenders Home in Node, where there is no window, and that HTML
// is the final visual state until the JS runs (plan, global rules; spec §5.5,
// §6.2): the slogan, the dated Многофамилна count, the intro's doors, every
// section and the inquiry's empty form are in it, the Golden Residence count
// is `—`, and nothing starts hidden, faded or moved: the opening's motion is
// CSS under the gate (home.css), the rest is GSAP's after the load. This file
// renders as the build does, in Node; the HTML is then only read (jsdom's
// parser, no window of its own). The hydration of that HTML is
// home.hydration.test.jsx's.

const routes = () => [{ path: '/', Component: App, children: [{ index: true, Component: Home, handle }] }]
const page = () => <RouterProvider router={createMemoryRouter(routes(), { initialEntries: ['/'] })} />
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
  expect(prerender()).toContain('Създаваме')
})

it('prerenders the slogan, the dated Многофамилна count and the intro’s doors', () => {
  const html = prerender()
  const doc = parse(html)

  expect(textOf(doc.querySelector('h1'))).toBe('Създаваме пространства за мечтания живот')
  expect(doc.querySelectorAll('h1')).toHaveLength(1)
  expect(html).toContain('class="intro-doors"')
  expect(textOf(doc.querySelector('.half--mn .half__count'))).toContain('16')
  expect(doc.querySelector('.half--mn').getAttribute('aria-label')).toContain('16 свободни апартамента от 144')
  expect(doc.querySelector('.half--mn').getAttribute('href')).toBe('#zapitvane')
})

// The Golden Residence count arrives at hydration (spec §9): `—` until then,
// and a name with no count to read out. The teaser's floors too.
it('prerenders the Golden Residence count as —, and names the half without it', () => {
  const doc = parse(prerender())
  const half = doc.querySelector('section.hero a.half--gr')

  expect(textOf(half.querySelector('.half__count'))).toMatch(/^— /)
  expect(half.getAttribute('aria-label')).toBe('Golden Residence, жк Левски Г. Изберете апартамент.')
  const rails = [...doc.querySelectorAll('#etazhi .fx__cnt')]
  expect(rails).toHaveLength(16)
  expect(rails.map((rail) => textOf(rail.querySelector('.n')))).toEqual(Array(16).fill('—'))
  expect(rails.find((rail) => rail.getAttribute('aria-label').startsWith('Блок А, етаж 5')).getAttribute('aria-label'))
    .toBe('Блок А, етаж 5. Enter отваря плана.')
})

it('prerenders every section, the first work in the panel and the inquiry’s form ready to fill', () => {
  const doc = parse(prerender())

  expect([...doc.querySelectorAll('main section[id]')].map((section) => section.id))
    .toEqual(['proekti', 'za-nas', 'uslugi', 'obekti', 'etazhi', 'kontakti', 'es-proekt'])
  expect(textOf(doc.querySelector('#obekti .works__cap'))).toBe('Green Life – Paradise Gardens and Town House, гр. Созопол')
  expect(doc.querySelector('#obekti .works__items button').getAttribute('aria-current')).toBe('true')
  const form = doc.querySelector('#kontakti form')
  expect(form.hasAttribute('novalidate')).toBe(true)
  expect(form.hasAttribute('hidden')).toBe(false)
  expect(doc.querySelector('#f-name').getAttribute('aria-invalid')).toBeNull()
  expect(doc.querySelector('#kontakti [role="status"]')).toBeNull()
})

// What an entrance's first frame would write, kept out of the page: an
// element faded out, collapsed, moved away, clipped or hidden (the check the
// legacy pages get, src/pages/legacy.prerender.test.jsx).
it('starts nothing hidden, faded, moved or clipped', () => {
  const html = prerender()
  const styles = [...html.matchAll(/\sstyle="([^"]*)"/g)].map(([, style]) => style)

  expect(styles.filter((style) => /opacity|transform|translate|scale|clip|visibility|(^|;)\s*(width|height):\s*0/.test(style))).toEqual([])
  expect(html).not.toMatch(/\bopacity-0\b|\binvisible\b/)
})

// Ruling C4.10: Home's preloads, the availability API for the Golden
// Residence count and both display faces for the slogan, go out with the
// document Home is first loaded as, through React's preload(), and are never
// put in the head again by a client-side navigation (home.test.jsx).
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
