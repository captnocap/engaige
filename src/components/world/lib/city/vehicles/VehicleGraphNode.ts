/**
 * VehicleGraphNode
 *
 * A node in the vehicle graph representing a point vehicles can travel to.
 * Nodes connect to form a directed graph for vehicle pathfinding.
 */

import * as THREE from 'three';

export class VehicleGraphNode extends THREE.Object3D {
  next: VehicleGraphNode[] = [];

  constructor(x: number, y: number) {
    super();
    this.position.set(x, 0, y);
  }

  /**
   * Connect this node to another node
   */
  connect(node: VehicleGraphNode | null): void {
    if (!node) return;
    if (!this.next.includes(node)) {
      this.next.push(node);
    }
  }

  /**
   * Disconnect all outgoing connections
   */
  disconnectAll(): void {
    this.next = [];
  }

  /**
   * Get a random next node to travel to
   */
  getRandomNextNode(): VehicleGraphNode | null {
    if (this.next.length === 0) {
      return null;
    } else {
      const i = Math.floor(this.next.length * Math.random());
      return this.next[i];
    }
  }
}
