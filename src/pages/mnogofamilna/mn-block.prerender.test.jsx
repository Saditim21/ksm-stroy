// @vitest-environment node
import { JSDOM } from 'jsdom'
import { renderToString } from 'react-dom/server'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { goOffline } from '../../../tests/contracts/site'
import App from '../../root'
import { availabilityPreload } from '../../data/availability/useAvailability'
import MnogofamilnaBlock, { handle } from '../../routes/mnogofamilna-block'
import { DISPLAY_FONT_PRELOADS } from '../../utils/fontLinks'

// The build prerenders each Многофамилна block page in Node, where there is
// no window, and that HTML is the final visual state until the JS runs (plan,
// global rules; spec M3 §5.1, §6.5): one H1, the dated snapshot's real
// numbers (never `—`, never a zero), the block's floors as rows, each with
// its plan in its statuses' colours, beside the block's own night facade with
// its lit floors, then the inquiry. Rendered as the build does, with the
// block's path as its route's id (src/routes.js); the HTML is then only read.
// Its hydration is mn-block.hydration.test.jsx's.

const pathOf = (id) => `/projects/mnogofamilna-sgrada/${id}`
const page = (id) => {
  const path = pathOf(id)
  const routes = [{ path: '/', Component: App, children: [{ id: path.slice(1), path: path.slice(1), Component: MnogofamilnaBlock, handle }] }]
  return <RouterProvider router={createMemoryRouter(routes, { initialEntries: [path] })} />
}
// React separates neighbouring text nodes with an empty comment.
const prerender = (id) => renderToString(page(id)).replaceAll('<!-- -->', '')
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
  expect(prerender('block-a')).toContain('Многофамилна сграда')
})

// The snapshot of 01.12.2025 (spec M3 §2): block А has 4 free, 4 reserved
// and 64 sold, its free apartments on floors 2 and 9; block Б 12, 2 and 58,
// on floors 2–5 and 7–9.
describe.each([
  {
    id: 'block-a',
    letter: 'А',
    counts: ['4 свободни', '4 резервирани', '64 продадени', '0 блокирани'],
    lit: ['А-2', 'А-9'],
  },
  {
    id: 'block-b',
    letter: 'Б',
    counts: ['12 свободни', '2 резервирани', '58 продадени', '0 блокирани'],
    lit: ['Б-2', 'Б-3', 'Б-4', 'Б-5', 'Б-7', 'Б-8', 'Б-9'],
  },
])('/projects/mnogofamilna-sgrada/$id', ({ id, letter, counts, lit }) => {
  const doc = () => parse(prerender(id))

  // Spec M3 §6.5: „Многофамилна сграда, блок *А*“, the block bound to its
  // letter (M3 §4.5).
  it('prerenders one H1, „Многофамилна сграда, блок А“, its letter in italics', () => {
    const html = doc()
    const h1 = html.querySelector('h1')

    expect(html.querySelectorAll('h1')).toHaveLength(1)
    expect(textOf(h1)).toBe(`Многофамилна сграда, блок ${letter}`)
    expect(h1.textContent).toContain(`блок\u00A0${letter}`)
    expect(textOf(h1.querySelector('em'))).toBe(letter)
  })

  it('leads back to the building before its H1', () => {
    const html = doc()
    const back = [...html.querySelectorAll('main a')].find((link) => textOf(link) === 'Към Многофамилна сграда')

    expect(back.getAttribute('href')).toBe('/projects/mnogofamilna-sgrada')
    expect(back.compareDocumentPosition(html.querySelector('h1')) & 4).toBeTruthy()
  })

  // Spec M3 §6.5: the head's other side, the block's facts, its counts by
  // status and the date they are from.
  it('states the block’s facts, its counts by status and their date', () => {
    const head = doc().querySelector('.bp')

    const facts = head.querySelector('.bp__facts')
    expect(textOf(facts)).toBe('72 апартамента · 9 етажа (2–10) · 8 на етаж')
    expect(facts.textContent).toBe('72\u00A0апартамента · 9\u00A0етажа (2–10) · 8\u00A0на етаж')
    expect([...head.querySelectorAll('.legend .st')].map(textOf)).toEqual(counts)
    expect(textOf(head.querySelector('.mbh__date'))).toBe('По данни към 01.12.2025.')
    expect(head.textContent).not.toMatch(/—/)
  })

  // Spec M3 §6.5: the floors from 10 down to 2, each its number, its
  // counts, its plan in its statuses' colours, its range line or
  // „Разпродаден етаж“, and „Отворете плана“; floor 10 the attic.
  it('runs nine floors from 10 down to 2, each its counts, its plan and its range', () => {
    const rows = [...doc().querySelectorAll('#explorer .mbr')]

    expect(rows.map((row) => row.getAttribute('data-k'))).toEqual([10, 9, 8, 7, 6, 5, 4, 3, 2].map((floor) => `${letter}-${floor}`))
    for (const [i, row] of rows.entries()) {
      const floor = 10 - i
      expect(textOf(row.querySelector('.mbr__no b')), `${floor}`).toBe(String(floor))
      expect(textOf(row.querySelector('h3')), `${floor}`).toBe(`Етаж ${floor}`)
      expect(textOf(row.querySelector('.mbr__meta')), `${floor}`).toBe(floor === 10 ? 'тавански етаж · 8 апартамента' : '8 апартамента')
      expect(row.querySelectorAll('.mbr__counts .st'), `${floor}`).toHaveLength(4)
      // A mini plan of the floor's 8 apartments, each in its status.
      const plan = row.querySelector('.mbr__plan svg.plan.plan--mini')
      const statuses = [...plan.querySelectorAll('.u')].map((unit) => unit.getAttribute('data-status'))
      expect(statuses, `${floor}`).toHaveLength(8)
      for (const status of statuses) expect(['available', 'reserved', 'sold'], `${floor}`).toContain(status)
      expect(row.querySelector('.mbr__foot').textContent, `${floor}`).toMatch(/^(свобод|Няма свободни|Разпродаден етаж)/)
      expect(textOf(row.querySelector('.mbr__go')), `${floor}`).toBe('Отворете плана')
    }
    expect(rows.map((row) => textOf(row.querySelector('.mbr__counts'))).join(' ')).not.toMatch(/—/)
  })

  it('prerenders no dialog', () => {
    expect(doc().querySelector('[role="dialog"]')).toBeNull()
  })

  // Spec M3 §6.5, ruling PF9: the block's own night facade, cropped to the
  // block, with that block's lit floors alone; the rest of the building
  // never shows.
  it('shows the block’s own facade, its crop and its lit floors only', () => {
    const html = doc()
    const facade = html.querySelector('#explorer .fx')

    expect(facade.classList.contains('fx--mn')).toBe(true)
    expect(facade.classList.contains('fx--block')).toBe(true)
    expect(facade.getAttribute('data-block')).toBe(letter)
    expect([...facade.querySelectorAll('[data-lit]')].map((floor) => floor.getAttribute('data-lit')).sort()).toEqual(lit)
    expect(facade.querySelector('.fx__lights').getAttribute('aria-hidden')).toBe('true')
    expect(facade.querySelector('picture.fx__pic img').getAttribute('src')).toMatch(/^\/img\/mn-dusk-off-\d+\.webp$/)
    // Its rail: the block's nine floors, each its free count.
    const rails = [...facade.querySelectorAll(`.fx__rail--${letter === 'А' ? 'a' : 'b'} .fx__cnt`)]
    expect(rails.map((rail) => rail.getAttribute('data-k'))).toEqual([10, 9, 8, 7, 6, 5, 4, 3, 2].map((floor) => `${letter}-${floor}`))
    expect(rails.map((rail) => textOf(rail.querySelector('.n'))).join(' ')).not.toMatch(/—/)
    // No edge panel and no sheet: a block page's rows are its floors' panels.
    expect(html.querySelectorAll('.fxp, .sheet')).toHaveLength(0)
    // What lights, as of when; and what the rail counts.
    expect(textOf(html.querySelector('#explorer .mbl__cap'))).toMatch(/^Светят етажите със свободни апартаменти, по данни към 01\.12\.2025\. Цифрите отстрани са свободните апартаменти на всеки етаж\./)
  })

  // Spec M3 §6.5: block Б mirrored by a class on the page's root, the same
  // markup otherwise.
  it(letter === 'Б' ? 'mirrors the page by its root’s class' : 'keeps the page unmirrored', () => {
    const root = doc().querySelector('.mbp')

    expect(root.classList.contains('mbp--b')).toBe(letter === 'Б')
  })

  // Spec M3 §6.5: the foot, Многофамилна's inquiry, its subject first and
  // chosen.
  it('ends on #kontakti, the inquiry, Многофамилна chosen', () => {
    const html = doc()
    const sections = [...html.querySelectorAll('main section[id]')]

    expect(sections.map((section) => section.id)).toEqual(['explorer', 'kontakti'])
    expect(html.querySelector('#kontakti #zapitvane')).not.toBeNull()
    expect(textOf(html.querySelector('#kontakti h2'))).toBe('Свържете се с нас')
    expect(html.querySelector('#kontakti select').value).toBe('mnogofamilna')
  })

  // What an entrance's first frame would write, kept out of the head and the
  // floors: an element faded out, collapsed, moved away, clipped or hidden.
  it('starts nothing in the head or the floors hidden, faded, moved or clipped', () => {
    const html = doc()
    for (const part of [html.querySelector('.bp'), html.querySelector('#explorer')]) {
      const styles = [part, ...part.querySelectorAll('[style]')].map((element) => element.getAttribute('style') ?? '')
      expect(styles.filter((style) => /opacity|transform|translate|scale|clip|visibility|(^|;)\s*(width|height):\s*0/.test(style))).toEqual([])
      expect(part.outerHTML).not.toMatch(/\bopacity-0\b|\binvisible\b/)
      expect(part.querySelectorAll('[hidden]')).toHaveLength(0)
    }
  })

  // Ruling C5.4: only what the page uses at load, with the document it is
  // first loaded as: the availability API and both display faces, which its
  // title sets.
  it('preloads only what the page uses at load', () => {
    const preloads = [...doc().querySelectorAll('link[rel="preload"]')].map((link) => ({ href: link.getAttribute('href'), as: link.getAttribute('as') }))

    expect(preloads).toEqual(expect.arrayContaining([availabilityPreload, ...DISPLAY_FONT_PRELOADS].map(({ href, as }) => ({ href, as }))))
    expect(preloads).toHaveLength(3)
  })
})

// The snapshot's floors as each block's rows say them (spec §7.3's range
// line): a floor with free apartments gives their areas, one with reserved
// ones alone says so, and a sold-out floor says „Разпродаден етаж“.
it.each([
  ['block-a', 'А-10', 'Разпродаден етаж'],
  ['block-a', 'А-9', 'свободни от 63,87 до 69,15 м²'],
  ['block-a', 'А-8', 'Няма свободни, има резервирани.'],
  ['block-a', 'А-3', 'Разпродаден етаж'],
  ['block-a', 'А-2', 'свободни от 69,15 до 100,75 м²'],
  ['block-b', 'Б-10', 'Разпродаден етаж'],
  ['block-b', 'Б-9', 'свободни от 63,84 до 100,71 м²'],
  ['block-b', 'Б-6', 'Разпродаден етаж'],
])('%s: the row of %s reads „%s“', (id, key, line) => {
  const row = parse(prerender(id)).querySelector(`#explorer .mbr[data-k="${key}"]`)

  expect(textOf(row.querySelector('.mbr__range'))).toBe(line)
})
