import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import goldenResidence from '../../assets/home/001.jpg'
import mnogoamilna from '../../assets/home/photo-4.png'

const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlay, setIsAutoPlay] = useState(true)

  // Carousel slides data
  const slides = [
    {
      id: 1,
      image: mnogoamilna,
      title: "Луксозни жилищни комплекси",
      subtitle: "Създаваме пространства за мечтания живот",
      description: "Съвременни решения с висок клас довършителни работи"
    },
    {
      id: 2,
      image: goldenResidence,
      title: "Модерна архитектура",
      subtitle: "Иновативни дизайнерски решения",
      description: "Комбинираме функционалност с естетика"
    }
  ]

  // Building data for different slides
  const buildingData = [
    {
      name: "Многофамилна жилищна сграда",
      location: "УПИ V-1344, кв. 33, ж.к. Връбница-1, гр. София",
      apartments: { total: 144, available: 16, reserved: 6, sold: 122 },
      garages: { total: 72, available: 0, reserved: 0, sold: 72 }
    },
    {
      name: "Golden Residence",
      location: "жк ЛЕВСКИ Г | ул. Ген. Климент Бояджиев",
      apartments: { total: 192, available: 100, reserved: 5, sold: 87 },
      garages: { total: 113, available: 78, reserved: 0, sold: 35 }
    }
  ]

  // Get current building data
  const currentBuilding = buildingData[currentSlide]

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlay) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlay, slides.length])

  const goToSlide = (index) => {
    setCurrentSlide(index)
    setIsAutoPlay(false)
    setTimeout(() => setIsAutoPlay(true), 10000) // Resume autoplay after 10s
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
    setIsAutoPlay(false)
    setTimeout(() => setIsAutoPlay(true), 10000)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
    setIsAutoPlay(false)
    setTimeout(() => setIsAutoPlay(true), 10000)
  }

  return (
    <section className="relative h-screen overflow-hidden">
      {/* Carousel Images */}
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 1, ease: "easeInOut" }}
            style={{
              backgroundImage: `url(${slides[currentSlide].image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          />
        </AnimatePresence>

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/70 via-primary-800/50 to-primary-900/70"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-primary-900/60 via-transparent to-gold-900/20"></div>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8 items-center">
            
            {/* Left Content - Text */}
            <div className="lg:col-span-7 text-center lg:text-left px-2 sm:px-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="text-white"
                >
                  <motion.h1 
                    className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight mb-4 sm:mb-6"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                  >
                    <span className="block text-white mb-1 sm:mb-2">
                      {slides[currentSlide].title}
                    </span>
                    <span className="block bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent">
                      {slides[currentSlide].subtitle}
                    </span>
                  </motion.h1>

                  <motion.p 
                    className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-platinum-300 mb-4 sm:mb-6 lg:mb-8 max-w-2xl mx-auto lg:mx-0"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                  >
                    {slides[currentSlide].description}
                  </motion.p>

                  <motion.div
                    className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                  >
                    <Link
                      to="/projects"
                      className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-primary-900 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 rounded-luxury font-semibold text-sm sm:text-base lg:text-lg shadow-gold-glow hover:shadow-gold-glow-lg transition-all duration-300 text-center"
                    >
                      Разгледай проектите
                      <svg className="inline-block ml-1 sm:ml-2 w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </Link>
                    <Link
                      to="/contact"
                      className="border-2 border-gold-400 text-white bg-white/10 hover:bg-gold-500 hover:border-gold-500 hover:text-primary-900 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 rounded-luxury font-semibold text-sm sm:text-base lg:text-lg transition-all duration-300 text-center"
                    >
                      Свържи се с нас
                    </Link>
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right Content - Apartment Availability Box */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end mt-4 sm:mt-6 lg:mt-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  className="bg-white/95 backdrop-blur-md rounded-xl sm:rounded-luxury-lg p-3 sm:p-5 lg:p-6 shadow-luxury-lg border border-silver-200 max-w-[calc(100%-1rem)] sm:max-w-sm lg:max-w-md w-full mx-2 sm:mx-0"
                  initial={{ opacity: 0, x: 50, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -50, scale: 0.9 }}
                  transition={{ duration: 0.8 }}
                >
                  <div className="text-center mb-3 sm:mb-4 lg:mb-5">
                    <h3 className="text-sm sm:text-lg lg:text-xl font-bold text-primary-900 mb-0.5 sm:mb-1 leading-tight">{currentBuilding.name}</h3>
                    <p className="text-xs sm:text-sm text-primary-600 leading-tight">{currentBuilding.location}</p>
                  </div>

                  {/* Apartments Section */}
                  <div className="mb-3 sm:mb-4 lg:mb-5">
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                      <h4 className="text-sm sm:text-base lg:text-lg font-semibold text-primary-900 flex items-center">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gold-600 mr-1.5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        Апартаменти
                      </h4>
                      <span className="text-primary-600 text-xs sm:text-sm">Общо {currentBuilding.apartments.total}</span>
                    </div>

                    <div className="space-y-1 sm:space-y-1.5">
                      <motion.div
                        className="flex items-center justify-between py-1.5 sm:py-2 px-2 sm:px-3 bg-green-50 rounded-lg border border-green-200"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <div className="flex items-center">
                          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full mr-1.5 sm:mr-2"></div>
                          <span className="text-xs sm:text-sm font-medium text-green-800">Свободни</span>
                        </div>
                        <span className="text-green-800 font-semibold text-sm sm:text-base">{currentBuilding.apartments.available}</span>
                      </motion.div>

                      <motion.div
                        className="flex items-center justify-between py-1.5 sm:py-2 px-2 sm:px-3 bg-yellow-50 rounded-lg border border-yellow-200"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <div className="flex items-center">
                          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-yellow-500 rounded-full mr-1.5 sm:mr-2"></div>
                          <span className="text-xs sm:text-sm font-medium text-yellow-800">Резервирани</span>
                        </div>
                        <span className="text-yellow-800 font-semibold text-sm sm:text-base">{currentBuilding.apartments.reserved}</span>
                      </motion.div>

                      <motion.div
                        className="flex items-center justify-between py-1.5 sm:py-2 px-2 sm:px-3 bg-red-50 rounded-lg border border-red-200"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        <div className="flex items-center">
                          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-500 rounded-full mr-1.5 sm:mr-2"></div>
                          <span className="text-xs sm:text-sm font-medium text-red-800">Продадени</span>
                        </div>
                        <span className="text-red-800 font-semibold text-sm sm:text-base">{currentBuilding.apartments.sold}</span>
                      </motion.div>
                    </div>
                  </div>

                  {/* Garages Section */}
                  <div className="mb-2 sm:mb-4 pb-2 sm:pb-4 border-b border-silver-200">
                    <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                      <h4 className="text-sm sm:text-base font-semibold text-primary-900 flex items-center">
                        <svg className="w-4 h-4 text-gold-600 mr-1 sm:mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                        </svg>
                        Гаражи
                      </h4>
                      <span className="text-primary-600 text-[10px] sm:text-xs">Общо {currentBuilding.garages.total}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-1 text-center">
                      <motion.div
                        className="py-1 px-1 bg-green-50 rounded border border-green-200"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 }}
                      >
                        <div className="text-xs sm:text-sm font-bold text-green-800">{currentBuilding.garages.available}</div>
                        <div className="text-[9px] sm:text-[10px] text-green-600">Свободни</div>
                      </motion.div>
                      <motion.div
                        className="py-1 px-1 bg-yellow-50 rounded border border-yellow-200"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6 }}
                      >
                        <div className="text-xs sm:text-sm font-bold text-yellow-800">{currentBuilding.garages.reserved}</div>
                        <div className="text-[9px] sm:text-[10px] text-yellow-600">Резерв.</div>
                      </motion.div>
                      <motion.div
                        className="py-1 px-1 bg-red-50 rounded border border-red-200"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.7 }}
                      >
                        <div className="text-xs sm:text-sm font-bold text-red-800">{currentBuilding.garages.sold}</div>
                        <div className="text-[9px] sm:text-[10px] text-red-600">Продаден</div>
                      </motion.div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Link
                    to="/projects"
                    className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-primary-900 py-2.5 sm:py-3 px-4 rounded-lg sm:rounded-luxury font-semibold text-xs sm:text-sm text-center block transition-all duration-300 shadow-gold-glow hover:shadow-gold-glow-lg"
                  >
                    Виж проектите в продажба
                  </Link>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Carousel Controls - Combined arrows and dots at the bottom */}
      <div className="absolute bottom-4 sm:bottom-6 lg:bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        {/* Mobile: Compact control bar with arrows + dots */}
        <div className="flex items-center gap-3 sm:gap-4 bg-black/30 sm:bg-transparent backdrop-blur-sm sm:backdrop-blur-none rounded-full px-3 py-2 sm:p-0">
          {/* Left Arrow - Mobile inline, Desktop hidden here */}
          <button
            onClick={prevSlide}
            className="sm:hidden p-1.5 rounded-full bg-white/20 hover:bg-white/30 active:bg-white/40 transition-all duration-200 text-white"
            aria-label="Предишен слайд"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Dots */}
          <div className="flex space-x-2 sm:space-x-3">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 sm:h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? 'bg-gold-500 w-5 sm:w-8'
                    : 'bg-white/50 hover:bg-white/70 w-2 sm:w-3'
                }`}
                aria-label={`Слайд ${index + 1}`}
              />
            ))}
          </div>

          {/* Right Arrow - Mobile inline, Desktop hidden here */}
          <button
            onClick={nextSlide}
            className="sm:hidden p-1.5 rounded-full bg-white/20 hover:bg-white/30 active:bg-white/40 transition-all duration-200 text-white"
            aria-label="Следващ слайд"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Desktop Navigation Arrows - Positioned on sides */}
      <button
        onClick={prevSlide}
        className="hidden sm:flex absolute left-4 top-1/2 transform -translate-y-1/2 z-20 p-3 rounded-full bg-white/20 hover:bg-white/30 transition-all duration-300 text-white hover:text-gold-400"
        aria-label="Предишен слайд"
      >
        <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        onClick={nextSlide}
        className="hidden sm:flex absolute right-4 top-1/2 transform -translate-y-1/2 z-20 p-3 rounded-full bg-white/20 hover:bg-white/30 transition-all duration-300 text-white hover:text-gold-400"
        aria-label="Следващ слайд"
      >
        <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </section>
  )
}

export default HeroCarousel