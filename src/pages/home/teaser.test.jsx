import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import { beforeEach, expect, it, vi } from 'vitest'
import { loadSurfaces } from '../../explorer/loadSurfaces'
import { snapshotAvailability } from '../../explorer/testing'
import { tap } from '../../test/pointer'
import TeaserSection from './TeaserSection'

// Home's floor-by-floor teaser, #etazhi (spec §6.11, §8.1 #5, §9): the
// hinge, the facade in compact mode, the stale-data notice when the data is
// built in, and the two ways into the Golden Residence explorer. The
// availability store is stood in for by the sheets snapshot.

let availability
vi.mock('../../data/availability/useAvailability', () => ({ useAvailability: () => availability }))
// The stage's chunk, watched: a floor's click starts loading it.
vi.mock('../../explorer/loadSurfaces', async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, loadSurfaces: vi.fn(actual.loadSurfaces) }
})

const text = (element) => element.textContent.replace(/\s+/g, ' ').trim()

// Where the router is, with the hash.
function Where() {
  const { pathname, search, hash } = useLocation()
  return <output data-testid="where">{decodeURIComponent(`${pathname}${search}${hash}`)}</output>
}

function renderTeaser() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="*" element={<><TeaserSection /><Where /></>} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  availability = snapshotAvailability()
})

it('heads #etazhi „Golden Residence, етаж по етаж“, its italic word „етаж“, with the concept’s lead', () => {
  renderTeaser()
  const section = document.querySelector('section#etazhi')
  const heading = within(section).getByRole('heading', { level: 2 })

  expect(text(heading)).toBe('Golden Residence, етаж по етаж')
  expect(heading.querySelector('em')).toHaveTextContent(/^етаж$/)
  expect(section).toHaveAccessibleName('Golden Residence, етаж по етаж')
  expect(text(section.querySelector('.hinge .lead'))).toBe('Цифрите са свободните апартаменти в момента: блок А вляво, блок Б вдясно. Посочете етаж, кликнете, за да видите плана му.')
  // Spec §3.3: a block's letter stays with „блок“ and with the word after it.
  expect(section.querySelector('.hinge .lead').textContent).toContain('блок\u00a0А\u00a0вляво, блок\u00a0Б\u00a0вдясно')
  // Final review F9: the lead never ends on one word alone, „му.“, in a
  // browser without text-wrap: pretty.
  expect(section.querySelector('.hinge .lead').textContent).toMatch(/плана\u00a0му\.\s*$/)
})

it('shows the facade in compact mode, its floors with their counts', () => {
  renderTeaser()
  const facade = document.querySelector('section#etazhi .fx')

  expect(facade).toHaveClass('fx--compact')
  expect(document.querySelector('.fxp')).toBeNull()
  expect(screen.getByRole('button', { name: /^Блок А, етаж 5: 4 свободни/ })).toBeInTheDocument()
})

it('leads both ways into the explorer: „Визуално“ and „По критерии“', () => {
  renderTeaser()
  const ways = screen.getByRole('navigation', { name: 'Два начина да изберете апартамент' })

  expect(within(ways).getByRole('link', { name: /^Визуално/ })).toHaveAttribute('href', '/projects/golden-residence#explorer')
  expect(within(ways).getByRole('link', { name: /^По критерии/ })).toHaveAttribute('href', '/projects/golden-residence?view=list#explorer')
  expect(text(within(ways).getByRole('link', { name: /^Визуално/ }))).toBe('Визуално Изберете етаж от фасадата')
  expect(text(within(ways).getByRole('link', { name: /^По критерии/ }))).toBe('По критерии Всички 192 апартамента в списък с филтри')
})

// Spec §9: Home never shows the built-in counts without saying so.
it('shows the notice when a Golden Residence slot is built-in, and not over live data', () => {
  availability = snapshotAvailability({ garages: 'built-in' })
  const { unmount } = renderTeaser()
  expect(within(document.querySelector('section#etazhi')).getByText(/^Наличността не се зареди\./)).toBeInTheDocument()
  unmount()

  availability = snapshotAvailability()
  renderTeaser()
  expect(screen.queryByText(/Наличността не се зареди/)).toBeNull()
})

// Spec §7.2, ruling F11: a floor opens on the Golden Residence page, whose
// deep link jumps to the explorer and opens the floor's plan (spec §7.10):
// no hash. The stage's chunk starts loading with the click.
it('opens a floor on the Golden Residence page, by the floor alone, loading the stage’s chunk', () => {
  loadSurfaces.mockClear()
  renderTeaser()
  expect(loadSurfaces).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole('button', { name: /^Блок А, етаж 5:/ }))
  expect(screen.getByTestId('where')).toHaveTextContent(/^\/projects\/golden-residence\?floor=А-5$/)
  expect(loadSurfaces).toHaveBeenCalledTimes(1)
})

// Spec §7.2: on Home too, a finger's first tap on a rail names the floor in
// the caption, and only the second leaves for the Golden Residence page. The
// tap comes in Chrome's order, its focus after its pointerup (src/test/pointer.js).
it('names a floor on the first touch tap on its rail, and opens it on the second', () => {
  renderTeaser()
  const a5 = screen.getByRole('button', { name: /^Блок А, етаж 5:/ })

  tap(a5)
  expect(text(document.querySelector('#etazhi .fx__cap .t'))).toBe('Блок А · етаж 5')
  expect(screen.getByTestId('where')).toHaveTextContent(/^\/$/)

  tap(a5)
  expect(screen.getByTestId('where')).toHaveTextContent(/^\/projects\/golden-residence\?floor=А-5$/)
})
