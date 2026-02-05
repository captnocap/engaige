/**
 * MediaRenderer Type Definitions
 *
 * Universal content rendering system for NPC-generated media.
 * See docs/MEDIA_RENDERER_SYSTEM.md for full specification.
 */

// ============================================================================
// VIEWPORT / FRAME CONSTRAINTS
// ============================================================================

export type AspectRatio = '1:1' | '4:5' | '9:16' | '16:9' | '4:3' | '21:9';

export type PlatformHint =
  | 'instasnap_story'
  | 'instasnap_post'
  | 'instasnap_reel'
  | 'vidtube_video'
  | 'vidtube_short'
  | 'myface_post'
  | 'myface_story'
  | 'threadit_embed'
  | 'thumbnail';

export interface SafeZone {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface ViewportConfig {
  aspect: AspectRatio;
  platform_hint?: PlatformHint;
  safe_zone?: SafeZone;
  fit: 'contain' | 'cover' | 'fill';
  letterbox_color?: string;
}

// Platform-specific safe zones
export const PLATFORM_SAFE_ZONES: Record<PlatformHint, SafeZone> = {
  instasnap_story: { top: 12, bottom: 20, left: 5, right: 5 },
  instasnap_reel: { top: 10, bottom: 25, left: 5, right: 15 },
  instasnap_post: { top: 0, bottom: 0, left: 0, right: 0 },
  vidtube_video: { top: 5, bottom: 15, left: 5, right: 5 },
  vidtube_short: { top: 8, bottom: 20, left: 5, right: 12 },
  myface_post: { top: 0, bottom: 0, left: 0, right: 0 },
  myface_story: { top: 10, bottom: 15, left: 5, right: 5 },
  threadit_embed: { top: 0, bottom: 10, left: 0, right: 0 },
  thumbnail: { top: 0, bottom: 0, left: 0, right: 0 },
};

// Aspect ratio to numeric value
export const ASPECT_RATIOS: Record<AspectRatio, number> = {
  '1:1': 1,
  '4:5': 4 / 5,
  '9:16': 9 / 16,
  '16:9': 16 / 9,
  '4:3': 4 / 3,
  '21:9': 21 / 9,
};

// ============================================================================
// CREATOR INTENT
// ============================================================================

export type IntentType =
  // Positive/Neutral
  | 'share_joy'
  | 'inform'
  | 'entertain'
  | 'create_art'
  | 'promote'
  | 'connect'
  // Processing/Coping
  | 'vent'
  | 'cope'
  | 'confess'
  | 'seek_validation'
  | 'seek_advice'
  // Drama/Conflict
  | 'subtweet'
  | 'call_out'
  | 'flex'
  | 'rage_bait'
  | 'humble_brag'
  | 'pity_farm'
  | 'stir_drama'
  | 'defend_self'
  | 'clap_back'
  // Relationship-specific
  | 'thirst_trap'
  | 'mark_territory'
  | 'make_jealous'
  | 'love_bomb'
  | 'soft_launch'
  | 'hard_launch';

export interface ContentIntent {
  primary: IntentType;
  secondary?: IntentType;
  target?: {
    type: 'general' | 'specific_npc' | 'specific_group' | 'self';
    target_id?: string;
    target_name?: string;
  };
  energy: 'low' | 'medium' | 'high' | 'unhinged';
  surface_presentation?: IntentType;
  context?: string;
}

// ============================================================================
// BASE LAYER
// ============================================================================

export type BaseEffectType =
  | 'noise_static'
  | 'color_pulse'
  | 'wave_distortion'
  | 'plasma'
  | 'matrix_rain'
  | 'starfield'
  | 'gradient_flow'
  | 'particles'
  | 'geometric'
  | 'audio_visualizer';

export type PlaceholderType =
  | 'subway_surfers'
  | 'minecraft_parkour'
  | 'satisfying_soap'
  | 'slime_stretch'
  | 'hydraulic_press';

export type BaseLayer =
  | { type: 'solid'; color: string }
  | { type: 'gradient'; colors: string[]; angle?: number; animated?: boolean }
  | { type: 'image'; image_id: string }
  | { type: 'image_url'; url: string }
  | { type: 'effect'; effect: BaseEffectType; params?: Record<string, unknown> }
  | { type: 'placeholder'; placeholder: PlaceholderType };

// ============================================================================
// OVERLAY LAYER
// ============================================================================

export type OverlayEffectType =
  | 'vhs_noise'
  | 'film_grain'
  | 'scan_lines'
  | 'vignette'
  | 'chromatic_aberration'
  | 'glitch'
  | 'dust_scratches'
  | 'light_leak'
  | 'rain'
  | 'snow';

export interface OverlayEffect {
  type: OverlayEffectType;
  intensity?: number;
  params?: Record<string, unknown>;
}

export interface OverlayLayer {
  effects: OverlayEffect[];
}

// ============================================================================
// TEXT LAYER
// ============================================================================

export type TextEffectType =
  // Entrance effects
  | 'none'
  | 'fade_in'
  | 'typewriter'
  | 'word_by_word'
  | 'slam'
  | 'bounce'
  | 'slide_up'
  | 'slide_down'
  | 'slide_left'
  | 'slide_right'
  | 'zoom_in'
  | 'zoom_out'
  // Persistent effects
  | 'shake'
  | 'pulse'
  | 'rainbow'
  | 'glitch'
  | 'float';

export type TextPosition =
  | 'top'
  | 'center'
  | 'bottom'
  | { x: number; y: number };

export interface TextStyle {
  font?: string;
  size?: 'small' | 'medium' | 'large' | 'huge';
  color?: string;
  stroke_color?: string;
  stroke_width?: number;
  shadow?: boolean;
  background?: string;
  padding?: number;
}

export interface TextSegment {
  start: number;
  end?: number;
  text: string;
  position: TextPosition;
  enter_effect?: TextEffectType;
  exit_effect?: TextEffectType;
  style?: TextStyle;
}

export interface TextLayer {
  segments: TextSegment[];
  default_style?: TextStyle;
}

// ============================================================================
// RENDER CONFIG (Main Interface)
// ============================================================================

export interface RenderConfig {
  render_type: 'static' | 'animated' | 'video';
  intent?: ContentIntent;
  viewport: ViewportConfig;
  duration: number;
  loop: boolean;
  layers: {
    base: BaseLayer;
    overlay?: OverlayLayer;
    text?: TextLayer;
  };
  audio?: {
    track: string;
    volume: number;
  };
}

// ============================================================================
// COMPONENT PROPS
// ============================================================================

export interface MediaRendererProps {
  config: RenderConfig;
  mode?: 'play' | 'thumbnail';
  autoplay?: boolean;
  muted?: boolean;
  controls?: boolean;
  thumbnailTime?: number;
  className?: string;
  onTimeUpdate?: (time: number) => void;
  onComplete?: () => void;
  onError?: (error: Error) => void;
}

// ============================================================================
// PRESETS
// ============================================================================

export type BasePreset =
  | 'chill_gradient'
  | 'chaos_static'
  | 'cozy_warmth'
  | 'dark_void'
  | 'retro_plasma'
  | 'matrix_vibes'
  | 'dreamy_clouds';

export type OverlayPreset =
  | 'vhs_retro'
  | 'film_classic'
  | 'glitch_chaos'
  | 'cozy_vintage'
  | 'clean';

export type TextStylePreset =
  | 'meme_impact'
  | 'tiktok_caption'
  | 'dramatic'
  | 'chaotic'
  | 'aesthetic';
