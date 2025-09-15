import React, { useState, useRef, useEffect } from 'react';
import buildingImage from '../assets/продажби/project 1/sgrada1.jpg';

const BuildingFloorMapPrecise = ({ setSelectedFloor, floorData = {} }) => {
  const [hoveredFloor, setHoveredFloor] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const containerRef = useRef(null);

  // Ultra-precise floor polygon coordinates with smaller heights
  // Each floor is a thin strip matching the actual floor height in the building
  const floorPolygons = [
    {
      id: 8,
      name: 'Етаж 8',
      // Smaller height polygons for precise floor detection
      points: '10,21 90,21 89.5,24 10.5,24',
      available: true,
      apartments: 3,
      sold: 1,
    },
    {
      id: 7,
      name: 'Етаж 7',
      points: '10.5,27 89.5,27 89,30 11,30',
      available: true,
      apartments: 4,
      sold: 2,
    },
    {
      id: 6,
      name: 'Етаж 6',
      points: '11,33 89,33 88.5,36 11.5,36',
      available: false,
      apartments: 4,
      sold: 4,
    },
    {
      id: 5,
      name: 'Етаж 5',
      points: '11.5,39 88.5,39 88,42 12,42',
      available: false,
      apartments: 4,
      sold: 4,
    },
    {
      id: 4,
      name: 'Етаж 4',
      points: '12,45 88,45 87.5,48 12.5,48',
      available: true,
      apartments: 4,
      sold: 1,
    },
    {
      id: 3,
      name: 'Етаж 3',
      points: '12.5,51 87.5,51 87,54 13,54',
      available: true,
      apartments: 4,
      sold: 0,
    },
    {
      id: 2,
      name: 'Етаж 2',
      points: '13,57 87,57 86.5,60 13.5,60',
      available: true,
      apartments: 4,
      sold: 2,
    },
    {
      id: 1,
      name: 'Етаж 1',
      points: '13.5,63 86.5,63 86,66 14,66',
      available: true,
      apartments: 4,
      sold: 1,
    },
  ];

  useEffect(() => {
    // Preload image
    const img = new Image();
    img.src = buildingImage;
    img.onload = () => setImageLoaded(true);
  }, []);

  const handleFloorHover = (floorId) => {
    setHoveredFloor(floorId);
  };

  const handleFloorClick = (floorId) => {
    if (setSelectedFloor) {
      setSelectedFloor(floorId);
    }
  };

  // Dynamic color based on availability
  const getFloorFill = (floor, isHovered) => {
    if (!isHovered) return 'transparent';
    
    if (floor.available) {
      // Green gradient for available floors
      return 'url(#greenGradient)';
    } else {
      // Red gradient for sold out floors
      return 'url(#redGradient)';
    }
  };

  const getFloorStroke = (floor, isHovered) => {
    if (!isHovered) return 'transparent';
    return floor.available ? '#10b981' : '#ef4444';
  };

  return (
    <div ref={containerRef} className="relative w-full h-full bg-gray-50">
      {/* Main Container */}
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Building Image */}
        <div className="relative max-w-full max-h-full">
          <img
            src={buildingImage}
            alt="Building"
            className={`max-w-full max-h-full object-contain transition-opacity duration-500 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
          />

          {/* SVG Overlay - Absolute positioned to match image exactly */}
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid meet"
            style={{ pointerEvents: 'none' }}
          >
            {/* Define gradients and effects */}
            <defs>
              {/* Green gradient for available floors */}
              <linearGradient id="greenGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.5" />
              </linearGradient>
              
              {/* Red gradient for sold floors */}
              <linearGradient id="redGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0.5" />
              </linearGradient>

              {/* Glow effect */}
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>

              {/* Pulsing animation */}
              <animate id="pulse" attributeName="opacity" 
                values="0.5;0.8;0.5" 
                dur="2s" 
                repeatCount="indefinite" />
            </defs>

            {/* Floor Polygons */}
            {floorPolygons.map((floor) => {
              const isHovered = hoveredFloor === floor.id;
              
              return (
                <g key={floor.id}>
                  {/* Glow layer (only when hovered) */}
                  {isHovered && (
                    <polygon
                      points={floor.points}
                      fill={getFloorFill(floor, true)}
                      stroke="none"
                      filter="url(#glow)"
                      opacity="0.6"
                      className="animate-pulse"
                    />
                  )}
                  
                  {/* Main interactive polygon */}
                  <polygon
                    points={floor.points}
                    fill={getFloorFill(floor, isHovered)}
                    stroke={getFloorStroke(floor, isHovered)}
                    strokeWidth={isHovered ? "0.3" : "0"}
                    opacity={isHovered ? "1" : "0"}
                    className="cursor-pointer transition-all duration-200 ease-out"
                    style={{ 
                      pointerEvents: 'auto',
                      transformOrigin: 'center',
                      transform: isHovered ? 'scale(1.01)' : 'scale(1)'
                    }}
                    onMouseEnter={() => handleFloorHover(floor.id)}
                    onMouseLeave={() => handleFloorHover(null)}
                    onClick={() => handleFloorClick(floor.id)}
                  />

                  {/* Extended hit area for easier hovering */}
                  <polygon
                    points={floor.points}
                    fill="transparent"
                    stroke="transparent"
                    strokeWidth="3"
                    className="cursor-pointer"
                    style={{ pointerEvents: 'auto' }}
                    onMouseEnter={() => handleFloorHover(floor.id)}
                    onMouseLeave={() => handleFloorHover(null)}
                    onClick={() => handleFloorClick(floor.id)}
                  />

                  {/* Floor number label (when hovered) */}
                  {isHovered && (
                    <text
                      x="50"
                      y={parseInt(floor.points.split(' ')[0].split(',')[1]) + 3}
                      textAnchor="middle"
                      className="fill-white font-bold text-xs pointer-events-none select-none"
                      style={{ fontSize: '2px' }}
                    >
                      {floor.name}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Floating Info Card */}
      {hoveredFloor && (
        <div className="absolute top-4 right-4 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 min-w-[200px] animate-slideIn">
          {/* Floor Header */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-gray-800">
              {floorPolygons.find(f => f.id === hoveredFloor)?.name}
            </h3>
            <div className={`w-3 h-3 rounded-full animate-pulse ${
              floorPolygons.find(f => f.id === hoveredFloor)?.available
                ? 'bg-green-500'
                : 'bg-red-500'
            }`} />
          </div>

          {/* Status Badge */}
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold mb-3 ${
            floorPolygons.find(f => f.id === hoveredFloor)?.available
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {floorPolygons.find(f => f.id === hoveredFloor)?.available
              ? '✓ Налични апартаменти'
              : '✗ Всички продадени'}
          </div>

          {/* Apartment Stats */}
          {(() => {
            const floor = floorPolygons.find(f => f.id === hoveredFloor);
            const available = floor.apartments - floor.sold;
            return (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Общо апартаменти:</span>
                  <span className="font-semibold">{floor.apartments}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Свободни:</span>
                  <span className="font-semibold text-green-600">{available}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Продадени:</span>
                  <span className="font-semibold text-red-600">{floor.sold}</span>
                </div>
                
                {/* Progress Bar */}
                <div className="mt-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(available / floor.apartments) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {Math.round((available / floor.apartments) * 100)}% налични
                  </p>
                </div>
              </div>
            );
          })()}

          {/* CTA */}
          <button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors duration-200">
            Виж апартаментите →
          </button>
        </div>
      )}

      {/* Loading Spinner */}
      {!imageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default BuildingFloorMapPrecise;