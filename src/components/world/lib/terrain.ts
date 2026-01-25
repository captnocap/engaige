/**
 * Terrain Generation System
 *
 * Generates procedural terrain with:
 * - Noise-based elevation (water bodies, mountains)
 * - Road network on grid pattern
 * - Bridges over water
 * - Visual variety (grass, sidewalks, parks)
 */

import * as THREE from 'three';
import { createNoise2D, NoiseFunction2D } from 'simplex-noise';

// ============================================================================
// Types
// ============================================================================

export enum TileType {
  EMPTY = 0,
  ROAD = 1,
  RESIDENTIAL = 2,
  COMMERCIAL = 3,
  INDUSTRIAL = 4,
  PARK = 5,
  WATER = 6,
  MOUNTAIN = 7,
}

export interface TerrainTile {
  x: number;
  z: number;
  type: TileType;
  elevation: number;
  isBridge?: boolean;
  isHill?: boolean;
}

export interface TerrainConfig {
  gridSize: number;
  tileSize: number;
  seed?: number;
  waterThreshold?: number;
  mountainEdgeThreshold?: number;
  roadSpacing?: number;
}

export interface TerrainData {
  tiles: TerrainTile[][];
  roadTiles: TerrainTile[];
  waterTiles: TerrainTile[];
  mountainTiles: TerrainTile[];
  buildableTiles: TerrainTile[];
}

// ============================================================================
// Default Config
// ============================================================================

const DEFAULT_CONFIG: Required<TerrainConfig> = {
  gridSize: 34,
  tileSize: 10,
  seed: Date.now(),
  waterThreshold: -0.3,
  mountainEdgeThreshold: 0.85,
  roadSpacing: 4,
};

// ============================================================================
// Colors
// ============================================================================

export const TERRAIN_COLORS = {
  grass: 0x5a9e4d,
  water: 0x22aaff,
  mountain: 0x6b7b85,
  mountainPeak: 0xffffff,
  road: 0x555555,
  sidewalk: 0x999999,
  bridge: 0x777777,
  residential: [0xe3dac9, 0xfff0f5, 0xdcd0ff, 0xffeebb],
  commercial: [0x8fd3fe, 0xa8e6cf, 0xdcedc1, 0xb0e0e6],
  industrial: [0x8c7b75, 0x6e6e6e, 0x8a8a8a, 0x5d4037],
  park: 0x228b22,
};

// ============================================================================
// Terrain Generation
// ============================================================================

/**
 * Generate terrain data using simplex noise
 */
export function generateTerrain(config: Partial<TerrainConfig> = {}): TerrainData {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const noise2D = createNoise2D(() => cfg.seed / 1000000);

  const tiles: TerrainTile[][] = [];
  const roadTiles: TerrainTile[] = [];
  const waterTiles: TerrainTile[] = [];
  const mountainTiles: TerrainTile[] = [];
  const buildableTiles: TerrainTile[] = [];

  const centerX = cfg.gridSize / 2;
  const centerZ = cfg.gridSize / 2;
  const maxDist = cfg.gridSize / 2;

  // Initialize grid
  for (let x = 0; x < cfg.gridSize; x++) {
    tiles[x] = [];
    for (let z = 0; z < cfg.gridSize; z++) {
      tiles[x][z] = { x, z, type: TileType.EMPTY, elevation: 0 };
    }
  }

  // Pass 1: Generate base terrain (water, mountains)
  for (let x = 0; x < cfg.gridSize; x++) {
    for (let z = 0; z < cfg.gridSize; z++) {
      const dist = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(z - centerZ, 2));
      const distNorm = dist / maxDist;

      // Large scale noise for terrain features
      const nx = x / 15;
      const nz = z / 15;
      const elevation = noise2D(nx, nz);

      tiles[x][z].elevation = elevation;

      // Outer rim: force mountains at edges
      if (distNorm > cfg.mountainEdgeThreshold) {
        tiles[x][z].type = TileType.MOUNTAIN;
        mountainTiles.push(tiles[x][z]);
      } else {
        // Inner terrain based on elevation
        if (elevation < cfg.waterThreshold) {
          tiles[x][z].type = TileType.WATER;
          waterTiles.push(tiles[x][z]);
        } else if (elevation > 0.45) {
          // High inner areas become hill parks
          tiles[x][z].type = TileType.PARK;
          tiles[x][z].isHill = true;
        }
      }
    }
  }

  // Pass 2: Generate roads
  for (let x = 0; x < cfg.gridSize; x++) {
    for (let z = 0; z < cfg.gridSize; z++) {
      const tile = tiles[x][z];

      // Don't build roads on mountains or hill parks
      if (tile.type === TileType.MOUNTAIN) continue;
      if (tile.type === TileType.PARK && tile.isHill) continue;

      const isRoadX = x % cfg.roadSpacing === 0;
      const isRoadZ = z % cfg.roadSpacing === 0;

      if (isRoadX || isRoadZ) {
        if (tile.type === TileType.WATER) {
          // Bridge over water
          tile.isBridge = true;
          tile.type = TileType.ROAD;
        } else {
          tile.type = TileType.ROAD;
        }
        roadTiles.push(tile);
      }
    }
  }

  // Pass 3: Zone remaining empty tiles
  for (let x = 0; x < cfg.gridSize; x++) {
    for (let z = 0; z < cfg.gridSize; z++) {
      const tile = tiles[x][z];

      if (tile.type === TileType.EMPTY) {
        // Use different noise offset for zoning
        const n = noise2D(x / 8 + 100, z / 8 + 100);

        if (n > 0.3) {
          tile.type = TileType.COMMERCIAL;
        } else if (n > 0.0) {
          tile.type = TileType.RESIDENTIAL;
        } else if (n > -0.3) {
          tile.type = TileType.INDUSTRIAL;
        } else {
          tile.type = TileType.PARK;
        }

        buildableTiles.push(tile);
      }
    }
  }

  return { tiles, roadTiles, waterTiles, mountainTiles, buildableTiles };
}

// ============================================================================
// Mesh Creation
// ============================================================================

// Shared geometries
const tileGeometry = new THREE.BoxGeometry(1, 1, 1);
const waterGeometry = new THREE.BoxGeometry(1, 0.5, 1);
const mountainGeometry = new THREE.ConeGeometry(0.8, 1, 4);
const snowCapGeometry = new THREE.ConeGeometry(0.3, 0.33, 4);

// Shared materials
const roadMaterial = new THREE.MeshLambertMaterial({ color: TERRAIN_COLORS.road });
const sidewalkMaterial = new THREE.MeshLambertMaterial({ color: TERRAIN_COLORS.sidewalk });
const grassMaterial = new THREE.MeshLambertMaterial({ color: TERRAIN_COLORS.grass });
const waterMaterial = new THREE.MeshLambertMaterial({
  color: TERRAIN_COLORS.water,
  transparent: true,
  opacity: 0.8,
});
const bridgeMaterial = new THREE.MeshLambertMaterial({ color: TERRAIN_COLORS.bridge });
const mountainMaterial = new THREE.MeshLambertMaterial({
  color: TERRAIN_COLORS.mountain,
  flatShading: true,
});
const snowMaterial = new THREE.MeshLambertMaterial({
  color: TERRAIN_COLORS.mountainPeak,
  flatShading: true,
});
const roadMarkingMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

/**
 * Create all terrain meshes for the scene
 */
export function createTerrainMeshes(
  terrain: TerrainData,
  tileSize: number = 10
): {
  groundGroup: THREE.Group;
  waterMeshes: THREE.Mesh[];
  mountainMeshes: THREE.Group[];
} {
  const groundGroup = new THREE.Group();
  groundGroup.name = 'terrain';

  const waterMeshes: THREE.Mesh[] = [];
  const mountainMeshes: THREE.Group[] = [];

  const gridSize = terrain.tiles.length;
  const offset = gridSize / 2;

  terrain.tiles.forEach((row) => {
    row.forEach((tile) => {
      const xPos = (tile.x - offset) * tileSize;
      const zPos = (tile.z - offset) * tileSize;

      // Water tiles
      if (tile.type === TileType.WATER) {
        const water = new THREE.Mesh(waterGeometry, waterMaterial);
        water.scale.set(tileSize, 1, tileSize);
        water.position.set(xPos, -0.5, zPos);
        water.userData = {
          type: 'water',
          baseY: -0.5,
          timeOffset: Math.random() * 10,
        };
        groundGroup.add(water);
        waterMeshes.push(water);
        return;
      }

      // Mountain tiles
      if (tile.type === TileType.MOUNTAIN) {
        const height = Math.random() * 20 + 15;
        const mountainGroup = new THREE.Group();

        const mountain = new THREE.Mesh(mountainGeometry, mountainMaterial);
        mountain.scale.set(tileSize * 0.8, height, tileSize * 0.8);
        mountain.position.set(xPos, height / 2 - 2, zPos);
        mountain.rotation.y = Math.random() * Math.PI;
        mountain.castShadow = true;
        mountain.receiveShadow = true;

        // Snow cap
        const cap = new THREE.Mesh(snowCapGeometry, snowMaterial);
        cap.scale.set(tileSize * 0.3, height / 3, tileSize * 0.3);
        cap.position.set(0, height / 2 - height / 6 + 0.1, 0);
        mountain.add(cap);

        mountainGroup.add(mountain);
        mountainGroup.userData = { type: 'mountain' };
        groundGroup.add(mountainGroup);
        mountainMeshes.push(mountainGroup);
        return;
      }

      // Road tiles
      if (tile.type === TileType.ROAD) {
        if (tile.isBridge) {
          // Bridge pylon
          const pylonGeometry = new THREE.CylinderGeometry(1, 1, 10);
          const pylon = new THREE.Mesh(pylonGeometry, bridgeMaterial);
          pylon.position.set(xPos, -5, zPos);
          groundGroup.add(pylon);

          // Bridge deck
          const deck = new THREE.Mesh(tileGeometry, roadMaterial);
          deck.scale.set(tileSize, 1, tileSize);
          deck.position.set(xPos, 0.5, zPos);
          deck.receiveShadow = true;
          groundGroup.add(deck);

          // Water under bridge
          const waterUnder = new THREE.Mesh(waterGeometry, waterMaterial);
          waterUnder.scale.set(tileSize, 1, tileSize);
          waterUnder.position.set(xPos, -2, zPos);
          waterUnder.userData = {
            type: 'water',
            baseY: -2,
            timeOffset: Math.random() * 10,
          };
          groundGroup.add(waterUnder);
          waterMeshes.push(waterUnder);
        } else {
          // Regular road
          const road = new THREE.Mesh(tileGeometry, roadMaterial);
          road.scale.set(tileSize, 1, tileSize);
          road.position.set(xPos, 0, zPos);
          road.receiveShadow = true;
          groundGroup.add(road);

          // Lane marking
          const markingGeometry = new THREE.PlaneGeometry(1, tileSize * 0.6);
          const marking = new THREE.Mesh(markingGeometry, roadMarkingMaterial);
          marking.rotation.x = -Math.PI / 2;
          marking.position.set(xPos, 0.06, zPos);
          groundGroup.add(marking);
        }
        return;
      }

      // Ground tiles (park, residential, commercial, industrial)
      let material = sidewalkMaterial;
      let yOffset = 0;

      if (tile.type === TileType.PARK) {
        material = grassMaterial;
        if (tile.isHill) {
          yOffset = 2; // Elevated parks
        }
      }

      const ground = new THREE.Mesh(tileGeometry, material);
      ground.scale.set(tileSize, 1 + yOffset * 2, tileSize);
      ground.position.set(xPos, yOffset, zPos);
      ground.receiveShadow = true;
      ground.userData = {
        type: 'ground',
        tileType: tile.type,
        x: tile.x,
        z: tile.z,
      };
      groundGroup.add(ground);
    });
  });

  return { groundGroup, waterMeshes, mountainMeshes };
}

/**
 * Animate water tiles (gentle waves)
 */
export function animateWater(waterMeshes: THREE.Mesh[], time: number): void {
  waterMeshes.forEach((mesh) => {
    const baseY = mesh.userData.baseY || -0.5;
    const offset = mesh.userData.timeOffset || 0;
    mesh.position.y = baseY + Math.sin(time * 2 + offset) * 0.1;
  });
}

// ============================================================================
// Tree Generation
// ============================================================================

const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x5d4037 });
const leavesMaterial = new THREE.MeshLambertMaterial({ color: 0x2e7d32 });

/**
 * Create trees for park tiles
 */
export function createTreesForTile(
  tile: TerrainTile,
  tileSize: number = 10,
  gridOffset: number
): THREE.Group {
  const group = new THREE.Group();
  const count = Math.floor(Math.random() * 3) + 1;

  const xPos = (tile.x - gridOffset) * tileSize;
  const zPos = (tile.z - gridOffset) * tileSize;
  const yOffset = tile.isHill ? 3 : 0;

  for (let i = 0; i < count; i++) {
    const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.3, 1.5);
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.set(
      xPos + (Math.random() - 0.5) * 6,
      0.75 + yOffset,
      zPos + (Math.random() - 0.5) * 6
    );

    const leavesGeometry = new THREE.ConeGeometry(1.5, 3, 5);
    const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
    leaves.position.y = 2.25;
    trunk.add(leaves);

    trunk.castShadow = true;
    group.add(trunk);
  }

  return group;
}

/**
 * Create all trees for terrain
 */
export function createAllTrees(terrain: TerrainData, tileSize: number = 10): THREE.Group {
  const treesGroup = new THREE.Group();
  treesGroup.name = 'trees';

  const gridOffset = terrain.tiles.length / 2;

  terrain.tiles.forEach((row) => {
    row.forEach((tile) => {
      if (tile.type === TileType.PARK) {
        const trees = createTreesForTile(tile, tileSize, gridOffset);
        treesGroup.add(trees);
      }
    });
  });

  return treesGroup;
}

// ============================================================================
// Street Lights
// ============================================================================

export interface StreetLight {
  group: THREE.Group;
  bulbMaterial: THREE.MeshBasicMaterial;
  pointLight: THREE.PointLight;
}

/**
 * Create street lights at road intersections
 */
export function createStreetLights(
  terrain: TerrainData,
  tileSize: number = 10
): StreetLight[] {
  const lights: StreetLight[] = [];
  const gridOffset = terrain.tiles.length / 2;
  const roadSpacing = 4; // Default road spacing

  terrain.roadTiles.forEach((tile) => {
    // Only at intersections
    if (tile.x % roadSpacing !== 0 || tile.z % roadSpacing !== 0) return;
    if (tile.isBridge) return;

    const xPos = (tile.x - gridOffset) * tileSize;
    const zPos = (tile.z - gridOffset) * tileSize;

    const group = new THREE.Group();

    // Pole
    const poleGeometry = new THREE.CylinderGeometry(0.2, 0.2, 6);
    const poleMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
    const pole = new THREE.Mesh(poleGeometry, poleMaterial);
    pole.position.y = 3;

    // Bulb
    const bulbGeometry = new THREE.SphereGeometry(0.8);
    const bulbMaterial = new THREE.MeshBasicMaterial({ color: 0x888888 });
    const bulb = new THREE.Mesh(bulbGeometry, bulbMaterial);
    bulb.position.y = 6;

    // Point light (off by default)
    const pointLight = new THREE.PointLight(0xffaa00, 0, 25);
    pointLight.position.set(0, 5, 0);

    group.add(pole, bulb, pointLight);
    group.position.set(xPos + 4, 0, zPos + 4);

    lights.push({ group, bulbMaterial, pointLight });
  });

  return lights;
}

/**
 * Update street lights based on time of day
 */
export function updateStreetLights(lights: StreetLight[], isNight: boolean): void {
  lights.forEach((light) => {
    if (isNight) {
      light.bulbMaterial.color.setHex(0xffffaa);
      light.pointLight.intensity = 1.5;
    } else {
      light.bulbMaterial.color.setHex(0x888888);
      light.pointLight.intensity = 0;
    }
  });
}
