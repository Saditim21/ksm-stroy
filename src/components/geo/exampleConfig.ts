import { TowerConfig } from './types';

export const TOWERS: TowerConfig[] = [
  {
    id: 'A',
    nameBG: 'Блок A',
    quad: {
      LT: { x: 12, y: 22 },
      RT: { x: 24, y: 22 },
      RB: { x: 24, y: 78.5 },
      LB: { x: 12, y: 78.5 }
    },
    floors: 9
  },
  {
    id: 'B',
    nameBG: 'Блок B',
    quad: {
      LT: { x: 29.5, y: 22 },
      RT: { x: 41.5, y: 22 },
      RB: { x: 41.5, y: 78.5 },
      LB: { x: 29.5, y: 78.5 }
    },
    floors: 9
  },
  {
    id: 'C',
    nameBG: 'Блок C',
    quad: {
      LT: { x: 58.5, y: 22 },
      RT: { x: 70.5, y: 22 },
      RB: { x: 70.5, y: 78.5 },
      LB: { x: 58.5, y: 78.5 }
    },
    floors: 9
  },
  {
    id: 'D',
    nameBG: 'Блок D',
    quad: {
      LT: { x: 76, y: 22 },
      RT: { x: 88, y: 22 },
      RB: { x: 88, y: 78.5 },
      LB: { x: 76, y: 78.5 }
    },
    floors: 9
  }
];

export const padTop = 0.002;
export const padBottom = 0.002;