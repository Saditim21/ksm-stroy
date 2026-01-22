import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { buildingImages, getGoldenResidenceImage } from '../constants/buildingImages';

// Gallery Images
import galleryImage1 from '../assets/продажби/project 2/photos/golden-residence-1.png';
import galleryImage2 from '../assets/продажби/project 2/photos/golden-residence-2.png';
import galleryImage4 from '../assets/продажби/project 2/photos/golden-residence-4.png';
import galleryImage6 from '../assets/продажби/project 2/photos/golden-residence-6.png';
import galleryImage7 from '../assets/продажби/project 2/photos/golden-residence-7.png';
import galleryImage8 from '../assets/продажби/project 2/photos/golden-residence-8.png';

// Architecture plans (imported so Vite bundles them correctly for production)
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

const GoldenResidenceSingleBlock = () => {
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
  const [showGallery, setShowGallery] = useState(false);
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0);
  const [currentImage, setCurrentImage] = useState(buildingImages.goldenResidence.main);

  // Gallery images array
  const galleryImages = [
    galleryImage1,
    galleryImage2,
    galleryImage4,
    galleryImage6,
    galleryImage7,
    galleryImage8
  ];

  const isBlockA = block === 'block-a';
  const blockLetter = isBlockA ? 'А' : 'Б';
  const blockTitle = isBlockA ? 'БЛОК А' : 'БЛОК Б';
  
  // Block A apartment data (complete - 12 apartments per floor)
  const blockAFloorData = {
    1: [
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
    ],
    2: [
      { apartment: 'А 201', built: '54.36', ideal: '7.82', вид: '2-стаен', total: '62.18', изложение: 'Юг', status: 'Свободен' },
      { apartment: 'А 202', built: '88.75', ideal: '12.73', вид: '3-стаен', total: '101.48', изложение: 'Юг/Изток', status: 'Свободен' },
      { apartment: 'А 203', built: '93.78', ideal: '13.46', вид: '3-стаен', total: '107.24', изложение: 'Изток', status: 'Свободен' },
      { apartment: 'А 204', built: '59.36', ideal: '8.52', вид: '2-стаен', total: '67.88', изложение: 'Изток', status: 'Свободен' },
      { apartment: 'А 205', built: '59.36', ideal: '8.52', вид: '2-стаен', total: '67.88', изложение: 'Север', status: 'Свободен' },
      { apartment: 'А 206', built: '100.20', ideal: '14.38', вид: '3-стаен', total: '114.58', изложение: 'Север/Запад', status: 'Свободен' },
      { apartment: 'А 207', built: '61.11', ideal: '8.77', вид: '2-стаен', total: '69.88', изложение: 'Запад', status: 'Свободен' },
      { apartment: 'А 208', built: '61.11', ideal: '8.77', вид: '2-стаен', total: '69.88', изложение: 'Запад', status: 'Свободен' },
      { apartment: 'А 209', built: '61.11', ideal: '8.77', вид: '2-стаен', total: '69.88', изложение: 'Запад', status: 'Свободен' },
      { apartment: 'А 210', built: '94.94', ideal: '13.62', вид: '3-стаен', total: '108.56', изложение: 'Запад/Юг', status: 'Свободен' },
      { apartment: 'А 211', built: '55.54', ideal: '7.97', вид: '2-стаен', total: '63.51', изложение: 'Юг', status: 'Свободен' },
      { apartment: 'А 212', built: '38.46', ideal: '5.52', вид: 'Ателие', total: '43.98', изложение: 'Юг', status: 'Свободен' }
    ],
    3: [
      { apartment: 'А 301', built: '54.36', ideal: '7.82', вид: '2-стаен', total: '62.18', изложение: 'Юг', status: 'Свободен' },
      { apartment: 'А 302', built: '88.75', ideal: '12.73', вид: '3-стаен', total: '101.48', изложение: 'Юг/Изток', status: 'Свободен' },
      { apartment: 'А 303', built: '93.78', ideal: '13.46', вид: '3-стаен', total: '107.24', изложение: 'Изток', status: 'Продадени' },
      { apartment: 'А 304', built: '59.36', ideal: '8.52', вид: '2-стаен', total: '67.88', изложение: 'Изток', status: 'Свободен' },
      { apartment: 'А 305', built: '59.36', ideal: '8.52', вид: '2-стаен', total: '67.88', изложение: 'Север', status: 'Свободен' },
      { apartment: 'А 306', built: '100.20', ideal: '14.38', вид: '3-стаен', total: '114.58', изложение: 'Север/Запад', status: 'Свободен' },
      { apartment: 'А 307', built: '61.11', ideal: '8.77', вид: '2-стаен', total: '69.88', изложение: 'Запад', status: 'Свободен' },
      { apartment: 'А 308', built: '61.11', ideal: '8.77', вид: '2-стаен', total: '69.88', изложение: 'Запад', status: 'Свободен' },
      { apartment: 'А 309', built: '61.11', ideal: '8.77', вид: '2-стаен', total: '69.88', изложение: 'Запад', status: 'Продадени' },
      { apartment: 'А 310', built: '94.94', ideal: '13.62', вид: '3-стаен', total: '108.56', изложение: 'Запад/Юг', status: 'Свободен' },
      { apartment: 'А 311', built: '55.54', ideal: '7.97', вид: '2-стаен', total: '63.51', изложение: 'Юг', status: 'Свободен' },
      { apartment: 'А 312', built: '38.46', ideal: '5.52', вид: 'Ателие', total: '43.98', изложение: 'Юг', status: 'Свободен' }
    ],
    4: [
      { apartment: 'А 401', built: '54.38', ideal: '7.80', вид: '2-стаен', total: '62.18', изложение: 'Юг', status: 'Свободен' },
      { apartment: 'А 402', built: '88.75', ideal: '12.73', вид: '3-стаен', total: '101.48', изложение: 'Юг/Изток', status: 'Свободен' },
      { apartment: 'А 403', built: '93.78', ideal: '13.46', вид: '3-стаен', total: '107.24', изложение: 'Изток', status: 'Свободен' },
      { apartment: 'А 404', built: '59.36', ideal: '8.52', вид: '2-стаен', total: '67.88', изложение: 'Изток', status: 'Свободен' },
      { apartment: 'А 405', built: '59.36', ideal: '8.52', вид: '2-стаен', total: '67.88', изложение: 'Север', status: 'Свободен' },
      { apartment: 'А 406', built: '100.20', ideal: '14.38', вид: '3-стаен', total: '114.58', изложение: 'Север/Запад', status: 'Резервиран' },
      { apartment: 'А 407', built: '61.11', ideal: '8.77', вид: '2-стаен', total: '69.88', изложение: 'Запад', status: 'Свободен' },
      { apartment: 'А 408', built: '61.11', ideal: '8.77', вид: '2-стаен', total: '69.88', изложение: 'Запад', status: 'Свободен' },
      { apartment: 'А 409', built: '61.11', ideal: '8.77', вид: '2-стаен', total: '69.88', изложение: 'Запад', status: 'Продадени' },
      { apartment: 'А 410', built: '94.94', ideal: '13.62', вид: '3-стаен', total: '108.56', изложение: 'Запад/Юг', status: 'Свободен' },
      { apartment: 'А 411', built: '55.54', ideal: '7.97', вид: '2-стаен', total: '63.51', изложение: 'Юг', status: 'Свободен' },
      { apartment: 'А 412', built: '38.46', ideal: '5.52', вид: 'Ателие', total: '43.98', изложение: 'Юг', status: 'Свободен' }
    ],
    5: [
      { apartment: 'А 501', built: '54.38', ideal: '7.80', вид: '2-стаен', total: '62.18', изложение: 'Юг', status: 'Свободен' },
      { apartment: 'А 502', built: '88.75', ideal: '12.73', вид: '3-стаен', total: '101.48', изложение: 'Юг/Изток', status: 'Свободен' },
      { apartment: 'А 503', built: '93.78', ideal: '13.46', вид: '3-стаен', total: '107.24', изложение: 'Изток', status: 'Свободен' },
      { apartment: 'А 504', built: '59.36', ideal: '8.52', вид: '2-стаен', total: '67.88', изложение: 'Изток', status: 'Свободен' },
      { apartment: 'А 505', built: '59.36', ideal: '8.52', вид: '2-стаен', total: '67.88', изложение: 'Север', status: 'Свободен' },
      { apartment: 'А 506', built: '100.20', ideal: '14.38', вид: '3-стаен', total: '114.58', изложение: 'Север/Запад', status: 'Резервиран' },
      { apartment: 'А 507', built: '61.11', ideal: '8.77', вид: '2-стаен', total: '69.88', изложение: 'Запад', status: 'Свободен' },
      { apartment: 'А 508', built: '61.11', ideal: '8.77', вид: '2-стаен', total: '69.88', изложение: 'Запад', status: 'Свободен' },
      { apartment: 'А 509', built: '61.11', ideal: '8.77', вид: '2-стаен', total: '69.88', изложение: 'Запад', status: 'Продадени' },
      { apartment: 'А 510', built: '94.94', ideal: '13.62', вид: '3-стаен', total: '108.56', изложение: 'Запад/Юг', status: 'Свободен' },
      { apartment: 'А 511', built: '55.54', ideal: '7.97', вид: '2-стаен', total: '63.51', изложение: 'Юг', status: 'Свободен' },
      { apartment: 'А 512', built: '38.46', ideal: '5.52', вид: 'Ателие', total: '43.98', изложение: 'Юг', status: 'Свободен' }
    ],
    6: [
      { apartment: 'А 601', built: '54.38', ideal: '7.80', вид: '2-стаен', total: '62.18', изложение: 'Юг', status: 'Свободен' },
      { apartment: 'А 602', built: '88.75', ideal: '12.73', вид: '3-стаен', total: '101.48', изложение: 'Юг/Изток', status: 'Свободен' },
      { apartment: 'А 603', built: '93.78', ideal: '13.46', вид: '3-стаен', total: '107.24', изложение: 'Изток', status: 'Свободен' },
      { apartment: 'А 604', built: '59.36', ideal: '8.52', вид: '2-стаен', total: '67.88', изложение: 'Изток', status: 'Свободен' },
      { apartment: 'А 605', built: '59.36', ideal: '8.52', вид: '2-стаен', total: '67.88', изложение: 'Север', status: 'Свободен' },
      { apartment: 'А 606', built: '100.20', ideal: '14.38', вид: '3-стаен', total: '114.58', изложение: 'Север/Запад', status: 'Резервиран' },
      { apartment: 'А 607', built: '61.11', ideal: '8.77', вид: '2-стаен', total: '69.88', изложение: 'Запад', status: 'Резервиран' },
      { apartment: 'А 608', built: '61.11', ideal: '8.77', вид: '2-стаен', total: '69.88', изложение: 'Запад', status: 'Резервиран' },
      { apartment: 'А 609', built: '61.11', ideal: '8.77', вид: '2-стаен', total: '69.88', изложение: 'Запад', status: 'Резервиран' },
      { apartment: 'А 610', built: '94.94', ideal: '13.62', вид: '3-стаен', total: '108.56', изложение: 'Запад/Юг', status: 'Свободен' },
      { apartment: 'А 611', built: '55.54', ideal: '7.97', вид: '2-стаен', total: '63.51', изложение: 'Юг', status: 'Свободен' },
      { apartment: 'А 612', built: '38.46', ideal: '5.52', вид: 'Ателие', total: '43.98', изложение: 'Юг', status: 'Свободен' }
    ],
    7: [
      { apartment: 'А 701', built: '54.38', ideal: '7.80', вид: '2-стаен', total: '62.18', изложение: 'Юг', status: 'Свободен' },
      { apartment: 'А 702', built: '88.75', ideal: '12.73', вид: '3-стаен', total: '101.48', изложение: 'Юг/Изток', status: 'Свободен' },
      { apartment: 'А 703', built: '93.78', ideal: '13.46', вид: '3-стаен', total: '107.24', изложение: 'Изток', status: 'Свободен' },
      { apartment: 'А 704', built: '59.36', ideal: '8.52', вид: '2-стаен', total: '67.88', изложение: 'Изток', status: 'Продадени' },
      { apartment: 'А 705', built: '59.36', ideal: '8.52', вид: '2-стаен', total: '67.88', изложение: 'Север', status: 'Продадени' },
      { apartment: 'А 706', built: '100.20', ideal: '14.38', вид: '3-стаен', total: '114.58', изложение: 'Север/Запад', status: 'Продадени' },
      { apartment: 'А 707', built: '61.11', ideal: '8.77', вид: '2-стаен', total: '69.88', изложение: 'Запад', status: 'Свободен' },
      { apartment: 'А 708', built: '61.11', ideal: '8.77', вид: '2-стаен', total: '69.88', изложение: 'Запад', status: 'Свободен' },
      { apartment: 'А 709', built: '61.11', ideal: '8.77', вид: '2-стаен', total: '69.88', изложение: 'Запад', status: 'Продадени' },
      { apartment: 'А 710', built: '94.94', ideal: '13.62', вид: '3-стаен', total: '108.56', изложение: 'Запад/Юг', status: 'Свободен' },
      { apartment: 'А 711', built: '55.54', ideal: '7.97', вид: '2-стаен', total: '63.51', изложение: 'Юг', status: 'Свободен' },
      { apartment: 'А 712', built: '38.46', ideal: '5.52', вид: 'Ателие', total: '43.98', изложение: 'Юг', status: 'Свободен' }
    ],
    8: [
      { apartment: 'А 801', built: '54.38', ideal: '7.80', вид: '2-стаен', total: '62.18', изложение: 'Юг', status: 'Свободен' },
      { apartment: 'А 802', built: '88.75', ideal: '12.73', вид: '3-стаен', total: '101.48', изложение: 'Юг/Изток', status: 'Свободен' },
      { apartment: 'А 803', built: '93.78', ideal: '13.46', вид: '3-стаен', total: '107.24', изложение: 'Изток', status: 'Свободен' },
      { apartment: 'А 804', built: '59.36', ideal: '8.52', вид: '2-стаен', total: '67.88', изложение: 'Изток', status: 'Свободен' },
      { apartment: 'А 805', built: '59.36', ideal: '8.52', вид: '2-стаен', total: '67.88', изложение: 'Север', status: 'Свободен' },
      { apartment: 'А 806', built: '100.20', ideal: '14.38', вид: '3-стаен', total: '114.58', изложение: 'Север/Запад', status: 'Свободен' },
      { apartment: 'А 807', built: '61.11', ideal: '8.77', вид: '2-стаен', total: '69.88', изложение: 'Запад', status: 'Свободен' },
      { apartment: 'А 808', built: '61.11', ideal: '8.77', вид: '2-стаен', total: '69.88', изложение: 'Запад', status: 'Свободен' },
      { apartment: 'А 809', built: '61.11', ideal: '8.77', вид: '2-стаен', total: '69.88', изложение: 'Запад', status: 'Свободен' },
      { apartment: 'А 810', built: '94.94', ideal: '13.62', вид: '3-стаен', total: '108.56', изложение: 'Запад/Юг', status: 'Свободен' },
      { apartment: 'А 811', built: '55.54', ideal: '7.97', вид: '2-стаен', total: '63.51', изложение: 'Юг', status: 'Свободен' },
      { apartment: 'А 812', built: '38.46', ideal: '5.52', вид: 'Ателие', total: '43.98', изложение: 'Юг', status: 'Свободен' }
    ]
  };

  // Block B apartment data (complete - 12 apartments per floor)
  const blockBFloorData = {
    1: [
      { apartment: 'Б 101', built: '57.46', ideal: '8.22', вид: '2-стаен', total: '65.68', изложение: 'Юг', status: 'Свободен' },
      { apartment: 'Б 102', built: '97.74', ideal: '14.00', вид: '3-стаен', total: '111.74', изложение: 'Юг/Изток', status: 'Свободен' },
      { apartment: 'Б 103', built: '93.78', ideal: '13.46', вид: '3-стаен', total: '107.24', изложение: 'Изток', status: 'Свободен' },
      { apartment: 'Б 104', built: '59.36', ideal: '8.52', вид: '2-стаен', total: '67.88', изложение: 'Изток', status: 'Свободен' },
      { apartment: 'Б 105', built: '59.36', ideal: '8.52', вид: '2-стаен', total: '67.88', изложение: 'Север', status: 'Свободен' },
      { apartment: 'Б 106', built: '100.20', ideal: '14.38', вид: '3-стаен', total: '114.58', изложение: 'Север/Запад', status: 'Свободен' },
      { apartment: 'Б 107', built: '61.11', ideal: '8.77', вид: '2-стаен', total: '69.88', изложение: 'Запад', status: 'Свободен' },
      { apartment: 'Б 108', built: '61.11', ideal: '8.77', вид: '2-стаен', total: '69.88', изложение: 'Запад', status: 'Свободен' },
      { apartment: 'Б 109', built: '61.11', ideal: '8.77', вид: '2-стаен', total: '69.88', изложение: 'Запад', status: 'Свободен' },
      { apartment: 'Б 110', built: '94.94', ideal: '13.62', вид: '3-стаен', total: '108.56', изложение: 'Запад/Юг', status: 'Свободен' },
      { apartment: 'Б 111', built: '51.88', ideal: '7.43', вид: '2-стаен', total: '59.31', изложение: 'Юг', status: 'Свободен' },
      { apartment: 'Б 112', built: '38.46', ideal: '5.52', вид: 'Ателие', total: '43.98', изложение: 'Юг', status: 'Свободен' }
    ],
    2: [
      { apartment: 'Б 201', built: '54.38', ideal: '7.80', вид: '2-стаен', total: '62.18', изложение: 'Юг', status: 'Свободен' },
      { apartment: 'Б 202', built: '88.75', ideal: '12.73', вид: '3-стаен', total: '101.48', изложение: 'Юг/Изток', status: 'Свободен' },
      { apartment: 'Б 203', built: '93.78', ideal: '13.46', вид: '3-стаен', total: '107.24', изложение: 'Изток', status: 'Свободен' },
      { apartment: 'Б 204', built: '59.36', ideal: '8.52', вид: '2-стаен', total: '67.88', изложение: 'Изток', status: 'Продадени' },
      { apartment: 'Б 205', built: '59.36', ideal: '8.52', вид: '2-стаен', total: '67.88', изложение: 'Север', status: 'Свободен' },
      { apartment: 'Б 206', built: '100.20', ideal: '14.38', вид: '3-стаен', total: '114.58', изложение: 'Север/Запад', status: 'Свободен' },
      { apartment: 'Б 207', built: '61.11', ideal: '8.77', вид: '2-стаен', total: '69.88', изложение: 'Запад', status: 'Свободен' },
      { apartment: 'Б 208', built: '61.11', ideal: '8.77', вид: '2-стаен', total: '69.88', изложение: 'Запад', status: 'Свободен' },
      { apartment: 'Б 209', built: '61.11', ideal: '8.77', вид: '2-стаен', total: '69.88', изложение: 'Запад', status: 'Свободен' },
      { apartment: 'Б 210', built: '94.94', ideal: '13.62', вид: '3-стаен', total: '108.56', изложение: 'Запад/Юг', status: 'Свободен' },
      { apartment: 'Б 211', built: '55.54', ideal: '7.97', вид: '2-стаен', total: '63.51', изложение: 'Юг', status: 'Свободен' },
      { apartment: 'Б 212', built: '38.46', ideal: '5.52', вид: 'Ателие', total: '43.98', изложение: 'Юг', status: 'Свободен' }
    ],
    3: [
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
    ],
    4: [
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
    ],
    5: [
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
    ],
    6: [
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
    ],
    7: [
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
    ],
    8: [
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
    ]
  };

  // Ground Floor data - Garages and Storage (shared between blocks)
  const groundFloorData = [
    // Garages Г-001 to Г-017
    { apartment: 'Г-001', built: '21.07', ideal: '12.94', total: '34.01', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-002', built: '21.07', ideal: '12.94', total: '34.01', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-003', built: '21.07', ideal: '12.94', total: '34.01', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-004', built: '21.07', ideal: '12.94', total: '34.01', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-005', built: '21.07', ideal: '12.94', total: '34.01', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-006', built: '21.07', ideal: '12.94', total: '34.01', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-007', built: '21.07', ideal: '12.94', total: '34.01', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-008', built: '21.07', ideal: '12.94', total: '34.01', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-009', built: '21.07', ideal: '12.94', total: '34.01', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-010', built: '21.07', ideal: '12.94', total: '34.01', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-011', built: '21.82', ideal: '13.40', total: '35.22', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-009', built: '21.07', ideal: '12.94', total: '34.01', type: 'ГАРАЖ', status: 'Продадени' },
    { apartment: 'Г-010', built: '21.07', ideal: '12.94', total: '34.01', type: 'ГАРАЖ', status: 'Продадени' },
    { apartment: 'Г-011', built: '21.82', ideal: '13.40', total: '35.22', type: 'ГАРАЖ', status: 'Продадени' },
    { apartment: 'Г-012', built: '26.39', ideal: '16.21', total: '42.60', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-013', built: '22.37', ideal: '13.74', total: '36.11', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-014', built: '28.24', ideal: '17.34', total: '45.58', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-015', built: '28.77', ideal: '17.67', total: '46.44', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-016', built: '33.85', ideal: '20.80', total: '54.65', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-017', built: '33.93', ideal: '20.85', total: '54.78', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-018', built: '24.31', ideal: '14.93', total: '39.24', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-019', built: '23.87', ideal: '14.66', total: '38.53', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-020', built: '23.87', ideal: '14.66', total: '38.53', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-021', built: '24.31', ideal: '14.93', total: '39.24', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-021', built: '24.31', ideal: '14.93', total: '39.24', type: 'ГАРАЖ', status: 'Продадени' },
    { apartment: 'Г-022', built: '33.93', ideal: '20.85', total: '54.78', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-023', built: '33.85', ideal: '20.80', total: '54.65', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-023', built: '33.85', ideal: '20.80', total: '54.65', type: 'ГАРАЖ', status: 'Продадени' },
    { apartment: 'Г-024', built: '28.77', ideal: '17.67', total: '46.44', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-025', built: '28.25', ideal: '17.35', total: '45.60', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-026', built: '22.37', ideal: '13.74', total: '36.11', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-025', built: '28.25', ideal: '17.35', total: '45.60', type: 'ГАРАЖ', status: 'Продадени' },
    { apartment: 'Г-026', built: '22.37', ideal: '13.74', total: '36.11', type: 'ГАРАЖ', status: 'Продадени' },
    { apartment: 'Г-027', built: '26.39', ideal: '16.21', total: '42.60', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-028', built: '21.82', ideal: '13.40', total: '35.22', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-029', built: '21.07', ideal: '12.94', total: '34.01', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-030', built: '21.07', ideal: '12.94', total: '34.01', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-028', built: '21.82', ideal: '13.40', total: '35.22', type: 'ГАРАЖ', status: 'Продадени' },
    { apartment: 'Г-029', built: '21.07', ideal: '12.94', total: '34.01', type: 'ГАРАЖ', status: 'Продадени' },
    { apartment: 'Г-030', built: '21.07', ideal: '12.94', total: '34.01', type: 'ГАРАЖ', status: 'Продадени' },
    { apartment: 'Г-031', built: '21.07', ideal: '12.94', total: '34.01', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-032', built: '21.07', ideal: '12.94', total: '34.01', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-033', built: '21.07', ideal: '12.94', total: '34.01', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-034', built: '21.07', ideal: '12.94', total: '34.01', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-035', built: '21.07', ideal: '14.81', total: '38.92', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-036', built: '27.24', ideal: '11.55', total: '30.35', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-037', built: '24.11', ideal: '12.38', total: '32.53', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-035', built: '21.07', ideal: '14.81', total: '38.92', type: 'ГАРАЖ', status: 'Продадени' },
    { apartment: 'Г-036', built: '27.24', ideal: '11.55', total: '30.35', type: 'ГАРАЖ', status: 'Продадени' },
    { apartment: 'Г-037', built: '24.11', ideal: '12.38', total: '32.53', type: 'ГАРАЖ', status: 'Продадени' },
    { apartment: 'Г-038', built: '18.80', ideal: '12.15', total: '31.94', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-039', built: '20.15', ideal: '19.44', total: '51.08', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-040', built: '19.79', ideal: '19.91', total: '52.32', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-041', built: '31.64', ideal: '19.91', total: '52.32', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-040', built: '19.79', ideal: '19.91', total: '52.32', type: 'ГАРАЖ', status: 'Продадени' },
    { apartment: 'Г-041', built: '31.64', ideal: '19.91', total: '52.32', type: 'ГАРАЖ', status: 'Продадени' },
    { apartment: 'Г-042', built: '32.41', ideal: '19.44', total: '51.08', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-043', built: '32.41', ideal: '12.15', total: '31.94', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-044', built: '31.64', ideal: '12.38', total: '32.53', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-045', built: '19.79', ideal: '11.55', total: '30.35', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-046', built: '20.15', ideal: '14.81', total: '38.92', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-047', built: '18.80', ideal: '16.73', total: '43.97', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-048', built: '24.11', ideal: '12.94', total: '34.01', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-049', built: '27.24', ideal: '12.94', total: '34.01', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-050', built: '21.07', ideal: '12.94', total: '34.01', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-051', built: '21.07', ideal: '16.73', total: '43.97', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-052', built: '21.07', ideal: '12.94', total: '34.01', type: 'ГАРАЖ', status: 'Свободен' },

    // Storage units ПМ-01 to ПМ-34
    { apartment: 'ПМ-01', built: '17.67', ideal: '10.85', total: '28.52', type: 'СКЛАДОВО ПОМЕЩЕНИЕ', status: 'Свободен' },
    { apartment: 'ПМ-02', built: '17.67', ideal: '10.85', total: '28.52', type: 'СКЛАДОВО ПОМЕЩЕНИЕ', status: 'Продадени' },
    { apartment: 'ПМ-03', built: '17.67', ideal: '10.85', total: '28.52', type: 'СКЛАДОВО ПОМЕЩЕНИЕ', status: 'Свободен' },
    { apartment: 'ПМ-04', built: '17.67', ideal: '10.85', total: '28.52', type: 'СКЛАДОВО ПОМЕЩЕНИЕ', status: 'Свободен' },
    { apartment: 'ПМ-05', built: '17.67', ideal: '10.85', total: '28.52', type: 'СКЛАДОВО ПОМЕЩЕНИЕ', status: 'Продадени' },
    { apartment: 'ПМ-06', built: '17.67', ideal: '10.85', total: '28.52', type: 'СКЛАДОВО ПОМЕЩЕНИЕ', status: 'Продадени' },
    { apartment: 'ПМ-07', built: '17.67', ideal: '10.85', total: '28.52', type: 'СКЛАДОВО ПОМЕЩЕНИЕ', status: 'Продадени' },
    { apartment: 'ПМ-08', built: '17.67', ideal: '10.85', total: '28.52', type: 'СКЛАДОВО ПОМЕЩЕНИЕ', status: 'Продадени' },
    { apartment: 'ПМ-09', built: '17.67', ideal: '10.85', total: '28.52', type: 'СКЛАДОВО ПОМЕЩЕНИЕ', status: 'Продадени' },
    { apartment: 'ПМ-10', built: '17.67', ideal: '10.85', total: '28.52', type: 'СКЛАДОВО ПОМЕЩЕНИЕ', status: 'Продадени' },
    { apartment: 'ПМ-11', built: '17.67', ideal: '10.85', total: '28.52', type: 'СКЛАДОВО ПОМЕЩЕНИЕ', status: 'Продадени' },
    { apartment: 'ПМ-12', built: '17.67', ideal: '10.85', total: '28.52', type: 'СКЛАДОВО ПОМЕЩЕНИЕ', status: 'Продадени' },
    { apartment: 'ПМ-13', built: '17.67', ideal: '10.85', total: '28.52', type: 'СКЛАДОВО ПОМЕЩЕНИЕ', status: 'Свободен' },
    { apartment: 'ПМ-14', built: '17.67', ideal: '10.85', total: '28.52', type: 'СКЛАДОВО ПОМЕЩЕНИЕ', status: 'Свободен' },
    { apartment: 'ПМ-15', built: '17.67', ideal: '10.85', total: '28.52', type: 'СКЛАДОВО ПОМЕЩЕНИЕ', status: 'Свободен' },
    { apartment: 'ПМ-16', built: '17.67', ideal: '10.85', total: '28.52', type: 'СКЛАДОВО ПОМЕЩЕНИЕ', status: 'Свободен' },
    { apartment: 'ПМ-17', built: '17.67', ideal: '10.85', total: '28.52', type: 'СКЛАДОВО ПОМЕЩЕНИЕ', status: 'Свободен' },
    { apartment: 'ПМ-18', built: '17.67', ideal: '10.85', total: '28.52', type: 'СКЛАДОВО ПОМЕЩЕНИЕ', status: 'Свободен' },
    { apartment: 'ПМ-19', built: '17.67', ideal: '10.85', total: '28.52', type: 'СКЛАДОВО ПОМЕЩЕНИЕ', status: 'Продадени' },
    { apartment: 'ПМ-20', built: '17.67', ideal: '10.85', total: '28.52', type: 'СКЛАДОВО ПОМЕЩЕНИЕ', status: 'Свободен' },
    { apartment: 'ПМ-21', built: '17.67', ideal: '10.85', total: '28.52', type: 'СКЛАДОВО ПОМЕЩЕНИЕ', status: 'Свободен' },
    { apartment: 'ПМ-22', built: '17.67', ideal: '10.85', total: '28.52', type: 'СКЛАДОВО ПОМЕЩЕНИЕ', status: 'Свободен' },
    { apartment: 'ПМ-23', built: '17.67', ideal: '10.85', total: '28.52', type: 'СКЛАДОВО ПОМЕЩЕНИЕ', status: 'Свободен' },
    { apartment: 'ПМ-24', built: '17.67', ideal: '10.85', total: '28.52', type: 'СКЛАДОВО ПОМЕЩЕНИЕ', status: 'Свободен' },
    { apartment: 'ПМ-25', built: '17.67', ideal: '10.85', total: '28.52', type: 'СКЛАДОВО ПОМЕЩЕНИЕ', status: 'Свободен' },
    { apartment: 'ПМ-26', built: '17.67', ideal: '10.85', total: '28.52', type: 'СКЛАДОВО ПОМЕЩЕНИЕ', status: 'Свободен' },
    { apartment: 'ПМ-27', built: '17.67', ideal: '10.85', total: '28.52', type: 'СКЛАДОВО ПОМЕЩЕНИЕ', status: 'Свободен' },
    { apartment: 'ПМ-28', built: '17.67', ideal: '10.85', total: '28.52', type: 'СКЛАДОВО ПОМЕЩЕНИЕ', status: 'Свободен' },
    { apartment: 'ПМ-29', built: '17.67', ideal: '10.85', total: '28.52', type: 'СКЛАДОВО ПОМЕЩЕНИЕ', status: 'Свободен' },
    { apartment: 'ПМ-30', built: '17.67', ideal: '10.85', total: '28.52', type: 'СКЛАДОВО ПОМЕЩЕНИЕ', status: 'Свободен' },
    { apartment: 'ПМ-31', built: '17.67', ideal: '10.85', total: '28.52', type: 'СКЛАДОВО ПОМЕЩЕНИЕ', status: 'Свободен' },
    { apartment: 'ПМ-32', built: '17.67', ideal: '10.85', total: '28.52', type: 'СКЛАДОВО ПОМЕЩЕНИЕ', status: 'Свободен' },
    { apartment: 'ПМ-33', built: '17.67', ideal: '10.85', total: '28.52', type: 'СКЛАДОВО ПОМЕЩЕНИЕ', status: 'Свободен' },
    { apartment: 'ПМ-34', built: '17.67', ideal: '10.85', total: '28.52', type: 'СКЛАДОВО ПОМЕЩЕНИЕ', status: 'Свободен' },

    // Entrances
    { apartment: 'А 001', built: '41.26', ideal: '5.91', total: '47.17', type: 'ВХОДНО ПОМЕЩЕНИЕ', status: 'Резервиран' },
    { apartment: 'Б 001', built: '41.26', ideal: '5.91', total: '47.17', type: 'ВХОДНО ПОМЕЩЕНИЕ', status: 'Резервиран' }
  ];

  // Underground Floor data - Garages (shared between blocks)
  const undergroundFloorData = [
    { apartment: 'Г-053', built: '27.15', ideal: '16.67', total: '43.82', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-054', built: '18.80', ideal: '11.55', total: '30.35', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-055', built: '20.39', ideal: '12.52', total: '32.91', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-056', built: '20.39', ideal: '12.52', total: '32.91', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-053', built: '27.15', ideal: '16.67', total: '43.82', type: 'ГАРАЖ', status: 'Продадени' },
    { apartment: 'Г-054', built: '18.80', ideal: '11.55', total: '30.35', type: 'ГАРАЖ', status: 'Продадени' },
    { apartment: 'Г-055', built: '20.39', ideal: '12.52', total: '32.91', type: 'ГАРАЖ', status: 'Продадени' },
    { apartment: 'Г-056', built: '20.39', ideal: '12.52', total: '32.91', type: 'ГАРАЖ', status: 'Продадени' },
    { apartment: 'Г-057', built: '20.39', ideal: '12.52', total: '32.91', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-058', built: '20.39', ideal: '12.52', total: '32.91', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-059', built: '20.39', ideal: '12.52', total: '32.91', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-060', built: '24.76', ideal: '15.21', total: '39.97', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-061', built: '21.12', ideal: '12.97', total: '34.09', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-062', built: '20.39', ideal: '12.52', total: '32.91', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-063', built: '20.39', ideal: '12.52', total: '32.91', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-064', built: '20.39', ideal: '12.52', total: '32.91', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-065', built: '21.12', ideal: '12.97', total: '34.09', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-061', built: '21.12', ideal: '12.97', total: '34.09', type: 'ГАРАЖ', status: 'Продадени' },
    { apartment: 'Г-062', built: '20.39', ideal: '12.52', total: '32.91', type: 'ГАРАЖ', status: 'Продадени' },
    { apartment: 'Г-063', built: '20.39', ideal: '12.52', total: '32.91', type: 'ГАРАЖ', status: 'Продадени' },
    { apartment: 'Г-064', built: '20.39', ideal: '12.52', total: '32.91', type: 'ГАРАЖ', status: 'Продадени' },
    { apartment: 'Г-065', built: '21.12', ideal: '12.97', total: '34.09', type: 'ГАРАЖ', status: 'Продадени' },
    { apartment: 'Г-066', built: '21.12', ideal: '12.97', total: '34.09', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-067', built: '20.39', ideal: '12.52', total: '32.91', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-068', built: '20.39', ideal: '12.52', total: '32.91', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-069', built: '20.39', ideal: '12.52', total: '32.91', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-070', built: '20.39', ideal: '12.52', total: '32.91', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-071', built: '20.39', ideal: '12.52', total: '32.91', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-072', built: '20.39', ideal: '12.52', total: '32.91', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-073', built: '21.12', ideal: '12.97', total: '34.09', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-074', built: '21.12', ideal: '12.97', total: '34.09', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-075', built: '20.39', ideal: '12.52', total: '32.91', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-076', built: '20.39', ideal: '12.52', total: '32.91', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-077', built: '20.39', ideal: '12.52', total: '32.91', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-078', built: '21.12', ideal: '12.97', total: '34.09', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-079', built: '24.77', ideal: '15.21', total: '39.98', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-080', built: '20.39', ideal: '12.52', total: '32.91', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-081', built: '20.39', ideal: '12.52', total: '32.91', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-082', built: '20.39', ideal: '12.52', total: '32.91', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-083', built: '20.39', ideal: '12.52', total: '32.91', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-084', built: '20.39', ideal: '12.52', total: '32.91', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-085', built: '18.20', ideal: '11.18', total: '29.38', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-086', built: '22.46', ideal: '13.79', total: '36.25', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-087', built: '25.34', ideal: '15.56', total: '40.90', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-088', built: '20.39', ideal: '12.52', total: '32.91', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-089', built: '20.39', ideal: '12.52', total: '32.91', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-090', built: '20.39', ideal: '12.52', total: '32.91', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-091', built: '25.38', ideal: '15.59', total: '40.97', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-092', built: '25.38', ideal: '15.59', total: '40.97', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-093', built: '34.76', ideal: '21.35', total: '56.11', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-094', built: '34.76', ideal: '21.35', total: '56.11', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-095', built: '33.49', ideal: '20.57', total: '54.06', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-096', built: '33.49', ideal: '20.57', total: '54.06', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-097', built: '34.76', ideal: '21.35', total: '56.11', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-098', built: '34.13', ideal: '20.96', total: '55.09', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-099', built: '34.13', ideal: '20.96', total: '55.09', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-100', built: '34.76', ideal: '21.35', total: '56.11', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-101', built: '33.49', ideal: '20.57', total: '54.06', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-102', built: '33.49', ideal: '20.57', total: '54.06', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-103', built: '34.76', ideal: '21.35', total: '56.11', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-104', built: '34.76', ideal: '21.35', total: '56.11', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-102', built: '33.49', ideal: '20.57', total: '54.06', type: 'ГАРАЖ', status: 'Продадени' },
    { apartment: 'Г-103', built: '34.76', ideal: '21.35', total: '56.11', type: 'ГАРАЖ', status: 'Продадени' },
    { apartment: 'Г-104', built: '34.76', ideal: '21.35', total: '56.11', type: 'ГАРАЖ', status: 'Продадени' },
    { apartment: 'Г-105', built: '25.38', ideal: '15.59', total: '40.97', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-106', built: '25.38', ideal: '15.59', total: '40.97', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-107', built: '20.39', ideal: '12.52', total: '32.91', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-108', built: '20.39', ideal: '12.52', total: '32.91', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-109', built: '20.39', ideal: '12.52', total: '32.91', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-106', built: '25.38', ideal: '15.59', total: '40.97', type: 'ГАРАЖ', status: 'Продадени' },
    { apartment: 'Г-107', built: '20.39', ideal: '12.52', total: '32.91', type: 'ГАРАЖ', status: 'Продадени' },
    { apartment: 'Г-108', built: '20.39', ideal: '12.52', total: '32.91', type: 'ГАРАЖ', status: 'Продадени' },
    { apartment: 'Г-109', built: '20.39', ideal: '12.52', total: '32.91', type: 'ГАРАЖ', status: 'Продадени' },
    { apartment: 'Г-110', built: '26.44', ideal: '16.24', total: '42.68', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-111', built: '27.15', ideal: '16.67', total: '43.82', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-112', built: '18.64', ideal: '11.45', total: '30.09', type: 'ГАРАЖ', status: 'Свободен' },
    { apartment: 'Г-113', built: '26.13', ideal: '16.05', total: '42.18', type: 'ГАРАЖ', status: 'Свободен' },

    // Storage units ПМ-35 to ПМ-68
    { apartment: 'ПМ-35', built: '14.44', ideal: '8.87', total: '23.31', type: 'СКЛАДОВО ПОМЕЩЕНИЕ', status: 'Свободен' },
    { apartment: 'ПМ-36', built: '13.78', ideal: '8.46', total: '22.24', type: 'СКЛАДОВО ПОМЕЩЕНИЕ', status: 'Свободен' },
    { apartment: 'ПМ-37', built: '13.78', ideal: '8.46', total: '22.24', type: 'СКЛАДОВО ПОМЕЩЕНИЕ', status: 'Свободен' },
    { apartment: 'ПМ-38', built: '13.78', ideal: '8.46', total: '22.24', type: 'СКЛАДОВО ПОМЕЩЕНИЕ', status: 'Свободен' },
    { apartment: 'ПМ-39', built: '13.78', ideal: '8.46', total: '22.24', type: 'СКЛАДОВО ПОМЕЩЕНИЕ', status: 'Свободен' },
    { apartment: 'ПМ-35', built: '14.44', ideal: '8.87', total: '23.31', type: 'СКЛАДОВО ПОМЕЩЕНИЕ', status: 'Продадени' },
    { apartment: 'ПМ-36', built: '13.78', ideal: '8.46', total: '22.24', type: 'СКЛАДОВО ПОМЕЩЕНИЕ', status: 'Продадени' },
    { apartment: 'ПМ-37', built: '13.78', ideal: '8.46', total: '22.24', type: 'СКЛАДОВО ПОМЕЩЕНИЕ', status: 'Продадени' },
    { apartment: 'ПМ-38', built: '13.78', ideal: '8.46', total: '22.24', type: 'СКЛАДОВО ПОМЕЩЕНИЕ', status: 'Продадени' },
    { apartment: 'ПМ-39', built: '13.78', ideal: '8.46', total: '22.24', type: 'СКЛАДОВО ПОМЕЩЕНИЕ', status: 'Продадени' },
    { apartment: 'ПМ-40', built: '13.78', ideal: '8.46', total: '22.24', type: 'СКЛАДОВО ПОМЕЩЕНИЕ', status: 'Свободен' },
    { apartment: 'ПМ-41', built: '13.78', ideal: '8.46', total: '22.24', type: 'СКЛАДОВО ПОМЕЩЕНИЕ', status: 'Свободен' },
    { apartment: 'ПМ-42', built: '14.44', ideal: '8.87', total: '23.31', type: 'СКЛАДОВО ПОМЕЩЕНИЕ', status: 'Свободен' },
    { apartment: 'ПМ-43', built: '14.44', ideal: '8.87', total: '23.31', type: 'СКЛАДОВО ПОМЕЩЕНИЕ', status: 'Свободен' },
    { apartment: 'ПМ-44', built: '13.78', ideal: '8.46', total: '22.24', type: 'СКЛАДОВО ПОМЕЩЕНИЕ', status: 'Свободен' },
    { apartment: 'ПМ-45', built: '13.78', ideal: '8.46', total: '22.24', type: 'СКЛАДОВО ПОМЕЩЕНИЕ', status: 'Свободен' },
    { apartment: 'ПМ-46', built: '13.78', ideal: '8.46', total: '22.24', type: 'СКЛАДОВО ПОМЕЩЕНИЕ', status: 'Свободен' },
    { apartment: 'ПМ-47', built: '13.78', ideal: '8.46', total: '22.24', type: 'СКЛАДОВО ПОМЕЩЕНИЕ', status: 'Свободен' },
    { apartment: 'ПМ-48', built: '13.78', ideal: '8.46', total: '22.24', type: 'СКЛАДОВО ПОМЕЩЕНИЕ', status: 'Свободен' },
    { apartment: 'ПМ-49', built: '14.44', ideal: '8.87', total: '23.31', type: 'СКЛАДОВО ПОМЕЩЕНИЕ', status: 'Свободен' },
    { apartment: 'ПМ-50', built: '14.96', ideal: '9.19', total: '24.15', type: 'СКЛАДОВО ПОМЕЩЕНИЕ', status: 'Свободен' },
    { apartment: 'ПМ-51', built: '14.96', ideal: '9.19', total: '24.15', type: 'СКЛАДОВО ПОМЕЩЕНИЕ', status: 'Свободен' },
    { apartment: 'ПМ-52', built: '14.96', ideal: '9.19', total: '24.15', type: 'СКЛАДОВО ПОМЕЩЕНИЕ', status: 'Свободен' },
    { apartment: 'ПМ-53', built: '14.96', ideal: '9.19', total: '24.15', type: 'СКЛАДОВО ПОМЕЩЕНИЕ', status: 'Свободен' },
    { apartment: 'ПМ-54', built: '14.96', ideal: '9.19', total: '24.15', type: 'СКЛАДОВО ПОМЕЩЕНИЕ', status: 'Свободен' },
    { apartment: 'ПМ-55', built: '14.96', ideal: '9.19', total: '24.15', type: 'СКЛАДОВО ПОМЕЩЕНИЕ', status: 'Свободен' },
    { apartment: 'ПМ-56', built: '14.96', ideal: '9.19', total: '24.15', type: 'СКЛАДОВО ПОМЕЩЕНИЕ', status: 'Свободен' },
    { apartment: 'ПМ-57', built: '14.96', ideal: '9.19', total: '24.15', type: 'СКЛАДОВО ПОМЕЩЕНИЕ', status: 'Свободен' },
    { apartment: 'ПМ-58', built: '14.96', ideal: '9.19', total: '24.15', type: 'СКЛАДОВО ПОМЕЩЕНИЕ', status: 'Свободен' },
    { apartment: 'ПМ-59', built: '14.96', ideal: '9.19', total: '24.15', type: 'СКЛАДОВО ПОМЕЩЕНИЕ', status: 'Свободен' },
    { apartment: 'ПМ-60', built: '14.96', ideal: '9.19', total: '24.15', type: 'СКЛАДОВО ПОМЕЩЕНИЕ', status: 'Свободен' },
    { apartment: 'ПМ-61', built: '14.96', ideal: '9.19', total: '24.15', type: 'СКЛАДОВО ПОМЕЩЕНИЕ', status: 'Свободен' },
    { apartment: 'ПМ-62', built: '14.96', ideal: '9.19', total: '24.15', type: 'СКЛАДОВО ПОМЕЩЕНИЕ', status: 'Свободен' },
    { apartment: 'ПМ-63', built: '14.96', ideal: '9.19', total: '24.15', type: 'СКЛАДОВО ПОМЕЩЕНИЕ', status: 'Свободен' },
    { apartment: 'ПМ-64', built: '14.96', ideal: '9.19', total: '24.15', type: 'СКЛАДОВО ПОМЕЩЕНИЕ', status: 'Свободен' },
    { apartment: 'ПМ-65', built: '14.96', ideal: '9.19', total: '24.15', type: 'СКЛАДОВО ПОМЕЩЕНИЕ', status: 'Свободен' },
    { apartment: 'ПМ-66', built: '24.23', ideal: '14.88', total: '39.11', type: 'СКЛАДОВО ПОМЕЩЕНИЕ', status: 'Свободен' },
    { apartment: 'ПМ-63', built: '14.96', ideal: '9.19', total: '24.15', type: 'СКЛАДОВО ПОМЕЩЕНИЕ', status: 'Продадени' },
    { apartment: 'ПМ-64', built: '14.96', ideal: '9.19', total: '24.15', type: 'СКЛАДОВО ПОМЕЩЕНИЕ', status: 'Продадени' },
    { apartment: 'ПМ-65', built: '14.96', ideal: '9.19', total: '24.15', type: 'СКЛАДОВО ПОМЕЩЕНИЕ', status: 'Продадени' },
    { apartment: 'ПМ-66', built: '24.23', ideal: '14.88', total: '39.11', type: 'СКЛАДОВО ПОМЕЩЕНИЕ', status: 'Продадени' },
    { apartment: 'ПМ-67', built: '18.53', ideal: '11.38', total: '29.91', type: 'СКЛАДОВО ПОМЕЩЕНИЕ', status: 'Свободен' },
    { apartment: 'ПМ-68', built: '18.53', ideal: '11.38', total: '29.91', type: 'СКЛАДОВО ПОМЕЩЕНИЕ', status: 'Свободен' }
  ];

  // Function to get floor data based on floor selection
  const getFloorData = (floor) => {
    if (floor === 'ground') return groundFloorData;
    if (floor === 'underground') return undergroundFloorData;
    return (isBlockA ? blockAFloorData : blockBFloorData)[floor];
  };

  const currentFloorData = isBlockA ? blockAFloorData : blockBFloorData;

  const handleFloorHover = (floor) => {
    if (floor && floor !== 'ground' && floor !== 'underground') {
      const blockLetter = isBlockA ? 'А' : 'Б';
      const floorImage = getGoldenResidenceImage(blockLetter, floor);
      setCurrentImage(floorImage);
    } else if (!floor) {
      setCurrentImage(buildingImages.goldenResidence.main);
    }
    // For garage floors (ground/underground), keep current image (don't change it)
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
      case 'Продадени': return 'text-red-500';
      case 'Резервиран': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusDot = (status) => {
    switch (status) {
      case 'Свободен': return 'bg-green-500';
      case 'Продадени': return 'bg-red-500';
      case 'Резервиран': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  // Get apartment position on floor plan (you'll need to adjust these coordinates based on your actual floor plans)
  const getApartmentPosition = (apartmentNumber) => {
    // Extract apartment number (e.g., "А 101" -> "101", "Б 205" -> "205")
    const aptNum = apartmentNumber.split(' ')[1];
    const lastDigit = parseInt(aptNum.charAt(2)); // Last digit (1-12)
    
    // Basic layout approximation - you'll need to adjust these based on your actual floor plans
    const positions = {
      1: { top: '20%', left: '15%' },   // А/Б X01
      2: { top: '30%', left: '25%' },   // А/Б X02  
      3: { top: '25%', left: '45%' },   // А/Б X03
      4: { top: '35%', left: '60%' },   // А/Б X04
      5: { top: '45%', left: '70%' },   // А/Б X05
      6: { top: '60%', left: '75%' },   // А/Б X06
      7: { top: '70%', left: '65%' },   // А/Б X07
      8: { top: '75%', left: '50%' },   // А/Б X08
      9: { top: '80%', left: '35%' },   // А/Б X09
      10: { top: '65%', left: '25%' },  // А/Б X10
      11: { top: '50%', left: '15%' },  // А/Б X11
      12: { top: '40%', left: '10%' }   // А/Б X12
    };
    
    return positions[lastDigit] || { top: '50%', left: '50%' };
  };

  // Architecture mappings for production-safe imports
  const architectureA = {
    2: archA2,
    3: archA3,
    4: archA4,
    5: archA5,
    6: archA6,
    7: archA7,
    8: archA8,
  };

  const architectureB = {
    1: archB1,
    2: archB2,
    3: archB3,
    4: archB4,
    5: archB5,
    6: archB6,
    7: archB7,
    8: archB8,
  };

  // Handle ESC key for fullscreen modal
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Escape' && isArchitecturePlanFullscreen) {
        setIsArchitecturePlanFullscreen(false);
        setFullscreenZoom(1);
        setFullscreenPan({ x: 0, y: 0 });
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isArchitecturePlanFullscreen]);

  // Gallery keyboard navigation
  useEffect(() => {
    const handleGalleryKeys = (e) => {
      if (!showGallery) return;

      if (e.key === 'Escape') {
        setShowGallery(false);
      } else if (e.key === 'ArrowLeft') {
        setCurrentGalleryIndex((prev) =>
          prev > 0 ? prev - 1 : galleryImages.length - 1
        );
      } else if (e.key === 'ArrowRight') {
        setCurrentGalleryIndex((prev) =>
          prev < galleryImages.length - 1 ? prev + 1 : 0
        );
      }
    };

    document.addEventListener('keydown', handleGalleryKeys);
    return () => document.removeEventListener('keydown', handleGalleryKeys);
  }, [showGallery, galleryImages.length]);

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
              onClick={() => navigate('/projects/golden-residence')}
              className="text-gray-800 hover:text-gray-600 active:text-gray-900 transition-all duration-300 touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-gray-200/50 sm:justify-start sm:min-w-auto sm:px-2"
            >
              <span className="text-2xl sm:text-xl font-bold">←</span>
              <span className="hidden sm:inline sm:ml-2 sm:mr-1 text-base font-medium">Назад към избор на блок</span>
            </button>
            
            <h1 className="text-2xl sm:text-4xl font-bold text-center flex-1 mx-4 sm:absolute sm:left-1/2 sm:transform sm:-translate-x-1/2">
              <span className="text-gold-600">Golden Residence</span> - <span className="text-gold-600">{blockTitle}</span>
            </h1>
            
            {/* Empty space for layout balance */}
            <div className="w-[44px] sm:w-auto"></div>
          </div>
          <p className="text-base sm:text-lg text-gray-600 text-center">
            {isBlockA ? '96 апартамента • 8 етажа' : '96 апартамента • 8 етажа'}
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
                {/* Floor hover areas - simple x, y, width, height format */}
                {[
                  { floor: 8, x: 20, y: 28, width: 100, height: 5 },
                  { floor: 7, x: 20, y: 31, width: 100, height: 5 },
                  { floor: 6, x: 20, y: 38, width: 100, height: 5 },
                  { floor: 5, x: 20, y: 44, width: 100, height: 5 },
                  { floor: 4, x: 20, y: 50, width: 100, height: 5 },
                  { floor: 3, x: 20, y: 59, width: 100, height: 5 },
                  { floor: 2, x: 20, y: 64, width: 100, height: 5 },
                  { floor: 1, x: 20, y: 68, width: 100, height: 5 },
                ].map((area) => (
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
                    onClick={() => handleFloorClick(area.floor)}
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
                {[8, 7, 6, 5, 4, 3, 2, 1, 'ground', 'underground'].map((floor) => (
                  <div key={floor}>
                    <div
                      className="bg-gray-800 rounded-lg p-3 hover:bg-gray-700 transition-colors cursor-pointer"
                      onMouseEnter={() => handleFloorHover(floor)}
                      onMouseLeave={() => handleFloorHover(null)}
                      onClick={() => handleFloorClick(floor)}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-white font-medium">
                          {floor === 'ground' ? 'Приземен етаж' : floor === 'underground' ? 'Подземен етаж' : `${floor} етаж`}
                        </span>
                        <span className="text-gray-400 text-sm">
                          {floor === 'ground' ? '52 гаража' : floor === 'underground' ? '61 гаража' : '12 апартамента'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
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
        {showFloorPlan && selectedFloor && getFloorData(selectedFloor) && (
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
                      <span className="text-gold-600">{blockTitle}</span> - <span className="text-gold-600">{selectedFloor === 'ground' ? 'Приземен етаж' : selectedFloor === 'underground' ? 'Подземен етаж' : `${selectedFloor} етаж`}</span>
                    </h1>
                    
                    {/* Empty space for layout balance */}
                    <div className="w-[44px] sm:w-auto"></div>
                  </div>
                  <p className="text-lg text-gray-600 text-center">
                    Архитектурен план и списък на апартаментите
                  </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Left Side - Apartments/Garages List (50%) */}
                  <div className="lg:w-1/2 flex flex-col">
                    {(() => {
                      const floorData = getFloorData(selectedFloor);
                      const isGarageFloor = selectedFloor === 'ground' || selectedFloor === 'underground';

                      if (isGarageFloor) {
                        // GARAGE GRID LAYOUT - Compact & Creative
                        const available = floorData.filter(a => a.status === 'Свободен').length;
                        const sold = floorData.filter(a => a.status === 'Продадени').length;
                        const reserved = floorData.filter(a => a.status === 'Резервиран').length;

                        return (
                          <>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                              <div>
                                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">Списък на гаражите</h3>
                                <p className="text-xs text-gray-600">{floorData.length} места • {sold} продадени</p>
                              </div>
                              <div className="flex gap-2 mt-2 sm:mt-0">
                                <div className="flex items-center gap-1">
                                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                  <span className="text-xs text-gray-600">{available}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                  <span className="text-xs text-gray-600">{sold}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                  <span className="text-xs text-gray-600">{reserved}</span>
                                </div>
                              </div>
                            </div>

                            {/* Compact Garage Grid with Fixed Height */}
                            <div className="bg-white rounded-lg shadow-lg relative" style={{ maxHeight: '65vh' }}>
                              {/* Scroll indicator */}
                              <div className="absolute top-3 right-3 z-10 bg-gray-900/70 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                                ↕ {floorData.length} места
                              </div>

                              <div
                                className="overflow-y-auto p-3 sm:p-4"
                                style={{
                                  maxHeight: '65vh',
                                  scrollbarWidth: 'thin',
                                  scrollbarColor: '#D4AF37 #F7FAFC',
                                  WebkitOverflowScrolling: 'touch'
                                }}
                              >
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                  {floorData.map((garage, idx) => {
                                    const garageNumber = garage.apartment;
                                    const statusColor =
                                      garage.status === 'Свободен' ? 'bg-green-50 border-green-300 hover:border-green-500' :
                                      garage.status === 'Продадени' ? 'bg-red-50 border-red-300 opacity-75' :
                                      'bg-yellow-50 border-yellow-300 hover:border-yellow-500';
                                    const statusDot =
                                      garage.status === 'Свободен' ? 'bg-green-500' :
                                      garage.status === 'Продадени' ? 'bg-red-500' :
                                      'bg-yellow-500';

                                    return (
                                      <div
                                        key={idx}
                                        className={`relative border-2 rounded-lg p-2.5 transition-all duration-200 ${statusColor} ${
                                          garage.status === 'Свободен' ? 'cursor-pointer hover:shadow-md' : 'cursor-not-allowed'
                                        }`}
                                        onClick={garage.status === 'Свободен' ? () => {
                                          setSelectedApartment(garage);
                                          setIsArchitecturePlanFullscreen(true);
                                        } : undefined}
                                      >
                                        {/* Status dot */}
                                        <div className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full ${statusDot} ${
                                          garage.status === 'Свободен' ? 'animate-pulse' : ''
                                        }`}></div>

                                        {/* Garage icon & number */}
                                        <div className="flex flex-col items-center text-center">
                                          <svg className="w-6 h-6 mb-1 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                                          </svg>
                                          <div className="font-bold text-sm text-gray-900">{garageNumber}</div>
                                          <div className="text-xs text-gray-600 mt-0.5">{garage.total} м²</div>
                                          {garage.status === 'Свободен' && (
                                            <div className="text-xs text-green-600 font-semibold mt-1">Свободен</div>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>

                            {/* Summary Stats */}
                            <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
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
                            </div>
                          </>
                        );
                      } else {
                        // REGULAR APARTMENT TABLE LAYOUT
                        const available = floorData.filter(a => a.status === 'Свободен').length;
                        const sold = floorData.filter(a => a.status === 'Продадени').length;
                        const reserved = floorData.filter(a => a.status === 'Резервиран').length;

                        return (
                          <>
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
                                      <th className="px-2 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300 whitespace-nowrap">Застроена площ</th>
                                      <th className="px-2 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300 whitespace-nowrap">Идеални части</th>
                                      <th className="px-2 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300 whitespace-nowrap">Общо</th>
                                      <th className="px-2 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">Статус</th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-gray-200">
                                    {floorData.map((apt, idx) => (
                                      <tr
                                        key={idx}
                                        className={`transition-colors ${
                                          selectedApartment && selectedApartment.apartment === apt.apartment
                                            ? 'bg-gold-100 border-l-4 border-gold-500'
                                            : (apt.status === 'Свободен' || apt.status === 'Скоро')
                                              ? 'hover:bg-gray-50 cursor-pointer group active:bg-gray-100'
                                              : 'cursor-not-allowed opacity-75'
                                        }`}
                                        style={{ minHeight: '48px' }}
                                        onClick={(apt.status === 'Свободен' || apt.status === 'Скоро') ? () => {
                                          setSelectedApartment(apt);
                                          setIsArchitecturePlanFullscreen(true);
                                        } : undefined}
                                      >
                                        <td className="px-2 py-2 whitespace-nowrap font-medium text-gray-900 border-r border-gray-200 relative">
                                          <div className="flex items-center">
                                            {apt.apartment}
                                            {(apt.status === 'Свободен' || apt.status === 'Скоро') && (
                                              <svg className="w-4 h-4 ml-2 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                              </svg>
                                            )}
                                          </div>
                                        </td>
                                        <td className="px-2 py-2 whitespace-nowrap text-gray-700 border-r border-gray-200">
                                          {apt.built || '57.46'} кв.м
                                        </td>
                                        <td className="px-2 py-2 whitespace-nowrap text-gray-700 border-r border-gray-200">
                                          {apt.ideal || '8.22'} кв.м
                                        </td>
                                        <td className="px-2 py-2 whitespace-nowrap text-gray-700 border-r border-gray-200">
                                          {apt.total} кв.м
                                        </td>
                                        <td className="px-2 py-2 whitespace-nowrap">
                                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${
                                            apt.status === 'Свободен' ? 'bg-green-100 text-green-700' :
                                            apt.status === 'Продадени' ? 'bg-red-100 text-red-700' :
                                            apt.status === 'Скоро' ? 'bg-gold-100 text-gold-700' :
                                            'bg-yellow-100 text-yellow-700'
                                          }`}>
                                            {apt.status}
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
                            </div>
                          </>
                        );
                      }
                    })()}
                  </div>

                  {/* Right Side - Architecture Plan (50%) */}
                  <div className="lg:w-1/2">
                    <div className="bg-white rounded-lg shadow-lg p-6 h-full flex flex-col">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-gray-800">
                          Архитектурен план - {selectedFloor === 'ground' ? 'Приземен етаж' : selectedFloor === 'underground' ? 'Подземен етаж' : `${selectedFloor} етаж`}
                        </h3>
                        {selectedApartment && (
                          <div className="text-sm bg-gold-100 text-gold-800 px-3 py-1 rounded-full">
                            Избран: {selectedApartment.apartment}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 bg-gray-100 rounded-lg overflow-hidden relative">
                        {
                          // Determine architecture image source in a production-safe way
                        }
                        {(() => {
                          let architectureSrc = buildingImages.goldenResidence.main;

                          if (selectedFloor === 'ground') {
                            architectureSrc = archBGround;
                          } else if (selectedFloor === 'underground') {
                            architectureSrc = archBUnderground;
                          } else {
                            const numericFloor = typeof selectedFloor === 'string' ? parseInt(selectedFloor, 10) : selectedFloor;
                            if (isBlockA) {
                              architectureSrc = architectureA[numericFloor] || (buildingImages.goldenResidence.blockA && buildingImages.goldenResidence.blockA[`floor${numericFloor}`]) || buildingImages.goldenResidence.main;
                            } else {
                              architectureSrc = architectureB[numericFloor] || (buildingImages.goldenResidence.blockB && buildingImages.goldenResidence.blockB[`floor${numericFloor}`]) || buildingImages.goldenResidence.main;
                            }
                          }

                          return (
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
                                    src={architectureSrc}
                                    alt={selectedFloor === 'ground' ? 'Приземен етаж план' : selectedFloor === 'underground' ? 'Подземен етаж план' : `${blockTitle} - ${selectedFloor} етаж план`}
                                    className="max-w-full max-h-full object-contain cursor-pointer rounded-lg shadow-xl hover:shadow-2xl transition-shadow duration-300"
                                    onClick={() => setIsArchitecturePlanFullscreen(true)}
                                    draggable={false}
                                  />
                                </div>
                              </div>
                          );
                        })()}

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
                    {selectedFloor === 'ground' || selectedFloor === 'underground'
                      ? `${selectedFloor === 'ground' ? 'Приземен етаж' : 'Подземен етаж'} - Архитектурен план`
                      : `${blockTitle} - ${selectedFloor} етаж - Архитектурен план`
                    }
                  </h3>
                  {selectedApartment && (
                    <div className="text-sm bg-gold-600 text-primary-900 px-3 py-1 rounded-full font-semibold">
                      Избран: {selectedApartment.apartment}
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => {
                    setIsArchitecturePlanFullscreen(false);
                    setFullscreenZoom(1);
                    setFullscreenPan({ x: 0, y: 0 });
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
                {
                  (() => {
                    let architectureSrc = buildingImages.goldenResidence.main;
                    if (selectedFloor === 'ground') {
                      architectureSrc = archBGround;
                    } else if (selectedFloor === 'underground') {
                      architectureSrc = archBUnderground;
                    } else {
                      const numericFloor = typeof selectedFloor === 'string' ? parseInt(selectedFloor, 10) : selectedFloor;
                      architectureSrc = isBlockA ? (architectureA[numericFloor] || (buildingImages.goldenResidence.blockA && buildingImages.goldenResidence.blockA[`floor${numericFloor}`])) : (architectureB[numericFloor] || (buildingImages.goldenResidence.blockB && buildingImages.goldenResidence.blockB[`floor${numericFloor}`]));
                      architectureSrc = architectureSrc || buildingImages.goldenResidence.main;
                    }

                    return (
                      <div className="w-full h-full flex items-center justify-center">
                        <img
                          src={architectureSrc}
                          alt={selectedFloor === 'ground' ? 'Приземен етаж план' : selectedFloor === 'underground' ? 'Подземен етаж план' : `${blockTitle} - ${selectedFloor} етаж план`}
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                    );
                  })()
                }
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
                    <div className="text-lg font-semibold">{selectedApartment.apartment}</div>
                    <div className="text-sm opacity-90">{selectedApartment.total} кв.м • {selectedApartment.status}</div>
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
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-gold-500 to-gold-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-900 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-gold-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-primary-900">Контакт за информация</h3>
                      <p className="text-sm text-primary-800 opacity-90">За апартамент {selectedApartment?.apartment}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowContactModal(false)}
                    className="text-primary-900 hover:text-primary-700 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="space-y-4">
                  {/* Apartment Details */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Детайли за апартамента:</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Апартамент:</span>
                        <span className="font-medium text-gray-800">{selectedApartment?.apartment}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Площ:</span>
                        <span className="font-medium text-gray-800">{selectedApartment?.total} кв.м</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Статус:</span>
                        <span className={`font-medium ${
                          selectedApartment?.status === 'Свободен' ? 'text-green-600' :
                          selectedApartment?.status === 'Продадени' ? 'text-red-600' :
                          'text-yellow-600'
                        }`}>
                          {selectedApartment?.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="text-center">
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Свържете се с нас:</h4>
                      <div className="flex items-center justify-center gap-2 text-lg font-bold text-primary-900">
                        <svg className="w-5 h-5 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        +359887886166
                      </div>
                      <p className="text-sm text-gray-500 mt-1">Работно време: 9:00 - 18:00</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <a 
                        href="tel:+359887886166"
                        className="flex-1 bg-gradient-to-r from-gold-500 to-gold-600 text-primary-900 py-3 px-4 rounded-lg font-semibold hover:from-gold-600 hover:to-gold-700 transition-all duration-200 flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        Обади се
                      </a>
                      <button 
                        onClick={() => setShowContactModal(false)}
                        className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                      >
                        Затвори
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Gallery Modal */}
        {showGallery && (
          <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center">
            {/* Close button */}
            <button
              onClick={() => setShowGallery(false)}
              className="absolute top-4 right-4 z-50 text-white hover:text-gold-400 transition-colors p-2 rounded-full hover:bg-white/10"
              aria-label="Close gallery"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Image counter */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full backdrop-blur-sm">
              <span className="font-semibold">{currentGalleryIndex + 1} / {galleryImages.length}</span>
            </div>

            {/* Previous button */}
            <button
              onClick={() => setCurrentGalleryIndex((prev) =>
                prev > 0 ? prev - 1 : galleryImages.length - 1
              )}
              className="absolute left-4 text-white hover:text-gold-400 transition-all p-3 rounded-full hover:bg-white/10 hover:scale-110"
              aria-label="Previous image"
            >
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Main image */}
            <div className="max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center p-4">
              <img
                src={galleryImages[currentGalleryIndex]}
                alt={`Golden Residence - Снимка ${currentGalleryIndex + 1}`}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              />
            </div>

            {/* Next button */}
            <button
              onClick={() => setCurrentGalleryIndex((prev) =>
                prev < galleryImages.length - 1 ? prev + 1 : 0
              )}
              className="absolute right-4 text-white hover:text-gold-400 transition-all p-3 rounded-full hover:bg-white/10 hover:scale-110"
              aria-label="Next image"
            >
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Thumbnails */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 bg-black/50 p-3 rounded-full backdrop-blur-sm">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentGalleryIndex(idx)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    idx === currentGalleryIndex
                      ? 'bg-gold-500 w-8'
                      : 'bg-white/50 hover:bg-white/70'
                  }`}
                  aria-label={`Go to image ${idx + 1}`}
                />
              ))}
            </div>

            {/* Keyboard hints */}
            <div className="absolute bottom-20 left-4 text-white/60 text-sm">
              <p>← → Навигация • ESC Затвори</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default GoldenResidenceSingleBlock;