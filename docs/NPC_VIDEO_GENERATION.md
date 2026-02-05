# NPC Video Generation System

This document describes how NPCs create video content using the MediaRenderer system.

## Overview

NPCs can generate short-form video content (stories, reels, shorts) by outputting structured JSON configs. These configs use named presets for simplicity, which get expanded to full `RenderConfig` objects at runtime.

## Architecture

```
NPC AI Model
    ↓
Simplified NPCVideoConfig (preset names)
    ↓
Validation
    ↓
Expansion to Full RenderConfig
    ↓
Storage in site_content table
    ↓
Frontend MediaRenderer renders at runtime
```

## Key Files

- `server/src/services/npc-video-generator.ts` - Main generation service
- `src/components/ui/MediaRenderer/` - Frontend rendering system
- `docs/MEDIA_RENDERER_SYSTEM.md` - Full renderer specification

## NPCVideoConfig Schema

NPCs output this simplified format using preset names:

```typescript
interface NPCVideoConfig {
  intent: {
    primary: IntentType;      // What they're expressing
    secondary?: IntentType;   // Optional secondary intent
    energy: 'low' | 'medium' | 'high' | 'unhinged';
    target?: 'general' | 'someone_specific' | 'self';
    context?: string;         // Brief note about why
  };

  platform: PlatformType;     // Determines aspect ratio

  style: {
    base: BasePresetName;     // Background style
    overlay: OverlayPresetName;
    text_style: TextStylePresetName;
  };

  text: TextSegmentConfig[];  // The actual text content

  duration: number;           // 3-30 seconds
  loop: boolean;
}
```

## Intent Types

NPCs choose intents that match their emotional state and purpose:

| Category | Intents |
|----------|---------|
| **Positive** | share_joy, inform, entertain, create_art, promote, connect |
| **Processing** | vent, cope, confess, seek_validation, seek_advice |
| **Drama** | subtweet, call_out, flex, rage_bait, humble_brag, pity_farm, stir_drama, defend_self, clap_back |
| **Relationship** | thirst_trap, mark_territory, make_jealous, love_bomb, soft_launch, hard_launch |

## Style Presets

### Base Backgrounds

| Preset | Description | Good For |
|--------|-------------|----------|
| `chill_gradient` | Calm purple-blue gradient | Sharing, connecting |
| `chaos_static` | Noisy static | Venting, rage, chaos |
| `cozy_warmth` | Warm orange-pink gradient | Joy, love, thirst traps |
| `dark_void` | Dark moody gradient | Venting, confessing, drama |
| `retro_plasma` | Psychedelic plasma | Art, entertainment |
| `matrix_vibes` | Green matrix rain | Tech content, hacker aesthetic |
| `dreamy_clouds` | Soft pastel flow | Aesthetic, soft launches |

### Overlay Effects

| Preset | Description | Good For |
|--------|-------------|----------|
| `vhs_retro` | VHS tape distortion | Nostalgia, drama, venting |
| `film_classic` | Film grain and vignette | Aesthetic, classy |
| `glitch_chaos` | Glitch distortion | Chaos, rage, calling out |
| `cozy_vintage` | Warm film look | Love content, soft aesthetic |
| `clean` | No overlay | Clarity, informing |

### Text Styles

| Preset | Description | Good For |
|--------|-------------|----------|
| `meme_impact` | Bold white with black outline | Memes, calling out |
| `tiktok_caption` | Clean caption with shadow | General use |
| `dramatic` | Large serif text | Drama, confessions |
| `chaotic` | Wild colorful text | Unhinged energy |
| `aesthetic` | Elegant serif | Soft launches, art |

## Usage

### Basic Generation

```typescript
import { generateNPCVideo, queuedGenerateNPCVideo } from './services/npc-video-generator.js';

// Direct call (for testing)
const result = await generateNPCVideo(npcId, {
  prompt: 'Post about your bad day at work',
  platform: 'instasnap_story',
});

if (result.success) {
  // result.renderConfig - Full RenderConfig for MediaRenderer
  // result.npcConfig - The simplified config NPC generated
}

// Queued call (for production - respects budget)
const queued = await queuedGenerateNPCVideo(npcId, {
  prompt: 'Post about your bad day at work',
  priority: Priority.LOW,  // Background content
});

if (queued.status === 'completed') {
  const renderConfig = queued.result;
}
```

### Storing Video Content

```typescript
import { storeVideoContent } from './services/npc-video-generator.js';

const contentId = storeVideoContent(
  npcId,
  'instasnap_story',
  renderConfig,
  npcConfig,
  'optional caption text'
);
```

### Integration with Drama Engine

When relationship events trigger NPC posts, use video generation for visual content:

```typescript
// In drama-engine.ts or similar
if (shouldPostVisualContent(npc, event)) {
  const result = await queuedGenerateNPCVideo(npcId, {
    prompt: getPromptForEvent(event),
    context: `Relationship stage: ${relationshipStage}, Recent event: ${event.type}`,
    priority: Priority.MEDIUM,
  });

  if (result.status === 'completed') {
    createSocialPost({
      npc_id: npcId,
      content_type: 'video',
      render_config: result.result,
      // ...
    });
  }
}
```

## Example NPC Output

Here's what an NPC might generate for a "venting about work" prompt:

```json
{
  "intent": {
    "primary": "vent",
    "energy": "high",
    "target": "general",
    "context": "boss made me stay late again"
  },
  "platform": "instasnap_story",
  "style": {
    "base": "dark_void",
    "overlay": "vhs_retro",
    "text_style": "dramatic"
  },
  "text": [
    { "text": "when they say", "start": 0, "position": "top", "effect": "fade_in" },
    { "text": "'quick meeting'", "start": 1.5, "position": "center", "effect": "slam" },
    { "text": "and it's 3 hours", "start": 3, "position": "bottom", "effect": "typewriter" }
  ],
  "duration": 6,
  "loop": true
}
```

This expands to a full RenderConfig with:
- Dark gradient background with animated transition
- VHS noise, scan lines, and chromatic aberration overlay
- Large serif text with shadow
- Timed text segments with appropriate effects

## Personality-Style Mapping

NPCs should choose styles that match their personality:

| NPC Personality | Likely Choices |
|-----------------|----------------|
| Dramatic, emotional | dark_void + film_classic + dramatic |
| Chaotic, unhinged | chaos_static + glitch_chaos + chaotic |
| Chill, laid back | chill_gradient + clean + tiktok_caption |
| Aesthetic, artsy | dreamy_clouds + cozy_vintage + aesthetic |
| Tech-savvy | matrix_vibes + clean + meme_impact |

## Budget Considerations

Video generation uses the same AI call cost as post generation. It's categorized under `autonomous_posts` by default.

Priority tiers:
- **CRITICAL** - User requested NPC make video
- **MEDIUM** - Scheduled NPC video posts
- **LOW** - Background NPC content
- **IDLE** - Pre-generation pool

## Frontend Rendering

The generated `renderConfig` is passed directly to MediaRenderer:

```tsx
import { MediaRenderer } from '../ui/MediaRenderer';

<MediaRenderer
  config={post.render_config}
  autoplay
  muted
  loop
/>
```

See `docs/MEDIA_RENDERER_SYSTEM.md` for full rendering documentation.

## Event Bus Integration

Video generation emits events:

| Event | When |
|-------|------|
| `SOCIAL_POST_CREATED` | Video config generated successfully |
| `AI_ERROR` | Generation failed |
| `AI_REQUEST_SENT` | AI call made |
| `AI_RESPONSE_RECEIVED` | AI response received |

## Future Enhancements

- [ ] Image backgrounds (NPC-generated or uploaded)
- [ ] Audio track selection
- [ ] Video-to-video responses (duets)
- [ ] Template library for common formats
- [ ] Style inheritance from NPC profile aesthetics
