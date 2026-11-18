// @vitest-environment node
import { JSDOM } from 'jsdom'
import { renderToString } from 'react-dom/server'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { goOffline } from '../../../tests/contracts/site'
import { availabilityPreload } from '../../data/availability/useAvailability'
import App from '../../root'
import Projects, { handle } from '../../routes/projects'
import { DISPLAY_FONT_PRELOADS } from '../../utils/fontLinks'

// The build prerenders Продажби in Node, where there is no window, and that
// HTML is the final visual state until the JS runs (plan, global rules; spec
// M3/M4 §7.1): one H1, the sales board with every apartment of both
// buildings as a square, Golden Residence's neutral until the store has its
// data and Многофамилна's in the dated snapshot's statuses, the two
// buildings row by row, and the closing. Nothing in the opening is hidden,
// faded or moved, for its entrance is CSS under the motion gate
// (projects.css). This file renders as the build does, in Node; the HTML is
// then only read. Its hydration is projects.hydration.test.jsx's.

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

// Spec §7.1, §4.1: the H1 „Продажби“, a big single-word title, in a mask
// authored by hand (never split by script above the fold).
it('prerenders one H1, „Продажби“, in its mask', () => {
  const doc = parse(prerender())
  const h1 = doc.querySelector('h1')

  expect(doc.querySelectorAll('h1')).toHaveLength(1)
  expect(textOf(h1)).toBe('Продажби')
  expect(h1.querySelector('.line-mask .split-line')).not.toBeNull()
  expect(doc.querySelector('#top h1')).toBe(h1)
})

it('runs #top and #sgradite, in that order, then the closing', () => {
  const doc = parse(prerender())

  expect([...doc.querySelectorAll('main section[id]')].map(({ id }) => id)).toEqual(['top', 'sgradite'])
  expect(doc.querySelectorAll('main section')).toHaveLength(3)
})

// The contract (tests/contracts/site.jsx): <main> names both buildings in
// its own text, before any data.
it('names Golden Residence and Многофамилна in <main> as static text', () => {
  const main = textOf(parse(prerender()).querySelector('main'))

  expect(main).toMatch(/Golden Residence/)
  expect(main).toMatch(/Многофамилна/)
})

describe('#top, the sales board', () => {
  const board = () => parse(prerender()).querySelector('#top')
  const squares = (key) => [...board().querySelectorAll(`.bd--${key} .blk__grid button`)]

  // Spec §7.1: production's lead, re-set with a dash, and the board's hint
  // in a desktop's words and a phone's (projects.css shows one).
  it('leads with production’s line and the board’s hint', () => {
    const top = board()
    expect(textOf(top.querySelector('.pz-lead'))).toBe('Открийте нашите атрактивни обекти за продажба – модерни апартаменти и жилищни сгради в престижни райони на София.')
    expect(top.querySelector('.pz-lead').textContent).toContain('и жилищни сгради в престижни')
    const hint = top.querySelector('#pz-hint')
    expect(textOf(hint)).toMatch(/^Всеки квадрат е апартамент, етажите отгоре надолу\./)
    expect(textOf(hint.querySelector('.pz-hint__fine'))).toBe('Посочете квадрат, за да видите етажа му, и кликнете, за да отворите апартамента.')
    expect(textOf(hint.querySelector('.pz-hint__touch'))).toBe('Докоснете квадрат, за да видите етажа му, и го докоснете отново, за да отворите апартамента.')
  })

  // Golden Residence left of the seam, Многофамилна right, each named, with
  // its address and the way to its page.
  it('stands Golden Residence and Многофамилна on the seam, each with its address and the way to its apartments', () => {
    const top = board()
    expect(top.querySelector('.pz-board > .seam')).not.toBeNull()
    expect([...top.querySelectorAll('.bd')].map((building) => building.className)).toEqual(['bd bd--gr', 'bd bd--mn'])
    expect([...top.querySelectorAll('.bd__name')].map(textOf)).toEqual(['Golden Residence', 'Многофамилна сграда'])
    expect([...top.querySelectorAll('.bd__name a')].map((link) => link.getAttribute('href'))).toEqual(['/projects/golden-residence', '/projects/mnogofamilna-sgrada'])
    expect([...top.querySelectorAll('.bd__addr')].map((address) => address.textContent)).toEqual([
      'ул. Ген. Климент Бояджиев, жк Левски Г, София',
      'УПИ V-1344, кв. 33, ж.к. Връбница-1, гр. София',
    ])
    const ways = [...top.querySelectorAll('.bd__go')]
    expect(ways.map((link) => [textOf(link), link.getAttribute('href')])).toEqual([
      ['Разгледайте апартаментите', '/projects/golden-residence#explorer'],
      ['Разгледайте апартаментите', '/projects/mnogofamilna-sgrada'],
    ])
  })

  // Spec §7.1: before Golden Residence's data arrives, its squares are there
  // at their final size, neutral, each named by its unit alone.
  it('draws Golden Residence’s 192 squares, neutral until its data arrives', () => {
    const gr = squares('gr')
    expect(gr).toHaveLength(192)
    expect(gr.every((square) => square.getAttribute('class') === 's-none')).toBe(true)
    expect(gr[0].getAttribute('aria-label')).toBe('А 801')
    expect(gr.at(-1).getAttribute('aria-label')).toBe('Б 112')
  })

  // Spec §5.1, §7.1: Многофамилна's from the dated snapshot, in the HTML.
  it('draws Многофамилна’s 144 squares in the snapshot’s statuses', () => {
    const mn = squares('mn')
    expect(mn).toHaveLength(144)
    const count = (look) => mn.filter((square) => square.getAttribute('class') === look).length
    expect([count('s-free'), count('s-reserved'), count('s-sold')]).toEqual([16, 6, 122])
    expect(mn[0].getAttribute('aria-label')).toBe('А-901, Продаден')
    expect(mn.find((square) => square.getAttribute('aria-label').startsWith('Б-702'))).toHaveAttribute('class', 's-free')
  })

  // One tab stop a block (ruling T8a): four stops for the 336 squares.
  it('puts one square of each block in the tab order', () => {
    const stops = [...board().querySelectorAll('.blk__grid button')].filter((square) => square.getAttribute('tabindex') === '0')
    expect(stops.map((square) => square.getAttribute('aria-label').split(',')[0])).toEqual(['А 801', 'Б 801', 'А-901', 'Б-901'])
  })

  it('names each building’s plot by the building, and describes it by the hint and its count', () => {
    const plots = [...board().querySelectorAll('.bd__plot')]
    const doc = plots[0].ownerDocument
    expect(plots.map((plot) => plot.getAttribute('role'))).toEqual(['group', 'group'])
    expect(plots.map((plot) => textOf(doc.getElementById(plot.getAttribute('aria-labelledby'))))).toEqual(['Golden Residence', 'Многофамилна сграда'])
    expect(plots.map((plot) => plot.getAttribute('aria-describedby').split(' ').map((id) => textOf(doc.getElementById(id))).slice(1))).toEqual([
      ['— свободни от 192 в момента'],
      ['16 свободни от 144, по данни към 01.12.2025'],
    ])
  })

  // Spec §7.1: „—“ until Golden Residence's data; Многофамилна's dated.
  it('counts „—“ for Golden Residence until its data, and Многофамилна’s free apartments with their date', () => {
    expect([...board().querySelectorAll('.bd__count')].map(textOf)).toEqual([
      '— свободни от 192 в момента',
      '16 свободни от 144, по данни към 01.12.2025',
    ])
  })

  // The idle caption is the building's legend with its counts.
  it('gives each building its legend with counts, Golden Residence’s „—“ until its data', () => {
    const legends = [...board().querySelectorAll('.bd__cap .legend')]
    expect(legends.map((legend) => [...legend.querySelectorAll('li')].map(textOf))).toEqual([
      ['— свободни', '— резервирани', '— продадени', '— блокирани'],
      ['16 свободни', '6 резервирани', '122 продадени', '0 блокирани'],
    ])
    for (const caption of board().querySelectorAll('.bd__cap')) expect(caption.getAttribute('aria-live')).toBe('polite')
  })

  it('names each block under its squares, and numbers the floors on each building’s outer side', () => {
    const top = board()
    expect([...top.querySelectorAll('.bd__bl')].map(textOf)).toEqual(['блок А', 'блок Б', 'блок А', 'блок Б'])
    for (const label of top.querySelectorAll('.bd__bl')) expect(label.getAttribute('aria-hidden')).toBe('true')
    const floors = (key) => [...top.querySelectorAll(`.bd--${key} .bd__blk`)].map((block) => [...block.querySelectorAll('.blk__fl span')].map(textOf))
    expect(floors('gr')).toEqual([['8', '7', '6', '5', '4', '3', '2', '1'], ['8', '7', '6', '5', '4', '3', '2', '1']])
    expect(floors('mn')[0]).toEqual(['10', '9', '8', '7', '6', '5', '4', '3', '2'])
  })
})

// Spec §7.1: the two buildings row by row, each row's name on the seam.
describe('#sgradite, the two buildings row by row', () => {
  const rows = () => parse(prerender()).querySelector('#sgradite')
  const row = (label) => [...rows().querySelectorAll('[role="row"]')].find((each) => textOf(each.querySelector('[role="rowheader"]') ?? each) === label)
  // Each building's answer, its paragraphs and figures one line apart.
  const values = (label) => [...row(label).querySelectorAll('[role="cell"]')].map((cell) => {
    const parts = [...cell.querySelectorAll('p')]
    return parts.length > 1 ? parts.map(textOf) : textOf(cell)
  })

  it('names the rows on the seam, in order', () => {
    expect([...rows().querySelectorAll('[role="rowheader"]')].map(textOf)).toEqual([
      'Адрес', 'Блокове и етажи', 'Апартаменти', 'Видове', 'Обща площ', 'Свободни', 'Гаражи и паркоместа', 'За проекта', 'Особености',
    ])
    expect(rows().querySelector('[role="table"]').getAttribute('aria-label')).toBe('Golden Residence и Многофамилна жилищна сграда, ред по ред')
  })

  it('heads them with the two renders, the names and their years', () => {
    const heads = [...rows().querySelectorAll('[role="columnheader"]')]
    expect(heads.map((head) => textOf(head.querySelector('h3')))).toEqual(['Golden Residence', 'Многофамилна жилищна сграда'])
    expect(heads.map((head) => textOf(head.querySelector('.led__type')))).toEqual(['Жилищна сграда, 2025', 'Жилищна сграда, 2024'])
    expect(heads.map((head) => head.querySelector('figure').getAttribute('data-wipe'))).toEqual(['l', 'r'])
    expect(heads.map((head) => head.querySelector('img').getAttribute('loading'))).toEqual(['lazy', 'lazy'])
  })

  // Spec §2, §7.1: the data's floors, never production's „10 етажа“.
  it('gives Многофамилна 2 blocks of 9 residential floors, and never „10 етажа“', () => {
    expect(values('Блокове и етажи')).toEqual(['Блок А и блок Б, по 8 етажа', '2 блока, 9 жилищни етажа (2–10)'])
    // Spec §4.5, M3 ruling T5b: „А“ and „и“ bound as well (final review, W4).
    expect(row('Блокове и етажи').textContent).toContain('Блок\u00a0А\u00a0и\u00a0блок\u00a0Б')
    const main = textOf(parse(prerender()).querySelector('main'))
    expect(main).not.toMatch(/10 етажа/)
    expect(main).not.toMatch(/9 етажа/)
  })

  it('counts the apartments, their types and their areas', () => {
    expect(values('Апартаменти')).toEqual(['192 по 96 в блок, 12 на етаж', '144 по 72 в блок, 8 на етаж'])
    expect(values('Видове')).toEqual(['— двустайни, — тристайни, — ателиета', '72 двустайни, 72 тристайни'])
    expect(values('Обща площ')).toEqual(['от 43,98 до 114,58 м²', 'от 59,48 до 101,98 м²'])
    expect(row('Обща площ').textContent).toContain('114,58 м²')
  })

  it('counts the free apartments, Golden Residence’s „—“ until its data, Многофамилна’s dated', () => {
    expect(values('Свободни')).toEqual([
      '— в момента: — в блок А и — в блок Б',
      '16 по данни към 01.12.2025: 4 в блок А и 12 в блок Б',
    ])
    // Spec §4.5: „блок А“ and the one-letter „и“ bound, as typed (textOf
    // folds U+00A0 into a space; final review, W4).
    for (const cell of row('Свободни').querySelectorAll('[role="cell"]')) {
      expect(cell.textContent).toMatch(/ в\u00a0блок\u00a0А\u00a0и\u00a0\S+ в\u00a0блок\u00a0Б$/)
    }
  })

  // Spec §7.1: Многофамилна's garages row is production's „Подземни гаражи“.
  it('gives the garages and parking places, Многофамилна’s as „Подземни гаражи“ with no counts', () => {
    expect(values('Гаражи и паркоместа')).toEqual([
      ['113 гаража и 68 паркоместа', 'свободни в момента: — гаража и — паркоместа'],
      'Подземни гаражи',
    ])
  })

  // Spec §2: production's descriptions, Golden Residence's without its stale
  // last sentence and Многофамилна's without its floors; its features
  // without them either.
  it('describes each building in production’s words, and lists its features', () => {
    expect(values('За проекта')).toEqual([
      'Модерна жилищна сграда с луксозни апартаменти в сърцето на София.',
      'Модерна многофамилна жилищна сграда с два блока (А и Б), гаражи и луксозни апартаменти в ж.к. Връбница-1. Част от апартаментите вече са продадени.',
    ])
    const lists = [...row('Особености').querySelectorAll('ul')].map((list) => [...list.querySelectorAll('li')].map(textOf))
    expect(lists).toEqual([
      ['Луксозни апартаменти', 'Централна локация', 'Модерна архитектура'],
      ['Подземни гаражи', 'Престижен район'],
    ])
  })

  // Spec §7.1: „Разгледайте апартаментите“ (solid) and „Запитване“, to the
  // contact page's form with the building chosen.
  it('ends each building on its page and its inquiry', () => {
    const links = [...rows().querySelectorAll('.led__act a')]
    expect(links.map((link) => [textOf(link), link.getAttribute('href'), link.getAttribute('data-variant')])).toEqual([
      ['Разгледайте апартаментите', '/projects/golden-residence#explorer', 'solid'],
      ['Запитване', '/contact?project=golden-residence#zapitvane', 'outline'],
      ['Разгледайте апартаментите', '/projects/mnogofamilna-sgrada', 'solid'],
      ['Запитване', '/contact?project=mnogofamilna-sgrada#zapitvane', 'outline'],
    ])
  })

  // The names kept in view while the rows scroll: a picture of the head,
  // hidden from assistive technology.
  it('carries the names to keep in view, hidden from assistive technology', () => {
    const bar = rows().querySelector('.led__bar')
    expect(bar.getAttribute('aria-hidden')).toBe('true')
    expect([...bar.children].map(textOf)).toEqual(['Golden Residence', 'Многофамилна сграда'])
  })
})

// Spec §7.1: „Търсите нов *дом*?“ and production's line, then the ways:
// „Попитайте за цени“ to the form, „Свържете се с нас“ with the phone.
it('closes on the hinge and the two ways: the form, and the contact page with the phone', () => {
  const closing = [...parse(prerender()).querySelectorAll('main section')].at(-1)

  expect(textOf(closing.querySelector('h2'))).toBe('Търсите нов дом?')
  expect(textOf(closing.querySelector('h2 em'))).toBe('дом')
  expect(textOf(closing.querySelector('.hinge .lead'))).toBe('Свържете се с нас за консултация и да обсъдим наличните апартаменти и бъдещи проекти.')
  const ways = [...closing.querySelectorAll('nav.ways a')]
  expect(ways.map((way) => [textOf(way.querySelector('.serif')), textOf(way.querySelector('.small')), way.getAttribute('href')])).toEqual([
    ['Попитайте за цени', 'Към запитването', '/contact#zapitvane'],
    ['Свържете се с нас', '+359 887 886 166', '/contact'],
  ])
  // Spec §4.5: the one-letter „с“ bound to „нас“, as typed (textOf folds
  // U+00A0 into a space; final review, W1).
  expect(ways[1].querySelector('.serif').textContent).toBe('Свържете се с нас')
})

// What an entrance's first frame would write, kept out of the opening: an
// element faded out, collapsed, moved away, clipped or hidden.
it('starts nothing in #top hidden, faded, moved or clipped', () => {
  const opening = parse(prerender()).querySelector('#top')
  const styles = [opening, ...opening.querySelectorAll('[style]')].map((element) => element.getAttribute('style') ?? '')

  expect(styles.filter((style) => /opacity|transform|translate|scale|clip|visibility|(^|;)\s*(width|height):\s*0/.test(style))).toEqual([])
  expect(opening.querySelectorAll('[hidden]')).toHaveLength(0)
})

// Ruling C5.4 (C4.10's pattern): only what the page uses at load, with the
// document it is first loaded as: the upright display face, which the title
// and the buildings' names set (no italic word in the first viewport), and
// the availability API, which Golden Residence's squares and counts read.
it('preloads only what the page uses at load', () => {
  const doc = parse(prerender())
  const preloads = [...doc.querySelectorAll('link[rel="preload"]')].map((link) => ({
    href: link.getAttribute('href'),
    as: link.getAttribute('as'),
  }))

  expect(preloads).toEqual(expect.arrayContaining([availabilityPreload, DISPLAY_FONT_PRELOADS[0]].map(({ href, as }) => ({ href, as }))))
  expect(preloads).toHaveLength(2)
})
