/**
 * MediaRenderer - Universal content rendering system
 *
 * Usage:
 *   import { MediaRenderer } from '../ui/MediaRenderer'
 *   import type { RenderConfig } from '../ui/MediaRenderer'
 *
 * See docs/MEDIA_RENDERER_SYSTEM.md for full specification.
 */

// Main component
export { MediaRenderer } from './MediaRenderer.js';
export { default } from './MediaRenderer.js';

// Layer renderers (for advanced usage)
export { BaseLayerRenderer } from './BaseLayerRenderer.js';
export { OverlayLayerRenderer } from './OverlayLayerRenderer.js';
export { TextLayerRenderer } from './TextLayerRenderer.js';

// Presets
export {
  BASE_PRESETS,
  OVERLAY_PRESETS,
  TEXT_STYLE_PRESETS,
  INTENT_STYLE_SUGGESTIONS,
  getBasePreset,
  getOverlayPreset,
  getTextStylePreset,
} from './presets.js';

// Types
export type {
  // Main config
  RenderConfig,
  MediaRendererProps,

  // Viewport
  ViewportConfig,
  AspectRatio,
  PlatformHint,
  SafeZone,

  // Intent
  ContentIntent,
  IntentType,

  // Layers
  BaseLayer,
  BaseEffectType,
  PlaceholderType,
  OverlayLayer,
  OverlayEffect,
  OverlayEffectType,
  TextLayer,
  TextSegment,
  TextStyle,
  TextEffectType,
  TextPosition,

  // Presets
  BasePreset,
  OverlayPreset,
  TextStylePreset,
} from './types.js';

// Constants
export { PLATFORM_SAFE_ZONES, ASPECT_RATIOS } from './types.js';
