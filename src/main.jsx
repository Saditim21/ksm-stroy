import { StrictMode, lazy, Suspense, useEffect, useState } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const Analytics = lazy(() =>
  import('@vercel/analytics/react').then(module => ({
    default: module.Analytics
  }))
)

// Wrapper that only renders Analytics on Vercel or production domain
function ConditionalAnalytics() {
  const [shouldLoad, setShouldLoad] = useState(false)

  useEffect(() => {
    const hostname = window.location.hostname
    // Only load analytics on Vercel domains or your production domain
    const isVercel = hostname.includes('vercel.app')
    const isProductionDomain = hostname === 'ksmstroy.bg' || hostname.includes('ksmstroy')

    if (isVercel || isProductionDomain) {
      setShouldLoad(true)
    }
  }, [])

  if (!shouldLoad) return null

  return (
    <Suspense fallback={null}>
      <Analytics />
    </Suspense>
  )
}

const rootElement = document.getElementById('root')

const AppWithAnalytics = (
  <StrictMode>
    <App />
    <ConditionalAnalytics />
  </StrictMode>
)

// Check if page was pre-rendered
const isPrerendered = document.documentElement.hasAttribute('data-prerendered')

if (isPrerendered && rootElement.hasChildNodes()) {
  // Use hydration for pre-rendered pages
  hydrateRoot(rootElement, AppWithAnalytics, {
    onRecoverableError: (error) => {
      // Suppress hydration mismatch warnings in production
      if (import.meta.env.DEV) {
        console.warn('Hydration error:', error)
      }
    }
  })
} else {
  createRoot(rootElement).render(AppWithAnalytics)
}

// Dispatch event for prerenderer to know the app is ready
document.dispatchEvent(new Event('render-event'))
