/**
 * ProceduralDriver
 *
 * Generates synthetic audioFeatures + beatInfo per frame.
 * This is the key bridge that lets audio-canvas visualization modes
 * work without real audio input.
 *
 * Inputs: energyCurve, bpm, pitch, tunerParams, elapsed time, optional keyframes
 * Outputs: AudioFeatures + BeatInfo each frame
 */

import type {
  AudioFeatures,
  BeatInfo,
  TunerParams,
  EnergyCurveType,
  Keyframe,
} from './types.js';

// ============================================================================
// Energy Curve Functions
// ============================================================================

type EnergyCurveFn = (t: number, duration: number) => number;

const ENERGY_CURVES: Record<EnergyCurveType, EnergyCurveFn> = {
  /** Amplitude hovers around 0.5 with gentle sine variation */
  steady: (t) => {
    return 0.5 + Math.sin(t * 0.5) * 0.1 + Math.sin(t * 1.3) * 0.05;
  },

  /** Amplitude ramps 0.2 -> 0.9 over duration */
  build_up: (t, duration) => {
    const progress = Math.min(t / duration, 1);
    const base = 0.2 + progress * 0.7;
    return base + Math.sin(t * 2) * 0.05 * progress;
  },

  /** Amplitude oscillates with a strong rhythmic pulse */
  pulse: (t) => {
    const fast = Math.sin(t * 4) * 0.3;
    const slow = Math.sin(t * 0.8) * 0.15;
    return 0.5 + fast + slow;
  },

  /** Random amplitude with sudden spikes */
  chaotic: (t) => {
    const base = 0.4;
    const noise1 = Math.sin(t * 7.3 + Math.sin(t * 3.1) * 2) * 0.3;
    const noise2 = Math.sin(t * 11.7) * 0.15;
    const spike = Math.pow(Math.sin(t * 2.7), 8) * 0.4;
    return Math.max(0, Math.min(1, base + noise1 + noise2 + spike));
  },

  /** Slow build with increasing chaos factor */
  calm_to_storm: (t, duration) => {
    const progress = Math.min(t / duration, 1);
    const base = 0.15 + progress * 0.6;
    const chaosAmount = progress * progress;
    const chaos = Math.sin(t * 5 * chaosAmount) * 0.2 * chaosAmount;
    return Math.max(0, Math.min(1, base + chaos));
  },

  /** Build to 0.9, sudden drop to 0.1 at 70%, then rebuild */
  drop: (t, duration) => {
    const progress = Math.min(t / duration, 1);
    if (progress < 0.7) {
      // Build up phase
      return 0.2 + (progress / 0.7) * 0.7 + Math.sin(t * 2) * 0.05;
    } else if (progress < 0.75) {
      // Drop phase - sharp fall
      const dropProgress = (progress - 0.7) / 0.05;
      return 0.9 - dropProgress * 0.8;
    } else {
      // Rebuild phase
      const rebuildProgress = (progress - 0.75) / 0.25;
      return 0.1 + rebuildProgress * 0.6 + Math.sin(t * 3) * 0.1;
    }
  },

  /** Slow 4-8 second sine cycle, very calm */
  breathe: (t) => {
    const cycle1 = Math.sin(t * (Math.PI / 3)) * 0.3; // ~6 second cycle
    const cycle2 = Math.sin(t * (Math.PI / 5)) * 0.1; // ~10 second cycle
    return 0.4 + cycle1 + cycle2;
  },
};

// ============================================================================
// ProceduralDriver
// ============================================================================

export class ProceduralDriver {
  private energyCurve: EnergyCurveType;
  private bpm: number;
  private pitch: number;
  private duration: number;

  // Beat tracking
  private lastBeatTime: number = -1;
  private beatInterval: number;
  private beatOnThisFrame: boolean = false;

  // Smoothing state
  private smoothAmplitude: number = 0;
  private smoothBass: number = 0;
  private smoothMid: number = 0;
  private smoothHigh: number = 0;

  // Saturation tracking
  private highEnergyFrames: number = 0;

  constructor(
    energyCurve: EnergyCurveType,
    bpm: number,
    pitch: number,
    duration: number
  ) {
    this.energyCurve = energyCurve;
    this.bpm = Math.max(40, Math.min(200, bpm));
    this.pitch = Math.max(0, Math.min(1, pitch));
    this.duration = duration;
    this.beatInterval = 60 / this.bpm;
  }

  setEnergyCurve(curve: EnergyCurveType): void {
    this.energyCurve = curve;
  }

  setBPM(bpm: number): void {
    this.bpm = Math.max(40, Math.min(200, bpm));
    this.beatInterval = 60 / this.bpm;
  }

  setPitch(pitch: number): void {
    this.pitch = Math.max(0, Math.min(1, pitch));
  }

  /**
   * Generate synthetic audio features and beat info for a given time.
   */
  generate(elapsed: number, keyframes?: Keyframe[]): { audioFeatures: AudioFeatures; beatInfo: BeatInfo } {
    // Get base energy from curve
    const curveFn = ENERGY_CURVES[this.energyCurve] || ENERGY_CURVES.steady;
    const energy = Math.max(0, Math.min(1, curveFn(elapsed, this.duration)));

    // Beat detection
    const timeSinceLastBeat = elapsed - this.lastBeatTime;
    if (timeSinceLastBeat >= this.beatInterval || this.lastBeatTime < 0) {
      this.beatOnThisFrame = true;
      this.lastBeatTime = elapsed;
    } else {
      this.beatOnThisFrame = false;
    }

    // Generate frequency band values from energy + variation
    const rawBass = energy * (0.7 + Math.sin(elapsed * 1.5) * 0.3);
    const rawMid = energy * (0.6 + Math.sin(elapsed * 2.3 + 1) * 0.4);
    const rawHigh = energy * (0.5 + Math.sin(elapsed * 3.7 + 2) * 0.5);

    // Smooth values
    const smoothing = 0.15;
    this.smoothBass += (rawBass - this.smoothBass) * smoothing;
    this.smoothMid += (rawMid - this.smoothMid) * smoothing;
    this.smoothHigh += (rawHigh - this.smoothHigh) * smoothing;
    this.smoothAmplitude += (energy - this.smoothAmplitude) * smoothing;

    // Saturation detection (sustained high energy)
    if (energy > 0.7) {
      this.highEnergyFrames++;
    } else {
      this.highEnergyFrames = Math.max(0, this.highEnergyFrames - 2);
    }
    const isSaturated = this.highEnergyFrames > 30; // ~0.5s at 60fps

    // Beat intensity varies with energy
    const beatIntensity = this.beatOnThisFrame
      ? 0.4 + energy * 0.6
      : 0;

    // Normalized tempo: 0=40bpm, 1=200bpm
    const normalizedTempo = (this.bpm - 40) / 160;

    // Centroid tracks pitch with slight drift over time
    const centroid = this.pitch + Math.sin(elapsed * 0.3) * 0.1;

    // Generate synthetic frequency array
    const frequencies = this.generateFrequencies(elapsed, energy);

    const audioFeatures: AudioFeatures = {
      bass: Math.max(0, Math.min(1, this.smoothBass)),
      mid: Math.max(0, Math.min(1, this.smoothMid)),
      high: Math.max(0, Math.min(1, this.smoothHigh)),
      amplitude: Math.max(0, Math.min(1, this.smoothAmplitude)),
      centroid: Math.max(0, Math.min(1, centroid)),
      dominantFrequency: Math.max(0, Math.min(1, this.pitch + Math.sin(elapsed * 0.5) * 0.15)),
      frequencies,
    };

    const beatInfo: BeatInfo = {
      onBeat: this.beatOnThisFrame,
      beatIntensity,
      bpm: this.bpm,
      normalizedTempo,
      isSaturated,
    };

    return { audioFeatures, beatInfo };
  }

  /**
   * Generate a synthetic 1024-bin frequency array.
   * Lower bins = bass, higher bins = treble.
   */
  private generateFrequencies(elapsed: number, energy: number): Uint8Array {
    const bins = 1024;
    const frequencies = new Uint8Array(bins);

    for (let i = 0; i < bins; i++) {
      const normalizedBin = i / bins;

      // Base shape: low frequencies dominate
      let value = Math.exp(-normalizedBin * 3) * energy;

      // Add resonance peaks based on pitch
      const peakCenter = this.pitch;
      const peakWidth = 0.1;
      const distFromPeak = Math.abs(normalizedBin - peakCenter);
      if (distFromPeak < peakWidth) {
        value += (1 - distFromPeak / peakWidth) * energy * 0.5;
      }

      // Time-varying modulation
      value += Math.sin(elapsed * 2 + i * 0.02) * 0.1 * energy;
      value += Math.sin(elapsed * 5 + i * 0.05) * 0.05 * energy;

      frequencies[i] = Math.max(0, Math.min(255, Math.floor(value * 255)));
    }

    return frequencies;
  }

  /** Reset driver state */
  reset(): void {
    this.lastBeatTime = -1;
    this.smoothAmplitude = 0;
    this.smoothBass = 0;
    this.smoothMid = 0;
    this.smoothHigh = 0;
    this.highEnergyFrames = 0;
  }
}
