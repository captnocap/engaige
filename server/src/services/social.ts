/**
 * Social Service
 *
 * Server-side social media logic. Manages posts, likes, comments, and visibility.
 * All game events flow through the event bus.
 *
 * This replaces the frontend socialStore - the frontend should be a dumb cache
 * that receives updates via WebSocket.
 */

import { getDB, generateId, now } from '../db/index.js';
import { eventBus, EventTypes } from '../events/index.js';
import type {
  PostCreatedPayload,
  PostInteractionPayload,
  ProfileViewedPayload,
} from '../events/event-types.js';

// ============================================================================
// Types
// ============================================================================

export interface SocialProfile {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  bio?: string;
  mood?: string;
  moodEmoji?: string;
  location?: string;
  isOnline?: boolean;
  lastSeen?: string;
}

export interface PostView {
  viewerId: string;
  viewerType: 'player' | 'npc';
  viewedAt: number;
  platform: string;
}

export interface PostLike {
  id: string;
  postId: string;
  likerId: string;
  likerType: 'player' | 'npc';
  likedAt: number;
}

export interface Comment {
  id: string;
  postId: string;
  parentCommentId: string | null;
  authorId: string;
  authorType: 'player' | 'npc';
  authorName: string;
  content: string;
  likesCount: number;
  createdAt: number;
}

export interface Post {
  id: string;
  authorId: string;
  authorType: 'player' | 'npc';
  platform: 'myface' | 'chirp' | 'instasnap';
  content: string;
  mediaUrls: string[];
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  createdAt: number;
  contentRating: string;
}

export interface PostWithDetails extends Post {
  author: SocialProfile;
  likes: PostLike[];
  comments: Comment[];
  seenBy: PostView[];
}

// ============================================================================
// Schema Extensions
// ============================================================================

/**
 * Initialize additional tables needed for social features.
 * Called once at startup.
 */
export function initializeSocialSchema(): void {
  const db = getDB('game');

  db.exec(`
    -- Individual post likes (for tracking who liked, not just count)
    CREATE TABLE IF NOT EXISTS post_likes (
      id TEXT PRIMARY KEY,
      post_id TEXT NOT NULL,
      liker_id TEXT NOT NULL,
      liker_type TEXT NOT NULL CHECK (liker_type IN ('player', 'npc')),
      liked_at INTEGER DEFAULT (unixepoch()),
      FOREIGN KEY (post_id) REFERENCES posts(id),
      UNIQUE(post_id, liker_id)
    );

    -- Post visibility tracking (who has "seen" each post)
    CREATE TABLE IF NOT EXISTS post_views (
      id TEXT PRIMARY KEY,
      post_id TEXT NOT NULL,
      viewer_id TEXT NOT NULL,
      viewer_type TEXT NOT NULL CHECK (viewer_type IN ('player', 'npc')),
      platform TEXT NOT NULL,
      viewed_at INTEGER DEFAULT (unixepoch()),
      FOREIGN KEY (post_id) REFERENCES posts(id),
      UNIQUE(post_id, viewer_id)
    );

    -- Indexes
    CREATE INDEX IF NOT EXISTS idx_post_likes_post ON post_likes(post_id);
    CREATE INDEX IF NOT EXISTS idx_post_likes_liker ON post_likes(liker_id, liker_type);
    CREATE INDEX IF NOT EXISTS idx_post_views_post ON post_views(post_id);
    CREATE INDEX IF NOT EXISTS idx_post_views_viewer ON post_views(viewer_id, viewer_type);
  `);

  console.log('[Social] Schema initialized');
}

// ============================================================================
// Profile Helpers
// ============================================================================

/**
 * Get a social profile from NPC or player data.
 */
export function getProfile(id: string): SocialProfile | null {
  if (id === 'player') {
    // Get player profile from user.db
    const db = getDB('user');
    const player = db.query('SELECT * FROM player WHERE id = ?').get('player') as any;
    if (!player) {
      return {
        id: 'player',
        name: 'Player',
        username: 'Player',
        avatar: '👤',
        isOnline: true,
      };
    }
    return {
      id: 'player',
      name: player.display_name || 'Player',
      username: player.username || 'Player',
      avatar: player.avatar_url || '👤',
      bio: player.bio,
      isOnline: true,
    };
  }

  // Get NPC profile from npc.db
  const db = getDB('npc');
  const npcId = id.startsWith('npc_') ? id.slice(4) : id;
  const npc = db.query('SELECT * FROM npcs WHERE id = ? OR username = ?').get(npcId, npcId) as any;

  if (!npc) return null;

  return {
    id: npc.id,
    name: npc.display_name,
    username: npc.username,
    avatar: npc.avatar_url || '👤',
    bio: npc.bio,
    location: npc.location,
    isOnline: npc.is_active === 1,
  };
}

// ============================================================================
// Post Operations
// ============================================================================

/**
 * Create a new post.
 */
export async function createPost(params: {
  authorId: string;
  authorType: 'player' | 'npc';
  platform: 'myface' | 'chirp' | 'instasnap';
  content: string;
  mediaUrls?: string[];
  contentRating?: string;
}): Promise<Post> {
  const db = getDB('game');
  const id = generateId();
  const createdAt = now();

  db.run(
    `INSERT INTO posts (id, npc_id, platform, content, media_urls, likes_count, comments_count, shares_count, created_at, content_rating)
     VALUES (?, ?, ?, ?, ?, 0, 0, 0, ?, ?)`,
    [
      id,
      params.authorId,
      params.platform,
      params.content,
      JSON.stringify(params.mediaUrls || []),
      createdAt,
      params.contentRating || 'normal',
    ]
  );

  const post: Post = {
    id,
    authorId: params.authorId,
    authorType: params.authorType,
    platform: params.platform,
    content: params.content,
    mediaUrls: params.mediaUrls || [],
    likesCount: 0,
    commentsCount: 0,
    sharesCount: 0,
    createdAt,
    contentRating: params.contentRating || 'normal',
  };

  // Emit event
  await eventBus.emit<PostCreatedPayload>(
    EventTypes.SOCIAL_POST_CREATED,
    {
      post_id: id,
      platform: params.platform,
      content: params.content,
      has_media: (params.mediaUrls?.length || 0) > 0,
      media_urls: params.mediaUrls,
    },
    {
      source: 'social',
      npc_id: params.authorType === 'npc' ? params.authorId : undefined,
      player_id: params.authorType === 'player' ? params.authorId : undefined,
      post_id: id,
    }
  );

  console.log(`[Social] Post created: ${id} by ${params.authorId}`);
  return post;
}

/**
 * Get a post by ID with full details.
 */
export function getPost(postId: string): PostWithDetails | null {
  const db = getDB('game');

  const row = db.query('SELECT * FROM posts WHERE id = ?').get(postId) as any;
  if (!row) return null;

  const author = getProfile(row.npc_id);
  if (!author) return null;

  const likes = db.query('SELECT * FROM post_likes WHERE post_id = ?').all(postId) as any[];
  const comments = db.query(
    'SELECT * FROM comments WHERE post_id = ? ORDER BY created_at ASC'
  ).all(postId) as any[];
  const views = db.query('SELECT * FROM post_views WHERE post_id = ?').all(postId) as any[];

  return {
    id: row.id,
    authorId: row.npc_id,
    authorType: row.npc_id === 'player' ? 'player' : 'npc',
    platform: row.platform,
    content: row.content,
    mediaUrls: JSON.parse(row.media_urls || '[]'),
    likesCount: row.likes_count,
    commentsCount: row.comments_count,
    sharesCount: row.shares_count,
    createdAt: row.created_at,
    contentRating: row.content_rating,
    author,
    likes: likes.map(l => ({
      id: l.id,
      postId: l.post_id,
      likerId: l.liker_id,
      likerType: l.liker_type,
      likedAt: l.liked_at,
    })),
    comments: comments.map(c => ({
      id: c.id,
      postId: c.post_id,
      parentCommentId: c.parent_comment_id,
      authorId: c.author_id,
      authorType: c.author_type,
      authorName: c.author_name,
      content: c.content,
      likesCount: c.likes_count,
      createdAt: c.created_at,
    })),
    seenBy: views.map(v => ({
      viewerId: v.viewer_id,
      viewerType: v.viewer_type,
      viewedAt: v.viewed_at,
      platform: v.platform,
    })),
  };
}

/**
 * Get feed posts for a platform.
 */
export function getFeed(platform?: string, limit = 50): PostWithDetails[] {
  const db = getDB('game');

  const query = platform
    ? 'SELECT * FROM posts WHERE platform = ? ORDER BY created_at DESC LIMIT ?'
    : 'SELECT * FROM posts ORDER BY created_at DESC LIMIT ?';

  const rows = platform
    ? (db.query(query).all(platform, limit) as any[])
    : (db.query(query).all(limit) as any[]);

  return rows
    .map(row => getPost(row.id))
    .filter((p): p is PostWithDetails => p !== null);
}

/**
 * Get posts by author.
 */
export function getPostsByAuthor(authorId: string, limit = 50): PostWithDetails[] {
  const db = getDB('game');
  const rows = db.query(
    'SELECT * FROM posts WHERE npc_id = ? ORDER BY created_at DESC LIMIT ?'
  ).all(authorId, limit) as any[];

  return rows
    .map(row => getPost(row.id))
    .filter((p): p is PostWithDetails => p !== null);
}

// ============================================================================
// Like Operations
// ============================================================================

/**
 * Like a post.
 */
export async function likePost(postId: string, likerId: string, likerType: 'player' | 'npc'): Promise<boolean> {
  const db = getDB('game');

  // Check if already liked
  const existing = db.query(
    'SELECT id FROM post_likes WHERE post_id = ? AND liker_id = ?'
  ).get(postId, likerId);

  if (existing) return false;

  const id = generateId();
  db.run(
    'INSERT INTO post_likes (id, post_id, liker_id, liker_type) VALUES (?, ?, ?, ?)',
    [id, postId, likerId, likerType]
  );

  // Update count
  db.run('UPDATE posts SET likes_count = likes_count + 1 WHERE id = ?', [postId]);

  // Emit event
  await eventBus.emit<PostInteractionPayload>(
    EventTypes.SOCIAL_POST_LIKED,
    {
      post_id: postId,
      interaction_type: 'like',
      actor_type: likerType,
      actor_id: likerId,
    },
    {
      source: 'social',
      post_id: postId,
      player_id: likerType === 'player' ? likerId : undefined,
      npc_id: likerType === 'npc' ? likerId : undefined,
    }
  );

  return true;
}

/**
 * Unlike a post.
 */
export function unlikePost(postId: string, likerId: string): boolean {
  const db = getDB('game');

  const result = db.run(
    'DELETE FROM post_likes WHERE post_id = ? AND liker_id = ?',
    [postId, likerId]
  );

  if (result.changes > 0) {
    db.run('UPDATE posts SET likes_count = MAX(0, likes_count - 1) WHERE id = ?', [postId]);
    return true;
  }

  return false;
}

/**
 * Check if a user has liked a post.
 */
export function hasLiked(postId: string, likerId: string): boolean {
  const db = getDB('game');
  const row = db.query(
    'SELECT id FROM post_likes WHERE post_id = ? AND liker_id = ?'
  ).get(postId, likerId);
  return !!row;
}

// ============================================================================
// Comment Operations
// ============================================================================

/**
 * Add a comment to a post.
 */
export async function addComment(params: {
  postId: string;
  authorId: string;
  authorType: 'player' | 'npc';
  content: string;
  parentCommentId?: string;
}): Promise<Comment> {
  const db = getDB('game');
  const id = generateId();
  const createdAt = now();

  // Get author name
  const profile = getProfile(params.authorId);
  const authorName = profile?.name || params.authorId;

  db.run(
    `INSERT INTO comments (id, post_id, parent_comment_id, author_id, author_type, author_name, content, likes_count, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)`,
    [id, params.postId, params.parentCommentId || null, params.authorId, params.authorType, authorName, params.content, createdAt]
  );

  // Update post comment count
  db.run('UPDATE posts SET comments_count = comments_count + 1 WHERE id = ?', [params.postId]);

  const comment: Comment = {
    id,
    postId: params.postId,
    parentCommentId: params.parentCommentId || null,
    authorId: params.authorId,
    authorType: params.authorType,
    authorName,
    content: params.content,
    likesCount: 0,
    createdAt,
  };

  // Emit event
  await eventBus.emit<PostInteractionPayload>(
    EventTypes.SOCIAL_POST_COMMENTED,
    {
      post_id: params.postId,
      interaction_type: 'comment',
      actor_type: params.authorType,
      actor_id: params.authorId,
      content: params.content,
    },
    {
      source: 'social',
      post_id: params.postId,
      player_id: params.authorType === 'player' ? params.authorId : undefined,
      npc_id: params.authorType === 'npc' ? params.authorId : undefined,
    }
  );

  return comment;
}

/**
 * Get comments for a post.
 */
export function getComments(postId: string): Comment[] {
  const db = getDB('game');
  const rows = db.query(
    'SELECT * FROM comments WHERE post_id = ? ORDER BY created_at ASC'
  ).all(postId) as any[];

  return rows.map(c => ({
    id: c.id,
    postId: c.post_id,
    parentCommentId: c.parent_comment_id,
    authorId: c.author_id,
    authorType: c.author_type,
    authorName: c.author_name,
    content: c.content,
    likesCount: c.likes_count,
    createdAt: c.created_at,
  }));
}

// ============================================================================
// Visibility/Awareness Tracking
// ============================================================================

/**
 * Mark a post as seen by a viewer.
 */
export function markPostAsSeen(
  postId: string,
  viewerId: string,
  viewerType: 'player' | 'npc',
  viewPlatform?: string
): boolean {
  const db = getDB('game');

  // Check if already seen
  const existing = db.query(
    'SELECT id FROM post_views WHERE post_id = ? AND viewer_id = ?'
  ).get(postId, viewerId);

  if (existing) return false;

  // Get post platform if not provided
  let platform = viewPlatform;
  if (!platform) {
    const post = db.query('SELECT platform FROM posts WHERE id = ?').get(postId) as any;
    platform = post?.platform || 'myface';
  }

  const id = generateId();
  db.run(
    'INSERT INTO post_views (id, post_id, viewer_id, viewer_type, platform) VALUES (?, ?, ?, ?, ?)',
    [id, postId, viewerId, viewerType, platform]
  );

  return true;
}

/**
 * Check if a viewer has seen a post.
 */
export function hasSeenPost(postId: string, viewerId: string): boolean {
  const db = getDB('game');
  const row = db.query(
    'SELECT id FROM post_views WHERE post_id = ? AND viewer_id = ?'
  ).get(postId, viewerId);
  return !!row;
}

/**
 * Get all posts seen by a viewer.
 */
export function getPostsSeenBy(viewerId: string): string[] {
  const db = getDB('game');
  const rows = db.query(
    'SELECT post_id FROM post_views WHERE viewer_id = ?'
  ).all(viewerId) as any[];
  return rows.map(r => r.post_id);
}

/**
 * Get unseen posts for a viewer on a platform.
 */
export function getUnseenPosts(
  viewerId: string,
  platform?: string,
  limit = 50
): PostWithDetails[] {
  const db = getDB('game');

  const query = platform
    ? `SELECT p.* FROM posts p
       LEFT JOIN post_views v ON p.id = v.post_id AND v.viewer_id = ?
       WHERE v.id IS NULL AND p.platform = ?
       ORDER BY p.created_at DESC
       LIMIT ?`
    : `SELECT p.* FROM posts p
       LEFT JOIN post_views v ON p.id = v.post_id AND v.viewer_id = ?
       WHERE v.id IS NULL
       ORDER BY p.created_at DESC
       LIMIT ?`;

  const rows = platform
    ? (db.query(query).all(viewerId, platform, limit) as any[])
    : (db.query(query).all(viewerId, limit) as any[]);

  return rows
    .map(row => getPost(row.id))
    .filter((p): p is PostWithDetails => p !== null);
}

// ============================================================================
// Profile View Tracking
// ============================================================================

/**
 * Record a profile view.
 */
export async function recordProfileView(
  profileOwnerId: string,
  viewerId: string,
  viewerType: 'player' | 'npc',
  platform: string
): Promise<void> {
  await eventBus.emit<ProfileViewedPayload>(
    EventTypes.SOCIAL_PROFILE_VIEWED,
    {
      profile_owner_id: profileOwnerId,
      viewer_type: viewerType,
      viewer_id: viewerId,
      platform,
    },
    {
      source: 'social',
      npc_id: profileOwnerId !== 'player' ? profileOwnerId : viewerType === 'npc' ? viewerId : undefined,
      player_id: profileOwnerId === 'player' ? 'player' : viewerType === 'player' ? viewerId : undefined,
    }
  );
}

// ============================================================================
// Export
// ============================================================================

export const socialService = {
  initializeSocialSchema,
  getProfile,
  createPost,
  getPost,
  getFeed,
  getPostsByAuthor,
  likePost,
  unlikePost,
  hasLiked,
  addComment,
  getComments,
  markPostAsSeen,
  hasSeenPost,
  getPostsSeenBy,
  getUnseenPosts,
  recordProfileView,
};

export default socialService;
