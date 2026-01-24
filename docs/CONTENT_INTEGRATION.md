# Content Integration Architecture

How sites consume content from three sources: hardcoded, CDN-delivered, and NPC-generated.

---

## The Three Sources

```
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│    HARDCODED    │   │  CDN-DELIVERED  │   │  NPC-GENERATED  │
│   (baseline)    │   │   (drip feed)   │   │   (AI runtime)  │
├─────────────────┤   ├─────────────────┤   ├─────────────────┤
│ SAMPLE_THREADS  │   │ Signed JSON     │   │ AI creates post │
│ SAMPLE_ARTICLES │   │ from our server │   │ based on NPC    │
│ etc.            │   │                 │   │ personality     │
└────────┬────────┘   └────────┬────────┘   └────────┬────────┘
         │                     │                     │
         └──────────┬──────────┴──────────┬──────────┘
                    │                     │
                    ▼                     ▼
         ┌─────────────────────────────────────────┐
         │           CONTENT SERVICE               │
         │  Merges, dedupes, sorts by timestamp    │
         └─────────────────────────────────────────┘
                              │
                              ▼
         ┌─────────────────────────────────────────┐
         │              SITE COMPONENT             │
         │   const posts = useContent('threadit')  │
         └─────────────────────────────────────────┘
```

---

## Current State vs Target State

### Current (Hardcoded Only)

```typescript
// ThreaditSite.tsx
const SAMPLE_THREADS: Thread[] = [
  { id: 'thread-1', title: '...', ... },
  { id: 'thread-2', title: '...', ... },
];

function ThreaditSite() {
  // Uses SAMPLE_THREADS directly
  const threads = SAMPLE_THREADS.filter(t => ...);
}
```

### Target (Unified Content)

```typescript
// ThreaditSite.tsx
import { useThreaditContent } from '../../hooks/useContent';

// Keep hardcoded as fallback/baseline
const BASELINE_THREADS: Thread[] = [...];

function ThreaditSite() {
  // Merges hardcoded + CDN + NPC content
  const { threads, isLoading } = useThreaditContent(BASELINE_THREADS);

  const filtered = threads.filter(t => ...);
}
```

**Minimal change to sites** - just swap data source.

---

## Content Schemas

Each site type needs a defined schema. These match existing TypeScript interfaces.

### Schema Location

```
src/
├── schemas/
│   └── content/
│       ├── index.ts              # Re-exports all schemas
│       ├── threadit.ts           # Thread, Comment interfaces
│       ├── dailybuzz.ts          # NewsArticle interface
│       ├── bargainbay.ts         # Listing interface
│       ├── strangerzone.ts       # StrangerTemplate interface
│       ├── nestfinder.ts         # PropertyListing interface
│       ├── vidtube.ts            # Video interface
│       ├── forchan.ts            # ChanThread interface
│       ├── oddsoracle.ts         # PredictionMarket interface
│       ├── wikiknow.ts           # WikiArticle interface
│       ├── vitalityrx.ts         # Medication interface
│       └── wealthwisdom.ts       # FinanceArticle interface
```

### Example: Threadit Schema

**src/schemas/content/threadit.ts**
```typescript
// ============================================================================
// THREADIT CONTENT SCHEMA
// ============================================================================

export interface ThreadComment {
  id: string;
  author: string;
  authorFlair?: string;
  content: string;
  upvotes: number;
  timestamp: string;
  replies: ThreadComment[];  // Recursive
  isOP?: boolean;
  awards?: string[];
}

export interface Thread {
  id: string;
  subreddit: string;
  title: string;
  author: string;
  authorFlair?: string;
  content: string;
  flair?: string;
  upvotes: number;
  commentCount: number;
  timestamp: string;
  comments: ThreadComment[];
  awards?: string[];
  isPinned?: boolean;
  isLocked?: boolean;
}

// For CDN content, we wrap with metadata
export interface ThreaditContent {
  meta: ContentMeta;
  content: Thread;
}

// Shared metadata for all CDN content
export interface ContentMeta {
  id: string;
  site: 'threadit';
  type: 'thread';
  publishedAt: string;      // ISO timestamp
  expiresAt?: string;       // Optional expiration
  tags: string[];           // For filtering/searching
  source: 'hardcoded' | 'cdn' | 'npc';  // Added at merge time
}
```

### Example: DailyBuzz Schema

**src/schemas/content/dailybuzz.ts**
```typescript
export interface NewsArticle {
  id: string;
  headline: string;
  subheadline?: string;
  category: 'local' | 'tech' | 'entertainment' | 'politics' | 'business' | 'opinion';
  author: string;
  date: string;
  readTime: string;
  image?: string;
  content: string;           // Markdown-ish format
  tags: string[];
  relatedArticles: string[]; // IDs of related articles
  isBreaking?: boolean;
  isFeatured?: boolean;
}

export interface DailyBuzzContent {
  meta: ContentMeta;
  content: NewsArticle;
}
```

### Example: StrangerZone Schema

**src/schemas/content/strangerzone.ts**
```typescript
export type StrangerPersonality =
  | 'normal'
  | 'weird'
  | 'philosophical'
  | 'flirty'
  | 'conspiracy'
  | 'bot'
  | 'lore'
  | 'spooky';  // Seasonal

export interface StrangerTemplate {
  id: string;
  personality: StrangerPersonality;
  interests: string[];
  responses: string[];        // Ordered response sequence
  disconnectAfter?: number;   // Disconnect after N messages
  typingDelay: number;        // Base typing delay in ms
  weight?: number;            // Selection probability weight
}

export interface StrangerZoneContent {
  meta: ContentMeta;
  content: StrangerTemplate;
}
```

---

## Content Service

Central service that manages all content sources.

### Service Location

```
src/
├── services/
│   └── content/
│       ├── index.ts              # Main ContentService
│       ├── sources/
│       │   ├── hardcoded.ts      # Loads baseline content
│       │   ├── cdn.ts            # Fetches from CDN
│       │   └── npc.ts            # Gets NPC-generated content
│       ├── cache.ts              # Local storage/IndexedDB cache
│       └── merger.ts             # Combines and dedupes
```

### ContentService Interface

**src/services/content/index.ts**
```typescript
import { Thread } from '../../schemas/content/threadit';
import { NewsArticle } from '../../schemas/content/dailybuzz';
import { Listing } from '../../schemas/content/bargainbay';
// ... etc

type ContentType =
  | { site: 'threadit'; type: 'thread'; data: Thread }
  | { site: 'dailybuzz'; type: 'article'; data: NewsArticle }
  | { site: 'bargainbay'; type: 'listing'; data: Listing }
  // ... etc

interface ContentService {
  // Get all content for a site, merged from all sources
  getContent<T>(site: string, type: string): Promise<T[]>;

  // Subscribe to content updates (for real-time NPC content)
  subscribe(site: string, callback: (content: any[]) => void): () => void;

  // Force refresh from CDN
  refresh(): Promise<void>;

  // Check for new content
  checkForUpdates(): Promise<boolean>;

  // Get content stats
  getStats(): ContentStats;
}

interface ContentStats {
  hardcoded: number;
  cdn: number;
  npc: number;
  lastCdnSync: Date | null;
  lastNpcContent: Date | null;
}
```

### Implementation

**src/services/content/index.ts**
```typescript
import { getHardcodedContent } from './sources/hardcoded';
import { getCdnContent, refreshCdnContent } from './sources/cdn';
import { getNpcContent, subscribeToNpcContent } from './sources/npc';
import { mergeContent } from './merger';

class ContentServiceImpl implements ContentService {
  private listeners: Map<string, Set<(content: any[]) => void>> = new Map();

  async getContent<T>(site: string, type: string): Promise<T[]> {
    // 1. Get from all sources in parallel
    const [hardcoded, cdn, npc] = await Promise.all([
      getHardcodedContent(site, type),
      getCdnContent(site, type),
      getNpcContent(site, type),
    ]);

    // 2. Merge and dedupe (by ID)
    const merged = mergeContent<T>([
      ...hardcoded.map(c => ({ ...c, _source: 'hardcoded' })),
      ...cdn.map(c => ({ ...c, _source: 'cdn' })),
      ...npc.map(c => ({ ...c, _source: 'npc' })),
    ]);

    // 3. Sort by timestamp (newest first)
    return merged.sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  subscribe(site: string, callback: (content: any[]) => void): () => void {
    if (!this.listeners.has(site)) {
      this.listeners.set(site, new Set());
    }
    this.listeners.get(site)!.add(callback);

    // Also subscribe to NPC content updates
    const unsubNpc = subscribeToNpcContent(site, async () => {
      const content = await this.getContent(site, 'all');
      callback(content);
    });

    return () => {
      this.listeners.get(site)?.delete(callback);
      unsubNpc();
    };
  }

  async refresh(): Promise<void> {
    await refreshCdnContent();
    // Notify all listeners
    for (const [site, listeners] of this.listeners) {
      const content = await this.getContent(site, 'all');
      listeners.forEach(cb => cb(content));
    }
  }
}

export const contentService = new ContentServiceImpl();
```

---

## CDN Source

Fetches and caches content from our CDN.

**src/services/content/sources/cdn.ts**
```typescript
import { decryptAndVerifyContent } from '../../../server/src/services/content-crypto';

const CDN_BASE = 'https://content.engaige.game/v1';
const CACHE_KEY = 'engaige-cdn-content';

interface CdnCache {
  manifest: ContentManifest;
  content: Record<string, any>;
  lastSync: string;
}

// In-memory cache
let cache: CdnCache | null = null;

export async function getCdnContent(site: string, type: string): Promise<any[]> {
  // 1. Load cache if not loaded
  if (!cache) {
    cache = await loadCache();
  }

  // 2. Filter by site and type
  if (!cache) return [];

  return Object.values(cache.content)
    .filter(c => c.meta.site === site && (type === 'all' || c.meta.type === type))
    .filter(c => !isExpired(c))
    .map(c => c.content);
}

export async function refreshCdnContent(): Promise<void> {
  try {
    // 1. Fetch manifest
    const manifestRes = await fetch(`${CDN_BASE}/manifest.enc`);
    const manifestEnc = Buffer.from(await manifestRes.arrayBuffer());
    const manifestJson = await decryptAndVerifyContent(manifestEnc);
    const manifest: ContentManifest = JSON.parse(manifestJson);

    // 2. Determine what's new
    const currentIds = new Set(Object.keys(cache?.content || {}));
    const newItems = manifest.content.filter(c => !currentIds.has(c.id));

    // 3. Fetch new content
    const newContent: Record<string, any> = { ...cache?.content };

    await Promise.all(newItems.map(async (item) => {
      const res = await fetch(`${CDN_BASE}/content/${item.id}.enc`);
      const enc = Buffer.from(await res.arrayBuffer());
      const json = await decryptAndVerifyContent(enc);
      newContent[item.id] = JSON.parse(json);
    }));

    // 4. Update cache
    cache = {
      manifest,
      content: newContent,
      lastSync: new Date().toISOString(),
    };

    // 5. Persist to IndexedDB
    await saveCache(cache);

    console.log(`CDN sync complete: ${newItems.length} new items`);
  } catch (error) {
    console.error('CDN sync failed:', error);
    // Continue with stale cache
  }
}

function isExpired(content: any): boolean {
  if (!content.meta.expiresAt) return false;
  return new Date(content.meta.expiresAt) < new Date();
}

async function loadCache(): Promise<CdnCache | null> {
  // Load from IndexedDB
  const db = await openContentDB();
  return db.get('cache', CACHE_KEY);
}

async function saveCache(cache: CdnCache): Promise<void> {
  const db = await openContentDB();
  await db.put('cache', cache, CACHE_KEY);
}
```

---

## NPC Source

Gets content generated by NPCs at runtime.

**src/services/content/sources/npc.ts**
```typescript
// This connects to the game's NPC system via WebSocket
import { wsStore } from '../../../stores/wsStore';

const npcContentCache: Map<string, any[]> = new Map();
const listeners: Map<string, Set<() => void>> = new Map();

export async function getNpcContent(site: string, type: string): Promise<any[]> {
  // Request NPC content for this site from server
  const response = await wsStore.getState().request('npc:content:get', { site, type });

  if (response.success) {
    npcContentCache.set(`${site}:${type}`, response.content);
    return response.content;
  }

  return npcContentCache.get(`${site}:${type}`) || [];
}

export function subscribeToNpcContent(site: string, callback: () => void): () => void {
  if (!listeners.has(site)) {
    listeners.set(site, new Set());
  }
  listeners.get(site)!.add(callback);

  // Listen for WebSocket events about new NPC content
  const unsubscribe = wsStore.getState().on('npc:content:new', (data) => {
    if (data.site === site) {
      callback();
    }
  });

  return () => {
    listeners.get(site)?.delete(callback);
    unsubscribe();
  };
}
```

---

## React Hooks

Clean hooks for sites to consume content.

**src/hooks/useContent.ts**
```typescript
import { useState, useEffect, useMemo } from 'react';
import { contentService } from '../services/content';

interface UseContentOptions {
  refreshInterval?: number;  // Auto-refresh interval in ms
  includeExpired?: boolean;  // Include expired content (for debugging)
}

interface UseContentResult<T> {
  content: T[];
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  stats: {
    hardcoded: number;
    cdn: number;
    npc: number;
  };
}

export function useContent<T>(
  site: string,
  type: string,
  baseline: T[] = [],
  options: UseContentOptions = {}
): UseContentResult<T> {
  const [content, setContent] = useState<T[]>(baseline);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load content on mount
  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const data = await contentService.getContent<T>(site, type);
        if (mounted) {
          // Merge with baseline (baseline is fallback)
          const merged = mergeWithBaseline(data, baseline);
          setContent(merged);
          setIsLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err as Error);
          setContent(baseline);  // Fall back to baseline
          setIsLoading(false);
        }
      }
    }

    load();

    // Subscribe to updates
    const unsubscribe = contentService.subscribe(site, (newContent) => {
      if (mounted) {
        setContent(mergeWithBaseline(newContent, baseline));
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [site, type]);

  // Auto-refresh
  useEffect(() => {
    if (!options.refreshInterval) return;

    const interval = setInterval(() => {
      contentService.refresh();
    }, options.refreshInterval);

    return () => clearInterval(interval);
  }, [options.refreshInterval]);

  const refresh = async () => {
    setIsLoading(true);
    await contentService.refresh();
  };

  const stats = useMemo(() => ({
    hardcoded: content.filter((c: any) => c._source === 'hardcoded').length,
    cdn: content.filter((c: any) => c._source === 'cdn').length,
    npc: content.filter((c: any) => c._source === 'npc').length,
  }), [content]);

  return { content, isLoading, error, refresh, stats };
}

// Convenience hooks for specific sites
export function useThreaditContent(baseline: Thread[] = []) {
  return useContent<Thread>('threadit', 'thread', baseline);
}

export function useDailyBuzzContent(baseline: NewsArticle[] = []) {
  return useContent<NewsArticle>('dailybuzz', 'article', baseline);
}

export function useBargainBayContent(baseline: Listing[] = []) {
  return useContent<Listing>('bargainbay', 'listing', baseline);
}

export function useStrangerZoneContent(baseline: StrangerTemplate[] = []) {
  return useContent<StrangerTemplate>('strangerzone', 'stranger', baseline);
}

// ... etc for other sites
```

---

## Site Integration Example

### Before (ThreaditSite.tsx)

```typescript
const SAMPLE_THREADS: Thread[] = [
  { id: 'thread-1', ... },
  { id: 'thread-2', ... },
];

function ThreaditSite() {
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [selectedSubreddit, setSelectedSubreddit] = useState<string | null>(null);

  const filteredThreads = SAMPLE_THREADS.filter(t =>
    !selectedSubreddit || t.subreddit === selectedSubreddit
  );

  return (
    <div>
      {filteredThreads.map(thread => (
        <ThreadCard key={thread.id} thread={thread} />
      ))}
    </div>
  );
}
```

### After (ThreaditSite.tsx)

```typescript
import { useThreaditContent } from '../../hooks/useContent';

// Keep as baseline/fallback
const BASELINE_THREADS: Thread[] = [
  { id: 'thread-1', ... },
  { id: 'thread-2', ... },
];

function ThreaditSite() {
  const { content: threads, isLoading, stats } = useThreaditContent(BASELINE_THREADS);
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [selectedSubreddit, setSelectedSubreddit] = useState<string | null>(null);

  const filteredThreads = threads.filter(t =>
    !selectedSubreddit || t.subreddit === selectedSubreddit
  );

  return (
    <div>
      {/* Optional: Show content source indicator for debugging */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-500">
          Content: {stats.hardcoded} baseline, {stats.cdn} CDN, {stats.npc} NPC
        </div>
      )}

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        filteredThreads.map(thread => (
          <ThreadCard key={thread.id} thread={thread} />
        ))
      )}
    </div>
  );
}
```

**Changes required:**
1. Import hook
2. Rename `SAMPLE_THREADS` to `BASELINE_THREADS`
3. Replace direct usage with hook
4. Add loading state (optional)

---

## Content ID Strategy

To avoid collisions between sources:

| Source | ID Format | Example |
|--------|-----------|---------|
| Hardcoded | `{site}-baseline-{slug}` | `threadit-baseline-quantum-roommate` |
| CDN | `{site}-cdn-{slug}` | `threadit-cdn-trust-fall-ama` |
| NPC | `{site}-npc-{npcId}-{timestamp}` | `threadit-npc-abc123-1706234567` |

The merger dedupes by ID, so same content won't appear twice.

---

## Timestamp Strategy

All content needs timestamps for sorting. Different sources handle this differently:

| Source | Timestamp Handling |
|--------|-------------------|
| Hardcoded | Static, set at code time (e.g., "2 hours ago") |
| CDN | `publishedAt` in metadata, absolute ISO timestamp |
| NPC | Generated at creation time, absolute ISO timestamp |

The UI converts all to relative display ("2 hours ago").

---

## Migration Checklist

For each site:

- [ ] Extract TypeScript interfaces to `src/schemas/content/{site}.ts`
- [ ] Rename `SAMPLE_*` to `BASELINE_*`
- [ ] Create site-specific hook in `src/hooks/useContent.ts`
- [ ] Update site component to use hook
- [ ] Add loading state handling
- [ ] Test with baseline only (CDN disabled)
- [ ] Test with CDN content
- [ ] Test with NPC content (when available)

### Site Migration Order

1. **Threadit** - Most complex, good test case
2. **DailyBuzz** - Simple flat content
3. **BargainBay** - Has search, good test
4. **StrangerZone** - Different pattern (templates vs content)
5. **Remaining sites** - Follow established pattern

---

## CDN Content Examples

### Threadit Thread (CDN JSON)

```json
{
  "meta": {
    "id": "threadit-cdn-quantum-fda-megathread",
    "site": "threadit",
    "type": "thread",
    "publishedAt": "2026-01-25T14:00:00Z",
    "tags": ["quantum-coffee", "fda", "megathread"]
  },
  "content": {
    "id": "threadit-cdn-quantum-fda-megathread",
    "subreddit": "r/coffee",
    "title": "[MEGATHREAD] FDA Quantum Coffee Statement - Discussion",
    "author": "CoffeeMod847",
    "authorFlair": "Moderator",
    "content": "The FDA has released a statement regarding quantum coffee. Please keep all discussion in this thread.\n\n**Key Points:**\n- No official ban\n- 'Insufficient evidence' for health claims\n- Ongoing investigation\n\nBe civil. Rule 3 applies.",
    "flair": "Official",
    "upvotes": 8472,
    "commentCount": 847,
    "timestamp": "2026-01-25T14:00:00Z",
    "isPinned": true,
    "comments": [
      {
        "id": "comment-1",
        "author": "QuantumSkeptic",
        "content": "Finally, some official acknowledgment.",
        "upvotes": 1247,
        "timestamp": "2026-01-25T14:05:00Z",
        "replies": []
      }
    ]
  }
}
```

### DailyBuzz Article (CDN JSON)

```json
{
  "meta": {
    "id": "dailybuzz-cdn-fda-quantum-statement",
    "site": "dailybuzz",
    "type": "article",
    "publishedAt": "2026-01-25T12:00:00Z",
    "tags": ["quantum-coffee", "fda", "breaking"]
  },
  "content": {
    "id": "dailybuzz-cdn-fda-quantum-statement",
    "headline": "FDA Issues Statement on Quantum Coffee: 'Insufficient Evidence' for Health Claims",
    "subheadline": "Agency stops short of ban, announces ongoing investigation",
    "category": "local",
    "author": "Sandra Mitchell",
    "date": "January 25, 2026",
    "readTime": "4 min read",
    "content": "The Food and Drug Administration released a statement today regarding the increasingly popular 'quantum coffee' brewing method...",
    "tags": ["quantum coffee", "fda", "health", "local"],
    "relatedArticles": ["dailybuzz-baseline-quantum-cafe-opens"],
    "isBreaking": true,
    "isFeatured": true
  }
}
```

---

## Related Documentation

- [CONTENT_DELIVERY_SYSTEM.md](CONTENT_DELIVERY_SYSTEM.md) - High-level system design
- [CONTENT_DELIVERY_INFRASTRUCTURE.md](CONTENT_DELIVERY_INFRASTRUCTURE.md) - CDN and encryption
- [WORLD_LORE.md](WORLD_LORE.md) - Content guidelines and lore bible
- [FILLER_SITES.md](FILLER_SITES.md) - Site quality standards
