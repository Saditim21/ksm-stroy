import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useEffect, lazy, Suspense } from 'react'
import Navbar from './components/common/Navbar'
import Footer from './components/common/Footer'
import { ApartmentProvider } from './context/ApartmentContext'

// Lazy load page components for better performance
const Home = lazy(() => import('./pages/Home'))
const About = lazy(() => import('./pages/About'))
const Projects = lazy(() => import('./pages/Projects'))
const GoldenResidenceBlockSelection = lazy(() => import('./components/GoldenResidenceBlockSelection'))
const MnogofamilnaBlockSelection = lazy(() => import('./components/MnogofamilnaBlockSelection'))
const ProjectExplorer = lazy(() => import('./pages/ProjectExplorer'))
const Contact = lazy(() => import('./pages/Contact'))
const Blog = lazy(() => import('./pages/Blog'))
const TracerPage = import.meta.env.DEV ? lazy(() => import('./pages/dev/TracerPage')) : null

// Loading component — a pulsing dimension line, the same 96px gold rule the
// rest of the site uses as its signature, instead of a generic spinner.
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-plaster">
    <div className="text-center">
      <div className="mx-auto mb-4 flex h-[7px] w-24 items-center animate-pulse" aria-hidden="true">
        <span className="h-[7px] w-px bg-gold-accent" />
        <span className="h-px flex-1 bg-gold-accent" />
        <span className="h-[7px] w-px bg-gold-accent" />
      </div>
      <p className="text-graphite text-sm">Зареждане…</p>
    </div>
  </div>
)

function AnimatedRoutes() {
  const location = useLocation()
  
  // Scroll to top when route changes
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])
  
  // Suspense sits OUTSIDE AnimatePresence on purpose: AnimatePresence only
  // tracks its own direct child, so <Routes> (not <Suspense>) has to be the
  // keyed element for the page exit fade to run.
  return (
    <Suspense fallback={<PageLoader />}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {TracerPage && <Route path="/dev/tracer" element={<TracerPage />} />}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/golden-residence" element={<GoldenResidenceBlockSelection />} />
          <Route path="/projects/golden-residence/:block" element={<ProjectExplorer projectId="golden-residence" />} />
          <Route path="/projects/mnogofamilna-sgrada" element={<MnogofamilnaBlockSelection />} />
          <Route path="/projects/mnogofamilna-sgrada/:block" element={<ProjectExplorer projectId="mnogofamilna-sgrada" />} />
          {/* Old indexed project URLs (/projects/1, /projects/2) must not 404.
              React Router ranks static segments above params, so the
              golden-residence / mnogofamilna-sgrada routes above still win. */}
          <Route path="/projects/:id" element={<Navigate to="/projects" replace />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/blog" element={<Blog />} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  )
}

function App() {
  return (
    <ApartmentProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-plaster overscroll-none">
          <Navbar />
          <div className="flex-1 overscroll-none">
            <AnimatedRoutes />
          </div>
          <Footer />
        </div>
      </Router>
    </ApartmentProvider>
  )
}

export default App
