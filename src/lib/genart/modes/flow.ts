/**
 * FlowMode - Particles following audio-reactive flow fields
 *
 * Ported from audio-canvas flowParticles.js (renamed FlowParticlesMode -> FlowMode).
 * Combines a simplex noise flow field with a particle system.
 * Particles are advected by the flow field, spawn based on audio energy,
 * and leave behind a permanent stipple layer when they expire.
 */

import { VisualizationMode } from '../mode-base.js';
import { FlowField } from '../flowfield.js';
import { ParticleSystem } from '../particles.js';
import type { AudioFeatures, BeatInfo } from '../types.js';

// ============================================================================
// FlowMode
// ============================================================================

export class FlowMode extends VisualizationMode {
  private flowField: FlowField | null;
  private particleSystem: ParticleSystem | null;

  constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
    super(ctx, width, height);
    this.name = 'flow';
    this.description = 'Particles following audio-reactive flow fields with stipple accumulation';
    this.flowField = null;
    this.particleSystem = null;
  }

  init(): void {
    this.flowField = new FlowField(this.width, this.height, 20);
    this.particleSystem = new ParticleSystem(this.width, this.height);
  }

  resize(width: number, height: number): void {
    super.resize(width, height);
    if (this.flowField) this.flowField.resize(width, height);
    if (this.particleSystem) this.particleSystem.resize(width, height);
  }

  update(audioFeatures: AudioFeatures, beatInfo: BeatInfo): void {
    if (!this.flowField || !this.particleSystem) return;

    const weighted = this.getWeightedAudio(audioFeatures);
    this.flowField.update(weighted);
    this.particleSystem.update(this.flowField, weighted, beatInfo);
  }

  draw(): void {
    // Semi-transparent overlay for trail effect
    this.clearBackground(0.02);
    if (this.particleSystem) {
      this.particleSystem.draw(this.ctx);
    }
  }

  clear(): void {
    this.clearBackground(1);
    if (this.particleSystem) this.particleSystem.clear();
  }
}
