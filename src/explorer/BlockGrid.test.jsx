import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { MN_SNAPSHOT_DATA } from '../data/mnogofamilna/snapshot'
import BlockGrid from './BlockGrid'
import { buildModel } from './model'
import { GR_PROJECT } from './projects/gr'
import { MN_PROJECT } from './projects/mn'
import { snapshotData } from './testing'
import { ExplorerContext } from './useExplorer'

// A block in numbers (spec §6.16; extract §4.27; the concept's gr.js:185-210):
// its 96 apartments as a 12 × 8 grid of cells, floors 8 → 1 from the top,
// numbers 01 → 12 across, each cell in its status's pattern, and the floor
// numbers on the seam's side. A cell opens its unit. On the sheets snapshot
// the concept shows (extract §5.4).

const MODEL = buildModel(snapshotData(), GR_PROJECT)
// The explorer a grid sits in, which sizes it: Golden Residence's.
const renderGrid = (ui) => render(ui, { wrapper: ({ children }) => <ExplorerContext.Provider value={{ project: GR_PROJECT }}>{children}</ExplorerContext.Provider> })
const grid = (block) => screen.getByRole('group', { name: (name) => name.replace(/\s+/g, ' ') === `Апартаментите на блок ${block}` })
const cells = (block) => within(grid(block)).getAllByRole('button')
const title = (element) => element.getAttribute('title').replace(/\s+/g, ' ')

describe('BlockGrid', () => {
  it('draws 96 cell buttons, the first row floor 8, numbers 01 to 12 across', () => {
    renderGrid(<BlockGrid model={MODEL} block="А" onUnit={() => {}} />)
    const all = cells('А')
    expect(all).toHaveLength(96)
    expect(all.slice(0, 12).map((cell) => cell.getAttribute('aria-label').split(',')[0]))
      .toEqual(['А 801', 'А 802', 'А 803', 'А 804', 'А 805', 'А 806', 'А 807', 'А 808', 'А 809', 'А 810', 'А 811', 'А 812'])
    expect(all.at(-1)).toHaveAccessibleName(/^А 112, /)
  })

  it('names a cell by its unit and status, and titles it with the type and area: „А 501, Продаден“', () => {
    renderGrid(<BlockGrid model={MODEL} block="А" onUnit={() => {}} />)
    const cell = screen.getByRole('button', { name: 'А 501, Продаден' })
    expect(title(cell)).toBe('А 501 · 2-стаен · 62,18 м² · Продаден')
    // Spec §3.3: the area keeps its „м²“.
    expect(cell.getAttribute('title')).toContain('62,18\u00a0м²')
  })

  it('opens a cell’s unit on a click', () => {
    const onUnit = vi.fn()
    renderGrid(<BlockGrid model={MODEL} block="Б" onUnit={onUnit} />)
    const cell = screen.getByRole('button', { name: /^Б 702, / })
    fireEvent.click(cell)
    expect(onUnit).toHaveBeenCalledTimes(1)
    expect(onUnit.mock.calls[0][0]).toBe('Б 702')
    // The cell goes with it, for the focus to come back to once the unit
    // panel closes (Safari and Firefox on a Mac do not focus a button they
    // click).
    expect(onUnit.mock.calls[0][1]).toBe(cell)
  })

  // Spec §7.9: never colour alone. The cell's class is its status's pattern.
  it('gives each cell its status’s look', () => {
    renderGrid(<BlockGrid model={MODEL} block="Б" onUnit={() => {}} />)
    const looks = cells('Б').map((cell) => cell.className)
    expect(looks.filter((look) => look === 's-free')).toHaveLength(27)
    expect(looks.filter((look) => look === 's-reserved')).toHaveLength(2)
    expect(looks.filter((look) => look === 's-sold')).toHaveLength(67)
    expect(screen.getByRole('button', { name: /^Б 101, / })).toHaveAccessibleName('Б 101, Продаден')
  })

  // The floor numbers sit on the seam's side: after block А's grid, before
  // block Б's; a picture of the rows, hidden from assistive technology.
  it('numbers the floors 8 to 1 on the seam’s side', () => {
    const { unmount } = renderGrid(<BlockGrid model={MODEL} block="А" onUnit={() => {}} />)
    let root = document.querySelector('.blk__floors')
    expect([...root.children].map((child) => child.className)).toEqual(['blk__grid', 'blk__fl'])
    expect(root.querySelector('.blk__fl')).toHaveAttribute('aria-hidden', 'true')
    expect([...root.querySelectorAll('.blk__fl span')].map((span) => span.textContent)).toEqual(['8', '7', '6', '5', '4', '3', '2', '1'])
    unmount()

    renderGrid(<BlockGrid model={MODEL} block="Б" onUnit={() => {}} />)
    root = document.querySelector('.blk__floors')
    expect([...root.children].map((child) => child.className)).toEqual(['blk__fl', 'blk__grid'])
  })

  // Spec §9: before the data, every cell is there, in a neutral outline, so
  // nothing moves when the statuses arrive; named by its unit alone.
  it('draws the cells before the data, named by their unit alone', () => {
    renderGrid(<BlockGrid model={null} block="А" onUnit={() => {}} />)
    const all = cells('А')
    expect(all).toHaveLength(96)
    expect(all[0]).toHaveAccessibleName('А 801')
    expect(all[0]).toHaveClass('s-none')
    expect(all[0]).not.toHaveAttribute('title')
  })

  // A unit the sheets do not have: its status is not known.
  it('names a unit the sheets do not have „Няма информация“, drawn as blocked', () => {
    const model = { ...MODEL, units: MODEL.units.filter((unit) => unit.label !== 'А 501') }
    renderGrid(<BlockGrid model={model} block="А" onUnit={() => {}} />)
    const cell = screen.getByRole('button', { name: 'А 501, Няма информация' })
    expect(cell).toHaveClass('s-blocked')
    expect(title(cell)).toBe('А 501 · Няма информация')
  })

  // A page that shows two projects (Продажби's board, M3/M4 §7.1) has no
  // explorer around its grids: each takes its project as a prop, which
  // sizes and labels it, as the explorer's project does.
  it('takes its project as a prop, with no explorer around it', () => {
    const model = buildModel(MN_SNAPSHOT_DATA, MN_PROJECT)
    render(<BlockGrid model={model} block="Б" onUnit={() => {}} project={MN_PROJECT} />)
    const all = cells('Б')
    expect(all).toHaveLength(72)
    expect(all[0]).toHaveAccessibleName('Б-901, Продаден')
    expect(screen.getByRole('button', { name: /^Б-702, / })).toHaveClass('s-free')
    expect([...document.querySelectorAll('.blk__fl span')].map((span) => span.textContent)).toEqual(['10', '9', '8', '7', '6', '5', '4', '3', '2'])
  })

  it('takes the prop’s project over the explorer’s', () => {
    renderGrid(<BlockGrid model={null} block="А" onUnit={() => {}} project={MN_PROJECT} />)
    expect(cells('А')).toHaveLength(72)
    expect(cells('А')[0]).toHaveAccessibleName('А-901')
  })
})

// Ruling T8a: each grid is one tab stop, the square last focused, else its
// first; the arrows move between the squares (← → along a floor, ↑ ↓ between
// floors), Home and End go to the floor's ends, and Enter and Space open the
// unit. So a keyboard passes #blokove in two stops, not 192.
describe('the grid by keyboard', () => {
  const square = (label) => screen.getByRole('button', { name: new RegExp(`^${label}(,|$)`) })
  const stops = (block) => cells(block).filter((cell) => cell.tabIndex === 0)
  // A key on the focused square: whether the page's own action for it (a
  // scroll, Home's and End's jump) was kept back.
  const press = (key, init = {}) => !fireEvent.keyDown(document.activeElement, { key, ...init })

  it('puts one square in the tab order, the first, before and after the data', () => {
    const { rerender } = renderGrid(<BlockGrid model={null} block="А" onUnit={() => {}} />)
    expect(stops('А')).toEqual([square('А 801')])
    expect(cells('А').filter((cell) => cell.tabIndex === -1)).toHaveLength(95)
    rerender(<BlockGrid model={MODEL} block="А" onUnit={() => {}} />)
    expect(stops('А')).toEqual([square('А 801')])
  })

  it('moves along a floor with ← and →, between floors with ↑ and ↓, and to the floor’s ends with Home and End', () => {
    renderGrid(<BlockGrid model={MODEL} block="А" onUnit={() => {}} />)
    square('А 801').focus()
    const path = [
      ['ArrowRight', 'А 802'],
      ['ArrowDown', 'А 702'],
      ['End', 'А 712'],
      ['ArrowRight', 'А 712'],
      ['Home', 'А 701'],
      ['ArrowLeft', 'А 701'],
      ['ArrowUp', 'А 801'],
      ['ArrowUp', 'А 801'],
      ['ArrowDown', 'А 701'],
      ['ArrowDown', 'А 601'],
      ['ArrowDown', 'А 501'],
      ['ArrowDown', 'А 401'],
      ['ArrowDown', 'А 301'],
      ['ArrowDown', 'А 201'],
      ['ArrowDown', 'А 101'],
      ['ArrowDown', 'А 101'],
      ['End', 'А 112'],
    ]
    for (const [key, label] of path) {
      // Kept back even at an edge, where the focus stays: the page holds
      // still under the grid.
      expect(press(key), key).toBe(true)
      expect(document.activeElement, `${key} → ${label}`).toBe(square(label))
      // The square the focus reached is the grid's tab stop now.
      expect(stops('А')).toEqual([square(label)])
    }
  })

  it('leaves other keys, and an arrow with Alt or ⌘ (the browser’s Back), alone', () => {
    renderGrid(<BlockGrid model={MODEL} block="Б" onUnit={() => {}} />)
    square('Б 805').focus()
    expect(press('ArrowLeft', { altKey: true })).toBe(false)
    expect(press('ArrowRight', { altKey: true })).toBe(false)
    expect(press('ArrowLeft', { metaKey: true })).toBe(false)
    expect(press('PageDown')).toBe(false)
    expect(press('a')).toBe(false)
    expect(document.activeElement).toBe(square('Б 805'))
  })

  it('opens the focused square’s unit with Enter and with Space', async () => {
    const user = userEvent.setup()
    const onUnit = vi.fn()
    renderGrid(<BlockGrid model={MODEL} block="Б" onUnit={onUnit} />)
    square('Б 801').focus()
    await user.keyboard('{ArrowDown}{ArrowRight}{Enter}')
    expect(onUnit).toHaveBeenCalledTimes(1)
    expect(onUnit.mock.calls[0]).toEqual(['Б 702', square('Б 702')])
    await user.keyboard('{ArrowRight} ')
    expect(onUnit).toHaveBeenCalledTimes(2)
    expect(onUnit.mock.calls[1]).toEqual(['Б 703', square('Б 703')])
  })

  // Tab goes from one grid to the other and on: two stops for the 192
  // squares. Coming back, the grid's stop is the square last focused, by
  // the keyboard or a click.
  it('is one stop per grid with Tab, coming back to the square last focused', async () => {
    const user = userEvent.setup()
    renderGrid(
      <>
        <button type="button">before</button>
        <BlockGrid model={MODEL} block="А" onUnit={() => {}} />
        <BlockGrid model={MODEL} block="Б" onUnit={() => {}} />
        <button type="button">after</button>
      </>,
    )
    screen.getByRole('button', { name: 'before' }).focus()
    await user.tab()
    expect(document.activeElement).toBe(square('А 801'))
    await user.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}{End}')
    expect(document.activeElement).toBe(square('А 512'))
    await user.tab()
    expect(document.activeElement).toBe(square('Б 801'))
    await user.tab()
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'after' }))

    await user.click(square('Б 304'))
    await user.tab({ shift: true })
    expect(document.activeElement).toBe(square('А 512'))
    await user.tab()
    expect(document.activeElement).toBe(square('Б 304'))
  })
})
