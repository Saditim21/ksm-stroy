// @vitest-environment node
import { JSDOM } from 'jsdom'
import { renderToString } from 'react-dom/server'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { goOffline } from '../../../tests/contracts/site'
import { SITE, hoursLong, mapsUrl } from '../../config/site'
import { availabilityPreload } from '../../data/availability/useAvailability'
import App from '../../root'
import Contact, { handle } from '../../routes/contact'
import { DISPLAY_FONT_PRELOADS } from '../../utils/fontLinks'
import { bindAddress } from '../../utils/format'

// The build prerenders Контакти in Node, where there is no window, and that
// HTML is the final visual state until the JS runs (plan, global rules; spec
// M3/M4 §7.3): one H1, the phones and the hours first, the form ready to
// fill with its subjects as one radio group, the offices and the closing
// ways, and nothing in the opening hidden, faded or moved, for its entrance
// is CSS under the motion gate (contact.css). This file renders as the build
// does, in Node; the HTML is then only read. Its hydration is
// contact.hydration.test.jsx's.

const PATH = '/contact'
const routes = () => [{ path: '/', Component: App, children: [{ path: PATH.slice(1), Component: Contact, handle }] }]
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
  expect(prerender()).toContain('Как можете')
})

// Spec §7.3: the question, „Как можете да се *свържете* с нас“, in three
// masks authored by hand (never split by script above the fold).
it('prerenders one H1, „Как можете да се свържете с нас“, in three masked lines', () => {
  const doc = parse(prerender())
  const h1 = doc.querySelector('h1')

  expect(doc.querySelectorAll('h1')).toHaveLength(1)
  expect(textOf(h1)).toBe('Как можете да се свържете с нас')
  expect(textOf(h1.querySelector('em'))).toBe('свържете')
  expect([...h1.querySelectorAll('.line-mask')].map(textOf)).toEqual(['Как можете', 'да се свържете', 'с нас'])
  expect(h1.textContent).toContain('с\u00A0нас')
  expect(doc.querySelector('#top h1')).toBe(h1)
  expect(textOf(doc.querySelector('#top .reach__lead'))).toBe('Нашият екип е на ваше разположение за консултации, оферти и отговори на всички ваши въпроси.')
  expect(doc.querySelector('#top .reach__lead').textContent).toContain('е\u00A0на ваше разположение за консултации, оферти и\u00A0отговори')
})

it('runs #top, #zapitvane and #ofisi, in that order, then the closing', () => {
  const doc = parse(prerender())

  expect([...doc.querySelectorAll('main section[id]')].map(({ id }) => id)).toEqual(['top', 'zapitvane', 'ofisi'])
  expect(doc.querySelectorAll('main section')).toHaveLength(4)
})

describe('#top, the answer', () => {
  const answer = () => parse(prerender()).querySelector('#top .reach__a')

  it('gives both phones, the primary first', () => {
    const phones = [...answer().querySelectorAll('a[href^="tel:"]')]
    expect(phones.map((link) => [textOf(link), link.getAttribute('href')])).toEqual([
      ['+359 887 886 166', 'tel:+359887886166'],
      ['+359 885 762 224', 'tel:+359885762224'],
    ])
  })

  // Spec §2, §7.3: the hours in their long form, from the one source, and no
  // live open or closed line.
  it('gives the hours in their long form, and no open or closed line', () => {
    const rows = [...answer().querySelectorAll('.reach__hours > div')]
    expect(rows.map((row) => ({ day: textOf(row.querySelector('dt')), time: textOf(row.querySelector('dd')) }))).toEqual(hoursLong())
    expect(rows.map((row) => `${textOf(row.querySelector('dt'))} ${textOf(row.querySelector('dd'))}`)).toEqual(['Понеделник – петък 8:00–18:00', 'Събота 9:00–14:00', 'Неделя почивен ден'])
    expect(answer().textContent).not.toMatch(/Сега е|отворено|затворено/)
  })

  it('gives the email, and the way to the form', () => {
    expect(answer().querySelector(`a[href="mailto:${SITE.email}"]`)).not.toBeNull()
    const go = [...answer().querySelectorAll('a')].find((link) => textOf(link) === 'Изпратете запитване')
    expect(go.getAttribute('href')).toBe('#zapitvane')
  })

  it('labels each detail', () => {
    expect([...answer().querySelectorAll('h2')].map(textOf)).toEqual(['Телефон', 'Работно време', 'Имейл'])
  })
})

describe('#zapitvane, the form', () => {
  const inquiry = () => parse(prerender()).querySelector('#zapitvane')

  it('heads the form „Изпратете запитване“ and sets it in one <form> across both halves', () => {
    const section = inquiry()
    expect(textOf(section.querySelector('h2'))).toBe('Изпратете запитване')
    expect(textOf(section.querySelector('h2 em'))).toBe('запитване')
    const forms = section.querySelectorAll('form')
    expect(forms).toHaveLength(1)
    expect(forms[0].querySelector('fieldset')).not.toBeNull()
    expect(forms[0].querySelector('#f-name')).not.toBeNull()
  })

  // Spec §7.3: the subjects as one radio group under „Интересувам се от“,
  // Golden Residence chosen; its count arrives with the data (`—` until
  // then), Многофамилна's is dated.
  it('offers the four subjects as one radio group, Golden Residence chosen', () => {
    const group = inquiry().querySelector('fieldset')
    expect(textOf(group.querySelector('legend'))).toBe('Интересувам се от')
    const radios = [...group.querySelectorAll('input[type="radio"]')]
    expect(radios.map((radio) => radio.value)).toEqual(['golden-residence', 'mnogofamilna', 'build', 'other'])
    expect(new Set(radios.map((radio) => radio.name)).size).toBe(1)
    expect(radios.filter((radio) => radio.hasAttribute('checked')).map((radio) => radio.value)).toEqual(['golden-residence'])
    const names = radios.map((radio) => textOf(group.ownerDocument.getElementById(radio.getAttribute('aria-labelledby'))))
    expect(names).toEqual(['Golden Residence', 'Многофамилна сграда', 'Строителство или ремонт', 'Друго'])
    const meta = (radio) => textOf(group.ownerDocument.getElementById(radio.getAttribute('aria-describedby')))
    expect(meta(radios[0])).toBe('— свободни от 192 · жк Левски Г')
    expect(meta(radios[1])).toBe('16 свободни от 144 · по данни към 01.12.2025 · ж.к. Връбница-1')
    expect(group.textContent).toContain('жк\u00A0Левски\u00A0Г')
    expect(group.hasAttribute('disabled')).toBe(false)
  })

  it('shows Golden Residence’s picture under the subjects', () => {
    const plates = [...inquiry().querySelectorAll('.plate')]
    expect(plates.map((plate) => plate.getAttribute('data-plate'))).toEqual(['golden-residence', 'mnogofamilna', 'build', 'other'])
    expect(plates.filter((plate) => plate.classList.contains('is-on')).map((plate) => plate.getAttribute('data-plate'))).toEqual(['golden-residence'])
    expect(plates[0].querySelector('img').getAttribute('src')).toMatch(/^\/img\/gr-dusk-\d+\.webp$/)
    expect(plates[0].closest('[aria-hidden="true"]')).not.toBeNull()
  })

  it('has the form’s fields, its consent and its action, and no construction group yet', () => {
    const section = inquiry()
    const label = (id) => textOf(section.querySelector(`label[for="${id}"]`))
    expect(['f-name', 'f-tel', 'f-email', 'f-msg'].map(label)).toEqual(['Име', 'Телефон', 'Имейл', 'Съобщение'])
    expect(section.querySelector('#f-consent').getAttribute('type')).toBe('checkbox')
    const send = section.querySelector('button[type="submit"]')
    expect(textOf(send)).toBe('Изпратете запитване')
    expect(section.querySelector('#f-type, #f-budget, .field__hint')).toBeNull()
    expect(section.querySelector('select')).toBeNull()
  })
})

// Spec §7.3: the two offices as the two doors, each with its full address
// and its search on Google Maps, in a new tab, named for a screen reader.
describe('#ofisi, the offices', () => {
  const offices = () => parse(prerender()).querySelector('#ofisi')

  it('heads them „Нашите офиси“, production’s line after it', () => {
    const section = offices()
    expect(textOf(section.querySelector('h2'))).toBe('Нашите офиси')
    expect(textOf(section.querySelector('h2 em'))).toBe('офиси')
    expect(textOf(section.querySelector('.hinge .lead'))).toBe('Посетете ни в един от нашите офиси за лична консултация и обсъждане на вашия проект.')
  })

  it('names both cities and gives both addresses, each with „Отвори в Google Maps“', () => {
    const section = offices()
    expect([...section.querySelectorAll('h3')].map(textOf)).toEqual(['София', 'Гоце Делчев'])
    expect([...section.querySelectorAll('.office__addr')].map((address) => address.textContent)).toEqual(SITE.offices.map(bindAddress))
    const maps = [...section.querySelectorAll('a')].filter((link) => textOf(link).startsWith('Отвори в Google Maps'))
    expect(maps).toHaveLength(2)
    expect(maps.map((link) => link.getAttribute('href'))).toEqual(SITE.offices.map(mapsUrl))
    for (const link of maps) expect([link.getAttribute('target'), link.getAttribute('rel')]).toEqual(['_blank', 'noopener noreferrer'])
    expect(maps.map((link) => textOf(link.querySelector('.sr-only')))).toEqual([': офисът в София', ': офисът в Гоце Делчев'])
    expect(section.querySelector('.doorway__node svg').getAttribute('aria-hidden')).toBe('true')
  })
})

// Spec §7.3: „Готови сте да започнете своя *проект*?“ and production's line,
// then the two ways.
it('closes on the hinge and the two ways: the form, and a call', () => {
  const closing = [...parse(prerender()).querySelectorAll('main section')].at(-1)

  expect(textOf(closing.querySelector('h2'))).toBe('Готови сте да започнете своя проект?')
  expect(textOf(closing.querySelector('h2 em'))).toBe('проект')
  expect(textOf(closing.querySelector('.hinge .lead'))).toBe('Нашият екип е готов да ви помогне да реализирате мечтания проект с качество и професионализъм.')
  const ways = [...closing.querySelectorAll('nav.ways a')]
  expect(ways.map((way) => [textOf(way.querySelector('.serif')), textOf(way.querySelector('.small')), way.getAttribute('href')])).toEqual([
    ['Получете безплатна оферта', 'Към запитването', '#zapitvane'],
    ['Обадете се сега', '+359 887 886 166', 'tel:+359887886166'],
  ])
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
// document it is first loaded as: both display faces, which its title sets,
// and the availability API, which Golden Residence's count and its
// apartments read (the root adds the text face every page has).
it('preloads only what the page uses at load', () => {
  const doc = parse(prerender())
  const preloads = [...doc.querySelectorAll('link[rel="preload"]')].map((link) => ({
    href: link.getAttribute('href'),
    as: link.getAttribute('as'),
  }))

  expect(preloads).toEqual(expect.arrayContaining([availabilityPreload, ...DISPLAY_FONT_PRELOADS].map(({ href, as }) => ({ href, as }))))
  expect(preloads).toHaveLength(3)
})
