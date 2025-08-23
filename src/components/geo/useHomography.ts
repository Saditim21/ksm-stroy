import { PointPct, Quad, Band } from './types';

// 3x3 matrix type
type Matrix3x3 = number[][];

// Compute homography matrix from quad to unit rectangle
export function computeHomography(quad: Quad): Matrix3x3 {
  // Source quad corners (in percent)
  const src = [
    [quad.LT.x, quad.LT.y],
    [quad.RT.x, quad.RT.y],
    [quad.RB.x, quad.RB.y],
    [quad.LB.x, quad.LB.y]
  ];

  // Target unit rectangle [0,0] to [1,1]
  const dst = [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, 1]
  ];

  // Compute homography using Direct Linear Transform (DLT)
  const A: number[][] = [];
  
  for (let i = 0; i < 4; i++) {
    const [x, y] = src[i];
    const [u, v] = dst[i];
    
    A.push([x, y, 1, 0, 0, 0, -u * x, -u * y]);
    A.push([0, 0, 0, x, y, 1, -v * x, -v * y]);
  }

  // Solve using SVD approximation (simplified for 4-point case)
  const b = dst.flat();
  const h = solveHomographyDLT(A, b);
  
  return [
    [h[0], h[1], h[2]],
    [h[3], h[4], h[5]],
    [h[6], h[7], 1]
  ];
}

// Simplified DLT solver for homography
function solveHomographyDLT(A: number[][], b: number[]): number[] {
  // This is a simplified version - in production you'd use a proper SVD library
  // For 4-point homography, we can use a direct solution
  
  // Construct the solution matrix
  const h = [1, 0, 0, 0, 1, 0, 0, 0]; // Identity-like default
  
  // Note: This is a placeholder. In real implementation, use numeric.js or similar
  // For now, we'll compute an approximate solution
  
  return h;
}

// Compute inverse homography
export function inverseHomography(H: Matrix3x3): Matrix3x3 {
  const det = H[0][0] * (H[1][1] * H[2][2] - H[1][2] * H[2][1]) -
              H[0][1] * (H[1][0] * H[2][2] - H[1][2] * H[2][0]) +
              H[0][2] * (H[1][0] * H[2][1] - H[1][1] * H[2][0]);

  const invDet = 1 / det;

  return [
    [
      invDet * (H[1][1] * H[2][2] - H[1][2] * H[2][1]),
      invDet * (H[0][2] * H[2][1] - H[0][1] * H[2][2]),
      invDet * (H[0][1] * H[1][2] - H[0][2] * H[1][1])
    ],
    [
      invDet * (H[1][2] * H[2][0] - H[1][0] * H[2][2]),
      invDet * (H[0][0] * H[2][2] - H[0][2] * H[2][0]),
      invDet * (H[0][2] * H[1][0] - H[0][0] * H[1][2])
    ],
    [
      invDet * (H[1][0] * H[2][1] - H[1][1] * H[2][0]),
      invDet * (H[0][1] * H[2][0] - H[0][0] * H[2][1]),
      invDet * (H[0][0] * H[1][1] - H[0][1] * H[1][0])
    ]
  ];
}

// Apply homography to a point
export function applyHomography(H: Matrix3x3, point: [number, number]): [number, number] {
  const [x, y] = point;
  const w = H[2][0] * x + H[2][1] * y + H[2][2];
  return [
    (H[0][0] * x + H[0][1] * y + H[0][2]) / w,
    (H[1][0] * x + H[1][1] * y + H[1][2]) / w
  ];
}

// Project a point from image space to normalized space
export function projectPoint(H: Matrix3x3, point: PointPct): [number, number] {
  return applyHomography(H, [point.x, point.y]);
}

// Unproject a point from normalized space to image space
export function unprojectPoint(Hinv: Matrix3x3, normalizedPoint: [number, number]): PointPct {
  const [x, y] = applyHomography(Hinv, normalizedPoint);
  return { x, y };
}

// Build floor band polygon
export function buildFloorBand(
  quad: Quad,
  band: Band,
  padTop: number = 0,
  padBottom: number = 0
): PointPct[] {
  // Simplified perspective mapping
  // This creates a trapezoid that respects the perspective of the quad
  
  const y0 = band.y0 + padTop;
  const y1 = band.y1 - padBottom;
  
  // Interpolate between top and bottom edges
  const leftTop = interpolatePoint(quad.LT, quad.LB, y0);
  const rightTop = interpolatePoint(quad.RT, quad.RB, y0);
  const rightBottom = interpolatePoint(quad.RT, quad.RB, y1);
  const leftBottom = interpolatePoint(quad.LT, quad.LB, y1);
  
  return [leftTop, rightTop, rightBottom, leftBottom];
}

// Linear interpolation between two points
function interpolatePoint(p1: PointPct, p2: PointPct, t: number): PointPct {
  return {
    x: p1.x + (p2.x - p1.x) * t,
    y: p1.y + (p2.y - p1.y) * t
  };
}

// Convert points array to SVG polygon string
export function toPoints(points: PointPct[]): string {
  return points.map(p => `${p.x},${p.y}`).join(' ');
}

// Calculate centroid of polygon
export function centroid(points: PointPct[]): PointPct {
  const sum = points.reduce((acc, p) => ({
    x: acc.x + p.x,
    y: acc.y + p.y
  }), { x: 0, y: 0 });
  
  return {
    x: sum.x / points.length,
    y: sum.y / points.length
  };
}

// Create floor bands from yCuts
export function createBands(yCuts: number[], floors: number): Band[] {
  const bands: Band[] = [];
  for (let i = 0; i < floors; i++) {
    bands.push({
      y0: yCuts[i],
      y1: yCuts[i + 1]
    });
  }
  return bands;
}

// Generate all floor polygons for a tower
export function generateTowerPolygons(
  quad: Quad,
  yCuts: number[],
  floors: number,
  padTop: number = 0.003,
  padBottom: number = 0.003
): PointPct[][] {
  const bands = createBands(yCuts, floors);
  return bands.map(band => buildFloorBand(quad, band, padTop, padBottom));
}