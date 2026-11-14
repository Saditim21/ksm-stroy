// React Router framework mode with static output: there is no runtime server.
// With ssr:false, every path listed in `prerender` is rendered at build time to
// build/client/<path>/index.html; any other path gets
// build/client/__spa-fallback.html and renders in the browser.

/** @type {import('@react-router/dev/config').Config} */
export default {
  appDirectory: 'src',
  ssr: false,
  prerender: [
    '/',
    '/about',
    '/projects',
    '/contact',
    '/blog',
    '/projects/golden-residence',
    '/projects/golden-residence/block-a',
    '/projects/golden-residence/block-b',
    '/projects/mnogofamilna-sgrada',
    '/projects/mnogofamilna-sgrada/block-a',
    '/projects/mnogofamilna-sgrada/block-b',
    // The page of the `*` route (src/routes/not-found.jsx), for the host to
    // serve on unknown URLs.
    '/404',
  ],
}
