import { act, renderHook } from '@testing-library/react'
import useUnitPanel from './useUnitPanel'

// From golden-residence src/hooks/useUnitPanel.test.js @944bb03. The hook
// holds whatever unit it is given; the landing's test fixture is not ported.
const apt = (label, floor) => ({ id: label.replace(/\s/g, ''), label, kind: 'apartment', floor })

test('openUnit sets the open unit', () => {
  const { result } = renderHook(() => useUnitPanel())
  expect(result.current.open).toBeNull()
  const unit = apt('А 101', 1)
  const button = document.createElement('button')
  act(() => result.current.openUnit(unit, button))
  expect(result.current.open).toBe(unit)
})

test('closeUnit clears the open unit and focuses the opener without scrolling', () => {
  const { result } = renderHook(() => useUnitPanel())
  const button = document.createElement('button')
  button.focus = vi.fn()
  act(() => result.current.openUnit(apt('А 101', 1), button))
  act(() => result.current.closeUnit())
  expect(result.current.open).toBeNull()
  expect(button.focus).toHaveBeenCalledWith({ preventScroll: true })
})

test('closeUnit without an opener still closes', () => {
  const { result } = renderHook(() => useUnitPanel())
  act(() => result.current.openUnit(apt('А 101', 1), undefined))
  act(() => result.current.closeUnit())
  expect(result.current.open).toBeNull()
})

test('opening another unit moves focus back to its opener on close', () => {
  const { result } = renderHook(() => useUnitPanel())
  const first = document.createElement('button')
  const second = document.createElement('button')
  first.focus = vi.fn()
  second.focus = vi.fn()
  act(() => result.current.openUnit(apt('А 101', 1), first))
  act(() => result.current.openUnit(apt('Б 204', 2), second))
  expect(result.current.open.label).toBe('Б 204')
  act(() => result.current.closeUnit())
  expect(second.focus).toHaveBeenCalledWith({ preventScroll: true })
  expect(first.focus).not.toHaveBeenCalled()
})
