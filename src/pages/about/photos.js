import aboutImages from '../../data/images/about.json'
import homeImages from '../../data/images/home.json?about'
import wallImages from '../../data/images/wall.json'
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
//
// The tiles are darkened and small, so each is a small file of its own (the
// group "wall" in scripts/images/sources.json, up to 480 px): the page's first
// load stays light (M4: an LCP of 2.5 s or less on a phone). The centre, which
// the zoom fills the screen with, keeps the photograph's own ladder.
const tile = (id) => wallImages[`wall-${id}`]
export const WALL_CENTRE = 17
export const WALL = [
  tile('work-green-life'), tile('work-aivazovski-1'), tile('gr-terrace'), tile('work-hotel-paradise-2'), tile('work-chitalishte-3'), tile('work-sunny-hill-26'), tile('mn-front'),
  tile('work-green-life-1'), tile('gr-balconies'), tile('work-sanirane-1'), tile('work-panorama-21'), tile('work-aivazovski'), tile('gr-entrance'), tile('work-hotel-paradise-3'),
  tile('work-chitalishte'), tile('work-green-life-3'), tile('gr-garden'), aboutImages['about-slider-2'], tile('work-sunny-hill'), tile('work-hotel-paradise-7'), tile('mn-persp'),
  tile('svc-residential'), tile('work-aivazovski-5'), tile('work-hotel-paradise'), tile('gr-cornerView'), tile('work-green-life-5'), tile('work-sanirane-3'), tile('about-slider-1'),
  tile('work-panorama'), tile('gr-end-towers'), tile('work-chitalishte-11'), tile('work-green-life-6'), tile('gr-long-facade'), tile('work-aivazovski-6'), tile('about-slider-3'),
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
