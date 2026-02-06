/**
 * Site Content Service
 *
 * Generic data access layer for all site_content, site_channels,
 * site_categories, and site_content_comments queries.
 * Used by filler sites (VidTube, Threadit, WikiKnow, etc.) to
 * fetch seeded content from the database.
 */

import { getDB } from '../db/index.js';

// ============================================================================
// Types
// ============================================================================

/** Database row types (snake_case from SQLite) */

interface SiteContentRow {
  id: string;
  site_id: string;
  content_type: string;
  slug: string;
  channel_id: string | null;
  parent_id: string | null;
  category: string | null;
  title: string;
  subtitle: string | null;
  body: string | null;
  summary: string | null;
  thumbnail_emoji: string | null;
  thumbnail_url: string | null;
  media_urls: string;
  metadata: string;
  tags: string;
  entities: string;
  keywords: string | null;
  view_count: number;
  like_count: number;
  comment_count: number;
  engagement_score: number;
  is_featured: number;
  is_pinned: number;
  is_archived: number;
  published_at: number | null;
  created_at: number;
  updated_at: number;
}

interface SiteChannelRow {
  id: string;
  site_id: string;
  slug: string;
  name: string;
  avatar_emoji: string | null;
  avatar_url: string | null;
  description: string | null;
  metadata: string;
  follower_count: number;
  content_count: number;
  created_at: number;
  updated_at: number;
}

interface SiteCategoryRow {
  id: string;
  site_id: string;
  slug: string;
  name: string;
  description: string | null;
  icon_emoji: string | null;
  parent_id: string | null;
  sort_order: number;
}

interface SiteCommentRow {
  id: string;
  content_id: string;
  parent_comment_id: string | null;
  root_comment_id: string | null;
  thread_depth: number;
  author_id: string | null;
  author_type: string | null;
  author_name: string;
  author_avatar: string | null;
  content: string;
  like_count: number;
  dislike_count: number;
  is_creator: number;
  published_at: number | null;
  created_at: number;
}

/** Model types (camelCase for frontend) */

export interface SiteContentItem {
  id: string;
  siteId: string;
  contentType: string;
  slug: string;
  channelId?: string;
  parentId?: string;
  category?: string;
  title: string;
  subtitle?: string;
  body?: string;
  summary?: string;
  thumbnailEmoji?: string;
  thumbnailUrl?: string;
  mediaUrls: string[];
  metadata: Record<string, any>;
  tags: string[];
  entities: string[];
  keywords?: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  engagementScore: number;
  isFeatured: boolean;
  isPinned: boolean;
  isArchived: boolean;
  publishedAt?: number;
  createdAt: number;
  updatedAt: number;
}

export interface SiteChannel {
  id: string;
  siteId: string;
  slug: string;
  name: string;
  avatarEmoji?: string;
  avatarUrl?: string;
  description?: string;
  metadata: Record<string, any>;
  followerCount: number;
  contentCount: number;
  createdAt: number;
  updatedAt: number;
}

export interface SiteCategory {
  id: string;
  siteId: string;
  slug: string;
  name: string;
  description?: string;
  iconEmoji?: string;
  parentId?: string;
  sortOrder: number;
}

export interface SiteComment {
  id: string;
  contentId: string;
  parentCommentId?: string;
  rootCommentId?: string;
  threadDepth: number;
  authorId?: string;
  authorType?: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  likeCount: number;
  dislikeCount: number;
  isCreator: boolean;
  publishedAt?: number;
  createdAt: number;
}

export interface SiteCommentTree extends SiteComment {
  replies: SiteCommentTree[];
}

// ============================================================================
// Row-to-Model Conversion
// ============================================================================

function rowToContent(row: SiteContentRow): SiteContentItem {
  return {
    id: row.id,
    siteId: row.site_id,
    contentType: row.content_type,
    slug: row.slug,
    channelId: row.channel_id ?? undefined,
    parentId: row.parent_id ?? undefined,
    category: row.category ?? undefined,
    title: row.title,
    subtitle: row.subtitle ?? undefined,
    body: row.body ?? undefined,
    summary: row.summary ?? undefined,
    thumbnailEmoji: row.thumbnail_emoji ?? undefined,
    thumbnailUrl: row.thumbnail_url ?? undefined,
    mediaUrls: JSON.parse(row.media_urls || '[]'),
    metadata: JSON.parse(row.metadata || '{}'),
    tags: JSON.parse(row.tags || '[]'),
    entities: JSON.parse(row.entities || '[]'),
    keywords: row.keywords ?? undefined,
    viewCount: row.view_count,
    likeCount: row.like_count,
    commentCount: row.comment_count,
    engagementScore: row.engagement_score,
    isFeatured: row.is_featured === 1,
    isPinned: row.is_pinned === 1,
    isArchived: row.is_archived === 1,
    publishedAt: row.published_at ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function rowToChannel(row: SiteChannelRow): SiteChannel {
  return {
    id: row.id,
    siteId: row.site_id,
    slug: row.slug,
    name: row.name,
    avatarEmoji: row.avatar_emoji ?? undefined,
    avatarUrl: row.avatar_url ?? undefined,
    description: row.description ?? undefined,
    metadata: JSON.parse(row.metadata || '{}'),
    followerCount: row.follower_count,
    contentCount: row.content_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function rowToCategory(row: SiteCategoryRow): SiteCategory {
  return {
    id: row.id,
    siteId: row.site_id,
    slug: row.slug,
    name: row.name,
    description: row.description ?? undefined,
    iconEmoji: row.icon_emoji ?? undefined,
    parentId: row.parent_id ?? undefined,
    sortOrder: row.sort_order,
  };
}

function rowToComment(row: SiteCommentRow): SiteComment {
  return {
    id: row.id,
    contentId: row.content_id,
    parentCommentId: row.parent_comment_id ?? undefined,
    rootCommentId: row.root_comment_id ?? undefined,
    threadDepth: row.thread_depth,
    authorId: row.author_id ?? undefined,
    authorType: row.author_type ?? undefined,
    authorName: row.author_name,
    authorAvatar: row.author_avatar ?? undefined,
    content: row.content,
    likeCount: row.like_count,
    dislikeCount: row.dislike_count,
    isCreator: row.is_creator === 1,
    publishedAt: row.published_at ?? undefined,
    createdAt: row.created_at,
  };
}

// ============================================================================
// Query Functions
// ============================================================================

export interface GetContentOptions {
  contentType?: string;
  category?: string;
  channelId?: string;
  limit?: number;
  offset?: number;
  featured?: boolean;
  search?: string;
}

export function getContent(siteId: string, options: GetContentOptions = {}): SiteContentItem[] {
  const db = getDB('game');
  const { contentType, category, channelId, limit = 100, offset = 0, featured, search } = options;

  let query = 'SELECT * FROM site_content WHERE site_id = ? AND is_archived = 0';
  const params: any[] = [siteId];

  if (contentType) {
    query += ' AND content_type = ?';
    params.push(contentType);
  }
  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }
  if (channelId) {
    query += ' AND channel_id = ?';
    params.push(channelId);
  }
  if (featured !== undefined) {
    query += ' AND is_featured = ?';
    params.push(featured ? 1 : 0);
  }
  if (search) {
    query += ' AND (title LIKE ? OR summary LIKE ? OR body LIKE ?)';
    const pattern = `%${search}%`;
    params.push(pattern, pattern, pattern);
  }

  query += ' ORDER BY is_pinned DESC, published_at DESC, created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const rows = db.query(query).all(...params) as SiteContentRow[];
  return rows.map(rowToContent);
}

export function getContentBySlug(siteId: string, slug: string): SiteContentItem | null {
  const db = getDB('game');
  const row = db.query(
    'SELECT * FROM site_content WHERE site_id = ? AND slug = ? LIMIT 1'
  ).get(siteId, slug) as SiteContentRow | null;
  return row ? rowToContent(row) : null;
}

export function getContentById(id: string): SiteContentItem | null {
  const db = getDB('game');
  const row = db.query(
    'SELECT * FROM site_content WHERE id = ? LIMIT 1'
  ).get(id) as SiteContentRow | null;
  return row ? rowToContent(row) : null;
}

export function getChannels(siteId: string): SiteChannel[] {
  const db = getDB('game');
  const rows = db.query(
    'SELECT * FROM site_channels WHERE site_id = ? ORDER BY name ASC'
  ).all(siteId) as SiteChannelRow[];
  return rows.map(rowToChannel);
}

export function getChannelBySlug(siteId: string, slug: string): SiteChannel | null {
  const db = getDB('game');
  const row = db.query(
    'SELECT * FROM site_channels WHERE site_id = ? AND slug = ? LIMIT 1'
  ).get(siteId, slug) as SiteChannelRow | null;
  return row ? rowToChannel(row) : null;
}

export function getCategories(siteId: string): SiteCategory[] {
  const db = getDB('game');
  const rows = db.query(
    'SELECT * FROM site_categories WHERE site_id = ? ORDER BY sort_order ASC, name ASC'
  ).all(siteId) as SiteCategoryRow[];
  return rows.map(rowToCategory);
}

export function getComments(contentId: string): SiteComment[] {
  const db = getDB('game');
  const rows = db.query(
    'SELECT * FROM site_content_comments WHERE content_id = ? ORDER BY created_at ASC'
  ).all(contentId) as SiteCommentRow[];
  return rows.map(rowToComment);
}

export function buildCommentTree(comments: SiteComment[]): SiteCommentTree[] {
  const map = new Map<string, SiteCommentTree>();
  const roots: SiteCommentTree[] = [];

  // Create tree nodes
  for (const comment of comments) {
    map.set(comment.id, { ...comment, replies: [] });
  }

  // Build tree
  for (const comment of comments) {
    const node = map.get(comment.id)!;
    if (comment.parentCommentId) {
      const parent = map.get(comment.parentCommentId);
      if (parent) {
        parent.replies.push(node);
      } else {
        roots.push(node);
      }
    } else {
      roots.push(node);
    }
  }

  return roots;
}

export function getContentWithComments(siteId: string, slug: string): { content: SiteContentItem | null; comments: SiteCommentTree[] } {
  const content = getContentBySlug(siteId, slug);
  if (!content) {
    return { content: null, comments: [] };
  }

  const flatComments = getComments(content.id);
  const comments = buildCommentTree(flatComments);
  return { content, comments };
}

export function searchContent(query: string, options: { siteId?: string; limit?: number } = {}): SiteContentItem[] {
  const db = getDB('game');
  const { siteId, limit = 50 } = options;
  const pattern = `%${query}%`;

  let sql = 'SELECT * FROM site_content WHERE is_archived = 0 AND (title LIKE ? OR summary LIKE ? OR body LIKE ? OR tags LIKE ?)';
  const params: any[] = [pattern, pattern, pattern, pattern];

  if (siteId) {
    sql += ' AND site_id = ?';
    params.push(siteId);
  }

  sql += ' ORDER BY engagement_score DESC, published_at DESC LIMIT ?';
  params.push(limit);

  const rows = db.query(sql).all(...params) as SiteContentRow[];
  return rows.map(rowToContent);
}

// ============================================================================
// Singleton Export
// ============================================================================

export const siteContentService = {
  getContent,
  getContentBySlug,
  getContentById,
  getChannels,
  getChannelBySlug,
  getCategories,
  getComments,
  buildCommentTree,
  getContentWithComments,
  searchContent,
};

export default siteContentService;
