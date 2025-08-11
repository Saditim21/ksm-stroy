import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'

const OptimizedImage = ({
  src,
  alt,
  className = '',
  width,
  height,
  loading = 'lazy',
  placeholder = 'blur',
  priority = false,
  sizes,
  srcSet,
  onLoad,
  onError,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isError, setIsError] = useState(false)
  const [imageSrc, setImageSrc] = useState(priority ? src : null)
  const imgRef = useRef()

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || imageSrc) return

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting) {
          setImageSrc(src)
          observer.unobserve(entry.target)
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current)
      }
    }
  }, [src, priority, imageSrc])

  const handleLoad = (e) => {
    setIsLoaded(true)
    onLoad?.(e)
  }

  const handleError = (e) => {
    setIsError(true)
    onError?.(e)
  }

  // Generate srcSet for responsive images
  const generateSrcSet = (baseSrc) => {
    if (srcSet) return srcSet
    
    // Basic responsive image logic - could be enhanced with actual image processing
    const sizes = [400, 800, 1200, 1600]
    return sizes
      .map(size => `${baseSrc}?w=${size} ${size}w`)
      .join(', ')
  }

  const imageSizes = sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'

  if (isError) {
    return (
      <div 
        ref={imgRef}
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={{ width, height }}
        {...props}
      >
        <svg 
          className="w-12 h-12 text-gray-400" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5} 
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
          />
        </svg>
      </div>
    )
  }

  return (
    <div ref={imgRef} className="relative overflow-hidden">
      {/* Placeholder */}
      {!isLoaded && imageSrc && placeholder === 'blur' && (
        <div 
          className={`absolute inset-0 bg-gray-200 animate-pulse ${className}`}
          style={{ width, height }}
        />
      )}
      
      {/* Main Image */}
      {imageSrc && (
        <motion.img
          src={imageSrc}
          alt={alt}
          width={width}
          height={height}
          loading={loading}
          sizes={imageSizes}
          srcSet={generateSrcSet(imageSrc)}
          className={`transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } ${className}`}
          onLoad={handleLoad}
          onError={handleError}
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          {...props}
        />
      )}
      
      {/* SEO-friendly fallback for non-JavaScript environments */}
      <noscript>
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={className}
          {...props}
        />
      </noscript>
    </div>
  )
}

export default OptimizedImage