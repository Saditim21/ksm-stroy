import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Lazy load analytics for better performance
const Analytics = lazy(() => 
  import('@vercel/analytics/react').then(module => ({ 
    default: module.Analytics 
  }))
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <Suspense fallback={null}>
      <Analytics />
    </Suspense>
  </StrictMode>,
)
