import { act, fireEvent, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useSyncExternalStore } from 'react'
import { afterEach, beforeEach, describe, expect, it, onTestFinished, vi } from 'vitest'
import { mainText, renderSiteAt } from '../../../tests/contracts/site'
import { resetInquiry } from '../../components/inquiry/inquiryStore'
import { grFree } from '../../data/availability/select'
import { IDLE, LOADING, named, snapshotAvailability } from '../../explorer/testing'
import * as contactModule from '../../routes/contact'
import { loadedBy, pageOf, renderPagesAt } from '../../test/arrivals'
import { setLenis } from '../../utils/lenis'

// Контакти (spec M3/M4 §7.3, §8), opened as a visitor opens it
// (tests/contracts/site.jsx): the form across both halves, whose fields
// follow the subject, the construction subject's lead, the thank-you, and a
// link's prefill and landing. Nothing is sent: EmailJS is a stand-in, and so
// is the network, which records the lead the CRM would get. The store's data
// is the test's own (useAvailability stood in for), so a case decides when
// Golden Residence's apartments are known.

const emailjs = vi.hoisted(() => ({ send: vi.fn(), init: vi.fn() }))
vi.mock('@emailjs/browser', () => ({ default: emailjs, send: emailjs.send, init: emailjs.init }))

const availability = vi.hoisted(() => {
  const listeners = new Set()
  return {
    value: null,
    listeners,
    set(next) {
      this.value = next
      for (const listener of listeners) listener()
    },
  }
})
vi.mock('../../data/availability/useAvailability', async (importOriginal) => ({
  ...(await importOriginal()),
  useAvailability: () => useSyncExternalStore(
    (listener) => {
      availability.listeners.add(listener)
      return () => availability.listeners.delete(listener)
    },
    () => availability.value,
    () => IDLE,
  ),
}))

const CONSENT = 'Съгласен съм КСМ Строй да използва данните ми, за да отговори на запитването.'
const held = () => document.documentElement.hasAttribute('data-eu-hold')
const wait = (ms) => new Promise((resolve) => { setTimeout(resolve, ms) })
const subjects = () => screen.getByRole('group', { name: 'Интересувам се от' })
const subject = (name) => within(subjects()).getByRole('radio', { name })
const send = () => screen.getByRole('button', { name: 'Изпратете запитване' })
const leads = () => fetchMock.mock.calls.filter(([url]) => url === '/api/odoo-lead').map(([, init]) => JSON.parse(init.body))

let fetchMock
let user
beforeEach(() => {
  availability.value = snapshotAvailability()
  emailjs.send.mockReset()
  emailjs.send.mockResolvedValue({ status: 200, text: 'OK' })
  fetchMock = vi.fn(async (url) => {
    if (url === '/api/odoo-lead') return { ok: true, status: 200, json: async () => ({ ok: true, id: 42 }) }
    throw new TypeError('Failed to fetch (tests run offline)')
  })
  vi.stubGlobal('fetch', fetchMock)
  vi.spyOn(console, 'log').mockImplementation(() => {})
  user = userEvent.setup({ delay: null })
})
afterEach(() => {
  resetInquiry()
  setLenis(null)
  document.documentElement.removeAttribute('data-eu-hold')
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

async function fill() {
  await user.type(screen.getByLabelText('Име'), 'Иван Петров')
  await user.type(screen.getByLabelText('Телефон'), '+359 888 123 456')
  await user.type(screen.getByLabelText('Имейл'), 'ivan@example.bg')
  await user.click(screen.getByRole('checkbox', { name: CONSENT }))
}

// Ruling C5.4: the page's preloads go out with the prerendered document only
// (contact.prerender.test.jsx), so a render in the browser adds none.
it('is a solid page with an inquiry of its own, and adds no preload in the browser', async () => {
  renderSiteAt('/contact')
  await screen.findByRole('heading', { level: 1 })

  expect(contactModule.handle).toEqual({ header: 'solid', inquiry: true })
  expect('links' in contactModule).toBe(false)
  expect(document.head.querySelectorAll('link[rel="preload"]')).toHaveLength(0)
})

// Ruling M4-PF4: production's head, its hours sentence built from the hours
// source, its words as they were.
it('keeps production’s head, its hours from the hours source', () => {
  const head = contactModule.meta()
  expect(head).toContainEqual({ title: 'Контакти - KSM Stroy | Свържете се с нас за оферта' })
  expect(head).toContainEqual({
    name: 'description',
    content: 'Свържете се с KSM Stroy за безплатна консултация и оферта. Офис в София, телефон: +359887886166, имейл: ksm_str@abv.bg. Работно време: Пн-Пт 8:00-18:00.',
  })
  expect(head).toContainEqual({ tagName: 'link', rel: 'canonical', href: 'https://www.ksmstroy.com/contact' })
  // Spec M3/M4 §11: the page's first picture, the form's first subject's,
  // Golden Residence at dusk, is its share image.
  expect(head).toContainEqual({ property: 'og:image', content: 'https://www.ksmstroy.com/img/gr-dusk-og.jpg' })
})

describe('the subject', () => {
  // Spec §7.3: construction brings „Тип проект“ with production's six kinds,
  // „Бюджет“ with its five ranges, typeset, and production's message hint;
  // another subject takes them away.
  it('choosing „Строителство или ремонт“ opens Тип проект and Бюджет', async () => {
    renderSiteAt('/contact')
    await screen.findByRole('group', { name: 'Интересувам се от' })
    expect(screen.queryByLabelText('Тип проект')).toBeNull()
    expect(subject('Golden Residence')).toBeChecked()

    await user.click(subject('Строителство или ремонт'))
    expect(subject('Строителство или ремонт')).toBeChecked()
    const kind = screen.getByLabelText('Тип проект')
    expect([...kind.options].map((option) => option.textContent)).toEqual([
      'Изберете тип проект', 'Жилищно строителство', 'Комерсиални проекти', 'Индустриални обекти',
      'Ремонти и реновации', 'Архитектурно проектиране', 'Консултантски услуги',
    ])
    const budget = screen.getByLabelText('Бюджет')
    expect([...budget.options].map((option) => [option.textContent, option.value])).toEqual([
      ['Изберете бюджет', ''],
      ['До 50\u00A0000\u00A0лв.', 'До 50,000 лв'],
      ['50\u00A0000 – 100\u00A0000\u00A0лв.', '50,000 - 100,000 лв'],
      ['100\u00A0000 – 500\u00A0000\u00A0лв.', '100,000 - 500,000 лв'],
      ['500\u00A0000 – 1\u00A0000\u00A0000\u00A0лв.', '500,000 - 1,000,000 лв'],
      ['Над 1\u00A0000\u00A0000\u00A0лв.', 'Над 1,000,000 лв'],
    ])
    expect(screen.getByLabelText('Съобщение')).toHaveAccessibleDescription('Опишете подробно вашия проект, изисквания и\u00A0очаквания.')
    expect(document.querySelector('.plate.is-on')).toHaveAttribute('data-plate', 'build')

    await user.click(subject('Друго'))
    await waitFor(() => expect(screen.queryByLabelText('Тип проект')).toBeNull())
    expect(screen.queryByLabelText('Бюджет')).toBeNull()
    expect(screen.getByLabelText('Съобщение')).not.toHaveAccessibleDescription()
    expect(document.querySelector('.plate.is-on')).toHaveAttribute('data-plate', 'other')
  })

  // Spec §7.3, §8: a pick shows only under its own project's subject.
  it('shows Golden Residence’s picks under Golden Residence only', async () => {
    renderSiteAt(`/contact?apartment=${encodeURIComponent('А 301')}`)
    expect(await screen.findByText('Апартамент А 301')).toBeInTheDocument()

    await user.click(subject('Многофамилна сграда'))
    expect(screen.queryByText('Апартамент А 301')).toBeNull()
    await user.click(subject('Golden Residence'))
    expect(screen.getByText('Апартамент А 301')).toBeInTheDocument()
  })

  // A chip's × gives the focus to the next chip, else to the chosen subject
  // (InquiryForm.jsx), never to the page.
  it('gives the focus to the chosen subject as the last chip goes', async () => {
    renderSiteAt(`/contact?apartment=${encodeURIComponent('А 301')}`)
    await screen.findByText('Апартамент А 301')

    await user.click(screen.getByRole('button', { name: 'Махнете А 301' }))
    expect(screen.queryByText('Апартамент А 301')).toBeNull()
    expect(subject('Golden Residence')).toHaveFocus()
  })

  // The subject group is one tab stop, its arrows choosing, as radios are.
  it('is one radio group: the arrows move the choice', async () => {
    renderSiteAt('/contact')
    const first = await screen.findByRole('radio', { name: 'Golden Residence' })
    first.focus()
    await user.keyboard('{ArrowDown}')
    expect(subject('Многофамилна сграда')).toBeChecked()
    expect(subject('Многофамилна сграда')).toHaveFocus()
  })
})

describe('sending', () => {
  // Spec §7.3, §8, Review Focus 1: the construction subject's lead.
  it('a send with Тип проект and Бюджет posts the construction lead', async () => {
    renderSiteAt('/contact')
    await screen.findByRole('group', { name: 'Интересувам се от' })
    await user.click(subject('Строителство или ремонт'))
    await fill()
    await user.selectOptions(screen.getByLabelText('Тип проект'), 'Ремонти и реновации')
    await user.selectOptions(screen.getByLabelText('Бюджет'), screen.getByRole('option', { name: named('50 000 – 100 000 лв.') }))
    await user.type(screen.getByLabelText('Съобщение'), 'Ремонт на апартамент от 80 кв.м.')
    await user.click(send())

    await screen.findByRole('status')
    expect(leads()).toEqual([{
      name: 'Иван Петров',
      email: 'ivan@example.bg',
      phone: '+359 888 123 456',
      projectType: '[ТЕСТ] Строителство или ремонт – Ремонти и реновации',
      budget: '50,000 - 100,000 лв',
      message: 'Ремонт на апартамент от 80 кв.м.',
    }])
    expect(emailjs.send.mock.calls[0][2]).toMatchObject({ project_type: '[ТЕСТ] Строителство или ремонт – Ремонти и реновации', budget: '50,000 - 100,000 лв' })
  })

  it('sends no construction details with another subject', async () => {
    renderSiteAt('/contact')
    await screen.findByRole('group', { name: 'Интересувам се от' })
    await user.click(subject('Строителство или ремонт'))
    await user.selectOptions(screen.getByLabelText('Тип проект'), 'Индустриални обекти')
    await user.click(subject('Друго'))
    await fill()
    await user.click(send())

    await screen.findByRole('status')
    expect(leads()[0]).toMatchObject({ projectType: '[ТЕСТ] Друго', budget: '' })
  })

  // Spec §7.3: the thank-you takes the focus, the fields hide and the
  // subjects are disabled, the one sent still chosen.
  it('the thank-you disables the subjects', async () => {
    renderSiteAt('/contact')
    await screen.findByRole('group', { name: 'Интересувам се от' })
    await user.click(subject('Строителство или ремонт'))
    await fill()
    await user.click(send())

    const thanks = await screen.findByRole('status')
    expect(thanks).toHaveTextContent('Благодарим ви.')
    expect(thanks).toHaveFocus()
    expect(subjects()).toBeDisabled()
    expect(subject('Строителство или ремонт')).toBeChecked()
    expect(document.querySelector('.plate.is-on')).toHaveAttribute('data-plate', 'build')
    expect(screen.getByLabelText('Име')).not.toBeVisible()
    expect(screen.queryByRole('button', { name: 'Изпратете запитване' })).toBeNull()
  })

  it('shows the form’s alert when the email fails, and keeps the subjects', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    emailjs.send.mockRejectedValue({ status: 400, text: 'The service ID is invalid' })
    renderSiteAt('/contact')
    await screen.findByRole('group', { name: 'Интересувам се от' })
    await fill()
    await user.click(send())

    expect(await screen.findByRole('alert')).toHaveTextContent('Запитването не беше изпратено.')
    expect(subjects()).not.toBeDisabled()
    expect(screen.getByLabelText('Име')).toHaveValue('Иван Петров')
  })
})

// Spec §7.3, §8, Review Focus 2: a link with ?project=, ?apartment= or
// #zapitvane lands on the form once its prefill has rendered, the header's
// EU row held (data-eu-hold on <html>) from before the jump until the
// visitor first moves the page, 400 ms on.
describe('a link’s landing', () => {
  // The form 3000 px down the page, its heading 150 px into it, as jsdom lays
  // nothing out; each jump notes whether the row was held as it went.
  const landingAt = (top) => {
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function place() {
      const y = this.id === 'zapitvane' ? top : this.id === 'ask-h' ? top + 150 : 0
      return { top: y, bottom: y + 900, left: 0, right: 1440, width: 1440, height: 900, x: 0, y }
    })
    const jumps = []
    vi.spyOn(window, 'scrollTo').mockImplementation((x, y) => jumps.push({ y, held: held(), chosen: document.querySelector('input[type="radio"]:checked')?.value }))
    return jumps
  }

  it('?project=mn&apartment=Б-702 lands on #zapitvane with Многофамилна chosen, its chip, and the EU row held until the first move', async () => {
    const jumps = landingAt(3000)
    renderSiteAt(`/contact?project=mn&apartment=${encodeURIComponent('Б-702')}`)

    await waitFor(() => expect(jumps).toEqual([{ y: 3000, held: true, chosen: 'mnogofamilna' }]))
    expect(subject('Многофамилна сграда')).toBeChecked()
    expect(screen.getByText('Апартамент Б-702')).toBeInTheDocument()
    expect(held()).toBe(true)
    // The jump's own scroll, and a move in the first 400 ms, keep it.
    fireEvent.scroll(window)
    fireEvent.wheel(window, { deltaY: 120 })
    await wait(200)
    expect(held()).toBe(true)
    await wait(300)
    expect(held()).toBe(true)
    // So does a scroll the page makes itself later, as ScrollTrigger's
    // refresh does (to the top and back; src/shell/landingHold.js): only the
    // visitor's own move lets it go.
    fireEvent.scroll(window)
    fireEvent.scroll(document)
    expect(held()).toBe(true)
    fireEvent.wheel(window, { deltaY: 120 })
    expect(held()).toBe(false)
    expect(jumps).toHaveLength(1)
  })

  it('?project=stroitelstvo#zapitvane lands with construction chosen and its group open', async () => {
    const jumps = landingAt(3000)
    renderSiteAt('/contact?project=stroitelstvo#zapitvane')

    await waitFor(() => expect(jumps).toEqual([{ y: 3000, held: true, chosen: 'build' }]))
    expect(screen.getByLabelText('Тип проект')).toBeInTheDocument()
  })

  it('#zapitvane alone lands on the form, Golden Residence chosen', async () => {
    const jumps = landingAt(3000)
    renderSiteAt('/contact#zapitvane')

    await waitFor(() => expect(jumps).toEqual([{ y: 3000, held: true, chosen: 'golden-residence' }]))
    expect(held()).toBe(true)
  })

  // Golden Residence's apartments are known once its data is in: the page
  // lands then, with the chip.
  it('?apartment=А 301 waits for Golden Residence’s apartments, then lands with its chip', async () => {
    availability.value = LOADING
    const jumps = landingAt(3000)
    renderSiteAt(`/contact?apartment=${encodeURIComponent('А 301')}`)
    await wait(100)
    expect(jumps).toEqual([])
    expect(held()).toBe(true)

    act(() => availability.set(snapshotAvailability()))
    await waitFor(() => expect(jumps).toEqual([{ y: 3000, held: true, chosen: 'golden-residence' }]))
    expect(screen.getByText('Апартамент А 301')).toBeInTheDocument()
  })

  // The second step adds Golden Residence's apartments, and only those: what
  // the first seed gave, Многофамилна's chip here, is the visitor's to keep or
  // take away, and stays taken away when Golden Residence's data comes later
  // (the store's fallback can take 10 s), so the lead goes without it.
  it('keeps a Многофамилна chip the visitor took away gone when Golden Residence’s data comes', async () => {
    availability.value = LOADING
    const jumps = landingAt(3000)
    renderSiteAt(`/contact?project=mn&apartment=${encodeURIComponent('Б-702')}`)
    await waitFor(() => expect(jumps).toHaveLength(1))
    expect(screen.getByText('Апартамент Б-702')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Махнете Б-702' }))
    expect(screen.queryByText('Апартамент Б-702')).toBeNull()
    act(() => availability.set(snapshotAvailability()))
    await wait(50)
    expect(screen.queryByText('Апартамент Б-702')).toBeNull()
    expect(subject('Многофамилна сграда')).toBeChecked()
    expect(jumps).toHaveLength(1)

    await fill()
    await user.click(send())
    await screen.findByRole('status')
    expect(leads()[0].projectType).toBe('[ТЕСТ] Многофамилна сграда, ж.к. Връбница-1')
  })

  // Golden Residence's apartments wait for its data 1.2 s at most; the page
  // then lands without them and adds them as the data comes, with no second
  // jump, leaving the subject the visitor has chosen meanwhile as it is.
  it('lands without Golden Residence’s apartments after 1.2 s, then adds them as its data comes', async () => {
    availability.value = LOADING
    const jumps = landingAt(3000)
    renderSiteAt(`/contact?apartment=${encodeURIComponent('А 301')}`)
    await wait(1000)
    expect(jumps).toEqual([])
    await waitFor(() => expect(jumps).toEqual([{ y: 3000, held: true, chosen: 'golden-residence' }]), { timeout: 1500 })
    expect(screen.queryByText('Апартамент А 301')).toBeNull()

    await user.click(subject('Многофамилна сграда'))
    act(() => availability.set(snapshotAvailability()))
    await wait(50)
    expect(subject('Многофамилна сграда')).toBeChecked()
    expect(screen.queryByText('Апартамент А 301')).toBeNull()
    await user.click(subject('Golden Residence'))
    expect(screen.getByText('Апартамент А 301')).toBeInTheDocument()
    expect(jumps).toHaveLength(1)
  })

  it('drops an apartment no unit has, and lands all the same', async () => {
    const jumps = landingAt(3000)
    renderSiteAt(`/contact?apartment=${encodeURIComponent('А 999')}`)

    await waitFor(() => expect(jumps).toHaveLength(1))
    expect(screen.queryByRole('list', { name: 'Избрани апартаменти' })).toBeNull()
  })

  it('neither jumps nor holds anything without a link to the form', async () => {
    const jumps = landingAt(3000)
    renderSiteAt('/contact')
    await screen.findByRole('group', { name: 'Интересувам се от' })
    await wait(50)

    expect(jumps).toEqual([])
    expect(held()).toBe(false)
  })

  // Only an arrival afresh lands (src/shell/landingHold.js:
  // useFreshArrival). A document the browser reloaded or brought back opens
  // where the visitor left it, as ScrollRestoration restores it: the page
  // neither jumps nor holds the row. The address still seeds the form.
  it.each(['reload', 'back_forward'])('stays where a %s leaves the page, and holds nothing, its prefill seeded all the same', async (type) => {
    onTestFinished(loadedBy(type))
    const jumps = landingAt(3000)
    renderSiteAt('/contact?project=mn#zapitvane')
    await waitFor(() => expect(subject('Многофамилна сграда')).toBeChecked())
    await wait(50)

    expect(jumps).toEqual([])
    expect(held()).toBe(false)
  })

  // Back to a link's address on Контакти, after another page: the visitor is
  // where they left it (ScrollRestoration's), and the page holds nothing.
  it('stays where Back brings the visitor to a link’s address, and holds nothing', async () => {
    const jumps = landingAt(3000)
    const { router } = renderPagesAt('/about', [
      { path: 'about', Component: () => <p>Страница за нас</p>, handle: { header: 'solid' } },
      pageOf('contact', contactModule),
    ])
    await screen.findByText('Страница за нас')
    await act(() => router.navigate('/contact?project=mn#zapitvane'))
    await waitFor(() => expect(jumps).toEqual([{ y: 3000, held: true, chosen: 'mnogofamilna' }]))
    await wait(450)
    fireEvent.wheel(window, { deltaY: 120 })
    expect(held()).toBe(false)

    await act(() => router.navigate('/about'))
    await screen.findByText('Страница за нас')
    await act(() => router.navigate(-1))
    await waitFor(() => expect(subject('Многофамилна сграда')).toBeChecked())
    await wait(50)

    expect(jumps).toHaveLength(1)
    expect(held()).toBe(false)
  })

  // Spec §7.3: a send never re-seeds the form, even when the data a prefill
  // waited for arrives after it.
  it('a send never re-seeds the form', async () => {
    availability.value = LOADING
    renderSiteAt(`/contact?apartment=${encodeURIComponent('А 301')}`)
    await screen.findByRole('group', { name: 'Интересувам се от' })
    await fill()
    await user.click(send())
    expect(await screen.findByRole('status')).toHaveTextContent('Благодарим ви.')

    act(() => availability.set(snapshotAvailability()))
    await wait(50)
    expect(screen.getByRole('status')).toHaveTextContent('Благодарим ви.')
    expect(screen.queryByText('Апартамент А 301')).toBeNull()
    expect(screen.getByLabelText('Име')).not.toBeVisible()
  })
})

// Spec §7.3: „Изпратете запитване“ in the answer, and the closing's
// „Получете безплатна оферта“, glide to the form and focus „Име“ once the
// glide has arrived.
describe('the ways to the form', () => {
  it.each([
    ['„Изпратете запитване“', () => within(document.querySelector('#top')).getByRole('link', { name: 'Изпратете запитване' })],
    ['„Получете безплатна оферта“', () => screen.getByRole('link', { name: /Получете безплатна оферта/ })],
  ])('%s glides to the form and focuses „Име“', async (_name, link) => {
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function place() {
      const y = this.id === 'zapitvane' ? 2400 : 0
      return { top: y, bottom: y + 900, left: 0, right: 1440, width: 1440, height: 900, x: 0, y }
    })
    const lenis = { scrollTo: vi.fn(), dimensions: { resize() {} } }
    setLenis(lenis)
    renderSiteAt('/contact')
    await screen.findByRole('group', { name: 'Интересувам се от' })

    await user.click(link())
    await waitFor(() => expect(lenis.scrollTo).toHaveBeenCalledWith(2400, expect.objectContaining({ duration: 1.5 })))
    expect(window.location.hash).toBe('')
    await waitFor(() => expect(screen.getByLabelText('Име')).toHaveFocus(), { timeout: 2500 })
  })
})

it('shows what the page says, in its own words', async () => {
  renderSiteAt('/contact')
  await screen.findByRole('group', { name: 'Интересувам се от' })

  for (const line of ['Как можете да се свържете с нас', 'Нашите офиси', 'Готови сте да започнете своя проект?', 'Обадете се сега']) {
    expect(mainText()).toContain(line)
  }
  // The count is the store's: the smoke run's sheets, here, live, so no
  // notice says otherwise.
  expect(document.querySelector('.stale')).toBeNull()
  expect(screen.getByRole('radio', { name: 'Golden Residence' })).toHaveAccessibleDescription(`${grFree(snapshotAvailability())} свободни от 192 · жк\u00A0Левски\u00A0Г`)
})

// Spec M3/M4 §5.2, §5.3, Diptych §9: Golden Residence's count among the
// subjects is the store's, so when the store ends on the data built into the
// site, or on no data at all (`—`), the page says so, under the subjects and
// before the fields. When it shows is StaleNotice's own question (ruling F15:
// StaleNotice.test.jsx); this checks that the page carries it.
describe('the stale-data notice', () => {
  const NOTICE = 'Наличността не се зареди. Показваме последните данни, които имаме; за актуална информация: +359 887 886 166.'
  const fallback = { ...snapshotAvailability('built-in'), status: 'fallback' }

  it.each([
    ['the data built into the site', fallback, `${grFree(fallback)} свободни от 192 · жк\u00A0Левски\u00A0Г`],
    ['no data at all', { status: 'error', data: null, origin: null, updatedAt: null }, '— свободни от 192 · жк\u00A0Левски\u00A0Г'],
  ])('says so under the subjects over %s', async (_, state, meta) => {
    availability.value = state
    renderSiteAt('/contact')
    await screen.findByRole('group', { name: 'Интересувам се от' })

    expect(subject('Golden Residence')).toHaveAccessibleDescription(meta)
    const notices = document.querySelectorAll('#zapitvane .stale')
    expect(notices).toHaveLength(1)
    const [notice] = notices
    expect(notice.textContent.replace(/\s+/g, ' ').trim()).toBe(NOTICE)
    expect(within(notice).getByRole('link', { name: '+359 887 886 166' })).toHaveAttribute('href', 'tel:+359887886166')
    const last = within(subjects()).getAllByRole('radio').at(-1)
    expect(last.compareDocumentPosition(notice) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(notice.compareDocumentPosition(screen.getByLabelText('Име')) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })
})
