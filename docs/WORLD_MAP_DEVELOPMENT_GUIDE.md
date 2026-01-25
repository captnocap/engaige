# World Map Development Guide

**Based on SimCity Clone Tutorial Series Analysis**

This document synthesizes insights from 10+ hours of SimCity game development tutorials to guide implementation of the World Map system in engAIge. The tutorials demonstrate building a 3D isometric city simulator using JavaScript and Three.js, with lessons directly applicable to our ASCII/visual world map hybrid approach.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [3D Scene Foundation](#3d-scene-foundation)
3. [Camera System](#camera-system)
4. [Asset Management](#asset-management)
5. [User Interaction (Raycasting)](#user-interaction-raycasting)
6. [Toolbar & UI System](#toolbar--ui-system)
7. [Data Model Architecture](#data-model-architecture)
8. [Visual Rendering (Textures & Shadows)](#visual-rendering-textures--shadows)
9. [Simulation Systems](#simulation-systems)
10. [Module Architecture Pattern](#module-architecture-pattern)
11. [Implementation Roadmap](#implementation-roadmap)

---

## Architecture Overview

### Core Principle: Unified Data + Visuals

**Anti-Pattern (What NOT to Do):**
```typescript
// DON'T: Separate data model from visuals
class CityDataModel { /* pure data */ }
class SceneManager { /* scans data model every frame */ }
```

**Best Practice (What TO Do):**
```typescript
// DO: Objects manage their own rendering
class WorldTile extends SimObject {
  constructor(x, y, terrainType) {
    super();
    this.x = x;
    this.y = y;
    this.terrainType = terrainType;
    this.mesh = this.createMesh(); // Own visual representation
  }

  updateMesh() {
    // Only update when data changes, not every frame
    if (this.needsUpdate) {
      this.scene.remove(this.mesh);
      this.mesh = this.createMesh();
      this.scene.add(this.mesh);
      this.needsUpdate = false;
    }
  }
}
```

**Why This Matters:**
- Related logic stays together
- No scanning entire map every frame
- Objects know when they need visual updates
- Easier to debug (everything in one place)

---

## 3D Scene Foundation

### Basic Scene Setup

```typescript
// scene.ts - Core scene initialization
import * as THREE from 'three';

export function createScene(renderTarget: HTMLElement) {
  // Scene setup
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x808080); // Medium gray

  // Camera (perspective for 3D feel)
  const aspect = renderTarget.clientWidth / renderTarget.clientHeight;
  const camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);

  // Renderer
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(renderTarget.clientWidth, renderTarget.clientHeight);
  renderTarget.appendChild(renderer.domElement);

  // Render loop
  function draw() {
    renderer.render(scene, camera);
  }

  function start() {
    renderer.setAnimationLoop(draw);
  }

  function stop() {
    renderer.setAnimationLoop(null);
  }

  return { scene, camera, renderer, start, stop, draw };
}
```

### Key Lessons:
- **Camera positioning** - Default position is (0,0,0), must move camera back to see objects
- **Render loop** - Use `setAnimationLoop()` for automatic frame timing
- **Module exports** - Return object with start/stop methods for external control

---

## Camera System

### Orbital Camera (Isometric-Style View)

```typescript
// camera.ts - Orbital camera with pan/zoom/rotate
export function createCamera(gameWindow: HTMLElement) {
  // Spherical coordinates (radius, azimuth, elevation)
  let cameraRadius = 4;
  let cameraAzimuth = 0;    // Compass direction (0-360°)
  let cameraElevation = 45; // Angle from horizon (30-90°)
  let cameraOrigin = new THREE.Vector3(0, 0, 0); // Pivot point

  // Camera bounds
  const MIN_RADIUS = 2;
  const MAX_RADIUS = 10;
  const MIN_ELEVATION = 30;  // Don't go below horizon
  const MAX_ELEVATION = 90;  // Don't flip over top

  // Sensitivity controls
  const ROTATION_SENSITIVITY = 0.5;
  const ZOOM_SENSITIVITY = 0.02;
  const PAN_SENSITIVITY = -0.01;

  // Mouse state
  let isLeftMouseDown = false;
  let isRightMouseDown = false;
  let isMiddleMouseDown = false;
  let previousMouseX = 0;
  let previousMouseY = 0;

  // Three.js camera
  const aspect = gameWindow.clientWidth / gameWindow.clientHeight;
  const camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);

  // Update camera position from spherical coords
  function updateCameraPosition() {
    const degToRad = Math.PI / 180;

    // Convert spherical to Cartesian
    camera.position.x = cameraRadius *
      Math.sin(cameraAzimuth * degToRad) *
      Math.cos(cameraElevation * degToRad);
    camera.position.y = cameraRadius *
      Math.sin(cameraElevation * degToRad);
    camera.position.z = cameraRadius *
      Math.cos(cameraAzimuth * degToRad) *
      Math.cos(cameraElevation * degToRad);

    // Add origin offset (for panning)
    camera.position.add(cameraOrigin);

    // Always look at origin
    camera.lookAt(cameraOrigin);
    camera.updateMatrix();
  }

  // Mouse event handlers
  function onMouseDown(event: MouseEvent) {
    if (event.button === 0) isLeftMouseDown = true;  // Left = rotate
    if (event.button === 1) isMiddleMouseDown = true; // Middle = pan
    if (event.button === 2) isRightMouseDown = true;  // Right = zoom
  }

  function onMouseUp(event: MouseEvent) {
    if (event.button === 0) isLeftMouseDown = false;
    if (event.button === 1) isMiddleMouseDown = false;
    if (event.button === 2) isRightMouseDown = false;
  }

  function onMouseMove(event: MouseEvent) {
    const deltaX = event.clientX - previousMouseX;
    const deltaY = event.clientY - previousMouseY;

    // LEFT MOUSE: Rotate camera
    if (isLeftMouseDown) {
      cameraAzimuth -= deltaX * ROTATION_SENSITIVITY;
      cameraElevation = Math.max(MIN_ELEVATION,
        Math.min(MAX_ELEVATION, cameraElevation - deltaY * ROTATION_SENSITIVITY));
      updateCameraPosition();
    }

    // MIDDLE MOUSE: Pan camera
    if (isMiddleMouseDown) {
      // Calculate forward/left vectors
      const degToRad = Math.PI / 180;
      const yAxis = new THREE.Vector3(0, 1, 0);

      const forward = new THREE.Vector3(0, 0, 1)
        .applyAxisAngle(yAxis, cameraAzimuth * degToRad);
      const left = new THREE.Vector3(1, 0, 0)
        .applyAxisAngle(yAxis, cameraAzimuth * degToRad);

      // Move origin
      cameraOrigin.add(forward.multiplyScalar(deltaY * PAN_SENSITIVITY));
      cameraOrigin.add(left.multiplyScalar(deltaX * PAN_SENSITIVITY));
      updateCameraPosition();
    }

    // RIGHT MOUSE: Zoom camera
    if (isRightMouseDown) {
      cameraRadius = Math.max(MIN_RADIUS,
        Math.min(MAX_RADIUS, cameraRadius + deltaY * ZOOM_SENSITIVITY));
      updateCameraPosition();
    }

    previousMouseX = event.clientX;
    previousMouseY = event.clientY;
  }

  // Initialize camera position
  updateCameraPosition();

  return {
    camera,
    onMouseDown,
    onMouseUp,
    onMouseMove
  };
}
```

### Key Lessons:
- **Spherical coordinates** - Natural way to describe orbital camera (radius, azimuth, elevation)
- **Clamping elevation** - Prevent camera from going below horizon or flipping over
- **Separate mouse buttons** - Left=rotate, Middle=pan, Right=zoom (industry standard)
- **Pan origin** - Camera orbits around adjustable point, not fixed (0,0,0)
- **Forward/left vectors** - Calculate from azimuth for intuitive panning

---

## Asset Management

### Factory Pattern for Reusable Assets

```typescript
// assets.ts - Asset library with factory pattern
import * as THREE from 'three';

// Shared geometries (created once, reused many times)
const CUBE_GEOMETRY = new THREE.BoxGeometry(1, 1, 1);
const PLANE_GEOMETRY = new THREE.PlaneGeometry(1, 1);

// Asset factory (maps asset ID to factory function)
const assets: Record<string, (x: number, y: number, data?: any) => THREE.Mesh> = {

  grass: (x: number, y: number) => {
    const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    const mesh = new THREE.Mesh(PLANE_GEOMETRY, material);
    mesh.rotation.x = -Math.PI / 2; // Lay flat
    mesh.position.set(x, 0, y);
    mesh.userData.id = 'grass';
    return mesh;
  },

  residential: (x: number, y: number, data?: any) => {
    const height = data?.height || 1;
    const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    const mesh = new THREE.Mesh(CUBE_GEOMETRY, material);
    mesh.scale.y = height; // Scale in Y direction
    mesh.position.set(x, height / 2, y); // Offset by half height
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData.id = 'residential';
    return mesh;
  },

  commercial: (x: number, y: number, data?: any) => {
    const height = data?.height || 1;
    const material = new THREE.MeshStandardMaterial({ color: 0x0000ff });
    const mesh = new THREE.Mesh(CUBE_GEOMETRY, material);
    mesh.scale.y = height;
    mesh.position.set(x, height / 2, y);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData.id = 'commercial';
    return mesh;
  },

  industrial: (x: number, y: number, data?: any) => {
    const height = data?.height || 1;
    const material = new THREE.MeshStandardMaterial({ color: 0xffff00 });
    const mesh = new THREE.Mesh(CUBE_GEOMETRY, material);
    mesh.scale.y = height;
    mesh.position.set(x, height / 2, y);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData.id = 'industrial';
    return mesh;
  }
};

// Public API
export function createAssetInstance(
  assetId: string,
  x: number,
  y: number,
  data?: any
): THREE.Mesh | undefined {
  if (assetId in assets) {
    return assets[assetId](x, y, data);
  } else {
    console.warn(`Asset ID "${assetId}" not found`);
    return undefined;
  }
}
```

### Texture Management

```typescript
// Texture loader (singleton)
const textureLoader = new THREE.TextureLoader();

// Texture library (load once, reuse many times)
const textureLibrary: Record<string, THREE.Texture> = {};

function loadTexture(url: string): THREE.Texture {
  const texture = textureLoader.load(url);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 1);
  return texture;
}

// Pre-load all textures
textureLibrary['grass'] = loadTexture('/textures/grass.png');
textureLibrary['residential_1'] = loadTexture('/textures/residential_1.png');
textureLibrary['residential_2'] = loadTexture('/textures/residential_2.png');
// ... etc

// Material factory functions
function getTopMaterial(): THREE.Material {
  return new THREE.MeshStandardMaterial({ color: 0x808080 });
}

function getSideMaterial(textureName: string): THREE.Material {
  const texture = textureLibrary[textureName].clone(); // Clone to avoid shared state
  return new THREE.MeshStandardMaterial({ map: texture });
}

// Multi-material cube (different textures per face)
function createZoneMesh(type: string, style: number, height: number, x: number, y: number) {
  const textureName = `${type}_${style}`;
  const topMaterial = getTopMaterial();
  const sideMaterial = getSideMaterial(textureName);

  // Material array maps to cube faces: [+X, -X, +Y, -Y, +Z, -Z]
  const materials = [
    sideMaterial, // Right
    sideMaterial, // Left
    topMaterial,  // Top
    topMaterial,  // Bottom
    sideMaterial, // Front
    sideMaterial  // Back
  ];

  const mesh = new THREE.Mesh(CUBE_GEOMETRY, materials);
  mesh.scale.y = height;
  mesh.position.set(x, height / 2, y);
  return mesh;
}
```

### Key Lessons:
- **Factory pattern** - Functions that create instances, not classes
- **Shared geometries** - Create once, reuse via `new THREE.Mesh(SHARED_GEOMETRY, ...)`
- **userData property** - Store custom metadata (asset ID, coordinates, etc.)
- **Material arrays** - Different materials per cube face
- **Texture cloning** - `texture.clone()` creates new instance but shares image data
- **Scale vs height** - Scale mesh instead of creating new geometry

---

## User Interaction (Raycasting)

### Selecting 3D Objects with Mouse

```typescript
// Raycasting - "Cast a ray from camera through mouse position"
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2(); // Normalized device coordinates
let selectedObject: THREE.Object3D | null = null;

function onMouseDown(event: MouseEvent) {
  // 1. Convert screen coordinates to normalized device coordinates (-1 to +1)
  const rect = renderTarget.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1; // Flip Y

  // 2. Update raycaster with mouse position and camera
  raycaster.setFromCamera(mouse, camera);

  // 3. Find intersections with scene objects
  const intersections = raycaster.intersectObjects(scene.children, false);

  // 4. Get closest object (first in array)
  if (intersections.length > 0) {
    const intersectedObject = intersections[0].object;

    // Highlight selected object
    if (selectedObject) {
      // Unhighlight previous
      (selectedObject as THREE.Mesh).material.emissive.setHex(0x000000);
    }
    selectedObject = intersectedObject;
    (selectedObject as THREE.Mesh).material.emissive.setHex(0x404040); // Gray glow

    // Extract tile coordinates from userData
    const { x, y } = selectedObject.userData;
    console.log(`Selected tile: (${x}, ${y})`);

    // Trigger callback
    if (onObjectSelected) {
      onObjectSelected(selectedObject);
    }
  }
}
```

### Key Lessons:
- **Normalized device coordinates** - Transform screen pixels to -1 to +1 range
- **Y-axis flip** - Screen Y increases downward, WebGL Y increases upward
- **Intersections sorted by distance** - Closest object is first
- **Emissive color** - Add glow to highlight without changing base color
- **userData for reverse lookup** - Store tile coordinates on mesh to map back to data model

---

## Toolbar & UI System

### Tool Selection Pattern

```typescript
// Toolbar with icon buttons
interface Tool {
  id: string;
  icon: string;
  action: (tile: Tile) => void;
}

let activeToolId: string = 'select';
let selectedButton: HTMLElement | null = null;

const tools: Record<string, Tool> = {
  select: {
    id: 'select',
    icon: '/icons/pointer.png',
    action: (tile) => {
      // Just select, no changes
      updateInfoPanel(tile);
    }
  },
  bulldoze: {
    id: 'bulldoze',
    icon: '/icons/bulldozer.png',
    action: (tile) => {
      tile.removeBuilding();
      updateScene();
    }
  },
  residential: {
    id: 'residential',
    icon: '/icons/house.png',
    action: (tile) => {
      tile.placeBuilding('residential');
      updateScene();
    }
  },
  // ... etc
};

function setActiveTool(event: MouseEvent, toolId: string) {
  // Update button selection state
  if (selectedButton) {
    selectedButton.classList.remove('selected');
  }
  selectedButton = event.target as HTMLElement;
  selectedButton.classList.add('selected');

  // Update active tool
  activeToolId = toolId;
}

// Mouse drag to place multiple tiles
let isMouseDown = false;

function onMouseDown(event: MouseEvent) {
  isMouseDown = true;
  handleToolAction(event);
}

function onMouseMove(event: MouseEvent) {
  if (isMouseDown) {
    handleToolAction(event);
  }
}

function onMouseUp(event: MouseEvent) {
  isMouseDown = false;
}

function handleToolAction(event: MouseEvent) {
  const object = getSelectedObject(event);
  if (object && object.userData) {
    const tile = getTile(object.userData.x, object.userData.y);
    tools[activeToolId].action(tile);
  }
}
```

### Info Overlay Panel

```typescript
// Dynamic info panel (HTML generation)
class Tile {
  toHTML(): string {
    let html = `<strong>Tile (${this.x}, ${this.y})</strong><br/>`;
    html += `Terrain: ${this.terrainType}<br/>`;

    if (this.building) {
      html += this.building.toHTML();
    }

    return html;
  }
}

class Building {
  toHTML(): string {
    let html = `<br/><strong>Building</strong><br/>`;
    html += `Type: ${this.type}<br/>`;
    html += `Height: ${this.height}<br/>`;

    if (this.residents && this.residents.length > 0) {
      html += `<br/><strong>Residents (${this.residents.length}/${this.maxResidents})</strong><br/>`;
      html += '<ul style="padding-left: 20px;">';
      for (const resident of this.residents) {
        html += resident.toHTML();
      }
      html += '</ul>';
    }

    return html;
  }
}

class Citizen {
  toHTML(): string {
    return `<li>${this.name}, ${this.age} years old<br/>
            Job: ${this.job ? this.job.name : 'Unemployed'}</li>`;
  }
}

// Update panel on selection
function updateInfoPanel(tile: Tile) {
  const panel = document.getElementById('info-panel-details');
  if (panel) {
    panel.innerHTML = tile.toHTML();
  }
}
```

### Key Lessons:
- **Icon-based toolbar** - Images > text buttons (saves space)
- **CSS classes for state** - `selected` class instead of inline styles
- **Mouse drag placement** - Track mouse down + move for continuous placement
- **Recursive HTML generation** - Objects convert themselves to HTML
- **Nested lists** - Show hierarchy (tile → building → residents)

---

## Data Model Architecture

### Tile-Based Grid System

```typescript
// city.ts - 2D grid data model
interface Tile {
  id: string;
  x: number;
  y: number;
  terrainType: string;
  building: Building | null;
}

interface Building {
  id: string;
  type: string;
  x: number;
  y: number;
  height: number;
  updated: boolean; // Flag for visual update
}

class City {
  data: Tile[][];
  citizens: Citizen[];
  width: number;
  height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.data = [];
    this.citizens = [];

    // Initialize 2D grid
    for (let x = 0; x < width; x++) {
      this.data[x] = [];
      for (let y = 0; y < height; y++) {
        this.data[x][y] = this.createTile(x, y);
      }
    }
  }

  createTile(x: number, y: number): Tile {
    return {
      id: crypto.randomUUID(),
      x,
      y,
      terrainType: 'grass',
      building: null
    };
  }

  getTile(x: number, y: number): Tile | undefined {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      return this.data[x][y];
    }
    return undefined;
  }

  // Simulation update (1 step = 1 day)
  update() {
    // Update all buildings
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        const tile = this.data[x][y];
        if (tile.building) {
          tile.building.update(this);
        }
      }
    }

    // Update all citizens
    for (const citizen of this.citizens) {
      citizen.update(this);
    }
  }
}
```

### Building Factory Pattern

```typescript
// buildings/residential.ts
export function createResidentialBuilding(x: number, y: number) {
  return {
    id: crypto.randomUUID(),
    type: 'residential',
    x,
    y,
    height: 1,
    updated: true,
    residents: [] as Citizen[],
    maxResidents: 4,

    update(city: City) {
      // Grow building randomly
      if (Math.random() < 0.01 && this.height < 5) {
        this.height++;
        this.updated = true;
      }

      // Add residents if room available
      if (this.residents.length < this.maxResidents && Math.random() < 0.05) {
        const citizen = createCitizen(this);
        this.residents.push(citizen);
        city.citizens.push(citizen);
      }
    },

    dispose() {
      // Clean up when building demolished
      for (const resident of this.residents) {
        resident.house = null;
      }
    }
  };
}
```

### Key Lessons:
- **2D array for grid** - `data[x][y]` natural mapping
- **UUID for unique IDs** - `crypto.randomUUID()` built into modern JS
- **Updated flag** - Mark when visual refresh needed
- **Factory functions** - Return objects, not classes (simpler)
- **Dispose pattern** - Clean up references when objects destroyed

---

## Visual Rendering (Textures & Shadows)

### Dynamic Shadow System

```typescript
// Shadow setup
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Soft shadows

// Directional light (the "sun")
const sun = new THREE.DirectionalLight(0xffffff, 1.0);
sun.position.set(10, 20, 10);
sun.castShadow = true;

// Shadow camera bounds (orthographic frustum)
const mapSize = 16;
sun.shadow.camera.left = -mapSize;
sun.shadow.camera.right = mapSize;
sun.shadow.camera.top = mapSize;
sun.shadow.camera.bottom = -mapSize;
sun.shadow.camera.near = 0.5;
sun.shadow.camera.far = 50;

// Shadow map resolution (higher = sharper, slower)
sun.shadow.mapSize.width = 1024;
sun.shadow.mapSize.height = 1024;

scene.add(sun);

// Ambient light (fill shadows so not pitch black)
const ambient = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambient);

// Enable shadows on meshes
mesh.castShadow = true;    // This object casts shadows
mesh.receiveShadow = true; // This object receives shadows
```

### Debugging Shadow Frustum

```typescript
// Visualize shadow camera bounds
const helper = new THREE.CameraHelper(sun.shadow.camera);
scene.add(helper);

// Adjust bounds to encompass entire map
// If map is 16x16, set left=-16, right=16, top=16, bottom=-16
```

### Key Lessons:
- **Directional light** - Parallel rays, perfect for sun
- **Shadow camera bounds** - Must encompass entire map
- **Shadow map resolution** - 512 (fast) to 2048+ (sharp)
- **Soft shadows** - `PCFSoftShadowMap` looks better than hard shadows
- **Ambient light** - Prevents pure black shadows (unrealistic)

---

## Simulation Systems

### Breadth-First Search (Pathfinding)

```typescript
// BFS for finding nearest building/resource
function findTile(
  startX: number,
  startY: number,
  searchCriteria: (tile: Tile) => boolean,
  maxDistance: number
): Tile | null {

  const visited = new Set<string>(); // Fast lookup: O(1)
  const queue: Tile[] = [];
  const startTile = this.getTile(startX, startY);

  if (!startTile) return null;
  queue.push(startTile);

  while (queue.length > 0) {
    const tile = queue.shift()!; // Dequeue first element

    // Skip if already visited
    if (visited.has(tile.id)) continue;
    visited.add(tile.id);

    // Check distance (Manhattan distance)
    const distance = Math.abs(tile.x - startX) + Math.abs(tile.y - startY);
    if (distance > maxDistance) continue;

    // Check if tile matches criteria
    if (searchCriteria(tile)) {
      return tile; // Found it!
    }

    // Add neighbors to queue
    const neighbors = this.getTileNeighbors(tile.x, tile.y);
    queue.push(...neighbors);
  }

  return null; // Nothing found
}

// Get adjacent tiles (4-directional)
function getTileNeighbors(x: number, y: number): Tile[] {
  const neighbors: Tile[] = [];

  if (x > 0) neighbors.push(this.data[x - 1][y]); // Left
  if (x < this.width - 1) neighbors.push(this.data[x + 1][y]); // Right
  if (y > 0) neighbors.push(this.data[x][y - 1]); // Down
  if (y < this.height - 1) neighbors.push(this.data[x][y + 1]); // Up

  return neighbors;
}

// Manhattan distance (grid-based movement)
function distanceTo(other: Tile): number {
  return Math.abs(this.x - other.x) + Math.abs(this.y - other.y);
}
```

### Citizen Job System

```typescript
// Citizen state machine
enum CitizenState {
  Unemployed = 'unemployed',
  Employed = 'employed'
}

class Citizen {
  name: string;
  age: number;
  house: Building | null;
  job: Building | null;
  state: CitizenState;
  stateCounter: number;

  update(city: City) {
    switch (this.state) {
      case CitizenState.Unemployed:
        // ACTION: Look for job
        this.findJob(city);

        // TRANSITION: If found job, become employed
        if (this.job) {
          console.log(`${this.name} found job at ${this.job.name}`);
          this.state = CitizenState.Employed;
        }
        break;

      case CitizenState.Employed:
        // ACTION: Work (no-op for now)

        // TRANSITION: If job no longer exists, become unemployed
        if (!this.job) {
          console.log(`${this.name} lost their job`);
          this.state = CitizenState.Unemployed;
        }
        break;
    }

    this.stateCounter++;
  }

  findJob(city: City) {
    if (!this.house) return;

    // Search for commercial/industrial building with openings
    const jobTile = city.findTile(
      this.house.x,
      this.house.y,
      (tile) => {
        const building = tile.building;
        if (!building) return false;
        if (building.type !== 'commercial' && building.type !== 'industrial') return false;
        return building.jobsAvailable() > 0;
      },
      10 // Max search distance
    );

    if (jobTile && jobTile.building) {
      jobTile.building.addWorker(this);
      this.job = jobTile.building;
    }
  }

  setJob(job: Building | null) {
    this.job = job;
  }
}
```

### Building Disposal Pattern

```typescript
// Clean up references when building demolished
class Building {
  dispose() {
    // Commercial/Industrial: Fire all workers
    if (this.workers) {
      for (const worker of this.workers) {
        worker.setJob(null); // Citizen becomes unemployed
      }
    }

    // Residential: Evict all residents
    if (this.residents) {
      for (const resident of this.residents) {
        resident.house = null; // Citizen becomes homeless
      }
    }
  }
}

// Call dispose when removing building
class Tile {
  removeBuilding() {
    if (this.building) {
      this.building.dispose(); // Clean up first!
      this.building = null;
    }
  }
}
```

### Key Lessons:
- **BFS for locality** - Finds nearest match, expands outward
- **Set for visited** - O(1) lookup vs O(n) for arrays
- **Manhattan distance** - Grid movement (no diagonals)
- **State machines** - Clear transitions, single responsibility
- **Dispose pattern** - Always clean up references to prevent orphans

---

## Module Architecture Pattern

### Problem: Monolithic Code

```typescript
// BAD: Everything in one class
class Zone {
  // Development logic
  isDeveloped: boolean;
  isAbandoned: boolean;
  developmentLevel: number;
  abandonmentTimer: number;

  // Road access logic
  hasRoadAccess: boolean;
  roadSearchDistance: number;

  // Jobs logic
  workers: Citizen[];
  jobOpenings: number;

  simulate() {
    // 200 lines of mixed logic
    // Hard to follow, hard to extend
  }
}
```

### Solution: Module Pattern

```typescript
// modules/development-module.ts
export class DevelopmentModule {
  state: 'undeveloped' | 'under_construction' | 'developed' | 'abandoned';
  level: number;
  abandonmentTimer: number;

  constructor(private tile: Tile) {
    this.state = 'undeveloped';
    this.level = 0;
    this.abandonmentTimer = 0;
  }

  simulate(city: City) {
    switch (this.state) {
      case 'undeveloped':
        if (this.canDevelop(city)) {
          this.state = 'under_construction';
        }
        break;

      case 'under_construction':
        if (Math.random() < 0.1) {
          this.state = 'developed';
          this.level = 1;
        }
        break;

      case 'developed':
        if (!this.hasRequiredServices(city)) {
          this.abandonmentTimer++;
          if (this.abandonmentTimer > 30) {
            this.state = 'abandoned';
          }
        } else {
          this.abandonmentTimer = 0;
          if (Math.random() < 0.05 && this.level < 5) {
            this.level++;
          }
        }
        break;

      case 'abandoned':
        // Demolish after time
        break;
    }
  }

  canDevelop(city: City): boolean {
    // Check road access, power, etc.
    return this.tile.roadAccess.value;
  }

  hasRequiredServices(city: City): boolean {
    // Check ongoing requirements
    return this.tile.roadAccess.value && this.tile.power.value;
  }
}

// modules/road-access-module.ts
export class RoadAccessModule {
  value: boolean;

  constructor(private tile: Tile) {
    this.value = false;
  }

  simulate(city: City) {
    // Search for nearby road
    const roadTile = city.findTile(
      this.tile.x,
      this.tile.y,
      (t) => t.building?.type === 'road',
      5 // Max distance
    );

    this.value = roadTile !== null;
  }
}

// zone.ts - Clean, modular
class Zone {
  development: DevelopmentModule;
  roadAccess: RoadAccessModule;
  power: PowerModule;

  constructor(x: number, y: number, type: string) {
    this.development = new DevelopmentModule(this);
    this.roadAccess = new RoadAccessModule(this);
    this.power = new PowerModule(this);
  }

  simulate(city: City) {
    // Just delegate to modules
    this.development.simulate(city);
    this.roadAccess.simulate(city);
    this.power.simulate(city);
  }

  updateMesh() {
    // Only update visuals when state changes
    if (this.development.stateChanged) {
      // Regenerate mesh based on development.level
    }
  }
}
```

### Key Lessons:
- **Single responsibility** - Each module handles one concern
- **Independent blocks** - Add features without touching other code
- **Easy testing** - Test modules in isolation
- **Clear dependencies** - Modules receive city context
- **2-line simulate** - Main class just delegates

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1)
- [ ] Basic 3D scene with Three.js
- [ ] Orbital camera system (pan, zoom, rotate)
- [ ] 2D tile grid data model
- [ ] Raycasting for tile selection

### Phase 2: Visuals (Week 2)
- [ ] Asset factory system
- [ ] Texture loading and management
- [ ] Shadow system (directional light + ambient)
- [ ] ASCII overlay (for hybrid ASCII/3D view)

### Phase 3: Interaction (Week 3)
- [ ] Toolbar with tool selection
- [ ] Place/remove buildings
- [ ] Info panel (HTML generation)
- [ ] Drag-to-place functionality

### Phase 4: Simulation (Week 4)
- [ ] Building growth system
- [ ] Module architecture (development, road access, power)
- [ ] BFS pathfinding
- [ ] Citizen system (basic)

### Phase 5: NPCs & Integration (Week 5-6)
- [ ] NPCs appear on map at their location
- [ ] NPCs move between locations (home, work, hangouts)
- [ ] Buildings linked to NPCs (ownership, work, visits)
- [ ] Events trigger location changes (NPC posts "At The Underground")

---

## ASCII Overlay Integration

### Hybrid Rendering Approach

```typescript
// ascii-overlay.tsx - Render ASCII on top of 3D
export function AsciiOverlay({ city, camera }) {
  const lines = useMemo(() => {
    const output: string[] = [];

    for (let y = 0; y < city.height; y++) {
      let line = '';
      for (let x = 0; x < city.width; x++) {
        const tile = city.getTile(x, y);
        line += getTileChar(tile);
      }
      output.push(line);
    }

    return output;
  }, [city]);

  return (
    <pre style={{
      position: 'absolute',
      top: 0,
      left: 0,
      pointerEvents: 'none',
      fontFamily: 'monospace',
      color: 'rgba(255, 255, 255, 0.8)',
      textShadow: '0 0 4px black'
    }}>
      {lines.join('\n')}
    </pre>
  );
}

function getTileChar(tile: Tile): string {
  if (!tile.building) return '.';

  switch (tile.building.type) {
    case 'residential': return 'R';
    case 'commercial': return 'C';
    case 'industrial': return 'I';
    case 'road': return '─';
    default: return '?';
  }
}
```

---

## Performance Considerations

### Optimization Strategies

1. **Frustum Culling** - Three.js handles automatically
2. **LOD (Level of Detail)** - Simpler meshes when zoomed out
3. **Instancing** - For many identical objects (trees, cars)
4. **Lazy Updates** - Only update visuals when `updated` flag true
5. **Throttle Mouse Events** - Limit to 60fps (16ms intervals)
6. **Object Pooling** - Reuse meshes instead of create/destroy

```typescript
// Throttle mouse move to 60fps
let lastMoveTime = 0;
function onMouseMove(event: MouseEvent) {
  const now = Date.now();
  if (now - lastMoveTime < 16) return; // 1/60 second
  lastMoveTime = now;

  // Handle mouse move...
}
```

---

## Summary: Key Takeaways

### Architecture
✅ **Unified data + visuals** - Objects manage their own rendering
✅ **Factory pattern** - Functions create instances, not classes
✅ **Module pattern** - Single responsibility, composable systems

### Rendering
✅ **Shared geometries** - Create once, reuse many times
✅ **Texture library** - Load once, clone as needed
✅ **Shadow setup** - Directional light + ambient fill + shadow bounds

### Interaction
✅ **Raycasting** - Screen coords → 3D selection
✅ **userData** - Store metadata on meshes for reverse lookup
✅ **Tool pattern** - Active tool determines click action

### Simulation
✅ **BFS pathfinding** - Find nearest resource/building
✅ **State machines** - Clear transitions for citizens/buildings
✅ **Dispose pattern** - Clean up references on demolish

### Performance
✅ **Updated flags** - Only regenerate visuals when needed
✅ **Throttle events** - Limit mouse move to 60fps
✅ **Set for visited** - O(1) lookup in pathfinding

---

**Next Steps:**
1. Set up basic Three.js scene in WorldViewer component
2. Implement orbital camera with pan/zoom/rotate
3. Create tile grid data model
4. Add raycasting for tile selection
5. Build ASCII overlay to render on top of 3D

**Reference Implementation:**
All code examples synthesized from Coffee Code Create's SimCity tutorial series.
