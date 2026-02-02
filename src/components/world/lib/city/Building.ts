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
  // Default false - only roads set this to true (road GLBs include their own ground)
  hideTerrain = false;

  // Rotation in 90-degree increments (0-3)
  rotation = 0;

  // Optional link to landmark/lore
  landmarkId?: string;
  fillerSiteUrl?: string;

  constructor(x: number, y: number, modelType: string) {
    // DON'T pass x,y to super - Building is a child of Tile which handles positioning
    // Passing x,y would double the position (Three.js child positions are additive)
    super();
    this.modelType = modelType;
    this.name = `Building-${modelType}-${x}-${y}`;
    // Store coordinates for reference (not positioning)
    this.originX = x;
    this.originY = y;
  }

  refreshView(): void {
    const assetManager = getCityAssetManager();
    if (!assetManager) {
      console.warn('[Building] Asset manager not ready');
      return;
    }

    const mesh = assetManager.getModel(this.modelType, this);
    // Apply rotation
    mesh.rotation.y = (this.rotation * Math.PI) / 2;
    this.setMesh(mesh);
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
 * Check if a model type is a road/terrain that includes its own ground
 */
function isRoadOrTerrain(modelType: string): boolean {
  return (
    modelType.includes('road') ||
    modelType.includes('mainroad') ||
    modelType.includes('sidewalk') ||
    modelType.startsWith('tile-')
  );
}

/**
 * Create a building from a model type
 */
export function createBuilding(x: number, y: number, modelType: string): Building {
  const building = new Building(x, y, modelType);

  // Roads and terrain tiles include their own ground, so hide the grass terrain
  if (isRoadOrTerrain(modelType)) {
    building.hideTerrain = true;
  }

  return building;
}
