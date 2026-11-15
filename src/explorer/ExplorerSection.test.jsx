import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { mockMatchMedia } from '../test/media'
import { tap } from '../test/pointer'
import { ExplorerProvider } from './ExplorerContext'
import ExplorerSection from './ExplorerSection'
import { loadSurfaces } from './loadSurfaces'
import { LOADING, named, snapshotAvailability } from './testing'

// The explorer's section on the Golden Residence page, #explorer (spec §8.2
// #3, §9), inside the page's ExplorerProvider: the heading, the lead with the
// free count, the legend's counts, the stale-data notice, and the facade,
// whose floors open the plan stage in place. The availability store is stood
// in for by the sheets snapshot (useAvailability mocked); the stage's chunk
// is in.

let availability
vi.mock('../data/availability/useAvailability', () => ({ useAvailability: () => availability }))

const NOTICE = 'Наличността не се зареди. Показваме последните данни, които имаме; за актуална информация: +359 887 886 166.'
const text = (element) => element.textContent.replace(/\s+/g, ' ').trim()
const rail = (block, floor) => screen.getByRole('button', { name: new RegExp(`^Блок ${block}, етаж ${floor}[:.]`) })

// Where the router is: the probe a test reads after a floor is opened.
function Where() {
  const { pathname, search } = useLocation()
  return <output data-testid="where">{decodeURIComponent(`${pathname}${search}`)}</output>
}

function renderSection(props = {}, url = '/projects/golden-residence') {
  return render(
    <MemoryRouter initialEntries={[url]}>
      <Routes>
        <Route path="*" element={<ExplorerProvider routeBlock={null}><ExplorerSection {...props} /><Where /></ExplorerProvider>} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeAll(() => loadSurfaces())

beforeEach(() => {
  availability = snapshotAvailability()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('ExplorerSection', () => {
  it('is section#explorer, headed „Изберете апартамент“ at level 2, its italic word „апартамент“', () => {
    renderSection()
    const section = document.querySelector('section#explorer')
    const heading = within(section).getByRole('heading', { level: 2 })

    expect(text(heading)).toBe('Изберете апартамент')
    expect(heading.querySelector('em')).toHaveTextContent(/^апартамент$/)
    expect(section).toHaveAccessibleName('Изберете апартамент')
  })

  it('sets the heading at the level it is given', () => {
    renderSection({ headingLevel: 3 })
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Изберете апартамент')
  })

  it('gives the free apartments now, out of 192, and the counts of the four statuses', () => {
    renderSection()
    const section = document.querySelector('section#explorer')

    expect(text(section.querySelector('.lead'))).toBe('Свободните апартаменти в момента, по данни от таблиците на КСМ Строй: 69 от 192.')
    const legend = within(section).getByRole('list', { name: 'Всички апартаменти по статус' })
    expect(within(legend).getAllByRole('listitem').map(text)).toEqual(['69 свободни', '8 резервирани', '115 продадени', '0 блокирани'])
  })

  // Review Focus 1, spec §9: data built into the site is shown as dated.
  it('ExplorerSection shows the notice when a slot is built-in', () => {
    availability = snapshotAvailability({ 'block-a': 'built-in' })
    const { unmount } = renderSection()
    expect(screen.getByText((_, element) => element?.tagName === 'P' && text(element) === NOTICE)).toBeInTheDocument()
    unmount()

    availability = snapshotAvailability()
    renderSection()
    expect(screen.queryByText(/Наличността не се зареди/)).toBeNull()
  })

  // Spec §9: `—` until the data arrives, never a zero, and the facade there.
  it('reads „—“ for every count while the data loads', () => {
    availability = LOADING
    renderSection()
    const section = document.querySelector('section#explorer')

    expect(text(section.querySelector('.lead'))).toBe('Свободните апартаменти в момента, по данни от таблиците на КСМ Строй: — от 192.')
    const legend = within(section).getByRole('list', { name: 'Всички апартаменти по статус' })
    expect(within(legend).getAllByRole('listitem').map(text)).toEqual(['— свободни', '— резервирани', '— продадени', '— блокирани'])
    const rails = screen.getAllByRole('button', { name: /^Блок [АБ], етаж \d\. Enter отваря плана\.$/ })
    expect(rails).toHaveLength(16)
    for (const each of rails) expect(each.querySelector('.n')).toHaveTextContent(/^—$/)
    expect(screen.queryByText(/Наличността не се зареди/)).toBeNull()
  })

  it('shows the facade in full mode, starting on the block it is given', () => {
    renderSection({ initialBlock: 'Б' })
    const facade = document.querySelector('section#explorer .fx')

    expect(facade).not.toHaveClass('fx--compact')
    expect(facade).toHaveAttribute('data-block', 'Б')
    expect(screen.getByRole('button', { name: /^Блок\sБ$/ })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: /^Блок\sА$/ })).toHaveAttribute('aria-pressed', 'false')
  })

  // Spec §7.6, §7.10: a floor opens in place, its stage over the page, and
  // the address says so, the letter always on the Golden Residence page.
  it('opens a floor in place: the stage, and ?floor in the address', () => {
    renderSection()
    fireEvent.click(rail('Б', 6))

    expect(screen.getByTestId('where')).toHaveTextContent(/^\/projects\/golden-residence\?floor=Б-6$/)
    expect(screen.getByRole('dialog', { name: named('Блок Б · Етаж 6') })).toBeInTheDocument()
    // No landing: the page has scrolled to the facade, and the stage covers
    // it whole (only a deep link's landing holds the EU row in view).
    expect(document.documentElement).not.toHaveAttribute('data-eu-hold')
  })
})

// Spec §7.6: closing gives the focus back to what opened the stage. A
// floor opened from a panel's plan or from the sheet hands on the floor's
// rail (ruling C7.2): the plan is hidden from assistive technology, and the
// sheet's button turns inert as the sheet gives way.
describe('the focus after the stage', () => {
  let restore
  afterEach(() => restore?.())

  it('goes back to the rail of a floor opened from the edge panel’s plan', () => {
    restore = mockMatchMedia({ fine: true })
    vi.useFakeTimers()
    renderSection()
    fireEvent.pointerOver(rail('А', 5), { pointerType: 'mouse' })
    fireEvent.click(document.querySelector('.fxp--a g[data-suffix="02"] .u-hit'))
    act(() => vi.advanceTimersByTime(900))
    expect(screen.getByTestId('where')).toHaveTextContent(/^\/projects\/golden-residence\?floor=А-5&unit=А\+502$/)
    expect(screen.getByRole('dialog', { name: 'А 502' })).toBeInTheDocument()

    fireEvent.keyDown(document.activeElement, { key: 'Escape' })
    fireEvent.keyDown(document.activeElement, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(document.activeElement).toBe(rail('А', 5))
  })

  it('goes back to the rail of a floor opened from the phone’s sheet', async () => {
    restore = mockMatchMedia({ coarse: true })
    window.matchMedia('(max-width: 900px)').matches = true
    renderSection()
    tap(rail('А', 4))
    fireEvent.click(within(document.querySelector('.sheet')).getByRole('button', { name: 'Отворете плана' }))
    const stage = screen.getByRole('dialog', { name: named('Блок А · Етаж 4') })
    expect(document.querySelector('.sheet')).toHaveAttribute('inert')

    fireEvent.click(within(stage).getByRole('button', { name: 'Към сградата' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(document.activeElement).toBe(rail('А', 4))
  })

  // Spec §7.6, §7.10 on a phone: a deep link's stage has no opener, so its
  // floor's rail takes the focus back. A phone shows one block, and the other
  // block's rails are off screen (explorer.css: display none, so they take no
  // focus), so the facade turns to the stage's block first. A rail that still
  // takes no focus leaves it on the block switch, never on the page's body.
  // jsdom applies no stylesheet: refuseFocus() turns the focus away from the
  // rails it names, as Chrome does from rails it does not render.
  describe('on a phone, after a deep link to the block the facade does not show', () => {
    const HIDDEN_RAILS = '.fx[data-block="А"] .fx__rail--b, .fx[data-block="Б"] .fx__rail--a'
    const facade = () => document.querySelector('section#explorer .fx')
    function refuseFocus(selector) {
      const focus = HTMLElement.prototype.focus
      vi.spyOn(HTMLElement.prototype, 'focus').mockImplementation(function focusIfShown(options) {
        if (!this.closest(selector)) focus.call(this, options)
      })
    }
    async function closeDeepLinkedStage() {
      restore = mockMatchMedia({ coarse: true })
      window.matchMedia('(max-width: 900px)').matches = true
      renderSection({}, '/projects/golden-residence?floor=Б-5')
      const stage = await screen.findByRole('dialog', { name: named('Блок Б · Етаж 5') })
      expect(facade()).toHaveAttribute('data-block', 'А')

      fireEvent.click(within(stage).getByRole('button', { name: 'Към сградата' }))
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    }
    afterEach(() => vi.restoreAllMocks())

    it('turns the facade to the stage’s block, and gives that floor’s rail the focus', async () => {
      refuseFocus(HIDDEN_RAILS)
      await closeDeepLinkedStage()

      expect(facade()).toHaveAttribute('data-block', 'Б')
      expect(screen.getByRole('button', { name: /^Блок\sБ$/ })).toHaveAttribute('aria-pressed', 'true')
      expect(document.activeElement).toBe(rail('Б', 5))
    })

    it('leaves the focus on the block switch when the rail cannot take it', async () => {
      refuseFocus('.fx__cnt')
      await closeDeepLinkedStage()

      expect(facade()).toHaveAttribute('data-block', 'Б')
      expect(document.activeElement).toBe(screen.getByRole('button', { name: /^Блок\sБ$/ }))
    })
  })
})
