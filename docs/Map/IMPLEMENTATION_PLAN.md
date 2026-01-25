# World Map Visual Simulation - Implementation Plan

## Overview

Upgrade the existing WorldViewer component to match the visual quality of the Gemini demo while preserving the solid backend integration (WebSocket, worldStore, database schemas).

**Current State:**
- `src/components/world/WorldViewer.tsx` - Functional but uses primitive boxes/spheres
- `src/components/world/lib/assets.ts` - Factory functions for meshes
- Backend integration working (worldStore, WebSocket, npc_locations)

**Target State:**
- Visually rich isometric city like the Gemini demo
- Terrain with water bodies and mountains at edges
- Moving cars on roads, animated pedestrians
- Day/night cycle with window lighting
- GLB models for buildings/vehicles (from docs/Map/models/)
- Click-to-inspect preserved, connected to game systems

---

## Phase 1: Terrain & Road System

**Goal:** Replace flat ground plane with procedural terrain featuring roads, water, and mountains.

### 1.1 Add Simplex Noise
- Install or bundle simplex-noise library
- Create `src/components/world/lib/terrain.ts`

### 1.2 Terrain Generation
```
- Grid-based terrain (matching city bounds from worldStore)
- Noise-based elevation map:
  - Low values (< -0.3) = water tiles
  - High values (> 0.85 distance from center) = mountains at edges
  - Middle values = buildable land
- Road network on grid pattern (every N tiles)
- Bridges where roads cross water
```

### 1.3 Visual Elements
- Water tiles: Blue, semi-transparent, animated Y position (gentle waves)
- Mountains: Cone geometry with snow caps
- Roads: Dark gray with white lane markings
- Grass/sidewalk: Based on zoning

**Files to modify:**
- `src/components/world/lib/terrain.ts` (new)
- `src/components/world/lib/assets.ts` (add terrain factories)
- `src/components/world/WorldViewer.tsx` (integrate terrain rendering)

---

## Phase 2: Building Upgrades

**Goal:** Replace box primitives with textured buildings and eventually GLB models.

### 2.1 Procedural Building Textures
- Canvas-based texture generation (like Gemini demo)
- Windows that can be lit/unlit based on time
- Color variation by building type (residential/commercial/industrial)

### 2.2 GLB Model Loading
- Set up GLTFLoader from three/examples
- Create model registry mapping building types to GLB files:
  ```
  apartment → "Apartment building.glb"
  office → "Large Building.glb"
  skyscraper → "Skyscraper.glb"
  cafe → "Building.glb"
  ```
- Fallback to procedural if model not found

### 2.3 Building Placement
- Place buildings on non-road, non-water, non-mountain tiles
- Respect existing building data from worldStore (named locations)
- Fill remaining space with procedural buildings

**Files to modify:**
- `src/components/world/lib/assets.ts` (add GLB loading, texture generation)
- `src/components/world/lib/models.ts` (new - model registry and loader)

---

## Phase 3: Ambient Life (Vehicles & Pedestrians)

**Goal:** Add moving cars and pedestrians for visual life, separate from AI NPCs.

### 3.1 Vehicle System
- Spawn cars on road tiles
- Simple pathfinding: follow roads, turn at intersections
- Lane positioning (drive on right side)
- Multiple car colors/types
- Eventually use Car.glb, Police Car.glb, Toyota Hilux.glb models

### 3.2 Pedestrian System
- Spawn pedestrians on sidewalks/parks
- Wander behavior (not AI-driven, just visual)
- Simple capsule/cylinder geometry initially
- Walk animation (bob up/down)

### 3.3 Integration with AI NPCs
- AI NPCs from worldStore rendered differently (highlighted, named)
- Background pedestrians are anonymous visual filler
- AI NPCs can still be clicked to open profiles

**Files to create:**
- `src/components/world/lib/vehicles.ts` (car spawning, movement logic)
- `src/components/world/lib/pedestrians.ts` (pedestrian spawning, wandering)

---

## Phase 4: Day/Night Cycle & Lighting

**Goal:** Dynamic lighting that changes over time, buildings light up at night.

### 4.1 Game Time Integration
- Read `gameTime` from worldStore
- Map game hours to sun position

### 4.2 Lighting System
- DirectionalLight for sun (moves in arc)
- AmbientLight intensity varies by time
- Sky color changes (blue day → dark night)
- Fog color matches sky

### 4.3 Building Windows
- Track window materials in array
- Night: randomly light some windows (yellow/warm glow)
- Day: windows are dark
- Commercial buildings: more lit windows

### 4.4 Street Lights
- Spawn at road intersections
- PointLight that activates at night
- Bulb material changes color (gray → yellow)

**Files to modify:**
- `src/components/world/lib/scene.ts` (add day/night lighting setup)
- `src/components/world/lib/environment.ts` (new - day/night cycle logic)
- `src/components/world/WorldViewer.tsx` (integrate time-based updates)

---

## Phase 5: UI & Interaction Polish

**Goal:** Match the Gemini demo's HUD and info cards.

### 5.1 HUD Overlay
- Population count (AI NPCs from worldStore)
- Traffic count (vehicles)
- Current game time display
- Control hints

### 5.2 Info Cards
- Slide-in card when clicking NPC (name, activity, mood, location)
- Slide-in card when clicking building (name, type, occupants, value)
- Close button, animation

### 5.3 Integration Actions
- Click AI NPC → Option to open Messenger with them
- Click building → See list of NPCs inside
- Hover highlighting preserved

**Files to modify:**
- `src/components/world/WorldWindow.tsx` (add HUD overlay)
- `src/components/world/components/InfoCard.tsx` (new)
- `src/components/world/components/NPCCard.tsx` (new)
- `src/components/world/components/BuildingCard.tsx` (new)

---

## Implementation Order

1. **Phase 1** - Terrain first (biggest visual impact, foundation for everything)
2. **Phase 4** - Day/night cycle (works with primitive buildings)
3. **Phase 3** - Ambient life (cars/pedestrians add immediate visual interest)
4. **Phase 2** - Building upgrades (GLB models last, most complex)
5. **Phase 5** - UI polish (refinement after core visuals work)

---

## Technical Notes

### Three.js Version
- Current: Using three from npm (check package.json version)
- Gemini demo uses r128 from CDN
- Keep our npm version, use compatible imports

### GLB Model Loading
```typescript
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const loader = new GLTFLoader();
loader.load('/models/Building.glb', (gltf) => {
  scene.add(gltf.scene);
});
```

### Simplex Noise
- Option A: `npm install simplex-noise`
- Option B: Bundle the CDN version used in demo

### Performance Considerations
- Instanced meshes for repeated objects (cars, pedestrians, trees)
- LOD for distant buildings
- Frustum culling (Three.js handles automatically)
- Limit update frequency for non-critical animations

---

## Model Inventory (from docs/Map/models/)

| Model File | Suggested Use |
|------------|---------------|
| Apartment building.glb | Residential apartments |
| Big Building.glb | Large commercial |
| Building.glb | Generic commercial |
| City Building with Roof Garden.glb | Upscale residential |
| Large Building(1).glb | Office variant 1 |
| Large Building(2).glb | Office variant 2 |
| Large Building.glb | Office building |
| Skyscraper.glb | Downtown towers |
| Car.glb | Basic vehicle |
| Red Car.glb | Vehicle variant |
| Police Car.glb | Special vehicle |
| Toyota Hilux 97.glb | Truck/SUV |
| cartoon banana car.glb | Easter egg vehicle |
| Tree Assets.glb | Park decoration |

---

## Success Criteria

- [ ] Map has visible terrain (grass, water, mountains)
- [ ] Roads are rendered with lane markings
- [ ] Buildings have varied heights and colors by type
- [ ] Cars move along roads autonomously
- [ ] Pedestrians wander on sidewalks
- [ ] Day/night cycle changes lighting and sky
- [ ] Windows light up at night
- [ ] Clicking NPC shows info card
- [ ] Clicking building shows occupants
- [ ] AI NPCs from game database appear on map
- [ ] Performance stays smooth (60fps target)
