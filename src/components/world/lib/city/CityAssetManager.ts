/**
 * CityAssetManager
 *
 * Loads and manages all 3D models for the city rendering system.
 * Ported from city project with updated paths for engaige.
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import models, { type ModelMeta } from './models.js';
import type { SimObject } from './SimObject.js';

// Base URL for city assets
const BASE_URL = '/models/city/';
const TEXTURE_URL = '/textures/city/';

// Debug: Store raw model dimensions for analysis
export const modelDimensions: Record<string, { width: number; height: number; depth: number }> = {};

let assetManagerInstance: CityAssetManager | null = null;

export function getCityAssetManager(): CityAssetManager | null {
  return assetManagerInstance;
}

export class CityAssetManager {
  textureLoader = new THREE.TextureLoader();
  modelLoader = new GLTFLoader();

  textures: Record<string, THREE.Texture> = {};
  models: Record<string, THREE.Object3D> = {};

  modelCount: number;
  loadedModelCount = 0;
  onLoad: () => void;
  onProgress?: (loaded: number, total: number) => void;

  constructor(onLoad: () => void, onProgress?: (loaded: number, total: number) => void) {
    assetManagerInstance = this;
    this.onLoad = onLoad;
    this.onProgress = onProgress;
    this.modelCount = Object.keys(models).length;
  }

  /**
   * Load all textures
   */
  loadTextures(): void {
    this.textures = {
      base: this.#loadTexture(`${TEXTURE_URL}base.png`),
      specular: this.#loadTexture(`${TEXTURE_URL}specular.png`),
      grid: this.#loadTexture(`${TEXTURE_URL}grid.png`),
    };
  }

  /**
   * Start loading all models
   */
  loadAllModels(): void {
    this.loadTextures();

    for (const [name, meta] of Object.entries(models)) {
      this.#loadModel(name, meta);
    }
  }

  /**
   * Load models asynchronously with promise
   */
  async loadAllModelsAsync(): Promise<void> {
    this.loadTextures();

    const loadPromises: Promise<void>[] = [];

    for (const [name, meta] of Object.entries(models)) {
      loadPromises.push(this.#loadModelAsync(name, meta));
    }

    await Promise.all(loadPromises);
    this.onLoad();
  }

  /**
   * Get a cloned model instance for a SimObject
   */
  getModel(name: string, simObject: SimObject, transparent = false): THREE.Object3D | null {
    const model = this.models[name];
    if (!model) {
      console.warn(`[CityAssetManager] Model ${name} not found`);
      return null;
    }

    const mesh = model.clone();

    mesh.traverse((obj) => {
      obj.userData = simObject;
      const meshObj = obj as THREE.Mesh;
      if (meshObj.material) {
        meshObj.material = (meshObj.material as THREE.Material).clone();
        (meshObj.material as THREE.Material).transparent = transparent;
      }
    });

    return mesh;
  }

  /**
   * Check if a model is loaded
   */
  hasModel(name: string): boolean {
    return name in this.models;
  }

  /**
   * Get loading progress
   */
  getProgress(): { loaded: number; total: number; percent: number } {
    return {
      loaded: this.loadedModelCount,
      total: this.modelCount,
      percent: Math.round((this.loadedModelCount / this.modelCount) * 100),
    };
  }

  #loadTexture(url: string, flipY = false): THREE.Texture {
    const texture = this.textureLoader.load(url);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.flipY = flipY;
    return texture;
  }

  #loadModel(
    name: string,
    { filename, scale = 1, rotation = 0, receiveShadow = true, castShadow = true, width = 1, depth = 1 }: ModelMeta
  ): void {
    this.modelLoader.load(
      `${BASE_URL}${filename}`,
      (glb) => {
        this.#processLoadedModel(name, glb, scale, rotation, receiveShadow, castShadow, width, depth);
      },
      undefined,
      (error) => {
        console.error(`[CityAssetManager] Error loading model ${name}:`, error);
        this.loadedModelCount++;
        this.onProgress?.(this.loadedModelCount, this.modelCount);
        if (this.loadedModelCount === this.modelCount) {
          this.onLoad();
        }
      }
    );
  }

  async #loadModelAsync(
    name: string,
    { filename, scale = 1, rotation = 0, receiveShadow = true, castShadow = true, width = 1, depth = 1 }: ModelMeta
  ): Promise<void> {
    try {
      const glb = await this.modelLoader.loadAsync(`${BASE_URL}${filename}`);
      this.#processLoadedModel(name, glb, scale, rotation, receiveShadow, castShadow, width, depth);
    } catch (error) {
      console.error(`[CityAssetManager] Error loading model ${name}:`, error);
      this.loadedModelCount++;
      this.onProgress?.(this.loadedModelCount, this.modelCount);
    }
  }

  #processLoadedModel(
    name: string,
    glb: any,
    scale: number,
    rotation: number,
    receiveShadow: boolean,
    castShadow: boolean,
    width: number,
    depth: number
  ): void {
    const mesh = glb.scene;
    mesh.name = name;

    // Measure raw model dimensions BEFORE any transforms
    const box = new THREE.Box3().setFromObject(mesh);
    const size = box.getSize(new THREE.Vector3());
    modelDimensions[name] = {
      width: Math.round(size.x * 100) / 100,
      height: Math.round(size.y * 100) / 100,
      depth: Math.round(size.z * 100) / 100,
    };

    mesh.traverse((obj: THREE.Object3D) => {
      const meshObj = obj as THREE.Mesh;
      if (meshObj.material) {
        meshObj.material = new THREE.MeshLambertMaterial({
          map: this.textures.base,
          specularMap: this.textures.specular,
        });
        meshObj.receiveShadow = receiveShadow;
        meshObj.castShadow = castShadow;
      }
    });

    mesh.rotation.set(0, THREE.MathUtils.degToRad(rotation), 0);

    // Uniform scaling - don't distort models
    const finalScale = scale / 30;
    mesh.scale.set(finalScale, finalScale, finalScale);

    // Offset position so building is centered on its footprint
    // Origin is at corner, so offset by half the extra size
    mesh.position.x = (width - 1) * 0.5;
    mesh.position.z = (depth - 1) * 0.5;

    this.models[name] = mesh;

    this.loadedModelCount++;
    this.onProgress?.(this.loadedModelCount, this.modelCount);

    if (this.loadedModelCount === this.modelCount) {
      console.log('[CityAssetManager] All models loaded:', this.modelCount);
      this.onLoad();
    }
  }

  /**
   * Dispose all loaded resources
   */
  dispose(): void {
    // Dispose textures
    Object.values(this.textures).forEach((texture) => texture.dispose());
    this.textures = {};

    // Dispose models
    Object.values(this.models).forEach((model) => {
      model.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        mesh.geometry?.dispose();
        if (mesh.material) {
          (mesh.material as THREE.Material).dispose();
        }
      });
    });
    this.models = {};

    assetManagerInstance = null;
  }
}

/**
 * Create and initialize the asset manager
 */
export function createCityAssetManager(
  onLoad: () => void,
  onProgress?: (loaded: number, total: number) => void
): CityAssetManager {
  const manager = new CityAssetManager(onLoad, onProgress);
  return manager;
}
