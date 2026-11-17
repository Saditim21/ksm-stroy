import { fireEvent } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { holdEuRow, releaseOnFirstMove } from './landingHold'

// The landing hold (M3/M4 spec §8; ruling T7a): a landing on a deep link or on
// #zapitvane keeps the header's 36 px EU row in view. holdEuRow marks <html>
// with data-eu-hold, which the header and the dialogs read (src/styles/
// shell.css, src/explorer/explorer.css); releaseOnFirstMove lets the landing
// go on the visitor's first scroll, wheel, touch move or key, 400 ms on, so
// the landing's own jump never does.

const MOVES = {
  scroll: () => fireEvent.scroll(window),
  wheel: () => fireEvent.wheel(window, { deltaY: 120 }),
  'touch move': () => fireEvent.touchMove(window),
  key: () => fireEvent.keyDown(document.body, { key: 'ArrowDown' }),
}
const TYPES = ['scroll', 'wheel', 'touchmove', 'keydown']

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
  document.documentElement.removeAttribute('data-eu-hold')
})

it('holdEuRow marks <html> with data-eu-hold, and takes it off', () => {
  holdEuRow(true)
  expect(document.documentElement).toHaveAttribute('data-eu-hold', '')
  holdEuRow(true)
  expect(document.documentElement).toHaveAttribute('data-eu-hold', '')
  holdEuRow(false)
  expect(document.documentElement).not.toHaveAttribute('data-eu-hold')
})

it('releaseOnFirstMove ignores moves before 400 ms and releases on the first after', () => {
  for (const [name, move] of Object.entries(MOVES)) {
    const release = vi.fn()
    const stop = releaseOnFirstMove(release)
    move()
    vi.advanceTimersByTime(399)
    move()
    expect(release, name).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1)
    move()
    expect(release, name).toHaveBeenCalledTimes(1)
    // Only the first: the others find no listener left.
    for (const other of Object.values(MOVES)) other()
    expect(release, name).toHaveBeenCalledTimes(1)
    stop()
  }
})

it('waits as long as `after` says', () => {
  const release = vi.fn()
  const stop = releaseOnFirstMove(release, { after: 1000 })
  vi.advanceTimersByTime(999)
  MOVES.wheel()
  expect(release).not.toHaveBeenCalled()
  vi.advanceTimersByTime(1)
  MOVES.wheel()
  expect(release).toHaveBeenCalledTimes(1)
  stop()
})

it('its cleanup removes every listener', () => {
  const add = vi.spyOn(window, 'addEventListener')
  const remove = vi.spyOn(window, 'removeEventListener')
  const release = vi.fn()
  const stop = releaseOnFirstMove(release)
  vi.advanceTimersByTime(400)
  const added = add.mock.calls.filter(([type]) => TYPES.includes(type))
  expect(added.map(([type]) => type).sort()).toEqual([...TYPES].sort())

  stop()
  for (const [type, listener] of added) expect(remove).toHaveBeenCalledWith(type, listener)
  for (const move of Object.values(MOVES)) move()
  expect(release).not.toHaveBeenCalled()

  // Before its time, none is ever added.
  add.mockClear()
  releaseOnFirstMove(release)()
  vi.advanceTimersByTime(1000)
  expect(add.mock.calls.filter(([type]) => TYPES.includes(type))).toEqual([])
  for (const move of Object.values(MOVES)) move()
  expect(release).not.toHaveBeenCalled()
})
