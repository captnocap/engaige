# Site Content Schema Design

**Status**: Draft
**Created**: 2026-02-05

This document defines the database schema for storing all filler site content, the JSON authoring format, and the migration tool workflow.

---

## Goals

1. **Single source of truth** - All interactive/expandable site content lives in the database
2. **Easy authoring** - Content is written in JSON files, then migrated to DB
3. **Snapshot backups** - Every migration creates a restore point
4. **Type flexibility** - One schema serves videos, articles, products, posts, etc.
5. **Engagement tracking** - Views, likes, comments can be tracked per-content

---

## Database Schema

### Core Tables (add to `game.db`)

```sql
-- ============================================================================
-- SITE CONTENT SYSTEM
-- ============================================================================

-- Content creators/channels/authors (VidTube channels, blog authors, stores)
CREATE TABLE IF NOT EXISTS site_channels (
  id TEXT PRIMARY KEY,
  site_id TEXT NOT NULL,              -- 'vidtube', 'wikiknow', 'amaize', etc.
  slug TEXT NOT NULL,                 -- URL-friendly identifier
  name TEXT NOT NULL,

  -- Display
  avatar_emoji TEXT,                  -- Fallback emoji
  avatar_url TEXT,                    -- Image path

  -- Metadata (type-specific)
  description TEXT,
  metadata TEXT DEFAULT '{}',         -- JSON: subscribers, verified, etc.

  -- Stats
  follower_count INTEGER DEFAULT 0,
  content_count INTEGER DEFAULT 0,

  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch()),

  UNIQUE(site_id, slug)
);

-- All site content (videos, articles, products, posts, etc.)
CREATE TABLE IF NOT EXISTS site_content (
  id TEXT PRIMARY KEY,
  site_id TEXT NOT NULL,              -- 'vidtube', 'wikiknow', 'threadit', etc.
  content_type TEXT NOT NULL,         -- 'video', 'article', 'product', 'thread', 'listing'
  slug TEXT NOT NULL,                 -- URL-friendly identifier

  -- Hierarchy
  channel_id TEXT,                    -- FK to site_channels (for videos, products)
  parent_id TEXT,                     -- For nested content (subreddit → thread)
  category TEXT,                      -- Primary category

  -- Core content
  title TEXT NOT NULL,
  subtitle TEXT,                      -- Subheadline, tagline
  body TEXT,                          -- Main content (markdown, HTML, or plain text)
  summary TEXT,                       -- Short description/excerpt

  -- Media
  thumbnail_emoji TEXT,               -- Emoji fallback
  thumbnail_url TEXT,                 -- Image path
  media_urls TEXT DEFAULT '[]',       -- JSON array of additional media

  -- Type-specific metadata (flexible JSON)
  -- Videos: duration, views, likes, dislikes, transcript
  -- Products: price, currency, seller, rating, stock
  -- Articles: author, reading_time, sentiment
  -- Threads: upvotes, downvotes, flair
  metadata TEXT DEFAULT '{}',

  -- Search & Discovery
  tags TEXT DEFAULT '[]',             -- JSON array of tags
  entities TEXT DEFAULT '[]',         -- JSON array of named entities (people, places)
  keywords TEXT,                      -- Space-separated keywords for FTS

  -- Engagement (updated at runtime)
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  engagement_score REAL DEFAULT 0,

  -- Status
  is_featured INTEGER DEFAULT 0,
  is_pinned INTEGER DEFAULT 0,
  is_archived INTEGER DEFAULT 0,

  -- Timestamps
  published_at INTEGER,               -- When content was "published" (game time)
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch()),

  FOREIGN KEY (channel_id) REFERENCES site_channels(id),
  FOREIGN KEY (parent_id) REFERENCES site_content(id),
  UNIQUE(site_id, slug)
);

-- Content comments (extends existing comments table pattern)
-- Reuses existing `comments` table but with content_id instead of post_id
CREATE TABLE IF NOT EXISTS site_content_comments (
  id TEXT PRIMARY KEY,
  content_id TEXT NOT NULL,           -- FK to site_content
  parent_comment_id TEXT,             -- NULL for top-level
  root_comment_id TEXT,               -- Thread root
  thread_depth INTEGER DEFAULT 0,

  -- Author (can be predefined or player/NPC)
  author_id TEXT,                     -- NULL for predefined filler comments
  author_type TEXT,                   -- 'player', 'npc', 'filler'
  author_name TEXT NOT NULL,
  author_avatar TEXT,                 -- Emoji or URL

  content TEXT NOT NULL,

  -- Engagement
  like_count INTEGER DEFAULT 0,
  dislike_count INTEGER DEFAULT 0,

  -- Filler-specific
  is_creator INTEGER DEFAULT 0,       -- Comment from content creator

  -- Timestamps
  published_at INTEGER,               -- Display timestamp
  created_at INTEGER DEFAULT (unixepoch()),

  FOREIGN KEY (content_id) REFERENCES site_content(id),
  FOREIGN KEY (parent_comment_id) REFERENCES site_content_comments(id),
  FOREIGN KEY (root_comment_id) REFERENCES site_content_comments(id)
);

-- Categories/sections for sites
CREATE TABLE IF NOT EXISTS site_categories (
  id TEXT PRIMARY KEY,
  site_id TEXT NOT NULL,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon_emoji TEXT,
  parent_id TEXT,                     -- For nested categories
  sort_order INTEGER DEFAULT 0,

  created_at INTEGER DEFAULT (unixepoch()),

  FOREIGN KEY (parent_id) REFERENCES site_categories(id),
  UNIQUE(site_id, slug)
);

-- ============================================================================
-- MIGRATION TRACKING
-- ============================================================================

-- Track migration snapshots for restore points
CREATE TABLE IF NOT EXISTS content_migration_snapshots (
  id TEXT PRIMARY KEY,
  snapshot_name TEXT NOT NULL,
  description TEXT,

  -- What was migrated
  source_files TEXT NOT NULL,         -- JSON array of source file paths
  tables_affected TEXT NOT NULL,      -- JSON array of table names
  records_inserted INTEGER DEFAULT 0,
  records_updated INTEGER DEFAULT 0,
  records_deleted INTEGER DEFAULT 0,

  -- Backup file location
  backup_path TEXT NOT NULL,          -- Path to .sql or .db backup file

  -- Status
  status TEXT DEFAULT 'completed',    -- 'completed', 'failed', 'rolled_back'
  error_message TEXT,

  created_at INTEGER DEFAULT (unixepoch()),
  rolled_back_at INTEGER
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_site_content_site ON site_content(site_id);
CREATE INDEX IF NOT EXISTS idx_site_content_type ON site_content(content_type);
CREATE INDEX IF NOT EXISTS idx_site_content_channel ON site_content(channel_id);
CREATE INDEX IF NOT EXISTS idx_site_content_parent ON site_content(parent_id);
CREATE INDEX IF NOT EXISTS idx_site_content_category ON site_content(category);
CREATE INDEX IF NOT EXISTS idx_site_content_published ON site_content(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_site_content_featured ON site_content(is_featured, site_id);
CREATE INDEX IF NOT EXISTS idx_site_content_slug ON site_content(site_id, slug);

CREATE INDEX IF NOT EXISTS idx_site_channels_site ON site_channels(site_id);
CREATE INDEX IF NOT EXISTS idx_site_channels_slug ON site_channels(site_id, slug);

CREATE INDEX IF NOT EXISTS idx_site_comments_content ON site_content_comments(content_id);
CREATE INDEX IF NOT EXISTS idx_site_comments_parent ON site_content_comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_site_comments_root ON site_content_comments(root_comment_id);

CREATE INDEX IF NOT EXISTS idx_site_categories_site ON site_categories(site_id);
CREATE INDEX IF NOT EXISTS idx_site_categories_parent ON site_categories(parent_id);

CREATE INDEX IF NOT EXISTS idx_migration_snapshots_created ON content_migration_snapshots(created_at DESC);

-- Full-text search for content
CREATE VIRTUAL TABLE IF NOT EXISTS site_content_fts USING fts5(
  title,
  body,
  summary,
  keywords,
  content='site_content',
  content_rowid='rowid'
);
```

---

## JSON Authoring Format

Content is authored in JSON files in `server/data/content/{site_id}/`.

### Directory Structure

```
server/data/content/
├── vidtube/
│   ├── channels.json       # All VidTube channels
│   ├── videos/
│   │   ├── quantum-coffee-home.json
│   │   ├── trust-fall-47.json
│   │   └── ...
│   └── _migrated/          # Processed files moved here
├── wikiknow/
│   ├── categories.json
│   ├── articles/
│   │   ├── quantum-coffee.json
│   │   ├── great-meme-war.json
│   │   └── ...
│   └── _migrated/
├── threadit/
│   ├── subreddits.json     # Categories/communities
│   ├── threads/
│   │   └── ...
│   └── _migrated/
├── amaize/
│   ├── sellers.json        # Channels = sellers/stores
│   ├── products/
│   │   └── ...
│   └── _migrated/
└── blogs/
    ├── authors.json        # Blog authors as channels
    ├── posts/
    │   ├── derek-quantum-journey.json
    │   └── ...
    └── _migrated/
```

### Channel/Author Schema

```json
// server/data/content/vidtube/channels.json
{
  "$schema": "channel",
  "site_id": "vidtube",
  "channels": [
    {
      "slug": "quantumbrew",
      "name": "QuantumBrew",
      "avatar_emoji": "☕",
      "description": "The official channel for quantum coffee brewing techniques.",
      "metadata": {
        "subscribers": "2.4M",
        "verified": true,
        "joined": "2019-03-15"
      }
    },
    {
      "slug": "trustfalltim",
      "name": "TrustFallTim",
      "avatar_emoji": "🤸",
      "description": "I crowdsurf at inappropriate times.",
      "metadata": {
        "subscribers": "847K",
        "verified": false
      }
    }
  ]
}
```

### Video Content Schema

```json
// server/data/content/vidtube/videos/quantum-coffee-home.json
{
  "$schema": "content",
  "site_id": "vidtube",
  "content_type": "video",
  "slug": "quantum-coffee-home",

  "channel_slug": "quantumbrew",
  "category": "Science & Technology",

  "title": "I Tried Making Quantum Coffee at Home... It Changed My Life",
  "subtitle": null,
  "body": "Today I finally got my hands on a $3,000 home quantum coffee maker...",
  "summary": "A review of the Q-3000 home quantum coffee maker.",

  "thumbnail_emoji": "☕✨",
  "media_urls": [],

  "metadata": {
    "duration": "24:31",
    "views": "4.2M",
    "likes": "342K",
    "dislikes": "12K",
    "uploaded_at": "2 weeks ago",
    "transcript": "Hey everyone, welcome back to QuantumBrew..."
  },

  "tags": ["quantum coffee", "coffee", "science", "review"],
  "entities": ["Q-3000", "Big Quantum"],

  "published_at": "2026-01-22T14:30:00Z",

  "comments": [
    {
      "slug": "coffeeaddict-comment",
      "author_name": "CoffeeAddict2024",
      "author_avatar": "😴",
      "content": "Bruh I bought one after watching this. My wife left me but the coffee is incredible.",
      "like_count": 24500,
      "published_at": "1 week ago",
      "replies": [
        {
          "author_name": "QuantumBrew",
          "author_avatar": "☕",
          "content": "Worth it tbh",
          "like_count": 8934,
          "is_creator": true,
          "published_at": "1 week ago"
        }
      ]
    }
  ]
}
```

### Article Content Schema (WikiKnow, Blogs)

```json
// server/data/content/wikiknow/articles/quantum-coffee.json
{
  "$schema": "content",
  "site_id": "wikiknow",
  "content_type": "article",
  "slug": "quantum-coffee",

  "category": "Food & Drink",

  "title": "Quantum Coffee",
  "subtitle": "The controversial beverage phenomenon",
  "body": "**Quantum coffee** is a beverage preparation method...\n\n## History\n\n...",
  "summary": "Quantum coffee is a controversial beverage preparation method.",

  "thumbnail_emoji": "☕",

  "metadata": {
    "author": "Various Contributors",
    "last_edited": "2026-01-28",
    "reading_time_minutes": 8,
    "references": 12,
    "is_disputed": true
  },

  "tags": ["coffee", "pseudoscience", "beverages", "the underground"],
  "entities": ["Marcus Chen", "The Underground", "Dr. Elena Martinez"],

  "published_at": "2024-06-15T00:00:00Z"
}
```

### Product Content Schema (Amaize, BargainBay)

```json
// server/data/content/amaize/products/quantum-mug.json
{
  "$schema": "content",
  "site_id": "amaize",
  "content_type": "product",
  "slug": "quantum-mug",

  "channel_slug": "quantum-merch-store",
  "category": "Kitchen & Dining",

  "title": "Official Quantum Coffee Observation Mug",
  "subtitle": "Watch your coffee collapse its wave function",
  "body": "The official mug designed for optimal coffee observation...",
  "summary": "A specially designed mug for quantum coffee enthusiasts.",

  "thumbnail_emoji": "☕",
  "media_urls": ["/images/products/quantum-mug-1.jpg"],

  "metadata": {
    "price": 47.00,
    "currency": "USD",
    "original_price": 59.99,
    "rating": 4.7,
    "review_count": 847,
    "in_stock": true,
    "prime_eligible": true,
    "seller": "Quantum Merch Official"
  },

  "tags": ["mug", "coffee", "quantum", "gift"],

  "published_at": "2025-11-01T00:00:00Z"
}
```

### Thread Content Schema (Threadit, ForChan)

```json
// server/data/content/threadit/threads/witnessed-trust-fall.json
{
  "$schema": "content",
  "site_id": "threadit",
  "content_type": "thread",
  "slug": "witnessed-trust-fall",

  "parent_slug": "r/theunderground",
  "category": "The Underground",

  "title": "I witnessed Trust Fall Tim's 47th attempt last night",
  "body": "I was at the open mic night and this absolute legend...",
  "summary": null,

  "metadata": {
    "author": "UndergroundRegular",
    "flair": "Live Report",
    "upvotes": 2847,
    "downvotes": 12,
    "upvote_ratio": 0.99
  },

  "tags": ["trust fall tim", "open mic", "eyewitness"],

  "published_at": "2026-02-01T08:30:00Z",

  "comments": [
    {
      "author_name": "TFTFan001",
      "content": "I've been following his journey since attempt #12. This man is a legend.",
      "like_count": 456,
      "replies": []
    }
  ]
}
```

---

## Migration Tool

### CLI Interface

```bash
# Migrate all pending content
bun run migrate:content

# Migrate specific site
bun run migrate:content --site vidtube

# Migrate specific file
bun run migrate:content --file server/data/content/vidtube/videos/new-video.json

# Dry run (validate without inserting)
bun run migrate:content --dry-run

# List snapshots
bun run migrate:content --list-snapshots

# Restore from snapshot
bun run migrate:content --restore snapshot_2026-02-05_143022
```

### Migration Workflow

1. **Scan** - Find all `.json` files not in `_migrated/`
2. **Validate** - Check JSON schema, required fields, foreign key references
3. **Snapshot** - Create backup of affected tables
4. **Insert/Update** - Upsert records (match by `site_id + slug`)
5. **Archive** - Move processed files to `_migrated/`
6. **Log** - Record migration in `content_migration_snapshots`

### Snapshot Format

Snapshots are stored in `server/data/backups/content/`:

```
server/data/backups/content/
├── snapshot_2026-02-05_143022/
│   ├── manifest.json
│   ├── site_content.json
│   ├── site_channels.json
│   ├── site_content_comments.json
│   └── site_categories.json
```

---

## Site-Specific Mapping

| Site | content_type | channel_type | Parent Structure |
|------|--------------|--------------|------------------|
| VidTube | `video` | YouTube channels | None |
| WikiKnow | `article` | None (no channels) | Categories |
| Threadit | `thread` | None | Subreddits (via parent_id) |
| ForChan | `post` | None | Boards (via parent_id) |
| Amaize | `product` | Sellers/Stores | Categories |
| BargainBay | `listing` | Sellers | Categories |
| NestFinder | `listing` | Agents | None |
| Blogs | `post` | Blog authors | None |

---

## Existing Data Migration

### Phase 1: VidTube (Priority)
- Source: `src/config/vidtube-content.ts`
- Extract channels → `site_channels`
- Extract videos → `site_content` (type: video)
- Extract comments → `site_content_comments`

### Phase 2: News Lore (Already Done)
- Source: `server/data/news/lore/*.json`
- Already migrates to `news_articles` table
- Consider unifying with `site_content` or keeping separate

### Phase 3: WikiKnow
- Source: Embedded in `WikiKnowSite.tsx`
- Extract to JSON files first
- Migrate to `site_content` (type: article)

### Phase 4: Threadit
- Source: Embedded in `ThreaditSite.tsx`
- Extract subreddits as categories
- Extract threads → `site_content`
- Extract comments → `site_content_comments`

### Phase 5: Other Sites
- ForChan, Amaize, BargainBay, NestFinder, Blogs
- Lower priority, follow same pattern

---

## Frontend Integration

Sites query content via WebSocket:

```typescript
// Request
ws.send({
  type: 'site_content:list',
  site_id: 'vidtube',
  content_type: 'video',
  category: 'Science & Technology',
  limit: 20,
  offset: 0
})

// Response
{
  type: 'site_content:list',
  items: [...],
  total: 156,
  hasMore: true
}

// Get single item
ws.send({
  type: 'site_content:get',
  site_id: 'vidtube',
  slug: 'quantum-coffee-home'
})
```

---

## Open Questions

1. **News articles** - Keep separate `news_articles` table or unify with `site_content`?
   - Pros of separate: Already working, has NPC exposure tracking
   - Pros of unified: Single content system, consistent querying
   - **Recommendation**: Keep separate for now, consider view/alias later

2. **Real-time comments** - Player/NPC comments vs filler comments
   - Filler comments: Predefined in JSON, `author_type = 'filler'`
   - Dynamic comments: Created by game events, `author_type = 'player'|'npc'`
   - Same table, differentiated by `author_type`

3. **Content versioning** - Track edit history?
   - Not needed for filler content
   - Consider for player-generated content later

---

## Next Steps

1. [ ] Review and finalize schema
2. [ ] Add schema to `server/src/db/index.ts`
3. [ ] Create migration tool (`server/src/tools/content-migrate.ts`)
4. [ ] Extract VidTube content to JSON files
5. [ ] Run first migration with snapshot
6. [ ] Update VidTubeSite to query from database
7. [ ] Repeat for other sites
