/**
 * VehicleGraph
 *
 * Manages the road network for vehicle pathfinding and spawns ambient traffic.
 */

import * as THREE from 'three';
import { VehicleGraphTile } from './VehicleGraphTile.js';
import { Vehicle } from './Vehicle.js';
import config from '../config.js';
import type { Building } from '../Building.js';

export class VehicleGraph extends THREE.Group {
  size: number;
  tiles: (VehicleGraphTile | null)[][] = [];
  vehicles = new THREE.Group();
  private spawnIntervalId: ReturnType<typeof setInterval> | null = null;

  constructor(size: number) {
    super();

    this.size = size;
    this.add(this.vehicles);

    // Initialize empty tile grid
    for (let x = 0; x < this.size; x++) {
      const column: (VehicleGraphTile | null)[] = [];
      for (let y = 0; y < this.size; y++) {
        column.push(null);
      }
      this.tiles.push(column);
    }
  }

  /**
   * Start spawning vehicles
   */
  startSpawning(): void {
    if (this.spawnIntervalId) return;
    this.spawnIntervalId = setInterval(
      this.spawnVehicle.bind(this),
      config.vehicle.spawnInterval
    );
  }

  /**
   * Stop spawning vehicles
   */
  stopSpawning(): void {
    if (this.spawnIntervalId) {
      clearInterval(this.spawnIntervalId);
      this.spawnIntervalId = null;
    }
  }

  /**
   * Update all vehicles (called in animation loop)
   */
  updateVehicles(): void {
    for (const vehicle of this.vehicles.children as Vehicle[]) {
      vehicle.simulate();
    }
  }

  /**
   * Update a tile in the vehicle graph when a road is placed
   */
  updateTile(x: number, y: number, road: Building | null): void {
    const existingTile = this.getTile(x, y);
    const leftTile = this.getTile(x - 1, y);
    const rightTile = this.getTile(x + 1, y);
    const topTile = this.getTile(x, y - 1);
    const bottomTile = this.getTile(x, y + 1);

    // Disconnect existing connections
    existingTile?.disconnectAll();
    leftTile?.getWorldRightSide()?.out?.disconnectAll();
    rightTile?.getWorldLeftSide()?.out?.disconnectAll();
    topTile?.getWorldBottomSide()?.out?.disconnectAll();
    bottomTile?.getWorldTopSide()?.out?.disconnectAll();

    if (road) {
      // Determine road style from model type
      const style = this.getStyleFromModelType(road.modelType);
      const rotation = (road.rotation * Math.PI) / 2;

      const tile = VehicleGraphTile.create(x, y, rotation, style);

      if (tile) {
        // Connect to adjacent tiles
        if (leftTile) {
          tile.getWorldLeftSide().out?.connect(leftTile.getWorldRightSide().in);
          leftTile.getWorldRightSide().out?.connect(tile.getWorldLeftSide().in);
        }
        if (rightTile) {
          tile.getWorldRightSide().out?.connect(rightTile.getWorldLeftSide().in);
          rightTile.getWorldLeftSide().out?.connect(tile.getWorldRightSide().in);
        }
        if (topTile) {
          tile.getWorldTopSide().out?.connect(topTile.getWorldBottomSide().in);
          topTile.getWorldBottomSide().out?.connect(tile.getWorldTopSide().in);
        }
        if (bottomTile) {
          tile.getWorldBottomSide().out?.connect(bottomTile.getWorldTopSide().in);
          bottomTile.getWorldTopSide().out?.connect(tile.getWorldBottomSide().in);
        }

        this.tiles[x][y] = tile;
        this.add(tile);
      }
    } else {
      // Remove existing tile
      if (existingTile) {
        this.remove(existingTile);
      }
      this.tiles[x][y] = null;
    }
  }

  /**
   * Get road style from model type name
   */
  private getStyleFromModelType(modelType: string): string {
    if (modelType.includes('four-way') || modelType.includes('intersection')) {
      return 'four-way';
    } else if (modelType.includes('three-way') || modelType.includes('intersection-t')) {
      return 'three-way';
    } else if (modelType.includes('corner') || modelType.includes('curve')) {
      return 'corner';
    } else if (modelType.includes('end')) {
      return 'end';
    } else {
      return 'straight';
    }
  }

  /**
   * Get a tile at the given coordinates
   */
  getTile(x: number, y: number): VehicleGraphTile | null {
    if (x >= 0 && x < this.size && y >= 0 && y < this.size) {
      return this.tiles[x][y];
    } else {
      return null;
    }
  }

  /**
   * Spawn a new vehicle at a random road tile
   */
  spawnVehicle(): void {
    const startingTile = this.getStartingTile();

    if (startingTile != null) {
      const origin = startingTile.getRandomNode();
      const destination = origin?.getRandomNextNode();

      if (origin && destination) {
        const vehicle = new Vehicle(origin, destination);
        this.vehicles.add(vehicle);
      }
    }
  }

  /**
   * Get a random tile that has road connections
   */
  getStartingTile(): VehicleGraphTile | null {
    const tiles: VehicleGraphTile[] = [];
    for (let x = 0; x < this.size; x++) {
      for (let y = 0; y < this.size; y++) {
        const tile = this.getTile(x, y);
        if (tile) tiles.push(tile);
      }
    }

    if (tiles.length === 0) {
      return null;
    } else {
      const i = Math.floor(tiles.length * Math.random());
      return tiles[i];
    }
  }

  /**
   * Get count of road tiles
   */
  getRoadCount(): number {
    let count = 0;
    for (let x = 0; x < this.size; x++) {
      for (let y = 0; y < this.size; y++) {
        if (this.tiles[x][y]) count++;
      }
    }
    return count;
  }

  /**
   * Get count of active vehicles
   */
  getVehicleCount(): number {
    return this.vehicles.children.length;
  }

  /**
   * Dispose all resources
   */
  dispose(): void {
    this.stopSpawning();

    // Dispose vehicles
    for (const vehicle of this.vehicles.children as Vehicle[]) {
      vehicle.dispose();
    }
    this.vehicles.clear();

    // Clear tiles
    for (let x = 0; x < this.size; x++) {
      for (let y = 0; y < this.size; y++) {
        const tile = this.tiles[x][y];
        if (tile) {
          tile.disconnectAll();
          this.remove(tile);
        }
        this.tiles[x][y] = null;
      }
    }
  }
}
