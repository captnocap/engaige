# Universal Media Renderer System

**Status**: Draft
**Created**: 2026-02-05

A compositing system that enables NPCs to "create" video content by defining render configurations that execute at runtime. No video files are generated or stored - just recipes that render on the client.

---

## Overview

NPCs don't have access to video editing software. But they can:
1. Generate images (existing image gen system)
2. Write text (their core capability)
3. Choose from preset effects (constrained creativity)

This system combines these into "videos" that render in real-time.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    MediaRenderer                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │  TEXT LAYER                                        │  │
│  │  - Animated text segments with timing              │  │
│  │  - Effects: typewriter, shake, slam, glitch        │  │
│  │  - Position: top, center, bottom, custom           │  │
│  ├───────────────────────────────────────────────────┤  │
│  │  OVERLAY LAYER (optional)                          │  │
│  │  - Visual effects applied over base                │  │
│  │  - Effects: vhs_noise, film_grain, vignette        │  │
│  ├───────────────────────────────────────────────────┤  │
│  │  BASE LAYER                                        │  │
│  │  - Canvas effect (animated)                        │  │
│  │  - Generated image (from media_files)              │  │
│  │  - Gradient / Solid color                          │  │
│  │  - Video placeholder (subway_surfers, minecraft)   │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## Render Config Schema

Stored in `site_content.metadata` as `render_config`:

```typescript
interface RenderConfig {
  // Rendering mode
  render_type: 'static' | 'animated' | 'video';

  // ==========================================================================
  // CREATOR INTENT
  // Why is this content being created? Drives drama engine reactions.
  // ==========================================================================
  intent: ContentIntent;

  // Timing
  duration: number;        // seconds (0 for static)
  loop: boolean;

  // ==========================================================================
  // VIEWPORT / FRAME CONSTRAINTS
  // Locks content to platform-appropriate dimensions
  // ==========================================================================
  viewport: ViewportConfig;

  // Layers (rendered bottom to top)
  layers: {
    base: BaseLayer;
    overlay?: OverlayLayer;
    text?: TextLayer;
  };

  // Audio (optional, for future)
  audio?: {
    track: string;         // preset ID or URL
    volume: number;
  };
}

// ============================================================================
// VIEWPORT / FRAME CONSTRAINTS
// ============================================================================

interface ViewportConfig {
  // Aspect ratio - determines frame shape
  aspect: AspectRatio;

  // Platform hint - helps renderer optimize
  platform_hint?: PlatformHint;

  // Safe zone - where text should stay (percentage from edges)
  safe_zone?: {
    top: number;      // % from top
    bottom: number;   // % from bottom
    left: number;     // % from left
    right: number;    // % from right
  };

  // Letterboxing behavior when container doesn't match
  fit: 'contain' | 'cover' | 'fill';

  // Background color for letterboxing
  letterbox_color?: string;
}

type AspectRatio =
  | '1:1'      // Square - Instagram posts, some stories
  | '4:5'      // Portrait - Instagram feed optimal
  | '9:16'     // Vertical - Stories, TikTok, Reels, Shorts
  | '16:9'     // Landscape - YouTube, desktop video
  | '4:3'      // Classic - older format
  | '21:9';    // Ultrawide - cinematic

type PlatformHint =
  | 'instasnap_story'    // 9:16, full bleed, safe zones for UI
  | 'instasnap_post'     // 1:1 or 4:5, visible in feed
  | 'instasnap_reel'     // 9:16, sound expected
  | 'vidtube_video'      // 16:9, landscape primary
  | 'vidtube_short'      // 9:16, vertical video
  | 'myface_post'        // 1:1 preferred, inline in feed
  | 'myface_story'       // 9:16, ephemeral
  | 'threadit_embed'     // 16:9, inline player
  | 'thumbnail';         // Static preview, any ratio

// Platform-specific safe zones (UI overlay areas to avoid)
const PLATFORM_SAFE_ZONES: Record<PlatformHint, ViewportConfig['safe_zone']> = {
  'instasnap_story': { top: 12, bottom: 20, left: 5, right: 5 },   // Username top, reactions bottom
  'instasnap_reel': { top: 10, bottom: 25, left: 5, right: 15 },   // Heavy bottom UI, side buttons
  'vidtube_short': { top: 8, bottom: 20, left: 5, right: 12 },     // Similar to reels
  'vidtube_video': { top: 5, bottom: 15, left: 5, right: 5 },      // Progress bar, controls
  'myface_story': { top: 10, bottom: 15, left: 5, right: 5 },
  'myface_post': { top: 0, bottom: 0, left: 0, right: 0 },         // No overlay
  'instasnap_post': { top: 0, bottom: 0, left: 0, right: 0 },
  'threadit_embed': { top: 0, bottom: 10, left: 0, right: 0 },
  'thumbnail': { top: 0, bottom: 0, left: 0, right: 0 },
};

// ============================================================================
// CREATOR INTENT
// The "why" behind content creation - drives style choices and drama reactions
// ============================================================================

interface ContentIntent {
  // Primary purpose
  primary: IntentType;

  // Optional secondary intent (content can have layers)
  secondary?: IntentType;

  // Target (who is this aimed at?)
  target?: {
    type: 'general' | 'specific_npc' | 'specific_group' | 'self';
    target_id?: string;      // NPC ID if specific
    target_name?: string;    // For display/context
  };

  // Emotional energy
  energy: 'low' | 'medium' | 'high' | 'unhinged';

  // Is the intent obvious or masked?
  // (rage bait often LOOKS like innocent content)
  surface_presentation?: IntentType;

  // Additional context for AI/drama engine
  context?: string;
}

type IntentType =
  // Positive/Neutral
  | 'share_joy'           // Genuine happiness, good news
  | 'inform'              // Educational, news, updates
  | 'entertain'           // Comedy, fun, no agenda
  | 'create_art'          // Artistic expression
  | 'promote'             // Self-promotion, announcements
  | 'connect'             // Seeking connection/community

  // Processing/Coping
  | 'vent'                // Processing frustration
  | 'cope'                // Coping mechanism, self-soothing
  | 'confess'             // Admitting something
  | 'seek_validation'     // Looking for support/agreement
  | 'seek_advice'         // Asking for help

  // Drama/Conflict
  | 'subtweet'            // Indirect call-out
  | 'call_out'            // Direct call-out
  | 'flex'                // Showing off, making others jealous
  | 'rage_bait'           // Intentionally provocative
  | 'humble_brag'         // Bragging disguised as complaint
  | 'pity_farm'           // Seeking sympathy manipulatively
  | 'stir_drama'          // Chaos agent behavior
  | 'defend_self'         // Response to criticism
  | 'clap_back'           // Retaliatory content

  // Relationship-specific
  | 'thirst_trap'         // Attracting romantic attention
  | 'mark_territory'      // "This person is mine" energy
  | 'make_jealous'        // Targeting ex or rival
  | 'love_bomb'           // Overwhelming positive attention
  | 'soft_launch'         // Hinting at new relationship
  | 'hard_launch';        // Officially announcing relationship

// ============================================================================
// BASE LAYER
// ============================================================================

type BaseLayer =
  | { type: 'solid'; color: string }
  | { type: 'gradient'; colors: string[]; angle?: number; animated?: boolean }
  | { type: 'image'; image_id: string }  // FK to media_files
  | { type: 'image_url'; url: string }
  | { type: 'effect'; effect: BaseEffect; params?: Record<string, any> }
  | { type: 'placeholder'; placeholder: PlaceholderType };

type BaseEffect =
  | 'noise_static'      // TV static
  | 'color_pulse'       // Pulsing color
  | 'wave_distortion'   // Wavy lines
  | 'plasma'            // Classic plasma effect
  | 'matrix_rain'       // Matrix-style falling characters
  | 'starfield'         // Moving stars
  | 'gradient_flow'     // Flowing gradient animation
  | 'particles'         // Floating particles
  | 'geometric'         // Rotating geometric shapes
  | 'audio_visualizer'; // Fake audio bars

type PlaceholderType =
  | 'subway_surfers'    // Generic endless runner gameplay
  | 'minecraft_parkour' // Block game parkour
  | 'satisfying_soap'   // Soap cutting ASMR style
  | 'slime_stretch'     // Slime content
  | 'hydraulic_press';  // Crushing things

// ============================================================================
// OVERLAY LAYER
// ============================================================================

interface OverlayLayer {
  effects: OverlayEffect[];
}

interface OverlayEffect {
  type: OverlayEffectType;
  intensity?: number;      // 0-1, default 0.5
  params?: Record<string, any>;
}

type OverlayEffectType =
  | 'vhs_noise'         // VHS tracking lines + noise
  | 'film_grain'        // Film grain texture
  | 'scan_lines'        // CRT scan lines
  | 'vignette'          // Dark edges
  | 'chromatic_aberration' // RGB split
  | 'glitch'            // Random glitch blocks
  | 'dust_scratches'    // Old film look
  | 'light_leak'        // Light leak flares
  | 'rain'              // Rain drops
  | 'snow';             // Falling snow

// ============================================================================
// TEXT LAYER
// ============================================================================

interface TextLayer {
  segments: TextSegment[];
  default_style?: TextStyle;
}

interface TextSegment {
  // Timing
  start: number;           // Start time in seconds
  end?: number;            // End time (null = until next segment)

  // Content
  text: string;

  // Position
  position: 'top' | 'center' | 'bottom' | { x: number; y: number };

  // Animation
  enter_effect?: TextEffect;
  exit_effect?: TextEffect;

  // Style override
  style?: Partial<TextStyle>;
}

interface TextStyle {
  font: string;            // 'impact' | 'comic_sans' | 'roboto' | etc.
  size: 'small' | 'medium' | 'large' | 'huge';
  color: string;
  stroke_color?: string;
  stroke_width?: number;
  shadow?: boolean;
  background?: string;     // Background color behind text
  padding?: number;
}

type TextEffect =
  // Entrance effects
  | 'none'
  | 'fade_in'
  | 'typewriter'          // Character by character
  | 'word_by_word'        // Word by word
  | 'slam'                // Scale up with impact
  | 'bounce'              // Bouncy entrance
  | 'slide_up'
  | 'slide_down'
  | 'slide_left'
  | 'slide_right'
  | 'zoom_in'
  | 'zoom_out'
  // Persistent effects (applied while visible)
  | 'shake'               // Continuous shake
  | 'pulse'               // Size pulse
  | 'rainbow'             // Color cycling
  | 'glitch'              // Glitchy text
  | 'float';              // Gentle floating motion
```

---

## Intent System & Drama Engine Integration

The intent system is the bridge between content creation and drama reactions. It answers: **"What was this person REALLY trying to do?"**

### How Intent Drives Reactions

| Intent | Likely Viewer Reactions |
|--------|------------------------|
| `share_joy` | Genuine support, "happy for you" |
| `vent` | Sympathy, advice, or "here we go again" |
| `cope` | Supportive comments, relatable memes |
| `confess` | Shock, support, or drama depending on confession |
| `subtweet` | "Who is this about?", detective mode, sides taken |
| `call_out` | Pile-on support OR defense of target |
| `flex` | Jealousy, eye-rolls, or genuine admiration |
| `rage_bait` | Angry engagement (mission accomplished) |
| `humble_brag` | Eye-roll reactions, sarcastic "congrats" |
| `pity_farm` | Initial sympathy → backlash if detected |
| `thirst_trap` | Thirsty comments, relationship drama |
| `make_jealous` | Target NPC reacts, mutual friends pick sides |

### Surface vs True Intent

Content often wears a mask:

```typescript
{
  intent: {
    primary: 'make_jealous',           // TRUE intent
    surface_presentation: 'share_joy', // What it LOOKS like
    target: {
      type: 'specific_npc',
      target_id: 'npc_ex_boyfriend',
      target_name: 'Jake'
    },
    energy: 'high'
  }
}
```

The drama engine can:
1. **Detect the mask** - Some NPCs see through it ("this is clearly about Jake")
2. **React to surface** - Naive NPCs take it at face value
3. **React to true intent** - Target NPC feels the real energy

### Intent Influences Style Choices

| Intent | Suggested Base | Suggested Overlay | Suggested Text |
|--------|---------------|-------------------|----------------|
| `share_joy` | `cozy_warmth` | `clean` | Bouncy, colorful |
| `vent` | `dark_void` | `vhs_retro` | Dramatic, caps |
| `cope` | `chill_gradient` | `film_classic` | Soft, lowercase |
| `rage_bait` | `chaos_static` | `glitch_chaos` | CAPS, shake |
| `thirst_trap` | Generated selfie | `light_leak` | Minimal, aesthetic |
| `confess` | `dark_void` | `film_grain` | Typewriter, slow |

### Event Bus Integration

When content is created, emit intent metadata:

```typescript
eventBus.fire(EventTypes.SOCIAL_POST_CREATED, {
  post_id: id,
  npc_id: creator.id,
  platform: 'instasnap',
  content_type: 'story',
  intent: {
    primary: 'subtweet',
    target: { type: 'specific_npc', target_id: 'npc_123' },
    energy: 'high'
  }
}, { importance: 0.8 });
```

The drama engine subscribes and processes:
- Notify target NPC
- Queue reactions from friends/followers
- Potentially escalate to drama arc

### NPC Personality × Intent

NPCs have tendencies toward certain intents:

| Personality Trait | Common Intents |
|-------------------|----------------|
| `drama_prone` | subtweet, call_out, stir_drama |
| `attention_seeking` | flex, thirst_trap, pity_farm |
| `genuine` | share_joy, inform, connect |
| `chaotic` | rage_bait, stir_drama, unhinged energy |
| `passive_aggressive` | subtweet, humble_brag, surface masks |
| `supportive` | seek_validation → give validation |

---

## Platform Integration

### Platform → Viewport Mapping

| Platform | Format | Aspect | Safe Zones | Typical Duration | Loop |
|----------|--------|--------|------------|------------------|------|
| **VidTube Video** | Landscape | 16:9 | Bottom 15% (controls) | 30s - 10min | No |
| **VidTube Short** | Vertical | 9:16 | Top 8%, Bottom 20%, Right 12% | 15-60s | Yes |
| **InstaSnap Story** | Vertical | 9:16 | Top 12% (username), Bottom 20% (reply) | 5-15s | Yes |
| **InstaSnap Reel** | Vertical | 9:16 | Heavy bottom 25%, right sidebar | 15-90s | Yes |
| **InstaSnap Post** | Square/Portrait | 1:1 or 4:5 | None | 3-60s | Yes |
| **MyFace Post** | Square | 1:1 | None | 3-15s | Yes |
| **MyFace Story** | Vertical | 9:16 | Top 10%, Bottom 15% | 5-15s | Yes |
| **Threadit Embed** | Landscape | 16:9 | Bottom 10% | Any | Optional |

### VidTube Videos
Full "video" content with longer durations and complex compositions.

```json
{
  "content_type": "video",
  "metadata": {
    "duration": "3:45",
    "views": "1.2M",
    "render_config": {
      "render_type": "video",
      "duration": 225,
      "loop": false,
      "viewport": {
        "aspect": "16:9",
        "platform_hint": "vidtube_video",
        "fit": "contain",
        "letterbox_color": "#000000"
      },
      "layers": {
        "base": { "type": "effect", "effect": "gradient_flow" },
        "overlay": { "effects": [{ "type": "film_grain", "intensity": 0.2 }] },
        "text": {
          "segments": [
            { "start": 0, "text": "POV:", "position": "top", "enter_effect": "fade_in" },
            { "start": 1, "text": "You just discovered quantum coffee", "position": "center", "enter_effect": "typewriter" }
          ]
        }
      }
    }
  }
}
```

### InstaSnap Stories
Short, looping, vertical content. Note safe zones for platform UI.

```json
{
  "render_type": "video",
  "duration": 15,
  "loop": true,
  "viewport": {
    "aspect": "9:16",
    "platform_hint": "instasnap_story",
    "fit": "cover"
  },
  "layers": {
    "base": { "type": "image", "image_id": "generated_selfie_123" },
    "overlay": { "effects": [{ "type": "light_leak" }] },
    "text": {
      "segments": [
        { "start": 0, "text": "when the coffee hits different", "position": "bottom", "enter_effect": "fade_in" }
      ]
    }
  }
}
```

Text at `position: "bottom"` auto-adjusts to respect the 20% safe zone.

### MyFace Animated Posts
Square format, shorter, social content.

```json
{
  "render_type": "animated",
  "duration": 5,
  "loop": true,
  "viewport": {
    "aspect": "1:1",
    "platform_hint": "myface_post",
    "fit": "cover"
  },
  "layers": {
    "base": { "type": "gradient", "colors": ["#ff6b6b", "#4ecdc4"], "animated": true },
    "text": {
      "segments": [
        { "start": 0, "text": "mood", "position": "center", "enter_effect": "bounce" }
      ]
    }
  }
}
```

### Viewport Rendering Behavior

```
┌─────────────────────────────────────────────────────────────────────┐
│ Container (e.g., phone screen, feed card, fullscreen)               │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ Letterbox area (if fit: 'contain' and aspect doesn't match)   │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │                    RENDERED CONTENT                      │  │  │
│  │  │  ┌─────────────────────────────────────────────────┐    │  │  │
│  │  │  │              SAFE ZONE                          │    │  │  │
│  │  │  │  (text/UI should stay within this area)         │    │  │  │
│  │  │  │                                                 │    │  │  │
│  │  │  └─────────────────────────────────────────────────┘    │  │  │
│  │  └─────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘

fit: 'contain' → Entire content visible, letterboxed if needed
fit: 'cover'   → Content fills container, edges cropped
fit: 'fill'    → Content stretched to fill (may distort)
```

---

## React Component API

```tsx
import { MediaRenderer } from '../ui/MediaRenderer';

// Basic usage
<MediaRenderer
  config={renderConfig}
  autoplay={true}
  muted={true}
/>

// With controls
<MediaRenderer
  config={renderConfig}
  controls={true}
  onTimeUpdate={(time) => {}}
  onComplete={() => {}}
/>

// Thumbnail mode (renders single frame)
<MediaRenderer
  config={renderConfig}
  mode="thumbnail"
  thumbnailTime={2.5}  // Capture at 2.5 seconds
/>
```

---

## Effect Presets (for NPC selection)

NPCs don't pick individual parameters - they pick named presets that map to full configs.

### Base Presets
| Preset | Description | Use Case |
|--------|-------------|----------|
| `chill_gradient` | Slow flowing purple/blue gradient | Ambient, music |
| `chaos_static` | Aggressive TV static | Drama, chaos |
| `cozy_warmth` | Warm orange/yellow glow | Wholesome, comfort |
| `dark_void` | Near-black with subtle movement | Edgy, serious |
| `retro_plasma` | 90s plasma effect | Nostalgia, ironic |
| `matrix_vibes` | Green falling characters | Tech, hacker |
| `dreamy_clouds` | Soft moving clouds | Chill, aesthetic |

### Overlay Presets
| Preset | Effects Combined |
|--------|-----------------|
| `vhs_retro` | vhs_noise + scan_lines + chromatic_aberration |
| `film_classic` | film_grain + vignette + dust_scratches |
| `glitch_chaos` | glitch + chromatic_aberration |
| `cozy_vintage` | film_grain + vignette + light_leak |
| `clean` | (none) |

### Text Style Presets
| Preset | Style |
|--------|-------|
| `meme_impact` | Impact font, white with black stroke |
| `tiktok_caption` | Clean sans-serif, white with shadow |
| `dramatic` | Large, centered, slow fade |
| `chaotic` | Comic sans, rainbow, shake |
| `aesthetic` | Thin serif, pastel, minimal |
| `news_ticker` | Red background, white text, slide |

---

## NPC Content Generation

When an NPC "creates" a video, the AI generates a render config.

### System Prompt Addition
```
You can create video content by outputting a render_config JSON object.

INTENT (required) - Why are you creating this? Be honest with yourself:
- Positive: share_joy, inform, entertain, create_art, promote, connect
- Processing: vent, cope, confess, seek_validation, seek_advice
- Drama: subtweet, call_out, flex, rage_bait, humble_brag, pity_farm, stir_drama
- Relationship: thirst_trap, mark_territory, make_jealous, soft_launch, hard_launch

If your true intent differs from how it appears, specify surface_presentation.
Target someone specific? Include their info.

PRESETS:
- Base: chill_gradient, chaos_static, cozy_warmth, dark_void, retro_plasma
- Overlay: vhs_retro, film_classic, glitch_chaos, cozy_vintage, clean
- Text style: meme_impact, tiktok_caption, dramatic, chaotic, aesthetic

Structure your content with text segments that have timing.
Keep videos under 30 seconds for social posts, up to 5 minutes for VidTube.
```

### Example NPC Output - Genuine Content
```json
{
  "action": "create_video",
  "platform": "instasnap_story",
  "intent": {
    "primary": "promote",
    "energy": "medium"
  },
  "render_config": {
    "preset_base": "chill_gradient",
    "preset_overlay": "vhs_retro",
    "preset_text_style": "tiktok_caption",
    "duration": 12,
    "text_segments": [
      { "start": 0, "text": "pov: you're me" },
      { "start": 3, "text": "at 3am" },
      { "start": 5, "text": "wondering why I'm like this" },
      { "start": 8, "text": "anyway stream my new track" }
    ]
  }
}
```

### Example NPC Output - Masked Intent (Subtweet)
```json
{
  "action": "create_video",
  "platform": "instasnap_story",
  "intent": {
    "primary": "make_jealous",
    "surface_presentation": "share_joy",
    "target": {
      "type": "specific_npc",
      "target_id": "npc_jake_miller",
      "target_name": "Jake"
    },
    "energy": "high",
    "context": "Posted 2 hours after Jake announced his new relationship"
  },
  "render_config": {
    "preset_base": "cozy_warmth",
    "preset_overlay": "light_leak",
    "preset_text_style": "aesthetic",
    "duration": 8,
    "background_image_id": "generated_hot_selfie_456",
    "text_segments": [
      { "start": 0, "text": "living my best life" },
      { "start": 3, "text": "some people just aren't ready for this" }
    ]
  }
}
```

### Example NPC Output - Unhinged Vent
```json
{
  "action": "create_video",
  "platform": "vidtube_short",
  "intent": {
    "primary": "vent",
    "secondary": "rage_bait",
    "energy": "unhinged"
  },
  "render_config": {
    "preset_base": "chaos_static",
    "preset_overlay": "glitch_chaos",
    "preset_text_style": "chaotic",
    "duration": 15,
    "text_segments": [
      { "start": 0, "text": "OK SO", "effect": "slam" },
      { "start": 1, "text": "LET ME TELL YOU", "effect": "shake" },
      { "start": 3, "text": "about quantum coffee", "effect": "glitch" },
      { "start": 5, "text": "IT RUINED MY LIFE", "effect": "shake" },
      { "start": 8, "text": "and I'd do it again", "effect": "fade_in" }
    ]
  }
}
```

The system expands presets to full configs before storing.

---

## Database Changes

### site_content.metadata
The `render_config` field is added to the existing JSON metadata:

```sql
-- No schema change needed, just document the structure
-- render_config lives inside metadata JSON
```

### New preset tables (optional, for customization)

```sql
-- Effect presets (can be extended by users/NPCs)
CREATE TABLE IF NOT EXISTS render_presets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,  -- 'base', 'overlay', 'text_style'
  config TEXT NOT NULL,    -- Full config JSON
  is_system INTEGER DEFAULT 1,  -- System preset vs user-created
  created_at INTEGER DEFAULT (unixepoch())
);
```

---

## Implementation Phases

### Phase 1: Core Renderer
- [ ] `MediaRenderer` React component
- [ ] Base layer rendering (solid, gradient, image)
- [ ] Text layer with basic effects (fade, typewriter)
- [ ] Static/thumbnail mode

### Phase 2: Effects Library
- [ ] Canvas effects (noise, plasma, particles)
- [ ] Overlay effects (vhs, grain, vignette)
- [ ] Advanced text effects (shake, glitch, slam)

### Phase 3: Platform Integration
- [ ] VidTube video player using MediaRenderer
- [ ] InstaSnap stories using MediaRenderer
- [ ] MyFace animated posts

### Phase 4: NPC Generation
- [ ] Preset expansion system
- [ ] AI prompt additions for video creation
- [ ] Content creation events in event bus

### Phase 5: Polish
- [ ] Performance optimization (offscreen canvas, RAF)
- [ ] Placeholder "gameplay" backgrounds
- [ ] Audio integration (background tracks)

---

## Performance Considerations

1. **Offscreen rendering** - Render to offscreen canvas, composite to visible
2. **RAF throttling** - Don't render faster than display refresh
3. **Effect complexity limits** - Cap simultaneous effects
4. **Lazy initialization** - Don't start rendering until visible
5. **Thumbnail caching** - Cache static thumbnails for lists

---

## Open Questions

1. **Audio** - Background music/sound effects? Licensed library or generated?
2. **User creation** - Let players create content too, or NPC-only?
3. **Sharing** - Export as actual video file (via canvas recording)?
4. **Templates** - Pre-made templates NPCs can fill in vs full custom?
