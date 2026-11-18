import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { loadFlip } from '../../motion/flip'
import { loadMotion } from '../../motion/runtime'
import Blog from '../../routes/blog'
import { recordingMotion, stubIdle } from '../../test/gsap'
import { mockMatchMedia } from '../../test/media'

// A work's book (spec M3/M4 §7.2; Review Focus 4; ruling M4-PF7): a plate,
// or „Разгледайте проекта“, opens the work's photos as a full-screen book, a
// real dialog named after the work, a portal on <body>, the page behind it
// inert. The title page is the record; the photos come two at a time, in
// true colour; ←, →, Home and End turn the pages, as do the arrows, the
// strip of every photo and a swipe; Tab stays inside, and Escape closes it,
// the focus back on what opened it. Where motion plays, the plate flies into
// its place in the book (Flip) and the pages turn from the seam; under
// reduced motion it opens at once, and Flip is never asked for.
//
// The motion engine is a recording stand-in (src/test/gsap.js), loaded
// before every case (the runtime's loadMotion), so whether a case has motion
// is the visitor's setting alone: none without matchMedia, as jsdom has,
// none under reduced motion, else the engine. Flip is a stand-in whose
// fit() is kept.

const engine = vi.hoisted(() => ({ motion: null }))
vi.mock('../../motion/engine.js', () => ({ default: engine.motion }))
const recorder = recordingMotion()
engine.motion = recorder.motion

const flip = vi.hoisted(() => ({ Flip: null }))
vi.mock('../../motion/flip', () => ({ loadFlip: vi.fn(() => Promise.resolve(flip.Flip)) }))
flip.Flip = {
  fit: vi.fn(() => ({ kill: vi.fn() })),
  getState: vi.fn(() => ({})),
  from: vi.fn(() => ({ kill: vi.fn() })),
}

const GREEN_LIFE = 'Green Life – Paradise Gardens and Town House'
const textOf = (element) => element.textContent.replace(/\s+/g, ' ').trim()
const plate = (n, of = 6, work = GREEN_LIFE) => screen.getByRole('button', { name: `${work}: снимка ${n} от ${of}` })
const counter = (book) => textOf(book.querySelector('.bk__n'))
const photosIn = (book) => [...book.querySelectorAll('.bk__page img')].map((img) => img.getAttribute('alt'))
const press = (key, options = {}) => fireEvent.keyDown(document.activeElement ?? document.body, { key, ...options })
const focusables = (root) => [...root.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')]

let restoreMedia
let flushMotion
beforeAll(async () => {
  await loadMotion()
})
beforeEach(() => {
  recorder.reset()
  vi.mocked(loadFlip).mockClear()
  for (const fn of Object.values(flip.Flip)) fn.mockClear()
  vi.stubGlobal('fetch', vi.fn(async () => { throw new TypeError('offline') }))
  flushMotion = stubIdle()
})
afterEach(async () => {
  await flushMotion()
  restoreMedia?.()
  restoreMedia = undefined
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

function renderPage() {
  render(
    <MemoryRouter initialEntries={['/blog']}>
      <Blog />
    </MemoryRouter>,
  )
}

// Opens Green Life's book from its cover, photo 3 of 6.
async function openFromCover() {
  renderPage()
  const cover = plate(3)
  act(() => cover.focus())
  fireEvent.click(cover)
  const book = await screen.findByRole('dialog', { name: GREEN_LIFE })
  return { cover, book }
}

describe('the book, as a dialog', () => {
  // Spec §7.2: a real dialog, named after the work, a portal on <body> that
  // Lenis leaves alone, opened at the plate's photo: 2 and 3 of 6 face each
  // other on the seam.
  it('opens a dialog named after the work, on <body>, at the plate’s photo', async () => {
    const { book } = await openFromCover()

    expect(book).toHaveAttribute('aria-modal', 'true')
    expect(book.parentElement).toBe(document.body)
    expect(book).toHaveAttribute('data-lenis-prevent')
    expect(counter(book)).toBe('02–03 / 06')
    expect(photosIn(book)).toEqual([`${GREEN_LIFE}, снимка 2`, `${GREEN_LIFE}, снимка 3`])
    expect(textOf(book.querySelector('.bk__meta'))).toBe('гр. Созопол · жилищен комплекс · 2018')
  })

  // The focus moves in, to „Затвори“, and Tab goes round inside: from the
  // last stop to the first, and back.
  it('takes the focus in and keeps Tab inside', async () => {
    const { book } = await openFromCover()
    const close = within(book).getByRole('button', { name: 'Затвори' })
    await waitFor(() => expect(close).toHaveFocus())

    const stops = focusables(book)
    act(() => stops.at(-1).focus())
    press('Tab')
    expect(stops[0]).toHaveFocus()
    press('Tab', { shiftKey: true })
    expect(stops.at(-1)).toHaveFocus()
  })

  // Ruling M4-PF7: the page behind is inert while the book is open, and
  // from outside the book Tab goes to its first stop.
  it('makes the page behind inert, and the focus cannot reach it', async () => {
    const { cover, book } = await openFromCover()

    expect(cover.closest('[inert]')).not.toBeNull()
    expect(book.closest('[inert]')).toBeNull()
    act(() => document.activeElement?.blur())
    press('Tab')
    expect(book.contains(document.activeElement)).toBe(true)

    press('Escape')
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(document.querySelectorAll('[inert]')).toHaveLength(0)
  })

  // ←, →, Home and End turn the pages, round from the last to the first;
  // the counter and the strip follow.
  it('turns the pages with ←, →, Home and End', async () => {
    const { book } = await openFromCover()
    const current = () => within(book).getAllByRole('button', { name: /^Снимка / }).filter((thumb) => thumb.getAttribute('aria-current') === 'true').map((thumb) => thumb.getAttribute('aria-label'))
    expect(current()).toEqual(['Снимка 2 от 6', 'Снимка 3 от 6'])

    press('ArrowRight')
    expect(counter(book)).toBe('04–05 / 06')
    expect(current()).toEqual(['Снимка 4 от 6', 'Снимка 5 от 6'])
    press('ArrowRight')
    expect(counter(book)).toBe('06 / 06')
    press('ArrowRight')
    expect(counter(book)).toBe('01 / 06')
    press('End')
    expect(counter(book)).toBe('06 / 06')
    press('Home')
    expect(counter(book)).toBe('01 / 06')
    press('ArrowLeft')
    expect(counter(book)).toBe('06 / 06')
  })

  // The arrows and the strip turn them too.
  it('turns them with its arrows and its strip of every photo', async () => {
    const { book } = await openFromCover()

    fireEvent.click(within(book).getByRole('button', { name: 'Следващи снимки' }))
    expect(counter(book)).toBe('04–05 / 06')
    fireEvent.click(within(book).getByRole('button', { name: 'Предишни снимки' }))
    expect(counter(book)).toBe('02–03 / 06')
    const strip = within(book).getByRole('group', { name: 'Всички снимки на обекта' })
    expect(within(strip).getAllByRole('button')).toHaveLength(6)
    fireEvent.click(within(strip).getByRole('button', { name: 'Снимка 6 от 6' }))
    expect(counter(book)).toBe('06 / 06')
  })

  // Ruling M4-PF7: a swipe turns a page (useSwipe): to the left the next.
  it('turns a page with a swipe', async () => {
    const { book } = await openFromCover()
    const stage = book.querySelector('.bk__stage')

    fireEvent.pointerDown(stage, { pointerId: 1, pointerType: 'touch', button: 0, clientX: 300, clientY: 200 })
    fireEvent.pointerUp(stage, { pointerId: 1, pointerType: 'touch', button: 0, clientX: 180, clientY: 210 })
    expect(counter(book)).toBe('04–05 / 06')
    fireEvent.pointerDown(stage, { pointerId: 2, pointerType: 'touch', button: 0, clientX: 180, clientY: 200 })
    fireEvent.pointerUp(stage, { pointerId: 2, pointerType: 'touch', button: 0, clientX: 320, clientY: 200 })
    expect(counter(book)).toBe('02–03 / 06')
  })

  // Escape closes it, and the focus goes back to the plate that opened it.
  it('closes on Escape, the focus back on the plate', async () => {
    const { cover } = await openFromCover()

    press('Escape')
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(cover).toHaveFocus()
  })

  it('closes with „Затвори“, the focus back on what opened it', async () => {
    renderPage()
    const [open] = screen.getAllByRole('button', { name: 'Разгледайте проекта' })
    act(() => open.focus())
    fireEvent.click(open)
    const book = await screen.findByRole('dialog', { name: GREEN_LIFE })

    fireEvent.click(within(book).getByRole('button', { name: 'Затвори' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(open).toHaveFocus()
  })
})

describe('its pages', () => {
  // Spec §7.2: the title page is the record, „За проекта“ and
  // „Особености“, facing the first photo: where „Разгледайте проекта“
  // opens it.
  it('opens on its title page, the record, facing the first photo', async () => {
    renderPage()
    fireEvent.click(screen.getAllByRole('button', { name: 'Разгледайте проекта' })[1])
    const book = await screen.findByRole('dialog', { name: 'Айвазовски Парк' })

    expect(counter(book)).toBe('01 / 07')
    const record = book.querySelector('.bk__page--l .bk__rec')
    expect([...record.querySelectorAll('h3')].map(textOf)).toEqual(['За проекта', 'Особености'])
    expect(textOf(record)).toContain('Модерен жилищен комплекс в престижен район на Поморие.')
    expect([...record.querySelectorAll('li')].map(textOf)).toEqual(['Морска панорама', 'Балкони', 'Асансьор', 'Охрана'])
    expect(photosIn(book)).toEqual(['Айвазовски Парк, снимка 1'])
  })

  // Spec §4.3: the book's photos in true colour, never under the grade
  // the register's plates take; each at its own size or below.
  it('shows its photos in true colour, each at its own size or below', async () => {
    const { book } = await openFromCover()

    expect(book.querySelectorAll('.grade')).toHaveLength(0)
    expect(document.querySelectorAll('#top .grade').length).toBeGreaterThan(0)
    const figures = [...book.querySelectorAll('.bk__page figure')]
    expect(figures.map((figure) => [figure.style.getPropertyValue('--w'), figure.style.getPropertyValue('--h')])).toEqual([
      ['960px', '720px'],
      ['960px', '640px'],
    ])
  })

  // Spec §7.2: a phone shows one photo at a time.
  it('shows one photo at a time on a phone', async () => {
    restoreMedia = mockMatchMedia({ coarse: true })
    const matchMedia = window.matchMedia
    window.matchMedia = (query) => (query === '(max-width: 900px)' ? { ...matchMedia(query), matches: true } : matchMedia(query))
    const { book } = await openFromCover()

    expect(counter(book)).toBe('03 / 06')
    expect(photosIn(book)).toEqual([`${GREEN_LIFE}, снимка 3`])
    expect(book.querySelector('.bk__rec')).toBeNull()
    press('ArrowRight')
    expect(counter(book)).toBe('04 / 06')
  })

  // The book follows a turn of the screen (a tablet or a phone rotated):
  // one page or two, the photo on show kept, never the spread's place in
  // the book (final review, W10). Opened from Green Life's cover, its third
  // photo: 02–03 on a desktop, 03 alone on a phone, and back.
  it('keeps the photo on show as the screen turns, one page or two', async () => {
    restoreMedia = mockMatchMedia({ reduce: true })
    const phone = window.matchMedia('(max-width: 900px)')
    const turnTheScreen = (matches) => act(() => {
      phone.matches = matches
      phone.dispatchEvent(new Event('change'))
    })
    const { book } = await openFromCover()
    expect(counter(book)).toBe('02–03 / 06')

    turnTheScreen(true)
    expect(counter(book)).toBe('03 / 06')
    expect(photosIn(book)).toEqual([`${GREEN_LIFE}, снимка 3`])
    expect(book.querySelectorAll('.bk__page figure')).toHaveLength(1)

    turnTheScreen(false)
    expect(counter(book)).toBe('02–03 / 06')
    expect(photosIn(book)).toEqual([`${GREEN_LIFE}, снимка 2`, `${GREEN_LIFE}, снимка 3`])
  })

  // A turn of the screen while a page turns lays the spread it was turning
  // to alone: the page it was covering goes at once.
  it('lays the spread it is turning to alone when the screen turns mid-turn', async () => {
    restoreMedia = mockMatchMedia({ fine: true })
    const phone = window.matchMedia('(max-width: 900px)')
    const { book } = await openFromCover()
    await waitFor(() => expect(flip.Flip.fit).toHaveBeenCalled())
    act(() => recorder.timelines[0].vars.onComplete())

    press('ArrowRight')
    expect(counter(book)).toBe('04–05 / 06')
    expect(book.querySelectorAll('.bk__page--l [data-layer]')).toHaveLength(2)
    act(() => {
      phone.matches = true
      phone.dispatchEvent(new Event('change'))
    })
    expect(counter(book)).toBe('04 / 06')
    expect(book.querySelectorAll('.bk__page--l [data-layer]')).toHaveLength(1)
    expect(photosIn(book)).toEqual([`${GREEN_LIFE}, снимка 4`])
  })
})

describe('its motion', () => {
  // Ruling M4-PF7, spec §7.2: under reduced motion the book is there at
  // once, and Flip is never asked for.
  it('opens at once under reduced motion, without loading Flip', async () => {
    restoreMedia = mockMatchMedia({ reduce: true })
    const { book } = await openFromCover()

    expect(loadFlip).not.toHaveBeenCalled()
    expect(book.style.opacity).toBe('')
    expect(document.querySelector('.bk-fly')).toBeNull()
    expect(recorder.timelines).toEqual([])
    await waitFor(() => expect(within(book).getByRole('button', { name: 'Затвори' })).toHaveFocus())
  })

  // Spec §7.2: the plate flies into its place in the book (Flip, its
  // picture never stretched), its grade lifting to true colour on the way;
  // the book fades in under it, its bar and foot after, the seam draws down,
  // and the facing page opens from the seam. Once it has landed, the photo
  // shows and „Затвори“ takes the focus.
  it('flies the plate into its place in the book through Flip', async () => {
    restoreMedia = mockMatchMedia({ fine: true })
    const { book } = await openFromCover()
    await waitFor(() => expect(flip.Flip.fit).toHaveBeenCalled())

    const fly = document.querySelector('.bk-fly')
    const photo = book.querySelector('.bk__page img[alt$="снимка 3"]')
    expect(loadFlip).toHaveBeenCalled()
    expect(flip.Flip.fit).toHaveBeenCalledWith(fly, photo, expect.objectContaining({ duration: 0.9, ease: 'expo.inOut', scale: false }))
    expect(fly.style.backgroundImage).toMatch(/url\(/)
    expect(photo.style.visibility).toBe('hidden')
    const lift = recorder.tweens.find((tween) => tween.targets === fly && 'filter' in tween.vars)
    expect(lift.vars).toMatchObject({ filter: 'saturate(1) sepia(0) brightness(1) contrast(1)', duration: 0.9, ease: 'expo.inOut' })

    const [opening] = recorder.timelines
    const steps = opening.steps.map(({ method, from, vars, position }) => [method, from, vars, position])
    expect(steps[0]).toEqual(['fromTo', { opacity: 0 }, expect.objectContaining({ opacity: 1, duration: 0.5 }), 0])
    expect(opening.steps.some(({ targets, vars }) => targets === book.querySelector('.bk__seam') && vars.scaleY === 1)).toBe(true)

    act(() => opening.vars.onComplete())
    expect(document.querySelector('.bk-fly')).toBeNull()
    expect(photo.style.visibility).toBe('')
    expect(within(book).getByRole('button', { name: 'Затвори' })).toHaveFocus()
  })

  // Spec §7.2: the pages turn from the seam: the left one opens from its
  // right edge, the right one from its left.
  it('turns a page from the seam', async () => {
    restoreMedia = mockMatchMedia({ fine: true })
    const { book } = await openFromCover()
    await waitFor(() => expect(flip.Flip.fit).toHaveBeenCalled())
    act(() => recorder.timelines[0].vars.onComplete())
    recorder.reset()

    press('ArrowRight')
    expect(counter(book)).toBe('04–05 / 06')
    const [turn] = recorder.timelines
    expect(turn.steps.slice(0, 2).map(({ from, vars }) => [from, vars.clipPath, vars.duration, vars.ease])).toEqual([
      [{ clipPath: 'inset(0% 0% 0% 100%)' }, 'inset(0% 0% 0% 0%)', 0.95, 'expo.inOut'],
      [{ clipPath: 'inset(0% 100% 0% 0%)' }, 'inset(0% 0% 0% 0%)', 0.95, 'expo.inOut'],
    ])
    // The pages it covers go once it has turned.
    expect(book.querySelectorAll('.bk__page--l figure')).toHaveLength(2)
    act(() => turn.vars.onComplete())
    expect(book.querySelectorAll('.bk__page--l figure')).toHaveLength(1)
  })

  // A close that comes while the opening waits for Flip and the photo (up
  // to 0.4 s): the book fades out, and the opening never starts, no plate
  // flying and no book fading back in (final review, W12).
  it('never starts the opening once a close has come during its wait', async () => {
    restoreMedia = mockMatchMedia({ fine: true })
    // Flip still on its way, for the register's warm-up and the book alike.
    let release
    const loading = new Promise((resolve) => {
      release = resolve
    })
    vi.mocked(loadFlip).mockImplementation(() => loading)
    try {
      const { cover, book } = await openFromCover()
      expect(loadFlip).toHaveBeenCalled()

      press('Escape')
      const fade = recorder.tweens.find((tween) => tween.method === 'to' && tween.vars.opacity === 0)
      expect(fade.targets).toEqual([book])
      expect(fade.vars).toMatchObject({ duration: 0.35, onComplete: expect.any(Function) })
      await act(async () => {
        release(flip.Flip)
        await new Promise((resolve) => setTimeout(resolve, 0))
      })
      expect(flip.Flip.fit).not.toHaveBeenCalled()
      expect(document.querySelector('.bk-fly')).toBeNull()
      expect(recorder.timelines).toEqual([])

      act(() => fade.vars.onComplete())
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
      expect(cover).toHaveFocus()
    } finally {
      vi.mocked(loadFlip).mockImplementation(() => Promise.resolve(flip.Flip))
    }
  })
})
