/**
 * Building
 *
 * Simplified building class for view-only city rendering.
 * Removed simulation modules and development logic.
 */

import * as THREE from 'three';
import { SimObject } from './SimObject.js';
import { getCityAssetManager } from './CityAssetManager.js';

export class Building extends SimObject {
  // Building type identifier
  modelType: string;

  // Size info
  width = 1;
  depth = 1;
  originX = 0;
  originY = 0;

  // Whether terrain should be hidden under this building
  hideTerrain = true;

  // Rotation in 90-degree increments (0-3)
  rotation = 0;

  // Optional link to landmark/lore
  landmarkId?: string;
  fillerSiteUrl?: string;

  constructor(x: number, y: number, modelType: string) {
    super(x, y);
    this.modelType = modelType;
    this.name = `Building-${modelType}-${x}-${y}`;
  }

  refreshView(): void {
    const assetManager = getCityAssetManager();
    if (!assetManager) return;

    const mesh = assetManager.getModel(this.modelType, this);
    if (mesh) {
      // Apply rotation
      mesh.rotation.y = (this.rotation * Math.PI) / 2;
      this.setMesh(mesh);
    }
  }

  toHTML(): string {
    return `
      <div class="info-heading">Building</div>
      <span class="info-label">Type </span>
      <span class="info-value">${this.modelType}</span>
      <br>
      <span class="info-label">Position </span>
      <span class="info-value">X: ${this.x}, Y: ${this.y}</span>
      <br>
      <span class="info-label">Size </span>
      <span class="info-value">${this.width}x${this.depth}</span>
      <br>
    `;
  }
}

/**
 * Create a building from a model type
 */
export function createBuilding(x: number, y: number, modelType: string): Building {
  return new Building(x, y, modelType);
}
