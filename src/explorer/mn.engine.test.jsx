import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { presetInquiry } from '../components/inquiry/inquiryStore'
import { MN_SNAPSHOT_DATA } from '../data/mnogofamilna/snapshot'
import BlockGrid from './BlockGrid'
import { FloorMeta } from './FloorFacts'
import { parseFloorParam } from './floorParam'
import { loadSurfaces } from './loadSurfaces'
import { buildModel } from './model'
import { loadPlans, plansOf } from './plans'
import PlanSvg from './PlanSvg'
import { GR_PROJECT } from './projects/gr'
import { MN_PROJECT } from './projects/mn'
import StaleNotice from './StaleNotice'
import { ExplorerTestProvider, IDLE, named, snapshotAvailability, snapshotData } from './testing'
import UnitList from './UnitList'
import useExplorer from './useExplorer'

// The one explorer, on Многофамилна (spec M3 §5, §6.4, §12): its floors 2–10,
// eight apartments a floor and 144 in all, numbered by the data (А-101 is on
// floor 2), floor 10 the attic, its numbers the dated snapshot of 01.12.2025
// until its own rows come live, and its units' inquiries under its own
// subject. Rendered with MN_PROJECT, through the explorer's provider where a
// piece reads it; the store is the test's own.

let availability = IDLE
vi.mock('../data/availability/useAvailability', () => ({ useAvailability: () => availability }))
vi.mock('../motion/useMotionNow', () => ({ default: () => () => null }))
// presetInquiry, watched: what a unit's inquiry hands the form.
vi.mock('../components/inquiry/inquiryStore', async (importOriginal) => ({ ...(await importOriginal()), presetInquiry: vi.fn() }))

const MN = 'mnogofamilna-sgrada'
const MODEL = buildModel(MN_SNAPSHOT_DATA, MN_PROJECT)
const text = (element) => element.textContent.replace(/\s+/g, ' ').trim()

const LIVE = { 'block-a': 'live', 'block-b': 'live' }

// The store with rows of Многофамилна's: the snapshot's rows, `sold` units
// sold since, of `origin` by block (live by default), over `base`, the
// store's Golden Residence (snapshotAvailability).
function withMnRows({ sold = [], origin = LIVE, base = snapshotAvailability() } = {}) {
  const rows = Object.fromEntries(['block-a', 'block-b'].map((slot) => [
    slot,
    MN_SNAPSHOT_DATA[MN][slot].map((row) => (sold.includes(row.unit) ? { ...row, status: 'Продадени' } : row)),
  ]))
  return { ...base, data: { ...base.data, [MN]: rows }, origin: { ...base.origin, [MN]: origin } }
}

beforeEach(() => {
  availability = IDLE
})

afterEach(() => {
  vi.clearAllMocks()
})

// Review Focus 2: on Многофамилна a floor outside 2–10, or a bare floor with
// no block of its own, opens nothing; a Latin or lower-case letter reads as
// its Cyrillic block.
describe('parseFloorParam with Многофамилна’s floors', () => {
  const floors = MN_PROJECT.floors

  it.each([['Б-5'], ['B-5'], ['б5']])('reads %j as Б-5', (value) => {
    expect(parseFloorParam(value, null, floors)).toEqual({ block: 'Б', floor: 5 })
  })

  it('opens the attic, А-10', () => {
    expect(parseFloorParam('А-10', null, floors)).toEqual({ block: 'А', floor: 10 })
  })

  it.each([['1', null], ['11', null], ['1', 'А'], ['11', 'А'], ['Б-0', null], ['А-1', null], ['А-11', 'Б']])('opens nothing for %j on %j', (value, route) => {
    expect(parseFloorParam(value, route, floors)).toBeNull()
  })

  it('reads a bare floor as the block route’s own', () => {
    expect(parseFloorParam('7', 'А', floors)).toEqual({ block: 'А', floor: 7 })
    expect(parseFloorParam('10', 'Б', floors)).toEqual({ block: 'Б', floor: 10 })
  })
})

// Spec M3 §5.1 (Review Focus 1): the page always shows real, dated numbers:
// the snapshot of 01.12.2025 while the store has no live rows of
// Многофамилна's, before any read, after a live read that had none, offline;
// its live rows, undated, once both blocks have them.
describe('MN model uses the snapshot until MN rows are live', () => {
  function Probe() {
    const { model, dated } = useExplorer()
    const facts = {
      units: model?.units.length ?? null,
      free: model?.totals.available ?? null,
      b9: model?.floors.get('Б-9')?.colour ?? null,
      dated,
    }
    return <output data-testid="model">{JSON.stringify(facts)}</output>
  }
  const read = () => JSON.parse(screen.getByTestId('model').textContent)
  const renderProbe = () => render(<ExplorerTestProvider project={MN_PROJECT}><Probe /></ExplorerTestProvider>)
  const SNAPSHOT = { units: 144, free: 16, b9: 'available', dated: '01.12.2025' }

  it.each([
    ['idle', IDLE],
    ['ready, Многофамилна’s slots null', snapshotAvailability()],
    ['offline, every slot built in', withMnRows({ origin: { 'block-a': 'built-in', 'block-b': 'built-in' }, base: { ...snapshotAvailability('built-in'), status: 'fallback' } })],
    ['live in one block only', withMnRows({ sold: ['Б-801'], origin: { 'block-a': null, 'block-b': 'live' } })],
  ])('shows the snapshot, dated, while the store is %s', (_, state) => {
    availability = state
    renderProbe()
    expect(read()).toEqual(SNAPSHOT)
  })

  it('shows live rows of both blocks as they are, undated', () => {
    availability = withMnRows({ sold: ['Б-801', 'Б-803', 'Б-807'] })
    renderProbe()
    expect(read()).toEqual({ units: 144, free: 13, b9: 'sold', dated: null })
  })
})

// Spec M3 §6.4: a plan draws each apartment's own number, the data's: А-101
// is on floor 2.
it('plan labels show the apartment number', async () => {
  const plans = await loadPlans(MN_PROJECT)
  const { container } = render(<PlanSvg plan={plans['А']} units={MODEL.floors.get('А-2').units} mode="mini" />)
  const labels = [...container.querySelectorAll('.u-label')].map((label) => label.textContent)

  expect(labels).toEqual(['101', '102', '103', '104', '105', '106', '107', '108'])
  expect(labels).not.toContain('201')
})

// Spec M3 §2, §6.4: floor 10 is „тавански етаж“; a floor has eight
// apartments.
it('floor meta', () => {
  const { unmount } = render(<FloorMeta project={MN_PROJECT} plan={plansOf(MN_PROJECT)['Б']} floor={MODEL.floors.get('Б-10')} />)
  const attic = text(document.querySelector('p'))
  expect(attic).toContain('8 апартамента')
  expect(attic).toContain('тавански етаж')
  unmount()

  render(<FloorMeta project={MN_PROJECT} plan={plansOf(MN_PROJECT)['Б']} floor={MODEL.floors.get('Б-9')} />)
  expect(text(document.querySelector('p'))).toBe('8 апартамента')
})

describe('unit panel', () => {
  beforeAll(() => loadSurfaces(MN_PROJECT))

  async function openUnit(label) {
    render(<ExplorerTestProvider project={MN_PROJECT} path={`/projects/mnogofamilna-sgrada?unit=${encodeURIComponent(label)}`} />)
    return screen.findByRole('dialog', { name: named(label) })
  }
  const facts = (dialog) => [...dialog.querySelectorAll('.up__dl dt')].map(text)

  // Spec M3 §6.4: the title splits on the dash as on the space, „А-*101*“;
  // no Идеални части while the data has none; the date line.
  it('names А-101 „А-“ with its number in the italic, without Идеални части, with its date', async () => {
    const dialog = await openUnit('А-101')

    const title = dialog.querySelector('.up__id')
    expect(text(title)).toBe('А-101')
    expect(title.querySelector('em')).toHaveTextContent(/^101$/)
    expect(title.firstChild.textContent).toBe('А-')
    expect(facts(dialog)).toEqual(['Застроена площ', 'Обща площ', 'Вид', 'Изложение', 'Статус'])
    expect(within(dialog).queryByText(/Идеални/)).toBeNull()
    expect(text(dialog.querySelector('.up__date'))).toMatch(/^по данни към 01\.12\.2025\.?$/i)
  })

  // Spec M3 §6.4: actions by status, as on Golden Residence (Diptych §7.7):
  // a sold unit says so, and offers no inquiry.
  it('says a sold unit is sold and offers it nothing, as on Golden Residence', async () => {
    const dialog = await openUnit('А-101')

    expect(within(dialog).getByText('Този апартамент е продаден. Свободните на етажа са оцветени в зелено.')).toBeInTheDocument()
    expect(within(dialog).queryByRole('button', { name: /запитване|Попитайте/i })).toBeNull()
  })

  // Spec M3 §6.4, §8: the inquiry presets Многофамилна, with the unit as a
  // pick of Многофамилна's.
  it('a unit’s inquiry presets Многофамилна', async () => {
    const dialog = await openUnit('А-802')

    fireEvent.click(within(dialog).getByRole('button', { name: 'Изпратете запитване' }))
    expect(presetInquiry).toHaveBeenCalledTimes(1)
    expect(presetInquiry).toHaveBeenCalledWith({ option: 'mnogofamilna', pick: { project: MN, label: 'А-802' } })
  })
})

// Spec M3 §6.2 #3: Вид without Ателие, Етаж 2–10, „от 144“, and no footnote
// about Golden Residence's exposures.
it('list options', () => {
  render(<UnitList project={MN_PROJECT} model={MODEL} onUnit={vi.fn()} />)
  const pills = (name) => within(screen.getByRole('group', { name })).getAllByRole('button').map(text)

  expect(pills('Вид')).toEqual(['Всички', '2-стаен', '3-стаен'])
  expect([...screen.getByLabelText('Етаж').options].map(text)).toEqual(['Всички', ...[2, 3, 4, 5, 6, 7, 8, 9, 10].map((floor) => `етаж ${floor}`)])
  expect(text(document.querySelector('.lv__meta'))).toBe('144 от 144 · 16 свободни')
  expect(document.querySelector('.lv').textContent).not.toMatch(/Изложение има само/)
})

// Spec M3 §4.4, §6.2 #2: the block grid is the project's, eight squares a
// floor, floors 10 down to 2; its tab stop never leaves the grid (F22).
describe('block grid 8 × 9', () => {
  const grid = () => screen.getByRole('group', { name: named('Апартаментите на блок А') })
  const cells = () => within(grid()).getAllByRole('button')
  const square = (label) => within(grid()).getByRole('button', { name: new RegExp(`^${label}(,|$)`) })
  const press = (key) => fireEvent.keyDown(document.activeElement, { key })

  it('draws 72 squares, floors 10 down to 2, А-101 first in the bottom row', () => {
    render(<ExplorerTestProvider project={MN_PROJECT}><BlockGrid model={MODEL} block="А" onUnit={vi.fn()} /></ExplorerTestProvider>)
    const all = cells()

    expect(all).toHaveLength(72)
    expect([...document.querySelectorAll('.blk__fl span')].map((span) => span.textContent)).toEqual(['10', '9', '8', '7', '6', '5', '4', '3', '2'])
    expect(all.slice(0, 8).map((cell) => cell.getAttribute('aria-label').split(',')[0])).toEqual(['А-901', 'А-902', 'А-903', 'А-904', 'А-905', 'А-906', 'А-907', 'А-908'])
    expect(all[64]).toBe(square('А-101'))
    expect(all[64]).toHaveAccessibleName('А-101, Продаден')
    expect(all.at(-1)).toBe(square('А-108'))
  })

  it('moves eight squares a floor, and stays put from the top row up', () => {
    render(<ExplorerTestProvider project={MN_PROJECT}><BlockGrid model={MODEL} block="А" onUnit={vi.fn()} /></ExplorerTestProvider>)
    act(() => square('А-905').focus())
    press('ArrowUp')
    expect(document.activeElement).toBe(square('А-905'))
    press('ArrowDown')
    expect(document.activeElement).toBe(square('А-805'))
    press('End')
    expect(document.activeElement).toBe(square('А-808'))
    press('ArrowRight')
    expect(document.activeElement).toBe(square('А-808'))
    act(() => square('А-101').focus())
    press('ArrowDown')
    expect(document.activeElement).toBe(square('А-101'))
  })

  // F22: a grid that shrinks under its tab stop keeps one, inside it.
  it('keeps its tab stop inside a grid that shrinks', () => {
    const at = (project, model) => (
      <ExplorerTestProvider project={project}>
        <BlockGrid model={model} block="А" onUnit={vi.fn()} />
      </ExplorerTestProvider>
    )
    const { rerender } = render(at(GR_PROJECT, buildModel(snapshotData(), GR_PROJECT)))
    const last = cells().at(-1)
    act(() => last.focus())
    expect(cells().filter((cell) => cell.tabIndex === 0)).toEqual([last])

    rerender(at(MN_PROJECT, MODEL))
    expect(cells()).toHaveLength(72)
    expect(cells().filter((cell) => cell.tabIndex === 0)).toEqual([square('А-108')])
  })
})

// Spec M3 §5.3: dated is not stale. Многофамилна's snapshot carries its date
// and no notice, whatever Golden Residence's sheets did.
describe('no stale notice for dated data', () => {
  const notice = () => document.querySelector('.stale')

  it.each([
    ['Golden Residence’s rows built in', snapshotAvailability({ 'block-a': 'built-in' })],
    ['offline', withMnRows({ origin: { 'block-a': 'built-in', 'block-b': 'built-in' }, base: { ...snapshotAvailability('built-in'), status: 'fallback' } })],
    ['without data', { status: 'error', data: null, origin: null, updatedAt: null }],
  ])('shows none on Многофамилна’s snapshot, %s', (_, state) => {
    availability = state
    const { unmount } = render(<StaleNotice project={MN_PROJECT} />)
    expect(notice()).toBeNull()
    unmount()

    // Golden Residence's own notice, over the same store.
    render(<StaleNotice project={GR_PROJECT} />)
    expect(notice()).not.toBeNull()
  })
})
