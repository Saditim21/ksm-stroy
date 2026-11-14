import { act, fireEvent, render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import useMotionAllowed from '../../hooks/useMotionAllowed'
import VideoBand from './VideoBand'

// VideoBand (plan Task 7, spec §5.4), ported from golden-residence
// src/components/film/VideoBand.jsx @944bb03. The poster is always there and
// is the LCP candidate. The film attaches only after the window's `load`, the
// poster's decode() and an idle period, and only within one viewport; it plays
// while visible. Its pause control appears with the first `playing`, and a
// refused play() leaves the poster alone, with no control.

vi.mock('../../hooks/useMotionAllowed', () => ({ default: vi.fn(() => true) }))

const crop = (name, w, h) => ({ path: `/img/${name}`, w, h, widths: [w], color: '#9AA39B' })
const PROPS = {
  sources: {
    desktop: { av1: '/film/hero-desktop.av1.mp4', h264: '/film/hero-desktop.mp4' },
    mobile: { av1: '/film/hero-mobile.av1.mp4', h264: '/film/hero-mobile.mp4' },
  },
  poster: { desktop: crop('hero-desktop', 1920, 760), mobile: crop('hero-mobile', 608, 760) },
  alt: 'Golden Residence през деня',
}
const AV1 = 'video/mp4; codecs="av01.0.08M.08"'

// IntersectionObservers the test drives by hand: `near` is the one-viewport
// margin, `visible` the viewport itself.
let observers
class MockIO {
  constructor(callback, options) {
    this.callback = callback
    this.options = options
    observers.push(this)
  }
  observe(el) { this.el = el }
  unobserve() {}
  disconnect() { this.disconnected = true }
}
const report = (which, isIntersecting) => act(() => {
  observers
    .filter((o) => !o.disconnected && (which === 'all' || (which === 'near') === Boolean(o.options?.rootMargin)))
    .forEach((o) => o.callback([{ isIntersecting, target: o.el }]))
})
const comeIntoView = () => report('all', true)

let idle
let readyState
beforeEach(() => {
  observers = []
  idle = []
  vi.stubGlobal('IntersectionObserver', MockIO)
  vi.stubGlobal('requestIdleCallback', (callback) => idle.push(callback))
  readyState = 'loading'
  Object.defineProperty(document, 'readyState', { configurable: true, get: () => readyState })
  HTMLImageElement.prototype.decode = vi.fn(() => Promise.resolve())
  HTMLMediaElement.prototype.play = vi.fn(() => Promise.resolve())
  HTMLMediaElement.prototype.pause = vi.fn()
  useMotionAllowed.mockReturnValue(true)
})
afterEach(() => {
  vi.unstubAllGlobals()
  delete document.readyState
  delete HTMLImageElement.prototype.decode
})

const settle = () => act(() => new Promise((resolve) => setTimeout(resolve, 0)))
async function windowLoads() {
  readyState = 'complete'
  window.dispatchEvent(new Event('load'))
  await settle()
}
const runIdle = () => act(async () => { idle.splice(0).forEach((callback) => callback()) })
async function attach() {
  await windowLoads()
  await runIdle()
  comeIntoView()
  await settle()
}
const video = () => document.querySelector('video')
const posterImg = (container) => container.querySelector('picture > img')

test('VideoBand renders only the poster before window load', async () => {
  const { container } = render(<VideoBand {...PROPS} />)
  comeIntoView()
  await runIdle()
  await settle()
  expect(video()).toBeNull()
  expect(HTMLImageElement.prototype.decode).not.toHaveBeenCalled()
  expect(posterImg(container)).toHaveAttribute('alt', PROPS.alt)
  expect(screen.queryByRole('button')).toBeNull()
})

test('VideoBand attaches the video after load, decode and visibility', async () => {
  const { container } = render(<VideoBand {...PROPS} />)
  await windowLoads()
  expect(HTMLImageElement.prototype.decode).toHaveBeenCalledTimes(1)
  expect(HTMLImageElement.prototype.decode.mock.contexts[0]).toBe(posterImg(container))
  expect(idle).toHaveLength(1)
  expect(video()).toBeNull()
  await runIdle()
  expect(video()).toBeNull()
  report('near', true)
  expect(video()).not.toBeNull()
  expect(video().muted).toBe(true)
  expect(video()).toHaveAttribute('playsinline')
  expect(video()).toHaveAttribute('loop')
  expect(video()).toHaveAttribute('preload', 'none')
  expect(video()).toHaveAttribute('aria-hidden', 'true')
  // Within one viewport but not on screen: attached, not playing.
  expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled()
  report('visible', true)
  expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(1)
  // The poster stays underneath.
  expect(posterImg(container)).toBeInTheDocument()
})

test('VideoBand waits for the poster to decode before it asks for idle time', async () => {
  let decoded
  HTMLImageElement.prototype.decode = vi.fn(() => new Promise((resolve) => { decoded = resolve }))
  render(<VideoBand {...PROPS} />)
  await windowLoads()
  expect(idle).toHaveLength(0)
  await act(async () => decoded())
  await settle()
  expect(idle).toHaveLength(1)
})

test('VideoBand refused play keeps the poster and shows no control', async () => {
  HTMLMediaElement.prototype.play = vi.fn(() => Promise.reject(Object.assign(new Error('denied'), { name: 'NotAllowedError' })))
  const { container } = render(<VideoBand {...PROPS} />)
  await attach()
  expect(HTMLMediaElement.prototype.play).toHaveBeenCalled()
  expect(video()).toBeNull()
  expect(posterImg(container)).toBeInTheDocument()
  expect(screen.queryByRole('button')).toBeNull()
})

test('VideoBand shows the pause control after the first playing, and its label toggles', async () => {
  render(<VideoBand {...PROPS} />)
  await attach()
  expect(screen.queryByRole('button')).toBeNull()
  fireEvent.playing(video())
  HTMLMediaElement.prototype.pause.mockClear()
  fireEvent.click(screen.getByRole('button', { name: 'Пауза' }))
  expect(HTMLMediaElement.prototype.pause).toHaveBeenCalled()
  HTMLMediaElement.prototype.play.mockClear()
  fireEvent.click(screen.getByRole('button', { name: 'Пусни' }))
  expect(HTMLMediaElement.prototype.play).toHaveBeenCalled()
  expect(screen.getByRole('button', { name: 'Пауза' })).toBeInTheDocument()
})

test('VideoBand plays only while visible, and a visitor’s pause holds when it comes back', async () => {
  render(<VideoBand {...PROPS} />)
  await attach()
  fireEvent.playing(video())
  HTMLMediaElement.prototype.pause.mockClear()
  report('visible', false)
  expect(HTMLMediaElement.prototype.pause).toHaveBeenCalled()
  HTMLMediaElement.prototype.play.mockClear()
  report('visible', true)
  expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(1)

  fireEvent.click(screen.getByRole('button', { name: 'Пауза' }))
  report('visible', false)
  HTMLMediaElement.prototype.play.mockClear()
  report('visible', true)
  expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled()
})

test('VideoBand keeps the video when play() is interrupted by a pause', async () => {
  HTMLMediaElement.prototype.play = vi.fn(() => Promise.reject(Object.assign(new Error('interrupted'), { name: 'AbortError' })))
  render(<VideoBand {...PROPS} />)
  await attach()
  expect(video()).not.toBeNull()
})

test('VideoBand keeps the poster when no file can be played', async () => {
  render(<VideoBand {...PROPS} />)
  await attach()
  const sources = video().querySelectorAll('source')
  fireEvent.error(sources[sources.length - 1])
  expect(video()).toBeNull()
  expect(screen.queryByRole('button')).toBeNull()
})

test('VideoBand without motion is the poster only', async () => {
  useMotionAllowed.mockReturnValue(false)
  const { container } = render(<VideoBand {...PROPS} />)
  await attach()
  expect(video()).toBeNull()
  expect(HTMLImageElement.prototype.decode).not.toHaveBeenCalled()
  expect(posterImg(container)).toBeInTheDocument()
  expect(screen.queryByRole('button')).toBeNull()
})

// The breakpoint picks the crop through <source media>, never through JS.
test('VideoBand picks each crop by <source media>: AVIF and WebP posters, AV1 then H.264 film', async () => {
  const { container } = render(<VideoBand {...PROPS} />)
  const posterSources = [...container.querySelectorAll('picture > source')]
  expect(posterSources.map((s) => [s.getAttribute('media'), s.getAttribute('type'), s.getAttribute('srcset')])).toEqual([
    ['(min-width: 768px)', 'image/avif', '/img/hero-desktop-1920.avif 1920w'],
    ['(min-width: 768px)', 'image/webp', '/img/hero-desktop-1920.webp 1920w'],
    [null, 'image/avif', '/img/hero-mobile-608.avif 608w'],
    [null, 'image/webp', '/img/hero-mobile-608.webp 608w'],
  ])
  expect(posterImg(container)).toHaveAttribute('src', '/img/hero-mobile-608.webp')
  await attach()
  const filmSources = [...video().querySelectorAll('source')]
  expect(filmSources.map((s) => [s.getAttribute('media'), s.getAttribute('type'), s.getAttribute('src')])).toEqual([
    ['(min-width: 768px)', AV1, '/film/hero-desktop.av1.mp4'],
    ['(min-width: 768px)', 'video/mp4', '/film/hero-desktop.mp4'],
    [null, AV1, '/film/hero-mobile.av1.mp4'],
    [null, 'video/mp4', '/film/hero-mobile.mp4'],
  ])
})

test('VideoBand priority makes the poster the first thing fetched', () => {
  const { container, rerender } = render(<VideoBand {...PROPS} priority />)
  expect(posterImg(container)).toHaveAttribute('fetchpriority', 'high')
  expect(posterImg(container)).toHaveAttribute('loading', 'eager')
  rerender(<VideoBand {...PROPS} />)
  expect(posterImg(container)).toHaveAttribute('loading', 'lazy')
})

test('VideoBand stops waiting when it leaves before the film is due', async () => {
  const { unmount } = render(<VideoBand {...PROPS} />)
  unmount()
  await windowLoads()
  await runIdle()
  expect(observers.every((o) => o.disconnected)).toBe(true)
  expect(HTMLImageElement.prototype.decode).not.toHaveBeenCalled()
  expect(idle).toHaveLength(0)
})
