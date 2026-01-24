# Content Delivery System

One-way broadcast of hand-crafted content from engAIge to players. Not multiplayer. Not social. Just a feed.

---

## Overview

```
┌─────────────────────────┐              ┌─────────────────────────┐
│   engAIge Content CDN   │  ─────────▶  │   Player's Local Game   │
│      (we host)          │   JSON feed  │     (subscribes)        │
│                         │              │                         │
│  - Static JSON files    │   one-way    │  - Polls periodically   │
│  - No user accounts     │   broadcast  │  - Caches locally       │
│  - No player data       │              │  - Merges with content  │
└─────────────────────────┘              └─────────────────────────┘
```

**This is NOT:**
- Multiplayer (see MULTIPLAYER_ARCHITECTURE.md)
- Player-to-player content sharing
- Analytics/telemetry collection
- Anything that requires player accounts

**This IS:**
- A public JSON feed anyone can consume
- One-way broadcast (we publish, they receive)
- Optional (players can disable)
- Additive (only adds content, never removes/modifies)

---

## Why This Exists

| Problem | Solution |
|---------|----------|
| Game feels static after a while | New content appears over time |
| Seasonal events need game updates | Push holiday content via feed |
| Story arcs take months to tell | Drip content weekly |
| Lore density grows with playerbase | Feed accumulates over years |
| Community shared experience | Everyone sees same content drops |

---

## Content Types

Any JSON that fits existing site schemas:

| Site | Content Types |
|------|---------------|
| Threadit | Posts, comments, threads |
| DailyBuzz | Articles, breaking news |
| BargainBay | Listings, seller profiles |
| NestFinder | Property listings |
| VidTube | Video entries, comments |
| ForChan | Threads, replies |
| StrangerZone | Stranger personas, conversation scripts |
| OddsOracle | Prediction markets, outcomes |
| WikiKnow | Articles, edits |
| VitalityRx | New medications |
| WealthWisdom | Guru articles, courses |
| *Any filler site* | Whatever that site's schema accepts |

---

## Feed Architecture

### Endpoint Structure

```
https://content.engaige.game/
├── /v1/manifest.json          # Master index of all content
├── /v1/feed.json              # Recent content (last 30 days)
├── /v1/sites/{site}/feed.json # Per-site feeds
├── /v1/content/{id}.json      # Individual content items
└── /v1/schema/{type}.json     # Content schemas (for validation)
```

### Manifest Format

The master index. Player fetches this to know what's available.

```json
{
  "version": "1",
  "generatedAt": "2026-01-24T12:00:00Z",
  "baseUrl": "https://content.engaige.game/v1",
  "content": [
    {
      "id": "hartwell-floor7-listing",
      "site": "nestfinder",
      "type": "listing",
      "publishedAt": "2026-01-20T00:00:00Z",
      "tags": ["hartwell", "mystery", "story-arc"],
      "checksum": "sha256:abc123..."
    },
    {
      "id": "quantum-coffee-fda-ruling",
      "site": "dailybuzz",
      "type": "article",
      "publishedAt": "2026-01-24T08:00:00Z",
      "tags": ["quantum-coffee", "breaking"],
      "checksum": "sha256:def456..."
    }
  ]
}
```

### Content Item Format

Individual content files. Schema varies by site/type.

```json
{
  "meta": {
    "id": "hartwell-floor7-listing",
    "version": "1",
    "site": "nestfinder",
    "type": "listing",
    "publishedAt": "2026-01-20T00:00:00Z",
    "expiresAt": null,
    "tags": ["hartwell", "mystery", "story-arc"],
    "requires": [],
    "checksum": "sha256:abc123..."
  },
  "content": {
    "title": "RARE: Floor 7 Unit, Hartwell Building",
    "price": 847,
    "priceType": "month",
    "bedrooms": 1,
    "bathrooms": 1,
    "description": "Unique opportunity. Previous tenant left suddenly...",
    "images": ["🏚️"],
    "amenities": ["Original fixtures", "Interesting mirrors", "Quiet neighbors"],
    "redFlags": ["Listing keeps disappearing", "Agent won't make eye contact"],
    "agent": {
      "name": "OMNICORP HOLDINGS",
      "phone": "Number disconnected"
    }
  }
}
```

---

## Client Integration

### Subscription Flow

```
1. Player enables "Live Content" in settings (opt-in)
2. Game stores subscription preference locally
3. Background service starts polling
4. Content cached to local SQLite
5. Sites query local cache + hardcoded + NPC content
6. Everything blends seamlessly
```

### Polling Strategy

```typescript
// Suggested intervals
const POLL_INTERVALS = {
  manifest: 6 * 60 * 60 * 1000,  // 6 hours - check for new content IDs
  content: 'on-demand',          // Fetch individual items when needed
  feed: 24 * 60 * 60 * 1000,     // 24 hours - bulk recent content
}
```

### Local Storage Schema

```sql
-- Content cache table (game.db)
CREATE TABLE content_feed (
  id TEXT PRIMARY KEY,
  site TEXT NOT NULL,
  type TEXT NOT NULL,
  published_at TEXT NOT NULL,
  fetched_at TEXT NOT NULL,
  expires_at TEXT,
  tags TEXT,  -- JSON array
  content TEXT NOT NULL,  -- JSON blob
  checksum TEXT NOT NULL,

  -- Indexes for querying
  INDEX idx_site (site),
  INDEX idx_published (published_at DESC)
);

-- Track what player has "seen" (for "new" badges)
CREATE TABLE content_seen (
  content_id TEXT PRIMARY KEY,
  seen_at TEXT NOT NULL
);
```

### Fetching Service

```typescript
// server/src/services/content-feed.ts

interface ContentFeedService {
  // Check for new content
  sync(): Promise<SyncResult>

  // Get content for a specific site
  getContentForSite(site: string): Promise<ContentItem[]>

  // Get all content with specific tags
  getContentByTags(tags: string[]): Promise<ContentItem[]>

  // Check if content is new (unseen)
  isNew(contentId: string): Promise<boolean>

  // Mark content as seen
  markSeen(contentId: string): Promise<void>

  // Clear expired content
  cleanup(): Promise<void>
}
```

### Site Integration

Sites blend feed content with other sources:

```typescript
// Example: ThreaditSite.tsx

function useThreaditPosts() {
  const hardcodedPosts = SAMPLE_POSTS;  // Always available
  const npcPosts = useNPCPosts('threadit');  // AI-generated
  const feedPosts = useFeedContent('threadit', 'post');  // From CDN

  // Merge and sort by date
  return [...hardcodedPosts, ...npcPosts, ...feedPosts]
    .sort((a, b) => b.timestamp - a.timestamp);
}
```

---

## Content Authoring

### Directory Structure (Our Side)

```
content-repo/  (separate git repo)
├── sites/
│   ├── threadit/
│   │   ├── quantum-roommate-update.json
│   │   ├── trust-fall-tim-ama.json
│   │   └── ...
│   ├── dailybuzz/
│   │   ├── fda-quantum-ruling.json
│   │   └── ...
│   └── ...
├── events/
│   ├── halloween-2026/
│   │   ├── strangerzone-spooky-strangers.json
│   │   ├── bargainbay-costume-listings.json
│   │   └── ...
│   └── ...
├── story-arcs/
│   ├── hartwell-revelation/
│   │   ├── 01-listing-appears.json
│   │   ├── 02-news-coverage.json
│   │   ├── 03-forum-speculation.json
│   │   └── ...
│   └── ...
└── manifest-generator.ts  # Builds manifest.json from content
```

### Publishing Pipeline

```
1. Author writes content JSON
2. Validate against schema
3. Commit to content repo
4. CI builds manifest.json
5. Deploy to CDN (S3, Cloudflare, etc.)
6. Players receive on next poll
```

### Content Guidelines

1. **Match site schemas exactly** - Content must fit existing site structures
2. **Use established lore** - Reference WORLD_LORE.md characters/topics
3. **Include tags** - For filtering and story arc tracking
4. **Set appropriate dates** - `publishedAt` controls when it appears
5. **No breaking changes** - Feed is additive only

---

## Event System

### Seasonal Events

Events have start/end dates. Content auto-appears and auto-expires.

```json
{
  "meta": {
    "id": "halloween-2026-spooky-stranger",
    "site": "strangerzone",
    "type": "stranger-persona",
    "publishedAt": "2026-10-25T00:00:00Z",
    "expiresAt": "2026-11-01T00:00:00Z",
    "tags": ["halloween", "seasonal", "event"]
  },
  "content": {
    "name": "Stranger",
    "type": "spooky",
    "responses": [
      "Have you been to the Hartwell Building lately?",
      "The mirrors are watching.",
      "Floor 7 is open tonight. Just tonight.",
      "🎃",
      "Stranger has disconnected"
    ]
  }
}
```

### Story Arcs

Multi-part narratives that unfold over time. Use `requires` for sequencing.

```json
{
  "meta": {
    "id": "hartwell-arc-03-forum-speculation",
    "requires": ["hartwell-arc-02-news-coverage"],
    "publishedAt": "2026-02-01T00:00:00Z",
    "tags": ["hartwell", "story-arc", "mystery"]
  }
}
```

Client shows content only after prerequisites are seen.

---

## Privacy & Security

### What We Collect

**Nothing.**

- No player accounts
- No analytics
- No telemetry
- No IP logging (use CDN with no logging)
- Public feed, no authentication

### Content Verification

Optional: Sign content with our public key so players can verify authenticity.

```json
{
  "meta": {
    "checksum": "sha256:abc123...",
    "signature": "ed25519:xyz789..."
  }
}
```

Player's game can verify signature matches our public key (shipped with game).

### Opt-In Only

```typescript
// Settings
{
  liveContent: {
    enabled: false,  // Off by default
    feedUrl: 'https://content.engaige.game/v1',  // Can be changed
    lastSync: null,
  }
}
```

---

## Separation from Multiplayer

| Aspect | Content Delivery | Multiplayer Mesh |
|--------|------------------|------------------|
| **Direction** | One-way (us → players) | Peer-to-peer |
| **Content source** | We author it | Players create it |
| **Player data** | None collected | Shared between peers |
| **Authentication** | None needed | Identity verification |
| **Purpose** | World-building, events | Social, NPC sharing |
| **Infrastructure** | Static CDN | P2P network |

These systems are completely independent. A player can:
- Use neither
- Use content delivery only
- Use multiplayer only
- Use both

---

## Implementation Phases

### Phase 1: Local Content Pool
- [ ] Create `server/data/content/` structure
- [ ] Build content loader service
- [ ] Integrate with one site (Threadit) as proof of concept
- [ ] Content blends with hardcoded content

### Phase 2: Remote Feed
- [ ] Set up CDN endpoint
- [ ] Build manifest generator
- [ ] Implement polling service
- [ ] Local caching in SQLite
- [ ] Settings UI for opt-in

### Phase 3: Events & Arcs
- [ ] Expiration handling
- [ ] Prerequisite chains
- [ ] "New" content badges
- [ ] Event calendar UI

### Phase 4: Full Integration
- [ ] All sites support feed content
- [ ] Content authoring tools
- [ ] Publishing pipeline
- [ ] Public content repo

---

## Example: A Week of Content

**Monday:**
- DailyBuzz: "Local Cafe Claims FDA Approved Quantum Coffee" (it didn't)
- Threadit: r/coffee explodes with debate

**Tuesday:**
- WikiKnow: Quantum Coffee article updated with "Controversy" section
- ForChan: /ck/ thread about FDA corruption

**Wednesday:**
- BargainBay: Quantum coffee machines listed "MUST SELL - FDA RAID IMMINENT"
- OddsOracle: "Quantum Coffee banned by end of month?" market opens

**Thursday:**
- VidTube: "I TRIED QUANTUM COFFEE BEFORE THE BAN" video appears
- StrangerZone: Strangers asking "you hear about the quantum coffee thing?"

**Friday:**
- DailyBuzz: "FDA Clarifies: We Never Said Anything About Quantum Coffee"
- Threadit: Conspiracy theories about the fake news

**The world reacts to itself. Players who check in throughout the week see a living story unfold.**

---

## Related Documentation

- [FILLER_SITES.md](FILLER_SITES.md) - Site quality standards
- [WORLD_LORE.md](WORLD_LORE.md) - Lore bible and cross-references
- [MULTIPLAYER_ARCHITECTURE.md](MULTIPLAYER_ARCHITECTURE.md) - Separate P2P system (not this)
