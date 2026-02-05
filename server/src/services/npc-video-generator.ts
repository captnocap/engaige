/**
 * NPC Video Generator
 *
 * Enables NPCs to create video content using the MediaRenderer system.
 * NPCs output simplified configs using preset names, which get expanded
 * to full RenderConfig objects at runtime.
 *
 * This service:
 * 1. Provides prompt instructions for teaching NPCs to create videos
 * 2. Validates NPC-generated configs
 * 3. Expands preset-based configs to full RenderConfigs
 * 4. Integrates with the AI queue system
 */

import { getDB } from '../db/index.js';
import { eventBus, EventTypes } from '../events/index.js';
import { generateNPCPost } from './ai.js';
import { getNPCById } from './npc.js';
import { aiQueue, Priority } from './ai-queue.js';
import type { NPC } from './npc.js';

// ============================================================================
// SIMPLIFIED NPC CONFIG SCHEMA
// ============================================================================

/**
 * NPCs generate this simplified format using preset names.
 * Much easier for AI to output than full configs.
 */
export interface NPCVideoConfig {
  // What the NPC wants to express
  intent: {
    primary: IntentType;
    secondary?: IntentType;
    energy: 'low' | 'medium' | 'high' | 'unhinged';
    target?: 'general' | 'someone_specific' | 'self';
    context?: string; // Brief note about why
  };

  // Platform determines aspect ratio and safe zones
  platform: PlatformType;

  // Style presets (NPC picks from named options)
  style: {
    base: BasePresetName;
    overlay: OverlayPresetName;
    text_style: TextStylePresetName;
  };

  // The actual text content
  text: TextSegmentConfig[];

  // Duration in seconds (3-30)
  duration: number;

  // Whether to loop
  loop: boolean;
}

export interface TextSegmentConfig {
  text: string;
  start: number; // When to show (seconds)
  position: 'top' | 'center' | 'bottom';
  effect: TextEffectName;
}

// Type definitions matching the frontend
export type IntentType =
  | 'share_joy' | 'inform' | 'entertain' | 'create_art' | 'promote' | 'connect'
  | 'vent' | 'cope' | 'confess' | 'seek_validation' | 'seek_advice'
  | 'subtweet' | 'call_out' | 'flex' | 'rage_bait' | 'humble_brag'
  | 'pity_farm' | 'stir_drama' | 'defend_self' | 'clap_back'
  | 'thirst_trap' | 'mark_territory' | 'make_jealous' | 'love_bomb' | 'soft_launch' | 'hard_launch';

export type PlatformType =
  | 'instasnap_story' | 'instasnap_post' | 'instasnap_reel'
  | 'vidtube_video' | 'vidtube_short'
  | 'myface_post' | 'myface_story'
  | 'threadit_embed';

export type BasePresetName =
  | 'chill_gradient' | 'chaos_static' | 'cozy_warmth'
  | 'dark_void' | 'retro_plasma' | 'matrix_vibes' | 'dreamy_clouds';

export type OverlayPresetName =
  | 'vhs_retro' | 'film_classic' | 'glitch_chaos' | 'cozy_vintage' | 'clean';

export type TextStylePresetName =
  | 'meme_impact' | 'tiktok_caption' | 'dramatic' | 'chaotic' | 'aesthetic';

export type TextEffectName =
  | 'none' | 'fade_in' | 'typewriter' | 'word_by_word' | 'slam' | 'bounce'
  | 'slide_up' | 'slide_down' | 'zoom_in' | 'zoom_out'
  | 'shake' | 'pulse' | 'rainbow' | 'glitch' | 'float';

// ============================================================================
// PROMPT INSTRUCTIONS FOR NPCs
// ============================================================================

export const VIDEO_CREATION_INSTRUCTIONS = `
## Video Creation Guide

You can create short videos by outputting JSON in the following format. Choose options that match your personality and current mood.

### Intent Types (what you're trying to express):
POSITIVE: share_joy, inform, entertain, create_art, promote, connect
PROCESSING: vent, cope, confess, seek_validation, seek_advice
DRAMA: subtweet, call_out, flex, rage_bait, humble_brag, pity_farm, stir_drama, defend_self, clap_back
RELATIONSHIP: thirst_trap, mark_territory, make_jealous, love_bomb, soft_launch, hard_launch

### Energy Levels:
- low: calm, muted, contemplative
- medium: normal energy
- high: excited, intense
- unhinged: chaotic, maximum energy

### Background Styles:
- chill_gradient: Calm purple-blue flowing gradient (good for: sharing, connecting)
- chaos_static: Noisy static (good for: venting, rage, chaos)
- cozy_warmth: Warm orange-pink gradient (good for: joy, love, thirst traps)
- dark_void: Dark moody gradient (good for: venting, confessing, drama)
- retro_plasma: Psychedelic plasma effect (good for: art, entertainment)
- matrix_vibes: Green matrix rain (good for: tech content, hacker aesthetic)
- dreamy_clouds: Soft pastel flowing colors (good for: aesthetic, soft launches)

### Overlay Effects:
- vhs_retro: VHS tape distortion (good for: nostalgia, drama, venting)
- film_classic: Film grain and vignette (good for: aesthetic, classy)
- glitch_chaos: Glitch distortion (good for: chaos, rage, calling out)
- cozy_vintage: Warm film look (good for: love content, soft aesthetic)
- clean: No overlay effects (good for: clarity, informing)

### Text Styles:
- meme_impact: Bold white text with black outline (good for: memes, calling out)
- tiktok_caption: Clean caption style with shadow (good for: general use)
- dramatic: Large serif text (good for: drama, confessions)
- chaotic: Wild colorful text (good for: unhinged energy)
- aesthetic: Elegant serif (good for: soft launches, art)

### Text Effects:
- fade_in: Gentle fade (calm)
- typewriter: Types out letter by letter (dramatic reveal)
- slam: Text slams in big (impact)
- bounce: Bouncy entrance (playful)
- shake: Constant shaking (anxiety, chaos)
- glitch: Text glitches (chaos)
- rainbow: Color cycling (fun)
- float: Gentle floating (dreamy)

### Example Output:
\`\`\`json
{
  "intent": {
    "primary": "vent",
    "energy": "high",
    "target": "general",
    "context": "bad day at work"
  },
  "platform": "instasnap_story",
  "style": {
    "base": "dark_void",
    "overlay": "vhs_retro",
    "text_style": "dramatic"
  },
  "text": [
    { "text": "when they say", "start": 0, "position": "top", "effect": "fade_in" },
    { "text": "'we need to talk'", "start": 1.5, "position": "center", "effect": "slam" },
    { "text": "and it's nothing good", "start": 3, "position": "bottom", "effect": "typewriter" }
  ],
  "duration": 6,
  "loop": true
}
\`\`\`
`;

// ============================================================================
// VALIDATION
// ============================================================================

const VALID_INTENTS = new Set([
  'share_joy', 'inform', 'entertain', 'create_art', 'promote', 'connect',
  'vent', 'cope', 'confess', 'seek_validation', 'seek_advice',
  'subtweet', 'call_out', 'flex', 'rage_bait', 'humble_brag',
  'pity_farm', 'stir_drama', 'defend_self', 'clap_back',
  'thirst_trap', 'mark_territory', 'make_jealous', 'love_bomb', 'soft_launch', 'hard_launch',
]);

const VALID_PLATFORMS = new Set([
  'instasnap_story', 'instasnap_post', 'instasnap_reel',
  'vidtube_video', 'vidtube_short',
  'myface_post', 'myface_story',
  'threadit_embed',
]);

const VALID_BASE_PRESETS = new Set([
  'chill_gradient', 'chaos_static', 'cozy_warmth', 'dark_void',
  'retro_plasma', 'matrix_vibes', 'dreamy_clouds',
]);

const VALID_OVERLAY_PRESETS = new Set([
  'vhs_retro', 'film_classic', 'glitch_chaos', 'cozy_vintage', 'clean',
]);

const VALID_TEXT_STYLES = new Set([
  'meme_impact', 'tiktok_caption', 'dramatic', 'chaotic', 'aesthetic',
]);

const VALID_TEXT_EFFECTS = new Set([
  'none', 'fade_in', 'typewriter', 'word_by_word', 'slam', 'bounce',
  'slide_up', 'slide_down', 'zoom_in', 'zoom_out',
  'shake', 'pulse', 'rainbow', 'glitch', 'float',
]);

export function validateNPCVideoConfig(config: unknown): { valid: boolean; errors: string[]; config?: NPCVideoConfig } {
  const errors: string[] = [];

  if (!config || typeof config !== 'object') {
    return { valid: false, errors: ['Config must be an object'] };
  }

  const c = config as Record<string, unknown>;

  // Check required fields
  if (!c.intent || typeof c.intent !== 'object') {
    errors.push('Missing or invalid intent');
  } else {
    const intent = c.intent as Record<string, unknown>;
    if (!intent.primary || !VALID_INTENTS.has(intent.primary as string)) {
      errors.push(`Invalid intent.primary: ${intent.primary}`);
    }
    if (!intent.energy || !['low', 'medium', 'high', 'unhinged'].includes(intent.energy as string)) {
      errors.push(`Invalid intent.energy: ${intent.energy}`);
    }
  }

  if (!c.platform || !VALID_PLATFORMS.has(c.platform as string)) {
    errors.push(`Invalid platform: ${c.platform}`);
  }

  if (!c.style || typeof c.style !== 'object') {
    errors.push('Missing or invalid style');
  } else {
    const style = c.style as Record<string, unknown>;
    if (!style.base || !VALID_BASE_PRESETS.has(style.base as string)) {
      errors.push(`Invalid style.base: ${style.base}`);
    }
    if (!style.overlay || !VALID_OVERLAY_PRESETS.has(style.overlay as string)) {
      errors.push(`Invalid style.overlay: ${style.overlay}`);
    }
    if (!style.text_style || !VALID_TEXT_STYLES.has(style.text_style as string)) {
      errors.push(`Invalid style.text_style: ${style.text_style}`);
    }
  }

  if (!Array.isArray(c.text) || c.text.length === 0) {
    errors.push('Missing or empty text array');
  } else {
    (c.text as unknown[]).forEach((seg, i) => {
      if (!seg || typeof seg !== 'object') {
        errors.push(`text[${i}] must be an object`);
        return;
      }
      const s = seg as Record<string, unknown>;
      if (typeof s.text !== 'string') errors.push(`text[${i}].text must be string`);
      if (typeof s.start !== 'number') errors.push(`text[${i}].start must be number`);
      if (!['top', 'center', 'bottom'].includes(s.position as string)) {
        errors.push(`text[${i}].position must be top/center/bottom`);
      }
      if (!VALID_TEXT_EFFECTS.has(s.effect as string)) {
        errors.push(`text[${i}].effect invalid: ${s.effect}`);
      }
    });
  }

  if (typeof c.duration !== 'number' || c.duration < 3 || c.duration > 30) {
    errors.push('Duration must be 3-30 seconds');
  }

  if (typeof c.loop !== 'boolean') {
    errors.push('Loop must be boolean');
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return { valid: true, errors: [], config: c as unknown as NPCVideoConfig };
}

// ============================================================================
// EXPAND TO FULL RENDER CONFIG
// ============================================================================

// Platform to aspect ratio mapping
const PLATFORM_ASPECTS: Record<PlatformType, string> = {
  instasnap_story: '9:16',
  instasnap_post: '1:1',
  instasnap_reel: '9:16',
  vidtube_video: '16:9',
  vidtube_short: '9:16',
  myface_post: '1:1',
  myface_story: '9:16',
  threadit_embed: '16:9',
};

// Base preset expansions (matching frontend presets.ts)
const BASE_PRESETS: Record<BasePresetName, object> = {
  chill_gradient: { type: 'gradient', colors: ['#667eea', '#764ba2', '#6B8DD6'], angle: 135, animated: true },
  chaos_static: { type: 'effect', effect: 'noise_static', params: { intensity: 0.8, speed: 2 } },
  cozy_warmth: { type: 'gradient', colors: ['#f6d365', '#fda085', '#f6d365'], angle: 45, animated: true },
  dark_void: { type: 'gradient', colors: ['#0f0f0f', '#1a1a2e', '#0f0f0f'], angle: 180, animated: true },
  retro_plasma: { type: 'effect', effect: 'plasma', params: { speed: 0.5, colorShift: true } },
  matrix_vibes: { type: 'effect', effect: 'matrix_rain', params: { color: '#00ff00', speed: 1, density: 0.8 } },
  dreamy_clouds: { type: 'effect', effect: 'gradient_flow', params: { colors: ['#a8edea', '#fed6e3', '#d299c2'], speed: 0.3 } },
};

// Overlay preset expansions
const OVERLAY_PRESETS: Record<OverlayPresetName, object> = {
  vhs_retro: { effects: [{ type: 'vhs_noise', intensity: 0.4 }, { type: 'scan_lines', intensity: 0.3 }, { type: 'chromatic_aberration', intensity: 0.2 }] },
  film_classic: { effects: [{ type: 'film_grain', intensity: 0.3 }, { type: 'vignette', intensity: 0.4 }, { type: 'dust_scratches', intensity: 0.2 }] },
  glitch_chaos: { effects: [{ type: 'glitch', intensity: 0.6 }, { type: 'chromatic_aberration', intensity: 0.4 }] },
  cozy_vintage: { effects: [{ type: 'film_grain', intensity: 0.2 }, { type: 'vignette', intensity: 0.3 }, { type: 'light_leak', intensity: 0.2 }] },
  clean: { effects: [] },
};

// Text style preset expansions
const TEXT_STYLE_PRESETS: Record<TextStylePresetName, object> = {
  meme_impact: { font: 'Impact, sans-serif', size: 'large', color: '#ffffff', stroke_color: '#000000', stroke_width: 3, shadow: false },
  tiktok_caption: { font: 'system-ui, -apple-system, sans-serif', size: 'medium', color: '#ffffff', shadow: true, background: 'rgba(0, 0, 0, 0.5)', padding: 8 },
  dramatic: { font: 'Georgia, serif', size: 'huge', color: '#ffffff', shadow: true },
  chaotic: { font: '"Comic Sans MS", cursive', size: 'large', color: '#ff00ff', stroke_color: '#00ffff', stroke_width: 2, shadow: false },
  aesthetic: { font: '"Playfair Display", serif', size: 'medium', color: '#f0e6d3', shadow: false },
};

export function expandToRenderConfig(npcConfig: NPCVideoConfig): object {
  const aspect = PLATFORM_ASPECTS[npcConfig.platform] || '9:16';

  return {
    render_type: 'video',
    intent: {
      primary: npcConfig.intent.primary,
      secondary: npcConfig.intent.secondary,
      energy: npcConfig.intent.energy,
      target: npcConfig.intent.target ? {
        type: npcConfig.intent.target === 'someone_specific' ? 'specific_npc' : npcConfig.intent.target,
      } : undefined,
      context: npcConfig.intent.context,
    },
    viewport: {
      aspect,
      platform_hint: npcConfig.platform,
      fit: 'cover',
    },
    duration: npcConfig.duration,
    loop: npcConfig.loop,
    layers: {
      base: BASE_PRESETS[npcConfig.style.base] || BASE_PRESETS.chill_gradient,
      overlay: OVERLAY_PRESETS[npcConfig.style.overlay] || OVERLAY_PRESETS.clean,
      text: {
        default_style: TEXT_STYLE_PRESETS[npcConfig.style.text_style] || TEXT_STYLE_PRESETS.tiktok_caption,
        segments: npcConfig.text.map(seg => ({
          start: seg.start,
          text: seg.text,
          position: seg.position,
          enter_effect: seg.effect,
        })),
      },
    },
  };
}

// ============================================================================
// AI GENERATION
// ============================================================================

export interface VideoGenerationOptions {
  prompt?: string; // Optional prompt to guide the video content
  context?: string; // Additional context (recent events, relationship state)
  platform?: PlatformType; // Override platform
  featureCategory?: string;
}

/**
 * Generate a video config from an NPC using the AI system.
 * This creates a JSON prompt that asks the NPC to output video config JSON.
 */
export async function generateNPCVideo(
  npcId: string,
  options: VideoGenerationOptions = {}
): Promise<{ success: boolean; renderConfig?: object; npcConfig?: NPCVideoConfig; error?: string }> {
  const npc = getNPCById(npcId);
  if (!npc) {
    return { success: false, error: `NPC ${npcId} not found` };
  }

  const featureCategory = options.featureCategory || 'autonomous_posts';
  const platform = options.platform || 'instasnap_story';

  try {
    // Build a special prompt that asks for JSON output
    const videoPrompt = buildVideoPrompt(npc, platform, options);

    // Use the existing generateNPCPost which handles all the AI provider logic
    // We pass a custom prompt that asks for JSON video config
    const response = await generateNPCPost(
      npcId,
      platform,
      videoPrompt,
      featureCategory,
      { enable_validation: false } // Skip validation since we're getting JSON, not regular text
    );

    // Extract JSON from response (AI might wrap it in markdown code blocks)
    const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, response];
    const jsonStr = jsonMatch[1]?.trim() || response.trim();

    // Parse JSON
    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      // Try to find JSON object in the response
      const objectMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (objectMatch) {
        try {
          parsed = JSON.parse(objectMatch[0]);
        } catch {
          return { success: false, error: 'Failed to parse AI response as JSON' };
        }
      } else {
        return { success: false, error: 'Failed to parse AI response as JSON' };
      }
    }

    // Validate
    const validation = validateNPCVideoConfig(parsed);
    if (!validation.valid) {
      console.log('[Video Gen] Validation failed:', validation.errors);
      return { success: false, error: `Invalid config: ${validation.errors.join(', ')}` };
    }

    // Expand to full render config
    const renderConfig = expandToRenderConfig(validation.config!);

    // Emit event
    eventBus.fire(EventTypes.SOCIAL_POST_CREATED, {
      npc_id: npcId,
      content_type: 'video',
      platform,
      intent: validation.config!.intent.primary,
    }, {
      source: 'npc-video-generator',
      npc_id: npcId,
      importance: 0.6,
    });

    return {
      success: true,
      renderConfig,
      npcConfig: validation.config,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    eventBus.fire(EventTypes.AI_ERROR, {
      error: message,
      operation: 'video_generation',
    }, {
      source: 'npc-video-generator',
      npc_id: npcId,
    });

    return { success: false, error: message };
  }
}

function buildVideoPrompt(npc: NPC, platform: PlatformType, options: VideoGenerationOptions): string {
  let prompt = `Create a short video for ${platform}. Output ONLY valid JSON matching the video config format.

${VIDEO_CREATION_INSTRUCTIONS}

Consider your personality when choosing styles. The video should feel authentic to who you are.`;

  if (options.prompt) {
    prompt += `\n\nContent direction: ${options.prompt}`;
  }

  if (options.context) {
    prompt += `\n\nCurrent context: ${options.context}`;
  }

  prompt += `\n\nRemember to:
1. Choose an intent that matches what you want to express
2. Pick styles that match your personality
3. Write text that sounds like YOU, not generic
4. Time your text segments appropriately for the duration
5. Output ONLY the JSON video config, nothing else`;

  return prompt;
}

// ============================================================================
// QUEUED VERSION
// ============================================================================

export interface QueuedVideoResult {
  status: 'completed' | 'deferred' | 'failed';
  result?: object;
  npcConfig?: NPCVideoConfig;
  error?: string;
}

export async function queuedGenerateNPCVideo(
  npcId: string,
  options: VideoGenerationOptions & { priority?: Priority } = {}
): Promise<QueuedVideoResult> {
  const priority = options.priority ?? Priority.MEDIUM;

  const result = await aiQueue.enqueue<{ success: boolean; renderConfig?: object; npcConfig?: NPCVideoConfig; error?: string }>({
    type: 'npc_video',
    execute: async () => generateNPCVideo(npcId, options),
    priority,
    featureCategory: options.featureCategory || 'autonomous_posts',
    metadata: {
      npc_id: npcId,
      description: 'NPC video generation',
    },
  });

  if (result.status === 'completed' && result.result) {
    if (result.result.success) {
      return {
        status: 'completed',
        result: result.result.renderConfig,
        npcConfig: result.result.npcConfig,
      };
    }
    return { status: 'failed', error: result.result.error };
  }

  return { status: result.status as 'deferred' | 'failed', error: result.error };
}

// ============================================================================
// STORE VIDEO CONFIG TO DATABASE
// ============================================================================

export function storeVideoContent(
  npcId: string,
  platform: string,
  renderConfig: object,
  npcConfig: NPCVideoConfig,
  caption?: string
): string {
  const db = getDB('game');
  const id = crypto.randomUUID();

  db.run(`
    INSERT INTO site_content (
      id, site_id, slug, content_type, title, metadata, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
  `, [
    id,
    platform,
    `video-${id.slice(0, 8)}`,
    'video',
    caption || `Video by NPC`,
    JSON.stringify({
      npc_id: npcId,
      render_config: renderConfig,
      npc_config: npcConfig,
      caption,
    }),
  ]);

  return id;
}

export default {
  generateNPCVideo,
  queuedGenerateNPCVideo,
  validateNPCVideoConfig,
  expandToRenderConfig,
  storeVideoContent,
  VIDEO_CREATION_INSTRUCTIONS,
};
