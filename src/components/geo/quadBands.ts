import { PointPct, Quad } from './types';

/**
 * Linear interpolation between two points
 */
function lerp(p1: PointPct, p2: PointPct, t: number): PointPct {
  return {
    x: p1.x + (p2.x - p1.x) * t,
    y: p1.y + (p2.y - p1.y) * t
  };
}

/**
 * Compute perspective-correct floor polygons from a facade quadrilateral
 * @param quad - The facade quad in percentage coordinates (LT, RT, RB, LB)
 * @param floors - Number of floors (excluding ground/garage)
 * @param padTop - Top padding as fraction (0-1) within each band
 * @param padBottom - Bottom padding as fraction (0-1) within each band
 * @param yCuts - Optional custom Y positions (0-1) for horizontal cuts. If not provided, uses equal spacing
 * @returns Array of floor polygons (each polygon is 4 points in percentage coords)
 */
export function computeBands(
  quad: Quad,
  floors: number,
  padTop: number = 0.002,
  padBottom: number = 0.002,
  yCuts?: number[]
): PointPct[][] {
  const { LT, RT, RB, LB } = quad;
  
  // Generate cut positions if not provided
  const cuts = yCuts || generateEqualCuts(floors + 1);
  
  const bands: PointPct[][] = [];
  
  // For each floor band
  for (let i = 0; i < cuts.length - 1; i++) {
    const y0 = cuts[i];
    const y1 = cuts[i + 1];
    
    // Apply padding
    const y0Padded = y0 + (y1 - y0) * padTop;
    const y1Padded = y1 - (y1 - y0) * padBottom;
    
    // Interpolate points along left and right edges
    const leftTop = lerp(LT, LB, y0Padded);
    const rightTop = lerp(RT, RB, y0Padded);
    const rightBottom = lerp(RT, RB, y1Padded);
    const leftBottom = lerp(LT, LB, y1Padded);
    
    // Create polygon (clockwise from top-left)
    bands.push([leftTop, rightTop, rightBottom, leftBottom]);
  }
  
  return bands;
}

/**
 * Generate equal spacing cuts (0 to 1)
 */
export function generateEqualCuts(count: number): number[] {
  const cuts: number[] = [];
  for (let i = 0; i <= count; i++) {
    cuts.push(i / count);
  }
  return cuts;
}

/**
 * Convert normalized cuts (0-1) to percentage Y positions based on quad bounds
 */
export function normalizedToPercentY(cuts: number[], quad: Quad): number[] {
  const minY = Math.min(quad.LT.y, quad.RT.y);
  const maxY = Math.max(quad.LB.y, quad.RB.y);
  const range = maxY - minY;
  
  return cuts.map(t => minY + t * range);
}