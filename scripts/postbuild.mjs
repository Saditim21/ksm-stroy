#!/usr/bin/env node
// Runs after `react-router build` (package.json "build") on build/client/.
//
// The 404 page. vercel.json has no SPA fallback, so the host answers any URL
// that has no file of its own with build/client/404.html and a 404 status.
// React Router prerenders the page of the `*` route (src/routes/not-found.jsx)
// at /404, to build/client/404/index.html; this copies it into place. A build
// without that page fails here, rather than ship with the host's own 404.

import { copyFileSync, existsSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import config from '../react-router.config.js'
import { isProductionStage } from '../src/seo/stage.js'
import { SITE } from '../src/config/site.js'

export function writeNotFoundPage(outDir) {
  const page = join(outDir, '404', 'index.html')
  if (!existsSync(page)) {
    throw new Error(`postbuild: ${page} is missing; react-router.config.js must prerender /404`)
  }
  copyFileSync(page, join(outDir, '404.html'))
}

// robots.txt and sitemap.xml. Only the production site is indexed: it lists
// every prerendered page except /404. Any other build disallows everything
// and has no sitemap.
export function writeSeoFiles({ outDir, production, paths = config.prerender }) {
  if (!production) {
    writeFileSync(join(outDir, 'robots.txt'), 'User-agent: *\nDisallow: /\n')
    return
  }
  writeFileSync(join(outDir, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${SITE.origin}/sitemap.xml\n`)
  const urls = paths
    .filter((p) => p !== '/404')
    .map((p) => `  <url><loc>${SITE.origin}${p === '/' ? '' : p}</loc></url>`)
  const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
  writeFileSync(join(outDir, 'sitemap.xml'), `${xml}${urls.join('\n')}\n</urlset>\n`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const outDir = fileURLToPath(new URL('../build/client', import.meta.url))
  writeNotFoundPage(outDir)
  console.log('postbuild: build/client/404.html written from the prerendered /404')
  const production = isProductionStage(process.env)
  writeSeoFiles({ outDir, production })
  console.log(`postbuild: robots.txt${production ? ' and sitemap.xml' : ' (Disallow: /, not production)'} written`)
}
