import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import ViewTabs from './ViewTabs'

// The two ways in (spec §7.8; extract §4.19): a tablist named „Как да
// търсите“, „Визуално“ and „По критерии“, with a roving tabindex and ←→.
// The selected tab is the parent's (the address's ?view, ExplorerSection).

const tab = (name) => screen.getByRole('tab', { name })

// The tabs with their value kept, as ExplorerSection keeps it in the address.
function Kept({ onChange, initial = 'visual' }) {
  const [value, setValue] = useState(initial)
  return (
    <ViewTabs
      value={value}
      idBase="v"
      onChange={(next) => {
        onChange(next)
        setValue(next)
      }}
    />
  )
}

describe('ViewTabs', () => {
  it('is a tablist named „Как да търсите“ with the tabs „Визуално“ and „По критерии“', () => {
    render(<ViewTabs value="visual" idBase="v" onChange={() => {}} />)
    const list = screen.getByRole('tablist', { name: 'Как да търсите' })
    expect(screen.getAllByRole('tab').map((each) => each.textContent)).toEqual(['Визуално', 'По критерии'])
    expect(list).toContainElement(tab('Визуално'))
  })

  it('marks the selected tab and keeps only it in the tab order', () => {
    const { rerender } = render(<ViewTabs value="visual" idBase="v" onChange={() => {}} />)
    expect(tab('Визуално')).toHaveAttribute('aria-selected', 'true')
    expect(tab('По критерии')).toHaveAttribute('aria-selected', 'false')
    expect(tab('Визуално')).toHaveAttribute('tabindex', '0')
    expect(tab('По критерии')).toHaveAttribute('tabindex', '-1')

    rerender(<ViewTabs value="list" idBase="v" onChange={() => {}} />)
    expect(tab('Визуално')).toHaveAttribute('aria-selected', 'false')
    expect(tab('По критерии')).toHaveAttribute('aria-selected', 'true')
    expect(tab('Визуално')).toHaveAttribute('tabindex', '-1')
    expect(tab('По критерии')).toHaveAttribute('tabindex', '0')
  })

  // Each tab controls its panel, which ExplorerSection names after idBase.
  it('names each tab’s panel', () => {
    render(<ViewTabs value="visual" idBase="v" onChange={() => {}} />)
    expect(tab('Визуално')).toHaveAttribute('id', 'v-tab-visual')
    expect(tab('Визуално')).toHaveAttribute('aria-controls', 'v-visual')
    expect(tab('По критерии')).toHaveAttribute('id', 'v-tab-list')
    expect(tab('По критерии')).toHaveAttribute('aria-controls', 'v-list')
  })

  it('selects „По критерии“ with ArrowRight, focusing it, and calls onChange(\'list\')', () => {
    const onChange = vi.fn()
    render(<Kept onChange={onChange} />)
    tab('Визуално').focus()

    fireEvent.keyDown(tab('Визуално'), { key: 'ArrowRight' })
    expect(onChange).toHaveBeenCalledWith('list')
    expect(document.activeElement).toBe(tab('По критерии'))
    expect(tab('По критерии')).toHaveAttribute('aria-selected', 'true')

    // ←, and → again from the last tab, go round to the other one.
    fireEvent.keyDown(tab('По критерии'), { key: 'ArrowLeft' })
    expect(onChange).toHaveBeenLastCalledWith('visual')
    expect(document.activeElement).toBe(tab('Визуално'))
    fireEvent.keyDown(tab('Визуално'), { key: 'ArrowLeft' })
    expect(onChange).toHaveBeenLastCalledWith('list')
    expect(document.activeElement).toBe(tab('По критерии'))
  })

  it('switches on a click', () => {
    const onChange = vi.fn()
    render(<Kept onChange={onChange} />)
    fireEvent.click(tab('По критерии'))
    expect(onChange).toHaveBeenCalledWith('list')
    expect(tab('По критерии')).toHaveAttribute('aria-selected', 'true')
  })

  // Ruling C8.8: while a switch waits for what it shows, the tab it left is
  // still the selected one. A click on it, or an arrow back to it, is passed
  // on, so the parent can call the waiting switch off (ExplorerSection, which
  // ignores the view it shows when no switch waits).
  it('passes a click on the selected tab on, and an arrow back to it', () => {
    const onChange = vi.fn()
    render(<ViewTabs value="visual" idBase="v" onChange={onChange} />)
    fireEvent.click(tab('Визуално'))
    expect(onChange).toHaveBeenLastCalledWith('visual')

    // The parent has not switched yet: → asks for the list and focuses it,
    // and ← asks for „Визуално“ again, the focus back on it.
    tab('Визуално').focus()
    fireEvent.keyDown(tab('Визуално'), { key: 'ArrowRight' })
    expect(onChange).toHaveBeenLastCalledWith('list')
    expect(document.activeElement).toBe(tab('По критерии'))
    fireEvent.keyDown(tab('По критерии'), { key: 'ArrowLeft' })
    expect(onChange).toHaveBeenLastCalledWith('visual')
    expect(document.activeElement).toBe(tab('Визуално'))
    expect(onChange).toHaveBeenCalledTimes(3)
  })

  it('leaves other keys alone', () => {
    const onChange = vi.fn()
    render(<Kept onChange={onChange} />)
    fireEvent.keyDown(tab('Визуално'), { key: 'ArrowDown' })
    fireEvent.keyDown(tab('Визуално'), { key: 'a' })
    expect(onChange).not.toHaveBeenCalled()
  })

  // The brass-l underline sits under the selected tab by CSS alone
  // (explorer.css: the tablist's data-view), so the prerendered HTML already
  // shows it in place.
  it('carries the selected view for the underline, hidden from assistive technology', () => {
    const { rerender } = render(<ViewTabs value="visual" idBase="v" onChange={() => {}} />)
    const list = screen.getByRole('tablist')
    expect(list).toHaveAttribute('data-view', 'visual')
    expect(list.querySelector('.toggle__bar')).toHaveAttribute('aria-hidden', 'true')
    rerender(<ViewTabs value="list" idBase="v" onChange={() => {}} />)
    expect(list).toHaveAttribute('data-view', 'list')
  })
})
