/**
 * World System Services
 *
 * Exports all world-related services for the isometric city viewer.
 */

export { worldState } from './world-state.js';
export { npcLocation } from './npc-location.js';
export { npcScheduler } from './npc-scheduler.js';
export { backgroundNPCs } from './background-npcs.js';
export { generateCity, loadCityFromFile, saveCityToFile } from './city-generator.js';

// Re-export types
export type {
  CityData,
  District,
  Building,
  Landmark,
  Road,
  GridPosition,
  GameTime,
  NPCLocation,
  NPCScheduleEntry,
  BackgroundNPC,
  WorldState,
  WorldStatePayload,
  NPCMovedPayload,
  TimeUpdatePayload,
} from '../../types/world.js';
