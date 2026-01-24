/**
 * Background NPCs Service
 *
 * Generates and manages stateless background NPCs that populate the city.
 * These NPCs have no AI, no conversations - just visual presence and simple routines.
 * They are generated on-demand using seeded random for consistency.
 */

import { worldState } from './world-state.js';
import type {
  BackgroundNPC,
  GridPosition,
  NPCActivityState,
  Building,
  GameTime,
} from '../../types/world.js';

// ============================================================================
// Configuration
// ============================================================================

const TOTAL_BACKGROUND_NPCS = 500;
const BASE_SEED = 12345;

// ============================================================================
// Name Lists
// ============================================================================

const FIRST_NAMES = [
  'Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Quinn', 'Avery',
  'Cameron', 'Dakota', 'Drew', 'Emery', 'Finley', 'Harper', 'Jamie', 'Kendall',
  'Logan', 'Mackenzie', 'Noah', 'Parker', 'Peyton', 'Reagan', 'Rowan', 'Sage',
  'Sam', 'Skyler', 'Spencer', 'Sydney', 'Tatum', 'Hayden', 'Blake', 'Charlie',
  'Jesse', 'Reese', 'Corey', 'Devon', 'Ellis', 'Frankie', 'Gray', 'Harley',
  'Ira', 'Jayden', 'Kit', 'Lane', 'Max', 'Noel', 'Oakley', 'Phoenix',
  'Ray', 'River', 'Robin', 'Shay', 'Storm', 'Terry', 'Val', 'Winter',
  'Emma', 'Liam', 'Olivia', 'William', 'Ava', 'James', 'Sophia', 'Benjamin',
  'Isabella', 'Lucas', 'Mia', 'Henry', 'Charlotte', 'Alexander', 'Amelia', 'Daniel',
  'Harper', 'Michael', 'Evelyn', 'Ethan', 'Abigail', 'Sebastian', 'Emily', 'Jack',
];

const LAST_INITIALS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

// Activity labels by state
const ACTIVITY_LABELS: Record<string, string[]> = {
  commuting: ['walking to work', 'heading home', 'on their way', 'commuting'],
  at_work: ['at work', 'working', 'in a meeting', 'busy working'],
  at_home: ['at home', 'relaxing', 'resting'],
  idle: ['taking a break', 'waiting', 'checking phone', 'people watching'],
  walking: ['going somewhere', 'running errands', 'out and about', 'exploring'],
  socializing: ['with friends', 'hanging out', 'chatting', 'meeting someone'],
};

// ============================================================================
// Seeded Random Generator
// ============================================================================

function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

function pickRandom<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}

// ============================================================================
// Background NPC Service
// ============================================================================

class BackgroundNPCService {
  // Cache of generated NPCs (regenerated on demand)
  private npcCache: Map<number, BackgroundNPC> = new Map();

  // ============================================================================
  // NPC Generation
  // ============================================================================

  /**
   * Generate a single background NPC by seed
   */
  generateNPC(seed: number): BackgroundNPC {
    // Check cache
    if (this.npcCache.has(seed)) {
      return this.npcCache.get(seed)!;
    }

    const rng = seededRandom(seed);

    // Generate name
    const firstName = pickRandom(FIRST_NAMES, rng);
    const lastInitial = pickRandom(LAST_INITIALS, rng);
    const name = `${firstName} ${lastInitial}.`;

    // Assign home building
    const residentialBuildings = worldState.getResidentialBuildings();
    const homeBuilding = residentialBuildings.length > 0
      ? pickRandom(residentialBuildings, rng)
      : null;

    // Assign work building (70% chance of having a job)
    let workBuilding: Building | null = null;
    if (rng() < 0.7) {
      const workplaceBuildings = worldState.getWorkplaceBuildings();
      if (workplaceBuildings.length > 0) {
        workBuilding = pickRandom(workplaceBuildings, rng);
      }
    }

    // Initial position at home
    const position: GridPosition = homeBuilding
      ? { ...homeBuilding.position }
      : { x: Math.floor(rng() * 200), y: Math.floor(rng() * 150) };

    const npc: BackgroundNPC = {
      id: `bg-${seed}`,
      name,
      appearanceSeed: seed,
      homeBuilding: homeBuilding?.id || '',
      workBuilding: workBuilding?.id,
      currentPosition: position,
      state: 'at_home',
      activityLabel: 'at home',
    };

    this.npcCache.set(seed, npc);
    return npc;
  }

  /**
   * Generate all background NPCs
   */
  generateAllNPCs(): BackgroundNPC[] {
    const npcs: BackgroundNPC[] = [];
    for (let i = 0; i < TOTAL_BACKGROUND_NPCS; i++) {
      npcs.push(this.generateNPC(BASE_SEED + i));
    }
    return npcs;
  }

  /**
   * Get NPCs currently visible in a viewport
   */
  getNPCsInViewport(
    bounds: { minX: number; maxX: number; minY: number; maxY: number },
    gameTime: GameTime
  ): BackgroundNPC[] {
    const visibleNPCs: BackgroundNPC[] = [];

    for (let i = 0; i < TOTAL_BACKGROUND_NPCS; i++) {
      const npc = this.generateNPC(BASE_SEED + i);

      // Update NPC position based on game time
      this.updateNPCPosition(npc, gameTime, seededRandom(BASE_SEED + i + gameTime.hour * 1000));

      // Check if in viewport
      if (
        npc.currentPosition.x >= bounds.minX &&
        npc.currentPosition.x <= bounds.maxX &&
        npc.currentPosition.y >= bounds.minY &&
        npc.currentPosition.y <= bounds.maxY
      ) {
        visibleNPCs.push(npc);
      }
    }

    return visibleNPCs;
  }

  /**
   * Get all NPCs with updated positions
   */
  getAllNPCsWithPositions(gameTime: GameTime): BackgroundNPC[] {
    const npcs: BackgroundNPC[] = [];

    for (let i = 0; i < TOTAL_BACKGROUND_NPCS; i++) {
      const npc = this.generateNPC(BASE_SEED + i);
      this.updateNPCPosition(npc, gameTime, seededRandom(BASE_SEED + i + gameTime.hour * 1000));
      npcs.push(npc);
    }

    return npcs;
  }

  // ============================================================================
  // Position Updates
  // ============================================================================

  /**
   * Update an NPC's position based on game time
   * Uses deterministic logic so the same NPC at the same time is always in the same place
   */
  private updateNPCPosition(npc: BackgroundNPC, gameTime: GameTime, rng: () => number): void {
    const hour = gameTime.hour;
    const isWeekday = gameTime.dayOfWeek >= 1 && gameTime.dayOfWeek <= 5;
    const hasJob = !!npc.workBuilding;

    // Determine where NPC should be based on time
    let targetBuildingId: string | undefined;
    let state: NPCActivityState = 'idle';
    let activityLabel = 'going about their day';

    if (isWeekday && hasJob) {
      // Weekday schedule for workers
      if (hour >= 7 && hour < 8) {
        // Commuting to work
        state = 'commuting';
        targetBuildingId = npc.workBuilding;
        activityLabel = 'heading to work';
      } else if (hour >= 8 && hour < 17) {
        // At work
        state = 'at_work';
        targetBuildingId = npc.workBuilding;
        activityLabel = pickRandom(ACTIVITY_LABELS.at_work, rng);
      } else if (hour >= 17 && hour < 18) {
        // Commuting home
        state = 'commuting';
        targetBuildingId = npc.homeBuilding;
        activityLabel = 'heading home';
      } else if (hour >= 18 && hour < 22) {
        // Evening activities (30% chance of going out)
        if (rng() < 0.3) {
          state = 'socializing';
          const socialBuildings = worldState.getBuildingsByType('restaurant')
            .concat(worldState.getBuildingsByType('bar'));
          if (socialBuildings.length > 0) {
            targetBuildingId = pickRandom(socialBuildings, rng).id;
          }
          activityLabel = pickRandom(ACTIVITY_LABELS.socializing, rng);
        } else {
          state = 'at_home';
          targetBuildingId = npc.homeBuilding;
          activityLabel = pickRandom(ACTIVITY_LABELS.at_home, rng);
        }
      } else {
        // Night/early morning - at home
        state = 'at_home';
        targetBuildingId = npc.homeBuilding;
        activityLabel = 'at home';
      }
    } else {
      // Weekend or unemployed
      if (hour >= 6 && hour < 10) {
        // Morning - mostly at home
        state = 'at_home';
        targetBuildingId = npc.homeBuilding;
        activityLabel = 'having a lazy morning';
      } else if (hour >= 10 && hour < 18) {
        // Daytime - might go out (50% chance)
        if (rng() < 0.5) {
          state = 'walking';
          const leisureTypes = ['cafe', 'park', 'shop', 'mall'];
          const leisureBuildings = leisureTypes.flatMap(t => worldState.getBuildingsByType(t));
          if (leisureBuildings.length > 0) {
            targetBuildingId = pickRandom(leisureBuildings, rng).id;
          }
          activityLabel = pickRandom(ACTIVITY_LABELS.walking, rng);
        } else {
          state = 'at_home';
          targetBuildingId = npc.homeBuilding;
          activityLabel = pickRandom(ACTIVITY_LABELS.at_home, rng);
        }
      } else if (hour >= 18 && hour < 23) {
        // Evening - higher chance of going out (40%)
        if (rng() < 0.4) {
          state = 'socializing';
          const nightBuildings = worldState.getBuildingsByType('restaurant')
            .concat(worldState.getBuildingsByType('bar'))
            .concat(worldState.getBuildingsByType('club'));
          if (nightBuildings.length > 0) {
            targetBuildingId = pickRandom(nightBuildings, rng).id;
          }
          activityLabel = pickRandom(ACTIVITY_LABELS.socializing, rng);
        } else {
          state = 'at_home';
          targetBuildingId = npc.homeBuilding;
          activityLabel = pickRandom(ACTIVITY_LABELS.at_home, rng);
        }
      } else {
        // Night - at home
        state = 'at_home';
        targetBuildingId = npc.homeBuilding;
        activityLabel = 'at home';
      }
    }

    // Get target building position
    const targetBuilding = targetBuildingId ? worldState.getBuilding(targetBuildingId) : null;

    if (targetBuilding) {
      // Add slight random offset within building area
      const offsetX = Math.floor(rng() * 3) - 1;
      const offsetY = Math.floor(rng() * 3) - 1;

      npc.currentPosition = {
        x: targetBuilding.position.x + offsetX,
        y: targetBuilding.position.y + offsetY,
      };
    }

    npc.state = state;
    npc.activityLabel = activityLabel;

    // Update target position for walking state
    if (state === 'commuting' || state === 'walking') {
      npc.targetPosition = targetBuilding?.position;
    } else {
      npc.targetPosition = undefined;
    }
  }

  // ============================================================================
  // Density & Statistics
  // ============================================================================

  /**
   * Get crowd density in a district at current time
   */
  getDistrictDensity(districtId: string, gameTime: GameTime): number {
    const npcs = this.getAllNPCsWithPositions(gameTime);
    const district = worldState.getDistrict(districtId);
    if (!district) return 0;

    // Count NPCs in district (rough check using building locations)
    const districtBuildings = new Set(
      worldState.getBuildingsInDistrict(districtId).map(b => b.id)
    );

    let count = 0;
    for (const npc of npcs) {
      const building = npc.homeBuilding || '';
      if (npc.state === 'at_home' && districtBuildings.has(building)) {
        count++;
      }
      if (npc.workBuilding && districtBuildings.has(npc.workBuilding) &&
          (npc.state === 'at_work' || npc.state === 'commuting')) {
        count++;
      }
    }

    // Return as percentage of total
    return (count / TOTAL_BACKGROUND_NPCS) * 100;
  }

  /**
   * Get total NPC count
   */
  getTotalCount(): number {
    return TOTAL_BACKGROUND_NPCS;
  }

  /**
   * Clear cache (useful for testing or when city changes)
   */
  clearCache(): void {
    this.npcCache.clear();
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

export const backgroundNPCs = new BackgroundNPCService();
export default backgroundNPCs;
