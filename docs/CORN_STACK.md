# The Corn Stack - Universal Content & Routing System

> "We started with 'make a search engine' and realized we need to build the entire internet first."

## Overview

The Corn Stack is engAIge's universal content addressing and routing system. Every piece of content in the game - web pages, app screens, map locations, chat conversations - is addressable via a URL. This enables:

- **Universal Search**: Index and search across all game content
- **Content Tracking**: Know what the player has and hasn't seen
- **Social Discovery**: NPCs share links, driving organic content discovery
- **Deep Linking**: Any game state is shareable and navigable
- **Content Delivery**: External content drops are just URL→payload mappings

The `.corn` TLD is the game's internet namespace (a parody of `.onion` - it's the "corn cob" network).

---

## Table of Contents

1. [URL Architecture](#1-url-architecture)
2. [Universal Router](#2-universal-router)
3. [Content Payloads](#3-content-payloads)
4. [App & Site Registry](#4-app--site-registry)
5. [Content Tracking (Seen/Unseen)](#5-content-tracking-seenunseen)
6. [NPC Content Sharing](#6-npc-content-sharing)
7. [Search Index](#7-search-index)
8. [Search Engine (Goober)](#8-search-engine-goober)
9. [Ad Network Integration](#9-ad-network-integration)
10. [Content Delivery Integration](#10-content-delivery-integration)
11. [Implementation Phases](#11-implementation-phases)
12. [Database Schema](#12-database-schema)

---

## 1. URL Architecture

### Three Rendering Surfaces

Content renders on one of three surfaces, indicated by URL protocol:

| Protocol | Surface | Examples |
|----------|---------|----------|
| `browser://` | Browser window | Web content, .corn sites |
| `desktop://` | Desktop apps | Maps, Files, Settings, Notes |
| `phone://` | Phone apps | Messages, Dating apps, Contacts |

### URL Format

```
<surface>://<app-or-domain><path>[?params]

browser://threadit.corn/t/QuantumCoffee/My_great_post
desktop://maps/place/quantum-coffee-downtown
phone://messages/conversation/derek
```

### The .corn TLD

All in-game web content lives on `.corn` domains. This is the game's internet.

```
threadit.corn       - Reddit-style forums
myface.corn         - Social profiles (MySpace meets Facebook)
vidtube.corn        - Video platform
wikiknow.corn       - Wiki/How-to articles
goober.corn         - Search engine
quantum-coffee.corn - Business website
strangerzone.corn   - Anonymous chat
news.corn           - News aggregator
```

### Display URL vs Internal Route

Users see pretty `.corn` URLs. Internally, these resolve to routes:

```
Display URL (user sees):
  threadit.corn/t/QuantumCoffee/My_Friend_told_me_about_this_coffee

Internal Route (system uses):
  /threadit/t/quantumcoffee/847

Component + Data:
  <ThreaditPost subreddit="quantumcoffee" postId={847} />
```

### URL Shorthand

Bare `.corn` URLs default to `browser://`:

```typescript
// These are equivalent:
"threadit.corn/t/Coffee"
"browser://threadit.corn/t/Coffee"
```

### URL Parsing

```typescript
interface UniversalURL {
  raw: string;                              // Original URL string
  surface: 'browser' | 'desktop' | 'phone'; // Rendering surface
  app: string;                              // App name or .corn domain
  path: string;                             // Path within app
  params: URLSearchParams;                  // Query parameters
  hash?: string;                            // Fragment identifier
}

function parseURL(url: string): UniversalURL {
  // Normalize: bare .corn URLs become browser://
  if (url.match(/^[\w-]+\.corn/)) {
    url = `browser://${url}`;
  }

  const match = url.match(/^(browser|desktop|phone):\/\/([^\/\?#]+)([^?#]*)(\?[^#]*)?(#.*)?$/);
  if (!match) throw new Error(`Invalid URL: ${url}`);

  return {
    raw: url,
    surface: match[1] as 'browser' | 'desktop' | 'phone',
    app: match[2],
    path: match[3] || '/',
    params: new URLSearchParams(match[4]?.slice(1) || ''),
    hash: match[5]?.slice(1),
  };
}
```

---

## 2. Universal Router

The Universal Router is the backbone of the Corn Stack. It:

1. Parses URLs into structured components
2. Resolves URLs to content payloads
3. Navigates to the appropriate surface/app
4. Tracks all navigation for the seen/unseen system

### Router Interface

```typescript
interface RouterNavigation {
  url: string;
  payload: ContentPayload;
  surface: 'browser' | 'desktop' | 'phone';
  app: string;
}

interface UniversalRouter {
  // Core navigation
  navigate(url: string, options?: NavigateOptions): Promise<RouterNavigation>;

  // URL utilities
  parse(url: string): UniversalURL;
  resolve(url: UniversalURL): Promise<ContentPayload | null>;

  // Display URL generation (internal route → pretty URL)
  toDisplayURL(internalPath: string): string;

  // Site/app registration
  register(definition: AppDefinition): void;

  // Events
  on(event: 'navigate', handler: (nav: RouterNavigation) => void): void;
  on(event: 'notfound', handler: (url: string) => void): void;
}

interface NavigateOptions {
  newTab?: boolean;           // Open in new browser tab
  replace?: boolean;          // Replace history instead of push
  referrer?: ContentReferrer; // How user got here (for tracking)
  background?: boolean;       // Don't focus the app
}

interface ContentReferrer {
  type: 'direct' | 'search' | 'npc_share' | 'link_click' | 'notification' | 'bookmark';
  source?: string;  // NPC ID, search query, referring URL, etc.
}
```

### Router Implementation

```typescript
class CornRouter implements UniversalRouter {
  private registry: Map<string, AppDefinition> = new Map();
  private listeners: Map<string, Function[]> = new Map();

  register(definition: AppDefinition): void {
    const key = definition.surface === 'browser'
      ? definition.domain
      : `${definition.surface}:${definition.id}`;
    this.registry.set(key, definition);
  }

  async navigate(url: string, options: NavigateOptions = {}): Promise<RouterNavigation> {
    const parsed = this.parse(url);
    const payload = await this.resolve(parsed);

    if (!payload) {
      this.emit('notfound', url);
      return this.navigate404(url);
    }

    // Open correct surface/app
    switch (parsed.surface) {
      case 'browser':
        windowManager.openOrFocus('browser', { background: options.background });
        browserApp.navigate(parsed.app + parsed.path, {
          newTab: options.newTab,
          replace: options.replace
        });
        break;

      case 'desktop':
        windowManager.openOrFocus(parsed.app, { background: options.background });
        desktopApps.get(parsed.app)?.navigate(parsed.path);
        break;

      case 'phone':
        phonePanel.open();
        phoneApps.get(parsed.app)?.navigate(parsed.path);
        break;
    }

    const navigation = { url, payload, surface: parsed.surface, app: parsed.app };

    // Track navigation (seen/unseen system)
    this.emit('navigate', navigation, options.referrer);

    return navigation;
  }

  async resolve(parsed: UniversalURL): Promise<ContentPayload | null> {
    const key = parsed.surface === 'browser'
      ? parsed.app
      : `${parsed.surface}:${parsed.app}`;

    const definition = this.registry.get(key);
    if (!definition) return null;

    return definition.resolve(parsed.path, parsed.params);
  }
}

// Global router instance
export const router = new CornRouter();
```

### Navigation Examples

```typescript
// User clicks link in chat
router.navigate('threadit.corn/t/QuantumCoffee/847', {
  referrer: { type: 'npc_share', source: 'npc_derek' }
});

// Search result clicked
router.navigate('browser://quantum-coffee.corn/menu', {
  referrer: { type: 'search', source: 'quantum coffee menu' }
});

// NPC shares map location
router.navigate('desktop://maps/place/quantum-downtown', {
  referrer: { type: 'npc_share', source: 'npc_derek' }
});

// Notification tapped
router.navigate('phone://messages/conversation/derek', {
  referrer: { type: 'notification' }
});
```

---

## 3. Content Payloads

Every URL resolves to a Content Payload - a self-contained package with everything needed to render the content.

### Payload Schema

```typescript
type PageType = 'static' | 'interactive' | 'app';

interface ContentPayload {
  // Identity
  url: string;                    // Canonical URL
  type: PageType;                 // Rendering complexity

  // Rendering
  renderer: string;               // Component name to render
  data: Record<string, unknown>;  // Props passed to renderer

  // URL-driven UI state (for interactive pages)
  activeState?: Record<string, unknown>;

  // Metadata (for search, display, tracking)
  metadata: ContentMetadata;
}

interface ContentMetadata {
  // Display
  title: string;                  // Page title / search result title
  description: string;            // Meta description / search snippet
  favicon?: string;               // Site favicon
  image?: string;                 // OG image for previews

  // Search & Discovery
  keywords: string[];             // Semantic keywords for search
  seoScore: number;               // 0-100, affects search ranking
  category: ContentCategory;      // For search filtering

  // Tracking
  surface: 'browser' | 'desktop' | 'phone';
  source: string;                 // Site/app name
  publishedAt?: Date;             // For recency ranking
  updatedAt?: Date;

  // Advertising
  adKeywords?: string[];          // Keywords for contextual ads
  adBid?: number;                 // Sponsored placement bid
}

type ContentCategory =
  | 'website'      // General web page
  | 'social'       // Social media post/profile
  | 'forum'        // Discussion/forum post
  | 'news'         // News article
  | 'video'        // Video content
  | 'location'     // Map location
  | 'product'      // Product/shopping
  | 'profile'      // NPC/user profile
  | 'message'      // Chat/message thread
  | 'media'        // Image/file
  | 'app';         // Native app screen
```

### Page Types

**Static** - Content renders, minimal interactivity:
```typescript
{
  type: 'static',
  renderer: 'WikiKnowArticle',
  data: {
    title: 'How to Brew Quantum Coffee',
    content: '...',
    categories: ['Beverages', 'Pseudoscience'],
  }
}
```

**Interactive** - Has state, user actions, URL-driven UI:
```typescript
{
  type: 'interactive',
  renderer: 'ThreaditPost',
  data: {
    post: { id: 847, title: '...', content: '...' },
    comments: [ /* tree */ ],
  },
  activeState: {
    focusedComment: 234,      // from URL: /post/847/comment/234
    replyOpen: true,          // from URL: /post/847/comment/234/reply
    sortBy: 'controversial',  // from URL: ?sort=controversial
  }
}
```

**App** - Full application experience:
```typescript
{
  type: 'app',
  renderer: 'MapsApp',
  data: {
    initialView: { lat: 40.7, lng: -74.0, zoom: 15 },
    focusedPlace: 'quantum-downtown',
  }
}
```

### Payload Resolution Flow

```
URL: threadit.corn/t/QuantumCoffee/My_great_post/comment/234/reply

1. Parse URL
   → { surface: 'browser', app: 'threadit.corn', path: '/t/QuantumCoffee/My_great_post/comment/234/reply' }

2. Find Site Definition
   → ThreaditSite registered for 'threadit.corn'

3. Match Route
   → Pattern: '/t/:subreddit/:slug/comment/:commentId/:action?'
   → Params: { subreddit: 'QuantumCoffee', slug: 'My_great_post', commentId: '234', action: 'reply' }

4. Resolve Content
   → Query DB for post with slug 'My_great_post' in subreddit 'QuantumCoffee'
   → Build comment tree, find comment 234

5. Build Payload
   → {
       url: 'threadit.corn/t/QuantumCoffee/My_great_post/comment/234/reply',
       type: 'interactive',
       renderer: 'ThreaditPost',
       data: { post: {...}, comments: [...] },
       activeState: { focusedComment: 234, replyOpen: true },
       metadata: { title: '...', keywords: [...], seoScore: 45 }
     }

6. Render
   → <ThreaditPost post={...} comments={...} focusedComment={234} replyOpen={true} />
```

---

## 4. App & Site Registry

Every app and site registers with the router, declaring its routes and resolution logic.

### AppDefinition Interface

```typescript
interface AppDefinition {
  // Identity
  id: string;                           // Unique identifier
  surface: 'browser' | 'desktop' | 'phone';
  domain?: string;                      // For browser sites: 'threadit.corn'

  // Display
  name: string;                         // Human-readable name
  icon?: string;                        // Icon path/component

  // Routing
  routes: RouteDefinition[];

  // Resolution
  resolve(path: string, params: URLSearchParams): Promise<ContentPayload | null>;

  // Reverse routing (internal → display URL)
  toDisplayPath?(internalPath: string): string;

  // SEO defaults for this site/app
  seo: {
    baseScore: number;                  // Default SEO score
    keywords: string[];                 // Site-wide keywords
  };
}

interface RouteDefinition {
  pattern: string;                      // '/t/:subreddit/:slug'
  renderer: string;                     // Component name
  resolve: RouteResolver;               // Data fetching function

  // Nested stateful routes (for interactive pages)
  children?: RouteDefinition[];
}

type RouteResolver = (
  params: Record<string, string>,
  query: URLSearchParams
) => Promise<{ data: unknown; metadata: Partial<ContentMetadata> }>;
```

### Browser Site Example: Threadit

```typescript
const ThreaditSite: AppDefinition = {
  id: 'threadit',
  surface: 'browser',
  domain: 'threadit.corn',
  name: 'Threadit',
  icon: '/icons/threadit.png',

  routes: [
    {
      pattern: '/',
      renderer: 'ThreaditHome',
      resolve: async () => ({
        data: { trending: await getTrendingPosts() },
        metadata: { title: 'Threadit - The Front Page of the Corn' }
      })
    },
    {
      pattern: '/t/:subreddit',
      renderer: 'ThreaditSubreddit',
      resolve: async ({ subreddit }, query) => {
        const posts = await getSubredditPosts(subreddit, {
          sort: query.get('sort') || 'hot'
        });
        return {
          data: { subreddit, posts },
          metadata: {
            title: `t/${subreddit}`,
            keywords: [subreddit, 'forum', 'discussion']
          }
        };
      }
    },
    {
      pattern: '/t/:subreddit/:slug',
      renderer: 'ThreaditPost',
      resolve: async ({ subreddit, slug }, query) => {
        const post = await getPostBySlug(subreddit, slug);
        const comments = await getComments(post.id, {
          sort: query.get('sort') || 'best'
        });
        return {
          data: { post, comments },
          metadata: {
            title: `${post.title} : ${subreddit}`,
            description: `Posted by ${post.author} - ${post.upvotes} upvotes`,
            keywords: [subreddit, ...post.tags],
            seoScore: calculatePostSEO(post)
          }
        };
      },
      // Nested routes for UI state
      children: [
        { pattern: '/comment/:commentId', renderer: 'ThreaditPost' },
        { pattern: '/comment/:commentId/reply', renderer: 'ThreaditPost' },
      ]
    },
    {
      pattern: '/u/:username',
      renderer: 'ThreaditUser',
      resolve: async ({ username }) => {
        const user = await getThreaditUser(username);
        return {
          data: { user, posts: user.posts },
          metadata: { title: `u/${username} - Threadit` }
        };
      }
    }
  ],

  async resolve(path, params) {
    const matched = matchRoute(this.routes, path);
    if (!matched) return null;

    const { data, metadata } = await matched.route.resolve(matched.params, params);

    return {
      url: `${this.domain}${path}`,
      type: matched.route.children ? 'interactive' : 'static',
      renderer: matched.route.renderer,
      data,
      activeState: extractActiveState(matched),
      metadata: {
        ...this.seo,
        surface: this.surface,
        source: this.name,
        ...metadata
      }
    };
  },

  toDisplayPath(internalPath) {
    // /threadit/t/quantumcoffee/847 → /t/QuantumCoffee/My_great_post
    // (lookup slug from ID, restore original casing)
  },

  seo: {
    baseScore: 60,
    keywords: ['forum', 'discussion', 'community', 'threadit']
  }
};

router.register(ThreaditSite);
```

### Desktop App Example: Maps

```typescript
const MapsApp: AppDefinition = {
  id: 'maps',
  surface: 'desktop',
  name: 'Maps',
  icon: '/icons/maps.png',

  routes: [
    {
      pattern: '/',
      renderer: 'MapsHome',
      resolve: async () => ({
        data: { initialView: getDefaultMapView() },
        metadata: { title: 'Maps' }
      })
    },
    {
      pattern: '/place/:placeId',
      renderer: 'MapsPlace',
      resolve: async ({ placeId }) => {
        const place = await getPlace(placeId);
        return {
          data: { place, nearbyPlaces: await getNearby(place.location) },
          metadata: {
            title: `${place.name} - Maps`,
            description: place.description,
            keywords: [place.category, place.name, ...place.tags],
            category: 'location'
          }
        };
      }
    },
    {
      pattern: '/search',
      renderer: 'MapsSearch',
      resolve: async (_, query) => {
        const q = query.get('q') || '';
        const results = await searchPlaces(q);
        return {
          data: { query: q, results },
          metadata: { title: `${q} - Maps Search` }
        };
      }
    }
  ],

  async resolve(path, params) {
    // Same pattern as browser sites
  },

  seo: {
    baseScore: 70,
    keywords: ['maps', 'directions', 'locations', 'places']
  }
};

router.register(MapsApp);
```

### Phone App Example: Messages

```typescript
const MessagesApp: AppDefinition = {
  id: 'messages',
  surface: 'phone',
  name: 'Messages',
  icon: '/icons/messages.png',

  routes: [
    {
      pattern: '/',
      renderer: 'MessagesInbox',
      resolve: async () => ({
        data: { conversations: await getConversations() },
        metadata: { title: 'Messages' }
      })
    },
    {
      pattern: '/conversation/:npcId',
      renderer: 'MessagesChat',
      resolve: async ({ npcId }) => {
        const npc = await getNPC(npcId);
        const messages = await getMessages(npcId);
        return {
          data: { npc, messages },
          metadata: {
            title: `Chat with ${npc.displayName}`,
            category: 'message'
          }
        };
      }
    },
    {
      pattern: '/compose',
      renderer: 'MessagesCompose',
      resolve: async (_, query) => ({
        data: {
          prefillUrl: query.get('url'),     // For sharing links
          prefillRecipient: query.get('to')
        },
        metadata: { title: 'New Message' }
      })
    }
  ],

  async resolve(path, params) {
    // Same pattern
  },

  seo: {
    baseScore: 50,
    keywords: ['messages', 'chat', 'conversation']
  }
};

router.register(MessagesApp);
```

---

## 5. Content Tracking (Seen/Unseen)

Every navigation is tracked, enabling powerful content discovery features.

### ContentTracker Interface

```typescript
interface ContentVisit {
  url: string;
  firstSeenAt: Date;
  lastSeenAt: Date;
  visitCount: number;
  totalTimeSpent: number;        // Milliseconds
  referrers: ContentReferrer[];  // How they found it each time
}

interface ContentTracker {
  // Record a visit
  markSeen(url: string, referrer?: ContentReferrer, timeSpent?: number): void;

  // Query seen status
  hasSeen(url: string): boolean;
  getVisit(url: string): ContentVisit | null;
  getAllSeen(): Map<string, ContentVisit>;

  // Query unseen content
  getUnseen(options?: UnseenQuery): string[];

  // Engagement tracking
  recordEngagement(url: string, type: EngagementType): void;

  // NPC sharing
  recordShare(fromNpc: string, url: string): void;
  getSharedBy(npcId: string): string[];
  getUnseenSharedBy(npcId: string): string[];
}

interface UnseenQuery {
  category?: ContentCategory;
  keywords?: string[];
  source?: string;           // Site/app
  maxAge?: number;           // Only content newer than X days
  limit?: number;
}

type EngagementType =
  | 'click_link'      // Clicked a link on the page
  | 'scroll_deep'     // Scrolled past 75%
  | 'time_spent'      // Spent significant time
  | 'interact'        // Used interactive elements
  | 'share';          // Shared the content
```

### ContentTracker Implementation

```typescript
class ContentTrackerImpl implements ContentTracker {
  markSeen(url: string, referrer?: ContentReferrer, timeSpent?: number): void {
    const normalized = normalizeURL(url);

    db.run(`
      INSERT INTO content_visits (url, first_seen_at, last_seen_at, visit_count, time_spent)
      VALUES (?, ?, ?, 1, ?)
      ON CONFLICT(url) DO UPDATE SET
        last_seen_at = excluded.last_seen_at,
        visit_count = visit_count + 1,
        time_spent = time_spent + excluded.time_spent
    `, [normalized, Date.now(), Date.now(), timeSpent || 0]);

    if (referrer) {
      db.run(`
        INSERT INTO visit_referrers (url, type, source, timestamp)
        VALUES (?, ?, ?, ?)
      `, [normalized, referrer.type, referrer.source, Date.now()]);
    }

    // Emit event for other systems
    eventBus.fire(EventTypes.CONTENT_SEEN, {
      url: normalized,
      referrer,
      timeSpent
    });
  }

  getUnseen(options: UnseenQuery = {}): string[] {
    // Query search index for content matching criteria
    // that doesn't exist in content_visits
    let query = `
      SELECT si.url FROM search_index si
      LEFT JOIN content_visits cv ON si.url = cv.url
      WHERE cv.url IS NULL
    `;

    const params: any[] = [];

    if (options.category) {
      query += ` AND si.category = ?`;
      params.push(options.category);
    }

    if (options.source) {
      query += ` AND si.source = ?`;
      params.push(options.source);
    }

    if (options.maxAge) {
      query += ` AND si.published_at > ?`;
      params.push(Date.now() - options.maxAge * 24 * 60 * 60 * 1000);
    }

    query += ` ORDER BY si.seo_score DESC`;

    if (options.limit) {
      query += ` LIMIT ?`;
      params.push(options.limit);
    }

    return db.query(query, params).map(r => r.url);
  }
}

// Hook into router
router.on('navigate', (nav, referrer) => {
  contentTracker.markSeen(nav.url, referrer);
});

export const contentTracker = new ContentTrackerImpl();
```

---

## 6. NPC Content Sharing

NPCs can share links with the player, creating organic content discovery through relationships.

### Share Opportunity System

```typescript
interface ShareOpportunity {
  url: string;
  reason: ShareReason;
  relevanceScore: number;      // 0-1, how relevant to player
  context: string;             // For NPC's message generation
  freshness: number;           // How new the content is
}

type ShareReason =
  | 'own_content'              // NPC's own post/content
  | 'thought_of_you'           // Matches player interests
  | 'trending'                 // Popular right now
  | 'conversation_relevant'    // Related to current/recent conversation
  | 'location'                 // Place they want to share
  | 'reaction_bait';           // Content likely to get a reaction

interface NPCShareSystem {
  // Get content this NPC could share
  getOpportunities(npcId: string, playerId: string): Promise<ShareOpportunity[]>;

  // Record that NPC shared something
  recordShare(npcId: string, playerId: string, url: string): void;

  // Check if NPC already shared this
  hasShared(npcId: string, playerId: string, url: string): boolean;

  // Get share history
  getShareHistory(npcId: string, playerId: string): SharedContent[];
}

interface SharedContent {
  url: string;
  sharedAt: Date;
  playerEngaged: boolean;      // Did player click it?
  engagedAt?: Date;
}
```

### Share Opportunity Resolution

```typescript
async function getShareOpportunities(
  npcId: string,
  playerId: string
): Promise<ShareOpportunity[]> {
  const opportunities: ShareOpportunity[] = [];

  const playerSeen = contentTracker.getAllSeen();
  const playerInterests = await player.getInterests(playerId);
  const shareHistory = await getShareHistory(npcId, playerId);
  const sharedUrls = new Set(shareHistory.map(s => s.url));

  // 1. NPC's own content player hasn't seen
  const npcPosts = await social.getPostsByNpc(npcId);
  for (const post of npcPosts) {
    if (!playerSeen.has(post.url) && !sharedUrls.has(post.url)) {
      opportunities.push({
        url: post.url,
        reason: 'own_content',
        relevanceScore: 0.8,
        context: `You posted "${post.title}" and want to know what they think`,
        freshness: calculateFreshness(post.createdAt)
      });
    }
  }

  // 2. Content matching player interests
  const interestMatches = await searchIndex.query({
    keywords: playerInterests,
    limit: 20
  });

  for (const result of interestMatches) {
    if (!playerSeen.has(result.url) && !sharedUrls.has(result.url)) {
      opportunities.push({
        url: result.url,
        reason: 'thought_of_you',
        relevanceScore: result.score,
        context: `This ${result.category} about "${result.keywords[0]}" made you think of them`,
        freshness: calculateFreshness(result.publishedAt)
      });
    }
  }

  // 3. Trending content
  const trending = await getTrendingContent();
  for (const item of trending) {
    if (!playerSeen.has(item.url) && !sharedUrls.has(item.url)) {
      opportunities.push({
        url: item.url,
        reason: 'trending',
        relevanceScore: 0.5,
        context: `This is trending right now and you want to share it`,
        freshness: 1.0
      });
    }
  }

  // Sort by relevance + freshness
  return opportunities
    .sort((a, b) => (b.relevanceScore * b.freshness) - (a.relevanceScore * a.freshness))
    .slice(0, 10);
}
```

### NPC Context Injection

Share opportunities are injected into NPC AI context:

```typescript
function buildNPCContext(npcId: string, playerId: string): string {
  const opportunities = await getShareOpportunities(npcId, playerId);

  if (opportunities.length === 0) return '';

  let context = `\n\n## Content You Could Share\n`;
  context += `If it feels natural, you can share these links in conversation:\n\n`;

  for (const opp of opportunities.slice(0, 5)) {
    context += `- [${opp.reason}] ${opp.url}\n`;
    context += `  Context: ${opp.context}\n`;
  }

  context += `\nFormat links as markdown: [description](url)\n`;
  context += `Only share if it fits the conversation naturally.\n`;

  return context;
}

// Example NPC response with shared link:
// "omg have u seen this?? [some guy tried quantum coffee for 30 days](vidtube.corn/watch?v=quantum-30-days) i died at the part where derek shows up 😭"
```

### Relationship Boost from Engagement

```typescript
// When player clicks an NPC-shared link
router.on('navigate', (nav, referrer) => {
  if (referrer?.type === 'npc_share' && referrer.source) {
    const npcId = referrer.source;

    // Update share record
    npcShareSystem.markEngaged(npcId, nav.url);

    // Boost relationship
    relationships.update(npcId, {
      affinity: +2,     // They appreciated the share
      familiarity: +1,  // Shared experience
    });

    // NPC can reference this later
    memory.create(npcId, {
      type: 'shared_content',
      content: `I shared ${nav.url} and they checked it out`,
      importance: 0.6
    });

    eventBus.fire(EventTypes.NPC_SHARE_ENGAGED, {
      npc_id: npcId,
      url: nav.url
    });
  }
});
```

---

## 7. Search Index

The search index aggregates metadata from all content payloads, enabling universal search.

### Index Schema

```typescript
interface SearchIndexEntry {
  url: string;                    // Primary key

  // Display
  title: string;
  snippet: string;                // Description or excerpt
  favicon?: string;
  thumbnail?: string;

  // Classification
  category: ContentCategory;
  surface: 'browser' | 'desktop' | 'phone';
  source: string;                 // Site/app name

  // Search matching
  keywords: string[];             // Semantic keywords (high weight)
  content: string;                // Full text content (lower weight)

  // Ranking factors
  seoScore: number;               // 0-100 base score
  adBid?: number;                 // Sponsored placement
  publishedAt?: Date;             // For freshness
  popularity?: number;            // Click-through rate

  // Metadata
  indexedAt: Date;
  updatedAt: Date;
}

interface SearchQuery {
  q: string;                      // Search terms
  category?: ContentCategory;     // Filter by type
  surface?: 'browser' | 'desktop' | 'phone';
  source?: string;                // Filter by site/app
  sort?: 'relevance' | 'recent' | 'popular';
  limit?: number;
  offset?: number;
}

interface SearchResult {
  url: string;
  title: string;
  snippet: string;                // With highlighted matches
  category: ContentCategory;
  surface: 'browser' | 'desktop' | 'phone';
  source: string;
  thumbnail?: string;
  score: number;                  // Combined ranking score
  isAd?: boolean;                 // Sponsored result
}
```

### Indexing Pipeline

```typescript
class SearchIndexer {
  // Index a single payload
  async indexPayload(payload: ContentPayload): Promise<void> {
    const entry: SearchIndexEntry = {
      url: payload.url,
      title: payload.metadata.title,
      snippet: payload.metadata.description,
      category: payload.metadata.category,
      surface: payload.metadata.surface,
      source: payload.metadata.source,
      keywords: payload.metadata.keywords,
      content: this.extractText(payload),
      seoScore: payload.metadata.seoScore,
      adBid: payload.metadata.adBid,
      publishedAt: payload.metadata.publishedAt,
      indexedAt: new Date(),
      updatedAt: new Date()
    };

    await this.upsert(entry);
  }

  // Bulk index an entire site
  async indexSite(definition: AppDefinition): Promise<void> {
    const urls = await definition.getAllUrls();

    for (const url of urls) {
      const parsed = router.parse(url);
      const payload = await definition.resolve(parsed.path, parsed.params);
      if (payload) {
        await this.indexPayload(payload);
      }
    }
  }

  // Re-index dynamic content (NPC posts, news)
  async indexDynamicContent(): Promise<void> {
    // Index recent NPC posts
    const recentPosts = await social.getRecentPosts({ hours: 24 });
    for (const post of recentPosts) {
      await this.indexPayload(post.toPayload());
    }

    // Index news articles
    const recentNews = await news.getRecentArticles({ hours: 24 });
    for (const article of recentNews) {
      await this.indexPayload(article.toPayload());
    }
  }

  private extractText(payload: ContentPayload): string {
    // Extract searchable text from payload data
    // Strip HTML, combine text fields, etc.
  }
}
```

### Search Algorithm

```typescript
class SearchEngine {
  async search(query: SearchQuery): Promise<SearchResult[]> {
    const terms = this.tokenize(query.q);

    // 1. Keyword matches (highest priority)
    const keywordMatches = await this.searchKeywords(terms, query);

    // 2. Content matches (fuzzy full-text)
    const contentMatches = await this.searchContent(terms, query);

    // 3. Combine and dedupe
    const combined = this.mergeResults(keywordMatches, contentMatches);

    // 4. Apply ranking
    const ranked = this.rankResults(combined, terms);

    // 5. Insert sponsored results
    const withAds = await this.insertAds(ranked, terms);

    return withAds.slice(query.offset || 0, (query.offset || 0) + (query.limit || 20));
  }

  private rankResults(results: SearchIndexEntry[], terms: string[]): SearchResult[] {
    return results
      .map(entry => ({
        ...entry,
        score: this.calculateScore(entry, terms)
      }))
      .sort((a, b) => b.score - a.score);
  }

  private calculateScore(entry: SearchIndexEntry, terms: string[]): number {
    let score = 0;

    // Keyword match bonus (0-50 points)
    const keywordHits = terms.filter(t =>
      entry.keywords.some(k => k.toLowerCase().includes(t.toLowerCase()))
    );
    score += (keywordHits.length / terms.length) * 50;

    // SEO score contribution (0-30 points)
    score += (entry.seoScore / 100) * 30;

    // Freshness bonus (0-10 points)
    if (entry.publishedAt) {
      const ageHours = (Date.now() - entry.publishedAt.getTime()) / (1000 * 60 * 60);
      score += Math.max(0, 10 - (ageHours / 24)); // Decay over 10 days
    }

    // Popularity bonus (0-10 points)
    if (entry.popularity) {
      score += Math.min(10, entry.popularity * 10);
    }

    return score;
  }

  private async insertAds(results: SearchResult[], terms: string[]): Promise<SearchResult[]> {
    // Find sponsored content matching query
    const ads = await this.getRelevantAds(terms);

    if (ads.length === 0) return results;

    // Insert top ad at position 0
    const withAds = [...results];
    if (ads[0]) {
      withAds.unshift({ ...ads[0], isAd: true });
    }

    // Insert second ad at position 4 if exists
    if (ads[1] && withAds.length > 4) {
      withAds.splice(4, 0, { ...ads[1], isAd: true });
    }

    return withAds;
  }
}

export const searchEngine = new SearchEngine();
```

---

## 8. Search Engine (Goober)

Goober is the in-game search engine - a `.corn` site that uses the search index.

### Site Definition

```typescript
const GooberSite: AppDefinition = {
  id: 'goober',
  surface: 'browser',
  domain: 'goober.corn',
  name: 'Goober',
  icon: '/icons/goober.png',

  routes: [
    {
      pattern: '/',
      renderer: 'GooberHome',
      resolve: async () => ({
        data: {
          trendingSearches: await getTrendingSearches(),
          doodle: await getDailyDoodle()  // Fun daily image
        },
        metadata: {
          title: 'Goober',
          description: 'Search the Corn'
        }
      })
    },
    {
      pattern: '/search',
      renderer: 'GooberResults',
      resolve: async (_, query) => {
        const q = query.get('q') || '';
        const category = query.get('cat') as ContentCategory | undefined;
        const results = await searchEngine.search({
          q,
          category,
          limit: 20
        });

        return {
          data: {
            query: q,
            results,
            relatedSearches: await getRelatedSearches(q),
            didYouMean: await getSpellingSuggestion(q)
          },
          metadata: {
            title: `${q} - Goober Search`,
            description: `Search results for "${q}"`
          }
        };
      }
    },
    {
      pattern: '/images',
      renderer: 'GooberImages',
      resolve: async (_, query) => {
        const q = query.get('q') || '';
        const results = await searchEngine.search({
          q,
          category: 'media',
          limit: 50
        });
        return {
          data: { query: q, results },
          metadata: { title: `${q} - Goober Images` }
        };
      }
    },
    {
      pattern: '/maps',
      renderer: 'GooberMaps',
      resolve: async (_, query) => {
        const q = query.get('q') || '';
        // Redirect to Maps app
        return {
          data: { redirect: `desktop://maps/search?q=${encodeURIComponent(q)}` },
          metadata: { title: `${q} - Goober Maps` }
        };
      }
    }
  ],

  seo: {
    baseScore: 90,
    keywords: ['search', 'goober', 'find']
  }
};
```

### Goober UI Components

```typescript
// GooberHome.tsx
function GooberHome({ data }) {
  const [query, setQuery] = useState('');

  const handleSearch = () => {
    router.navigate(`goober.corn/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="goober-home">
      <img src="/goober-logo.png" alt="Goober" className="goober-logo" />

      <div className="search-box">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          placeholder="Search the Corn"
        />
        <button onClick={handleSearch}>Goober Search</button>
        <button onClick={() => router.navigate(`goober.corn/search?q=${query}&lucky=true`)}>
          I'm Feeling Corny
        </button>
      </div>

      <div className="trending">
        <h3>Trending Searches</h3>
        {data.trendingSearches.map(term => (
          <a key={term} onClick={() => router.navigate(`goober.corn/search?q=${term}`)}>
            {term}
          </a>
        ))}
      </div>
    </div>
  );
}

// GooberResults.tsx
function GooberResults({ data }) {
  return (
    <div className="goober-results">
      <GooberSearchBar initialQuery={data.query} />

      <div className="results-tabs">
        <Tab active>All</Tab>
        <Tab onClick={() => router.navigate(`goober.corn/images?q=${data.query}`)}>Images</Tab>
        <Tab onClick={() => router.navigate(`goober.corn/maps?q=${data.query}`)}>Maps</Tab>
        <Tab onClick={() => router.navigate(`goober.corn/news?q=${data.query}`)}>News</Tab>
      </div>

      {data.didYouMean && (
        <div className="did-you-mean">
          Did you mean: <a onClick={() => router.navigate(`goober.corn/search?q=${data.didYouMean}`)}>
            {data.didYouMean}
          </a>
        </div>
      )}

      <div className="results-list">
        {data.results.map(result => (
          <SearchResult key={result.url} result={result} />
        ))}
      </div>

      <div className="related-searches">
        <h4>Related searches</h4>
        {data.relatedSearches.map(term => (
          <a key={term} onClick={() => router.navigate(`goober.corn/search?q=${term}`)}>
            {term}
          </a>
        ))}
      </div>
    </div>
  );
}

// SearchResult.tsx
function SearchResult({ result }) {
  const handleClick = () => {
    router.navigate(result.url, {
      referrer: { type: 'search', source: currentQuery }
    });
  };

  return (
    <div className={`search-result ${result.isAd ? 'sponsored' : ''}`}>
      {result.isAd && <span className="ad-label">Ad</span>}

      <div className="result-url">{result.url}</div>
      <a className="result-title" onClick={handleClick}>
        {result.title}
      </a>
      <p className="result-snippet">{result.snippet}</p>

      {result.thumbnail && (
        <img src={result.thumbnail} alt="" className="result-thumbnail" />
      )}
    </div>
  );
}
```

### Search Result Types (Round-Robin)

For rich queries, results cycle through different types:

```typescript
async function getMultiTypeResults(query: string): Promise<SearchResult[]> {
  const [
    locations,
    websites,
    news,
    social,
    videos,
    profiles
  ] = await Promise.all([
    searchEngine.search({ q: query, category: 'location', limit: 3 }),
    searchEngine.search({ q: query, category: 'website', limit: 5 }),
    searchEngine.search({ q: query, category: 'news', limit: 3 }),
    searchEngine.search({ q: query, category: 'social', limit: 3 }),
    searchEngine.search({ q: query, category: 'video', limit: 3 }),
    searchEngine.search({ q: query, category: 'profile', limit: 2 })
  ]);

  // Interleave results for variety
  const interleaved: SearchResult[] = [];
  const maxLength = Math.max(
    locations.length, websites.length, news.length,
    social.length, videos.length, profiles.length
  );

  for (let i = 0; i < maxLength; i++) {
    if (locations[i]) interleaved.push(locations[i]);
    if (websites[i]) interleaved.push(websites[i]);
    if (news[i]) interleaved.push(news[i]);
    if (social[i]) interleaved.push(social[i]);
    if (videos[i]) interleaved.push(videos[i]);
    if (profiles[i]) interleaved.push(profiles[i]);
  }

  return interleaved;
}

// Query: "quantum coffee"
// Results:
// 1. [location] Quantum Coffee - 3 locations → desktop://maps/...
// 2. [website]  Quantum Coffee™ Official Site → browser://quantum-coffee.corn
// 3. [news]     "Quantum Coffee Recall Announced" → browser://news.corn/...
// 4. [social]   "Anyone tried Quantum Coffee?" (Threadit) → browser://threadit.corn/...
// 5. [video]    "I Drank Quantum Coffee for 30 Days" → browser://vidtube.corn/...
// 6. [profile]  Derek (@quantum_derek) → browser://myface.corn/derek
// 7. [website]  WikiKnow: Quantum Coffee → browser://wikiknow.corn/...
// ...
```

---

## 9. Ad Network Integration

The search engine drives a contextual ad network used across all `.corn` sites.

### Ad System Schema

```typescript
interface Ad {
  id: string;
  advertiser: string;           // Business name

  // Targeting
  keywords: string[];           // Match against search/page keywords
  categories: ContentCategory[]; // Show on these page types

  // Creative
  headline: string;
  description: string;
  displayUrl: string;           // What users see
  targetUrl: string;            // Where click goes
  image?: string;               // For display ads

  // Bidding
  bidAmount: number;            // Per impression or click
  dailyBudget: number;
  remainingBudget: number;

  // Scheduling
  startDate?: Date;
  endDate?: Date;
  activeHours?: { start: number; end: number };
}

interface AdPlacement {
  type: 'search' | 'display' | 'sidebar';
  position: number;             // Position in results or on page
  ad: Ad;
  impressionId: string;
}
```

### Ad Selection

```typescript
class AdNetwork {
  async getSearchAds(keywords: string[], limit: number = 2): Promise<Ad[]> {
    // Find ads matching keywords with remaining budget
    const candidates = await db.query(`
      SELECT a.* FROM ads a
      JOIN ad_keywords ak ON a.id = ak.ad_id
      WHERE ak.keyword IN (${keywords.map(() => '?').join(',')})
        AND a.remaining_budget > 0
        AND (a.start_date IS NULL OR a.start_date <= ?)
        AND (a.end_date IS NULL OR a.end_date >= ?)
      GROUP BY a.id
      ORDER BY a.bid_amount DESC, COUNT(ak.keyword) DESC
      LIMIT ?
    `, [...keywords, Date.now(), Date.now(), limit]);

    return candidates;
  }

  async getDisplayAds(pageKeywords: string[], category: ContentCategory): Promise<Ad[]> {
    // Similar logic for display ads on content pages
  }

  recordImpression(adId: string, placementType: string): void {
    // Track impression, deduct budget
  }

  recordClick(adId: string): void {
    // Track click, potentially deduct more budget
  }
}
```

### Ad Placement Examples

```typescript
// Search results page
// Position 0: [Ad] Quantum Coffee - Brew The Impossible
// Position 1: Quantum Coffee™ Official Site
// Position 2: WikiKnow: Quantum Coffee
// Position 3: [Ad] Try Our New Quantum Roast!
// Position 4: "Quantum Coffee ruined my life" - Threadit

// Threadit sidebar
// [Display Ad] Quantum Coffee - Use code THREADIT for 10% off

// WikiKnow article about coffee
// [Display Ad] Quantum Coffee - Science in Every Sip
```

---

## 10. Content Delivery Integration

External content drops are just URL→Payload mappings injected into the system.

### Content Drop Format

```typescript
interface ContentDrop {
  version: string;
  timestamp: Date;

  // New content to add
  payloads: {
    url: string;
    payload: ContentPayload;
  }[];

  // Index updates
  indexUpdates: Partial<SearchIndexEntry>[];

  // Optional: new site routes
  routes?: {
    domain: string;
    route: RouteDefinition;
  }[];
}

// Example content drop:
{
  "version": "1.0",
  "timestamp": "2024-10-31T00:00:00Z",
  "payloads": [
    {
      "url": "browser://strangerzone.corn/stranger/halloween-ghost",
      "payload": {
        "type": "interactive",
        "renderer": "StrangerZoneChat",
        "data": {
          "stranger": {
            "id": "halloween-ghost",
            "name": "???",
            "avatar": "ghost.png",
            "systemPrompt": "You are a mysterious ghost..."
          }
        },
        "metadata": {
          "title": "??? - StrangerZone",
          "keywords": ["halloween", "ghost", "spooky"],
          "seoScore": 80,
          "category": "social"
        }
      }
    }
  ]
}
```

### Content Injection

```typescript
class ContentDelivery {
  async applyDrop(drop: ContentDrop): Promise<void> {
    // Register new payloads
    for (const { url, payload } of drop.payloads) {
      contentStore.set(url, payload);
    }

    // Update search index
    for (const update of drop.indexUpdates) {
      await searchIndexer.upsert(update);
    }

    // Register new routes
    for (const { domain, route } of drop.routes || []) {
      const site = router.getSite(domain);
      site?.addRoute(route);
    }

    eventBus.fire(EventTypes.CONTENT_DROP_APPLIED, {
      payloadCount: drop.payloads.length,
      timestamp: drop.timestamp
    });
  }
}
```

---

## 11. Implementation Phases

### Phase 1: Foundation (Router + Payloads)

**Goal**: Basic URL routing works across all surfaces.

**Tasks**:
- [ ] Implement `UniversalURL` parser
- [ ] Implement `CornRouter` with site registration
- [ ] Define `ContentPayload` schema
- [ ] Create `AppDefinition` interface
- [ ] Wire router into Browser component
- [ ] Wire router into Desktop window manager
- [ ] Wire router into Phone panel
- [ ] Basic 404 handling

**Validation**:
- Can navigate to `browser://threadit.corn/` and see Threadit home
- Can navigate to `desktop://maps/` and Maps app opens
- Can navigate to `phone://messages/` and Messages app opens

### Phase 2: Content Migration

**Goal**: Existing filler sites work through the payload system.

**Tasks**:
- [ ] Convert Threadit to `AppDefinition` + payload resolvers
- [ ] Convert MyFace to `AppDefinition` + payload resolvers
- [ ] Convert VidTube to `AppDefinition` + payload resolvers
- [ ] Convert WikiKnow to `AppDefinition` + payload resolvers
- [ ] Convert StrangerZone to `AppDefinition` + payload resolvers
- [ ] Convert all business sites (Quantum Coffee, etc.)
- [ ] Add SEO metadata to all pages
- [ ] Implement slug ↔ ID resolution

**Validation**:
- All existing sites work through router
- URLs are human-readable (slugs, not IDs)
- Each page has proper metadata

### Phase 3: Content Tracking

**Goal**: System knows what player has and hasn't seen.

**Tasks**:
- [ ] Implement `ContentTracker` service
- [ ] Create `content_visits` table
- [ ] Create `visit_referrers` table
- [ ] Hook tracker into router navigation
- [ ] Add time-spent tracking (on navigate away)
- [ ] Implement `getUnseen()` queries
- [ ] Add engagement tracking

**Validation**:
- Navigate to pages, verify visits recorded
- Query unseen content, get correct results
- Referrer tracking works (search, direct, etc.)

### Phase 4: NPC Sharing

**Goal**: NPCs can share links that players engage with.

**Tasks**:
- [ ] Implement `NPCShareSystem`
- [ ] Create `npc_shares` table
- [ ] Implement `getShareOpportunities()`
- [ ] Inject share context into NPC AI prompts
- [ ] Parse NPC messages for markdown links
- [ ] Track engagement when player clicks shared links
- [ ] Relationship boost on engagement
- [ ] Add memories for shared content

**Validation**:
- NPC shares link in conversation
- Player clicks link, referrer tracked as `npc_share`
- Relationship stats increase
- NPC can reference shared content later

### Phase 5: Search Index

**Goal**: All content is searchable.

**Tasks**:
- [ ] Create `search_index` table
- [ ] Implement `SearchIndexer`
- [ ] Index all static content at startup
- [ ] Index dynamic content (NPC posts, news) on creation
- [ ] Implement keyword matching
- [ ] Implement fuzzy content matching
- [ ] Implement ranking algorithm
- [ ] Add freshness scoring
- [ ] Add popularity tracking

**Validation**:
- Search "quantum coffee" returns relevant results
- Results are properly ranked
- New NPC posts appear in search

### Phase 6: Search Engine (Goober)

**Goal**: Working in-game search engine.

**Tasks**:
- [ ] Register `goober.corn` site
- [ ] Implement GooberHome component
- [ ] Implement GooberResults component
- [ ] Implement search tabs (All, Images, Maps, News)
- [ ] Add "Did you mean?" suggestions
- [ ] Add related searches
- [ ] Add trending searches
- [ ] Style to match Google parody aesthetic

**Validation**:
- Search from Goober homepage
- Results display with proper formatting
- Clicking results navigates correctly
- Different result types show appropriately

### Phase 7: Ad Network

**Goal**: Contextual ads appear in search and on sites.

**Tasks**:
- [ ] Create `ads` table and related tables
- [ ] Implement `AdNetwork` service
- [ ] Add sponsored results to search
- [ ] Add display ad placements to sites
- [ ] Implement impression/click tracking
- [ ] Add budget depletion logic
- [ ] Create sample ads for existing businesses

**Validation**:
- Ads appear in search results
- Ads appear on content pages
- Clicking ads navigates to target
- Budget depletes with usage

### Phase 8: Polish & Integration

**Goal**: Everything works smoothly together.

**Tasks**:
- [ ] Browser back/forward navigation
- [ ] Browser tab management with URLs
- [ ] Browser bookmarks
- [ ] Browser history
- [ ] Deep link sharing (copy URL)
- [ ] Cross-surface link handling
- [ ] Content Delivery drop support
- [ ] Performance optimization (caching, lazy loading)

**Validation**:
- Full browser-like experience
- NPCs share links naturally
- Search finds everything
- Content drops work

---

## 12. Database Schema

### New Tables

```sql
-- Content visits (seen/unseen tracking)
CREATE TABLE content_visits (
  url TEXT PRIMARY KEY,
  first_seen_at INTEGER NOT NULL,
  last_seen_at INTEGER NOT NULL,
  visit_count INTEGER DEFAULT 1,
  time_spent INTEGER DEFAULT 0
);

-- Visit referrers
CREATE TABLE visit_referrers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  url TEXT NOT NULL,
  type TEXT NOT NULL,  -- 'direct', 'search', 'npc_share', etc.
  source TEXT,         -- NPC ID, search query, etc.
  timestamp INTEGER NOT NULL,
  FOREIGN KEY (url) REFERENCES content_visits(url)
);

-- NPC content shares
CREATE TABLE npc_shares (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  npc_id TEXT NOT NULL,
  player_id TEXT NOT NULL,
  url TEXT NOT NULL,
  shared_at INTEGER NOT NULL,
  engaged BOOLEAN DEFAULT FALSE,
  engaged_at INTEGER,
  UNIQUE(npc_id, player_id, url)
);

-- Search index
CREATE TABLE search_index (
  url TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  snippet TEXT,
  category TEXT NOT NULL,
  surface TEXT NOT NULL,
  source TEXT NOT NULL,
  keywords TEXT,        -- JSON array
  content TEXT,         -- Full text for fuzzy matching
  seo_score INTEGER DEFAULT 50,
  ad_bid REAL,
  published_at INTEGER,
  popularity REAL DEFAULT 0,
  indexed_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Full-text search virtual table
CREATE VIRTUAL TABLE search_fts USING fts5(
  url,
  title,
  snippet,
  keywords,
  content,
  content=search_index,
  content_rowid=rowid
);

-- Ads
CREATE TABLE ads (
  id TEXT PRIMARY KEY,
  advertiser TEXT NOT NULL,
  headline TEXT NOT NULL,
  description TEXT,
  display_url TEXT NOT NULL,
  target_url TEXT NOT NULL,
  image_url TEXT,
  bid_amount REAL NOT NULL,
  daily_budget REAL NOT NULL,
  remaining_budget REAL NOT NULL,
  start_date INTEGER,
  end_date INTEGER,
  created_at INTEGER NOT NULL
);

-- Ad keywords
CREATE TABLE ad_keywords (
  ad_id TEXT NOT NULL,
  keyword TEXT NOT NULL,
  PRIMARY KEY (ad_id, keyword),
  FOREIGN KEY (ad_id) REFERENCES ads(id)
);

-- Ad categories
CREATE TABLE ad_categories (
  ad_id TEXT NOT NULL,
  category TEXT NOT NULL,
  PRIMARY KEY (ad_id, category),
  FOREIGN KEY (ad_id) REFERENCES ads(id)
);

-- Ad impressions
CREATE TABLE ad_impressions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ad_id TEXT NOT NULL,
  placement_type TEXT NOT NULL,
  timestamp INTEGER NOT NULL,
  clicked BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (ad_id) REFERENCES ads(id)
);

-- Indexes
CREATE INDEX idx_visits_last_seen ON content_visits(last_seen_at);
CREATE INDEX idx_referrers_url ON visit_referrers(url);
CREATE INDEX idx_shares_npc ON npc_shares(npc_id, player_id);
CREATE INDEX idx_search_category ON search_index(category);
CREATE INDEX idx_search_source ON search_index(source);
CREATE INDEX idx_search_published ON search_index(published_at);
CREATE INDEX idx_ads_budget ON ads(remaining_budget);
```

---

## Summary

The Corn Stack transforms engAIge from "an app with some fake websites" into "a simulated internet." Every piece of content is addressable, searchable, trackable, and shareable.

The search engine (Goober) is the capstone that proves the system works - if you can search for anything and get meaningful results that open in the right apps, the internet simulation is complete.

Key principles:
1. **URLs are universal** - Everything has an address
2. **Payloads are self-contained** - URL resolves to everything needed to render
3. **Tracking enables discovery** - Know what's unseen to surface it
4. **NPCs are curators** - Social discovery through relationships
5. **Search is the proof** - If search works, the internet works
