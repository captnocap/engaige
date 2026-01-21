/**
 * Context Builder Service
 *
 * Builds enriched context for NPC prompts by combining:
 * - NPC memories (past interactions)
 * - Recent news headlines (the recursion loop!)
 * - Current relationship status
 * - Time-based context
 */

import { getDB, now } from '../db/index.js';
import { newsFeedService } from './news-feed.js';
import type { NewsArticle, NewsCategory } from '../types/news.js';

// ============================================================================
// Types
// ============================================================================

export interface NPCContext {
  memories: Array<{
    content: string;
    importance: number;
  }>;
  newsHeadlines: Array<{
    headline: string;
    summary: string;
    category: NewsCategory;
  }>;
  recentExposedArticles: string[]; // Article IDs this NPC has "seen"
  relationshipContext?: {
    stage: string;
    trust: number;
    affinity: number;
    familiarity: number;
  };
  timeContext: {
    timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
    dayOfWeek: string;
  };
}

export interface BuildContextOptions {
  npcId: string;
  conversationContext?: string;  // Current message/topic for relevance
  playerId?: string;
  includeNews?: boolean;
  includeMemories?: boolean;
  newsLimit?: number;
  memoryLimit?: number;
  newsCategories?: NewsCategory[];
}

// ============================================================================
// Context Building
// ============================================================================

/**
 * Build full context for an NPC prompt
 */
export async function buildNPCContext(options: BuildContextOptions): Promise<NPCContext> {
  const {
    npcId,
    conversationContext = '',
    playerId,
    includeNews = true,
    includeMemories = true,
    newsLimit = 5,
    memoryLimit = 5,
    newsCategories,
  } = options;

  const context: NPCContext = {
    memories: [],
    newsHeadlines: [],
    recentExposedArticles: [],
    timeContext: getTimeContext(),
  };

  // Get memories
  if (includeMemories) {
    context.memories = getNPCMemoriesForContext(npcId, conversationContext, memoryLimit);
  }

  // Get news headlines
  if (includeNews) {
    const newsResult = await getNewsForNPC(npcId, {
      limit: newsLimit,
      categories: newsCategories,
    });
    context.newsHeadlines = newsResult.headlines;
    context.recentExposedArticles = newsResult.exposedArticleIds;
  }

  // Get relationship context if player specified
  if (playerId) {
    context.relationshipContext = getRelationshipContext(npcId, playerId);
  }

  return context;
}

/**
 * Format context into prompt sections
 */
export function formatContextForPrompt(context: NPCContext): string {
  const sections: string[] = [];

  // News section - THE RECURSION LOOP
  if (context.newsHeadlines.length > 0) {
    const newsSection = context.newsHeadlines.map(n =>
      `- [${n.category.toUpperCase()}] ${n.headline}`
    ).join('\n');

    sections.push(`## Recent News You've Seen
You've been reading the news lately. These are recent headlines you're aware of:
${newsSection}

Feel free to reference or discuss these if relevant to the conversation. You consider these to be real news.`);
  }

  // Memories section
  if (context.memories.length > 0) {
    const memorySection = context.memories.map(m => `- ${m.content}`).join('\n');
    sections.push(`## Your Relevant Memories
${memorySection}`);
  }

  // Relationship section
  if (context.relationshipContext) {
    const rc = context.relationshipContext;
    sections.push(`## Your Relationship with This Person
Relationship stage: ${rc.stage}
Trust level: ${rc.trust}/100
How much you like them: ${rc.affinity}/100
How well you know them: ${rc.familiarity}/100`);
  }

  // Time context
  sections.push(`## Current Time
It's ${context.timeContext.timeOfDay} on ${context.timeContext.dayOfWeek}.`);

  return sections.join('\n\n');
}

// ============================================================================
// Memory Retrieval
// ============================================================================

function getNPCMemoriesForContext(
  npcId: string,
  conversationContext: string,
  limit: number
): Array<{ content: string; importance: number }> {
  const db = getDB('game');
  const keywords = conversationContext.toLowerCase().split(' ').filter(w => w.length > 3);

  if (keywords.length === 0) {
    // No keywords - get most important recent memories
    const memories = db.query(`
      SELECT content, importance
      FROM memories
      WHERE npc_id = ? AND (expires_at IS NULL OR expires_at > ?)
      ORDER BY importance DESC, created_at DESC
      LIMIT ?
    `).all(npcId, now(), limit) as Array<{ content: string; importance: number }>;

    return memories;
  }

  // Keyword-based retrieval
  const placeholders = keywords.map(() => 'content LIKE ?').join(' OR ');
  const searchTerms = keywords.map(k => `%${k}%`);

  const memories = db.query(`
    SELECT content, importance
    FROM memories
    WHERE npc_id = ? AND (${placeholders}) AND (expires_at IS NULL OR expires_at > ?)
    ORDER BY importance DESC, created_at DESC
    LIMIT ?
  `).all(npcId, ...searchTerms, now(), limit) as Array<{ content: string; importance: number }>;

  return memories;
}

// ============================================================================
// News Retrieval for NPCs
// ============================================================================

interface NewsForNPCResult {
  headlines: Array<{
    headline: string;
    summary: string;
    category: NewsCategory;
  }>;
  exposedArticleIds: string[];
}

async function getNewsForNPC(
  npcId: string,
  options: { limit?: number; categories?: NewsCategory[] }
): Promise<NewsForNPCResult> {
  const { limit = 5, categories } = options;

  // Get NPC's interests to filter news
  const npcDb = getDB('npc');
  const npc = npcDb.query('SELECT interests FROM npcs WHERE id = ?').get(npcId) as { interests: string } | null;

  let npcInterests: string[] = [];
  if (npc?.interests) {
    try {
      npcInterests = JSON.parse(npc.interests);
    } catch {
      npcInterests = [];
    }
  }

  // Get recent articles the NPC was exposed to (to avoid repetition)
  const exposedArticles = await newsFeedService.getNPCExposedArticles(npcId, 20);
  const exposedIds = exposedArticles.map(a => a.id);

  // Get fresh headlines
  const headlines = await newsFeedService.getHeadlinesForContext({
    limit,
    categories,
    hoursBack: 72, // 3 days of news
    excludeArticleIds: exposedIds.slice(0, 10), // Exclude most recent exposures
  });

  // Track exposure for these new articles
  for (const article of headlines) {
    await newsFeedService.trackExposure(article.id, npcId);
  }

  return {
    headlines: headlines.map(a => ({
      headline: a.headline,
      summary: a.summary,
      category: a.category,
    })),
    exposedArticleIds: [...exposedIds, ...headlines.map(a => a.id)],
  };
}

// ============================================================================
// Relationship Context
// ============================================================================

function getRelationshipContext(npcId: string, playerId: string): {
  stage: string;
  trust: number;
  affinity: number;
  familiarity: number;
} | undefined {
  const db = getDB('game');

  const relationship = db.query(`
    SELECT stage, trust, affinity, familiarity
    FROM relationships
    WHERE npc_id = ? AND player_id = ?
  `).get(npcId, playerId) as {
    stage: string;
    trust: number;
    affinity: number;
    familiarity: number;
  } | null;

  if (!relationship) {
    return {
      stage: 'stranger',
      trust: 0,
      affinity: 0,
      familiarity: 0,
    };
  }

  return relationship;
}

// ============================================================================
// Time Context
// ============================================================================

function getTimeContext(): { timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night'; dayOfWeek: string } {
  const now = new Date();
  const hour = now.getHours();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  let timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  if (hour >= 5 && hour < 12) {
    timeOfDay = 'morning';
  } else if (hour >= 12 && hour < 17) {
    timeOfDay = 'afternoon';
  } else if (hour >= 17 && hour < 21) {
    timeOfDay = 'evening';
  } else {
    timeOfDay = 'night';
  }

  return {
    timeOfDay,
    dayOfWeek: days[now.getDay()],
  };
}

// ============================================================================
// Article Mention Tracking
// ============================================================================

/**
 * Called when an NPC references a news article in their response
 * Used to track the recursion loop
 */
export async function recordArticleMention(
  npcId: string,
  responseText: string
): Promise<void> {
  // Get articles this NPC has been exposed to
  const exposedArticles = await newsFeedService.getNPCExposedArticles(npcId, 50);

  // Check if any article headlines appear in the response
  for (const article of exposedArticles) {
    // Check if headline keywords appear in response
    const headlineWords = article.headline.toLowerCase().split(' ')
      .filter(w => w.length > 4)
      .slice(0, 3); // First 3 significant words

    const responseLower = responseText.toLowerCase();
    const matchCount = headlineWords.filter(w => responseLower.includes(w)).length;

    // If 2+ headline words appear, count as a mention
    if (matchCount >= 2) {
      await newsFeedService.recordMention(article.id, npcId);
      console.log(`[ContextBuilder] NPC ${npcId} mentioned article: ${article.headline}`);
    }
  }
}

// ============================================================================
// Exports
// ============================================================================

export const contextBuilder = {
  buildNPCContext,
  formatContextForPrompt,
  recordArticleMention,
};

export default contextBuilder;
