import { lazy, Suspense, useEffect, useState, ViewTransition } from 'react'
import { Links, Meta, Outlet, Scripts, ScrollRestoration, isRouteErrorResponse, useLocation } from 'react-router'
import { ApartmentProvider } from './context/ApartmentContext'
import LenisScrollSync from './motion/LenisScrollSync'
import SmoothScroll from './motion/SmoothScroll'
import { organizationJsonLd } from './seo/jsonLd'
import { robotsMeta } from './seo/meta'
import SiteFooter from './shell/SiteFooter'
import SiteHeader from './shell/SiteHeader'
import { useRouteHandle } from './shell/handle'
import { SCREEN_HEIGHT_SCRIPT } from './utils/headScripts'
import { normalizePathname } from './utils/pathname'
import { seoData } from './utils/seo'
import './index.css'

// The root route: the document around every page (Layout), the site shell
// around the route outlet (App), and the head defaults.

// The head of a page whose route exports no `meta` of its own, such as the
// SPA fallback. Every page exports a complete set (src/seo/meta.js), because
// React Router renders the deepest route's `meta` alone.
export const meta = () => [
  { title: seoData.home.title },
  { name: 'description', content: seoData.home.description },
  robotsMeta(),
]

export const links = () => [
  { rel: 'preload', href: '/fonts/ksm-display.woff2', as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' },
  { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
  { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32.png' },
  { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
  { rel: 'manifest', href: '/site.webmanifest' },
]

// The page's ground from the first paint, before the stylesheet: paper
// (spec §3.1), the colour of the header's EU line and its solid bar.
const CRITICAL_CSS = 'html,body{margin:0;padding:0}body{background-color:#F1F2EF}'

export function Layout({ children }) {
  return (
    <html lang="bg">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <Meta />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="bg_BG" />
        <meta property="og:site_name" content="KSM Stroy" />
        <meta name="geo.region" content="BG-22" />
        <meta name="geo.placename" content="София" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="format-detection" content="telephone=no" />
        {/* Pre-paint (src/utils/headScripts.js): after the viewport meta, and
            before the stylesheet, which would hold it back until it loaded. */}
        <script dangerouslySetInnerHTML={{ __html: SCREEN_HEIGHT_SCRIPT }} />
        <Links />
        <style dangerouslySetInnerHTML={{ __html: CRITICAL_CSS }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }} />
      </head>
      <body>
        {children}
        {/* Scroll on a route change has one owner (spec §5.3):
            ScrollRestoration sets the position, then LenisScrollSync, which
            must render after it, hands it to Lenis. */}
        <ScrollRestoration />
        <LenisScrollSync />
        <Scripts />
      </body>
    </html>
  )
}

const Analytics = lazy(() => import('@vercel/analytics/react').then((m) => ({ default: m.Analytics })))
const SpeedInsights = lazy(() => import('@vercel/speed-insights/react').then((m) => ({ default: m.SpeedInsights })))

// Vercel Analytics and Speed Insights, only on Vercel and the production
// domain (as main.jsx did on main). Decided after hydration, so the
// prerendered HTML and the first client render agree.
function ConditionalAnalytics() {
  const [load, setLoad] = useState(false)
  useEffect(() => {
    const host = window.location.hostname
    setLoad(host.endsWith('ksmstroy.com') || host.endsWith('vercel.app'))
  }, [])
  return load ? (
    <Suspense fallback={null}>
      <Analytics />
      <SpeedInsights />
    </Suspense>
  ) : null
}

// React Router runs every navigation in a Transition, so a <ViewTransition>
// keyed by the page's path exits with the old page and enters with the new one
// as one crossfade (src/index.css). One persistent boundary would also animate
// the router's "loading" commit while a route chunk downloads, and play two
// transitions on a cold navigation (React Router spike, gotcha 9).
function RouteTransition() {
  const pathname = normalizePathname(useLocation().pathname)
  return (
    <ViewTransition key={pathname} enter="page-in" exit="page-out" default="none">
      <div>
        <Outlet />
      </div>
    </ViewTransition>
  )
}

// The site's shell (src/shell) around every page: the fixed header with the
// EU line, the page, the footer. The header is out of the flow, so the page
// starts below it, or, under an overlay header (the route's handle,
// src/shell/handle.js), right below the EU line, its hero running under the
// see-through bar.
//
// SmoothScroll runs Lenis once the motion engine has loaded, after the page
// has (src/motion/runtime.js); until then, and without motion, the page
// scrolls natively and SmoothScroll is a plain wrapper.
export default function App() {
  const { header } = useRouteHandle()
  return (
    <ApartmentProvider>
      <SmoothScroll>
        <div className="flex min-h-screen flex-col overscroll-none">
          <SiteHeader />
          <main
            id="main"
            tabIndex={-1}
            className={`flex-1 overscroll-none focus:outline-none ${header === 'overlay' ? 'pt-[var(--eu-h)]' : 'pt-[var(--header-h)]'}`}
          >
            <RouteTransition />
          </main>
          <SiteFooter />
        </div>
      </SmoothScroll>
      <ConditionalAnalytics />
    </ApartmentProvider>
  )
}

// What a path that is not prerendered shows until its route module has loaded
// in the browser (the body of __spa-fallback.html).
export function HydrateFallback() {
  return null
}

export function ErrorBoundary({ error }) {
  const status = isRouteErrorResponse(error) ? error.status : 500
  return (
    <main className="min-h-screen flex items-center justify-center p-8 text-center">
      <div>
        <h1 className="text-3xl font-bold mb-2">{status === 404 ? 'Страницата не е намерена' : 'Възникна грешка'}</h1>
        <a className="underline" href="/">Към началната страница</a>
      </div>
    </main>
  )
}
