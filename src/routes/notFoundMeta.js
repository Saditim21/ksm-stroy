import { robotsMeta } from '../seo/meta'

// The 404 page's head (not-found.jsx), which a block page's route that names
// no block of its project gives too (BlockRoute.jsx). A module of its own, so
// a block page's first-load JS holds this head alone, never the 404 page.
//
// Its head is noindex in every build, production included, with no canonical
// link and no og:url: /404 itself answers 200, and the same HTML answers every
// unknown URL, so there is no page here to index or to point at.
export const notFoundMeta = () => [
  { title: 'Страницата не е намерена - KSM Stroy' },
  robotsMeta(false),
  { name: 'description', content: 'Тази страница я няма в чертежа.' },
]
