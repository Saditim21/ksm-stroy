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

// Production's fallback share image (src/components/common/SEO.jsx on main).
const DEFAULT_IMAGE = '/assets/images/slider01.jpg'

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
