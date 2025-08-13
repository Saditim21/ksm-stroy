/**
 * FloorHighlighter Component
 * Interactive building floor visualization with perfect SVG polygon alignment
 * 
 * Instructions for new building:
 * 1. Replace BUILDING_IMAGE_URL with your building photo
 * 2. Enable calibration mode (setCalibrationMode(true))
 * 3. Click 4 facade corners: LT, RT, RB, LB
 * 4. Fine-tune with draggable handles
 * 5. Adjust floors count and padding
 * 6. Export JSON configuration
 * 7. Load JSON in production mode
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { 
  useFacadeBands, 
  DEFAULT_FACADE, 
  exportConfig, 
  importConfig,
  type FacadeQuad,
  type FacadeBandsConfig 
} from './useFacadeBands';
import { 
  type Point, 
  pointsToSvgString, 
  pixelToPercent,
  isPointNear,
  clamp 
} from './polygonUtils';

// Types
type FloorStatus = 'Свободен' | 'Продаден' | 'Резервиран';

type FloorRow = {
  имот: string;
  вид: string;
  'застроена площ': string;
  'обща площ': string;
  изложение: string;
  статус: FloorStatus;
};

type FloorData = {
  id: number;
  имеBG: string;
  типBG: 'Жилищен' | 'Партер/Гаражи';
  rows: FloorRow[];
  планUrl?: string;
};

// Mock data for 7 floors
const MOCK_FLOOR_DATA: FloorData[] = [
  {
    id: 7,
    имеBG: 'Етаж 7',
    типBG: 'Жилищен',
    rows: [
      { имот: 'А7-01', вид: 'Двустаен', 'застроена площ': '65 м²', 'обща площ': '78 м²', изложение: 'Юг', статус: 'Свободен' },
      { имот: 'А7-02', вид: 'Тристаен', 'застроена площ': '85 м²', 'обща площ': '98 м²', изложение: 'Юг-Изток', статус: 'Резервиран' },
    ],
  },
  {
    id: 6,
    имеBG: 'Етаж 6',
    типBG: 'Жилищен',
    rows: [
      { имот: 'А6-01', вид: 'Двустаен', 'застроена площ': '65 м²', 'обща площ': '78 м²', изложение: 'Юг', статус: 'Продаден' },
      { имот: 'А6-02', вид: 'Едностаен', 'застроена площ': '45 м²', 'обща площ': '52 м²', изложение: 'Изток', статус: 'Свободен' },
    ],
  },
  {
    id: 5,
    имеBG: 'Етаж 5',
    типBG: 'Жилищен',
    rows: [
      { имот: 'А5-01', вид: 'Тристаен', 'застроена площ': '95 м²', 'обща площ': '110 м²', изложение: 'Юг-Запад', статус: 'Свободен' },
      { имот: 'А5-02', вид: 'Двустаен', 'застроена площ': '70 м²', 'обща площ': '82 м²', изложение: 'Запад', статус: 'Резервиран' },
    ],
  },
  {
    id: 4,
    имеBG: 'Етаж 4',
    типBG: 'Жилищен',
    rows: [
      { имот: 'А4-01', вид: 'Четиристаен', 'застроена площ': '120 м²', 'обща площ': '140 м²', изложение: 'Юг', статус: 'Продаден' },
      { имот: 'А4-02', вид: 'Двустаен', 'застроена площ': '68 м²', 'обща площ': '80 м²', изложение: 'Север', статус: 'Свободен' },
    ],
  },
  {
    id: 3,
    имеBG: 'Етаж 3',
    типBG: 'Жилищен',
    rows: [
      { имот: 'А3-01', вид: 'Тристаен', 'застроена площ': '88 м²', 'обща площ': '102 м²', изложение: 'Изток', статус: 'Свободен' },
      { имот: 'А3-02', вид: 'Едностаен', 'застроена площ': '42 м²', 'обща площ': '48 м²', изложение: 'Запад', статус: 'Свободен' },
    ],
  },
  {
    id: 2,
    имеBG: 'Етаж 2',
    типBG: 'Жилищен',
    rows: [
      { имот: 'А2-01', вид: 'Двустаен', 'застроена площ': '72 м²', 'обща площ': '85 м²', изложение: 'Юг', статус: 'Резервиран' },
      { имот: 'А2-02', вид: 'Тристаен', 'застроена площ': '92 м²', 'обща площ': '106 м²', изложение: 'Север', статус: 'Продаден' },
    ],
  },
  {
    id: 1,
    имеBG: 'Партер (Гаражи)',
    типBG: 'Партер/Гаражи',
    rows: [
      { имот: 'Г-01', вид: 'Гараж', 'застроена площ': '18 м²', 'обща площ': '18 м²', изложение: '-', статус: 'Свободен' },
      { имот: 'Г-02', вид: 'Гараж', 'застроена площ': '22 м²', 'обща площ': '22 м²', изложение: '-', статус: 'Продаден' },
      { имот: 'Г-03', вид: 'Складово', 'застроена площ': '8 м²', 'обща площ': '8 м²', изложение: '-', статус: 'Свободен' },
    ],
  },
];

// Replace with your building image - using your 002.jpg
const BUILDING_IMAGE_URL = './src/assets/images/002.jpg';

const FloorHighlighter: React.FC = () => {
  // State
  const [hoveredFloorId, setHoveredFloorId] = useState<number | null>(null);
  const [selectedFloorId, setSelectedFloorId] = useState<number | null>(null);
  const [calibrationMode, setCalibrationMode] = useState(false);
  const [facade, setFacade] = useState<FacadeQuad>(DEFAULT_FACADE);
  const [floors, setFloors] = useState(7);
  const [padTopPct, setPadTopPct] = useState(0.4);
  const [padBottomPct, setPadBottomPct] = useState(0.4);
  const [perFloorAdjust, setPerFloorAdjust] = useState<number[]>(new Array(7).fill(0));
  
  // Calibration state
  const [calibrationClicks, setCalibrationClicks] = useState<Point[]>([]);
  const [draggingHandle, setDraggingHandle] = useState<keyof FacadeQuad | null>(null);
  
  // Refs
  const svgRef = useRef<SVGSVGElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Generate floor polygons
  const config: FacadeBandsConfig = {
    facade,
    floors,
    padTopPct,
    padBottomPct,
    perFloorAdjust,
  };
  
  const polygons = useFacadeBands(config);

  // Use the precomputed POLYGONS for your 002.jpg image
  const PRECOMPUTED_POLYGONS = [
    [ {x:32.0000,y:9.0000}, {x:84.0000,y:28.5000}, {x:83.3571,y:36.0000}, {x:31.4286,y:16.4286} ],
    [ {x:31.4286,y:16.4286}, {x:83.3571,y:36.0000}, {x:82.7143,y:43.5000}, {x:30.8571,y:23.8571} ],
    [ {x:30.8571,y:23.8571}, {x:82.7143,y:43.5000}, {x:82.0714,y:51.0000}, {x:30.2857,y:31.2857} ],
    [ {x:30.2857,y:31.2857}, {x:82.0714,y:51.0000}, {x:81.4286,y:58.5000}, {x:29.7143,y:38.7143} ],
    [ {x:29.7143,y:38.7143}, {x:81.4286,y:58.5000}, {x:80.7857,y:66.0000}, {x:29.1429,y:46.1429} ],
    [ {x:29.1429,y:46.1429}, {x:80.7857,y:66.0000}, {x:80.1429,y:73.5000}, {x:28.5714,y:53.5714} ],
    [ {x:28.5714,y:53.5714}, {x:80.1429,y:73.5000}, {x:79.5000,y:81.0000}, {x:28.0000,y:61.0000} ],
  ];

  // Use precomputed polygons instead of generated ones for now
  const finalPolygons = calibrationMode ? polygons : PRECOMPUTED_POLYGONS;
  
  // Calibration click handler
  const handleCalibrationClick = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!calibrationMode || calibrationClicks.length >= 4) return;
    
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    const newClicks = [...calibrationClicks, { x, y }];
    setCalibrationClicks(newClicks);
    
    // Update facade when we have 4 clicks
    if (newClicks.length === 4) {
      setFacade({
        LT: newClicks[0],
        RT: newClicks[1],
        RB: newClicks[2],
        LB: newClicks[3],
      });
    }
  }, [calibrationMode, calibrationClicks]);
  
  // Handle dragging
  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!draggingHandle) return;
    
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = clamp(((e.clientX - rect.left) / rect.width) * 100, 0, 100);
    const y = clamp(((e.clientY - rect.top) / rect.height) * 100, 0, 100);
    
    setFacade(prev => ({
      ...prev,
      [draggingHandle]: { x, y },
    }));
  }, [draggingHandle]);
  
  const handleMouseUp = useCallback(() => {
    setDraggingHandle(null);
  }, []);
  
  // Export configuration
  const handleExport = () => {
    const json = exportConfig(config, polygons);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'polygons.json';
    a.click();
    URL.revokeObjectURL(url);
  };
  
  // Import configuration
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = event.target?.result as string;
        const imported = importConfig(json);
        setFacade(imported.config.facade);
        setFloors(imported.config.floors);
        setPadTopPct(imported.config.padTopPct);
        setPadBottomPct(imported.config.padBottomPct);
        setPerFloorAdjust(imported.config.perFloorAdjust || []);
      } catch (error) {
        console.error('Error importing config:', error);
      }
    };
    reader.readAsText(file);
  };
  
  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const currentIndex = selectedFloorId ? floors - selectedFloorId + 1 : -1;
      let newIndex = currentIndex;
      
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          newIndex = currentIndex > 0 ? currentIndex - 1 : floors - 1;
          break;
        case 'ArrowDown':
          e.preventDefault();
          newIndex = currentIndex < floors - 1 ? currentIndex + 1 : 0;
          break;
        case 'Enter':
          e.preventDefault();
          if (hoveredFloorId) {
            setSelectedFloorId(hoveredFloorId);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setSelectedFloorId(null);
          setHoveredFloorId(null);
          break;
        default:
          return;
      }
      
      if (newIndex !== currentIndex && newIndex >= 0) {
        const newFloorId = floors - newIndex;
        setSelectedFloorId(newFloorId);
        setHoveredFloorId(newFloorId);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedFloorId, hoveredFloorId, floors]);
  
  const getStatusColor = (status: FloorStatus) => {
    switch (status) {
      case 'Свободен': return 'bg-green-100 text-green-800';
      case 'Резервиран': return 'bg-yellow-100 text-yellow-800';
      case 'Продаден': return 'bg-red-100 text-red-800';
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Проекти → План на етажите</h1>
        <p className="text-gray-600 mt-1">Интерактивен изглед на етажите с перфектно подравняване</p>
      </div>
      
      <div className="max-w-7xl mx-auto flex gap-6">
        {/* Left Panel - Floor List */}
        <div className="w-64 space-y-2">
          <h3 className="font-semibold text-gray-800 mb-3">Етажи</h3>
          {MOCK_FLOOR_DATA.map((floor, index) => (
            <button
              key={floor.id}
              className={`w-full p-3 text-left rounded-lg border-2 transition-all duration-200 ${
                selectedFloorId === floor.id
                  ? 'border-yellow-500 bg-yellow-50'
                  : hoveredFloorId === floor.id
                  ? 'border-yellow-300 bg-yellow-25'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onMouseEnter={() => setHoveredFloorId(floor.id)}
              onMouseLeave={() => setHoveredFloorId(null)}
              onClick={() => setSelectedFloorId(floor.id)}
            >
              <div className="font-medium">{floor.имеBG}</div>
              <div className="text-sm text-gray-600">{floor.типBG}</div>
              <div className="flex gap-1 mt-1">
                {floor.rows.slice(0, 2).map((row, i) => (
                  <span key={i} className={`text-xs px-2 py-1 rounded ${getStatusColor(row.статус)}`}>
                    {row.статус.charAt(0)}
                  </span>
                ))}
              </div>
            </button>
          ))}
          
          {/* Calibration Controls */}
          {calibrationMode && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-3">Калибриране</h4>
              
              <div className="space-y-3 text-sm">
                <div>
                  <label className="text-blue-800">Етажи: {floors}</label>
                  <input
                    type="range"
                    min="3"
                    max="15"
                    value={floors}
                    onChange={(e) => {
                      const newFloors = Number(e.target.value);
                      setFloors(newFloors);
                      setPerFloorAdjust(new Array(newFloors).fill(0));
                    }}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="text-blue-800">Горен отстъп: {padTopPct}%</label>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={padTopPct}
                    onChange={(e) => setPadTopPct(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="text-blue-800">Долен отстъп: {padBottomPct}%</label>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={padBottomPct}
                    onChange={(e) => setPadBottomPct(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                
                <button
                  onClick={() => setCalibrationClicks([])}
                  className="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Нулиране на ъгли
                </button>
                
                <button
                  onClick={handleExport}
                  className="w-full px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Експорт JSON
                </button>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  Импорт JSON
                </button>
              </div>
              
              {calibrationClicks.length < 4 && (
                <div className="mt-3 p-2 bg-yellow-100 rounded text-xs text-yellow-800">
                  Кликнете ъгъл {calibrationClicks.length + 1}/4:
                  {' '}{['Ляв-Горен', 'Десен-Горен', 'Десен-Долен', 'Ляв-Долен'][calibrationClicks.length]}
                </div>
              )}
            </div>
          )}
          
          <button
            onClick={() => setCalibrationMode(!calibrationMode)}
            className={`w-full px-3 py-2 rounded ${
              calibrationMode ? 'bg-red-600 text-white' : 'bg-gray-600 text-white'
            } hover:opacity-90`}
          >
            {calibrationMode ? 'Изход от калибриране' : 'Режим калибриране'}
          </button>
        </div>
        
        {/* Center - Building Image with SVG Overlay */}
        <div className="flex-1">
          <div 
            ref={imageRef}
            className="relative aspect-[3/4] max-w-xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden"
          >
            <img
              src={BUILDING_IMAGE_URL}
              alt="Сграда"
              className="absolute inset-0 w-full h-full object-cover"
            />
            
            {/* SVG Overlay */}
            <svg
              ref={svgRef}
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="xMidYMid meet"
              onClick={calibrationMode ? handleCalibrationClick : undefined}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{ cursor: calibrationMode ? (draggingHandle ? 'move' : 'crosshair') : 'default' }}
            >
              <defs>
                {/* Soft glow filter */}
                <filter id="softGlow">
                  <feGaussianBlur stdDeviation="0.5" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              
              {/* Floor Polygons */}
              {finalPolygons.map((polygon, index) => {
                const floorId = floors - index;
                const isHovered = hoveredFloorId === floorId;
                const isSelected = selectedFloorId === floorId;
                const isActive = isHovered || isSelected;
                
                return (
                  <g key={floorId}>
                    {/* Glow effect layer */}
                    {isActive && (
                      <polygon
                        points={pointsToSvgString(polygon)}
                        fill="rgba(255, 209, 0, 0.15)"
                        filter="url(#softGlow)"
                        className="pointer-events-none"
                      />
                    )}
                    
                    {/* Main polygon */}
                    <polygon
                      points={pointsToSvgString(polygon)}
                      fill={isActive ? 'rgba(255, 209, 0, 0.28)' : 'transparent'}
                      stroke={isActive ? 'rgba(255, 209, 0, 0.9)' : 'transparent'}
                      strokeWidth={isActive ? 1.5 : 0}
                      className="transition-all duration-300 cursor-pointer"
                      onMouseEnter={() => !calibrationMode && setHoveredFloorId(floorId)}
                      onMouseLeave={() => !calibrationMode && setHoveredFloorId(null)}
                      onClick={() => !calibrationMode && setSelectedFloorId(floorId)}
                    />
                  </g>
                );
              })}
              
              {/* Calibration UI */}
              {calibrationMode && (
                <>
                  {/* Click points */}
                  {calibrationClicks.map((point, i) => (
                    <circle
                      key={i}
                      cx={point.x}
                      cy={point.y}
                      r="1"
                      fill="red"
                      stroke="white"
                      strokeWidth="0.2"
                    />
                  ))}
                  
                  {/* Draggable handles */}
                  {Object.entries(facade).map(([key, point]) => (
                    <circle
                      key={key}
                      cx={point.x}
                      cy={point.y}
                      r="1.5"
                      fill="blue"
                      stroke="white"
                      strokeWidth="0.3"
                      className="cursor-move"
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        setDraggingHandle(key as keyof FacadeQuad);
                      }}
                    />
                  ))}
                  
                  {/* Facade outline */}
                  <polygon
                    points={pointsToSvgString([facade.LT, facade.RT, facade.RB, facade.LB])}
                    fill="none"
                    stroke="blue"
                    strokeWidth="0.5"
                    strokeDasharray="2,2"
                    className="pointer-events-none"
                  />
                </>
              )}
            </svg>
          </div>
        </div>
        
        {/* Right Panel - Property Details */}
        {selectedFloorId && (
          <div className="w-96">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">
                {MOCK_FLOOR_DATA.find(f => f.id === selectedFloorId)?.имеBG}
              </h3>
              
              {/* Properties Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Имот</th>
                      <th className="text-left py-2">Вид</th>
                      <th className="text-left py-2">Застроена площ</th>
                      <th className="text-left py-2">Обща площ</th>
                      <th className="text-left py-2">Изложение</th>
                      <th className="text-left py-2">Статус</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_FLOOR_DATA.find(f => f.id === selectedFloorId)?.rows.map((row, i) => (
                      <tr key={i} className="border-b">
                        <td className="py-2">{row.имот}</td>
                        <td className="py-2">{row.вид}</td>
                        <td className="py-2">{row['застроена площ']}</td>
                        <td className="py-2">{row['обща площ']}</td>
                        <td className="py-2">{row.изложение}</td>
                        <td className="py-2">
                          <span className={`px-2 py-1 rounded text-xs ${getStatusColor(row.статус)}`}>
                            {row.статус}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Floor Plan */}
              <div className="mt-6">
                <h4 className="font-semibold mb-3">Архитектурен план</h4>
                <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500">План на етажа</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FloorHighlighter;