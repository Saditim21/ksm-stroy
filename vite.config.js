import { reactRouter } from '@react-router/dev/vite'
import { defineConfig } from 'vite'
import { isProductionStage } from './src/seo/stage.js'

// The React Router plugin builds the site from src/routes.js and
// react-router.config.js, and brings its own JSX transform and React Refresh
// in place of @vitejs/plugin-react. Tailwind runs through postcss.config.js,
// which Vite picks up on its own.
//
// Vitest loads this file too. The React Router plugin must not run there (the
// tests fail with "React Router Vite plugin can't detect preamble"), so tests
// get plain Vite with the automatic JSX runtime instead.
const isVitest = process.env.VITEST === 'true'

export default defineConfig({
  plugins: [!isVitest && reactRouter()],
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
      'gsap', 'gsap/ScrollTrigger', 'gsap/SplitText', '@gsap/react', 'lenis', '@vercel/analytics/react', '@vercel/speed-insights/react',
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
