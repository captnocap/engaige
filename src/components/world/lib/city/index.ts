/**
 * City Rendering System
 *
 * Complete 3D city rendering system ported from the city project.
 * Provides view-only rendering with buildings, roads, and ambient traffic.
 */

// Core classes
export { City, type BuildingPlacement } from './City.js';
export { Tile } from './Tile.js';
export { Building, createBuilding } from './Building.js';
export { SimObject } from './SimObject.js';

// Asset management
export {
  CityAssetManager,
  getCityAssetManager,
  createCityAssetManager,
  modelDimensions,
} from './CityAssetManager.js';
export { default as models, getModelSize, getModelType, isPropModel, getModelsByType, getVehicleModels } from './models.js';
export type { ModelMeta } from './models.js';

// Vehicle system
export { VehicleGraph, VehicleGraphTile, VehicleGraphNode, Vehicle } from './vehicles/index.js';

// Configuration
export { default as config } from './config.js';
export type { CityConfig } from './config.js';

// Landmarks
export {
  LANDMARKS,
  getAllLandmarks,
  getLandmarkById,
  getLandmarksByDistrict,
  searchLandmarks,
  getLandmarkAtPosition,
  type LandmarkConfig,
} from './landmarks.js';
