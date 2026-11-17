import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { goOffline, mainText, renderSiteAt } from '../../../tests/contracts/site'
import { resetInquiry } from '../../components/inquiry/inquiryStore'
import { named } from '../../explorer/testing'
import * as mnModule from '../../routes/mnogofamilna'
import { setLenis } from '../../utils/lenis'
import { EXPO_IN_OUT } from '../../utils/motion'

// The Многофамилна page (spec M3 §6), opened as a visitor opens it
// (tests/contracts/site.jsx), offline: its numbers are the dated snapshot of
// 01.12.2025, which it shows whatever the store reads (spec M3 §5.1). The
// explorer's own cases on Многофамилна are src/explorer/mn.engine.test.jsx's.

const PATH = '/projects/mnogofamilna-sgrada'
const text = (element) => element.textContent.replace(/\s+/g, ' ').trim()
const section = (id) => document.getElementById(id)
// Where the browser, which follows the router here, says the page is.
const address = () => `${window.location.pathname}${window.location.search}${window.location.hash}`
// A section placed `top` px down the page, as jsdom lays nothing out.
const placeAt = (element, top) => vi.spyOn(element, 'getBoundingClientRect')
  .mockReturnValue({ top, bottom: top + 600, left: 0, right: 0, width: 0, height: 600, x: 0, y: top })
const lenisStandIn = () => {
  const lenis = { scrollTo: vi.fn(), dimensions: { resize() {} } }
  setLenis(lenis)
  return lenis
}

beforeEach(() => {
  goOffline()
})

afterEach(() => {
  resetInquiry()
  setLenis(null)
  document.documentElement.removeAttribute('data-eu-hold')
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('the opening (spec M3 §6.2 #1)', () => {
  beforeEach(() => {
    renderSiteAt(PATH)
  })

  it('names the building in the one H1, across the seam, its italic word „сграда“', async () => {
    const h1 = await screen.findByRole('heading', { level: 1 })
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(text(h1)).toBe('Многофамилна жилищна сграда')
    expect(h1.querySelector('em')).toHaveTextContent(/^сграда$/)
    expect(section('explorer')).toContainElement(h1)
  })

  // The routes contract's text (tests/contracts/site.jsx): the page names
  // both blocks.
  it('names both blocks', () => {
    expect(mainText()).toMatch(/блок\s+[аa](?![а-яёa-z])/i)
    expect(mainText()).toMatch(/блок\s+[бb](?![а-яёa-z])/i)
  })

  // Spec M3 §6.2 #1, §5.3: „Запитване“ presets Многофамилна and glides to
  // the inquiry; the browser's jump is taken, and the address stays.
  it('„Запитване“ presets Многофамилна and glides to #zapitvane', async () => {
    const lenis = lenisStandIn()
    placeAt(section('zapitvane'), 5400)
    // The visitor's choice before: another subject.
    fireEvent.change(screen.getByLabelText('Интересувам се от'), { target: { value: 'build' } })
    const inquiry = within(section('explorer')).getByRole('link', { name: 'Запитване' })
    expect(inquiry).toHaveAttribute('href', '#zapitvane')

    expect(fireEvent.click(inquiry)).toBe(false)
    expect(screen.getByLabelText('Интересувам се от')).toHaveValue('mnogofamilna')
    await waitFor(() => expect(lenis.scrollTo).toHaveBeenCalledWith(5400, expect.objectContaining({ duration: 1.5, easing: EXPO_IN_OUT })))
    await new Promise((resolve) => { setTimeout(resolve, 0) })
    expect(address()).toBe(PATH)
  })

  // „По критерии“ glides to the list's own section, which loads at once.
  it('„По критерии“ goes to #spisak, and the list loads', async () => {
    const lenis = lenisStandIn()
    placeAt(section('spisak'), 1700)
    const criteria = within(section('explorer')).getByRole('link', { name: 'По критерии' })
    expect(criteria).toHaveAttribute('href', '#spisak')

    expect(fireEvent.click(criteria)).toBe(false)
    expect(lenis.scrollTo).toHaveBeenCalledWith(1700, expect.objectContaining({ duration: 1.5, easing: EXPO_IN_OUT }))
    expect(document.activeElement).toBe(section('spisak'))
    await waitFor(() => expect(section('spisak').querySelector('.lv__meta')).not.toBeNull(), { timeout: 15000 })
    await new Promise((resolve) => { setTimeout(resolve, 0) })
    expect(address()).toBe(PATH)
  })
})

// Spec M3 §6.2 #2, ruling T8a: a square of #blokove opens its unit in the
// unit panel, through the address, with no stage under it; so does Enter on
// a square the keyboard has reached, and the panel gives the focus back to
// that square as it closes (ruling C8.1).
describe('#blokove', () => {
  const grid = (letter) => within(section('blokove')).getByRole('group', { name: (name) => name.replace(/\s+/g, ' ') === `Апартаментите на блок ${letter}` })

  it('opens a square’s unit in the unit panel', async () => {
    renderSiteAt(PATH)
    fireEvent.click(within(grid('А')).getByRole('button', { name: 'А-802, Свободен' }))

    expect(await screen.findByRole('dialog', { name: 'А-802' }, { timeout: 15000 })).toBeInTheDocument()
    expect(new URLSearchParams(window.location.search).get('unit')).toBe('А-802')
    expect(document.querySelector('.ps')).toBeNull()
  }, 30000)

  it('opens the unit of a square the keyboard has reached with Enter, and comes back to it', async () => {
    const user = userEvent.setup()
    renderSiteAt(PATH)
    const squares = within(grid('Б')).getAllByRole('button')
    expect(squares.filter((square) => square.tabIndex === 0)).toEqual([squares[0]])

    squares[0].focus()
    await user.keyboard('{ArrowDown}{End}{Enter}')
    const panel = await screen.findByRole('dialog', { name: 'Б-808' }, { timeout: 15000 })
    expect(panel).toBeInTheDocument()
    expect(new URLSearchParams(window.location.search).get('unit')).toBe('Б-808')

    fireEvent.keyDown(document.activeElement, { key: 'Escape' })
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(document.activeElement).toBe(within(grid('Б')).getByRole('button', { name: /^Б-808, / }))
  }, 30000)
})

// Spec M3 §6.2 #5, ruling T5a: the drawings' spread, the third, shows each
// drawing under its title on its plate, and its live caption says the two
// titles to screen readers only, so the pair is never printed twice; the
// live region stays, so the change is still announced.
it('#galeriya: the drawings’ spread says its titles to screen readers only', () => {
  renderSiteAt(PATH)
  const gallery = section('galeriya')
  const next = within(gallery).getByRole('button', { name: 'Следващи' })

  fireEvent.click(next)
  fireEvent.click(next)

  expect(text(gallery.querySelector('.gal__n'))).toBe('03 / 03')
  expect([...gallery.querySelectorAll('.gal__img[data-shown]')].map((layer) => layer.getAttribute('data-spread'))).toEqual(['2', '2'])
  const caption = gallery.querySelector('.gal__cap')
  expect(caption).toHaveAttribute('aria-live', 'polite')
  expect([...caption.childNodes].map((node) => node.nodeName)).toEqual(['SPAN'])
  expect(caption.firstChild).toHaveClass('sr-only')
  expect(caption.textContent).toBe('Архитектурен план на етажа. Блок А и Б – надземни и подземни гаражи.')
})

// Spec M3 §6.2 #3: all 144 apartments, sold ones included, with the live
// meta.
it('lists all 144 apartments, 16 of them free', async () => {
  renderSiteAt(PATH)
  fireEvent.click(within(section('explorer')).getByRole('link', { name: 'По критерии' }))

  const meta = await waitFor(() => {
    const found = section('spisak').querySelector('.lv__meta')
    expect(found).not.toBeNull()
    return found
  }, { timeout: 15000 })
  expect(text(meta)).toBe('144 от 144 · 16 свободни')
  expect(section('spisak').querySelectorAll('tr.row')).toHaveLength(144)
})

// Spec §7.10, M3 §6.4: a floor's deep link opens its plan stage, dated.
it('?floor=Б-5 opens the dialog „Блок Б · Етаж 5“, its meta dated', async () => {
  renderSiteAt(`${PATH}?floor=${encodeURIComponent('Б-5')}`)

  const stage = await screen.findByRole('dialog', { name: named('Блок Б · Етаж 5') }, { timeout: 15000 })
  const meta = text(stage.querySelector('.ps__meta'))
  expect(meta).toContain('по данни към 01.12.2025')
  expect(meta).toBe('8 апартамента · 1 свободен · по данни към 01.12.2025')
  // Its drawing is Многофамилна's own line art.
  expect(stage.querySelector('.ps__plan image.drawing')).toHaveAttribute('href', '/img/mn-plan-line-2400.webp')
}, 30000)

// Spec M3 §6.4: floor 10 is the attic.
it('?floor=А-10 says „тавански етаж“', async () => {
  renderSiteAt(`${PATH}?floor=${encodeURIComponent('А-10')}`)

  const stage = await screen.findByRole('dialog', { name: named('Блок А · Етаж 10') }, { timeout: 15000 })
  expect(text(stage.querySelector('.ps__meta'))).toBe('тавански етаж · 8 апартамента · 0 свободни · по данни към 01.12.2025')
}, 30000)

// Spec M3 §6.4: a unit's deep link opens its panel; А-808 has a plan of its
// own (src/constants/apartmentImages.js), so the panel offers it. А-802's
// file is block Б's drawing, „Б58“ (ruling FW3): its panel offers none.
it('?unit=А-808 opens А-808’s panel, with its own plan', async () => {
  renderSiteAt(`${PATH}?unit=${encodeURIComponent('А-808')}`)

  const panel = await screen.findByRole('dialog', { name: 'А-808' }, { timeout: 15000 })
  expect(within(panel).getByRole('button', { name: 'План на апартамента' })).toBeInTheDocument()
  expect(text(panel.querySelector('.up__date'))).toBe('По данни към 01.12.2025.')
}, 30000)

it('?unit=А-802 opens А-802’s panel, with its floor’s plan alone', async () => {
  renderSiteAt(`${PATH}?unit=${encodeURIComponent('А-802')}`)

  const panel = await screen.findByRole('dialog', { name: 'А-802' }, { timeout: 15000 })
  expect(within(panel).queryByRole('button', { name: 'План на апартамента' })).toBeNull()
  expect(text(panel.querySelector('.up__date'))).toBe('По данни към 01.12.2025.')
}, 30000)

// Ruling PF11, spec M3 §6.4 (C8.1): ?view=list lands on the list's own
// section, and a unit panel the address opened over it gives the focus back
// to its unit's row there as it closes, never to the facade far above.
it('?view=list&unit=А-802 gives the focus back to А-802’s row in #spisak', async () => {
  renderSiteAt(`${PATH}?view=list&unit=${encodeURIComponent('А-802')}`)
  await screen.findByRole('dialog', { name: 'А-802' }, { timeout: 15000 })
  await waitFor(() => expect(section('spisak').querySelector('.lv__meta')).not.toBeNull(), { timeout: 15000 })

  fireEvent.keyDown(document.activeElement, { key: 'Escape' })
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  const row = [...section('spisak').querySelectorAll('tr.row')].find((each) => text(each.querySelector('.uid')) === 'А-802')
  expect(document.activeElement).toBe(row)
}, 30000)

// Spec M3 §6.4: a link that shows the list and opens a floor's stage lands
// on #spisak, the stage over it. The stage has no opener to give the focus
// back to, and its floor's rail is two screens up, at the facade: the list's
// first control takes it, on the screen the page shows.
it('?view=list&floor=Б-5 gives the stage’s focus back to #spisak’s list', async () => {
  renderSiteAt(`${PATH}?view=list&floor=${encodeURIComponent('Б-5')}`)
  await screen.findByRole('dialog', { name: named('Блок Б · Етаж 5') }, { timeout: 15000 })
  await waitFor(() => expect(section('spisak').querySelector('.lv__meta')).not.toBeNull(), { timeout: 15000 })

  fireEvent.keyDown(document.activeElement, { key: 'Escape' })
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  expect(document.activeElement).toBe(section('spisak').querySelector('.lv button'))
}, 30000)

// Spec §1.9 (ruling T7a), M3 §6.4, §8: a landing on the list keeps the EU
// line in view, as a deep link's does. The page holds the header's EU row
// (data-eu-hold on <html>) from before its jump to #spisak until the visitor
// first moves the page, by a scroll, the wheel, a touch or a key, 400 ms on:
// the jump's own scroll comes before that, and lets nothing go.
describe('?view=list lands on #spisak with the EU row in view', () => {
  const held = () => document.documentElement.hasAttribute('data-eu-hold')
  const wait = (ms) => new Promise((resolve) => { setTimeout(resolve, ms) })
  const MOVES = {
    scroll: () => fireEvent.scroll(window),
    wheel: () => fireEvent.wheel(window, { deltaY: 120 }),
    'touch move': () => fireEvent.touchMove(window),
    key: () => fireEvent.keyDown(document.body, { key: 'ArrowDown' }),
  }
  // #spisak 3000 px down the page, as jsdom lays nothing out; the jump there
  // notes whether the row was held as it went.
  const landingAt = (top) => {
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function place() {
      const y = this.id === 'spisak' ? top : 0
      return { top: y, bottom: y + 900, left: 0, right: 1440, width: 1440, height: 900, x: 0, y }
    })
    const jumps = []
    vi.spyOn(window, 'scrollTo').mockImplementation((x, y) => jumps.push({ y, held: held() }))
    return jumps
  }

  it.each(Object.keys(MOVES))('holds the row until a %s 400 ms on', async (move) => {
    const jumps = landingAt(3000)
    renderSiteAt(`${PATH}?view=list`)

    await waitFor(() => expect(jumps).toEqual([{ y: 3000, held: true }]))
    expect(held()).toBe(true)
    // The jump's scroll, and any move in the first 400 ms, keep it.
    MOVES[move]()
    await wait(200)
    expect(held()).toBe(true)

    await wait(300)
    expect(held()).toBe(true)
    MOVES[move]()
    expect(held()).toBe(false)
  })

  // A unit opened from the list is opened in place, over the whole screen:
  // the landing has ended.
  it('lets the row go as a unit opens from the list', async () => {
    renderSiteAt(`${PATH}?view=list`)
    await waitFor(() => expect(held()).toBe(true))
    const row = await waitFor(() => {
      const found = [...section('spisak').querySelectorAll('tr.row')].find((each) => text(each.querySelector('.uid')) === 'А-802')
      expect(found).toBeTruthy()
      return found
    }, { timeout: 15000 })

    fireEvent.click(row)
    await screen.findByRole('dialog', { name: 'А-802' }, { timeout: 15000 })
    expect(held()).toBe(false)
  }, 30000)

  // Golden Residence's list is a tab of its explorer: ?view=list shows it
  // where it is, and the page neither jumps nor holds anything.
  it('holds nothing where the page has no #spisak', async () => {
    const jumps = landingAt(3000)
    renderSiteAt('/projects/golden-residence?view=list')
    await screen.findByRole('tab', { name: /По критерии/, selected: true }, { timeout: 15000 })
    await wait(50)

    expect(jumps).toEqual([])
    expect(held()).toBe(false)
  }, 30000)
})

// Ruling PF11: the page is the project's, solid from the top, with an
// inquiry of its own. Its preloads go out with the prerendered document only
// (ruling C5.4, mn.prerender.test.jsx), so a render in the browser adds none.
it('is a solid page of Многофамилна with an inquiry of its own, and adds no preload in the browser', () => {
  renderSiteAt(PATH)

  expect(mnModule.handle).toEqual({ header: 'solid', project: 'mnogofamilna-sgrada', inquiry: true })
  expect('links' in mnModule).toBe(false)
  expect(document.head.querySelectorAll('link[rel="preload"]')).toHaveLength(0)
})

// Spec M3 §6.1: production's title and description.
it('keeps production’s head', () => {
  const head = mnModule.meta()
  expect(head).toContainEqual({ title: 'Многофамилна жилищна сграда - KSM Stroy' })
  expect(head).toContainEqual({ tagName: 'link', rel: 'canonical', href: 'https://www.ksmstroy.com/projects/mnogofamilna-sgrada' })
  expect(head).toContainEqual({
    name: 'description',
    content: 'Многофамилна жилищна сграда в ж.к. Връбница-1, гр. София: блок А и блок Б, по 72 апартамента на 9 етажа.',
  })
})
