import React, { useState } from 'react';
import buildingImage from '../assets/продажби/project 1/sgrada1.jpg';
import buildingBFloor1Image from '../assets/продажби/project 1/building-D-floor-1.jpg';
import buildingBFloor2Image from '../assets/продажби/project 1/building-D-floor-2.jpg';
import buildingBFloor3Image from '../assets/продажби/project 1/building-D-floor-3.jpg';

// Simple floor data
export const FLOOR_DATA = {
  'A': {
    8: { property: 'А-901', type: '3-стаен', builtArea: '78 м²', totalArea: '95 м²', exposure: 'Юг/Изток', status: 'available' },
    7: { property: 'А-801', type: '2-стаен', builtArea: '62 м²', totalArea: '75 м²', exposure: 'Запад', status: 'sold' },
    6: { property: 'А-701', type: '4-стаен', builtArea: '98 м²', totalArea: '115 м²', exposure: 'Север/Изток', status: 'reserved' },
    5: { property: 'А-601', type: '2-стаен', builtArea: '62 м²', totalArea: '75 м²', exposure: 'Север', status: 'available' },
    4: { property: 'А-501', type: '3-стаен', builtArea: '78 м²', totalArea: '95 м²', exposure: 'Юг/Изток', status: 'available' },
    3: { property: 'А-401', type: '2-стаен', builtArea: '62 м²', totalArea: '75 м²', exposure: 'Север', status: 'sold' },
    2: { property: 'А-301', type: '4-стаен', builtArea: '98 м²', totalArea: '115 м²', exposure: 'Запад/Юг', status: 'available' },
    1: { property: 'А-201', type: '2-стаен', builtArea: '62 м²', totalArea: '75 м²', exposure: 'Север', status: 'available' },
    0: { property: 'Гараж А', type: 'Паркомясто', builtArea: '15 м²', totalArea: '15 м²', exposure: '-', status: 'available' },
  },
  'B': {
    8: { property: 'Б-901', type: '3-стаен', builtArea: '78 м²', totalArea: '95 м²', exposure: 'Юг/Изток', status: 'available' },
    7: { property: 'Б-801', type: '2-стаен', builtArea: '62 м²', totalArea: '75 м²', exposure: 'Запад', status: 'sold' },
    6: { property: 'Б-701', type: '4-стаен', builtArea: '98 м²', totalArea: '115 м²', exposure: 'Север/Изток', status: 'reserved' },
    5: { property: 'Б-601', type: '2-стаен', builtArea: '62 м²', totalArea: '75 м²', exposure: 'Север', status: 'available' },
    4: { property: 'Б-501', type: '3-стаен', builtArea: '78 м²', totalArea: '95 м²', exposure: 'Юг/Изток', status: 'available' },
    3: { 
      property: 'Б-401', 
      type: '2-стаен', 
      builtArea: '62 м²', 
      totalArea: '75 м²', 
      exposure: 'Север', 
      status: 'sold',
      apartments: [
        { имот: 'Б-301', вид: '2-стаен', застроенаПлощ: '62 м²', общаПлощ: '75 м²', изложение: 'Север', статус: 'Продаден' },
        { имот: 'Б-302', вид: '3-стаен', застроенаПлощ: '82 м²', общаПлощ: '98 м²', изложение: 'Юг/Изток', статус: 'Свободен' },
        { имот: 'Б-303', вид: '4-стаен', застроенаПлощ: '105 м²', общаПлощ: '125 м²', изложение: 'Запад/Юг', статус: 'Свободен' },
        { имот: 'Б-304', вид: '1-стаен', застроенаПлощ: '45 м²', общаПлощ: '55 м²', изложение: 'Изток', статус: 'Продаден' },
      ],
      planImage: buildingBFloor3Image
    },
    2: { 
      property: 'Б-301', 
      type: '4-стаен', 
      builtArea: '98 м²', 
      totalArea: '115 м²', 
      exposure: 'Запад/Юг', 
      status: 'available',
      apartments: [
        { имот: 'Б-201', вид: '4-стаен', застроенаПлощ: '98 м²', общаПлощ: '115 м²', изложение: 'Запад/Юг', статус: 'Свободен' },
        { имот: 'Б-202', вид: '2-стаен', застроенаПлощ: '65 м²', общаПлощ: '78 м²', изложение: 'Север', статус: 'Свободен' },
        { имот: 'Б-203', вид: '3-стаен', застроенаПлощ: '85 м²', общаПлощ: '102 м²', изложение: 'Юг', статус: 'Продаден' },
        { имот: 'Б-204', вид: '2-стаен', застроенаПлощ: '68 м²', общаПлощ: '82 м²', изложение: 'Изток/Юг', статус: 'Свободен' },
      ],
      planImage: buildingBFloor2Image
    },
    1: { 
      property: 'Б-201', 
      type: '2-стаен', 
      builtArea: '62 м²', 
      totalArea: '75 м²', 
      exposure: 'Север', 
      status: 'available',
      apartments: [
        { имот: 'Б-101', вид: '2-стаен', застроенаПлощ: '62 м²', общаПлощ: '75 м²', изложение: 'Север', статус: 'Свободен' },
        { имот: 'Б-102', вид: '3-стаен', застроенаПлощ: '78 м²', общаПлощ: '94 м²', изложение: 'Юг/Запад', статус: 'Свободен' },
        { имот: 'Б-103', вид: '1-стаен', застроенаПлощ: '42 м²', общаПлощ: '52 м²', изложение: 'Изток', статус: 'Продаден' },
        { имот: 'Б-104', вид: '4-стаен', застроенаПлощ: '110 м²', общаПлощ: '130 м²', изложение: 'Юг/Изток/Запад', статус: 'Резервиран' },
      ],
      planImage: buildingBFloor1Image
    },
    0: { property: 'Гараж Б', type: 'Паркомясто', builtArea: '15 м²', totalArea: '15 м²', exposure: '-', status: 'available' },
  },
};

// Tower configurations
const TOWERS = [
  { id: 'A', name: 'Блок A', floors: 9 },
  { id: 'B', name: 'Блок B', floors: 9 }
];

const FourTowersFloorMap = ({ onHoverChange, currentImage, onFloorSelect }) => {
  const [selected, setSelected] = useState({ tower: null, floor: null });
  const [expandedTowers, setExpandedTowers] = useState(new Set(['A', 'B']));

  const toggleTowerExpansion = (towerId) => {
    setExpandedTowers(prev => {
      const next = new Set(prev);
      if (next.has(towerId)) {
        next.delete(towerId);
      } else {
        next.add(towerId);
      }
      return next;
    });
  };

  const handleFloorClick = (towerId, floorIndex) => {
    setSelected({ tower: towerId, floor: floorIndex });
    
    // Pass the selected floor data to parent component
    if (onFloorSelect) {
      const floorData = FLOOR_DATA[towerId]?.[floorIndex];
      onFloorSelect(towerId, floorIndex, floorData);
    }
  };

  const handleFloorHover = (towerId, floorIndex) => {
    if (onHoverChange) {
      const isHovering = towerId !== null && floorIndex !== null;
      onHoverChange(isHovering, towerId, floorIndex);
    }
  };

  const getFloorName = (floorIndex) => {
    if (floorIndex === 0) return 'Партер/Гаражи';
    return `Етаж ${floorIndex}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'text-green-600';
      case 'sold': return 'text-red-600';
      case 'reserved': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'available': return 'bg-green-100';
      case 'sold': return 'bg-red-100';
      case 'reserved': return 'bg-yellow-100';
      default: return 'bg-gray-100';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'available': return 'Свободен';
      case 'sold': return 'Продаден';
      case 'reserved': return 'Резервиран';
      default: return status;
    }
  };

  return (
    <div className="w-full h-full bg-gray-50">
      <div className="flex h-full">
        {/* Left Panel - Tower/Floor List */}
        <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto flex-shrink-0">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Етажи по блокове</h2>
            <p className="text-sm text-gray-600 mt-1">Кликнете на етаж за детайли</p>
          </div>
          
          <div className="p-2">
            {TOWERS.map(tower => (
              <div key={tower.id} className="mb-2">
                <button
                  onClick={() => toggleTowerExpansion(tower.id)}
                  className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <span className="font-semibold text-gray-800">{tower.name}</span>
                  <svg
                    className={`w-5 h-5 text-gray-600 transition-transform ${expandedTowers.has(tower.id) ? 'rotate-90' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                
                {expandedTowers.has(tower.id) && (
                  <div className="mt-1 ml-2 space-y-1">
                    {Array.from({ length: tower.floors }, (_, i) => {
                      const floorIndex = tower.floors - 1 - i;
                      const floorData = FLOOR_DATA[tower.id]?.[floorIndex];
                      if (!floorData) return null;
                      
                      const isSelected = selected.tower === tower.id && selected.floor === floorIndex;
                      
                      return (
                        <button
                          key={floorIndex}
                          onClick={() => handleFloorClick(tower.id, floorIndex)}
                          onMouseEnter={() => {
                            if (tower.id === 'B' && (floorIndex === 1 || floorIndex === 2 || floorIndex === 3)) {
                              handleFloorHover(tower.id, floorIndex);
                            }
                          }}
                          onMouseLeave={() => {
                            if (tower.id === 'B' && (floorIndex === 1 || floorIndex === 2 || floorIndex === 3)) {
                              handleFloorHover(null, null);
                            }
                          }}
                          className={`w-full px-3 py-2 text-left text-sm rounded transition-colors ${
                            isSelected 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span>{getFloorName(floorIndex)}</span>
                            <span className={`px-2 py-1 rounded text-xs ${getStatusBg(floorData.status)} ${getStatusColor(floorData.status)}`}>
                              {getStatusLabel(floorData.status)}
                            </span>
                          </div>
                          <div className="text-xs opacity-75 mt-1">
                            {floorData.property} - {floorData.type}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Center - Building Image with SVG Overlay */}
        <div className="flex-1 bg-gray-100 relative overflow-auto">
          <div className="w-full h-full p-4">
            <div className="bg-white rounded-lg shadow-lg h-full">
              <div className="relative w-full h-full p-4">
                <img 
                  src={currentImage || buildingImage} 
                  alt="Building Complex Floor Map" 
                  className="w-full h-full object-contain"
                />
                
                {/* Block B Floor 1, 2, and 3 hover and click areas */}
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                >
                  {/* Block B Floor 1 */}
                  <rect
                    x={76}
                    y={28 + (6 * (75 - 28) / 9)}
                    width={12}
                    height={(75 - 28) / 9 * 0.95}
                    fill="transparent"
                    stroke="transparent"
                    className="cursor-pointer"
                    style={{ pointerEvents: 'auto' }}
                    onMouseEnter={() => handleFloorHover('B', 1)}
                    onMouseLeave={() => handleFloorHover(null, null)}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFloorClick('B', 1);
                    }}
                  />
                  {/* Block B Floor 2 */}
                  <rect
                    x={76}
                    y={28 + (5 * (75 - 28) / 9)}
                    width={12}
                    height={(75 - 28) / 9 * 0.95}
                    fill="transparent"
                    stroke="transparent"
                    className="cursor-pointer"
                    style={{ pointerEvents: 'auto' }}
                    onMouseEnter={() => handleFloorHover('B', 2)}
                    onMouseLeave={() => handleFloorHover(null, null)}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFloorClick('B', 2);
                    }}
                  />
                  {/* Block B Floor 3 */}
                  <rect
                    x={76}
                    y={28 + (4 * (75 - 28) / 9)}
                    width={12}
                    height={(75 - 28) / 9 * 0.95}
                    fill="transparent"
                    stroke="transparent"
                    className="cursor-pointer"
                    style={{ pointerEvents: 'auto' }}
                    onMouseEnter={() => handleFloorHover('B', 3)}
                    onMouseLeave={() => handleFloorHover(null, null)}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFloorClick('B', 3);
                    }}
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Google Maps */}
        <div className="w-96 bg-white border-l border-gray-200 overflow-y-auto">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Местоположение</h2>
            <p className="text-sm text-gray-600 mb-4">
              Намерете ни на картата - удобна локация с лесен достъп до основни пътни артерии
            </p>
          </div>
          
          <div className="p-4">
            {/* Google Maps Embed */}
            <div className="rounded-lg overflow-hidden shadow-lg mb-4">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2932.1849999999997!2d23.3219!3d42.6977!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDLCsDQxJzUxLjciTiAyM8KwMTknMTguOCJF!5e0!3m2!1sbg!2sbg!4v1629999999999!5m2!1sbg!2sbg"
                width="100%"
                height="350"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="KSM Stroy Location"
                className="w-full"
              />
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <svg className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-gray-900">Адрес:</p>
                  <p className="text-sm text-gray-600">София, България</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-2">
                <svg className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-gray-900">Работно време:</p>
                  <p className="text-sm text-gray-600">Пон-Пет: 9:00 - 18:00</p>
                  <p className="text-sm text-gray-600">Събота: 10:00 - 14:00</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-2">
                <svg className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-gray-900">Телефон:</p>
                  <p className="text-sm text-gray-600">+359 88 888 8888</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FourTowersFloorMap;