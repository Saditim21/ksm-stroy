import React, { useState } from 'react'
import OptimizedImage from './OptimizedImage'

const PropertyCard = ({ property, index, onClick }) => {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  const handleImageLoad = () => {
    setImageLoaded(true)
  }

  const handleImageError = () => {
    setImageError(true)
    setImageLoaded(true)
  }

  return (
    <article 
      className="bg-white rounded-luxury-lg overflow-hidden group cursor-pointer border border-silver-200 hover:border-gold-500/30 shadow-luxury hover:shadow-luxury-lg transition-all duration-500"
      onClick={onClick}
    >
      {/* Property Image */}
      <div className="relative h-48 sm:h-56 lg:h-64 overflow-hidden">
        {!imageError ? (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gradient-to-br from-gold-100 to-gold-200 animate-pulse flex items-center justify-center">
                <svg className="w-12 h-12 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            )}
            <OptimizedImage
              src={property.images[0]}
              alt={`${property.title} - KSM Stroy обект`}
              className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={handleImageLoad}
              onError={handleImageError}
              loading="lazy"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gold-100 to-gold-200 flex items-center justify-center">
            <div className="text-center">
              <svg className="w-16 h-16 text-gold-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span className="text-gold-700 text-sm font-medium">Проект</span>
            </div>
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent group-hover:from-black/30 transition-all duration-300"></div>
        
        {/* Status Badge */}
        <div className="absolute top-2 sm:top-4 left-2 sm:left-4">
          <span className={`px-2 sm:px-3 py-1 backdrop-blur-sm rounded-full text-xs font-medium ${
            property.status === 'За продажба' 
              ? 'bg-green-500/90 text-white' 
              : 'bg-blue-500/90 text-white'
          }`}>
            {property.status}
          </span>
        </div>

        {/* Image Count Indicator */}
        {property.images.length > 1 && (
          <div className="absolute top-2 sm:top-4 right-2 sm:right-4">
            <span className="px-1.5 sm:px-2 py-1 bg-black/50 backdrop-blur-sm text-white rounded-full text-xs flex items-center">
              <svg className="w-3 h-3 mr-0.5 sm:mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {property.images.length}
            </span>
          </div>
        )}
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gold-600/0 group-hover:bg-gold-600/10 transition-all duration-300"></div>
      </div>

      {/* Property Content */}
      <div className="p-4 sm:p-5 lg:p-6">
        {/* Title */}
        <h3 className="text-lg sm:text-xl font-bold text-primary-900 mb-2 group-hover:text-gold-700 transition-colors duration-300 leading-tight">
          {property.title}
        </h3>

        {/* Location and Type */}
        <div className="flex items-center text-xs sm:text-sm text-primary-500 mb-3 space-x-2">
          <div className="flex items-center">
            <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{property.location}</span>
          </div>
          <span>•</span>
          <span>{property.year}</span>
        </div>

        {/* Description */}
        <p className="text-primary-600 text-sm leading-relaxed mb-4 line-clamp-2">
          {property.description}
        </p>

        {/* Property Type */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-primary-500 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            {property.type}
          </span>
        </div>

        {/* Features Preview */}
        {property.features && property.features.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {property.features.slice(0, 2).map((feature, index) => (
              <span key={index} className="px-2 py-1 bg-gold-100 text-gold-700 rounded-full text-xs">
                {feature}
              </span>
            ))}
            {property.features.length > 2 && (
              <span className="px-2 py-1 bg-primary-100 text-primary-600 rounded-full text-xs">
                +{property.features.length - 2}
              </span>
            )}
          </div>
        )}

        {/* View Details Button */}
        <button 
          className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-primary-900 py-3 px-4 rounded-luxury font-semibold flex items-center justify-center group shadow-gold-glow hover:shadow-gold-glow-lg transition-all duration-300"
        >
          <span>Разгледай апартаментите</span>
          <svg className="w-4 h-4 ml-2 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </button>
      </div>

      {/* Bottom accent line */}
      <div className="h-1 bg-gradient-to-r from-gold-500 to-gold-600 origin-left" />
    </article>
  )
}

export default PropertyCard