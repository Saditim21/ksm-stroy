/**
 * Pure function to generate floor band polygons from facade quadrilateral
 * Uses linear interpolation along left and right edges
 */

import { Point, lerp, applySlabPadding, applyFloorAdjustment } from './polygonUtils';

export interface FacadeQuad {
  LT: Point; // Left-Top corner
  RT: Point; // Right-Top corner
  RB: Point; // Right-Bottom corner
  LB: Point; // Left-Bottom corner
}

export interface FacadeBandsConfig {
  facade: FacadeQuad;
  floors: number;
  padTopPct: number;
  padBottomPct: number;
  perFloorAdjust?: number[]; // Optional per-floor adjustments
}

/**
 * Generate floor band polygons from facade quadrilateral
 * 
 * Algorithm:
 * 1. For each floor i of n total floors
 * 2. Calculate t0 = i/n (top of band) and t1 = (i+1)/n (bottom of band)
 * 3. Interpolate along left edge: L(t) = LT*(1-t) + LB*t
 * 4. Interpolate along right edge: R(t) = RT*(1-t) + RB*t
 * 5. Create polygon from [L(t0), R(t0), R(t1), L(t1)]
 * 6. Apply slab padding to avoid overlaps
 * 
 * @param config Configuration object with facade corners and parameters
 * @returns Array of polygon point arrays, one per floor
 */
export function generateFacadeBands(config: FacadeBandsConfig): Point[][] {
  const { facade, floors, padTopPct, padBottomPct, perFloorAdjust = [] } = config;
  const { LT, RT, RB, LB } = facade;
  
  const polygons: Point[][] = [];
  
  for (let i = 0; i < floors; i++) {
    // Calculate vertical position ratios
    const t0 = i / floors;       // Top of this band
    const t1 = (i + 1) / floors; // Bottom of this band
    
    // Interpolate along left and right edges
    const leftTop = lerp(LT, LB, t0);
    const leftBottom = lerp(LT, LB, t1);
    const rightTop = lerp(RT, RB, t0);
    const rightBottom = lerp(RT, RB, t1);
    
    // Create polygon in clockwise order
    let polygon: Point[] = [
      leftTop,
      rightTop,
      rightBottom,
      leftBottom,
    ];
    
    // Apply slab padding to create gaps between floors
    if (padTopPct > 0 || padBottomPct > 0) {
      // Shift top edge up and bottom edge down
      polygon = polygon.map((point, idx) => {
        if (idx < 2) {
          // Top points (indices 0, 1) - move up
          return { x: point.x, y: point.y - padTopPct };
        } else {
          // Bottom points (indices 2, 3) - move down
          return { x: point.x, y: point.y + padBottomPct };
        }
      });
    }
    
    // Apply per-floor adjustment if specified
    if (perFloorAdjust[i] !== undefined && perFloorAdjust[i] !== 0) {
      polygon = applyFloorAdjustment(polygon, perFloorAdjust[i]);
    }
    
    polygons.push(polygon);
  }
  
  return polygons;
}

/**
 * React hook wrapper for generateFacadeBands
 * Memoizes the result based on configuration
 */
import { useMemo } from 'react';

export function useFacadeBands(config: FacadeBandsConfig): Point[][] {
  return useMemo(() => {
    return generateFacadeBands(config);
  }, [
    config.facade.LT.x,
    config.facade.LT.y,
    config.facade.RT.x,
    config.facade.RT.y,
    config.facade.RB.x,
    config.facade.RB.y,
    config.facade.LB.x,
    config.facade.LB.y,
    config.floors,
    config.padTopPct,
    config.padBottomPct,
    config.perFloorAdjust?.join(','),
  ]);
}

/**
 * Default facade configuration for testing
 * These percentages map to a typical building perspective
 */
export const DEFAULT_FACADE: FacadeQuad = {
  LT: { x: 32, y: 9 },      // Left-Top corner
  RT: { x: 84, y: 28.5 },   // Right-Top corner (perspective)
  RB: { x: 79.5, y: 81 },   // Right-Bottom corner
  LB: { x: 28, y: 61 },     // Left-Bottom corner
};

/**
 * Calculate facade corners from image click coordinates
 * @param clicks Array of 4 click points in order: LT, RT, RB, LB
 * @returns FacadeQuad object
 */
export function clicksToFacade(clicks: Point[]): FacadeQuad | null {
  if (clicks.length !== 4) return null;
  
  return {
    LT: clicks[0],
    RT: clicks[1],
    RB: clicks[2],
    LB: clicks[3],
  };
}

/**
 * Export configuration to JSON
 */
export function exportConfig(
  config: FacadeBandsConfig,
  polygons: Point[][]
): string {
  return JSON.stringify({
    facade: config.facade,
    floors: config.floors,
    padTopPct: config.padTopPct,
    padBottomPct: config.padBottomPct,
    perFloorAdjust: config.perFloorAdjust,
    polygons: polygons,
  }, null, 2);
}

/**
 * Import configuration from JSON
 */
export function importConfig(json: string): {
  config: FacadeBandsConfig;
  polygons: Point[][];
} {
  const data = JSON.parse(json);
  return {
    config: {
      facade: data.facade,
      floors: data.floors,
      padTopPct: data.padTopPct,
      padBottomPct: data.padBottomPct,
      perFloorAdjust: data.perFloorAdjust,
    },
    polygons: data.polygons,
  };
}