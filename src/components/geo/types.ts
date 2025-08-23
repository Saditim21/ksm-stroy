export interface PointPct {
  x: number; // percent 0-100
  y: number; // percent 0-100
}

export interface Quad {
  LT: PointPct; // left-top
  RT: PointPct; // right-top
  RB: PointPct; // right-bottom
  LB: PointPct; // left-bottom
}

export interface Band {
  y0: number; // normalized 0-1
  y1: number; // normalized 0-1
}

export interface TowerConfig {
  id: string;
  nameBG: string;
  quad: Quad;
  floors: number;
  yCuts: number[]; // normalized 0-1, length = floors+1
  padTop?: number;
  padBottom?: number;
}

export interface FloorPolygon {
  towerId: string;
  floorIndex: number;
  points: PointPct[];
}

export interface ConfigData {
  towers: TowerConfig[];
  polygons?: FloorPolygon[];
}

export interface HoverState {
  tower: string | null;
  floor: number | null;
}

export interface SelectedState {
  tower: string | null;
  floor: number | null;
}

export interface FloorData {
  property: string;
  type: string;
  builtArea: string;
  totalArea: string;
  exposure: string;
  status: 'available' | 'sold' | 'reserved';
}