/**
 * CityGenerator
 *
 * Simple city layout for 16x16 grid.
 * - Fixed road network (main cross + side streets)
 * - Landmarks at predefined positions
 * - Filler buildings for atmosphere
 */

import { LANDMARKS } from './landmarks.js';

export interface BuildingPlacement {
  x: number;
  y: number;
  type: string;
  rotation?: number;
  landmarkId?: string;
  fillerSiteUrl?: string;
}

// Filler building types by zone
const RESIDENTIAL_FILLERS = [
  'residential-A1', 'residential-B1', 'residential-C1',
  'residential-A2', 'residential-B2', 'residential-C2',
];

const COMMERCIAL_FILLERS = [
  'commercial-A1', 'commercial-B1', 'commercial-C1',
  'commercial-A2', 'commercial-B2',
];

/**
 * Generate city layout for 16x16 grid
 */
export function generateCity(size: number, seed?: number): BuildingPlacement[] {
  const random = seed !== undefined ? seededRandom(seed) : Math.random;
  const placements: BuildingPlacement[] = [];
  const occupied = new Set<string>();

  const key = (x: number, y: number) => `${x},${y}`;
  const inBounds = (x: number, y: number) => x >= 0 && x < size && y >= 0 && y < size;

  // =============================================
  // Step 1: Place all landmarks first
  // =============================================
  for (const landmark of LANDMARKS) {
    const { x, y } = landmark.position;
    if (!inBounds(x, y)) continue;

    occupied.add(key(x, y));
    placements.push({
      x,
      y,
      type: landmark.model,
      rotation: landmark.rotation ?? 0,
      landmarkId: landmark.id,
      fillerSiteUrl: landmark.fillerSiteUrl,
    });
  }

  // =============================================
  // Step 2: Create road network
  // Simple cross pattern for 16x16:
  // - Main Street (horizontal): y = 8, x = 0 to 15
  // - Cross Street (vertical): x = 8, y = 0 to 15
  // - Side street: y = 4, x = 2 to 13
  // - Side street: y = 12, x = 2 to 13
  // =============================================
  const roads = new Set<string>();

  const addRoad = (x: number, y: number) => {
    if (!inBounds(x, y)) return;
    const k = key(x, y);
    if (occupied.has(k)) return; // Don't overwrite landmarks
    roads.add(k);
    occupied.add(k);
  };

  // Main Street (horizontal through center)
  for (let x = 0; x < size; x++) {
    addRoad(x, 8);
  }

  // Cross Street (vertical through center)
  for (let y = 0; y < size; y++) {
    addRoad(8, y);
  }

  // North side street
  for (let x = 2; x < 14; x++) {
    addRoad(x, 4);
  }

  // South side street
  for (let x = 2; x < 14; x++) {
    addRoad(x, 12);
  }

  // West connector
  for (let y = 4; y <= 12; y++) {
    addRoad(2, y);
  }

  // East connector
  for (let y = 4; y <= 12; y++) {
    addRoad(13, y);
  }

  // =============================================
  // Step 3: Create road placements with correct types
  // =============================================
  for (const roadKey of roads) {
    const [x, y] = roadKey.split(',').map(Number);

    const hasNorth = roads.has(key(x, y - 1));
    const hasSouth = roads.has(key(x, y + 1));
    const hasEast = roads.has(key(x + 1, y));
    const hasWest = roads.has(key(x - 1, y));

    const connections = [hasNorth, hasSouth, hasEast, hasWest].filter(Boolean).length;

    let roadType = 'road-straight';
    let rotation = 0;

    if (connections === 4) {
      roadType = 'road-four-way';
    } else if (connections === 3) {
      roadType = 'road-three-way';
      if (!hasNorth) rotation = 2;
      else if (!hasSouth) rotation = 0;
      else if (!hasEast) rotation = 1;
      else rotation = 3;
    } else if (connections === 2) {
      if ((hasNorth && hasSouth) || (hasEast && hasWest)) {
        roadType = 'road-straight';
        rotation = hasNorth ? 0 : 1;
      } else {
        roadType = 'road-corner';
        if (hasNorth && hasEast) rotation = 0;
        else if (hasEast && hasSouth) rotation = 1;
        else if (hasSouth && hasWest) rotation = 2;
        else rotation = 3;
      }
    } else if (connections === 1) {
      roadType = 'road-end';
      if (hasNorth) rotation = 0;
      else if (hasEast) rotation = 1;
      else if (hasSouth) rotation = 2;
      else rotation = 3;
    }

    placements.push({ x, y, type: roadType, rotation });
  }

  // =============================================
  // Step 4: Fill empty spaces with buildings
  // Buildings must be adjacent to roads and face them
  // =============================================
  const getRotationFacingRoad = (bx: number, by: number): number => {
    // Check each direction for a road, return rotation to face it
    if (roads.has(key(bx, by + 1))) return 0;  // Road south, face +Z
    if (roads.has(key(bx + 1, by))) return 1;  // Road east, face +X
    if (roads.has(key(bx, by - 1))) return 2;  // Road north, face -Z
    if (roads.has(key(bx - 1, by))) return 3;  // Road west, face -X
    return 0;
  };

  const isAdjacentToRoad = (x: number, y: number): boolean => {
    return (
      roads.has(key(x, y + 1)) ||
      roads.has(key(x + 1, y)) ||
      roads.has(key(x, y - 1)) ||
      roads.has(key(x - 1, y))
    );
  };

  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      const k = key(x, y);
      if (occupied.has(k)) continue;
      if (!isAdjacentToRoad(x, y)) continue;

      // 20% chance to leave as empty (park/grass)
      if (random() < 0.2) continue;

      // Pick building type based on location
      const isNearCenter = Math.abs(x - 8) < 4 && Math.abs(y - 8) < 4;
      const buildingTypes = isNearCenter ? COMMERCIAL_FILLERS : RESIDENTIAL_FILLERS;
      const buildingType = buildingTypes[Math.floor(random() * buildingTypes.length)];

      const rotation = getRotationFacingRoad(x, y);

      occupied.add(k);
      placements.push({ x, y, type: buildingType, rotation });
    }
  }

  return placements;
}

/**
 * Simple seeded random number generator (mulberry32)
 */
function seededRandom(seed: number): () => number {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
