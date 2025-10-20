import React, { useState } from 'react';

const GoldenResidenceFloorMap = ({ onHoverChange, currentImage, onFloorSelect }) => {
  const [currentBlockAImage, setCurrentBlockAImage] = useState('/src/assets/продажби/project 2/golden-residence.jpg');
  const [currentBlockBImage, setCurrentBlockBImage] = useState('/src/assets/продажби/project 2/golden-residence.jpg');
  
  const handleBlockAFloorHover = (floorNumber) => {
    if (onHoverChange) {
      const isHovering = floorNumber !== null;
      onHoverChange(isHovering, floorNumber);
    }
    
    if (floorNumber && floorNumber >= 1 && floorNumber <= 8) {
      const imageUrl = `/src/assets/продажби/project 2/building-2-blog-a-floor${floorNumber}.png`;
      setCurrentBlockAImage(imageUrl);
    } else {
      setCurrentBlockAImage('/src/assets/продажби/project 2/golden-residence.jpg');
    }
  };

  const handleBlockBFloorHover = (floorNumber) => {
    if (onHoverChange) {
      const isHovering = floorNumber !== null;
      onHoverChange(isHovering, floorNumber);
    }
    
    if (floorNumber && floorNumber >= 1 && floorNumber <= 8) {
      const imageUrl = `/src/assets/продажби/project 2/building-2-blog-b-floor${floorNumber}.png`;
      setCurrentBlockBImage(imageUrl);
    } else {
      setCurrentBlockBImage('/src/assets/продажби/project 2/golden-residence.jpg');
    }
  };

  return (
    <div className="w-full h-full overflow-y-auto">
      {/* Block A Section */}
      <div className="w-full h-screen flex border-b-4 border-gold-400">
        {/* Building Image with hover areas */}
        <div className="flex-1 p-8">
          <div className="h-full bg-gray-800 rounded-lg overflow-hidden relative">
            <img 
              src={currentBlockAImage}
              alt="Block A"
              className="w-full h-full object-contain"
            />
            
            {/* Floor hover areas overlay */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              {/* Block A Floors 1-8 hover areas */}
              {[
                { floor: 8, x: 20, y: 32, width: 60, height: 5 },
                { floor: 7, x: 20, y: 36, width: 60, height: 5 },
                { floor: 6, x: 20, y: 42, width: 60, height: 5 },
                { floor: 5, x: 20, y: 48, width: 60, height: 5 },
                { floor: 4, x: 20, y: 52, width: 60, height: 5 },
                { floor: 3, x: 20, y: 56, width: 60, height: 5 },
                { floor: 2, x: 20, y: 62, width: 60, height: 5 },
                { floor: 1, x: 20, y: 66, width: 60, height: 5 }
              ].map(({ floor, x, y, width, height }) => (
                <rect
                  key={`a-${floor}`}
                  x={x}
                  y={y}
                  width={width}
                  height={height}
                  fill="transparent"
                  stroke="transparent"
                  strokeWidth="0"
                  className="cursor-pointer"
                  style={{ pointerEvents: 'auto' }}
                  onMouseEnter={() => handleBlockAFloorHover(floor)}
                  onMouseLeave={() => handleBlockAFloorHover(null)}
                  onClick={() => onFloorSelect && onFloorSelect('BLOCK_A', floor)}
                />
              ))}
            </svg>
          </div>
        </div>

        {/* Block A Menu */}
        <div className="w-96 bg-black/50 border-l border-white/10 p-6">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-white mb-2">
              Блок А
            </h3>
          </div>
          
          {/* Block A Floors Menu */}
          <div className="space-y-1">
            {[8, 7, 6, 5, 4, 3, 2, 1].map((floor) => (
              <div 
                key={`menu-a-${floor}`}
                className="bg-gray-800 rounded-lg p-2 hover:bg-gray-700 transition-colors cursor-pointer"
                onMouseEnter={() => handleBlockAFloorHover(floor)}
                onMouseLeave={() => handleBlockAFloorHover(null)}
                onClick={() => onFloorSelect && onFloorSelect('BLOCK_A', floor)}
              >
                <div className="flex justify-between items-center">
                  <span className="text-white font-medium">Етаж {floor}</span>
                  <span className="text-gold-400 text-sm">12 апартамента</span>
                </div>
              </div>
            ))}
            
            {/* Ground Floor */}
            <div 
              className="bg-gray-800 rounded-lg p-2 hover:bg-gray-700 transition-colors cursor-pointer"
              onMouseEnter={() => handleBlockAFloorHover(0)}
              onMouseLeave={() => handleBlockAFloorHover(null)}
            >
              <div className="flex justify-between items-center">
                <span className="text-white font-medium">Приземен етаж</span>
                <span className="text-gray-400 text-sm">Гаражи</span>
              </div>
            </div>
            
            {/* Underground Floor */}
            <div 
              className="bg-gray-800 rounded-lg p-2 hover:bg-gray-700 transition-colors cursor-pointer"
              onMouseEnter={() => handleBlockAFloorHover(-1)}
              onMouseLeave={() => handleBlockAFloorHover(null)}
            >
              <div className="flex justify-between items-center">
                <span className="text-white font-medium">Подземен етаж</span>
                <span className="text-gray-400 text-sm">Гаражи</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Block B Section */}
      <div className="w-full h-screen flex bg-gray-900/20">
        {/* Building Image with hover areas */}
        <div className="flex-1 p-8">
          <div className="h-full bg-gray-800 rounded-lg overflow-hidden relative">
            <img 
              src={currentBlockBImage}
              alt="Block B"
              className="w-full h-full object-contain"
            />
            
            {/* Floor hover areas overlay */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              {/* Block B Floors 1-8 hover areas */}
              {[
                { floor: 8, x: 20, y: 32, width: 80, height: 5 },
                { floor: 7, x: 20, y: 36, width: 80, height: 5 },
                { floor: 6, x: 20, y: 42, width: 80, height: 5 },
                { floor: 5, x: 20, y: 48, width: 80, height: 5 },
                { floor: 4, x: 20, y: 52, width: 80, height: 5 },
                { floor: 3, x: 20, y: 56, width: 80, height: 5 },
                { floor: 2, x: 20, y: 62, width: 80, height: 5 },
                { floor: 1, x: 20, y: 66, width: 80, height: 5 }
              ].map(({ floor, x, y, width, height }) => (
                <rect
                  key={`b-${floor}`}
                  x={x}
                  y={y}
                  width={width}
                  height={height}
                  fill="transparent"
                  stroke="transparent"
                  strokeWidth="0"
                  className="cursor-pointer"
                  style={{ pointerEvents: 'auto' }}
                  onMouseEnter={() => handleBlockBFloorHover(floor)}
                  onMouseLeave={() => handleBlockBFloorHover(null)}
                  onClick={() => onFloorSelect && onFloorSelect('BLOCK_B', floor)}
                />
              ))}
            </svg>
          </div>
        </div>

        {/* Block B Menu */}
        <div className="w-96 bg-black/50 border-l border-white/10 p-6">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-white mb-2">
              Блок Б
            </h3>
          </div>
          
          {/* Block B Floors Menu */}
          <div className="space-y-1">
            {[8, 7, 6, 5, 4, 3, 2, 1].map((floor) => (
              <div 
                key={`menu-b-${floor}`}
                className="bg-gray-800 rounded-lg p-2 hover:bg-gray-700 transition-colors cursor-pointer"
                onMouseEnter={() => handleBlockBFloorHover(floor)}
                onMouseLeave={() => handleBlockBFloorHover(null)}
                onClick={() => onFloorSelect && onFloorSelect('BLOCK_B', floor)}
              >
                <div className="flex justify-between items-center">
                  <span className="text-white font-medium">Етаж {floor}</span>
                  <span className="text-gold-400 text-sm">12 апартамента</span>
                </div>
              </div>
            ))}
            
            {/* Ground Floor */}
            <div 
              className="bg-gray-800 rounded-lg p-2 hover:bg-gray-700 transition-colors cursor-pointer"
              onMouseEnter={() => handleBlockBFloorHover(0)}
              onMouseLeave={() => handleBlockBFloorHover(null)}
            >
              <div className="flex justify-between items-center">
                <span className="text-white font-medium">Приземен етаж</span>
                <span className="text-gray-400 text-sm">Гаражи</span>
              </div>
            </div>
            
            {/* Underground Floor */}
            <div 
              className="bg-gray-800 rounded-lg p-2 hover:bg-gray-700 transition-colors cursor-pointer"
              onMouseEnter={() => handleBlockBFloorHover(-1)}
              onMouseLeave={() => handleBlockBFloorHover(null)}
            >
              <div className="flex justify-between items-center">
                <span className="text-white font-medium">Подземен етаж</span>
                <span className="text-gray-400 text-sm">Гаражи</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoldenResidenceFloorMap;