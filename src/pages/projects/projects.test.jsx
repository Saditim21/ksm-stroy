import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { goOffline, renderSiteAt } from '../../../tests/contracts/site'
import { MN_PROJECT } from '../../explorer/projects/mn'
import { MN_UNITS } from '../../explorer/projects/mn.units'
import Projects, { meta } from '../../routes/projects'
import { recordingMotion, stubIdle } from '../../test/gsap'
import { mockMatchMedia } from '../../test/media'
import { mouseClick, tap } from '../../test/pointer'

// Продажби (spec M3/M4 §7.1), opened as a visitor opens it
// (tests/contracts/site.jsx), offline, so the store ends on the data built
// into the site: the sales board, whose squares open their apartments on
// their buildings' pages, a finger's first tap only previewing one, and
// whose caption names the floor and the apartment a pointer, the keyboard
// or a tap is on. The motion engine is a recording stand-in
// (src/test/gsap.js): nothing moves, and what would is kept.

const engine = vi.hoisted(() => ({ motion: null }))
vi.mock('../../motion/engine.js', () => ({ default: engine.motion }))
const recorder = recordingMotion()
engine.motion = recorder.motion

const plot = (name) => screen.getByRole('group', { name })
const square = (building, label) => within(plot(building)).getByRole('button', { name: (name) => name.split(',')[0] === label })
const caption = (key) => document.querySelector(`.bd--${key} .bd__cap`)
const textOf = (element) => element.textContent.replace(/\s+/g, ' ').trim()
const path = () => `${window.location.pathname}${window.location.search}${window.location.hash}`
const GR = 'Golden Residence'
const MN = 'Многофамилна сграда'

let flushMotion
beforeEach(() => {
  recorder.reset()
  goOffline()
  flushMotion = stubIdle()
})
afterEach(async () => {
  vi.useRealTimers()
  await flushMotion()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

// The page, once Golden Residence's squares have their statuses (the data
// built into the site, offline).
async function openBoard() {
  renderSiteAt('/projects')
  await waitFor(() => expect(square(GR, 'А 301').className).not.toBe('s-none'), { timeout: 15000 })
}

// Spec §7.1: the squares are neutral until Golden Residence's data is in,
// then each takes its status (А 301 is free in the built-in data).
it('colours Golden Residence’s squares once its data is in: А 301 free', async () => {
  await openBoard()

  expect(square(GR, 'А 301')).toHaveClass('s-free')
  expect(square(GR, 'А 301')).toHaveAccessibleName('А 301, Свободен')
  expect(within(plot(GR)).getAllByRole('button').filter((each) => each.className === 's-none')).toHaveLength(0)
}, 30000)

describe('the caption', () => {
  // Spec §7.1: hover or focus on a square names its floor with its counts,
  // and the apartment with its type, area, exposure and status.
  it('names the floor and the apartment a mouse points at', async () => {
    await openBoard()
    fireEvent.pointerOver(square(GR, 'А 301'), { pointerType: 'mouse' })

    const shown = caption('gr')
    expect(textOf(shown.querySelector('.cap__fl .serif'))).toBe('Блок А, етаж 3')
    expect(shown.querySelector('.cap__fl .serif').textContent).toBe('Блок А, етаж 3')
    expect([...shown.querySelectorAll('.cap__fl .st')].map(textOf)[0]).toMatch(/^\d+ свободн(и|ен)$/)
    expect(textOf(shown.querySelector('.cap__u'))).toBe('А 301 2-стаен, 62,18 м², юг Свободен')
    expect(shown.querySelector('.legend')).toBeNull()
    // The rest of the building dims, its floor lit (projects.css).
    expect(document.querySelector('.bd--gr .bd__plot')).toHaveAttribute('data-hot')
  }, 30000)

  it('follows the keyboard: a square that takes the focus names its floor and apartment', async () => {
    await openBoard()
    act(() => square(MN, 'Б-807').focus())

    expect(textOf(caption('mn').querySelector('.cap__fl .serif'))).toBe('Блок Б, етаж 9')
    expect(textOf(caption('mn').querySelector('.cap__u'))).toBe('Б-807 3-стаен, 100,71 м², север/запад Свободен')
  }, 30000)

  // The floor of Многофамилна's top row is 10, its attic.
  it('names Многофамилна’s floors by the data: А-101 on floor 2', async () => {
    await openBoard()
    fireEvent.pointerOver(square(MN, 'А-101'), { pointerType: 'mouse' })

    expect(textOf(caption('mn').querySelector('.cap__fl .serif'))).toBe('Блок А, етаж 2')
  }, 30000)

  it('goes back to the building’s legend when the mouse leaves', async () => {
    await openBoard()
    fireEvent.pointerOver(square(GR, 'Б 702'), { pointerType: 'mouse' })
    expect(caption('gr').querySelector('.cap__u')).not.toBeNull()

    vi.useFakeTimers()
    fireEvent.pointerLeave(document.querySelector('.bd--gr .bd__plot'), { pointerType: 'mouse' })
    act(() => vi.advanceTimersByTime(300))
    expect(caption('gr').querySelector('.cap__u')).toBeNull()
    expect(caption('gr').querySelector('.legend')).not.toBeNull()
    expect(document.querySelector('.bd--gr .bd__plot')).not.toHaveAttribute('data-hot')
  }, 30000)

  it('goes back to the keyboard’s square when the mouse leaves with the focus still on the board', async () => {
    await openBoard()
    act(() => square(GR, 'А 301').focus())
    fireEvent.pointerOver(square(GR, 'Б 702'), { pointerType: 'mouse' })
    expect(textOf(caption('gr').querySelector('.cap__u'))).toMatch(/^Б 702 /)

    fireEvent.pointerLeave(document.querySelector('.bd--gr .bd__plot'), { pointerType: 'mouse' })
    expect(textOf(caption('gr').querySelector('.cap__u'))).toMatch(/^А 301 /)
    expect(textOf(caption('gr').querySelector('.cap__fl .serif'))).toBe('Блок А, етаж 3')
  }, 30000)
})

// Spec §7.1: a click or Enter opens the unit on its project's page.
describe('opening an apartment', () => {
  it('opens a Golden Residence square’s apartment on its page’s explorer with a click', async () => {
    await openBoard()
    mouseClick(square(GR, 'А 301'))

    await waitFor(() => expect(path()).toBe(`/projects/golden-residence?unit=${encodeURIComponent('А 301')}#explorer`))
  }, 30000)

  it('opens a Многофамилна square’s apartment with Enter', async () => {
    await openBoard()
    const target = square(MN, 'Б-702')
    act(() => target.focus())
    fireEvent.keyDown(target, { key: 'Enter' })
    fireEvent.click(target, { detail: 0 })

    await waitFor(() => expect(path()).toBe(`/projects/mnogofamilna-sgrada?unit=${encodeURIComponent('Б-702')}`))
  }, 30000)

  // Spec §7.1: on touch, the first tap previews and the second opens.
  it('previews on a finger’s first tap, and opens on the second', async () => {
    await openBoard()
    tap(square(MN, 'Б-702'))

    expect(path()).toBe('/projects')
    expect(textOf(caption('mn').querySelector('.cap__u'))).toMatch(/^Б-702 /)

    tap(square(MN, 'Б-702'))
    await waitFor(() => expect(path()).toBe(`/projects/mnogofamilna-sgrada?unit=${encodeURIComponent('Б-702')}`))
  }, 30000)

  it('previews again when a finger taps another square, and lets go when it taps outside the board', async () => {
    await openBoard()
    tap(square(MN, 'Б-702'))
    tap(square(MN, 'Б-801'))

    expect(path()).toBe('/projects')
    expect(textOf(caption('mn').querySelector('.cap__u'))).toMatch(/^Б-801 /)

    fireEvent.pointerDown(document.body, { pointerType: 'touch' })
    expect(caption('mn').querySelector('.cap__u')).toBeNull()
    tap(square(MN, 'Б-801'))
    expect(path()).toBe('/projects')
  }, 30000)
})

// The board reads Многофамилна as its explorer does (projects/mn.units.js,
// which MN_PROJECT is made of): the same labels on every floor.
it('labels Многофамилна’s squares as its explorer does', () => {
  expect(MN_PROJECT).toMatchObject(MN_UNITS)
  const { floors, perFloor } = MN_UNITS
  for (let floor = floors.min; floor <= floors.max; floor += 1) {
    for (let n = 1; n <= perFloor; n += 1) {
      const unit = { block: 'Б', floor, suffix: String(n).padStart(2, '0') }
      expect(MN_UNITS.unitLabel(unit)).toBe(MN_PROJECT.unitLabel(unit))
    }
  }
})

// Ruling M4-PF13: the board is the first screen, so the squares' own
// reveal (BlockGrid's, for a block coming up from below) returns before any
// tween: with motion on, at scroll 0, no square is hidden. The page alone,
// without the site's smooth scrolling, which the recording engine does not
// model.
it('hides no square at scroll 0 with motion on', async () => {
  const restore = mockMatchMedia({ fine: true })
  try {
    render(
      <MemoryRouter initialEntries={['/projects']}>
        <Projects />
      </MemoryRouter>,
    )
    await waitFor(() => expect(square(GR, 'А 301').className).not.toBe('s-none'), { timeout: 15000 })
    await flushMotion()

    expect(recorder.motion.gsap.context).toHaveBeenCalled()
    const squares = [...document.querySelectorAll('#top .blk__grid button')]
    expect(squares).toHaveLength(336)
    const tweened = recorder.tweens.flatMap(({ targets }) => (targets instanceof Element ? [targets] : [...targets]))
    expect(tweened.filter((element) => squares.includes(element))).toEqual([])
    expect(squares.filter((element) => element.style.opacity !== '')).toEqual([])
  } finally {
    restore()
  }
}, 30000)

// Production's head (its Projects.jsx), and its share image (spec M3/M4 §11):
// the page's first picture, Golden Residence's render over the buildings'
// rows.
it('keeps production’s head and shares Golden Residence’s render', () => {
  const head = meta()
  expect(head).toContainEqual({ title: 'Продажби - KSM Stroy' })
  expect(head).toContainEqual({ tagName: 'link', rel: 'canonical', href: 'https://www.ksmstroy.com/projects' })
  expect(head).toContainEqual({ property: 'og:image', content: 'https://www.ksmstroy.com/img/gr-corner-og.jpg' })
})
