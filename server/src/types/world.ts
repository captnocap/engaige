/**
 * World System Types
 *
 * Types for the isometric city viewer, districts, buildings, and NPC locations.
 */

// ============================================================================
// City Structure
// ============================================================================

export interface CityData {
  name: string;
  realWorldSource: string;  // e.g., "Portland, OR"
  bounds: CityBounds;
  tileSize: number;         // Isometric tile size in pixels (e.g., 64)
  gridSize: { width: number; height: number };
  districts: District[];
  buildings: Building[];
  roads: Road[];
  landmarks: Landmark[];
  generatedAt: number;      // Unix timestamp
}

export interface CityBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

// ============================================================================
// Districts
// ============================================================================

export type DistrictType =
  | 'downtown'
  | 'arts'
  | 'university'
  | 'residential'
  | 'nightlife'
  | 'waterfront'
  | 'industrial'
  | 'shopping'
  | 'suburbs';

export interface District {
  id: string;
  name: string;
  type: DistrictType;
  description: string;
  bounds: DistrictBounds;   // Polygon defining district area
  color: string;            // Hex color for map rendering
  peakHours: number[];      // Hours (0-23) when district is busiest
  vibe: string;             // Description of district atmosphere
}

export interface DistrictBounds {
  // Array of [x, y] points forming a polygon
  points: Array<[number, number]>;
}

// ============================================================================
// Buildings
// ============================================================================

export type BuildingType =
  | 'apartment'
  | 'house'
  | 'office'
  | 'cafe'
  | 'restaurant'
  | 'bar'
  | 'club'
  | 'gym'
  | 'library'
  | 'bookstore'
  | 'gallery'
  | 'studio'
  | 'shop'
  | 'mall'
  | 'park'
  | 'plaza'
  | 'university'
  | 'hospital'
  | 'warehouse'
  | 'factory';

export interface Building {
  id: string;
  name: string;
  type: BuildingType;
  districtId: string;
  position: GridPosition;
  size: { width: number; height: number };  // In grid tiles
  spriteId: string;
  capacity: number;         // Max NPCs inside
  isResidential: boolean;
  isWorkplace: boolean;
  hours?: BusinessHours;
  metadata?: BuildingMetadata;
}

export interface GridPosition {
  x: number;  // Grid x coordinate
  y: number;  // Grid y coordinate
}

export interface BusinessHours {
  open: number;   // Hour (0-23)
  close: number;  // Hour (0-23)
  days: number[]; // Days of week (0-6, 0 = Sunday)
}

export interface BuildingMetadata {
  style?: string;
  floors?: number;
  hasOutdoorSeating?: boolean;
  priceLevel?: 1 | 2 | 3 | 4;  // $ to $$$$
  tags?: string[];
}

// ============================================================================
// Roads & Paths
// ============================================================================

export type RoadType = 'main' | 'street' | 'alley' | 'path' | 'bridge';

export interface Road {
  id: string;
  type: RoadType;
  points: Array<GridPosition>;  // Path waypoints
  width: number;                // In tiles
}

// ============================================================================
// Landmarks
// ============================================================================

export interface Landmark {
  id: string;
  name: string;
  buildingId: string;
  description: string;
  keywords: string[];         // For content generation
  isNotable: boolean;         // Show on zoomed-out view
  iconEmoji?: string;
}

// ============================================================================
// NPC Location Tracking
// ============================================================================

export type NPCActivityState =
  | 'idle'
  | 'walking'
  | 'inside_building'
  | 'at_work'
  | 'at_home'
  | 'socializing'
  | 'commuting';

export interface NPCLocation {
  npcId: string;
  position: GridPosition;
  targetPosition?: GridPosition;
  buildingId?: string;
  activity: NPCActivityState;
  activityDescription?: string;  // "Getting coffee", "Working on laptop"
  arrivedAt: number;
  speed: number;  // Tiles per second
}

export interface NPCScheduleEntry {
  id: string;
  npcId: string;
  dayOfWeek: number | null;   // 0-6 or null for every day
  hour: number;               // 0-23
  buildingId: string;
  activity: string;           // Description of what they do there
}

// ============================================================================
// Background NPCs (Non-AI)
// ============================================================================

export interface BackgroundNPC {
  id: string;                 // Format: "bg-{seed}"
  name: string;
  appearanceSeed: number;     // For consistent sprite generation
  homeBuilding: string;       // Building ID
  workBuilding?: string;      // Building ID (some don't work)
  currentPosition: GridPosition;
  targetPosition?: GridPosition;
  state: NPCActivityState;
  activityLabel: string;      // "Walking to work", "At home"
}

// ============================================================================
// Game Time
// ============================================================================

export interface GameTime {
  hour: number;       // 0-23
  minute: number;     // 0-59
  dayOfWeek: number;  // 0-6 (Sunday = 0)
  dayName: string;    // "Monday", etc.
  isNight: boolean;   // 20:00 - 06:00
  period: 'morning' | 'afternoon' | 'evening' | 'night';
}

// ============================================================================
// World State (Full snapshot for frontend)
// ============================================================================

export interface WorldState {
  city: CityData;
  gameTime: GameTime;
  aiNPCs: NPCLocation[];
  backgroundNPCs: BackgroundNPC[];
  playerHome: {
    buildingId: string;
    position: GridPosition;
  };
}

// ============================================================================
// WebSocket Message Payloads
// ============================================================================

export interface WorldStatePayload {
  city: CityData;
  gameTime: GameTime;
  aiNPCs: NPCLocation[];
  backgroundNPCCount: number;
  playerHome: {
    buildingId: string;
    position: GridPosition;
  };
}

export interface NPCMovedPayload {
  npcId: string;
  isAI: boolean;
  position: GridPosition;
  targetPosition?: GridPosition;
  buildingId?: string;
  activity: NPCActivityState;
  activityDescription?: string;
}

export interface TimeUpdatePayload {
  gameTime: GameTime;
}

export interface BackgroundNPCsBatchPayload {
  npcs: BackgroundNPC[];
  viewportBounds: CityBounds;
}
