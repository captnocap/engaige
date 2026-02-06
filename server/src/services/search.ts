/**
 * Search Service
 *
 * Provides full-text search across the .corn internet.
 * Uses FTS5 with BM25 ranking and proximity boosting.
 *
 * Handles:
 * - DB-driven content indexing (site_content table on startup)
 * - Dynamic content indexing (NPC-generated content in real-time)
 * - Search queries with filters
 * - Autocomplete suggestions
 */

import {
  initializeSearchIndex,
  indexStaticContentBatch,
  indexContent,
  search as searchIndex,
  autocomplete as autocompleteIndex,
  getIndexStats,
  type IndexableContent,
  type SearchResult,
  type SearchOptions,
} from '../db/search-index.js';
import { getGlobalDB } from '../db/global-db.js';
import { getDB } from '../db/index.js';
import { eventBus, EventTypes } from '../events/index.js';
import { errorLogger } from './error-logger.js';

// ============================================================================
// Types
// ============================================================================

export interface SearchQuery {
  query: string;
  domain?: string;
  contentType?: string;
  limit?: number;
  offset?: number;
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
  total: number;
  took: number; // milliseconds
  stats?: {
    indexed: number;
    byDomain: Record<string, number>;
    byType: Record<string, number>;
  };
}

export interface AutocompleteResponse {
  prefix: string;
  suggestions: Array<{
    title: string;
    url: string;
    contentType: string;
  }>;
}

// ============================================================================
// URL Pattern Config: (site_id, content_type) → URL template
// ============================================================================

/**
 * Maps (site_id, content_type) to URL path templates.
 * {slug} is replaced with the content's slug.
 * {category} is replaced with the content's category field.
 */
export const SITE_URL_PATTERNS: Record<string, Record<string, string>> = {
  vidtube: { video: '/watch/{slug}' },
  amaize: { product: '/product/{slug}' },
  threadit: { thread: '/t/{category}/n/{slug}', board: '/t/{slug}' },
  wikiknow: { article: '/wiki/{slug}' },
  dailybuzz: { article: '/article/{slug}' },
  askcorn: { question: '/question/{slug}' },
  huskreviews: { business: '/business/{slug}' },
  cobhub: { repo: '/{slug}' },
  kernelpods: { show: '/show/{slug}' },
  forchan: { thread: '/{category}/thread/{slug}', board: '/{slug}' },
  cobfundme: { campaign: '/campaign/{slug}' },
  nestfinder: { listing: '/listing/{slug}' },
  bargainbay: { listing: '/{slug}' },
  cornhub: { recipe: '/recipe/{slug}' },
  onlyfans: { product: '/{slug}' },
  onlyfarms: { product: '/{slug}' },
  stalks: { market: '/market/{slug}' },
  cornmaps: { place: '/place/{slug}' },
  oddsoracle: { market: '/market/{slug}' },
  vitalityrx: { product: '/product/{slug}' },
  silkroad: { product: '/{slug}' },
  stalk: { stream: '/stream/{slug}' },
  benchwatch: { analysis: '/bench/{slug}' },
  dominate: { lesson: '/lesson/{slug}' },
  stationsushi: { review: '/review/{slug}' },
  truemoss: { specimen: '/specimen/{slug}' },
};

/**
 * Maps site_id → .corn domain.
 * Used to build full URLs for search results.
 */
const SITE_DOMAINS: Record<string, string> = {
  myface: 'myface.corn',
  instasnap: 'instasnap.corn',
  threadit: 'threadit.corn',
  wikiknow: 'wikiknow.corn',
  dailybuzz: 'dailybuzz.corn',
  vidtube: 'vidtube.corn',
  forchan: 'forchan.corn',
  amaize: 'amaize.corn',
  bargainbay: 'bargainbay.corn',
  nestfinder: 'nestfinder.corn',
  cobfundme: 'cobfundme.corn',
  vitalityrx: 'vitalityrx.corn',
  oddsoracle: 'oddsoracle.corn',
  wealthwisdom: 'wealthwisdom.corn',
  askcorn: 'askcorn.corn',
  huskreviews: 'huskreviews.corn',
  cobhub: 'cobhub.corn',
  kernelpods: 'kernelpods.corn',
  pastelive: 'pastelive.corn',
  cornhub: 'cornhub.corn',
  onlyfans: 'onlyfans.corn',
  onlyfarms: 'onlyfarms.corn',
  strangerzone: 'strangerzone.corn',
  graintruth: 'graintruth.corn',
  bandsnotintown: 'bandsnotintown.corn',
  cobcoin: 'cobcoin.corn',
  goober: 'goober.corn',
  cornmaze: 'maze.corn',
  corngpt: 'corngpt.corn',
  stalks: 'stalks.corn',
  cornmaps: 'cornmaps.corn',
  cornmd: 'cornmd.corn',
  linkedcorn: 'linkedcorn.corn',
  stalk: 'stalk.corn',
  corndr: 'corndr.corn',
  deaddrop: 'deaddrop.corn',
  silkroad: 'silkroad.corn',
  cornarchive: 'cornarchive.corn',
  quantumbrewblog: 'quantumbrewblog.corn',
  trustfalltim: 'trustfalltim.corn',
  hartwellfiles: 'hartwellfiles.corn',
  cornstalkblog: 'thoughtsfromtherow.corn',
  jennifersblog: 'jenniferheals.corn',
  elenasblog: 'elenasclarifies.corn',
  venuepoetryblog: 'anonymousvenuepoet.corn',
  timsmomsupport: 'carolstimupdate.corn',
  smallkevinblog: 'smallkevinredemption.corn',
  drmartinezblog: 'drmartinezclarifies.corn',
  bigmikeblog: 'bigmikefromtulsa.corn',
  vexdrums: 'vexdrumsblog.corn',
  patriciablog: 'patriciasworkplacewellness.corn',
  wonderwallwarrior: 'wonderwallwarrior.corn',
  floor13blog: 'floor13exists.corn',
  benchwatch: 'benchwatch.corn',
  dominate: 'dominate.corn',
  stationsushi: 'stationsushireview.corn',
  truemoss: 'truemoss.corn',
};

/**
 * Build a full URL for a piece of site content.
 */
export function buildContentUrl(siteId: string, contentType: string, slug: string, category?: string | null): string {
  const domain = SITE_DOMAINS[siteId] || `${siteId}.corn`;
  const patterns = SITE_URL_PATTERNS[siteId];
  let pathTemplate = patterns?.[contentType] || `/${slug}`;

  let path = pathTemplate
    .replace('{slug}', slug)
    .replace('{category}', category || 'general');

  return `www.${domain}${path}`;
}

// ============================================================================
// DB-Driven Index Builder
// ============================================================================

interface SiteContentDBRow {
  id: string;
  site_id: string;
  content_type: string;
  slug: string;
  category: string | null;
  title: string;
  body: string | null;
  summary: string | null;
  tags: string;
  metadata: string;
  published_at: number | null;
  created_at: number;
}

/**
 * Build search index content from the site_content table.
 * Returns IndexableContent[] suitable for indexStaticContentBatch.
 */
function buildSearchIndexFromDB(): IndexableContent[] {
  const db = getDB('game');

  const rows = db.query(`
    SELECT id, site_id, content_type, slug, category, title, body, summary, tags, metadata, published_at, created_at
    FROM site_content
    WHERE is_archived = 0
    ORDER BY site_id, content_type
  `).all() as SiteContentDBRow[];

  const items: IndexableContent[] = [];

  for (const row of rows) {
    const domain = SITE_DOMAINS[row.site_id] || `${row.site_id}.corn`;

    let tags: string[] = [];
    try { tags = JSON.parse(row.tags || '[]'); } catch { /* ignore */ }

    let metadata: Record<string, unknown> = {};
    try { metadata = JSON.parse(row.metadata || '{}'); } catch { /* ignore */ }

    // For ForChan, use board short code from metadata instead of full category name
    let effectiveCategory = row.category;
    if (row.site_id === 'forchan' && metadata.board) {
      effectiveCategory = String(metadata.board).replace(/\//g, '');
    }

    const url = buildContentUrl(row.site_id, row.content_type, row.slug, effectiveCategory);

    // Extract author from metadata if available
    const author = (metadata.author as string)
      || (metadata.channel_name as string)
      || (metadata.seller as string)
      || undefined;

    items.push({
      id: `db_${row.id}`,
      url,
      siteDomain: domain,
      contentType: row.content_type,
      title: row.title,
      body: row.body || row.summary || '',
      snippet: row.summary || (row.body ? row.body.slice(0, 200) : ''),
      author,
      tags,
      metadata,
      createdAt: row.published_at || row.created_at,
    });
  }

  return items;
}

// ============================================================================
// Service State
// ============================================================================

let isInitialized = false;
let initializationPromise: Promise<void> | null = null;

// ============================================================================
// Initialization
// ============================================================================

/**
 * Initialize the search service and index content from DB
 */
export async function initializeSearch(): Promise<void> {
  if (isInitialized) return;
  if (initializationPromise) return initializationPromise;

  initializationPromise = (async () => {
    const startTime = Date.now();

    try {
      // Initialize FTS5 schema
      initializeSearchIndex();

      // Clear stale static entries before re-indexing (IDs/URLs may have changed)
      const globalDb = getGlobalDB();
      globalDb.exec("DELETE FROM search_content WHERE source = 'static'");

      // Build index from site_content table
      const dbContent = buildSearchIndexFromDB();
      let indexed = 0;

      if (dbContent.length > 0) {
        indexed = indexStaticContentBatch(dbContent);
        console.log(`[search] Indexed ${indexed} items from site_content DB in ${Date.now() - startTime}ms`);
      } else {
        console.log('[search] No site_content in DB - search index empty (seed content first)');
      }

      const took = Date.now() - startTime;

      // Emit initialization event
      eventBus.fire(EventTypes.SYSTEM_STARTUP, {
        version: '1.0.0',
        port: 0, // Not applicable
      }, {
        source: 'search',
        importance: 0.5,
      });

      isInitialized = true;
    } catch (error) {
      errorLogger.log(error, {
        source: 'search',
        operation: 'initializeSearch',
      });
      throw error;
    }
  })();

  return initializationPromise;
}

// ============================================================================
// Search Functions
// ============================================================================

/**
 * Execute a search query
 */
export async function executeSearch(query: SearchQuery): Promise<SearchResponse> {
  await initializeSearch();

  const startTime = Date.now();

  try {
    const options: SearchOptions = {
      query: query.query,
      domain: query.domain,
      contentType: query.contentType,
      limit: query.limit || 20,
      offset: query.offset || 0,
      useProximity: query.query.includes(' '), // Use proximity for multi-word queries
      proximityDistance: 10,
    };

    const results = searchIndex(options);
    const took = Date.now() - startTime;

    // Get stats for response
    const stats = getIndexStats();

    // Emit search event (for analytics)
    eventBus.fire('search:query_executed' as any, {
      query: query.query,
      result_count: results.length,
      took_ms: took,
      filters: {
        domain: query.domain,
        contentType: query.contentType,
      },
    }, {
      source: 'search',
      importance: 0.3,
    });

    return {
      query: query.query,
      results,
      total: results.length, // FTS5 doesn't give total without a separate query
      took,
      stats: {
        indexed: stats.total,
        byDomain: stats.byDomain,
        byType: stats.byType,
      },
    };
  } catch (error) {
    errorLogger.log(error, {
      source: 'search',
      operation: 'executeSearch',
    });
    return {
      query: query.query,
      results: [],
      total: 0,
      took: Date.now() - startTime,
    };
  }
}

/**
 * Get autocomplete suggestions
 */
export async function getAutocomplete(prefix: string, limit = 10): Promise<AutocompleteResponse> {
  await initializeSearch();

  try {
    const suggestions = autocompleteIndex(prefix, limit);
    return {
      prefix,
      suggestions,
    };
  } catch (error) {
    errorLogger.log(error, {
      source: 'search',
      operation: 'getAutocomplete',
    });
    return {
      prefix,
      suggestions: [],
    };
  }
}

/**
 * Index new dynamic content (for NPC-generated content)
 */
export async function indexDynamicContent(content: IndexableContent): Promise<void> {
  await initializeSearch();

  try {
    indexContent(content);

    eventBus.fire('search:content_indexed' as any, {
      content_id: content.id,
      content_type: content.contentType,
      site_domain: content.siteDomain,
    }, {
      source: 'search',
      importance: 0.2,
    });
  } catch (error) {
    errorLogger.log(error, {
      source: 'search',
      operation: 'indexDynamicContent',
    });
  }
}

/**
 * Get search index statistics
 */
export async function getSearchStats(): Promise<ReturnType<typeof getIndexStats>> {
  await initializeSearch();
  return getIndexStats();
}

/**
 * Get all site content formatted as a site index (for CornMaze / manifests).
 * Groups content by site_id, builds proper URLs.
 */
export function getSiteIndex(): Record<string, { domain: string; pages: Array<{ url: string; title: string; type: string; description: string; category?: string }> }> {
  const db = getDB('game');

  const rows = db.query(`
    SELECT site_id, content_type, slug, category, title, summary, metadata
    FROM site_content
    WHERE is_archived = 0
    ORDER BY site_id, content_type, title
  `).all() as Array<{
    site_id: string;
    content_type: string;
    slug: string;
    category: string | null;
    title: string;
    summary: string | null;
    metadata: string | null;
  }>;

  const result: Record<string, { domain: string; pages: Array<{ url: string; title: string; type: string; description: string; category?: string }> }> = {};

  for (const row of rows) {
    const domain = SITE_DOMAINS[row.site_id] || `${row.site_id}.corn`;

    if (!result[row.site_id]) {
      result[row.site_id] = { domain, pages: [] };
    }

    // For ForChan, use board short code from metadata instead of full category name
    let effectiveCategory = row.category;
    if (row.site_id === 'forchan' && row.metadata) {
      try {
        const meta = JSON.parse(row.metadata);
        if (meta.board) effectiveCategory = String(meta.board).replace(/\//g, '');
      } catch { /* ignore */ }
    }

    const url = buildContentUrl(row.site_id, row.content_type, row.slug, effectiveCategory);

    result[row.site_id].pages.push({
      url,
      title: row.title,
      type: row.content_type,
      description: row.summary || '',
      category: row.category || undefined,
    });
  }

  return result;
}

// ============================================================================
// Exports
// ============================================================================

export const searchService = {
  initialize: initializeSearch,
  search: executeSearch,
  autocomplete: getAutocomplete,
  indexContent: indexDynamicContent,
  getStats: getSearchStats,
  getSiteIndex,
  buildContentUrl,
};

export default searchService;
