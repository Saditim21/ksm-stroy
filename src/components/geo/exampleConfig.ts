import { TowerConfig } from './types';

// Import the image here and export it as IMG for the component to use:
export { default as IMG } from '../../assets/продажби/project 1/sgrada1.jpg';

// Four towers (left → right). Tweak via calibration for pixel-perfect.
export const TOWERS: TowerConfig[] = [
  {
    id: 'A',
    nameBG: 'Блок A',
    quad: { // Leftmost tower
      LT: { x: 12.0, y: 22.0 },
      RT: { x: 24.0, y: 22.0 },
      RB: { x: 24.0, y: 78.5 },
      LB: { x: 12.0, y: 78.5 }
    },
    floors: 9, // adjust in calibration
    yCuts: [0, 1/9, 2/9, 3/9, 4/9, 5/9, 6/9, 7/9, 8/9, 1], // equal to start
    padTop: 0.003,
    padBottom: 0.003,
  },
  {
    id: 'B',
    nameBG: 'Блок B',
    quad: { // Left-center tower
      LT: { x: 29.5, y: 22.0 },
      RT: { x: 41.5, y: 22.0 },
      RB: { x: 41.5, y: 78.5 },
      LB: { x: 29.5, y: 78.5 }
    },
    floors: 9,
    yCuts: [0, 1/9, 2/9, 3/9, 4/9, 5/9, 6/9, 7/9, 8/9, 1],
    padTop: 0.003,
    padBottom: 0.003,
  },
  {
    id: 'C',
    nameBG: 'Блок C',
    quad: { // Right-center tower
      LT: { x: 58.5, y: 22.0 },
      RT: { x: 70.5, y: 22.0 },
      RB: { x: 70.5, y: 78.5 },
      LB: { x: 58.5, y: 78.5 }
    },
    floors: 9,
    yCuts: [0, 1/9, 2/9, 3/9, 4/9, 5/9, 6/9, 7/9, 8/9, 1],
    padTop: 0.003,
    padBottom: 0.003,
  },
  {
    id: 'D',
    nameBG: 'Блок D',
    quad: { // Rightmost tower
      LT: { x: 76.0, y: 22.0 },
      RT: { x: 88.0, y: 22.0 },
      RB: { x: 88.0, y: 78.5 },
      LB: { x: 76.0, y: 78.5 }
    },
    floors: 9,
    yCuts: [0, 1/9, 2/9, 3/9, 4/9, 5/9, 6/9, 7/9, 8/9, 1],
    padTop: 0.003,
    padBottom: 0.003,
  },
];

// Mock floor data for details panel
export const FLOOR_DATA: Record<string, Record<number, any>> = {
  'A': {
    8: { property: 'А-901', type: '3-стаен', builtArea: '78 м²', totalArea: '95 м²', exposure: 'Юг/Изток', status: 'available' },
    7: { property: 'А-801', type: '2-стаен', builtArea: '62 м²', totalArea: '75 м²', exposure: 'Запад', status: 'sold' },
    6: { property: 'А-701', type: '3-стаен', builtArea: '78 м²', totalArea: '95 м²', exposure: 'Юг/Изток', status: 'available' },
    5: { property: 'А-601', type: '2-стаен', builtArea: '62 м²', totalArea: '75 м²', exposure: 'Запад', status: 'reserved' },
    4: { property: 'А-501', type: '3-стаен', builtArea: '78 м²', totalArea: '95 м²', exposure: 'Юг/Изток', status: 'available' },
    3: { property: 'А-401', type: '2-стаен', builtArea: '62 м²', totalArea: '75 м²', exposure: 'Запад', status: 'available' },
    2: { property: 'А-301', type: '3-стаен', builtArea: '78 м²', totalArea: '95 м²', exposure: 'Юг/Изток', status: 'sold' },
    1: { property: 'А-201', type: '2-стаен', builtArea: '62 м²', totalArea: '75 м²', exposure: 'Запад', status: 'available' },
    0: { property: 'Гараж А', type: 'Паркомясто', builtArea: '15 м²', totalArea: '15 м²', exposure: '-', status: 'available' },
  },
  'B': {
    8: { property: 'Б-901', type: '4-стаен', builtArea: '98 м²', totalArea: '115 м²', exposure: 'Юг/Запад', status: 'available' },
    7: { property: 'Б-801', type: '3-стаен', builtArea: '78 м²', totalArea: '95 м²', exposure: 'Изток', status: 'available' },
    6: { property: 'Б-701', type: '4-стаен', builtArea: '98 м²', totalArea: '115 м²', exposure: 'Юг/Запад', status: 'sold' },
    5: { property: 'Б-601', type: '3-стаен', builtArea: '78 м²', totalArea: '95 м²', exposure: 'Изток', status: 'available' },
    4: { property: 'Б-501', type: '4-стаен', builtArea: '98 м²', totalArea: '115 м²', exposure: 'Юг/Запад', status: 'reserved' },
    3: { property: 'Б-401', type: '3-стаен', builtArea: '78 м²', totalArea: '95 м²', exposure: 'Изток', status: 'available' },
    2: { property: 'Б-301', type: '4-стаен', builtArea: '98 м²', totalArea: '115 м²', exposure: 'Юг/Запад', status: 'available' },
    1: { property: 'Б-201', type: '3-стаен', builtArea: '78 м²', totalArea: '95 м²', exposure: 'Изток', status: 'sold' },
    0: { property: 'Гараж Б', type: 'Паркомясто', builtArea: '15 м²', totalArea: '15 м²', exposure: '-', status: 'available' },
  },
  'C': {
    8: { property: 'В-901', type: '2-стаен', builtArea: '62 м²', totalArea: '75 м²', exposure: 'Север/Изток', status: 'available' },
    7: { property: 'В-801', type: '3-стаен', builtArea: '78 м²', totalArea: '95 м²', exposure: 'Юг', status: 'sold' },
    6: { property: 'В-701', type: '2-стаен', builtArea: '62 м²', totalArea: '75 м²', exposure: 'Север/Изток', status: 'available' },
    5: { property: 'В-601', type: '3-стаен', builtArea: '78 м²', totalArea: '95 м²', exposure: 'Юг', status: 'available' },
    4: { property: 'В-501', type: '2-стаен', builtArea: '62 м²', totalArea: '75 м²', exposure: 'Север/Изток', status: 'reserved' },
    3: { property: 'В-401', type: '3-стаен', builtArea: '78 м²', totalArea: '95 м²', exposure: 'Юг', status: 'available' },
    2: { property: 'В-301', type: '2-стаен', builtArea: '62 м²', totalArea: '75 м²', exposure: 'Север/Изток', status: 'available' },
    1: { property: 'В-201', type: '3-стаен', builtArea: '78 м²', totalArea: '95 м²', exposure: 'Юг', status: 'available' },
    0: { property: 'Гараж В', type: 'Паркомясто', builtArea: '15 м²', totalArea: '15 м²', exposure: '-', status: 'sold' },
  },
  'D': {
    8: { property: 'Г-901', type: '4-стаен', builtArea: '98 м²', totalArea: '115 м²', exposure: 'Запад/Юг', status: 'available' },
    7: { property: 'Г-801', type: '2-стаен', builtArea: '62 м²', totalArea: '75 м²', exposure: 'Север', status: 'available' },
    6: { property: 'Г-701', type: '4-стаен', builtArea: '98 м²', totalArea: '115 м²', exposure: 'Запад/Юг', status: 'sold' },
    5: { property: 'Г-601', type: '2-стаен', builtArea: '62 м²', totalArea: '75 м²', exposure: 'Север', status: 'available' },
    4: { property: 'Г-501', type: '4-стаен', builtArea: '98 м²', totalArea: '115 м²', exposure: 'Запад/Юг', status: 'available' },
    3: { property: 'Г-401', type: '2-стаен', builtArea: '62 м²', totalArea: '75 м²', exposure: 'Север', status: 'reserved' },
    2: { property: 'Г-301', type: '4-стаен', builtArea: '98 м²', totalArea: '115 м²', exposure: 'Запад/Юг', status: 'available' },
    1: { property: 'Г-201', type: '2-стаен', builtArea: '62 м²', totalArea: '75 м²', exposure: 'Север', status: 'available' },
    0: { property: 'Гараж Г', type: 'Паркомясто', builtArea: '15 м²', totalArea: '15 м²', exposure: '-', status: 'available' },
  },
};