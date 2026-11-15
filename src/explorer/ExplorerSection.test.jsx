import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ExplorerSection from './ExplorerSection'
import { LOADING, snapshotAvailability } from './testing'

// The explorer's section on the Golden Residence page, #explorer (spec §8.2
// #3, §9): the heading, the lead with the free count, the legend's counts,
// the stale-data notice, and the facade. The availability store is stood in
// for by the sheets snapshot (useAvailability mocked).

let availability
vi.mock('../data/availability/useAvailability', () => ({ useAvailability: () => availability }))

const NOTICE = 'Наличността не се зареди. Показваме последните данни, които имаме; за актуална информация: +359 887 886 166.'
const text = (element) => element.textContent.replace(/\s+/g, ' ').trim()

// Where the router is: the probe a test reads after a floor is opened.
function Where() {
  const { pathname, search } = useLocation()
  return <output data-testid="where">{decodeURIComponent(`${pathname}${search}`)}</output>
}

function renderSection(props = {}) {
  return render(
    <MemoryRouter initialEntries={['/projects/golden-residence']}>
      <Routes>
        <Route path="*" element={<><ExplorerSection {...props} /><Where /></>} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  availability = snapshotAvailability()
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
    for (const rail of rails) expect(rail.querySelector('.n')).toHaveTextContent(/^—$/)
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

  // For now a floor opens on its block's page (the plan stage comes with the
  // next step of the explorer).
  it('opens a floor on its block’s page', () => {
    renderSection()
    fireEvent.click(screen.getByRole('button', { name: /^Блок Б, етаж 6:/ }))
    expect(screen.getByTestId('where')).toHaveTextContent('/projects/golden-residence/block-b?floor=6')
  })
})
