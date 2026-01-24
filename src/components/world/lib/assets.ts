/**
 * Asset Factory
 *
 * Factory functions for creating Three.js meshes.
 * Follows SimCity tutorial patterns: shared geometries, factory functions.
 */

import * as THREE from 'three';
import type { Building, Landmark, AINPCLocation, BackgroundNPC, District } from '../../../stores/worldStore.js';

// ============================================================================
// Shared Geometries (created once, reused many times)
// ============================================================================

const CUBE_GEOMETRY = new THREE.BoxGeometry(1, 1, 1);
const SPHERE_GEOMETRY = new THREE.SphereGeometry(1, 12, 8);
const PLANE_GEOMETRY = new THREE.PlaneGeometry(1, 1);
const CONE_GEOMETRY = new THREE.ConeGeometry(0.5, 1, 6);

// ============================================================================
// Color Palettes
// ============================================================================

/**
 * Building colors by type
 */
export const BUILDING_COLORS: Record<string, number> = {
  // Residential
  apartment: 0x8b7355,
  house: 0xa0522d,
  condo: 0x9b8b7a,
  townhouse: 0x8b6914,

  // Commercial
  office: 0x5b8fa8,
  retail: 0x6b8e9b,
  mall: 0x4a7a8c,
  shop: 0x7a9ba8,

  // Food & Drink
  cafe: 0xdeb887,
  restaurant: 0xcd853f,
  bar: 0x8b0000,
  club: 0x4b0082,
  brewery: 0xb8860b,

  // Entertainment
  theater: 0x9932cc,
  cinema: 0x8b008b,
  gallery: 0xda70d6,
  museum: 0xba55d3,
  stadium: 0x6a5acd,

  // Services
  gym: 0x2e8b57,
  spa: 0x3cb371,
  salon: 0xff69b4,
  hotel: 0x4682b4,
  hospital: 0xffffff,

  // Education
  school: 0xffd700,
  university: 0xdaa520,
  library: 0xf4a460,

  // Public
  park: 0x228b22,
  plaza: 0x808080,
  government: 0x696969,
  church: 0xf5f5dc,

  // Industrial
  factory: 0x708090,
  warehouse: 0x778899,
  industrial: 0x5f6a6a,

  // Default
  default: 0x808080,
};

/**
 * District colors (from existing worldStore usage)
 */
export const DISTRICT_COLORS: Record<string, number> = {
  downtown: 0x4a90a4,
  arts: 0x9b59b6,
  university: 0x27ae60,
  nightlife: 0xe74c3c,
  waterfront: 0x3498db,
  residential: 0x95a5a6,
  shopping: 0xf39c12,
  industrial: 0x34495e,
  parks: 0x2ecc71,
  default: 0x7f8c8d,
};

/**
 * NPC marker colors
 */
export const NPC_COLORS = {
  ai: 0x4a9eff, // Blue for AI NPCs
  aiHover: 0x6ab4ff,
  background: 0x808080, // Gray for background NPCs
  backgroundHover: 0xa0a0a0,
  player: 0x00ff00, // Green for player home
};

// ============================================================================
// Building Factory
// ============================================================================

/**
 * Get building height based on type and capacity
 */
function getBuildingHeight(building: Building): number {
  const baseHeight: Record<string, number> = {
    house: 0.4,
    apartment: 1.0,
    condo: 1.2,
    townhouse: 0.6,
    office: 1.5,
    retail: 0.5,
    mall: 0.8,
    cafe: 0.4,
    restaurant: 0.5,
    bar: 0.4,
    club: 0.6,
    park: 0.05,
    plaza: 0.02,
    factory: 0.7,
    warehouse: 0.6,
    default: 0.5,
  };

  const base = baseHeight[building.type] || baseHeight.default;

  // Scale by capacity (more capacity = taller building)
  const capacityMultiplier = 1 + Math.log10(Math.max(1, building.capacity)) * 0.3;

  return base * capacityMultiplier;
}

/**
 * Create a building mesh
 */
export function createBuildingMesh(building: Building, scale: number = 1): THREE.Mesh {
  const color = BUILDING_COLORS[building.type] || BUILDING_COLORS.default;
  const height = getBuildingHeight(building);

  const material = new THREE.MeshLambertMaterial({ color });
  const mesh = new THREE.Mesh(CUBE_GEOMETRY, material);

  // Scale to building size
  mesh.scale.set(
    building.size.width * scale,
    height * scale,
    building.size.height * scale
  );

  // Position (y offset so building sits on ground)
  mesh.position.set(
    building.position.x * scale,
    (height * scale) / 2,
    building.position.y * scale
  );

  // Enable shadows
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  // Store data for raycasting lookup
  mesh.userData = {
    type: 'building',
    id: building.id,
    name: building.name,
    buildingType: building.type,
    districtId: building.districtId,
    capacity: building.capacity,
    isResidential: building.isResidential,
    isWorkplace: building.isWorkplace,
  };

  return mesh;
}

// ============================================================================
// NPC Marker Factory
// ============================================================================

/**
 * Create an NPC marker (sphere)
 */
export function createNPCMarker(
  npc: AINPCLocation | BackgroundNPC,
  isAI: boolean,
  scale: number = 1
): THREE.Mesh {
  const radius = isAI ? 0.3 : 0.15;
  const color = isAI ? NPC_COLORS.ai : NPC_COLORS.background;

  const material = new THREE.MeshLambertMaterial({
    color,
    emissive: isAI ? 0x1a4a7a : 0x000000,
    emissiveIntensity: isAI ? 0.3 : 0,
  });

  const mesh = new THREE.Mesh(SPHERE_GEOMETRY, material);
  mesh.scale.setScalar(radius * scale);

  // Position above ground
  const groundOffset = radius * scale + 0.1;
  mesh.position.set(
    npc.position.x * scale,
    groundOffset,
    npc.position.y * scale
  );

  // Store data for raycasting lookup
  if ('npcId' in npc) {
    // AI NPC
    mesh.userData = {
      type: 'npc',
      id: npc.npcId,
      isAI: true,
      activity: npc.activity,
      activityDescription: npc.activityDescription,
      buildingId: npc.buildingId,
    };
  } else {
    // Background NPC
    mesh.userData = {
      type: 'npc',
      id: npc.id,
      isAI: false,
      name: npc.name,
      state: npc.state,
      activityLabel: npc.activityLabel,
    };
  }

  return mesh;
}

/**
 * Update NPC marker position (for animation)
 */
export function updateNPCMarkerPosition(
  mesh: THREE.Mesh,
  position: { x: number; y: number },
  scale: number = 1
): void {
  const radius = mesh.userData.isAI ? 0.3 : 0.15;
  const groundOffset = radius * scale + 0.1;

  mesh.position.set(
    position.x * scale,
    groundOffset,
    position.y * scale
  );
}

/**
 * Highlight NPC marker on hover
 */
export function highlightNPCMarker(mesh: THREE.Mesh, highlighted: boolean): void {
  const material = mesh.material as THREE.MeshLambertMaterial;
  const isAI = mesh.userData.isAI;

  if (highlighted) {
    material.color.setHex(isAI ? NPC_COLORS.aiHover : NPC_COLORS.backgroundHover);
    material.emissiveIntensity = isAI ? 0.5 : 0.2;
    mesh.scale.multiplyScalar(1.2);
  } else {
    material.color.setHex(isAI ? NPC_COLORS.ai : NPC_COLORS.background);
    material.emissiveIntensity = isAI ? 0.3 : 0;
    mesh.scale.divideScalar(1.2);
  }
}

// ============================================================================
// Landmark Factory
// ============================================================================

/**
 * Create a landmark marker (special building indicator)
 */
export function createLandmarkMarker(
  landmark: Landmark,
  building: Building,
  scale: number = 1
): THREE.Group {
  const group = new THREE.Group();

  // Glowing beacon above the building
  const beaconMaterial = new THREE.MeshBasicMaterial({
    color: 0xffd700,
    transparent: true,
    opacity: 0.8,
  });

  const beacon = new THREE.Mesh(CONE_GEOMETRY, beaconMaterial);

  const buildingHeight = getBuildingHeight(building) * scale;
  beacon.position.set(
    building.position.x * scale,
    buildingHeight + 0.5 * scale,
    building.position.y * scale
  );
  beacon.rotation.x = Math.PI; // Point downward

  beacon.scale.set(0.3 * scale, 0.5 * scale, 0.3 * scale);

  group.add(beacon);

  // Store data
  group.userData = {
    type: 'landmark',
    id: landmark.id,
    name: landmark.name,
    buildingId: landmark.buildingId,
    description: landmark.description,
    iconEmoji: landmark.iconEmoji,
    isNotable: landmark.isNotable,
  };

  return group;
}

// ============================================================================
// Terrain Factory
// ============================================================================

/**
 * Create a terrain tile
 */
export function createTerrainTile(
  x: number,
  y: number,
  district: District | null,
  scale: number = 1
): THREE.Mesh {
  const color = district
    ? parseInt(district.color.replace('#', '0x'), 16)
    : DISTRICT_COLORS.default;

  // Darken the color for ground (so buildings stand out)
  const darkenedColor = new THREE.Color(color).multiplyScalar(0.4);

  const material = new THREE.MeshLambertMaterial({
    color: darkenedColor,
  });

  const mesh = new THREE.Mesh(PLANE_GEOMETRY, material);

  // Rotate to lie flat
  mesh.rotation.x = -Math.PI / 2;

  // Position
  mesh.position.set(x * scale, 0, y * scale);
  mesh.scale.set(scale, scale, 1);

  // Receive shadows
  mesh.receiveShadow = true;

  // Store data
  mesh.userData = {
    type: 'terrain',
    x,
    y,
    districtId: district?.id || null,
    districtName: district?.name || null,
  };

  return mesh;
}

/**
 * Create a ground plane for the entire city
 */
export function createGroundPlane(
  width: number,
  height: number,
  scale: number = 1
): THREE.Mesh {
  const geometry = new THREE.PlaneGeometry(width * scale, height * scale);
  const material = new THREE.MeshLambertMaterial({
    color: 0x1a1a1a,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set((width * scale) / 2, -0.01, (height * scale) / 2);
  mesh.receiveShadow = true;

  mesh.userData = {
    type: 'ground',
  };

  return mesh;
}

// ============================================================================
// Player Home Marker
// ============================================================================

/**
 * Create a marker for the player's home
 */
export function createPlayerHomeMarker(
  position: { x: number; y: number },
  scale: number = 1
): THREE.Mesh {
  const material = new THREE.MeshBasicMaterial({
    color: NPC_COLORS.player,
    transparent: true,
    opacity: 0.8,
  });

  const mesh = new THREE.Mesh(CONE_GEOMETRY, material);
  mesh.position.set(
    position.x * scale,
    1.5 * scale,
    position.y * scale
  );
  mesh.rotation.x = Math.PI; // Point downward
  mesh.scale.set(0.4 * scale, 0.8 * scale, 0.4 * scale);

  mesh.userData = {
    type: 'playerHome',
  };

  return mesh;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Dispose of a mesh's geometry and material
 */
export function disposeMesh(mesh: THREE.Mesh | THREE.Group): void {
  if (mesh instanceof THREE.Mesh) {
    // Geometry is shared, don't dispose
    // But do dispose materials
    if (Array.isArray(mesh.material)) {
      mesh.material.forEach((m: THREE.Material) => m.dispose());
    } else {
      mesh.material.dispose();
    }
  } else if (mesh instanceof THREE.Group) {
    mesh.traverse((child: THREE.Object3D) => {
      if (child instanceof THREE.Mesh) {
        if (Array.isArray(child.material)) {
          child.material.forEach((m: THREE.Material) => m.dispose());
        } else {
          child.material.dispose();
        }
      }
    });
  }
}
