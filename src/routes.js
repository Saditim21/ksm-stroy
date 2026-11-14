import { index, route } from '@react-router/dev/routes'

// Every URL the site serves, by the file that renders it (paths relative to
// src/). Each file is a route module: its default export is the page, and its
// `meta` fills the head (root.jsx <Meta/>). react-router.config.js lists the
// concrete paths that are prerendered.
export default [
  index('pages/Home.jsx'),
  route('about', 'pages/About.jsx'),
  route('projects', 'pages/Projects.jsx'),
  route('projects/golden-residence', 'components/GoldenResidenceBlockSelection.jsx'),
  route('projects/golden-residence/:block', 'components/GoldenResidenceSingleBlock.jsx'),
  route('projects/mnogofamilna-sgrada', 'components/MnogofamilnaBlockSelection.jsx'),
  route('projects/mnogofamilna-sgrada/:block', 'components/MnogofamilnaSingleBlock.jsx'),
  // /projects/1 to /projects/12 were placeholder projects that never existed.
  // Their old URLs land on /projects. Static segments outrank params, so the
  // two real projects above still win.
  route('projects/:id', 'routes/projects-id-redirect.jsx'),
  route('contact', 'pages/Contact.jsx'),
  route('blog', 'pages/Blog.jsx'),
  // The polygon tracer for the explorer maps (src/data/maps), under the dev
  // server only. A production build has no such route; scripts/check-dist.mjs
  // fails if any of it reaches the build.
  ...(import.meta.env.DEV ? [route('dev/tracer', 'pages/dev/TracerPage.jsx')] : []),
  route('*', 'routes/not-found.jsx'),
]
