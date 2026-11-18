import { screen, within } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { goOffline, mainText, renderSiteAt } from '../../tests/contracts/site'
import * as euModule from './eu-proekt'

// The EU page (spec M3/M4 §7.5), opened as a visitor opens it
// (tests/contracts/site.jsx), offline. jsdom has no matchMedia, so there is
// no motion here: the page is its final state, the budget's seam at 70 %
// (eu-proekt.motion.test.jsx plays it). The cases (ruling M4-PF11): what the
// EU visibility rules and the contract (tests/contracts/eu-visibility.test.jsx)
// need of the page itself (the plate first, the title's name, each budget
// line one run of text, the one poster link), the copy's no-break spaces,
// the shell around a page with no inquiry of its own, and production's head.

const POSTER = '/eu/plakat-ksm-stroy-a3.pdf'
const EMBLEM = 'Съфинансирано от Европейския съюз'

beforeEach(() => {
  goOffline()
})
afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

// The contract's name for the title, exactly: its two masked lines read as
// one heading.
it('names its H1 exactly „Дигитализация на предприятията“', async () => {
  renderSiteAt('/eu-proekt')

  const h1 = await screen.findByRole('heading', { level: 1, name: 'Дигитализация на предприятията' })
  expect(screen.getAllByRole('heading', { level: 1 })).toEqual([h1])
})

// The teammate's rule (the emblem shows on landing, without scrolling) and
// spec §7.5: the co-funding plate is the page's first thing, before the
// title, the EU lockup first, then ПКИП. The header's EU row carries the
// emblem too; this is the page's own.
it('opens on the co-funding plate, before the title, the EU lockup first', async () => {
  renderSiteAt('/eu-proekt')
  const h1 = await screen.findByRole('heading', { level: 1, name: 'Дигитализация на предприятията' })
  const opening = h1.closest('section')

  const logos = within(opening).getAllByRole('img')
  expect(logos.map((img) => img.getAttribute('alt'))).toEqual([EMBLEM, 'Програма „Конкурентоспособност и иновации в предприятията“'])
  for (const logo of logos) expect(logo.compareDocumentPosition(h1) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  expect(document.querySelector('main #top')).toBe(opening)
})

// The contract: each line of the budget is one run of text, its label and
// its amount in one list item, in order.
it('reads each budget line as one run of text', async () => {
  renderSiteAt('/eu-proekt')
  await screen.findByRole('heading', { level: 1, name: 'Дигитализация на предприятията' })

  const lines = within(document.getElementById('byudzhet')).getAllByRole('listitem')
  expect(lines.map((line) => line.textContent.replace(/\s+/g, ' ').trim())).toEqual([
    'Общ бюджет: 35 320,04 евро',
    'Безвъзмездна финансова помощ: 24 724,03 евро',
    'Собствено съфинансиране: 10 596,01 евро',
    'Продължителност: от 27.01.2026 г. до 27.01.2027 г.',
  ])
  for (const line of lines.map((item) => item.textContent.replace(/\s+/g, ' '))) expect(mainText()).toContain(line.trim())
})

// The contract: exactly one link named „Изтегли плаката (PDF)“, to the
// poster; its ↓ is drawn, so the name is its words.
it('links the poster once, „Изтегли плаката (PDF)“, as a download', async () => {
  renderSiteAt('/eu-proekt')
  await screen.findByRole('heading', { level: 1, name: 'Дигитализация на предприятията' })

  const links = screen.getAllByRole('link', { name: 'Изтегли плаката (PDF)' })
  expect(links).toHaveLength(1)
  expect(links[0]).toHaveAttribute('href', POSTER)
  expect(links[0]).toHaveAttribute('download', 'Плакат A3 - КСМ Строй.pdf')
})

// Spec §7.5: the no-break spaces are fixed, „е да повиши“ among them.
it('binds „е да повиши“ with a no-break space', async () => {
  renderSiteAt('/eu-proekt')
  await screen.findByRole('heading', { level: 1, name: 'Дигитализация на предприятията' })

  expect(document.querySelector('main').textContent).toContain('Целта на проекта е\u00a0да повиши')
})

// The shell: the page has no inquiry of its own, so the header's
// „Запитване“ goes to the contact page's form (M3/M4 spec §8). Ruling C5.4:
// its preload goes out with the prerendered document only
// (eu-proekt.prerender.test.jsx), so a render in the browser adds none.
it('is a solid page that sends „Запитване“ to the contact form, and adds no preload in the browser', async () => {
  renderSiteAt('/eu-proekt')
  await screen.findByRole('heading', { level: 1, name: 'Дигитализация на предприятията' })

  expect(euModule.handle).toEqual({ header: 'solid' })
  expect('links' in euModule).toBe(false)
  expect(within(document.querySelector('header')).getByRole('link', { name: 'Запитване' })).toHaveAttribute('href', '/contact#zapitvane')
  expect(document.head.querySelectorAll('link[rel="preload"]')).toHaveLength(0)
})

// Ruling T6d: the page is in no chunk group (scripts/client-chunks.mjs), so
// it loads none of the facade group's code. It imports no group's head (the
// motion hook, as the reveals do, or the hydration hook), which would fail
// the build, and neither of the two preload helpers that every page of the
// facade group imports (src/utils/documentPreloads.js, src/utils/fontLinks.js),
// which would quietly take them out of the facade's chunk into one of their
// own, a script more on every page of the group. It asks React for its
// title face itself.
it('imports none of the facade group’s code', () => {
  const source = import.meta.glob('./eu-proekt.jsx', { query: '?raw', import: 'default', eager: true })['./eu-proekt.jsx']
  const imported = [...source.matchAll(/^import .* from '([^']+)'/gm)].map(([, from]) => from)

  expect(imported).toContain('react-dom')
  expect(imported.filter((from) => /^\.\.\/(motion\/|hooks\/useHydrated|utils\/documentPreloads|utils\/fontLinks)/.test(from))).toEqual([])
})

// The teammate's head, unchanged; its share image is the site's (ruling
// M4-PF6: the page has no photo of its own).
it('keeps the page’s head', () => {
  const head = euModule.meta()

  expect(head).toContainEqual({ title: 'Дигитализация на предприятията | КСМ Строй' })
  expect(head).toContainEqual({
    name: 'description',
    content: 'КСМ СТРОЙ ООД изпълнява проект № BG16RFPR001-1.012-1485-C01 „Дигитализация на предприятията“ по Програма „Конкурентоспособност и иновации в предприятията“ 2021-2027, съфинансирана от Европейския съюз.',
  })
  expect(head).toContainEqual({ tagName: 'link', rel: 'canonical', href: 'https://www.ksmstroy.com/eu-proekt' })
})
