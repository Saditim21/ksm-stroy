import { useState, useEffect, useRef } from 'react'
import buildingImage from '../../assets/images/002.jpg'

const BuildingFloorPlan = () => {
  const [hoveredFloor, setHoveredFloor] = useState(null)
  const [selectedFloor, setSelectedFloor] = useState(null)
  const detailsPanelRef = useRef(null)

  // Mock data for floors and apartments - Garage (0) + Floors 1-6 = 7 total levels
  const floorsData = {
    6: {
      name: 'Етаж 6',
      apartments: [
        {
          id: '6A',
          property: 'Апартамент 6A',
          type: 'Тристаен',
          builtArea: '85 м²',
          totalArea: '95 м²',
          exposure: 'Изток/Запад',
          status: 'Резервиран'
        },
        {
          id: '6B',
          property: 'Апартамент 6B',
          type: 'Двустаен',
          builtArea: '65 м²',
          totalArea: '75 м²',
          exposure: 'Север/Изток',
          status: 'Резервиран'
        }
      ],
      planImage: '/src/assets/images/001.jpg',
      overlayPosition: { top: '8%', height: '12%' }
    },
    5: {
      name: 'Етаж 5',
      apartments: [
        {
          id: '5A',
          property: 'Апартамент 5A',
          type: 'Тристаен',
          builtArea: '88 м²',
          totalArea: '98 м²',
          exposure: 'Юг/Запад',
          status: 'Свободен'
        },
        {
          id: '5B',
          property: 'Апартамент 5B',
          type: 'Двустаен',
          builtArea: '70 м²',
          totalArea: '80 м²',
          exposure: 'Север/Изток',
          status: 'Свободен'
        }
      ],
      planImage: '/src/assets/images/003.jpg',
      overlayPosition: { top: '24%', height: '12%' }
    },
    4: {
      name: 'Етаж 4',
      apartments: [
        {
          id: '4A',
          property: 'Апартамент 4A',
          type: 'Двустаен',
          builtArea: '70 м²',
          totalArea: '80 м²',
          exposure: 'Изток/Запад',
          status: 'Продаден'
        },
        {
          id: '4B',
          property: 'Апартамент 4B',
          type: 'Тристаен',
          builtArea: '88 м²',
          totalArea: '98 м²',
          exposure: 'Север/Изток',
          status: 'Свободен'
        }
      ],
      planImage: '/src/assets/images/003.jpg',
      overlayPosition: { top: '36%', height: '12%' }
    },
    3: {
      name: 'Етаж 3',
      apartments: [
        {
          id: '3A',
          property: 'Апартамент 3A',
          type: 'Четиристаен',
          builtArea: '110 м²',
          totalArea: '125 м²',
          exposure: 'Юг/Изток',
          status: 'Свободен'
        },
        {
          id: '3B',
          property: 'Апартамент 3B',
          type: 'Двустаен',
          builtArea: '62 м²',
          totalArea: '72 м²',
          exposure: 'Запад',
          status: 'Резервиран'
        },
        {
          id: '3C',
          property: 'Апартамент 3C',
          type: 'Тристаен',
          builtArea: '92 м²',
          totalArea: '102 м²',
          exposure: 'Север/Запад',
          status: 'Свободен'
        }
      ],
      planImage: '/src/assets/images/slider01.jpg',
      overlayPosition: { top: '48%', height: '12%' }
    },
    2: {
      name: 'Етаж 2',
      apartments: [
        {
          id: '2A',
          property: 'Апартамент 2A',
          type: 'Тристаен',
          builtArea: '85 м²',
          totalArea: '95 м²',
          exposure: 'Юг/Изток',
          status: 'Продаден'
        },
        {
          id: '2B',
          property: 'Апартамент 2B',
          type: 'Двустаен',
          builtArea: '68 м²',
          totalArea: '78 м²',
          exposure: 'Север',
          status: 'Свободен'
        }
      ],
      planImage: '/src/assets/images/001.jpg',
      overlayPosition: { top: '60%', height: '12%' }
    },
    1: {
      name: 'Етаж 1',
      apartments: [
        {
          id: '1A',
          property: 'Апартамент 1A',
          type: 'Двустаен',
          builtArea: '72 м²',
          totalArea: '85 м²',
          exposure: 'Юг/Запад',
          status: 'Свободен'
        },
        {
          id: '1B',
          property: 'Апартамент 1B',
          type: 'Тристаен',
          builtArea: '95 м²',
          totalArea: '110 м²',
          exposure: 'Изток/Юг',
          status: 'Резервиран'
        },
        {
          id: '1C',
          property: 'Апартамент 1C',
          type: 'Едностаен',
          builtArea: '45 м²',
          totalArea: '52 м²',
          exposure: 'Север',
          status: 'Свободен'
        }
      ],
      planImage: '/src/assets/images/002.jpg',
      overlayPosition: { top: '72%', height: '12%' }
    },
    0: {
      name: 'Партер (Гаражи)',
      apartments: [
        {
          id: 'G1',
          property: 'Гараж 1',
          type: 'Гаражно място',
          builtArea: '15 м²',
          totalArea: '15 м²',
          exposure: 'Н/П',
          status: 'Свободен'
        },
        {
          id: 'G2',
          property: 'Гараж 2',
          type: 'Гаражно място',
          builtArea: '18 м²',
          totalArea: '18 м²',
          exposure: 'Н/П',
          status: 'Продаден'
        },
        {
          id: 'G3',
          property: 'Гараж 3',
          type: 'Гаражно място',
          builtArea: '16 м²',
          totalArea: '16 м²',
          exposure: 'Н/П',
          status: 'Свободен'
        }
      ],
      planImage: '/src/assets/images/003.jpg',
      overlayPosition: { top: '84%', height: '12%' }
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Свободен':
        return 'text-green-600 bg-green-100'
      case 'Резервиран':
        return 'text-yellow-600 bg-yellow-100'
      case 'Продаден':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const handleFloorClick = (floorNumber) => {
    setSelectedFloor(floorNumber === selectedFloor ? null : floorNumber)
  }

  // Scroll to details panel when a floor is selected
  useEffect(() => {
    if (selectedFloor !== null && detailsPanelRef.current) {
      // Small delay to ensure the panel has rendered
      setTimeout(() => {
        detailsPanelRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest'
        })
      }, 100)
    }
  }, [selectedFloor])

  return (
    <div className="w-full px-2 sm:px-4 lg:px-6">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-primary-900 mb-4">
          Интерактивен план на сградата
        </h2>
        <p className="text-primary-600 max-w-2xl mx-auto">
          Изберете етаж от списъка вляво, за да видите подробна информация за всички налични апартаменти
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[700px]">
        
        {/* Left Panel - Floor List */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-luxury-lg shadow-luxury border border-silver-200 p-6 sticky top-8">
            <h3 className="text-xl font-semibold text-primary-900 mb-6 flex items-center">
              <svg className="w-6 h-6 text-gold-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Етажи
            </h3>
            
            <div className="space-y-3">
              {Object.keys(floorsData).sort((a, b) => b - a).map((floorNumber) => {
                const floor = floorsData[floorNumber]
                const isHovered = hoveredFloor === parseInt(floorNumber)
                const isSelected = selectedFloor === parseInt(floorNumber)
                
                return (
                  <button
                    key={floorNumber}
                    className={`w-full text-left p-4 rounded-luxury border-2 transition-all duration-300 transform hover:scale-105 ${
                      isSelected 
                        ? 'border-gold-500 bg-gradient-to-r from-gold-50 to-gold-100 shadow-gold-glow' 
                        : isHovered 
                          ? 'border-gold-300 bg-gold-50 shadow-luxury-lg'
                          : 'border-silver-200 hover:border-gold-500/30 hover:bg-gold-50/50 shadow-luxury hover:shadow-luxury-lg'
                    }`}
                    onMouseEnter={() => setHoveredFloor(parseInt(floorNumber))}
                    onMouseLeave={() => setHoveredFloor(null)}
                    onClick={() => handleFloorClick(parseInt(floorNumber))}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className={`font-semibold ${isSelected ? 'text-gold-800' : 'text-primary-900'}`}>
                          {floor.name}
                        </h4>
                        <p className={`text-sm ${isSelected ? 'text-gold-600' : 'text-primary-600'}`}>
                          {floor.apartments.length} апартамента
                        </p>
                      </div>
                      <svg 
                        className={`w-5 h-5 transition-transform duration-300 ${
                          isSelected ? 'rotate-90 text-gold-600' : 'text-primary-400'
                        }`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Center Panel - Building Image */}
        <div className={`transition-all duration-500 ${selectedFloor ? 'lg:col-span-5' : 'lg:col-span-9'}`}>
          <div className="relative bg-white rounded-luxury-lg shadow-luxury border border-silver-200 overflow-hidden">
            {/* Building Image */}
            <div className="relative aspect-[4/5]">
              <img 
                src={buildingImage} 
                alt="KSM Stroy Building - Floor Plan View" 
                className="w-full h-full object-contain"
              />

              {/* Precise Floor Overlays */}
              {[6, 5, 4, 3, 2, 1, 0].map((floorNum) => {
                const isHovered = hoveredFloor === floorNum
                const isSelected = selectedFloor === floorNum
                
                // Precise positions for each floor (garage = 0, floors 1-6)
                const positions = {
                  6: { top: '12%', height: '11%', left: '22%', width: '56%' }, // Top floor
                  5: { top: '24%', height: '11%', left: '22%', width: '56%' },
                  4: { top: '36%', height: '11%', left: '22%', width: '56%' },
                  3: { top: '48%', height: '11%', left: '22%', width: '56%' },
                  2: { top: '60%', height: '11%', left: '22%', width: '56%' },
                  1: { top: '72%', height: '11%', left: '22%', width: '56%' },
                  0: { top: '84%', height: '12%', left: '18%', width: '64%' }  // Garage (wider)
                }
                
                const position = positions[floorNum]
                
                // Get availability status for color coding
                const getFloorStatus = (floor) => {
                  if (floor === 0) return 'garage'      // Garage
                  if (floor === 4) return 'sold'        // Floor 4 sold
                  if (floor === 2 || floor === 6) return 'partial'  // Floors 2,6 partial
                  return 'available'                     // Floors 1,3,5 available
                }
                
                const status = getFloorStatus(floorNum)
                
                const getHighlightColor = () => {
                  switch (status) {
                    case 'garage': return 'rgba(156, 163, 175, 0.6)' // Gray
                    case 'available': return 'rgba(34, 197, 94, 0.6)' // Green
                    case 'partial': return 'rgba(255, 215, 0, 0.6)' // Gold
                    case 'sold': return 'rgba(239, 68, 68, 0.6)' // Red
                    default: return 'rgba(255, 215, 0, 0.6)'
                  }
                }
                
                return (
                  <div
                    key={`overlay-${floorNum}`}
                    className="absolute cursor-pointer transition-all duration-300 ease-in-out"
                    style={{
                      top: position.top,
                      left: position.left,
                      width: position.width,
                      height: position.height,
                      backgroundColor: isHovered || isSelected ? getHighlightColor() : 'transparent',
                      border: isHovered || isSelected ? `2px solid ${getHighlightColor().replace('0.6', '1')}` : '2px solid transparent',
                      borderRadius: '4px'
                    }}
                    onMouseEnter={() => setHoveredFloor(floorNum)}
                    onMouseLeave={() => setHoveredFloor(null)}
                    onClick={() => handleFloorClick(floorNum)}
                  >
                    {/* Floor Label - Shows on Hover */}
                    {(isHovered || isSelected) && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-white/95 backdrop-blur-sm px-3 py-1 rounded-lg shadow-lg border border-gray-200 text-center">
                          <div className="text-sm font-semibold text-gray-900">
                            {floorNum === 0 ? 'Партер - Гаражи' : `Етаж ${floorNum}`}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Building Info Overlay */}
            <div className="absolute top-4 left-4 right-4">
              <div className="bg-white/95 backdrop-blur-sm rounded-luxury p-3 border border-silver-200 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-primary-900 text-sm">Жилищна сграда KSM</h4>
                    <p className="text-xs text-primary-600">Партер + 6 етажа • Общо 7 нива</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-primary-600">
                      {hoveredFloor !== null ? `Избран: ${hoveredFloor === 0 ? 'Партер - Гаражи' : `Етаж ${hoveredFloor}`}` : 'Посочете етаж'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Details (slides in when floor is selected) */}
        <div 
          ref={detailsPanelRef}
          className={`lg:col-span-4 transition-all duration-500 ${
            selectedFloor ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full lg:translate-x-0 lg:opacity-0 hidden lg:block'
          }`}
        >
          {selectedFloor && (
            <div className="bg-white rounded-luxury-lg shadow-luxury border border-silver-200 p-6 sticky top-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-primary-900">
                  {floorsData[selectedFloor]?.name}
                </h3>
                <button
                  onClick={() => setSelectedFloor(null)}
                  className="p-2 hover:bg-gray-100 rounded-luxury transition-colors duration-200"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Floor Plan Image */}
              <div className="mb-6">
                <div className="aspect-video bg-gradient-to-br from-primary-100 to-primary-200 rounded-luxury flex items-center justify-center border border-silver-200">
                  <div className="text-center">
                    <svg className="w-16 h-16 text-primary-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                    </svg>
                    <p className="text-primary-600 text-sm font-medium">Архитектурен план</p>
                    <p className="text-primary-500 text-xs">{floorsData[selectedFloor]?.name}</p>
                  </div>
                </div>
              </div>

              {/* Apartments Table */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-primary-900 flex items-center">
                  <svg className="w-5 h-5 text-gold-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4" />
                  </svg>
                  Налични апартаменти
                </h4>
                
                {floorsData[selectedFloor]?.apartments.map((apartment) => (
                  <div key={apartment.id} className="bg-gradient-to-r from-primary-50 to-ivory-50 rounded-luxury p-4 border border-silver-200">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-semibold text-primary-900">{apartment.property}</h5>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(apartment.status)}`}>
                        {apartment.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-primary-600 font-medium">Вид:</span>
                        <p className="text-primary-900">{apartment.type}</p>
                      </div>
                      <div>
                        <span className="text-primary-600 font-medium">Застроена площ:</span>
                        <p className="text-primary-900">{apartment.builtArea}</p>
                      </div>
                      <div>
                        <span className="text-primary-600 font-medium">Обща площ:</span>
                        <p className="text-primary-900">{apartment.totalArea}</p>
                      </div>
                      <div>
                        <span className="text-primary-600 font-medium">Изложение:</span>
                        <p className="text-primary-900">{apartment.exposure}</p>
                      </div>
                    </div>
                    
                    {apartment.status === 'Свободен' && (
                      <button className="w-full mt-3 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-primary-900 py-2 px-4 rounded-luxury font-semibold transition-all duration-200 shadow-gold-glow hover:shadow-gold-glow-lg">
                        Запитване
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BuildingFloorPlan

