// The two building renders, served from /public so <img srcSet> can name their
// responsive variants by URL. Regenerate the variants with:
//
//   node scripts/generate-srcset.mjs
//
// Both masters are 1200px wide, so only 640w and 1024w variants exist — a 1600w
// candidate off a 1200w master would never be picked (browsers do not upscale).
const base = import.meta.env.BASE_URL || '/'

const render = (dir, name, masterWidth, variants) => {
  const url = (suffix = '') => `${base}images/${dir}/${name}${suffix}.webp`
  return {
    src: url(),
    srcSet: [...variants.map((w) => `${url(`-${w}`)} ${w}w`), `${url()} ${masterWidth}w`].join(', '),
  }
}

// 1200x599 — also the coordinate space of golden-residence.building.json.
export const GOLDEN_RENDER = render('golden-residence', 'building-2', 1200, [640, 1024])

// 1200x848 — byte-identical copy of the file mnogofamilna.building.json was
// traced against, so the explorer may point at it without shifting a polygon.
export const MNOGO_RENDER = render('mnogofamilna', 'sgrada1', 1200, [640, 1024])

// Home's hero slides 1-2 (Task 3 CineSlider), reused by Home's services grid.
// The masters stay in src/assets/home/optimized as the generator's input (see
// scripts/generate-srcset.mjs) but nothing imports them any more, so they are
// no longer bundled: every consumer goes through this /public 640/1024/1600
// ladder instead of shipping the full desktop frame to a phone.
export const HOME_SLIDE_1 = render('home', 'photo-4', 2006, [640, 1024, 1600])
export const HOME_SLIDE_2 = render('home', '001', 2452, [640, 1024, 1600])

export const HERO_SIZES = '100vw'
// Home's two-up cards: full width until the lg grid splits them in half.
export const CARD_SIZES = '(max-width: 768px) 100vw, 50vw'
// Продажби panels: full width until the lg 5-col grid gives the image 3 columns.
export const PANEL_SIZES = '(max-width: 1024px) 100vw, 60vw'
// Home's services grid: full width until the md 3-col grid thirds them.
export const SERVICE_SIZES = '(max-width: 768px) 100vw, 33vw'
