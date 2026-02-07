/**
 * Cymatics Visualization Mode
 *
 * Chladni plate standing wave patterns.
 * Particles accumulate at nodal lines where waves cancel out.
 * Real physics made visible through frequency-driven geometric patterns.
 * Ported from audio-canvas cymatics.js.
 */

import { VisualizationMode } from '../mode-base.js';
import { pitchTempoToRGB } from '../palette.js';
import type { AudioFeatures, BeatInfo } from '../types.js';

/** A single particle that settles on Chladni nodal lines */
class CymaticsParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  settled: boolean;
  settleTime: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.settled = false;
    this.settleTime = 0;
  }
}

export class CymaticsMode extends VisualizationMode {
  particles: CymaticsParticle[];
  maxParticles: number;

  // Chladni pattern parameters
  // Pattern determined by integers n and m in the equation
  n: number;
  m: number;
  targetN: number;
  targetM: number;

  // Plate properties
  plateSize: number;
  centerX: number;
  centerY: number;

  // Vibration state
  vibrationIntensity: number;
  phase: number;

  // Smoothed audio
  smoothBass: number;
  smoothMid: number;
  smoothHigh: number;
  smoothAmplitude: number;

  // Accumulated pattern for rendering
  accumulation: Float32Array | null;

  constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
    super(ctx, width, height);
    this.name = 'cymatics';
    this.description = 'Chladni plate standing wave patterns';

    this.particles = [];
    this.maxParticles = 12000; // More particles for denser patterns

    this.n = 3;
    this.m = 2;
    this.targetN = 3;
    this.targetM = 2;

    this.plateSize = 0;
    this.centerX = 0;
    this.centerY = 0;

    this.vibrationIntensity = 0;
    this.phase = 0;

    this.smoothBass = 0;
    this.smoothMid = 0;
    this.smoothHigh = 0;
    this.smoothAmplitude = 0;

    this.accumulation = null;
  }

  init(): void {
    this.clear();

    this.plateSize = Math.min(this.width, this.height) * 0.45;
    this.centerX = this.width / 2;
    this.centerY = this.height / 2;

    // Initialize accumulation buffer
    this.accumulation = new Float32Array(this.width * this.height);

    // Spawn initial particles for faster pattern formation
    this.spawnParticles(this.maxParticles * 0.8);
  }

  /** Spawn particles in random positions within the circular plate */
  private spawnParticles(count: number): void {
    for (let i = 0; i < count && this.particles.length < this.maxParticles; i++) {
      // Spawn within circular plate
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * this.plateSize;

      this.particles.push(new CymaticsParticle(
        this.centerX + Math.cos(angle) * radius,
        this.centerY + Math.sin(angle) * radius,
      ));
    }
  }

  /**
   * Chladni pattern function.
   * Returns the vibration amplitude at a point.
   * Nodal lines occur where this equals zero.
   * z = cos(n*pi*x)*cos(m*pi*y) - cos(m*pi*x)*cos(n*pi*y)
   */
  private chladniPattern(x: number, y: number): number {
    // Normalize to plate coordinates (-1 to 1)
    const px = (x - this.centerX) / this.plateSize;
    const py = (y - this.centerY) / this.plateSize;

    // Check if outside plate
    if (px * px + py * py > 1) return 0;

    const n = this.n;
    const m = this.m;

    const pattern1 = Math.cos(n * Math.PI * px) * Math.cos(m * Math.PI * py);
    const pattern2 = Math.cos(m * Math.PI * px) * Math.cos(n * Math.PI * py);

    return pattern1 - pattern2;
  }

  /** Gradient of Chladni pattern (direction particles should move toward nodal lines) */
  private chladniGradient(x: number, y: number): { x: number; y: number } {
    const epsilon = 2;
    const center = Math.abs(this.chladniPattern(x, y));
    const dx = Math.abs(this.chladniPattern(x + epsilon, y)) - center;
    const dy = Math.abs(this.chladniPattern(x, y + epsilon)) - center;

    // Normalize
    const mag = Math.sqrt(dx * dx + dy * dy) || 1;

    return {
      x: -dx / mag, // Move toward lower amplitude (nodal lines)
      y: -dy / mag,
    };
  }

  resize(width: number, height: number): void {
    super.resize(width, height);
    this.init();
  }

  update(audioFeatures: AudioFeatures, beatInfo: BeatInfo): void {
    const weighted = this.getWeightedAudio(audioFeatures);
    const { bass, mid, high, amplitude, centroid, dominantFrequency } = weighted;
    const { normalizedTempo, onBeat, beatIntensity } = beatInfo;

    // Smooth audio values
    const smoothing = 0.1;
    this.smoothBass += (bass - this.smoothBass) * smoothing;
    this.smoothMid += (mid - this.smoothMid) * smoothing;
    this.smoothHigh += (high - this.smoothHigh) * smoothing;
    this.smoothAmplitude += (amplitude - this.smoothAmplitude) * smoothing;

    // Update vibration intensity
    this.vibrationIntensity = this.smoothAmplitude * 0.5 + this.smoothBass * 0.5;
    this.phase += 0.1 + normalizedTempo * 0.2;

    // Change pattern based on dominant frequency
    // Higher frequencies = more complex patterns
    this.targetN = Math.floor(2 + dominantFrequency * 6);
    this.targetM = Math.floor(1 + centroid * 5);

    // Smoothly transition pattern (integers)
    if (onBeat && beatIntensity > 0.5) {
      this.n = this.targetN;
      this.m = this.targetM;

      // "Kick" the plate - scatter particles
      for (const particle of this.particles) {
        particle.settled = false;
        particle.vx += (Math.random() - 0.5) * beatIntensity * 20;
        particle.vy += (Math.random() - 0.5) * beatIntensity * 20;
      }

      // Spawn new particles on strong beats
      if (beatIntensity > 0.7) {
        this.spawnParticles(100);
      }
    }

    // Update particles - faster settling
    const settleDist = 0.08; // More lenient distance from nodal line to consider settled
    const attractionStrength = 0.8 + this.smoothBass * 1.0; // Strong attraction

    for (const particle of this.particles) {
      // Get distance from center
      const dx = particle.x - this.centerX;
      const dy = particle.y - this.centerY;
      const distFromCenter = Math.sqrt(dx * dx + dy * dy);

      // Reset particles outside plate
      if (distFromCenter > this.plateSize * 1.1) {
        particle.x = this.centerX + (Math.random() - 0.5) * this.plateSize * 2;
        particle.y = this.centerY + (Math.random() - 0.5) * this.plateSize * 2;
        particle.settled = false;
        continue;
      }

      // Get pattern value at particle position
      const patternValue = Math.abs(this.chladniPattern(particle.x, particle.y));

      if (!particle.settled) {
        // Move toward nodal lines (where pattern = 0)
        const grad = this.chladniGradient(particle.x, particle.y);

        // Apply force toward nodal line
        particle.vx += grad.x * attractionStrength * patternValue;
        particle.vy += grad.y * attractionStrength * patternValue;

        // Add vibration (perpendicular to gradient)
        const vibration = Math.sin(this.phase) * this.vibrationIntensity;
        particle.vx += (Math.random() - 0.5) * vibration;
        particle.vy += (Math.random() - 0.5) * vibration;

        // Damping - faster so particles settle quicker
        particle.vx *= 0.88;
        particle.vy *= 0.88;

        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Check if settled on nodal line
        if (patternValue < settleDist && Math.abs(particle.vx) < 1.0 && Math.abs(particle.vy) < 1.0) {
          particle.settleTime++;
          if (particle.settleTime > 10) { // Settle in 10 frames
            particle.settled = true;
          }
        } else {
          particle.settleTime = Math.max(0, particle.settleTime - 1); // Slower reset
        }
      } else {
        // Settled particles still vibrate slightly
        particle.x += (Math.random() - 0.5) * this.vibrationIntensity * 0.5;
        particle.y += (Math.random() - 0.5) * this.vibrationIntensity * 0.5;

        // Un-settle if vibration is strong
        if (this.vibrationIntensity > 0.5 && Math.random() < 0.01) {
          particle.settled = false;
          particle.settleTime = 0;
        }
      }

      // Accumulate settled particle positions
      if (particle.settled && this.accumulation) {
        const px = Math.floor(particle.x);
        const py = Math.floor(particle.y);
        if (px >= 0 && px < this.width && py >= 0 && py < this.height) {
          this.accumulation[py * this.width + px] += 0.1;
        }
      }
    }

    // Fade accumulation slowly
    if (this.accumulation) {
      for (let i = 0; i < this.accumulation.length; i++) {
        this.accumulation[i] *= 0.995;
      }
    }
  }

  draw(): void {
    const ctx = this.ctx;

    // Dark background
    ctx.fillStyle = 'rgb(10, 10, 10)';
    ctx.fillRect(0, 0, this.width, this.height);

    // Draw plate outline
    ctx.strokeStyle = 'rgba(50, 50, 70, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(this.centerX, this.centerY, this.plateSize, 0, Math.PI * 2);
    ctx.stroke();

    // Draw faint nodal line pattern for reference
    this.drawNodalLines(ctx);

    // Draw accumulated pattern
    this.drawAccumulation(ctx);

    // Draw particles
    const particleColor = pitchTempoToRGB(0.5, 0.5, 0.8);

    for (const particle of this.particles) {
      const alpha = particle.settled ? 0.9 : 0.4;
      const size = particle.settled ? 1.5 : 1;

      ctx.fillStyle = `rgba(${particleColor.r}, ${particleColor.g}, ${particleColor.b}, ${alpha})`;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw pattern info
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '12px monospace';
    ctx.fillText(`Pattern: n=${this.n}, m=${this.m}`, 10, 20);
    ctx.fillText(`Particles: ${this.particles.length}`, 10, 35);
  }

  /** Draw the theoretical nodal lines faintly as a visual guide */
  private drawNodalLines(ctx: CanvasRenderingContext2D): void {
    const step = 4;
    ctx.strokeStyle = 'rgba(40, 40, 60, 0.3)';
    ctx.lineWidth = 1;

    // Draw contour at pattern = 0
    for (let y = this.centerY - this.plateSize; y < this.centerY + this.plateSize; y += step) {
      for (let x = this.centerX - this.plateSize; x < this.centerX + this.plateSize; x += step) {
        const val = this.chladniPattern(x, y);

        // If sign changes, we're near a nodal line
        const valRight = this.chladniPattern(x + step, y);
        const valDown = this.chladniPattern(x, y + step);

        if (val * valRight < 0) {
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + step, y);
          ctx.stroke();
        }

        if (val * valDown < 0) {
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x, y + step);
          ctx.stroke();
        }
      }
    }
  }

  /** Draw accumulated pattern as subtle glow using pixel data */
  private drawAccumulation(ctx: CanvasRenderingContext2D): void {
    if (!this.accumulation) return;

    const imageData = ctx.getImageData(0, 0, this.width, this.height);
    const data = imageData.data;

    for (let i = 0; i < this.accumulation.length; i++) {
      const acc = Math.min(this.accumulation[i], 1);
      if (acc > 0.1) {
        const idx = i * 4;
        const brightness = Math.floor(acc * 100);
        data[idx] = Math.min(255, data[idx] + brightness);
        data[idx + 1] = Math.min(255, data[idx + 1] + brightness);
        data[idx + 2] = Math.min(255, data[idx + 2] + brightness + 20);
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }

  clear(): void {
    this.particles = [];
    this.n = 3;
    this.m = 2;
    this.targetN = 3;
    this.targetM = 2;
    this.vibrationIntensity = 0;
    this.phase = 0;
    this.smoothBass = 0;
    this.smoothMid = 0;
    this.smoothHigh = 0;
    this.smoothAmplitude = 0;

    if (this.accumulation) {
      this.accumulation.fill(0);
    }

    this.ctx.fillStyle = 'rgb(10, 10, 10)';
    this.ctx.fillRect(0, 0, this.width, this.height);
  }
}
