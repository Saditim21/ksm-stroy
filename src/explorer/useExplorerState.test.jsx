import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { goOffline, renderSiteAt } from '../../tests/contracts/site'
import { presetInquiry, resetInquiry } from '../components/inquiry/inquiryStore'
import { setLenis } from '../utils/lenis'
import { loadSurfaces } from './loadSurfaces'
import { GR_PROJECT } from './projects/gr'
import { named } from './testing'

// The explorer's state in the address (spec §7.10): ?floor opens the plan
// stage, ?unit the unit panel, each read once the page has hydrated and
// written with replace, so a dialog closes in the commit its parameter goes.
// Opened as a visitor opens the page (tests/contracts/site.jsx), offline, so
// the units come from the data built into the site. The stage's chunk is in
// already, as on a page whose facade has come near the screen.

// presetInquiry as it is, watched: its glide is Task 4's to pin.
vi.mock('../components/inquiry/inquiryStore', async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, presetInquiry: vi.fn(actual.presetInquiry) }
})

const params = () => new URLSearchParams(window.location.search)
// The address's query as a reader sees it, decoded.
const query = () => decodeURIComponent(window.location.search)
const findStage = (name, options) => screen.findByRole('dialog', { name: named(name), ...options }, { timeout: 15000 })
const rail = (block, floor) => screen.getByRole('button', { name: new RegExp(`^Блок ${block}, етаж ${floor}[:.]`) })
const rowOf = (dialog, label) => within(dialog.querySelector('tbody')).getByRole('row', { name: new RegExp(`^${label}\\b`) })

// The surfaces with Golden Residence's plans, as its pages load them.
beforeAll(() => loadSurfaces(GR_PROJECT))

beforeEach(() => {
  goOffline()
})

afterEach(() => {
  resetInquiry()
  setLenis(null)
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('?floor and ?unit on a block page', () => {
  it('opens the stage on А-3 from /projects/golden-residence/block-a?floor=3', async () => {
    renderSiteAt('/projects/golden-residence/block-a?floor=3')
    const stage = await findStage('Блок А · Етаж 3')

    expect(stage).toHaveAttribute('aria-modal', 'true')
    expect(within(stage).getByRole('group', { name: 'Блок' })).toBeInTheDocument()
  })

  it('writes the floor ▲ steps to, bare, in place of the entry; a unit joins it; closing takes both away', async () => {
    renderSiteAt('/projects/golden-residence/block-a?floor=3')
    const entries = window.history.length
    fireEvent.click(within(await findStage('Блок А · Етаж 3')).getByRole('button', { name: 'По-горен етаж' }))

    const stage = await findStage('Блок А · Етаж 4')
    expect(window.location.search).toBe('?floor=4')
    expect(window.history.length).toBe(entries)

    // The data comes in, and with it the floor's rows.
    await waitFor(() => expect(rowOf(stage, 'А 401')).toBeInTheDocument(), { timeout: 15000 })
    fireEvent.click(rowOf(stage, 'А 401'))
    expect(await screen.findByRole('dialog', { name: 'А 401' })).toBeInTheDocument()
    expect(query()).toBe('?floor=4&unit=А+401')
    expect(params().get('unit')).toBe('А 401')
    expect(window.history.length).toBe(entries)
    // The stage under the panel is inert, and out of the way.
    expect(document.querySelector('.ps')).toHaveAttribute('inert')
    expect(screen.getAllByRole('dialog')).toHaveLength(1)

    fireEvent.keyDown(document.activeElement, { key: 'Escape' })
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'А 401' })).toBeNull())
    expect(window.location.search).toBe('?floor=4')
    expect(screen.getByRole('dialog', { name: named('Блок А · Етаж 4') })).toBeInTheDocument()

    fireEvent.click(within(stage).getByRole('button', { name: 'Към сградата' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(window.location.search).toBe('')
    expect(window.history.length).toBe(entries)
  }, 30000)

  // Spec §7.10, Review Focus 2: a value the explorer cannot open is ignored.
  it('opens nothing for ?floor=9, and says nothing on the console', async () => {
    const errors = vi.spyOn(console, 'error')
    renderSiteAt('/projects/golden-residence/block-a?floor=9')

    await waitFor(() => expect(rail('А', 3).querySelector('.n')).toHaveTextContent(/^\d+$/), { timeout: 15000 })
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(errors).not.toHaveBeenCalled()
  }, 30000)

  it('an unknown unit opens its floor only', async () => {
    renderSiteAt('/projects/golden-residence/block-a?floor=3&unit=А%20999')
    const stage = await findStage('Блок А · Етаж 3')

    await waitFor(() => expect(rowOf(stage, 'А 301')).toBeInTheDocument(), { timeout: 15000 })
    expect(screen.getAllByRole('dialog')).toEqual([stage])
    expect(document.querySelector('.up')).toBeNull()
  }, 30000)
})

describe('?floor on the Golden Residence page', () => {
  it('opens Б-2 from /projects/golden-residence?floor=Б-2', async () => {
    renderSiteAt('/projects/golden-residence?floor=Б-2')
    expect(await findStage('Блок Б · Етаж 2')).toBeInTheDocument()
  })
})

// Spec §7.10: a URL that opens the stage on arrival first jumps the page to
// #explorer, with no glide, so closing the stage leaves the reader at the
// facade; with no opener to return to, the focus goes to the floor's rail.
describe('a deep link', () => {
  it('jumps to #explorer, at once, before the stage opens; closing it focuses the floor’s rail', async () => {
    const jumps = []
    const shown = () => document.querySelector('.ps') !== null
    vi.spyOn(window, 'scrollTo').mockImplementation((...args) => {
      jumps.push({ by: 'window', args, stage: shown() })
    })
    const lenis = {
      scrollTo: vi.fn((...args) => jumps.push({ by: 'lenis', args, stage: shown() })),
      dimensions: { resize() {} },
      stop() {},
      start() {},
    }
    setLenis(lenis)
    const rect = (top) => ({ top, bottom: top + 900, left: 0, right: 1440, width: 1440, height: 900, x: 0, y: top })
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function place() {
      return rect(this.id === 'explorer' ? 2400 : 0)
    })

    renderSiteAt('/projects/golden-residence/block-a?floor=3')
    const stage = await findStage('Блок А · Етаж 3')

    expect(jumps).toContainEqual({ by: 'window', args: [0, 2400], stage: false })
    expect(jumps).toContainEqual({ by: 'lenis', args: [2400, { immediate: true, force: true }], stage: false })
    expect(jumps.filter(({ args }) => args.some((arg) => arg?.duration !== undefined || arg?.behavior === 'smooth'))).toEqual([])

    fireEvent.click(within(stage).getByRole('button', { name: 'Към сградата' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(document.activeElement).toBe(rail('А', 3))
  }, 30000)

  // Ruling C8.1, spec §11: a unit panel the address opened alone (?unit with
  // no ?floor) has no opener and no stage under it; as it closes, the focus
  // goes to its unit's floor's rail, never to the page's body.
  it('gives the focus to the unit’s floor’s rail as a unit panel with no stage closes', async () => {
    renderSiteAt('/projects/golden-residence/block-a?unit=%D0%90%20301')
    await screen.findByRole('dialog', { name: 'А 301' }, { timeout: 15000 })
    expect(document.querySelector('.ps')).toBeNull()

    fireEvent.keyDown(document.activeElement, { key: 'Escape' })
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(document.activeElement).toBe(rail('А', 3))
  }, 30000)

  // Spec §1.9, §14.1: the EU line is in view on landing. The jump slides the
  // header's EU row away (§6.2), and the dialogs then cover the page, so the
  // page holds the row in view (data-eu-hold on <html>: the header keeps it,
  // and the dialogs leave it room) from before the jump until the landing's
  // dialogs have gone, and no longer than the page.
  it('holds the EU row in view from before its jump until its dialogs have gone', async () => {
    const held = () => document.documentElement.hasAttribute('data-eu-hold')
    const rect = (top) => ({ top, bottom: top + 900, left: 0, right: 1440, width: 1440, height: 900, x: 0, y: top })
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function place() {
      return rect(this.id === 'explorer' ? 2400 : 0)
    })
    const atJump = []
    vi.spyOn(window, 'scrollTo').mockImplementation((x, y) => {
      if (y === 2400) atJump.push(held())
    })

    renderSiteAt('/projects/golden-residence/block-a?floor=3&unit=А%20301')
    await screen.findByRole('dialog', { name: 'А 301' }, { timeout: 15000 })
    expect(atJump).toEqual([true])
    expect(held()).toBe(true)

    fireEvent.keyDown(document.body, { key: 'Escape' })
    const stage = await findStage('Блок А · Етаж 3')
    expect(held()).toBe(true)

    fireEvent.click(within(stage).getByRole('button', { name: 'Към сградата' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(held()).toBe(false)
  }, 30000)

  it('lets the EU row go with the page, and holds it only while the link opens a dialog', async () => {
    const held = () => document.documentElement.hasAttribute('data-eu-hold')
    const { unmount } = renderSiteAt('/projects/golden-residence/block-a?floor=3')
    await findStage('Блок А · Етаж 3')
    expect(held()).toBe(true)
    unmount()
    expect(held()).toBe(false)

    // A unit the sheets do not have, and no floor: once the data is in, the
    // link opens nothing, and holds nothing.
    renderSiteAt('/projects/golden-residence/block-a?unit=А%20999')
    await waitFor(() => expect(rail('А', 3).querySelector('.n')).toHaveTextContent(/^\d+$/), { timeout: 15000 })
    expect(screen.queryByRole('dialog')).toBeNull()
    await waitFor(() => expect(held()).toBe(false))
  }, 30000)
})

// Spec §7.7: an inquiry closes both dialogs in one replace, which returns the
// focus nowhere (presetInquiry focuses the form's first field after its
// glide), and hands the unit to the form.
describe('an inquiry from the unit panel', () => {
  it('„Изпратете запитване“ on a free unit drops ?floor and ?unit in one replace, picks the unit and presets the form', async () => {
    renderSiteAt('/projects/golden-residence/block-a?floor=3&unit=А%20301')
    const panel = await screen.findByRole('dialog', { name: 'А 301' }, { timeout: 15000 })
    const replaced = vi.spyOn(window.history, 'replaceState')

    fireEvent.click(within(panel).getByRole('button', { name: 'Изпратете запитване' }))
    await waitFor(() => expect(document.querySelector('.ps, .up')).toBeNull())
    expect(replaced.mock.calls.map(([, , url]) => url)).toEqual(['/projects/golden-residence/block-a'])
    expect(presetInquiry).toHaveBeenCalledWith({ option: 'golden-residence', pick: { project: 'golden-residence', label: 'А 301' } })
    expect(within(document.getElementById('kontakti')).getByText('Апартамент А 301')).toBeInTheDocument()
    expect(document.activeElement).toBe(document.body)
  }, 30000)
})
