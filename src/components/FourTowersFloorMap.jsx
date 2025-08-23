import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import buildingImage from '../assets/продажби/project 1/sgrada1.jpg';

// Simple floor data
const FLOOR_DATA = {
  'A': {
    8: { property: 'А-901', type: '3-стаен', builtArea: '78 м²', totalArea: '95 м²', exposure: 'Юг/Изток', status: 'available' },
    7: { property: 'А-801', type: '2-стаен', builtArea: '62 м²', totalArea: '75 м²', exposure: 'Запад', status: 'sold' },
    6: { property: 'А-701', type: '3-стаен', builtArea: '78 м²', totalArea: '95 м²', exposure: 'Юг/Изток', status: 'available' },
    5: { property: 'А-601', type: '2-стаен', builtArea: '62 м²', totalArea: '75 м²', exposure: 'Запад', status: 'reserved' },
    4: { property: 'А-501', type: '3-стаен', builtArea: '78 м²', totalArea: '95 м²', exposure: 'Юг/Изток', status: 'available' },
    3: { property: 'А-401', type: '2-стаен', builtArea: '62 м²', totalArea: '75 м²', exposure: 'Запад', status: 'available' },
    2: { property: 'А-301', type: '3-стаен', builtArea: '78 м²', totalArea: '95 м²', exposure: 'Юг/Изток', status: 'sold' },
    1: { property: 'А-201', type: '2-стаен', builtArea: '62 м²', totalArea: '75 м²', exposure: 'Запад', status: 'available' },
    0: { property: 'Гараж А', type: 'Паркомясто', builtArea: '15 м²', totalArea: '15 м²', exposure: '-', status: 'available' },
  },
  'B': {
    8: { property: 'Б-901', type: '4-стаен', builtArea: '98 м²', totalArea: '115 м²', exposure: 'Юг/Запад', status: 'available' },
    7: { property: 'Б-801', type: '3-стаен', builtArea: '78 м²', totalArea: '95 м²', exposure: 'Изток', status: 'available' },
    6: { property: 'Б-701', type: '4-стаен', builtArea: '98 м²', totalArea: '115 м²', exposure: 'Юг/Запад', status: 'sold' },
    5: { property: 'Б-601', type: '3-стаен', builtArea: '78 м²', totalArea: '95 м²', exposure: 'Изток', status: 'available' },
    4: { property: 'Б-501', type: '4-стаен', builtArea: '98 м²', totalArea: '115 м²', exposure: 'Юг/Запад', status: 'reserved' },
    3: { property: 'Б-401', type: '3-стаен', builtArea: '78 м²', totalArea: '95 м²', exposure: 'Изток', status: 'available' },
    2: { property: 'Б-301', type: '4-стаен', builtArea: '98 м²', totalArea: '115 м²', exposure: 'Юг/Запад', status: 'available' },
    1: { property: 'Б-201', type: '3-стаен', builtArea: '78 м²', totalArea: '95 м²', exposure: 'Изток', status: 'sold' },
    0: { property: 'Гараж Б', type: 'Паркомясто', builtArea: '15 м²', totalArea: '15 м²', exposure: '-', status: 'available' },
  },
  'C': {
    8: { property: 'В-901', type: '2-стаен', builtArea: '62 м²', totalArea: '75 м²', exposure: 'Север/Изток', status: 'available' },
    7: { property: 'В-801', type: '3-стаен', builtArea: '78 м²', totalArea: '95 м²', exposure: 'Юг', status: 'sold' },
    6: { property: 'В-701', type: '2-стаен', builtArea: '62 м²', totalArea: '75 м²', exposure: 'Север/Изток', status: 'available' },
    5: { property: 'В-601', type: '3-стаен', builtArea: '78 м²', totalArea: '95 м²', exposure: 'Юг', status: 'available' },
    4: { property: 'В-501', type: '2-стаен', builtArea: '62 м²', totalArea: '75 м²', exposure: 'Север/Изток', status: 'reserved' },
    3: { property: 'В-401', type: '3-стаен', builtArea: '78 м²', totalArea: '95 м²', exposure: 'Юг', status: 'available' },
    2: { property: 'В-301', type: '2-стаен', builtArea: '62 м²', totalArea: '75 м²', exposure: 'Север/Изток', status: 'available' },
    1: { property: 'В-201', type: '3-стаен', builtArea: '78 м²', totalArea: '95 м²', exposure: 'Юг', status: 'available' },
    0: { property: 'Гараж В', type: 'Паркомясто', builtArea: '15 м²', totalArea: '15 м²', exposure: '-', status: 'sold' },
  },
  'D': {
    8: { property: 'Г-901', type: '4-стаен', builtArea: '98 м²', totalArea: '115 м²', exposure: 'Запад/Юг', status: 'available' },
    7: { property: 'Г-801', type: '2-стаен', builtArea: '62 м²', totalArea: '75 м²', exposure: 'Север', status: 'available' },
    6: { property: 'Г-701', type: '4-стаен', builtArea: '98 м²', totalArea: '115 м²', exposure: 'Запад/Юг', status: 'sold' },
    5: { property: 'Г-601', type: '2-стаен', builtArea: '62 м²', totalArea: '75 м²', exposure: 'Север', status: 'available' },
    4: { property: 'Г-501', type: '4-стаен', builtArea: '98 м²', totalArea: '115 м²', exposure: 'Запад/Юг', status: 'available' },
    3: { property: 'Г-401', type: '2-стаен', builtArea: '62 м²', totalArea: '75 м²', exposure: 'Север', status: 'reserved' },
    2: { property: 'Г-301', type: '4-стаен', builtArea: '98 м²', totalArea: '115 м²', exposure: 'Запад/Юг', status: 'available' },
    1: { property: 'Г-201', type: '2-стаен', builtArea: '62 м²', totalArea: '75 м²', exposure: 'Север', status: 'available' },
    0: { property: 'Гараж Г', type: 'Паркомясто', builtArea: '15 м²', totalArea: '15 м²', exposure: '-', status: 'available' },
  },
};

// Tower configurations - adjusted for the actual building image
const TOWERS = [
  {
    id: 'A',
    name: 'Блок A',
    floors: 9,
    // Approximate positions for leftmost tower
    x: 12,
    width: 12,
    yTop: 28,
    yBottom: 75
  },
  {
    id: 'B', 
    name: 'Блок B',
    floors: 9,
    // Approximate positions for left-center tower
    x: 29.5,
    width: 12,
    yTop: 28,
    yBottom: 75
  },
  {
    id: 'C',
    name: 'Блок C', 
    floors: 9,
    // Approximate positions for right-center tower
    x: 58.5,
    width: 12,
    yTop: 28,
    yBottom: 75
  },
  {
    id: 'D',
    name: 'Блок D',
    floors: 9,
    // Approximate positions for rightmost tower
    x: 76,
    width: 12,
    yTop: 28,
    yBottom: 75
  }
];

const FourTowersFloorMap = () => {
  const [hover, setHover] = useState({ tower: null, floor: null });
  const [selected, setSelected] = useState({ tower: null, floor: null });
  const [expandedTowers, setExpandedTowers] = useState(new Set(['A']));

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
  };

  const handleFloorHover = (towerId, floorIndex) => {
    setHover({ tower: towerId, floor: floorIndex });
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

  // Generate floor rectangles for each tower
  const generateFloorRects = (tower) => {
    const rects = [];
    const floorHeight = (tower.yBottom - tower.yTop) / tower.floors;
    
    for (let i = 0; i < tower.floors; i++) {
      const y = tower.yTop + (i * floorHeight);
      rects.push({
        towerId: tower.id,
        floorIndex: tower.floors - 1 - i, // Reverse order (top floor = highest index)
        x: tower.x,
        y: y,
        width: tower.width,
        height: floorHeight * 0.95 // Small gap between floors
      });
    }
    return rects;
  };

  const allFloorRects = TOWERS.flatMap(tower => generateFloorRects(tower));

  return (
    <div className="w-full h-screen bg-gray-50 flex">
      {/* Left Panel - Tower/Floor List */}
      <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Етажи по блокове</h2>
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
              
              <AnimatePresence>
                {expandedTowers.has(tower.id) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="ml-4 mt-1 space-y-1">
                      {Array.from({ length: tower.floors }, (_, i) => tower.floors - 1 - i).map(floorIndex => {
                        const isHovered = hover.tower === tower.id && hover.floor === floorIndex;
                        const isSelected = selected.tower === tower.id && selected.floor === floorIndex;
                        const floorData = FLOOR_DATA[tower.id]?.[floorIndex];
                        
                        return (
                          <button
                            key={floorIndex}
                            onClick={() => handleFloorClick(tower.id, floorIndex)}
                            onMouseEnter={() => handleFloorHover(tower.id, floorIndex)}
                            onMouseLeave={() => handleFloorHover(null, null)}
                            className={`w-full px-3 py-2 text-left rounded-md transition-all ${
                              isSelected 
                                ? 'bg-blue-500 text-white shadow-md' 
                                : isHovered 
                                  ? 'bg-blue-50 text-blue-700' 
                                  : 'hover:bg-gray-100'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">{getFloorName(floorIndex)}</span>
                              {floorData && (
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                  isSelected ? 'bg-white/20' : getStatusBg(floorData.status)
                                } ${isSelected ? 'text-white' : getStatusColor(floorData.status)}`}>
                                  {getStatusLabel(floorData.status)}
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      {/* Center - Image with SVG Overlay */}
      <div className="flex-1 bg-gray-100 relative overflow-hidden">
        <div className="absolute inset-4 bg-white rounded-lg shadow-lg">
          <div className="relative w-full h-full p-8">
            <div className="relative w-full h-full">
              <img 
                src={buildingImage} 
                alt="Building" 
                className="w-full h-full object-contain"
              />
              
              {/* SVG Overlay */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                {/* Render floor rectangles */}
                {allFloorRects.map((rect, index) => {
                  const isHovered = hover.tower === rect.towerId && hover.floor === rect.floorIndex;
                  const isSelected = selected.tower === rect.towerId && selected.floor === rect.floorIndex;
                  
                  return (
                    <g key={`${rect.towerId}-${rect.floorIndex}`}>
                      <rect
                        x={rect.x}
                        y={rect.y}
                        width={rect.width}
                        height={rect.height}
                        fill={isHovered || isSelected ? 'rgba(59, 130, 246, 0.3)' : 'transparent'}
                        stroke={isHovered || isSelected ? 'rgba(59, 130, 246, 0.8)' : 'transparent'}
                        strokeWidth="0.5"
                        className="cursor-pointer transition-all duration-200"
                        style={{ pointerEvents: 'auto' }}
                        onMouseEnter={() => handleFloorHover(rect.towerId, rect.floorIndex)}
                        onMouseLeave={() => handleFloorHover(null, null)}
                        onClick={() => handleFloorClick(rect.towerId, rect.floorIndex)}
                      />
                      {isSelected && (
                        <rect
                          x={rect.x}
                          y={rect.y}
                          width={rect.width}
                          height={rect.height}
                          fill="none"
                          stroke="rgba(59, 130, 246, 1)"
                          strokeWidth="1"
                          className="animate-pulse"
                        />
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Details */}
      <div className="w-96 bg-white border-l border-gray-200 overflow-y-auto">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Детайли</h2>
        </div>
        
        {selected.tower && selected.floor !== null ? (
          <div className="p-4">
            {(() => {
              const tower = TOWERS.find(t => t.id === selected.tower);
              const floorData = FLOOR_DATA[selected.tower]?.[selected.floor];
              
              if (!tower || !floorData) return null;
              
              return (
                <>
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {tower.name} - {getFloorName(selected.floor)}
                    </h3>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusBg(floorData.status)} ${getStatusColor(floorData.status)}`}>
                      {getStatusLabel(floorData.status)}
                    </span>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-gray-600 border-b border-gray-200">
                            <th className="pb-2">Характеристика</th>
                            <th className="pb-2">Стойност</th>
                          </tr>
                        </thead>
                        <tbody className="text-gray-900">
                          <tr className="border-b border-gray-200">
                            <td className="py-2">Имот</td>
                            <td className="py-2 font-medium">{floorData.property}</td>
                          </tr>
                          <tr className="border-b border-gray-200">
                            <td className="py-2">Вид</td>
                            <td className="py-2">{floorData.type}</td>
                          </tr>
                          <tr className="border-b border-gray-200">
                            <td className="py-2">Застроена площ</td>
                            <td className="py-2">{floorData.builtArea}</td>
                          </tr>
                          <tr className="border-b border-gray-200">
                            <td className="py-2">Обща площ</td>
                            <td className="py-2">{floorData.totalArea}</td>
                          </tr>
                          <tr className="border-b border-gray-200">
                            <td className="py-2">Изложение</td>
                            <td className="py-2">{floorData.exposure}</td>
                          </tr>
                          <tr>
                            <td className="py-2">Статус</td>
                            <td className="py-2">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBg(floorData.status)} ${getStatusColor(floorData.status)}`}>
                                {getStatusLabel(floorData.status)}
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Архитектурен план</h4>
                      <div className="h-48 bg-white rounded border border-gray-200 flex items-center justify-center text-gray-400">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                    </div>
                    
                    {floorData.status === 'available' && (
                      <button className="w-full py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors">
                        Запитване за цена
                      </button>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        ) : (
          <div className="p-4 text-center text-gray-500">
            <p>Изберете етаж за да видите детайли</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FourTowersFloorMap;