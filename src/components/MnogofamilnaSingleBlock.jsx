import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FLOOR_DATA } from './FourTowersFloorMap';
import buildingAllFloorsArchitectureImage from '../assets/продажби/project 1/building-all-floors-architecture.webp';

// Floor Architecture Plan Images for Block A
import buildingAFloor1Architecture from '../assets/продажби/project 1/building-A-floor-1.webp';
import buildingAFloor2Architecture from '../assets/продажби/project 1/building-A-floor-2.webp';
import buildingAFloor3Architecture from '../assets/продажби/project 1/building-A-floor-3.webp';
import buildingAFloor4Architecture from '../assets/продажби/project 1/building-A-floor-4.webp';
import buildingAFloor5Architecture from '../assets/продажби/project 1/building-A-floor-5.webp';
import buildingAFloor6Architecture from '../assets/продажби/project 1/building-A-floor-6.webp';
import buildingAFloor7Architecture from '../assets/продажби/project 1/building-A-floor-7.webp';
import buildingAFloor8Architecture from '../assets/продажби/project 1/building-A-floor-8.webp';
import buildingAFloor9Architecture from '../assets/продажби/project 1/building-A-floor-9.webp';

// Floor Architecture Plan Images for Block B
import buildingBFloor1Architecture from '../assets/продажби/project 1/building-B-floor-1.webp';
import buildingBFloor2Architecture from '../assets/продажби/project 1/building-B-floor-2.webp';
import buildingBFloor3Architecture from '../assets/продажби/project 1/building-B-floor-3.webp';
import buildingBFloor4Architecture from '../assets/продажби/project 1/building-B-floor-4.webp';
import buildingBFloor5Architecture from '../assets/продажби/project 1/building-B-floor-5.webp';
import buildingBFloor6Architecture from '../assets/продажби/project 1/building-B-floor-6.webp';
import buildingBFloor7Architecture from '../assets/продажби/project 1/building-B-floor-7.webp';
import buildingBFloor8Architecture from '../assets/продажби/project 1/building-B-floor-8.webp';
import buildingBFloor9Architecture from '../assets/продажби/project 1/building-B-floor-9.webp';

// Block A Images
import blockAImage from '../assets/продажби/project 1/block-A/blockA.webp';
import blockAGarageImage from '../assets/продажби/project 1/block-A/garage-floor-A.webp';
import blockAFloor2Image from '../assets/продажби/project 1/block-A/building-A-floor-2.webp';
import blockAFloor3Image from '../assets/продажби/project 1/block-A/building-A-floor-3.webp';
import blockAFloor4Image from '../assets/продажби/project 1/block-A/building-A-floor-4.webp';
import blockAFloor5Image from '../assets/продажби/project 1/block-A/building-A-floor-5.webp';
import blockAFloor6Image from '../assets/продажби/project 1/block-A/building-A-floor-6.webp';
import blockAFloor7Image from '../assets/продажби/project 1/block-A/building-A-floor-7.webp';
import blockAFloor8Image from '../assets/продажби/project 1/block-A/building-A-floor-8.webp';
import blockAFloor9Image from '../assets/продажби/project 1/block-A/building-A-floor-9.webp';
import blockATavanImage from '../assets/продажби/project 1/block-A/building-A-Tavan.webp';

// Block B Images
import blockBImage from '../assets/продажби/project 1/block-B/blockB.webp';
import blockBGarageImage from '../assets/продажби/project 1/block-B/garage-floor-B.webp';
import blockBFloor2Image from '../assets/продажби/project 1/block-B/building-B-floor-2.webp';
import blockBFloor3Image from '../assets/продажби/project 1/block-B/building-B-floor-3.webp';
import blockBFloor4Image from '../assets/продажби/project 1/block-B/building-B-floor-4.webp';
import blockBFloor5Image from '../assets/продажби/project 1/block-B/building-B-floor-5.webp';
import blockBFloor6Image from '../assets/продажби/project 1/block-B/building-B-floor-6.webp';
import blockBFloor7Image from '../assets/продажби/project 1/block-B/building-B-floor-7.webp';
import blockBFloor8Image from '../assets/продажби/project 1/block-B/building-B-floor-8.webp';
import blockBFloor9Image from '../assets/продажби/project 1/block-B/building-B-floor-9.webp';
import blockBTavanImage from '../assets/продажби/project 1/block-B/building-B-Tavan.webp';

// Apartment A Images
import apartmentA2Floor1 from '../assets/продажби/project 1/apartment-A/apartment-a2-floor1.webp';
import apartmentA6Floor1 from '../assets/продажби/project 1/apartment-A/apartment-a6-floor1.webp';
import apartmentA58Floor8 from '../assets/продажби/project 1/apartment-A/apartment-a58-floor8.webp';
import apartmentA64Floor8 from '../assets/продажби/project 1/apartment-A/apartment-a64-floor8.webp';

// Apartment B Images
import apartmentB2 from '../assets/продажби/project 1/apartment-B-floor 1/apartment B2.webp';
import apartmentB6 from '../assets/продажби/project 1/apartment-B-floor 1/apartment B6.webp';
import apartmentB7 from '../assets/продажби/project 1/apartment-B-floor 1/apartment B7.webp';
import apartmentB207Floor2 from '../assets/продажби/project 1/apartment-B-floor 1/apartment-207-floor2.webp';
import apartmentB23Floor3 from '../assets/продажби/project 1/apartment-B-floor 1/apartment-b23-floor3.webp';
import apartmentB307Floor3 from '../assets/продажби/project 1/apartment-B-floor 1/apartment-b307-floor8.webp';
import apartmentB31Floor4 from '../assets/продажби/project 1/apartment-B-floor 1/apartment-b31-floor4.webp';
import apartmentB407Floor4 from '../assets/продажби/project 1/apartment-B-floor 1/apartment-b407-floor8.webp';
import apartmentB47Floor6 from '../assets/продажби/project 1/apartment-B-floor 1/apartment-b47-floor6.webp';
import apartmentB607Floor6 from '../assets/продажби/project 1/apartment-B-floor 1/apartment-b607-floor8.webp';
import apartmentB50Floor7 from '../assets/продажби/project 1/apartment-B-floor 1/apartment-b50-floor7.webp';
import apartmentB55Floor7 from '../assets/продажби/project 1/apartment-B-floor 1/apartment-b55-floor7.webp';
import apartmentB702Floor7 from '../assets/продажби/project 1/apartment-B-floor 1/apartment-b702-floor8.webp';
import apartmentB707Floor7 from '../assets/продажби/project 1/apartment-B-floor 1/apartment-b707-floor8.webp';
import apartmentB57Floor8 from '../assets/продажби/project 1/apartment-B-floor 1/apartment-b57-floor8.webp';
import apartmentB59Floor8 from '../assets/продажби/project 1/apartment-B-floor 1/apartment-b59-floor8.webp';
import apartmentB63Floor8 from '../assets/продажби/project 1/apartment-B-floor 1/apartment-b63-floor8.webp';
import apartmentB801Floor8 from '../assets/продажби/project 1/apartment-B-floor 1/apartment-b801-floor8.webp';
import apartmentB803Floor8 from '../assets/продажби/project 1/apartment-B-floor 1/apartment-b803-floor8.webp';
import apartmentB807Floor8 from '../assets/продажби/project 1/apartment-B-floor 1/apartment-b807-floor8.webp';

const MnogofamilnaSingleBlock = () => {
  const { block } = useParams();
  const navigate = useNavigate();
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [selectedApartment, setSelectedApartment] = useState(null);
  const [showFloorPlan, setShowFloorPlan] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePosition, setLastMousePosition] = useState({ x: 0, y: 0 });
  const [isArchitecturePlanFullscreen, setIsArchitecturePlanFullscreen] = useState(false);
  const [fullscreenZoom, setFullscreenZoom] = useState(1);
  const [fullscreenPan, setFullscreenPan] = useState({ x: 0, y: 0 });
  const [isFullscreenDragging, setIsFullscreenDragging] = useState(false);
  const [lastFullscreenMouse, setLastFullscreenMouse] = useState({ x: 0, y: 0 });
  const [showContactModal, setShowContactModal] = useState(false);

  const isBlockA = block === 'block-a';
  const blockLetter = isBlockA ? 'A' : 'B';
  const blockTitle = isBlockA ? 'БЛОК A' : 'БЛОК B';

  const [currentImage, setCurrentImage] = useState(
    isBlockA ? blockAImage : blockBImage
  );

  // Image mapping for floors
  const getFloorImage = (floorKey) => {
    if (isBlockA) {
      const imageMap = {
        'garage': blockAGarageImage,
        '2': blockAFloor2Image,
        '3': blockAFloor3Image,
        '4': blockAFloor4Image,
        '5': blockAFloor5Image,
        '6': blockAFloor6Image,
        '7': blockAFloor7Image,
        '8': blockAFloor8Image,
        '9': blockAFloor9Image,
        'tavan': blockATavanImage
      };
      return imageMap[floorKey] || blockAImage;
    } else {
      const imageMap = {
        'garage': blockBGarageImage,
        '2': blockBFloor2Image,
        '3': blockBFloor3Image,
        '4': blockBFloor4Image,
        '5': blockBFloor5Image,
        '6': blockBFloor6Image,
        '7': blockBFloor7Image,
        '8': blockBFloor8Image,
        '9': blockBFloor9Image,
        'tavan': blockBTavanImage
      };
      return imageMap[floorKey] || blockBImage;
    }
  };

  // Check if apartment has a specific image
  const hasSpecificApartmentImage = (apartmentName) => {
    if (!apartmentName) return false;

    const aptNumber = apartmentName.split('-')[1];

    if (isBlockA) {
      const apartmentAImages = ['2', '6', '58', '64', '102', '106', '802', '808'];
      return apartmentAImages.includes(aptNumber);
    } else {
      const apartmentBImages = ['102', '106', '107', '207', '23', '307', '31', '407', '47', '607', '50', '55', '702', '707', '57', '59', '63', '801', '803', '807'];
      return apartmentBImages.includes(aptNumber);
    }
  };

  // Get apartment architecture image based on apartment number
  const getApartmentImage = (apartmentName) => {
    if (!apartmentName) return buildingAllFloorsArchitectureImage;

    // Extract apartment number from name (e.g., "А-2" -> "2", "B-207" -> "207")
    const aptNumber = apartmentName.split('-')[1];

    if (isBlockA) {
      const apartmentAImages = {
        '2': apartmentA2Floor1,
        '6': apartmentA6Floor1,
        '58': apartmentA58Floor8,
        '64': apartmentA64Floor8,
        '102': apartmentA2Floor1,  // A-102 uses apartment-a2-floor1.png
        '106': apartmentA6Floor1,  // A-106 uses apartment-a6-floor1.png
        '802': apartmentA58Floor8, // A-802 uses apartment-a58-floor8.png
        '808': apartmentA64Floor8  // A-808 uses apartment-a64-floor8.png
      };
      return apartmentAImages[aptNumber];
    } else {
      const apartmentBImages = {
        '102': apartmentB2,  // B-102 uses apartment B2.png
        '106': apartmentB6,  // B-106 uses apartment B6.png
        '107': apartmentB7,  // B-107 uses apartment B7.png
        '207': apartmentB207Floor2,
        '23': apartmentB23Floor3,
        '307': apartmentB307Floor3,
        '31': apartmentB31Floor4,
        '407': apartmentB407Floor4,
        '47': apartmentB47Floor6,
        '607': apartmentB607Floor6,
        '50': apartmentB50Floor7,
        '55': apartmentB55Floor7,
        '702': apartmentB702Floor7,
        '707': apartmentB707Floor7,
        '57': apartmentB57Floor8,
        '59': apartmentB59Floor8,
        '63': apartmentB63Floor8,
        '801': apartmentB801Floor8,
        '803': apartmentB803Floor8,
        '807': apartmentB807Floor8
      };
      return apartmentBImages[aptNumber];
    }
  };

  // Get floor architecture plan image based on floor number
  // Map UI floor numbers (2-10) directly to the corresponding floor images.
  const getFloorArchitectureImage = (floor) => {
    // Always show the consolidated architecture plan image for Mnogofamilna floors
    // (the attached 'building-all-floors-architecture.png').
    if (!floor) return buildingAllFloorsArchitectureImage;
    return buildingAllFloorsArchitectureImage;
  };

  // Get floor data for the selected block (floors 2-10)
  const getBlockFloorData = () => {
    const blockData = FLOOR_DATA[blockLetter];
    if (!blockData) return {};

    // Filter to only include floors 2-10
    const filteredData = {};
    for (let floor = 2; floor <= 10; floor++) {
      if (blockData[floor]) {
        filteredData[floor] = blockData[floor];
      }
    }
    return filteredData;
  };

  const currentFloorData = getBlockFloorData();

  const handleFloorHover = (floorKey) => {
    if (floorKey) {
      setCurrentImage(getFloorImage(floorKey));
    } else {
      setCurrentImage(isBlockA ? blockAImage : blockBImage);
    }
  };

  const handleFloorClick = (floor) => {
    setSelectedFloor(floor);
    setShowFloorPlan(true);
  };

  const closeFloorPlan = () => {
    setShowFloorPlan(false);
    setSelectedFloor(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Свободен': return 'text-green-500';
      case 'Продаден': return 'text-red-500';
      case 'Резервиран': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusDot = (status) => {
    switch (status) {
      case 'Свободен': return 'bg-green-500';
      case 'Продаден': return 'bg-red-500';
      case 'Резервиран': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  // Handle ESC key for fullscreen modal
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Escape' && isArchitecturePlanFullscreen) {
        setIsArchitecturePlanFullscreen(false);
        setFullscreenZoom(1);
        setFullscreenPan({ x: 0, y: 0 });
        setSelectedApartment(null);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isArchitecturePlanFullscreen]);

  // Global mouse events for smooth dragging
  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      if (isFullscreenDragging) {
        const deltaX = e.clientX - lastFullscreenMouse.x;
        const deltaY = e.clientY - lastFullscreenMouse.y;
        setFullscreenPan(prev => ({
          x: prev.x + deltaX / fullscreenZoom,
          y: prev.y + deltaY / fullscreenZoom
        }));
        setLastFullscreenMouse({ x: e.clientX, y: e.clientY });
      }
    };

    const handleGlobalMouseUp = () => {
      if (isFullscreenDragging) {
        setIsFullscreenDragging(false);
        document.body.style.userSelect = '';
      }
    };

    if (isFullscreenDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isFullscreenDragging, lastFullscreenMouse, fullscreenZoom]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4 relative">
            <button
              onClick={() => navigate('/projects/mnogofamilna-sgrada')}
              className="text-gray-800 hover:text-gray-600 active:text-gray-900 transition-all duration-300 touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-gray-200/50 sm:justify-start sm:min-w-auto sm:px-2"
            >
              <span className="text-2xl sm:text-xl font-bold">←</span>
              <span className="hidden sm:inline sm:ml-2 sm:mr-1 text-base font-medium">Назад към избор на блок</span>
            </button>

            <h1 className="text-2xl sm:text-4xl font-bold text-center flex-1 mx-4 sm:absolute sm:left-1/2 sm:transform sm:-translate-x-1/2">
              <span className="text-gold-600">Многофамилна сграда</span> - <span className="text-gold-600">{blockTitle}</span>
            </h1>

            {/* Empty space for layout balance */}
            <div className="w-[44px] sm:w-auto"></div>
          </div>
          <p className="text-base sm:text-lg text-gray-600 text-center">
            {isBlockA ? '72 апартамента • 9 етажа (2-10)' : '72 апартамента • 9 етажа (2-10)'}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Building Image */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-lg shadow-lg p-4 relative">
              <img
                src={currentImage}
                alt={`${blockTitle} Floor Plan`}
                className="w-full h-auto rounded-lg"
                style={{ maxHeight: '80vh', objectFit: 'contain' }}
              />
              {/* SVG Interactive floor hotspots with precise polygon coordinates */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox="0 0 100 100"
                preserveAspectRatio="xMidYMid meet"
                style={{ pointerEvents: 'none' }}
              >
                {/* Floor hover areas - separate coordinates for Block A and Block B */}
                {(isBlockA ? [
                  // Block A coordinates (adjusted by user)
                  { floor: 'tavan', x: 20, y: 30, width: 100, height: 5 },
                  { floor: '9', x: 20, y: 34, width: 100, height: 5 },
                  { floor: '8', x: 20, y: 38, width: 100, height: 5 },
                  { floor: '7', x: 20, y: 42, width: 100, height: 5 },
                  { floor: '6', x: 20, y: 46, width: 100, height: 5 },
                  { floor: '5', x: 20, y: 50, width: 100, height: 5 },
                  { floor: '4', x: 20, y: 54, width: 100, height: 5 },
                  { floor: '3', x: 20, y: 60, width: 100, height: 5 },
                  { floor: '2', x: 20, y: 63, width: 100, height: 5 },
                  { floor: 'garage', x: 20, y: 66, width: 100, height: 5 },
                ] : [
                  // Block B coordinates (adjust these to match Block B building image)
                  { floor: 'tavan', x: 20, y: 30, width: 100, height: 5 },
                  { floor: '9', x: 20, y: 34, width: 100, height: 5 },
                  { floor: '8', x: 20, y: 38, width: 100, height: 5 },
                  { floor: '7', x: 20, y: 43, width: 100, height: 5 },
                  { floor: '6', x: 20, y: 47, width: 100, height: 5 },
                  { floor: '5', x: 20, y: 52, width: 100, height: 5 },
                  { floor: '4', x: 20, y: 59, width: 100, height: 5 },
                  { floor: '3', x: 20, y: 62, width: 100, height: 5 },
                  { floor: '2', x: 20, y: 67, width: 100, height: 5 },
                  { floor: 'garage', x: 20, y: 70, width: 100, height: 5 },
                ]).map((area) => (
                  <rect
                    key={area.floor}
                    x={area.x}
                    y={area.y}
                    width={area.width}
                    height={area.height}
                    fill="transparent"
                    stroke="transparent"
                    className="cursor-pointer"
                    style={{ pointerEvents: 'auto' }}
                    onMouseEnter={() => handleFloorHover(area.floor)}
                    onMouseLeave={() => handleFloorHover(null)}
                    onClick={() => area.floor === 'tavan' || area.floor === 'garage' ? null : handleFloorClick(Number(area.floor))}
                  />
                ))}
              </svg>
            </div>
          </div>

          {/* Floor Navigation */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-lg shadow-lg p-6 max-h-[80vh] overflow-y-auto">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Етажи и апартаменти</h3>

              <div className="space-y-2 mb-6">
                {/* Tavan (Roof) */}
                <div>
                  <div
                    className="bg-gray-800 rounded-lg p-3 hover:bg-gray-700 transition-colors cursor-pointer"
                    onMouseEnter={() => handleFloorHover('tavan')}
                    onMouseLeave={() => handleFloorHover(null)}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-white font-medium">Тавански етаж</span>
                      <span className="text-gray-400 text-sm">Преглед</span>
                    </div>
                  </div>
                </div>

                {/* Regular Floors 9 down to 2 */}
                {[9, 8, 7, 6, 5, 4, 3, 2].map((floor) => {
                  const floorData = currentFloorData[floor];
                  if (!floorData) return null;

                  const availableCount = floorData.apartments ?
                    floorData.apartments.filter(apt => apt.статус === 'Свободен').length : 0;
                  const totalCount = floorData.apartments ? floorData.apartments.length : 0;

                  return (
                    <div key={floor}>
                      <div
                        className="bg-gray-800 rounded-lg p-3 hover:bg-gray-700 transition-colors cursor-pointer"
                        onMouseEnter={() => handleFloorHover(String(floor))}
                        onMouseLeave={() => handleFloorHover(null)}
                        onClick={() => handleFloorClick(floor)}
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-white font-medium">
                            Етаж {floor}
                          </span>
                          <span className="text-gray-400 text-sm">
                            {availableCount}/{totalCount} свободни
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Garage - For both Block A and Block B */}
                <div>
                  <div
                    className="bg-gray-800 rounded-lg p-3 hover:bg-gray-700 transition-colors cursor-pointer"
                    onMouseEnter={() => handleFloorHover('garage')}
                    onMouseLeave={() => handleFloorHover(null)}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-white font-medium">Наземни и подземни гаражи</span>
                      <span className="text-gray-400 text-sm">Преглед</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-800 mb-2">Легенда:</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <span>Свободен</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                    <span>Резервиран</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                    <span>Продаден</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floor Plan View */}
        {showFloorPlan && selectedFloor && currentFloorData[selectedFloor] && (
          <div className="fixed inset-0 bg-gray-50 z-50 overflow-y-auto">
            <div className="min-h-screen py-8">
              <div className="container mx-auto px-4 max-w-7xl">
                {/* Header */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4 relative">
                    <button
                      onClick={closeFloorPlan}
                      className="text-gray-800 hover:text-gray-600 active:text-gray-900 transition-all duration-300 touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-gray-200/50 sm:justify-start sm:min-w-auto sm:px-2"
                    >
                      <span className="text-2xl sm:text-xl font-bold">←</span>
                      <span className="hidden sm:inline sm:ml-2 sm:mr-1 text-base font-medium">Назад към {blockTitle}</span>
                    </button>

                    <h1 className="text-2xl sm:text-4xl font-bold text-center flex-1 mx-4 sm:absolute sm:left-1/2 sm:transform sm:-translate-x-1/2">
                      <span className="bg-gradient-to-r from-gold-600 to-gold-800 bg-clip-text text-transparent">{blockTitle}</span> - <span className="bg-gradient-to-r from-gold-600 to-gold-800 bg-clip-text text-transparent">{selectedFloor === 10 ? 'Тавански етаж' : `Етаж ${selectedFloor}`}</span>
                    </h1>

                    {/* Empty space for layout balance */}
                    <div className="w-[44px] sm:w-auto"></div>
                  </div>
                  <p className="text-lg text-gray-600 text-center">
                    Архитектурен план и списък на апартаментите
                  </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Left Side - Apartments Table (50%) */}
                  <div className="lg:w-1/2 flex flex-col">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-0">Списък на апартаментите</h3>
                      <p className="text-xs sm:text-sm text-gray-600">
                        <span className="hidden sm:inline">Кликнете за детайли</span>
                        <span className="sm:hidden">Скролирайте и кликнете</span>
                      </p>
                    </div>
                    <div className="bg-white rounded-lg overflow-hidden shadow-lg relative flex-1">
                      {/* Scroll indicator for mobile */}
                      <div className="absolute top-2 right-2 z-20 sm:hidden">
                        <div className="bg-gold-500/80 text-primary-900 text-xs px-2 py-1 rounded-full animate-pulse font-semibold">
                          ↕ Scroll
                        </div>
                      </div>

                      <div className="overflow-x-auto overflow-y-auto h-full relative" style={{
                        scrollbarWidth: 'thin',
                        scrollbarColor: '#CBD5E0 #F7FAFC',
                        WebkitOverflowScrolling: 'touch'
                      }}>
                        <table className="w-full text-xs lg:text-sm min-w-full">
                          <thead className="bg-gray-100 sticky top-0 z-10">
                            <tr>
                              <th className="px-2 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300 whitespace-nowrap">Имот</th>
                              <th className="px-2 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300 whitespace-nowrap">Вид</th>
                              <th className="px-2 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300 whitespace-nowrap">Обща площ</th>
                              <th className="px-2 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300 whitespace-nowrap">Изложение</th>
                              <th className="px-2 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">Статус</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {currentFloorData[selectedFloor].apartments.map((apt, idx) => (
                              <tr
                                key={idx}
                                className={`transition-colors ${
                                  selectedApartment && selectedApartment.имот === apt.имот
                                    ? 'bg-gold-100 border-l-4 border-gold-500'
                                    : (apt.статус === 'Свободен')
                                      ? 'hover:bg-gray-50 cursor-pointer group active:bg-gray-100'
                                      : 'cursor-not-allowed opacity-75'
                                }`}
                                style={{ minHeight: '48px' }}
                                onClick={(apt.статус === 'Свободен') ? () => {
                                  setSelectedApartment(apt);
                                  setIsArchitecturePlanFullscreen(true);
                                } : undefined}
                              >
                                <td className="px-2 py-2 whitespace-nowrap font-medium text-gray-900 border-r border-gray-200 relative">
                                  <div className="flex items-center">
                                    {apt.имот}
                                    {(apt.статус === 'Свободен') && (
                                      <svg className="w-4 h-4 ml-2 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                      </svg>
                                    )}
                                  </div>
                                </td>
                                <td className="px-2 py-2 whitespace-nowrap text-gray-700 border-r border-gray-200">
                                  {apt.вид}
                                </td>
                                <td className="px-2 py-2 whitespace-nowrap text-gray-700 border-r border-gray-200">
                                  {apt.общаПлощ}
                                </td>
                                <td className="px-2 py-2 whitespace-nowrap text-gray-700 border-r border-gray-200">
                                  {apt.изложение}
                                </td>
                                <td className="px-2 py-2 whitespace-nowrap">
                                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${
                                    apt.статус === 'Свободен' ? 'bg-green-100 text-green-700' :
                                    apt.статус === 'Продаден' ? 'bg-red-100 text-red-700' :
                                    'bg-yellow-100 text-yellow-700'
                                  }`}>
                                    {apt.статус}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Summary Stats */}
                    <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
                      {(() => {
                        const floorData = currentFloorData[selectedFloor].apartments;
                        const available = floorData.filter(a => a.статус === 'Свободен').length;
                        const sold = floorData.filter(a => a.статус === 'Продаден').length;
                        const reserved = floorData.filter(a => a.статус === 'Резервиран').length;

                        return (
                          <>
                            <div className="bg-green-100 border border-green-300 rounded-lg p-2 sm:p-3 text-center">
                              <div className="text-lg sm:text-xl font-bold text-green-800">{available}</div>
                              <div className="text-xs text-green-600">Свободни</div>
                            </div>
                            <div className="bg-red-100 border border-red-300 rounded-lg p-2 sm:p-3 text-center">
                              <div className="text-lg sm:text-xl font-bold text-red-800">{sold}</div>
                              <div className="text-xs text-red-600">Продадени</div>
                            </div>
                            <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-2 sm:p-3 text-center">
                              <div className="text-lg sm:text-xl font-bold text-yellow-800">{reserved}</div>
                              <div className="text-xs text-yellow-600">Резервирани</div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Right Side - Architecture Plan (50%) */}
                  <div className="lg:w-1/2">
                    <div className="bg-white rounded-lg shadow-lg p-6 h-full flex flex-col">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-gray-800">
                          Архитектурен план - {selectedFloor === 10 ? 'Тавански етаж' : `Етаж ${selectedFloor}`}
                        </h3>
                        {selectedApartment && (
                          <div className="text-sm bg-gold-100 text-gold-800 px-3 py-1 rounded-full">
                            Избран: {selectedApartment.имот}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 bg-gray-100 rounded-lg overflow-hidden relative">

                        <div
                          className="w-full h-full overflow-hidden cursor-move relative flex items-center justify-center"
                          style={{
                            transform: `scale(${zoomLevel}) translate(${panPosition.x}px, ${panPosition.y}px)`,
                            transformOrigin: 'center center',
                            transition: isDragging ? 'none' : 'transform 0.1s ease-out'
                          }}
                          onMouseDown={(e) => {
                            setIsDragging(true);
                            setLastMousePosition({ x: e.clientX, y: e.clientY });
                            document.body.style.cursor = 'grabbing';
                          }}
                          onMouseMove={(e) => {
                            if (isDragging) {
                              const deltaX = e.clientX - lastMousePosition.x;
                              const deltaY = e.clientY - lastMousePosition.y;
                              setPanPosition({
                                x: panPosition.x + deltaX / zoomLevel,
                                y: panPosition.y + deltaY / zoomLevel
                              });
                              setLastMousePosition({ x: e.clientX, y: e.clientY });
                            }
                          }}
                          onMouseUp={() => {
                            setIsDragging(false);
                            document.body.style.cursor = '';
                          }}
                          onMouseLeave={() => {
                            setIsDragging(false);
                            document.body.style.cursor = '';
                          }}
                        >
                          <div className="relative w-full h-full flex items-center justify-center p-1">
                            <img
                              src={selectedApartment && hasSpecificApartmentImage(selectedApartment.имот) ? getApartmentImage(selectedApartment.имот) : getFloorArchitectureImage(selectedFloor)}
                              alt={selectedApartment ? `${selectedApartment.имот} план` : `${blockTitle} - ${selectedFloor} етаж план`}
                              className="max-w-full max-h-full object-contain cursor-pointer rounded-lg shadow-xl hover:shadow-2xl transition-shadow duration-300"
                              onClick={() => setIsArchitecturePlanFullscreen(true)}
                              draggable={false}
                            />
                          </div>
                        </div>

                        {/* Zoom Controls */}
                        <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                          <button
                            onClick={() => setZoomLevel(Math.min(zoomLevel + 0.2, 3))}
                            className="bg-white/90 hover:bg-white p-2 rounded-lg shadow-lg transition-colors"
                            title="Увеличи"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setZoomLevel(Math.max(zoomLevel - 0.2, 0.5))}
                            className="bg-white/90 hover:bg-white p-2 rounded-lg shadow-lg transition-colors"
                            title="Намали"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </button>
                          <button
                            onClick={() => {
                              setZoomLevel(1);
                              setPanPosition({ x: 0, y: 0 });
                            }}
                            className="bg-white/90 hover:bg-white p-2 rounded-lg shadow-lg transition-colors"
                            title="Нулирай"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          </button>
                        </div>

                        {/* Zoom level indicator */}
                        <div className="absolute bottom-3 left-3 bg-gray-900/80 text-white text-xs px-3 py-1.5 rounded-full font-semibold shadow-lg backdrop-blur-sm">
                          {Math.round(zoomLevel * 100)}%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Fullscreen Architecture Plan Modal */}
        {isArchitecturePlanFullscreen && (
          <div className="fixed inset-0 bg-black bg-opacity-95 z-50">
            <div className="w-full h-full relative">
              {/* Header */}
              <div className="absolute top-0 left-0 right-0 bg-black bg-opacity-50 z-10 p-4 flex justify-between items-center text-white">
                <div className="flex items-center gap-4">
                  <h3 className="text-xl font-bold">
                    {blockTitle} - {selectedFloor === 10 ? 'Тавански етаж' : `Етаж ${selectedFloor}`} - Архитектурен план
                  </h3>
                  {selectedApartment && (
                    <div className="text-sm bg-gold-600 text-primary-900 px-3 py-1 rounded-full font-semibold">
                      Избран: {selectedApartment.имот}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => {
                    setIsArchitecturePlanFullscreen(false);
                    setFullscreenZoom(1);
                    setFullscreenPan({ x: 0, y: 0 });
                    setSelectedApartment(null);
                  }}
                  className="text-white hover:text-gray-300 text-2xl"
                >
                  ✕
                </button>
              </div>

              {/* Image Container - Fullscreen */}
              <div
                className="absolute inset-0 pt-16 pb-4"
                style={{
                  transform: `scale(${fullscreenZoom}) translate(${fullscreenPan.x}px, ${fullscreenPan.y}px)`,
                  transformOrigin: 'center center',
                  transition: isFullscreenDragging ? 'none' : 'transform 0.1s ease-out',
                  cursor: isFullscreenDragging ? 'grabbing' : 'grab'
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  setIsFullscreenDragging(true);
                  setLastFullscreenMouse({ x: e.clientX, y: e.clientY });
                  document.body.style.userSelect = 'none';
                }}
                onWheel={(e) => {
                  e.preventDefault();
                  const delta = e.deltaY > 0 ? -0.1 : 0.1;
                  setFullscreenZoom(Math.min(Math.max(fullscreenZoom + delta, 0.5), 5));
                }}
              >
                <div className="w-full h-full flex items-center justify-center">
                  <img
                    src={selectedApartment && hasSpecificApartmentImage(selectedApartment.имот) ? getApartmentImage(selectedApartment.имот) : getFloorArchitectureImage(selectedFloor)}
                    alt={selectedApartment ? `${selectedApartment.имот} план` : `${blockTitle} - ${selectedFloor} етаж план`}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              </div>

              {/* Fullscreen Zoom Controls */}
              <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-10">
                <button
                  onClick={() => setFullscreenZoom(Math.min(fullscreenZoom + 0.2, 5))}
                  className="bg-white/90 hover:bg-white text-black p-3 rounded-lg shadow-lg transition-colors"
                  title="Увеличи"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
                <button
                  onClick={() => setFullscreenZoom(Math.max(fullscreenZoom - 0.2, 0.5))}
                  className="bg-white/90 hover:bg-white text-black p-3 rounded-lg shadow-lg transition-colors"
                  title="Намали"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <button
                  onClick={() => {
                    setFullscreenZoom(1);
                    setFullscreenPan({ x: 0, y: 0 });
                  }}
                  className="bg-white/90 hover:bg-white text-black p-3 rounded-lg shadow-lg transition-colors"
                  title="Нулирай"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>

              {/* Selected Apartment Info - Top Left */}
              {selectedApartment && (
                <div className="absolute top-20 left-4 bg-gradient-to-r from-gold-500 to-gold-600 text-primary-900 px-4 py-3 rounded-lg shadow-2xl z-20">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-primary-900 rounded-full animate-pulse"></div>
                      <div className="font-bold">Избран апартамент</div>
                    </div>
                    <div className="text-lg font-semibold">{selectedApartment.имот}</div>
                    <div className="text-sm opacity-90">
                      {selectedApartment.вид} • {selectedApartment.общаПлощ}
                    </div>
                    <div className="text-sm opacity-90">
                      Изложение: {selectedApartment.изложение}
                    </div>
                    <div className="text-sm opacity-90">
                      Статус: {selectedApartment.статус}
                    </div>
                    <button
                      className="bg-primary-900 text-gold-100 px-3 py-2 rounded text-sm font-bold hover:bg-primary-800 transition-colors mt-1"
                      onClick={() => setShowContactModal(true)}
                    >
                      Контакт
                    </button>
                  </div>
                </div>
              )}

              {/* Instructions */}
              <div className="absolute bottom-4 left-4 text-white text-sm bg-black bg-opacity-50 p-3 rounded-lg z-20">
                <p>🖱️ Кликни и влачи за движение</p>
                <p>🔍 Scroll за zoom</p>
                <p>⌨️ ESC за затваряне</p>
              </div>
            </div>
          </div>
        )}

        {/* Modern Contact Modal */}
        {showContactModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-gray-900">Свържете се с нас</h3>
                <button
                  onClick={() => setShowContactModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  ✕
                </button>
              </div>

              {selectedApartment && (
                <div className="bg-gold-50 border border-gold-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-600 mb-1">Интерес за:</p>
                  <p className="font-bold text-gray-900">{selectedApartment.имот}</p>
                  <p className="text-sm text-gray-700">{selectedApartment.вид} • {selectedApartment.общаПлощ}</p>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-600">Телефон:</p>
                    <a href="tel:+359887886166" className="text-gold-600 hover:text-gold-800 font-medium">
                      +359 887 886 166
                    </a>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-600">Email:</p>
                    <a href="mailto:ksm_str@abv.bg" className="text-gold-600 hover:text-gold-800 font-medium">
                      ksm_str@abv.bg
                    </a>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-600">Работно време:</p>
                    <p className="text-gray-900 font-medium">Пон-Пет: 9:00 - 18:00</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowContactModal(false)}
                className="w-full mt-6 bg-gradient-to-r from-gold-600 to-gold-700 text-white py-3 rounded-lg hover:from-gold-700 hover:to-gold-800 transition-all font-semibold"
              >
                Затвори
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MnogofamilnaSingleBlock;
