/**
 * Hashtags Service
 *
 * Handles hashtag tracking, trending scores, and post-hashtag relationships.
 */

import { getDB, generateId, now } from '../db/index.js';
import { eventBus, EventTypes } from '../events/index.js';

// ============================================================================
// Types
// ============================================================================

export interface Hashtag {
  id: string;
  tag: string;
  usage_count: number;
  trending_score: number;
  last_used_at: number;
}

export interface PostHashtag {
  post_id: string;
  hashtag_id: string;
}

export interface TrendingHashtag extends Hashtag {
  rank: number;
}

// ============================================================================
// Hashtag Operations
// ============================================================================

/**
 * Get or create a hashtag by tag name
 */
export function getOrCreateHashtag(tag: string): Hashtag {
  const db = getDB('game');
  const normalizedTag = normalizeTag(tag);

  // Check if exists
  let hashtag = db.query(
    'SELECT * FROM instasnap_hashtags WHERE tag = ?'
  ).get(normalizedTag) as Hashtag | null;

  if (hashtag) {
    return hashtag;
  }

  // Create new
  const id = generateId();
  db.run(
    `INSERT INTO instasnap_hashtags (id, tag, usage_count, trending_score, last_used_at)
     VALUES (?, ?, 0, 0, ?)`,
    [id, normalizedTag, now()]
  );

  return {
    id,
    tag: normalizedTag,
    usage_count: 0,
    trending_score: 0,
    last_used_at: now(),
  };
}

/**
 * Get a hashtag by tag name
 */
export function getHashtag(tag: string): Hashtag | null {
  const db = getDB('game');
  const normalizedTag = normalizeTag(tag);
  const row = db.query('SELECT * FROM instasnap_hashtags WHERE tag = ?').get(normalizedTag);
  return row ? (row as Hashtag) : null;
}

/**
 * Get a hashtag by ID
 */
export function getHashtagById(id: string): Hashtag | null {
  const db = getDB('game');
  const row = db.query('SELECT * FROM instasnap_hashtags WHERE id = ?').get(id);
  return row ? (row as Hashtag) : null;
}

/**
 * Increment hashtag usage and update trending score
 */
export function useHashtag(
  tag: string,
  post_id: string,
  author_id: string,
  author_type: 'player' | 'npc'
): Hashtag {
  const db = getDB('game');
  const hashtag = getOrCreateHashtag(tag);
  const current = now();

  // Update usage count and trending score
  // Trending score decays over time but increases with usage
  const timeSinceLastUse = current - hashtag.last_used_at;
  const decayFactor = Math.exp(-timeSinceLastUse / (24 * 60 * 60)); // Decay over 24 hours
  const newTrendingScore = Math.min(1, (hashtag.trending_score * decayFactor) + 0.1);

  db.run(
    `UPDATE instasnap_hashtags
     SET usage_count = usage_count + 1,
         trending_score = ?,
         last_used_at = ?
     WHERE id = ?`,
    [newTrendingScore, current, hashtag.id]
  );

  // Link hashtag to post
  db.run(
    `INSERT OR IGNORE INTO instasnap_post_hashtags (post_id, hashtag_id)
     VALUES (?, ?)`,
    [post_id, hashtag.id]
  );

  // Emit event
  eventBus.fire(
    EventTypes.SOCIAL_HASHTAG_USED,
    {
      tag: hashtag.tag,
      post_id,
      author_id,
      author_type,
    },
    {
      source: 'hashtags',
      post_id,
      npc_id: author_type === 'npc' ? author_id : undefined,
      player_id: author_type === 'player' ? author_id : undefined,
      importance: 0.2,
    }
  );

  return {
    ...hashtag,
    usage_count: hashtag.usage_count + 1,
    trending_score: newTrendingScore,
    last_used_at: current,
  };
}

/**
 * Extract and process hashtags from content
 */
export function extractAndProcessHashtags(
  content: string,
  post_id: string,
  author_id: string,
  author_type: 'player' | 'npc'
): Hashtag[] {
  const tags = extractHashtags(content);
  return tags.map(tag => useHashtag(tag, post_id, author_id, author_type));
}

// ============================================================================
// Trending & Discovery
// ============================================================================

/**
 * Get trending hashtags
 */
export function getTrendingHashtags(limit: number = 10): TrendingHashtag[] {
  const db = getDB('game');

  // Recalculate trending scores (decay old ones)
  recalculateTrendingScores();

  const rows = db.query(
    `SELECT *
     FROM instasnap_hashtags
     WHERE trending_score > 0
     ORDER BY trending_score DESC
     LIMIT ?`
  ).all(limit) as Hashtag[];

  return rows.map((row, index) => ({
    ...row,
    rank: index + 1,
  }));
}

/**
 * Search hashtags by prefix
 */
export function searchHashtags(query: string, limit: number = 10): Hashtag[] {
  const db = getDB('game');
  const normalizedQuery = normalizeTag(query);

  const rows = db.query(
    `SELECT *
     FROM instasnap_hashtags
     WHERE tag LIKE ?
     ORDER BY usage_count DESC
     LIMIT ?`
  ).all(`${normalizedQuery}%`, limit);

  return rows as Hashtag[];
}

/**
 * Get posts for a hashtag
 */
export function getPostsForHashtag(tag: string, limit: number = 50): string[] {
  const db = getDB('game');
  const normalizedTag = normalizeTag(tag);

  const rows = db.query(
    `SELECT ph.post_id
     FROM instasnap_post_hashtags ph
     JOIN instasnap_hashtags h ON ph.hashtag_id = h.id
     WHERE h.tag = ?
     LIMIT ?`
  ).all(normalizedTag, limit) as { post_id: string }[];

  return rows.map(r => r.post_id);
}

/**
 * Get hashtags for a post
 */
export function getHashtagsForPost(post_id: string): Hashtag[] {
  const db = getDB('game');

  const rows = db.query(
    `SELECT h.*
     FROM instasnap_hashtags h
     JOIN instasnap_post_hashtags ph ON h.id = ph.hashtag_id
     WHERE ph.post_id = ?`
  ).all(post_id);

  return rows as Hashtag[];
}

// ============================================================================
// Maintenance
// ============================================================================

/**
 * Recalculate trending scores based on time decay
 */
export function recalculateTrendingScores(): void {
  const db = getDB('game');
  const current = now();

  // Apply time decay to all trending scores
  // Score decays by 50% every 24 hours
  db.run(
    `UPDATE instasnap_hashtags
     SET trending_score = trending_score * EXP(-CAST(? - last_used_at AS REAL) / (24 * 60 * 60))`
    , [current]
  );

  // Clean up hashtags with very low scores and no recent usage
  const oneWeekAgo = current - (7 * 24 * 60 * 60);
  db.run(
    `DELETE FROM instasnap_hashtags
     WHERE trending_score < 0.01
     AND last_used_at < ?
     AND usage_count < 5`,
    [oneWeekAgo]
  );
}

/**
 * Get hashtag statistics
 */
export function getHashtagStats(): {
  total_hashtags: number;
  total_usage: number;
  trending_count: number;
} {
  const db = getDB('game');

  const stats = db.query(`
    SELECT
      COUNT(*) as total_hashtags,
      COALESCE(SUM(usage_count), 0) as total_usage,
      SUM(CASE WHEN trending_score > 0.1 THEN 1 ELSE 0 END) as trending_count
    FROM instasnap_hashtags
  `).get() as { total_hashtags: number; total_usage: number; trending_count: number };

  return {
    total_hashtags: stats.total_hashtags || 0,
    total_usage: Number(stats.total_usage) || 0,
    trending_count: stats.trending_count || 0,
  };
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Normalize a hashtag (lowercase, remove #, alphanumeric only)
 */
function normalizeTag(tag: string): string {
  return tag
    .toLowerCase()
    .replace(/^#/, '')
    .replace(/[^a-z0-9_]/g, '');
}

/**
 * Extract hashtags from content
 */
export function extractHashtags(content: string): string[] {
  const regex = /#([a-zA-Z0-9_]+)/g;
  const matches = content.matchAll(regex);
  const tags = [...matches].map(m => normalizeTag(m[1]));

  // Remove duplicates
  return [...new Set(tags)];
}
