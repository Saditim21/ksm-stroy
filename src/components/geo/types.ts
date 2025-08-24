export interface PointPct {
  x: number; // 0-100 percentage
  y: number; // 0-100 percentage
}

export interface Quad {
  LT: PointPct; // Left-Top
  RT: PointPct; // Right-Top
  RB: PointPct; // Right-Bottom
  LB: PointPct; // Left-Bottom
}

export interface TowerConfig {
  id: string;
  name: string;
  quad: Quad;
  floors: number;
  yCuts: number[]; // Normalized 0-1 positions for horizontal cuts (length: floors+1)
}

export interface CutLines {
  towerId: string;
  cuts: number[]; // Y positions in normalized coordinates [0,1]
}

export interface ActiveFloor {
  towerId: string;
  floorIndex: number;
}

export interface CalibrationState {
  isActive: boolean;
  currentTower?: string;
  clickedPoints: PointPct[];
  padTop: number;
  padBottom: number;
}