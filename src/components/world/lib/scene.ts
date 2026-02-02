/**
 * Three.js Scene Setup
 *
 * Core scene initialization following SimCity tutorial patterns.
 * Provides a SceneContext with start/stop control and cleanup.
 */

import * as THREE from 'three';

export interface SceneContext {
  scene: THREE.Scene;
  /** The default perspective camera (use for orbital camera) */
  perspectiveCamera: THREE.PerspectiveCamera;
  /** The active camera used for rendering (may be orthographic) */
  camera: THREE.Camera;
  renderer: THREE.WebGLRenderer;
  start: () => void;
  stop: () => void;
  resize: () => void;
  getCanvas: () => HTMLCanvasElement;
  dispose: () => void;
  setOnRender: (callback: ((delta: number, elapsed: number) => void) | null) => void;
  setCamera: (camera: THREE.Camera, onResize?: () => void) => void;
}

export interface SceneOptions {
  backgroundColor?: number;
  enableShadows?: boolean;
  antialias?: boolean;
}

const DEFAULT_OPTIONS: SceneOptions = {
  backgroundColor: 0x1a1a2e,
  enableShadows: true,
  antialias: true,
};

/**
 * Create a Three.js scene with renderer and camera
 */
export function createScene(
  container: HTMLElement,
  options: SceneOptions = {}
): SceneContext {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Scene
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(opts.backgroundColor!);

  // Camera (default perspective, can be replaced with setCamera)
  const aspect = container.clientWidth / container.clientHeight;
  const perspectiveCamera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
  perspectiveCamera.position.set(10, 10, 10);
  perspectiveCamera.lookAt(new THREE.Vector3(0, 0, 0));

  // Active camera for rendering (defaults to perspective, can be swapped)
  let camera: THREE.Camera = perspectiveCamera;

  // Renderer
  const renderer = new THREE.WebGLRenderer({ antialias: opts.antialias });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Shadow support
  if (opts.enableShadows) {
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }

  container.appendChild(renderer.domElement);

  // Basic lighting (can be enhanced by lighting.ts)
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(50, 50, 50);
  directionalLight.castShadow = opts.enableShadows!;

  if (opts.enableShadows) {
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 200;
    directionalLight.shadow.camera.left = -50;
    directionalLight.shadow.camera.right = 50;
    directionalLight.shadow.camera.top = 50;
    directionalLight.shadow.camera.bottom = -50;
  }

  scene.add(directionalLight);

  // Render loop
  let animationId: number | null = null;
  let onRenderCallback: ((delta: number, elapsed: number) => void) | null = null;
  const clock = new THREE.Clock();

  function render() {
    const delta = clock.getDelta();
    const elapsed = clock.getElapsedTime();

    if (onRenderCallback) {
      onRenderCallback(delta, elapsed);
    }

    renderer.render(scene, camera);
  }

  function setOnRender(callback: ((delta: number, elapsed: number) => void) | null) {
    onRenderCallback = callback;
  }

  function start() {
    if (animationId !== null) return;
    clock.start();
    renderer.setAnimationLoop(render);
  }

  function stop() {
    renderer.setAnimationLoop(null);
    animationId = null;
  }

  // Resize handling
  let resizeObserver: ResizeObserver | null = null;
  let resizeCallback: (() => void) | null = null;

  function resize() {
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Always update perspective camera (for WorldViewer compatibility)
    perspectiveCamera.aspect = width / height;
    perspectiveCamera.updateProjectionMatrix();

    // Handle orthographic camera via external callback
    if (camera instanceof THREE.OrthographicCamera && resizeCallback) {
      resizeCallback();
    }

    renderer.setSize(width, height);
  }

  function setCamera(newCamera: THREE.Camera, onResize?: () => void) {
    camera = newCamera;
    resizeCallback = onResize || null;
  }

  // Set up resize observer
  resizeObserver = new ResizeObserver(() => {
    resize();
  });
  resizeObserver.observe(container);

  function getCanvas() {
    return renderer.domElement;
  }

  function dispose() {
    stop();

    if (resizeObserver) {
      resizeObserver.disconnect();
      resizeObserver = null;
    }

    // Remove canvas from DOM
    if (renderer.domElement.parentElement) {
      renderer.domElement.parentElement.removeChild(renderer.domElement);
    }

    // Dispose Three.js resources
    renderer.dispose();

    // Clear scene
    scene.traverse((object: THREE.Object3D) => {
      if (object instanceof THREE.Mesh) {
        object.geometry?.dispose();
        if (Array.isArray(object.material)) {
          object.material.forEach((m: THREE.Material) => m.dispose());
        } else {
          object.material?.dispose();
        }
      }
    });
    scene.clear();
  }

  return {
    scene,
    perspectiveCamera,
    get camera() { return camera; },
    renderer,
    start,
    stop,
    resize,
    getCanvas,
    dispose,
    setOnRender,
    setCamera,
  };
}

