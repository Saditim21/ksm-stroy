import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mockMatchMedia } from '../../test/media'
import WorksSection from './WorksSection'

// „Нашите обекти“ (spec §6.10; extract §4.12): production's completed works
// (Blog.jsx:128–197), each a button that brings its cover into the sticky
// panel beside the list. The panel is decoration, hidden from assistive
// technology; the list carries the names.

// The motion engine as the section sees it at the moment of a choice
// (useMotionNow): none, so the cover changes at once, unless a test gives it
// a recording GSAP.
const motion = vi.hoisted(() => {
  const state = { engine: null }
  state.now = () => state.engine
  return state
})
vi.mock('../../motion/useMotionNow', () => ({ default: () => motion.now }))
// The scroll reveals are useReveals' own (its tests). Mocked out here, so the
// matchMedia a choice's motion reads never loads the real engine for them.
vi.mock('../../motion/useReveals', () => ({ default: () => {} }))

const WORKS = [
  ['Green Life – Paradise Gardens and Town House', 'гр. Созопол · жилищен комплекс · 2018'],
  ['Айвазовски Парк', 'гр. Поморие · жилищен комплекс'],
  ['Панорама Резидънс', 'гр. Созопол · жилищен комплекс'],
  ['Сънни Хил блок 9', 'кв. Меден Рудник, гр. Бургас · жилищна сграда'],
  ['Хотел Парадайс', 'с. Огняново · хотелски комплекс'],
  ['Читалище „Асен Златаров-1924“', 'с. Огняново, община Гърмен · обществена сграда'],
]
const normal = (value) => value.replace(/\s+/g, ' ').trim()
const list = () => screen.getByRole('list')
const buttons = () => within(list()).getAllByRole('button')
const caption = () => normal(document.querySelector('#obekti .works__cap').textContent)

it('heads the section „Нашите обекти“, with Blog’s description', () => {
  render(<WorksSection />)
  const section = document.getElementById('obekti')
  expect(section).toHaveAccessibleName('Нашите обекти')
  expect(within(section).getByRole('heading', { level: 2 }).querySelector('em')).toHaveTextContent(/^обекти$/)
  expect(within(section).getByText('Разгледайте нашите успешно реализирани строителни проекти – жилищни комплекси, хотелски комплекси и санирания.')).toBeInTheDocument()
})

it('lists the six works in order, each button named by the work and its line', () => {
  render(<WorksSection />)
  const names = buttons().map((button) => normal(button.textContent))
  expect(names).toHaveLength(6)
  names.forEach((name, i) => {
    const [work, line] = WORKS[i]
    expect(name.startsWith(`${work} `), name).toBe(true)
    expect(name.endsWith(` ${line}`), name).toBe(true)
  })
  buttons().forEach((button, i) => expect(button).toHaveAccessibleName(names[i]))
  expect(within(buttons()[2]).getByText('груб строеж')).toBeInTheDocument()
})

it('starts on the first work, its cover in the panel', () => {
  render(<WorksSection />)
  expect(buttons()[0]).toHaveAttribute('aria-current', 'true')
  expect(buttons().slice(1).filter((button) => button.hasAttribute('aria-current'))).toEqual([])
  expect(caption()).toBe('Green Life – Paradise Gardens and Town House, гр. Созопол')
})

it('brings the work clicked into the panel, „{name}, {place}“ under it', async () => {
  const user = userEvent.setup({ delay: null })
  render(<WorksSection />)
  await user.click(buttons()[2])
  expect(buttons()[2]).toHaveAttribute('aria-current', 'true')
  expect(buttons()[0]).not.toHaveAttribute('aria-current')
  expect(caption()).toBe('Панорама Резидънс, гр. Созопол')
  expect(document.querySelector('#obekti .works__img[data-shown="top"] img')).toHaveAttribute('src', expect.stringContaining('/img/work-panorama-'))
})

// The keyboard chooses as the pointer does: focus is the choice.
it('brings a work into the panel when its button takes the focus', async () => {
  const user = userEvent.setup({ delay: null })
  render(<WorksSection />)
  await user.tab()
  await user.tab()
  expect(buttons()[1]).toHaveFocus()
  expect(buttons()[1]).toHaveAttribute('aria-current', 'true')
  expect(caption()).toBe('Айвазовски Парк, гр. Поморие')
})

// The covers are decoration: the panel is hidden from assistive technology,
// and each cover's alt is empty. All six are in the page, so a change of work
// never waits for a download; the ones not shown are hidden.
it('keeps every cover in the hidden panel, only the chosen one shown', () => {
  render(<WorksSection />)
  const media = document.querySelector('#obekti .works__media')
  expect(media).toHaveAttribute('aria-hidden', 'true')
  const layers = [...media.querySelectorAll('.works__img')]
  expect(layers).toHaveLength(6)
  expect(layers.map((layer) => layer.getAttribute('data-shown'))).toEqual(['top', null, null, null, null, null])
  for (const img of media.querySelectorAll('img')) {
    expect(img).toHaveAttribute('alt', '')
    expect(img).toHaveAttribute('loading', 'lazy')
  }
})

// A recording GSAP: each timeline keeps its tweens, puts a tween's starting
// clip on at once, as GSAP's fromTo does (immediateRender), and lands when
// the test says so.
function recordingGsap() {
  const clips = new Map()
  const timelines = []
  const gsap = {
    timeline(vars = {}) {
      const timeline = {
        tweens: [],
        killed: false,
        fromTo(target, from, to, position) {
          timeline.tweens.push({ target, from, to, position })
          if ('clipPath' in from) clips.set(target, from.clipPath)
          return timeline
        },
        kill() {
          timeline.killed = true
        },
        finish() {
          for (const { target, to } of timeline.tweens) if ('clipPath' in to) clips.set(target, to.clipPath)
          vars.onComplete?.()
        },
      }
      timelines.push(timeline)
      return timeline
    },
    set(target, { clearProps = '' }) {
      if (clearProps.split(',').includes('clipPath')) clips.delete(target)
    },
  }
  return { gsap, timelines, clipOf: (layer) => clips.get(layer) }
}

// Extract §4.12 (home.js:238-253): with motion, each choice wipes its cover in
// from the seam (from the top on a phone) over the covers before it, 1 s
// expo.inOut, settling from 1.08 as it does; the covers under it go once it
// has landed. The concept appends a fresh layer for every change, so a work
// chosen again while its cover is still under a wipe wipes in over the whole
// stack, and the panel never shows its bare frame through a wipe.
describe('with motion', () => {
  const FROM_SEAM = 'inset(0% 0% 0% 100%)'
  let stub
  let restoreMedia
  beforeEach(() => {
    restoreMedia = mockMatchMedia()
    stub = recordingGsap()
    motion.engine = { gsap: stub.gsap }
  })
  afterEach(() => {
    motion.engine = null
    restoreMedia()
  })

  // The layers on show, bottom to top. Layers are compared by identity, as
  // their places in an earlier list (toEqual compares elements by structure).
  const onShow = () => [...document.querySelectorAll('#obekti .works__img[data-shown]')]
    .sort((a, b) => Number(a.style.zIndex) - Number(b.style.zIndex))
  const workOf = (layer) => Number(layer.getAttribute('data-work'))
  const placesIn = (layers, elements) => elements.map((element) => layers.indexOf(element))
  // Each wipe as the place of its layer in `layers`, and whether it was killed.
  const wipesOver = (layers) => stub.timelines.map((wipe) => [layers.indexOf(wipe.tweens[0].target), wipe.killed])

  it('wipes the chosen cover in from the seam, settling from 1.08, and drops the one under it once it lands', async () => {
    const user = userEvent.setup({ delay: null })
    render(<WorksSection />)
    const [first] = onShow()
    await user.hover(buttons()[1])
    const layers = onShow()
    expect(layers.map(workOf)).toEqual([0, 1])
    expect(layers[0]).toBe(first)
    expect(layers[1]).toHaveAttribute('data-shown', 'top')
    expect(stub.timelines).toHaveLength(1)
    const [wipe] = stub.timelines
    expect(wipe.tweens.map(({ from, to, position }) => ({ from, to, position }))).toEqual([
      { from: { clipPath: FROM_SEAM }, to: { clipPath: 'inset(0% 0% 0% 0%)', duration: 1, ease: 'expo.inOut' } },
      { from: { scale: 1.08 }, to: { scale: 1, duration: 1.3, ease: 'expo.out' }, position: 0.15 },
    ])
    expect(wipe.tweens[0].target).toBe(layers[1])
    expect(wipe.tweens[1].target).toBe(layers[1].firstElementChild)
    expect(stub.clipOf(first)).toBeUndefined()

    act(() => wipe.finish())
    expect(placesIn(layers, onShow())).toEqual([1])
    expect(stub.clipOf(layers[1])).toBeUndefined()
  })

  it('wipes in from the top on a phone', async () => {
    window.matchMedia('(max-width: 900px)').matches = true
    const user = userEvent.setup({ delay: null })
    render(<WorksSection />)
    await user.click(buttons()[2])
    expect(stub.timelines[0].tweens[0].from).toEqual({ clipPath: 'inset(0% 0% 100% 0%)' })
  })

  // The pointer on the first work, then the second, then the first again
  // within a second: the first cover stays in full at the bottom while the
  // second wipes on over it, and the first comes back as a fresh layer over
  // both.
  it('keeps the first cover in full under the wipes when the pointer goes back to it', async () => {
    const user = userEvent.setup({ delay: null })
    render(<WorksSection />)
    const [first] = onShow()
    await user.hover(buttons()[1])
    await user.hover(buttons()[0])
    const layers = onShow()
    expect(layers.map(workOf)).toEqual([0, 1, 0])
    expect(layers[0]).toBe(first)
    expect(stub.clipOf(first)).toBeUndefined()
    expect(layers[2]).not.toBe(first)
    expect(wipesOver(layers)).toEqual([[1, false], [2, false]])
    expect(stub.clipOf(layers[1])).toBe(FROM_SEAM)
    expect(stub.clipOf(layers[2])).toBe(FROM_SEAM)
    expect(buttons()[0]).toHaveAttribute('aria-current', 'true')
    expect(caption()).toBe('Green Life – Paradise Gardens and Town House, гр. Созопол')

    // Each landing drops the layers under it; the later wipe carries on.
    act(() => stub.timelines[0].finish())
    expect(placesIn(layers, onShow())).toEqual([1, 2])
    act(() => stub.timelines[1].finish())
    expect(placesIn(layers, onShow())).toEqual([2])
    expect(layers[2]).toHaveAttribute('data-shown', 'top')
  })

  // A → B → C → B: B's first wipe carries on, on its own layer, under C's,
  // and B comes back as a fresh layer over the stack.
  it('wipes a work chosen again in over the whole stack, its earlier wipe untouched', async () => {
    const user = userEvent.setup({ delay: null })
    render(<WorksSection />)
    const [first] = onShow()
    await user.hover(buttons()[1])
    const second = onShow()[1]
    await user.hover(buttons()[2])
    await user.hover(buttons()[1])
    const layers = onShow()
    expect(layers.map(workOf)).toEqual([0, 1, 2, 1])
    expect(layers[0]).toBe(first)
    expect(layers[1]).toBe(second)
    expect(layers[3]).not.toBe(second)
    expect(stub.clipOf(first)).toBeUndefined()
    expect(wipesOver(layers)).toEqual([[1, false], [2, false], [3, false]])
    expect(caption()).toBe('Айвазовски Парк, гр. Поморие')

    for (const wipe of stub.timelines) act(() => wipe.finish())
    expect(placesIn(layers, onShow())).toEqual([3])
  })

  // Reduced motion switched on mid-wipe: the next change stops the wipes and
  // shows its cover alone, at once.
  it('stops the wipes under way for a change made without motion', async () => {
    const user = userEvent.setup({ delay: null })
    render(<WorksSection />)
    await user.hover(buttons()[1])
    motion.engine = null
    await user.hover(buttons()[3])
    expect(stub.timelines.map((wipe) => wipe.killed)).toEqual([true])
    expect(onShow().map(workOf)).toEqual([3])
  })
})
