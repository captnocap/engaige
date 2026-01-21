/**
 * InstaSnap Stories Service
 *
 * Handles story CRUD operations, expiration, and view tracking.
 */

import { getDB, generateId, now } from '../db/index.js';
import { eventBus, EventTypes } from '../events/index.js';

// ============================================================================
// Types
// ============================================================================

export interface Story {
  id: string;
  author_id: string;
  author_type: 'player' | 'npc';
  media_url: string;
  media_type: 'image' | 'video';
  caption: string | null;
  filter_applied: string | null;
  created_at: number;
  expires_at: number;
  view_count: number;
}

export interface StoryView {
  id: string;
  story_id: string;
  viewer_id: string;
  viewer_type: 'player' | 'npc';
  viewed_at: number;
}

export interface CreateStoryInput {
  author_id: string;
  author_type: 'player' | 'npc';
  media_url: string;
  media_type: 'image' | 'video';
  caption?: string;
  filter_applied?: string;
  duration_hours?: number; // Default 24
}

// ============================================================================
// Story CRUD
// ============================================================================

/**
 * Create a new story (24-hour ephemeral post)
 */
export function createStory(input: CreateStoryInput): Story {
  const db = getDB('game');
  const id = generateId();
  const created_at = now();
  const duration_hours = input.duration_hours ?? 24;
  const expires_at = created_at + (duration_hours * 60 * 60);

  db.run(
    `INSERT INTO instasnap_stories
      (id, author_id, author_type, media_url, media_type, caption, filter_applied, created_at, expires_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      input.author_id,
      input.author_type,
      input.media_url,
      input.media_type,
      input.caption || null,
      input.filter_applied || null,
      created_at,
      expires_at,
    ]
  );

  const story: Story = {
    id,
    author_id: input.author_id,
    author_type: input.author_type,
    media_url: input.media_url,
    media_type: input.media_type,
    caption: input.caption || null,
    filter_applied: input.filter_applied || null,
    created_at,
    expires_at,
    view_count: 0,
  };

  // Emit event
  eventBus.fire(
    EventTypes.SOCIAL_STORY_CREATED,
    {
      story_id: id,
      author_id: input.author_id,
      author_type: input.author_type,
      media_url: input.media_url,
      media_type: input.media_type,
      caption: input.caption,
      filter_applied: input.filter_applied,
      expires_at,
    },
    {
      source: 'instasnap-stories',
      npc_id: input.author_type === 'npc' ? input.author_id : undefined,
      player_id: input.author_type === 'player' ? input.author_id : undefined,
      importance: 0.4,
    }
  );

  return story;
}

/**
 * Get a story by ID
 */
export function getStory(id: string): Story | null {
  const db = getDB('game');
  const row = db.query('SELECT * FROM instasnap_stories WHERE id = ?').get(id);
  return row ? (row as Story) : null;
}

/**
 * Get all active (non-expired) stories
 */
export function getActiveStories(): Story[] {
  const db = getDB('game');
  const current = now();
  const rows = db.query(
    'SELECT * FROM instasnap_stories WHERE expires_at > ? ORDER BY created_at DESC'
  ).all(current);
  return rows as Story[];
}

/**
 * Get active stories by a specific author
 */
export function getStoriesByAuthor(author_id: string): Story[] {
  const db = getDB('game');
  const current = now();
  const rows = db.query(
    'SELECT * FROM instasnap_stories WHERE author_id = ? AND expires_at > ? ORDER BY created_at DESC'
  ).all(author_id, current);
  return rows as Story[];
}

/**
 * Delete a story
 */
export function deleteStory(id: string): boolean {
  const db = getDB('game');
  const result = db.run('DELETE FROM instasnap_stories WHERE id = ?', [id]);
  return result.changes > 0;
}

// ============================================================================
// Story Views
// ============================================================================

/**
 * Record a story view
 */
export function viewStory(
  story_id: string,
  viewer_id: string,
  viewer_type: 'player' | 'npc'
): boolean {
  const db = getDB('game');

  // Check if already viewed
  const existing = db.query(
    'SELECT id FROM instasnap_story_views WHERE story_id = ? AND viewer_id = ?'
  ).get(story_id, viewer_id);

  if (existing) {
    return false; // Already viewed
  }

  // Record view
  const id = generateId();
  db.run(
    `INSERT INTO instasnap_story_views (id, story_id, viewer_id, viewer_type)
     VALUES (?, ?, ?, ?)`,
    [id, story_id, viewer_id, viewer_type]
  );

  // Increment view count
  db.run(
    'UPDATE instasnap_stories SET view_count = view_count + 1 WHERE id = ?',
    [story_id]
  );

  // Get story for event context
  const story = getStory(story_id);

  // Emit event
  eventBus.fire(
    EventTypes.SOCIAL_STORY_VIEWED,
    {
      story_id,
      author_id: story?.author_id || '',
      viewer_id,
      viewer_type,
    },
    {
      source: 'instasnap-stories',
      npc_id: viewer_type === 'npc' ? viewer_id : story?.author_type === 'npc' ? story.author_id : undefined,
      player_id: viewer_type === 'player' ? viewer_id : story?.author_type === 'player' ? story.author_id : undefined,
      importance: 0.2,
    }
  );

  return true;
}

/**
 * Check if a viewer has seen a story
 */
export function hasViewedStory(story_id: string, viewer_id: string): boolean {
  const db = getDB('game');
  const row = db.query(
    'SELECT id FROM instasnap_story_views WHERE story_id = ? AND viewer_id = ?'
  ).get(story_id, viewer_id);
  return !!row;
}

/**
 * Get all viewers of a story
 */
export function getStoryViewers(story_id: string): StoryView[] {
  const db = getDB('game');
  const rows = db.query(
    'SELECT * FROM instasnap_story_views WHERE story_id = ? ORDER BY viewed_at DESC'
  ).all(story_id);
  return rows as StoryView[];
}

// ============================================================================
// Cleanup
// ============================================================================

/**
 * Clean up expired stories and emit expiration events
 */
export function cleanupExpiredStories(): number {
  const db = getDB('game');
  const current = now();

  // Get expired stories for events
  const expired = db.query(
    'SELECT * FROM instasnap_stories WHERE expires_at <= ?'
  ).all(current) as Story[];

  // Emit expiration events
  for (const story of expired) {
    eventBus.fire(
      EventTypes.SOCIAL_STORY_EXPIRED,
      {
        story_id: story.id,
        author_id: story.author_id,
        author_type: story.author_type,
        view_count: story.view_count,
      },
      {
        source: 'instasnap-stories',
        npc_id: story.author_type === 'npc' ? story.author_id : undefined,
        player_id: story.author_type === 'player' ? story.author_id : undefined,
        importance: 0.3,
      }
    );
  }

  // Delete views for expired stories
  db.run(
    `DELETE FROM instasnap_story_views
     WHERE story_id IN (SELECT id FROM instasnap_stories WHERE expires_at <= ?)`,
    [current]
  );

  // Delete expired stories
  const result = db.run(
    'DELETE FROM instasnap_stories WHERE expires_at <= ?',
    [current]
  );

  return result.changes;
}

// ============================================================================
// Stats
// ============================================================================

/**
 * Get story statistics for an author
 */
export function getAuthorStoryStats(author_id: string): {
  total_stories: number;
  total_views: number;
  active_stories: number;
} {
  const db = getDB('game');
  const current = now();

  const stats = db.query(`
    SELECT
      COUNT(*) as total_stories,
      COALESCE(SUM(view_count), 0) as total_views,
      SUM(CASE WHEN expires_at > ? THEN 1 ELSE 0 END) as active_stories
    FROM instasnap_stories
    WHERE author_id = ?
  `).get(current, author_id) as { total_stories: number; total_views: number; active_stories: number };

  return {
    total_stories: stats.total_stories || 0,
    total_views: Number(stats.total_views) || 0,
    active_stories: stats.active_stories || 0,
  };
}
