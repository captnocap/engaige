/**
 * SpirographMode - Audio-modulated mathematical curves
 *
 * Ported from audio-canvas spirograph.js.
 * Creates hypotrochoid/epitrochoid patterns where wheel sizes respond
 * to frequency bands. Bass modulates the outer wheel, mid the inner,
 * and high frequencies control pen distance (detail level).
 */

import { VisualizationMode } from '../mode-base.js';
import { pitchTempoToColor } from '../palette.js';
import type { AudioFeatures, BeatInfo } from '../types.js';

// ============================================================================
// Types
// ============================================================================

/** A point along the spirograph curve */
interface SpiroPoint {
  x: number;
  y: number;
  color: string;
  amplitude: number;
}

// ============================================================================
// SpirographMode
// ============================================================================

export class SpirographMode extends VisualizationMode {
  // Curve parameters
  private angle: number;
  private points: SpiroPoint[];
  private maxPoints: number;

  // Base wheel sizes (modulated by audio)
  private baseR1: number;
  private baseR2: number;
  private baseD: number;

  // Current modulated values
  private R1: number;
  private R2: number;
  private d: number;

  // Drawing state
  private lastX: number | null;
  private lastY: number | null;
  private rotationSpeed: number;
  private centerX: number;
  private centerY: number;

  // Smoothing for audio reactivity
  private smoothBass: number;
  private smoothMid: number;
  private smoothHigh: number;

  constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
    super(ctx, width, height);
    this.name = 'spirograph';
    this.description = 'Audio-modulated mathematical curves creating unique song fingerprints';

    this.angle = 0;
    this.points = [];
    this.maxPoints = 20000;

    this.baseR1 = 0;
    this.baseR2 = 0;
    this.baseD = 0;

    this.R1 = 0;
    this.R2 = 0;
    this.d = 0;

    this.lastX = null;
    this.lastY = null;
    this.rotationSpeed = 0.02;
    this.centerX = 0;
    this.centerY = 0;

    this.smoothBass = 0;
    this.smoothMid = 0;
    this.smoothHigh = 0;
  }

  init(): void {
    this.clear();
    const size = Math.min(this.width, this.height) * 0.35;
    this.baseR1 = size;
    this.baseR2 = size * 0.4;
    this.baseD = size * 0.25;
    this.centerX = this.width / 2;
    this.centerY = this.height / 2;
  }

  resize(width: number, height: number): void {
    super.resize(width, height);
    this.init();
  }

  update(audioFeatures: AudioFeatures, beatInfo: BeatInfo): void {
    const p = this.tunerParams;
    const weighted = this.getWeightedAudio(audioFeatures);
    const { bass, mid, high, amplitude, centroid } = weighted;
    const { normalizedTempo, onBeat, beatIntensity } = beatInfo;

    // Smooth audio values for fluid motion
    const smoothing = 0.15;
    this.smoothBass += (bass - this.smoothBass) * smoothing;
    this.smoothMid += (mid - this.smoothMid) * smoothing;
    this.smoothHigh += (high - this.smoothHigh) * smoothing;

    // Modulate wheel sizes based on frequency bands
    // Bass affects outer wheel (larger movements)
    this.R1 = this.baseR1 * (0.6 + this.smoothBass * 0.8);
    // Mid affects inner wheel ratio
    this.R2 = this.baseR2 * (0.5 + this.smoothMid * 1.0);
    // High affects pen distance (detail level)
    this.d = this.baseD * (0.3 + this.smoothHigh * 1.4);

    // Rotation speed based on tempo (chaos adds variation)
    this.rotationSpeed = (0.015 + normalizedTempo * 0.03) * (0.7 + p.chaos * 0.6);

    // On beat, add a small phase jump for visual accent (sensitivity lowers threshold)
    const beatThreshold = 0.7 - p.sensitivity * 0.4;
    if (onBeat && beatIntensity > beatThreshold) {
      this.angle += beatIntensity * (0.2 + p.chaos * 0.3);
    }

    // Calculate spirograph position using hypotrochoid equations
    // x = (R - r) * cos(t) + d * cos((R - r) / r * t)
    // y = (R - r) * sin(t) + d * sin((R - r) / r * t)
    const R = this.R1;
    const r = this.R2;
    const d = this.d;
    const t = this.angle;

    // Prevent division by zero
    const ratio = r > 0.01 ? (R - r) / r : 0;

    const x = this.centerX + (R - r) * Math.cos(t) + d * Math.cos(ratio * t);
    const y = this.centerY + (R - r) * Math.sin(t) - d * Math.sin(ratio * t);

    // Store point with color based on audio
    const color = pitchTempoToColor(centroid, normalizedTempo, amplitude);

    this.points.push({
      x, y,
      color,
      amplitude,
    });

    // Trim old points
    if (this.points.length > this.maxPoints) {
      this.points.shift();
    }

    // Advance angle
    this.angle += this.rotationSpeed;

    // Store for line drawing
    this.lastX = x;
    this.lastY = y;
  }

  draw(): void {
    // Semi-transparent background for trail effect
    this.clearBackground(0.03);

    if (this.points.length < 2) return;

    const ctx = this.ctx;

    // Draw the curve with varying thickness based on amplitude
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Draw recent portion with full opacity
    const drawStart = Math.max(0, this.points.length - 5000);

    for (let i = drawStart + 1; i < this.points.length; i++) {
      const p0 = this.points[i - 1];
      const p1 = this.points[i];

      // Line width based on amplitude
      const lineWidth = 0.5 + p1.amplitude * 2.5;

      ctx.beginPath();
      ctx.strokeStyle = p1.color;
      ctx.lineWidth = lineWidth;
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.stroke();
    }

    // Draw a glow at the current position
    if (this.points.length > 0) {
      const current = this.points[this.points.length - 1];
      const gradient = ctx.createRadialGradient(
        current.x, current.y, 0,
        current.x, current.y, 15 + current.amplitude * 20,
      );
      gradient.addColorStop(0, current.color);
      gradient.addColorStop(1, 'transparent');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(current.x, current.y, 15 + current.amplitude * 20, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  clear(): void {
    this.points = [];
    this.angle = 0;
    this.lastX = null;
    this.lastY = null;
    this.smoothBass = 0;
    this.smoothMid = 0;
    this.smoothHigh = 0;
    this.ctx.fillStyle = 'rgb(10, 10, 10)';
    this.ctx.fillRect(0, 0, this.width, this.height);
  }
}
