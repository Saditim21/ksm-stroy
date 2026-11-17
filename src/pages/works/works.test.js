import { describe, expect, it } from 'vitest'
import sources from '../../../scripts/images/sources.json'
import homeImages from '../../data/images/home.json'
import worksImages from '../../data/images/works.json'
import { photoOf, WORKS } from './works'

// The works of Обекти (spec M3/M4 §5.5, §2; ruling M4-PF5): production's
// seven, in its order, with every photo production shows in its order, each
// by its image id, all in the pipeline's manifests: the `works` group's, or
// Home's for the six covers it already encodes.

const COUNTS = {
  'green-life': 6,
  aivazovski: 7,
  panorama: 23,
  sanirane: 11,
  'sunny-hill': 26,
  'hotel-paradise': 8,
  chitalishte: 12,
}
// The photo of each work that Home shows as its cover (home.json), by its
// place among the work's photos.
const HOME_COVERS = {
  'green-life': 4,
  aivazovski: 7,
  panorama: 17,
  'sunny-hill': 24,
  'hotel-paradise': 1,
  chitalishte: 1,
}

it('holds production’s seven works, in its order', () => {
  expect(WORKS.map(({ name }) => name)).toEqual([
    'Green Life – Paradise Gardens and Town House',
    'Айвазовски Парк',
    'Панорама Резидънс',
    'Саниране 2017',
    'Сънни Хил блок 9',
    'Хотел Парадайс',
    'Читалище „Асен Златаров-1924“',
  ])
  expect(WORKS.map(({ id }) => id)).toEqual(Object.keys(COUNTS))
  for (const work of WORKS) {
    expect(Object.keys(work).sort(), work.id).toEqual(['description', 'features', 'id', 'name', 'photos', 'place', 'status', 'type', 'year'])
  }
})

it('places and types each work as production does, the type in lower case', () => {
  expect(WORKS.map(({ place, type }) => `${place} · ${type}`)).toEqual([
    'гр. Созопол · жилищен комплекс',
    'гр. Поморие · жилищен комплекс',
    'гр. Созопол · жилищен комплекс',
    'гр. Бургас · санитарно обновяване',
    'кв. Меден Рудник, гр. Бургас · жилищна сграда',
    'с. Огняново · хотелски комплекс',
    'с. Огняново, община Гърмен · обществена сграда',
  ])
})

// Spec §2 and §5.5: only Green Life's 2018 shows, as on Home.
it('shows a year for Green Life alone: 2018', () => {
  expect(WORKS.filter(({ year }) => year).map(({ id, year }) => [id, year])).toEqual([['green-life', '2018']])
})

it('marks Панорама Резидънс alone as still in rough construction', () => {
  expect(WORKS.map(({ status }) => status)).toEqual(['finished', 'finished', 'rough', 'finished', 'finished', 'finished', 'finished'])
})

// Production's descriptions, each a sentence, a no-break space after every
// one-letter word (spec §4.5), and its four features.
it('describes each work in production’s words, one-letter words bound', () => {
  expect(WORKS[0].description).toBe('Луксозен жилищен комплекс с\u00a0градини и\u00a0таунхауси в\u00a0сърцето на Созопол.')
  expect(WORKS[6].description).toBe(
    'Инженеринг: проектиране, изпълнение на мерки за енергийна ефективност и\u00a0последващо упражняване на авторски надзор по време на строителството.',
  )
  for (const { id, description, features } of WORKS) {
    expect(description, id).toMatch(/\.$/)
    expect(description, id).not.toMatch(/(^|\s)\p{L} /u)
    expect(features, id).toHaveLength(4)
  }
  expect(WORKS[2].features).toEqual(['Морски изглед', 'Тераси', 'Басейн', 'Фитнес'])
})

describe('the photos', () => {
  it('are production’s 93, each work’s own count', () => {
    expect(Object.fromEntries(WORKS.map(({ id, photos }) => [id, photos.length]))).toEqual(COUNTS)
    const all = WORKS.flatMap(({ photos }) => photos)
    expect(all).toHaveLength(93)
    expect(new Set(all).size).toBe(93)
  })

  // Each photo by its place in the work's `images`: Home's cover where it
  // stands, every other one `work-<id>-<n>`.
  it('name each photo by its work and its place, Home’s covers where they stand', () => {
    for (const { id, photos } of WORKS) {
      photos.forEach((photo, i) => {
        expect(photo, `${id} ${i + 1}`).toBe(HOME_COVERS[id] === i + 1 ? `work-${id}` : `work-${id}-${i + 1}`)
      })
    }
  })

  // Ruling M4-PF5: in the works manifest, or Home's for the six it shares.
  it('are every one in the image manifests', () => {
    for (const photo of WORKS.flatMap(({ photos }) => photos)) {
      expect(photo in worksImages || photo in homeImages, photo).toBe(true)
      expect(photoOf(photo), photo).toEqual(worksImages[photo] ?? homeImages[photo])
    }
    const shared = WORKS.flatMap(({ photos }) => photos).filter((photo) => photo in homeImages)
    expect(shared).toEqual(['work-green-life', 'work-aivazovski', 'work-panorama', 'work-sunny-hill', 'work-hotel-paradise', 'work-chitalishte'])
    expect(Object.keys(worksImages)).toHaveLength(87)
  })

  // The pipeline's `works` group: one entry a photo, none wider than its
  // source, and no source photo encoded twice (spec §4.3): a photo's .jpg
  // twin is the same photo.
  it('come from the pipeline, each source once, no rung wider than it', () => {
    const works = sources.filter(({ group }) => group === 'works')
    expect(works.map(({ id }) => id).sort()).toEqual(Object.keys(worksImages).sort())
    const photo = (src) => src.replace(/\.(webp|jpe?g)$/i, '').toLowerCase()
    const all = sources.map(({ src }) => photo(src))
    expect(new Set(all).size).toBe(all.length)
    for (const [id, { w, widths }] of Object.entries(worksImages)) {
      expect(Math.max(...widths), id).toBeLessThanOrEqual(w)
      expect(widths[0], id).toBe(240)
    }
  })
})
