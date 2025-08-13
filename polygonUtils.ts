/**
 * Polygon utility functions for vector math and geometric operations
 * Used for computing floor bands from facade quadrilateral
 */

export type Point = { x: number; y: number };

/**
 * Linear interpolation between two points
 * @param p1 Start point
 * @param p2 End point
 * @param t Interpolation factor [0,1]
 */
export const lerp = (p1: Point, p2: Point, t: number): Point => ({
  x: p1.x * (1 - t) + p2.x * t,
  y: p1.y * (1 - t) + p2.y * t,
});

/**
 * Add two vectors
 */
export const addVectors = (p1: Point, p2: Point): Point => ({
  x: p1.x + p2.x,
  y: p1.y + p2.y,
});

/**
 * Subtract two vectors
 */
export const subVectors = (p1: Point, p2: Point): Point => ({
  x: p1.x - p2.x,
  y: p1.y - p2.y,
});

/**
 * Scale a vector by a scalar
 */
export const scaleVector = (p: Point, scale: number): Point => ({
  x: p.x * scale,
  y: p.y * scale,
});

/**
 * Get the normal vector (perpendicular) to an edge
 * Rotates 90 degrees counter-clockwise and normalizes
 */
export const getEdgeNormal = (p1: Point, p2: Point): Point => {
  const edge = subVectors(p2, p1);
  const length = Math.sqrt(edge.x * edge.x + edge.y * edge.y);
  if (length === 0) return { x: 0, y: 0 };
  
  // Rotate 90 degrees CCW: (x,y) -> (-y,x)
  return {
    x: -edge.y / length,
    y: edge.x / length,
  };
};

/**
 * Apply padding along edge normal direction
 * Used to create small gaps between floor bands
 * @param point Point to offset
 * @param normal Normal vector (should be normalized)
 * @param offset Distance to offset (positive = outward)
 */
export const applyNormalOffset = (
  point: Point,
  normal: Point,
  offset: number
): Point => {
  return addVectors(point, scaleVector(normal, offset));
};

/**
 * Apply slab padding to polygon points
 * Shifts top edge up and bottom edge down by specified percentages
 * @param polygon Array of 4 points [LT, RT, RB, LB]
 * @param topPadPct Top padding as percentage of viewport
 * @param bottomPadPct Bottom padding as percentage of viewport
 */
export const applySlabPadding = (
  polygon: Point[],
  topPadPct: number,
  bottomPadPct: number
): Point[] => {
  if (polygon.length !== 4) return polygon;
  
  const [lt, rt, rb, lb] = polygon;
  
  // Calculate edge normals
  const topNormal = getEdgeNormal(lt, rt);
  const bottomNormal = getEdgeNormal(lb, rb);
  
  // Apply padding
  return [
    applyNormalOffset(lt, topNormal, -topPadPct),
    applyNormalOffset(rt, topNormal, -topPadPct),
    applyNormalOffset(rb, bottomNormal, bottomPadPct),
    applyNormalOffset(lb, bottomNormal, bottomPadPct),
  ];
};

/**
 * Convert percentage coordinates to pixel coordinates
 * @param point Point in percentage space (0-100)
 * @param containerWidth Container width in pixels
 * @param containerHeight Container height in pixels
 */
export const percentToPixel = (
  point: Point,
  containerWidth: number,
  containerHeight: number
): Point => ({
  x: (point.x / 100) * containerWidth,
  y: (point.y / 100) * containerHeight,
});

/**
 * Convert pixel coordinates to percentage coordinates
 * @param point Point in pixel space
 * @param containerWidth Container width in pixels
 * @param containerHeight Container height in pixels
 */
export const pixelToPercent = (
  point: Point,
  containerWidth: number,
  containerHeight: number
): Point => ({
  x: (point.x / containerWidth) * 100,
  y: (point.y / containerHeight) * 100,
});

/**
 * Format polygon points for SVG
 * @param points Array of points
 * @returns Space-separated string of x,y coordinates
 */
export const pointsToSvgString = (points: Point[]): string => {
  return points.map(p => `${p.x},${p.y}`).join(' ');
};

/**
 * Calculate distance between two points
 */
export const distance = (p1: Point, p2: Point): number => {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
};

/**
 * Check if a point is within a certain distance of another point
 * Useful for handle dragging detection
 */
export const isPointNear = (
  p1: Point,
  p2: Point,
  threshold: number
): boolean => {
  return distance(p1, p2) <= threshold;
};

/**
 * Clamp a value between min and max
 */
export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

/**
 * Apply per-floor adjustments to polygon y-coordinates
 * @param polygon Floor polygon points
 * @param adjustPct Adjustment percentage (positive = expand, negative = shrink)
 */
export const applyFloorAdjustment = (
  polygon: Point[],
  adjustPct: number
): Point[] => {
  if (adjustPct === 0) return polygon;
  
  return polygon.map((point, i) => {
    // Adjust top points (indices 0,1) upward and bottom points (2,3) downward
    const isTop = i < 2;
    const adjustment = isTop ? -adjustPct : adjustPct;
    return {
      x: point.x,
      y: point.y + adjustment,
    };
  });
};