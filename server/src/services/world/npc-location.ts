/**
 * NPC Location Service
 *
 * Tracks and updates AI NPC positions in the world.
 * Handles movement, building entry/exit, and activity states.
 */

import { getDB, generateId, now } from '../../db/index.js';
import { eventBus, EventTypes } from '../../events/index.js';
import { worldState } from './world-state.js';
import type {
  NPCLocation,
  GridPosition,
  NPCActivityState,
  Building,
} from '../../types/world.js';

// ============================================================================
// Types
// ============================================================================

interface NPCLocationRow {
  npc_id: string;
  position: string;
  target_position: string | null;
  building_id: string | null;
  activity: string;
  activity_description: string | null;
  arrived_at: number;
  speed: number;
}

// ============================================================================
// NPC Location Service
// ============================================================================

class NPCLocationService {
  // In-memory cache for faster access
  private locationCache: Map<string, NPCLocation> = new Map();

  // ============================================================================
  // Initialization
  // ============================================================================

  /**
   * Initialize location tracking for an NPC
   * Called when an NPC is first created or when the world loads
   */
  async initializeNPCLocation(npcId: string, homeBuilding?: Building): Promise<NPCLocation> {
    // Check if already exists
    const existing = await this.getNPCLocation(npcId);
    if (existing) return existing;

    // Find or assign a home building
    const home = homeBuilding || worldState.getRandomBuilding({ isResidential: true });
    if (!home) {
      throw new Error('No residential buildings available');
    }

    const location: NPCLocation = {
      npcId,
      position: { ...home.position },
      buildingId: home.id,
      activity: 'at_home',
      activityDescription: 'At home',
      arrivedAt: now(),
      speed: 1.0,
    };

    await this.saveNPCLocation(location);
    return location;
  }

  /**
   * Initialize locations for all active NPCs
   */
  async initializeAllNPCLocations(): Promise<void> {
    const npcDb = getDB('npc');
    const npcs = npcDb.query('SELECT id FROM npcs WHERE is_active = 1').all() as Array<{ id: string }>;

    console.log(`[NPCLocation] Initializing locations for ${npcs.length} NPCs...`);

    for (const npc of npcs) {
      await this.initializeNPCLocation(npc.id);
    }

    console.log('[NPCLocation] All NPC locations initialized');
  }

  // ============================================================================
  // Location Queries
  // ============================================================================

  /**
   * Get current location of an NPC
   */
  async getNPCLocation(npcId: string): Promise<NPCLocation | null> {
    // Check cache first
    if (this.locationCache.has(npcId)) {
      return this.locationCache.get(npcId)!;
    }

    const db = getDB('game');
    const row = db.query('SELECT * FROM npc_locations WHERE npc_id = ?').get(npcId) as NPCLocationRow | null;

    if (!row) return null;

    const location = this.rowToLocation(row);
    this.locationCache.set(npcId, location);
    return location;
  }

  /**
   * Get all NPC locations
   */
  async getAllNPCLocations(): Promise<NPCLocation[]> {
    const db = getDB('game');
    const rows = db.query('SELECT * FROM npc_locations').all() as NPCLocationRow[];

    const locations = rows.map(row => this.rowToLocation(row));

    // Update cache
    for (const loc of locations) {
      this.locationCache.set(loc.npcId, loc);
    }

    return locations;
  }

  /**
   * Get NPCs at a specific building
   */
  async getNPCsAtBuilding(buildingId: string): Promise<NPCLocation[]> {
    const db = getDB('game');
    const rows = db.query('SELECT * FROM npc_locations WHERE building_id = ?').all(buildingId) as NPCLocationRow[];
    return rows.map(row => this.rowToLocation(row));
  }

  /**
   * Get NPCs in a specific district
   */
  async getNPCsInDistrict(districtId: string): Promise<NPCLocation[]> {
    const db = getDB('game');
    const rows = db.query(`
      SELECT nl.* FROM npc_locations nl
      JOIN buildings b ON nl.building_id = b.id
      WHERE b.district_id = ?
    `).all(districtId) as NPCLocationRow[];
    return rows.map(row => this.rowToLocation(row));
  }

  // ============================================================================
  // Location Updates
  // ============================================================================

  /**
   * Save/update NPC location
   */
  async saveNPCLocation(location: NPCLocation): Promise<void> {
    const db = getDB('game');

    db.query(`
      INSERT OR REPLACE INTO npc_locations
        (npc_id, position, target_position, building_id, activity, activity_description, arrived_at, speed)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      location.npcId,
      JSON.stringify(location.position),
      location.targetPosition ? JSON.stringify(location.targetPosition) : null,
      location.buildingId || null,
      location.activity,
      location.activityDescription || null,
      location.arrivedAt,
      location.speed
    );

    // Update cache
    this.locationCache.set(location.npcId, location);
  }

  /**
   * Move NPC to a building
   */
  async moveNPCToBuilding(
    npcId: string,
    buildingId: string,
    activity?: NPCActivityState,
    activityDescription?: string
  ): Promise<NPCLocation> {
    const building = worldState.getBuilding(buildingId);
    if (!building) {
      throw new Error(`Building not found: ${buildingId}`);
    }

    const currentLocation = await this.getNPCLocation(npcId);
    if (!currentLocation) {
      return this.initializeNPCLocation(npcId, building);
    }

    // Determine activity based on building type if not specified
    if (!activity) {
      if (building.isResidential) {
        activity = 'at_home';
        activityDescription = 'At home';
      } else if (building.isWorkplace) {
        activity = 'at_work';
        activityDescription = `Working at ${building.name}`;
      } else {
        activity = 'inside_building';
        activityDescription = `At ${building.name}`;
      }
    }

    const updatedLocation: NPCLocation = {
      ...currentLocation,
      position: { ...building.position },
      targetPosition: undefined,
      buildingId: building.id,
      activity,
      activityDescription: activityDescription || `At ${building.name}`,
      arrivedAt: now(),
    };

    await this.saveNPCLocation(updatedLocation);

    // Emit event
    eventBus.fire(EventTypes.NPC_UPDATED, {
      npc_id: npcId,
      update_type: 'location_changed',
      building_id: buildingId,
      building_name: building.name,
      activity,
    }, {
      source: 'npc-location',
      npc_id: npcId,
      importance: 0.3,
    });

    return updatedLocation;
  }

  /**
   * Start NPC walking to a destination
   */
  async startNPCWalking(
    npcId: string,
    targetBuildingId: string
  ): Promise<NPCLocation> {
    const targetBuilding = worldState.getBuilding(targetBuildingId);
    if (!targetBuilding) {
      throw new Error(`Building not found: ${targetBuildingId}`);
    }

    const currentLocation = await this.getNPCLocation(npcId);
    if (!currentLocation) {
      throw new Error(`NPC location not found: ${npcId}`);
    }

    const updatedLocation: NPCLocation = {
      ...currentLocation,
      targetPosition: { ...targetBuilding.position },
      buildingId: undefined,
      activity: 'walking',
      activityDescription: `Walking to ${targetBuilding.name}`,
    };

    await this.saveNPCLocation(updatedLocation);

    return updatedLocation;
  }

  /**
   * Update NPC position during walking (called by scheduler)
   */
  async updateNPCPosition(npcId: string, newPosition: GridPosition): Promise<void> {
    const location = await this.getNPCLocation(npcId);
    if (!location) return;

    location.position = newPosition;
    await this.saveNPCLocation(location);
  }

  /**
   * Set NPC activity without changing location
   */
  async setNPCActivity(
    npcId: string,
    activity: NPCActivityState,
    description?: string
  ): Promise<void> {
    const location = await this.getNPCLocation(npcId);
    if (!location) return;

    location.activity = activity;
    if (description) {
      location.activityDescription = description;
    }

    await this.saveNPCLocation(location);
  }

  // ============================================================================
  // Home/Work Assignments
  // ============================================================================

  /**
   * Assign a home building to an NPC
   * Returns the building ID assigned
   */
  async assignHomeBuilding(npcId: string): Promise<string> {
    const home = worldState.getRandomBuilding({ isResidential: true });
    if (!home) {
      throw new Error('No residential buildings available');
    }

    // Store in npc_schedules as a "home" entry
    const db = getDB('game');
    db.query(`
      INSERT OR REPLACE INTO npc_schedules (id, npc_id, day_of_week, hour, building_id, activity)
      VALUES (?, ?, NULL, 0, ?, 'home')
    `).run(
      `${npcId}-home`,
      npcId,
      home.id
    );

    return home.id;
  }

  /**
   * Assign a work building to an NPC
   * Returns the building ID assigned
   */
  async assignWorkBuilding(npcId: string): Promise<string> {
    const work = worldState.getRandomBuilding({ isWorkplace: true });
    if (!work) {
      throw new Error('No workplace buildings available');
    }

    // Store in npc_schedules as a "work" entry
    const db = getDB('game');
    db.query(`
      INSERT OR REPLACE INTO npc_schedules (id, npc_id, day_of_week, hour, building_id, activity)
      VALUES (?, ?, NULL, 9, ?, 'work')
    `).run(
      `${npcId}-work`,
      npcId,
      work.id
    );

    return work.id;
  }

  /**
   * Get NPC's home building ID
   */
  async getNPCHome(npcId: string): Promise<string | null> {
    const db = getDB('game');
    const row = db.query(`
      SELECT building_id FROM npc_schedules
      WHERE npc_id = ? AND activity = 'home'
    `).get(npcId) as { building_id: string } | null;

    return row?.building_id || null;
  }

  /**
   * Get NPC's work building ID
   */
  async getNPCWork(npcId: string): Promise<string | null> {
    const db = getDB('game');
    const row = db.query(`
      SELECT building_id FROM npc_schedules
      WHERE npc_id = ? AND activity = 'work'
    `).get(npcId) as { building_id: string } | null;

    return row?.building_id || null;
  }

  // ============================================================================
  // Helpers
  // ============================================================================

  private rowToLocation(row: NPCLocationRow): NPCLocation {
    return {
      npcId: row.npc_id,
      position: JSON.parse(row.position),
      targetPosition: row.target_position ? JSON.parse(row.target_position) : undefined,
      buildingId: row.building_id || undefined,
      activity: row.activity as NPCActivityState,
      activityDescription: row.activity_description || undefined,
      arrivedAt: row.arrived_at,
      speed: row.speed,
    };
  }

  /**
   * Clear location cache (useful for testing)
   */
  clearCache(): void {
    this.locationCache.clear();
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

export const npcLocation = new NPCLocationService();
export default npcLocation;
