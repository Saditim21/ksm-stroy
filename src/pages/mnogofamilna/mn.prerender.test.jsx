// @vitest-environment node
import { JSDOM } from 'jsdom'
import { renderToString } from 'react-dom/server'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { goOffline } from '../../../tests/contracts/site'
import App from '../../root'
import { availabilityPreload } from '../../data/availability/useAvailability'
import { MN_FACTS } from '../../data/mnogofamilna/facts'
import Mnogofamilna, { handle } from '../../routes/mnogofamilna'
import { DISPLAY_FONT_PRELOADS } from '../../utils/fontLinks'
import { formatArea } from '../../utils/format'

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

  expect(address.textContent).toBe('УПИ V-1344, кв.\u00A033, ж.к. Връбница-1, гр. София')
})

// Review Focus 1: the page shows the snapshot's real numbers, dated, in its
// prerendered HTML: the facts, and on each rail its floor's free count.
it('mn.prerender: the facts and rails show the snapshot’s numbers', () => {
  const doc = parse(prerender())
  const [all, free] = doc.querySelectorAll('#explorer .mnx__fact')

  expect(textOf(all)).toBe('144 апартамента в 2 блока')
  expect(all.textContent).toContain('в\u00A02\u00A0блока')
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

// The phone's renders (spec M3/M4 §10; the concept's mnogofamilna.js:413-414):
// a phone shows one block's crop, and 1400 px of a render are enough there,
// so a phone of any density is offered the 800 and 1400 px files alone, its
// LCP image within the 60 kB mobile budget (the 1400 px twin is 55 kB, the
// 1600 px 66 kB); a desktop keeps the whole ladder. The twin and every lit
// floor alike.
it('offers a phone the twin and the lit render at 800 and 1400 px alone', () => {
  const doc = parse(prerender())
  const pictures = [...doc.querySelectorAll('#explorer .fx__pic, #explorer .fx__lit picture')]
  expect(pictures).toHaveLength(10)
  for (const picture of pictures) {
    const sources = [...picture.querySelectorAll('source')]
    const phone = sources.filter((source) => source.getAttribute('media') === '(max-width: 900px)')
    expect(phone.map((source) => source.getAttribute('type'))).toEqual(['image/avif', 'image/webp'])
    for (const source of phone) {
      expect(source.getAttribute('srcset').split(', ').map((candidate) => candidate.split(' ')[1])).toEqual(['800w', '1400w'])
    }
    const rest = sources.filter((source) => !source.hasAttribute('media'))
    expect(rest.map((source) => source.getAttribute('srcset').split(', ').length)).toEqual([5, 5])
  }
})

// Spec M3 §6.2: the opening is the explorer, then both blocks apartment by
// apartment, the list, the building, the gallery, and the inquiry, whose
// #zapitvane is inside #kontakti.
it('runs #explorer, #blokove, #spisak, #sgradata, #galeriya and #kontakti, in that order', () => {
  const doc = parse(prerender())

  expect([...doc.querySelectorAll('main section[id]')].map(({ id }) => id))
    .toEqual(['explorer', 'blokove', 'spisak', 'sgradata', 'galeriya', 'kontakti'])
  expect(doc.querySelector('#kontakti #zapitvane')).not.toBeNull()
})

// Spec M3 §6.2 #2: „Два блока, по 72 апартамента“, production's „Изберете
// блок за преглед“ in the lead; each block's 72 apartments as squares,
// floors 10 down to 2, „А-101“ the bottom row's first; its counts by status
// and its room types, dated, from the snapshot; and „Преглед на блока“ to
// its page.
describe('#blokove', () => {
  const blocks = () => parse(prerender()).querySelector('#blokove')
  const grid = (section, letter) => [...section.querySelectorAll('[role="group"]')]
    .find((group) => group.getAttribute('aria-label') === `Апартаментите на блок\u00A0${letter}`)

  it('heads both blocks, its lead production’s „Изберете блок за преглед“', () => {
    const section = blocks()

    expect(textOf(section.querySelector('h2'))).toBe('Два блока, по 72 апартамента')
    expect(textOf(section.querySelector('h2 em'))).toBe('72')
    expect(textOf(section.querySelector('.hinge .lead'))).toBe('Изберете блок за преглед. Всеки квадрат е апартамент: етажите отгоре надолу, номерата от 01 до 08. Кликнете квадрат, за да отворите апартамента.')
    expect(section.querySelector('.hinge .lead').textContent).toContain('отворите\u00A0апартамента.')
    expect([...section.querySelectorAll('h3')].map(textOf)).toEqual(['Блок А', 'Блок Б'])
    expect([...section.querySelectorAll('.blk__sub')].map((sub) => sub.textContent)).toEqual(Array(2).fill('72\u00A0апартамента · 9\u00A0етажа · 8\u00A0на етаж'))
  })

  it('draws each block’s 72 apartments as squares, 8 a floor, floors 10 down to 2', () => {
    const section = blocks()

    for (const letter of ['А', 'Б']) {
      const squares = [...grid(section, letter).querySelectorAll('button')]
      expect(squares, letter).toHaveLength(72)
      expect(squares[0].getAttribute('aria-label')).toBe(`${letter}-901, Продаден`)
      expect(squares.at(-8).getAttribute('aria-label')).toMatch(new RegExp(`^${letter}-101, `))
      // One tab stop a grid (ruling T8a).
      expect(squares.filter((square) => square.getAttribute('tabindex') === '0')).toHaveLength(1)
    }
    expect(grid(section, 'А').querySelector('[aria-label="А-802, Свободен"]').getAttribute('class')).toBe('s-free')
    expect([...section.querySelectorAll('.blk__fl')].map((floors) => [...floors.children].map(textOf).join(' '))).toEqual(Array(2).fill('10 9 8 7 6 5 4 3 2'))
  })

  it('counts each block’s apartments by status, and its room types, as of the snapshot’s date', () => {
    const section = blocks()
    const counts = (id) => [...section.querySelectorAll(`#${id} .blk__stats .legend > li`)].map(textOf)

    expect(counts('blk-a')).toEqual(['4 свободни', '4 резервирани', '64 продадени', '0 блокирани'])
    expect(counts('blk-b')).toEqual(['12 свободни', '2 резервирани', '58 продадени', '0 блокирани'])
    for (const id of ['blk-a', 'blk-b']) {
      expect(textOf(section.querySelector(`#${id} .blk__types`)), id).toBe('36 двустайни · 36 тристайни · по данни към 01.12.2025')
    }
    expect(section.textContent).not.toMatch(/—/)
  })

  it('takes „Преглед на блока“ to each block’s page', () => {
    const links = [...blocks().querySelectorAll('a')].filter((link) => textOf(link) === 'Преглед на блока')

    expect(links.map((link) => link.getAttribute('href'))).toEqual(['/projects/mnogofamilna-sgrada/block-a', '/projects/mnogofamilna-sgrada/block-b'])
    expect(links.map((link) => link.closest('.blk').id)).toEqual(['blk-a', 'blk-b'])
  })
})

// Spec M3 §6.2 #4: the building, a split: the street perspective, graded to
// the night palette, and the brochure's line, production's description cut
// of its floors, the УПИ address and the facts, from the snapshot.
it('#sgradata: „С магазини и подземни гаражи“, production’s description and address, and the facts', () => {
  const doc = parse(prerender())
  const building = doc.querySelector('#sgradata')

  expect(textOf(building.querySelector('h2'))).toBe('С магазини и подземни гаражи')
  expect(textOf(building.querySelector('h2 em'))).toBe('гаражи')
  const description = building.querySelector('.mns__desc')
  expect(textOf(description)).toBe('Модерна многофамилна жилищна сграда с два блока (А и Б), гаражи и луксозни апартаменти в ж.к. Връбница-1. Част от апартаментите вече са продадени.')
  expect(description.textContent).toContain('с\u00A0два блока (А\u00A0и\u00A0Б)')
  expect(building.textContent).not.toMatch(/10 етажа|9 етажа/)
  expect(building.querySelector('.mns__addr').textContent).toBe('УПИ V-1344, кв.\u00A033, ж.к. Връбница-1, гр. София')

  const facts = [...building.querySelectorAll('.kv > div')].map((fact) => [textOf(fact.querySelector('dt')), textOf(fact.querySelector('dd'))])
  expect(facts).toEqual([
    [String(MN_FACTS.blocks), 'блока, А и Б'],
    [String(MN_FACTS.residentialFloors), 'жилищни етажа във всеки блок, от 2 до 10'],
    [String(MN_FACTS.apartments), 'апартамента, по 72 в блок'],
    [String(MN_FACTS.perFloor), 'апартамента на етаж, от 59,48 до 101,98 м²'],
  ])
  expect(facts.map(([figure]) => figure)).toEqual(['2', '9', '144', '8'])
  expect(building.querySelector('.kv').textContent).toContain(`до ${formatArea(MN_FACTS.maxArea)}`)
  expect(textOf(building.querySelector('.mns__types'))).toBe('72 двустайни · 72 тристайни')

  const photo = building.querySelector('.mns__media img')
  expect(photo.getAttribute('src')).toMatch(/^\/img\/mn-persp-\d+\.webp$/)
  expect(photo.getAttribute('alt')).toBe('Многофамилната сграда откъм улицата, визуализация')
  expect(photo.getAttribute('loading')).toBe('lazy')
  // The night grade, the perspective's own sky cut (mn.css), on the picture.
  expect([...building.querySelector('.mns__media picture').classList]).toEqual(expect.arrayContaining(['mn-night', 'mn-night--persp']))
})

// Spec M3 §6.2 #5: „Галерия със *снимки*“, three spreads: Блок А with Блок
// Б, the front with the perspective, then the two drawings whole, under
// production's titles. The first is on show.
it('#galeriya: three spreads, the third the two drawings whole, under production’s titles', () => {
  const doc = parse(prerender())
  const gallery = doc.querySelector('#galeriya')
  const layers = (spread) => [...gallery.querySelectorAll(`.gal__img[data-spread="${spread}"]`)]
  const source = (layer) => layer.querySelector('img').getAttribute('src').replace(/-\d+\.webp$/, '')

  expect(textOf(gallery.querySelector('h2'))).toBe('Галерия със снимки')
  expect(textOf(gallery.querySelector('h2 em'))).toBe('снимки')
  expect(gallery.querySelector('.gal__stage').getAttribute('aria-label')).toBe('Визуализации и планове')
  expect(textOf(gallery.querySelector('.gal__n'))).toBe('01 / 03')
  expect([0, 1, 2].map((spread) => layers(spread).map(source))).toEqual([
    ['/img/mn-block-a', '/img/mn-block-b'],
    ['/img/mn-front', '/img/mn-persp'],
    ['/img/mn-plan-drawing', '/img/mn-garages'],
  ])
  expect(layers(3)).toEqual([])
  // The first spread on show, its caption the live one, „А и“ bound as the
  // copy rules bind a one-letter word (ruling T5b): read as written, since
  // textOf folds a no-break space into a plain one.
  expect([...gallery.querySelectorAll('.gal__img[data-shown]')].map((layer) => layer.getAttribute('data-spread'))).toEqual(['0', '0'])
  expect(gallery.querySelector('.gal__cap').textContent).toBe('Блок А и блок Б.')

  // The drawings: whole, on their plates, each under its title.
  for (const layer of layers(2)) expect(layer.classList.contains('gal__img--whole')).toBe(true)
  for (const layer of [...layers(0), ...layers(1)]) expect(layer.classList.contains('gal__img--whole')).toBe(false)
  expect(layers(2).map((layer) => textOf(layer.querySelector('.gal__title')))).toEqual(['Архитектурен план на етажа', 'Блок А и Б – надземни и подземни гаражи'])
  expect(layers(2)[1].querySelector('.gal__title').textContent).toBe('Блок\u00A0А\u00A0и\u00A0Б\u00A0– надземни и\u00A0подземни гаражи')

  // The photos take the night grade, each its own sky cut (mn.css), the
  // mask that matches its file; the drawings keep their colours.
  for (const layer of [...layers(0), ...layers(1)]) {
    const img = layer.querySelector('img')
    const photo = source(layer).replace(/^\/img\/mn-/, '')
    expect(img.classList.contains('mn-night'), source(layer)).toBe(true)
    expect(img.classList.contains(`mn-night--${photo}`), source(layer)).toBe(true)
    expect([...img.classList].filter((name) => name.startsWith('mn-night--')), source(layer)).toHaveLength(1)
  }
  for (const layer of layers(2)) expect(layer.querySelector('img').className, source(layer)).toBe('')
})

// The sections under the opening are the final state too: nothing in them
// starts hidden, faded, moved or clipped (their reveals are motion's, from
// the markup, mn.motion.test.jsx).
it('starts nothing in #blokove, #sgradata or #galeriya hidden, faded, moved or clipped', () => {
  const doc = parse(prerender())
  for (const id of ['blokove', 'sgradata', 'galeriya']) {
    const section = doc.getElementById(id)
    const styles = [section, ...section.querySelectorAll('[style]')].map((element) => element.getAttribute('style') ?? '')
    expect(styles.filter((style) => /opacity|transform|translate|scale|clip|visibility|(^|;)\s*(width|height):\s*0/.test(style)), id).toEqual([])
    expect(section.querySelectorAll('[hidden]'), id).toHaveLength(0)
  }
})

// Spec M3 §6.2 #3: the list's heading and lead are in the HTML; the list
// itself loads in the browser.
it('prerenders the list’s heading and lead, and not the list', () => {
  const doc = parse(prerender())
  const list = doc.querySelector('#spisak')

  expect(textOf(list.querySelector('h2'))).toBe('Всички 144 апартамента')
  expect(textOf(list.querySelector('h2 em'))).toBe('144')
  expect(textOf(list.querySelector('.lead'))).toBe('По данни към 01.12.2025. Продадените остават в списъка.')
  expect(list.querySelector('.lead').textContent).toContain('в\u00A0списъка')
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
