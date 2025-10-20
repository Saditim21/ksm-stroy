import React, { useState } from 'react';

const GoldenResidenceFloorMap = ({ onHoverChange, currentImage, onFloorSelect }) => {
  const [currentBlockAImage, setCurrentBlockAImage] = useState('/src/assets/продажби/project 2/golden-residence.jpg');
  const [currentBlockBImage, setCurrentBlockBImage] = useState('/src/assets/продажби/project 2/golden-residence.jpg');
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [isArchitecturePlanFullscreen, setIsArchitecturePlanFullscreen] = useState(false);
  const [selectedApartment, setSelectedApartment] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePosition, setLastMousePosition] = useState({ x: 0, y: 0 });

  // Block A Floor 1 apartment data
  const blockAFloor1Data = [
    { apartment: 'А 101', built: '57.46', ideal: '8.22', total: '65.68', status: 'Свободен' },
    { apartment: 'А 102', built: '97.74', ideal: '14.00', total: '111.74', status: 'Свободен' },
    { apartment: 'А 103', built: '93.78', ideal: '13.46', total: '107.24', status: 'Свободен' },
    { apartment: 'А 104', built: '59.36', ideal: '8.52', total: '67.88', status: 'Свободен' },
    { apartment: 'А 105', built: '59.36', ideal: '8.52', total: '67.88', status: 'Свободен' },
    { apartment: 'А 106', built: '100.20', ideal: '14.38', total: '114.58', status: 'Свободен' },
    { apartment: 'А 107', built: '61.11', ideal: '8.77', total: '69.88', status: 'Свободен' },
    { apartment: 'А 108', built: '61.11', ideal: '8.77', total: '69.88', status: 'Свободен' },
    { apartment: 'А 109', built: '61.11', ideal: '8.77', total: '69.88', status: 'Свободен' },
    { apartment: 'А 110', built: '94.94', ideal: '13.62', total: '108.56', status: 'Свободен' },
    { apartment: 'А 111', built: '51.88', ideal: '7.43', total: '59.31', status: 'Свободен' },
    { apartment: 'А 112', built: '38.46', ideal: '5.52', total: '43.98', type: 'АТЕЛИЕ', status: 'Свободен' }
  ];
  
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

  const handleFloorClick = (block, floor) => {
    if (block === 'A' && floor === 1) {
      setSelectedFloor({ block: 'A', floor: 1, data: blockAFloor1Data });
    }
    // Add more floor data as needed
  };

  const closeFloorDetails = () => {
    setSelectedFloor(null);
  };

  const openArchitecturePlanFullscreen = () => {
    setIsArchitecturePlanFullscreen(true);
  };

  const closeArchitecturePlanFullscreen = () => {
    setIsArchitecturePlanFullscreen(false);
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  };

  const handleApartmentSelect = (apartmentNumber) => {
    setSelectedApartment(apartmentNumber);
    openArchitecturePlanFullscreen();
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.5, 0.5));
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setLastMousePosition({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - lastMousePosition.x;
    const deltaY = e.clientY - lastMousePosition.y;
    
    setPanPosition(prev => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY
    }));
    
    setLastMousePosition({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetZoom = () => {
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  };

  // If floor is selected, show floor details
  if (selectedFloor) {
    return (
      <div className="w-full h-full flex">
        {/* Left Panel - Apartment List */}
        <div className="w-1/2 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Блок {selectedFloor.block} - Етаж {selectedFloor.floor}
              </h2>
              <button
                onClick={closeFloorDetails}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Apartment Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse font-sans">
                <thead>
                  <tr className="bg-gray-50 border-b-2 border-gray-200">
                    <th className="text-left p-3 font-normal text-gray-700 text-sm">АПАРТАМЕНТ</th>
                    <th className="text-left p-3 font-normal text-gray-700 text-sm">ЗАСТРОЕНА ПЛОЩ</th>
                    <th className="text-left p-3 font-normal text-gray-700 text-sm">ИДЕАЛНИ ЧАСТИ</th>
                    <th className="text-left p-3 font-normal text-gray-700 text-sm">ОБЩО</th>
                    <th className="text-left p-3 font-normal text-gray-700 text-sm">СТАТУС</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedFloor.data.map((apt, index) => (
                    <tr 
                      key={index} 
                      className={`border-b border-gray-100 hover:bg-blue-50 transition-colors cursor-pointer ${
                        selectedApartment === apt.apartment ? 'bg-blue-100 ring-2 ring-blue-400' : ''
                      }`}
                      onClick={() => handleApartmentSelect(apt.apartment)}
                    >
                      <td className="p-3">
                        <div className="flex items-center">
                          <span className="font-normal text-gray-900 text-sm">{apt.apartment}</span>
                          {apt.type && (
                            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full font-normal">
                              {apt.type}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-gray-700 text-sm font-normal">{apt.built} м²</td>
                      <td className="p-3 text-gray-700 text-sm font-normal">{apt.ideal} м²</td>
                      <td className="p-3 font-normal text-gray-900 text-sm">{apt.total} м²</td>
                      <td className="p-3">
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full font-normal">
                          {apt.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Apartment Statistics */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-green-50 rounded-lg p-4 text-center border border-green-200">
                  <div className="text-3xl font-bold text-green-600 leading-none mb-2">
                    {selectedFloor.data.filter(apt => apt.status === 'Свободен').length}
                  </div>
                  <div className="text-sm font-medium text-green-700">Свободни</div>
                  <div className="w-full h-1 bg-green-200 rounded-full mt-2">
                    <div className="h-full bg-green-500 rounded-full" style={{width: '100%'}}></div>
                  </div>
                </div>
                
                <div className="bg-red-50 rounded-lg p-4 text-center border border-red-200">
                  <div className="text-3xl font-bold text-red-600 leading-none mb-2">
                    {selectedFloor.data.filter(apt => apt.status === 'Продаден').length}
                  </div>
                  <div className="text-sm font-medium text-red-700">Продадени</div>
                  <div className="w-full h-1 bg-red-200 rounded-full mt-2">
                    <div className="h-full bg-red-500 rounded-full" style={{width: selectedFloor.data.filter(apt => apt.status === 'Продаден').length > 0 ? '100%' : '0%'}}></div>
                  </div>
                </div>
                
                <div className="bg-yellow-50 rounded-lg p-4 text-center border border-yellow-200">
                  <div className="text-3xl font-bold text-yellow-600 leading-none mb-2">
                    {selectedFloor.data.filter(apt => apt.status === 'Резервиран').length}
                  </div>
                  <div className="text-sm font-medium text-yellow-700">Резервирани</div>
                  <div className="w-full h-1 bg-yellow-200 rounded-full mt-2">
                    <div className="h-full bg-yellow-500 rounded-full" style={{width: selectedFloor.data.filter(apt => apt.status === 'Резервиран').length > 0 ? '100%' : '0%'}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Architecture Plan */}
        <div className="w-1/2 bg-gray-100 flex items-center justify-center p-6">
          <div className="w-full h-full bg-white rounded-lg shadow-lg overflow-hidden relative">
            <div 
              className="relative w-full h-full cursor-pointer hover:opacity-90 transition-opacity"
              onClick={openArchitecturePlanFullscreen}
            >
              <img
                src="/src/assets/продажби/project 2/architecture-a-floor-1.png"
                alt="Block A Floor 1 Architecture Plan"
                className="w-full h-full object-contain"
              />
              
            </div>
            
            {/* Fullscreen Button */}
            <button
              onClick={openArchitecturePlanFullscreen}
              className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-black/80 rounded transition-colors text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>
          </div>
        </div>

        {/* Fullscreen Architecture Plan Modal */}
        {isArchitecturePlanFullscreen && (
          <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center">
            <div className="relative w-full h-full">
              {/* Controls */}
              <div className="absolute top-4 right-4 z-20 flex gap-2">
                {/* Zoom Controls */}
                <div className="flex gap-1">
                  <button
                    onClick={handleZoomIn}
                    className="p-2 bg-black/60 hover:bg-black/80 rounded text-white transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                  <button
                    onClick={handleZoomOut}
                    className="p-2 bg-black/60 hover:bg-black/80 rounded text-white transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
                    </svg>
                  </button>
                  <button
                    onClick={resetZoom}
                    className="p-2 bg-black/60 hover:bg-black/80 rounded text-white transition-colors text-xs font-medium"
                  >
                    1:1
                  </button>
                </div>
                
                {/* Close Button */}
                <button
                  onClick={closeArchitecturePlanFullscreen}
                  className="p-2 bg-black/60 hover:bg-black/80 rounded text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Zoom Level Indicator */}
              <div className="absolute top-4 left-4 z-20 bg-black/60 text-white px-3 py-1 rounded-lg text-sm">
                {Math.round(zoomLevel * 100)}%
              </div>
              
              {/* Selected Apartment Info */}
              {selectedApartment && (
                <div className="absolute bottom-4 left-4 z-20 bg-red-500 text-white px-4 py-2 rounded-lg font-medium animate-pulse">
                  Selected: {selectedApartment}
                </div>
              )}
              
              {/* Scrollable/Pannable Container */}
              <div 
                className="w-full h-full overflow-hidden cursor-grab active:cursor-grabbing"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <div 
                  className="relative transition-transform duration-200 ease-out"
                  style={{
                    transform: `translate(${panPosition.x}px, ${panPosition.y}px) scale(${zoomLevel})`,
                    transformOrigin: 'center center'
                  }}
                >
                  <img
                    src="/src/assets/продажби/project 2/architecture-a-floor-1.png"
                    alt="Block A Floor 1 Architecture Plan - Fullscreen"
                    className="w-full h-full object-contain select-none"
                    draggable={false}
                  />
                  
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

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
                  onClick={() => handleFloorClick('A', floor)}
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
                onClick={() => handleFloorClick('A', floor)}
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
                  onClick={() => handleFloorClick('B', floor)}
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
                onClick={() => handleFloorClick('B', floor)}
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