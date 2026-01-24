/**
 * NPC Scheduler Service
 *
 * Manages NPC daily schedules and moves NPCs based on game time.
 * Handles work schedules, leisure activities, and random movement.
 */

import { getDB, generateId, now } from '../../db/index.js';
import { eventBus, EventTypes } from '../../events/index.js';
import { worldState } from './world-state.js';
import { npcLocation } from './npc-location.js';
import type {
  NPCScheduleEntry,
  Building,
  GameTime,
} from '../../types/world.js';

// ============================================================================
// Types
// ============================================================================

interface ScheduleRow {
  id: string;
  npc_id: string;
  day_of_week: number | null;
  hour: number;
  building_id: string;
  activity: string;
  created_at: number;
}

// Schedule template for different personality types
interface ScheduleTemplate {
  name: string;
  entries: Array<{
    hour: number;
    activity: 'home' | 'work' | 'cafe' | 'gym' | 'social' | 'shopping' | 'leisure';
    duration: number; // hours
    workdays?: boolean; // only on workdays (Mon-Fri)
    weekends?: boolean; // only on weekends
  }>;
}

// ============================================================================
// Schedule Templates
// ============================================================================

const SCHEDULE_TEMPLATES: Record<string, ScheduleTemplate> = {
  office_worker: {
    name: 'Office Worker',
    entries: [
      { hour: 7, activity: 'home', duration: 1 },
      { hour: 8, activity: 'cafe', duration: 1, workdays: true },
      { hour: 9, activity: 'work', duration: 8, workdays: true },
      { hour: 17, activity: 'gym', duration: 1, workdays: true },
      { hour: 18, activity: 'social', duration: 2, workdays: true },
      { hour: 20, activity: 'home', duration: 11 },
      { hour: 10, activity: 'cafe', duration: 2, weekends: true },
      { hour: 14, activity: 'shopping', duration: 3, weekends: true },
      { hour: 18, activity: 'social', duration: 4, weekends: true },
    ],
  },
  creative: {
    name: 'Creative Professional',
    entries: [
      { hour: 9, activity: 'home', duration: 2 },
      { hour: 11, activity: 'cafe', duration: 3 },
      { hour: 14, activity: 'work', duration: 5 },
      { hour: 19, activity: 'social', duration: 4 },
      { hour: 23, activity: 'home', duration: 10 },
    ],
  },
  student: {
    name: 'Student',
    entries: [
      { hour: 8, activity: 'cafe', duration: 1, workdays: true },
      { hour: 9, activity: 'work', duration: 4, workdays: true }, // "work" = classes
      { hour: 13, activity: 'cafe', duration: 2, workdays: true },
      { hour: 15, activity: 'work', duration: 3, workdays: true }, // study
      { hour: 18, activity: 'social', duration: 4 },
      { hour: 22, activity: 'home', duration: 10 },
      { hour: 11, activity: 'cafe', duration: 3, weekends: true },
      { hour: 15, activity: 'leisure', duration: 5, weekends: true },
    ],
  },
  night_owl: {
    name: 'Night Owl',
    entries: [
      { hour: 12, activity: 'home', duration: 3 },
      { hour: 15, activity: 'cafe', duration: 2 },
      { hour: 17, activity: 'work', duration: 5 },
      { hour: 22, activity: 'social', duration: 4 },
      { hour: 2, activity: 'home', duration: 10 },
    ],
  },
  homebody: {
    name: 'Homebody',
    entries: [
      { hour: 8, activity: 'home', duration: 4 },
      { hour: 12, activity: 'shopping', duration: 2 },
      { hour: 14, activity: 'home', duration: 6 },
      { hour: 20, activity: 'social', duration: 2 },
      { hour: 22, activity: 'home', duration: 10 },
    ],
  },
  social_butterfly: {
    name: 'Social Butterfly',
    entries: [
      { hour: 9, activity: 'cafe', duration: 2 },
      { hour: 11, activity: 'work', duration: 4 },
      { hour: 15, activity: 'cafe', duration: 2 },
      { hour: 17, activity: 'gym', duration: 1 },
      { hour: 18, activity: 'social', duration: 5 },
      { hour: 23, activity: 'home', duration: 10 },
    ],
  },
};

// Activity descriptions for each type
const ACTIVITY_DESCRIPTIONS: Record<string, string[]> = {
  home: ['Relaxing at home', 'Working from home', 'Watching TV', 'Cooking dinner', 'Reading'],
  work: ['Working', 'In a meeting', 'At the office', 'Focused on work', 'On a call'],
  cafe: ['Getting coffee', 'Working on laptop', 'People watching', 'Reading', 'Catching up with a friend'],
  gym: ['Working out', 'At the gym', 'Running on treadmill', 'Lifting weights', 'In a fitness class'],
  social: ['Hanging out with friends', 'At a bar', 'Having dinner', 'At a party', 'Meeting up'],
  shopping: ['Shopping', 'Running errands', 'Browsing stores', 'Grabbing groceries'],
  leisure: ['Taking a walk', 'At the park', 'Exploring the city', 'At a museum', 'Window shopping'],
};

// ============================================================================
// NPC Scheduler Service
// ============================================================================

class NPCSchedulerService {
  private updateInterval: ReturnType<typeof setInterval> | null = null;
  private lastProcessedHour: number = -1;

  // ============================================================================
  // Initialization
  // ============================================================================

  /**
   * Generate a schedule for an NPC based on personality
   */
  async generateNPCSchedule(npcId: string, templateName?: string): Promise<void> {
    const db = getDB('game');

    // Pick a random template if not specified
    const templateNames = Object.keys(SCHEDULE_TEMPLATES);
    const selectedTemplate = templateName || templateNames[Math.floor(Math.random() * templateNames.length)];
    const template = SCHEDULE_TEMPLATES[selectedTemplate];

    if (!template) {
      console.warn(`[NPCScheduler] Unknown template: ${selectedTemplate}, using office_worker`);
      await this.generateNPCSchedule(npcId, 'office_worker');
      return;
    }

    // Assign home and work buildings if not already assigned
    let homeId = await npcLocation.getNPCHome(npcId);
    if (!homeId) {
      homeId = await npcLocation.assignHomeBuilding(npcId);
    }

    let workId = await npcLocation.getNPCWork(npcId);
    if (!workId) {
      workId = await npcLocation.assignWorkBuilding(npcId);
    }

    // Clear existing schedule (except home/work assignments)
    db.query(`
      DELETE FROM npc_schedules
      WHERE npc_id = ? AND activity NOT IN ('home', 'work')
    `).run(npcId);

    // Generate schedule entries
    for (const entry of template.entries) {
      // Skip entries that don't apply to all days
      if (entry.workdays || entry.weekends) {
        // Create entries for specific days
        const days = entry.workdays ? [1, 2, 3, 4, 5] : [0, 6];
        for (const day of days) {
          await this.addScheduleEntry(npcId, day, entry.hour, entry.activity, homeId, workId);
        }
      } else {
        // Create entry for all days (day_of_week = null)
        await this.addScheduleEntry(npcId, null, entry.hour, entry.activity, homeId, workId);
      }
    }

    console.log(`[NPCScheduler] Generated ${template.name} schedule for NPC ${npcId}`);
  }

  private async addScheduleEntry(
    npcId: string,
    dayOfWeek: number | null,
    hour: number,
    activity: string,
    homeId: string,
    workId: string
  ): Promise<void> {
    const db = getDB('game');

    // Determine building based on activity
    let buildingId: string;
    switch (activity) {
      case 'home':
        buildingId = homeId;
        break;
      case 'work':
        buildingId = workId;
        break;
      case 'cafe':
        buildingId = worldState.getRandomBuilding({ type: 'cafe' })?.id || homeId;
        break;
      case 'gym':
        buildingId = worldState.getRandomBuilding({ type: 'gym' })?.id || homeId;
        break;
      case 'social':
        const socialTypes = ['bar', 'restaurant', 'cafe', 'club'];
        buildingId = worldState.getRandomBuilding({ type: socialTypes })?.id || homeId;
        break;
      case 'shopping':
        const shopTypes = ['shop', 'mall'];
        buildingId = worldState.getRandomBuilding({ type: shopTypes })?.id || homeId;
        break;
      case 'leisure':
        const leisureTypes = ['park', 'gallery', 'bookstore'];
        buildingId = worldState.getRandomBuilding({ type: leisureTypes })?.id || homeId;
        break;
      default:
        buildingId = homeId;
    }

    const id = generateId();
    db.query(`
      INSERT INTO npc_schedules (id, npc_id, day_of_week, hour, building_id, activity)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, npcId, dayOfWeek, hour, buildingId, activity);
  }

  /**
   * Generate schedules for all NPCs
   */
  async generateAllSchedules(): Promise<void> {
    const npcDb = getDB('npc');
    const npcs = npcDb.query('SELECT id FROM npcs WHERE is_active = 1').all() as Array<{ id: string }>;

    console.log(`[NPCScheduler] Generating schedules for ${npcs.length} NPCs...`);

    for (const npc of npcs) {
      // Check if NPC already has a schedule
      const db = getDB('game');
      const existing = db.query(
        'SELECT COUNT(*) as count FROM npc_schedules WHERE npc_id = ?'
      ).get(npc.id) as { count: number };

      if (existing.count <= 2) { // Only home and work entries
        await this.generateNPCSchedule(npc.id);
      }
    }

    console.log('[NPCScheduler] All schedules generated');
  }

  // ============================================================================
  // Schedule Processing
  // ============================================================================

  /**
   * Start the scheduler update loop
   */
  startScheduler(intervalSeconds: number = 10): void {
    if (this.updateInterval) {
      console.warn('[NPCScheduler] Scheduler already running');
      return;
    }

    console.log(`[NPCScheduler] Starting scheduler (${intervalSeconds}s interval)`);

    // Run immediately
    this.processScheduledMovements();

    // Then run periodically
    this.updateInterval = setInterval(() => {
      this.processScheduledMovements();
    }, intervalSeconds * 1000);
  }

  /**
   * Stop the scheduler
   */
  stopScheduler(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
      console.log('[NPCScheduler] Scheduler stopped');
    }
  }

  /**
   * Process scheduled movements for all NPCs
   * Called periodically by the scheduler
   */
  async processScheduledMovements(): Promise<void> {
    if (worldState.isTimePaused()) return;

    const gameTime = worldState.getGameTime();

    // Only process on hour changes (or every check if we missed an hour)
    if (gameTime.hour === this.lastProcessedHour) return;
    this.lastProcessedHour = gameTime.hour;

    console.log(`[NPCScheduler] Processing hour ${gameTime.hour} (${gameTime.dayName})`);

    const db = getDB('game');

    // Find all schedule entries for this hour
    // Either matching the specific day or any day (day_of_week is NULL)
    const schedules = db.query(`
      SELECT DISTINCT npc_id, building_id, activity
      FROM npc_schedules
      WHERE hour = ?
        AND (day_of_week IS NULL OR day_of_week = ?)
    `).all(gameTime.hour, gameTime.dayOfWeek) as Array<{
      npc_id: string;
      building_id: string;
      activity: string;
    }>;

    // Move each NPC to their scheduled location
    for (const schedule of schedules) {
      try {
        await this.moveNPCToScheduledLocation(schedule);
      } catch (error) {
        console.error(`[NPCScheduler] Error moving NPC ${schedule.npc_id}:`, error);
      }
    }

    console.log(`[NPCScheduler] Processed ${schedules.length} scheduled movements`);
  }

  private async moveNPCToScheduledLocation(schedule: {
    npc_id: string;
    building_id: string;
    activity: string;
  }): Promise<void> {
    const building = worldState.getBuilding(schedule.building_id);
    if (!building) {
      console.warn(`[NPCScheduler] Building not found: ${schedule.building_id}`);
      return;
    }

    // Pick a random activity description
    const descriptions = ACTIVITY_DESCRIPTIONS[schedule.activity] || ['Busy'];
    const description = descriptions[Math.floor(Math.random() * descriptions.length)];

    // Map activity string to NPCActivityState
    let activityState: 'at_home' | 'at_work' | 'inside_building' | 'socializing';
    switch (schedule.activity) {
      case 'home':
        activityState = 'at_home';
        break;
      case 'work':
        activityState = 'at_work';
        break;
      case 'social':
        activityState = 'socializing';
        break;
      default:
        activityState = 'inside_building';
    }

    await npcLocation.moveNPCToBuilding(
      schedule.npc_id,
      schedule.building_id,
      activityState,
      description
    );
  }

  // ============================================================================
  // Schedule Queries
  // ============================================================================

  /**
   * Get schedule for an NPC
   */
  async getNPCSchedule(npcId: string): Promise<NPCScheduleEntry[]> {
    const db = getDB('game');
    const rows = db.query(`
      SELECT * FROM npc_schedules
      WHERE npc_id = ?
      ORDER BY COALESCE(day_of_week, 0), hour
    `).all(npcId) as ScheduleRow[];

    return rows.map(row => ({
      id: row.id,
      npcId: row.npc_id,
      dayOfWeek: row.day_of_week,
      hour: row.hour,
      buildingId: row.building_id,
      activity: row.activity,
    }));
  }

  /**
   * Get current scheduled activity for an NPC
   */
  async getCurrentScheduledActivity(npcId: string): Promise<{
    buildingId: string;
    activity: string;
  } | null> {
    const gameTime = worldState.getGameTime();
    const db = getDB('game');

    // Find the most recent scheduled activity
    const row = db.query(`
      SELECT building_id, activity FROM npc_schedules
      WHERE npc_id = ?
        AND hour <= ?
        AND (day_of_week IS NULL OR day_of_week = ?)
      ORDER BY hour DESC
      LIMIT 1
    `).get(npcId, gameTime.hour, gameTime.dayOfWeek) as {
      building_id: string;
      activity: string;
    } | null;

    if (!row) return null;

    return {
      buildingId: row.building_id,
      activity: row.activity,
    };
  }

  /**
   * Get NPCs scheduled to be at a building at a given time
   */
  async getScheduledNPCsAtBuilding(
    buildingId: string,
    hour: number,
    dayOfWeek: number
  ): Promise<string[]> {
    const db = getDB('game');
    const rows = db.query(`
      SELECT DISTINCT npc_id FROM npc_schedules
      WHERE building_id = ?
        AND hour = ?
        AND (day_of_week IS NULL OR day_of_week = ?)
    `).all(buildingId, hour, dayOfWeek) as Array<{ npc_id: string }>;

    return rows.map(r => r.npc_id);
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

export const npcScheduler = new NPCSchedulerService();
export default npcScheduler;
