import aboutImages from '../../data/images/about.json'
import grImages from '../../data/images/golden-residence.json?about'
import homeImages from '../../data/images/home.json?about'
import mnImages from '../../data/images/mnogofamilna.json?about'
import worksImages from '../../data/images/works.json?about'

// За нас's photographs (polish spec §4), the company's own, each through the
// image pipeline once (scripts/images/sources.json). The other pages'
// manifests come in under a query of their own (`?about`), as Обекти's own
// import of Home's does (src/pages/works/works.js): the build gives this page
// its own copy rather than a chunk shared with their first loads.

const work = (id) => worksImages[id] ?? homeImages[id]

// The wall (Wall.jsx): 35 photographs, 7 × 5 (5 × 7 on a phone), finished
// works, works being built, and the two buildings for sale, mixed so no two
// of a work stand side by side. The eighteenth, the centre, is the one the
// wall zooms into: Хотел Парадайс from the air, the sharpest photograph the
// company has (2000 px), which then fills the screen.
export const WALL_CENTRE = 17
export const WALL = [
  work('work-green-life'), work('work-aivazovski-1'), grImages['gr-terrace'], work('work-hotel-paradise-2'), work('work-chitalishte-3'), work('work-sunny-hill-26'), mnImages['mn-front'],
  work('work-green-life-1'), grImages['gr-balconies'], work('work-sanirane-1'), work('work-panorama-21'), work('work-aivazovski'), grImages['gr-entrance'], work('work-hotel-paradise-3'),
  work('work-chitalishte'), work('work-green-life-3'), grImages['gr-garden'], aboutImages['about-slider-2'], work('work-sunny-hill'), work('work-hotel-paradise-7'), mnImages['mn-persp'],
  homeImages['svc-residential'], work('work-aivazovski-5'), work('work-hotel-paradise'), grImages['gr-cornerView'], work('work-green-life-5'), work('work-sanirane-3'), aboutImages['about-slider-1'],
  work('work-panorama'), grImages['gr-end-towers'], work('work-chitalishte-11'), work('work-green-life-6'), grImages['gr-long-facade'], work('work-aivazovski-6'), aboutImages['about-slider-3'],
]

// How it began (Origin.jsx): from a dig to a finished building.
export const STORY = [
  { image: work('work-panorama-21'), alt: 'Изкоп и кофраж на Панорама Резидънс, Созопол', caption: 'Изкопът' },
  { image: work('work-sunny-hill-17'), alt: 'Сънни Хил, блок 9, в скеле', caption: 'Грубият строеж' },
  { image: work('work-sunny-hill'), alt: 'Завършеният Сънни Хил, блок 9, Бургас', caption: 'Готовата сграда' },
]

// The works (WorksTrack.jsx): Обекти's seven, in its order, by its ids
// (src/pages/works/works.js), each with three photographs, the first in
// front; the names, places and types as Обекти and Home set them.
export const WORKS = [
  { id: 'green-life', name: 'Green Life – Paradise Gardens and Town House', meta: 'гр. Созопол, жилищен комплекс, 2018', photos: ['work-green-life', 'work-green-life-2', 'work-green-life-5'] },
  { id: 'aivazovski', name: 'Айвазовски Парк', meta: 'гр. Поморие, жилищен комплекс', photos: ['work-aivazovski', 'work-aivazovski-5', 'work-aivazovski-1'] },
  { id: 'panorama', name: 'Панорама Резидънс', meta: 'гр. Созопол, жилищен комплекс', rough: true, photos: ['work-panorama', 'work-panorama-21', 'work-panorama-18'] },
  { id: 'sanirane', name: 'Саниране 2017', meta: 'гр. Бургас, санитарно обновяване', photos: ['work-sanirane-1', 'work-sanirane-3', 'work-sanirane-7'] },
  { id: 'sunny-hill', name: 'Сънни Хил блок 9', meta: 'кв. Меден Рудник, гр. Бургас, жилищна сграда', photos: ['work-sunny-hill', 'work-sunny-hill-26', 'work-sunny-hill-22'] },
  { id: 'hotel-paradise', name: 'Хотел Парадайс', meta: 'с. Огняново, хотелски комплекс', photos: ['work-hotel-paradise', 'work-hotel-paradise-7', 'work-hotel-paradise-3'] },
  { id: 'chitalishte', name: 'Читалище „Асен Златаров-1924“', meta: 'с. Огняново, община Гърмен, обществена сграда', photos: ['work-chitalishte', 'work-chitalishte-11', 'work-chitalishte-3'] },
].map((each) => ({ ...each, photos: each.photos.map(work) }))

export const PHOTOS = {
  // The wall's centre, full size: the zoom's last frame and the page's share
  // image (spec M3/M4 §11; about-slider-2's og).
  aerial: aboutImages['about-slider-2'],
  // The call to action (Work.jsx, slider01).
  finished: aboutImages['about-slider-1'],
}
