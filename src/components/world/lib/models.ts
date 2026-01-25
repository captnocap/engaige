/**
 * GLB Model Loading System
 *
 * Loads and manages 3D models for the world map.
 * Models are loaded once and cloned for each instance.
 */

import * as THREE from 'three';
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';

// ============================================================================
// Types
// ============================================================================

export interface ModelDefinition {
  path: string;
  scale: number;
  yOffset: number;  // Vertical offset to sit on ground properly
}

export interface LoadedModel {
  scene: THREE.Group;
  definition: ModelDefinition;
}

export type ModelCategory = 'residential' | 'commercial' | 'industrial' | 'vehicle' | 'tree';

// ============================================================================
// Model Registry
// ============================================================================

/**
 * Model definitions organized by category
 * Scale and yOffset may need tuning based on actual model dimensions
 */
export const MODEL_REGISTRY: Record<ModelCategory, ModelDefinition[]> = {
  residential: [
    { path: '/models/Apartment building.glb', scale: 0.5, yOffset: 0 },
    { path: '/models/City Building with Roof Garden.glb', scale: 0.4, yOffset: 0 },
    { path: '/models/Building.glb', scale: 0.5, yOffset: 0 },
  ],
  commercial: [
    { path: '/models/Large Building.glb', scale: 0.5, yOffset: 0 },
    { path: '/models/Large Building(1).glb', scale: 0.5, yOffset: 0 },
    { path: '/models/Large Building(2).glb', scale: 0.5, yOffset: 0 },
    { path: '/models/Big Building.glb', scale: 0.5, yOffset: 0 },
    { path: '/models/Skyscraper.glb', scale: 0.5, yOffset: 0 },
  ],
  industrial: [
    { path: '/models/Building.glb', scale: 0.6, yOffset: 0 },
    { path: '/models/Large Building(2).glb', scale: 0.4, yOffset: 0 },
  ],
  vehicle: [
    { path: '/models/Car.glb', scale: 0.3, yOffset: 0 },
    { path: '/models/Red Car.glb', scale: 0.3, yOffset: 0 },
    { path: '/models/Police Car.glb', scale: 0.3, yOffset: 0 },
    { path: '/models/Toyota Hilux 97.glb', scale: 0.3, yOffset: 0 },
  ],
  tree: [
    { path: '/models/Tree Assets.glb', scale: 0.5, yOffset: 0 },
  ],
};

// ============================================================================
// Model Loader Class
// ============================================================================

export class ModelLoader {
  private loader: GLTFLoader;
  private loadedModels: Map<string, LoadedModel> = new Map();
  private loadingPromises: Map<string, Promise<LoadedModel>> = new Map();

  constructor() {
    this.loader = new GLTFLoader();
  }

  /**
   * Load a single model by path
   */
  async loadModel(definition: ModelDefinition): Promise<LoadedModel> {
    // Return cached model if already loaded
    if (this.loadedModels.has(definition.path)) {
      return this.loadedModels.get(definition.path)!;
    }

    // Return existing loading promise if in progress
    if (this.loadingPromises.has(definition.path)) {
      return this.loadingPromises.get(definition.path)!;
    }

    // Start loading
    const loadPromise = new Promise<LoadedModel>((resolve, reject) => {
      this.loader.load(
        definition.path,
        (gltf: GLTF) => {
          const model: LoadedModel = {
            scene: gltf.scene,
            definition,
          };

          // Apply default scale
          model.scene.scale.setScalar(definition.scale);

          // Enable shadows on all meshes
          model.scene.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });

          this.loadedModels.set(definition.path, model);
          this.loadingPromises.delete(definition.path);

          console.log(`[ModelLoader] Loaded: ${definition.path}`);
          resolve(model);
        },
        undefined, // Progress callback
        (error) => {
          console.error(`[ModelLoader] Failed to load: ${definition.path}`, error);
          this.loadingPromises.delete(definition.path);
          reject(error);
        }
      );
    });

    this.loadingPromises.set(definition.path, loadPromise);
    return loadPromise;
  }

  /**
   * Load all models for a category
   */
  async loadCategory(category: ModelCategory): Promise<LoadedModel[]> {
    const definitions = MODEL_REGISTRY[category];
    const promises = definitions.map((def) => this.loadModel(def));
    return Promise.all(promises);
  }

  /**
   * Load all models in the registry
   */
  async loadAll(): Promise<void> {
    const categories = Object.keys(MODEL_REGISTRY) as ModelCategory[];
    const promises = categories.map((cat) => this.loadCategory(cat));
    await Promise.all(promises);
    console.log(`[ModelLoader] All models loaded: ${this.loadedModels.size} total`);
  }

  /**
   * Get a random model from a category and clone it for placement
   */
  getRandomModel(category: ModelCategory): THREE.Group | null {
    const definitions = MODEL_REGISTRY[category];
    if (definitions.length === 0) return null;

    // Pick random definition
    const def = definitions[Math.floor(Math.random() * definitions.length)];
    const loaded = this.loadedModels.get(def.path);

    if (!loaded) {
      console.warn(`[ModelLoader] Model not loaded yet: ${def.path}`);
      return null;
    }

    // Clone the model
    const clone = loaded.scene.clone();
    clone.userData = {
      modelPath: def.path,
      category,
    };

    return clone;
  }

  /**
   * Create a model instance at a specific position
   */
  createInstance(
    category: ModelCategory,
    position: THREE.Vector3,
    rotation: number = 0
  ): THREE.Group | null {
    const model = this.getRandomModel(category);
    if (!model) return null;

    model.position.copy(position);
    model.rotation.y = rotation;

    return model;
  }

  /**
   * Check if all models in a category are loaded
   */
  isCategoryLoaded(category: ModelCategory): boolean {
    const definitions = MODEL_REGISTRY[category];
    return definitions.every((def) => this.loadedModels.has(def.path));
  }

  /**
   * Get loading progress (0-1)
   */
  getLoadingProgress(): number {
    const totalModels = Object.values(MODEL_REGISTRY).flat().length;
    return this.loadedModels.size / totalModels;
  }

  /**
   * Dispose of all loaded models
   */
  dispose(): void {
    this.loadedModels.forEach((model) => {
      model.scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry?.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => m.dispose());
          } else {
            child.material?.dispose();
          }
        }
      });
    });
    this.loadedModels.clear();
    this.loadingPromises.clear();
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

export const modelLoader = new ModelLoader();
