import React, { useState, useRef, useEffect, useCallback } from 'react'
import SEO from '../components/common/SEO'
import OptimizedImage from '../components/ui/OptimizedImage'
import PropertyCard from '../components/ui/PropertyCard'
import FourTowersFloorMap, { FLOOR_DATA } from '../components/FourTowersFloorMap'
import ApartmentDetailsModal from '../components/ApartmentDetailsModal'
import { seoData } from '../utils/seo'
import { properties, filters } from '../constants/properties'
import { buildingImages, getBuildingImage, getGoldenResidenceImage } from '../constants/buildingImages'
import GoldenResidenceFloorMap from '../components/GoldenResidenceFloorMap'
import { getApartmentImage } from '../constants/apartmentImages'

// Import sales property images
import property1Image1 from '../assets/продажби/project 1/sgrada1.jpg'
import property1Image2 from '../assets/продажби/project 1/sgrada1.jpg'
import goldenResidenceImage from '../assets/продажби/project 2/golden-residence.jpg'
import buildingImage from '../assets/продажби/project 1/sgrada1.jpg'
import buildingBFloor1Image from '../assets/продажби/project 1/building-B-floor-1.jpg'
import buildingBFloor2Image from '../assets/продажби/project 1/building-B-floor-2.jpg'
import buildingBFloor3Image from '../assets/продажби/project 1/building-B-floor-3.jpg'
import buildingBFloor4Image from '../assets/продажби/project 1/building-B-floor-4.jpg'
import buildingBFloor5Image from '../assets/продажби/project 1/building-B-floor-5.jpg'
import buildingBFloor6Image from '../assets/продажби/project 1/building-B-floor-6.jpg'
import buildingBFloor7Image from '../assets/продажби/project 1/building-B-floor-7.jpg'
import buildingBFloor8Image from '../assets/продажби/project 1/building-B-floor-8.jpg'
import buildingBFloor9Image from '../assets/продажби/project 1/building-B-floor-9.jpg'
import buildingAFloor1Image from '../assets/продажби/project 1/building-A-floor-1.jpg'
import buildingAFloor2Image from '../assets/продажби/project 1/building-A-floor-2.jpg'
import buildingAFloor3Image from '../assets/продажби/project 1/building-A-floor-3.jpg'
import buildingAFloor4Image from '../assets/продажби/project 1/building-A-floor-4.jpg'
import buildingAFloor5Image from '../assets/продажби/project 1/building-A-floor-5.jpg'
import buildingAFloor6Image from '../assets/продажби/project 1/building-A-floor-6.jpg'
import buildingAFloor7Image from '../assets/продажби/project 1/building-A-floor-7.jpg'
import buildingAFloor8Image from '../assets/продажби/project 1/building-A-floor-8.jpg'
import buildingAFloor9Image from '../assets/продажби/project 1/building-A-floor-9.jpg'
import buildingAFloor0Image from '../assets/продажби/project 1/building-garages.png'
import buildingBFloor0Image from '../assets/продажби/project 1/building-garages.png'
import garageFloorImage from '../assets/продажби/project 1/garage-floor.jpg'

// Import the apartment images
import apartmentB2Image from '../assets/продажби/project 1/apartment-b2.jpg'
import apartmentB2FloorPlanImage from '../assets/продажби/project 1/apartment-B-floor 1/apartment B2.png'
import apartmentB6FloorPlanImage from '../assets/продажби/project 1/apartment-B-floor 1/apartment B6.png'
import apartmentB7FloorPlanImage from '../assets/продажби/project 1/apartment-B-floor 1/apartment B7.png'
import apartmentB15FloorPlanImage from '../assets/продажби/project 1/apartment-B-floor 1/apartment-207-floor2.png'
import apartmentB23FloorPlanImage from '../assets/продажби/project 1/apartment-B-floor 1/apartment-b23-floor3.png'
import apartmentB31FloorPlanImage from '../assets/продажби/project 1/apartment-B-floor 1/apartment-b31-floor4.png'
import apartmentB47FloorPlanImage from '../assets/продажби/project 1/apartment-B-floor 1/apartment-b47-floor6.png'
import apartmentB50FloorPlanImage from '../assets/продажби/project 1/apartment-B-floor 1/apartment-b50-floor7.png'
import apartmentB55FloorPlanImage from '../assets/продажби/project 1/apartment-B-floor 1/apartment-b55-floor7.png'
import apartmentB57FloorPlanImage from '../assets/продажби/project 1/apartment-B-floor 1/apartment-b57-floor8.png'
import apartmentB59FloorPlanImage from '../assets/продажби/project 1/apartment-B-floor 1/apartment-b59-floor8.png'
import apartmentB63FloorPlanImage from '../assets/продажби/project 1/apartment-B-floor 1/apartment-b63-floor8.png'
import apartmentA2FloorPlanImage from '../assets/продажби/project 1/apartment-A/apartment-a2-floor1.png'
import apartmentA6FloorPlanImage from '../assets/продажби/project 1/apartment-A/apartment-a6-floor1.png'
import apartmentA58FloorPlanImage from '../assets/продажби/project 1/apartment-A/apartment-a58-floor8.png'
import apartmentA64FloorPlanImage from '../assets/продажби/project 1/apartment-A/apartment-a64-floor8.png'

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
  const [isHoveringBFloor4, setIsHoveringBFloor4] = useState(false)
  const [isHoveringBFloor5, setIsHoveringBFloor5] = useState(false)
  const [isHoveringBFloor6, setIsHoveringBFloor6] = useState(false)
  const [isHoveringBFloor7, setIsHoveringBFloor7] = useState(false)
  const [isHoveringBFloor8, setIsHoveringBFloor8] = useState(false)
  const [isHoveringBFloor9, setIsHoveringBFloor9] = useState(false)
  const [isHoveringAFloor1, setIsHoveringAFloor1] = useState(false)
  const [isHoveringAFloor2, setIsHoveringAFloor2] = useState(false)
  const [isHoveringAFloor3, setIsHoveringAFloor3] = useState(false)
  const [isHoveringAFloor4, setIsHoveringAFloor4] = useState(false)
  const [isHoveringAFloor5, setIsHoveringAFloor5] = useState(false)
  const [isHoveringAFloor6, setIsHoveringAFloor6] = useState(false)
  const [isHoveringAFloor7, setIsHoveringAFloor7] = useState(false)
  const [isHoveringAFloor8, setIsHoveringAFloor8] = useState(false)
  const [isHoveringAFloor9, setIsHoveringAFloor9] = useState(false)
  const [isHoveringAFloor0, setIsHoveringAFloor0] = useState(false)
  const [isHoveringBFloor0, setIsHoveringBFloor0] = useState(false)
  const [selectedFloorDetails, setSelectedFloorDetails] = useState(null)
  const [selectedApartment, setSelectedApartment] = useState(null)
  const [showApartmentModal, setShowApartmentModal] = useState(false)
  const [clearFloorSelection, setClearFloorSelection] = useState(false)
  const modalRef = useRef(null)
  const floorDetailsRef = useRef(null)


  // Filter properties
  const filteredProperties = selectedFilter === 'all' 
    ? properties 
    : selectedFilter === 'for-sale' 
      ? properties.filter(property => property.status === 'За продажба')
      : selectedFilter === 'coming-soon'
        ? properties.filter(property => property.status === 'Скоро')
        : properties.filter(property => property.status === selectedFilter)


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
    setSelectedFloorDetails(null)
    document.body.style.overflow = 'unset'
  }

  const handleFloorSelect = (towerId, floorIndex, floorData) => {
    if (floorData?.apartments) {
      setSelectedFloorDetails({
        tower: towerId,
        floor: floorIndex,
        data: floorData
      });
      // Don't close modal - keep it open and show details section below
      // Scroll to details section after a short delay
      setTimeout(() => {
        floorDetailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }

  const handleApartmentSelect = (apartmentData) => {
    setSelectedApartment(apartmentData);
    setShowApartmentModal(true);
  }

  const closeApartmentModal = () => {
    setSelectedApartment(null);
    setShowApartmentModal(false);
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


      {/* Property Filter */}
      <section 
        className="py-6 sm:py-8 lg:py-12 bg-gradient-to-br from-ivory-50 to-primary-50"
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2 sm:gap-3 lg:gap-4 justify-center">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setSelectedFilter(filter.id)}
                className={`px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-luxury text-xs sm:text-sm font-medium transition-all duration-300 ${
                  selectedFilter === filter.id
                    ? 'bg-gradient-to-r from-gold-500 to-gold-600 text-primary-900 shadow-gold-glow scale-105'
                    : 'bg-white text-primary-700 hover:bg-gold-50 hover:text-gold-700 border border-silver-200 hover:border-gold-500/30 shadow-luxury hover:shadow-luxury-lg'
                }`}
              >
                {filter.name}
                <span className={`ml-1 sm:ml-2 px-1 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs ${
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
        className="py-8 sm:py-12 lg:py-20 bg-primary-50"
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8"
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
                      className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 border w-24 h-8 flex items-center justify-center ${
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
                    {/* Mobile Layout for small devices */}
                    <div className="block md:hidden w-full h-full">
                      <MobileProjectView 
                        project={selectedProject}
                        buildingImage={
                          isHoveringAFloor0 ? garageFloorImage :
                          isHoveringAFloor1 ? buildingAFloor1Image :
                          isHoveringAFloor2 ? buildingAFloor2Image :
                          isHoveringAFloor3 ? buildingAFloor3Image :
                          isHoveringAFloor4 ? buildingAFloor4Image :
                          isHoveringAFloor5 ? buildingAFloor5Image :
                          isHoveringAFloor6 ? buildingAFloor6Image :
                          isHoveringAFloor7 ? buildingAFloor7Image :
                          isHoveringAFloor8 ? buildingAFloor8Image :
                          isHoveringAFloor9 ? buildingAFloor9Image :
                          isHoveringBFloor1 ? buildingBFloor1Image :
                          isHoveringBFloor2 ? buildingBFloor2Image :
                          isHoveringBFloor3 ? buildingBFloor3Image :
                          isHoveringBFloor4 ? buildingBFloor4Image :
                          isHoveringBFloor5 ? buildingBFloor5Image :
                          isHoveringBFloor6 ? buildingBFloor6Image :
                          isHoveringBFloor7 ? buildingBFloor7Image :
                          isHoveringBFloor8 ? buildingBFloor8Image :
                          isHoveringBFloor9 ? buildingBFloor9Image :
                          isHoveringBFloor0 ? garageFloorImage :
                          buildingImage
                        }
                        onFloorSelect={handleFloorSelect}
                        onApartmentSelect={handleApartmentSelect}
                        hoveredFloor={hoveredFloor}
                        setHoveredFloor={setHoveredFloor}
                      />
                    </div>
                    
                    {/* Desktop Layout for larger devices */}
                    <div className="hidden md:block w-full h-full">
                      {selectedProject.projectType === 'golden-residence' ? (
                        <GoldenResidenceFloorMap 
                          onHoverChange={(isHovering, floorNumber) => {
                            // Handle hover change if needed
                          }}
                          onFloorSelect={handleFloorSelect}
                        />
                      ) : (
                        <FourTowersFloorMap 
                        clearFloorSelection={clearFloorSelection}
                        onHoverChange={(isHovering, towerId, floor) => {
                          // Always reset all floors first, then set if needed
                          setIsHoveringBFloor1(false);
                          setIsHoveringBFloor2(false);
                          setIsHoveringBFloor3(false);
                          setIsHoveringBFloor4(false);
                          setIsHoveringBFloor5(false);
                          setIsHoveringBFloor6(false);
                          setIsHoveringBFloor7(false);
                          setIsHoveringBFloor8(false);
                          setIsHoveringBFloor9(false);
                          setIsHoveringAFloor1(false);
                          setIsHoveringAFloor2(false);
                          setIsHoveringAFloor3(false);
                          setIsHoveringAFloor4(false);
                          setIsHoveringAFloor5(false);
                          setIsHoveringAFloor6(false);
                          setIsHoveringAFloor7(false);
                          setIsHoveringAFloor8(false);
                          setIsHoveringAFloor9(false);
                          setIsHoveringAFloor0(false);
                          setIsHoveringBFloor0(false);
                          if (isHovering && towerId === 'A') {
                            if (floor === 2) {
                              setIsHoveringAFloor1(true);
                            } else if (floor === 3) {
                              setIsHoveringAFloor2(true);
                            } else if (floor === 4) {
                              setIsHoveringAFloor3(true);
                            } else if (floor === 5) {
                              setIsHoveringAFloor4(true);
                            } else if (floor === 6) {
                              setIsHoveringAFloor5(true);
                            } else if (floor === 7) {
                              setIsHoveringAFloor6(true);
                            } else if (floor === 8) {
                              setIsHoveringAFloor7(true);
                            } else if (floor === 9) {
                              setIsHoveringAFloor8(true);
                            } else if (floor === 10) {
                              setIsHoveringAFloor9(true);
                            } else if (floor === 0) {
                              setIsHoveringAFloor0(true);
                            }
                          } else if (isHovering && towerId === 'B') {
                            if (floor === 2) {
                              setIsHoveringBFloor1(true);
                            } else if (floor === 3) {
                              setIsHoveringBFloor2(true);
                            } else if (floor === 4) {
                              setIsHoveringBFloor3(true);
                            } else if (floor === 5) {
                              setIsHoveringBFloor4(true);
                            } else if (floor === 6) {
                              setIsHoveringBFloor5(true);
                            } else if (floor === 7) {
                              setIsHoveringBFloor6(true);
                            } else if (floor === 8) {
                              setIsHoveringBFloor7(true);
                            } else if (floor === 9) {
                              setIsHoveringBFloor8(true);
                            } else if (floor === 10) {
                              setIsHoveringBFloor9(true);
                            } else if (floor === 0) {
                              setIsHoveringBFloor0(true);
                            }
                          }
                        }}
                        currentImage={
                          isHoveringAFloor0 ? garageFloorImage :
                          isHoveringAFloor1 ? buildingAFloor1Image :
                          isHoveringAFloor2 ? buildingAFloor2Image :
                          isHoveringAFloor3 ? buildingAFloor3Image :
                          isHoveringAFloor4 ? buildingAFloor4Image :
                          isHoveringAFloor5 ? buildingAFloor5Image :
                          isHoveringAFloor6 ? buildingAFloor6Image :
                          isHoveringAFloor7 ? buildingAFloor7Image :
                          isHoveringAFloor8 ? buildingAFloor8Image :
                          isHoveringAFloor9 ? buildingAFloor9Image :
                          isHoveringBFloor1 ? buildingBFloor1Image :
                          isHoveringBFloor2 ? buildingBFloor2Image :
                          isHoveringBFloor3 ? buildingBFloor3Image :
                          isHoveringBFloor4 ? buildingBFloor4Image :
                          isHoveringBFloor5 ? buildingBFloor5Image :
                          isHoveringBFloor6 ? buildingBFloor6Image :
                          isHoveringBFloor7 ? buildingBFloor7Image :
                          isHoveringBFloor8 ? buildingBFloor8Image :
                          isHoveringBFloor9 ? buildingBFloor9Image :
                          isHoveringBFloor0 ? garageFloorImage :
                          buildingImage
                        }
                        onFloorSelect={handleFloorSelect}
                        onApartmentSelect={handleApartmentSelect}
                      />
                      )}
                    </div>
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
              
              {/* Floor Details Section - Replace entire modal content when shown */}
              {selectedFloorDetails && selectedFloorDetails.data?.apartments && (
                <div
                  ref={floorDetailsRef}
                  className="absolute inset-0 bg-white z-50 overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="max-w-7xl mx-auto p-4 sm:p-8">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-6 sm:mb-8 pb-4 border-b border-gray-200">
                      <div className="flex-1 mr-4">
                        {selectedFloorDetails.floor === 0 ? (
                          <>
                            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                              Блок А и Б – Надземни и Подземни Гаражи
                            </h2>
                            <p className="text-sm sm:text-base lg:text-lg text-gray-600">КОТА +0.00</p>
                          </>
                        ) : (
                          <>
                            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                              Блок {selectedFloorDetails.tower} - {selectedFloorDetails.floor === 10 ? 'Тавански Етаж' : `Етаж ${selectedFloorDetails.floor}`}
                            </h2>
                            <p className="text-sm sm:text-base lg:text-lg text-gray-600">Детайлна информация за апартаментите на етажа</p>
                          </>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          setSelectedFloorDetails(null);
                          // Clear the floor selection to go back to building view
                          setClearFloorSelection(true);
                          // Reset the clear flag after a short delay
                          setTimeout(() => setClearFloorSelection(false), 100);
                        }}
                        className="p-2 sm:p-3 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-black rounded-full transition-all duration-300 flex-shrink-0 shadow-lg hover:shadow-xl group"
                        aria-label="Затвори детайли"
                      >
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                    </div>
                    
                    {selectedFloorDetails.floor === 0 ? (
                      // Garage Floor Layout
                      <div className="w-full">
                        {/* Architecture Plan - Full Width and Bigger */}
                        <div className="w-full">
                          <div className="bg-white rounded-lg overflow-hidden shadow-lg">
                            {selectedFloorDetails.data.planImage ? (
                              <div className="bg-gray-50">
                                <img 
                                  src={selectedFloorDetails.data.planImage}
                                  alt="План на гаражите - Блок А и Б"
                                  className="w-full h-auto object-contain"
                                  style={{ maxHeight: '800px' }}
                                />
                              </div>
                            ) : (
                              <div className="h-64 flex items-center justify-center bg-gray-100">
                                <div className="text-center">
                                  <svg className="w-16 h-16 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  <p className="text-sm font-medium text-gray-600">План на гаражите</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      // Regular Floor Layout
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                        {/* Left Side - Apartments Table with Bulgarian Headers */}
                        <div className="lg:col-span-1 order-2 lg:order-1">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-0">Списък на апартаментите</h3>
                            <p className="text-xs sm:text-sm text-gray-600">
                              <span className="hidden sm:inline">Кликнете за детайли</span>
                              <span className="sm:hidden">Скролирайте и кликнете</span>
                            </p>
                          </div>
                          <div className="bg-white rounded-lg overflow-hidden shadow-lg relative">
                            {/* Scroll indicator for mobile */}
                            <div className="absolute top-2 right-2 z-20 sm:hidden">
                              <div className="bg-blue-500/80 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                                ↕ Scroll
                              </div>
                            </div>
                            
                            <div className="overflow-x-auto overflow-y-auto max-h-96 relative" style={{
                              scrollbarWidth: 'thin',
                              scrollbarColor: '#CBD5E0 #F7FAFC',
                              WebkitOverflowScrolling: 'touch' // Smooth scrolling on iOS
                            }}>
                              <table className="w-full text-xs lg:text-sm min-w-full">
                                <thead className="bg-gray-100 sticky top-0 z-10">
                                  <tr>
                                    <th className="px-2 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300 whitespace-nowrap">Имот</th>
                                    <th className="px-2 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300 whitespace-nowrap">Вид</th>
                                    <th className="px-2 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300 whitespace-nowrap">Обща площ</th>
                                    <th className="px-2 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300 whitespace-nowrap">Изложение</th>
                                    <th className="px-2 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">Статус</th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                {selectedFloorDetails.data.apartments.map((apt, idx) => (
                                  <tr 
                                    key={idx} 
                                    className={`transition-colors ${
                                      (apt.статус === 'Свободен' || apt.статус === 'Скоро')
                                        ? 'hover:bg-blue-50 cursor-pointer group active:bg-blue-100' 
                                        : 'cursor-not-allowed opacity-75'
                                    }`}
                                    style={{ minHeight: '48px' }} // Touch-friendly height
                                    onClick={(apt.статус === 'Свободен' || apt.статус === 'Скоро') ? () => handleApartmentSelect({
                                      name: apt.имот === 'Б-307' ? 'Апартамент Б23' : 
                                            apt.имот === 'Б-106' ? 'Апартамент Б6' : 
                                            apt.имот === 'Б-107' ? 'Апартамент Б7' : 
                                            apt.имот === 'Б-207' ? 'Апартамент Б15' : 
                                            apt.имот === 'Б-407' ? 'Апартамент Б31' : 
                                            apt.имот === 'Б-607' ? 'Апартамент Б47' : 
                                            apt.имот === 'Б-702' ? 'Апартамент Б50' : 
                                            apt.имот === 'Б-707' ? 'Апартамент Б55' : 
                                            apt.имот === 'Б-801' ? 'Апартамент Б57' : 
                                            apt.имот === 'Б-803' ? 'Апартамент Б59' : 
                                            apt.имот === 'Б-807' ? 'Апартамент Б63' : 
                                            apt.имот === 'А-102' ? 'Апартамент А2' : 
                                            apt.имот === 'А-106' ? 'Апартамент А6' : 
                                            `Апартамент ${apt.имот}`,
                                      floor: selectedFloorDetails.floor.toString(),
                                      type: apt.вид === '2-стаен' ? 'Двустаен' : apt.вид === '3-стаен' ? 'Тристаен' : apt.вид === '4-стаен' ? 'Четиристаен' : apt.вид === '1-стаен' ? 'Едностаен' : apt.вид,
                                      totalArea: apt.общаПлощ,
                                      status: apt.статус,
                                      ...apt
                                    }) : undefined}
                                  >
                                    <td className="px-2 py-2 whitespace-nowrap font-medium text-gray-900 border-r border-gray-200 relative">
                                      <div className="flex items-center">
                                        {apt.имот}
                                        {(apt.статус === 'Свободен' || apt.статус === 'Скоро') && (
                                          <svg className="w-4 h-4 ml-2 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                          </svg>
                                        )}
                                      </div>
                                    </td>
                                    <td className="px-2 py-2 whitespace-nowrap text-gray-700 border-r border-gray-200">
                                      {apt.вид}
                                    </td>
                                    <td className="px-2 py-2 whitespace-nowrap text-gray-700 border-r border-gray-200">
                                      {apt.общаПлощ}
                                    </td>
                                    <td className="px-2 py-2 whitespace-nowrap text-gray-700 border-r border-gray-200">
                                      {apt.изложение}
                                    </td>
                                    <td className="px-2 py-2 whitespace-nowrap">
                                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${
                                        apt.статус === 'Свободен' ? 'bg-green-100 text-green-700' :
                                        apt.статус === 'Продаден' ? 'bg-red-100 text-red-700' :
                                        apt.статус === 'Скоро' ? 'bg-blue-100 text-blue-700' :
                                        'bg-yellow-100 text-yellow-700'
                                      }`}>
                                        {apt.статус}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                          
                          {/* Summary Stats */}
                          <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
                            {(() => {
                              const available = selectedFloorDetails.data.apartments.filter(a => a.статус === 'Свободен').length;
                              const sold = selectedFloorDetails.data.apartments.filter(a => a.статус === 'Продаден').length;
                              const reserved = selectedFloorDetails.data.apartments.filter(a => a.статус === 'Резервиран').length;
                              const comingSoon = selectedFloorDetails.data.apartments.filter(a => a.статус === 'Скоро').length;
                              
                              return (
                                <>
                                  {comingSoon > 0 ? (
                                    <>
                                      <div className="bg-blue-100 border border-blue-300 rounded-lg p-2 sm:p-3 text-center">
                                        <div className="text-lg sm:text-xl font-bold text-blue-800">{comingSoon}</div>
                                        <div className="text-xs text-blue-600">Скоро</div>
                                      </div>
                                      <div className="bg-gray-100 border border-gray-300 rounded-lg p-2 sm:p-3 text-center">
                                        <div className="text-lg sm:text-xl font-bold text-gray-800">{selectedFloorDetails.data.apartments.length}</div>
                                        <div className="text-xs text-gray-600">Общо</div>
                                      </div>
                                      <div className="bg-gold-100 border border-gold-300 rounded-lg p-2 sm:p-3 text-center">
                                        <div className="text-lg sm:text-xl font-bold text-gold-800">2024</div>
                                        <div className="text-xs text-gold-600">Година</div>
                                      </div>
                                    </>
                                  ) : (
                                    <>
                                      <div className="bg-green-100 border border-green-300 rounded-lg p-2 sm:p-3 text-center">
                                        <div className="text-lg sm:text-xl font-bold text-green-800">{available}</div>
                                        <div className="text-xs text-green-600">Свободни</div>
                                      </div>
                                      <div className="bg-red-100 border border-red-300 rounded-lg p-2 sm:p-3 text-center">
                                        <div className="text-lg sm:text-xl font-bold text-red-800">{sold}</div>
                                        <div className="text-xs text-red-600">Продадени</div>
                                      </div>
                                      <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-2 sm:p-3 text-center">
                                        <div className="text-lg sm:text-xl font-bold text-yellow-800">{reserved}</div>
                                        <div className="text-xs text-yellow-600">Резервирани</div>
                                      </div>
                                    </>
                                  )}
                                </>
                              );
                            })()}
                          </div>
                        </div>
                        
                        {/* Right Side - Architecture Plan */}
                        <div className="lg:col-span-1 order-1 lg:order-2">
                          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Архитектурен план на етажа</h3>
                          <div className="bg-white rounded-lg overflow-hidden shadow-lg">
                            {selectedFloorDetails.data.planImage ? (
                              <div className="bg-gray-50">
                                <img 
                                  src={selectedFloorDetails.data.planImage}
                                  alt={`План на Блок ${selectedFloorDetails.tower} - Етаж ${selectedFloorDetails.floor}`}
                                  className="w-full h-auto object-contain"
                                  style={{ maxHeight: '300px' }}
                                />
                              </div>
                            ) : (
                              <div className="h-48 sm:h-64 flex items-center justify-center bg-gray-100">
                                <div className="text-center">
                                  <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  <p className="text-xs sm:text-sm font-medium text-gray-600">План Етаж {selectedFloorDetails.floor}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
      )}

      {/* OLD Floor Details Section - Remove this */}
      {false && selectedFloorDetails && selectedFloorDetails.data?.apartments && (
        <section
          ref={floorDetailsRef}
          className="py-16 bg-white border-t border-gray-200 animate-in slide-in-from-bottom-4 duration-500"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div className="text-center w-full">
                <h2 className="text-3xl font-bold text-gray-900">
                  Блок {selectedFloorDetails.tower} - Етаж {selectedFloorDetails.floor}
                </h2>
                <p className="text-lg text-gray-600 mt-2">Детайлна информация за апартаментите на етажа</p>
              </div>
              <button
                onClick={() => setSelectedFloorDetails(null)}
                className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors ml-4"
                aria-label="Затвори детайли"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Side - Apartments Table with Bulgarian Headers */}
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Списък на апартаментите</h3>
                <div className="bg-gray-50 rounded-lg overflow-hidden shadow-lg">
                  <table className="w-full">
                    <thead className="bg-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300">Имот</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300">Вид</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300">Обща площ</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300">Изложение</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Статус</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedFloorDetails.data.apartments.map((apt, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-200">
                            {apt.имот}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 border-r border-gray-200">
                            {apt.вид}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 border-r border-gray-200">
                            {apt.общаПлощ}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 border-r border-gray-200">
                            {apt.изложение}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${
                              apt.статус === 'Свободен' ? 'bg-green-100 text-green-700' :
                              apt.статус === 'Продаден' ? 'bg-red-100 text-red-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {apt.статус}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Summary Stats */}
                <div className="mt-6 grid grid-cols-3 gap-4">
                  {(() => {
                    const available = selectedFloorDetails.data.apartments.filter(a => a.статус === 'Свободен').length;
                    const sold = selectedFloorDetails.data.apartments.filter(a => a.статус === 'Продаден').length;
                    const reserved = selectedFloorDetails.data.apartments.filter(a => a.статус === 'Резервиран').length;
                    
                    return (
                      <>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                          <div className="text-2xl font-bold text-green-700">{available}</div>
                          <div className="text-sm text-green-600">Свободни</div>
                        </div>
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                          <div className="text-2xl font-bold text-red-700">{sold}</div>
                          <div className="text-sm text-red-600">Продадени</div>
                        </div>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                          <div className="text-2xl font-bold text-yellow-700">{reserved}</div>
                          <div className="text-sm text-yellow-600">Резервирани</div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
              
              {/* Right Side - Architecture Plan */}
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Архитектурен план на етажа</h3>
                <div className="bg-gray-100 rounded-lg overflow-hidden shadow-lg">
                  {selectedFloorDetails.data.planImage ? (
                    <img 
                      src={selectedFloorDetails.data.planImage}
                      alt={`План на Блок ${selectedFloorDetails.tower} - Етаж ${selectedFloorDetails.floor}`}
                      className="w-full h-auto"
                    />
                  ) : (
                    <div className="h-96 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                      <div className="text-center">
                        <svg className="w-20 h-20 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-lg font-medium text-gray-600">Архитектурен план</p>
                        <p className="text-sm text-gray-500 mt-2">Етаж {selectedFloorDetails.floor}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Забележка:</strong> Планът показва разположението на всички апартаменти на етажа. 
                    Зелените маркери означават свободни апартаменти, червените - продадени.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Apartment Details Modal */}
      <ApartmentDetailsModal
        isOpen={showApartmentModal}
        onClose={closeApartmentModal}
        apartmentData={selectedApartment}
        apartmentImage={selectedApartment ? getApartmentImage(selectedApartment.имот) : null}
      />

    </main>
  </>
  )
}

// Property Card Component

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

// Creative Mobile Project View - Interactive Building Explorer
const MobileProjectView = ({ project, buildingImage, onFloorSelect, onApartmentSelect, hoveredFloor, setHoveredFloor }) => {
  const [viewMode, setViewMode] = useState('explore') // 'explore', 'floors', 'apartments'
  const [selectedBlock, setSelectedBlock] = useState('А')
  const [selectedFloor, setSelectedFloor] = useState(null)
  const [showControls, setShowControls] = useState(true)
  const [pulseFloors, setPulseFloors] = useState(true)
  
  // Safety checks
  if (!project?.buildingData) {
    console.error('MobileProjectView: No project or buildingData');
    return null;
  }
  
  if (!FLOOR_DATA) {
    console.error('MobileProjectView: FLOOR_DATA not available');
    return null;
  }
  
  const { blockA, blockB } = project.buildingData
  
  // Get floors for selected block
  const currentFloors = selectedBlock === 'А' ? blockA.floors : blockB.floors
  
  // Debug logging for component initialization
  console.log('MobileProjectView initialized with:', {
    selectedBlock,
    projectBlocks: { blockA: blockA?.floors?.length, blockB: blockB?.floors?.length },
    floorDataKeys: Object.keys(FLOOR_DATA),
    currentFloorsCount: currentFloors?.length
  });
  
  // Auto-hide controls after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowControls(false), 3000)
    return () => clearTimeout(timer)
  }, [viewMode])
  
  // Stop pulsing after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => setPulseFloors(false), 5000)
    return () => clearTimeout(timer)
  }, [])
  
  const handleFloorClick = (floor) => {
    setSelectedFloor(floor)
    
    // Debug logging
    console.log('handleFloorClick called with:', { selectedBlock, floor: floor.floor });
    console.log('FLOOR_DATA:', FLOOR_DATA);
    console.log('FLOOR_DATA[selectedBlock]:', FLOOR_DATA?.[selectedBlock]);
    
    // Get the actual floor data from FLOOR_DATA with apartments
    if (!FLOOR_DATA) {
      console.error('FLOOR_DATA is not available');
      return;
    }
    
    // Convert Cyrillic block names to Latin for FLOOR_DATA lookup
    const blockKey = selectedBlock === 'А' ? 'A' : selectedBlock === 'Б' ? 'B' : selectedBlock;
    console.log('Converting block name:', selectedBlock, 'to', blockKey);
    
    const blockData = FLOOR_DATA[blockKey];
    if (!blockData) {
      console.error('No block data found for:', blockKey, 'Available blocks:', Object.keys(FLOOR_DATA));
      return;
    }
    
    const floorData = blockData[floor.floor];
    if (floorData && floorData.apartments) {
      console.log('Floor data found:', floorData); // Debug log
      // Call the parent's floor select function which will show the apartment details
      onFloorSelect(blockKey, floor.floor, floorData)
    } else {
      console.log('No floor data found for block', selectedBlock, 'floor', floor.floor); // Debug log
      console.log('Available floors in block:', blockData ? Object.keys(blockData) : 'none');
    }
    // Don't change view mode - let the parent component handle the apartment view
  }
  
  return (
    <div className="w-full h-full relative bg-gradient-to-br from-gray-900 via-gray-800 to-black overflow-hidden">
      {/* Main Building Image with Parallax Effect */}
      <div className="absolute inset-0">
        <img 
          src={buildingImage}
          alt="Building View"
          className="w-full h-full object-cover scale-110 transition-transform duration-1000"
          style={{
            filter: 'brightness(0.8) contrast(1.1)',
            transform: viewMode === 'explore' ? 'scale(1.1)' : 'scale(1.05)'
          }}
        />
        
        {/* Gradient Overlays for Depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold-500/5 to-transparent"></div>
      </div>
      
      {/* Interactive Floor Hotspots */}
      {viewMode === 'explore' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {/* Block A Hotspots */}
          <div className="absolute left-1/4 top-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
            <div className="relative">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Block A clicked'); // Debug log
                  setSelectedBlock('А'); 
                  setViewMode('floors');
                }}
                className={`w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 shadow-2xl flex items-center justify-center text-white font-bold text-lg transform transition-all duration-300 hover:scale-110 z-10 relative ${
                  pulseFloors ? 'animate-pulse' : ''
                }`}
              >
                А
              </button>
              <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-gray-800 whitespace-nowrap pointer-events-none">
                Блок А
              </div>
              {/* Ripple Effect */}
              <div className="absolute inset-0 rounded-full border-4 border-blue-400/30 animate-ping pointer-events-none"></div>
            </div>
          </div>
          
          {/* Block B Hotspots */}
          <div className="absolute right-1/4 top-1/2 transform translate-x-1/2 -translate-y-1/2 pointer-events-auto">
            <div className="relative">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Block B clicked'); // Debug log
                  setSelectedBlock('Б'); 
                  setViewMode('floors');
                }}
                className={`w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 shadow-2xl flex items-center justify-center text-white font-bold text-lg transform transition-all duration-300 hover:scale-110 z-10 relative ${
                  pulseFloors ? 'animate-pulse' : ''
                }`}
              >
                Б
              </button>
              <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-gray-800 whitespace-nowrap pointer-events-none">
                Блок Б
              </div>
              {/* Ripple Effect */}
              <div className="absolute inset-0 rounded-full border-4 border-purple-400/30 animate-ping pointer-events-none"></div>
            </div>
          </div>
          
          {/* Garage Hotspot */}
          {project.buildingData.garage?.available && (
            <div className="absolute bottom-1/4 left-1/2 transform -translate-x-1/2 translate-y-1/2 pointer-events-auto">
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Garage clicked'); // Debug log
                    console.log('FLOOR_DATA available:', !!FLOOR_DATA);
                    
                    if (!FLOOR_DATA) {
                      console.error('FLOOR_DATA not available for garage');
                      return;
                    }
                    
                    // Get garage data from FLOOR_DATA (floor 0 from either block A or B should work)
                    const garageDataA = FLOOR_DATA['A']?.[0];
                    const garageDataB = FLOOR_DATA['B']?.[0];
                    const garageData = garageDataA || garageDataB;
                    
                    console.log('Garage data A:', garageDataA);
                    console.log('Garage data B:', garageDataB);
                    
                    if (garageData && garageData.apartments) {
                      console.log('Using garage data:', garageData);
                      onFloorSelect('A', 0, garageData);
                    } else {
                      console.log('No valid garage data found');
                    }
                  }}
                  className={`w-16 h-16 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 shadow-2xl flex items-center justify-center text-white transform transition-all duration-300 hover:scale-110 z-10 relative ${
                    pulseFloors ? 'animate-pulse' : ''
                  }`}
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </button>
                <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-semibold text-gray-800 pointer-events-none">
                  Гаражи
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Floating Floor Selector */}
      {viewMode === 'floors' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-black/70 backdrop-blur-xl rounded-3xl p-6 max-w-sm w-full mx-4 transform animate-in slide-in-from-bottom-5 duration-500">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">Блок {selectedBlock}</h3>
              <p className="text-gold-400">Изберете етаж</p>
            </div>
            
            <div className="grid grid-cols-3 gap-3 max-h-80 overflow-y-auto">
              {currentFloors.sort((a, b) => b.floor - a.floor).map((floor, index) => (
                <button
                  key={floor.floor}
                  onClick={() => handleFloorClick(floor)}
                  className={`relative group p-4 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
                    floor.status === 'available'
                      ? 'border-green-400/50 bg-green-500/20 hover:bg-green-500/30'
                      : 'border-red-400/50 bg-red-500/20 opacity-60'
                  }`}
                  style={{
                    animationDelay: `${index * 100}ms`
                  }}
                >
                  <div className="text-white font-bold text-lg">{floor.floor}</div>
                  <div className="text-xs text-gray-300">{floor.apartments} ап.</div>
                  
                  {/* Status Indicator */}
                  <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                    floor.status === 'available' ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  
                  {/* Hover Effect */}
                  <div className="absolute inset-0 rounded-2xl bg-white/0 group-hover:bg-white/10 transition-all duration-300"></div>
                </button>
              ))}
            </div>
            
            <button
              onClick={() => setViewMode('explore')}
              className="w-full mt-6 py-3 bg-gold-500 hover:bg-gold-600 text-black font-semibold rounded-xl transition-all duration-300 flex items-center justify-center group shadow-lg hover:shadow-xl"
            >
              <svg className="w-5 h-5 mr-2 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Назад към сградата
            </button>
          </div>
        </div>
      )}
      
      {/* Floating UI Controls */}
      <div className={`absolute top-4 left-4 right-4 transition-opacity duration-300 ${
        showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}>
        <div className="bg-black/70 backdrop-blur-xl rounded-2xl p-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-white font-bold text-lg">{project.title}</h3>
              <p className="text-gold-400 text-sm">{project.location}</p>
            </div>
            <button
              onClick={() => setShowControls(!showControls)}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Tap to Show Controls Hint */}
      {!showControls && viewMode === 'explore' && (
        <div 
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          onClick={() => setShowControls(true)}
        >
          <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm animate-bounce pointer-events-auto">
            Докоснете за контроли
          </div>
        </div>
      )}
      
      {/* Bottom Action Bar */}
      <div className="absolute bottom-4 left-4 right-4">
        {viewMode === 'explore' && (
          <div className="bg-black/70 backdrop-blur-xl rounded-2xl p-4">
            <div className="text-center text-white">
              <div className="text-sm opacity-80 mb-2">Изберете блок за разглеждане</div>
              <div className="flex justify-center space-x-4">
                <div className="flex items-center text-xs">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                  Налични
                </div>
                <div className="flex items-center text-xs">
                  <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                  Продадени
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Subtle Particle Effect */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-gold-400/30 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>
    </div>
  )
}

export default Sales