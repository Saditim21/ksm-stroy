// @vitest-environment node
import { JSDOM } from 'jsdom'
import { renderToString } from 'react-dom/server'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { goOffline } from '../../../tests/contracts/site'
import App from '../../root'
import Blog, { handle } from '../../routes/blog'
import { DISPLAY_FONT_PRELOADS } from '../../utils/fontLinks'
import { WORKS } from './works'

// The build prerenders Обекти in Node, where there is no window, and that
// HTML is the final visual state until the JS runs (plan, global rules; spec
// M3/M4 §7.2): one H1, the filter, the register of the seven works, each a
// row of three plates and its record, and the closing. Nothing in the
// opening is hidden, faded or moved, for its entrance is CSS under the
// motion gate (works.css), and no work's book is in it: the book is a lazy
// dialog (Book.jsx). This file renders as the build does, in Node; the HTML
// is then only read. Its hydration is blog.hydration.test.jsx's.

const PATH = '/blog'
const routes = () => [{ path: '/', Component: App, children: [{ path: PATH.slice(1), Component: Blog, handle }] }]
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
  expect(prerender()).toContain('Обекти')
})

// Spec §7.2, §4.1: the H1 „Обекти“, a big single-word title, hinged on the
// seam, in a mask authored by hand (never split by script above the fold).
it('prerenders one H1, „Обекти“, in its mask, at the top of #top', () => {
  const doc = parse(prerender())
  const h1 = doc.querySelector('h1')

  expect(doc.querySelectorAll('h1')).toHaveLength(1)
  expect(textOf(h1)).toBe('Обекти')
  expect(h1.querySelector('.line-mask .split-line')).not.toBeNull()
  expect(doc.querySelector('#top h1')).toBe(h1)
  expect(doc.querySelector('#top').getAttribute('aria-labelledby')).toBe(h1.id)
})

it('runs #top, the register, then the closing', () => {
  const doc = parse(prerender())

  expect([...doc.querySelectorAll('main section[id]')].map(({ id }) => id)).toEqual(['top'])
  expect(doc.querySelectorAll('main section')).toHaveLength(2)
})

// Production's description (Blog.jsx's meta), re-set with a dash and a
// no-break space after „и“.
it('leads with production’s description', () => {
  const lead = parse(prerender()).querySelector('#top .ob__lead')

  expect(textOf(lead)).toBe('Разгледайте нашите успешно реализирани строителни проекти – жилищни комплекси, хотелски комплекси и санирания.')
  expect(lead.textContent).toContain('и\u00a0санирания.')
})

// Spec §7.2: a three-way segmented control, production's filter with its
// counts: every work, the finished ones, the one in rough construction.
// Each names itself in full; the short label below 1240 px is the eye's
// alone (works.css).
it('offers the filter: all seven, the six finished, the one in rough construction', () => {
  const group = parse(prerender()).querySelector('#top [role="group"]')
  const buttons = [...group.querySelectorAll('button')]

  expect(group.getAttribute('aria-label')).toBe('Покажи')
  expect(buttons.map((button) => [textOf(button.querySelector('.ob__fl')), textOf(button.querySelector('b'))])).toEqual([
    ['Всички проекти', '7'],
    ['Завършени проекти', '6'],
    ['Груб строеж', '1'],
  ])
  expect(buttons.map((button) => button.getAttribute('aria-pressed'))).toEqual(['true', 'false', 'false'])
  expect(buttons.map((button) => textOf(button.querySelector('.ob__fs')))).toEqual(['Всички', 'Завършени', 'Груб строеж'])
  for (const button of buttons) expect(button.querySelector('.ob__fs').getAttribute('aria-hidden')).toBe('true')
})

describe('the register', () => {
  const rows = () => [...parse(prerender()).querySelectorAll('#top .wk')]

  // Spec §7.2: each work a row across the seam, all seven shown at first.
  it('lists the seven works, in production’s order, none hidden', () => {
    const shown = rows()
    expect(shown.map((row) => textOf(row.querySelector('h2')))).toEqual(WORKS.map(({ name }) => name))
    expect(shown.map((row) => row.id)).toEqual(WORKS.map(({ id }) => id))
    for (const row of shown) expect(row.hasAttribute('hidden')).toBe(false)
  })

  // The contract (tests/contracts/site.jsx): <main> shows „Айвазовски Парк“.
  it('names Айвазовски Парк in <main>', () => {
    expect(textOf(parse(prerender()).querySelector('main'))).toMatch(/Айвазовски Парк/)
  })

  // Three plates a work, the cover first, each a button that opens the
  // work's book at its photo, named for it; their pictures take the
  // archive's grade (spec §4.3).
  it('gives each work three graded plates, each opening its book at its photo', () => {
    for (const row of rows()) {
      const plates = [...row.querySelectorAll('.wk__media > button')]
      expect(plates.map((plate) => plate.className), row.id).toEqual(['wk__ph wk__ph--cover', 'wk__ph wk__ph--m1', 'wk__ph wk__ph--m2'])
      for (const plate of plates) {
        expect(plate.querySelector('picture').classList.contains('grade'), row.id).toBe(true)
        expect(plate.querySelector('img').getAttribute('alt'), row.id).toBe('')
      }
    }
    const [greenLife] = rows()
    expect([...greenLife.querySelectorAll('.wk__media > button')].map((plate) => plate.getAttribute('aria-label'))).toEqual([
      'Green Life – Paradise Gardens and Town House: снимка 3 от 6',
      'Green Life – Paradise Gardens and Town House: снимка 1 от 6',
      'Green Life – Paradise Gardens and Town House: снимка 4 от 6',
    ])
  })

  // The plates' photos, three a work, are the only photos of the works the
  // page asks for; the rest come with the book. The first row's are in the
  // first viewport: its cover, the page's largest paint, fetched first.
  it('asks for the plates’ photos alone, the first cover first', () => {
    const doc = parse(prerender())
    const shown = new Set([...doc.querySelectorAll('main img')].map((img) => img.getAttribute('src').replace(/-\d+\.webp$/, '')))
    expect(shown.size).toBe(21)
    for (const path of shown) expect(path).toMatch(/^\/img\/work-/)
    const [first, ...rest] = rows()
    const loading = (row) => [...row.querySelectorAll('img')].map((img) => [img.getAttribute('loading'), img.getAttribute('fetchpriority')])
    // Its two smaller plates at once too, at the lowest priority, after the
    // cover and the page's code (spec M3/M4 §10, step 3).
    expect(loading(first)).toEqual([['eager', 'high'], ['eager', 'low'], ['eager', 'low']])
    for (const row of rest) expect(loading(row), row.id).toEqual([['lazy', null], ['lazy', null], ['lazy', null]])
  })

  // The plates of the rows below the first open from the seam together as
  // each row comes up (useWipes, on the row's media); the first row's open
  // with the opening, in CSS.
  it('marks the plates below the first row to open from the seam', () => {
    const [first, ...rest] = rows()
    expect(first.querySelectorAll('[data-wipe]')).toHaveLength(0)
    for (const row of rest) {
      expect([...row.querySelectorAll('[data-wipe]')].map((wipe) => [wipe.className, wipe.getAttribute('data-wipe')]), row.id).toEqual([['wk__media', 'l']])
    }
  })

  // The record: the name, the place and type (the year for Green Life
  // alone), the brass „груб строеж“ tag on Панорама, production's
  // description, its features, „Разгледайте проекта“ and the photo count.
  it('sets each work’s record', () => {
    const shown = rows()
    expect(shown.map((row) => textOf(row.querySelector('.wk__meta')))).toEqual([
      'гр. Созопол · жилищен комплекс · 2018',
      'гр. Поморие · жилищен комплекс',
      'гр. Созопол · жилищен комплекс груб строеж',
      'гр. Бургас · санитарно обновяване',
      'кв. Меден Рудник, гр. Бургас · жилищна сграда',
      'с. Огняново · хотелски комплекс',
      'с. Огняново, община Гърмен · обществена сграда',
    ])
    expect(shown.map((row) => row.querySelector('.wk__tag') && textOf(row.querySelector('.wk__tag')))).toEqual([null, null, 'груб строеж', null, null, null, null])
    expect(textOf(shown[1].querySelector('.wk__desc'))).toBe('Модерен жилищен комплекс в престижен район на Поморие.')
    expect(shown[1].querySelector('.wk__desc').textContent).toContain('в\u00a0престижен')
    expect(textOf(shown[1].querySelector('.wk__feat h3'))).toBe('Особености')
    expect([...shown[1].querySelectorAll('.wk__feat li')].map(textOf)).toEqual(['Морска панорама', 'Балкони', 'Асансьор', 'Охрана'])
    expect(shown.map((row) => textOf(row.querySelector('.wk__n')))).toEqual(['6 снимки', '7 снимки', '23 снимки', '11 снимки', '26 снимки', '8 снимки', '12 снимки'])
    expect(shown[0].querySelector('.wk__n').textContent).toBe('6\u00a0снимки')
    for (const row of shown) {
      const open = row.querySelector('.wk__act button')
      expect(textOf(open), row.id).toBe('Разгледайте проекта')
      expect(open.getAttribute('data-variant'), row.id).toBe('link')
    }
  })
})

// Spec §7.2: „Имате идея за *проект*?“ and production's line, as a hinge,
// then the ways: „Свържете се с нас“ with the phone and the email, and
// „Поръчайте оферта“ to the contact form, the construction subject chosen.
it('closes on the hinge and the two ways: the contact page, and the form for construction', () => {
  const closing = [...parse(prerender()).querySelectorAll('main section')].at(-1)

  expect(textOf(closing.querySelector('h2'))).toBe('Имате идея за проект?')
  expect(textOf(closing.querySelector('h2 em'))).toBe('проект')
  const lead = closing.querySelector('.hinge .lead')
  expect(textOf(lead)).toBe('Свържете се с нас за консултация и да обсъдим как можем да реализираме вашия проект.')
  expect(lead.textContent).toContain('с\u00a0нас за консултация и\u00a0да')
  const ways = [...closing.querySelectorAll('nav.ways a')]
  expect(ways.map((way) => [textOf(way.querySelector('.serif')), textOf(way.querySelector('.small')), way.getAttribute('href')])).toEqual([
    ['Свържете се с нас', '+359 887 886 166 · ksm_str@abv.bg', '/contact'],
    ['Поръчайте оферта', 'Строителство или ремонт', '/contact?project=stroitelstvo#zapitvane'],
  ])
})

// What an entrance's first frame would write, kept out of the opening: an
// element faded out, collapsed, moved away, clipped or hidden.
it('starts nothing in #top hidden, faded, moved or clipped, and has no book in it', () => {
  const doc = parse(prerender())
  const opening = doc.querySelector('#top')
  const styles = [opening, ...opening.querySelectorAll('[style]')].map((element) => element.getAttribute('style') ?? '')

  expect(styles.filter((style) => /opacity|transform|translate|scale|clip|visibility|(^|;)\s*(width|height):\s*0/.test(style))).toEqual([])
  expect(opening.querySelectorAll('[hidden]')).toHaveLength(0)
  expect(doc.querySelector('[role="dialog"]')).toBeNull()
})

// Ruling C5.4 (C4.10's pattern): only what the page uses at load, with the
// document it is first loaded as: the upright display face, which the
// title and the works' names set (no italic word in the first viewport).
it('preloads only the upright display face', () => {
  const doc = parse(prerender())
  const preloads = [...doc.querySelectorAll('link[rel="preload"]')].map((link) => ({
    href: link.getAttribute('href'),
    as: link.getAttribute('as'),
  }))

  expect(preloads).toEqual([{ href: DISPLAY_FONT_PRELOADS[0].href, as: 'font' }])
})
