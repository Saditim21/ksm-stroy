import { SITE } from '../config/site'

// The live site's origin: canonical links and Open Graph URLs point here.
// (Production's head pointed at ksmstroy.bg, which does not resolve.)
export const SITE_URL = SITE.origin

// Replaced at build time (vite.config.js, src/seo/stage.js).
/* global IS_PRODUCTION_BUILD */

// The robots tag of every page: only the production site is indexed.
export function robotsMeta(production = IS_PRODUCTION_BUILD) {
  return { name: 'robots', content: production ? 'index, follow' : 'noindex, nofollow' }
}

// The share image of a page that names none of its own (v2 spec §6.7): 1200 ×
// 630, cut once from the Golden Residence dusk render (scripts/images/
// sources.json, gr-dusk) as the hero frames it, 50 % across and 62 % down.
// Each page with a photo of its own shares that instead, its image entry's
// `og` (spec M3/M4 §11); /eu-proekt, whose picture stays on Home, keeps this
// one (ruling M4-PF6), and the 404 shares none (src/routes/notFoundMeta.js).
const DEFAULT_IMAGE = '/og/ksm-stroy-1200x630.jpg'

// The head of one page, for its route module's `meta` export. root.jsx renders
// it with <Meta/> into the prerendered HTML and swaps it on every client
// navigation. React Router renders only the deepest route's `meta`, never
// merged with the root's, so this returns the whole set.
//
// The title is used as given: each page's title already names the brand
// (production's SEO component appended "| KSM Stroy" a second time).
// `path` is the page's own path, `image` a root-relative URL.
export function pageMeta({ title, description, path, image = DEFAULT_IMAGE }) {
  const url = SITE_URL + path
  return [
    { title },
    robotsMeta(),
    { name: 'description', content: description },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:url', content: url },
    { property: 'og:image', content: SITE_URL + image },
    { name: 'twitter:card', content: 'summary_large_image' },
    { tagName: 'link', rel: 'canonical', href: url },
  ]
}
