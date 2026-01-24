/**
 * World State Service
 *
 * Manages the loaded city data and game time system.
 * The city is loaded from static JSON on server start.
 * Game time runs at accelerated speed (default 1:15 ratio).
 */

import { getDB, generateId, now } from '../../db/index.js';
import { eventBus, EventTypes } from '../../events/index.js';
import { loadCityFromFile, generateCity, saveCityToFile } from './city-generator.js';
import type {
  CityData,
  GameTime,
  District,
  Building,
  Landmark,
} from '../../types/world.js';

// ============================================================================
// Configuration
// ============================================================================

const DEFAULT_TIME_MULTIPLIER = 15; // 1 real minute = 15 game minutes
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// ============================================================================
// World State Service
// ============================================================================

class WorldStateService {
  private city: CityData | null = null;
  private initialized = false;

  // Game time state
  private gameStartRealTime: number = 0;  // Real world timestamp when game started
  private gameStartTime: number = 0;       // Game world timestamp at game start
  private timeMultiplier: number = DEFAULT_TIME_MULTIPLIER;
  private isPaused: boolean = false;
  private pausedAt: number = 0;

  // ============================================================================
  // Initialization
  // ============================================================================

  async initialize(): Promise<void> {
    if (this.initialized) return;

    console.log('[WorldState] Initializing world state...');

    // Load city data
    await this.loadCity();

    // Initialize game time
    await this.initializeGameTime();

    this.initialized = true;
    console.log('[WorldState] World state initialized');

    // Emit initialization event
    eventBus.fire(EventTypes.SYSTEM_STARTUP, {
      component: 'world-state',
      city_name: this.city?.name || 'unknown',
      district_count: this.city?.districts.length || 0,
      building_count: this.city?.buildings.length || 0,
    }, {
      source: 'world-state',
      importance: 0.5,
    });
  }

  // ============================================================================
  // City Data
  // ============================================================================

  private async loadCity(): Promise<void> {
    // Try to load from file first
    this.city = await loadCityFromFile();

    if (!this.city) {
      console.log('[WorldState] No city file found, generating new city...');
      this.city = await generateCity(42);
      await saveCityToFile(this.city);
    }

    // Cache districts, buildings, and landmarks in database
    await this.cacheWorldData();

    console.log(`[WorldState] Loaded city: ${this.city.name}`);
    console.log(`  - Districts: ${this.city.districts.length}`);
    console.log(`  - Buildings: ${this.city.buildings.length}`);
    console.log(`  - Landmarks: ${this.city.landmarks.length}`);
  }

  private async cacheWorldData(): Promise<void> {
    if (!this.city) return;

    const db = getDB('game');

    // Cache districts
    for (const district of this.city.districts) {
      db.query(`
        INSERT OR REPLACE INTO districts (id, name, type, description, bounds, color, peak_hours, vibe)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        district.id,
        district.name,
        district.type,
        district.description,
        JSON.stringify(district.bounds),
        district.color,
        JSON.stringify(district.peakHours),
        district.vibe
      );
    }

    // Cache buildings
    for (const building of this.city.buildings) {
      db.query(`
        INSERT OR REPLACE INTO buildings (id, name, type, district_id, position, size, sprite_id, capacity, is_residential, is_workplace, hours, metadata)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        building.id,
        building.name,
        building.type,
        building.districtId,
        JSON.stringify(building.position),
        JSON.stringify(building.size),
        building.spriteId,
        building.capacity,
        building.isResidential ? 1 : 0,
        building.isWorkplace ? 1 : 0,
        building.hours ? JSON.stringify(building.hours) : null,
        building.metadata ? JSON.stringify(building.metadata) : null
      );
    }

    // Cache landmarks
    for (const landmark of this.city.landmarks) {
      db.query(`
        INSERT OR REPLACE INTO landmarks (id, name, building_id, description, keywords, is_notable, icon_emoji)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        landmark.id,
        landmark.name,
        landmark.buildingId,
        landmark.description,
        JSON.stringify(landmark.keywords),
        landmark.isNotable ? 1 : 0,
        landmark.iconEmoji || null
      );
    }

    console.log('[WorldState] Cached world data to database');
  }

  getCity(): CityData | null {
    return this.city;
  }

  // ============================================================================
  // Game Time
  // ============================================================================

  private async initializeGameTime(): Promise<void> {
    const db = getDB('game');

    // Check for existing game time state
    const existing = db.query('SELECT * FROM game_time_state WHERE id = 1').get() as any;

    if (existing) {
      this.gameStartRealTime = existing.game_start_real_time * 1000; // Convert to ms
      this.gameStartTime = existing.game_start_time * 1000;
      this.timeMultiplier = existing.time_multiplier;
      this.isPaused = existing.is_paused === 1;
      this.pausedAt = existing.paused_at ? existing.paused_at * 1000 : 0;

      console.log('[WorldState] Resumed existing game time');
    } else {
      // Initialize new game time
      // Start at 8:00 AM Monday
      const startDate = new Date();
      startDate.setHours(8, 0, 0, 0);
      // Set to next Monday
      const dayOfWeek = startDate.getDay();
      const daysUntilMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek);
      startDate.setDate(startDate.getDate() + daysUntilMonday);

      this.gameStartRealTime = Date.now();
      this.gameStartTime = startDate.getTime();
      this.timeMultiplier = DEFAULT_TIME_MULTIPLIER;
      this.isPaused = false;

      // Persist initial state
      await this.saveGameTimeState();

      console.log('[WorldState] Initialized new game time starting at Monday 8:00 AM');
    }
  }

  private async saveGameTimeState(): Promise<void> {
    const db = getDB('game');

    db.query(`
      INSERT OR REPLACE INTO game_time_state (id, game_start_real_time, game_start_time, time_multiplier, is_paused, paused_at, updated_at)
      VALUES (1, ?, ?, ?, ?, ?, ?)
    `).run(
      Math.floor(this.gameStartRealTime / 1000),
      Math.floor(this.gameStartTime / 1000),
      this.timeMultiplier,
      this.isPaused ? 1 : 0,
      this.pausedAt ? Math.floor(this.pausedAt / 1000) : null,
      now()
    );
  }

  /**
   * Get the current game time
   */
  getGameTime(): GameTime {
    const gameDate = this.getGameDate();

    const hour = gameDate.getHours();
    const minute = gameDate.getMinutes();
    const dayOfWeek = gameDate.getDay();
    const isNight = hour >= 20 || hour < 6;

    let period: 'morning' | 'afternoon' | 'evening' | 'night';
    if (hour >= 6 && hour < 12) period = 'morning';
    else if (hour >= 12 && hour < 17) period = 'afternoon';
    else if (hour >= 17 && hour < 20) period = 'evening';
    else period = 'night';

    return {
      hour,
      minute,
      dayOfWeek,
      dayName: DAY_NAMES[dayOfWeek],
      isNight,
      period,
    };
  }

  /**
   * Get the actual Date object for current game time
   */
  getGameDate(): Date {
    if (this.isPaused) {
      // Return the time when we paused
      const realElapsed = this.pausedAt - this.gameStartRealTime;
      const gameElapsed = realElapsed * this.timeMultiplier;
      return new Date(this.gameStartTime + gameElapsed);
    }

    const realElapsed = Date.now() - this.gameStartRealTime;
    const gameElapsed = realElapsed * this.timeMultiplier;
    return new Date(this.gameStartTime + gameElapsed);
  }

  /**
   * Get formatted time string (e.g., "2:30 PM")
   */
  getFormattedTime(): string {
    const time = this.getGameTime();
    const hour12 = time.hour === 0 ? 12 : time.hour > 12 ? time.hour - 12 : time.hour;
    const ampm = time.hour >= 12 ? 'PM' : 'AM';
    const minuteStr = time.minute.toString().padStart(2, '0');
    return `${hour12}:${minuteStr} ${ampm}`;
  }

  /**
   * Get full formatted date/time (e.g., "Monday, 2:30 PM")
   */
  getFormattedDateTime(): string {
    const time = this.getGameTime();
    return `${time.dayName}, ${this.getFormattedTime()}`;
  }

  // ============================================================================
  // Time Controls
  // ============================================================================

  pauseTime(): void {
    if (this.isPaused) return;

    this.isPaused = true;
    this.pausedAt = Date.now();
    this.saveGameTimeState();

    console.log('[WorldState] Game time paused');
  }

  resumeTime(): void {
    if (!this.isPaused) return;

    // Adjust start time to account for pause duration
    const pauseDuration = Date.now() - this.pausedAt;
    this.gameStartRealTime += pauseDuration;

    this.isPaused = false;
    this.pausedAt = 0;
    this.saveGameTimeState();

    console.log('[WorldState] Game time resumed');
  }

  setTimeMultiplier(multiplier: number): void {
    if (multiplier < 1 || multiplier > 60) {
      console.warn('[WorldState] Time multiplier must be between 1 and 60');
      return;
    }

    // Preserve current game time when changing multiplier
    const currentGameDate = this.getGameDate();
    this.gameStartTime = currentGameDate.getTime();
    this.gameStartRealTime = Date.now();
    this.timeMultiplier = multiplier;

    this.saveGameTimeState();

    console.log(`[WorldState] Time multiplier set to ${multiplier}x`);
  }

  getTimeMultiplier(): number {
    return this.timeMultiplier;
  }

  isTimePaused(): boolean {
    return this.isPaused;
  }

  // ============================================================================
  // Building/District Queries
  // ============================================================================

  getDistrict(id: string): District | null {
    return this.city?.districts.find(d => d.id === id) || null;
  }

  getBuilding(id: string): Building | null {
    return this.city?.buildings.find(b => b.id === id) || null;
  }

  getLandmark(id: string): Landmark | null {
    return this.city?.landmarks.find(l => l.id === id) || null;
  }

  getLandmarkByBuildingId(buildingId: string): Landmark | null {
    return this.city?.landmarks.find(l => l.buildingId === buildingId) || null;
  }

  /**
   * Get all buildings in a district
   */
  getBuildingsInDistrict(districtId: string): Building[] {
    return this.city?.buildings.filter(b => b.districtId === districtId) || [];
  }

  /**
   * Get all residential buildings
   */
  getResidentialBuildings(): Building[] {
    return this.city?.buildings.filter(b => b.isResidential) || [];
  }

  /**
   * Get all workplace buildings
   */
  getWorkplaceBuildings(): Building[] {
    return this.city?.buildings.filter(b => b.isWorkplace) || [];
  }

  /**
   * Get buildings of a specific type
   */
  getBuildingsByType(type: string): Building[] {
    return this.city?.buildings.filter(b => b.type === type) || [];
  }

  /**
   * Get a random building matching criteria
   */
  getRandomBuilding(options: {
    type?: string | string[];
    districtId?: string;
    isResidential?: boolean;
    isWorkplace?: boolean;
  } = {}): Building | null {
    let buildings = this.city?.buildings || [];

    if (options.type) {
      const types = Array.isArray(options.type) ? options.type : [options.type];
      buildings = buildings.filter(b => types.includes(b.type));
    }
    if (options.districtId) {
      buildings = buildings.filter(b => b.districtId === options.districtId);
    }
    if (options.isResidential !== undefined) {
      buildings = buildings.filter(b => b.isResidential === options.isResidential);
    }
    if (options.isWorkplace !== undefined) {
      buildings = buildings.filter(b => b.isWorkplace === options.isWorkplace);
    }

    if (buildings.length === 0) return null;

    return buildings[Math.floor(Math.random() * buildings.length)];
  }

  /**
   * Check if a building is currently open based on game time
   */
  isBuildingOpen(buildingId: string): boolean {
    const building = this.getBuilding(buildingId);
    if (!building || !building.hours) return true; // No hours = always open

    const gameTime = this.getGameTime();
    const { open, close, days } = building.hours;

    // Check if open on this day
    if (!days.includes(gameTime.dayOfWeek)) return false;

    // Check hours (handles overnight businesses like bars)
    if (close > open) {
      return gameTime.hour >= open && gameTime.hour < close;
    } else {
      // Overnight (e.g., bar open 17-2)
      return gameTime.hour >= open || gameTime.hour < close;
    }
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

export const worldState = new WorldStateService();
export default worldState;
