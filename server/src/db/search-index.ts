/**
 * Search Index Database
 *
 * FTS5-powered full-text search for the .corn internet.
 * Indexes both static seed content (filler sites) and dynamic NPC-generated content.
 *
 * Uses SQLite FTS5 with:
 * - Porter stemming for better matching
 * - BM25 ranking with column weights
 * - Proximity ranking via NEAR operator
 * - Automatic snippet generation with keyword highlighting
 */

import { getGlobalDB } from './global-db.js';
import type { Database } from 'bun:sqlite';

// ============================================================================
// Types
// ============================================================================

export interface IndexableContent {
  id: string
  url: string                       // Full URL: 'www.dailybuzz.corn/article/47-coffee'
  siteDomain: string                // Domain: 'dailybuzz.corn'
  contentType: string               // Type: 'article', 'product', 'video', 'post', etc.
  title: string
  body: string                      // Full text content for search
  snippet: string                   // Short preview (first 200 chars or summary)
  author?: string
  tags?: string[]
  metadata?: Record<string, unknown> // Type-specific data (price, rating, etc.)
  createdAt?: number
}

export interface SearchResult {
  id: string
  url: string
  siteDomain: string
  contentType: string
  title: string
  snippet: string                   // May include <mark> highlights
  author: string | null
  tags: string | null
  metadata: string | null
  source: string                    // 'static' or 'dynamic'
  createdAt: number | null
  rank: number                      // FTS5 BM25 rank (lower is better)
}

export interface SearchOptions {
  query: string
  domain?: string                   // Filter by site domain
  contentType?: string              // Filter by content type
  source?: 'static' | 'dynamic'     // Filter by source
  limit?: number
  offset?: number
  useProximity?: boolean            // Use NEAR for multi-word queries
  proximityDistance?: number        // Max tokens between words (default: 10)
}

// ============================================================================
// Schema Initialization
// ============================================================================

let schemaInitialized = false;

/**
 * Initialize the search index schema in global.db
 */
export function initializeSearchIndex(): void {
  if (schemaInitialized) return;

  const db = getGlobalDB();

  db.exec(`
    -- Main content table (source of truth)
    CREATE TABLE IF NOT EXISTS search_content (
      id TEXT PRIMARY KEY,
      url TEXT NOT NULL UNIQUE,
      site_domain TEXT NOT NULL,
      content_type TEXT NOT NULL,
      title TEXT NOT NULL,
      body TEXT,
      snippet TEXT,
      author TEXT,
      tags TEXT,
      metadata TEXT,
      source TEXT NOT NULL CHECK (source IN ('static', 'dynamic')),
      created_at INTEGER,
      indexed_at INTEGER NOT NULL DEFAULT (unixepoch())
    );

    -- FTS5 virtual table for full-text search
    -- Uses porter stemmer and unicode61 tokenizer
    CREATE VIRTUAL TABLE IF NOT EXISTS search_fts USING fts5(
      title,
      body,
      snippet,
      author,
      tags,
      content='search_content',
      content_rowid='rowid',
      tokenize='porter unicode61'
    );

    -- Triggers to keep FTS5 index in sync with content table
    CREATE TRIGGER IF NOT EXISTS search_ai AFTER INSERT ON search_content BEGIN
      INSERT INTO search_fts(rowid, title, body, snippet, author, tags)
      VALUES (new.rowid, new.title, new.body, new.snippet, new.author, new.tags);
    END;

    CREATE TRIGGER IF NOT EXISTS search_ad AFTER DELETE ON search_content BEGIN
      INSERT INTO search_fts(search_fts, rowid, title, body, snippet, author, tags)
      VALUES('delete', old.rowid, old.title, old.body, old.snippet, old.author, old.tags);
    END;

    CREATE TRIGGER IF NOT EXISTS search_au AFTER UPDATE ON search_content BEGIN
      INSERT INTO search_fts(search_fts, rowid, title, body, snippet, author, tags)
      VALUES('delete', old.rowid, old.title, old.body, old.snippet, old.author, old.tags);
      INSERT INTO search_fts(rowid, title, body, snippet, author, tags)
      VALUES (new.rowid, new.title, new.body, new.snippet, new.author, new.tags);
    END;

    -- Indexes for filtering
    CREATE INDEX IF NOT EXISTS idx_search_domain ON search_content(site_domain);
    CREATE INDEX IF NOT EXISTS idx_search_type ON search_content(content_type);
    CREATE INDEX IF NOT EXISTS idx_search_source ON search_content(source);
    CREATE INDEX IF NOT EXISTS idx_search_created ON search_content(created_at);
  `);

  schemaInitialized = true;
}

// ============================================================================
// Indexing Functions
// ============================================================================

/**
 * Index a single piece of content
 */
export function indexContent(content: IndexableContent): void {
  initializeSearchIndex();
  const db = getGlobalDB();

  const stmt = db.prepare(`
    INSERT INTO search_content (id, url, site_domain, content_type, title, body, snippet, author, tags, metadata, source, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      url = excluded.url,
      site_domain = excluded.site_domain,
      content_type = excluded.content_type,
      title = excluded.title,
      body = excluded.body,
      snippet = excluded.snippet,
      author = excluded.author,
      tags = excluded.tags,
      metadata = excluded.metadata,
      indexed_at = unixepoch()
  `);

  stmt.run(
    content.id,
    content.url,
    content.siteDomain,
    content.contentType,
    content.title,
    content.body || '',
    content.snippet || content.body?.slice(0, 200) || '',
    content.author || null,
    content.tags ? JSON.stringify(content.tags) : null,
    content.metadata ? JSON.stringify(content.metadata) : null,
    'dynamic', // Default to dynamic; static content sets this explicitly
    content.createdAt || null
  );
}

/**
 * Index static content (from filler sites)
 * Uses 'static' source and won't overwrite existing static content
 */
export function indexStaticContent(content: IndexableContent): void {
  initializeSearchIndex();
  const db = getGlobalDB();

  const stmt = db.prepare(`
    INSERT INTO search_content (id, url, site_domain, content_type, title, body, snippet, author, tags, metadata, source, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'static', ?)
    ON CONFLICT(id) DO NOTHING
  `);

  stmt.run(
    content.id,
    content.url,
    content.siteDomain,
    content.contentType,
    content.title,
    content.body || '',
    content.snippet || content.body?.slice(0, 200) || '',
    content.author || null,
    content.tags ? JSON.stringify(content.tags) : null,
    content.metadata ? JSON.stringify(content.metadata) : null,
    content.createdAt || null
  );
}

/**
 * Index multiple static content items in a transaction
 */
export function indexStaticContentBatch(contents: IndexableContent[]): number {
  initializeSearchIndex();
  const db = getGlobalDB();

  const stmt = db.prepare(`
    INSERT INTO search_content (id, url, site_domain, content_type, title, body, snippet, author, tags, metadata, source, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'static', ?)
    ON CONFLICT(id) DO NOTHING
  `);

  let indexed = 0;

  db.exec('BEGIN TRANSACTION');
  try {
    for (const content of contents) {
      const result = stmt.run(
        content.id,
        content.url,
        content.siteDomain,
        content.contentType,
        content.title,
        content.body || '',
        content.snippet || content.body?.slice(0, 200) || '',
        content.author || null,
        content.tags ? JSON.stringify(content.tags) : null,
        content.metadata ? JSON.stringify(content.metadata) : null,
        content.createdAt || null
      );
      if (result.changes > 0) indexed++;
    }
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }

  return indexed;
}

/**
 * Remove content from the index
 */
export function removeFromIndex(id: string): boolean {
  initializeSearchIndex();
  const db = getGlobalDB();

  const result = db.prepare('DELETE FROM search_content WHERE id = ?').run(id);
  return result.changes > 0;
}

/**
 * Clear all content from the index
 */
export function clearIndex(source?: 'static' | 'dynamic'): number {
  initializeSearchIndex();
  const db = getGlobalDB();

  if (source) {
    const result = db.prepare('DELETE FROM search_content WHERE source = ?').run(source);
    return result.changes;
  } else {
    const result = db.prepare('DELETE FROM search_content').run();
    return result.changes;
  }
}

// ============================================================================
// Search Functions
// ============================================================================

/**
 * Search the index with FTS5
 *
 * Uses BM25 ranking with column weights:
 * - title: 10 (most important)
 * - body: 5
 * - snippet: 2
 * - author: 1
 * - tags: 1
 */
export function search(options: SearchOptions): SearchResult[] {
  initializeSearchIndex();
  const db = getGlobalDB();

  const {
    query,
    domain,
    contentType,
    source,
    limit = 20,
    offset = 0,
    useProximity = false,
    proximityDistance = 10,
  } = options;

  if (!query.trim()) return [];

  // Build FTS5 match expression
  let matchExpr = query;
  if (useProximity && query.includes(' ')) {
    // Use NEAR for multi-word queries to boost proximity
    const words = query.split(/\s+/).filter(w => w.length > 0);
    if (words.length > 1) {
      matchExpr = `NEAR(${words.join(' ')}, ${proximityDistance})`;
    }
  }

  // Build SQL with filters
  let sql = `
    SELECT
      sc.id,
      sc.url,
      sc.site_domain as siteDomain,
      sc.content_type as contentType,
      sc.title,
      snippet(search_fts, 1, '<mark>', '</mark>', '...', 32) as snippet,
      sc.author,
      sc.tags,
      sc.metadata,
      sc.source,
      sc.created_at as createdAt,
      bm25(search_fts, 10.0, 5.0, 2.0, 1.0, 1.0) as rank
    FROM search_fts
    JOIN search_content sc ON search_fts.rowid = sc.rowid
    WHERE search_fts MATCH ?
  `;

  const params: (string | number)[] = [matchExpr];

  if (domain) {
    sql += ' AND sc.site_domain = ?';
    params.push(domain);
  }

  if (contentType) {
    sql += ' AND sc.content_type = ?';
    params.push(contentType);
  }

  if (source) {
    sql += ' AND sc.source = ?';
    params.push(source);
  }

  sql += ' ORDER BY rank LIMIT ? OFFSET ?';
  params.push(limit, offset);

  try {
    return db.prepare(sql).all(...params) as SearchResult[];
  } catch (error) {
    // FTS5 can throw on malformed queries; return empty results
    console.error('[search-index] Search error:', error);
    return [];
  }
}

/**
 * Get autocomplete suggestions based on prefix
 */
export function autocomplete(prefix: string, limit = 10): Array<{ title: string; url: string; contentType: string }> {
  initializeSearchIndex();
  const db = getGlobalDB();

  if (!prefix.trim() || prefix.length < 2) return [];

  // Use prefix matching with FTS5
  const matchExpr = `${prefix}*`;

  try {
    return db.prepare(`
      SELECT DISTINCT
        sc.title,
        sc.url,
        sc.content_type as contentType
      FROM search_fts
      JOIN search_content sc ON search_fts.rowid = sc.rowid
      WHERE search_fts MATCH ?
      ORDER BY bm25(search_fts)
      LIMIT ?
    `).all(matchExpr, limit) as Array<{ title: string; url: string; contentType: string }>;
  } catch {
    return [];
  }
}

/**
 * Get count of indexed content
 */
export function getIndexStats(): { total: number; static: number; dynamic: number; byType: Record<string, number>; byDomain: Record<string, number> } {
  initializeSearchIndex();
  const db = getGlobalDB();

  const total = (db.prepare('SELECT COUNT(*) as count FROM search_content').get() as { count: number }).count;
  const staticCount = (db.prepare("SELECT COUNT(*) as count FROM search_content WHERE source = 'static'").get() as { count: number }).count;
  const dynamicCount = (db.prepare("SELECT COUNT(*) as count FROM search_content WHERE source = 'dynamic'").get() as { count: number }).count;

  const byTypeRows = db.prepare('SELECT content_type, COUNT(*) as count FROM search_content GROUP BY content_type').all() as Array<{ content_type: string; count: number }>;
  const byType: Record<string, number> = {};
  for (const row of byTypeRows) {
    byType[row.content_type] = row.count;
  }

  const byDomainRows = db.prepare('SELECT site_domain, COUNT(*) as count FROM search_content GROUP BY site_domain ORDER BY count DESC LIMIT 20').all() as Array<{ site_domain: string; count: number }>;
  const byDomain: Record<string, number> = {};
  for (const row of byDomainRows) {
    byDomain[row.site_domain] = row.count;
  }

  return { total, static: staticCount, dynamic: dynamicCount, byType, byDomain };
}

// ============================================================================
// Exports
// ============================================================================

export default {
  initializeSearchIndex,
  indexContent,
  indexStaticContent,
  indexStaticContentBatch,
  removeFromIndex,
  clearIndex,
  search,
  autocomplete,
  getIndexStats,
};
