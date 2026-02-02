/**
 * City
 *
 * Main city grid class for view-only rendering.
 * Removed building placement tools and simulation logic.
 */

import * as THREE from 'three';
import { Tile } from './Tile.js';
import { Building, createBuilding } from './Building.js';
import { VehicleGraph } from './vehicles/VehicleGraph.js';
import { getModelSize } from './models.js';

export interface BuildingPlacement {
  x: number;
  y: number;
  type: string;
  rotation?: number;
  landmarkId?: string;
  fillerSiteUrl?: string;
}

export class City extends THREE.Group {
  debugMeshes = new THREE.Group();
  root = new THREE.Group();
  size: number;
  tiles: Tile[][] = [];
  vehicleGraph: VehicleGraph;

  constructor(size: number, name = 'Corn City') {
    super();

    this.name = name;
    this.size = size;

    this.add(this.debugMeshes);
    this.add(this.root);

    // Initialize tile grid
    this.tiles = [];
    for (let x = 0; x < this.size; x++) {
      const column: Tile[] = [];
      for (let y = 0; y < this.size; y++) {
        const tile = new Tile(x, y);
        tile.refreshView(this);
        this.root.add(tile);
        column.push(tile);
      }
      this.tiles.push(column);
    }

    // Initialize vehicle graph
    this.vehicleGraph = new VehicleGraph(this.size);
    this.debugMeshes.add(this.vehicleGraph);
  }

  /**
   * Get a tile at the given coordinates
   */
  getTile(x: number, y: number): Tile | null {
    if (
      x === undefined ||
      y === undefined ||
      x < 0 ||
      y < 0 ||
      x >= this.size ||
      y >= this.size
    ) {
      return null;
    } else {
      return this.tiles[x][y];
    }
  }

  /**
   * Update vehicles (called in animation loop)
   */
  draw(): void {
    this.vehicleGraph.updateVehicles();
  }

  /**
   * Bulk load buildings from an array of placements.
   * This is the primary way to populate the city for view-only mode.
   */
  async loadBuildings(
    placements: BuildingPlacement[],
    onProgress?: (percent: number, phase: string) => void
  ): Promise<void> {
    const roads: { x: number; y: number; building: Building }[] = [];
    const totalWork = placements.length + this.size * this.size;
    let workDone = 0;

    const yieldToUI = () => new Promise((resolve) => requestAnimationFrame(resolve));

    // Phase 1: Create all buildings without refreshes
    onProgress?.(0, 'Creating buildings...');
    for (let i = 0; i < placements.length; i++) {
      const p = placements[i];
      const { width, depth } = getModelSize(p.type);

      // Check if ALL tiles in footprint are available
      let canPlace = true;
      for (let dx = 0; dx < width && canPlace; dx++) {
        for (let dy = 0; dy < depth && canPlace; dy++) {
          const tile = this.getTile(p.x + dx, p.y + dy);
          if (!tile || tile.building) {
            canPlace = false;
          }
        }
      }

      if (canPlace) {
        const building = createBuilding(p.x, p.y, p.type);
        building.width = width;
        building.depth = depth;
        building.originX = p.x;
        building.originY = p.y;
        building.rotationIndex = p.rotation ?? 0;

        // Set landmark info (also updates userData for raycasting)
        if (p.landmarkId) {
          building.setLandmarkInfo(p.landmarkId, p.fillerSiteUrl);
        } else if (p.fillerSiteUrl) {
          building.fillerSiteUrl = p.fillerSiteUrl;
          building.userData.fillerSiteUrl = p.fillerSiteUrl;
        }

        // Place building on all tiles in footprint
        for (let dx = 0; dx < width; dx++) {
          for (let dy = 0; dy < depth; dy++) {
            const tile = this.getTile(p.x + dx, p.y + dy)!;
            tile.setBuilding(building, dx === 0 && dy === 0);
          }
        }

        // Track roads for vehicle graph
        if (this.isRoad(p.type)) {
          roads.push({ x: p.x, y: p.y, building });
        }
      }
      workDone++;

      // Yield every 200 items
      if (i % 200 === 0) {
        onProgress?.((workDone / totalWork) * 100, 'Creating buildings...');
        await yieldToUI();
      }
    }

    // Phase 2: Single refresh pass for all tiles
    onProgress?.(50, 'Rendering tiles...');
    let tileCount = 0;
    for (let x = 0; x < this.size; x++) {
      for (let y = 0; y < this.size; y++) {
        this.tiles[x][y].refreshView(this);
        workDone++;
        tileCount++;

        // Yield every 100 tiles
        if (tileCount % 100 === 0) {
          onProgress?.((workDone / totalWork) * 100, 'Rendering tiles...');
          await yieldToUI();
        }
      }
    }

    // Phase 3: Build vehicle graph for all roads at once
    onProgress?.(95, 'Building roads...');
    await yieldToUI();
    for (const road of roads) {
      this.vehicleGraph.updateTile(road.x, road.y, road.building);
    }

    onProgress?.(100, 'Done!');
  }

  /**
   * Check if a model type is a road
   */
  private isRoad(modelType: string): boolean {
    return (
      modelType.includes('road') ||
      modelType.includes('mainroad') ||
      modelType.includes('sidewalk')
    );
  }

  /**
   * Get tile neighbors
   */
  getTileNeighbors(x: number, y: number): Tile[] {
    const neighbors: Tile[] = [];

    if (x > 0) {
      const tile = this.getTile(x - 1, y);
      if (tile) neighbors.push(tile);
    }
    if (x < this.size - 1) {
      const tile = this.getTile(x + 1, y);
      if (tile) neighbors.push(tile);
    }
    if (y > 0) {
      const tile = this.getTile(x, y - 1);
      if (tile) neighbors.push(tile);
    }
    if (y < this.size - 1) {
      const tile = this.getTile(x, y + 1);
      if (tile) neighbors.push(tile);
    }

    return neighbors;
  }

  /**
   * Find a tile matching a filter
   */
  findTile(
    start: { x: number; y: number },
    filter: (tile: Tile) => boolean,
    maxDistance: number
  ): Tile | null {
    const startTile = this.getTile(start.x, start.y);
    if (!startTile) return null;

    const visited = new Set<string>();
    const tilesToSearch: Tile[] = [];

    tilesToSearch.push(startTile);
    visited.add(startTile.tileId);

    let head = 0;
    while (head < tilesToSearch.length) {
      const tile = tilesToSearch[head++];

      const distance = startTile.distanceTo(tile);
      if (distance > maxDistance) continue;

      if (filter(tile)) {
        return tile;
      }

      for (const neighbor of this.getTileNeighbors(tile.x, tile.y)) {
        if (!visited.has(neighbor.tileId)) {
          visited.add(neighbor.tileId);
          tilesToSearch.push(neighbor);
        }
      }
    }

    return null;
  }

  /**
   * Get all buildings in the city
   */
  getAllBuildings(): Building[] {
    const buildings: Building[] = [];
    for (let x = 0; x < this.size; x++) {
      for (let y = 0; y < this.size; y++) {
        const tile = this.getTile(x, y);
        if (tile?.building && tile.isOriginTile) {
          buildings.push(tile.building);
        }
      }
    }
    return buildings;
  }

  /**
   * Get building at coordinates
   */
  getBuildingAt(x: number, y: number): Building | null {
    const tile = this.getTile(x, y);
    return tile?.building ?? null;
  }

  /**
   * Dispose all resources
   */
  dispose(): void {
    for (let x = 0; x < this.size; x++) {
      for (let y = 0; y < this.size; y++) {
        const tile = this.getTile(x, y);
        tile?.building?.dispose();
        tile?.dispose();
      }
    }
  }
}
