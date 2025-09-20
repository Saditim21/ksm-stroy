import React, { useState, useEffect } from 'react';
import buildingImage from '../assets/продажби/project 1/sgrada1.jpg';
import buildingBFloor1Image from '../assets/продажби/project 1/building-B-floor-1.jpg';
import buildingBFloor2Image from '../assets/продажби/project 1/building-B-floor-2.jpg';
import buildingAllFloorsArchitectureImage from '../assets/продажби/project 1/building-all-floors-architecture.png';
import buildingBFloor3Image from '../assets/продажби/project 1/building-B-floor-3.jpg';
import buildingBFloor4Image from '../assets/продажби/project 1/building-B-floor-4.jpg';
import buildingBFloor5Image from '../assets/продажби/project 1/building-B-floor-5.jpg';
import buildingBFloor6Image from '../assets/продажби/project 1/building-B-floor-6.jpg';
import buildingBFloor7Image from '../assets/продажби/project 1/building-B-floor-7.jpg';
import buildingBFloor8Image from '../assets/продажби/project 1/building-B-floor-8.jpg';
import buildingBFloor9Image from '../assets/продажби/project 1/building-B-floor-9.jpg';
import buildingAFloor1Image from '../assets/продажби/project 1/building-A-floor-1.jpg';
import buildingAFloor2Image from '../assets/продажби/project 1/building-A-floor-2.jpg';
import buildingAFloor3Image from '../assets/продажби/project 1/building-A-floor-3.jpg';
import buildingAFloor4Image from '../assets/продажби/project 1/building-A-floor-4.jpg';
import buildingAFloor5Image from '../assets/продажби/project 1/building-A-floor-5.jpg';
import buildingAFloor6Image from '../assets/продажби/project 1/building-A-floor-6.jpg';
import buildingAFloor7Image from '../assets/продажби/project 1/building-A-floor-7.jpg';
import buildingAFloor8Image from '../assets/продажби/project 1/building-A-floor-8.jpg';
import buildingAFloor9Image from '../assets/продажби/project 1/building-A-floor-9.jpg';

// Simple floor data
export const FLOOR_DATA = {
  'A': {
    8: { 
      property: 'А-801', 
      type: '3-стаен', 
      // removed builtArea: '78 м²', 
      totalArea: '95 м²', 
      exposure: 'Юг/Изток', 
      status: 'available',
      apartments: [
        { имот: 'А-801', вид: '3-стаен', общаПлощ: '95 м²', изложение: 'Юг/Изток', статус: 'Свободен' },
        { имот: 'А-802', вид: '2-стаен', общаПлощ: '75 м²', изложение: 'Запад', статус: 'Резервиран' },
        { имот: 'А-803', вид: '4-стаен', общаПлощ: '115 м²', изложение: 'Север/Изток', статус: 'Свободен' },
        { имот: 'А-804', вид: '1-стаен', общаПлощ: '55 м²', изложение: 'Север', статус: 'Резервиран' },
        { имот: 'А-805', вид: '2-стаен', общаПлощ: '82 м²', изложение: 'Изток/Юг', статус: 'Продаден' },
        { имот: 'А-806', вид: '3-стаен', общаПлощ: '102 м²', изложение: 'Юг', статус: 'Продаден' },
        { имот: 'А-807', вид: '1-стаен', общаПлощ: '52 м²', изложение: 'Изток', статус: 'Продаден' },
        { имот: 'А-808', вид: '4-стаен', общаПлощ: '125 м²', изложение: 'Запад/Юг', статус: 'Продаден' },
      ],
      planImage: buildingAllFloorsArchitectureImage
    },
    7: { 
      property: 'А-701', 
      type: '2-стаен', 
      // removed builtArea: '62 м²', 
      totalArea: '75 м²', 
      exposure: 'Запад', 
      status: 'sold',
      apartments: [
        { имот: 'А-701', вид: '2-стаен', общаПлощ: '75 м²', изложение: 'Запад', статус: 'Продаден' },
        { имот: 'А-702', вид: '3-стаен', общаПлощ: '98 м²', изложение: 'Юг/Изток', статус: 'Продаден' },
        { имот: 'А-703', вид: '1-стаен', общаПлощ: '55 м²', изложение: 'Север', статус: 'Резервиран' },
        { имот: 'А-704', вид: '4-стаен', общаПлощ: '125 м²', изложение: 'Запад/Юг', статус: 'Продаден' },
        { имот: 'А-705', вид: '2-стаен', общаПлощ: '82 м²', изложение: 'Изток/Юг', статус: 'Продаден' },
        { имот: 'А-706', вид: '3-стаен', общаПлощ: '102 м²', изложение: 'Юг', статус: 'Продаден' },
        { имот: 'А-707', вид: '1-стаен', общаПлощ: '52 м²', изложение: 'Изток', статус: 'Продаден' },
        { имот: 'А-708', вид: '4-стаен', общаПлощ: '130 м²', изложение: 'Север/Запад', статус: 'Продаден' },
      ],
      planImage: buildingAllFloorsArchitectureImage
    },
    6: { 
      property: 'А-601', 
      type: '4-стаен', 
      // removed builtArea: '98 м²', 
      totalArea: '115 м²', 
      exposure: 'Север/Изток', 
      status: 'sold',
      apartments: [
        { имот: 'А-601', вид: '4-стаен', общаПлощ: '115 м²', изложение: 'Север/Изток', статус: 'Резервиран' },
        { имот: 'А-602', вид: '2-стаен', общаПлощ: '78 м²', изложение: 'Север', статус: 'Продаден' },
        { имот: 'А-603', вид: '3-стаен', общаПлощ: '102 м²', изложение: 'Юг', статус: 'Продаден' },
        { имот: 'А-604', вид: '1-стаен', общаПлощ: '52 м²', изложение: 'Изток', статус: 'Продаден' },
        { имот: 'А-605', вид: '2-стаен', общаПлощ: '82 м²', изложение: 'Изток/Юг', статус: 'Продаден' },
        { имот: 'А-606', вид: '3-стаен', общаПлощ: '98 м²', изложение: 'Запад', статус: 'Продаден' },
        { имот: 'А-607', вид: '4-стаен', общаПлощ: '125 м²', изложение: 'Север/Запад', статус: 'Продаден' },
        { имот: 'А-608', вид: '1-стаен', общаПлощ: '55 м²', изложение: 'Юг/Изток', статус: 'Продаден' },
      ],
      planImage: buildingAllFloorsArchitectureImage
    },
    5: { 
      property: 'А-501', 
      type: '2-стаен', 
      // removed builtArea: '62 м²', 
      totalArea: '75 м²', 
      exposure: 'Север', 
      status: 'sold',
      apartments: [
        { имот: 'А-501', вид: '2-стаен', общаПлощ: '75 м²', изложение: 'Север', статус: 'Продаден' },
        { имот: 'А-502', вид: '3-стаен', общаПлощ: '94 м²', изложение: 'Юг/Запад', статус: 'Продаден' },
        { имот: 'А-503', вид: '1-стаен', общаПлощ: '52 м²', изложение: 'Изток', статус: 'Продаден' },
        { имот: 'А-504', вид: '4-стаен', общаПлощ: '130 м²', изложение: 'Юг/Изток/Запад', статус: 'Продаден' },
        { имот: 'А-505', вид: '2-стаен', общаПлощ: '82 м²', изложение: 'Север/Запад', статус: 'Продаден' },
        { имот: 'А-506', вид: '3-стаен', общаПлощ: '102 м²', изложение: 'Юг', статус: 'Продаден' },
        { имот: 'А-507', вид: '1-стаен', общаПлощ: '55 м²', изложение: 'Изток/Юг', статус: 'Продаден' },
        { имот: 'А-508', вид: '2-стаен', общаПлощ: '78 м²', изложение: 'Запад', статус: 'Продаден' },
      ],
      planImage: buildingAllFloorsArchitectureImage
    },
    4: { 
      property: 'А-401', 
      type: '3-стаен', 
      // removed builtArea: '78 м²', 
      totalArea: '95 м²', 
      exposure: 'Юг/Изток', 
      status: 'sold',
      apartments: [
        { имот: 'А-401', вид: '3-стаен', общаПлощ: '95 м²', изложение: 'Юг/Изток', статус: 'Продаден' },
        { имот: 'А-402', вид: '2-стаен', общаПлощ: '75 м²', изложение: 'Север', статус: 'Продаден' },
        { имот: 'А-403', вид: '4-стаен', общаПлощ: '130 м²', изложение: 'Юг/Изток/Запад', статус: 'Продаден' },
        { имот: 'А-404', вид: '1-стаен', общаПлощ: '50 м²', изложение: 'Запад', статус: 'Продаден' },
        { имот: 'А-405', вид: '2-стаен', общаПлощ: '82 м²', изложение: 'Север/Изток', статус: 'Продаден' },
        { имот: 'А-406', вид: '3-стаен', общаПлощ: '102 м²', изложение: 'Юг', статус: 'Продаден' },
        { имот: 'А-407', вид: '1-стаен', общаПлощ: '52 м²', изложение: 'Изток/Юг', статус: 'Продаден' },
        { имот: 'А-408', вид: '4-стаен', общаПлощ: '125 м²', изложение: 'Север/Запад', статус: 'Продаден' },
      ],
      planImage: buildingAllFloorsArchitectureImage
    },
    3: { 
      property: 'А-301', 
      type: '2-стаен', 
      // removed builtArea: '62 м²', 
      totalArea: '75 м²', 
      exposure: 'Север', 
      status: 'sold',
      apartments: [
        { имот: 'А-301', вид: '2-стаен', общаПлощ: '75 м²', изложение: 'Север', статус: 'Продаден' },
        { имот: 'А-302', вид: '3-стаен', общаПлощ: '98 м²', изложение: 'Юг/Изток', статус: 'Продаден' },
        { имот: 'А-303', вид: '4-стаен', общаПлощ: '125 м²', изложение: 'Запад/Юг', статус: 'Продаден' },
        { имот: 'А-304', вид: '1-стаен', общаПлощ: '55 м²', изложение: 'Изток', статус: 'Продаден' },
        { имот: 'А-305', вид: '2-стаен', общаПлощ: '82 м²', изложение: 'Север/Запад', статус: 'Продаден' },
        { имот: 'А-306', вид: '3-стаен', общаПлощ: '102 м²', изложение: 'Юг', статус: 'Продаден' },
        { имот: 'А-307', вид: '1-стаен', общаПлощ: '52 м²', изложение: 'Изток/Юг', статус: 'Продаден' },
        { имот: 'А-308', вид: '4-стаен', общаПлощ: '130 м²', изложение: 'Запад', статус: 'Продаден' },
      ],
      planImage: buildingAllFloorsArchitectureImage
    },
    9: { 
      property: 'А-901', 
      type: '3-стаен', 
      // removed builtArea: '78 м²', 
      totalArea: '95 м²', 
      exposure: 'Юг/Изток', 
      status: 'sold',
      apartments: [
        { имот: 'А-901', вид: '3-стаен', общаПлощ: '95 м²', изложение: 'Юг/Изток', статус: 'Продаден' },
        { имот: 'А-902', вид: '2-стаен', общаПлощ: '75 м²', изложение: 'Запад', статус: 'Продаден' },
        { имот: 'А-903', вид: '1-стаен', общаПлощ: '55 м²', изложение: 'Север', статус: 'Продаден' },
        { имот: 'А-904', вид: '4-стаен', общаПлощ: '130 м²', изложение: 'Юг/Изток/Запад', статус: 'Продаден' },
        { имот: 'А-905', вид: '2-стаен', общаПлощ: '82 м²', изложение: 'Изток/Юг', статус: 'Продаден' },
        { имот: 'А-906', вид: '3-стаен', общаПлощ: '102 м²', изложение: 'Запад/Юг', статус: 'Продаден' },
        { имот: 'А-907', вид: '1-стаен', общаПлощ: '52 м²', изложение: 'Изток', статус: 'Продаден' },
        { имот: 'А-908', вид: '2-стаен', общаПлощ: '78 м²', изложение: 'Север/Запад', статус: 'Продаден' },
      ],
      planImage: buildingAllFloorsArchitectureImage
    },
    2: { 
      property: 'А-201', 
      type: '4-стаен', 
      // removed builtArea: '98 м²', 
      totalArea: '115 м²', 
      exposure: 'Запад/Юг', 
      status: 'sold',
      apartments: [
        { имот: 'А-201', вид: '4-стаен', общаПлощ: '115 м²', изложение: 'Запад/Юг', статус: 'Продаден' },
        { имот: 'А-202', вид: '2-стаен', общаПлощ: '78 м²', изложение: 'Север', статус: 'Продаден' },
        { имот: 'А-203', вид: '3-стаен', общаПлощ: '98 м²', изложение: 'Изток', статус: 'Продаден' },
        { имот: 'А-204', вид: '1-стаен', общаПлощ: '55 м²', изложение: 'Север', статус: 'Продаден' },
        { имот: 'А-205', вид: '2-стаен', общаПлощ: '82 м²', изложение: 'Изток/Юг', статус: 'Продаден' },
        { имот: 'А-206', вид: '3-стаен', общаПлощ: '102 м²', изложение: 'Юг', статус: 'Продаден' },
        { имот: 'А-207', вид: '1-стаен', общаПлощ: '52 м²', изложение: 'Запад', статус: 'Продаден' },
        { имот: 'А-208', вид: '4-стаен', общаПлощ: '125 м²', изложение: 'Запад/Изток', статус: 'Продаден' },
      ],
      planImage: buildingAllFloorsArchitectureImage
    },
    1: { 
      property: 'А-101', 
      type: '2-стаен', 
      // removed builtArea: '62 м²', 
      totalArea: '75 м²', 
      exposure: 'Север', 
      status: 'available',
      apartments: [
        { имот: 'А-101', вид: '2-стаен', общаПлощ: '75 м²', изложение: 'Север', статус: 'Свободен' },
        { имот: 'А-102', вид: '3-стаен', общаПлощ: '94 м²', изложение: 'Юг/Запад', статус: 'Продаден' },
        { имот: 'А-103', вид: '1-стаен', общаПлощ: '52 м²', изложение: 'Изток', статус: 'Свободен' },
        { имот: 'А-104', вид: '4-стаен', общаПлощ: '130 м²', изложение: 'Юг/Изток/Запад', статус: 'Продаден' },
        { имот: 'А-105', вид: '2-стаен', общаПлощ: '82 м²', изложение: 'Север/Изток', статус: 'Продаден' },
        { имот: 'А-106', вид: '3-стаен', общаПлощ: '102 м²', изложение: 'Запад', статус: 'Продаден' },
        { имот: 'А-107', вид: '1-стаен', общаПлощ: '55 м²', изложение: 'Юг', статус: 'Продаден' },
        { имот: 'А-108', вид: '2-стаен', общаПлощ: '78 м²', изложение: 'Изток/Юг', статус: 'Продаден' },
      ],
      planImage: buildingAllFloorsArchitectureImage
    },
    0: { 
      property: 'Гараж А', 
      type: 'Паркомясто', 
      // removed builtArea: '15 м²', 
      totalArea: '15 м²', 
      exposure: '-', 
      status: 'available',
      apartments: [
        { имот: 'Гараж А-1', вид: 'Паркомясто', общаПлощ: '15 м²', изложение: '-', статус: 'Свободен' },
        { имот: 'Гараж А-2', вид: 'Паркомясто', общаПлощ: '15 м²', изложение: '-', статус: 'Свободен' },
        { имот: 'Гараж А-3', вид: 'Паркомясто', общаПлощ: '15 м²', изложение: '-', статус: 'Продаден' },
      ]
    },
  },
  'B': {
    8: { 
      property: 'Б-801', 
      type: '3-стаен', 
      // removed builtArea: '78 м²', 
      totalArea: '95 м²', 
      exposure: 'Юг/Изток', 
      status: 'available',
      apartments: [
        { имот: 'Б-801', вид: '3-стаен', общаПлощ: '95 м²', изложение: 'Юг/Изток', статус: 'Свободен' },
        { имот: 'Б-802', вид: '2-стаен', общаПлощ: '75 м²', изложение: 'Запад', статус: 'Продаден' },
        { имот: 'Б-803', вид: '1-стаен', общаПлощ: '55 м²', изложение: 'Север', статус: 'Свободен' },
        { имот: 'Б-804', вид: '4-стаен', общаПлощ: '130 м²', изложение: 'Юг/Изток/Запад', статус: 'Свободен' },
        { имот: 'Б-805', вид: '2-стаен', общаПлощ: '82 м²', изложение: 'Изток/Юг', статус: 'Продаден' },
        { имот: 'Б-806', вид: '3-стаен', общаПлощ: '102 м²', изложение: 'Запад/Юг', статус: 'Продаден' },
        { имот: 'Б-807', вид: '1-стаен', общаПлощ: '52 м²', изложение: 'Север/Запад', статус: 'Продаден' },
        { имот: 'Б-808', вид: '2-стаен', общаПлощ: '78 м²', изложение: 'Изток', статус: 'Продаден' },
      ],
      planImage: buildingAllFloorsArchitectureImage
    },
    9: { 
      property: 'Б-901', 
      type: '3-стаен', 
      // removed builtArea: '78 м²', 
      totalArea: '95 м²', 
      exposure: 'Юг/Изток', 
      status: 'sold',
      apartments: [
        { имот: 'Б-901', вид: '3-стаен', общаПлощ: '95 м²', изложение: 'Юг/Изток', статус: 'Продаден' },
        { имот: 'Б-902', вид: '2-стаен', общаПлощ: '75 м²', изложение: 'Запад', статус: 'Продаден' },
        { имот: 'Б-903', вид: '1-стаен', общаПлощ: '55 м²', изложение: 'Север', статус: 'Продаден' },
        { имот: 'Б-904', вид: '4-стаен', общаПлощ: '130 м²', изложение: 'Юг/Изток/Запад', статус: 'Продаден' },
        { имот: 'Б-905', вид: '2-стаен', общаПлощ: '82 м²', изложение: 'Изток/Юг', статус: 'Продаден' },
        { имот: 'Б-906', вид: '3-стаен', общаПлощ: '102 м²', изложение: 'Запад/Юг', статус: 'Продаден' },
        { имот: 'Б-907', вид: '1-стаен', общаПлощ: '52 м²', изложение: 'Изток', статус: 'Продаден' },
        { имот: 'Б-908', вид: '2-стаен', общаПлощ: '78 м²', изложение: 'Север/Запад', статус: 'Продаден' },
      ],
      planImage: buildingAllFloorsArchitectureImage
    },
    7: { 
      property: 'Б-701', 
      type: '2-стаен', 
      // removed builtArea: '62 м²', 
      totalArea: '75 м²', 
      exposure: 'Запад', 
      status: 'available',
      apartments: [
        { имот: 'Б-701', вид: '2-стаен', общаПлощ: '75 м²', изложение: 'Запад', статус: 'Свободен' },
        { имот: 'Б-702', вид: '3-стаен', общаПлощ: '98 м²', изложение: 'Юг/Изток', статус: 'Свободен' },
        { имот: 'Б-703', вид: '1-стаен', общаПлощ: '55 м²', изложение: 'Север', статус: 'Продаден' },
        { имот: 'Б-704', вид: '4-стаен', общаПлощ: '130 м²', изложение: 'Изток/Юг', статус: 'Продаден' },
        { имот: 'Б-705', вид: '2-стаен', общаПлощ: '78 м²', изложение: 'Запад/Юг', статус: 'Продаден' },
        { имот: 'Б-706', вид: '3-стаен', общаПлощ: '102 м²', изложение: 'Север/Изток', статус: 'Продаден' },
        { имот: 'Б-707', вид: '1-стаен', общаПлощ: '52 м²', изложение: 'Изток', статус: 'Продаден' },
        { имот: 'Б-708', вид: '2-стаен', общаПлощ: '82 м²', изложение: 'Юг', статус: 'Продаден' },
      ],
      planImage: buildingAllFloorsArchitectureImage
    },
    6: { 
      property: 'Б-602', 
      type: '2-стаен', 
      // removed builtArea: '65 м²', 
      totalArea: '78 м²', 
      exposure: 'Север', 
      status: 'available',
      apartments: [
        { имот: 'Б-601', вид: '4-стаен', общаПлощ: '115 м²', изложение: 'Север/Изток', статус: 'Продаден' },
        { имот: 'Б-602', вид: '2-стаен', общаПлощ: '78 м²', изложение: 'Север', статус: 'Свободен' },
        { имот: 'Б-603', вид: '3-стаен', общаПлощ: '102 м²', изложение: 'Юг', статус: 'Продаден' },
        { имот: 'Б-604', вид: '1-стаен', общаПлощ: '52 м²', изложение: 'Изток', статус: 'Продаден' },
        { имот: 'Б-605', вид: '2-стаен', общаПлощ: '82 м²', изложение: 'Изток/Юг', статус: 'Продаден' },
        { имот: 'Б-606', вид: '3-стаен', общаПлощ: '98 м²', изложение: 'Запад', статус: 'Продаден' },
        { имот: 'Б-607', вид: '4-стаен', общаПлощ: '125 м²', изложение: 'Север/Запад', статус: 'Продаден' },
        { имот: 'Б-608', вид: '1-стаен', общаПлощ: '55 м²', изложение: 'Юг/Изток', статус: 'Продаден' },
      ],
      planImage: buildingAllFloorsArchitectureImage
    },
    5: { 
      property: 'Б-501', 
      type: '2-стаен', 
      // removed builtArea: '62 м²', 
      totalArea: '75 м²', 
      exposure: 'Север', 
      status: 'sold',
      apartments: [
        { имот: 'Б-501', вид: '2-стаен', общаПлощ: '75 м²', изложение: 'Север', статус: 'Продаден' },
        { имот: 'Б-502', вид: '3-стаен', общаПлощ: '94 м²', изложение: 'Юг/Запад', статус: 'Продаден' },
        { имот: 'Б-503', вид: '1-стаен', общаПлощ: '52 м²', изложение: 'Изток', статус: 'Продаден' },
        { имот: 'Б-504', вид: '4-стаен', общаПлощ: '130 м²', изложение: 'Юг/Изток/Запад', статус: 'Продаден' },
        { имот: 'Б-505', вид: '2-стаен', общаПлощ: '82 м²', изложение: 'Север/Запад', статус: 'Продаден' },
        { имот: 'Б-506', вид: '3-стаен', общаПлощ: '102 м²', изложение: 'Юг', статус: 'Продаден' },
        { имот: 'Б-507', вид: '1-стаен', общаПлощ: '55 м²', изложение: 'Изток/Юг', статус: 'Продаден' },
        { имот: 'Б-508', вид: '2-стаен', общаПлощ: '78 м²', изложение: 'Запад', статус: 'Продаден' },
      ],
      planImage: buildingAllFloorsArchitectureImage
    },
    4: { 
      property: 'Б-401', 
      type: '3-стаен', 
      // removed builtArea: '78 м²', 
      totalArea: '95 м²', 
      exposure: 'Юг/Изток', 
      status: 'available',
      apartments: [
        { имот: 'Б-401', вид: '3-стаен', общаПлощ: '95 м²', изложение: 'Юг/Изток', статус: 'Свободен' },
        { имот: 'Б-402', вид: '2-стаен', общаПлощ: '75 м²', изложение: 'Север', статус: 'Продаден' },
        { имот: 'Б-403', вид: '4-стаен', общаПлощ: '130 м²', изложение: 'Юг/Изток/Запад', статус: 'Резервиран' },
        { имот: 'Б-404', вид: '1-стаен', общаПлощ: '52 м²', изложение: 'Запад', статус: 'Продаден' },
        { имот: 'Б-405', вид: '2-стаен', общаПлощ: '78 м²', изложение: 'Север/Изток', статус: 'Продаден' },
        { имот: 'Б-406', вид: '3-стаен', общаПлощ: '98 м²', изложение: 'Юг', статус: 'Продаден' },
        { имот: 'Б-407', вид: '2-стаен', общаПлощ: '82 м²', изложение: 'Изток/Юг', статус: 'Продаден' },
        { имот: 'Б-408', вид: '4-стаен', общаПлощ: '125 м²', изложение: 'Север/Запад', статус: 'Продаден' },
      ],
      planImage: buildingAllFloorsArchitectureImage
    },
    3: { 
      property: 'Б-301', 
      type: '2-стаен', 
      // removed builtArea: '62 м²', 
      totalArea: '75 м²', 
      exposure: 'Север', 
      status: 'available',
      apartments: [
        { имот: 'Б-301', вид: '2-стаен', общаПлощ: '75 м²', изложение: 'Север', статус: 'Свободен' },
        { имот: 'Б-302', вид: '3-стаен', общаПлощ: '98 м²', изложение: 'Юг/Изток', статус: 'Продаден' },
        { имот: 'Б-303', вид: '4-стаен', общаПлощ: '125 м²', изложение: 'Запад/Юг', статус: 'Продаден' },
        { имот: 'Б-304', вид: '1-стаен', общаПлощ: '55 м²', изложение: 'Изток', статус: 'Продаден' },
        { имот: 'Б-305', вид: '2-стаен', общаПлощ: '82 м²', изложение: 'Север/Запад', статус: 'Продаден' },
        { имот: 'Б-306', вид: '3-стаен', общаПлощ: '102 м²', изложение: 'Юг', статус: 'Продаден' },
        { имот: 'Б-307', вид: '1-стаен', общаПлощ: '52 м²', изложение: 'Изток/Юг', статус: 'Продаден' },
        { имот: 'Б-308', вид: '4-стаен', общаПлощ: '130 м²', изложение: 'Запад', статус: 'Продаден' },
      ],
      planImage: buildingAllFloorsArchitectureImage
    },
    2: { 
      property: 'Б-201', 
      type: '4-стаен', 
      // removed builtArea: '98 м²', 
      totalArea: '115 м²', 
      exposure: 'Запад/Юг', 
      status: 'available',
      apartments: [
        { имот: 'Б-201', вид: '4-стаен', общаПлощ: '115 м²', изложение: 'Запад/Юг', статус: 'Свободен' },
        { имот: 'Б-202', вид: '2-стаен', общаПлощ: '78 м²', изложение: 'Север', статус: 'Резервиран' },
        { имот: 'Б-203', вид: '3-стаен', общаПлощ: '102 м²', изложение: 'Юг', статус: 'Продаден' },
        { имот: 'Б-204', вид: '2-стаен', общаПлощ: '82 м²', изложение: 'Изток/Юг', статус: 'Продаден' },
        { имот: 'Б-205', вид: '1-стаен', общаПлощ: '52 м²', изложение: 'Север/Запад', статус: 'Продаден' },
        { имот: 'Б-206', вид: '3-стаен', общаПлощ: '94 м²', изложение: 'Изток', статус: 'Продаден' },
        { имот: 'Б-207', вид: '2-стаен', общаПлощ: '75 м²', изложение: 'Запад', статус: 'Продаден' },
        { имот: 'Б-208', вид: '4-стаен', общаПлощ: '125 м²', изложение: 'Север/Изток', статус: 'Продаден' },
      ],
      planImage: buildingAllFloorsArchitectureImage
    },
    1: { 
      property: 'Б-101', 
      type: '2-стаен', 
      // removed builtArea: '62 м²', 
      totalArea: '75 м²', 
      exposure: 'Север', 
      status: 'available',
      apartments: [
        { имот: 'Б-101', вид: '2-стаен', общаПлощ: '75 м²', изложение: 'Север', статус: 'Продаден' },
        { имот: 'Б-102', вид: '2-стаен', общаПлощ: '69.12 м²', изложение: 'Юг/Запад', статус: 'Свободен' },
        { имот: 'Б-103', вид: '1-стаен', общаПлощ: '52 м²', изложение: 'Изток', статус: 'Продаден' },
        { имот: 'Б-104', вид: '4-стаен', общаПлощ: '130 м²', изложение: 'Юг/Изток/Запад', статус: 'Продаден' },
        { имот: 'Б-105', вид: '2-стаен', общаПлощ: '78 м²', изложение: 'Север/Изток', статус: 'Продаден' },
        { имот: 'Б-106', вид: '2-стаен', общаПлощ: '100.71 м²', изложение: 'Запад', статус: 'Свободен' },
        { имот: 'Б-107', вид: '3-стаен', общаПлощ: '100.71 м²', изложение: 'Юг', статус: 'Свободен' },
        { имот: 'Б-108', вид: '2-стаен', общаПлощ: '82 м²', изложение: 'Изток/Юг', статус: 'Продаден' },
      ],
      planImage: buildingAllFloorsArchitectureImage
    },
    0: { 
      property: 'Гараж Б', 
      type: 'Паркомясто', 
      // removed builtArea: '15 м²', 
      totalArea: '15 м²', 
      exposure: '-', 
      status: 'available',
      apartments: [
        { имот: 'Гараж Б-1', вид: 'Паркомясто', общаПлощ: '15 м²', изложение: '-', статус: 'Свободен' },
        { имот: 'Гараж Б-2', вид: 'Паркомясто', общаПлощ: '15 м²', изложение: '-', статус: 'Свободен' },
        { имот: 'Гараж Б-3', вид: 'Паркомясто', общаПлощ: '15 м²', изложение: '-', статус: 'Свободен' },
        { имот: 'Гараж Б-4', вид: 'Паркомясто', общаПлощ: '15 м²', изложение: '-', статус: 'Продаден' },
      ]
    },
  },
};

// Tower configurations
const TOWERS = [
  { id: 'A', name: 'Блок A', floors: 10 },
  { id: 'B', name: 'Блок B', floors: 10 }
];

const FourTowersFloorMap = ({ onHoverChange, currentImage, onFloorSelect, onApartmentSelect, clearFloorSelection }) => {
  const [selected, setSelected] = useState({ tower: null, floor: null });
  const [expandedTowers, setExpandedTowers] = useState(new Set(['A', 'B']));
  const [selectedFloorImage, setSelectedFloorImage] = useState(null);
  const [hoveredApartment, setHoveredApartment] = useState(null);
  
  // Allow parent component to clear the floor selection
  useEffect(() => {
    if (clearFloorSelection) {
      setSelectedFloorImage(null);
      setSelected({ tower: null, floor: null });
    }
  }, [clearFloorSelection]);

  const toggleTowerExpansion = (towerId) => {
    setExpandedTowers(prev => {
      const next = new Set(prev);
      if (next.has(towerId)) {
        next.delete(towerId);
      } else {
        next.add(towerId);
      }
      return next;
    });
  };

  const handleFloorClick = (towerId, floorIndex) => {
    setSelected({ tower: towerId, floor: floorIndex });
    
    // Check if this floor has a plan image
    const floorData = FLOOR_DATA[towerId]?.[floorIndex];
    if (floorData?.planImage) {
      setSelectedFloorImage(floorData.planImage);
    } else {
      setSelectedFloorImage(null);
    }
    
    // Pass the selected floor data to parent component for any floor that has apartments
    if (onFloorSelect) {
      if (floorData?.apartments) {
        onFloorSelect(towerId, floorIndex, floorData);
      }
    }
  };

  const handleFloorHover = (towerId, floorIndex) => {
    if (onHoverChange) {
      const isHovering = towerId !== null && floorIndex !== null;
      onHoverChange(isHovering, towerId, floorIndex);
    }
  };

  const getFloorName = (floorIndex) => {
    if (floorIndex === 0) return 'Партер/Гаражи';
    return `Етаж ${floorIndex}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'text-green-600';
      case 'sold': return 'text-red-600';
      case 'reserved': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'available': return 'bg-green-100';
      case 'sold': return 'bg-red-100';
      case 'reserved': return 'bg-yellow-100';
      default: return 'bg-gray-100';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'available': return 'Свободен';
      case 'sold': return 'Продаден';
      case 'reserved': return 'Резервиран';
      default: return status;
    }
  };

  return (
    <div className="w-full h-full bg-gray-50">
      <div className="flex h-full">
        {/* Left Panel - Tower/Floor List */}
        <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto flex-shrink-0">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Етажи по блокове</h2>
            <p className="text-sm text-gray-600 mt-1">Кликнете на етаж за детайли</p>
          </div>
          
          <div className="p-2">
            {TOWERS.map(tower => (
              <div key={tower.id} className="mb-2">
                <button
                  onClick={() => toggleTowerExpansion(tower.id)}
                  className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <span className="font-semibold text-gray-800">{tower.name}</span>
                  <svg
                    className={`w-5 h-5 text-gray-600 transition-transform ${expandedTowers.has(tower.id) ? 'rotate-90' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                
                {expandedTowers.has(tower.id) && (
                  <div className="mt-1 ml-2 space-y-1">
                    {Array.from({ length: tower.floors }, (_, i) => {
                      const floorIndex = tower.floors - 1 - i;
                      const floorData = FLOOR_DATA[tower.id]?.[floorIndex];
                      if (!floorData) return null;
                      
                      const isSelected = selected.tower === tower.id && selected.floor === floorIndex;
                      
                      return (
                        <button
                          key={floorIndex}
                          onClick={() => handleFloorClick(tower.id, floorIndex)}
                          onMouseEnter={() => {
                            if ((tower.id === 'A' && floorIndex >= 1 && floorIndex <= 9) || (tower.id === 'B' && floorIndex >= 1 && floorIndex <= 9)) {
                              handleFloorHover(tower.id, floorIndex);
                            }
                          }}
                          onMouseLeave={() => {
                            if ((tower.id === 'A' && floorIndex >= 1 && floorIndex <= 9) || (tower.id === 'B' && floorIndex >= 1 && floorIndex <= 9)) {
                              handleFloorHover(null, null);
                            }
                          }}
                          className={`w-full px-3 py-2 text-left text-sm rounded transition-colors ${
                            isSelected 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span>{getFloorName(floorIndex)}</span>
                            <span className="px-2 py-1 rounded-full text-xs bg-gradient-to-r from-gold-500 to-gold-600 text-primary-900 font-semibold">
                              {(() => {
                                const availableCount = floorData.apartments ? 
                                  floorData.apartments.filter(apt => apt.статус === 'Свободен').length : 0;
                                const totalCount = floorData.apartments ? floorData.apartments.length : 0;
                                return `${availableCount}/${totalCount} апартамента`;
                              })()}
                            </span>
                          </div>
                          <div className="text-xs opacity-75 mt-1">
                            {(() => {
                              const availableCount = floorData.apartments ? 
                                floorData.apartments.filter(apt => apt.статус === 'Свободен').length : 0;
                              return availableCount > 0 ? 
                                `${availableCount} свободни апартамента` : 
                                'Няма свободни апартаменти';
                            })()}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Center - Building Image with SVG Overlay */}
        <div className="flex-1 bg-gray-100 relative overflow-auto">
          <div className="w-full h-full p-4">
            <div className="bg-gray-100 h-full">
              <div className="relative w-full h-full flex items-center justify-center">
                <img 
                  src={selectedFloorImage || currentImage || buildingImage} 
                  alt="Building Complex Floor Map" 
                  className="max-w-4xl max-h-[530px] object-contain"
                />
                
                {/* Back button when viewing floor plan */}
                {selectedFloorImage && (
                  <button
                    onClick={() => {
                      setSelectedFloorImage(null);
                      setSelected({ tower: null, floor: null });
                    }}
                    className="absolute top-6 left-6 bg-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-shadow flex items-center space-x-2 text-gray-700 hover:text-gray-900"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>Обратно към сградата</span>
                  </button>
                )}
                
                {/* Building floor hover and click areas covering entire width */}
                {!selectedFloorImage && (
                  <svg
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                  >
                  {/* Block A Floors 1-9 - Left side hover areas */}
                  {[
                    { floor: 9, y: 32 },
                    { floor: 8, y: 36 },
                    { floor: 7, y: 38 },
                    { floor: 6, y: 42 },
                    { floor: 5, y: 45 },
                    { floor: 4, y: 48 },
                    { floor: 3, y: 50 },
                    { floor: 2, y: 55 },
                    { floor: 1, y: 60.5 }
                  ].map(({ floor, y }) => (
                    <rect
                      key={`floor-A-${floor}`}
                      x={12}
                      y={y}
                      width={38}
                      height={5}
                      fill="transparent"
                      stroke="transparent"
                      strokeWidth="0"
                      className="cursor-pointer"
                      style={{ pointerEvents: 'auto' }}
                      onMouseEnter={() => handleFloorHover('A', floor)}
                      onMouseLeave={() => handleFloorHover(null, null)}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFloorClick('A', floor);
                      }}
                    />
                  ))}
                  
                  {/* Block B Floors 1-9 - Right side hover areas */}
                  {[
                    { floor: 9, y: 32 },
                    { floor: 8, y: 36 },
                    { floor: 7, y: 38 },
                    { floor: 6, y: 42 },
                    { floor: 5, y: 45 },
                    { floor: 4, y: 48 },
                    { floor: 3, y: 50 },
                    { floor: 2, y: 55 },
                    { floor: 1, y: 60.5 }
                  ].map(({ floor, y }) => (
                    <rect
                      key={`floor-B-${floor}`}
                      x={50}
                      y={y}
                      width={38}
                      height={5}
                      fill="transparent"
                      stroke="transparent"
                      strokeWidth="0"
                      className="cursor-pointer"
                      style={{ pointerEvents: 'auto' }}
                      onMouseEnter={() => handleFloorHover('B', floor)}
                      onMouseLeave={() => handleFloorHover(null, null)}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFloorClick('B', floor);
                      }}
                    />
                  ))}
                  </svg>
                )}
                
                {/* Apartment clickable areas when viewing floor plan */}
                {selectedFloorImage && selected.tower === 'B' && selected.floor === 2 && (
                  <div className="absolute inset-0 pointer-events-none">
                    <svg
                      className="w-full h-full"
                      viewBox="0 0 100 100"
                      preserveAspectRatio="none"
                    >
                      {/* Apartment B2 click area - positioned based on the floor plan image */}
                      <rect
                        x={10}
                        y={70}
                        width={20}
                        height={25}
                        fill="transparent"
                        stroke={hoveredApartment === 'Б-202' ? "#3b82f6" : "transparent"}
                        strokeWidth={hoveredApartment === 'Б-202' ? "2" : "0"}
                        className="cursor-pointer"
                        style={{ pointerEvents: 'auto' }}
                        onMouseEnter={() => setHoveredApartment('Б-202')}
                        onMouseLeave={() => setHoveredApartment(null)}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onApartmentSelect) {
                            const apartmentData = FLOOR_DATA[selected.tower][selected.floor].apartments.find(apt => apt.имот === 'Б-202');
                            if (apartmentData) {
                              onApartmentSelect({
                                name: 'Апартамент Б2',
                                floor: '2',
                                type: 'Двустаен',
                                totalArea: '69.12 м²',
                                status: apartmentData.статус,
                                ...apartmentData
                              });
                            }
                          }
                        }}
                      />
                    </svg>
                    
                    {/* Tooltip for hovered apartment */}
                    {hoveredApartment && (
                      <div className="absolute top-1/2 left-1/4 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-3 pointer-events-none z-10">
                        <p className="font-semibold text-gray-900">{hoveredApartment}</p>
                        <p className="text-sm text-gray-600">Кликнете за детайли</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Google Maps */}
        <div className="w-96 bg-white border-l border-gray-200 overflow-y-auto">
          
          <div className="p-4">
            {/* Google Maps Embed */}
            <div className="rounded-lg overflow-hidden shadow-lg mb-4">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2932.1849999999997!2d23.3219!3d42.6977!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDLCsDQxJzUxLjciTiAyM8KwMTknMTguOCJF!5e0!3m2!1sbg!2sbg!4v1629999999999!5m2!1sbg!2sbg"
                width="100%"
                height="350"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="KSM Stroy Location"
                className="w-full"
              />
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <svg className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-gray-900">Адрес:</p>
                  <p className="text-sm text-gray-600">София, България</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-2">
                <svg className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-gray-900">Работно време:</p>
                  <p className="text-sm text-gray-600">Пон-Пет: 9:00 - 18:00</p>
                  <p className="text-sm text-gray-600">Събота: 10:00 - 14:00</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-2">
                <svg className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-gray-900">Телефон:</p>
                  <p className="text-sm text-gray-600">+359 88 888 8888</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FourTowersFloorMap;