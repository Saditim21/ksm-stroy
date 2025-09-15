import React, { useState } from 'react';
import buildingImage from '../assets/продажби/project 1/sgrada1.jpg';

const BuildingFloorMap = ({ setSelectedFloor, floorData = {} }) => {
  const [hoveredFloor, setHoveredFloor] = useState(null);

  // Precise floor polygon coordinates matching the building perspective
  // These coordinates trace the exact outline of each floor
  const floorPolygons = [
    {
      id: 8,
      name: 'Етаж 8',
      points: '12,20.5 88,20.5 87,26 13,26',
      available: true,
    },
    {
      id: 7,
      name: 'Етаж 7',
      points: '13,26.5 87,26.5 86,32 14,32',
      available: true,
    },
    {
      id: 6,
      name: 'Етаж 6',
      points: '14,32.5 86,32.5 85,38 15,38',
      available: false,
    },
    {
      id: 5,
      name: 'Етаж 5',
      points: '15,38.5 85,38.5 84,44 16,44',
      available: false,
    },
    {
      id: 4,
      name: 'Етаж 4',
      points: '16,44.5 84,44.5 83,50 17,50',
      available: true,
    },
    {
      id: 3,
      name: 'Етаж 3',
      points: '17,50.5 83,50.5 82,56 18,56',
      available: true,
    },
    {
      id: 2,
      name: 'Етаж 2',
      points: '18,56.5 82,56.5 81,62 19,62',
      available: true,
    },
    {
      id: 1,
      name: 'Етаж 1',
      points: '19,62.5 81,62.5 80,68 20,68',
      available: true,
    },
  ];

  const handleFloorHover = (floorId) => {
    setHoveredFloor(floorId);
  };

  const handleFloorClick = (floorId) => {
    if (setSelectedFloor) {
      setSelectedFloor(floorId);
    }
  };

  // Get color based on availability
  const getFloorColor = (floor, isHovered) => {
    if (isHovered) {
      return floor.available 
        ? 'rgba(34, 197, 94, 0.5)' // green for available
        : 'rgba(239, 68, 68, 0.5)'; // red for sold
    }
    return 'transparent';
  };

  const getStrokeColor = (floor, isHovered) => {
    if (isHovered) {
      return floor.available 
        ? 'rgba(34, 197, 94, 0.9)' // green stroke
        : 'rgba(239, 68, 68, 0.9)'; // red stroke
    }
    return 'transparent';
  };

  return (
    <div className="relative w-full h-full bg-gray-100">
      {/* Building Image Container */}
      <div className="relative w-full h-full">
        <img
          src={buildingImage}
          alt="Building"
          className="w-full h-full object-contain"
        />

        {/* SVG Overlay with precise Floor Polygons */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid slice"
          style={{ pointerEvents: 'none' }}
        >
          <defs>
            {/* Animated pulse effect for hovered floors */}
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {floorPolygons.map((floor) => {
            const isHovered = hoveredFloor === floor.id;
            return (
              <g key={floor.id}>
                {/* Shadow/glow effect when hovered */}
                {isHovered && (
                  <polygon
                    points={floor.points}
                    fill={getFloorColor(floor, true)}
                    stroke="none"
                    filter="url(#glow)"
                    className="animate-pulse"
                  />
                )}
                
                {/* Main floor polygon */}
                <polygon
                  points={floor.points}
                  fill={getFloorColor(floor, isHovered)}
                  stroke={getStrokeColor(floor, isHovered)}
                  strokeWidth={isHovered ? "0.5" : "0"}
                  className={`cursor-pointer transition-all duration-300 ${
                    isHovered ? 'opacity-100' : 'opacity-0 hover:opacity-100'
                  }`}
                  style={{ pointerEvents: 'auto' }}
                  onMouseEnter={() => handleFloorHover(floor.id)}
                  onMouseLeave={() => handleFloorHover(null)}
                  onClick={() => handleFloorClick(floor.id)}
                />

                {/* Invisible larger hit area for better mouse detection */}
                <polygon
                  points={floor.points}
                  fill="transparent"
                  stroke="transparent"
                  strokeWidth="2"
                  className="cursor-pointer"
                  style={{ pointerEvents: 'auto' }}
                  onMouseEnter={() => handleFloorHover(floor.id)}
                  onMouseLeave={() => handleFloorHover(null)}
                  onClick={() => handleFloorClick(floor.id)}
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Floor Info Tooltip */}
      {hoveredFloor && (
        <div className="absolute top-4 left-4 bg-white px-4 py-3 rounded-lg shadow-xl border-2 border-gray-200 animate-fadeIn">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${
              floorPolygons.find(f => f.id === hoveredFloor)?.available
                ? 'bg-green-500'
                : 'bg-red-500'
            }`} />
            <p className="text-sm font-bold text-gray-800">
              {floorPolygons.find(f => f.id === hoveredFloor)?.name}
            </p>
          </div>
          <p className="text-xs text-gray-600 mt-1">
            {floorPolygons.find(f => f.id === hoveredFloor)?.available
              ? '✓ Налични апартаменти'
              : '✗ Всички продадени'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Кликнете за детайли
          </p>
        </div>
      )}

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default BuildingFloorMap;