// The site's pages, in the order the header, the mobile menu and the footer
// list them (spec §7, §8.1).
export const NAV = Object.freeze([
  Object.freeze({ label: 'Начало', href: '/' }),
  Object.freeze({ label: 'Продажби', href: '/projects' }),
  Object.freeze({ label: 'Обекти', href: '/blog' }),
  Object.freeze({ label: 'За нас', href: '/about' }),
  Object.freeze({ label: 'Контакти', href: '/contact' }),
])

// aria-current for a link to `href` at `pathname`, which must be normalised
// (src/utils/pathname.js): the prerender renders /about as /about/ and the
// browser hydrates it at /about, and both must mark the same link. 'page' on
// the page itself, 'true' on a page below it (Продажби on a project page),
// none elsewhere.
export function currentFor(href, pathname) {
  if (pathname === href) return 'page'
  if (href !== '/' && pathname.startsWith(`${href}/`)) return 'true'
  return undefined
}
