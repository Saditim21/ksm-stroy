import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import BlockGrid from './BlockGrid'
import { buildModel } from './model'
import { snapshotData } from './testing'

// A block in numbers (spec §6.16; extract §4.27; the concept's gr.js:185-210):
// its 96 apartments as a 12 × 8 grid of cells, floors 8 → 1 from the top,
// numbers 01 → 12 across, each cell in its status's pattern, and the floor
// numbers on the seam's side. A cell opens its unit. On the sheets snapshot
// the concept shows (extract §5.4).

const MODEL = buildModel(snapshotData())
const grid = (block) => screen.getByRole('group', { name: (name) => name.replace(/\s+/g, ' ') === `Апартаментите на блок ${block}` })
const cells = (block) => within(grid(block)).getAllByRole('button')
const title = (element) => element.getAttribute('title').replace(/\s+/g, ' ')

describe('BlockGrid', () => {
  it('draws 96 cell buttons, the first row floor 8, numbers 01 to 12 across', () => {
    render(<BlockGrid model={MODEL} block="А" onUnit={() => {}} />)
    const all = cells('А')
    expect(all).toHaveLength(96)
    expect(all.slice(0, 12).map((cell) => cell.getAttribute('aria-label').split(',')[0]))
      .toEqual(['А 801', 'А 802', 'А 803', 'А 804', 'А 805', 'А 806', 'А 807', 'А 808', 'А 809', 'А 810', 'А 811', 'А 812'])
    expect(all.at(-1)).toHaveAccessibleName(/^А 112, /)
  })

  it('names a cell by its unit and status, and titles it with the type and area: „А 501, Продаден“', () => {
    render(<BlockGrid model={MODEL} block="А" onUnit={() => {}} />)
    const cell = screen.getByRole('button', { name: 'А 501, Продаден' })
    expect(title(cell)).toBe('А 501 · 2-стаен · 62,18 м² · Продаден')
    // Spec §3.3: the area keeps its „м²“.
    expect(cell.getAttribute('title')).toContain('62,18\u00a0м²')
  })

  it('opens a cell’s unit on a click', () => {
    const onUnit = vi.fn()
    render(<BlockGrid model={MODEL} block="Б" onUnit={onUnit} />)
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
    render(<BlockGrid model={MODEL} block="Б" onUnit={() => {}} />)
    const looks = cells('Б').map((cell) => cell.className)
    expect(looks.filter((look) => look === 's-free')).toHaveLength(27)
    expect(looks.filter((look) => look === 's-reserved')).toHaveLength(2)
    expect(looks.filter((look) => look === 's-sold')).toHaveLength(67)
    expect(screen.getByRole('button', { name: /^Б 101, / })).toHaveAccessibleName('Б 101, Продаден')
  })

  // The floor numbers sit on the seam's side: after block А's grid, before
  // block Б's; a picture of the rows, hidden from assistive technology.
  it('numbers the floors 8 to 1 on the seam’s side', () => {
    const { unmount } = render(<BlockGrid model={MODEL} block="А" onUnit={() => {}} />)
    let root = document.querySelector('.blk__floors')
    expect([...root.children].map((child) => child.className)).toEqual(['blk__grid', 'blk__fl'])
    expect(root.querySelector('.blk__fl')).toHaveAttribute('aria-hidden', 'true')
    expect([...root.querySelectorAll('.blk__fl span')].map((span) => span.textContent)).toEqual(['8', '7', '6', '5', '4', '3', '2', '1'])
    unmount()

    render(<BlockGrid model={MODEL} block="Б" onUnit={() => {}} />)
    root = document.querySelector('.blk__floors')
    expect([...root.children].map((child) => child.className)).toEqual(['blk__fl', 'blk__grid'])
  })

  // Spec §9: before the data, every cell is there, in a neutral outline, so
  // nothing moves when the statuses arrive; named by its unit alone.
  it('draws the cells before the data, named by their unit alone', () => {
    render(<BlockGrid model={null} block="А" onUnit={() => {}} />)
    const all = cells('А')
    expect(all).toHaveLength(96)
    expect(all[0]).toHaveAccessibleName('А 801')
    expect(all[0]).toHaveClass('s-none')
    expect(all[0]).not.toHaveAttribute('title')
  })

  // A unit the sheets do not have: its status is not known.
  it('names a unit the sheets do not have „Няма информация“, drawn as blocked', () => {
    const model = { ...MODEL, units: MODEL.units.filter((unit) => unit.label !== 'А 501') }
    render(<BlockGrid model={model} block="А" onUnit={() => {}} />)
    const cell = screen.getByRole('button', { name: 'А 501, Няма информация' })
    expect(cell).toHaveClass('s-blocked')
    expect(title(cell)).toBe('А 501 · Няма информация')
  })
})
