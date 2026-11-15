import { screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { goOffline, renderSiteAt } from '../../../tests/contracts/site'
import { availabilityPreload } from '../../data/availability/useAvailability'
import { DISPLAY_FONT_PRELOADS } from '../../utils/fontLinks'
import { handle, links } from '../Home'

// Home (spec §8.1): the split opening with slogan A, the company section and
// production's EU poster section, opened as a visitor opens it
// (tests/contracts/site.jsx), offline, so the counts come from the data built
// into the site.

beforeEach(() => {
  goOffline()
  renderSiteAt('/')
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

it('opens with slogan A, read row by row across the seam', async () => {
  const h1 = await screen.findByRole('heading', { level: 1 })
  expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
  expect(h1.textContent.replace(/\s+/g, ' ').trim()).toBe('Създаваме пространства за мечтания живот')
  expect(h1.querySelector('em')).toHaveTextContent('мечтания')
  expect([...h1.querySelectorAll('[data-part]')].map((p) => p.textContent.replace(/\s+/g, ' ')))
    .toEqual(['Създаваме', 'пространства', 'за мечтания', 'живот'])
})

it('links both buildings with their counts', async () => {
  await waitFor(() => expect(screen.getByRole('link', { name: /^Golden Residence, жк Левски Г: \d+ свободни апартамента от 192\. Изберете апартамент\.$/ })).toHaveAttribute('href', '/projects/golden-residence'))
  expect(screen.getByRole('link', { name: 'Многофамилна сграда, ж.к. Връбница-1: 16 свободни апартамента от 144 по данни към 01.12.2025. Запитване за сградата.' }))
    .toHaveAttribute('href', '/contact?project=mnogofamilna-sgrada')
})

it('tells the company story in production words', () => {
  const s = within(document.getElementById('za-nas'))
  expect(document.querySelector('#za-nas blockquote')).toHaveTextContent('„Добрата работа – реклама за майстора“')
  expect(s.getByRole('heading', { name: 'Традиция и иновации от 2008' })).toBeInTheDocument()
  expect(s.getByText(/КСМ СТРОЙ ООД е основана през септември 2008\s+г\. от двама братя – Кадри и\s+Сухат/)).toBeInTheDocument()
  for (const w of ['коректност', 'бързина', 'точност']) expect(s.getByText(w)).toBeInTheDocument()
})

it('keeps production’s EU poster section last', () => {
  const s = document.getElementById('es-proekt')
  expect([...document.querySelectorAll('main section[id]')].at(-1)).toBe(s)
  expect(s).toHaveTextContent('BG16RFPR001-1.012-1485-C01')
  expect(s.querySelectorAll('a[href="/eu/plakat-ksm-stroy-a3.pdf"]')).toHaveLength(3)
  expect(s.querySelector('a[download="Плакат A3 - КСМ Строй.pdf"]')).not.toBeNull()
  for (const t of ['Безвъзмездна финансова помощ', '24 724,03 евро', 'Цялата отговорност за съдържанието се носи от КСМ СТРОЙ ООД'])
    expect(s).toHaveTextContent(t)
})

// The sections in order, and the hero as the next tasks find it: the Golden
// Residence half, a link inside section.hero, is what the hero move grows
// (spec §6.7).
it('runs the opening, the company and the EU poster, in that order', () => {
  expect([...document.querySelectorAll('main section[id]')].map((section) => section.id)).toEqual(['proekti', 'za-nas', 'es-proekt'])
  expect(document.querySelector('section.hero#proekti a.half.half--gr[href="/projects/golden-residence"]')).not.toBeNull()
  expect(document.querySelector('section.hero#proekti > h1:first-child')).not.toBeNull()
})

// The route module (spec §8.1): under the see-through header, with the
// availability API and both display faces preloaded with the page.
it('preloads the availability and the display faces, under the see-through header', () => {
  expect(handle).toEqual({ header: 'overlay' })
  expect(links()).toEqual([availabilityPreload, ...DISPLAY_FONT_PRELOADS])
})
