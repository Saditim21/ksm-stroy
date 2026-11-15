import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { buildModel } from './model'
import { snapshotData } from './testing'
import UnitList from './UnitList'

// „По критерии“ (spec §7.8; extract §4.26; the concept's gr.js:106-183): all
// 192 apartments in one table, with the filters Блок, Етаж, Вид, Площ,
// Изложение and Статус, the live meta „N от 192 · K свободни“, sorting by
// Имот, Етаж and Обща площ, and rows that open their unit. On the sheets
// snapshot the concept shows (extract §5.4).

const MODEL = buildModel(snapshotData())
const text = (element) => element.textContent.replace(/\s+/g, ' ').trim()
const pills = (name) => within(screen.getByRole('group', { name })).getAllByRole('button')
const pill = (group, name) => within(screen.getByRole('group', { name: group })).getByRole('button', { name })
const options = (label) => [...screen.getByLabelText(label).options].map(text)
const meta = () => document.querySelector('.lv__meta')
const rows = () => [...document.querySelectorAll('.lv tbody tr.row')]
const firstCells = () => rows().map((row) => text(row.querySelector('td')))

function renderList(props = {}) {
  const onUnit = vi.fn()
  render(<UnitList model={MODEL} onUnit={onUnit} {...props} />)
  return onUnit
}

describe('the filters', () => {
  it('offers Блок, Вид and Статус as pills, „Всички“ pressed in each', () => {
    renderList()
    expect(pills('Блок').map(text)).toEqual(['Всички', 'А', 'Б'])
    expect(pills('Вид').map(text)).toEqual(['Всички', '2-стаен', '3-стаен', 'Ателие'])
    expect(pills('Статус').map(text)).toEqual(['Всички', 'Свободни', 'Резервирани', 'Продадени', 'Блокирани'])
    for (const group of ['Блок', 'Вид', 'Статус']) {
      expect(pills(group).map((each) => each.getAttribute('aria-pressed'))).toEqual(pills(group).map((_, i) => String(i === 0)))
    }
  })

  // Spec §7.11, ruling FR3: a block page's list starts on its own block.
  it('starts on the block it is given, its pill pressed', () => {
    renderList({ block: 'Б' })
    expect(pills('Блок').map((each) => each.getAttribute('aria-pressed'))).toEqual(['false', 'false', 'true'])
    expect(text(meta())).toBe('96 от 192 · 27 свободни')
    expect(firstCells()[0]).toBe('Б 101')
  })

  it('presses the pill chosen, and only it in its group', () => {
    renderList()
    fireEvent.click(pill('Блок', 'Б'))
    expect(pills('Блок').map((each) => each.getAttribute('aria-pressed'))).toEqual(['false', 'false', 'true'])
    expect(pills('Статус')[0]).toHaveAttribute('aria-pressed', 'true')
  })

  // Spec §7.8's options.
  it('offers Етаж, Площ and Изложение as selects', () => {
    renderList()
    expect(options('Етаж')).toEqual(['Всички', 'етаж 1', 'етаж 2', 'етаж 3', 'етаж 4', 'етаж 5', 'етаж 6', 'етаж 7', 'етаж 8'])
    expect(options('Площ')).toEqual(['Всяка', 'до 70 м²', '70–100 м²', 'над 100 м²'])
    expect(options('Изложение')).toEqual(['Всяко', 'юг', 'изток', 'запад', 'север'])
  })

  // Spec §3.3: a number and its unit never part.
  it('keeps each area’s number with its „м²“', () => {
    renderList()
    const areas = [...screen.getByLabelText('Площ').options].slice(1).map((option) => option.textContent)
    expect(areas).toEqual(['до 70\u00a0м²', '70–100\u00a0м²', 'над 100\u00a0м²'])
  })

  it('filters by a floor, an area and an exposure chosen in the selects', () => {
    renderList()
    fireEvent.change(screen.getByLabelText('Етаж'), { target: { value: '5' } })
    expect(rows()).toHaveLength(24)
    expect(rows().every((row) => text(row.querySelector('.c-floor')) === '5')).toBe(true)

    fireEvent.change(screen.getByLabelText('Етаж'), { target: { value: '' } })
    fireEvent.change(screen.getByLabelText('Изложение'), { target: { value: 'юг' } })
    expect(rows()).toHaveLength(40)
    fireEvent.change(screen.getByLabelText('Площ'), { target: { value: 'nad-100' } })
    expect(rows().length).toBeGreaterThan(0)
    expect(rows().every((row) => /юг/i.test(text(row.querySelector('.c-expo'))))).toBe(true)
  })
})

describe('the meta', () => {
  it('reads „192 от 192 · 69 свободни“, live', () => {
    renderList()
    expect(meta()).toHaveAttribute('aria-live', 'polite')
    expect(text(meta())).toBe('192 от 192 · 69 свободни')
  })

  it('reads „27 от 192 · 27 свободни“ after Б and Свободни', () => {
    renderList()
    fireEvent.click(pill('Блок', 'Б'))
    fireEvent.click(pill('Статус', 'Свободни'))
    expect(text(meta())).toBe('27 от 192 · 27 свободни')
    expect(rows()).toHaveLength(27)
  })

  // Spec §9: `—` until the data arrives, never a zero, and no empty-list line.
  it('reads „—“ until the data arrives, with no rows and no empty-list line', () => {
    renderList({ model: null })
    expect(text(meta())).toBe('— от 192 · — свободни')
    expect(rows()).toHaveLength(0)
    expect(screen.queryByText(/Няма апартаменти/)).toBeNull()
  })
})

describe('the empty list', () => {
  // Block А's sheet gives no exposure.
  it('says „Няма апартаменти с тези условия. Махнете някой филтър.“ for a combination with none', () => {
    renderList()
    fireEvent.click(pill('Блок', 'А'))
    fireEvent.change(screen.getByLabelText('Изложение'), { target: { value: 'север' } })
    expect(rows()).toHaveLength(0)
    expect(text(meta())).toBe('0 от 192 · 0 свободни')
    const empty = document.querySelector('.lv__empty')
    expect(text(empty)).toBe('Няма апартаменти с тези условия. Махнете някой филтър.')
    expect(empty).toHaveAttribute('colspan', '6')
  })
})

describe('the table', () => {
  it('has the columns Имот, Етаж, Вид, Обща площ, Изложение and Статус, Етаж and Изложение marked to hide on phones', () => {
    renderList()
    const heads = screen.getAllByRole('columnheader')
    expect(heads.map(text)).toEqual(['Имот', 'Етаж', 'Вид', 'Обща площ', 'Изложение', 'Статус'])
    expect(heads[1]).toHaveClass('c-floor')
    expect(heads[4]).toHaveClass('c-expo')
  })

  it('starts by the unit’s id, ascending', () => {
    renderList()
    expect(firstCells().slice(0, 2)).toEqual(['А 101', 'А 102'])
    expect(screen.getByRole('columnheader', { name: 'Имот' })).toHaveAttribute('aria-sort', 'ascending')
  })

  it('toggles the order by „Обща площ“', () => {
    renderList()
    const header = screen.getByRole('button', { name: 'Обща площ' })
    fireEvent.click(header)
    expect(text(rows()[0].children[3])).toBe('43,98 м²')
    expect(screen.getByRole('columnheader', { name: 'Обща площ' })).toHaveAttribute('aria-sort', 'ascending')
    expect(screen.getByRole('columnheader', { name: 'Имот' })).not.toHaveAttribute('aria-sort')

    fireEvent.click(header)
    expect(text(rows()[0].children[3])).toBe('114,58 м²')
    expect(screen.getByRole('columnheader', { name: 'Обща площ' })).toHaveAttribute('aria-sort', 'descending')
  })

  it('sorts by Етаж and by Имот too, but not by the other columns', () => {
    renderList()
    fireEvent.click(screen.getByRole('button', { name: 'Етаж' }))
    fireEvent.click(screen.getByRole('button', { name: 'Етаж' }))
    expect(text(rows()[0].querySelector('.c-floor'))).toBe('8')
    fireEvent.click(screen.getByRole('button', { name: 'Имот' }))
    expect(firstCells()[0]).toBe('А 101')
    expect(screen.queryByRole('button', { name: 'Вид' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Статус' })).toBeNull()
  })

  // Ruling F10: the unit's label, as the address carries it.
  it('opens a unit from its row: a click calls onUnit with its label („А 101“)', () => {
    const onUnit = renderList()
    fireEvent.click(rows()[0])
    expect(onUnit).toHaveBeenCalledWith('А 101')
  })

  it('opens a unit from its row with Enter or Space, each row in the tab order', () => {
    const onUnit = renderList()
    const [first, second] = rows()
    expect(first).toHaveAttribute('tabindex', '0')
    fireEvent.keyDown(first, { key: 'Enter' })
    fireEvent.keyDown(second, { key: ' ' })
    fireEvent.keyDown(second, { key: 'a' })
    expect(onUnit.mock.calls).toEqual([['А 101'], ['А 102']])
  })

  it('names each row by its unit first, and marks the sold ones', () => {
    renderList()
    expect(screen.getAllByRole('row', { name: /^А 501\b/ })).toHaveLength(1)
    const sold = rows().filter((row) => row.dataset.status === 'sold')
    expect(sold).toHaveLength(115)
    for (const row of sold) expect(row).toHaveClass('is-sold')
    expect(rows().find((row) => text(row.querySelector('td')) === 'А 101')).toHaveAttribute('data-status', 'available')
  })

  it('shows each unit’s type, area, exposure (or „—“) and status chip', () => {
    renderList()
    const cells = (label) => [...rows().find((row) => text(row.querySelector('td')) === label).children].map(text)
    expect(cells('А 101')).toEqual(['А 101', '1', '2-стаен', '65,68 м²', '—', 'Свободен'])
    expect(cells('Б 102')).toEqual(['Б 102', '1', '3-стаен', '111,74 м²', 'Юг/Изток', 'Свободен'])
  })

  it('scrolls in a box of its own, which Lenis leaves alone', () => {
    renderList()
    expect(document.querySelector('.lv__table')).toHaveAttribute('data-lenis-prevent')
  })
})

it('ends with the footnote „Продадените остават в списъка. Изложение има само за блок Б, така е в таблицата.“', () => {
  renderList()
  expect(text(document.querySelector('.lv__note'))).toBe('Продадените остават в списъка. Изложение има само за блок Б, така е в таблицата.')
  // Spec §3.3: a one-letter word and „блок Б“ stay with what follows.
  expect(document.querySelector('.lv__note').textContent).toContain('в\u00a0списъка')
  expect(document.querySelector('.lv__note').textContent).toContain('блок\u00a0Б')
})
