/**
 * InstaSnap Saved Posts Service
 *
 * Handles post bookmarking/saving functionality.
 */

import { getDB, generateId, now } from '../db/index.js';
import { eventBus, EventTypes } from '../events/index.js';

// ============================================================================
// Types
// ============================================================================

export interface SavedPost {
  id: string;
  post_id: string;
  saver_id: string;
  saved_at: number;
  collection_name: string;
}

// ============================================================================
// Saved Post Operations
// ============================================================================

/**
 * Save a post to bookmarks
 */
export function savePost(
  post_id: string,
  saver_id: string,
  collection_name: string = 'All Posts'
): SavedPost | null {
  const db = getDB('game');

  // Check if already saved
  const existing = db.query(
    'SELECT id FROM instasnap_saved_posts WHERE post_id = ? AND saver_id = ?'
  ).get(post_id, saver_id);

  if (existing) {
    // Update collection if needed
    db.run(
      'UPDATE instasnap_saved_posts SET collection_name = ? WHERE post_id = ? AND saver_id = ?',
      [collection_name, post_id, saver_id]
    );
    return getSavedPost(post_id, saver_id);
  }

  const id = generateId();
  const saved_at = now();

  db.run(
    `INSERT INTO instasnap_saved_posts (id, post_id, saver_id, saved_at, collection_name)
     VALUES (?, ?, ?, ?, ?)`,
    [id, post_id, saver_id, saved_at, collection_name]
  );

  // Emit event
  eventBus.fire(
    EventTypes.SOCIAL_POST_SAVED,
    {
      post_id,
      saver_id,
      collection_name,
    },
    {
      source: 'instasnap-saved',
      post_id,
      player_id: saver_id,
      importance: 0.2,
    }
  );

  return {
    id,
    post_id,
    saver_id,
    saved_at,
    collection_name,
  };
}

/**
 * Unsave/remove a post from bookmarks
 */
export function unsavePost(post_id: string, saver_id: string): boolean {
  const db = getDB('game');

  const result = db.run(
    'DELETE FROM instasnap_saved_posts WHERE post_id = ? AND saver_id = ?',
    [post_id, saver_id]
  );

  if (result.changes > 0) {
    eventBus.fire(
      EventTypes.SOCIAL_POST_UNSAVED,
      {
        post_id,
        saver_id,
      },
      {
        source: 'instasnap-saved',
        post_id,
        player_id: saver_id,
        importance: 0.1,
      }
    );
    return true;
  }

  return false;
}

/**
 * Check if a post is saved
 */
export function isPostSaved(post_id: string, saver_id: string): boolean {
  const db = getDB('game');
  const row = db.query(
    'SELECT id FROM instasnap_saved_posts WHERE post_id = ? AND saver_id = ?'
  ).get(post_id, saver_id);
  return !!row;
}

/**
 * Get a specific saved post
 */
export function getSavedPost(post_id: string, saver_id: string): SavedPost | null {
  const db = getDB('game');
  const row = db.query(
    'SELECT * FROM instasnap_saved_posts WHERE post_id = ? AND saver_id = ?'
  ).get(post_id, saver_id);
  return row ? (row as SavedPost) : null;
}

// ============================================================================
// Query Operations
// ============================================================================

/**
 * Get all saved posts for a user
 */
export function getSavedPosts(
  saver_id: string,
  collection_name?: string
): SavedPost[] {
  const db = getDB('game');

  if (collection_name) {
    const rows = db.query(
      `SELECT * FROM instasnap_saved_posts
       WHERE saver_id = ? AND collection_name = ?
       ORDER BY saved_at DESC`
    ).all(saver_id, collection_name);
    return rows as SavedPost[];
  }

  const rows = db.query(
    `SELECT * FROM instasnap_saved_posts
     WHERE saver_id = ?
     ORDER BY saved_at DESC`
  ).all(saver_id);
  return rows as SavedPost[];
}

/**
 * Get all collections for a user
 */
export function getCollections(saver_id: string): { name: string; count: number }[] {
  const db = getDB('game');

  const rows = db.query(
    `SELECT collection_name as name, COUNT(*) as count
     FROM instasnap_saved_posts
     WHERE saver_id = ?
     GROUP BY collection_name
     ORDER BY count DESC`
  ).all(saver_id) as { name: string; count: number }[];

  return rows;
}

/**
 * Move a saved post to a different collection
 */
export function moveToCollection(
  post_id: string,
  saver_id: string,
  new_collection: string
): boolean {
  const db = getDB('game');

  const result = db.run(
    `UPDATE instasnap_saved_posts
     SET collection_name = ?
     WHERE post_id = ? AND saver_id = ?`,
    [new_collection, post_id, saver_id]
  );

  return result.changes > 0;
}

/**
 * Get count of saves for a post
 */
export function getPostSaveCount(post_id: string): number {
  const db = getDB('game');

  const row = db.query(
    'SELECT COUNT(*) as count FROM instasnap_saved_posts WHERE post_id = ?'
  ).get(post_id) as { count: number };

  return row.count || 0;
}

/**
 * Get saved post statistics for a user
 */
export function getSavedPostStats(saver_id: string): {
  total_saved: number;
  collection_count: number;
} {
  const db = getDB('game');

  const stats = db.query(`
    SELECT
      COUNT(*) as total_saved,
      COUNT(DISTINCT collection_name) as collection_count
    FROM instasnap_saved_posts
    WHERE saver_id = ?
  `).get(saver_id) as { total_saved: number; collection_count: number };

  return {
    total_saved: stats.total_saved || 0,
    collection_count: stats.collection_count || 0,
  };
}
