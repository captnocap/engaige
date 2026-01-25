# News Feed System

## Overview

A unified news feed that aggregates content from three sources:
1. **Real RSS Feeds** - Actual news from external sources
2. **User-Written Lore** - Hand-crafted fake articles
3. **AI-Generated Stories** - Articles written by the system about in-game events

All three sources use identical schemas. NPCs consume this feed as "world news" with no distinction between real and fake content, enabling organic world-building and the glorious feedback loop of AI believing its own propaganda.

---

## The Recursion Loop

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Real RSS      │     │  User-Written   │     │  AI-Generated   │
│   (Reuters,     │     │  (Quantum       │     │  (Trending      │
│    AP News)     │     │   Coffee lore)  │     │   topics →      │
│                 │     │                 │     │   articles)     │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         └───────────────────────┴───────────────────────┘
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │   UNIFIED NEWS FEED    │
                    │   (All same schema)    │
                    └───────────┬────────────┘
                                │
                                ▼
                    ┌────────────────────────┐
                    │   CONTEXT BUILDER      │
                    │   Injects "Recent      │
                    │   Headlines" into      │
                    │   NPC prompts          │
                    └───────────┬────────────┘
                                │
                                ▼
                    ┌────────────────────────┐
                    │   NPC GENERATES        │
                    │   Posts, comments,     │
                    │   references news      │
                    └───────────┬────────────┘
                                │
                                ▼
                    ┌────────────────────────┐
                    │   TREND DETECTOR       │
                    │   Watches for hot      │
                    │   topics in NPC posts  │
                    └───────────┬────────────┘
                                │
                                ▼
                    ┌────────────────────────┐
                    │   STORY GENERATOR      │◄────┐
                    │   Writes articles      │     │
                    │   about trending       │     │
                    │   topics               │     │
                    └───────────┬────────────┘     │
                                │                  │
                                └──────────────────┘
                                (Articles re-enter feed)
```

---

## Article Schema

All news articles use a single unified schema regardless of source:

```typescript
// server/src/types/news.ts

export type NewsSource = 'rss' | 'user' | 'ai';

export type NewsCategory =
  | 'local'
  | 'tech'
  | 'entertainment'
  | 'politics'
  | 'business'
  | 'opinion'
  | 'sports'
  | 'science'
  | 'lifestyle';

export interface NewsArticle {
  // Identity
  id: string;
  slug: string;                    // URL-friendly identifier

  // Source tracking (internal only - NPCs don't see this)
  source: NewsSource;              // 'rss' | 'user' | 'ai'
  sourceUrl?: string;              // Original RSS URL if applicable
  sourceFeed?: string;             // Feed name (e.g., 'reuters', 'ap')

  // Content
  headline: string;
  subheadline?: string;
  summary: string;                 // 1-2 sentence summary for feed display
  content: string;                 // Full article body (markdown)

  // Metadata
  category: NewsCategory;
  author: string;                  // Byline (can be fake)
  publishedAt: number;             // Unix timestamp
  updatedAt?: number;

  // Media
  imageUrl?: string;
  imageCaption?: string;

  // Classification
  tags: string[];                  // For topic matching
  entities: string[];              // Named entities (people, places, orgs)
  sentiment?: 'positive' | 'negative' | 'neutral';

  // Engagement (for trending)
  npcMentions: number;             // How many NPCs referenced this
  lastMentionedAt?: number;

  // AI generation metadata (only for source: 'ai')
  generatedFrom?: {
    triggerType: 'trending_topic' | 'npc_activity' | 'scheduled' | 'event';
    triggerData: any;
    generatedAt: number;
  };
}
```

---

## Feed Sources

### Source 1: Real RSS Feeds

External news feeds parsed and normalized to our schema.

```typescript
// server/src/services/rss-parser.ts

export interface RSSFeedConfig {
  id: string;
  name: string;
  url: string;
  category: NewsCategory;
  refreshInterval: number;        // Minutes between fetches
  maxArticles: number;            // Max to keep per feed
  enabled: boolean;

  // Optional filtering
  includeKeywords?: string[];     // Only include if matches
  excludeKeywords?: string[];     // Skip if matches
}

// Default feeds (user configurable)
export const DEFAULT_RSS_FEEDS: RSSFeedConfig[] = [
  {
    id: 'reuters_top',
    name: 'Reuters Top News',
    url: 'https://feeds.reuters.com/reuters/topNews',
    category: 'business',
    refreshInterval: 30,
    maxArticles: 20,
    enabled: true,
  },
  {
    id: 'ap_news',
    name: 'AP News',
    url: 'https://rsshub.app/apnews/topics/apf-topnews',
    category: 'local',
    refreshInterval: 30,
    maxArticles: 20,
    enabled: true,
  },
  // ... more feeds
];
```

**RSS Parsing Flow:**
1. Scheduler triggers RSS refresh every N minutes
2. Fetch each enabled feed
3. Parse RSS/Atom XML to extract articles
4. Normalize to `NewsArticle` schema
5. Deduplicate against existing articles
6. Store in news database
7. Emit `NEWS_ARTICLE_INGESTED` event

### Source 2: User-Written Lore

Hand-crafted articles stored as JSON files.

```
server/data/news/lore/
├── quantum-coffee-opens.json
├── meme-war-retrospective.json
├── velvet-algorithms-cancelled.json
├── city-council-meme-ban.json
└── emotional-ai-startup.json
```

**Lore Article Example:**
```json
{
  "id": "lore_quantum_cafe_001",
  "slug": "quantum-cafe-opens-downtown",
  "source": "user",
  "headline": "New Quantum Cafe Opens Downtown, Charges $47 Per Cup",
  "subheadline": "Enthusiasts line up for hours; scientists remain skeptical",
  "summary": "Qubit Coffee, the city's first dedicated quantum coffee establishment, opened to massive crowds and equally massive skepticism from the scientific community.",
  "content": "Full article markdown here...",
  "category": "local",
  "author": "Michael Torres",
  "publishedAt": 1737331200000,
  "tags": ["coffee", "quantum", "local-business", "downtown"],
  "entities": ["Qubit Coffee", "Dana Kim", "Dr. Sarah Blackwell", "MIT"],
  "sentiment": "neutral",
  "npcMentions": 0
}
```

**Lore Loading:**
- On server start, scan `server/data/news/lore/` for JSON files
- Validate against schema
- Load into news feed with `source: 'user'`
- Watch directory for changes (hot reload)

### Source 3: AI-Generated Stories

Articles generated by the system based on in-game events and trending topics.

**Generation Triggers:**

| Trigger | Description | Example |
|---------|-------------|---------|
| `trending_topic` | Topic mentioned by N+ NPCs in M hours | "Quantum coffee mentioned 50 times" |
| `npc_activity` | Notable NPC does something newsworthy | "Famous NPC releases new album" |
| `scheduled` | Regular content generation (daily) | "Weekly roundup" |
| `event` | Game event occurs | "New NPC joins the social network" |

**Story Generator Prompt:**
```
You are a journalist for DailyBuzz, a local news outlet.

## Assignment
Write a news article about: {topic}

## Context
- This topic has been trending among local residents
- Recent social media posts about this:
  - @Alex: "Did you see that new quantum cafe? $47 for coffee lmao"
  - @Sam: "I actually tried it, the quantum brewing thing is wild"
  - @Jordan: "I'm not paying $47 for coffee that might not even be real"

## Guidelines
- Write in standard journalistic style
- Include quotes from sources (can be fictional locals)
- Keep it 300-500 words
- Treat all topics as completely real and legitimate
- Match the tone of existing DailyBuzz articles

## Output Format
Return JSON:
{
  "headline": "...",
  "subheadline": "...",
  "summary": "...",
  "content": "...",
  "tags": [...],
  "entities": [...],
  "category": "..."
}
```

---

## Database Schema

```sql
-- server/src/db/schema/news.sql

-- Core news articles table
CREATE TABLE IF NOT EXISTS news_articles (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,

  -- Source tracking
  source TEXT NOT NULL CHECK (source IN ('rss', 'user', 'ai')),
  source_url TEXT,
  source_feed TEXT,

  -- Content
  headline TEXT NOT NULL,
  subheadline TEXT,
  summary TEXT NOT NULL,
  content TEXT NOT NULL,

  -- Metadata
  category TEXT NOT NULL,
  author TEXT NOT NULL,
  published_at INTEGER NOT NULL,
  updated_at INTEGER,

  -- Media
  image_url TEXT,
  image_caption TEXT,

  -- Classification (JSON arrays)
  tags TEXT DEFAULT '[]',        -- JSON array
  entities TEXT DEFAULT '[]',    -- JSON array
  sentiment TEXT,

  -- Engagement
  npc_mentions INTEGER DEFAULT 0,
  last_mentioned_at INTEGER,

  -- AI generation metadata (JSON)
  generated_from TEXT,           -- JSON object

  -- Timestamps
  created_at INTEGER DEFAULT (unixepoch()),

  -- Indexes
  UNIQUE(source, source_url)     -- Prevent RSS duplicates
);

CREATE INDEX idx_news_published ON news_articles(published_at DESC);
CREATE INDEX idx_news_category ON news_articles(category);
CREATE INDEX idx_news_source ON news_articles(source);
CREATE INDEX idx_news_mentions ON news_articles(npc_mentions DESC);

-- RSS feed configuration
CREATE TABLE IF NOT EXISTS rss_feeds (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  refresh_interval INTEGER DEFAULT 30,
  max_articles INTEGER DEFAULT 20,
  enabled INTEGER DEFAULT 1,
  last_fetched_at INTEGER,
  last_error TEXT,
  created_at INTEGER DEFAULT (unixepoch())
);

-- Track which articles NPCs have "seen" (for context injection)
CREATE TABLE IF NOT EXISTS npc_news_exposure (
  id TEXT PRIMARY KEY,
  npc_id TEXT NOT NULL,
  article_id TEXT NOT NULL,
  exposed_at INTEGER DEFAULT (unixepoch()),
  mentioned INTEGER DEFAULT 0,    -- Did they reference it?
  FOREIGN KEY (npc_id) REFERENCES npcs(id),
  FOREIGN KEY (article_id) REFERENCES news_articles(id),
  UNIQUE(npc_id, article_id)
);

CREATE INDEX idx_npc_exposure_npc ON npc_news_exposure(npc_id);
CREATE INDEX idx_npc_exposure_article ON npc_news_exposure(article_id);
```

---

## Services

### 1. News Feed Service

```typescript
// server/src/services/news-feed.ts

export class NewsFeedService {
  /**
   * Get recent headlines for NPC context injection
   * Returns mixed sources, NPC doesn't know the difference
   */
  async getHeadlinesForContext(options: {
    limit?: number;
    categories?: NewsCategory[];
    hoursBack?: number;
    excludeArticleIds?: string[];  // Don't repeat
  }): Promise<NewsArticle[]>;

  /**
   * Get full article by ID or slug
   */
  async getArticle(idOrSlug: string): Promise<NewsArticle | null>;

  /**
   * Search articles by keyword
   */
  async searchArticles(query: string, options?: {
    limit?: number;
    categories?: NewsCategory[];
    sources?: NewsSource[];
  }): Promise<NewsArticle[]>;

  /**
   * Record that an NPC mentioned an article
   * Used for trending detection
   */
  async recordMention(articleId: string, npcId: string): Promise<void>;

  /**
   * Get trending articles (most mentioned recently)
   */
  async getTrendingArticles(options?: {
    limit?: number;
    hoursBack?: number;
  }): Promise<NewsArticle[]>;

  /**
   * Ingest article from any source
   */
  async ingestArticle(article: Omit<NewsArticle, 'id' | 'npcMentions'>): Promise<NewsArticle>;

  /**
   * Load all lore articles from disk
   */
  async loadLoreArticles(): Promise<void>;
}
```

### 2. RSS Parser Service

```typescript
// server/src/services/rss-parser.ts

export class RSSParserService {
  /**
   * Fetch and parse a single feed
   */
  async fetchFeed(config: RSSFeedConfig): Promise<NewsArticle[]>;

  /**
   * Refresh all enabled feeds
   */
  async refreshAllFeeds(): Promise<{
    success: number;
    failed: number;
    newArticles: number;
  }>;

  /**
   * Add a new RSS feed
   */
  async addFeed(config: Omit<RSSFeedConfig, 'id'>): Promise<RSSFeedConfig>;

  /**
   * Get all configured feeds
   */
  async getFeeds(): Promise<RSSFeedConfig[]>;

  /**
   * Toggle feed enabled/disabled
   */
  async setFeedEnabled(feedId: string, enabled: boolean): Promise<void>;
}
```

### 3. Story Generator Service

```typescript
// server/src/services/story-generator.ts

export class StoryGeneratorService {
  /**
   * Generate article from trending topic
   */
  async generateFromTrend(topic: string, context: {
    recentPosts: Post[];
    mentionCount: number;
    sentiment: 'positive' | 'negative' | 'mixed';
  }): Promise<NewsArticle>;

  /**
   * Generate article from NPC activity
   */
  async generateFromActivity(activity: {
    npcId: string;
    activityType: string;
    description: string;
  }): Promise<NewsArticle>;

  /**
   * Generate scheduled content (daily digest, weekly roundup)
   */
  async generateScheduledContent(type: 'daily' | 'weekly'): Promise<NewsArticle[]>;

  /**
   * Detect trending topics from recent NPC posts
   */
  async detectTrendingTopics(options?: {
    hoursBack?: number;
    minMentions?: number;
  }): Promise<Array<{
    topic: string;
    mentions: number;
    posts: Post[];
    sentiment: string;
  }>>;
}
```

---

## Context Builder Integration

Update `buildContextForAutonomousPost()` to include news:

```typescript
// server/src/services/context-builder.ts

export async function buildContextForAutonomousPost(
  npcId: string,
  platform: string
): Promise<{ systemPrompt: string; contextData: any }> {
  const npc = await getNPC(npcId);
  const recentMemories = await getRecentMemories(npcId, 3);
  const recentOwnPosts = await getRecentPosts(npcId, 5);
  const friendActivity = await getFriendsRecentActivity(npcId, 24);
  const timeContext = getCurrentTimeContext();

  // NEW: Get recent news headlines
  const recentNews = await newsFeedService.getHeadlinesForContext({
    limit: 5,
    hoursBack: 48,
    // Optionally filter by NPC interests
    categories: npc.interests?.map(interestToCategory),
  });

  const systemPrompt = `
You are ${npc.display_name}. It's ${timeContext.day_of_week} ${timeContext.time_period}.

## Recent News Headlines
${recentNews.map(n => `- "${n.headline}" (${n.category})`).join('\n')}

## Your Recent Life
${recentMemories.map(m => `- ${m.content}`).join('\n')}

## What Your Friends Are Up To
${friendActivity.map(a => `- ${a.npc_name}: ${a.activity}`).join('\n')}

## Your Recent Posts (don't repeat these topics)
${recentOwnPosts.map(p => `- ${p.timestamp}: "${p.content.slice(0, 50)}..."`).join('\n')}

## Guidelines
- Create a ${platform} post about what's on your mind right now
- You can reference current events from the news
- You can respond to friends' activity or share something new
- Consider the time and day (${timeContext.context})
- Keep it authentic to your personality
- Don't repeat what you just posted about

What would you post?
  `.trim();

  return {
    systemPrompt,
    contextData: { recentMemories, friendActivity, timeContext, recentNews }
  };
}
```

---

## Background Tasks

### RSS Refresh Task

```typescript
// Runs every 30 minutes
{
  type: 'refresh_rss_feeds',
  priority: 3,  // Low priority, background
  handler: async () => {
    const result = await rssParserService.refreshAllFeeds();
    eventBus.fire(EventTypes.NEWS_RSS_REFRESHED, {
      success: result.success,
      failed: result.failed,
      new_articles: result.newArticles,
    });
  }
}
```

### Trend Detection & Story Generation Task

```typescript
// Runs every 2 hours
{
  type: 'generate_trending_stories',
  priority: 4,  // Low priority
  handler: async () => {
    // 1. Detect trending topics
    const trends = await storyGeneratorService.detectTrendingTopics({
      hoursBack: 24,
      minMentions: 10,
    });

    // 2. Generate articles for top trends
    for (const trend of trends.slice(0, 3)) {
      const article = await storyGeneratorService.generateFromTrend(
        trend.topic,
        {
          recentPosts: trend.posts,
          mentionCount: trend.mentions,
          sentiment: trend.sentiment,
        }
      );

      // 3. Ingest into feed
      await newsFeedService.ingestArticle(article);

      eventBus.fire(EventTypes.NEWS_ARTICLE_GENERATED, {
        article_id: article.id,
        topic: trend.topic,
        trigger: 'trending_topic',
      });
    }
  }
}
```

---

## Event Types

```typescript
// Add to server/src/events/event-types.ts

// News Feed Events
NEWS_ARTICLE_INGESTED: 'news:article_ingested',
NEWS_ARTICLE_GENERATED: 'news:article_generated',
NEWS_ARTICLE_MENTIONED: 'news:article_mentioned',
NEWS_RSS_REFRESHED: 'news:rss_refreshed',
NEWS_TREND_DETECTED: 'news:trend_detected',
```

---

## API / WebSocket Messages

```typescript
// Client can request news for display in DailyBuzz

// Request
{ type: 'news:get_headlines', payload: { limit: 20, category?: string } }

// Response
{ type: 'news:headlines', payload: { articles: NewsArticle[] } }

// Request full article
{ type: 'news:get_article', payload: { id: string } }

// Response
{ type: 'news:article', payload: { article: NewsArticle } }
```

---

## Configuration

```typescript
// server/src/config/news.ts

export const NEWS_CONFIG = {
  // RSS Settings
  rss: {
    enabled: true,
    refreshIntervalMinutes: 30,
    maxArticlesPerFeed: 20,
    maxTotalRssArticles: 200,
  },

  // Lore Settings
  lore: {
    directory: './data/news/lore',
    watchForChanges: true,
  },

  // AI Generation Settings
  generation: {
    enabled: true,
    checkIntervalHours: 2,
    minMentionsForTrend: 10,
    maxArticlesPerRun: 3,
    model: 'gpt-4o-mini',  // Cheap model for news generation
  },

  // Context Injection
  context: {
    maxHeadlinesInPrompt: 5,
    hoursBackForRelevance: 48,
    weightByNpcInterests: true,
  },
};
```

---

## File Structure

```
server/
├── src/
│   ├── services/
│   │   ├── news-feed.ts           # Core feed aggregator (IMPLEMENTED)
│   │   ├── story-generator.ts     # AI article generation (IMPLEMENTED)
│   │   ├── context-builder.ts     # Context with news injection (IMPLEMENTED)
│   │   ├── news-tasks.ts          # Background task handlers (IMPLEMENTED)
│   │   └── rss-parser.ts          # RSS fetching & parsing (TODO)
│   ├── types/
│   │   └── news.ts                # NewsArticle types (IMPLEMENTED)
│   └── db/
│       └── index.ts               # Database tables in game db (IMPLEMENTED)
├── data/
│   └── news/
│       └── lore/
│           ├── quantum-coffee-breakthrough.json
│           ├── city-council-meme-hearing.json
│           ├── emotional-ai-startup.json
│           └── ... (add more lore articles here)
```

---

## Implementation Status

| Component | Status | File |
|-----------|--------|------|
| Article Types | ✅ Done | `server/src/types/news.ts` |
| Database Tables | ✅ Done | `server/src/db/index.ts` |
| News Feed Service | ✅ Done | `server/src/services/news-feed.ts` |
| Story Generator | ✅ Done | `server/src/services/story-generator.ts` |
| Context Builder | ✅ Done | `server/src/services/context-builder.ts` |
| Background Tasks | ✅ Done | `server/src/services/news-tasks.ts` |
| Sample Lore | ✅ Done | `server/data/news/lore/*.json` |
| RSS Parser | 🔜 TODO | - |
| WebSocket Handlers | 🔜 TODO | - |
| DailyBuzz Integration | 🔜 TODO | - |

### How to Initialize

In your server startup code:

```typescript
import { initializeNewsTasks, scheduleStoryGeneration } from './services/news-tasks.js';
import { startScheduler } from './services/background-scheduler.js';

// Initialize news task handlers
initializeNewsTasks();

// Schedule recurring story generation (every 6 hours)
scheduleStoryGeneration({ intervalHours: 6, startDelayMinutes: 5 });

// Start the background scheduler
startScheduler(30); // Process tasks every 30 seconds
```

### Adding Lore Articles

Create JSON files in `server/data/news/lore/` with this structure:

```json
{
  "slug": "unique-slug-for-article",
  "headline": "Your Headline Here",
  "subheadline": "Optional subheadline",
  "summary": "1-2 sentence summary for the feed.",
  "content": "Full article content in markdown...",
  "category": "local|tech|entertainment|politics|business|opinion|sports|science|lifestyle",
  "author": "Byline Name",
  "tags": ["array", "of", "tags"],
  "entities": ["Named", "Entities"],
  "sentiment": "positive|negative|neutral",
  "imageEmoji": "📰"
}
```

Articles are loaded automatically on server startup and can be hot-reloaded.

---

## Example: The Full Loop

1. **User writes lore article**: "Quantum Cafe Opens Downtown"
2. **Article enters unified feed** with `source: 'user'`
3. **NPC Alex generates post**: Sees headline in context, writes "omg that quantum cafe charges $47 for coffee??"
4. **NPC Sam comments**: "I actually wanna try it tho"
5. **10 more NPCs mention it** over 24 hours
6. **Trend detector notices**: "quantum coffee" mentioned 12 times
7. **Story generator writes article**: "Quantum Cafe Reports Record Opening Day Sales - Local residents flock to controversial coffee shop"
8. **New article enters feed** with `source: 'ai'`
9. **NPCs see the new headline** the next day
10. **NPC Jordan posts**: "Did you see Quantum Cafe had record sales? I still think it's overpriced bs"
11. **Loop continues forever**

The AI is now reading its own news and forming opinions about it. Welcome to the simulation.

---

## Future Enhancements

- **NPC Journalism**: Specific NPCs assigned as "journalists" who write articles
- **Fake Social Media Accounts**: News outlets have their own profiles that post
- **Breaking News Alerts**: Push notifications for major AI-generated events
- **Editorial Calendar**: Schedule lore drops for specific dates
- **Cross-referencing**: Articles that reference each other
- **Retraction System**: AI writes corrections when it gets things "wrong"
