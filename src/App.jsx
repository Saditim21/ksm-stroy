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

// Loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Зареждане...</p>
    </div>
  </div>
)

function AnimatedRoutes() {
  const location = useLocation()
  
  // Scroll to top when route changes
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])
  
  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<PageLoader />}>
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
      </Suspense>
    </AnimatePresence>
  )
}

function App() {
  return (
    <ApartmentProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-primary-50 overscroll-none">
          <Navbar />
          <main className="flex-1 overscroll-none">
            <AnimatedRoutes />
          </main>
          <Footer />
        </div>
      </Router>
    </ApartmentProvider>
  )
}

export default App
