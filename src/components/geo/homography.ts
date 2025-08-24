import { PointPct, Quad } from './types';

/**
 * Compute homography matrix from quad to unit rectangle
 * Maps quad corners to (0,0), (1,0), (1,1), (0,1)
 */
export function computeHomography(quad: Quad): number[][] {
  const { LT, RT, RB, LB } = quad;
  
  // Source points (quad corners in percentage)
  const src = [
    [LT.x / 100, LT.y / 100],
    [RT.x / 100, RT.y / 100], 
    [RB.x / 100, RB.y / 100],
    [LB.x / 100, LB.y / 100]
  ];
  
  // Destination points (unit rectangle)
  const dst = [
    [0, 0], [1, 0], [1, 1], [0, 1]
  ];
  
  // Set up linear system Ah = b for homography coefficients
  const A: number[][] = [];
  const b: number[] = [];
  
  for (let i = 0; i < 4; i++) {
    const [sx, sy] = src[i];
    const [dx, dy] = dst[i];
    
    // First equation: sx*h0 + sy*h1 + h2 - dx*sx*h6 - dx*sy*h7 = dx
    A.push([sx, sy, 1, 0, 0, 0, -dx * sx, -dx * sy]);
    b.push(dx);
    
    // Second equation: sx*h3 + sy*h4 + h5 - dy*sx*h6 - dy*sy*h7 = dy  
    A.push([0, 0, 0, sx, sy, 1, -dy * sx, -dy * sy]);
    b.push(dy);
  }
  
  // Solve linear system
  const h = solveLinearSystem(A, b);
  
  // Reshape into 3x3 matrix
  return [
    [h[0], h[1], h[2]],
    [h[3], h[4], h[5]],
    [h[6], h[7], 1]
  ];
}

/**
 * Invert homography matrix using adjugate method
 */
export function invertHomography(H: number[][]): number[][] {
  const [[a, b, c], [d, e, f], [g, h, i]] = H;
  
  const det = a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);
  const invDet = 1 / det;
  
  return [
    [invDet * (e * i - f * h), invDet * (c * h - b * i), invDet * (b * f - c * e)],
    [invDet * (f * g - d * i), invDet * (a * i - c * g), invDet * (c * d - a * f)],
    [invDet * (d * h - e * g), invDet * (b * g - a * h), invDet * (a * e - b * d)]
  ];
}

/**
 * Project point using homography matrix
 */
export function project(point: PointPct, H: number[][]): PointPct {
  const x = point.x / 100; // Convert to 0-1 range
  const y = point.y / 100;
  
  const w = H[2][0] * x + H[2][1] * y + H[2][2];
  const projX = (H[0][0] * x + H[0][1] * y + H[0][2]) / w;
  const projY = (H[1][0] * x + H[1][1] * y + H[1][2]) / w;
  
  return {
    x: projX * 100, // Convert back to percentage
    y: projY * 100
  };
}

/**
 * Unproject point using inverse homography
 */
export function unproject(point: PointPct, Hinv: number[][]): PointPct {
  return project(point, Hinv);
}

/**
 * Convert rectified band to image-space polygon
 * @param quad - Tower facade quadrilateral
 * @param y0 - Top Y position in normalized coordinates (0-1)
 * @param y1 - Bottom Y position in normalized coordinates (0-1)
 * @param padTop - Padding at top of band (0-1)
 * @param padBottom - Padding at bottom of band (0-1)
 */
export function bandToPolygon(
  quad: Quad, 
  y0: number, 
  y1: number,
  padTop: number = 0.002,
  padBottom: number = 0.002
): PointPct[] {
  const H = computeHomography(quad);
  const Hinv = invertHomography(H);
  
  // Apply padding in rectified space
  const bandHeight = y1 - y0;
  const y0Padded = y0 + bandHeight * padTop;
  const y1Padded = y1 - bandHeight * padBottom;
  
  // Rectified band corners (in 0-1 space)
  const rectPoints = [
    { x: 0, y: y0Padded * 100 },   // Top-left
    { x: 100, y: y0Padded * 100 }, // Top-right  
    { x: 100, y: y1Padded * 100 }, // Bottom-right
    { x: 0, y: y1Padded * 100 }    // Bottom-left
  ];
  
  // Map back to image space
  return rectPoints.map(p => unproject(p, Hinv));
}

/**
 * Solve linear system Ax = b using Gaussian elimination
 */
function solveLinearSystem(A: number[][], b: number[]): number[] {
  const n = A.length;
  const augmented = A.map((row, i) => [...row, b[i]]);
  
  // Forward elimination
  for (let i = 0; i < n; i++) {
    // Find pivot
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
        maxRow = k;
      }
    }
    [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];
    
    // Eliminate column
    for (let k = i + 1; k < n; k++) {
      const factor = augmented[k][i] / augmented[i][i];
      for (let j = i; j <= n; j++) {
        augmented[k][j] -= factor * augmented[i][j];
      }
    }
  }
  
  // Back substitution
  const x = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    x[i] = augmented[i][n];
    for (let j = i + 1; j < n; j++) {
      x[i] -= augmented[i][j] * x[j];
    }
    x[i] /= augmented[i][i];
  }
  
  return x;
}