import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FloorData {
  id: number;
  name: string;
  height: number; // Floor height in building
  apartments: Array<{
    property: string;
    type: string;
    builtArea: string;
    totalArea: string;
    exposure: string;
    status: 'Налично' | 'Резервирано' | 'Продадено';
  }>;
  image?: string;
}

const FLOORS_DATA: FloorData[] = [
  {
    id: 0,
    name: 'Партер/Гаражи',
    height: 0,
    apartments: [
      { property: 'Гараж 01', type: 'Гаражно място', builtArea: '12.5 м²', totalArea: '12.5 м²', exposure: 'Север', status: 'Налично' },
      { property: 'Гараж 02', type: 'Гаражно място', builtArea: '13.2 м²', totalArea: '13.2 м²', exposure: 'Север', status: 'Продадено' },
    ]
  },
  {
    id: 1,
    name: 'Етаж 1',
    height: 1,
    apartments: [
      { property: 'Ап. 101', type: 'Двустаен', builtArea: '68.5 м²', totalArea: '72.3 м²', exposure: 'Изток/Запад', status: 'Налично' },
      { property: 'Ап. 102', type: 'Тристаен', builtArea: '95.2 м²', totalArea: '98.7 м²', exposure: 'Юг/Изток', status: 'Резервирано' },
    ]
  },
  {
    id: 2,
    name: 'Етаж 2',
    height: 2,
    apartments: [
      { property: 'Ап. 201', type: 'Двустаен', builtArea: '68.5 м²', totalArea: '72.3 м²', exposure: 'Изток/Запад', status: 'Продадено' },
      { property: 'Ап. 202', type: 'Тристаен', builtArea: '95.2 м²', totalArea: '98.7 м²', exposure: 'Юг/Изток', status: 'Налично' },
    ]
  },
  {
    id: 3,
    name: 'Етаж 3',
    height: 3,
    apartments: [
      { property: 'Ап. 301', type: 'Двустаен', builtArea: '68.5 м²', totalArea: '72.3 м²', exposure: 'Изток/Запад', status: 'Налично' },
      { property: 'Ап. 302', type: 'Тристаен', builtArea: '95.2 м²', totalArea: '98.7 м²', exposure: 'Юг/Изток', status: 'Налично' },
    ]
  },
  {
    id: 4,
    name: 'Етаж 4',
    height: 4,
    apartments: [
      { property: 'Ап. 401', type: 'Двустаен', builtArea: '68.5 м²', totalArea: '72.3 м²', exposure: 'Изток/Запад', status: 'Продадено' },
      { property: 'Ап. 402', type: 'Тристаен', builtArea: '95.2 м²', totalArea: '98.7 м²', exposure: 'Юг/Изток', status: 'Налично' },
    ]
  },
  {
    id: 5,
    name: 'Етаж 5',
    height: 5,
    apartments: [
      { property: 'Ап. 501', type: 'Двустаен', builtArea: '68.5 м²', totalArea: '72.3 м²', exposure: 'Изток/Запад', status: 'Налично' },
      { property: 'Ап. 502', type: 'Тристаен', builtArea: '95.2 м²', totalArea: '98.7 м²', exposure: 'Юг/Изток', status: 'Резервирано' },
    ]
  },
  {
    id: 6,
    name: 'Етаж 6',
    height: 6,
    apartments: [
      { property: 'Ап. 601', type: 'Двустаен', builtArea: '68.5 м²', totalArea: '72.3 м²', exposure: 'Изток/Запад', status: 'Налично' },
      { property: 'Ап. 602', type: 'Тристаен', builtArea: '95.2 м²', totalArea: '98.7 м²', exposure: 'Юг/Изток', status: 'Налично' },
    ]
  },
];

const FloorLayer: React.FC<{
  floor: FloorData;
  index: number;
  isSelected: boolean;
  isHovered: boolean;
  onHover: (id: number | null) => void;
  onClick: (id: number) => void;
  totalFloors: number;
}> = ({ floor, index, isSelected, isHovered, onHover, onClick, totalFloors }) => {
  
  const getFloorColor = (status: string) => {
    const available = floor.apartments.filter(apt => apt.status === 'Налично').length;
    const total = floor.apartments.length;
    
    if (available === 0) return 'from-red-500/80 to-red-600/80';
    if (available === total) return 'from-green-500/80 to-green-600/80';
    return 'from-yellow-500/80 to-yellow-600/80';
  };

  const baseOffset = (totalFloors - 1 - index) * 60; // Stack from top to bottom
  const selectedOffset = isSelected ? 200 : 0; // Pull out selected floor
  const hoverOffset = isHovered && !isSelected ? 20 : 0; // Slight hover effect

  return (
    <motion.div
      className="absolute inset-0 cursor-pointer"
      style={{
        transform: `translateY(${baseOffset + selectedOffset + hoverOffset}px) rotateX(${isSelected ? -15 : -5}deg) scale(${isSelected ? 1.1 : 1})`,
        transformOrigin: 'center center',
        zIndex: isSelected ? 100 : totalFloors - index,
      }}
      animate={{
        transform: `translateY(${baseOffset + selectedOffset + hoverOffset}px) rotateX(${isSelected ? -15 : -5}deg) scale(${isSelected ? 1.1 : 1})`,
      }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 25,
        duration: 0.6
      }}
      onHoverStart={() => onHover(floor.id)}
      onHoverEnd={() => onHover(null)}
      onClick={() => onClick(floor.id)}
    >
      {/* Floor Plane */}
      <div className={`relative w-full h-20 bg-gradient-to-br ${getFloorColor('')} backdrop-blur-sm border-2 border-white/20 rounded-lg shadow-2xl overflow-hidden`}>
        
        {/* Floor Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
          <div className="absolute top-0 left-0 w-full h-full" 
               style={{
                 backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 10px, white/5 10px, white/5 12px)`,
               }}>
          </div>
        </div>

        {/* Floor Content */}
        <div className="relative z-10 h-full flex items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <span className="text-white font-bold text-lg">{floor.id === 0 ? 'P' : floor.id}</span>
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">{floor.name}</h3>
              <p className="text-white/80 text-sm">
                {floor.apartments.length} {floor.id === 0 ? 'места' : 'апартамента'}
              </p>
            </div>
          </div>

          {/* Apartment Status Indicators */}
          <div className="flex space-x-2">
            {floor.apartments.map((apt, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full border border-white/30 ${
                  apt.status === 'Налично' 
                    ? 'bg-green-400' 
                    : apt.status === 'Резервирано'
                    ? 'bg-yellow-400'
                    : 'bg-red-400'
                }`}
                title={`${apt.property} - ${apt.status}`}
              />
            ))}
          </div>
        </div>

        {/* Hover Effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
          initial={{ x: '-100%' }}
          animate={{ x: isHovered || isSelected ? '100%' : '-100%' }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        />

        {/* Selection Glow */}
        {isSelected && (
          <motion.div
            className="absolute -inset-1 bg-gradient-to-r from-blue-500/50 to-purple-500/50 rounded-lg blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            style={{ zIndex: -1 }}
          />
        )}
      </div>

      {/* Floor Side Panels (3D Effect) */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -right-2 top-2 w-2 h-16 bg-gradient-to-b from-gray-600 to-gray-800 transform skew-y-12 opacity-60"></div>
        <div className="absolute -bottom-2 left-2 w-full h-2 bg-gradient-to-r from-gray-600 to-gray-800 transform -skew-x-12 opacity-60"></div>
      </div>
    </motion.div>
  );
};

const FloorMap: React.FC = () => {
  const [selectedFloorId, setSelectedFloorId] = useState<number | null>(null);
  const [hoveredFloorId, setHoveredFloorId] = useState<number | null>(null);

  const selectedFloor = selectedFloorId !== null ? FLOORS_DATA.find(f => f.id === selectedFloorId) : null;

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          setSelectedFloorId(prev => {
            const current = prev ?? -1;
            return Math.min(current + 1, FLOORS_DATA.length - 1);
          });
          break;
        case 'ArrowDown':
          e.preventDefault();
          setSelectedFloorId(prev => {
            const current = prev ?? 1;
            return Math.max(current - 1, 0);
          });
          break;
        case 'Escape':
          setSelectedFloorId(null);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="w-full h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900 text-white overflow-hidden">
      
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      <div className="relative z-10 h-full flex">
        
        {/* Left Panel - Floor Navigator */}
        <div className="w-80 bg-black/20 backdrop-blur-xl border-r border-white/10 p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Етажи
            </h1>
            <p className="text-gray-300">Интерактивен изглед на сградата</p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white/5 rounded-lg p-3 text-center border border-white/10">
              <div className="text-2xl font-bold text-green-400">{FLOORS_DATA.reduce((sum, floor) => sum + floor.apartments.filter(apt => apt.status === 'Налично').length, 0)}</div>
              <div className="text-xs text-gray-400">Налични</div>
            </div>
            <div className="bg-white/5 rounded-lg p-3 text-center border border-white/10">
              <div className="text-2xl font-bold text-yellow-400">{FLOORS_DATA.reduce((sum, floor) => sum + floor.apartments.filter(apt => apt.status === 'Резервирано').length, 0)}</div>
              <div className="text-xs text-gray-400">Резервирани</div>
            </div>
            <div className="bg-white/5 rounded-lg p-3 text-center border border-white/10">
              <div className="text-2xl font-bold text-red-400">{FLOORS_DATA.reduce((sum, floor) => sum + floor.apartments.filter(apt => apt.status === 'Продадено').length, 0)}</div>
              <div className="text-xs text-gray-400">Продадени</div>
            </div>
          </div>

          {/* Floor List */}
          <div className="space-y-3">
            {FLOORS_DATA.map((floor, index) => (
              <motion.button
                key={floor.id}
                className={`w-full p-4 rounded-xl text-left transition-all duration-300 border-2 ${
                  selectedFloorId === floor.id
                    ? 'bg-blue-500/20 border-blue-400 text-blue-300 shadow-lg shadow-blue-500/25'
                    : hoveredFloorId === floor.id
                    ? 'bg-white/10 border-white/30 text-white'
                    : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20'
                }`}
                onMouseEnter={() => setHoveredFloorId(floor.id)}
                onMouseLeave={() => setHoveredFloorId(null)}
                onClick={() => setSelectedFloorId(floor.id)}
                whileHover={{ scale: 1.02, x: 8 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-lg">{floor.name}</div>
                    <div className="text-sm opacity-70">
                      {floor.apartments.filter(apt => apt.status === 'Налични').length} от {floor.apartments.length} налични
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-sm font-bold">
                      {floor.id === 0 ? 'P' : floor.id}
                    </div>
                    <svg className="w-5 h-5 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Controls */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="text-sm text-gray-400 space-y-2">
              <div>↑↓ Навигация с клавиатура</div>
              <div>ESC Затвори детайли</div>
              <div>Кликни върху етаж за повече</div>
            </div>
          </div>
        </div>

        {/* Center Panel - 3D Building */}
        <div className="flex-1 relative">
          <div className="absolute inset-0 flex items-center justify-center" style={{ perspective: '1200px' }}>
            <div className="relative w-96 h-96" style={{ transformStyle: 'preserve-3d' }}>
              
              {/* Building Base */}
              <div className="absolute inset-0 -z-10">
                <div className="w-full h-full bg-gradient-to-b from-gray-800/30 to-gray-900/50 rounded-lg transform translate-y-8 scale-110 blur-xl opacity-50"></div>
              </div>

              {/* Floor Layers */}
              {FLOORS_DATA.map((floor, index) => (
                <FloorLayer
                  key={floor.id}
                  floor={floor}
                  index={index}
                  isSelected={selectedFloorId === floor.id}
                  isHovered={hoveredFloorId === floor.id}
                  onHover={setHoveredFloorId}
                  onClick={setSelectedFloorId}
                  totalFloors={FLOORS_DATA.length}
                />
              ))}

              {/* Building Info */}
              <motion.div
                className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h2 className="text-2xl font-bold text-white mb-2">Многофамилна жилищна сграда</h2>
                <p className="text-gray-400">УПИ V-1344, кв. 33, ж.к. Връбница-1, гр. София</p>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Right Panel - Floor Details */}
        <AnimatePresence mode="wait">
          {selectedFloor && (
            <motion.div
              initial={{ opacity: 0, x: 100, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.95 }}
              transition={{ 
                type: "spring", 
                stiffness: 200, 
                damping: 25,
                duration: 0.6 
              }}
              className="w-96 bg-black/20 backdrop-blur-xl border-l border-white/10 p-6 overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    {selectedFloor.name}
                  </h2>
                  <p className="text-gray-400">Детайли за имотите</p>
                </div>
                <button
                  onClick={() => setSelectedFloorId(null)}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors border border-white/20"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Floor Plan Preview */}
              <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="aspect-video bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <svg className="w-12 h-12 mx-auto mb-2 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-white/60">Архитектурен план</p>
                  </div>
                </div>
              </div>

              {/* Apartments */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Имоти на етажа</h3>
                
                {selectedFloor.apartments.map((apt, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 bg-white/5 rounded-xl border border-white/10"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-white">{apt.property}</h4>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        apt.status === 'Налично' 
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : apt.status === 'Резервирано'
                          ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        {apt.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="text-gray-400">Тип</div>
                        <div className="text-white font-medium">{apt.type}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Застроена площ</div>
                        <div className="text-white font-medium">{apt.builtArea}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Обща площ</div>
                        <div className="text-white font-medium">{apt.totalArea}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Изложение</div>
                        <div className="text-white font-medium">{apt.exposure}</div>
                      </div>
                    </div>

                    {apt.status === 'Налично' && (
                      <button className="w-full mt-3 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300">
                        Запитване за {apt.property}
                      </button>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FloorMap;