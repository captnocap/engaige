/**
 * Isometric Coordinate Utilities
 *
 * Converts between grid coordinates and screen (isometric) coordinates.
 */

// ============================================================================
// Constants
// ============================================================================

// Isometric tile dimensions (2:1 ratio)
export const TILE_WIDTH = 64;
export const TILE_HEIGHT = 32;

// ============================================================================
// Coordinate Conversion
// ============================================================================

/**
 * Convert grid coordinates to isometric screen coordinates
 */
export function gridToIso(gridX: number, gridY: number): { x: number; y: number } {
  return {
    x: (gridX - gridY) * (TILE_WIDTH / 2),
    y: (gridX + gridY) * (TILE_HEIGHT / 2),
  };
}

/**
 * Convert isometric screen coordinates to grid coordinates
 */
export function isoToGrid(isoX: number, isoY: number): { x: number; y: number } {
  return {
    x: Math.floor((isoX / (TILE_WIDTH / 2) + isoY / (TILE_HEIGHT / 2)) / 2),
    y: Math.floor((isoY / (TILE_HEIGHT / 2) - isoX / (TILE_WIDTH / 2)) / 2),
  };
}

/**
 * Convert grid coordinates to screen coordinates with camera offset and zoom
 */
export function gridToScreen(
  gridX: number,
  gridY: number,
  camera: { x: number; y: number; zoom: number },
  screenWidth: number,
  screenHeight: number
): { x: number; y: number } {
  const iso = gridToIso(gridX, gridY);

  // Apply camera transform
  const centerX = screenWidth / 2;
  const centerY = screenHeight / 2;

  // Camera position is the grid coordinate at center of screen
  const cameraIso = gridToIso(camera.x, camera.y);

  return {
    x: centerX + (iso.x - cameraIso.x) * camera.zoom,
    y: centerY + (iso.y - cameraIso.y) * camera.zoom,
  };
}

/**
 * Convert screen coordinates to grid coordinates with camera offset and zoom
 */
export function screenToGrid(
  screenX: number,
  screenY: number,
  camera: { x: number; y: number; zoom: number },
  screenWidth: number,
  screenHeight: number
): { x: number; y: number } {
  const centerX = screenWidth / 2;
  const centerY = screenHeight / 2;

  const cameraIso = gridToIso(camera.x, camera.y);

  // Reverse the camera transform
  const isoX = (screenX - centerX) / camera.zoom + cameraIso.x;
  const isoY = (screenY - centerY) / camera.zoom + cameraIso.y;

  return isoToGrid(isoX, isoY);
}

// ============================================================================
// Visibility & Culling
// ============================================================================

/**
 * Check if a grid position is visible on screen
 */
export function isGridPositionVisible(
  gridX: number,
  gridY: number,
  camera: { x: number; y: number; zoom: number },
  screenWidth: number,
  screenHeight: number,
  margin: number = 100
): boolean {
  const screen = gridToScreen(gridX, gridY, camera, screenWidth, screenHeight);

  return (
    screen.x >= -margin &&
    screen.x <= screenWidth + margin &&
    screen.y >= -margin &&
    screen.y <= screenHeight + margin
  );
}

/**
 * Get the visible grid bounds for the current camera view
 */
export function getVisibleGridBounds(
  camera: { x: number; y: number; zoom: number },
  screenWidth: number,
  screenHeight: number,
  margin: number = 2
): { minX: number; maxX: number; minY: number; maxY: number } {
  // Sample the four corners of the screen
  const topLeft = screenToGrid(0, 0, camera, screenWidth, screenHeight);
  const topRight = screenToGrid(screenWidth, 0, camera, screenWidth, screenHeight);
  const bottomLeft = screenToGrid(0, screenHeight, camera, screenWidth, screenHeight);
  const bottomRight = screenToGrid(screenWidth, screenHeight, camera, screenWidth, screenHeight);

  return {
    minX: Math.floor(Math.min(topLeft.x, topRight.x, bottomLeft.x, bottomRight.x)) - margin,
    maxX: Math.ceil(Math.max(topLeft.x, topRight.x, bottomLeft.x, bottomRight.x)) + margin,
    minY: Math.floor(Math.min(topLeft.y, topRight.y, bottomLeft.y, bottomRight.y)) - margin,
    maxY: Math.ceil(Math.max(topLeft.y, topRight.y, bottomLeft.y, bottomRight.y)) + margin,
  };
}

// ============================================================================
// Z-Ordering
// ============================================================================

/**
 * Calculate z-order for proper isometric depth sorting
 * Higher values are rendered on top (in front)
 */
export function calculateZOrder(gridX: number, gridY: number, zOffset: number = 0): number {
  // Objects further down and to the right should be rendered on top
  return gridX + gridY + zOffset;
}

// ============================================================================
// Distance & Movement
// ============================================================================

/**
 * Calculate Manhattan distance between two grid positions
 */
export function gridDistance(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  return Math.abs(x2 - x1) + Math.abs(y2 - y1);
}

/**
 * Calculate Euclidean distance between two grid positions
 */
export function gridEuclideanDistance(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

/**
 * Interpolate between two grid positions
 */
export function lerpGridPosition(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  t: number
): { x: number; y: number } {
  return {
    x: x1 + (x2 - x1) * t,
    y: y1 + (y2 - y1) * t,
  };
}
