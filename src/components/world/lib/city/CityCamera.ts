/**
 * CityCamera
 *
 * Orthographic camera with free panning, rotation, and zoom.
 * Ported from city project for proper isometric city viewing.
 */

import * as THREE from 'three';

const DEG2RAD = Math.PI / 180.0;

// Camera settings
const CAMERA_SIZE = 5;
const MIN_CAMERA_RADIUS = 0.2;  // Max zoom in (higher = more zoomed in)
const MAX_CAMERA_RADIUS = 3;    // Max zoom out
const DEFAULT_RADIUS = 1.2;      // Starting zoom - fits ~16x16 nicely
const MIN_CAMERA_ELEVATION = 30;
const MAX_CAMERA_ELEVATION = 80;

// Input sensitivity
const AZIMUTH_SENSITIVITY = 0.2;
const ELEVATION_SENSITIVITY = 0.2;
const ZOOM_SENSITIVITY = 0.002;
const PAN_SENSITIVITY = -0.01;
const KEYBOARD_PAN_SPEED = 0.3;

const Y_AXIS = new THREE.Vector3(0, 1, 0);

export class CityCamera {
  camera: THREE.OrthographicCamera;
  cameraOrigin: THREE.Vector3;
  cameraRadius = DEFAULT_RADIUS;
  cameraAzimuth = 225;
  cameraElevation = 45;

  keysPressed: Set<string> = new Set();
  gameWindow: HTMLElement;
  animationId: number | null = null;

  // Bound event handlers for cleanup
  private boundOnMouseScroll: (e: WheelEvent) => void;
  private boundOnMouseDown: (e: MouseEvent) => void;
  private boundOnMouseMove: (e: MouseEvent) => void;
  private boundOnKeyDown: (e: KeyboardEvent) => void;
  private boundOnKeyUp: (e: KeyboardEvent) => void;
  private boundOnContextMenu: (e: Event) => void;

  constructor(gameWindow: HTMLElement, citySize = 50) {
    this.gameWindow = gameWindow;
    const aspect = gameWindow.clientWidth / gameWindow.clientHeight;
    const center = citySize / 2;
    this.cameraOrigin = new THREE.Vector3(center, 0, center);

    this.camera = new THREE.OrthographicCamera(
      (CAMERA_SIZE * aspect) / -2,
      (CAMERA_SIZE * aspect) / 2,
      CAMERA_SIZE / 2,
      CAMERA_SIZE / -2,
      1,
      1000
    );
    this.camera.layers.enable(1);

    this.updateCameraPosition();

    // Bind event handlers
    this.boundOnMouseScroll = this.onMouseScroll.bind(this);
    this.boundOnMouseDown = this.onMouseMove.bind(this);
    this.boundOnMouseMove = this.onMouseMove.bind(this);
    this.boundOnKeyDown = this.onKeyDown.bind(this);
    this.boundOnKeyUp = this.onKeyUp.bind(this);
    this.boundOnContextMenu = (e: Event) => e.preventDefault();

    // Add event listeners
    gameWindow.addEventListener('wheel', this.boundOnMouseScroll, false);
    gameWindow.addEventListener('mousedown', this.boundOnMouseDown, false);
    gameWindow.addEventListener('mousemove', this.boundOnMouseMove, false);
    gameWindow.addEventListener('contextmenu', this.boundOnContextMenu, false);

    window.addEventListener('keydown', this.boundOnKeyDown, false);
    window.addEventListener('keyup', this.boundOnKeyUp, false);

    this.startKeyboardLoop();
  }

  startKeyboardLoop(): void {
    const update = () => {
      this.updateKeyboardMovement();
      this.animationId = requestAnimationFrame(update);
    };
    this.animationId = requestAnimationFrame(update);
  }

  updateKeyboardMovement(): void {
    if (this.keysPressed.size === 0) return;

    const forward = new THREE.Vector3(0, 0, 1).applyAxisAngle(Y_AXIS, this.cameraAzimuth * DEG2RAD);
    const right = new THREE.Vector3(-1, 0, 0).applyAxisAngle(Y_AXIS, this.cameraAzimuth * DEG2RAD);

    const speed = KEYBOARD_PAN_SPEED / this.cameraRadius;

    if (this.keysPressed.has('w') || this.keysPressed.has('arrowup')) {
      this.cameraOrigin.add(forward.clone().multiplyScalar(-speed));
    }
    if (this.keysPressed.has('s') || this.keysPressed.has('arrowdown')) {
      this.cameraOrigin.add(forward.clone().multiplyScalar(speed));
    }
    if (this.keysPressed.has('a') || this.keysPressed.has('arrowleft')) {
      this.cameraOrigin.add(right.clone().multiplyScalar(speed));
    }
    if (this.keysPressed.has('d') || this.keysPressed.has('arrowright')) {
      this.cameraOrigin.add(right.clone().multiplyScalar(-speed));
    }

    this.updateCameraPosition();
  }

  onKeyDown(event: KeyboardEvent): void {
    this.keysPressed.add(event.key.toLowerCase());
  }

  onKeyUp(event: KeyboardEvent): void {
    this.keysPressed.delete(event.key.toLowerCase());
  }

  updateCameraPosition(): void {
    this.camera.zoom = this.cameraRadius;
    this.camera.position.x =
      100 * Math.sin(this.cameraAzimuth * DEG2RAD) * Math.cos(this.cameraElevation * DEG2RAD);
    this.camera.position.y = 100 * Math.sin(this.cameraElevation * DEG2RAD);
    this.camera.position.z =
      100 * Math.cos(this.cameraAzimuth * DEG2RAD) * Math.cos(this.cameraElevation * DEG2RAD);
    this.camera.position.add(this.cameraOrigin);
    this.camera.lookAt(this.cameraOrigin);
    this.camera.updateProjectionMatrix();
    this.camera.updateMatrixWorld();
  }

  onMouseMove(event: MouseEvent): void {
    const RIGHT_MOUSE_BUTTON = 2;

    // Right-click drag to rotate
    if (event.buttons & RIGHT_MOUSE_BUTTON && !event.ctrlKey) {
      this.cameraAzimuth += -(event.movementX * AZIMUTH_SENSITIVITY);
      this.cameraElevation += event.movementY * ELEVATION_SENSITIVITY;
      this.cameraElevation = Math.min(
        MAX_CAMERA_ELEVATION,
        Math.max(MIN_CAMERA_ELEVATION, this.cameraElevation)
      );
    }

    // Ctrl+Right-click to pan
    if (event.buttons & RIGHT_MOUSE_BUTTON && event.ctrlKey) {
      const forward = new THREE.Vector3(0, 0, 1).applyAxisAngle(
        Y_AXIS,
        this.cameraAzimuth * DEG2RAD
      );
      const left = new THREE.Vector3(1, 0, 0).applyAxisAngle(Y_AXIS, this.cameraAzimuth * DEG2RAD);
      this.cameraOrigin.add(forward.multiplyScalar(PAN_SENSITIVITY * event.movementY));
      this.cameraOrigin.add(left.multiplyScalar(PAN_SENSITIVITY * event.movementX));
    }

    this.updateCameraPosition();
  }

  onMouseScroll(event: WheelEvent): void {
    this.cameraRadius *= 1 - event.deltaY * ZOOM_SENSITIVITY;
    this.cameraRadius = Math.min(MAX_CAMERA_RADIUS, Math.max(MIN_CAMERA_RADIUS, this.cameraRadius));
    this.updateCameraPosition();
  }

  resize(gameWindow: HTMLElement): void {
    const aspect = gameWindow.clientWidth / gameWindow.clientHeight;
    this.camera.left = (CAMERA_SIZE * aspect) / -2;
    this.camera.right = (CAMERA_SIZE * aspect) / 2;
    this.camera.updateProjectionMatrix();
  }

  /**
   * Set camera target position
   */
  setTarget(target: THREE.Vector3): void {
    this.cameraOrigin.copy(target);
    this.updateCameraPosition();
  }

  /**
   * Clean up event listeners
   */
  dispose(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }

    this.gameWindow.removeEventListener('wheel', this.boundOnMouseScroll);
    this.gameWindow.removeEventListener('mousedown', this.boundOnMouseDown);
    this.gameWindow.removeEventListener('mousemove', this.boundOnMouseMove);
    this.gameWindow.removeEventListener('contextmenu', this.boundOnContextMenu);

    window.removeEventListener('keydown', this.boundOnKeyDown);
    window.removeEventListener('keyup', this.boundOnKeyUp);
  }
}
