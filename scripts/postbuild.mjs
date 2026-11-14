#!/usr/bin/env node
// Runs after `react-router build` (package.json "build") on build/client/.
//
// The 404 page. vercel.json has no SPA fallback, so the host answers any URL
// that has no file of its own with build/client/404.html and a 404 status.
// React Router prerenders the page of the `*` route (src/routes/not-found.jsx)
// at /404, to build/client/404/index.html; this copies it into place. A build
// without that page fails here, rather than ship with the host's own 404.

import { copyFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

export function writeNotFoundPage(outDir) {
  const page = join(outDir, '404', 'index.html')
  if (!existsSync(page)) {
    throw new Error(`postbuild: ${page} is missing; react-router.config.js must prerender /404`)
  }
  copyFileSync(page, join(outDir, '404.html'))
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const outDir = fileURLToPath(new URL('../build/client', import.meta.url))
  writeNotFoundPage(outDir)
  console.log('postbuild: build/client/404.html written from the prerendered /404')
}
