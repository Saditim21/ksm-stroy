import { useState, memo } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { statusConfig, categoryConfig } from '../../data/projectsData'
import { hoverLift, fadeInUp, buttonExpand } from '../../utils/animations'

const ProjectCard = memo(({ project }) => {
  const navigate = useNavigate()
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  const handleImageLoad = () => {
    setImageLoaded(true)
  }

  const handleImageError = () => {
    setImageError(true)
    setImageLoaded(true)
  }

  const handleViewDetails = () => {
    navigate(`/projects/${project.id}`)
  }

  return (
    <motion.div 
      className="bg-primary-50 rounded-luxury-lg shadow-luxury overflow-hidden group cursor-pointer border border-silver-200 hover:border-gold-500/50 hover:shadow-luxury-lg transition-all duration-300"
      variants={hoverLift}
      initial="initial"
      whileHover="hover"
      whileInView={fadeInUp.animate}
      viewport={{ once: true, amount: 0.3 }}
    >
      
      {/* Project Image */}
      <div className="relative h-64 bg-primary-200 overflow-hidden rounded-t-luxury-lg">
        {!imageError ? (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 bg-primary-200 animate-pulse flex items-center justify-center">
                <svg className="w-12 h-12 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            <img
              src={project.image}
              alt={project.name}
              className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          </>
        ) : (
          // Fallback 3D render placeholder
          <div className="w-full h-full bg-gradient-to-br from-gold-100 to-gold-200 flex items-center justify-center">
            <div className="text-center">
              <svg className="w-16 h-16 text-gold-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span className="text-gold-700 text-sm font-medium">3D Визуализация</span>
            </div>
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusConfig[project.status]?.className}`}>
            {statusConfig[project.status]?.label}
          </span>
        </div>

        {/* Category Badge */}
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${categoryConfig[project.category]?.className}`}>
            {categoryConfig[project.category]?.label}
          </span>
        </div>

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-primary-900 bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
          <button
            onClick={handleViewDetails}
            className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-gradient-to-r from-gold-500 to-gold-600 text-primary-900 px-6 py-2 rounded-luxury font-semibold shadow-gold-glow hover:shadow-gold-glow-lg"
          >
            Виж детайли
          </button>
        </div>
      </div>

      {/* Project Info */}
      <div className="p-6">
        
        {/* Project Name */}
        <h3 className="text-xl font-bold text-primary-900 mb-2 line-clamp-2 group-hover:text-gold-700 transition-colors duration-200">
          {project.name}
        </h3>

        {/* Location */}
        <div className="flex items-center text-primary-600 mb-3">
          <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-sm">{project.location}</span>
        </div>

        {/* Description */}
        <p className="text-primary-600 text-sm leading-relaxed mb-4 line-clamp-3">
          {project.description}
        </p>

        {/* Project Details */}
        <div className="flex items-center justify-between text-sm text-primary-500 mb-4">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span>{project.area}</span>
          </div>
          
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 9l2 2 4-4m-6 2a9 9 0 108.29-5.64" />
            </svg>
            <span>{project.year}</span>
          </div>
        </div>

        {/* Action Button */}
        <motion.button
          onClick={handleViewDetails}
          className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-primary-900 py-3 px-4 rounded-luxury font-semibold flex items-center justify-center group shadow-gold-glow hover:shadow-gold-glow-lg transition-all duration-200"
          variants={buttonExpand}
          whileHover="hover"
          whileTap="tap"
        >
          <span>Виж детайли</span>
          <svg className="w-4 h-4 ml-2 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </motion.button>
      </div>

      {/* Bottom accent line */}
      <motion.div 
        className="h-1 bg-gradient-to-r from-gold-500 to-gold-600 origin-left"
        initial={{ scaleX: 0 }}
        whileHover={{ scaleX: 1 }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  )
})

ProjectCard.displayName = 'ProjectCard'

export default ProjectCard