import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

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
  const [currentImage, setCurrentImage] = useState(
    block === 'block-a' 
      ? '/src/assets/продажби/project 2/golden-residence.jpg'
      : '/src/assets/продажби/project 2/golden-residence.jpg'
  );

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
      { apartment: 'А 201', вид: '2-стаен', total: '62.18', изложение: 'Юг', status: 'Свободен' },
      { apartment: 'А 202', вид: '3-стаен', total: '101.48', изложение: 'Юг/Изток', status: 'Свободен' },
      { apartment: 'А 203', вид: '3-стаен', total: '107.24', изложение: 'Изток', status: 'Свободен' },
      { apartment: 'А 204', вид: '2-стаен', total: '67.88', изложение: 'Изток', status: 'Свободен' },
      { apartment: 'А 205', вид: '2-стаен', total: '67.88', изложение: 'Север', status: 'Свободен' },
      { apartment: 'А 206', вид: '3-стаен', total: '114.58', изложение: 'Север/Запад', status: 'Свободен' },
      { apartment: 'А 207', вид: '2-стаен', total: '69.88', изложение: 'Запад', status: 'Свободен' },
      { apartment: 'А 208', вид: '2-стаен', total: '69.88', изложение: 'Запад', status: 'Свободен' },
      { apartment: 'А 209', вид: '2-стаен', total: '69.88', изложение: 'Запад', status: 'Свободен' },
      { apartment: 'А 210', вид: '3-стаен', total: '108.56', изложение: 'Запад/Юг', status: 'Свободен' },
      { apartment: 'А 211', вид: '2-стаен', total: '63.51', изложение: 'Юг', status: 'Свободен' },
      { apartment: 'А 212', вид: 'Ателие', total: '43.98', изложение: 'Юг', status: 'Свободен' }
    ],
    3: [
      { apartment: 'А 301', вид: '2-стаен', total: '62.18', изложение: 'Юг', status: 'Свободен' },
      { apartment: 'А 302', вид: '3-стаен', total: '101.48', изложение: 'Юг/Изток', status: 'Свободен' },
      { apartment: 'А 303', вид: '3-стаен', total: '107.24', изложение: 'Изток', status: 'Продадени' },
      { apartment: 'А 304', вид: '2-стаен', total: '67.88', изложение: 'Изток', status: 'Свободен' },
      { apartment: 'А 305', вид: '2-стаен', total: '67.88', изложение: 'Север', status: 'Свободен' },
      { apartment: 'А 306', вид: '3-стаен', total: '114.58', изложение: 'Север/Запад', status: 'Свободен' },
      { apartment: 'А 307', вид: '2-стаен', total: '69.88', изложение: 'Запад', status: 'Свободен' },
      { apartment: 'А 308', вид: '2-стаен', total: '69.88', изложение: 'Запад', status: 'Свободен' },
      { apartment: 'А 309', вид: '2-стаен', total: '69.88', изложение: 'Запад', status: 'Продадени' },
      { apartment: 'А 310', вид: '3-стаен', total: '108.56', изложение: 'Запад/Юг', status: 'Свободен' },
      { apartment: 'А 311', вид: '2-стаен', total: '63.51', изложение: 'Юг', status: 'Свободен' },
      { apartment: 'А 312', вид: 'Ателие', total: '43.98', изложение: 'Юг', status: 'Свободен' }
    ],
    4: [
      { apartment: 'А 401', вид: '2-стаен', total: '62.18', изложение: 'Юг', status: 'Свободен' },
      { apartment: 'А 402', вид: '3-стаен', total: '101.48', изложение: 'Юг/Изток', status: 'Свободен' },
      { apartment: 'А 403', вид: '3-стаен', total: '107.24', изложение: 'Изток', status: 'Свободен' },
      { apartment: 'А 404', вид: '2-стаен', total: '67.88', изложение: 'Изток', status: 'Свободен' },
      { apartment: 'А 405', вид: '2-стаен', total: '67.88', изложение: 'Север', status: 'Свободен' },
      { apartment: 'А 406', вид: '3-стаен', total: '114.58', изложение: 'Север/Запад', status: 'Резервиран' },
      { apartment: 'А 407', вид: '2-стаен', total: '69.88', изложение: 'Запад', status: 'Свободен' },
      { apartment: 'А 408', вид: '2-стаен', total: '69.88', изложение: 'Запад', status: 'Свободен' },
      { apartment: 'А 409', вид: '2-стаен', total: '69.88', изложение: 'Запад', status: 'Продадени' },
      { apartment: 'А 410', вид: '3-стаен', total: '108.56', изложение: 'Запад/Юг', status: 'Свободен' },
      { apartment: 'А 411', вид: '2-стаен', total: '63.51', изложение: 'Юг', status: 'Свободен' },
      { apartment: 'А 412', вид: 'Ателие', total: '43.98', изложение: 'Юг', status: 'Свободен' }
    ],
    5: [
      { apartment: 'А 501', вид: '2-стаен', total: '62.18', изложение: 'Юг', status: 'Свободен' },
      { apartment: 'А 502', вид: '3-стаен', total: '101.48', изложение: 'Юг/Изток', status: 'Свободен' },
      { apartment: 'А 503', вид: '3-стаен', total: '107.24', изложение: 'Изток', status: 'Свободен' },
      { apartment: 'А 504', вид: '2-стаен', total: '67.88', изложение: 'Изток', status: 'Свободен' },
      { apartment: 'А 505', вид: '2-стаен', total: '67.88', изложение: 'Север', status: 'Свободен' },
      { apartment: 'А 506', вид: '3-стаен', total: '114.58', изложение: 'Север/Запад', status: 'Резервиран' },
      { apartment: 'А 507', вид: '2-стаен', total: '69.88', изложение: 'Запад', status: 'Свободен' },
      { apartment: 'А 508', вид: '2-стаен', total: '69.88', изложение: 'Запад', status: 'Свободен' },
      { apartment: 'А 509', вид: '2-стаен', total: '69.88', изложение: 'Запад', status: 'Продадени' },
      { apartment: 'А 510', вид: '3-стаен', total: '108.56', изложение: 'Запад/Юг', status: 'Свободен' },
      { apartment: 'А 511', вид: '2-стаен', total: '63.51', изложение: 'Юг', status: 'Свободен' },
      { apartment: 'А 512', вид: 'Ателие', total: '43.98', изложение: 'Юг', status: 'Свободен' }
    ],
    6: [
      { apartment: 'А 601', вид: '2-стаен', total: '62.18', изложение: 'Юг', status: 'Свободен' },
      { apartment: 'А 602', вид: '3-стаен', total: '101.48', изложение: 'Юг/Изток', status: 'Свободен' },
      { apartment: 'А 603', вид: '3-стаен', total: '107.24', изложение: 'Изток', status: 'Свободен' },
      { apartment: 'А 604', вид: '2-стаен', total: '67.88', изложение: 'Изток', status: 'Свободен' },
      { apartment: 'А 605', вид: '2-стаен', total: '67.88', изложение: 'Север', status: 'Свободен' },
      { apartment: 'А 606', вид: '3-стаен', total: '114.58', изложение: 'Север/Запад', status: 'Резервиран' },
      { apartment: 'А 607', вид: '2-стаен', total: '69.88', изложение: 'Запад', status: 'Резервиран' },
      { apartment: 'А 608', вид: '2-стаен', total: '69.88', изложение: 'Запад', status: 'Резервиран' },
      { apartment: 'А 609', вид: '2-стаен', total: '69.88', изложение: 'Запад', status: 'Свободен' },
      { apartment: 'А 610', вид: '3-стаен', total: '108.56', изложение: 'Запад/Юг', status: 'Свободен' },
      { apartment: 'А 611', вид: '2-стаен', total: '63.51', изложение: 'Юг', status: 'Свободен' },
      { apartment: 'А 612', вид: 'Ателие', total: '43.98', изложение: 'Юг', status: 'Свободен' }
    ],
    7: [
      { apartment: 'А 701', вид: '2-стаен', total: '62.18', изложение: 'Юг', status: 'Свободен' },
      { apartment: 'А 702', вид: '3-стаен', total: '101.48', изложение: 'Юг/Изток', status: 'Свободен' },
      { apartment: 'А 703', вид: '3-стаен', total: '107.24', изложение: 'Изток', status: 'Свободен' },
      { apartment: 'А 704', вид: '2-стаен', total: '67.88', изложение: 'Изток', status: 'Продадени' },
      { apartment: 'А 705', вид: '2-стаен', total: '67.88', изложение: 'Север', status: 'Продадени' },
      { apartment: 'А 706', вид: '3-стаен', total: '114.58', изложение: 'Север/Запад', status: 'Свободен' },
      { apartment: 'А 707', вид: '2-стаен', total: '69.88', изложение: 'Запад', status: 'Свободен' },
      { apartment: 'А 708', вид: '2-стаен', total: '69.88', изложение: 'Запад', status: 'Свободен' },
      { apartment: 'А 709', вид: '2-стаен', total: '69.88', изложение: 'Запад', status: 'Свободен' },
      { apartment: 'А 710', вид: '3-стаен', total: '108.56', изложение: 'Запад/Юг', status: 'Свободен' },
      { apartment: 'А 711', вид: '2-стаен', total: '63.51', изложение: 'Юг', status: 'Свободен' },
      { apartment: 'А 712', вид: 'Ателие', total: '43.98', изложение: 'Юг', status: 'Свободен' }
    ],
    8: [
      { apartment: 'А 801', вид: '2-стаен', total: '62.18', изложение: 'Юг', status: 'Свободен' },
      { apartment: 'А 802', вид: '3-стаен', total: '101.48', изложение: 'Юг/Изток', status: 'Свободен' },
      { apartment: 'А 803', вид: '3-стаен', total: '107.24', изложение: 'Изток', status: 'Свободен' },
      { apartment: 'А 804', вид: '2-стаен', total: '67.88', изложение: 'Изток', status: 'Свободен' },
      { apartment: 'А 805', вид: '2-стаен', total: '67.88', изложение: 'Север', status: 'Свободен' },
      { apartment: 'А 806', вид: '3-стаен', total: '114.58', изложение: 'Север/Запад', status: 'Продадени' },
      { apartment: 'А 807', вид: '2-стаен', total: '69.88', изложение: 'Запад', status: 'Продадени' },
      { apartment: 'А 808', вид: '2-стаен', total: '69.88', изложение: 'Запад', status: 'Свободен' },
      { apartment: 'А 809', вид: '2-стаен', total: '69.88', изложение: 'Запад', status: 'Свободен' },
      { apartment: 'А 810', вид: '3-стаен', total: '108.56', изложение: 'Запад/Юг', status: 'Свободен' },
      { apartment: 'А 811', вид: '2-стаен', total: '63.51', изложение: 'Юг', status: 'Свободен' },
      { apartment: 'А 812', вид: 'Ателие', total: '43.98', изложение: 'Юг', status: 'Свободен' }
    ]
  };

  // Block B apartment data (complete - 12 apartments per floor)
  const blockBFloorData = {
    1: [
      { apartment: 'Б 101', вид: '2-стаен', total: '65.68', изложение: 'Юг', status: 'Свободен' },
      { apartment: 'Б 102', вид: '3-стаен', total: '111.74', изложение: 'Юг/Изток', status: 'Свободен' },
      { apartment: 'Б 103', вид: '3-стаен', total: '107.24', изложение: 'Изток', status: 'Свободен' },
      { apartment: 'Б 104', вид: '2-стаен', total: '67.88', изложение: 'Изток', status: 'Свободен' },
      { apartment: 'Б 105', вид: '2-стаен', total: '67.88', изложение: 'Север', status: 'Свободен' },
      { apartment: 'Б 106', вид: '3-стаен', total: '114.58', изложение: 'Север/Запад', status: 'Свободен' },
      { apartment: 'Б 107', вид: '2-стаен', total: '69.88', изложение: 'Запад', status: 'Свободен' },
      { apartment: 'Б 108', вид: '2-стаен', total: '69.88', изложение: 'Запад', status: 'Свободен' },
      { apartment: 'Б 109', вид: '2-стаен', total: '69.88', изложение: 'Запад', status: 'Свободен' },
      { apartment: 'Б 110', вид: '3-стаен', total: '108.56', изложение: 'Запад/Юг', status: 'Свободен' },
      { apartment: 'Б 111', вид: '2-стаен', total: '59.31', изложение: 'Юг', status: 'Свободен' },
      { apartment: 'Б 112', вид: 'Ателие', total: '43.98', изложение: 'Юг', status: 'Свободен' }
    ],
    2: [
      { apartment: 'Б 201', вид: '2-стаен', total: '62.18', изложение: 'Юг', status: 'Свободен' },
      { apartment: 'Б 202', вид: '3-стаен', total: '101.48', изложение: 'Юг/Изток', status: 'Свободен' },
      { apartment: 'Б 203', вид: '3-стаен', total: '107.24', изложение: 'Изток', status: 'Свободен' },
      { apartment: 'Б 204', вид: '2-стаен', total: '67.88', изложение: 'Изток', status: 'Продадени' },
      { apartment: 'Б 205', вид: '2-стаен', total: '67.88', изложение: 'Север', status: 'Свободен' },
      { apartment: 'Б 206', вид: '3-стаен', total: '114.58', изложение: 'Север/Запад', status: 'Свободен' },
      { apartment: 'Б 207', вид: '2-стаен', total: '69.88', изложение: 'Запад', status: 'Свободен' },
      { apartment: 'Б 208', вид: '2-стаен', total: '69.88', изложение: 'Запад', status: 'Свободен' },
      { apartment: 'Б 209', вид: '2-стаен', total: '69.88', изложение: 'Запад', status: 'Свободен' },
      { apartment: 'Б 210', вид: '3-стаен', total: '108.56', изложение: 'Запад/Юг', status: 'Свободен' },
      { apartment: 'Б 211', вид: '2-стаен', total: '63.51', изложение: 'Юг', status: 'Свободен' },
      { apartment: 'Б 212', вид: 'Ателие', total: '43.98', изложение: 'Юг', status: 'Свободен' }
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

  const currentFloorData = isBlockA ? blockAFloorData : blockBFloorData;

  const handleFloorHover = (floor) => {
    if (floor) {
      const floorImagePath = isBlockA 
        ? `/src/assets/продажби/project 2/building-2-blog-a-floor${floor}.png`
        : `/src/assets/продажби/project 2/building-2-blog-b-floor${floor}.png`;
      setCurrentImage(floorImagePath);
    } else {
      setCurrentImage(
        isBlockA 
          ? '/src/assets/продажби/project 2/golden-residence.jpg'
          : '/src/assets/продажби/project 2/golden-residence.jpg'
      );
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
          <div className="relative mb-2">
            <button 
              onClick={() => navigate('/projects/golden-residence')}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 text-black hover:text-gray-700 flex items-center transition-colors"
            >
              <span className="mr-2">←</span>
              Назад към избор на блок
            </button>
            <h1 className="text-4xl font-bold text-center">
              <span className="text-gold-600">Golden Residence</span> - <span className="text-gold-600">{blockTitle}</span>
            </h1>
          </div>
          <p className="text-lg text-gray-600 text-center">
            {isBlockA ? '96 апартамента • 8 етажа' : '96 апартамента • 8 етажа'}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Building Image */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-lg shadow-lg p-4">
              <img
                src={currentImage}
                alt={`${blockTitle} Floor Plan`}
                className="w-full h-auto rounded-lg"
                style={{ maxHeight: '80vh', objectFit: 'contain' }}
              />
            </div>
          </div>

          {/* Floor Navigation */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-lg shadow-lg p-6 max-h-[80vh] overflow-y-auto">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Етажи и апартаменти</h3>
              
              <div className="space-y-2 mb-6">
                {[8, 7, 6, 5, 4, 3, 2, 1].map((floor) => (
                  <div key={floor}>
                    <div 
                      className="bg-gray-800 rounded-lg p-3 hover:bg-gray-700 transition-colors cursor-pointer"
                      onMouseEnter={() => handleFloorHover(floor)}
                      onMouseLeave={() => handleFloorHover(null)}
                      onClick={() => handleFloorClick(floor)}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-white font-medium">{floor} етаж</span>
                        <span className="text-gray-400 text-sm">
                          12 апартамента
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
        {showFloorPlan && selectedFloor && currentFloorData[selectedFloor] && (
          <div className="fixed inset-0 bg-gray-50 z-50 overflow-y-auto">
            <div className="min-h-screen py-8">
              <div className="container mx-auto px-4 max-w-7xl">
                {/* Header */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-2">
                    <button 
                      onClick={closeFloorPlan}
                      className="text-black hover:text-gray-700 flex items-center transition-colors"
                    >
                      <span className="mr-2">←</span>
                      Назад към {blockTitle}
                    </button>
                    <h1 className="text-4xl font-bold">
                      <span className="text-gold-600">{blockTitle}</span> - <span className="text-gold-600">{selectedFloor} етаж</span>
                    </h1>
                    <div></div> {/* Spacer for centering */}
                  </div>
                  <p className="text-lg text-gray-600 text-center">
                    Архитектурен план и списък на апартаментите
                  </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-12rem)]">
                  {/* Left Side - Apartments Table (50%) */}
                  <div className="lg:w-1/2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-0">Списък на апартаментите</h3>
                      <p className="text-xs sm:text-sm text-gray-600">
                        <span className="hidden sm:inline">Кликнете за детайли</span>
                        <span className="sm:hidden">Скролирайте и кликнете</span>
                      </p>
                    </div>
                    <div className="bg-white rounded-lg overflow-hidden shadow-lg relative">
                      {/* Scroll indicator for mobile */}
                      <div className="absolute top-2 right-2 z-20 sm:hidden">
                        <div className="bg-gold-500/80 text-primary-900 text-xs px-2 py-1 rounded-full animate-pulse font-semibold">
                          ↕ Scroll
                        </div>
                      </div>
                      
                      <div className="overflow-x-auto overflow-y-auto max-h-96 relative" style={{
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
                            {currentFloorData[selectedFloor].map((apt, idx) => (
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
                      {(() => {
                        const available = currentFloorData[selectedFloor].filter(a => a.status === 'Свободен').length;
                        const sold = currentFloorData[selectedFloor].filter(a => a.status === 'Продадени').length;
                        const reserved = currentFloorData[selectedFloor].filter(a => a.status === 'Резервиран').length;
                        
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
                          Архитектурен план - {selectedFloor} етаж
                        </h3>
                        {selectedApartment && (
                          <div className="text-sm bg-gold-100 text-gold-800 px-3 py-1 rounded-full">
                            Избран: {selectedApartment.apartment}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 bg-gray-100 rounded-lg overflow-hidden relative">
                        <div 
                          className="w-full h-full overflow-auto cursor-move relative"
                          style={{
                            transform: `scale(${zoomLevel}) translate(${panPosition.x}px, ${panPosition.y}px)`,
                            transformOrigin: 'top left'
                          }}
                          onMouseDown={(e) => {
                            setIsDragging(true);
                            setLastMousePosition({ x: e.clientX, y: e.clientY });
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
                          onMouseUp={() => setIsDragging(false)}
                          onMouseLeave={() => setIsDragging(false)}
                        >
                          <div className="relative">
                            <img
                              src={`/src/assets/продажби/project 2/architectures-${isBlockA ? 'a' : 'b'}/architecture-${isBlockA ? 'a' : 'b'}-floor-${selectedFloor}.png`}
                              alt={`${blockTitle} - ${selectedFloor} етаж план`}
                              className="w-full h-auto cursor-pointer"
                              onClick={() => setIsArchitecturePlanFullscreen(true)}
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'block';
                              }}
                            />
                            
                          </div>
                          <div className="text-center p-8 hidden">
                            <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-lg font-medium text-gray-600">План на {selectedFloor} етаж</p>
                            <p className="text-sm text-gray-500 mt-2">{blockTitle}</p>
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
                    {blockTitle} - {selectedFloor} етаж - Архитектурен план
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
                <div className="w-full h-full flex items-center justify-center">
                  <img
                    src={`/src/assets/продажби/project 2/architectures-${isBlockA ? 'a' : 'b'}/architecture-${isBlockA ? 'a' : 'b'}-floor-${selectedFloor}.png`}
                    alt={`${blockTitle} - ${selectedFloor} етаж план`}
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
                        +359 888 123 456
                      </div>
                      <p className="text-sm text-gray-500 mt-1">Работно време: 9:00 - 18:00</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <a 
                        href="tel:+359888123456"
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

      </div>
    </div>
  );
};

export default GoldenResidenceSingleBlock;