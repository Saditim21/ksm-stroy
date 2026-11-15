import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { goOffline, mainText, renderSiteAt } from '../../../tests/contracts/site'
import { resetInquiry } from '../../components/inquiry/inquiryStore'
import { mapsUrl } from '../../config/site'
import * as grModule from '../../routes/golden-residence'
import { setLenis } from '../../utils/lenis'
import { EXPO_IN_OUT } from '../../utils/motion'

// The Golden Residence page (spec §8.2): the hero, the story, the two blocks,
// the gallery, the garages and parking places, and the inquiry, opened as a
// visitor opens it (tests/contracts/site.jsx), offline, so the counts come
// from the data built into the site. The explorer comes with Task 6.

const text = (element) => element.textContent.replace(/\s+/g, ' ').trim()
const section = (id) => document.getElementById(id)
// Where the browser, which follows the router here, says the page is.
const address = () => `${window.location.pathname}${window.location.search}${window.location.hash}`
// The routes contract's „блок А“ and „блок Б“ (tests/contracts/site.jsx).
const BLOCK_A = /блок\s+[аa](?![а-яёa-z])/i
const BLOCK_B = /блок\s+[бb](?![а-яёa-z])/i

beforeEach(() => {
  goOffline()
  renderSiteAt('/projects/golden-residence')
})

afterEach(() => {
  resetInquiry()
  setLenis(null)
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('the hero (spec §6.14)', () => {
  it('names the building in the one H1, its italic word „Residence“', async () => {
    const h1 = await screen.findByRole('heading', { level: 1 })
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(text(h1)).toBe('Golden Residence')
    expect(h1.querySelector('em')).toHaveTextContent(/^Residence$/)
    expect(section('top')).toContainElement(h1)
  })

  it('gives the address, the 192 apartments in 2 blocks, and the free ones once the data is in', async () => {
    const hero = section('top')
    expect(within(hero).getByText('ул. Ген. Климент Бояджиев, жк Левски Г, София')).toBeInTheDocument()
    const [all, free] = hero.querySelectorAll('.fact')
    expect(text(all)).toBe('192 апартамента в 2 блока')
    await waitFor(() => expect(text(free)).toMatch(/^\d+ свободни в момента$/))
  })

  // Task 6 sends „Изберете апартамент“ to the explorer (#explorer).
  it('leads to the blocks and to the inquiry', () => {
    const hero = within(section('top'))
    expect(hero.getByRole('link', { name: 'Изберете апартамент' })).toHaveAttribute('href', '#blokove')
    expect(hero.getByRole('link', { name: 'Запитване' })).toHaveAttribute('href', '#zapitvane')
  })
})

describe('the story (spec §6.15)', () => {
  it('tells it in four blocks, in order, one italic word or name in each heading', () => {
    const story = section('sgradata')
    expect(story).toHaveAccessibleName('Сградата')
    expect(within(story).getAllByRole('heading', { level: 2 }).map(text)).toEqual([
      'Модерен дом в жк Левски Г',
      'Бронзови рамки',
      'Продължение на дневната',
      'Озеленен двор',
    ])
    expect([...story.querySelectorAll('h2 em')].map(text)).toEqual(['Левски Г', 'рамки', 'дневната', 'двор'])
  })

  it('places the building: 500 м to the metro, and the address on Google Maps', () => {
    const story = within(section('sgradata'))
    expect(story.getByText('500 м')).toBeInTheDocument()
    expect(story.getByText('до метростанция')).toBeInTheDocument()
    expect(story.getByRole('link', { name: 'Отвори в Google Maps' }))
      .toHaveAttribute('href', mapsUrl('ул. Ген. Климент Бояджиев, жк Левски Г, София'))
  })

  it('gives the building’s figures, 2, 8, 192 and 12, from 43,98 to 114,58 m², and the index 01 / 04', () => {
    const story = section('sgradata')
    const figures = story.querySelector('dl.kv')
    expect([...figures.querySelectorAll('dt')].map(text)).toEqual(['2', '8', '192', '12'])
    expect(text(figures)).toContain('от 43,98 до 114,58 м²')
    expect(text(story.querySelector('.story__idx'))).toBe('01 / 04')
  })

  // Spec §5.3: a link to a section of the page glides there (glideToHash,
  // src/utils/scroll.js) and leaves the address as it was. jsdom lays
  // nothing out, so parking is placed by hand, 4321 px down the page, where
  // the glide must come to rest; the glide is followed to the Lenis it drives.
  it('glides to the garages from „113 гаража и 68 паркоместа“, with no new address', async () => {
    const lenis = { scrollTo: vi.fn(), dimensions: { resize() {} } }
    setLenis(lenis)
    vi.spyOn(section('garazhi'), 'getBoundingClientRect')
      .mockReturnValue({ top: 4321, bottom: 5000, left: 0, right: 0, width: 0, height: 679, x: 0, y: 4321 })
    const link = within(section('sgradata')).getByRole('link', { name: /^113\s+гаража и\s+68\s+паркоместа$/ })
    expect(link).toHaveAttribute('href', '#garazhi')

    expect(fireEvent.click(link)).toBe(false)
    expect(lenis.scrollTo).toHaveBeenCalledTimes(1)
    expect(lenis.scrollTo).toHaveBeenCalledWith(4321, expect.objectContaining({ duration: 1.5, easing: EXPO_IN_OUT }))
    expect(document.activeElement).toBe(section('garazhi'))
    // jsdom follows a fragment link a task after the click, as a browser does.
    await new Promise((resolve) => { setTimeout(resolve, 0) })
    expect(address()).toBe('/projects/golden-residence')
  })

  // Decision A1, spec §8.2: КСМ Строй takes the inquiries here.
  it('never names the agency, nor links to it', () => {
    expect(document.body.textContent).not.toMatch(/Диана/)
    expect(document.querySelectorAll('a[href*="dianahomes"]')).toHaveLength(0)
  })
})

describe('the blocks (spec §6.16)', () => {
  it('names both blocks, each with its facts and the way to its apartments', () => {
    expect(mainText()).toMatch(BLOCK_A)
    expect(mainText()).toMatch(BLOCK_B)
    const blocks = within(section('blokove'))
    expect(blocks.getAllByText('96 апартамента · 8 етажа · 12 на етаж')).toHaveLength(2)
    expect(within(section('blk-a')).getByRole('heading', { level: 3 })).toHaveTextContent(/^Блок\sА$/)
    expect(within(section('blk-b')).getByRole('heading', { level: 3 })).toHaveTextContent(/^Блок\sБ$/)
    expect(blocks.getByRole('link', { name: /^Изберете апартамент в\sблок\sА$/ })).toHaveAttribute('href', '/projects/golden-residence/block-a')
    expect(blocks.getByRole('link', { name: /^Изберете апартамент в\sблок\sБ$/ })).toHaveAttribute('href', '/projects/golden-residence/block-b')
  })

  it('counts each block’s free apartments once the data is in', async () => {
    await waitFor(() => expect(text(section('blk-a').querySelector('.blk__free'))).toMatch(/^\d+ свободни от 96$/))
    expect(text(section('blk-b').querySelector('.blk__free'))).toMatch(/^\d+ свободни от 96$/)
  })
})

describe('the gallery (spec §6.17)', () => {
  it('turns its spreads with the buttons and the arrow keys, the caption and the counter following', () => {
    const gallery = section('galeriya')
    const s = within(gallery)
    const counter = gallery.querySelector('.gal__n')
    const caption = gallery.querySelector('.gal__cap')
    expect(s.getByRole('group', { name: 'Визуализации' })).toHaveAttribute('aria-roledescription', 'галерия')
    expect(caption).toHaveAttribute('aria-live', 'polite')
    expect(text(counter)).toBe('01 / 03')
    expect(text(caption)).toBe('Изчистени линии и фасада с бронзови рамки около просторните остъклени тераси.')

    fireEvent.click(s.getByRole('button', { name: 'Следващи' }))
    expect(text(counter)).toBe('02 / 03')
    expect(text(caption)).toBe('Двата блока откъм двора и паркинга: по осем жилищни етажа, по 12 апартамента на етаж.')

    fireEvent.keyDown(s.getByRole('button', { name: 'Следващи' }), { key: 'ArrowLeft' })
    expect(text(counter)).toBe('01 / 03')
    // Round from the first to the last, and back.
    fireEvent.click(s.getByRole('button', { name: 'Предишни' }))
    expect(text(counter)).toBe('03 / 03')
    expect(text(caption)).toBe('Golden Residence през деня и по здрач.')
    fireEvent.keyDown(gallery.querySelector('.gal__stage'), { key: 'ArrowRight' })
    expect(text(counter)).toBe('01 / 03')
  })

  // Without motion (jsdom) a spread changes at once: one picture on show in
  // each half, the spread's own.
  it('shows the chosen spread in both halves, and only it', () => {
    const gallery = section('galeriya')
    const shown = () => [...gallery.querySelectorAll('.gal__img[data-shown]')].map((layer) => layer.dataset.spread)
    expect(shown()).toEqual(['0', '0'])
    fireEvent.click(within(gallery).getByRole('button', { name: 'Следващи' }))
    expect(shown()).toEqual(['1', '1'])
  })
})

describe('the garages and parking places (spec §6.18)', () => {
  it('counts the free places of each, from the live data, out of 113 and 68', async () => {
    const garages = section('park-g')
    const parking = section('park-p')
    expect(within(garages).getByRole('heading', { level: 3, name: 'Гаражи' })).toBeInTheDocument()
    expect(within(parking).getByRole('heading', { level: 3, name: 'Паркоместа' })).toBeInTheDocument()
    await waitFor(() => expect(text(garages.querySelector('.park__big'))).toMatch(/^\d+ свободни от 113$/))
    expect(text(parking.querySelector('.park__big'))).toMatch(/^\d+ свободни от 68$/)

    // The list of the free places holds as many as the count says.
    const free = Number(text(garages.querySelector('.park__big')).split(' ')[0])
    expect(text(garages.querySelector('summary'))).toBe(`Свободните гаражи (${free})`)
    expect(garages.querySelectorAll('.park__list li')).toHaveLength(free)
    expect(text(parking.querySelector('summary'))).toMatch(/^Свободните паркоместа \(\d+\)$/)
  })

  // The cells are a picture of the places, hidden from assistive technology:
  // the counts and the list carry the numbers.
  it('draws one cell a place, hidden from assistive technology', async () => {
    const garages = section('park-g')
    await waitFor(() => expect(garages.querySelectorAll('.park__cells [class^="s-"]')).toHaveLength(113))
    expect(garages.querySelector('.park__cells')).toHaveAttribute('aria-hidden', 'true')
    expect(section('park-p').querySelectorAll('.park__cells [class^="s-"]')).toHaveLength(68)
  })

  // Spec §6.18, §5.3: both actions choose the garage option, which glides
  // the page to the form; the browser's jump is taken.
  it.each(['Запитване за гараж', 'Запитване за паркомясто'])('„%s“ presets the garage option', (name) => {
    const link = within(section('garazhi')).getByRole('link', { name })
    expect(link).toHaveAttribute('href', '#zapitvane')
    expect(fireEvent.click(link)).toBe(false)
    expect(screen.getByLabelText('Интересувам се от')).toHaveValue('garage')
  })
})

describe('the inquiry (spec §6.12, decision A1)', () => {
  it('closes with the Golden Residence inquiry, which КСМ Строй takes, on the page’s four subjects', () => {
    const inquiry = section('kontakti')
    expect(inquiry).toHaveAccessibleName('Запитване за Golden Residence')
    expect(within(inquiry).getByText('Запитванията за Golden Residence приема КСМ Строй. Обадете се или изпратете запитване и ще се свържем с вас.'))
      .toBeInTheDocument()
    expect([...screen.getByLabelText('Интересувам се от').options].map(({ value }) => value))
      .toEqual(['golden-residence', 'garage', 'mnogofamilna', 'other'])
    expect(within(inquiry).getByRole('link', { name: 'ksm_str@abv.bg' })).toHaveAttribute('href', 'mailto:ksm_str@abv.bg')
  })
})

// Spec §8.2's order; the explorer (#explorer) comes after the story with
// Task 6.
it('runs the hero, the story, the blocks, the gallery, parking and the inquiry, in that order', () => {
  expect([...document.querySelectorAll('main section[id]')].map(({ id }) => id))
    .toEqual(['top', 'sgradata', 'blokove', 'galeriya', 'garazhi', 'kontakti'])
})

// The route module (spec §8.2): under the see-through header, a page of the
// project, with an inquiry of its own. Its preloads (the availability API and
// both display faces) go out with the prerendered document only (ruling
// C5.4, gr.prerender.test.jsx), so a render in the browser adds none.
it('is an overlay page of Golden Residence with an inquiry of its own, and adds no preload in the browser', () => {
  expect(grModule.handle).toEqual({ header: 'overlay', project: 'golden-residence', inquiry: true })
  expect('links' in grModule).toBe(false)
  expect(document.head.querySelectorAll('link[rel="preload"]')).toHaveLength(0)
})

it('keeps the head M1 gave the page', () => {
  const head = grModule.meta()
  expect(head).toContainEqual({ title: 'Golden Residence - KSM Stroy' })
  expect(head).toContainEqual({ tagName: 'link', rel: 'canonical', href: 'https://www.ksmstroy.com/projects/golden-residence' })
  expect(head).toContainEqual({
    name: 'description',
    content: 'Golden Residence в жк Левски Г, ул. Ген. Климент Бояджиев, гр. София: блок А и блок Б, по 96 апартамента на 8 етажа.',
  })
})
