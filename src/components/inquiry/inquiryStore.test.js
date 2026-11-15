import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { acquireScrollLock, releaseScrollLock, setLenis } from '../../utils/lenis'
import { chooseInquiryOption, clearInquiryOption, INQUIRY_OPTIONS, presetInquiry, removePick, resetInquiry, useInquiryState } from './inquiryStore'

// The inquiry's shared state (spec §10, §5.3): the option the form's select
// shows and the apartments sent to it, which any action on the page can
// preset (the Многофамилна half, the explorer's units, the parking actions).
// A preset glides the page to the form, #zapitvane, and then focuses its
// first field.

afterEach(() => {
  resetInquiry()
  vi.useRealTimers()
  document.body.innerHTML = ''
})

it('offers each page its four subjects', () => {
  const rows = (page) => INQUIRY_OPTIONS[page].map(({ value, label, subject }) => [value, label.replace(/\s/g, ' '), subject])
  expect(rows('home')).toEqual([
    ['golden-residence', 'Golden Residence, жк Левски Г', 'Golden Residence'],
    ['mnogofamilna', 'Многофамилна сграда, ж.к. Връбница-1', 'Многофамилна сграда, ж.к. Връбница-1'],
    ['build', 'Строителство или ремонт', 'Строителство или ремонт'],
    ['other', 'Друго', 'Друго'],
  ])
  expect(rows('golden-residence')).toEqual([
    ['golden-residence', 'Апартамент в Golden Residence', 'Golden Residence'],
    ['garage', 'Гараж или паркомясто в Golden Residence', 'Golden Residence, гараж или паркомясто'],
    ['mnogofamilna', 'Многофамилна сграда, ж.к. Връбница-1', 'Многофамилна сграда, ж.к. Връбница-1'],
    ['other', 'Друго', 'Друго'],
  ])
})

describe('the store', () => {
  const state = () => renderHook(() => useInquiryState())

  it('starts with no option and no picks', () => {
    expect(state().result.current).toEqual({ option: null, picks: [] })
  })

  it('merges a preset: the option, and each pick once', () => {
    const { result } = state()
    act(() => presetInquiry({ option: 'golden-residence', pick: 'А 301' }))
    act(() => presetInquiry({ pick: 'А 302' }))
    act(() => presetInquiry({ pick: 'А 301' }))
    expect(result.current).toEqual({ option: 'golden-residence', picks: ['А 301', 'А 302'] })
  })

  it('removePick drops one pick', () => {
    const { result } = state()
    act(() => presetInquiry({ pick: 'А 301' }))
    act(() => presetInquiry({ pick: 'А 302' }))
    act(() => removePick('А 301'))
    expect(result.current.picks).toEqual(['А 302'])
  })

  it('chooseInquiryOption keeps the visitor’s choice, and the picks', () => {
    const { result } = state()
    act(() => presetInquiry({ option: 'mnogofamilna', pick: 'А 301' }))
    act(() => chooseInquiryOption('other'))
    expect(result.current).toEqual({ option: 'other', picks: ['А 301'] })
  })

  it('resetInquiry clears it', () => {
    const { result } = state()
    act(() => presetInquiry({ option: 'mnogofamilna', pick: 'А 301' }))
    act(() => resetInquiry())
    expect(result.current).toEqual({ option: null, picks: [] })
  })

  // Ruling C5.1: what the inquiry section calls as it leaves the page, so the
  // next page's form starts on its own subject. The picks stay: the explorer
  // pages hand them on.
  it('clearInquiryOption drops the option, and keeps the picks', () => {
    const { result } = state()
    act(() => presetInquiry({ option: 'mnogofamilna', pick: 'А 301' }))
    act(() => clearInquiryOption())
    expect(result.current).toEqual({ option: null, picks: ['А 301'] })
  })
})

// Spec §5.3: Lenis 1.3.27 ignores scrollTo while a scroll lock has stopped it
// (node_modules/lenis/dist/lenis.mjs:759), and a dialog closed by the same
// click releases its lock only in the effects of the commit that closes it.
// So the glide starts in the first animation frame in which no lock is held.
describe('the glide to the form', () => {
  let lenis
  let input
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'requestAnimationFrame', 'cancelAnimationFrame'] })
    document.body.innerHTML = '<div id="zapitvane"><input id="f-name"></div>'
    input = document.getElementById('f-name')
    // Lenis as 1.3.27 behaves: a stopped Lenis does nothing on scrollTo.
    lenis = {
      stopped: false,
      moves: 0,
      stop() { this.stopped = true },
      start() { this.stopped = false },
      dimensions: { resize() {} },
      scrollTo: vi.fn(function scrollTo() {
        if (!this.stopped) this.moves += 1
      }),
    }
    setLenis(lenis)
  })
  afterEach(() => setLenis(null))

  it('waits for the scroll locks, then glides once, and focuses the name 1.5 s later', () => {
    const focus = vi.spyOn(input, 'focus')
    acquireScrollLock()
    presetInquiry({ pick: 'А 301' })
    for (let frame = 0; frame < 5; frame += 1) vi.advanceTimersToNextFrame()
    expect(lenis.scrollTo).not.toHaveBeenCalled()

    releaseScrollLock()
    vi.advanceTimersToNextFrame()
    expect(lenis.scrollTo).toHaveBeenCalledTimes(1)
    expect(lenis.moves).toBe(1)
    expect(document.activeElement).not.toBe(input)

    vi.advanceTimersByTime(1500)
    expect(document.activeElement).toBe(input)
    expect(focus).toHaveBeenCalledWith({ preventScroll: true })
  })

  it('glides in the next frame when no lock is held', () => {
    presetInquiry({ option: 'mnogofamilna' })
    expect(lenis.scrollTo).not.toHaveBeenCalled()
    vi.advanceTimersToNextFrame()
    expect(lenis.moves).toBe(1)
  })

  // A lock still held after half a second is something else that is open: the
  // page stays where it is, and the focus with it.
  it('gives up after 500 ms of waiting', () => {
    acquireScrollLock()
    presetInquiry({ pick: 'А 301' })
    vi.advanceTimersByTime(600)
    releaseScrollLock()
    vi.advanceTimersByTime(2000)
    expect(lenis.scrollTo).not.toHaveBeenCalled()
    expect(document.activeElement).not.toBe(input)
  })

  // A second preset takes over from the first: one glide, one focus.
  it('glides once for two presets in a row', () => {
    presetInquiry({ pick: 'А 301' })
    presetInquiry({ pick: 'А 302' })
    vi.advanceTimersToNextFrame()
    vi.advanceTimersByTime(1500)
    expect(lenis.scrollTo).toHaveBeenCalledTimes(1)
  })

  // A section that leaves the page (clearInquiryOption) calls off a glide on
  // its way, and the focus after it: the next page may have a form of its
  // own, whose name the visitor never asked for.
  it('calls off a glide on its way when the inquiry’s section leaves the page', () => {
    presetInquiry({ option: 'mnogofamilna' })
    vi.advanceTimersToNextFrame()
    expect(lenis.scrollTo).toHaveBeenCalledTimes(1)
    clearInquiryOption()
    vi.advanceTimersByTime(1500)
    expect(document.activeElement).not.toBe(input)

    presetInquiry({ option: 'mnogofamilna' })
    clearInquiryOption()
    vi.advanceTimersToNextFrame()
    expect(lenis.scrollTo).toHaveBeenCalledTimes(1)
  })
})
