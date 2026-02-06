---
name: engaige-world-seed
description: Complete world generation orchestrator for engAIge. Use when asked to "seed the world", "generate game content", "create starting state", "populate the game", "build the world", or "full content dump".
metadata:
  author: engAIge
  version: 2.0.0
  category: content-authoring
---

# engAIge World Seed Orchestrator

Generate a complete, interconnected world state for game initialization. Coordinates NPC creation, social content, conversations, and lore into a cohesive package.

## Overview

This skill orchestrates the generation of all content needed to make the game world feel alive from the moment a player starts:

1. **NPCs** - Cast of characters with personalities and relationships
2. **Social Posts** - Existing post histories across platforms
3. **Conversations** - Pre-existing chat logs between NPCs
4. **News/Lore** - Articles and world-building content
5. **Site Content** - Filler content for in-game websites (VidTube, Threadit, etc.)

## Content Types & Import Paths

Each content type has a different import mechanism. **Match the format exactly.**

| Content Type | DB / Table | Format | Import Path |
|-------------|-----------|--------|-------------|
| **Lore/News** | `game.db` / `news_articles` | camelCase JSON (NewsArticle interface) | Drop files in `server/data/news/lore/` — auto-loaded on server init |
| **Site Content** | `game.db` / `site_content` + `site_channels` + `site_categories` | snake_case JSON with `$schema` field | Drop files in `server/data/content/{site_id}/` — run `content-migrate.ts` |
| **NPCs** | `npc.db` / `npcs` | snake_case JSON matching DB columns | SQL INSERT or seed script |
| **Posts** | `game.db` / `posts` | snake_case JSON matching DB columns | SQL INSERT or seed script |
| **Conversations** | `game.db` / `conversations` + `messages` | snake_case JSON matching DB columns | SQL INSERT or seed script |

**See individual skill files for exact field schemas:**
- NPCs → `engaige-npc-seed` SKILL.md
- Posts → `engaige-post-author` SKILL.md
- Conversations → `engaige-conversation-author` SKILL.md
- Lore → `engaige-lore-author` SKILL.md

## World Seed Profiles

### Minimal Seed (Quick Start)
- 5-8 NPCs
- 3-5 posts per NPC
- 2-3 conversation threads
- 5 news articles
- Good for testing or minimal setup

### Standard Seed (Recommended)
- 15-20 NPCs
- 10-15 posts per NPC
- 8-12 conversation threads
- 15-20 news articles
- Balanced richness without overwhelming

### Rich Seed (Full Experience)
- 30+ NPCs
- 20+ posts per NPC
- 20+ conversation threads
- 30+ news articles
- Maximum immersion, longer generation time

## Generation Workflow

### Phase 1: Core NPCs
Generate the foundational cast. Output format: `engaige-npc-seed` schema.

1. **Anchor Characters** (3-5)
   - Strongly connected to lore (Derek, Trust Fall Tim's crowd, etc.)
   - Will be referenced by many others
   - Most developed backstories and system_prompts

2. **Social Hubs** (3-5)
   - High social connectivity
   - Know lots of people
   - Bridge different social clusters

3. **Cluster Members** (varies)
   - Fill out friend groups
   - Work colleagues
   - Hobby communities

4. **Outliers** (2-3)
   - Less connected characters
   - Different perspectives
   - Potential player friendship targets

### Phase 2: Relationship Web
Map connections between NPCs. Output as relationship metadata alongside NPC data.

```
[Work Cluster]
├── Alex (manager)
├── Jordan (coworker, friends with Alex)
└── Sam (new hire)

[Music Scene Cluster]
├── Maya (regular at The Underground)
├── Chris (knows Trust Fall Tim)
└── River (in a band)

[Bridge Characters]
├── Derek (coffee brings everyone together)
└── Taylor (knows everyone somehow)
```

### Phase 3: Content Generation
For each NPC, generate content using the correct skill formats:

1. **Post History** — Use `engaige-post-author` schema
   - Platform-appropriate content
   - Spans 30-90 days back (use real unix timestamps)
   - Mix of content types

2. **Conversation Threads** — Use `engaige-conversation-author` schema
   - With connected NPCs
   - Various relationship depths
   - Some ongoing, some concluded

### Phase 4: World Content
Generate supporting content:

1. **News Articles** — Use `engaige-lore-author` schema
   - Reference NPCs as background characters
   - Establish recent events
   - Set up ongoing mysteries
   - Drop as individual JSON files in `server/data/news/lore/`

2. **Site Content** — Use `content-migrate.ts` schema
   - VidTube videos, Threadit threads, WikiKnow articles, etc.
   - Use `$schema: "content"` format with proper `site_id` and `content_type`
   - Drop in `server/data/content/{site_id}/{content_type}/`

## Output Structure

```
server/data/
├── news/lore/                          # Lore articles (auto-loaded)
│   ├── {slug}.json                     # camelCase NewsArticle format
│   └── ...
├── content/{site_id}/                  # Site content (needs content-migrate.ts)
│   ├── channels.json                   # $schema: "channel"
│   ├── categories.json                 # $schema: "category"
│   └── {content_type}/
│       └── {slug}.json                 # $schema: "content"
└── seed/                               # Seed data (needs import script)
    ├── npcs/
    │   └── all-npcs.json               # Array of NPC objects
    ├── posts/
    │   └── all-posts.json              # Array of post objects
    └── conversations/
        └── all-conversations.json      # Array of conversation objects
```

## Import Order

**CRITICAL: Import in this order to satisfy foreign key references.**

1. **NPCs first** — Establishes NPC IDs that everything else references
2. **Conversations** — References NPC IDs as `npc_id` and `participant_id`
3. **Messages** — References conversation IDs
4. **Posts** — References NPC IDs as `npc_id`
5. **Lore articles** — Auto-loaded, can reference NPC names in content
6. **Site content** — Via `content-migrate.ts`, independent of NPCs

## ID Conventions

| Entity | Format | Example |
|--------|--------|---------|
| NPC ID | `firstname_lastname` (snake_case) | `maya_okonkwo` |
| Username | lowercase, underscores or dots | `maya_creates` |
| Lore slug | `kebab-case` | `hartwell-elevator-inspection` |
| Site content slug | `kebab-case` | `chaotic-garden-cooking` |

Post IDs, conversation IDs, and message IDs are auto-generated at import time using `generateId()`.

## Consistency Rules

### Timeline Coherence
- All content should reference a consistent timeline
- Events in posts should align with conversations
- News articles can set up events NPCs discuss
- Use real unix timestamps (seconds since epoch)

### Relationship Consistency
- If A says they're friends with B, B's content should reflect this
- Group activities mentioned by multiple participants
- No contradictory relationship states
- `system_prompt` should mention key relationships

### Lore Consistency
- Derek is ALWAYS into Quantum Coffee
- Hartwell Building is ALWAYS mysterious
- Trust Fall Tim's catch rate is 78.5%
- Neon Requiem broke up January 2024
- 847 appears as an Easter egg

## Example World Seed Request

User: "Generate a standard world seed focused on the local music scene"

Response would include:
- NPCs connected to The Underground (with full `system_prompt`, `personality_traits`, etc.)
- Band members, venue staff, regular attendees
- Posts about shows, music opinions, scene drama (with `npc_id`, `platform`, `created_at` timestamps)
- Conversations about upcoming events (with `npc_id`/`participant_id` structure)
- News about local music scene (with camelCase fields, in `server/data/news/lore/`)
- References to Neon Requiem nostalgia, Velvet Algorithms hiatus

## Publishing Workflow

After generating all content:

1. **Lore articles**: Already in correct location, auto-loaded on server restart
2. **Site content**: Run `bun run server/src/tools/content-migrate.ts` (do `--dry-run` first)
3. **NPCs/Posts/Conversations**: Need a seed import script or manual SQL insertion

For steps 1-2, use the `engaige-publisher` skill to validate and execute migrations.

## Quality Checklist

Before finalizing world seed:
- [ ] Each content type uses the correct format for its import path
- [ ] Lore = camelCase, Site content = `$schema` format, DB seeds = snake_case
- [ ] NPC relationship graph is connected (no isolated characters)
- [ ] All NPCs have `system_prompt` (NOT NULL requirement)
- [ ] Timeline is consistent across all content (real unix timestamps)
- [ ] Lore references are accurate
- [ ] Mix of content tones and topics
- [ ] No NPC is over-represented
- [ ] Player has natural entry points to social circles
- [ ] No fake/invented fields that don't exist in the DB
- [ ] All JSON is valid and importable
