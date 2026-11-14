import { reactRouter } from '@react-router/dev/vite'
import { defineConfig, loadEnv } from 'vite'
import { clientRoutesCaseSensitive } from './scripts/client-routes-case.mjs'
import { isProductionStage } from './src/seo/stage.js'

// The React Router plugin builds the site from src/routes.js and
// react-router.config.js, and brings its own JSX transform and React Refresh
// in place of @vitejs/plugin-react. Tailwind runs through postcss.config.js,
// which Vite picks up on its own.
//
// Vitest loads this file too. The React Router plugin must not run there (the
// tests fail with "React Router Vite plugin can't detect preamble"), so tests
// get plain Vite with the automatic JSX runtime instead. Nor does devApi().
const isVitest = process.env.VITEST === 'true'

// The Vercel Functions in api/.
const API_FUNCTIONS = ['/api/availability', '/api/odoo-lead']

// Dev server only: answers the Vercel Functions in api/ as Vercel does, so
// `react-router dev` has the same-origin API a deploy has, except that an
// inquiry reaches Odoo only when ODOO_URL is set (answerInquiryInDev). Every
// request loads the function through Vite, so an edit applies on the next
// request, and calls its Web Handler, handler.fetch(request). Exported for
// tests/contracts/dev-api.test.js.
export function devApi() {
  return {
    name: 'ksm-dev-api',
    apply: 'serve',
    configureServer(server) {
      // On Vercel a function reads its settings from process.env, while Vite
      // gives .env to import.meta.env only. Copy in what the shell has not set.
      const env = loadEnv(server.config.mode, server.config.envDir || server.config.root, '')
      for (const [name, value] of Object.entries(env)) process.env[name] ??= value

      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.originalUrl ?? req.url, `http://${req.headers.host ?? 'localhost'}`)
        if (!API_FUNCTIONS.includes(url.pathname)) return next()
        try {
          if (url.pathname === '/api/odoo-lead' && req.method === 'POST' && !process.env.ODOO_URL?.trim()) {
            await answerInquiryInDev(req, res, server.config.logger)
            return
          }
          const { default: handler } = await server.ssrLoadModule(`${url.pathname}.js`)
          const response = await handler.fetch(await toFetchRequest(req, url))
          res.statusCode = response.status
          response.headers.forEach((value, name) => res.setHeader(name, value))
          res.end(Buffer.from(await response.arrayBuffer()))
        } catch (error) {
          next(error)
        }
      })
    },
  }
}

// api/odoo-lead.js turns a valid inquiry into a lead in Odoo, and without
// ODOO_URL it posts to the client's production CRM, whose public form
// endpoint needs no credentials. So the dev server passes an inquiry on only
// when ODOO_URL is set, in the shell or in .env. Otherwise it answers as the
// function does on success and logs what came in. Every other method still
// reaches the function: GET is its health check, which creates nothing, and
// PUT gets its 405.
async function answerInquiryInDev(req, res, logger) {
  const body = (await readBody(req)).toString('utf8')
  logger.info(
    `[dev-api] POST /api/odoo-lead answered by the dev server; nothing was sent to Odoo (set ODOO_URL to send it): ${body.slice(0, 2000)}`,
    { timestamp: true },
  )
  res.statusCode = 200
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.end(JSON.stringify({ ok: true, dev: true }))
}

async function readBody(req) {
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  return Buffer.concat(chunks)
}

// A Node request as the Fetch API Request a Vercel Function receives.
async function toFetchRequest(req, url) {
  const headers = new Headers()
  for (const [name, value] of Object.entries(req.headers)) {
    if (value === undefined || name.startsWith(':')) continue
    for (const item of [value].flat()) headers.append(name, item)
  }
  const body = req.method !== 'GET' && req.method !== 'HEAD' ? await readBody(req) : null
  return new Request(url, {
    method: req.method,
    headers,
    body: body?.length > 0 ? body : undefined,
  })
}

export default defineConfig({
  // clientRoutesCaseSensitive(): the browser's routes keep src/routes.js's
  // caseSensitive, which React Router 8.5.1 drops (scripts/client-routes-case.mjs).
  plugins: [!isVitest && reactRouter(), !isVitest && devApi(), !isVitest && clientRoutesCaseSensitive()],
  // Build-time: only the production site is indexed (src/seo/stage.js).
  define: { IS_PRODUCTION_BUILD: JSON.stringify(isProductionStage(process.env)) },
  esbuild: {
    // No license comments in the bundles.
    legalComments: 'none',
    ...(isVitest && { jsx: 'automatic' }),
  },
  // Dev server only. Vite would otherwise discover these on the first visit to
  // a page that imports them, re-optimize and reload; a page hydrating during
  // that reload mixes two copies of React ("Invalid hook call").
  optimizeDeps: {
    include: [
      'framer-motion', 'swiper/react', 'swiper/modules', 'react-hook-form', '@emailjs/browser',
      'gsap', 'gsap/ScrollTrigger', 'gsap/SplitText', 'lenis', '@vercel/analytics/react', '@vercel/speed-insights/react',
    ],
  },
  // No manualChunks: React Router splits the build per route.
  build: {
    target: 'es2020',
    assetsInlineLimit: 4096,
    reportCompressedSize: false,
  },
  server: {
    host: true,
    port: 3000,
  },
  // Vitest. tests/ holds the production contract tests; api/ must never hold
  // a test, because Vercel deploys every file in api/ as a serverless function.
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.js'],
    include: ['src/**/*.test.{js,jsx}', 'tests/**/*.test.{js,jsx}', 'scripts/**/*.test.mjs'],
    css: false,
  },
})
