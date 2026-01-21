# Rare Spawn System Specification

## Overview

NPCs are assigned special "tools" (abilities that generate content) **after** their identity is created, completely independent of personality. This creates emergent, organic behavior where NPCs discover and use abilities naturally based on their personality, not because they're told they're "special."

## Design Principles

1. **Identity-first**: AI generates full personality before tools are assigned
2. **Blind assignment**: Tools assigned by rarity roll, not personality matching
3. **Hidden from NPC**: NPCs don't know their tools are special or unique
4. **Visible to player**: Player can see/edit tool assignments in developer mode
5. **Emergent use**: Personality colors *how* tools are used, not *whether* they exist

---

## Spawn Rarity Tiers

| Tier | Color | Probability | Description |
|------|-------|-------------|-------------|
| Common | Gray | 40% | High-frequency content generators |
| Uncommon | Green | 25% | Moderate content, slight specialization |
| Rare | Blue | 10% | Unique content types, lower frequency |
| Legendary | Purple | 2% | World-affecting content, very rare |
| Vanilla | White | 23% | No special tools, baseline NPC |

---

## Tool Definitions

### Common Tools

#### `blog_writer`
- **Output**: Personal blog posts on `quantumbrewblog.corn` or personal subdomain
- **Frequency**: 1-3 posts per in-game week
- **Content**: Life updates, opinions, rants, stories
- **Artifacts**: Blog entries visible in browser

#### `shitposter`
- **Output**: High-volume social media posts
- **Frequency**: 5-10x normal posting rate
- **Content**: Memes, hot takes, chaos, reply-guy behavior
- **Artifacts**: Chirp/MyFace posts, comment threads

### Uncommon Tools

#### `review_writer`
- **Output**: Reviews of in-game locations, sites, NPCs' content
- **Frequency**: 1-2 reviews per week
- **Content**: Star ratings, detailed opinions, recommendations
- **Artifacts**: Review posts, possible dedicated review blog

#### `photographer`
- **Output**: Styled/filtered photos with captions
- **Frequency**: 2-4 photos per week
- **Content**: Aesthetic shots, selfies, "photo dumps"
- **Artifacts**: InstaSnap posts, profile galleries
- **Special**: Access to `generate_styled_photo` with filter/style options

#### `poet_writer`
- **Output**: Short prose, poetry, dramatic captions
- **Frequency**: 1-2 pieces per week
- **Content**: Poems, flash fiction, emotional posts, fanfic snippets
- **Artifacts**: Blog entries, long-form social posts

### Rare Tools

#### `artist`
- **Output**: Generated artwork, portraits, drawings
- **Frequency**: 1-2 pieces per week
- **Content**: Original art, portraits of friends, fan art
- **Artifacts**: Image posts, may gift art to close NPCs
- **Special**: Access to `generate_artwork` with style parameters

#### `musician`
- **Output**: Song lyrics, album covers, playlist curation
- **Frequency**: 1 "release" per 2 weeks
- **Content**: Lyrics, album art, dedications to other NPCs
- **Artifacts**: BandsNotInTown page, music-related posts
- **Special**: Access to `generate_album_cover`, `generate_lyrics`

#### `conspiracy_poster`
- **Output**: Conspiracy theories, "connecting the dots"
- **Frequency**: 2-3 theories per week
- **Content**: Unhinged but internally consistent theories about game world
- **Artifacts**: StrangerZone posts, thread replies, "evidence" compilations
- **Special**: Access to `generate_conspiracy_thread`

#### `developer`
- **Output**: Personal websites, projects, tools
- **Frequency**: 1 site per month, updates weekly
- **Content**: Janky personal sites, hobby projects, friend tributes
- **Artifacts**: Browsable websites in the game
- **Special**: Access to `create_website` tool

### Legendary Tools

#### `journalist`
- **Output**: News articles about NPC events/drama
- **Frequency**: 1-2 articles per week
- **Content**: Reports on NPC relationships, events, trending topics
- **Artifacts**: DailyBuzz articles that enter the news feed loop
- **Special**: Access to `write_news_article`, can query NPC events

---

## Generation Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    NPC GENERATION FLOW                       │
└─────────────────────────────────────────────────────────────┘

Step 1: IDENTITY GENERATION (AI)
┌─────────────────────────────────────────────────────────────┐
│ Prompt AI to generate:                                       │
│ - Name, age, gender, occupation                             │
│ - Personality traits (Big Five, quirks)                     │
│ - Mental state, communication style                         │
│ - Interests, hobbies (generic, not tool-specific)           │
│ - Bio, backstory                                            │
│ - Relationship preferences                                  │
│                                                             │
│ AI has NO KNOWLEDGE of tool system at this stage            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
Step 2: RARITY ROLL (System)
┌─────────────────────────────────────────────────────────────┐
│ Roll against probability table:                             │
│                                                             │
│ function rollRarity(): SpawnRarity {                        │
│   const roll = Math.random() * 100                          │
│   if (roll < 2) return 'legendary'    // 0-2                │
│   if (roll < 12) return 'rare'        // 2-12               │
│   if (roll < 37) return 'uncommon'    // 12-37              │
│   if (roll < 77) return 'common'      // 37-77              │
│   return 'vanilla'                    // 77-100             │
│ }                                                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
Step 3: TOOL ASSIGNMENT (System)
┌─────────────────────────────────────────────────────────────┐
│ Based on rarity, randomly select tool from tier:            │
│                                                             │
│ const TOOL_POOLS = {                                        │
│   legendary: ['journalist'],                                │
│   rare: ['artist', 'musician', 'conspiracy_poster',         │
│          'developer'],                                      │
│   uncommon: ['review_writer', 'photographer', 'poet_writer'],│
│   common: ['blog_writer', 'shitposter'],                    │
│   vanilla: []                                               │
│ }                                                           │
│                                                             │
│ function assignTool(rarity: SpawnRarity): string | null {   │
│   const pool = TOOL_POOLS[rarity]                           │
│   if (pool.length === 0) return null                        │
│   return pool[Math.floor(Math.random() * pool.length)]      │
│ }                                                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
Step 4: PERSIST NPC (Database)
┌─────────────────────────────────────────────────────────────┐
│ Store NPC with metadata:                                    │
│                                                             │
│ {                                                           │
│   id: "npc_abc123",                                         │
│   // ... identity fields from AI ...                        │
│   spawn_rarity: "rare",                                     │
│   assigned_tool: "artist",                                  │
│   tool_config: {                                            │
│     style_preference: null,  // discovered through use      │
│     output_count: 0,                                        │
│     last_used: null                                         │
│   }                                                         │
│ }                                                           │
└─────────────────────────────────────────────────────────────┘
```

---

## Initial World Generation (30 NPCs)

### Guaranteed Slots (10 NPCs)
To ensure content variety, the first generation guarantees one of each tool type:

```typescript
const GUARANTEED_TOOLS = [
  'blog_writer',
  'shitposter',
  'review_writer',
  'photographer',
  'poet_writer',
  'artist',
  'musician',
  'conspiracy_poster',
  'developer',
  'journalist'
]
```

### Remaining 20 NPCs
Roll normally with rarity probabilities. Expected distribution:

| Type | Guaranteed | Expected Extra | Total |
|------|-----------|----------------|-------|
| Vanilla | 0 | ~5 | ~5 |
| Blogger | 1 | ~3 | ~4 |
| Shitposter | 1 | ~2 | ~3 |
| Reviewer | 1 | ~2 | ~3 |
| Photographer | 1 | ~1 | ~2 |
| Poet/Writer | 1 | ~1 | ~2 |
| Artist | 1 | ~1 | ~2 |
| Musician | 1 | ~0-1 | ~1-2 |
| Conspiracy | 1 | ~0-1 | ~1-2 |
| Developer | 1 | ~0-1 | ~1-2 |
| Journalist | 1 | ~0 | ~1 |

---

## Runtime: Tool Injection

When an NPC is prompted to take action, their tools are injected without fanfare:

```typescript
function buildNPCContext(npc: NPC): string {
  const baseContext = buildPersonalityContext(npc)

  // Inject tools silently - no "you're special" language
  const toolContext = npc.assigned_tool
    ? getToolInstructions(npc.assigned_tool)
    : ''

  return `${baseContext}\n\n${toolContext}`
}

function getToolInstructions(tool: string): string {
  // Neutral language - just capabilities, no specialness
  const instructions = {
    'artist': `
      You can create artwork. When you want to share something visual
      you've made, you can generate an image in your style.
      Available action: generate_artwork(subject, style, mood)
    `,
    'developer': `
      You can create simple websites. If you want to make a page about
      something you care about, you have the ability to do so.
      Available action: create_website(title, purpose, content_ideas)
    `,
    'blog_writer': `
      You have a personal blog where you can write longer posts about
      your thoughts and experiences.
      Available action: write_blog_post(title, content, tags)
    `,
    // ... etc
  }

  return instructions[tool] || ''
}
```

---

## Player Interface

### NPC Inspector (Normal Mode)
```
┌─────────────────────────────────────────┐
│ 👤 Alex Chen                            │
│ ─────────────────────────────────────── │
│ Age: 24 | Occupation: Barista           │
│                                         │
│ Personality: Anxious, Creative, Kind    │
│ Interests: Coffee, Art, Late nights     │
│                                         │
│ 🎨 Rare Spawn                           │
│ Has special abilities                   │
└─────────────────────────────────────────┘
```

### NPC Inspector (Developer Mode)
```
┌─────────────────────────────────────────┐
│ 👤 Alex Chen                     [Edit] │
│ ─────────────────────────────────────── │
│ Age: 24 | Occupation: Barista           │
│                                         │
│ Personality: Anxious, Creative, Kind    │
│ Interests: Coffee, Art, Late nights     │
│                                         │
│ ⚙️ Spawn Metadata                       │
│ ─────────────────────────────────────── │
│ Rarity: 🔵 Rare                         │
│ Tool: artist                     [🔄]   │
│                                         │
│ Tool Stats:                             │
│ - Times used: 12                        │
│ - Last used: 2 days ago                 │
│ - Artifacts created: 8                  │
│                                         │
│ [Reassign Tool ▼] [Remove Tool]         │
└─────────────────────────────────────────┘
```

---

## Database Schema

```sql
-- Add to npc table
ALTER TABLE npcs ADD COLUMN spawn_rarity TEXT DEFAULT 'vanilla';
ALTER TABLE npcs ADD COLUMN assigned_tool TEXT DEFAULT NULL;
ALTER TABLE npcs ADD COLUMN tool_config JSON DEFAULT '{}';

-- Track tool outputs
CREATE TABLE tool_artifacts (
  id TEXT PRIMARY KEY,
  npc_id TEXT NOT NULL,
  tool_type TEXT NOT NULL,
  artifact_type TEXT NOT NULL,  -- 'blog_post', 'artwork', 'website', etc.
  artifact_id TEXT NOT NULL,    -- Reference to actual content
  created_at INTEGER NOT NULL,
  metadata JSON DEFAULT '{}',

  FOREIGN KEY (npc_id) REFERENCES npcs(id)
);

-- Index for querying NPC outputs
CREATE INDEX idx_artifacts_npc ON tool_artifacts(npc_id);
CREATE INDEX idx_artifacts_type ON tool_artifacts(tool_type);
```

---

## Tool Output Examples

### Artist + Anxious Perfectionist Personality
```
NPC internally: "I made this drawing... it's not very good but maybe
I'll share it..."

Post: "um. i made this. it's kind of bad but whatever 🙈"
[Generated artwork attached - actually quite good]

Behavior: Deletes and reposts, adds self-deprecating captions
```

### Developer + Manic Depressive Personality
```
NPC internally: "I should finish that website... or start a new one..."

Output over time:
- Week 1: Creates ambitious site, posts excitedly
- Week 2: Site half-finished, stops mentioning it
- Week 3: Suddenly posts completed site at 3am
- Week 4: "thinking about rebuilding it from scratch"

Artifacts: Multiple half-done sites, occasional polished gems
```

### Shitposter + Introverted Personality
```
NPC internally: "I don't talk to people much but I have thoughts..."

Post frequency: Still high (tool drives this)
Content: Observational humor, "I saw someone do X today", lurker energy
Style: Posts a lot, replies rarely, mysterious presence
```

### Journalist + Conspiracy-Adjacent Personality
```
NPC internally: "I need to report the facts... but also LOOK at these
connections..."

Articles: Start factual, slowly add "coincidence?" asides
Behavior: Legitimate news mixed with suspicious pattern-finding
Output: News articles that blur the line between reporting and theory
```

---

## Future Considerations

### Multi-Tool NPCs
Could an NPC have multiple tools?
- Pro: More variety, "artist who also blogs"
- Con: Dilutes specialness, complicates balance
- **Decision**: V1 = single tool, evaluate later

### Tool Discovery Events
NPCs could "discover" they have abilities through narrative:
- Artist posts first artwork: "i... made something? idk"
- Developer's first site: "i accidentally learned html"
- **Decision**: Nice flavor, implement in V2

### Tool Inheritance/Spread
Could NPCs "teach" others their tools?
- **Decision**: No - keeps rarity meaningful, tools are innate

### Player Tools
Should the player have special tools?
- **Decision**: Player has ALL tools available, they're the protagonist
