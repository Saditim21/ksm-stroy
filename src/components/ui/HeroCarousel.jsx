import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import img001 from '../../assets/images/001.jpg'
import img002 from '../../assets/images/002.jpg'
import img003 from '../../assets/images/003.jpg'
import slider01 from '../../assets/images/slider01.jpg'

const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlay, setIsAutoPlay] = useState(true)

  // Carousel slides data
  const slides = [
    {
      id: 1,
      image: slider01,
      title: "Луксозни жилищни комплекси",
      subtitle: "Създаваме пространства за мечтания живот",
      description: "Съвременни решения с висок клас довършителни работи"
    },
    {
      id: 2,
      image: img001,
      title: "Модерна архитектура",
      subtitle: "Иновативни дизайнерски решения",
      description: "Комбинираме функционалност с естетика"
    },
    {
      id: 3,
      image: img002,
      title: "Качествено строителство",
      subtitle: "15+ години доказан опит",
      description: "Реализираме проекти с гарантирано качество"
    },
    {
      id: 4,
      image: img003,
      title: "Индивидуален подход",
      subtitle: "Всеки проект е уникален",
      description: "Превръщаме вашите идеи в реалност"
    }
  ]

  // Building data for different slides
  const buildingData = [
    {
      name: "Резиденс Витоша",
      location: "София, кв. Витоша",
      apartments: { total: 24, available: 18, reserved: 4, sold: 2 },
      garages: { total: 12, available: 8, reserved: 2, sold: 2 }
    },
    {
      name: "Комплекс Бояна Хилс",
      location: "София, кв. Бояна",
      apartments: { total: 32, available: 22, reserved: 6, sold: 4 },
      garages: { total: 18, available: 12, reserved: 3, sold: 3 }
    },
    {
      name: "Парк Резиденс",
      location: "София, кв. Драгалевци",
      apartments: { total: 18, available: 14, reserved: 2, sold: 2 },
      garages: { total: 15, available: 10, reserved: 3, sold: 2 }
    },
    {
      name: "Премиум Тауърс",
      location: "София, Център",
      apartments: { total: 48, available: 35, reserved: 8, sold: 5 },
      garages: { total: 24, available: 16, reserved: 4, sold: 4 }
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Content - Text */}
            <div className="lg:col-span-7">
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
                    className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                  >
                    <span className="block text-white mb-2">
                      {slides[currentSlide].title}
                    </span>
                    <span className="block bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent">
                      {slides[currentSlide].subtitle}
                    </span>
                  </motion.h1>

                  <motion.p 
                    className="text-xl md:text-2xl text-platinum-300 mb-8 max-w-2xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                  >
                    {slides[currentSlide].description}
                  </motion.p>

                  <motion.div 
                    className="flex flex-col sm:flex-row gap-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                  >
                    <Link
                      to="/projects"
                      className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-primary-900 px-8 py-4 rounded-luxury font-semibold text-lg shadow-gold-glow hover:shadow-gold-glow-lg transition-all duration-300 text-center"
                    >
                      Разгледай проектите
                      <svg className="inline-block ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </Link>
                    <Link
                      to="/contact"
                      className="border-2 border-gold-500/50 hover:border-gold-500 text-white hover:bg-gold-500 hover:text-primary-900 px-8 py-4 rounded-luxury font-semibold text-lg backdrop-blur-sm transition-all duration-300 text-center"
                    >
                      Свържи се с нас
                    </Link>
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right Content - Apartment Availability Box */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  className="bg-white/95 backdrop-blur-md rounded-luxury-lg p-8 shadow-luxury-lg border border-silver-200 max-w-md w-full"
                  initial={{ opacity: 0, x: 50, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -50, scale: 0.9 }}
                  transition={{ duration: 0.8 }}
                >
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-primary-900 mb-2">{currentBuilding.name}</h3>
                    <p className="text-primary-600">{currentBuilding.location}</p>
                  </div>

                  {/* Apartments Section */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-semibold text-primary-900 flex items-center">
                        <svg className="w-5 h-5 text-gold-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        Апартаменти
                      </h4>
                      <span className="text-primary-600 text-sm">Общо {currentBuilding.apartments.total}</span>
                    </div>

                    <div className="space-y-2">
                      <motion.div 
                        className="flex items-center justify-between py-2 px-3 bg-green-50 rounded-lg border border-green-200"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                          <span className="text-sm font-medium text-green-800">Свободни</span>
                        </div>
                        <span className="text-green-800 font-semibold">{currentBuilding.apartments.available}</span>
                      </motion.div>
                      
                      <motion.div 
                        className="flex items-center justify-between py-2 px-3 bg-yellow-50 rounded-lg border border-yellow-200"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                          <span className="text-sm font-medium text-yellow-800">Резервирани</span>
                        </div>
                        <span className="text-yellow-800 font-semibold">{currentBuilding.apartments.reserved}</span>
                      </motion.div>
                      
                      <motion.div 
                        className="flex items-center justify-between py-2 px-3 bg-red-50 rounded-lg border border-red-200"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                          <span className="text-sm font-medium text-red-800">Продадени</span>
                        </div>
                        <span className="text-red-800 font-semibold">{currentBuilding.apartments.sold}</span>
                      </motion.div>
                    </div>
                  </div>

                  {/* Garages Section */}
                  <div className="mb-6 pb-6 border-b border-silver-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-semibold text-primary-900 flex items-center">
                        <svg className="w-5 h-5 text-gold-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                        </svg>
                        Гаражи
                      </h4>
                      <span className="text-primary-600 text-sm">Общо {currentBuilding.garages.total}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center">
                      <motion.div 
                        className="py-2 px-2 bg-green-50 rounded border border-green-200"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 }}
                      >
                        <div className="text-lg font-bold text-green-800">{currentBuilding.garages.available}</div>
                        <div className="text-xs text-green-600">Свободни</div>
                      </motion.div>
                      <motion.div 
                        className="py-2 px-2 bg-yellow-50 rounded border border-yellow-200"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6 }}
                      >
                        <div className="text-lg font-bold text-yellow-800">{currentBuilding.garages.reserved}</div>
                        <div className="text-xs text-yellow-600">Резерв.</div>
                      </motion.div>
                      <motion.div 
                        className="py-2 px-2 bg-red-50 rounded border border-red-200"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.7 }}
                      >
                        <div className="text-lg font-bold text-red-800">{currentBuilding.garages.sold}</div>
                        <div className="text-xs text-red-600">Продаден</div>
                      </motion.div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Link
                    to="/building-plan"
                    className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-primary-900 py-3 px-6 rounded-luxury font-semibold text-center block transition-all duration-300 shadow-gold-glow hover:shadow-gold-glow-lg"
                  >
                    Виж етажните планове
                  </Link>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Carousel Controls */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex space-x-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'bg-gold-500 w-8' 
                  : 'bg-white/50 hover:bg-white/70'
              }`}
              aria-label={`Слайд ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 p-3 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all duration-300 text-white hover:text-gold-400"
        aria-label="Предишен слайд"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 p-3 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all duration-300 text-white hover:text-gold-400"
        aria-label="Следващ слайд"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </section>
  )
}

export default HeroCarousel