import { index, route } from '@react-router/dev/routes'
import { blockPaths } from './config/blocks.js'

// Every URL the site serves, by the file that renders it (paths relative to
// src/). Each file is a route module: its default export is the page, and its
// `meta` fills the head (root.jsx <Meta/>). react-router.config.js lists the
// concrete paths that are prerendered.
//
// The browser's router must match a URL to the page the host answers it
// with, or React keeps the prerendered page as a dead copy and renders the
// live one beside it. The host serves a prerendered file only at its exact
// path, case included, and the 404 page for anything else (vercel.json). So:
// - every route is case-sensitive: /About is the 404 page, as the host
//   serves it, never /about's page;
// - a block page has one route per block in src/config/blocks.js, the blocks
//   react-router.config.js prerenders, never a `:block` param, which would
//   match /projects/golden-residence/block-c too.
const page = (path, file, options) => route(path, file, { ...options, caseSensitive: true })

// One file renders every block of a project, so each route has an id of its own.
const blockPages = (project, file) => blockPaths(project).map((path) => page(path, file, { id: path }))

export default [
  index('pages/Home.jsx'),
  page('about', 'pages/About.jsx'),
  page('projects', 'pages/Projects.jsx'),
  page('projects/golden-residence', 'components/GoldenResidenceBlockSelection.jsx'),
  ...blockPages('golden-residence', 'routes/golden-residence-block.jsx'),
  page('projects/mnogofamilna-sgrada', 'components/MnogofamilnaBlockSelection.jsx'),
  ...blockPages('mnogofamilna-sgrada', 'routes/mnogofamilna-block.jsx'),
  // /projects/1 to /projects/12 were placeholder projects that never existed.
  // Their old URLs land on /projects. Static segments outrank params, so the
  // two real projects above still win.
  page('projects/:id', 'routes/projects-id-redirect.jsx'),
  page('contact', 'pages/Contact.jsx'),
  page('blog', 'pages/Blog.jsx'),
  // The page about the EU project, which the EU line on every page links to.
  page('eu-proekt', 'routes/eu-proekt.jsx'),
  // Under the dev server only: the polygon tracer for the explorer maps
  // (src/data/maps) and the gallery of the shared primitives
  // (src/components/ui). A production build has neither route;
  // scripts/check-dist.mjs fails if any of them reaches the build.
  ...(import.meta.env.DEV
    ? [page('dev/tracer', 'pages/dev/TracerPage.jsx'), page('dev/ui', 'pages/dev/UiGallery.jsx')]
    : []),
  page('*', 'routes/not-found.jsx'),
]
