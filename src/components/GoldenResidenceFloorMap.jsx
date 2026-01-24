import React, { useState, useMemo } from 'react';
import { useApartments } from '../context/ApartmentContext';
// Import architecture images so Vite bundles them
import archA2 from '../assets/продажби/project 2/architectures-a/architecture-a-floor-2.png';
import archA3 from '../assets/продажби/project 2/architectures-a/architecture-a-floor-3.png';
import archA4 from '../assets/продажби/project 2/architectures-a/architecture-a-floor-4.png';
import archA5 from '../assets/продажби/project 2/architectures-a/architecture-a-floor-5.png';
import archA6 from '../assets/продажби/project 2/architectures-a/architecture-a-floor-6.png';
import archA7 from '../assets/продажби/project 2/architectures-a/architecture-a-floor-7.png';
import archA8 from '../assets/продажби/project 2/architectures-a/architecture-a-floor-8.png';

import archB1 from '../assets/продажби/project 2/architectures-b/architecture-b-floor-1.png';
import archB2 from '../assets/продажби/project 2/architectures-b/architecture-b-floor-2.png';
import archB3 from '../assets/продажби/project 2/architectures-b/architecture-b-floor-3.png';
import archB4 from '../assets/продажби/project 2/architectures-b/architecture-b-floor-4.png';
import archB5 from '../assets/продажби/project 2/architectures-b/architecture-b-floor-5.png';
import archB6 from '../assets/продажби/project 2/architectures-b/architecture-b-floor-6.png';
import archB7 from '../assets/продажби/project 2/architectures-b/architecture-b-floor-7.png';
import archB8 from '../assets/продажби/project 2/architectures-b/architecture-b-floor-8.png';
import archBGround from '../assets/продажби/project 2/architectures-b/приземен-b.png';
import archBUnderground from '../assets/продажби/project 2/architectures-b/подземен-b.png';

// Import main golden residence image
import goldenResidenceMain from '../assets/продажби/project 2/golden-residence.jpg';

const architectureA = {2: archA2,3: archA3,4: archA4,5: archA5,6: archA6,7: archA7,8: archA8};
const architectureB = {1: archB1,2: archB2,3: archB3,4: archB4,5: archB5,6: archB6,7: archB7,8: archB8};

// Building floor images mapping using public URLs
const buildingAImages = {
  1: '/images/golden-residence/building-2-blog-a-floor1.png',
  2: '/images/golden-residence/building-2-blog-a-floor2.png',
  3: '/images/golden-residence/building-2-blog-a-floor3.png',
  4: '/images/golden-residence/building-2-blog-a-floor4.png',
  5: '/images/golden-residence/building-2-blog-a-floor5.png',
  6: '/images/golden-residence/building-2-blog-a-floor6.png',
  7: '/images/golden-residence/building-2-blog-a-floor7.png',
  8: '/images/golden-residence/building-2-blog-a-floor8.png'
};
const buildingBImages = {
  1: '/images/golden-residence/building-2-blog-b-floor1.png',
  2: '/images/golden-residence/building-2-blog-b-floor2.png',
  3: '/images/golden-residence/building-2-blog-b-floor3.png',
  4: '/images/golden-residence/building-2-blog-b-floor4.png',
  5: '/images/golden-residence/building-2-blog-b-floor5.png',
  6: '/images/golden-residence/building-2-blog-b-floor6.png',
  7: '/images/golden-residence/building-2-blog-b-floor7.png',
  8: '/images/golden-residence/building-2-blog-b-floor8.png'
};

const GoldenResidenceFloorMap = ({ onHoverChange, currentImage, onFloorSelect }) => {
  const [currentBlockAImage, setCurrentBlockAImage] = useState(goldenResidenceMain);
  const [currentBlockBImage, setCurrentBlockBImage] = useState(goldenResidenceMain);
  const [hoveredFloorA, setHoveredFloorA] = useState(null);
  const [hoveredFloorB, setHoveredFloorB] = useState(null);
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [isArchitecturePlanFullscreen, setIsArchitecturePlanFullscreen] = useState(false);
  const [selectedApartment, setSelectedApartment] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePosition, setLastMousePosition] = useState({ x: 0, y: 0 });

  // Get garage and parking data from context (Google Sheets)
  const { getGaragesData, getParkingData, usingFallback } = useApartments();
  const garagesFromSheet = getGaragesData();
  const parkingFromSheet = getParkingData();

  // Debug: Log what data is being used
  console.log('=== GARAGE DEBUG ===');
  console.log('Using fallback:', usingFallback);
  console.log('Garages count:', garagesFromSheet?.length);
  console.log('G-070 status:', garagesFromSheet?.find(g => g.number === 'Г-070')?.status);
  console.log('G-071 status:', garagesFromSheet?.find(g => g.number === 'Г-071')?.status);

  // Transform Google Sheets data to component format
  const transformGarage = (item) => ({
    apartment: item.number,
    built: item.built,
    ideal: item.ideal,
    total: item.total,
    type: 'ГАРАЖ',
    status: item.status
  });

  const transformParking = (item) => ({
    apartment: item.number,
    built: item.built,
    ideal: item.ideal,
    total: item.total,
    type: 'СКЛАДОВО ПОМЕЩЕНИЕ',
    status: item.status
  });

  // Dynamic ground floor data (garages Г-001 to Г-052, parking ПМ-01 to ПМ-34)
  const groundFloorGarages = useMemo(() => {
    return garagesFromSheet
      .filter(g => {
        const num = parseInt(g.number.replace('Г-', ''));
        return num >= 1 && num <= 52;
      })
      .map(transformGarage);
  }, [garagesFromSheet]);

  const groundFloorParking = useMemo(() => {
    return parkingFromSheet
      .filter(p => {
        const num = parseInt(p.number.replace('ПМ-', ''));
        return num >= 1 && num <= 34;
      })
      .map(transformParking);
  }, [parkingFromSheet]);

  // Dynamic underground floor data (garages Г-053 to Г-113, parking ПМ-35 to ПМ-68)
  const undergroundGarages = useMemo(() => {
    return garagesFromSheet
      .filter(g => {
        const num = parseInt(g.number.replace('Г-', ''));
        return num >= 53 && num <= 113;
      })
      .map(transformGarage);
  }, [garagesFromSheet]);

  const undergroundParking = useMemo(() => {
    return parkingFromSheet
      .filter(p => {
        const num = parseInt(p.number.replace('ПМ-', ''));
        return num >= 35 && num <= 68;
      })
      .map(transformParking);
  }, [parkingFromSheet]);

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

  // Block A Floor 2 apartment data
  const blockAFloor2Data = [
    { apartment: 'А 201', built: '54.38', ideal: '7.80', total: '62.18', status: 'Свободен' },
    { apartment: 'А 202', built: '88.75', ideal: '12.73', total: '101.48', status: 'Свободен' },
    { apartment: 'А 203', built: '93.78', ideal: '13.46', total: '107.24', status: 'Свободен' },
    { apartment: 'А 204', built: '59.36', ideal: '8.52', total: '67.88', status: 'Свободен' },
    { apartment: 'А 205', built: '59.36', ideal: '8.52', total: '67.88', status: 'Свободен' },
    { apartment: 'А 206', built: '100.20', ideal: '14.38', total: '114.58', status: 'Свободен' },
    { apartment: 'А 207', built: '61.11', ideal: '8.77', total: '69.88', status: 'Свободен' },
    { apartment: 'А 208', built: '61.11', ideal: '8.77', total: '69.88', status: 'Свободен' },
    { apartment: 'А 209', built: '61.11', ideal: '8.77', total: '69.88', status: 'Свободен' },
    { apartment: 'А 210', built: '94.94', ideal: '13.62', total: '108.56', status: 'Свободен' },
    { apartment: 'А 211', built: '55.54', ideal: '7.97', total: '63.51', status: 'Свободен' },
    { apartment: 'А 212', built: '38.46', ideal: '5.52', total: '43.98', type: 'АТЕЛИЕ', status: 'Свободен' }
  ];

  // Block A Floor 3 apartment data
  const blockAFloor3Data = [
    { apartment: 'А 301', built: '54.38', ideal: '7.80', total: '62.18', status: 'Свободен' },
    { apartment: 'А 302', built: '88.75', ideal: '12.73', total: '101.48', status: 'Свободен' },
    { apartment: 'А 303', built: '93.78', ideal: '13.46', total: '107.24', status: 'Продадени' },
    { apartment: 'А 304', built: '59.36', ideal: '8.52', total: '67.88', status: 'Свободен' },
    { apartment: 'А 305', built: '59.36', ideal: '8.52', total: '67.88', status: 'Свободен' },
    { apartment: 'А 306', built: '100.20', ideal: '14.38', total: '114.58', status: 'Свободен' },
    { apartment: 'А 307', built: '61.11', ideal: '8.77', total: '69.88', status: 'Свободен' },
    { apartment: 'А 308', built: '61.11', ideal: '8.77', total: '69.88', status: 'Свободен' },
    { apartment: 'А 309', built: '61.11', ideal: '8.77', total: '69.88', status: 'Продадени' },
    { apartment: 'А 310', built: '94.94', ideal: '13.62', total: '108.56', status: 'Свободен' },
    { apartment: 'А 311', built: '55.54', ideal: '7.97', total: '63.51', status: 'Свободен' },
    { apartment: 'А 312', built: '38.46', ideal: '5.52', total: '43.98', type: 'АТЕЛИЕ', status: 'Свободен' }
  ];

  // Block A Floor 4 apartment data
  const blockAFloor4Data = [
    { apartment: 'А 401', built: '54.38', ideal: '7.80', total: '62.18', status: 'Свободен' },
    { apartment: 'А 402', built: '88.75', ideal: '12.73', total: '101.48', status: 'Свободен' },
    { apartment: 'А 403', built: '93.78', ideal: '13.46', total: '107.24', status: 'Свободен' },
    { apartment: 'А 404', built: '59.36', ideal: '8.52', total: '67.88', status: 'Свободен' },
    { apartment: 'А 405', built: '59.36', ideal: '8.52', total: '67.88', status: 'Свободен' },
    { apartment: 'А 406', built: '100.20', ideal: '14.38', total: '114.58', status: 'Резервиран' },
    { apartment: 'А 407', built: '61.11', ideal: '8.77', total: '69.88', status: 'Свободен' },
    { apartment: 'А 408', built: '61.11', ideal: '8.77', total: '69.88', status: 'Свободен' },
    { apartment: 'А 409', built: '61.11', ideal: '8.77', total: '69.88', status: 'Продадени' },
    { apartment: 'А 410', built: '94.94', ideal: '13.62', total: '108.56', status: 'Свободен' },
    { apartment: 'А 411', built: '55.54', ideal: '7.97', total: '63.51', status: 'Свободен' },
    { apartment: 'А 412', built: '38.46', ideal: '5.52', total: '43.98', type: 'АТЕЛИЕ', status: 'Свободен' }
  ];

  // Block A Floor 5 apartment data
  const blockAFloor5Data = [
    { apartment: 'А 501', built: '54.38', ideal: '7.80', total: '62.18', status: 'Свободен' },
    { apartment: 'А 502', built: '88.75', ideal: '12.73', total: '101.48', status: 'Свободен' },
    { apartment: 'А 503', built: '93.78', ideal: '13.46', total: '107.24', status: 'Свободен' },
    { apartment: 'А 504', built: '59.36', ideal: '8.52', total: '67.88', status: 'Свободен' },
    { apartment: 'А 505', built: '59.36', ideal: '8.52', total: '67.88', status: 'Свободен' },
    { apartment: 'А 506', built: '100.20', ideal: '14.38', total: '114.58', status: 'Резервиран' },
    { apartment: 'А 507', built: '61.11', ideal: '8.77', total: '69.88', status: 'Свободен' },
    { apartment: 'А 508', built: '61.11', ideal: '8.77', total: '69.88', status: 'Свободен' },
    { apartment: 'А 509', built: '61.11', ideal: '8.77', total: '69.88', status: 'Продадени' },
    { apartment: 'А 510', built: '94.94', ideal: '13.62', total: '108.56', status: 'Свободен' },
    { apartment: 'А 511', built: '55.54', ideal: '7.97', total: '63.51', status: 'Свободен' },
    { apartment: 'А 512', built: '38.46', ideal: '5.52', total: '43.98', type: 'АТЕЛИЕ', status: 'Свободен' }
  ];

  // Block A Floor 6 apartment data
  const blockAFloor6Data = [
    { apartment: 'А 601', built: '54.38', ideal: '7.80', total: '62.18', status: 'Свободен' },
    { apartment: 'А 602', built: '88.75', ideal: '12.73', total: '101.48', status: 'Свободен' },
    { apartment: 'А 603', built: '93.78', ideal: '13.46', total: '107.24', status: 'Свободен' },
    { apartment: 'А 604', built: '59.36', ideal: '8.52', total: '67.88', status: 'Свободен' },
    { apartment: 'А 605', built: '59.36', ideal: '8.52', total: '67.88', status: 'Свободен' },
    { apartment: 'А 606', built: '100.20', ideal: '14.38', total: '114.58', status: 'Резервиран' },
    { apartment: 'А 607', built: '61.11', ideal: '8.77', total: '69.88', status: 'Резервиран' },
    { apartment: 'А 608', built: '61.11', ideal: '8.77', total: '69.88', status: 'Резервиран' },
    { apartment: 'А 609', built: '61.11', ideal: '8.77', total: '69.88', status: 'Свободен' },
    { apartment: 'А 610', built: '94.94', ideal: '13.62', total: '108.56', status: 'Свободен' },
    { apartment: 'А 611', built: '55.54', ideal: '7.97', total: '63.51', status: 'Свободен' },
    { apartment: 'А 612', built: '38.46', ideal: '5.52', total: '43.98', type: 'АТЕЛИЕ', status: 'Свободен' }
  ];

  // Block A Floor 7 apartment data
  const blockAFloor7Data = [
    { apartment: 'А 701', built: '54.38', ideal: '7.80', total: '62.18', status: 'Свободен' },
    { apartment: 'А 702', built: '88.75', ideal: '12.73', total: '101.48', status: 'Свободен' },
    { apartment: 'А 703', built: '93.78', ideal: '13.46', total: '107.24', status: 'Свободен' },
    { apartment: 'А 704', built: '59.36', ideal: '8.52', total: '67.88', status: 'Продадени' },
    { apartment: 'А 705', built: '59.36', ideal: '8.52', total: '67.88', status: 'Продадени' },
    { apartment: 'А 706', built: '100.20', ideal: '14.38', total: '114.58', status: 'Продадени' },
    { apartment: 'А 707', built: '61.11', ideal: '8.77', total: '69.88', status: 'Свободен' },
    { apartment: 'А 708', built: '61.11', ideal: '8.77', total: '69.88', status: 'Свободен' },
    { apartment: 'А 709', built: '61.11', ideal: '8.77', total: '69.88', status: 'Продадени' },
    { apartment: 'А 710', built: '94.94', ideal: '13.62', total: '108.56', status: 'Свободен' },
    { apartment: 'А 711', built: '55.54', ideal: '7.97', total: '63.51', status: 'Свободен' },
    { apartment: 'А 712', built: '38.46', ideal: '5.52', total: '43.98', type: 'АТЕЛИЕ', status: 'Свободен' }
  ];

  // Block A Floor 8 apartment data
  const blockAFloor8Data = [
    { apartment: 'А 801', built: '54.38', ideal: '7.80', total: '62.18', status: 'Свободен' },
    { apartment: 'А 802', built: '88.75', ideal: '12.73', total: '101.48', status: 'Свободен' },
    { apartment: 'А 803', built: '93.78', ideal: '13.46', total: '107.24', status: 'Свободен' },
    { apartment: 'А 804', built: '59.36', ideal: '8.52', total: '67.88', status: 'Свободен' },
    { apartment: 'А 805', built: '59.36', ideal: '8.52', total: '67.88', status: 'Свободен' },
    { apartment: 'А 806', built: '100.20', ideal: '14.38', total: '114.58', status: 'Продадени' },
    { apartment: 'А 807', built: '61.11', ideal: '8.77', total: '69.88', status: 'Продадени' },
    { apartment: 'А 808', built: '61.11', ideal: '8.77', total: '69.88', status: 'Свободен' },
    { apartment: 'А 809', built: '61.11', ideal: '8.77', total: '69.88', status: 'Свободен' },
    { apartment: 'А 810', built: '94.94', ideal: '13.62', total: '108.56', status: 'Свободен' },
    { apartment: 'А 811', built: '55.54', ideal: '7.97', total: '63.51', status: 'Свободен' },
    { apartment: 'А 812', built: '38.46', ideal: '5.52', total: '43.98', type: 'АТЕЛИЕ', status: 'Свободен' }
  ];

  // Block B Floor 1 apartment data
  const blockBFloor1Data = [
    { apartment: 'Б 101', built: '57.46', ideal: '8.22', total: '65.68', status: 'Свободен' },
    { apartment: 'Б 102', built: '97.74', ideal: '14.00', total: '111.74', status: 'Свободен' },
    { apartment: 'Б 103', built: '93.78', ideal: '13.46', total: '107.24', status: 'Свободен' },
    { apartment: 'Б 104', built: '59.36', ideal: '8.52', total: '67.88', status: 'Свободен' },
    { apartment: 'Б 105', built: '59.36', ideal: '8.52', total: '67.88', status: 'Свободен' },
    { apartment: 'Б 106', built: '100.20', ideal: '14.38', total: '114.58', status: 'Свободен' },
    { apartment: 'Б 107', built: '61.11', ideal: '8.77', total: '69.88', status: 'Свободен' },
    { apartment: 'Б 108', built: '61.11', ideal: '8.77', total: '69.88', status: 'Свободен' },
    { apartment: 'Б 109', built: '61.11', ideal: '8.77', total: '69.88', status: 'Свободен' },
    { apartment: 'Б 110', built: '94.94', ideal: '13.62', total: '108.56', status: 'Свободен' },
    { apartment: 'Б 111', built: '51.88', ideal: '7.43', total: '59.31', status: 'Свободен' },
    { apartment: 'Б 112', built: '38.46', ideal: '5.52', total: '43.98', type: 'АТЕЛИЕ', status: 'Свободен' }
  ];

  // Block B Floor 2 apartment data
  const blockBFloor2Data = [
    { apartment: 'Б 201', built: '54.38', ideal: '7.80', total: '62.18', status: 'Свободен' },
    { apartment: 'Б 202', built: '88.75', ideal: '12.73', total: '101.48', status: 'Свободен' },
    { apartment: 'Б 203', built: '93.78', ideal: '13.46', total: '107.24', status: 'Свободен' },
    { apartment: 'Б 204', built: '59.36', ideal: '8.52', total: '67.88', status: 'Продадени' },
    { apartment: 'Б 205', built: '59.36', ideal: '8.52', total: '67.88', status: 'Свободен' },
    { apartment: 'Б 206', built: '100.20', ideal: '14.38', total: '114.58', status: 'Свободен' },
    { apartment: 'Б 207', built: '61.11', ideal: '8.77', total: '69.88', status: 'Свободен' },
    { apartment: 'Б 208', built: '61.11', ideal: '8.77', total: '69.88', status: 'Свободен' },
    { apartment: 'Б 209', built: '61.11', ideal: '8.77', total: '69.88', status: 'Свободен' },
    { apartment: 'Б 210', built: '94.94', ideal: '13.62', total: '108.56', status: 'Свободен' },
    { apartment: 'Б 211', built: '55.54', ideal: '7.97', total: '63.51', status: 'Свободен' },
    { apartment: 'Б 212', built: '38.46', ideal: '5.52', total: '43.98', type: 'АТЕЛИЕ', status: 'Свободен' }
  ];

  // Block B Floor 3 apartment data
  const blockBFloor3Data = [
    { apartment: 'Б 301', built: '54.38', ideal: '7.80', total: '62.18', status: 'Продадени' },
    { apartment: 'Б 302', built: '88.75', ideal: '12.73', total: '101.48', status: 'Продадени' },
    { apartment: 'Б 303', built: '93.78', ideal: '13.46', total: '107.24', status: 'Продадени' },
    { apartment: 'Б 304', built: '59.36', ideal: '8.52', total: '67.88', status: 'Продадени' },
    { apartment: 'Б 305', built: '59.36', ideal: '8.52', total: '67.88', status: 'Продадени' },
    { apartment: 'Б 306', built: '100.20', ideal: '14.38', total: '114.58', status: 'Продадени' },
    { apartment: 'Б 307', built: '61.11', ideal: '8.77', total: '69.88', status: 'Продадени' },
    { apartment: 'Б 308', built: '61.11', ideal: '8.77', total: '69.88', status: 'Продадени' },
    { apartment: 'Б 309', built: '61.11', ideal: '8.77', total: '69.88', status: 'Продадени' },
    { apartment: 'Б 310', built: '94.94', ideal: '13.62', total: '108.56', status: 'Продадени' },
    { apartment: 'Б 311', built: '55.54', ideal: '7.97', total: '63.51', status: 'Продадени' },
    { apartment: 'Б 312', built: '38.46', ideal: '5.52', total: '43.98', type: 'АТЕЛИЕ', status: 'Продадени' }
  ];

  // Block B Floor 4 apartment data
  const blockBFloor4Data = [
    { apartment: 'Б 401', built: '54.38', ideal: '7.80', total: '62.18', status: 'Продадени' },
    { apartment: 'Б 402', built: '88.75', ideal: '12.73', total: '101.48', status: 'Продадени' },
    { apartment: 'Б 403', built: '93.78', ideal: '13.46', total: '107.24', status: 'Продадени' },
    { apartment: 'Б 404', built: '59.36', ideal: '8.52', total: '67.88', status: 'Продадени' },
    { apartment: 'Б 405', built: '59.36', ideal: '8.52', total: '67.88', status: 'Продадени' },
    { apartment: 'Б 406', built: '100.20', ideal: '14.38', total: '114.58', status: 'Продадени' },
    { apartment: 'Б 407', built: '61.11', ideal: '8.77', total: '69.88', status: 'Продадени' },
    { apartment: 'Б 408', built: '61.11', ideal: '8.77', total: '69.88', status: 'Продадени' },
    { apartment: 'Б 409', built: '61.11', ideal: '8.77', total: '69.88', status: 'Продадени' },
    { apartment: 'Б 410', built: '94.94', ideal: '13.62', total: '108.56', status: 'Продадени' },
    { apartment: 'Б 411', built: '55.54', ideal: '7.97', total: '63.51', status: 'Продадени' },
    { apartment: 'Б 412', built: '38.46', ideal: '5.52', total: '43.98', type: 'АТЕЛИЕ', status: 'Продадени' }
  ];

  // Block B Floor 5 apartment data
  const blockBFloor5Data = [
    { apartment: 'Б 501', built: '54.38', ideal: '7.80', total: '62.18', status: 'Продадени' },
    { apartment: 'Б 502', built: '88.75', ideal: '12.73', total: '101.48', status: 'Продадени' },
    { apartment: 'Б 503', built: '93.78', ideal: '13.46', total: '107.24', status: 'Продадени' },
    { apartment: 'Б 504', built: '59.36', ideal: '8.52', total: '67.88', status: 'Продадени' },
    { apartment: 'Б 505', built: '59.36', ideal: '8.52', total: '67.88', status: 'Продадени' },
    { apartment: 'Б 506', built: '100.20', ideal: '14.38', total: '114.58', status: 'Продадени' },
    { apartment: 'Б 507', built: '61.11', ideal: '8.77', total: '69.88', status: 'Продадени' },
    { apartment: 'Б 508', built: '61.11', ideal: '8.77', total: '69.88', status: 'Продадени' },
    { apartment: 'Б 509', built: '61.11', ideal: '8.77', total: '69.88', status: 'Продадени' },
    { apartment: 'Б 510', built: '94.94', ideal: '13.62', total: '108.56', status: 'Продадени' },
    { apartment: 'Б 511', built: '55.54', ideal: '7.97', total: '63.51', status: 'Продадени' },
    { apartment: 'Б 512', built: '38.46', ideal: '5.52', total: '43.98', type: 'АТЕЛИЕ', status: 'Продадени' }
  ];

  // Block B Floor 6 apartment data
  const blockBFloor6Data = [
    { apartment: 'Б 601', built: '54.38', ideal: '7.80', total: '62.18', status: 'Продадени' },
    { apartment: 'Б 602', built: '88.75', ideal: '12.73', total: '101.48', status: 'Продадени' },
    { apartment: 'Б 603', built: '93.78', ideal: '13.46', total: '107.24', status: 'Продадени' },
    { apartment: 'Б 604', built: '59.36', ideal: '8.52', total: '67.88', status: 'Продадени' },
    { apartment: 'Б 605', built: '59.36', ideal: '8.52', total: '67.88', status: 'Продадени' },
    { apartment: 'Б 606', built: '100.20', ideal: '14.38', total: '114.58', status: 'Продадени' },
    { apartment: 'Б 607', built: '61.11', ideal: '8.77', total: '69.88', status: 'Продадени' },
    { apartment: 'Б 608', built: '61.11', ideal: '8.77', total: '69.88', status: 'Продадени' },
    { apartment: 'Б 609', built: '61.11', ideal: '8.77', total: '69.88', status: 'Продадени' },
    { apartment: 'Б 610', built: '94.94', ideal: '13.62', total: '108.56', status: 'Продадени' },
    { apartment: 'Б 611', built: '55.54', ideal: '7.97', total: '63.51', status: 'Продадени' },
    { apartment: 'Б 612', built: '38.46', ideal: '5.52', total: '43.98', type: 'АТЕЛИЕ', status: 'Продадени' }
  ];

  // Block B Floor 7 apartment data
  const blockBFloor7Data = [
    { apartment: 'Б 701', built: '54.38', ideal: '7.80', total: '62.18', status: 'Свободен' },
    { apartment: 'Б 702', built: '88.75', ideal: '12.73', total: '101.48', status: 'Свободен' },
    { apartment: 'Б 703', built: '93.78', ideal: '13.46', total: '107.24', status: 'Свободен' },
    { apartment: 'Б 704', built: '59.36', ideal: '8.52', total: '67.88', status: 'Свободен' },
    { apartment: 'Б 705', built: '59.36', ideal: '8.52', total: '67.88', status: 'Свободен' },
    { apartment: 'Б 706', built: '100.20', ideal: '14.38', total: '114.58', status: 'Свободен' },
    { apartment: 'Б 707', built: '61.11', ideal: '8.77', total: '69.88', status: 'Продадени' },
    { apartment: 'Б 708', built: '61.11', ideal: '8.77', total: '69.88', status: 'Продадени' },
    { apartment: 'Б 709', built: '61.11', ideal: '8.77', total: '69.88', status: 'Свободен' },
    { apartment: 'Б 710', built: '94.94', ideal: '13.62', total: '108.56', status: 'Свободен' },
    { apartment: 'Б 711', built: '55.54', ideal: '7.97', total: '63.51', status: 'Свободен' },
    { apartment: 'Б 712', built: '38.46', ideal: '5.52', total: '43.98', type: 'АТЕЛИЕ', status: 'Свободен' }
  ];

  // Block B Floor 8 apartment data
  const blockBFloor8Data = [
    { apartment: 'Б 801', built: '54.38', ideal: '7.80', total: '62.18', status: 'Свободен' },
    { apartment: 'Б 802', built: '88.75', ideal: '12.73', total: '101.48', status: 'Свободен' },
    { apartment: 'Б 803', built: '93.78', ideal: '13.46', total: '107.24', status: 'Свободен' },
    { apartment: 'Б 804', built: '59.36', ideal: '8.52', total: '67.88', status: 'Свободен' },
    { apartment: 'Б 805', built: '59.36', ideal: '8.52', total: '67.88', status: 'Свободен' },
    { apartment: 'Б 806', built: '100.20', ideal: '14.38', total: '114.58', status: 'Свободен' },
    { apartment: 'Б 807', built: '61.11', ideal: '8.77', total: '69.88', status: 'Свободен' },
    { apartment: 'Б 808', built: '61.11', ideal: '8.77', total: '69.88', status: 'Свободен' },
    { apartment: 'Б 809', built: '61.11', ideal: '8.77', total: '69.88', status: 'Свободен' },
    { apartment: 'Б 810', built: '94.94', ideal: '13.62', total: '108.56', status: 'Свободен' },
    { apartment: 'Б 811', built: '55.54', ideal: '7.97', total: '63.51', status: 'Свободен' },
    { apartment: 'Б 812', built: '38.46', ideal: '5.52', total: '43.98', type: 'АТЕЛИЕ', status: 'Свободен' }
  ];

  // Ground Floor data - Dynamic from Google Sheets + Static entrances
  const groundFloorData = useMemo(() => [
    ...groundFloorGarages,
    ...groundFloorParking,
    // Entrances (static)
    { apartment: 'А 001', built: '41.26', ideal: '5.91', total: '47.17', type: 'ВХОДНО ПОМЕЩЕНИЕ', status: 'Резервиран' },
    { apartment: 'Б 001', built: '41.26', ideal: '5.91', total: '47.17', type: 'ВХОДНО ПОМЕЩЕНИЕ', status: 'Резервиран' }
  ], [groundFloorGarages, groundFloorParking]);

  // Underground Floor data - Dynamic from Google Sheets
  const undergroundFloorData = useMemo(() => [
    ...undergroundGarages,
    ...undergroundParking
  ], [undergroundGarages, undergroundParking]);

  const handleBlockAFloorHover = (floorNumber) => {
    // Immediate state update for faster response
    setHoveredFloorA(floorNumber);
    
    // Only update image if necessary
    if (floorNumber && buildingAImages[floorNumber]) {
      setCurrentBlockAImage(buildingAImages[floorNumber]);
    } else if (!floorNumber) {
      setCurrentBlockAImage(goldenResidenceMain);
    }
    
    // Callback for parent component
    onHoverChange?.(floorNumber !== null, floorNumber);
  };

  const handleBlockBFloorHover = (floorNumber) => {
    // Immediate state update for faster response
    setHoveredFloorB(floorNumber);
    
    // Only update image if necessary
    if (floorNumber && buildingBImages[floorNumber]) {
      setCurrentBlockBImage(buildingBImages[floorNumber]);
    } else if (!floorNumber) {
      setCurrentBlockBImage(goldenResidenceMain);
    }
    
    // Callback for parent component
    onHoverChange?.(floorNumber !== null, floorNumber);
  };

  const handleFloorClick = (block, floor) => {
    console.log(`Floor clicked: Block ${block}, Floor ${floor}`);
    // Clear selected apartment when switching floors
    setSelectedApartment(null);
    
    if (block === 'A' && floor === 1) {
      setSelectedFloor({ block: 'A', floor: 1, data: blockAFloor1Data });
    } else if (block === 'A' && floor === 2) {
      setSelectedFloor({ block: 'A', floor: 2, data: blockAFloor2Data });
    } else if (block === 'A' && floor === 3) {
      setSelectedFloor({ block: 'A', floor: 3, data: blockAFloor3Data });
    } else if (block === 'A' && floor === 4) {
      setSelectedFloor({ block: 'A', floor: 4, data: blockAFloor4Data });
    } else if (block === 'A' && floor === 5) {
      setSelectedFloor({ block: 'A', floor: 5, data: blockAFloor5Data });
    } else if (block === 'A' && floor === 6) {
      setSelectedFloor({ block: 'A', floor: 6, data: blockAFloor6Data });
    } else if (block === 'A' && floor === 7) {
      setSelectedFloor({ block: 'A', floor: 7, data: blockAFloor7Data });
    } else if (block === 'A' && floor === 8) {
      setSelectedFloor({ block: 'A', floor: 8, data: blockAFloor8Data });
    } else if (block === 'B' && floor === 1) {
      setSelectedFloor({ block: 'B', floor: 1, data: blockBFloor1Data });
    } else if (block === 'B' && floor === 2) {
      setSelectedFloor({ block: 'B', floor: 2, data: blockBFloor2Data });
    } else if (block === 'B' && floor === 3) {
      setSelectedFloor({ block: 'B', floor: 3, data: blockBFloor3Data });
    } else if (block === 'B' && floor === 4) {
      setSelectedFloor({ block: 'B', floor: 4, data: blockBFloor4Data });
    } else if (block === 'B' && floor === 5) {
      setSelectedFloor({ block: 'B', floor: 5, data: blockBFloor5Data });
    } else if (block === 'B' && floor === 6) {
      setSelectedFloor({ block: 'B', floor: 6, data: blockBFloor6Data });
    } else if (block === 'B' && floor === 7) {
      setSelectedFloor({ block: 'B', floor: 7, data: blockBFloor7Data });
    } else if (block === 'B' && floor === 8) {
      setSelectedFloor({ block: 'B', floor: 8, data: blockBFloor8Data });
    } else if ((block === 'A' || block === 'B') && floor === 0) {
      setSelectedFloor({ block: 'GROUND', floor: 0, data: groundFloorData });
    } else if ((block === 'A' || block === 'B') && floor === -1) {
      setSelectedFloor({ block: 'UNDERGROUND', floor: -1, data: undergroundFloorData });
    }
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
                {selectedFloor.block === 'GROUND' ? 'Приземен етаж - Гаражи и складове' : 
                 selectedFloor.block === 'UNDERGROUND' ? 'Подземен етаж - Гаражи и складове' :
                 `Блок ${selectedFloor.block} - Етаж ${selectedFloor.floor}`}
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
                        <span className={`px-3 py-1 text-sm rounded-full font-normal ${
                          apt.status === 'Продадени' ? 'bg-red-100 text-red-700' :
                          apt.status === 'Резервиран' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {apt.status === 'Продадени' ? 'Продаден' : apt.status}
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
                    {selectedFloor.data.filter(apt => apt.status === 'Продадени').length}
                  </div>
                  <div className="text-sm font-medium text-red-700">Продадени</div>
                  <div className="w-full h-1 bg-red-200 rounded-full mt-2">
                    <div className="h-full bg-red-500 rounded-full" style={{width: selectedFloor.data.filter(apt => apt.status === 'Продадени').length > 0 ? '100%' : '0%'}}></div>
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
              {(() => {
                let architectureSrc = archBGround;
                if (selectedFloor.block === 'GROUND') {
                  architectureSrc = archBGround;
                } else if (selectedFloor.block === 'UNDERGROUND') {
                  architectureSrc = archBUnderground;
                } else if (selectedFloor.block === 'B') {
                  architectureSrc = architectureB[selectedFloor.floor] || archBGround;
                } else {
                  const floorNum = selectedFloor.floor;
                  architectureSrc = architectureA[floorNum] || archBGround;
                }

                return (
                  <img
                    src={architectureSrc}
                    alt={selectedFloor.block === 'GROUND' ? 'Ground Floor Architecture Plan' : 
                         selectedFloor.block === 'UNDERGROUND' ? 'Underground Floor Architecture Plan' :
                         `Block ${selectedFloor.block} Floor ${selectedFloor.floor} Architecture Plan`}
                    className="w-full h-full object-contain"
                  />
                );
              })()}
              
              {/* Selected Apartment Info - Regular View */}
              {selectedApartment && (
                <div className="absolute bottom-4 left-4 bg-red-500 text-white px-3 py-2 rounded-lg font-medium text-sm animate-pulse">
                  Selected: {selectedApartment}
                </div>
              )}
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
                    src={(() => {
                      if (selectedFloor.block === 'GROUND') return archBGround;
                      if (selectedFloor.block === 'UNDERGROUND') return archBUnderground;
                      if (selectedFloor.block === 'B') return architectureB[selectedFloor.floor] || archBGround;
                      return architectureA[selectedFloor.floor] || archBGround;
                    })()}
                    alt={selectedFloor.block === 'GROUND' ? 'Ground Floor Architecture Plan - Fullscreen' : 
                         selectedFloor.block === 'UNDERGROUND' ? 'Underground Floor Architecture Plan - Fullscreen' :
                         `Block ${selectedFloor.block} Floor ${selectedFloor.floor} Architecture Plan - Fullscreen`}
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
                  fill={hoveredFloorA === floor ? "rgba(0, 255, 0, 0.4)" : "transparent"}
                  stroke={hoveredFloorA === floor ? "rgba(0, 255, 0, 0.8)" : "transparent"}
                  strokeWidth={hoveredFloorA === floor ? "2" : "0"}
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
              onClick={() => handleFloorClick('A', 0)}
            >
              <div className="flex justify-between items-center">
                <span className="text-white font-medium">Приземен етаж</span>
                <span className="text-gray-400 text-sm">52 гаража + 2 склада</span>
              </div>
            </div>
            
            {/* Underground Floor */}
            <div 
              className="bg-gray-800 rounded-lg p-2 hover:bg-gray-700 transition-colors cursor-pointer"
              onMouseEnter={() => handleBlockAFloorHover(-1)}
              onMouseLeave={() => handleBlockAFloorHover(null)}
              onClick={() => handleFloorClick('A', -1)}
            >
              <div className="flex justify-between items-center">
                <span className="text-white font-medium">Подземен етаж</span>
                <span className="text-gray-400 text-sm">61 гаража + 34 склада</span>
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
                  fill={hoveredFloorB === floor ? "rgba(255, 0, 0, 0.4)" : "transparent"}
                  stroke={hoveredFloorB === floor ? "rgba(255, 0, 0, 0.8)" : "transparent"}
                  strokeWidth={hoveredFloorB === floor ? "2" : "0"}
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
              onClick={() => handleFloorClick('B', 0)}
            >
              <div className="flex justify-between items-center">
                <span className="text-white font-medium">Приземен етаж</span>
                <span className="text-gray-400 text-sm">52 гаража + 2 склада</span>
              </div>
            </div>
            
            {/* Underground Floor */}
            <div 
              className="bg-gray-800 rounded-lg p-2 hover:bg-gray-700 transition-colors cursor-pointer"
              onMouseEnter={() => handleBlockBFloorHover(-1)}
              onMouseLeave={() => handleBlockBFloorHover(null)}
              onClick={() => handleFloorClick('B', -1)}
            >
              <div className="flex justify-between items-center">
                <span className="text-white font-medium">Подземен етаж</span>
                <span className="text-gray-400 text-sm">61 гаража + 34 склада</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoldenResidenceFloorMap;