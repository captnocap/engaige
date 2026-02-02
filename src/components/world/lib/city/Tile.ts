/**
 * Tile
 *
 * Individual grid tile in the city.
 * Simplified for view-only rendering - no building placement.
 */

import { SimObject } from './SimObject.js';
import { Building } from './Building.js';
import { getCityAssetManager } from './CityAssetManager.js';
import type { City } from './City.js';

export class Tile extends SimObject {
  terrain = 'grass';
  #building: Building | null = null;

  constructor(x: number, y: number) {
    super(x, y);
    this.name = `Tile-${this.x}-${this.y}`;
  }

  get building(): Building | null {
    return this.#building;
  }

  get tileId(): string {
    return `${this.x}-${this.y}`;
  }

  /**
   * Set or clear the building on this tile
   */
  setBuilding(value: Building | null, isOrigin = true): void {
    // Only dispose if we're the origin tile (we own the mesh)
    if (this.#building && this.isOriginTile) {
      this.#building.dispose();
      this.remove(this.#building);
    } else if (this.#building) {
      // Just remove reference, don't dispose
      this.remove(this.#building);
    }

    this.#building = value;
    this.isOriginTile = isOrigin;

    // Only the origin tile adds the building mesh
    if (value && isOrigin) {
      this.add(this.#building!);
    }
  }

  // Whether this tile is the origin (owns the mesh) for a multi-tile building
  isOriginTile = true;

  /**
   * Refresh the visual representation
   */
  refreshView(_city: City): void {
    // Only the origin tile refreshes the building view
    if (this.isOriginTile) {
      this.building?.refreshView();
    }

    const assetManager = getCityAssetManager();
    if (!assetManager) {
      console.warn('[Tile] Asset manager not ready');
      return;
    }

    // Hide terrain if building covers this tile (roads include their own ground)
    if (this.building?.hideTerrain) {
      this.setMesh(null);
    } else {
      // Always render terrain (grass by default)
      const mesh = assetManager.getModel(this.terrain, this);
      mesh.name = this.terrain;
      this.setMesh(mesh);
    }
  }

  distanceTo(tile: Tile): number {
    return Math.abs(this.x - tile.x) + Math.abs(this.y - tile.y);
  }

  toHTML(): string {
    let html = `
      <div class="info-heading">Tile</div>
      <span class="info-label">Coordinates </span>
      <span class="info-value">X: ${this.x}, Y: ${this.y}</span>
      <br>
      <span class="info-label">Terrain </span>
      <span class="info-value">${this.terrain}</span>
      <br>
    `;

    if (this.building) {
      html += this.building.toHTML();
    }

    return html;
  }
}
