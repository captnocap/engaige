/**
 * Orbital Camera System
 *
 * Spherical coordinate camera for isometric-style 3D view.
 * Based on SimCity tutorial patterns.
 *
 * Controls:
 * - Left drag: Rotate (azimuth/elevation)
 * - Middle drag: Pan (move origin)
 * - Right drag / Scroll: Zoom (radius)
 */

import * as THREE from 'three';

export interface CameraController {
  camera: THREE.PerspectiveCamera;
  update: () => void;
  setTarget: (target: THREE.Vector3) => void;
  getTarget: () => THREE.Vector3;
  getAzimuth: () => number;
  getElevation: () => number;
  getRadius: () => number;
  setAzimuth: (angle: number) => void;
  setElevation: (angle: number) => void;
  setRadius: (radius: number) => void;
  animateTo: (target: THREE.Vector3, duration?: number) => Promise<void>;
  attachEvents: () => void;
  detachEvents: () => void;
  dispose: () => void;
}

export interface CameraOptions {
  initialRadius?: number;
  initialAzimuth?: number;
  initialElevation?: number;
  minRadius?: number;
  maxRadius?: number;
  minElevation?: number;
  maxElevation?: number;
  rotationSensitivity?: number;
  panSensitivity?: number;
  zoomSensitivity?: number;
}

const DEFAULT_OPTIONS: CameraOptions = {
  initialRadius: 20,
  initialAzimuth: 45,
  initialElevation: 55,
  minRadius: 5,
  maxRadius: 100,
  minElevation: 20,
  maxElevation: 85,
  rotationSensitivity: 0.5,
  panSensitivity: 0.02,
  zoomSensitivity: 0.1,
};

const DEG_TO_RAD = Math.PI / 180;

/**
 * Create an orbital camera controller with spherical coordinates
 */
export function createOrbitalCamera(
  domElement: HTMLElement,
  camera: THREE.PerspectiveCamera,
  options: CameraOptions = {}
): CameraController {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Spherical coordinates
  let radius = opts.initialRadius!;
  let azimuth = opts.initialAzimuth!;
  let elevation = opts.initialElevation!;

  // Camera pivot point (what the camera orbits around)
  const origin = new THREE.Vector3(0, 0, 0);

  // Mouse state
  let isLeftMouseDown = false;
  let isMiddleMouseDown = false;
  let isRightMouseDown = false;
  let previousMouseX = 0;
  let previousMouseY = 0;

  // Animation state
  let animationFrame: number | null = null;

  /**
   * Convert spherical coordinates to Cartesian and update camera position
   */
  function updateCameraPosition() {
    const azimuthRad = azimuth * DEG_TO_RAD;
    const elevationRad = elevation * DEG_TO_RAD;

    // Convert spherical to Cartesian
    camera.position.x =
      radius * Math.sin(azimuthRad) * Math.cos(elevationRad);
    camera.position.y = radius * Math.sin(elevationRad);
    camera.position.z =
      radius * Math.cos(azimuthRad) * Math.cos(elevationRad);

    // Add origin offset (for panning)
    camera.position.add(origin);

    // Always look at origin
    camera.lookAt(origin);
    camera.updateMatrix();
  }

  /**
   * Handle mouse button press
   */
  function onMouseDown(event: MouseEvent) {
    event.preventDefault();

    if (event.button === 0) isLeftMouseDown = true; // Left = rotate
    if (event.button === 1) isMiddleMouseDown = true; // Middle = pan
    if (event.button === 2) isRightMouseDown = true; // Right = zoom

    previousMouseX = event.clientX;
    previousMouseY = event.clientY;
  }

  /**
   * Handle mouse button release
   */
  function onMouseUp(event: MouseEvent) {
    if (event.button === 0) isLeftMouseDown = false;
    if (event.button === 1) isMiddleMouseDown = false;
    if (event.button === 2) isRightMouseDown = false;
  }

  /**
   * Handle mouse movement
   */
  function onMouseMove(event: MouseEvent) {
    const deltaX = event.clientX - previousMouseX;
    const deltaY = event.clientY - previousMouseY;

    // LEFT MOUSE: Rotate camera
    if (isLeftMouseDown) {
      azimuth -= deltaX * opts.rotationSensitivity!;
      elevation = Math.max(
        opts.minElevation!,
        Math.min(
          opts.maxElevation!,
          elevation + deltaY * opts.rotationSensitivity!
        )
      );
      updateCameraPosition();
    }

    // MIDDLE MOUSE: Pan camera
    if (isMiddleMouseDown) {
      const azimuthRad = azimuth * DEG_TO_RAD;
      const yAxis = new THREE.Vector3(0, 1, 0);

      // Calculate forward and left vectors based on camera azimuth
      const forward = new THREE.Vector3(0, 0, 1).applyAxisAngle(
        yAxis,
        azimuthRad
      );
      const left = new THREE.Vector3(1, 0, 0).applyAxisAngle(
        yAxis,
        azimuthRad
      );

      // Move origin (negative pan sensitivity for intuitive dragging)
      origin.add(forward.multiplyScalar(-deltaY * opts.panSensitivity!));
      origin.add(left.multiplyScalar(-deltaX * opts.panSensitivity!));
      updateCameraPosition();
    }

    // RIGHT MOUSE: Zoom camera
    if (isRightMouseDown) {
      radius = Math.max(
        opts.minRadius!,
        Math.min(opts.maxRadius!, radius + deltaY * opts.zoomSensitivity!)
      );
      updateCameraPosition();
    }

    previousMouseX = event.clientX;
    previousMouseY = event.clientY;
  }

  /**
   * Handle mouse wheel (zoom)
   */
  function onWheel(event: WheelEvent) {
    event.preventDefault();

    const zoomAmount = event.deltaY * opts.zoomSensitivity! * 0.1;
    radius = Math.max(
      opts.minRadius!,
      Math.min(opts.maxRadius!, radius + zoomAmount)
    );
    updateCameraPosition();
  }

  /**
   * Prevent context menu on right-click
   */
  function onContextMenu(event: MouseEvent) {
    event.preventDefault();
  }

  /**
   * Attach event listeners to DOM element
   */
  function attachEvents() {
    domElement.addEventListener('mousedown', onMouseDown);
    domElement.addEventListener('mouseup', onMouseUp);
    domElement.addEventListener('mousemove', onMouseMove);
    domElement.addEventListener('wheel', onWheel, { passive: false });
    domElement.addEventListener('contextmenu', onContextMenu);

    // Handle mouse up outside the element
    window.addEventListener('mouseup', onMouseUp);
  }

  /**
   * Remove event listeners
   */
  function detachEvents() {
    domElement.removeEventListener('mousedown', onMouseDown);
    domElement.removeEventListener('mouseup', onMouseUp);
    domElement.removeEventListener('mousemove', onMouseMove);
    domElement.removeEventListener('wheel', onWheel);
    domElement.removeEventListener('contextmenu', onContextMenu);
    window.removeEventListener('mouseup', onMouseUp);
  }

  /**
   * Set the camera target (origin)
   */
  function setTarget(target: THREE.Vector3) {
    origin.copy(target);
    updateCameraPosition();
  }

  /**
   * Get current camera target
   */
  function getTarget(): THREE.Vector3 {
    return origin.clone();
  }

  /**
   * Animate camera to a new target position
   */
  function animateTo(
    target: THREE.Vector3,
    duration: number = 500
  ): Promise<void> {
    return new Promise((resolve) => {
      const startOrigin = origin.clone();
      const startTime = performance.now();

      function animate() {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);

        origin.lerpVectors(startOrigin, target, eased);
        updateCameraPosition();

        if (progress < 1) {
          animationFrame = requestAnimationFrame(animate);
        } else {
          animationFrame = null;
          resolve();
        }
      }

      if (animationFrame !== null) {
        cancelAnimationFrame(animationFrame);
      }

      animate();
    });
  }

  /**
   * Update function (call in render loop if needed)
   */
  function update() {
    // Currently no per-frame updates needed
    // Could add damping/smoothing here
  }

  /**
   * Cleanup resources
   */
  function dispose() {
    detachEvents();
    if (animationFrame !== null) {
      cancelAnimationFrame(animationFrame);
    }
  }

  // Initialize camera position
  updateCameraPosition();

  // Attach events by default
  attachEvents();

  return {
    camera,
    update,
    setTarget,
    getTarget,
    getAzimuth: () => azimuth,
    getElevation: () => elevation,
    getRadius: () => radius,
    setAzimuth: (angle: number) => {
      azimuth = angle;
      updateCameraPosition();
    },
    setElevation: (angle: number) => {
      elevation = Math.max(
        opts.minElevation!,
        Math.min(opts.maxElevation!, angle)
      );
      updateCameraPosition();
    },
    setRadius: (r: number) => {
      radius = Math.max(opts.minRadius!, Math.min(opts.maxRadius!, r));
      updateCameraPosition();
    },
    animateTo,
    attachEvents,
    detachEvents,
    dispose,
  };
}
