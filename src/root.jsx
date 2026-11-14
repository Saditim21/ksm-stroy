import { lazy, Suspense, useEffect, useLayoutEffect, useState, ViewTransition } from 'react'
import { Links, Meta, Outlet, Scripts, ScrollRestoration, isRouteErrorResponse, useLocation } from 'react-router'
import Navbar from './components/common/Navbar'
import Footer from './components/common/Footer'
import { ApartmentProvider } from './context/ApartmentContext'
import { SITE_URL } from './seo/meta'
import { getLenis } from './utils/lenis'
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
]

export const links = () => [
  { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon.png' },
  { rel: 'apple-touch-icon', sizes: '180x180', href: '/favicon.png' },
]

// Production's structured data (index.html on main), on the live domain.
const LOCAL_BUSINESS = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'KSM Stroy',
  description: 'Строителна компания в София с над 15 години опит в жилищно и комерсиално строителство',
  url: SITE_URL,
  telephone: '+359887886166',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'ул. Строителна 123',
    addressLocality: 'София',
    postalCode: '1000',
    addressCountry: 'BG',
  },
  geo: { '@type': 'GeoCoordinates', latitude: 42.6977, longitude: 23.3219 },
  openingHours: 'Mo-Fr 08:00-18:00, Sa 09:00-14:00',
  priceRange: '€€€',
  image: `${SITE_URL}/logo.jpg`,
  sameAs: ['https://www.facebook.com/ksm.stroi/', 'https://www.linkedin.com/company/ksmstroy'],
  foundingDate: '2009',
  founder: { '@type': 'Person', name: 'Кирил Стоянов' },
  numberOfEmployees: '25-50',
  serviceArea: {
    '@type': 'GeoCircle',
    geoMidpoint: { '@type': 'GeoCoordinates', latitude: 42.6977, longitude: 23.3219 },
    geoRadius: '50000',
  },
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Строителни услуги',
    itemListElement: [
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Жилищно строителство', description: 'Строителство на къщи, апартаменти и жилищни комплекси' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Комерсиално строителство', description: 'Офисни сгради, складове и индустриални обекти' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Ремонти и реновации', description: 'Цялостни ремонти и модернизация на съществуващи сгради' } },
    ],
  },
}

const CRITICAL_CSS = 'html,body{margin:0;padding:0}body{background-color:#fafafa}'

export function Layout({ children }) {
  return (
    <html lang="bg">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <Meta />
        <meta name="robots" content="index, follow" />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="bg_BG" />
        <meta property="og:site_name" content="KSM Stroy" />
        <meta name="geo.region" content="BG-22" />
        <meta name="geo.placename" content="София" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="format-detection" content="telephone=no" />
        <Links />
        <style dangerouslySetInnerHTML={{ __html: CRITICAL_CSS }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(LOCAL_BUSINESS) }} />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <LenisScrollSync />
        <Scripts />
      </body>
    </html>
  )
}

// <ScrollRestoration/> picks the position on every navigation (the top for a
// new entry, the saved position on back and forward, the #hash target) and
// applies it with window.scrollTo in a layout effect. A Lenis fling still in
// flight would overwrite that on its next frame, so right after it (this
// renders later, so its layout effect runs later) Lenis adopts the position at
// once and its animation stops. Without Lenis (reduced motion, the prerender)
// this does nothing.
function LenisScrollSync() {
  const location = useLocation()
  useLayoutEffect(() => {
    getLenis()?.scrollTo(window.scrollY, { immediate: true, force: true })
  }, [location.key])
  return null
}

const Analytics = lazy(() => import('@vercel/analytics/react').then((m) => ({ default: m.Analytics })))

// Vercel Analytics, only on Vercel and the production domain (as main.jsx did
// on main). Decided after hydration, so the prerendered HTML and the first
// client render agree.
function ConditionalAnalytics() {
  const [load, setLoad] = useState(false)
  useEffect(() => {
    const host = window.location.hostname
    setLoad(host.includes('vercel.app') || host.includes('ksmstroy'))
  }, [])
  return load ? <Suspense fallback={null}><Analytics /></Suspense> : null
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

export default function App() {
  return (
    <ApartmentProvider>
      <div className="min-h-screen flex flex-col bg-primary-50 overscroll-none">
        <Navbar />
        <main className="flex-1 overscroll-none">
          <RouteTransition />
        </main>
        <Footer />
      </div>
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
