/**
 * Awareness Service
 *
 * Server-side information flow management - tracks who knows what.
 * NPCs only react to posts/events they've actually "seen".
 *
 * This creates realistic drama timing:
 * - Sarah posts something at 2pm
 * - Emily (who checks hourly) sees it at 2:30pm and comments "👀"
 * - Jake (who checks every 4 hours) doesn't see it until 6pm
 * - Player might know before Jake does (or vice versa)
 */

import { getDB, generateId, now } from '../db/index.js';
import { eventBus, EventTypes } from '../events/index.js';
import * as socialService from './social.js';

// ============================================================================
// Types
// ============================================================================

export interface NPCSocialHabits {
  npcId: string;
  platforms: string[];
  checkFrequencyHours: number;
  batchSize: number;
  activeHoursStart: number;
  activeHoursEnd: number;
  traits: {
    isHeavyScroller: boolean;
    checksNotifications: boolean;
    lateNightScroller: boolean;
    reactsOften: boolean;
  };
}

export interface LastChecked {
  npcId: string;
  platform: string;
  timestamp: number;
}

// ============================================================================
// Schema
// ============================================================================

export function initializeAwarenessSchema(): void {
  const db = getDB('game');

  db.exec(`
    -- NPC social media habits
    CREATE TABLE IF NOT EXISTS npc_social_habits (
      npc_id TEXT PRIMARY KEY,
      platforms TEXT NOT NULL DEFAULT '["myface"]',
      check_frequency_hours REAL DEFAULT 2.0,
      batch_size INTEGER DEFAULT 8,
      active_hours_start INTEGER DEFAULT 9,
      active_hours_end INTEGER DEFAULT 22,
      is_heavy_scroller INTEGER DEFAULT 0,
      checks_notifications INTEGER DEFAULT 1,
      late_night_scroller INTEGER DEFAULT 0,
      reacts_often INTEGER DEFAULT 0
    );

    -- When NPCs last checked each platform
    CREATE TABLE IF NOT EXISTS npc_last_checked (
      id TEXT PRIMARY KEY,
      npc_id TEXT NOT NULL,
      platform TEXT NOT NULL,
      timestamp INTEGER DEFAULT (unixepoch()),
      UNIQUE(npc_id, platform)
    );

    CREATE INDEX IF NOT EXISTS idx_last_checked_npc ON npc_last_checked(npc_id);
  `);

  console.log('[Awareness] Schema initialized');
}

// ============================================================================
// Default NPC Habits
// ============================================================================

const DEFAULT_HABITS: NPCSocialHabits[] = [
  {
    npcId: 'sarah',
    platforms: ['myface', 'chirp', 'instasnap'],
    checkFrequencyHours: 1,
    batchSize: 15,
    activeHoursStart: 8,
    activeHoursEnd: 23,
    traits: {
      isHeavyScroller: true,
      checksNotifications: true,
      lateNightScroller: false,
      reactsOften: true,
    },
  },
  {
    npcId: 'jake',
    platforms: ['myface', 'chirp'],
    checkFrequencyHours: 4,
    batchSize: 5,
    activeHoursStart: 10,
    activeHoursEnd: 22,
    traits: {
      isHeavyScroller: false,
      checksNotifications: false,
      lateNightScroller: false,
      reactsOften: false,
    },
  },
  {
    npcId: 'emily',
    platforms: ['myface', 'instasnap'],
    checkFrequencyHours: 2,
    batchSize: 10,
    activeHoursStart: 9,
    activeHoursEnd: 24,
    traits: {
      isHeavyScroller: true,
      checksNotifications: true,
      lateNightScroller: true,
      reactsOften: true,
    },
  },
  {
    npcId: 'marcus',
    platforms: ['myface', 'chirp'],
    checkFrequencyHours: 6,
    batchSize: 8,
    activeHoursStart: 20,
    activeHoursEnd: 3,
    traits: {
      isHeavyScroller: false,
      checksNotifications: false,
      lateNightScroller: true,
      reactsOften: false,
    },
  },
  {
    npcId: 'luna',
    platforms: ['instasnap', 'myface'],
    checkFrequencyHours: 3,
    batchSize: 12,
    activeHoursStart: 7,
    activeHoursEnd: 21,
    traits: {
      isHeavyScroller: true,
      checksNotifications: true,
      lateNightScroller: false,
      reactsOften: true,
    },
  },
];

// ============================================================================
// Habits Management
// ============================================================================

export function getHabits(npcId: string): NPCSocialHabits | null {
  const db = getDB('game');
  const row = db.query('SELECT * FROM npc_social_habits WHERE npc_id = ?').get(npcId) as any;

  if (!row) return null;

  return {
    npcId: row.npc_id,
    platforms: JSON.parse(row.platforms),
    checkFrequencyHours: row.check_frequency_hours,
    batchSize: row.batch_size,
    activeHoursStart: row.active_hours_start,
    activeHoursEnd: row.active_hours_end,
    traits: {
      isHeavyScroller: row.is_heavy_scroller === 1,
      checksNotifications: row.checks_notifications === 1,
      lateNightScroller: row.late_night_scroller === 1,
      reactsOften: row.reacts_often === 1,
    },
  };
}

export function getAllHabits(): NPCSocialHabits[] {
  const db = getDB('game');
  const rows = db.query('SELECT * FROM npc_social_habits').all() as any[];

  return rows.map(row => ({
    npcId: row.npc_id,
    platforms: JSON.parse(row.platforms),
    checkFrequencyHours: row.check_frequency_hours,
    batchSize: row.batch_size,
    activeHoursStart: row.active_hours_start,
    activeHoursEnd: row.active_hours_end,
    traits: {
      isHeavyScroller: row.is_heavy_scroller === 1,
      checksNotifications: row.checks_notifications === 1,
      lateNightScroller: row.late_night_scroller === 1,
      reactsOften: row.reacts_often === 1,
    },
  }));
}

export function setHabits(npcId: string, habits: Partial<NPCSocialHabits>): void {
  const db = getDB('game');
  const existing = getHabits(npcId);

  if (existing) {
    // Update existing
    const merged = { ...existing, ...habits };
    db.run(
      `UPDATE npc_social_habits SET
        platforms = ?,
        check_frequency_hours = ?,
        batch_size = ?,
        active_hours_start = ?,
        active_hours_end = ?,
        is_heavy_scroller = ?,
        checks_notifications = ?,
        late_night_scroller = ?,
        reacts_often = ?
       WHERE npc_id = ?`,
      [
        JSON.stringify(merged.platforms),
        merged.checkFrequencyHours,
        merged.batchSize,
        merged.activeHoursStart,
        merged.activeHoursEnd,
        merged.traits.isHeavyScroller ? 1 : 0,
        merged.traits.checksNotifications ? 1 : 0,
        merged.traits.lateNightScroller ? 1 : 0,
        merged.traits.reactsOften ? 1 : 0,
        npcId,
      ]
    );
  } else {
    // Insert new with defaults
    const defaultHabits: NPCSocialHabits = {
      npcId,
      platforms: ['myface'],
      checkFrequencyHours: 2,
      batchSize: 8,
      activeHoursStart: 9,
      activeHoursEnd: 22,
      traits: {
        isHeavyScroller: false,
        checksNotifications: true,
        lateNightScroller: false,
        reactsOften: false,
      },
      ...habits,
    };

    db.run(
      `INSERT INTO npc_social_habits (
        npc_id, platforms, check_frequency_hours, batch_size,
        active_hours_start, active_hours_end,
        is_heavy_scroller, checks_notifications, late_night_scroller, reacts_often
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        npcId,
        JSON.stringify(defaultHabits.platforms),
        defaultHabits.checkFrequencyHours,
        defaultHabits.batchSize,
        defaultHabits.activeHoursStart,
        defaultHabits.activeHoursEnd,
        defaultHabits.traits.isHeavyScroller ? 1 : 0,
        defaultHabits.traits.checksNotifications ? 1 : 0,
        defaultHabits.traits.lateNightScroller ? 1 : 0,
        defaultHabits.traits.reactsOften ? 1 : 0,
      ]
    );
  }
}

export function initializeDefaultHabits(): void {
  const db = getDB('game');
  const count = db.query('SELECT COUNT(*) as count FROM npc_social_habits').get() as any;

  if (count.count > 0) return; // Already initialized

  for (const habits of DEFAULT_HABITS) {
    setHabits(habits.npcId, habits);
  }

  console.log('[Awareness] Default NPC habits initialized');
}

// ============================================================================
// Last Checked Tracking
// ============================================================================

export function getLastChecked(npcId: string, platform: string): number | null {
  const db = getDB('game');
  const row = db.query(
    'SELECT timestamp FROM npc_last_checked WHERE npc_id = ? AND platform = ?'
  ).get(npcId, platform) as any;

  return row?.timestamp || null;
}

export function updateLastChecked(npcId: string, platform: string): void {
  const db = getDB('game');
  const timestamp = now();

  db.run(
    `INSERT INTO npc_last_checked (id, npc_id, platform, timestamp)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(npc_id, platform) DO UPDATE SET timestamp = excluded.timestamp`,
    [generateId(), npcId, platform, timestamp]
  );
}

// ============================================================================
// Check Logic
// ============================================================================

export function shouldCheckNow(npcId: string, platform: string): boolean {
  const habits = getHabits(npcId);
  if (!habits) return false;

  // Check if platform is in their list
  if (!habits.platforms.includes(platform)) return false;

  // Check if within active hours
  const currentHour = new Date().getHours();
  const { activeHoursStart, activeHoursEnd } = habits;

  // Handle overnight active hours (e.g., 20-3)
  const isInActiveHours = activeHoursEnd < activeHoursStart
    ? currentHour >= activeHoursStart || currentHour < activeHoursEnd
    : currentHour >= activeHoursStart && currentHour < activeHoursEnd;

  if (!isInActiveHours && !habits.traits.lateNightScroller) {
    return false;
  }

  // Check time since last check
  const lastChecked = getLastChecked(npcId, platform);
  if (!lastChecked) return true; // Never checked

  const hoursSinceLastCheck = (now() - lastChecked) / 3600; // Convert seconds to hours

  return hoursSinceLastCheck >= habits.checkFrequencyHours;
}

// ============================================================================
// NPC Social Media Session
// ============================================================================

export interface SocialMediaSession {
  npcId: string;
  platform: string;
  postsViewed: string[];
  timestamp: number;
}

/**
 * Get posts an NPC should see in their current session.
 */
export function getPostsForNPCSession(npcId: string, platform: string): socialService.PostWithDetails[] {
  const habits = getHabits(npcId);
  const batchSize = habits?.batchSize || 5;

  // Get unseen posts from social service
  const unseenPosts = socialService.getUnseenPosts(npcId, platform as any, batchSize * 2);

  // Filter out NPC's own posts
  const filteredPosts = unseenPosts.filter(post => post.authorId !== npcId);

  // Limit based on habits
  const limit = habits?.traits.isHeavyScroller ? Math.floor(batchSize * 1.5) : batchSize;

  return filteredPosts.slice(0, limit);
}

/**
 * Simulate an NPC checking social media.
 * Returns the posts they saw.
 */
export async function npcChecksSocialMedia(
  npcId: string,
  platform: string
): Promise<SocialMediaSession> {
  const postsToSee = getPostsForNPCSession(npcId, platform);
  const habits = getHabits(npcId);

  // Mark all posts as seen
  for (const post of postsToSee) {
    socialService.markPostAsSeen(post.id, npcId, 'npc', platform);
  }

  // Update last checked time
  updateLastChecked(npcId, platform);

  const session: SocialMediaSession = {
    npcId,
    platform,
    postsViewed: postsToSee.map(p => p.id),
    timestamp: now(),
  };

  // Emit event for drama engine to process reactions
  await eventBus.emit(
    EventTypes.NPC_SOCIAL_MEDIA_CHECKED,
    {
      npc_id: npcId,
      platform,
      posts_viewed: session.postsViewed,
      post_count: postsToSee.length,
    },
    {
      source: 'awareness',
      npc_id: npcId,
    }
  );

  // Process reactions if NPC reacts often
  if (habits?.traits.reactsOften && postsToSee.length > 0) {
    // Emit event for drama engine to potentially react
    await eventBus.emit(
      EventTypes.NPC_SHOULD_REACT_TO_POSTS,
      {
        npc_id: npcId,
        posts: postsToSee.map(p => ({
          id: p.id,
          authorId: p.authorId,
          content: p.content,
        })),
      },
      {
        source: 'awareness',
        npc_id: npcId,
      }
    );
  }

  console.log(`[Awareness] ${npcId} checked ${platform}: saw ${postsToSee.length} posts`);
  return session;
}

/**
 * Run social media checks for all NPCs based on their habits.
 * Called periodically by the background scheduler.
 */
export async function simulateSocialMediaChecks(): Promise<SocialMediaSession[]> {
  const allHabits = getAllHabits();
  const sessions: SocialMediaSession[] = [];

  for (const habits of allHabits) {
    for (const platform of habits.platforms) {
      if (shouldCheckNow(habits.npcId, platform)) {
        const session = await npcChecksSocialMedia(habits.npcId, platform);
        sessions.push(session);
      }
    }
  }

  return sessions;
}

// ============================================================================
// Export
// ============================================================================

export const awarenessService = {
  initializeAwarenessSchema,
  initializeDefaultHabits,
  getHabits,
  getAllHabits,
  setHabits,
  getLastChecked,
  updateLastChecked,
  shouldCheckNow,
  getPostsForNPCSession,
  npcChecksSocialMedia,
  simulateSocialMediaChecks,
};

export default awarenessService;
