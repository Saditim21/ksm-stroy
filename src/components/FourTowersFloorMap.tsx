import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HoverState, SelectedState, TowerConfig, FloorPolygon, ConfigData } from './geo/types';
import { generateTowerPolygons, toPoints } from './geo/useHomography';
import { TOWERS, IMG, FLOOR_DATA } from './geo/exampleConfig';
import { saveConfig, loadConfig, exportConfig, importConfig } from './geo/persist';

const FourTowersFloorMap: React.FC = () => {
  const [hover, setHover] = useState<HoverState>({ tower: null, floor: null });
  const [selected, setSelected] = useState<SelectedState>({ tower: null, floor: null });
  const [calibrationMode, setCalibrationMode] = useState(false);
  const [expandedTowers, setExpandedTowers] = useState<Set<string>>(new Set(['A']));
  const [towers, setTowers] = useState<TowerConfig[]>(TOWERS);
  const [polygons, setPolygons] = useState<FloorPolygon[]>([]);
  const svgRef = useRef<SVGSVGElement>(null);

  // Generate initial polygons
  useEffect(() => {
    generatePolygons();
  }, []);

  // Load saved config on mount
  useEffect(() => {
    const saved = loadConfig();
    if (saved) {
      setTowers(saved.towers);
      if (saved.polygons) {
        setPolygons(saved.polygons);
      } else {
        generatePolygons();
      }
    }
  }, []);

  const generatePolygons = useCallback(() => {
    const newPolygons: FloorPolygon[] = [];
    
    towers.forEach(tower => {
      const towerPolygons = generateTowerPolygons(
        tower.quad,
        tower.yCuts,
        tower.floors,
        tower.padTop,
        tower.padBottom
      );
      
      towerPolygons.forEach((points, floorIndex) => {
        newPolygons.push({
          towerId: tower.id,
          floorIndex,
          points
        });
      });
    });
    
    setPolygons(newPolygons);
    
    // Save to localStorage
    const config: ConfigData = { towers, polygons: newPolygons };
    saveConfig(config);
  }, [towers]);

  const toggleTowerExpansion = (towerId: string) => {
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

  const handleFloorClick = (towerId: string, floorIndex: number) => {
    setSelected({ tower: towerId, floor: floorIndex });
  };

  const handleFloorHover = (towerId: string | null, floorIndex: number | null) => {
    setHover({ tower: towerId, floor: floorIndex });
  };

  const getFloorName = (floorIndex: number) => {
    if (floorIndex === 0) return 'Партер/Гаражи';
    return `Етаж ${floorIndex}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'text-green-600';
      case 'sold': return 'text-red-600';
      case 'reserved': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100';
      case 'sold': return 'bg-red-100';
      case 'reserved': return 'bg-yellow-100';
      default: return 'bg-gray-100';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available': return 'Свободен';
      case 'sold': return 'Продаден';
      case 'reserved': return 'Резервиран';
      default: return status;
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selected.tower || selected.floor === null) return;
      
      const tower = towers.find(t => t.id === selected.tower);
      if (!tower) return;
      
      switch (e.key) {
        case 'ArrowUp':
          if (selected.floor < tower.floors - 1) {
            setSelected({ ...selected, floor: selected.floor + 1 });
          }
          break;
        case 'ArrowDown':
          if (selected.floor > 0) {
            setSelected({ ...selected, floor: selected.floor - 1 });
          }
          break;
        case 'ArrowLeft':
          {
            const currentIndex = towers.findIndex(t => t.id === selected.tower);
            if (currentIndex > 0) {
              const prevTower = towers[currentIndex - 1];
              setSelected({ tower: prevTower.id, floor: Math.min(selected.floor, prevTower.floors - 1) });
              setExpandedTowers(prev => new Set([...prev, prevTower.id]));
            }
          }
          break;
        case 'ArrowRight':
          {
            const currentIndex = towers.findIndex(t => t.id === selected.tower);
            if (currentIndex < towers.length - 1) {
              const nextTower = towers[currentIndex + 1];
              setSelected({ tower: nextTower.id, floor: Math.min(selected.floor, nextTower.floors - 1) });
              setExpandedTowers(prev => new Set([...prev, nextTower.id]));
            }
          }
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selected, towers]);

  const handleExport = () => {
    const config: ConfigData = { towers, polygons };
    exportConfig(config);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const data = await importConfig(file);
        setTowers(data.towers);
        if (data.polygons) {
          setPolygons(data.polygons);
        }
      } catch (error) {
        console.error('Failed to import config:', error);
      }
    }
  };

  return (
    <div className="w-full h-screen bg-gray-50 flex">
      {/* Left Panel - Tower/Floor List */}
      <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Етажи по блокове</h2>
        </div>
        
        <div className="p-2">
          {towers.map(tower => (
            <div key={tower.id} className="mb-2">
              <button
                onClick={() => toggleTowerExpansion(tower.id)}
                className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <span className="font-semibold text-gray-800">{tower.nameBG}</span>
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
          <div className="absolute top-4 left-4 z-10 flex gap-2">
            <button
              onClick={() => setCalibrationMode(!calibrationMode)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                calibrationMode 
                  ? 'bg-red-500 text-white hover:bg-red-600' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {calibrationMode ? 'Изход от калибрация' : 'Калибрация'}
            </button>
            
            {calibrationMode && (
              <>
                <button
                  onClick={generatePolygons}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
                >
                  Генерирай ленти
                </button>
                <button
                  onClick={handleExport}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
                >
                  Експорт
                </button>
                <label className="px-4 py-2 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition-colors cursor-pointer">
                  Импорт
                  <input type="file" accept=".json" onChange={handleImport} className="hidden" />
                </label>
              </>
            )}
          </div>
          
          <div className="relative w-full h-full p-16">
            <div className="relative w-full h-full">
              <img 
                src={IMG} 
                alt="Building" 
                className="w-full h-full object-contain"
              />
              
              {/* SVG Overlay */}
              <svg
                ref={svgRef}
                className="absolute inset-0 w-full h-full"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                style={{ pointerEvents: 'none' }}
              >
                <defs>
                  {/* Sweep gradient for hover effect */}
                  <linearGradient id="sweep" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="rgba(59, 130, 246, 0)" />
                    <stop offset="50%" stopColor="rgba(59, 130, 246, 0.3)" />
                    <stop offset="100%" stopColor="rgba(59, 130, 246, 0)" />
                    <animateTransform
                      attributeName="gradientTransform"
                      type="translate"
                      from="-1 0"
                      to="1 0"
                      dur="1s"
                      repeatCount="indefinite"
                    />
                  </linearGradient>
                  
                  {/* Glow filter */}
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                
                {/* Render floor polygons */}
                {polygons.map((polygon, index) => {
                  const isHovered = hover.tower === polygon.towerId && hover.floor === polygon.floorIndex;
                  const isSelected = selected.tower === polygon.towerId && selected.floor === polygon.floorIndex;
                  
                  return (
                    <motion.g
                      key={`${polygon.towerId}-${polygon.floorIndex}-${index}`}
                      data-tower={polygon.towerId}
                      data-floor={polygon.floorIndex}
                      style={{ pointerEvents: 'visiblePainted' }}
                      onMouseEnter={() => handleFloorHover(polygon.towerId, polygon.floorIndex)}
                      onMouseLeave={() => handleFloorHover(null, null)}
                      onClick={() => handleFloorClick(polygon.towerId, polygon.floorIndex)}
                    >
                      <motion.polygon
                        points={toPoints(polygon.points)}
                        fill={isHovered ? 'url(#sweep)' : isSelected ? 'rgba(59, 130, 246, 0.2)' : 'transparent'}
                        stroke={isHovered || isSelected ? 'rgba(59, 130, 246, 0.8)' : 'transparent'}
                        strokeWidth="0.2"
                        vectorEffect="non-scaling-stroke"
                        filter={isSelected ? 'url(#glow)' : undefined}
                        initial={{ opacity: 0 }}
                        animate={{ 
                          opacity: isHovered || isSelected ? 1 : 0,
                          transition: { duration: 0.2 }
                        }}
                        style={{ cursor: 'pointer' }}
                      />
                    </motion.g>
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
              const tower = towers.find(t => t.id === selected.tower);
              const floorData = FLOOR_DATA[selected.tower]?.[selected.floor];
              
              if (!tower || !floorData) return null;
              
              return (
                <>
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {tower.nameBG} - {getFloorName(selected.floor)}
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