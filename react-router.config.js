// React Router framework mode with static output: there is no runtime server.
// With ssr:false, every path listed in `prerender` is rendered at build time to
// build/client/<path>/index.html. The host serves no SPA fallback
// (vercel.json): any other path gets build/client/404.html, which
// scripts/postbuild.mjs copies from the prerendered /404.
//
// Each block's page comes from src/config/blocks.js, as its route in
// src/routes.js does, so every block route is prerendered and no other.

import { blockPaths } from './src/config/blocks.js'

const blockPages = (project) => blockPaths(project).map((path) => `/${path}`)

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
    ...blockPages('golden-residence'),
    '/projects/mnogofamilna-sgrada',
    ...blockPages('mnogofamilna-sgrada'),
    '/eu-proekt',
    // The page of the `*` route (src/routes/not-found.jsx), for the host to
    // serve on unknown URLs.
    '/404',
  ],
}
