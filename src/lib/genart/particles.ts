/**
 * Particle + ParticleSystem
 *
 * Ported from audio-canvas particles.js.
 * Particle system that follows flow fields, spawns based on audio,
 * and accumulates a permanent stipple layer from expired particles.
 */

import type { AudioFeatures, BeatInfo } from './types.js';
import type { RGB } from './palette.js';
import type { FlowField } from './flowfield.js';
import { pitchTempoToColor, pitchTempoToRGB } from './palette.js';

// ============================================================================
// Types
// ============================================================================

/** Trail point stored per particle */
interface TrailPoint {
  x: number;
  y: number;
}

/** Accumulated stipple dot left behind by expired particles */
interface StippleDot {
  x: number;
  y: number;
  rgb: RGB;
  size: number;
}

// ============================================================================
// Particle - single particle that follows a flow field
// ============================================================================

export class Particle {
  x: number;
  y: number;
  originX: number;
  originY: number;
  vx: number;
  vy: number;
  color: string;
  rgb: RGB;
  size: number;
  baseSize: number;
  life: number;
  maxLife: number;
  age: number;
  trail: TrailPoint[];
  maxTrailLength: number;

  constructor(x: number, y: number, color: string, rgb: RGB, size: number = 2) {
    this.x = x;
    this.y = y;
    this.originX = x;
    this.originY = y;
    this.vx = 0;
    this.vy = 0;
    this.color = color;
    this.rgb = rgb;
    this.size = size;
    this.baseSize = size;
    this.life = 1;
    this.maxLife = 1;
    this.age = 0;
    this.trail = [];
    this.maxTrailLength = 20;
  }

  update(flowField: FlowField, audioFeatures: AudioFeatures, beatInfo: BeatInfo): void {
    // Get flow vector at current position
    const flow = flowField.getVector(this.x, this.y);

    // Apply flow with some inertia
    this.vx = this.vx * 0.9 + flow.x * 0.5;
    this.vy = this.vy * 0.9 + flow.y * 0.5;

    // Beat pulses add energy
    if (beatInfo.onBeat) {
      const angle = Math.random() * Math.PI * 2;
      this.vx += Math.cos(angle) * beatInfo.beatIntensity * 2;
      this.vy += Math.sin(angle) * beatInfo.beatIntensity * 2;
    }

    // Store trail position
    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > this.maxTrailLength) {
      this.trail.shift();
    }

    // Update position
    this.x += this.vx;
    this.y += this.vy;

    // Size pulses with amplitude
    this.size = this.baseSize * (0.5 + audioFeatures.amplitude * 1.5);

    this.age++;
  }

  draw(ctx: CanvasRenderingContext2D, alpha: number = 1): void {
    // Draw trail
    if (this.trail.length > 1) {
      ctx.beginPath();
      ctx.moveTo(this.trail[0].x, this.trail[0].y);

      for (let i = 1; i < this.trail.length; i++) {
        ctx.lineTo(this.trail[i].x, this.trail[i].y);
      }

      ctx.strokeStyle = `rgba(${this.rgb.r}, ${this.rgb.g}, ${this.rgb.b}, ${alpha * 0.3})`;
      ctx.lineWidth = this.size * 0.5;
      ctx.stroke();
    }

    // Draw particle (stipple dot)
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${this.rgb.r}, ${this.rgb.g}, ${this.rgb.b}, ${alpha})`;
    ctx.fill();
  }

  isOffScreen(width: number, height: number): boolean {
    const margin = 50;
    return this.x < -margin || this.x > width + margin ||
           this.y < -margin || this.y > height + margin;
  }
}

// ============================================================================
// ParticleSystem - manages spawning, updating, drawing, and culling particles
// ============================================================================

export class ParticleSystem {
  width: number;
  height: number;
  particles: Particle[];
  maxParticles: number;
  spawnRate: number;
  accumulatedParticles: StippleDot[];

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.particles = [];
    this.maxParticles = 5000;
    this.spawnRate = 10;
    this.accumulatedParticles = [];
  }

  spawn(audioFeatures: AudioFeatures, beatInfo: BeatInfo, count: number = 1): void {
    const { amplitude, centroid } = audioFeatures;
    const { normalizedTempo, onBeat, beatIntensity } = beatInfo;

    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) break;

      // Spawn position - distributed across canvas, weighted by audio
      let x: number, y: number;

      if (onBeat && Math.random() < 0.3) {
        // On beats, sometimes spawn from center burst
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * 100;
        x = this.width / 2 + Math.cos(angle) * dist;
        y = this.height / 2 + Math.sin(angle) * dist;
      } else {
        // Normal spawn - random with slight center bias
        const centerBias = 0.3;
        x = this.width * (Math.random() * (1 - centerBias) + centerBias * 0.5 + (Math.random() - 0.5) * centerBias);
        y = this.height * (Math.random() * (1 - centerBias) + centerBias * 0.5 + (Math.random() - 0.5) * centerBias);
      }

      // Color from pitch + tempo
      const pitch = centroid + (Math.random() - 0.5) * 0.2;
      const color = pitchTempoToColor(pitch, normalizedTempo, amplitude);
      const rgb = pitchTempoToRGB(pitch, normalizedTempo, amplitude);

      // Size based on amplitude
      const size = 1 + amplitude * 3 + (onBeat ? beatIntensity * 2 : 0);

      const particle = new Particle(x, y, color, rgb, size);
      particle.maxTrailLength = Math.floor(10 + normalizedTempo * 30); // Faster = longer trails

      this.particles.push(particle);
    }
  }

  update(flowField: FlowField, audioFeatures: AudioFeatures, beatInfo: BeatInfo): void {
    // Spawn new particles based on audio energy
    const spawnCount = Math.floor(this.spawnRate * (0.5 + audioFeatures.amplitude * 2));
    this.spawn(audioFeatures, beatInfo, spawnCount);

    // Extra burst on beats
    if (beatInfo.onBeat) {
      this.spawn(audioFeatures, beatInfo, Math.floor(20 * beatInfo.beatIntensity));
    }

    // Update existing particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.update(flowField, audioFeatures, beatInfo);

      // Remove if off screen or too old
      if (p.isOffScreen(this.width, this.height) || p.age > 500) {
        // Before removing, add final position to accumulated stipples
        this.accumulatedParticles.push({
          x: p.x,
          y: p.y,
          rgb: p.rgb,
          size: p.size * 0.5,
        });

        this.particles.splice(i, 1);
      }
    }

    // Limit accumulated particles (keep most recent)
    const maxAccumulated = 50000;
    if (this.accumulatedParticles.length > maxAccumulated) {
      this.accumulatedParticles = this.accumulatedParticles.slice(-maxAccumulated);
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    // Draw accumulated stipples (faded, permanent layer)
    for (const p of this.accumulatedParticles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.rgb.r}, ${p.rgb.g}, ${p.rgb.b}, 0.3)`;
      ctx.fill();
    }

    // Draw active particles
    for (const p of this.particles) {
      p.draw(ctx);
    }
  }

  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
  }

  clear(): void {
    this.particles = [];
    this.accumulatedParticles = [];
  }
}
