// A pathname without its trailing slash, except the root itself.
//
// The prerender requests every page with a trailing slash (/about/) while the
// browser hydrates it at /about, so anything rendered from a raw comparison,
// such as the active link in the navbar, would differ between the HTML and the
// first client render: hydration error #418 (React Router spike, gotcha 4).
// Compare pathnames only through this.
export function normalizePathname(pathname) {
  return pathname.replace(/(.)\/+$/, '$1')
}
