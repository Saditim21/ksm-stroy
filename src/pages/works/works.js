import homeImages from '../../data/images/home.json?works'
import worksImages from '../../data/images/works.json'

// The seven works of Обекти (spec M3/M4 §5.5, §7.2), production's
// (src/pages/Blog.jsx on main, its `projects`), in its order:
// - id: the work's own, its row's id and its photos' (`work-<id>-<n>`);
// - name, place and type: production's, the name typeset as Home has it
//   (src/pages/home/WorksSection.jsx: a spaced en dash, „…“ quotes), the
//   type in lower case, as the record's line sets it after the place;
// - year: Green Life's 2018 alone, as Home shows it. Production gives a year
//   for every work (2018, 2019, 2017, 2019, 2018 and 2024 for the others),
//   which the client has yet to confirm (spec §2; Diptych §14.7), so they
//   are not shown;
// - status: 'finished' (production's „Завършен Проект“) or 'rough' („Груб
//   Строеж“);
// - description: production's, ended with a full stop, with a no-break
//   space after each one-letter word (spec §4.5);
// - features: production's „Особености“;
// - photos: every photo production shows, by its image id, in the order of
//   the work's `images` (scripts/images/sources.json, group `works`). Six
//   are Home's covers already (home.json's `work-<id>`), which no source
//   encodes twice (spec §4.3, ruling M4-PF5).
//
// photoOf(id) is a photo's entry in the image manifests: { path, w, h,
// widths, color } (src/components/ui/ResponsivePicture.jsx), and lineOf(work)
// the work's line, below. Home's manifest comes in under a query of its own
// (home.json?works), as Контакти's does (src/pages/contact/ContactInquiry.jsx):
// the build gives this page its own copy rather than a chunk shared with
// Home's first load. Both manifests ride Обекти's own first load (ruling
// M4-PF5); of the photos, the page asks only for its plates', the book for
// the rest.

// A work's photos: `work-<id>-<n>`, the n-th, but where Home's cover is.
const photos = (id, count, home) =>
  Array.from({ length: count }, (_, i) => (i + 1 === home ? `work-${id}` : `work-${id}-${i + 1}`))

export const WORKS = [
  {
    id: 'green-life',
    name: 'Green Life – Paradise Gardens and Town House',
    place: 'гр. Созопол',
    type: 'жилищен комплекс',
    year: '2018',
    status: 'finished',
    description: 'Луксозен жилищен комплекс с\u00a0градини и\u00a0таунхауси в\u00a0сърцето на Созопол.',
    features: ['Градини', 'Таунхауси', 'Паркинг', 'Детска площадка'],
    photos: photos('green-life', 6, 4),
  },
  {
    id: 'aivazovski',
    name: 'Айвазовски Парк',
    place: 'гр. Поморие',
    type: 'жилищен комплекс',
    year: null,
    status: 'finished',
    description: 'Модерен жилищен комплекс в\u00a0престижен район на Поморие.',
    features: ['Морска панорама', 'Балкони', 'Асансьор', 'Охрана'],
    photos: photos('aivazovski', 7, 7),
  },
  {
    id: 'panorama',
    name: 'Панорама Резидънс',
    place: 'гр. Созопол',
    type: 'жилищен комплекс',
    year: null,
    status: 'rough',
    description: 'Панорамен комплекс с\u00a0изглед към морето в\u00a0Созопол.',
    features: ['Морски изглед', 'Тераси', 'Басейн', 'Фитнес'],
    photos: photos('panorama', 23, 17),
  },
  {
    id: 'sanirane',
    name: 'Саниране 2017',
    place: 'гр. Бургас',
    type: 'санитарно обновяване',
    year: null,
    status: 'finished',
    description: 'Санитарно обновяване на жилищна сграда в\u00a0Бургас.',
    features: ['Топлоизолация', 'Нова фасада', 'Енергийна ефективност', 'Модернизация'],
    photos: photos('sanirane', 11, 0),
  },
  {
    id: 'sunny-hill',
    name: 'Сънни Хил блок 9',
    place: 'кв. Меден Рудник, гр. Бургас',
    type: 'жилищна сграда',
    year: null,
    status: 'finished',
    description: 'Жилищна сграда в\u00a0престижния район Меден Рудник.',
    features: ['Луксозни апартаменти', 'Паркинг', 'Зелени площи', 'Сигурност'],
    photos: photos('sunny-hill', 26, 24),
  },
  {
    id: 'hotel-paradise',
    name: 'Хотел Парадайс',
    place: 'с. Огняново',
    type: 'хотелски комплекс',
    year: null,
    status: 'finished',
    description: 'Хотелски комплекс с\u00a0минерални басейни в\u00a0Огняново.',
    features: ['Минерални басейни', 'СПА център', 'Ресторант', 'Конферентна зала'],
    photos: photos('hotel-paradise', 8, 1),
  },
  {
    id: 'chitalishte',
    name: 'Читалище „Асен Златаров-1924“',
    place: 'с. Огняново, община Гърмен',
    type: 'обществена сграда',
    year: null,
    status: 'finished',
    description:
      'Инженеринг: проектиране, изпълнение на мерки за енергийна ефективност и\u00a0последващо упражняване на авторски надзор по време на строителството.',
    features: ['Енергийна ефективност', 'Топлоизолация', 'Модернизация', 'Авторски надзор'],
    photos: photos('chitalishte', 12, 1),
  },
]

export const photoOf = (id) => worksImages[id] ?? homeImages[id]

// A work's line under its name, in the register and the book: its place,
// its type and, for Green Life, its year, „гр. Созопол · жилищен комплекс ·
// 2018“.
export const lineOf = ({ place, type, year }) => [place, type, year].filter(Boolean).join(' · ')
