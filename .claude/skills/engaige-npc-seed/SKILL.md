---
name: engaige-npc-seed
description: Generate complete NPC profiles for engAIge game seeding. Use when asked to "create NPCs", "generate characters", "seed NPCs", "make new characters", "populate the world", or "create cast of characters".
metadata:
  author: engAIge
  version: 2.0.0
  category: content-authoring
---

# engAIge NPC Seed Generator

Generate complete, coherent NPC profiles with personalities, backstories, and social connections. Creates characters that feel like real people with existing lives.

## Import Path

NPCs are inserted into the `npcs` table in `npc.db`. Relationships go into `player_npc_relationships` in `npc.db`. There is no file-based auto-import — they must be inserted via SQL or a seed script. Generate JSON matching the exact DB schema below.

## Output Format

**CRITICAL:** Field names MUST match the `npcs` table columns exactly (snake_case). All JSON sub-objects are stored as **JSON strings** in the database.

```json
{
  "id": "maya_okonkwo",
  "username": "maya_creates",
  "display_name": "Maya O.",
  "avatar_url": null,
  "age": 26,
  "birthdate": "1999-08-14",
  "gender": "female",
  "occupation": "Freelance Graphic Designer",
  "education": "BFA Graphic Design, City Art Institute",
  "location": "Downtown, near the Hartwell Building",
  "bio": "Graphic designer | Coffee enthusiast | Will talk about fonts for hours",
  "hobbies": "[\"sketching\", \"coffee tasting\", \"houseplant collecting\"]",
  "interests": "[\"typography\", \"indie films\", \"design history\", \"UX\"]",
  "personality_traits": "{\"personality_style\": \"Creative and passionate but prone to overthinking. Balances artistic idealism with freelancer pragmatism.\", \"warmth\": 0.7, \"openness\": 0.8, \"neuroticism\": 0.5, \"agreeableness\": 0.7, \"conscientiousness\": 0.6}",
  "personality_flags": "{\"is_romantic\": false, \"is_flirty\": false, \"is_shy\": true, \"is_sarcastic\": false, \"is_anxious\": true, \"is_creative\": true}",
  "behavior_flags": "{\"can_initiate_conversations\": true, \"is_enabled_to_post_freely\": true, \"can_send_images\": true, \"active_hours\": \"10-24\"}",
  "topic_interests": "{\"design\": 0.9, \"coffee\": 0.7, \"technology\": 0.6, \"music\": 0.4, \"dating\": 0.3, \"corporate_conspiracy\": 0.2}",
  "communication_quirks": "{\"verbosity\": \"average\", \"emoji_usage\": \"moderate\", \"formality\": \"casual\", \"quirks\": [\"Uses em dashes constantly\", \"Sends photos of good typography she finds\"]}",
  "message_patterns": "{\"multi_message_sender\": false, \"typing_speed\": \"average\", \"response_delay\": \"moderate\", \"double_texts\": false}",
  "system_prompt": "You are Maya Okonkwo, a 26-year-old freelance graphic designer. You moved to the city three years ago after art school. You struggled initially but built a steady client base. You had a brief stint working for Omnicorp Holdings that you don't like to talk about. Now happily independent. You spend too much money at Quantum Coffee despite finding the whole thing pretentious. Your apartment is 40% houseplants.\n\nPersonality: Creative, warm once past initial shyness, prone to overthinking. You use em dashes constantly in text. You're passionate about typography and will talk about fonts at length if given the chance.\n\nSpeaking style: Casual, uses moderate emoji. Average message length. Tends to be thoughtful in responses.",
  "social_media_handles": "{\"myface\": \"maya_creates\", \"instasnap\": \"maya_creates\"}",
  "profile_image_url": null,
  "reference_images": "[]",
  "image_generation_prompt": "Young woman, 26, creative/artistic style, warm brown skin, natural hair, usually wearing something colorful, graphic designer aesthetic",
  "is_active": 1
}
```

### Field Reference

| Field | Required | Type | DB Type | Notes |
|-------|----------|------|---------|-------|
| `id` | **Yes** | string | TEXT PK | `snake_case_name` format. Must be unique. |
| `username` | **Yes** | string | TEXT UNIQUE | Social handle, no spaces. |
| `display_name` | **Yes** | string | TEXT | How the name appears in UI. |
| `avatar_url` | No | string | TEXT | Path to avatar image. Usually null for seeds. |
| `age` | Yes | number | INTEGER | Current age. |
| `birthdate` | No | string | TEXT | ISO date string `YYYY-MM-DD`. |
| `gender` | Yes | string | TEXT | `female`, `male`, `nonbinary`, etc. |
| `occupation` | Yes | string | TEXT | Job title/description. |
| `education` | No | string | TEXT | Education background. |
| `location` | No | string | TEXT | Where they live/work. Reference lore locations. |
| `bio` | Yes | string | TEXT | Short profile bio (140 chars max). |
| `hobbies` | Yes | string | TEXT | **JSON string** of array: `"[\"hobby1\", \"hobby2\"]"` |
| `interests` | Yes | string | TEXT | **JSON string** of array: `"[\"interest1\", \"interest2\"]"` |
| `personality_traits` | Yes | string | TEXT | **JSON string** of object (see below). |
| `personality_flags` | Yes | string | TEXT | **JSON string** of boolean flags (see below). |
| `behavior_flags` | Yes | string | TEXT | **JSON string** of behavior config (see below). |
| `topic_interests` | Yes | string | TEXT | **JSON string** of topic weights 0-1 (see below). |
| `communication_quirks` | Yes | string | TEXT | **JSON string** of comm style (see below). |
| `message_patterns` | Yes | string | TEXT | **JSON string** of messaging behavior (see below). |
| `system_prompt` | **Yes** | string | TEXT NOT NULL | **REQUIRED.** Full character prompt for the AI. Include personality, backstory, speaking style. |
| `social_media_handles` | Yes | string | TEXT | **JSON string** of platform handles. |
| `profile_image_url` | No | string | TEXT | Path to profile image. Usually null. |
| `reference_images` | No | string | TEXT | **JSON string** of array of reference image paths. |
| `image_generation_prompt` | No | string | TEXT | Prompt for generating NPC images. |
| `is_active` | No | integer | INTEGER | `1` = active (default), `0` = inactive. |

### JSON Sub-Object Schemas

#### personality_traits
```json
{
  "personality_style": "2-3 sentence personality summary",
  "warmth": 0.7,
  "openness": 0.8,
  "neuroticism": 0.5,
  "agreeableness": 0.7,
  "conscientiousness": 0.6
}
```

#### personality_flags
```json
{
  "is_romantic": false,
  "is_flirty": false,
  "is_shy": true,
  "is_sarcastic": false,
  "is_anxious": true,
  "is_creative": true
}
```

#### behavior_flags
```json
{
  "can_initiate_conversations": true,
  "is_enabled_to_post_freely": true,
  "can_send_images": true,
  "active_hours": "10-24"
}
```

#### topic_interests
Weights from 0.0 to 1.0 indicating how interested the NPC is in various topics:
```json
{
  "design": 0.9,
  "coffee": 0.7,
  "technology": 0.6,
  "music": 0.4,
  "dating": 0.3,
  "corporate_conspiracy": 0.2
}
```

#### communication_quirks
```json
{
  "verbosity": "terse|average|verbose",
  "emoji_usage": "none|light|moderate|heavy",
  "formality": "casual|neutral|formal",
  "quirks": ["specific speech patterns or habits"]
}
```

#### message_patterns
```json
{
  "multi_message_sender": true,
  "typing_speed": "slow|average|fast",
  "response_delay": "instant|quick|moderate|slow",
  "double_texts": false
}
```

#### social_media_handles
```json
{
  "myface": "handle_here",
  "instasnap": "handle_here",
  "threadit": "handle_here"
}
```
Only include platforms the NPC uses.

### Fields That Do NOT Exist

Do NOT include these — they are not in the `npcs` table:
- ~~`personality`~~ — Use `personality_traits` (JSON string with personality_style + trait scores).
- ~~`backstory`~~ — Goes inside `system_prompt`. There is no separate backstory column.
- ~~`communication_style`~~ — Split into `communication_quirks` and `message_patterns`.
- ~~`social_presence`~~ — Use `social_media_handles` (JSON string of platform handles).
- ~~`relationships`~~ — Not in the npcs table. Relationships are in `player_npc_relationships` table (separate output).

### System Prompt Guidelines

The `system_prompt` is the most important field — it's what the AI uses to roleplay this character. It MUST include:

1. **Identity**: Name, age, occupation, key facts
2. **Personality summary**: Core traits, how they come across
3. **Backstory**: Key life events, history, connections to lore
4. **Speaking style**: How they text, emoji habits, vocabulary level
5. **Interests/topics**: What they're passionate about
6. **Quirks**: Unique behaviors, catchphrases, habits

Example structure:
```
You are [Name], a [age]-year-old [occupation]. [2-3 sentences of backstory].

Personality: [Core personality description].

Speaking style: [How they communicate - formal/casual, emoji use, message length, quirks].

Interests: [What they care about and will talk about].

Relationships: [Key connections to other NPCs].
```

## Personality Archetypes

Use these as starting points, then add unique twists:

### Social Butterfly
- High warmth/openness, low neuroticism
- Heavy emoji, verbose, multi-message sender
- Wide but shallow topic interests
- `active_hours`: broad range

### Introvert
- High openness/conscientiousness, moderate neuroticism
- Light/no emoji, terse-average, single messages
- Deep but narrow topic interests
- `active_hours`: narrow evening window

### Chaotic Energy
- High openness, low conscientiousness
- Heavy emoji, verbose, multi-message sender, fast typing
- Random scattered topic interests
- `active_hours`: irregular, includes late night

### Professional
- High conscientiousness/agreeableness
- Light emoji, average verbosity, formal
- Career-aligned topic interests
- `active_hours`: "9-18" (business hours)

### Creative Soul
- High openness, moderate neuroticism
- Moderate emoji, verbose when inspired
- Art/culture-heavy topic interests
- `active_hours`: irregular, late nights

### Hot Mess
- High neuroticism/openness, low conscientiousness
- Moderate-heavy emoji, verbose (overshares)
- Scattered topic interests
- `active_hours`: inconsistent

## Communication Style Details

### Verbosity Levels
- **Terse**: "k" / "sure" / "lol nice"
- **Average**: "Yeah that sounds good! Let me know when"
- **Verbose**: "Oh my gosh yes absolutely! I was literally just thinking about this the other day..."

### Emoji Patterns
- **None**: Clean text, maybe occasional :) if anything
- **Light**: Strategic emoji, 1-2 per message when appropriate
- **Moderate**: Regular emoji use, multiple per message
- **Heavy**: Multiple emoji per sentence

### Speech Quirks (examples for `communication_quirks.quirks`)
- Always uses "..." at end of thoughts...
- Types "haha" even when not funny
- Uses "lowkey" and "highkey" constantly
- Overuses parenthetical asides (like this)
- Never capitalizes anything
- Perfect grammar always, no exceptions
- Starts sentences with "So,"
- Says "literally" literally all the time

## Creating Diverse Casts

### Age Distribution
- 18-24: 25%
- 25-34: 40%
- 35-44: 20%
- 45+: 15%

### Occupation Variety
Mix of: Creative, Tech, Service, Professional, Students, Entrepreneurs, Trades, Unemployed/searching

### Social Graph Principles
- Not everyone knows everyone
- Cluster by context (work groups, friend groups, hobby groups)
- Some bridge characters who connect clusters
- Include loners with minimal connections
- Romantic pairings should be sparse

## NPC Relationships (Separate Output)

Relationships between NPCs are NOT stored in the npcs table. They should be output as a separate section for the `player_npc_relationships` table or handled by a seed script that creates initial NPC-NPC relationship state.

For each relationship, provide a descriptive note alongside the NPC data:

```json
{
  "relationships": [
    {
      "npc_id_a": "maya_okonkwo",
      "npc_id_b": "derek_chen",
      "type": "friend",
      "history": "Met through Quantum Coffee—she designed their menu once."
    }
  ]
}
```

This metadata is for the seed script to set initial relationship stats and context. It's not directly inserted into a table.

## World Integration

NPCs should reference established lore naturally in their `system_prompt`:

- Someone works at Hartwell Building
- Someone is obsessed with Quantum Coffee
- Someone was at Neon Requiem's final show
- Someone knows Trust Fall Tim (opinions vary)
- Someone frequents The Underground
- Someone has theories about Omnicorp

## Delivery

1. Output each NPC as a JSON object (or array of NPCs)
2. Place in `server/data/seed/npcs/` (create if needed)
3. Import via seed script or direct SQL INSERT
4. All JSON sub-fields must be **stringified** (the DB stores them as TEXT)

## Quality Checklist

Before finalizing NPCs:
- [ ] All field names match `npcs` table columns (snake_case)
- [ ] `system_prompt` is present and thorough (NOT NULL in DB)
- [ ] JSON sub-objects are valid JSON **strings** (double-encoded for DB)
- [ ] `id` is `snake_case`, `username` is unique
- [ ] No fake fields (`personality`, `backstory`, `communication_style`, `social_presence`)
- [ ] `personality_traits`, `personality_flags`, `behavior_flags`, `topic_interests`, `communication_quirks`, `message_patterns` all present
- [ ] Age matches occupation/lifestyle
- [ ] `social_media_handles` lists platforms NPC actually uses
- [ ] Backstory doesn't contradict established lore
- [ ] Unique enough to be memorable
- [ ] JSON is valid and complete
