import { act, fireEvent, render, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { recordingMotion, stubIdle } from '../../test/gsap'
import { mockMatchMedia } from '../../test/media'
import GallerySection from './GallerySection'
import StorySection from './StorySection'

// The Golden Residence page's motion paths that follow the scroll and the
// visitor (spec §5.7; ruling C9.8): the story's wipes (extract §4.18, the
// concept's gr.js:41-64) and the gallery's openings (extract §4.28,
// gr.js:229-269). The motion engine is a recording stand-in
// (src/test/gsap.js), both as the engine module useMotion() loads and as
// what useMotionNow() hands over; the matchMedia mock allows motion and
// answers a desktop (no phone query matches).

const engine = vi.hoisted(() => ({ motion: null }))
vi.mock('../../motion/engine.js', () => ({ default: engine.motion }))
vi.mock('../../motion/useMotionNow', () => ({ default: () => () => engine.motion }))
const recorder = recordingMotion()
engine.motion = recorder.motion

let restoreMedia
let flushMotion
beforeEach(() => {
  recorder.reset()
  restoreMedia = mockMatchMedia()
  flushMotion = stubIdle()
})
// The runtime's idle queue outlives a test: a setup left in it would hold the
// queue for the next test's, so every test drains it before the page goes.
afterEach(async () => {
  await flushMotion()
  restoreMedia()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

const text = (element) => element.textContent.replace(/\s+/g, ' ').trim()
const calls = (tweens) => tweens.map(({ method, targets, from, vars }) => (from ? { method, targets, from, vars } : { method, targets, vars }))

describe('the story’s wipes', () => {
  function renderStory() {
    render(<MemoryRouter><StorySection /></MemoryRouter>)
    const section = document.getElementById('sgradata')
    return {
      blocks: [...section.querySelectorAll('.story__block')],
      layers: [...section.querySelectorAll('.story__img')],
      caption: section.querySelector('.story__cap'),
      index: section.querySelector('.story__idx'),
    }
  }

  it('watches each block from its top reaching 55 % of the screen until its bottom does', async () => {
    const { blocks } = renderStory()
    await flushMotion()
    expect(blocks).toHaveLength(4)
    expect(recorder.triggers).toEqual(blocks.map((block) => ({ trigger: block, start: 'top 55%', end: 'bottom 55%', onToggle: expect.any(Function) })))
  })

  it('wipes a block’s picture in from the seam over 1 s expo.inOut, settling from 1.08 over 1.4 s, the caption fading in after 0.3 s', async () => {
    const { layers, caption, index } = renderStory()
    await flushMotion()
    const picture = layers[2].querySelector('img')

    act(() => recorder.triggers[2].onToggle({ isActive: true }))
    // What the wipe before it left running stops first.
    expect(recorder.motion.gsap.killTweensOf).toHaveBeenCalledWith([layers[2], picture, caption])
    expect(calls(recorder.tweens)).toEqual([
      // Over every picture the stack holds: the four start at 1 to 4.
      { method: 'set', targets: layers[2], vars: { zIndex: 5 } },
      { method: 'fromTo', targets: layers[2], from: { clipPath: 'inset(0% 0% 0% 100%)' }, vars: { clipPath: 'inset(0% 0% 0% 0%)', duration: 1, ease: 'expo.inOut' } },
      { method: 'fromTo', targets: picture, from: { scale: 1.08 }, vars: { scale: 1, duration: 1.4, ease: 'expo.out' } },
      { method: 'fromTo', targets: caption, from: { opacity: 0 }, vars: { opacity: 1, duration: 0.6, delay: 0.3 } },
    ])
    expect(text(caption)).toBe('Визуализация: тераса')
    expect(text(index)).toBe('03 / 04')
  })

  it('wipes nothing for a block that leaves, or for the block on show, and brings an earlier block’s picture back on top', async () => {
    const { layers, caption, index } = renderStory()
    await flushMotion()
    act(() => recorder.triggers[2].onToggle({ isActive: true }))
    recorder.tweens.length = 0

    act(() => recorder.triggers[2].onToggle({ isActive: false }))
    act(() => recorder.triggers[2].onToggle({ isActive: true }))
    expect(recorder.tweens).toHaveLength(0)

    act(() => recorder.triggers[0].onToggle({ isActive: true }))
    expect(calls(recorder.tweens)[0]).toEqual({ method: 'set', targets: layers[0], vars: { zIndex: 6 } })
    expect(recorder.tweens[1].method).toBe('fromTo')
    expect(recorder.tweens[1].targets).toBe(layers[0])
    expect(text(caption)).toBe('Визуализация: входът и градината пред него')
    expect(text(index)).toBe('01 / 04')
  })
})

describe('the gallery’s openings', () => {
  function renderGallery() {
    render(<GallerySection />)
    const gallery = document.getElementById('galeriya')
    const s = within(gallery)
    return {
      gallery,
      next: () => fireEvent.click(s.getByRole('button', { name: 'Следващи' })),
      back: () => fireEvent.click(s.getByRole('button', { name: 'Предишни' })),
      // The layers on show in a half, bottom to top: [spread, show].
      shown: (half = 'l') => [...gallery.querySelectorAll(`.gal__half--${half} .gal__img[data-shown]`)]
        .sort((a, b) => Number(a.style.zIndex) - Number(b.style.zIndex))
        .map((layer) => [layer.dataset.spread, layer.dataset.show]),
      layersOf: (show) => [...gallery.querySelectorAll(`.gal__img[data-show="${show}"]`)],
    }
  }

  it('opens a new spread outward from the seam over the one on show, 1 s expo.inOut, settling from 1.08', () => {
    const { next, shown, layersOf } = renderGallery()
    expect(shown()).toEqual([['0', '0']])

    next()
    // The new show goes on the stack, over the first.
    expect(shown()).toEqual([['0', '0'], ['1', '1']])
    expect(shown('r')).toEqual([['0', '0'], ['1', '1']])
    const [left, right] = layersOf(1)
    expect(left.closest('.gal__half')).toHaveClass('gal__half--l')
    expect(right.closest('.gal__half')).toHaveClass('gal__half--r')

    expect(recorder.timelines).toHaveLength(1)
    const [opening] = recorder.timelines
    expect(opening.steps).toEqual([
      { method: 'fromTo', targets: left, from: { clipPath: 'inset(0% 0% 0% 100%)' }, vars: { clipPath: 'inset(0% 0% 0% 0%)', duration: 1, ease: 'expo.inOut' }, position: 0 },
      { method: 'fromTo', targets: right, from: { clipPath: 'inset(0% 100% 0% 0%)' }, vars: { clipPath: 'inset(0% 0% 0% 0%)', duration: 1, ease: 'expo.inOut' }, position: 0 },
      { method: 'fromTo', targets: [left.querySelector('img'), right.querySelector('img')], from: { scale: 1.08 }, vars: { scale: 1, duration: 1.4, ease: 'expo.out' }, position: 0.1 },
    ])
  })

  it('collapses the stack to the new spread once it has opened, and takes off what the opening set', () => {
    const { next, shown, layersOf } = renderGallery()
    next()
    const layers = layersOf(1)
    const [opening] = recorder.timelines

    act(() => opening.vars.onComplete())
    expect(shown()).toEqual([['1', '1']])
    expect(calls(recorder.tweens)).toEqual([
      { method: 'set', targets: layers, vars: { clearProps: 'clipPath' } },
      { method: 'set', targets: layers.map((layer) => layer.querySelector('img')), vars: { clearProps: 'transform' } },
    ])
  })

  // As in the concept, which adds a layer for every change: a spread chosen
  // again while the show it left still holds its own layers, under an
  // opening, opens as a fresh pair over everything, so the stage never shows
  // through; the pair goes with its show.
  it('opens a spread chosen again mid-opening as a fresh pair of layers over the stack', () => {
    const { gallery, next, back, shown, layersOf } = renderGallery()
    next()
    back()

    // Spread 0 again, on layers of its own (show 2), over spread 1's opening.
    expect(shown()).toEqual([['0', '0'], ['1', '1'], ['0', '2']])
    const fresh = layersOf(2)
    expect(fresh).toHaveLength(2)
    expect(gallery.querySelectorAll('.gal__img[data-spread="0"]')).toHaveLength(4)
    expect(recorder.timelines).toHaveLength(2)
    const [fromLeft, fromRight] = recorder.timelines[1].steps
    expect([fromLeft.targets, fromRight.targets]).toEqual(fresh)
    expect(fromLeft.targets).toBe(fresh[0])
    expect([fromLeft.from, fromRight.from]).toEqual([{ clipPath: 'inset(0% 0% 0% 100%)' }, { clipPath: 'inset(0% 100% 0% 0%)' }])

    // Spread 1's opening ends first: the shows under it go, the fresh pair stays on top.
    act(() => recorder.timelines[0].vars.onComplete())
    expect(shown()).toEqual([['1', '1'], ['0', '2']])
    // Then the fresh pair's own: it alone is left, and its spread's own layers stand hidden.
    act(() => recorder.timelines[1].vars.onComplete())
    expect(shown()).toEqual([['0', '2']])
    expect(text(gallery.querySelector('.gal__n'))).toBe('01 / 03')
  })

  it('opens the stage’s halves from the seam once, over 1.2 s, as it reaches 80 % of the screen', async () => {
    const { gallery } = renderGallery()
    const stage = gallery.querySelector('.gal__stage')
    vi.spyOn(stage, 'getBoundingClientRect').mockReturnValue({ top: 2000, bottom: 2600, left: 0, right: 1440, width: 1440, height: 600, x: 0, y: 2000 })
    await flushMotion()

    const entrance = recorder.tweens.find((tween) => tween.targets?.[0]?.classList?.contains('gal__half'))
    expect([...entrance.targets]).toEqual([...stage.querySelectorAll('.gal__half')])
    const { clipPath, ...vars } = entrance.vars
    expect(vars).toEqual({ duration: 1.2, ease: 'expo.inOut', clearProps: 'clipPath', scrollTrigger: { trigger: stage, start: 'top 80%', once: true } })
    // The left half from the seam on its right, the right half from the seam on its left.
    expect([clipPath(0), clipPath(1)]).toEqual(['inset(0% 0% 0% 100%)', 'inset(0% 100% 0% 0%)'])
  })
})
