/**
 * Visualization3DMode Base Class
 *
 * Ported from audio-canvas modes3d/base.js.
 * All 3D visualization modes extend this class.
 * Uses Three.js for rendering.
 */

import type { TunerParams, AudioFeatures, BeatInfo } from './types.js';
import { DEFAULT_TUNER_PARAMS } from './types.js';

export class Visualization3DMode {
  name: string;
  description: string;
  scene: any;
  camera: any;
  renderer: any;

  private _tunerParams: TunerParams;

  constructor() {
    this.name = 'base3d';
    this.description = 'Base 3D visualization mode';
    this.scene = null;
    this.camera = null;
    this.renderer = null;
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

  /** Called when mode is activated */
  init(scene: any, camera: any, renderer: any): void {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
  }

  /** Called every frame with audio data */
  update(
    _audioFeatures: AudioFeatures,
    _beatInfo: BeatInfo,
    _delta: number,
    _elapsed: number
  ): void {}

  /** Called on resize */
  resize(_width: number, _height: number): void {}

  /** Called when switching modes - clean up resources */
  dispose(): void {}

  /** Clear/reset the visualization */
  clear(): void {}
}
