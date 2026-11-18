import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState, ViewTransition } from 'react'
import { Links, Meta, Outlet, Scripts, ScrollRestoration, isRouteErrorResponse, useLocation, useNavigationType } from 'react-router'
import LenisScrollSync from './motion/LenisScrollSync'
import SmoothScroll from './motion/SmoothScroll'
import { organizationJsonLd } from './seo/jsonLd'
import { robotsMeta } from './seo/meta'
import SiteFooter from './shell/SiteFooter'
import SiteHeader from './shell/SiteHeader'
import { useRouteHandle } from './shell/handle'
import { MOTION_GATE_SCRIPT, SCREEN_HEIGHT_SCRIPT } from './utils/headScripts'
import { normalizePathname } from './utils/pathname'
import { trackScreenHeight } from './utils/screenHeight'
import { focusOn } from './utils/scroll'
import { seoData } from './utils/seo'
import { clearTransitionCut, cutOnPop, keepRootSnapshot, liftCutWhenDone } from './utils/viewTransition'
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

// KSM Text, the shell's face, on every page (spec §3.1). The pages that set
// KSM Display in their first viewport preload it themselves
// (src/utils/fontLinks.js).
export const links = () => [
  { rel: 'preload', href: '/fonts/ksm-text.woff2', as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' },
  { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
  { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32.png' },
  { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
  { rel: 'manifest', href: '/site.webmanifest' },
]

// The page's ground from the first paint, before the stylesheet: onyx with
// ivory text (spec §2.1), the colours of the shell around every page. Only
// <body> has a margin of its own to drop.
const CRITICAL_CSS = 'body{margin:0;background-color:#0E0D0B;color:#EFE9DD}'

// <html> carries no className: the motion gate's class is the one attribute a
// script writes there, before React hydrates (src/utils/motionGate.js), and
// suppressHydrationWarning keeps that from counting as a mismatch.
export function Layout({ children }) {
  return (
    <html lang="bg" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <Meta />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="bg_BG" />
        <meta property="og:site_name" content="KSM Stroy" />
        <meta name="geo.region" content="BG-22" />
        <meta name="geo.placename" content="София" />
        {/* Onyx (spec §2.1), as public/site.webmanifest says. */}
        <meta name="theme-color" content="#0E0D0B" />
        <meta name="format-detection" content="telephone=no" />
        {/* Pre-paint (src/utils/headScripts.js): after the viewport meta, and
            before the stylesheet, which would hold them back until it loaded.
            The screen height first, then the motion gate. */}
        <script dangerouslySetInnerHTML={{ __html: SCREEN_HEIGHT_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: MOTION_GATE_SCRIPT }} />
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
// in one view transition: the doors (src/styles/motion.css, spec §5.6). One
// persistent boundary would also animate the router's "loading" commit while
// a route chunk downloads, and play two transitions on a cold navigation
// (React Router spike, gotcha 9).
//
// How each page arrived, decided as it mounts (spec §5.5, §5.6):
// - undefined for the first page this app renders, the prerendered page that
//   hydrates. Only a first-render ref can tell: React Router gives the first
//   entry the key "default" and Back restores it, so comparing keys would take
//   Back to the first page for a first load (and replay the intro there). No
//   module state either, so every mounted app starts fresh;
// - 'pop' for a page Back or Forward brought;
// - 'hero' for the hero move's target (location.state.arrive);
// - 'doors' for any other client navigation.
//
// Back and Forward are instant: a popstate that brings another page cuts its
// doors (src/utils/viewTransition.js). The page it brings is told by the
// address bar, which a popstate has already moved, against the page on screen.
// That is the page React last applied: within a view transition React applies
// a commit a frame after making it, so a popstate whose listener runs after
// React Router's, and after React's commit (Chrome's order), still finds the
// page being left there, while a fragment the browser follows finds the page
// it keeps. The cut holds until the change's view transition has finished:
// React calls the boundary's onEnter and onExit as the transition starts to
// animate, and liftCutWhenDone's lifter once it has finished. And the root
// snapshot takes part in every route change, so the doors close it with the
// page (src/utils/viewTransition.js).
function RouteTransition() {
  const location = useLocation()
  const navigationType = useNavigationType()
  const page = normalizePathname(location.pathname)
  const firstRender = useRef(true)
  const shownPage = useRef(page)
  useLayoutEffect(() => {
    shownPage.current = page
  }, [page])
  useEffect(() => {
    firstRender.current = false
  }, [])
  useEffect(() => cutOnPop(() => normalizePathname(window.location.pathname) !== shownPage.current), [])
  useEffect(() => keepRootSnapshot(), [])

  let arrive
  if (!firstRender.current) {
    if (navigationType === 'POP') arrive = 'pop'
    else arrive = location.state?.arrive === 'hero' ? 'hero' : 'doors'
  }
  return (
    <ViewTransition key={page} enter="page-in" exit="page-out" default="none" onEnter={liftCutWhenDone} onExit={liftCutWhenDone}>
      <PageFrame arrive={arrive} />
    </ViewTransition>
  )
}

// The page's frame, mounted with its keyed <ViewTransition>. It keeps the
// arrival it mounted with as data-arrive, which sets the page's entrance
// delay (--arrive, src/styles/motion.css), through any later render; the
// prerender and the hydration both render the first page, with none. A page
// the app mounted after the first takes the focus, without scrolling (spec
// §5.6): to the element its address's hash names, where ScrollRestoration
// has brought the page (ruling FR2: Home's teaser ways into #explorer start
// the keyboard there), else to <main>. A hash or query change keeps the
// frame, and the focus where it is.
//
// A page the doors bring has its doors. A cut still on then was left by a
// change that never came (Back to a page still loading when a link was
// followed, a hero move given up), so the frame lifts it as React applies the
// page: in a view transition, before the browser sets up the doors. The hero
// move's target and a page Back or Forward brings keep theirs.
//
// The frame is the page's snapshot in the doors.
function PageFrame({ arrive: arrival }) {
  const [arrive] = useState(arrival)
  // The hash the page arrived with.
  const arrivedAt = useRef(useLocation().hash)
  useLayoutEffect(() => {
    if (arrive === 'doors') clearTransitionCut()
  }, [arrive])
  useEffect(() => {
    if (arrive !== undefined) focusOn(document.getElementById(arrivedAt.current.slice(1)) ?? document.getElementById('main'))
  }, [arrive])
  return (
    <div className="page-frame" data-arrive={arrive}>
      <Outlet />
    </div>
  )
}

// The site's shell (src/shell) around every page: the fixed header with the
// EU row, the page, the footer, and the grain over them. The header is out of
// the flow, so the page starts below it, or, under an overlay header (the
// route's handle, src/shell/handle.js), at the top, its hero running under
// the see-through header (spec §4). The shell is at least one screen tall.
//
// The site is dark (spec §2.1), with a breath of grain over every page
// (.grain, src/styles/shell.css).
//
// SmoothScroll runs Lenis once the motion engine has loaded, after the page
// has (src/motion/runtime.js); until then, and without motion, the page
// scrolls natively and SmoothScroll is a plain wrapper.
//
// --screen-h, which the head script wrote before first paint, follows the
// screen from the moment the app has hydrated (trackScreenHeight(),
// src/utils/screenHeight.js). Not where there is no matchMedia to ask about
// the pointer: jsdom, in the tests.
//
// Live availability is the platform store's (src/data/availability), which
// needs no provider.
export default function App() {
  const { header } = useRouteHandle()
  useEffect(() => (typeof window.matchMedia === 'function' ? trackScreenHeight() : undefined), [])
  return (
    <>
      <SmoothScroll>
        <div className="flex min-h-[var(--screen-h)] flex-col overscroll-none">
          <SiteHeader />
          <main
            id="main"
            tabIndex={-1}
            className={`flex-1 overscroll-none focus:outline-none${header === 'overlay' ? '' : ' pt-[var(--header-h)]'}`}
          >
            <RouteTransition />
          </main>
          <SiteFooter />
          <div className="grain" aria-hidden="true" />
        </div>
      </SmoothScroll>
      <ConditionalAnalytics />
    </>
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
