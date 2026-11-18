// @vitest-environment node
import { JSDOM } from 'jsdom'
import { renderToString } from 'react-dom/server'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { goOffline } from '../../tests/contracts/site'
import images from '../data/images/shell.json'
import App from '../root'
import { DISPLAY_FONT_PRELOADS } from '../utils/fontLinks'
import EuProekt, { handle } from './eu-proekt'

// The build prerenders the EU page in Node, where there is no window, and
// that HTML is the final visual state until the JS runs (plan, global rules;
// spec M3/M4 §7.5): a document in three parts. #top, the seal on the fold:
// the co-funding plate on the seam, the title ending at it, the statement
// after it. #byudzhet, the budget, its seam at the grant's 70 %. #plakat, the
// poster and the disclaimer across the seam. Nothing in the opening is
// hidden, faded or moved, for its entrance is CSS under the motion gate
// (eu.css), and the plate never hides. This file renders as the build does,
// in Node; the HTML is then only read. Its hydration is
// eu-proekt.hydration.test.jsx's.

const PATH = '/eu-proekt'
const POSTER = '/eu/plakat-ksm-stroy-a3.pdf'
const routes = () => [{ path: '/', Component: App, children: [{ path: PATH.slice(1), Component: EuProekt, handle }] }]
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
  expect(prerender()).toContain('Дигитализация на предприятията')
})

// Spec §7.5: three parts, in order.
it('runs #top, #byudzhet, #plakat', () => {
  const doc = parse(prerender())
  const parts = [...doc.querySelector('#top').parentElement.children]

  expect(parts.map(({ id }) => id)).toEqual(['top', 'byudzhet', 'plakat'])
})

describe('#top, the seal on the fold', () => {
  const top = () => parse(prerender()).querySelector('#top')

  // Spec §7.5: the co-funding plate sits on the seam, the EU lockup first and
  // larger, then ПКИП, and it never hides, even during the entrance, so the
  // emblem shows on landing (the teammate's rule: without scrolling). It is
  // the page's first thing, before the title, and its logos load at once.
  it('opens on the co-funding plate, the EU lockup first, loaded at once and never hidden', () => {
    const doc = parse(prerender())
    const opening = doc.querySelector('#top')
    const plate = opening.querySelector('.seal .eu__plate')
    const logos = [...plate.querySelectorAll('img')]

    // The page's first part, and in it, after the seam, its first thing.
    expect(opening.parentElement.firstElementChild).toBe(opening)
    expect([...opening.children].map((child) => child.className)).toEqual(['seam doc__seam', 'seal', 'hinge doc__hinge'])
    expect(plate.compareDocumentPosition(opening.querySelector('h1')) & 4).toBe(4)
    expect(logos.map((img) => img.getAttribute('alt'))).toEqual([
      'Съфинансирано от Европейския съюз',
      'Програма „Конкурентоспособност и иновации в предприятията“',
    ])
    expect(logos.map((img) => img.getAttribute('src'))).toEqual([
      `${images['eu-cofunded-bg'].path}-900.webp`,
      `${images['eu-pkip'].path}-900.webp`,
    ])
    for (const img of logos) expect(img.getAttribute('loading')).toBe('eager')
    const seal = opening.querySelector('.seal')
    for (const element of [seal, ...seal.querySelectorAll('*')]) {
      expect(element.hasAttribute('hidden')).toBe(false)
      expect(element.getAttribute('style') ?? '').not.toMatch(/opacity|transform|translate|scale|clip|visibility/)
    }
    expect(opening.querySelector('.seam').getAttribute('aria-hidden')).toBe('true')
  })

  // Spec §7.5: the H1 „Дигитализация на | предприятията“ has no italic word
  // (it is the project's name) and ends at the seam, each line in a mask of
  // its own, authored by hand (never split by script above the fold); the
  // two paragraphs follow it, the teammate's text word for word, a no-break
  // space after „№“ and every one-letter word („е да повиши“), and inside
  // the company's name.
  it('prerenders one H1 in its two masks, with no italic word, and the statement after it', () => {
    const doc = parse(prerender())
    const h1 = doc.querySelector('h1')

    expect(doc.querySelectorAll('h1')).toHaveLength(1)
    expect(textOf(h1)).toBe('Дигитализация на предприятията')
    expect(h1.querySelectorAll('em')).toHaveLength(0)
    expect([...h1.querySelectorAll('.line-mask > .split-line')].map(textOf)).toEqual(['Дигитализация на', 'предприятията'])
    expect(doc.querySelector('#top').getAttribute('aria-labelledby')).toBe(h1.id)

    const paragraphs = [...doc.querySelectorAll('#top .doc__text > p')]
    expect(paragraphs.map(textOf)).toEqual([
      'КСМ СТРОЙ ООД изпълнява проект № BG16RFPR001-1.012-1485-C01 „Дигитализация на предприятията“ по Програма „Конкурентоспособност и иновации в предприятията“ 2021-2027, съфинансирана от Европейския съюз чрез Европейския фонд за регионално развитие.',
      'Целта на проекта е да повиши нивото на дигитализация на КСМ СТРОЙ ООД. Внедряват се четири свързани системи: за управление на ресурсите (ERP), за работа с клиенти (CRM), за бизнес анализи (BI) и за електронно обучение на служителите. Така обектите, офертите и клиентските запитвания се водят на едно място, а решенията се вземат по актуални данни.',
    ])
    expect(paragraphs[0].textContent).toContain('№\u00a0BG16RFPR001-1.012-1485-C01')
    expect(paragraphs[0].textContent).toMatch(/^\s*КСМ\u00a0СТРОЙ\u00a0ООД изпълнява/)
    expect(paragraphs[1].textContent).toContain('е\u00a0да повиши')
    expect(paragraphs[1].textContent).toContain('на КСМ\u00a0СТРОЙ\u00a0ООД.')
  })

  // What an entrance's first frame would write, kept out of the opening: an
  // element faded out, collapsed, moved away, clipped or hidden.
  it('starts nothing in #top hidden, faded, moved or clipped', () => {
    const opening = top()
    const styles = [opening, ...opening.querySelectorAll('[style]')].map((element) => element.getAttribute('style') ?? '')

    expect(styles.filter((style) => /opacity|transform|translate|scale|clip|visibility|(^|;)\s*(width|height):\s*0/.test(style))).toEqual([])
    expect(opening.querySelectorAll('[hidden]')).toHaveLength(0)
    expect(opening.querySelectorAll('[data-split], [data-fade], [data-draw], [data-wipe]')).toHaveLength(0)
  })
})

// Spec §7.5: the budget above and across the full width: the total, then the
// grant's half (umber) and KSM's own (onyx), which meet at the seam, then the
// dates. Each line is the legacy text, one run of text (the contract,
// tests/contracts/eu-visibility.test.jsx): its label and its amount in the
// one list item, a space between. No percentage is printed. The seam's 70 %
// is the stylesheet's at rest (eu.css), so the HTML carries no mark of the
// band's own (data-band); its wait for the visitor is marked only once the
// page has hydrated (eu-proekt.motion.test.jsx).
describe('#byudzhet, the budget on the seam', () => {
  const budget = () => parse(prerender()).querySelector('#byudzhet')

  it('sets each budget line as one run of text, in the band’s four places', () => {
    const items = [...budget().querySelectorAll('ul.fund__list > li')]

    expect(items.map((item) => item.className)).toEqual(['fund__total', 'fund__grant', 'fund__own', 'fund__time'])
    expect(items.map(textOf)).toEqual([
      'Общ бюджет: 35 320,04 евро',
      'Безвъзмездна финансова помощ: 24 724,03 евро',
      'Собствено съфинансиране: 10 596,01 евро',
      'Продължителност: от 27.01.2026 г. до 27.01.2027 г.',
    ])
    for (const item of items) {
      expect([...item.children].map((child) => child.className)).toEqual(['fund__k', 'fund__v'])
      expect(item.childNodes).toHaveLength(3)
      expect(item.childNodes[1].nodeType === 3 && item.childNodes[1].textContent).toBe(' ')
      expect(item.querySelectorAll('br')).toHaveLength(0)
    }
    expect(items.map((item) => item.querySelector('.fund__v').textContent)).toEqual([
      '35\u00a0320,04\u00a0евро',
      '24\u00a0724,03\u00a0евро',
      '10\u00a0596,01\u00a0евро',
      'от 27.01.2026\u00a0г. до 27.01.2027\u00a0г.',
    ])
  })

  it('prints no percentage and leaves the seam’s place to the stylesheet', () => {
    const band = budget()

    expect(band.textContent).not.toMatch(/%/)
    expect(band.querySelector('.fund__list').hasAttribute('style')).toBe(false)
    expect(band.querySelector('.fund__list').hasAttribute('data-band')).toBe(false)
  })
})

// data-split is the system's SplitText marker (Diptych §5.7,
// src/motion/useReveals.js), never used above the fold (spec §4.2): the
// opening's masks are authored by hand, the band's total is in the first
// viewport at 1440 × 900, and nothing on the page carries it.
it('marks nothing on the page with data-split', () => {
  expect(parse(prerender()).querySelectorAll('[data-split]')).toHaveLength(0)
})

// Spec §7.5: „Изтегли плаката (PDF)“ with a ↓, the page's only such link,
// across the seam from the disclaimer, word for word. The part is still
// (ruling T6d): the page's last word, with none of the system's reveals
// (eu-proekt.motion.test.jsx).
describe('#plakat, the poster and the disclaimer', () => {
  const poster = () => parse(prerender()).querySelector('#plakat')

  it('links the poster once, with its ↓ hidden from assistive technology', () => {
    const doc = parse(prerender())
    const links = [...doc.querySelectorAll('main a')].filter((a) => textOf(a) === 'Изтегли плаката (PDF)')

    expect(links).toHaveLength(1)
    const [link] = links
    expect(link.closest('#plakat')).not.toBeNull()
    expect(link.getAttribute('href')).toBe(POSTER)
    expect(link.getAttribute('download')).toBe('Плакат A3 - КСМ Строй.pdf')
    const arrow = link.querySelector('svg')
    expect(arrow.getAttribute('aria-hidden')).toBe('true')
    expect(arrow.classList.contains('arr--down')).toBe(true)
    expect([...doc.querySelectorAll('main a')].filter((a) => a.getAttribute('href') === POSTER)).toHaveLength(1)
  })

  it('reads the disclaimer across the seam, still: nothing in the part is marked for a reveal', () => {
    const part = poster()

    expect(textOf(part.querySelector('.fin__note'))).toBe(
      'Цялата отговорност за съдържанието се носи от КСМ СТРОЙ ООД и при никакви обстоятелства не може да се приема, че този документ отразява официалното становище на Европейския съюз и Управляващия орган.',
    )
    expect(part.querySelector('.fin__note').textContent).toContain('от КСМ\u00a0СТРОЙ\u00a0ООД и\u00a0при')
    expect(part.querySelector(':scope > .seam').getAttribute('aria-hidden')).toBe('true')
    expect(part.querySelectorAll('[data-split], [data-fade], [data-draw], [data-wipe]')).toHaveLength(0)
  })
})

// Spec §4.5, §7.5: a no-break space after every one-letter word in the page's
// copy.
it('binds every one-letter word to the next', () => {
  const main = parse(prerender()).querySelector('main')

  expect(main.textContent).not.toMatch(/(^|[\s„(])[А-Яа-яA-Za-z] /u)
})

// The company's name never breaks across lines, wherever the page's copy
// names it: the statement's two paragraphs and the disclaimer, a no-break
// space inside it, as За нас binds „КСМ Строй ООД“ (src/pages/about/Offer.jsx).
it('binds the company’s name wherever the copy names it', () => {
  const names = parse(prerender()).querySelector('main').textContent.match(/КСМ\s+СТРОЙ\s+ООД/g)

  expect(names).toEqual(['КСМ\u00a0СТРОЙ\u00a0ООД', 'КСМ\u00a0СТРОЙ\u00a0ООД', 'КСМ\u00a0СТРОЙ\u00a0ООД'])
})

// Ruling C5.4 (C4.10's pattern): only what the page uses at load, with the
// document it is first loaded as: the upright display face, which the title
// sets in the first viewport. It has no italic word and no count. The page
// writes that preload itself (eu-proekt.jsx; ruling T6d keeps the site's
// helpers out of its first load), so it is pinned to the site's own
// (src/utils/fontLinks.js), its type and CORS mode too, which the font's
// request must match to reuse it.
it('preloads the upright display face and nothing else', () => {
  const doc = parse(prerender())
  const preloads = [...doc.querySelectorAll('link[rel="preload"]')].map((link) => ({
    href: link.getAttribute('href'),
    as: link.getAttribute('as'),
    type: link.getAttribute('type'),
    crossorigin: link.getAttribute('crossorigin'),
  }))

  expect(preloads).toEqual([{ href: DISPLAY_FONT_PRELOADS[0].href, as: 'font', type: DISPLAY_FONT_PRELOADS[0].type, crossorigin: '' }])
  expect(DISPLAY_FONT_PRELOADS[0]).toMatchObject({ href: '/fonts/ksm-display.woff2', type: 'font/woff2', crossOrigin: 'anonymous' })
})
