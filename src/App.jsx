import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useEffect, lazy, Suspense } from 'react'
import Navbar from './components/common/Navbar'
import Footer from './components/common/Footer'

// Lazy load page components for better performance
const Home = lazy(() => import('./pages/Home'))
const About = lazy(() => import('./pages/About'))
const Projects = lazy(() => import('./pages/Projects'))
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'))
const GoldenResidenceBlockSelection = lazy(() => import('./components/GoldenResidenceBlockSelection'))
const GoldenResidenceSingleBlock = lazy(() => import('./components/GoldenResidenceSingleBlock'))
const MnogofamilnaBlockSelection = lazy(() => import('./components/MnogofamilnaBlockSelection'))
const MnogofamilnaSingleBlock = lazy(() => import('./components/MnogofamilnaSingleBlock'))
const Contact = lazy(() => import('./pages/Contact'))
const Blog = lazy(() => import('./pages/Blog'))

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
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/golden-residence" element={<GoldenResidenceBlockSelection />} />
          <Route path="/projects/golden-residence/:block" element={<GoldenResidenceSingleBlock />} />
          <Route path="/projects/mnogofamilna-sgrada" element={<MnogofamilnaBlockSelection />} />
          <Route path="/projects/mnogofamilna-sgrada/:block" element={<MnogofamilnaSingleBlock />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/blog" element={<Blog />} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  )
}

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-primary-50 overscroll-none">
        <Navbar />
        <main className="flex-1 overscroll-none">
          <AnimatedRoutes />
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App
