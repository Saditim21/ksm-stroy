import React, { useState, useRef, useEffect, useCallback } from 'react'
import SEO from '../components/common/SEO'
import OptimizedImage from '../components/ui/OptimizedImage'
import FourTowersFloorMap from '../components/FourTowersFloorMap'
import { seoData } from '../utils/seo'

// Import sales property images
import property1Image1 from '../assets/продажби/project 1/sgrada1.jpg'
import property1Image2 from '../assets/продажби/project 1/sgrada1.jpg'
import buildingImage from '../assets/продажби/project 1/sgrada1.jpg'
import buildingBFloor1Image from '../assets/продажби/project 1/building-D-floor-1.jpg'
import buildingBFloor2Image from '../assets/продажби/project 1/building-D-floor-2.jpg'
import buildingBFloor3Image from '../assets/продажби/project 1/building-D-floor-3.jpg'

const Sales = () => {
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [selectedProject, setSelectedProject] = useState(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showBuildingView, setShowBuildingView] = useState(false)
  const [hoveredFloor, setHoveredFloor] = useState(null)
  const [selectedFloor, setSelectedFloor] = useState(null)
  const [isHoveringBFloor1, setIsHoveringBFloor1] = useState(false)
  const [isHoveringBFloor2, setIsHoveringBFloor2] = useState(false)
  const [isHoveringBFloor3, setIsHoveringBFloor3] = useState(false)
  const modalRef = useRef(null)

  // Sales property data
  const properties = [
    {
      id: 1,
      title: "Многофамилна жилищна сграда",
      location: "УПИ V-1344, кв. 33, ж.к. Връбница-1, гр. София",
      status: "За продажба",
      type: "Жилищна сграда",
      year: "2024",
      description: "Модерна многофамилна жилищна сграда с два блока (А и Б), гаражи и луксозни апартаменти в жк. Връбница-1. Блок А - 10 етажа, Блок Б - 9 етажа. Част от апартаментите вече са продадени.",
      images: [property1Image1, property1Image2],
      features: ["Подземни гаражи", "Блок А - 10 етажа", "Блок Б - 9 етажа", "Престижен район"],
      price: "По запитване",
      apartments: "Блокове А и Б - различни етажи",
      totalFloors: "Блок А: 10 етажа, Блок Б: 9 етажа",
      buildingData: {
        blockA: {
          floors: [
            { floor: 10, status: 'sold', apartments: 2, description: 'Етаж 10 - Продаден' },
            { floor: 9, status: 'available', apartments: 2, description: 'Етаж 9 - 2 апартамента налични' },
            { floor: 8, status: 'sold', apartments: 2, description: 'Етаж 8 - Продаден' },
            { floor: 7, status: 'sold', apartments: 2, description: 'Етаж 7 - Продаден' },
            { floor: 6, status: 'sold', apartments: 2, description: 'Етаж 6 - Продаден' },
            { floor: 5, status: 'sold', apartments: 2, description: 'Етаж 5 - Продаден' },
            { floor: 4, status: 'sold', apartments: 2, description: 'Етаж 4 - Продаден' },
            { floor: 3, status: 'available', apartments: 2, description: 'Етаж 3 - 2 апартамента налични' },
            { floor: 2, status: 'available', apartments: 2, description: 'Етаж 2 - 2 апартамента налични' }
          ]
        },
        blockB: {
          floors: [
            { floor: 9, status: 'available', apartments: 2, description: 'Етаж 9 - 2 апартамента налични' },
            { floor: 8, status: 'available', apartments: 2, description: 'Етаж 8 - 2 апартамента налични' },
            { floor: 7, status: 'available', apartments: 2, description: 'Етаж 7 - 2 апартамента налични' },
            { floor: 6, status: 'available', apartments: 2, description: 'Етаж 6 - 2 апартамента налични' },
            { floor: 5, status: 'available', apartments: 2, description: 'Етаж 5 - 2 апартамента налични' },
            { floor: 4, status: 'available', apartments: 2, description: 'Етаж 4 - 2 апартамента налични' },
            { floor: 3, status: 'available', apartments: 2, description: 'Етаж 3 - 2 апартамента налични' },
            { floor: 2, status: 'available', apartments: 2, description: 'Етаж 2 - 2 апартамента налични' }
          ]
        },
        garage: {
          available: true,
          description: 'Подземни гаражи - налични места'
        }
      }
    },
    {
      id: 2,
      title: "Очаквайте скоро нови обекти",
      location: "София",
      status: "Скоро",
      type: "Нови проекти",
      year: "2024",
      description: "Работим върху нови атрактивни проекти за продажба. Следете за обновления.",
      images: [property1Image1],
      features: ["Нови проекти", "Атрактивни локации", "Модерни решения"],
      price: "Скоро",
      apartments: "Различни типове",
      totalFloors: "Различни"
    }
  ]

  // Filter properties
  const filteredProperties = selectedFilter === 'all' 
    ? properties 
    : properties.filter(property => property.status === selectedFilter)

  // Property filters
  const filters = [
    { id: 'all', name: 'Всички имоти', count: properties.length },
    { id: 'За продажба', name: 'За продажба', count: properties.filter(p => p.status === 'За продажба').length },
    { id: 'Скоро', name: 'Скоро в продажба', count: properties.filter(p => p.status === 'Скоро').length }
  ]

  // Modal functions
  const openModal = (property) => {
    setSelectedProject(property)
    setCurrentImageIndex(0)
    // Show building view by default if building data exists
    setShowBuildingView(!!property.buildingData)
    document.body.style.overflow = 'hidden'
  }

  const closeModal = () => {
    setSelectedProject(null)
    setShowBuildingView(false)
    setHoveredFloor(null)
    setSelectedFloor(null)
    document.body.style.overflow = 'unset'
  }

  const toggleBuildingView = () => {
    setShowBuildingView(!showBuildingView)
    setCurrentImageIndex(0)
  }

  const nextImage = () => {
    if (selectedProject) {
      setCurrentImageIndex((prev) => 
        prev === selectedProject.images.length - 1 ? 0 : prev + 1
      )
    }
  }

  const prevImage = () => {
    if (selectedProject) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? selectedProject.images.length - 1 : prev - 1
      )
    }
  }

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (!selectedProject) return
    
    switch (e.key) {
      case 'Escape':
        closeModal()
        break
      case 'ArrowLeft':
        prevImage()
        break
      case 'ArrowRight':
        nextImage()
        break
      default:
        break
    }
  }

  // Add keyboard event listener when modal is open
  useEffect(() => {
    if (selectedProject) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectedProject, currentImageIndex])

  return (
    <>
      <SEO 
        title="Продажби - KSM Stroy"
        description="Открийте нашите атрактивни обекти за продажба - модерни апартаменти и жилищни сгради в престижни райони на София."
        keywords="продажби, апартаменти, имоти, новостроящи се, София"
        ogTitle="Продажби - KSM Stroy"
        ogImage={properties[0]?.images[0]}
      />
      
      <main className="min-h-screen bg-primary-50">

      {/* Hero Section */}
      <section 
        className="py-20 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 text-white relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-t from-gold-900/10 via-transparent to-gold-900/5"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div>
            <span className="text-gold-400 font-semibold text-sm uppercase tracking-wide">Нашите обекти</span>
            <h1 className="text-display-1 font-bold mt-2 mb-6">
              Продажби
            </h1>
            <p className="text-xl text-platinum-300 max-w-3xl mx-auto">
              Открийте нашите атрактивни обекти за продажба - модерни апартаменти и жилищни сгради в престижни райони на София.
            </p>
          </div>
          
          <div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12"
          >
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent mb-2">
                {properties.length}
              </div>
              <p className="text-platinum-300">Общо обекта</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent mb-2">
                {properties.filter(p => p.status === 'За продажба').length}
              </div>
              <p className="text-platinum-300">За продажба</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent mb-2">
                {properties.filter(p => p.status === 'Скоро').length}
              </div>
              <p className="text-platinum-300">Очаквани</p>
            </div>
          </div>
        </div>
      </section>

      {/* Property Filter */}
      <section 
        className="py-12 bg-gradient-to-br from-ivory-50 to-primary-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-4 justify-center">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setSelectedFilter(filter.id)}
                className={`px-6 py-3 rounded-luxury text-sm font-medium transition-all duration-300 ${
                  selectedFilter === filter.id
                    ? 'bg-gradient-to-r from-gold-500 to-gold-600 text-primary-900 shadow-gold-glow scale-105'
                    : 'bg-white text-primary-700 hover:bg-gold-50 hover:text-gold-700 border border-silver-200 hover:border-gold-500/30 shadow-luxury hover:shadow-luxury-lg'
                }`}
              >
                {filter.name}
                <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                  selectedFilter === filter.id
                    ? 'bg-primary-900/20 text-primary-900'
                    : 'bg-gold-100 text-gold-700'
                }`}>
                  {filter.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Properties Grid */}
      <section 
        className="py-20 bg-primary-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredProperties.map((property, index) => (
                <PropertyCard 
                  key={property.id} 
                  property={property} 
                  index={index}
                  onClick={() => openModal(property)}
                />
              ))}
          </div>
          
          {filteredProperties.length === 0 && (
            <div 
              className="text-center py-16"
            >
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-primary-900 mb-2">Няма обекти</h3>
              <p className="text-primary-600">В тази категория все още няма обекти за продажба.</p>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section 
        className="py-16 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 text-white relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-t from-gold-900/10 via-transparent to-gold-900/5"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div>
            <h2 className="text-display-1 font-bold mb-4">
              Търсите нов дом?
            </h2>
            <p className="text-xl mb-8 text-platinum-300">
              Свържете се с нас за консултация и да обсъдим наличните апартаменти и бъдещи проекти
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                className="bg-gradient-to-r from-gold-500 to-gold-600 text-primary-900 px-8 py-4 rounded-luxury font-semibold hover:shadow-gold-glow-lg transition-all duration-200"
              >
                Свържете се с нас
              </button>
              <button 
                className="border-2 border-gold-500/50 text-white px-8 py-4 rounded-luxury font-semibold hover:bg-gold-500 hover:text-primary-900 transition-all duration-200 backdrop-blur-sm"
              >
                Попитайте за цени
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Property Modal */}
      {selectedProject && (
          <div
            ref={modalRef}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm"
            onClick={closeModal}
          >
            <div className="h-full flex flex-col max-h-screen">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 bg-black/50 backdrop-blur-lg border-b border-white/10">
                <div className="flex items-center space-x-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    selectedProject.status === 'За продажба' 
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                      : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  }`}>
                    {selectedProject.status}
                  </span>
                  <div>
                    <h2 className="text-xl font-bold text-white">{selectedProject.title}</h2>
                    <p className="text-gold-400 text-sm">{selectedProject.location} • {selectedProject.year}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  {/* Building View Toggle */}
                  {selectedProject.buildingData && (
                    <button
                      onClick={toggleBuildingView}
                      className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 border ${
                        showBuildingView 
                          ? 'bg-gold-500/20 text-gold-400 border-gold-500/30' 
                          : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                      }`}
                    >
                      <svg className="w-4 h-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {showBuildingView ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        )}
                      </svg>
                      {showBuildingView ? 'Виж снимки' : 'Виж етажи'}
                    </button>
                  )}
                  
                  {/* Image Counter */}
                  {!showBuildingView && selectedProject.images.length > 1 && (
                    <div className="px-3 py-1 bg-white/10 rounded-full text-white text-sm border border-white/20">
                      {currentImageIndex + 1} / {selectedProject.images.length}
                    </div>
                  )}
                  
                  {/* Close Button */}
                  <button
                    onClick={closeModal}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-200 border border-white/20"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Main Content Area */}
              <div className="flex-1 relative flex items-center justify-center p-4 min-h-0" onClick={(e) => e.stopPropagation()}>
                {showBuildingView && selectedProject.buildingData ? (
                  <div className="w-full h-full">
                    <FourTowersFloorMap 
                      onHoverChange={(isHovering, towerId, floor) => {
                        // Always reset all floors first, then set if needed
                        setIsHoveringBFloor1(false);
                        setIsHoveringBFloor2(false);
                        setIsHoveringBFloor3(false);
                        if (isHovering && towerId === 'B') {
                          if (floor === 1) {
                            setIsHoveringBFloor1(true);
                          } else if (floor === 2) {
                            setIsHoveringBFloor2(true);
                          } else if (floor === 3) {
                            setIsHoveringBFloor3(true);
                          }
                        }
                      }}
                      currentImage={
                        isHoveringBFloor1 ? buildingBFloor1Image :
                        isHoveringBFloor2 ? buildingBFloor2Image :
                        isHoveringBFloor3 ? buildingBFloor3Image :
                        buildingImage
                      }
                    />
                  </div>
                ) : (
                  <>
                    <div 
                      className="relative max-w-7xl w-full h-full flex items-center justify-center"
                    >
                      <img
                        src={selectedProject.images[currentImageIndex]}
                        alt={`${selectedProject.title} - Снимка ${currentImageIndex + 1}`}
                        className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                      />
                    </div>
                    
                    {/* Navigation Arrows - Fixed Position */}
                    {selectedProject.images.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="fixed left-8 top-1/2 transform -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm transition-all duration-200 text-white border border-white/20 hover:border-gold-400 z-10"
                        >
                          <svg 
                            className="w-8 h-8" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <button
                          onClick={nextImage}
                          className="fixed right-8 top-1/2 transform -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm transition-all duration-200 text-white border border-white/20 hover:border-gold-400 z-10"
                        >
                          <svg 
                            className="w-8 h-8" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </>
                    )}
                  </>
                )}
              </div>
              
              {/* Thumbnail Gallery */}
              {!showBuildingView && selectedProject.images.length > 1 && (
                <div className="bg-black/50 backdrop-blur-lg border-t border-white/10 p-4">
                  <div className="max-w-7xl mx-auto">
                    <div className="flex space-x-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                      {selectedProject.images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                            index === currentImageIndex 
                              ? 'border-gold-400 shadow-lg shadow-gold-400/20' 
                              : 'border-white/20 hover:border-white/40'
                          }`}
                        >
                          <img
                            src={image}
                            alt={`Миниатюра ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Building Info Panel */}
              {showBuildingView && hoveredFloor && (
                <div className="bg-black/60 backdrop-blur-lg border-t border-white/10 p-4">
                  <div className="max-w-7xl mx-auto">
                    <div className="text-center">
                      <h4 className="text-lg font-semibold text-white mb-2">{hoveredFloor.description}</h4>
                      <div className="flex items-center justify-center space-x-4 text-sm text-gray-300">
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          Етаж {hoveredFloor.floor}
                        </span>
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2z" />
                          </svg>
                          {hoveredFloor.apartments} апартамента
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          hoveredFloor.status === 'available' 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {hoveredFloor.status === 'available' ? 'Налични' : 'Продадени'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
      )}

    </main>
  </>)
}

// Property Card Component
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
      <div className="relative h-56 overflow-hidden">
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
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 backdrop-blur-sm rounded-full text-xs font-medium ${
            property.status === 'За продажба' 
              ? 'bg-green-500/90 text-white' 
              : 'bg-blue-500/90 text-white'
          }`}>
            {property.status}
          </span>
        </div>

        {/* Image Count Indicator */}
        {property.images.length > 1 && (
          <div className="absolute top-4 right-4">
            <span className="px-2 py-1 bg-black/50 backdrop-blur-sm text-white rounded-full text-xs flex items-center">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      <div className="p-6">
        {/* Title */}
        <h3 className="text-xl font-bold text-primary-900 mb-2 group-hover:text-gold-700 transition-colors duration-300 leading-tight">
          {property.title}
        </h3>

        {/* Location and Type */}
        <div className="flex items-center text-sm text-primary-500 mb-3 space-x-2">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

// Simple Building View Component
const BuildingView = ({ buildingData, hoveredFloor, setHoveredFloor, selectedFloor, setSelectedFloor, projectImages }) => {
  const { blockA, blockB, garage } = buildingData
  
  // Combine all floors for easy listing
  const allFloors = [
    ...blockA.floors.map(f => ({ ...f, block: 'А' })),
    ...blockB.floors.map(f => ({ ...f, block: 'Б' }))
  ].sort((a, b) => b.floor - a.floor)

  return (
    <div className="w-full h-full flex bg-gray-900">
      
      {/* Left Sidebar - Floor List */}
      <div className="w-80 bg-black/50 border-r border-white/10 p-6 overflow-y-auto">
        <h3 className="text-xl font-bold text-white mb-4">Изберете етаж</h3>
        
        <div className="space-y-2">
          {allFloors.map((floor) => {
            const isSelected = selectedFloor?.floor === floor.floor && selectedFloor?.block === floor.block
            const isAvailable = floor.status === 'available'
            
            return (
              <button
                key={`${floor.block}-${floor.floor}`}
                className={`w-full p-4 rounded-lg text-left transition-all ${
                  isSelected 
                    ? 'bg-gold-500/20 border-2 border-gold-500' 
                    : 'bg-gray-800 hover:bg-gray-700 border-2 border-transparent'
                }`}
                onClick={() => setSelectedFloor(floor)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-white font-medium">
                      Блок {floor.block} - Етаж {floor.floor}
                    </div>
                    <div className="text-sm text-gray-400">
                      {floor.apartments} апартамента
                    </div>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${
                    isAvailable ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Center - Building Image */}
      <div className="flex-1 p-8">
        <div className="h-full bg-gray-800 rounded-lg overflow-hidden relative">
          <img 
            src={buildingImage}
            alt="Сграда"
            className="w-full h-full object-contain"
          />
          
          {/* Selected Floor Info Overlay */}
          {selectedFloor && (
            <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-6 text-white">
              <h4 className="text-lg font-bold mb-2">
                Блок {selectedFloor.block} - Етаж {selectedFloor.floor}
              </h4>
              <p className="text-sm text-gray-300">{selectedFloor.description}</p>
              <div className="mt-3 flex gap-4">
                <span className={`px-3 py-1 rounded text-sm ${
                  selectedFloor.status === 'available' 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {selectedFloor.status === 'available' ? 'Налични' : 'Продадени'}
                </span>
                <span className="text-sm text-gray-400">
                  {selectedFloor.apartments} апартамента
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Floor Details */}
      {selectedFloor && (
        <div className="w-96 bg-black/50 border-l border-white/10 p-6">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-white">
              Детайли за етажа
            </h3>
            <p className="text-gray-400 mt-1">
              Блок {selectedFloor.block} - Етаж {selectedFloor.floor}
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">Статус</div>
              <div className={`font-semibold ${
                selectedFloor.status === 'available' ? 'text-green-400' : 'text-red-400'
              }`}>
                {selectedFloor.status === 'available' ? 'Налични' : 'Продадени'}
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">Брой апартаменти</div>
              <div className="text-white font-semibold">{selectedFloor.apartments}</div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">Описание</div>
              <div className="text-white text-sm">{selectedFloor.description}</div>
            </div>
            
            {selectedFloor.status === 'available' && (
              <button className="w-full bg-gold-500 hover:bg-gold-600 text-black font-semibold py-3 rounded-lg transition-colors">
                Запитване за цена
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Sales