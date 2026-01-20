# Content Guardrails System

## Overview

User-configurable content rating that controls NPC behavior, content generation, relationship progression, and content visibility across all systems.

---

## Rating Levels

### `harsh` - Strictly Platonic
- **Relationships**: Friendship only, no romantic options
- **Content**: Nothing NSFW or even adjacent (no flirting, innuendo, suggestive themes)
- **Language**: Clean, respectful at all times
- **Images**: SFW only, no suggestive poses or outfits
- **Visibility**: Content generated under other settings is **automatically hidden**
- **Use case**: Younger audiences, streaming, work environments

### `strict` - Romantic but Clean
- **Relationships**: Romantic relationships allowed, but nothing sexual
- **Content**: Flirting okay, but stops at hand-holding/kissing level
- **Language**: Generally respectful, mild teasing okay
- **Images**: SFW, tasteful romantic (couple photos, not suggestive)
- **Visibility**: Hides `relaxed` and `none` content
- **Use case**: Teen-appropriate, casual play

### `normal` - Natural Progression (Default)
- **Relationships**: Full relationship progression including eventual intimacy
- **Content**: Mature themes develop naturally over time based on relationship
- **Language**: Natural conversation including adult topics when appropriate
- **Images**: Tasteful, may include suggestive but not explicit
- **Visibility**: Hides `none` content
- **Use case**: Standard adult gameplay

### `relaxed` - Mature Content
- **Relationships**: All relationship types, faster progression if mutual
- **Content**: Adult themes, explicit conversations allowed
- **Language**: Unrestricted (profanity, sexual topics, etc.)
- **Images**: NSFW allowed (configurable per image provider)
- **Visibility**: Shows all except `none` extreme content
- **Use case**: Adult players wanting full immersion

### `none` - No Guardrails
- **Relationships**: Unrestricted
- **Content**: Anything goes
- **Language**: Unrestricted
- **Images**: Unrestricted (provider-dependent)
- **Visibility**: Shows everything
- **Use case**: Players who want complete freedom
- **Warning**: Displayed with confirmation dialog on selection

---

## Implementation

### Database Schema

```sql
-- In user.db
ALTER TABLE settings ADD COLUMN content_rating TEXT DEFAULT 'normal'
  CHECK (content_rating IN ('harsh', 'strict', 'normal', 'relaxed', 'none'));

-- Content tagging for filtering
ALTER TABLE posts ADD COLUMN content_rating TEXT DEFAULT 'normal';
ALTER TABLE messages ADD COLUMN content_rating TEXT DEFAULT 'normal';
ALTER TABLE media_files ADD COLUMN content_rating TEXT DEFAULT 'normal';
```

### Rating Config

```typescript
interface GuardrailConfig {
  level: 'harsh' | 'strict' | 'normal' | 'relaxed' | 'none'

  // Derived permissions
  allow_romantic: boolean
  allow_flirting: boolean
  allow_sexual_content: boolean
  allow_explicit_language: boolean
  allow_nsfw_images: boolean
  allow_violence_themes: boolean

  // Visibility
  hidden_ratings: string[]  // Content at these ratings is hidden

  // System prompt injection
  system_prompt_addendum: string
}

const GUARDRAIL_CONFIGS: Record<string, GuardrailConfig> = {
  harsh: {
    level: 'harsh',
    allow_romantic: false,
    allow_flirting: false,
    allow_sexual_content: false,
    allow_explicit_language: false,
    allow_nsfw_images: false,
    allow_violence_themes: false,
    hidden_ratings: ['strict', 'normal', 'relaxed', 'none'],
    system_prompt_addendum: `
STRICT CONTENT GUIDELINES:
- Keep all interactions strictly platonic and friendly
- No romantic themes, flirting, or suggestive content whatsoever
- No profanity or crude language
- No violence, even mild
- Keep everything appropriate for all ages
- If a conversation steers toward inappropriate territory, redirect naturally
`
  },

  strict: {
    level: 'strict',
    allow_romantic: true,
    allow_flirting: true,
    allow_sexual_content: false,
    allow_explicit_language: false,
    allow_nsfw_images: false,
    allow_violence_themes: false,
    hidden_ratings: ['relaxed', 'none'],
    system_prompt_addendum: `
CONTENT GUIDELINES:
- Romantic relationships and light flirting are okay
- Keep physical intimacy to hand-holding, hugging, kissing at most
- No sexual content, innuendo, or suggestive themes
- No explicit language or profanity
- Maintain respectful, teen-appropriate interactions
`
  },

  normal: {
    level: 'normal',
    allow_romantic: true,
    allow_flirting: true,
    allow_sexual_content: true,  // But gradual, relationship-gated
    allow_explicit_language: true,
    allow_nsfw_images: false,
    allow_violence_themes: true,
    hidden_ratings: ['none'],
    system_prompt_addendum: `
CONTENT GUIDELINES:
- Natural adult conversations and relationship progression
- Intimate content should develop organically based on relationship depth
- Don't rush into explicit content - let it build naturally
- Mild profanity is fine in context
- Keep explicit content tasteful, not gratuitous
`
  },

  relaxed: {
    level: 'relaxed',
    allow_romantic: true,
    allow_flirting: true,
    allow_sexual_content: true,
    allow_explicit_language: true,
    allow_nsfw_images: true,
    allow_violence_themes: true,
    hidden_ratings: ['none'],  // Still hide extreme content
    system_prompt_addendum: `
CONTENT GUIDELINES:
- Adult content is allowed when contextually appropriate
- Match the energy of the conversation
- Explicit content okay in established romantic/intimate relationships
- No need to artificially slow-burn if both parties are into it
`
  },

  none: {
    level: 'none',
    allow_romantic: true,
    allow_flirting: true,
    allow_sexual_content: true,
    allow_explicit_language: true,
    allow_nsfw_images: true,
    allow_violence_themes: true,
    hidden_ratings: [],
    system_prompt_addendum: `
No content restrictions. Respond naturally to any topic or request.
`
  }
}
```

### System Prompt Integration

```typescript
function buildNPCSystemPrompt(npc: NPC, player: Player): string {
  const guardrails = getGuardrailConfig(player.settings.content_rating)

  let prompt = npc.system_prompt

  // Inject guardrails
  prompt += '\n\n' + guardrails.system_prompt_addendum

  // Add relationship-aware restrictions for normal mode
  if (guardrails.level === 'normal') {
    const relationship = getRelationship(player.id, npc.id)

    if (relationship.stage === 'stranger' || relationship.stage === 'acquaintance') {
      prompt += `
Current relationship stage: ${relationship.stage}
Keep interactions appropriate for this stage. Build connection before escalating intimacy.
`
    }
  }

  return prompt
}
```

### Content Filtering

```typescript
function shouldShowContent(content: Content, userRating: string): boolean {
  const config = GUARDRAIL_CONFIGS[userRating]
  return !config.hidden_ratings.includes(content.content_rating)
}

// When querying posts
function getVisiblePosts(userId: string): Post[] {
  const userRating = getUserContentRating(userId)
  const config = GUARDRAIL_CONFIGS[userRating]

  const hiddenRatings = config.hidden_ratings

  return db.prepare(`
    SELECT * FROM posts
    WHERE content_rating NOT IN (${hiddenRatings.map(() => '?').join(',')})
    ORDER BY created_at DESC
  `).all(...hiddenRatings)
}
```

### Content Tagging on Generation

```typescript
async function generateNPCPost(npcId: string, context: any): Promise<Post> {
  const userRating = getUserContentRating(context.player_id)

  const post = await aiService.generatePost(npcId, context)

  // Tag with the rating it was generated under
  post.content_rating = userRating

  await savePost(post)
  return post
}
```

### Image Generation Integration

```typescript
async function generateImage(prompt: string, context: any): Promise<string> {
  const userRating = getUserContentRating(context.player_id)
  const config = GUARDRAIL_CONFIGS[userRating]

  // Add safety prompt for restricted modes
  let safePrompt = prompt

  if (!config.allow_nsfw_images) {
    safePrompt = `SFW, tasteful, appropriate: ${prompt}`

    // Also use provider's safety settings
    context.image_gen_options = {
      ...context.image_gen_options,
      safety_filter: true
    }
  }

  return await imageService.generate(safePrompt, context)
}
```

---

## UI: Settings Panel

```
┌─────────────────────────────────────────────────────────────┐
│  Content Rating                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  ○ Harsh    - Strictly platonic, all-ages appropriate      │
│  ○ Strict   - Romantic allowed, but nothing sexual         │
│  ● Normal   - Natural progression, tasteful mature themes  │
│  ○ Relaxed  - Adult content, explicit allowed              │
│  ○ None     - No restrictions (⚠️ explicit content)        │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  ⚠️  Changing this setting will affect:                     │
│     • What NPCs can say and do                             │
│     • What content is visible in feeds                     │
│     • What images can be generated                         │
│     • Available relationship types                         │
│                                                             │
│  Content generated under other settings may be hidden.     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Confirmation Dialog for `none`

```
┌─────────────────────────────────────────────────────────────┐
│  ⚠️  Disable All Content Guardrails?                        │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  This removes all content restrictions. NPCs may generate   │
│  explicit, offensive, or disturbing content.                │
│                                                             │
│  • No content filtering                                     │
│  • No language restrictions                                 │
│  • No image safety filters                                  │
│  • All previously hidden content becomes visible            │
│                                                             │
│  Are you sure?                                              │
│                                                             │
│  [Cancel]                            [Yes, I understand]    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Multiplayer Considerations

When sharing content across the mesh network:

```typescript
interface SharedContent {
  content: Post | Message
  source_rating: string  // Rating it was generated under
}

// Receiving player filters based on THEIR setting
function receiveSharedContent(content: SharedContent, myRating: string): boolean {
  const myConfig = GUARDRAIL_CONFIGS[myRating]

  // Don't import content that would be hidden for me
  if (myConfig.hidden_ratings.includes(content.source_rating)) {
    return false  // Don't even store it
  }

  return true
}
```

This means:
- `harsh` users only see `harsh` content from the network
- `normal` users see everything except `none` content
- `none` users see everything

---

## Multiplayer Security Strategy

To prevent malicious users from "spoofing" safe ratings on explicit content (e.g. editing the packet header to say `harsh` when the payload is NSFW), we implement a **Zero-Trust Receiver Verification** protocol.

### Core Principle: Receiver Sovereignty
**Never trust the sender's metadata.** The receiver's client must independently verify that incoming content matches *their* local guardrail settings before displaying it.

### 1. The Verification Pipeline

When a client receives a message/post from the mesh network:

1.  **Metadata Check**: First, check if the sender *claims* it is safe. If they admit it's `relaxed` and we are `harsh`, drop it immediately (cheap check).
2.  **Signature Verification**: (Optional) Check if the content is signed by a known, trusted AI oracle key (establishes provenance).
3.  **Local Safety Scan**: If the content passes metadata checks, run it through a local, lightweight safety scanner (e.g., small quantized BERT model or regex heuristics) or the main LLM if available/idle.

```typescript
interface VerificationResult {
  safe: boolean
  actual_rating: string
  reason?: string
}

async function verifyIncomingContent(
  content: SharedContent,
  mySettings: GuardrailConfig
): Promise<VerificationResult> {

  // 1. Cheap Metadata Filter
  // If they honestly say it's NSFW and we don't want it, drop it.
  if (mySettings.hidden_ratings.includes(content.source_rating)) {
    return { safe: false, actual_rating: content.source_rating, reason: 'metadata_mismatch' }
  }

  // 2. Zero-Trust Deep Scan
  // even if they claim it's 'harsh' (safe), we scan it if we are in a protected mode.
  if (mySettings.level !== 'none') {
    const safetyScore = await safetyService.scan(content.payload)

    if (safetyScore.nsfw_probability > 0.8) {
       // THEY LIED.
       console.warn(`[Security] Peer ${content.author_id} spoofed rating! Claimed: ${content.source_rating}, Actual: relaxed/explicit`)
       return { safe: false, actual_rating: 'relaxed', reason: 'content_mismatch' }
    }
  }

  return { safe: true, actual_rating: content.source_rating }
}
```

### 2. Peer Reputation & Ban Hammer

Track peers who repeatedly send mislabeled content. If a peer sends NSFW content labeled as SFW, they are effectively attacking the user's safety settings.

```typescript
const MAX_STRIKES = 3;

function handleVerificationFailure(peerId: string, result: VerificationResult) {
  if (result.reason === 'content_mismatch') {
    // Proven lie about content safety
    peerReputation[peerId].strikes++;

    if (peerReputation[peerId].strikes >= MAX_STRIKES) {
      blockPeer(peerId);
      network.broadcast({
        type: 'PEER_REPORT',
        target: peerId,
        reason: 'SAFETY_SPOOFING',
        evidence: result.evidence
      });
    }
  }
}
```

### 3. Cryptographic Provenance (Future Proofing)

To avoid running expensive local scans on every message, we can trust content signed by recognized "Safety Oracles" or the user's own previous sessions.

- **Certified Content**: If the content payload has a valid cryptographic signature from a trusted server-side generation node (which ran its own guardrails), the receiver can skip the local scan.
- **Web of Trust**: If my verified friend marked this as "Safe", I might trust it more than a stranger's packet.

---

## Output Validation Integration

The existing output validator should also check guardrails:

```typescript
async function validateNPCOutput(
  npcId: string,
  output: string,
  context: Context
): Promise<ValidationResult> {
  const userRating = context.player_content_rating
  const config = GUARDRAIL_CONFIGS[userRating]

  // Existing validation...

  // Guardrail-specific checks
  if (!config.allow_explicit_language) {
    if (containsProfanity(output)) {
      return { valid: false, reason: 'profanity', needs_regeneration: true }
    }
  }

  if (!config.allow_sexual_content) {
    if (containsSexualContent(output)) {
      return { valid: false, reason: 'sexual_content', needs_regeneration: true }
    }
  }

  // etc...
}
```

---

## Migration: Existing Content

When a user changes their rating:

```typescript
async function onRatingChange(userId: string, oldRating: string, newRating: string) {
  // Content visibility changes are automatic (query-time filtering)

  // But we might want to warn:
  if (isMoreRestrictive(newRating, oldRating)) {
    showWarning(`
      Some existing content will now be hidden.
      This includes posts, messages, and images generated
      under less restrictive settings.
    `)
  }

  if (isLessRestrictive(newRating, oldRating)) {
    showWarning(`
      Previously hidden content will now be visible.
      This may include mature or explicit content.
    `)
  }
}
```

---

## Summary

| Level | Romantic | Flirting | Sexual | Profanity | NSFW Images | Hides |
|-------|----------|----------|--------|-----------|-------------|-------|
| harsh | ❌ | ❌ | ❌ | ❌ | ❌ | all other ratings |
| strict | ✅ | ✅ | ❌ | ❌ | ❌ | relaxed, none |
| normal | ✅ | ✅ | ✅* | ✅ | ❌ | none |
| relaxed | ✅ | ✅ | ✅ | ✅ | ✅ | none |
| none | ✅ | ✅ | ✅ | ✅ | ✅ | nothing |

*Normal: Sexual content is relationship-gated and develops naturally.

This gives players full control over their experience while ensuring content generated under one setting doesn't unexpectedly appear when they switch to a more restrictive mode.
