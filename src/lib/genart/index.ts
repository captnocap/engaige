/**
 * GenArt - Generative Art Engine
 *
 * Barrel export for the generative art system.
 */

// Types
export type {
  AudioFeatures,
  BeatInfo,
  TunerParams,
  EnergyCurveType,
  Keyframe,
  GenArtConfig,
  ModeCategory,
  ModeInfo,
} from './types.js';

export { DEFAULT_TUNER_PARAMS, TUNER_PRESETS } from './types.js';

// Engine
export { GenArtEngine } from './engine.js';

// Procedural Driver
export { ProceduralDriver } from './procedural-driver.js';

// Mode Registry
export {
  MODE_LIST,
  MODE_MAP,
  getModesByCategory,
  loadMode,
  isValidMode,
  is3DMode,
} from './mode-registry.js';

// Palette
export {
  pitchTempoToColor,
  pitchTempoToRGB,
  frequencyToColor,
  frequencyToRGB,
  spectrumToColorArray,
  getDominantColor,
} from './palette.js';
