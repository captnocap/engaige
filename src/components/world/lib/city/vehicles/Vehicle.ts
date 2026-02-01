/**
 * Vehicle
 *
 * An individual vehicle that travels along the vehicle graph.
 * Vehicles spawn, drive along roads, and despawn after a lifetime.
 */

import * as THREE from 'three';
import { VehicleGraphNode } from './VehicleGraphNode.js';
import config from '../config.js';
import { SimObject } from '../SimObject.js';
import models from '../models.js';
import { getCityAssetManager } from '../CityAssetManager.js';

const FORWARD = new THREE.Vector3(1, 0, 0);

export class Vehicle extends SimObject {
  createdTime: number;
  cycleStartTime: number;
  origin: VehicleGraphNode | null;
  destination: VehicleGraphNode | null;
  originWorldPosition = new THREE.Vector3();
  destinationWorldPosition = new THREE.Vector3();
  originToDestination = new THREE.Vector3();
  orientation = new THREE.Vector3();

  constructor(origin: VehicleGraphNode, destination: VehicleGraphNode) {
    super();

    this.createdTime = Date.now();
    this.cycleStartTime = this.createdTime;
    this.origin = origin;
    this.destination = destination;

    this.updateWorldPositions();

    // Get random vehicle model
    const assetManager = getCityAssetManager();
    if (assetManager) {
      const vehicleTypes = Object.entries(models)
        .filter(([_, meta]) => meta.type === 'vehicle')
        .map(([name]) => name);

      const i = Math.floor(vehicleTypes.length * Math.random());
      const model = assetManager.getModel(vehicleTypes[i], this, true);
      if (model) {
        this.setMesh(model);
      }
    }
  }

  /**
   * Progress through the current segment (0 to 1)
   */
  get cycleTime(): number {
    const distance = this.originToDestination.length();
    const cycleDuration = distance / config.vehicle.speed;
    const value = (Date.now() - this.cycleStartTime) / cycleDuration;
    return Math.max(0, Math.min(value, 1));
  }

  /**
   * Age of the vehicle in milliseconds
   */
  get age(): number {
    return Date.now() - this.createdTime;
  }

  /**
   * Update vehicle position and state
   */
  simulate(): void {
    if (!this.origin || !this.destination) {
      this.dispose();
      return;
    }

    if (!this.destination.parent) {
      this.dispose();
      return;
    }

    if (this.age > config.vehicle.maxLifetime) {
      this.dispose();
      return;
    }

    if (this.cycleTime === 1) {
      this.pickNewDestination();
    } else {
      this.position.copy(this.originWorldPosition);
      this.position.lerp(this.destinationWorldPosition, this.cycleTime);
    }

    this.updateOpacity();
  }

  /**
   * Fade in/out based on vehicle age
   */
  updateOpacity(): void {
    const setOpacity = (opacity: number) => {
      this.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.material) {
          (mesh.material as THREE.Material).opacity = Math.max(0, Math.min(opacity, 1));
        }
      });
    };

    if (this.age < config.vehicle.fadeTime) {
      setOpacity(this.age / config.vehicle.fadeTime);
    } else if (config.vehicle.maxLifetime - this.age < config.vehicle.fadeTime) {
      setOpacity((config.vehicle.maxLifetime - this.age) / config.vehicle.fadeTime);
    } else {
      setOpacity(1);
    }
  }

  /**
   * Select next destination when reaching current one
   */
  pickNewDestination(): void {
    this.origin = this.destination;
    this.destination = this.origin?.getRandomNextNode() ?? null;
    this.updateWorldPositions();
    this.cycleStartTime = Date.now();
  }

  /**
   * Update cached world positions and orientation
   */
  updateWorldPositions(): void {
    if (!this.origin || !this.destination) {
      return;
    }

    this.origin.getWorldPosition(this.originWorldPosition);
    this.destination.getWorldPosition(this.destinationWorldPosition);

    this.originToDestination.copy(this.destinationWorldPosition);
    this.originToDestination.sub(this.originWorldPosition);

    this.orientation.copy(this.originToDestination);
    this.orientation.normalize();

    this.quaternion.setFromUnitVectors(FORWARD, this.orientation);
  }

  /**
   * Clean up and remove vehicle
   */
  dispose(): void {
    this.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      (mesh.material as THREE.Material)?.dispose();
    });
    this.removeFromParent();
  }

  toHTML(): string {
    return 'Vehicle';
  }
}
