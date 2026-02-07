/**
 * VisualizationMode Base Class
 *
 * Ported from audio-canvas modes/base.js.
 * All 2D visualization modes extend this class.
 * Tuner parameters are passed in rather than read from a global singleton.
 */

import type { TunerParams, AudioFeatures, BeatInfo } from './types.js';
import { DEFAULT_TUNER_PARAMS } from './types.js';

export class VisualizationMode {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  name: string;
  description: string;

  private _tunerParams: TunerParams;

  constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
    this.name = 'base';
    this.description = 'Base visualization mode';
    this._tunerParams = { ...DEFAULT_TUNER_PARAMS };
  }

  get tunerParams(): TunerParams {
    return this._tunerParams;
  }

  setTunerParams(params: TunerParams): void {
    this._tunerParams = params;
  }

  /** Helper for weighted audio based on tuner frequency sliders */
  getWeightedAudio(audioFeatures: AudioFeatures): AudioFeatures {
    const p = this._tunerParams;
    return {
      ...audioFeatures,
      bass: audioFeatures.bass * (0.5 + p.bassWeight),
      mid: audioFeatures.mid * (0.5 + p.midWeight),
      high: audioFeatures.high * (0.5 + p.highWeight),
    };
  }

  /**
   * Clear background with decay-controlled opacity for trail effects.
   * decay param: 0 = fast fade (no trails), 1 = slow fade (long trails)
   */
  clearBackground(opacity: number = 1): void {
    const decay = this._tunerParams.decay;
    const effectiveOpacity = opacity * (1 - decay * 0.95);
    this.ctx.fillStyle = `rgba(10, 10, 10, ${effectiveOpacity})`;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  /** Called when mode is activated */
  init(): void {}

  /** Called when canvas resizes */
  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
  }

  /** Called every frame with audio data */
  update(_audioFeatures: AudioFeatures, _beatInfo: BeatInfo): void {}

  /** Called every frame to render */
  draw(): void {}

  /** Clear/reset the visualization */
  clear(): void {}
}
