/**
 * News Feed Service
 *
 * Core aggregator for the unified news feed system.
 * Handles articles from all sources (RSS, user lore, AI-generated)
 * with no distinction visible to NPCs.
 */

import { getDB, generateId, now } from '../db/index.js';
import { eventBus, EventTypes } from '../events/index.js';
import { errorLogger } from './error-logger.js';
import {
  type NewsArticle,
  type NewsSource,
  type NewsCategory,
  type GetHeadlinesOptions,
  type SearchArticlesOptions,
  type NewsArticleRow,
  rowToArticle,
  articleToRow,
} from '../types/news.js';
import { readdir, readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { existsSync } from 'fs';

// ============================================================================
// Configuration
// ============================================================================

const LORE_DIRECTORY = join(dirname(import.meta.url.replace('file://', '')), '../../data/news/lore');

// ============================================================================
// News Feed Service
// ============================================================================

class NewsFeedService {
  private loreLoaded = false;

  /**
   * Initialize the news feed service
   * Loads lore articles from disk on first access
   */
  async initialize(): Promise<void> {
    if (!this.loreLoaded) {
      await this.loadLoreArticles();
      this.loreLoaded = true;
    }
  }

  // ==========================================================================
  // Article Retrieval
  // ==========================================================================

  /**
   * Get recent headlines for NPC context injection
   * NPCs don't see any distinction between sources - it's all just "news"
   */
  async getHeadlinesForContext(options: GetHeadlinesOptions = {}): Promise<NewsArticle[]> {
    const {
      limit = 5,
      categories,
      sources,
      hoursBack = 48,
      excludeArticleIds = [],
    } = options;

    const db = getDB('game');
    const cutoffTime = now() - (hoursBack * 60 * 60);

    let query = `
      SELECT * FROM news_articles
      WHERE published_at >= ?
    `;
    const params: any[] = [cutoffTime];

    if (categories && categories.length > 0) {
      query += ` AND category IN (${categories.map(() => '?').join(', ')})`;
      params.push(...categories);
    }

    if (sources && sources.length > 0) {
      query += ` AND source IN (${sources.map(() => '?').join(', ')})`;
      params.push(...sources);
    }

    if (excludeArticleIds.length > 0) {
      query += ` AND id NOT IN (${excludeArticleIds.map(() => '?').join(', ')})`;
      params.push(...excludeArticleIds);
    }

    query += ` ORDER BY published_at DESC LIMIT ?`;
    params.push(limit);

    const rows = db.query(query).all(...params) as NewsArticleRow[];
    return rows.map(rowToArticle);
  }

  /**
   * Get a single article by ID or slug
   */
  async getArticle(idOrSlug: string): Promise<NewsArticle | null> {
    const db = getDB('game');
    const row = db.query(`
      SELECT * FROM news_articles
      WHERE id = ? OR slug = ?
      LIMIT 1
    `).get(idOrSlug, idOrSlug) as NewsArticleRow | null;

    return row ? rowToArticle(row) : null;
  }

  /**
   * Get multiple articles by IDs
   */
  async getArticles(ids: string[]): Promise<NewsArticle[]> {
    if (ids.length === 0) return [];

    const db = getDB('game');
    const placeholders = ids.map(() => '?').join(', ');
    const rows = db.query(`
      SELECT * FROM news_articles
      WHERE id IN (${placeholders})
    `).all(...ids) as NewsArticleRow[];

    return rows.map(rowToArticle);
  }

  /**
   * Search articles by keyword
   */
  async searchArticles(query: string, options: SearchArticlesOptions = {}): Promise<NewsArticle[]> {
    const { limit = 20, categories, sources, fromDate, toDate } = options;

    const db = getDB('game');
    const searchPattern = `%${query}%`;

    let sql = `
      SELECT * FROM news_articles
      WHERE (
        headline LIKE ? OR
        subheadline LIKE ? OR
        summary LIKE ? OR
        content LIKE ? OR
        tags LIKE ?
      )
    `;
    const params: any[] = [searchPattern, searchPattern, searchPattern, searchPattern, searchPattern];

    if (categories && categories.length > 0) {
      sql += ` AND category IN (${categories.map(() => '?').join(', ')})`;
      params.push(...categories);
    }

    if (sources && sources.length > 0) {
      sql += ` AND source IN (${sources.map(() => '?').join(', ')})`;
      params.push(...sources);
    }

    if (fromDate) {
      sql += ` AND published_at >= ?`;
      params.push(fromDate);
    }

    if (toDate) {
      sql += ` AND published_at <= ?`;
      params.push(toDate);
    }

    sql += ` ORDER BY published_at DESC LIMIT ?`;
    params.push(limit);

    const rows = db.query(sql).all(...params) as NewsArticleRow[];
    return rows.map(rowToArticle);
  }

  /**
   * Get trending articles (most mentioned by NPCs recently)
   */
  async getTrendingArticles(options: { limit?: number; hoursBack?: number } = {}): Promise<NewsArticle[]> {
    const { limit = 10, hoursBack = 24 } = options;
    const cutoffTime = now() - (hoursBack * 60 * 60);

    const db = getDB('game');
    const rows = db.query(`
      SELECT * FROM news_articles
      WHERE last_mentioned_at >= ? AND npc_mentions > 0
      ORDER BY npc_mentions DESC, last_mentioned_at DESC
      LIMIT ?
    `).all(cutoffTime, limit) as NewsArticleRow[];

    return rows.map(rowToArticle);
  }

  /**
   * Get all articles (paginated)
   */
  async getAllArticles(options: { limit?: number; offset?: number; source?: NewsSource } = {}): Promise<NewsArticle[]> {
    const { limit = 50, offset = 0, source } = options;

    const db = getDB('game');
    let query = 'SELECT * FROM news_articles';
    const params: any[] = [];

    if (source) {
      query += ' WHERE source = ?';
      params.push(source);
    }

    query += ' ORDER BY published_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const rows = db.query(query).all(...params) as NewsArticleRow[];
    return rows.map(rowToArticle);
  }

  // ==========================================================================
  // Article Ingestion
  // ==========================================================================

  /**
   * Ingest a new article from any source
   */
  async ingestArticle(
    article: Omit<NewsArticle, 'id' | 'npcMentions' | 'createdAt'>
  ): Promise<NewsArticle> {
    const db = getDB('game');
    const id = generateId();

    const fullArticle: NewsArticle = {
      ...article,
      id,
      npcMentions: 0,
      createdAt: now(),
    };

    const row = articleToRow(fullArticle);

    try {
      db.query(`
        INSERT INTO news_articles (
          id, slug, source, source_url, source_feed,
          headline, subheadline, summary, content,
          category, author, published_at, updated_at,
          image_url, image_caption, image_emoji,
          tags, entities, sentiment,
          npc_mentions, last_mentioned_at, generated_from
        ) VALUES (
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?,
          ?, ?, ?, ?,
          ?, ?, ?,
          ?, ?, ?,
          ?, ?, ?
        )
      `).run(
        row.id, row.slug, row.source, row.source_url, row.source_feed,
        row.headline, row.subheadline, row.summary, row.content,
        row.category, row.author, row.published_at, row.updated_at,
        row.image_url, row.image_caption, row.image_emoji,
        row.tags, row.entities, row.sentiment,
        row.npc_mentions, row.last_mentioned_at, row.generated_from
      );

      // Emit event
      eventBus.fire(EventTypes.NEWS_ARTICLE_INGESTED, {
        article_id: id,
        source: article.source,
        headline: article.headline,
        category: article.category,
      }, {
        source: 'news-feed',
        importance: article.source === 'ai' ? 0.7 : 0.5,
      });

      return fullArticle;
    } catch (error: any) {
      // Handle duplicate (for RSS)
      if (error.message?.includes('UNIQUE constraint failed')) {
        const existing = await this.getArticleBySourceUrl(article.sourceUrl!);
        if (existing) return existing;
      }
      throw error;
    }
  }

  /**
   * Get article by source URL (for deduplication)
   */
  private async getArticleBySourceUrl(url: string): Promise<NewsArticle | null> {
    const db = getDB('game');
    const row = db.query(`
      SELECT * FROM news_articles
      WHERE source_url = ?
      LIMIT 1
    `).get(url) as NewsArticleRow | null;

    return row ? rowToArticle(row) : null;
  }

  /**
   * Update an existing article
   */
  async updateArticle(id: string, updates: Partial<NewsArticle>): Promise<NewsArticle | null> {
    const existing = await this.getArticle(id);
    if (!existing) return null;

    const db = getDB('game');
    const updatedArticle = { ...existing, ...updates, updatedAt: now() };
    const row = articleToRow(updatedArticle);

    db.query(`
      UPDATE news_articles SET
        headline = ?, subheadline = ?, summary = ?, content = ?,
        category = ?, author = ?, updated_at = ?,
        image_url = ?, image_caption = ?, image_emoji = ?,
        tags = ?, entities = ?, sentiment = ?
      WHERE id = ?
    `).run(
      row.headline, row.subheadline, row.summary, row.content,
      row.category, row.author, row.updated_at,
      row.image_url, row.image_caption, row.image_emoji,
      row.tags, row.entities, row.sentiment,
      id
    );

    return updatedArticle;
  }

  /**
   * Delete an article
   */
  async deleteArticle(id: string): Promise<boolean> {
    const db = getDB('game');
    const result = db.query('DELETE FROM news_articles WHERE id = ?').run(id);
    return result.changes > 0;
  }

  // ==========================================================================
  // Engagement Tracking
  // ==========================================================================

  /**
   * Record that an NPC mentioned an article
   * Used for trending detection and the feedback loop
   */
  async recordMention(articleId: string, npcId: string): Promise<void> {
    const db = getDB('game');
    const timestamp = now();

    // Update article mention count
    db.query(`
      UPDATE news_articles
      SET npc_mentions = npc_mentions + 1, last_mentioned_at = ?
      WHERE id = ?
    `).run(timestamp, articleId);

    // Record exposure if not already tracked
    const exposureId = generateId();
    db.query(`
      INSERT OR IGNORE INTO npc_news_exposure (id, npc_id, article_id, exposed_at, mentioned)
      VALUES (?, ?, ?, ?, 1)
    `).run(exposureId, npcId, articleId, timestamp);

    // Update if already exposed
    db.query(`
      UPDATE npc_news_exposure
      SET mentioned = 1
      WHERE npc_id = ? AND article_id = ?
    `).run(npcId, articleId);

    // Emit event
    eventBus.fire(EventTypes.NEWS_ARTICLE_MENTIONED, {
      article_id: articleId,
      npc_id: npcId,
    }, {
      source: 'news-feed',
      npc_id: npcId,
      importance: 0.4,
    });
  }

  /**
   * Track that an NPC was exposed to an article (shown in context)
   */
  async trackExposure(articleId: string, npcId: string): Promise<void> {
    const db = getDB('game');
    const exposureId = generateId();

    db.query(`
      INSERT OR IGNORE INTO npc_news_exposure (id, npc_id, article_id, exposed_at, mentioned)
      VALUES (?, ?, ?, ?, 0)
    `).run(exposureId, npcId, articleId, now());
  }

  /**
   * Get articles an NPC has been exposed to
   */
  async getNPCExposedArticles(npcId: string, limit = 20): Promise<NewsArticle[]> {
    const db = getDB('game');
    const rows = db.query(`
      SELECT na.* FROM news_articles na
      INNER JOIN npc_news_exposure nne ON na.id = nne.article_id
      WHERE nne.npc_id = ?
      ORDER BY nne.exposed_at DESC
      LIMIT ?
    `).all(npcId, limit) as NewsArticleRow[];

    return rows.map(rowToArticle);
  }

  // ==========================================================================
  // Lore Article Management
  // ==========================================================================

  /**
   * Load all lore articles from disk
   * Called on service initialization
   */
  async loadLoreArticles(): Promise<void> {
    if (!existsSync(LORE_DIRECTORY)) {
      console.log('[NewsFeed] Lore directory does not exist, skipping lore load');
      return;
    }

    try {
      const files = await readdir(LORE_DIRECTORY);
      const jsonFiles = files.filter(f => f.endsWith('.json'));

      console.log(`[NewsFeed] Loading ${jsonFiles.length} lore articles...`);

      for (const file of jsonFiles) {
        try {
          const content = await readFile(join(LORE_DIRECTORY, file), 'utf-8');
          const article = JSON.parse(content) as Partial<NewsArticle>;

          // Validate required fields
          if (!article.headline || !article.summary || !article.content) {
            console.warn(`[NewsFeed] Skipping invalid lore file: ${file}`);
            continue;
          }

          // Set defaults for lore
          const loreArticle: Omit<NewsArticle, 'id' | 'npcMentions' | 'createdAt'> = {
            slug: article.slug || file.replace('.json', ''),
            source: 'user',
            headline: article.headline,
            subheadline: article.subheadline,
            summary: article.summary,
            content: article.content,
            category: (article.category as NewsCategory) || 'local',
            author: article.author || 'DailyBuzz Staff',
            publishedAt: article.publishedAt || now(),
            tags: article.tags || [],
            entities: article.entities || [],
            sentiment: article.sentiment,
            imageUrl: article.imageUrl,
            imageCaption: article.imageCaption,
            imageEmoji: article.imageEmoji,
          };

          // Check if already exists
          const existing = await this.getArticle(loreArticle.slug);
          if (!existing) {
            await this.ingestArticle(loreArticle);
            console.log(`[NewsFeed] Loaded lore: ${loreArticle.headline}`);
          }
        } catch (error) {
          console.error(`[NewsFeed] Error loading lore file ${file}:`, error);
        }
      }
    } catch (error) {
      errorLogger.log(error, {
        source: 'news-feed',
        operation: 'loadLoreArticles',
      });
    }
  }

  /**
   * Reload lore articles (for hot reloading)
   */
  async reloadLoreArticles(): Promise<void> {
    console.log('[NewsFeed] Reloading lore articles...');
    await this.loadLoreArticles();
  }

  // ==========================================================================
  // Statistics
  // ==========================================================================

  /**
   * Get article count by source
   */
  async getArticleCounts(): Promise<Record<NewsSource, number>> {
    const db = getDB('game');
    const rows = db.query(`
      SELECT source, COUNT(*) as count
      FROM news_articles
      GROUP BY source
    `).all() as Array<{ source: string; count: number }>;

    const counts: Record<NewsSource, number> = { rss: 0, user: 0, ai: 0 };
    for (const row of rows) {
      counts[row.source as NewsSource] = row.count;
    }
    return counts;
  }

  /**
   * Get total article count
   */
  async getTotalArticleCount(): Promise<number> {
    const db = getDB('game');
    const result = db.query('SELECT COUNT(*) as count FROM news_articles').get() as { count: number };
    return result.count;
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

export const newsFeedService = new NewsFeedService();
export default newsFeedService;
