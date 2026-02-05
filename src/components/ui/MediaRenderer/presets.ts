/**
 * MediaRenderer Presets
 *
 * Named presets that NPCs can reference instead of full configs.
 * These get expanded to full layer configs at render time.
 */

import type {
  BaseLayer,
  OverlayLayer,
  TextStyle,
  BasePreset,
  OverlayPreset,
  TextStylePreset,
} from './types.js';

// ============================================================================
// BASE PRESETS
// ============================================================================

export const BASE_PRESETS: Record<BasePreset, BaseLayer> = {
  chill_gradient: {
    type: 'gradient',
    colors: ['#667eea', '#764ba2', '#6B8DD6'],
    angle: 135,
    animated: true,
  },
  chaos_static: {
    type: 'effect',
    effect: 'noise_static',
    params: { intensity: 0.8, speed: 2 },
  },
  cozy_warmth: {
    type: 'gradient',
    colors: ['#f6d365', '#fda085', '#f6d365'],
    angle: 45,
    animated: true,
  },
  dark_void: {
    type: 'gradient',
    colors: ['#0f0f0f', '#1a1a2e', '#0f0f0f'],
    angle: 180,
    animated: true,
  },
  retro_plasma: {
    type: 'effect',
    effect: 'plasma',
    params: { speed: 0.5, colorShift: true },
  },
  matrix_vibes: {
    type: 'effect',
    effect: 'matrix_rain',
    params: { color: '#00ff00', speed: 1, density: 0.8 },
  },
  dreamy_clouds: {
    type: 'effect',
    effect: 'gradient_flow',
    params: { colors: ['#a8edea', '#fed6e3', '#d299c2'], speed: 0.3 },
  },
};

// ============================================================================
// OVERLAY PRESETS
// ============================================================================

export const OVERLAY_PRESETS: Record<OverlayPreset, OverlayLayer> = {
  vhs_retro: {
    effects: [
      { type: 'vhs_noise', intensity: 0.4 },
      { type: 'scan_lines', intensity: 0.3 },
      { type: 'chromatic_aberration', intensity: 0.2 },
    ],
  },
  film_classic: {
    effects: [
      { type: 'film_grain', intensity: 0.3 },
      { type: 'vignette', intensity: 0.4 },
      { type: 'dust_scratches', intensity: 0.2 },
    ],
  },
  glitch_chaos: {
    effects: [
      { type: 'glitch', intensity: 0.6 },
      { type: 'chromatic_aberration', intensity: 0.4 },
    ],
  },
  cozy_vintage: {
    effects: [
      { type: 'film_grain', intensity: 0.2 },
      { type: 'vignette', intensity: 0.3 },
      { type: 'light_leak', intensity: 0.2 },
    ],
  },
  clean: {
    effects: [],
  },
};

// ============================================================================
// TEXT STYLE PRESETS
// ============================================================================

export const TEXT_STYLE_PRESETS: Record<TextStylePreset, TextStyle> = {
  meme_impact: {
    font: 'Impact, sans-serif',
    size: 'large',
    color: '#ffffff',
    stroke_color: '#000000',
    stroke_width: 3,
    shadow: false,
  },
  tiktok_caption: {
    font: 'system-ui, -apple-system, sans-serif',
    size: 'medium',
    color: '#ffffff',
    stroke_color: undefined,
    stroke_width: 0,
    shadow: true,
    background: 'rgba(0, 0, 0, 0.5)',
    padding: 8,
  },
  dramatic: {
    font: 'Georgia, serif',
    size: 'huge',
    color: '#ffffff',
    stroke_color: undefined,
    stroke_width: 0,
    shadow: true,
  },
  chaotic: {
    font: '"Comic Sans MS", cursive',
    size: 'large',
    color: '#ff00ff',
    stroke_color: '#00ffff',
    stroke_width: 2,
    shadow: false,
  },
  aesthetic: {
    font: '"Playfair Display", serif',
    size: 'medium',
    color: '#f0e6d3',
    stroke_color: undefined,
    stroke_width: 0,
    shadow: false,
  },
};

// ============================================================================
// PRESET HELPERS
// ============================================================================

export function getBasePreset(name: BasePreset): BaseLayer {
  return BASE_PRESETS[name] ?? BASE_PRESETS.chill_gradient;
}

export function getOverlayPreset(name: OverlayPreset): OverlayLayer {
  return OVERLAY_PRESETS[name] ?? OVERLAY_PRESETS.clean;
}

export function getTextStylePreset(name: TextStylePreset): TextStyle {
  return TEXT_STYLE_PRESETS[name] ?? TEXT_STYLE_PRESETS.tiktok_caption;
}

// ============================================================================
// INTENT → PRESET SUGGESTIONS
// ============================================================================

import type { IntentType } from './types.js';

export const INTENT_STYLE_SUGGESTIONS: Record<
  IntentType,
  { base: BasePreset; overlay: OverlayPreset; text: TextStylePreset }
> = {
  // Positive
  share_joy: { base: 'cozy_warmth', overlay: 'clean', text: 'tiktok_caption' },
  inform: { base: 'chill_gradient', overlay: 'clean', text: 'tiktok_caption' },
  entertain: { base: 'chill_gradient', overlay: 'clean', text: 'meme_impact' },
  create_art: { base: 'dreamy_clouds', overlay: 'film_classic', text: 'aesthetic' },
  promote: { base: 'chill_gradient', overlay: 'clean', text: 'tiktok_caption' },
  connect: { base: 'cozy_warmth', overlay: 'cozy_vintage', text: 'tiktok_caption' },

  // Processing
  vent: { base: 'dark_void', overlay: 'vhs_retro', text: 'dramatic' },
  cope: { base: 'chill_gradient', overlay: 'film_classic', text: 'aesthetic' },
  confess: { base: 'dark_void', overlay: 'film_classic', text: 'dramatic' },
  seek_validation: { base: 'cozy_warmth', overlay: 'cozy_vintage', text: 'tiktok_caption' },
  seek_advice: { base: 'chill_gradient', overlay: 'clean', text: 'tiktok_caption' },

  // Drama
  subtweet: { base: 'dark_void', overlay: 'vhs_retro', text: 'aesthetic' },
  call_out: { base: 'chaos_static', overlay: 'glitch_chaos', text: 'meme_impact' },
  flex: { base: 'cozy_warmth', overlay: 'cozy_vintage', text: 'aesthetic' },
  rage_bait: { base: 'chaos_static', overlay: 'glitch_chaos', text: 'chaotic' },
  humble_brag: { base: 'cozy_warmth', overlay: 'clean', text: 'aesthetic' },
  pity_farm: { base: 'dark_void', overlay: 'film_classic', text: 'dramatic' },
  stir_drama: { base: 'chaos_static', overlay: 'vhs_retro', text: 'meme_impact' },
  defend_self: { base: 'dark_void', overlay: 'vhs_retro', text: 'dramatic' },
  clap_back: { base: 'chaos_static', overlay: 'glitch_chaos', text: 'meme_impact' },

  // Relationship
  thirst_trap: { base: 'cozy_warmth', overlay: 'cozy_vintage', text: 'aesthetic' },
  mark_territory: { base: 'cozy_warmth', overlay: 'cozy_vintage', text: 'aesthetic' },
  make_jealous: { base: 'cozy_warmth', overlay: 'cozy_vintage', text: 'aesthetic' },
  love_bomb: { base: 'cozy_warmth', overlay: 'clean', text: 'dramatic' },
  soft_launch: { base: 'dreamy_clouds', overlay: 'cozy_vintage', text: 'aesthetic' },
  hard_launch: { base: 'cozy_warmth', overlay: 'clean', text: 'tiktok_caption' },
};
