import { fireEvent } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { holdEuRow, releaseOnFirstMove } from './landingHold'

// The landing hold (M3/M4 spec §8; ruling T7a): a landing on a deep link or on
// #zapitvane keeps the header's 36 px EU row in view. holdEuRow marks <html>
// with data-eu-hold, which the header and the dialogs read (src/styles/
// shell.css, src/explorer/explorer.css); releaseOnFirstMove lets the landing
// go on the visitor's own first move, 400 ms on: the wheel, a touch move, a
// key or a pointer's press. Never on a scroll, which the page makes too: the
// landing's own jump, and every ScrollTrigger.refresh(), which takes the page
// to the top and back.

const MOVES = {
  wheel: () => fireEvent.wheel(window, { deltaY: 120 }),
  'touch move': () => fireEvent.touchMove(window),
  key: () => fireEvent.keyDown(document.body, { key: 'ArrowDown' }),
  // On the page's scrollbar, Chrome sends it to <html>.
  'pointer press': () => fireEvent.pointerDown(document.documentElement),
}
const TYPES = ['wheel', 'touchmove', 'keydown', 'pointerdown']
const LISTENED = [...TYPES, 'scroll']

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

// What this pins (M4 Task 4, fix round 2): Многофамилна's ?view=list landing
// lost its row whenever the motion's idle queue drained more than 400 ms
// after the jump. That queue's ScrollTrigger.refresh() (src/motion/
// runtime.js) takes the page to the top and back, and the browser then fires
// `scroll`, which the hold took for the visitor's. Here window.scrollTo fires
// `scroll` as a browser's does (jsdom's scrolls nothing).
it('lets no scroll the page makes itself go, 400 ms on or later; the visitor’s wheel does', () => {
  vi.spyOn(window, 'scrollTo').mockImplementation(() => fireEvent.scroll(window))
  const release = vi.fn()
  const stop = releaseOnFirstMove(release)
  vi.advanceTimersByTime(500)

  // ScrollTrigger.refresh(): to the top, and back to where the page was.
  window.scrollTo(0, 0)
  window.scrollTo(0, 1991)
  // The document's own scroll event, which a scroll of the page fires too.
  fireEvent.scroll(document)
  vi.advanceTimersByTime(5000)
  window.scrollTo(0, 1991)
  expect(release).not.toHaveBeenCalled()

  fireEvent.wheel(window, { deltaY: 120 })
  expect(release).toHaveBeenCalledTimes(1)
  stop()
})

// A move that something on its way stops, as a dialog stops its Escape, is
// still the visitor's: the hold hears it before anything under it does.
it('hears a move whose propagation something stops', () => {
  const release = vi.fn()
  const stop = releaseOnFirstMove(release)
  vi.advanceTimersByTime(400)
  const stopIt = (event) => event.stopPropagation()
  document.body.addEventListener('keydown', stopIt)
  fireEvent.keyDown(document.body, { key: 'Escape' })
  document.body.removeEventListener('keydown', stopIt)
  expect(release).toHaveBeenCalledTimes(1)
  stop()
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
  const added = add.mock.calls.filter(([type]) => LISTENED.includes(type))
  expect(added.map(([type]) => type).sort()).toEqual([...TYPES].sort())

  stop()
  // Each with the options it was added with, its capture above all.
  for (const [type, listener, options] of added) expect(remove).toHaveBeenCalledWith(type, listener, options)
  for (const move of Object.values(MOVES)) move()
  expect(release).not.toHaveBeenCalled()

  // Before its time, none is ever added.
  add.mockClear()
  releaseOnFirstMove(release)()
  vi.advanceTimersByTime(1000)
  expect(add.mock.calls.filter(([type]) => LISTENED.includes(type))).toEqual([])
  for (const move of Object.values(MOVES)) move()
  expect(release).not.toHaveBeenCalled()
})
