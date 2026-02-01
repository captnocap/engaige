/**
 * SimObject
 *
 * Base class for all 3D objects in the city simulation.
 * Ported from city project for view-only rendering.
 */

import * as THREE from 'three';

const SELECTED_COLOR = 0xaaaa55;
const HIGHLIGHTED_COLOR = 0x555555;

export class SimObject extends THREE.Object3D {
  #mesh: THREE.Object3D | null = null;
  #worldPos = new THREE.Vector3();

  constructor(x = 0, y = 0) {
    super();
    this.name = 'SimObject';
    this.position.x = x;
    this.position.z = y;
  }

  get x(): number {
    this.getWorldPosition(this.#worldPos);
    return Math.floor(this.#worldPos.x);
  }

  get y(): number {
    this.getWorldPosition(this.#worldPos);
    return Math.floor(this.#worldPos.z);
  }

  get mesh(): THREE.Object3D | null {
    return this.#mesh;
  }

  setMesh(value: THREE.Object3D | null): void {
    if (this.#mesh) {
      this.dispose();
      this.remove(this.#mesh);
    }

    this.#mesh = value;

    if (this.#mesh) {
      this.add(this.#mesh);
    }
  }

  setSelected(value: boolean): void {
    if (value) {
      this.#setMeshEmission(SELECTED_COLOR);
    } else {
      this.#setMeshEmission(0);
    }
  }

  setFocused(value: boolean): void {
    if (value) {
      this.#setMeshEmission(HIGHLIGHTED_COLOR);
    } else {
      this.#setMeshEmission(0);
    }
  }

  #setMeshEmission(color: number): void {
    if (!this.mesh) return;
    this.mesh.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      const material = mesh.material as THREE.MeshStandardMaterial;
      material?.emissive?.setHex(color);
    });
  }

  dispose(): void {
    this.#mesh?.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.material) {
        (mesh.material as THREE.Material).dispose();
      }
    });
  }
}
