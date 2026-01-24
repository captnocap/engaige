/**
 * Raycasting System
 *
 * Mouse interaction for selecting and hovering 3D objects.
 * Based on SimCity tutorial patterns.
 */

import * as THREE from 'three';

// ============================================================================
// Types
// ============================================================================

export interface SelectableObject {
  type: 'building' | 'npc' | 'landmark' | 'terrain' | 'playerHome';
  id: string;
  [key: string]: any;
}

export interface RaycasterController {
  getSelectedObject: () => THREE.Object3D | null;
  getHoveredObject: () => THREE.Object3D | null;
  setSelectableTypes: (types: string[]) => void;
  onSelect: (callback: SelectCallback) => () => void;
  onHover: (callback: HoverCallback) => () => void;
  update: (event: MouseEvent) => void;
  click: (event: MouseEvent) => void;
  attachEvents: () => void;
  detachEvents: () => void;
  dispose: () => void;
}

type SelectCallback = (object: THREE.Object3D | null, userData: SelectableObject | null) => void;
type HoverCallback = (object: THREE.Object3D | null, userData: SelectableObject | null) => void;

// ============================================================================
// Raycaster Controller
// ============================================================================

/**
 * Create a raycaster controller for mouse interactions
 */
export function createRaycaster(
  camera: THREE.Camera,
  scene: THREE.Scene,
  domElement: HTMLElement
): RaycasterController {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  let selectedObject: THREE.Object3D | null = null;
  let hoveredObject: THREE.Object3D | null = null;
  let previousHoveredObject: THREE.Object3D | null = null;

  let selectableTypes: string[] = ['building', 'npc', 'landmark'];

  const selectCallbacks: SelectCallback[] = [];
  const hoverCallbacks: HoverCallback[] = [];

  /**
   * Convert screen coordinates to normalized device coordinates (-1 to +1)
   */
  function updateMousePosition(event: MouseEvent): void {
    const rect = domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  /**
   * Find objects under the mouse cursor
   */
  function getIntersections(): THREE.Intersection[] {
    raycaster.setFromCamera(mouse, camera);
    return raycaster.intersectObjects(scene.children, true);
  }

  /**
   * Filter intersections to only selectable objects
   */
  function getSelectableIntersection(): THREE.Object3D | null {
    const intersections = getIntersections();

    for (const intersection of intersections) {
      let obj: THREE.Object3D | null = intersection.object;

      // Walk up the parent chain to find userData
      while (obj) {
        if (obj.userData?.type && selectableTypes.includes(obj.userData.type)) {
          return obj;
        }
        obj = obj.parent;
      }
    }

    return null;
  }

  /**
   * Handle mouse move (hover detection)
   */
  function onMouseMove(event: MouseEvent): void {
    updateMousePosition(event);

    const obj = getSelectableIntersection();

    if (obj !== hoveredObject) {
      previousHoveredObject = hoveredObject;
      hoveredObject = obj;

      // Notify callbacks
      const userData = hoveredObject?.userData as SelectableObject | null;
      for (const callback of hoverCallbacks) {
        callback(hoveredObject, userData);
      }
    }
  }

  /**
   * Handle mouse click (selection)
   */
  function onMouseClick(event: MouseEvent): void {
    // Only handle left click
    if (event.button !== 0) return;

    updateMousePosition(event);

    const obj = getSelectableIntersection();

    // Toggle selection if clicking same object
    if (obj === selectedObject) {
      selectedObject = null;
    } else {
      selectedObject = obj;
    }

    // Notify callbacks
    const userData = selectedObject?.userData as SelectableObject | null;
    for (const callback of selectCallbacks) {
      callback(selectedObject, userData);
    }
  }

  /**
   * Attach event listeners
   */
  function attachEvents(): void {
    domElement.addEventListener('mousemove', onMouseMove);
    domElement.addEventListener('click', onMouseClick);
  }

  /**
   * Detach event listeners
   */
  function detachEvents(): void {
    domElement.removeEventListener('mousemove', onMouseMove);
    domElement.removeEventListener('click', onMouseClick);
  }

  /**
   * Register a selection callback
   * Returns unsubscribe function
   */
  function onSelect(callback: SelectCallback): () => void {
    selectCallbacks.push(callback);
    return () => {
      const index = selectCallbacks.indexOf(callback);
      if (index !== -1) {
        selectCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Register a hover callback
   * Returns unsubscribe function
   */
  function onHover(callback: HoverCallback): () => void {
    hoverCallbacks.push(callback);
    return () => {
      const index = hoverCallbacks.indexOf(callback);
      if (index !== -1) {
        hoverCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Set which object types can be selected
   */
  function setSelectableTypes(types: string[]): void {
    selectableTypes = types;
  }

  /**
   * Manual update (call from external event handler)
   */
  function update(event: MouseEvent): void {
    onMouseMove(event);
  }

  /**
   * Manual click (call from external event handler)
   */
  function click(event: MouseEvent): void {
    onMouseClick(event);
  }

  /**
   * Cleanup
   */
  function dispose(): void {
    detachEvents();
    selectCallbacks.length = 0;
    hoverCallbacks.length = 0;
    selectedObject = null;
    hoveredObject = null;
  }

  // Attach events by default
  attachEvents();

  return {
    getSelectedObject: () => selectedObject,
    getHoveredObject: () => hoveredObject,
    setSelectableTypes,
    onSelect,
    onHover,
    update,
    click,
    attachEvents,
    detachEvents,
    dispose,
  };
}

// ============================================================================
// Highlight Utilities
// ============================================================================

/**
 * Apply highlight effect to an object
 */
export function highlightObject(
  object: THREE.Object3D,
  highlighted: boolean,
  highlightColor: number = 0x404040
): void {
  object.traverse((child: THREE.Object3D) => {
    if (child instanceof THREE.Mesh) {
      const material = child.material as THREE.MeshLambertMaterial | THREE.MeshStandardMaterial;

      if (material.emissive) {
        if (highlighted) {
          material.emissive.setHex(highlightColor);
        } else {
          material.emissive.setHex(0x000000);
        }
      }
    }
  });
}

/**
 * Apply selection effect (stronger highlight)
 */
export function selectObject(
  object: THREE.Object3D,
  selected: boolean,
  selectionColor: number = 0x606060
): void {
  highlightObject(object, selected, selectionColor);
}
