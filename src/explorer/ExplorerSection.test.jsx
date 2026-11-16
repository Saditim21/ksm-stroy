import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation, useNavigate } from 'react-router'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { resetInquiry } from '../components/inquiry/inquiryStore'
import { mockMatchMedia } from '../test/media'
import { tap } from '../test/pointer'
import { setLenis } from '../utils/lenis'
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
function Go({ to, children }) {
  const navigate = useNavigate()
  return (
    <button type="button" onClick={() => navigate(to, { replace: true })}>
      {children}
    </button>
  )
}

function renderSection(props = {}, url = '/projects/golden-residence') {
  return render(
    <MemoryRouter initialEntries={[url]}>
      <Routes>
        <Route
          path="*"
          element={(
            <ExplorerProvider routeBlock={null}>
              <ExplorerSection {...props} />
              <Where />
              <Go to="/projects/golden-residence?floor=А-3">go</Go>
              <Go to="/projects/golden-residence?view=list&unit=А%20502">go to А 502</Go>
            </ExplorerProvider>
          )}
        />
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
    // Final review F9: the client's name never breaks across lines.
    expect(section.querySelector('.lead').textContent).toContain('КСМ\u00a0Строй:')
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

  // Spec §7.11, ruling FR3: a block page's list starts on its own block, as
  // its facade does; the Golden Residence page's (above) on both.
  it('starts the list on the block it is given', async () => {
    renderSection({ initialBlock: 'Б' }, '/projects/golden-residence?view=list')
    await waitFor(() => expect(tab('По критерии')).toHaveAttribute('aria-selected', 'true'))
    const blocks = within(panels()[1]).getByRole('group', { name: 'Блок' })
    expect(within(blocks).getByRole('button', { name: 'Б' })).toHaveAttribute('aria-pressed', 'true')
    expect(within(panels()[1]).getByText((_, element) => element?.classList.contains('lv__meta') && text(element) === '96 от 192 · 27 свободни')).toBeInTheDocument()
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

// Ruling C8.1 over the list (spec §11): a dialog the address opened over the
// list (a ?view=list link, a reload, Back onto it) has no opener, and the
// floor's rail is in the facade's panel, which is hidden, so no browser
// would focus it, nor the block switch beside it. As the dialog closes, the
// focus goes to the unit's row, else to the selected tab: never to the
// page's body. jsdom, unlike a browser, focuses inside a hidden subtree, so
// the focus on the row or the tab, not on the rail, also shows that the
// explorer never tries the hidden rail.
describe('the focus after a dialog over the list', () => {
  const selectedTab = () => screen.getByRole('tab', { name: 'По критерии' })
  const row = (label) => screen.queryByRole('row', { name: new RegExp(`^${label}\\b`) })
  afterEach(() => vi.restoreAllMocks())

  it('goes to the unit’s row as a unit panel with no stage under it closes', async () => {
    renderSection({}, '/projects/golden-residence?view=list&unit=А%20502')
    await screen.findByRole('dialog', { name: 'А 502' })
    expect(document.querySelector('.ps')).toBeNull()

    fireEvent.keyDown(document.activeElement, { key: 'Escape' })
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(screen.getByTestId('where')).toHaveTextContent(/^\/projects\/golden-residence\?view=list$/)
    expect(row('А 502')).not.toBeNull()
    expect(document.activeElement).toBe(row('А 502'))
  })

  // jsdom lays nothing out. The list's table as a browser would place it:
  // its box at `boxTop` px on the screen, 630 px tall under a 51 px head, and
  // the unit's row `under` rows of 65 px below the head, carried up as the
  // box scrolls. Placed once the landing has jumped to #explorer and its
  // dialog is open.
  async function landOnRow(label, under, boxTop) {
    renderSection({}, `/projects/golden-residence?view=list&unit=${encodeURIComponent(label)}`)
    await screen.findByRole('dialog', { name: label })
    const box = document.querySelector('#ex-list .lv__table')
    const head = box.querySelector('thead')
    const target = row(label)
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function place() {
      const [top, height] = this === box ? [boxTop, 630] : this === head ? [boxTop, 51] : this === target ? [boxTop + 51 + under * 65 - box.scrollTop, 65] : [0, 0]
      return { top, bottom: top + height, height, left: 0, right: 1440, width: 1440, x: 0, y: top }
    })
    return { box, target }
  }
  const close = async () => {
    fireEvent.keyDown(document.activeElement, { key: 'Escape' })
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  }

  // The list's table scrolls in a box of its own, under a sticky head: the
  // row is brought into the box's view, just under the head, so its ring
  // shows. Then it is on the screen, and the page stays where the landing
  // put it, as every focus given back here keeps it. At 1440 × 900: the box
  // spans 575–1205 px, and А 502, the 50th row, lies 49 rows under the head;
  // it comes to 626–691 px, on jsdom's 768 px screen.
  it('scrolls the table’s own box to the row, under its head, and not the page when the row is then on the screen', async () => {
    const { box, target } = await landOnRow('А 502', 49, 575)
    const pageScroll = vi.spyOn(window, 'scrollTo')
    const intoView = vi.spyOn(HTMLElement.prototype, 'scrollIntoView')

    await close()
    expect(document.activeElement).toBe(target)
    expect(box.scrollTop).toBe(49 * 65)
    expect(target.getBoundingClientRect()).toMatchObject({ top: 626, bottom: 691 })
    expect(pageScroll).not.toHaveBeenCalled()
    expect(intoView).not.toHaveBeenCalled()
  })

  // Ruling T8b: a row still off the screen once its box has scrolled (a
  // phone; the table's last rows at 1440) is brought on by the page, by the
  // least that shows it and its ring (inside the row, at −2 px), at once:
  // natively, and through Lenis where it runs, forced, as the dialog's lock
  // still holds it. At 390 × 844: the box starts at 900 px, below the
  // screen, and Б 101 is the 97th row; once the box has scrolled it lies at
  // 951–1016 px, 172 px under the screen's foot.
  it('then scrolls the page by the least that shows a row still under the screen, at once and through Lenis', async () => {
    vi.stubGlobal('innerHeight', 844)
    vi.stubGlobal('scrollY', 1200)
    const { box, target } = await landOnRow('Б 101', 96, 900)
    const lenis = { stop: vi.fn(), start: vi.fn(), scrollTo: vi.fn(), dimensions: { resize: vi.fn() } }
    setLenis(lenis)
    const pageScroll = vi.spyOn(window, 'scrollTo')
    try {
      await close()
      expect(document.activeElement).toBe(target)
      expect(box.scrollTop).toBe(96 * 65)
      expect(pageScroll.mock.calls).toEqual([[0, 1200 + 172]])
      expect(lenis.dimensions.resize).toHaveBeenCalled()
      expect(lenis.scrollTo.mock.calls).toEqual([[1200 + 172, { immediate: true, force: true }]])
    } finally {
      setLenis(null)
      vi.unstubAllGlobals()
    }
  })

  // The page scrolled down past the table's top, the row under its head is
  // above the screen: the page comes up by the least that shows it below the
  // fixed bar (scroll-padding-top, here 72 px). Without Lenis, natively.
  it('scrolls the page up by the least that shows a row above the screen, below the bar', async () => {
    vi.stubGlobal('scrollY', 3000)
    const { target } = await landOnRow('А 502', 49, -500)
    const computed = window.getComputedStyle
    vi.spyOn(window, 'getComputedStyle').mockImplementation((element, pseudo) => (
      element === document.documentElement ? { scrollPaddingTop: '72px' } : computed(element, pseudo)
    ))
    const pageScroll = vi.spyOn(window, 'scrollTo')
    try {
      await close()
      expect(document.activeElement).toBe(target)
      // The row lies at -449 px once its box has scrolled: 521 px up.
      expect(pageScroll.mock.calls).toEqual([[0, 3000 - 521]])
    } finally {
      vi.unstubAllGlobals()
    }
  })

  it('goes to the selected tab when the filters leave the unit’s row out', async () => {
    renderSection({}, '/projects/golden-residence?view=list')
    const blocks = within(document.getElementById('ex-list')).getByRole('group', { name: 'Блок' })
    fireEvent.click(within(blocks).getByRole('button', { name: 'Б' }))
    fireEvent.click(screen.getByRole('button', { name: 'go to А 502' }))
    await screen.findByRole('dialog', { name: 'А 502' })

    fireEvent.keyDown(document.activeElement, { key: 'Escape' })
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(row('А 502')).toBeNull()
    expect(document.activeElement).toBe(selectedTab())
  })

  it('goes to the selected tab as a stage with no opener closes', async () => {
    renderSection({}, '/projects/golden-residence?view=list&floor=А-5')
    const stage = await screen.findByRole('dialog', { name: named('Блок А · Етаж 5') })

    fireEvent.click(within(stage).getByRole('button', { name: 'Към сградата' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(screen.getByTestId('where')).toHaveTextContent(/^\/projects\/golden-residence\?view=list$/)
    expect(document.activeElement).toBe(selectedTab())
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
