/**
 * Story Generator Service
 *
 * The "recursion loop" engine for AI-generated news.
 * Detects trending topics from NPC posts, generates satirical news articles,
 * which then get consumed by NPCs as truth, influencing their behavior.
 *
 * Flow: NPC Posts → Trend Detection → AI Article → News Feed → NPC Context → More Posts
 */

import { getDB, generateId, now } from '../db/index.js';
import { eventBus, EventTypes } from '../events/index.js';
import { errorLogger } from './error-logger.js';
import { newsFeedService } from './news-feed.js';
import { getAIConfig, getNPCConfig } from './ai.js';
import { checkBudgetAllows, logApiCost } from './budget.js';
import { doorFetch } from '../network/door.js';
import {
  parseOpenAIUsage,
  parseAnthropicUsage,
  calculateCost,
  estimateCost,
} from '../utils/cost-calculator.js';
import {
  type NewsArticle,
  type NewsCategory,
  type NewsSentiment,
  type AIGenerationMetadata,
  type TrendingTopic,
} from '../types/news.js';

// ============================================================================
// Configuration
// ============================================================================

const STORY_GENERATOR_CONFIG = {
  // Trend detection settings
  minMentionsForTrend: 3,      // Min posts mentioning topic to consider trending
  trendLookbackHours: 24,      // How far back to look for trends
  maxTopicsPerRun: 3,          // Max articles to generate per run

  // Story generation settings
  featureCategory: 'story_generation',
  maxOutputTokens: 1500,

  // Cooldown: Don't generate about same topic twice within this window
  topicCooldownHours: 48,
};

// Topics we've recently generated stories about (in-memory cache)
const recentlyGeneratedTopics: Map<string, number> = new Map();

// ============================================================================
// Trend Detection
// ============================================================================

/**
 * Detect trending topics from recent NPC posts
 * Uses simple keyword extraction and frequency counting
 */
export async function detectTrendingTopics(options: {
  hoursBack?: number;
  minMentions?: number;
  excludeTopics?: string[];
} = {}): Promise<TrendingTopic[]> {
  const {
    hoursBack = STORY_GENERATOR_CONFIG.trendLookbackHours,
    minMentions = STORY_GENERATOR_CONFIG.minMentionsForTrend,
    excludeTopics = [],
  } = options;

  const db = getDB('game');
  const npcDb = getDB('npc');
  const cutoffTime = now() - (hoursBack * 60 * 60);

  // Get recent posts
  const posts = db.query(`
    SELECT p.id, p.npc_id, p.content, p.created_at
    FROM posts p
    WHERE p.created_at >= ?
    ORDER BY p.created_at DESC
    LIMIT 500
  `).all(cutoffTime) as Array<{
    id: string;
    npc_id: string;
    content: string;
    created_at: number;
  }>;

  if (posts.length < minMentions) {
    return [];
  }

  // Extract keywords from posts (simple approach)
  const keywordCounts: Map<string, {
    count: number;
    posts: Array<{ id: string; npcId: string; content: string; timestamp: number }>;
    sentiments: NewsSentiment[];
  }> = new Map();

  // Common words to ignore
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
    'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do',
    'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must',
    'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
    'my', 'your', 'his', 'its', 'our', 'their', 'this', 'that', 'these', 'those',
    'what', 'which', 'who', 'whom', 'when', 'where', 'why', 'how', 'all', 'each',
    'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'not',
    'only', 'same', 'so', 'than', 'too', 'very', 'just', 'can', 'now', 'im', 'ive',
    'dont', 'cant', 'wont', 'like', 'really', 'think', 'know', 'get', 'got', 'going',
    'about', 'out', 'up', 'into', 'over', 'after', 'before', 'between', 'under',
  ]);

  for (const post of posts) {
    // Extract words (3+ chars, alphanumeric)
    const words = post.content.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length >= 3 && !stopWords.has(w));

    // Also extract 2-word phrases
    const phrases: string[] = [];
    for (let i = 0; i < words.length - 1; i++) {
      phrases.push(`${words[i]} ${words[i + 1]}`);
    }

    // Get NPC name for the post
    const npc = npcDb.query('SELECT display_name FROM npcs WHERE id = ?').get(post.npc_id) as { display_name: string } | null;
    const npcName = npc?.display_name || 'Unknown';

    // Simple sentiment detection
    const sentiment = detectSentiment(post.content);

    // Count unique words per post (don't count same word multiple times from same post)
    const uniqueWords = new Set([...words, ...phrases]);

    for (const keyword of uniqueWords) {
      if (excludeTopics.includes(keyword)) continue;

      const existing = keywordCounts.get(keyword) || {
        count: 0,
        posts: [],
        sentiments: [],
      };

      existing.count++;
      existing.posts.push({
        id: post.id,
        npcId: post.npc_id,
        content: post.content,
        timestamp: post.created_at,
      });
      existing.sentiments.push(sentiment);

      keywordCounts.set(keyword, existing);
    }
  }

  // Filter to topics meeting threshold and not recently generated
  const trends: TrendingTopic[] = [];

  for (const [topic, data] of keywordCounts) {
    if (data.count < minMentions) continue;

    // Check cooldown
    const lastGenerated = recentlyGeneratedTopics.get(topic);
    if (lastGenerated) {
      const cooldownEnd = lastGenerated + (STORY_GENERATOR_CONFIG.topicCooldownHours * 60 * 60);
      if (now() < cooldownEnd) continue;
    }

    // Determine overall sentiment
    const sentimentCounts = { positive: 0, negative: 0, neutral: 0 };
    for (const s of data.sentiments) {
      sentimentCounts[s]++;
    }

    let sentiment: NewsSentiment | 'mixed';
    const maxCount = Math.max(sentimentCounts.positive, sentimentCounts.negative, sentimentCounts.neutral);
    if (maxCount === sentimentCounts.positive && sentimentCounts.positive > sentimentCounts.negative) {
      sentiment = 'positive';
    } else if (maxCount === sentimentCounts.negative && sentimentCounts.negative > sentimentCounts.positive) {
      sentiment = 'negative';
    } else if (sentimentCounts.positive > 0 && sentimentCounts.negative > 0) {
      sentiment = 'mixed';
    } else {
      sentiment = 'neutral';
    }

    // Get NPC names for posts
    const postsWithNames = data.posts.map(p => {
      const npc = npcDb.query('SELECT display_name FROM npcs WHERE id = ?').get(p.npcId) as { display_name: string } | null;
      return {
        ...p,
        npcName: npc?.display_name || 'Unknown',
      };
    });

    trends.push({
      topic,
      mentions: data.count,
      posts: postsWithNames,
      sentiment,
      firstMentionedAt: Math.min(...data.posts.map(p => p.timestamp)),
      lastMentionedAt: Math.max(...data.posts.map(p => p.timestamp)),
    });
  }

  // Sort by mentions descending
  trends.sort((a, b) => b.mentions - a.mentions);

  return trends.slice(0, 20); // Return top 20 trends
}

/**
 * Simple sentiment detection
 */
function detectSentiment(text: string): NewsSentiment {
  const lower = text.toLowerCase();

  const positiveWords = ['love', 'great', 'amazing', 'awesome', 'fantastic', 'happy', 'excited', 'beautiful', 'wonderful', 'best'];
  const negativeWords = ['hate', 'terrible', 'awful', 'horrible', 'sad', 'angry', 'frustrated', 'worst', 'bad', 'annoying'];

  let positiveCount = 0;
  let negativeCount = 0;

  for (const word of positiveWords) {
    if (lower.includes(word)) positiveCount++;
  }
  for (const word of negativeWords) {
    if (lower.includes(word)) negativeCount++;
  }

  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
}

// ============================================================================
// Story Generation
// ============================================================================

/**
 * Generate a news article about a trending topic
 */
export async function generateStoryFromTrend(trend: TrendingTopic): Promise<NewsArticle | null> {
  const config = getAIConfig();

  // Estimate cost
  const estimatedCost = estimateCost(2000, STORY_GENERATOR_CONFIG.maxOutputTokens, config.model);

  // Check budget
  const budgetCheck = checkBudgetAllows(STORY_GENERATOR_CONFIG.featureCategory, estimatedCost);
  if (!budgetCheck.allowed) {
    console.log(`[StoryGenerator] Skipping story generation: ${budgetCheck.reason}`);
    return null;
  }

  // Build the prompt
  const systemPrompt = buildStoryGeneratorPrompt();
  const userPrompt = buildTrendPrompt(trend);

  const requestId = generateId();
  const requestStartTime = Date.now();

  // Emit event
  eventBus.fire(EventTypes.AI_REQUEST_SENT, {
    request_id: requestId,
    provider: config.provider,
    model: config.model,
    prompt_tokens: systemPrompt.length + userPrompt.length,
    purpose: STORY_GENERATOR_CONFIG.featureCategory,
  }, {
    source: 'story-generator',
  });

  try {
    let articleData: GeneratedArticle;

    if (config.provider === 'anthropic') {
      articleData = await callAnthropicForStory(systemPrompt, userPrompt, config, requestId);
    } else {
      articleData = await callOpenAIForStory(systemPrompt, userPrompt, config, requestId);
    }

    // Record that we generated about this topic
    recentlyGeneratedTopics.set(trend.topic, now());

    // Build the full article
    const generationMetadata: AIGenerationMetadata = {
      triggerType: 'trending_topic',
      triggerData: {
        topic: trend.topic,
        mentions: trend.mentions,
        posts: trend.posts.slice(0, 5).map(p => p.id),
      },
      generatedAt: now(),
      model: config.model,
    };

    const article = await newsFeedService.ingestArticle({
      slug: generateSlug(articleData.headline),
      source: 'ai',
      headline: articleData.headline,
      subheadline: articleData.subheadline,
      summary: articleData.summary,
      content: articleData.content,
      category: articleData.category,
      author: articleData.author,
      publishedAt: now(),
      tags: articleData.tags,
      entities: articleData.entities,
      sentiment: articleData.sentiment,
      imageEmoji: articleData.imageEmoji,
      generatedFrom: generationMetadata,
    });

    // Emit success event
    eventBus.fire(EventTypes.AI_RESPONSE_RECEIVED, {
      request_id: requestId,
      provider: config.provider,
      model: config.model,
      latency_ms: Date.now() - requestStartTime,
    }, {
      source: 'story-generator',
    });

    console.log(`[StoryGenerator] Generated article: ${article.headline}`);

    return article;
  } catch (error: any) {
    errorLogger.log(error, {
      source: 'story-generator',
      operation: 'generateStoryFromTrend',
      metadata: { topic: trend.topic },
    });

    eventBus.fire(EventTypes.AI_ERROR, {
      request_id: requestId,
      provider: config.provider,
      model: config.model,
      error_type: 'generation_error',
      message: error.message,
    }, {
      source: 'story-generator',
      importance: 0.7,
    });

    return null;
  }
}

interface GeneratedArticle {
  headline: string;
  subheadline?: string;
  summary: string;
  content: string;
  category: NewsCategory;
  author: string;
  tags: string[];
  entities: string[];
  sentiment: NewsSentiment;
  imageEmoji?: string;
}

function buildStoryGeneratorPrompt(): string {
  return `You are a satirical news writer for "DailyBuzz", a news site in a simulated world.
Your job is to write news articles that are:
1. Written in a completely straight-faced, professional journalistic style
2. Based on real social media activity from the community
3. Slightly absurd or satirical when examined closely
4. Presented as 100% factual news

The community you're covering includes regular people posting on social media. Their posts are REAL and should be treated as legitimate sources. Quote them when appropriate.

Your articles should feel like:
- Local news covering mundane community events
- Tech news with a hint of absurdity
- Human interest stories that seem normal at first
- Opinion pieces that take themselves very seriously

IMPORTANT:
- Never break character or indicate this is fake
- NPCs in this world will read your articles and believe them completely
- Mix mundane facts with slightly absurd conclusions
- Use quotes from the social media posts provided
- Create memorable, shareable headlines

Output your article as JSON with this structure:
{
  "headline": "Catchy headline (max 80 chars)",
  "subheadline": "Optional secondary headline",
  "summary": "1-2 sentence summary for feed display",
  "content": "Full article body in markdown (3-5 paragraphs)",
  "category": "local|tech|entertainment|politics|business|opinion|sports|science|lifestyle",
  "author": "Fake but realistic byline",
  "tags": ["array", "of", "topic", "tags"],
  "entities": ["Named", "Entities", "From", "Article"],
  "sentiment": "positive|negative|neutral",
  "imageEmoji": "📰 single emoji representing the story"
}`;
}

function buildTrendPrompt(trend: TrendingTopic): string {
  const postExamples = trend.posts.slice(0, 5).map(p =>
    `- ${p.npcName}: "${p.content.slice(0, 200)}${p.content.length > 200 ? '...' : ''}"`
  ).join('\n');

  return `Write a news article about the trending topic "${trend.topic}".

This topic has been mentioned ${trend.mentions} times in recent social media posts.
Overall sentiment: ${trend.sentiment}

Recent posts about this topic:
${postExamples}

First mentioned: ${new Date(trend.firstMentionedAt * 1000).toLocaleDateString()}
Most recent mention: ${new Date(trend.lastMentionedAt * 1000).toLocaleDateString()}

Write an article that:
1. Treats this topic as newsworthy
2. Quotes or references the social media posts
3. Adds journalistic context and "expert" opinions
4. Has a slightly absurd angle while maintaining straight-faced tone

Return ONLY the JSON object, no additional text.`;
}

async function callOpenAIForStory(
  systemPrompt: string,
  userPrompt: string,
  config: { provider: string; model: string; apiKey?: string; baseUrl?: string },
  requestId: string
): Promise<GeneratedArticle> {
  const baseUrl = config.baseUrl || 'https://api.openai.com/v1';
  const endpoint = `${baseUrl}/chat/completions`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (config.apiKey) {
    headers['Authorization'] = `Bearer ${config.apiKey}`;
  }

  const response = await doorFetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.9,
      max_tokens: STORY_GENERATOR_CONFIG.maxOutputTokens,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error: ${errorText}`);
  }

  const data = await response.json();

  // Log cost
  const usage = parseOpenAIUsage(data);
  const cost = calculateCost(usage, config.model);
  logApiCost({
    provider: config.provider,
    model: config.model,
    feature_category: STORY_GENERATOR_CONFIG.featureCategory,
    input_tokens: usage.input_tokens,
    output_tokens: usage.output_tokens,
    total_tokens: usage.total_tokens,
    cost_cents: cost,
  });

  const content = data.choices[0].message.content;
  return JSON.parse(content);
}

async function callAnthropicForStory(
  systemPrompt: string,
  userPrompt: string,
  config: { provider: string; model: string; apiKey?: string },
  requestId: string
): Promise<GeneratedArticle> {
  if (!config.apiKey) throw new Error('Anthropic API key required');

  const response = await doorFetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': config.apiKey,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: STORY_GENERATOR_CONFIG.maxOutputTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Anthropic API error: ${errorText}`);
  }

  const data = await response.json();

  // Log cost
  const usage = parseAnthropicUsage(data);
  const cost = calculateCost(usage, config.model);
  logApiCost({
    provider: config.provider,
    model: config.model,
    feature_category: STORY_GENERATOR_CONFIG.featureCategory,
    input_tokens: usage.input_tokens,
    output_tokens: usage.output_tokens,
    total_tokens: usage.total_tokens,
    cost_cents: cost,
  });

  const textBlock = data.content.find((block: any) => block.type === 'text');
  if (!textBlock) throw new Error('No text in Anthropic response');

  // Parse JSON from the response
  const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No JSON found in response');

  return JSON.parse(jsonMatch[0]);
}

// ============================================================================
// Batch Processing
// ============================================================================

/**
 * Run a full story generation cycle
 * Called by background scheduler
 */
export async function runStoryGenerationCycle(): Promise<{
  trendsFound: number;
  articlesGenerated: number;
  errors: number;
}> {
  console.log('[StoryGenerator] Starting generation cycle...');

  const result = {
    trendsFound: 0,
    articlesGenerated: 0,
    errors: 0,
  };

  try {
    // Detect trending topics
    const trends = await detectTrendingTopics();
    result.trendsFound = trends.length;

    if (trends.length === 0) {
      console.log('[StoryGenerator] No trending topics found');
      return result;
    }

    console.log(`[StoryGenerator] Found ${trends.length} trending topics`);

    // Generate articles for top trends
    const topicsToProcess = trends.slice(0, STORY_GENERATOR_CONFIG.maxTopicsPerRun);

    for (const trend of topicsToProcess) {
      console.log(`[StoryGenerator] Processing trend: "${trend.topic}" (${trend.mentions} mentions)`);

      const article = await generateStoryFromTrend(trend);

      if (article) {
        result.articlesGenerated++;
      } else {
        result.errors++;
      }

      // Small delay between generations to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

  } catch (error: any) {
    errorLogger.log(error, {
      source: 'story-generator',
      operation: 'runStoryGenerationCycle',
    });
    result.errors++;
  }

  console.log(`[StoryGenerator] Cycle complete: ${result.articlesGenerated} articles generated`);

  return result;
}

/**
 * Generate a story based on a specific NPC's activity
 * For targeted story generation (e.g., when an NPC does something noteworthy)
 */
export async function generateStoryAboutNPC(
  npcId: string,
  activityType: string,
  context: string
): Promise<NewsArticle | null> {
  const npcDb = getDB('npc');
  const npc = npcDb.query('SELECT * FROM npcs WHERE id = ?').get(npcId) as any;

  if (!npc) {
    console.error(`[StoryGenerator] NPC not found: ${npcId}`);
    return null;
  }

  // Build a synthetic trend for this NPC
  const trend: TrendingTopic = {
    topic: npc.display_name,
    mentions: 1,
    posts: [{
      id: generateId(),
      npcId: npcId,
      npcName: npc.display_name,
      content: context,
      timestamp: now(),
    }],
    sentiment: 'neutral',
    firstMentionedAt: now(),
    lastMentionedAt: now(),
  };

  const config = getAIConfig();

  // Custom prompt for NPC-focused story
  const systemPrompt = buildStoryGeneratorPrompt();
  const userPrompt = `Write a human interest news article about a local resident named ${npc.display_name}.

Activity type: ${activityType}
Context: ${context}

${npc.display_name}'s background:
- Occupation: ${npc.occupation}
- Bio: ${npc.bio}

Write an article that:
1. Features this person as a local community member
2. Treats their activity as newsworthy
3. Has a warm, human-interest angle
4. Could inspire other community members

Return ONLY the JSON object, no additional text.`;

  try {
    const requestId = generateId();
    let articleData: GeneratedArticle;

    if (config.provider === 'anthropic') {
      articleData = await callAnthropicForStory(systemPrompt, userPrompt, config, requestId);
    } else {
      articleData = await callOpenAIForStory(systemPrompt, userPrompt, config, requestId);
    }

    const generationMetadata: AIGenerationMetadata = {
      triggerType: 'npc_activity',
      triggerData: {
        npcId,
        activityType,
      },
      generatedAt: now(),
      model: config.model,
    };

    const article = await newsFeedService.ingestArticle({
      slug: generateSlug(articleData.headline),
      source: 'ai',
      headline: articleData.headline,
      subheadline: articleData.subheadline,
      summary: articleData.summary,
      content: articleData.content,
      category: articleData.category,
      author: articleData.author,
      publishedAt: now(),
      tags: [...articleData.tags, npc.display_name],
      entities: [...articleData.entities, npc.display_name],
      sentiment: articleData.sentiment,
      imageEmoji: articleData.imageEmoji,
      generatedFrom: generationMetadata,
    });

    console.log(`[StoryGenerator] Generated NPC feature: ${article.headline}`);
    return article;

  } catch (error: any) {
    errorLogger.log(error, {
      source: 'story-generator',
      operation: 'generateStoryAboutNPC',
      npc_id: npcId,
    });
    return null;
  }
}

// ============================================================================
// Helpers
// ============================================================================

function generateSlug(headline: string): string {
  return headline
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60);
}

// Clean up old topic cooldowns periodically
export function cleanupCooldowns(): void {
  const cutoff = now() - (STORY_GENERATOR_CONFIG.topicCooldownHours * 60 * 60);

  for (const [topic, timestamp] of recentlyGeneratedTopics) {
    if (timestamp < cutoff) {
      recentlyGeneratedTopics.delete(topic);
    }
  }
}

// ============================================================================
// Exports
// ============================================================================

export const storyGeneratorService = {
  detectTrendingTopics,
  generateStoryFromTrend,
  generateStoryAboutNPC,
  runStoryGenerationCycle,
  cleanupCooldowns,
};

export default storyGeneratorService;
