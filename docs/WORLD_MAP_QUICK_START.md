# World Map Quick Start Guide

**Fast implementation checklist for engAIge World Map**

This document provides a condensed, actionable roadmap to get the world map running quickly.

---

## 30-Minute MVP

**Goal:** See a 3D map with clickable tiles

### Step 1: Scene Setup (10 min)

```tsx
// src/components/world/WorldViewer.tsx
import * as THREE from 'three';
import { useEffect, useRef } from 'react';

export function WorldViewer() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(10, 10, 10);
    camera.lookAt(0, 0, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);

    // Lighting
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(10, 20, 10);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 0.3));

    // Render loop
    function animate() {
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }
    animate();

    return () => {
      renderer.dispose();
    };
  }, []);

  return <div ref={containerRef} />;
}
```

### Step 2: Add Grid (10 min)

```tsx
// Add after lighting setup
const gridSize = 16;
const geometry = new THREE.BoxGeometry(1, 0.1, 1);

for (let x = 0; x < gridSize; x++) {
  for (let z = 0; z < gridSize; z++) {
    const material = new THREE.MeshStandardMaterial({
      color: 0x7cfc00 // Grass green
    });
    const tile = new THREE.Mesh(geometry, material);
    tile.position.set(x - gridSize / 2, 0, z - gridSize / 2);
    tile.userData = { x, z, type: 'grass' };
    scene.add(tile);
  }
}
```

### Step 3: Add Interaction (10 min)

```tsx
// Add raycasting
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onMouseClick(event: MouseEvent) {
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children);

  if (intersects.length > 0) {
    const obj = intersects[0].object;
    console.log('Clicked:', obj.userData);
    (obj as THREE.Mesh).material.color.setHex(0xff0000); // Red highlight
  }
}

renderer.domElement.addEventListener('click', onMouseClick);
```

**Result:** 16×16 green grid, click tiles to highlight red

---

## 2-Hour Prototype

**Goal:** Add camera controls, buildings, NPC markers

### Step 4: Orbital Camera (30 min)

```tsx
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// After camera setup
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Smooth movement
controls.dampingFactor = 0.05;
controls.minDistance = 5;
controls.maxDistance = 30;
controls.maxPolarAngle = Math.PI / 2; // Don't go below ground

// In animate loop
controls.update();
```

### Step 5: Building System (45 min)

```tsx
// Building factory
function createBuilding(type: string, x: number, z: number, height = 1) {
  const colorMap = {
    residential: 0x00ff00,
    commercial: 0x0000ff,
    industrial: 0xffff00,
  };

  const geometry = new THREE.BoxGeometry(0.8, height, 0.8);
  const material = new THREE.MeshStandardMaterial({
    color: colorMap[type] || 0x808080
  });

  const building = new THREE.Mesh(geometry, material);
  building.position.set(x - 8, height / 2, z - 8); // Center grid
  building.userData = { type, x, z, height };
  building.castShadow = true;
  building.receiveShadow = true;

  return building;
}

// Add some test buildings
scene.add(createBuilding('residential', 3, 3, 2));
scene.add(createBuilding('commercial', 7, 5, 3));
scene.add(createBuilding('industrial', 10, 10, 1));
```

### Step 6: NPC Markers (45 min)

```tsx
// NPC marker (simple sphere)
function createNPCMarker(name: string, x: number, z: number) {
  const geometry = new THREE.SphereGeometry(0.3, 8, 8);
  const material = new THREE.MeshStandardMaterial({ color: 0xff69b4 }); // Pink
  const marker = new THREE.Mesh(geometry, material);
  marker.position.set(x - 8, 1, z - 8); // Above ground
  marker.userData = { type: 'npc', name, x, z };
  return marker;
}

// Add test NPCs
scene.add(createNPCMarker('Derek', 3, 3)); // At residential
scene.add(createNPCMarker('Mars', 7, 5)); // At commercial
```

**Result:** Orbitabl camera, colored buildings, pink NPC spheres

---

## Full Day Implementation

**Goal:** Integrate with existing game systems

### Step 7: Data Model Integration (2 hours)

```tsx
// Create city data model
interface Tile {
  x: number;
  z: number;
  terrainType: string;
  building: Building | null;
  npcs: NPC[];
}

interface Building {
  id: string;
  type: 'residential' | 'commercial' | 'industrial' | 'landmark';
  name: string;
  height: number;
}

interface NPC {
  id: string;
  name: string;
  currentLocation: { x: number; z: number };
}

// Generate city
function generateCity(size: number): Tile[][] {
  const city: Tile[][] = [];
  for (let x = 0; x < size; x++) {
    city[x] = [];
    for (let z = 0; z < size; z++) {
      city[x][z] = {
        x,
        z,
        terrainType: 'grass',
        building: null,
        npcs: []
      };
    }
  }
  return city;
}

// Render from data
function renderCity(city: Tile[][], scene: THREE.Scene) {
  city.forEach(row => {
    row.forEach(tile => {
      // Render terrain
      renderTerrain(tile, scene);

      // Render building if present
      if (tile.building) {
        const mesh = createBuilding(
          tile.building.type,
          tile.x,
          tile.z,
          tile.building.height
        );
        scene.add(mesh);
      }

      // Render NPCs
      tile.npcs.forEach(npc => {
        const marker = createNPCMarker(npc.name, tile.x, tile.z);
        scene.add(marker);
      });
    });
  });
}
```

### Step 8: Info Panel (2 hours)

```tsx
// UI overlay component
function InfoPanel({ selectedObject }: { selectedObject: any }) {
  if (!selectedObject) return null;

  const { type, name, x, z } = selectedObject.userData;

  return (
    <div className="absolute top-4 right-4 bg-black/80 text-white p-4 rounded">
      <h3 className="font-bold">{name || type}</h3>
      <p>Position: ({x}, {z})</p>

      {type === 'npc' && (
        <>
          <p>Relationship: Friend</p>
          <button className="mt-2 px-4 py-2 bg-blue-500 rounded">
            Message
          </button>
        </>
      )}

      {type === 'building' && (
        <>
          <p>Type: {type}</p>
          <button className="mt-2 px-4 py-2 bg-green-500 rounded">
            Enter
          </button>
        </>
      )}
    </div>
  );
}

// In WorldViewer
const [selectedObject, setSelectedObject] = useState(null);

// Update click handler
function onMouseClick(event: MouseEvent) {
  // ... raycasting code ...
  if (intersects.length > 0) {
    setSelectedObject(intersects[0].object);
  }
}

return (
  <>
    <div ref={containerRef} />
    <InfoPanel selectedObject={selectedObject} />
  </>
);
```

### Step 9: NPC Database Integration (2 hours)

```tsx
// Hook into existing NPC system
import { useNPCs } from '@/hooks/useNPCs';

export function WorldViewer() {
  const { npcs } = useNPCs();

  useEffect(() => {
    // Clear old NPC markers
    scene.children = scene.children.filter(
      child => child.userData.type !== 'npc'
    );

    // Add NPC markers from database
    npcs.forEach(npc => {
      const location = getNPCLocation(npc); // Determine from schedule/activity
      if (location) {
        const marker = createNPCMarker(npc.username, location.x, location.z);
        scene.add(marker);
      }
    });
  }, [npcs]);

  // Determine NPC location from their current activity
  function getNPCLocation(npc: NPC) {
    // Check current time and NPC schedule
    const hour = new Date().getHours();

    if (hour >= 9 && hour < 17 && npc.occupation) {
      return npc.workplace || npc.home; // At work
    } else if (hour >= 17 && hour < 22) {
      return npc.hangout || npc.home; // Evening social
    } else {
      return npc.home; // At home
    }
  }
}
```

### Step 10: ASCII Overlay (2 hours)

```tsx
// ASCII rendering layer
export function AsciiOverlay({ city }: { city: Tile[][] }) {
  const lines = city.map(row =>
    row.map(tile => {
      if (tile.npcs.length > 0) return '@';
      if (tile.building) return tile.building.type[0].toUpperCase();
      return '.';
    }).join(' ')
  );

  return (
    <pre className="absolute top-0 left-0 pointer-events-none font-mono text-green-400">
      {lines.join('\n')}
    </pre>
  );
}

// Toggle in WorldViewer
const [showASCII, setShowASCII] = useState(false);

return (
  <>
    <div ref={containerRef} />
    {showASCII && <AsciiOverlay city={city} />}
    <button onClick={() => setShowASCII(!showASCII)}>
      Toggle ASCII
    </button>
  </>
);
```

---

## Integration Checklist

### Connect to Existing Systems

- [ ] **NPCs** - Query from `npc.db`, show on map at current location
- [ ] **Locations** - Define building database (Quantum Coffee, The Underground, etc.)
- [ ] **Events** - Highlight locations when events active
- [ ] **Messages** - Click NPC → open messaging window
- [ ] **News Feed** - NPC posts trigger map pans ("Derek posted from Quantum Coffee")
- [ ] **Relationship** - Show relationship level on NPC hover
- [ ] **Time** - Day/night cycle matches game time
- [ ] **Weather** - Visual effects from weather system

### Performance Optimization

- [ ] **Frustum culling** - Don't render off-screen objects
- [ ] **LOD** - Simplify distant buildings
- [ ] **Instancing** - Reuse geometries for identical buildings
- [ ] **Lazy loading** - Load distant tiles on demand
- [ ] **Throttle updates** - Only update visuals when data changes

### Accessibility

- [ ] **ASCII mode** - Full navigation via text
- [ ] **Keyboard controls** - Arrow keys to pan, +/- to zoom
- [ ] **Screen reader** - Announce selected objects
- [ ] **High contrast** - Option for colorblind users
- [ ] **Reduced motion** - Disable camera swoops

---

## File Structure

```
src/components/world/
├── WorldViewer.tsx          # Main 3D scene component
├── AsciiOverlay.tsx         # Text overlay layer
├── InfoPanel.tsx            # Selected object details
├── MapControls.tsx          # UI controls (zoom, toggle, search)
└── lib/
    ├── scene-setup.ts       # Three.js initialization
    ├── camera-controls.ts   # Orbital camera logic
    ├── asset-factory.ts     # Create buildings/NPCs
    ├── raycasting.ts        # Mouse selection
    └── city-renderer.ts     # Data → visuals
```

---

## Common Pitfalls

### Problem: Camera at origin, can't see anything
**Solution:** Set initial position: `camera.position.set(10, 10, 10)`

### Problem: Objects render black (no lighting)
**Solution:** Add `DirectionalLight` + `AmbientLight`

### Problem: Shadows don't appear
**Solution:**
```tsx
renderer.shadowMap.enabled = true;
light.castShadow = true;
mesh.castShadow = true;
mesh.receiveShadow = true;
```

### Problem: Click detection doesn't work
**Solution:** Ensure `renderer.domElement` is the event target, not window

### Problem: Memory leak (scene doesn't clean up)
**Solution:** Call `renderer.dispose()` in useEffect cleanup

### Problem: NPCs flicker when updating
**Solution:** Don't recreate meshes, move existing ones:
```tsx
marker.position.set(newX, 1, newZ);
```

---

## Next Steps

**After basic map works:**

1. **Textures** - Replace flat colors with building textures
2. **Animations** - NPCs walk between locations
3. **Particles** - Weather effects (rain, snow)
4. **Interiors** - Show inside buildings on zoom
5. **Minimap** - 2D top-down view in corner
6. **Search** - "Find: Derek" highlights on map
7. **Lore** - Click objects to reveal secrets
8. **Events** - Visual indicators for active events

**Reference Documents:**
- [WORLD_MAP_DEVELOPMENT_GUIDE.md](./WORLD_MAP_DEVELOPMENT_GUIDE.md) - Technical deep dive
- [WORLD_MAP_VISUAL_SIMULATION.md](./WORLD_MAP_VISUAL_SIMULATION.md) - UX design

---

## Minimal Test Case

**Copy-paste this into a new component to test Three.js setup:**

```tsx
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export function TestScene() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);

    const camera = new THREE.PerspectiveCamera(75, 800 / 600, 0.1, 1000);
    camera.position.set(5, 5, 5);

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(800, 600);
    ref.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(10, 10, 10);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 0.3));

    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    function animate() {
      controls.update();
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }
    animate();

    return () => renderer.dispose();
  }, []);

  return <div ref={ref} />;
}
```

**Expected Result:** Rotating green cube with orbital camera

If this works, your Three.js setup is correct. Proceed to full implementation.
