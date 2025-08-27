import React, { useState } from 'react';
import buildingImage from '../assets/продажби/project 1/sgrada1.jpg';
// Note: Make sure to add building-D-floor-2.jpg to the assets folder
// import buildingDFloor2Image from '../assets/продажби/project 1/building-D-floor-2.jpg';

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
    3: { property: 'Г-401', type: '2-стаен', builtArea: '62 м²', totalArea: '75 м²', exposure: 'Север', status: 'sold' },
    2: { property: 'Г-301', type: '4-стаен', builtArea: '98 м²', totalArea: '115 м²', exposure: 'Запад/Юг', status: 'available' },
    1: { property: 'Г-201', type: '2-стаен', builtArea: '62 м²', totalArea: '75 м²', exposure: 'Север', status: 'available' },
    0: { property: 'Гараж Г', type: 'Паркомясто', builtArea: '15 м²', totalArea: '15 м²', exposure: '-', status: 'available' },
  },
};

// Tower configurations
const TOWERS = [
  { id: 'A', name: 'Блок A', floors: 9 },
  { id: 'B', name: 'Блок B', floors: 9 },
  { id: 'C', name: 'Блок C', floors: 9 },
  { id: 'D', name: 'Блок D', floors: 9 }
];

const FourTowersFloorMap = ({ onHoverChange, currentImage }) => {
  const [selected, setSelected] = useState({ tower: null, floor: null });
  const [expandedTowers, setExpandedTowers] = useState(new Set(['A', 'D']));

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
    <div className="w-full h-screen bg-gray-50 flex">
      {/* Left Panel - Tower/Floor List */}
      <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
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
                <div className="ml-4 mt-1 space-y-1">
                  {Array.from({ length: tower.floors }, (_, i) => tower.floors - 1 - i).map(floorIndex => {
                    const isSelected = selected.tower === tower.id && selected.floor === floorIndex;
                    const floorData = FLOOR_DATA[tower.id]?.[floorIndex];
                    
                    return (
                      <button
                        key={floorIndex}
                        onClick={() => handleFloorClick(tower.id, floorIndex)}
                        onMouseEnter={() => {
                          // Only trigger hover for Block D floor 1, 2, and 3
                          if (tower.id === 'D' && (floorIndex === 1 || floorIndex === 2 || floorIndex === 3)) {
                            handleFloorHover(tower.id, floorIndex);
                          }
                        }}
                        onMouseLeave={() => {
                          // Only trigger hover leave for Block D floor 1, 2, and 3
                          if (tower.id === 'D' && (floorIndex === 1 || floorIndex === 2 || floorIndex === 3)) {
                            handleFloorHover(null, null);
                          }
                        }}
                        className={`w-full px-3 py-2 text-left rounded-md transition-all ${
                          isSelected 
                            ? 'bg-blue-500 text-white shadow-md' 
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{getFloorName(floorIndex)}</span>
                          {floorData && (
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              isSelected ? 'bg-white/20 text-white' : getStatusBg(floorData.status) + ' ' + getStatusColor(floorData.status)
                            }`}>
                              {getStatusLabel(floorData.status)}
                            </span>
                          )}
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

      {/* Center - Image with SVG Overlay */}
      <div className="flex-1 bg-gray-100 relative overflow-hidden">
        <div className="absolute inset-4 bg-white rounded-lg shadow-lg">
          <div className="relative w-full h-full p-8">
            <div className="relative w-full h-full">
              <img 
                src={currentImage || buildingImage} 
                alt="Building" 
                className="w-full h-full object-contain"
              />
              
              {/* Block D Floor 1, 2, and 3 hover and click areas */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                {/* Block D Floor 1 */}
                <rect
                  x={76}
                  y={28 + (6 * (75 - 28) / 9)}
                  width={12}
                  height={(75 - 28) / 9 * 0.95}
                  fill="transparent"
                  stroke="transparent"
                  className="cursor-pointer"
                  style={{ pointerEvents: 'auto' }}
                  onMouseEnter={() => handleFloorHover('D', 1)}
                  onMouseLeave={() => handleFloorHover(null, null)}
                  onClick={() => handleFloorClick('D', 1)}
                />
                {/* Block D Floor 2 */}
                <rect
                  x={76}
                  y={28 + (5 * (75 - 28) / 9)}
                  width={12}
                  height={(75 - 28) / 9 * 0.95}
                  fill="transparent"
                  stroke="transparent"
                  className="cursor-pointer"
                  style={{ pointerEvents: 'auto' }}
                  onMouseEnter={() => handleFloorHover('D', 2)}
                  onMouseLeave={() => handleFloorHover(null, null)}
                  onClick={() => handleFloorClick('D', 2)}
                />
                {/* Block D Floor 3 */}
                <rect
                  x={76}
                  y={28 + (4 * (75 - 28) / 9)}
                  width={12}
                  height={(75 - 28) / 9 * 0.95}
                  fill="transparent"
                  stroke="transparent"
                  className="cursor-pointer"
                  style={{ pointerEvents: 'auto' }}
                  onMouseEnter={() => handleFloorHover('D', 3)}
                  onMouseLeave={() => handleFloorHover(null, null)}
                  onClick={() => handleFloorClick('D', 3)}
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Details */}
      <div className="w-96 bg-white border-l border-gray-200 overflow-y-auto">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Детайли</h2>
          {selected.tower && (
            <p className="text-xs text-gray-500">Избрано: {selected.tower} - Етаж {selected.floor}</p>
          )}
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
                    
                    {selected.tower === 'D' && selected.floor === 1 && (
                      <div className="bg-green-50 rounded-lg p-4 mb-4">
                          <h4 className="font-semibold text-gray-900 mb-3">Информация за апартаментите</h4>
                          <div className="space-y-3">
                            <div className="bg-white rounded p-3 border border-green-200">
                              <div className="flex justify-between items-center mb-2">
                                <h5 className="font-medium text-gray-900">Апартамент Г-201А</h5>
                                <span className="text-green-600 text-sm font-medium">Наличен</span>
                              </div>
                              <div className="text-sm text-gray-600 space-y-1">
                                <div className="flex justify-between">
                                  <span>Застроена площ:</span>
                                  <span className="font-medium">62 м²</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Тераса:</span>
                                  <span className="font-medium">8 м²</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Изложение:</span>
                                  <span className="font-medium">Север/Изток</span>
                                </div>
                              </div>
                            </div>

                            <div className="bg-white rounded p-3 border border-green-200">
                              <div className="flex justify-between items-center mb-2">
                                <h5 className="font-medium text-gray-900">Апартамент Г-201Б</h5>
                                <span className="text-green-600 text-sm font-medium">Наличен</span>
                              </div>
                              <div className="text-sm text-gray-600 space-y-1">
                                <div className="flex justify-between">
                                  <span>Застроена площ:</span>
                                  <span className="font-medium">65 м²</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Тераса:</span>
                                  <span className="font-medium">10 м²</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Изложение:</span>
                                  <span className="font-medium">Юг/Запад</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                    )}

                    {selected.tower === 'D' && selected.floor === 2 && (
                      <div className="bg-green-50 rounded-lg p-4 mb-4">
                          <h4 className="font-semibold text-gray-900 mb-3">Информация за апартаментите</h4>
                          <div className="space-y-3">
                            <div className="bg-white rounded p-3 border border-green-200">
                              <div className="flex justify-between items-center mb-2">
                                <h5 className="font-medium text-gray-900">Апартамент Г-301А</h5>
                                <span className="text-green-600 text-sm font-medium">Наличен</span>
                              </div>
                              <div className="text-sm text-gray-600 space-y-1">
                                <div className="flex justify-between">
                                  <span>Застроена площ:</span>
                                  <span className="font-medium">98 м²</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Тераса:</span>
                                  <span className="font-medium">12 м²</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Изложение:</span>
                                  <span className="font-medium">Запад/Юг</span>
                                </div>
                              </div>
                            </div>

                            <div className="bg-white rounded p-3 border border-green-200">
                              <div className="flex justify-between items-center mb-2">
                                <h5 className="font-medium text-gray-900">Апартамент Г-301Б</h5>
                                <span className="text-green-600 text-sm font-medium">Наличен</span>
                              </div>
                              <div className="text-sm text-gray-600 space-y-1">
                                <div className="flex justify-between">
                                  <span>Застроена площ:</span>
                                  <span className="font-medium">98 м²</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Тераса:</span>
                                  <span className="font-medium">15 м²</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Изложение:</span>
                                  <span className="font-medium">Запад/Юг</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                    )}

                    {selected.tower === 'D' && selected.floor === 3 && (
                      <div className="bg-red-50 rounded-lg p-3 mb-3">
                          <h4 className="font-semibold text-gray-900 mb-2">Информация за апартаментите</h4>
                          <div className="bg-white rounded p-2 border border-red-200">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium text-gray-900">Г-401</span>
                              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium">
                                ПРОДАДЕН
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="text-gray-600">Тип:</span>
                                <span className="ml-2 font-medium">2-стаен</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Застроена:</span>
                                <span className="ml-2 font-medium">62 м²</span>
                              </div>
                            </div>
                            <div className="mt-2 p-2 bg-red-50 rounded text-xs text-red-700">
                              <strong>Статус:</strong> Продаден апартамент
                            </div>
                          </div>
                        </div>
                    )}
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Архитектурен план</h4>
                      {selected.tower === 'D' && (selected.floor === 1 || selected.floor === 2 || selected.floor === 3) ? (
                        <div className="space-y-3">
                          <div className="h-24 bg-white rounded border border-gray-200 flex items-center justify-center">
                            <div className="text-center text-gray-500">
                              <svg className="w-8 h-8 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <p className="text-xs">Архитектурен план ще бъде добавен скоро</p>
                            </div>
                          </div>
                          <div className={`rounded p-2 ${selected.floor === 3 ? 'bg-red-50' : 'bg-blue-50'}`}>
                            <h5 className="font-medium text-gray-900 mb-1">Характеристики на етажа</h5>
                            <ul className="text-sm text-gray-600 space-y-1">
                              <li>• Входна врата с домофон</li>
                              <li>• Асансьор и стълбище</li>
                              <li>• Общи части с луксозна довършителна работа</li>
                              <li>• Енергийна ефективност клас А</li>
                              <li>• Звукоизолация и топлоизолация</li>
                            </ul>
                          </div>
                        </div>
                      ) : (
                        <div className="h-48 bg-white rounded border border-gray-200 flex items-center justify-center text-gray-400">
                          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                      )}
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
            <div className="mb-4">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <p className="text-lg font-medium">Изберете етаж</p>
            </div>
            <p className="text-sm">Кликнете на етаж от левия панел за да видите детайлите</p>
            
            <div className="mt-6 bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Специална функция</h4>
              <p className="text-sm text-gray-600">
                При преминаване с мишката над <strong>Блок D - Етаж 1</strong> в левия панел се активира специална визуализация на сградата.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FourTowersFloorMap;