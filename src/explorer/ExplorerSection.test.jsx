import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation, useNavigate } from 'react-router'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { resetInquiry } from '../components/inquiry/inquiryStore'
import { mockMatchMedia } from '../test/media'
import { tap } from '../test/pointer'
import { ExplorerProvider } from './ExplorerContext'
import ExplorerSection from './ExplorerSection'
import { loadSurfaces } from './loadSurfaces'
import { loadUnitList } from './loadUnitList'
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

// An address the page is sent to without the explorer's own calls, as a
// link or a hand-edited address would.
function Go() {
  const navigate = useNavigate()
  return (
    <button type="button" onClick={() => navigate('/projects/golden-residence?floor=А-3', { replace: true })}>
      go
    </button>
  )
}

function renderSection(props = {}, url = '/projects/golden-residence') {
  return render(
    <MemoryRouter initialEntries={[url]}>
      <Routes>
        <Route path="*" element={<ExplorerProvider routeBlock={null}><ExplorerSection {...props} /><Where /><Go /></ExplorerProvider>} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeAll(() => Promise.all([loadSurfaces(), loadUnitList()]))

beforeEach(() => {
  availability = snapshotAvailability()
})

afterEach(() => {
  vi.useRealTimers()
  resetInquiry()
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

// Spec §7.8, §7.10: the two ways in. The tabs switch the address's ?view;
// the list loads on the first switch (ruling C8.5, loaded already here), and
// the facade's panel waits hidden, keeping its state.
describe('„Визуално“ and „По критерии“', () => {
  const tab = (name) => screen.getByRole('tab', { name })
  const panels = () => [...document.querySelectorAll('section#explorer [role="tabpanel"]')]

  it('puts the tabs in the head, above the lead, „Визуално“ selected', () => {
    renderSection()
    const head = document.querySelector('section#explorer .explorer__head')
    const tabs = within(head).getByRole('tablist', { name: 'Как да търсите' })
    expect(tabs.compareDocumentPosition(head.querySelector('.lead')) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(tab('Визуално')).toHaveAttribute('aria-selected', 'true')
    expect(panels().map((panel) => panel.hidden)).toEqual([false, true])
    expect(panels()[0]).toContainElement(document.querySelector('.fx'))
    expect(panels()[1]).toBeEmptyDOMElement()
  })

  it('shows the list for „По критерии“, ?view=list in the address, and the facade back for „Визуално“', async () => {
    renderSection()
    fireEvent.click(tab('По критерии'))

    await waitFor(() => expect(tab('По критерии')).toHaveAttribute('aria-selected', 'true'))
    expect(screen.getByTestId('where')).toHaveTextContent(/^\/projects\/golden-residence\?view=list$/)
    expect(panels().map((panel) => panel.hidden)).toEqual([true, false])
    expect(within(panels()[1]).getByRole('group', { name: 'Статус' })).toBeInTheDocument()
    expect(panels()[1]).toHaveAttribute('aria-labelledby', tab('По критерии').id)

    fireEvent.click(tab('Визуално'))
    await waitFor(() => expect(tab('Визуално')).toHaveAttribute('aria-selected', 'true'))
    expect(screen.getByTestId('where')).toHaveTextContent(/^\/projects\/golden-residence$/)
    expect(panels().map((panel) => panel.hidden)).toEqual([false, true])
  })

  it('opens the list at once from ?view=list', async () => {
    renderSection({}, '/projects/golden-residence?view=list')
    await waitFor(() => expect(tab('По критерии')).toHaveAttribute('aria-selected', 'true'))
    expect(within(panels()[1]).getByText((_, element) => element?.classList.contains('lv__meta') && text(element) === '192 от 192 · 69 свободни')).toBeInTheDocument()
  })

  // Ruling F10, spec §7.8: a row opens its unit in the unit panel, through
  // the address, with no stage under it; closing it gives the row the focus
  // back.
  it('opens a row’s unit in the unit panel', async () => {
    renderSection({}, '/projects/golden-residence?view=list')
    const row = await screen.findByRole('row', { name: /^А 502\b/ })
    row.focus()
    fireEvent.click(row)

    expect(screen.getByTestId('where')).toHaveTextContent(/^\/projects\/golden-residence\?view=list&unit=А\+502$/)
    expect(screen.getByRole('dialog', { name: 'А 502' })).toBeInTheDocument()
    expect(document.querySelector('.ps')).toBeNull()
    fireEvent.keyDown(document.activeElement, { key: 'Escape' })
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(document.activeElement).toBe(row)
  })

  // The sheet is a portal at the foot of the screen: the floor a phone
  // previewed clears as its facade's panel hides.
  it('closes the phone’s sheet as the list comes in', async () => {
    const restore = mockMatchMedia({ coarse: true })
    window.matchMedia('(max-width: 900px)').matches = true
    try {
      renderSection()
      tap(rail('А', 4))
      expect(document.querySelector('.sheet')).toHaveAttribute('data-open')

      fireEvent.click(tab('По критерии'))
      await waitFor(() => expect(tab('По критерии')).toHaveAttribute('aria-selected', 'true'))
      await waitFor(() => expect(document.querySelector('.sheet')).not.toHaveAttribute('data-open'))
    } finally {
      restore()
    }
  })
})

// Ruling C8.3: an inquiry's close gives the focus to nothing, and leaves no
// opening behind it: a stage the address opens later grows from nowhere and,
// as it closes, gives the focus to its own floor's rail, never to the rail
// that opened the stage before the inquiry.
it('forgets the opening once an inquiry has closed the dialogs', async () => {
  renderSection()
  fireEvent.click(rail('А', 5))
  const stage = screen.getByRole('dialog', { name: named('Блок А · Етаж 5') })
  fireEvent.click(within(stage).getByRole('row', { name: /^А 502\b/ }))
  fireEvent.click(within(screen.getByRole('dialog', { name: 'А 502' })).getByRole('button', { name: 'Изпратете запитване' }))
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())

  fireEvent.click(screen.getByRole('button', { name: 'go' }))
  const later = await screen.findByRole('dialog', { name: named('Блок А · Етаж 3') })
  fireEvent.click(within(later).getByRole('button', { name: 'Към сградата' }))
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  expect(document.activeElement).toBe(rail('А', 3))
})
