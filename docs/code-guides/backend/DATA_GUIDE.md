# Server Data (`/server/data/`)

This directory contains all data for engAIge: databases, content, media, backups, and world snapshots.

---

## 🗄️ The Three-Database System

engAIge uses **three separate SQLite databases** with different persistence rules:

| Database | Location | Persistence | Purpose |
|----------|----------|-------------|---------|
| **user.db** | `data/user/` | Permanent | Player profiles, settings, preferences, budget config |
| **npc.db** | `data/npc/` | Permanent | NPC definitions, personalities, behavior flags |
| **game.db** | `data/game/` | Resettable | Conversations, messages, posts, memories, relationships |

### Why Three Databases?

**Separation of Concerns:**
- **user.db** - Player data persists across all worlds
- **npc.db** - Character roster persists across worlds
- **game.db** - Game state can be reset without losing characters

**Benefits:**
- Reset world to start fresh (new game.db)
- Keep same NPCs across multiple timelines
- Experiment with different world states
- Create snapshots for parallel timelines

---

## 📂 Directory Structure

```
server/data/
├── backups/          # Database backups (auto-generated)
│   └── content/      # Content backups
├── content/          # Filler site content (20+ parody websites)
│   ├── amaize/       # Amazon parody
│   ├── askcorn/      # Yahoo Answers parody
│   ├── dailybuzz/    # News aggregator
│   ├── threadit/     # Reddit parody
│   └── ...           # 16+ more sites
├── game/             # game.db (resettable game state)
├── media/            # User-generated media files
├── news/             # News feed content
│   └── lore/         # Hand-crafted lore articles
├── npc/              # npc.db (persistent NPCs)
├── scene-seeds/      # Drama automation seeds
│   ├── antagonist/   # Conflict scenarios
│   ├── chain/        # Multi-step scenarios
│   ├── romantic/     # Romance scenarios
│   ├── social/       # Social scenarios
│   └── wildcard/     # Random scenarios
├── user/             # user.db (persistent player data)
└── worlds/           # World snapshots
```

---

## 💾 Database Details

### user.db (Persistent)

**Location:** `data/user/`

**Tables:**
- `players` - Player profiles (name, avatar, bio)
- `player_settings` - Settings (theme, content rating, notifications)
- `budget_config` - Budget allocations and limits
- `onboarding_state` - Onboarding progress
- `personality_test_results` - Player personality assessment

**Never Reset:** Player data persists forever.

**Backup:** Auto-backed up on significant changes.

---

### npc.db (Persistent)

**Location:** `data/npc/`

**Tables:**
- `npcs` - NPC definitions (id, name, age, avatar)
- `npc_personalities` - Personality traits (OCEAN model + quirks)
- `npc_interests` - Topic interests (25+ topics with 0-1 intensity)
- `npc_behavior` - Behavior flags (can_post, can_initiate, etc.)
- `npc_fallbacks` - Pre-generated fallback responses (17 per NPC)
- `npc_profiles` - MyFace profile data (bio, theme, song)

**Never Reset:** NPC roster persists across worlds.

**Why Persistent?**
- Keep beloved NPCs across multiple playthroughs
- Transfer NPCs between worlds
- Build a collection of characters

**Documentation:** [NPC_PERSONALITY_SYSTEM.md](../../docs/completed/NPC_PERSONALITY_SYSTEM.md)

---

### game.db (Resettable)

**Location:** `data/game/`

**Tables:**
- `conversations` - Conversation threads
- `messages` - Individual messages
- `memories` - NPC memory bank
- `npc_relationships` - Relationship stats (trust, affinity, familiarity)
- `social_posts` - Social media posts
- `comments` - Threaded comments
- `likes` - Post likes
- `shares` - Post shares
- `stories` - InstaSnap stories
- `saved_posts` - Saved posts
- `hashtags` - Hashtag tracking
- `event_log` - Event bus log
- `error_log` - Error log
- `budget_log` - AI cost tracking
- `ai_queue_log` - AI request queue log

**Reset Conditions:**
- Start new world
- Restore snapshot
- Manual reset

**Why Resettable?**
- Experiment with different storylines
- Start fresh without losing NPCs
- Create parallel timelines

**Snapshot Support:** game.db can be snapshotted to `/worlds/` for later restoration.

---

## 🌐 Content Directory (`/content/`)

Contains content for **20+ filler sites** (parody websites that NPCs reference).

### Filler Sites

| Directory | Site Name | Parody Of | Purpose |
|-----------|-----------|-----------|---------|
| **amaize** | AmAIze | Amazon | E-commerce |
| **askcorn** | AskCorn | Yahoo Answers | Q&A forum |
| **bandsnotintown** | Bands Not In Town | Bandsintown | Music events |
| **bargainbay** | BargainBay | eBay | Auctions |
| **benchwatch** | BenchWatch | Overwatch/League | Gaming stats |
| **blogs** | Various Blogs | Tumblr/Medium | Personal blogs |
| **cobcoin** | CobCoin | Crypto exchanges | Cryptocurrency |
| **corndr** | CornDr | WebMD | Health info |
| **cornhub** | CornHub | GitHub | Developer tutorials |
| **dailybuzz** | DailyBuzz | Buzzfeed | News aggregator |
| **dominate** | DomInate | DoorDash | Food delivery |
| **forchan** | /4/Chan | 4chan | Imageboard |
| **nestfinder** | NestFinder | Zillow | Real estate |
| **oddsoracle** | OddsOracle | PredictIt | Prediction markets |
| **onlyfans** | OnlyFans | OnlyFans | Content subscriptions |
| **stationsushi** | Station Sushi | Yelp | Restaurant reviews |
| **threadit** | Threadit | Reddit | Link aggregator |
| **truemoss** | TrueMoss | RateMyProfessors | Professor ratings |
| **vidtube** | VidTube | YouTube | Video platform |
| **wikiknow** | WikiKnow | Wikipedia | Encyclopedia |

### Content Structure

Each site has JSON files defining:
- **Articles/Posts** - Content NPCs reference
- **Comments** - User discussions
- **Metadata** - Authors, timestamps, view counts

**Example: WikiKnow Article**
```json
{
  "title": "Quantum Coffee Brewing",
  "url": "wikiknow.corn/Quantum_Coffee_Brewing",
  "content": "Quantum coffee brewing is a pseudoscientific method...",
  "author": "WikiKnow Editor",
  "last_edited": "2024-01-15",
  "views": 84700,
  "citations": 23
}
```

**Quality Rule: NO DEAD ENDS**
- If it looks clickable, it MUST work
- Show what you claim (no "847 comments" with empty section)
- Depth over shortcuts (20 interconnected pages > 1 shallow page)

**Documentation:** [FILLER_SITES.md](../../docs/FILLER_SITES.md)

---

## 📰 News Directory (`/news/`)

Contains news feed content.

### Structure

```
news/
├── lore/             # Hand-crafted lore articles
│   ├── quantum_coffee_craze.json
│   ├── hartwell_building_mystery.json
│   └── trust_fall_tim_record.json
└── generated/        # AI-generated articles (future)
```

### Lore Articles

Hand-crafted articles about key lore pillars:
- **Quantum Coffee** - $47/cup pseudoscience craze
- **The Hartwell Building** - Missing 13th floor mystery
- **Trust Fall Tim** - 2,847 documented falls
- **The Underground** - Music venue

**Documentation:**
- [NEWS_FEED_SYSTEM.md](../../docs/completed/NEWS_FEED_SYSTEM.md)
- [WORLD_LORE.md](../../docs/WORLD_LORE.md)

---

## 🎬 Scene Seeds Directory (`/scene-seeds/`)

Drama automation scenarios for NPCs.

### Categories

| Category | Purpose | Example |
|----------|---------|---------|
| **antagonist** | Conflict scenarios | NPC insults player's favorite band |
| **chain** | Multi-step scenarios | NPC asks favor → player helps → NPC reciprocates |
| **romantic** | Romance scenarios | NPC flirts, asks on date |
| **social** | Social scenarios | NPC shares funny story, asks opinion |
| **wildcard** | Random scenarios | NPC has weird dream, conspiracy theory |

### Seed Structure

```json
{
  "id": "romantic_first_date",
  "category": "romantic",
  "min_relationship": 40,
  "personality_requirements": {
    "extraversion": ">0.5"
  },
  "prompt": "You want to ask the player on a casual first date...",
  "expected_tone": "nervous, hopeful, casual"
}
```

**Documentation:** [SCENE_SEED_SYSTEM.md](../../docs/SCENE_SEED_SYSTEM.md)

---

## 🖼️ Media Directory (`/media/`)

User-generated media files (images, videos, audio).

### Structure

```
media/
├── avatars/          # NPC and player avatars
├── posts/            # Social media post images
├── messages/         # Message attachments
└── generated/        # AI-generated images
```

### File Naming

```
{type}_{id}_{timestamp}.{ext}

Examples:
avatar_npc_abc123_1704067200.png
post_post_xyz789_1704067300.jpg
message_msg_def456_1704067400.png
```

### Storage

- **Local Development:** Files stored in `server/data/media/`
- **Production:** Could be moved to S3/CDN (future)

**Documentation:** [FILES_SYSTEM.md](../../docs/FILES_SYSTEM.md)

---

## 💾 Backups Directory (`/backups/`)

Auto-generated database backups.

### Backup Schedule

- **Daily** - Automatic daily backup
- **Pre-Reset** - Before world reset
- **Pre-Restore** - Before snapshot restore
- **Manual** - User-triggered

### Backup Format

```
backups/
├── user_2024-01-20_12-00-00.db
├── npc_2024-01-20_12-00-00.db
├── game_2024-01-20_12-00-00.db
└── content/
    └── 2024-01-20_12-00-00/
        ├── dailybuzz/
        ├── threadit/
        └── ...
```

### Retention Policy

- **Keep Last 7 Daily** - 7 days of daily backups
- **Keep Last 4 Weekly** - 4 weeks of weekly backups
- **Keep Last 12 Monthly** - 12 months of monthly backups
- **Pre-Action Backups** - Keep forever

---

## 🌍 Worlds Directory (`/worlds/`)

World snapshots for parallel timelines.

### Structure

```
worlds/
└── {world_id}/
    ├── game.db          # Game state snapshot
    ├── metadata.json    # World info (name, date, description)
    └── media/           # Media files for this world
```

### Metadata

```json
{
  "id": "world_abc123",
  "name": "Original Timeline",
  "description": "First playthrough with Derek and Elena",
  "created_at": "2024-01-20T12:00:00Z",
  "npc_count": 12,
  "message_count": 1847,
  "post_count": 234
}
```

### Use Cases

- **Save Points** - Create snapshot before major decision
- **Parallel Timelines** - Explore different storylines
- **Experimentation** - Try different NPC relationships
- **Sharing** - Export world to share with others

**Documentation:** [FILES_SYSTEM.md](../../docs/FILES_SYSTEM.md) (Export/Import)

---

## 🎯 Database Operations

### Accessing Databases

```typescript
import { getDB } from "../db/index.js";

// Auto-initializes if needed
const userDB = getDB("user");
const npcDB = getDB("npc");
const gameDB = getDB("game");
```

### Resetting game.db

```typescript
import { resetGameDB } from "../services/world.js";

// Creates backup, then resets
await resetGameDB();
```

### Creating Snapshot

```typescript
import { createSnapshot } from "../services/world.js";

// Snapshot current game state
const snapshotId = await createSnapshot("My Save Point");
```

### Restoring Snapshot

```typescript
import { restoreSnapshot } from "../services/world.js";

// Restore previous game state
await restoreSnapshot(snapshotId);
```

---

## 🚦 Best Practices

### Database Access

**DO:**
```typescript
// Use getDB() - auto-initializes
const db = getDB("game");
const messages = db.query("SELECT * FROM messages WHERE conversation_id = ?", [id]).all();
```

**DON'T:**
```typescript
// ❌ Don't manually open databases
const db = new Database("server/data/game/game.db");
```

### Content Files

**DO:**
```json
{
  "title": "Quantum Coffee Craze",
  "content": "Full article text here...",
  "metadata": {
    "author": "DailyBuzz Staff",
    "views": 84700
  }
}
```

**DON'T:**
```json
{
  "title": "Article",
  "content": "Lorem ipsum..."  // ❌ No lazy placeholders
}
```

### Media Files

**DO:**
```typescript
// Use media service
import { saveMedia } from "../services/media.js";

const filePath = await saveMedia(buffer, {
  type: "avatar",
  entity_id: npcId
});
```

**DON'T:**
```typescript
// ❌ Don't manually write files
fs.writeFileSync("server/data/media/image.png", buffer);
```

---

## 📊 Database Schema

See database schemas in `/server/src/db/schemas.ts`:

- `user.db` schema
- `npc.db` schema
- `game.db` schema

**Example: messages table**
```sql
CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  sender TEXT NOT NULL,  -- 'player' or npc_id
  content TEXT NOT NULL,
  timestamp INTEGER NOT NULL,
  word_count INTEGER,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id)
);
```

---

## 📚 Documentation

- [GAME_SYSTEMS.md](../../docs/GAME_SYSTEMS.md) - Complete game overview
- [ARCHITECTURE.md](../../docs/ARCHITECTURE.md) - High-level architecture
- [FILLER_SITES.md](../../docs/FILLER_SITES.md) - Content sites
- [WORLD_LORE.md](../../docs/WORLD_LORE.md) - Fictional universe
- [NEWS_FEED_SYSTEM.md](../../docs/completed/NEWS_FEED_SYSTEM.md) - News aggregation
- [FILES_SYSTEM.md](../../docs/FILES_SYSTEM.md) - Export/import

---

## 🤝 Contributing

When working with data:

1. **Never manually edit databases** - Use services
2. **Use getDB() for access** - Auto-initialization
3. **Respect persistence rules** - Don't reset user.db or npc.db
4. **NO DEAD ENDS in content** - All links must work
5. **Follow content quality rules** - Depth over shortcuts
6. **Use media service for files** - Don't manually write
7. **Backup before risky operations** - Create snapshots
