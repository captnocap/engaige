/**
 * GenArtEngine
 *
 * Orchestrates mode lifecycle, procedural driver, and rendering.
 * Manages both 2D canvas and 3D (Three.js) modes.
 */

import type {
  GenArtConfig,
  TunerParams,
  EnergyCurveType,
  Keyframe,
} from './types.js';
import { DEFAULT_TUNER_PARAMS } from './types.js';
import { ProceduralDriver } from './procedural-driver.js';
import { loadMode, is3DMode } from './mode-registry.js';
import type { VisualizationMode } from './mode-base.js';
import type { Visualization3DMode } from './mode-base-3d.js';

export class GenArtEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null = null;
  private config: GenArtConfig;
  private driver: ProceduralDriver;

  // Current mode
  private mode: VisualizationMode | null = null;
  private mode3D: Visualization3DMode | null = null;
  private currentModeId: string = '';
  private isCurrent3D: boolean = false;

  // Three.js (lazy-loaded for 3D modes)
  private threeScene: any = null;
  private threeCamera: any = null;
  private threeRenderer: any = null;

  // State
  private running: boolean = false;
  private animationId: number | null = null;
  private elapsed: number = 0;
  private lastTimestamp: number = 0;
  private width: number = 0;
  private height: number = 0;

  // Keyframe interpolation
  private currentParams: TunerParams;

  constructor(canvas: HTMLCanvasElement, config: GenArtConfig) {
    this.canvas = canvas;
    this.config = config;
    this.currentParams = { ...config.tunerParams };

    this.driver = new ProceduralDriver(
      config.energyCurve,
      config.bpm,
      config.pitch,
      30 // default duration, will be updated
    );
  }

  // ---- Lifecycle ----

  async init(): Promise<void> {
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.ctx = this.canvas.getContext('2d');

    await this.setMode(this.config.mode);
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastTimestamp = performance.now();
    this.tick();
  }

  stop(): void {
    this.running = false;
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  destroy(): void {
    this.stop();

    // Clean up 3D
    if (this.mode3D) {
      this.mode3D.dispose();
      this.mode3D = null;
    }
    if (this.threeRenderer) {
      this.threeRenderer.dispose();
      this.threeRenderer = null;
    }

    this.mode = null;
    this.ctx = null;
  }

  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.canvas.width = width;
    this.canvas.height = height;

    if (this.mode) {
      this.mode.resize(width, height);
    }
    if (this.mode3D) {
      this.mode3D.resize(width, height);
    }
    if (this.threeRenderer) {
      this.threeRenderer.setSize(width, height);
    }
    if (this.threeCamera) {
      this.threeCamera.aspect = width / height;
      this.threeCamera.updateProjectionMatrix();
    }
  }

  // ---- Per-frame ----

  private tick = (): void => {
    if (!this.running) return;

    const now = performance.now();
    const delta = (now - this.lastTimestamp) / 1000;
    this.lastTimestamp = now;
    this.elapsed += delta;

    // Interpolate keyframes if present
    if (this.config.keyframes && this.config.keyframes.length > 0) {
      this.interpolateKeyframes(this.elapsed);
    }

    // Generate synthetic audio data
    const { audioFeatures, beatInfo } = this.driver.generate(this.elapsed);

    if (this.isCurrent3D && this.mode3D) {
      // 3D mode
      this.mode3D.setTunerParams(this.currentParams);
      this.mode3D.update(audioFeatures, beatInfo, delta, this.elapsed);

      if (this.threeRenderer && this.threeScene && this.threeCamera) {
        this.threeRenderer.render(this.threeScene, this.threeCamera);
      }
    } else if (this.mode) {
      // 2D mode
      this.mode.setTunerParams(this.currentParams);
      this.mode.update(audioFeatures, beatInfo);
      this.mode.draw();
    }

    this.animationId = requestAnimationFrame(this.tick);
  };

  // ---- Keyframe interpolation ----

  private interpolateKeyframes(elapsed: number): void {
    const keyframes = this.config.keyframes!;
    const baseParams = this.config.tunerParams;

    // Find surrounding keyframes
    let prevKf: Keyframe | null = null;
    let nextKf: Keyframe | null = null;

    for (const kf of keyframes) {
      if (kf.time <= elapsed) {
        prevKf = kf;
      } else if (!nextKf) {
        nextKf = kf;
      }
    }

    if (!prevKf && !nextKf) {
      this.currentParams = { ...baseParams };
      return;
    }

    if (prevKf && !nextKf) {
      // Past last keyframe - use its values
      this.currentParams = { ...baseParams, ...prevKf.params };
      return;
    }

    if (!prevKf && nextKf) {
      // Before first keyframe - interpolate from base to first
      const t = elapsed / nextKf.time;
      const easedT = this.applyEasing(t, nextKf.easing || 'linear');
      this.currentParams = this.lerpParams(baseParams, { ...baseParams, ...nextKf.params }, easedT);
      return;
    }

    // Between two keyframes
    const prevTime = prevKf!.time;
    const nextTime = nextKf!.time;
    const t = (elapsed - prevTime) / (nextTime - prevTime);
    const easedT = this.applyEasing(t, nextKf!.easing || 'linear');

    const fromParams = { ...baseParams, ...prevKf!.params };
    const toParams = { ...baseParams, ...nextKf!.params };
    this.currentParams = this.lerpParams(fromParams, toParams, easedT);
  }

  private lerpParams(a: TunerParams, b: TunerParams, t: number): TunerParams {
    const result: any = {};
    for (const key of Object.keys(a) as (keyof TunerParams)[]) {
      result[key] = a[key] + (b[key] - a[key]) * t;
    }
    return result as TunerParams;
  }

  private applyEasing(t: number, easing: string): number {
    switch (easing) {
      case 'ease-in':
        return t * t;
      case 'ease-out':
        return 1 - (1 - t) * (1 - t);
      case 'ease-in-out':
        return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      default:
        return t; // linear
    }
  }

  // ---- Runtime updates ----

  setTunerParams(params: Partial<TunerParams>): void {
    this.config.tunerParams = { ...this.config.tunerParams, ...params };
    this.currentParams = { ...this.currentParams, ...params };
  }

  async setMode(modeId: string): Promise<void> {
    if (modeId === this.currentModeId) return;

    // Clean up current mode
    if (this.mode) {
      this.mode.clear();
      this.mode = null;
    }
    if (this.mode3D) {
      this.mode3D.dispose();
      this.mode3D = null;
    }

    this.currentModeId = modeId;
    this.isCurrent3D = is3DMode(modeId);

    // Load mode class
    const ModeClass = await loadMode(modeId);

    if (this.isCurrent3D) {
      await this.init3D();
      const mode3D = new ModeClass();
      mode3D.setTunerParams(this.currentParams);
      mode3D.init(this.threeScene, this.threeCamera, this.threeRenderer);
      this.mode3D = mode3D;
    } else {
      if (!this.ctx) {
        this.ctx = this.canvas.getContext('2d');
      }
      const mode = new ModeClass(this.ctx!, this.width, this.height);
      mode.setTunerParams(this.currentParams);
      mode.init();
      this.mode = mode;
    }

    // Reset driver
    this.driver.reset();
    this.elapsed = 0;
  }

  setEnergyCurve(curve: EnergyCurveType): void {
    this.config.energyCurve = curve;
    this.driver.setEnergyCurve(curve);
  }

  setBPM(bpm: number): void {
    this.config.bpm = bpm;
    this.driver.setBPM(bpm);
  }

  setPitch(pitch: number): void {
    this.config.pitch = pitch;
    this.driver.setPitch(pitch);
  }

  setElapsed(time: number): void {
    this.elapsed = time;
  }

  getConfig(): GenArtConfig {
    return { ...this.config };
  }

  // ---- Three.js initialization (lazy) ----

  private async init3D(): Promise<void> {
    if (this.threeRenderer) return; // Already initialized

    const THREE = await import('three');

    this.threeScene = new THREE.Scene();
    this.threeScene.background = new THREE.Color(0x0a0a0a);

    this.threeCamera = new THREE.PerspectiveCamera(
      75,
      this.width / this.height,
      0.1,
      1000
    );

    this.threeRenderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: false,
    });
    this.threeRenderer.setSize(this.width, this.height);
    this.threeRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }
}
