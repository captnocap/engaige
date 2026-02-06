---
name: engaige-lore-author
description: Author news articles and world lore for engAIge. Use when asked to "create news", "write articles", "generate lore", "seed news feed", "create DailyBuzz content", "write world building", or "fill news database".
metadata:
  author: engAIge
  version: 2.0.0
  category: content-authoring
---

# engAIge Lore & News Author

Generate news articles, lore entries, and world-building content that makes the game world feel lived-in and rich with history.

## Import Path

Lore articles are JSON files placed in `server/data/news/lore/`. The server auto-loads them on initialization via `newsFeedService.loadLoreArticles()`. The loader parses them as `Partial<NewsArticle>` using **camelCase** field names.

**File naming:** `kebab-case-slug.json` (filename becomes the slug fallback if `slug` field is omitted).

## Output Format

**CRITICAL:** Field names MUST be camelCase to match the `NewsArticle` TypeScript interface. The loader reads these directly.

```json
{
  "slug": "unique-kebab-case-slug",
  "headline": "Article Headline Here",
  "subheadline": "Optional secondary headline for context",
  "summary": "1-2 sentence summary for feed previews.",
  "content": "Full article content in markdown. Can be multiple paragraphs.\n\nQuotes, lists, and formatting are fine.",
  "category": "local",
  "author": "Byline Name, Optional Title",
  "tags": ["topic", "tags", "here"],
  "entities": ["Person Name", "Place Name", "Organization"],
  "sentiment": "positive",
  "imageEmoji": "☕"
}
```

### Field Reference

| Field | Required | Type | Notes |
|-------|----------|------|-------|
| `slug` | Yes | string | Kebab-case, unique. Also used as filename. |
| `headline` | **Yes** | string | Article title. Punchy, specific. |
| `subheadline` | No | string | Secondary headline/deck. |
| `summary` | **Yes** | string | 1-2 sentences for feed display. |
| `content` | **Yes** | string | Full article body in markdown. |
| `category` | Yes | string | One of: `local`, `tech`, `entertainment`, `politics`, `business`, `opinion`, `sports`, `science`, `lifestyle` |
| `author` | Yes | string | Byline. Defaults to "DailyBuzz Staff" if omitted. |
| `tags` | Yes | string[] | Topic tags for search/matching. |
| `entities` | Yes | string[] | Named entities: people, places, organizations mentioned. |
| `sentiment` | No | string | `positive`, `negative`, or `neutral` |
| `imageEmoji` | No | string | Fallback emoji if no image (e.g. "☕", "🏢") |
| `publishedAt` | No | number | Unix timestamp (seconds). **Defaults to current time if omitted.** |

### Fields That Do NOT Exist

Do NOT include these — they will be ignored or cause errors:
- ~~`published_offset_days`~~ — Not a real field. Use `publishedAt` (unix timestamp) or omit to default to now.
- ~~`image_emoji`~~ — Wrong case. Use `imageEmoji` (camelCase).
- ~~`image_url`~~ — Wrong case. Use `imageUrl` (camelCase).
- ~~`source`~~ — Auto-set to `'user'` by the loader.
- ~~`id`~~ — Auto-generated.

## Established World Lore

CRITICAL: Reference and expand on existing lore pillars. DO NOT contradict established canon.

### Quantum Coffee
- Pseudoscience brewing methodology
- $47 per cup (yes, really)
- Derek is obsessed with it
- The Martinez Study (unverified) claims cognitive benefits
- Multiple competing theories on optimal brewing

### Hartwell Building
- Missing 13th floor (officially "doesn't exist")
- Floor 7 has mirrors that "don't reflect right"
- Omnicorp Holdings owns it (mysterious corporation)
- Built in 1923, architect died under strange circumstances
- Urban legends abound

### The Underground
- Music venue owned/operated by Mars
- Relocated from near Hartwell Building (suspicious timing)
- Hosts Trust Fall Tim's events
- Known for eclectic booking (Velvet Algorithms, Neon Requiem)

### Trust Fall Tim
- 2,847 documented trust falls (and counting)
- 78.5% catch rate
- "The Incident" involving Small Kevin (details fuzzy)
- Local legend, divisive figure
- Hosts events at The Underground

### Velvet Algorithms
- Existential electronic duo
- Currently on "meditation hiatus"
- Cult following
- Lyrics about consciousness and technology

### Neon Requiem
- Post-punk legends
- Broke up January 2024
- Legendary final show
- Bitter fanbase debates reunion possibilities

### The Number 847
- Running Easter egg throughout the world
- Derek's 847 trials
- TFT's 2,847 falls
- Use in addresses, statistics, prices

## Article Categories

### Local News
- Community events, small business stories, human interest pieces
- Example: "Hartwell Building Tour Guide Quits After 'Mirror Incident'"

### Tech
- App launches, startup drama, privacy concerns, AI developments
- Example: "New Dating App Claims 847% Better Matches Using 'Quantum Compatibility'"

### Entertainment
- Band news, movie reviews (in-universe), celebrity gossip, event announcements
- Example: "Velvet Algorithms Spotted at Meditation Retreat, Fans Hopeful"

### Business
- Corporate moves, Omnicorp Holdings updates (always slightly ominous)
- Example: "Omnicorp Holdings Acquires Third Coffee Shop Near Hartwell Building"

### Opinion
- Hot takes, editorials, letters to editor, reviews
- Example: "Opinion: Trust Fall Tim Has Fallen Too Far"

### Sports / Science / Lifestyle
- Available but used sparingly for variety

## Writing Style Guidelines

### Headlines
- Punchy and specific
- Can be slightly absurd (this is a game world)
- Reference established characters when relevant
- Avoid clickbait phrasing

### Content
- Professional news voice (mostly)
- Can include quotes from fictional people
- Reference other articles/events for interconnectedness
- Mix serious and absurd seamlessly

### Tone Spectrum
- Straight news (70%): Professional, factual-seeming
- Quirky (20%): Slightly offbeat, charming
- Surreal (10%): Hartwell-level weird, played straight

## Interconnected Content

Great lore creates a web of references:

1. **Character crossovers** - Derek writes a letter to the editor about Quantum Coffee
2. **Event chains** - Trust Fall Tim's event leads to follow-up coverage
3. **Mystery breadcrumbs** - Hartwell stories that hint at larger patterns
4. **NPC mentions** - Game NPCs appear in news as background characters

## Example Article (DB-Ready)

```json
{
  "slug": "hartwell-elevator-inspection-delayed",
  "headline": "Hartwell Building Elevator Inspection Delayed for 847th Time",
  "subheadline": "City inspectors blame 'scheduling conflicts' as biannual check postponed again",
  "summary": "City inspectors cite 'scheduling conflicts' as annual inspection postponed again.",
  "content": "The Hartwell Building's biannual elevator inspection has been rescheduled once again, marking the 847th delay since records began in 1952.\n\n\"We've had some scheduling conflicts,\" said City Inspector Maria Chen, who has never personally entered the building. \"These things happen.\"\n\nTenants have reported no issues with the elevators, though several noted the buttons for floor 13 \"feel different\" than the others.\n\nOmnicorp Holdings, which owns the building, did not respond to requests for comment.",
  "category": "local",
  "author": "Staff Reporter",
  "tags": ["hartwell", "omnicorp", "mystery"],
  "entities": ["Hartwell Building", "Maria Chen", "Omnicorp Holdings"],
  "sentiment": "neutral",
  "imageEmoji": "🏢"
}
```

## Generating Article Batches

When creating multiple articles:
1. **Mix categories** - Don't do 10 tech articles in a row
2. **Vary tone** - Serious, quirky, mysterious
3. **Create connections** - Reference each other subtly
4. **Spread timing** - If setting `publishedAt`, vary the timestamps
5. **Balance lore** - Not everything needs to be Hartwell/Derek

## Delivery

1. Write each article as a separate JSON file
2. Place in `server/data/news/lore/`
3. Filename = `{slug}.json`
4. Server loads automatically on next init, or call `newsFeedService.reloadLoreArticles()` to hot-reload

## Quality Checklist

Before finalizing articles:
- [ ] All field names are **camelCase** (not snake_case)
- [ ] Required fields present: `headline`, `summary`, `content`
- [ ] `slug` matches filename (without `.json`)
- [ ] No `published_offset_days` or other fake fields
- [ ] Respects established lore (no contradictions)
- [ ] Uses 847 easter egg appropriately (not forced)
- [ ] Tone matches category
- [ ] Creates hooks for future content
- [ ] Feels like it could be real (within the world's logic)
- [ ] JSON is valid and parseable
