// @vitest-environment node
import { JSDOM } from 'jsdom'
import { renderToString } from 'react-dom/server'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { goOffline } from '../../tests/contracts/site'
import grImages from '../data/images/golden-residence.json'
import floors from '../data/maps/golden-residence.floors.json'
import App from '../root'
import { DISPLAY_FONT_PRELOADS } from '../utils/fontLinks'
import NotFound, { handle } from './not-found'

// The build prerenders the 404 page as /404 in Node, where there is no window
// (scripts/postbuild.mjs copies it to 404.html, which the host serves for
// every URL with no page of its own), and that HTML is the final visual state
// until the JS runs (plan, global rules; spec M3/M4 §7.6): left, on the plan
// stage's umber, Golden Residence's typical floor of блок А with one
// apartment cut out of it; right, the heading that says the page is not in
// the drawing, its sentence and the three ways back. Nothing is hidden,
// faded or moved, for the drawing draws itself in CSS under the motion gate
// (notfound.css). This file renders as the build does, in Node; the HTML is
// then only read. Its hydration is not-found.hydration.test.jsx's.

const PATH = '/404'
const routes = () => [{ path: '/', Component: App, children: [{ path: PATH.slice(1), Component: NotFound, handle }] }]
const page = () => <RouterProvider router={createMemoryRouter(routes(), { initialEntries: [PATH] })} />
// React separates neighbouring text nodes with an empty comment.
const prerender = () => renderToString(page()).replaceAll('<!-- -->', '')
const parse = (html) => new JSDOM(html).window.document
const textOf = (element) => element.textContent.replace(/\s+/g, ' ').trim()

// Block А's typical floor (one plan serves its eight floors, Diptych §9), as
// the explorer draws it: each apartment's outline, by its number on the floor.
const BLOCK_A = floors.find(({ appliesTo }) => appliesTo.project === 'golden-residence' && appliesTo.blocks.includes('А'))
const outline = ({ polygons }) => `M${polygons[0].map((point) => point.join(' ')).join('L')}Z`
const MISSING = '04'

beforeEach(() => {
  goOffline()
})
afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

it('renders with no window, as the build does', () => {
  expect(typeof window).toBe('undefined')
  expect(prerender()).toContain('Тази страница')
})

// Spec §7.6: the H1 „Тази страница | я няма в чертежа.“ in its two masks
// (authored by hand, never split by script above the fold), a no-break space
// after „я“ and „в“, so no line ends on either; its sentence; the three ways
// back. The heading comes first in the DOM, the drawing after it.
describe('the words: the heading, its sentence and the ways back', () => {
  it('prerenders one H1, „Тази страница я няма в чертежа.“, in its two masks, „я“ and „в“ bound', () => {
    const doc = parse(prerender())
    const h1 = doc.querySelector('h1')

    expect(doc.querySelectorAll('h1')).toHaveLength(1)
    expect(textOf(h1)).toBe('Тази страница я няма в чертежа.')
    expect(h1.textContent).toContain('я\u00a0няма в\u00a0чертежа.')
    expect([...h1.querySelectorAll('.line-mask > .split-line')].map(textOf)).toEqual(['Тази страница', 'я няма в чертежа.'])
    // Its name, for assistive technology, is the sentence as it is spoken.
    expect(h1.getAttribute('aria-label')).toBe('Тази страница я няма в чертежа.')
    expect(doc.querySelector('#top').getAttribute('aria-labelledby')).toBe(h1.id)
    expect(h1.compareDocumentPosition(doc.querySelector('#top figure')) & 4).toBe(4)
  })

  it('says its sentence and offers Начало, Продажби and Контакти as the system’s links', () => {
    const top = parse(prerender()).querySelector('#top')

    expect(textOf(top.querySelector('.lost__p'))).toBe('Проверете адреса или започнете от някоя от страниците по-долу.')
    expect([...top.querySelectorAll('.lost__ways a')].map((a) => [textOf(a), a.getAttribute('href'), a.getAttribute('data-variant')])).toEqual([
      ['Начало', '/', 'link'],
      ['Продажби', '/projects', 'link'],
      ['Контакти', '/contact', 'link'],
    ])
  })
})

// Spec §7.6: the dark plan at .4 under the explorer's brass unit outlines,
// one apartment (04) cut out of the drawing and left as a dashed ivory
// outline: 11 outlines and the dashed one. A picture only, hidden from
// assistive technology, with no text in it, least of all a project's name
// (src/routes.test.jsx).
describe('the drawing: block А’s typical floor with one apartment missing', () => {
  const figure = () => parse(prerender()).querySelector('#top figure.lost__plan')

  it('is hidden from assistive technology and holds no text', () => {
    const drawing = figure()

    expect(drawing.getAttribute('aria-hidden')).toBe('true')
    expect(drawing.textContent).toBe('')
    expect(drawing.querySelectorAll('text, title, desc, figcaption')).toHaveLength(0)
    expect(drawing.innerHTML).not.toMatch(/Golden|Многофамилна|КСМ|KSM/i)
    expect(drawing.querySelector('img').getAttribute('alt')).toBe('')
  })

  it('draws 11 outlines plus one dashed: block А’s apartments, 04 cut out and left dashed', () => {
    const drawing = figure()
    const outlines = [...drawing.querySelectorAll('svg .lost__units path')]
    const gone = [...drawing.querySelectorAll('svg .lost__gone')]

    expect(outlines).toHaveLength(11)
    expect(gone).toHaveLength(1)
    expect(outlines.map((path) => path.getAttribute('d'))).toEqual(BLOCK_A.shapes.filter(({ unitSuffix }) => unitSuffix !== MISSING).map(outline))
    expect(gone[0].getAttribute('d')).toBe(outline(BLOCK_A.shapes.find(({ unitSuffix }) => unitSuffix === MISSING)))
    // Each outline draws once (pathLength 1), in turn (--i).
    expect(outlines.map((path) => path.getAttribute('pathLength'))).toEqual(Array(11).fill('1'))
    expect(outlines.map((path) => path.getAttribute('style'))).toEqual(outlines.map((_, i) => `--i:${i}`))
    // The missing apartment's walls are cut out of the drawing: its outline
    // filled with the stage's ground, under the outlines.
    const cut = drawing.querySelector('svg .lost__cut')
    expect(cut.getAttribute('d')).toBe(gone[0].getAttribute('d'))
    expect(cut.compareDocumentPosition(outlines[0]) & 4).toBe(4)
    expect(drawing.querySelector('svg').getAttribute('viewBox')).toBe('150 66 850 720')
  })

  // The explorer's own drawing of блок А (plan-a, from the image pipeline):
  // its AVIF, else its WebP, the page's first image, fetched first.
  it('lays the floor over the explorer’s drawing of блок А, fetched first', () => {
    const drawing = figure()
    const plan = grImages['plan-a']
    const widest = plan.widths.at(-1)
    const img = drawing.querySelector('picture img')

    expect(drawing.querySelector('picture source').getAttribute('type')).toBe('image/avif')
    expect(drawing.querySelector('picture source').getAttribute('srcset')).toBe(`${plan.path}-${widest}.avif`)
    expect(img.getAttribute('src')).toBe(`${plan.path}-${widest}.webp`)
    expect([img.getAttribute('width'), img.getAttribute('height')]).toEqual([String(plan.w), String(plan.h)])
    expect(img.getAttribute('fetchpriority')).toBe('high')
    expect(img.getAttribute('loading')).not.toBe('lazy')
    expect(img.classList.contains('lost__drawing')).toBe(true)
  })
})

// What an entrance's first frame would write, kept out of the page: an
// element faded out, collapsed, moved away, clipped or hidden.
it('starts nothing hidden, faded, moved or clipped', () => {
  const top = parse(prerender()).querySelector('#top')
  const styles = [top, ...top.querySelectorAll('[style]')].map((element) => element.getAttribute('style') ?? '')

  expect(styles.filter((style) => /opacity|transform|translate|scale|clip|visibility|(^|;)\s*(width|height):\s*0/.test(style))).toEqual([])
  expect(top.querySelectorAll('[hidden]')).toHaveLength(0)
  expect(top.querySelectorAll('[data-split], [data-fade], [data-draw], [data-wipe]')).toHaveLength(0)
})

// Spec §4.5: a no-break space after every one-letter word in the page's copy.
it('binds every one-letter word to the next', () => {
  const main = parse(prerender()).querySelector('main')

  expect(main.textContent).not.toMatch(/(^|[\s„(])[А-Яа-яA-Za-z] /u)
})

// Ruling C4.10's pattern: only what the page uses at load, with the document
// it is first loaded as: the upright display face, which the heading sets
// in the first viewport.
it('preloads the upright display face and nothing else', () => {
  const doc = parse(prerender())
  const preloads = [...doc.querySelectorAll('link[rel="preload"]')].map((link) => ({
    href: link.getAttribute('href'),
    as: link.getAttribute('as'),
    type: link.getAttribute('type'),
    crossorigin: link.getAttribute('crossorigin'),
  }))

  expect(preloads).toEqual([{ href: DISPLAY_FONT_PRELOADS[0].href, as: 'font', type: 'font/woff2', crossorigin: '' }])
})
