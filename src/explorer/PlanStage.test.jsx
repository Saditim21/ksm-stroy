import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { buildModel } from './model'
import PlanStage from './PlanStage'
import { named, snapshotData } from './testing'

// The plan stage (spec §7.6; extract §4.23): a floor's full plan, its counts,
// the key to the patterns and the table of its units, over the page. Block А,
// floor 5 of the sheets snapshot unless a case says otherwise. No motion here
// (jsdom has no matchMedia): the stage is there at once.

const MODEL = buildModel(snapshotData())
const text = (element) => element.textContent.replace(/\s+/g, ' ').trim()
const stage = (name = 'Блок А · Етаж 5') => screen.getByRole('dialog', { name: named(name) })
const rows = (dialog = stage()) => within(dialog.querySelector('tbody')).getAllByRole('row')

function renderStage(props = {}) {
  const handlers = { onClose: vi.fn(), onFloor: vi.fn(), onBlock: vi.fn(), onUnit: vi.fn() }
  const view = render(<PlanStage model={MODEL} block="А" floor={5} fromRect={null} {...handlers} {...props} />)
  return { ...handlers, ...view }
}

afterEach(() => {
  vi.useRealTimers()
})

describe('the bar', () => {
  it('is a modal dialog named for its floor, with the floor’s apartments and its free ones', () => {
    renderStage()

    expect(stage()).toHaveAttribute('aria-modal', 'true')
    expect(stage().querySelector('.ps__title em')).toHaveTextContent(/^Етаж 5$/)
    expect(text(stage().querySelector('.ps__meta'))).toBe('12 апартамента · 4 свободни')
  })

  // Spec §9: the кота only where the drawings give it, А1 at +3,06.
  it('gives the кота on floor 1', () => {
    renderStage({ floor: 1 })
    expect(text(stage('Блок А · Етаж 1').querySelector('.ps__meta'))).toBe('кота +3,06 · 12 апартамента · 9 свободни')
  })

  it('steps a floor up and down, and stops at the bottom and the top', () => {
    const { onFloor, rerender } = renderStage()

    fireEvent.click(within(stage()).getByRole('button', { name: 'По-горен етаж' }))
    expect(onFloor).toHaveBeenLastCalledWith(6)
    fireEvent.click(within(stage()).getByRole('button', { name: 'По-долен етаж' }))
    expect(onFloor).toHaveBeenLastCalledWith(4)
    expect(text(stage().querySelector('.ps__step output'))).toBe('етаж 5')
    expect(stage().querySelector('.ps__step output')).toHaveAttribute('aria-live', 'polite')

    rerender(<PlanStage model={MODEL} block="А" floor={1} fromRect={null} onClose={vi.fn()} onFloor={onFloor} onBlock={vi.fn()} onUnit={vi.fn()} />)
    expect(within(stage('Блок А · Етаж 1')).getByRole('button', { name: 'По-долен етаж' })).toBeDisabled()
    rerender(<PlanStage model={MODEL} block="А" floor={8} fromRect={null} onClose={vi.fn()} onFloor={onFloor} onBlock={vi.fn()} onUnit={vi.fn()} />)
    expect(within(stage('Блок А · Етаж 8')).getByRole('button', { name: 'По-горен етаж' })).toBeDisabled()
  })

  it('switches to the other block, the pressed one doing nothing', () => {
    const { onBlock } = renderStage()
    const blocks = within(stage()).getByRole('group', { name: 'Блок' })

    expect(within(blocks).getByRole('button', { name: /^Блок\sА$/ })).toHaveAttribute('aria-pressed', 'true')
    fireEvent.click(within(blocks).getByRole('button', { name: /^Блок\sА$/ }))
    expect(onBlock).not.toHaveBeenCalled()
    fireEvent.click(within(blocks).getByRole('button', { name: /^Блок\sБ$/ }))
    expect(onBlock).toHaveBeenCalledWith('Б')
  })

  it('closes on Escape and on „Към сградата“', () => {
    const { onClose } = renderStage()

    fireEvent.keyDown(stage(), { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
    fireEvent.click(within(stage()).getByRole('button', { name: 'Към сградата' }))
    expect(onClose).toHaveBeenCalledTimes(2)
  })

  // Spec §7.6: PageUp and PageDown step floors, except inside the table.
  it('steps floors on PageUp and PageDown, but not inside the table', () => {
    const { onFloor } = renderStage()

    fireEvent.keyDown(stage(), { key: 'PageUp' })
    expect(onFloor).toHaveBeenLastCalledWith(6)
    fireEvent.keyDown(stage(), { key: 'PageDown' })
    expect(onFloor).toHaveBeenLastCalledWith(4)
    fireEvent.keyDown(rows()[3], { key: 'PageUp' })
    expect(onFloor).toHaveBeenCalledTimes(2)
  })
})

describe('the plan and the table', () => {
  it('lists the floor’s 12 units in suffix order, each row named from its unit', () => {
    renderStage()
    const list = rows()

    expect(list).toHaveLength(12)
    expect(list.map((row) => text(row.querySelector('.uid')))).toEqual(Array.from({ length: 12 }, (_, i) => `А 5${String(i + 1).padStart(2, '0')}`))
    expect(within(stage().querySelector('tbody')).getByRole('row', { name: named('А 501 2-стаен 62,18 м² Продаден') })).toBe(list[0])
    expect(list[0]).toHaveAttribute('tabindex', '0')
    expect(list[0]).toHaveClass('is-sold')
    expect(list[1]).not.toHaveClass('is-sold')
  })

  it('counts the floor and keys its patterns with the status legend', () => {
    renderStage()

    expect([...stage().querySelectorAll('.ps__counts .st')].map(text)).toEqual(['4 свободни', '2 резервирани', '6 продадени', '0 блокирани'])
    expect(text(within(stage()).getByRole('list', { name: 'Легенда' }))).toBe('Свободен Резервиран Продаден Блокиран')
    expect(text(stage().querySelector('.ps__hint'))).toBe('Посочете апартамент на плана или в списъка. ▲ ▼ сменят етажа, без да се връщате.')
  })

  // Spec §7.4: the stage's plan is interactive, its units buttons named as
  // every unit list names them, and its drawing under them.
  it('draws the plan over its drawing, each unit a button that opens it', () => {
    const { onUnit } = renderStage()
    const plan = within(stage()).getByRole('group', { name: 'План на етажа, блок А' })

    expect(plan).toHaveClass('plan', 'plan--stage')
    expect(plan.querySelector('image.drawing')).toHaveAttribute('href', '/img/plan-a-1200.webp')
    const unit = within(plan).getByRole('button', { name: named('А 502, 3-стаен, 101,48 м², Свободен') })
    fireEvent.keyDown(unit, { key: 'Enter' })
    expect(onUnit).toHaveBeenLastCalledWith('А 502')
    fireEvent.click(within(plan).getByRole('button', { name: /^А 506,/ }))
    expect(onUnit).toHaveBeenLastCalledWith('А 506')
  })

  it('opens a unit from its row, on a click, Enter or Space', () => {
    const { onUnit } = renderStage()

    fireEvent.click(rows()[2])
    expect(onUnit).toHaveBeenLastCalledWith('А 503')
    fireEvent.keyDown(rows()[3], { key: 'Enter' })
    expect(onUnit).toHaveBeenLastCalledWith('А 504')
    fireEvent.keyDown(rows()[4], { key: ' ' })
    expect(onUnit).toHaveBeenLastCalledWith('А 505')
    expect(onUnit).toHaveBeenCalledTimes(3)
  })

  // Spec §7.6: hovering a row or a unit highlights both, and the inspector
  // shows the unit.
  it('marks a unit hot on the plan while its row is hovered, and the row while the unit is', () => {
    renderStage()
    const plan = stage().querySelector('svg.plan')

    fireEvent.pointerOver(rows()[2], { pointerType: 'mouse' })
    expect(plan.querySelector('g[data-suffix="03"]')).toHaveAttribute('data-hot')
    expect(plan.querySelectorAll('g[data-hot]')).toHaveLength(1)
    expect(plan).toHaveAttribute('data-has-hot')
    expect(rows()[2]).toHaveClass('is-hot')
    const inspector = stage().querySelector('.ps__inspect')
    expect(inspector).toHaveAttribute('data-on')
    expect(text(inspector.querySelector('.serif'))).toBe('А 503')
    expect([...inspector.querySelectorAll('dt')].map(text)).toEqual(['Вид', 'Обща площ', 'Изложение', 'Статус'])
    expect([...inspector.querySelectorAll('dd')].map(text)).toEqual(['3-стаен', '107,24 м²', '—', 'Свободен'])

    fireEvent.pointerLeave(stage().querySelector('tbody'), { pointerType: 'mouse' })
    expect(plan.querySelector('g[data-hot]')).toBeNull()
    expect(inspector).not.toHaveAttribute('data-on')

    fireEvent.pointerOver(plan.querySelector('g[data-suffix="07"] .u-hit'), { pointerType: 'mouse' })
    expect(plan.querySelector('g[data-suffix="07"]')).toHaveAttribute('data-hot')
    expect(rows()[6]).toHaveClass('is-hot')
  })
})

describe('as a dialog', () => {
  it('holds the page still while it is open, on umber', () => {
    const { unmount } = renderStage()
    expect(document.documentElement.style.overflow).toBe('hidden')
    expect(document.documentElement.style.backgroundColor).toBe('rgb(26, 23, 20)')
    unmount()
    expect(document.documentElement.style.overflow).toBe('')
  })

  // Spec §7.6: focus moves to „Към сградата“ after 30 ms without motion.
  it('moves the focus to „Към сградата“, and keeps Tab inside', () => {
    vi.useFakeTimers()
    renderStage()
    act(() => vi.advanceTimersByTime(30))
    const close = within(stage()).getByRole('button', { name: 'Към сградата' })
    expect(document.activeElement).toBe(close)

    // From the last stop (the last row), Tab goes round to the first.
    act(() => rows()[11].focus())
    fireEvent.keyDown(rows()[11], { key: 'Tab' })
    expect(document.activeElement).toBe(within(stage()).getByRole('button', { name: /^Блок\sА$/ }))
    fireEvent.keyDown(document.activeElement, { key: 'Tab', shiftKey: true })
    expect(document.activeElement).toBe(rows()[11])
  })

  // Spec §7.7: under the unit panel the stage is inert and hidden, and its
  // keys wait.
  it('is inert and hidden under the unit panel, its keys off', () => {
    const { onClose, onFloor } = renderStage({ covered: true })
    const dialog = document.querySelector('.ps')

    expect(dialog).toHaveAttribute('inert')
    expect(dialog).toHaveAttribute('aria-hidden', 'true')
    expect(screen.queryByRole('dialog')).toBeNull()
    fireEvent.keyDown(document.body, { key: 'Escape' })
    fireEvent.keyDown(document.body, { key: 'PageUp' })
    expect(onClose).not.toHaveBeenCalled()
    expect(onFloor).not.toHaveBeenCalled()
  })

  // Before the data: the floor's plan and `—`, never a zero.
  it('reads „—“ until the data arrives', () => {
    renderStage({ model: null })

    expect(text(stage().querySelector('.ps__meta'))).toBe('12 апартамента · — свободни')
    expect([...stage().querySelectorAll('.ps__counts .st')].map(text)).toEqual(['— свободни', '— резервирани', '— продадени', '— блокирани'])
    expect(stage().querySelector('tbody').children).toHaveLength(0)
    expect(stage().querySelectorAll('svg.plan g[data-suffix]')).toHaveLength(12)
  })
})
