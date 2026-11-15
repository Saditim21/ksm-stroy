import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { goOffline, renderSiteAt } from '../../../tests/contracts/site'
import { resetInquiry } from '../../components/inquiry/inquiryStore'
import * as homeModule from '../Home'

// Home (spec §8.1): the split opening with slogan A, the company, the
// services, the completed works, the floor-by-floor teaser, the closing
// inquiry and production's EU poster section, opened as a visitor opens it
// (tests/contracts/site.jsx), offline, so the counts come from the data built
// into the site. The teaser's own cases are teaser.test.jsx's.

const MN_NAME = 'Многофамилна сграда, ж.к. Връбница-1: 16 свободни апартамента от 144 по данни към 01.12.2025. Запитване за сградата.'
// Where the browser, which follows the router here, says the page is.
const address = () => `${window.location.pathname}${window.location.search}${window.location.hash}`

beforeEach(() => {
  goOffline()
  renderSiteAt('/')
})

afterEach(() => {
  resetInquiry()
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

it('links Golden Residence to its page, with its count', async () => {
  await waitFor(() => expect(screen.getByRole('link', { name: /^Golden Residence, жк Левски Г: \d+ свободни апартамента от 192\. Изберете апартамент\.$/ })).toHaveAttribute('href', '/projects/golden-residence'))
})

// Spec §6.7, §5.3: the Многофамилна half leads to the inquiry with the
// building chosen, until its page comes in M3. Its click takes the jump from
// the browser and the router; the inquiry's preset glides there instead
// (inquiryStore.js), and the address stays as it was.
it('takes the Многофамилна half to the inquiry, its building chosen, with no jump and no new address', async () => {
  const half = screen.getByRole('link', { name: MN_NAME })
  expect(half).toHaveAttribute('href', '#zapitvane')
  expect(document.getElementById('zapitvane')).not.toBeNull()

  expect(fireEvent.click(half)).toBe(false)
  expect(screen.getByLabelText('Интересувам се от')).toHaveValue('mnogofamilna')
  // jsdom follows a fragment link a task after the click, as a browser does.
  await new Promise((resolve) => { setTimeout(resolve, 0) })
  expect(address()).toBe('/')
})

// Spec §6.2: on a page with an inquiry of its own, the header's „Запитване“
// goes there, gliding (glideToHash, src/utils/scroll.js), and the address
// stays as it was.
it('sends the header’s „Запитване“ to the inquiry on the page, gliding, with no new address', async () => {
  const inquiry = within(screen.getByRole('banner')).getByRole('link', { name: 'Запитване' })
  expect(inquiry).toHaveAttribute('href', '#zapitvane')
  expect(fireEvent.click(inquiry)).toBe(false)
  await new Promise((resolve) => { setTimeout(resolve, 0) })
  expect(address()).toBe('/')
  expect(document.activeElement).toBe(document.getElementById('zapitvane'))
})

it('tells the company story in production words', () => {
  const s = within(document.getElementById('za-nas'))
  expect(document.querySelector('#za-nas blockquote')).toHaveTextContent('„Добрата работа – реклама за майстора“')
  expect(s.getByRole('heading', { name: 'Традиция и иновации от 2008' })).toBeInTheDocument()
  expect(s.getByText(/КСМ СТРОЙ ООД е основана през септември 2008\s+г\. от двама братя – Кадри и\s+Сухат/)).toBeInTheDocument()
  for (const w of ['коректност', 'бързина', 'точност']) expect(s.getByText(w)).toBeInTheDocument()
})

// Spec §6.12, §8.1: production's contact heading and lead (Contact:506–509),
// the phones and the hours beside the form.
it('closes with the inquiry: production’s heading, the phones, the hours and the form', () => {
  const section = document.getElementById('kontakti')
  const s = within(section)
  expect(section).toHaveAccessibleName('Готови сте да започнете своя проект?')
  expect(s.getByText('Нашият екип е готов да ви помогне да реализирате мечтания проект с качество и професионализъм.')).toBeInTheDocument()
  expect(s.getByRole('link', { name: '+359 887 886 166' })).toHaveAttribute('href', 'tel:+359887886166')
  expect(s.getByRole('link', { name: '+359 885 762 224' })).toHaveAttribute('href', 'tel:+359885762224')
  expect(s.getByText('Пн–Пт 8:00–18:00, Сб 9:00–14:00, Нд почивен ден')).toBeInTheDocument()
  expect(section.querySelector('#zapitvane')).toContainElement(s.getByRole('heading', { level: 2 }))
  expect(s.getByRole('button', { name: 'Изпратете запитване' })).toBeInTheDocument()
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

// The sections in order (spec §8.1), the floor-by-floor teaser before the
// inquiry, and the hero as the next tasks find it: the Golden Residence
// half, a link inside section.hero, is what the hero move grows (spec §6.7).
it('runs the opening, the company, the services, the works, the teaser, the inquiry and the EU poster, in that order', () => {
  expect([...document.querySelectorAll('main section[id]')].map((section) => section.id))
    .toEqual(['proekti', 'za-nas', 'uslugi', 'obekti', 'etazhi', 'kontakti', 'es-proekt'])
  expect(document.querySelector('section.hero#proekti a.half.half--gr[href="/projects/golden-residence"]')).not.toBeNull()
  expect(document.querySelector('section.hero#proekti > h1:first-child')).not.toBeNull()
})

// The route module (spec §8.1): under the see-through header, with an
// inquiry of its own. Its preloads (the availability API and both display
// faces) go out with the prerendered document only (ruling C4.10,
// home.prerender.test.jsx): a route `links` export would put them in the head
// again on every client-side return to Home, where they only warn "preloaded
// but not used". So a render in the browser adds none.
it('is an overlay page with an inquiry of its own, and adds no preload in the browser', () => {
  expect(homeModule.handle).toEqual({ header: 'overlay', inquiry: true })
  expect('links' in homeModule).toBe(false)
  expect(document.head.querySelectorAll('link[rel="preload"]')).toHaveLength(0)
})
