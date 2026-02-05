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

  // Timing
  duration: number;        // seconds (0 for static)
  loop: boolean;

  // Aspect ratio
  aspect: '1:1' | '9:16' | '16:9' | '4:3';

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

## Platform Integration

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
      "aspect": "16:9",
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
Short, looping, vertical content.

```json
{
  "render_type": "video",
  "duration": 15,
  "loop": true,
  "aspect": "9:16",
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

### MyFace Animated Posts
Square format, shorter, social content.

```json
{
  "render_type": "animated",
  "duration": 5,
  "loop": true,
  "aspect": "1:1",
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
Available presets:
- Base: chill_gradient, chaos_static, cozy_warmth, dark_void, retro_plasma
- Overlay: vhs_retro, film_classic, glitch_chaos, cozy_vintage, clean
- Text style: meme_impact, tiktok_caption, dramatic, chaotic, aesthetic

Structure your content with text segments that have timing.
Keep videos under 30 seconds for social posts, up to 5 minutes for VidTube.
```

### Example NPC Output
```json
{
  "action": "create_video",
  "platform": "instasnap_story",
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
