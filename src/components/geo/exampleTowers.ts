import { TowerConfig } from './types';

/**
 * Generate equal spacing cuts for floors
 */
function generateEqualCuts(floors: number): number[] {
  const cuts: number[] = [];
  for (let i = 0; i <= floors; i++) {
    cuts.push(i / floors);
  }
  return cuts;
}

/**
 * Default tower configurations for sgrada1.jpg
 * Four towers from left to right: Блок A, B, C, D
 * Rough estimates - will be refined via calibration
 */
export const EXAMPLE_TOWERS: TowerConfig[] = [
  {
    id: 'A',
    name: 'Блок A',
    quad: {
      LT: { x: 12, y: 22 },
      RT: { x: 24, y: 22 },
      RB: { x: 24, y: 78.5 },
      LB: { x: 12, y: 78.5 }
    },
    floors: 9,
    yCuts: generateEqualCuts(9)
  },
  {
    id: 'B', 
    name: 'Блок B',
    quad: {
      LT: { x: 29.5, y: 22 },
      RT: { x: 41.5, y: 22 },
      RB: { x: 41.5, y: 78.5 },
      LB: { x: 29.5, y: 78.5 }
    },
    floors: 9,
    yCuts: generateEqualCuts(9)
  },
  {
    id: 'C',
    name: 'Блок C', 
    quad: {
      LT: { x: 58.5, y: 22 },
      RT: { x: 70.5, y: 22 },
      RB: { x: 70.5, y: 78.5 },
      LB: { x: 58.5, y: 78.5 }
    },
    floors: 9,
    yCuts: generateEqualCuts(9)
  },
  {
    id: 'D',
    name: 'Блок D',
    quad: {
      LT: { x: 76, y: 22 },
      RT: { x: 88, y: 22 },
      RB: { x: 88, y: 78.5 },
      LB: { x: 76, y: 78.5 }
    },
    floors: 9,
    yCuts: generateEqualCuts(9)
  }
];

export const DEFAULT_FLOORS = 9;
export const DEFAULT_PAD_TOP = 0.002;
export const DEFAULT_PAD_BOTTOM = 0.002;