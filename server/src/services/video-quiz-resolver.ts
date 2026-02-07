/**
 * Video Quiz Resolver
 *
 * Deterministic mapping from quiz answers to GenArtConfig.
 * Each answer combination produces unique visual parameters.
 */

import type { QuizAnswers } from './video-quiz.js';

// ============================================================================
// GenArt Types (mirrors client-side types)
// ============================================================================

interface TunerParams {
  decay: number;
  sensitivity: number;
  feedback: number;
  bassWeight: number;
  midWeight: number;
  highWeight: number;
  colorDrift: number;
  chaos: number;
}

type EnergyCurveType =
  | 'steady' | 'build_up' | 'pulse' | 'chaotic'
  | 'calm_to_storm' | 'drop' | 'breathe';

interface GenArtConfig {
  mode: string;
  tunerParams: TunerParams;
  energyCurve: EnergyCurveType;
  bpm: number;
  pitch: number;
}

// ============================================================================
// Mode Pools
// ============================================================================

const AESTHETIC_MODE_POOLS: Record<QuizAnswers['aesthetic'], { modes: string[]; weights: number[] }> = {
  cosmic: {
    modes: ['constellation', 'nebula', 'spirograph'],
    weights: [0.4, 0.35, 0.25],
  },
  organic: {
    modes: ['mycelium', 'flow', 'cellular'],
    weights: [0.4, 0.35, 0.25],
  },
  geometric: {
    modes: ['mandala', 'rings', 'cymatics', 'voronoi'],
    weights: [0.3, 0.25, 0.25, 0.2],
  },
  terrain: {
    modes: ['terrain', 'contours', 'cymatics'],
    weights: [0.45, 0.35, 0.2],
  },
  digital: {
    modes: ['stainedglass', 'geometry', 'tunnel'],
    weights: [0.35, 0.35, 0.3],
  },
};

// ============================================================================
// Mood → Energy Curve
// ============================================================================

const MOOD_CURVE_MAP: Record<QuizAnswers['mood'], EnergyCurveType> = {
  contemplative: 'breathe',
  joyful: 'pulse',
  intense: 'build_up',
  chaotic: 'chaotic',
  melancholic: 'calm_to_storm',
};

// ============================================================================
// Intensity → BPM + Sensitivity
// ============================================================================

const INTENSITY_MAP: Record<QuizAnswers['intensity'], { bpm: number; sensitivity: number }> = {
  whisper: { bpm: 60, sensitivity: 0.2 },
  conversation: { bpm: 100, sensitivity: 0.4 },
  shout: { bpm: 140, sensitivity: 0.7 },
  scream: { bpm: 180, sensitivity: 0.9 },
};

// ============================================================================
// Texture → Tuner Params
// ============================================================================

const TEXTURE_MAP: Record<QuizAnswers['texture'], Partial<TunerParams>> = {
  smooth: { decay: 0.8, chaos: 0.1, feedback: 0.4 },
  gritty: { decay: 0.2, chaos: 0.5, feedback: 0.2 },
  crystalline: { decay: 0.4, chaos: 0.15, feedback: 0.1 },
  hazy: { decay: 0.9, chaos: 0.2, feedback: 0.6 },
};

// ============================================================================
// Temperature → Pitch
// ============================================================================

const TEMPERATURE_PITCH_MAP: Record<QuizAnswers['temperature'], { pitch: number; colorDrift: number }> = {
  warm: { pitch: 0.15, colorDrift: 0.15 },
  cool: { pitch: 0.7, colorDrift: 0.15 },
  neutral: { pitch: 0.45, colorDrift: 0.1 },
  shifting: { pitch: 0.5, colorDrift: 0.8 },
};

// ============================================================================
// Mood → Frequency Weights
// ============================================================================

const MOOD_WEIGHTS_MAP: Record<QuizAnswers['mood'], Partial<TunerParams>> = {
  contemplative: { bassWeight: 0.3, midWeight: 0.6, highWeight: 0.3 },
  joyful: { bassWeight: 0.5, midWeight: 0.6, highWeight: 0.7 },
  intense: { bassWeight: 0.8, midWeight: 0.5, highWeight: 0.7 },
  chaotic: { bassWeight: 1.0, midWeight: 0.8, highWeight: 1.0 },
  melancholic: { bassWeight: 0.4, midWeight: 0.5, highWeight: 0.2 },
};

// ============================================================================
// Overlay Suggestion (for backwards compat with text-based configs)
// ============================================================================

const TEXTURE_OVERLAY_MAP: Record<QuizAnswers['texture'], string> = {
  smooth: 'clean',
  gritty: 'vhs_retro',
  crystalline: 'clean',
  hazy: 'cozy_vintage',
};

// ============================================================================
// Resolver
// ============================================================================

function weightedRandom(items: string[], weights: number[], seed?: number): string {
  // Simple weighted random selection
  const total = weights.reduce((a, b) => a + b, 0);
  let r = (seed !== undefined ? pseudoRandom(seed) : Math.random()) * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

function pseudoRandom(seed: number): number {
  // Simple hash for deterministic randomness
  let x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

export function resolveQuiz(answers: QuizAnswers, seed?: number): GenArtConfig {
  // 1. Pick mode from aesthetic pool
  const pool = AESTHETIC_MODE_POOLS[answers.aesthetic];
  const mode = weightedRandom(pool.modes, pool.weights, seed);

  // 2. Energy curve from mood
  const energyCurve = MOOD_CURVE_MAP[answers.mood];

  // 3. BPM + sensitivity from intensity
  const { bpm, sensitivity } = INTENSITY_MAP[answers.intensity];

  // 4. Texture params
  const textureParams = TEXTURE_MAP[answers.texture];

  // 5. Temperature → pitch + colorDrift
  const { pitch, colorDrift } = TEMPERATURE_PITCH_MAP[answers.temperature];

  // 6. Mood → frequency weights
  const moodWeights = MOOD_WEIGHTS_MAP[answers.mood];

  // Merge all into TunerParams
  const tunerParams: TunerParams = {
    decay: textureParams.decay ?? 0.5,
    sensitivity,
    feedback: textureParams.feedback ?? 0.3,
    bassWeight: moodWeights.bassWeight ?? 0.5,
    midWeight: moodWeights.midWeight ?? 0.5,
    highWeight: moodWeights.highWeight ?? 0.5,
    colorDrift,
    chaos: textureParams.chaos ?? 0.3,
  };

  return {
    mode,
    tunerParams,
    energyCurve,
    bpm,
    pitch,
  };
}

/**
 * Get the suggested overlay preset based on quiz answers.
 */
export function resolveOverlay(answers: QuizAnswers): string {
  return TEXTURE_OVERLAY_MAP[answers.texture];
}

/**
 * Suggest a text style based on mood + intensity.
 */
export function resolveTextStyle(answers: QuizAnswers): string {
  if (answers.mood === 'chaotic' || answers.intensity === 'scream') return 'chaotic';
  if (answers.mood === 'contemplative' || answers.mood === 'melancholic') return 'aesthetic';
  if (answers.intensity === 'shout') return 'dramatic';
  if (answers.mood === 'intense') return 'meme_impact';
  return 'tiktok_caption';
}
