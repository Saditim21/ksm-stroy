import React, { useState } from 'react';
import buildingImage from '../assets/продажби/project 1/sgrada1.jpg';

const BuildingFloorMapExact = ({ setSelectedFloor, floorData = {} }) => {
  const [hoveredFloor, setHoveredFloor] = useState(null);

  // Precise floor polygons with minimal height for exact hover detection
  // These coordinates create thin horizontal strips for each floor
  const floorPolygons = [
    {
      id: 8,
      name: 'Етаж 8',
      // Very thin polygons (2-3% height) for precise floor detection
      points: '8,22 92,22 91.8,24.5 8.2,24.5',
      available: true,
      apartments: 3,
      sold: 1,
    },
    {
      id: 7,
      name: 'Етаж 7',
      points: '8.5,28 91.5,28 91.3,30.5 8.7,30.5',
      available: true,
      apartments: 4,
      sold: 2,
    },
    {
      id: 6,
      name: 'Етаж 6',
      points: '9,34 91,34 90.8,36.5 9.2,36.5',
      available: false,
      apartments: 4,
      sold: 4,
    },
    {
      id: 5,
      name: 'Етаж 5',
      points: '9.5,40 90.5,40 90.3,42.5 9.7,42.5',
      available: false,
      apartments: 4,
      sold: 4,
    },
    {
      id: 4,
      name: 'Етаж 4',
      points: '10,46 90,46 89.8,48.5 10.2,48.5',
      available: true,
      apartments: 4,
      sold: 1,
    },
    {
      id: 3,
      name: 'Етаж 3',
      points: '10.5,52 89.5,52 89.3,54.5 10.7,54.5',
      available: true,
      apartments: 4,
      sold: 0,
    },
    {
      id: 2,
      name: 'Етаж 2',
      points: '11,58 89,58 88.8,60.5 11.2,60.5',
      available: true,
      apartments: 4,
      sold: 2,
    },
    {
      id: 1,
      name: 'Етаж 1',
      points: '11.5,64 88.5,64 88.3,66.5 11.7,66.5',
      available: true,
      apartments: 4,
      sold: 1,
    },
    {
      id: 0,
      name: 'Партер',
      points: '12,70 88,70 87.8,72.5 12.2,72.5',
      available: true,
      apartments: 0,
      sold: 0,
    },
  ];

  const handleFloorClick = (floorId) => {
    if (setSelectedFloor) {
      setSelectedFloor(floorId);
    }
  };

  return (
    <div className="relative w-full h-full bg-gray-50 overflow-hidden">
      {/* Main Container with centered image */}
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Building Image Container */}
        <div className="relative">
          <img
            src={buildingImage}
            alt="Building"
            className="max-w-full max-h-full object-contain"
          />

          {/* SVG Overlay for Floor Detection */}
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid slice"
          >
            {/* Define gradients */}
            <defs>
              {/* Green gradient with animation */}
              <linearGradient id="greenGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.2">
                  <animate attributeName="stop-opacity" 
                    values="0.2;0.5;0.2" dur="2s" repeatCount="indefinite" />
                </stop>
                <stop offset="50%" stopColor="#10b981" stopOpacity="0.4">
                  <animate attributeName="stop-opacity" 
                    values="0.4;0.6;0.4" dur="2s" repeatCount="indefinite" />
                </stop>
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.2">
                  <animate attributeName="stop-opacity" 
                    values="0.2;0.5;0.2" dur="2s" repeatCount="indefinite" />
                </stop>
              </linearGradient>

              {/* Red gradient with animation */}
              <linearGradient id="redGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.2">
                  <animate attributeName="stop-opacity" 
                    values="0.2;0.5;0.2" dur="2s" repeatCount="indefinite" />
                </stop>
                <stop offset="50%" stopColor="#ef4444" stopOpacity="0.4">
                  <animate attributeName="stop-opacity" 
                    values="0.4;0.6;0.4" dur="2s" repeatCount="indefinite" />
                </stop>
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0.2">
                  <animate attributeName="stop-opacity" 
                    values="0.2;0.5;0.2" dur="2s" repeatCount="indefinite" />
                </stop>
              </linearGradient>

              {/* Soft glow filter */}
              <filter id="softGlow">
                <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* Render floor polygons */}
            {floorPolygons.map((floor) => {
              const isHovered = hoveredFloor === floor.id;
              const fillColor = floor.available ? 'url(#greenGrad)' : 'url(#redGrad)';
              const strokeColor = floor.available ? '#10b981' : '#ef4444';
              
              return (
                <g key={floor.id}>
                  {/* Visible polygon on hover */}
                  <polygon
                    points={floor.points}
                    fill={isHovered ? fillColor : 'transparent'}
                    stroke={isHovered ? strokeColor : 'transparent'}
                    strokeWidth={isHovered ? '0.2' : '0'}
                    filter={isHovered ? 'url(#softGlow)' : 'none'}
                    opacity={isHovered ? '1' : '0'}
                    className="transition-all duration-200 ease-in-out cursor-pointer"
                    style={{ pointerEvents: 'auto' }}
                    onMouseEnter={() => setHoveredFloor(floor.id)}
                    onMouseLeave={() => setHoveredFloor(null)}
                    onClick={() => handleFloorClick(floor.id)}
                  />
                  
                  {/* Invisible hit area (slightly larger for better detection) */}
                  <polygon
                    points={floor.points}
                    fill="transparent"
                    stroke="transparent"
                    strokeWidth="1"
                    className="cursor-pointer"
                    style={{ pointerEvents: 'auto' }}
                    onMouseEnter={() => setHoveredFloor(floor.id)}
                    onMouseLeave={() => setHoveredFloor(null)}
                    onClick={() => handleFloorClick(floor.id)}
                  />
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Minimalist Info Tooltip */}
      {hoveredFloor !== null && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 
                      bg-white/95 backdrop-blur-sm rounded-lg shadow-lg 
                      px-4 py-2 flex items-center gap-3 animate-fadeUp">
          {/* Status Indicator */}
          <div className={`w-2 h-2 rounded-full ${
            floorPolygons.find(f => f.id === hoveredFloor)?.available
              ? 'bg-green-500'
              : 'bg-red-500'
          } animate-pulse`} />
          
          {/* Floor Name */}
          <span className="font-semibold text-gray-800">
            {floorPolygons.find(f => f.id === hoveredFloor)?.name}
          </span>
          
          {/* Availability */}
          <span className="text-sm text-gray-600">
            {(() => {
              const floor = floorPolygons.find(f => f.id === hoveredFloor);
              if (!floor) return '';
              if (floor.id === 0) return 'Гаражи и паркоместа';
              const available = floor.apartments - floor.sold;
              return floor.available 
                ? `${available} от ${floor.apartments} свободни`
                : 'Всички продадени';
            })()}
          </span>

          {/* Click hint */}
          <span className="text-xs text-gray-400 border-l pl-3">
            Кликнете за детайли
          </span>
        </div>
      )}

      {/* Custom animations */}
      <style jsx>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translate(-50%, 10px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        .animate-fadeUp {
          animation: fadeUp 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default BuildingFloorMapExact;