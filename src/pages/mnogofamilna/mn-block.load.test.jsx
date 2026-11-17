import { act, fireEvent, render } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { goOffline } from '../../../tests/contracts/site'
import { resetInquiry } from '../../components/inquiry/inquiryStore'
import { MN_PROJECT } from '../../explorer/projects/mn'
import MnBlockPage from './MnBlockPage'

// A block page's dialogs, the plan stage and the unit panel, are a chunk of
// their own (surfaces.js) with Многофамилна's plans, preloaded on the first
// hover or focus (spec M3 §10, Diptych §12), so the first „Отворете плана“
// opens at once. The block's facade never loads them (block mode has no
// panels, Facade.jsx), and the provider only once the address asks for a
// dialog (ExplorerContext.jsx): the page warms them itself, as a pointer
// comes over its floors' section (#explorer), presses in it, or the focus
// comes into it. loadSurfaces shares one load in flight, so warming again
// costs nothing.
//
// Here loadSurfaces is a stand-in whose load never ends.

const load = vi.hoisted(() => vi.fn())
vi.mock('../../explorer/loadSurfaces', () => ({ loadSurfaces: load, loadedSurfaces: () => null }))

beforeEach(() => {
  goOffline()
  load.mockReset()
  load.mockReturnValue(new Promise(() => {}))
})
afterEach(() => {
  resetInquiry()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

function renderPage() {
  render(
    <MemoryRouter initialEntries={['/projects/mnogofamilna-sgrada/block-a']}>
      <MnBlockPage block="А" />
    </MemoryRouter>,
  )
  return document.querySelector('#explorer')
}

it('loads nothing before the visitor comes to the floors', () => {
  renderPage()

  expect(load).not.toHaveBeenCalled()
})

it.each([
  ['a pointer coming over the floors', (floors) => fireEvent.pointerEnter(floors, { pointerType: 'mouse' })],
  ['a press on a row', (floors) => fireEvent.pointerDown(floors.querySelector('.mbr[data-k="А-7"] .mbr__go'), { pointerType: 'touch' })],
  ['the focus coming into a row', (floors) => act(() => floors.querySelector('.mbr[data-k="А-7"] .mbr__go').focus())],
])('warms the dialogs and Многофамилна’s plans on %s', (_, come) => {
  const floors = renderPage()

  come(floors)

  expect(load).toHaveBeenCalledWith(MN_PROJECT)
})

// A failed warm-up says nothing: the open that needs the chunk asks again,
// and says so if that fails too (ExplorerContext.jsx).
it('lets a failed warm-up go quietly', async () => {
  load.mockImplementation(() => Promise.reject(new Error('offline')))
  const errors = vi.spyOn(console, 'error').mockImplementation(() => {})
  const floors = renderPage()

  fireEvent.pointerEnter(floors, { pointerType: 'mouse' })
  await act(async () => {})

  expect(load).toHaveBeenCalledTimes(1)
  expect(errors).not.toHaveBeenCalled()
})
