/**
 * ContoursMode - Topographic contours from audio height field
 *
 * Ported from audio-canvas contours.js.
 * Marching squares algorithm traces elevation levels for cartographic aesthetics.
 * Beats spawn peaks in the height field; FFT data maps to terrain elevation.
 * Peaks decay over time, creating evolving topographic landscapes.
 */

import { VisualizationMode } from '../mode-base.js';
import { pitchTempoToColor } from '../palette.js';
import type { AudioFeatures, BeatInfo } from '../types.js';

// ============================================================================
// Types
// ============================================================================

/** A peak in the height field, spawned on beats */
interface HeightPeak {
  x: number;
  y: number;
  height: number;
  radius: number;
  age: number;
  maxAge: number;
}

/** A 2D point used for marching squares edge output */
interface Point2D {
  x: number;
  y: number;
}

// ============================================================================
// ContoursMode
// ============================================================================

export class ContoursMode extends VisualizationMode {
  // Height field grid
  private gridSize: number;
  private cols: number;
  private rows: number;
  private heightField: Float32Array | null;
  private targetField: Float32Array | null;

  // Contour levels
  private numLevels: number;

  // Peaks spawned on beats
  private peaks: HeightPeak[];
  private maxPeaks: number;

  // Smoothed audio
  private smoothBass: number;
  private smoothMid: number;
  private smoothHigh: number;

  // Animation time
  private time: number;

  constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
    super(ctx, width, height);
    this.name = 'contours';
    this.description = 'Topographic contours from audio height field';

    this.gridSize = 8;
    this.cols = 0;
    this.rows = 0;
    this.heightField = null;
    this.targetField = null;

    this.numLevels = 12;

    this.peaks = [];
    this.maxPeaks = 20;

    this.smoothBass = 0;
    this.smoothMid = 0;
    this.smoothHigh = 0;

    this.time = 0;
  }

  init(): void {
    this.cols = Math.ceil(this.width / this.gridSize) + 1;
    this.rows = Math.ceil(this.height / this.gridSize) + 1;

    this.heightField = new Float32Array(this.cols * this.rows);
    this.targetField = new Float32Array(this.cols * this.rows);

    this.peaks = [];
    this.clear();
  }

  resize(width: number, height: number): void {
    super.resize(width, height);
    this.init();
  }

  /** Add a peak to the height field */
  private addPeak(x: number, y: number, height: number, radius: number): void {
    this.peaks.push({
      x, y,
      height,
      radius,
      age: 0,
      maxAge: 200 + Math.random() * 100,
    });

    if (this.peaks.length > this.maxPeaks) {
      this.peaks.shift();
    }
  }

  update(audioFeatures: AudioFeatures, beatInfo: BeatInfo): void {
    const weighted = this.getWeightedAudio(audioFeatures);
    const { bass, mid, high, amplitude, frequencies } = weighted;
    const { normalizedTempo, onBeat, beatIntensity, isSaturated } = beatInfo;

    // Smooth audio values
    const smoothing = 0.1;
    this.smoothBass += (bass - this.smoothBass) * smoothing;
    this.smoothMid += (mid - this.smoothMid) * smoothing;
    this.smoothHigh += (high - this.smoothHigh) * smoothing;

    this.time += 0.02;

    // Spawn peaks on beat
    if (onBeat && beatIntensity > 0.3) {
      const numPeaks = Math.ceil(beatIntensity * 2);
      for (let i = 0; i < numPeaks; i++) {
        const x = Math.random() * this.width;
        const y = Math.random() * this.height;
        const height = 0.5 + beatIntensity * 0.5;
        const radius = 100 + beatIntensity * 150;

        this.addPeak(x, y, height, radius);
      }
    }

    // During saturation, continuous peaks
    if (isSaturated && Math.random() < 0.1) {
      this.addPeak(
        Math.random() * this.width,
        Math.random() * this.height,
        0.3 + Math.random() * 0.3,
        80 + Math.random() * 80,
      );
    }

    // Update peaks
    for (let i = this.peaks.length - 1; i >= 0; i--) {
      this.peaks[i].age++;
      if (this.peaks[i].age > this.peaks[i].maxAge) {
        this.peaks.splice(i, 1);
      }
    }

    // Calculate target height field
    this.calculateHeightField(frequencies, amplitude);

    // Smooth interpolation to target
    if (this.heightField && this.targetField) {
      const interpSpeed = 0.1 + normalizedTempo * 0.1;
      for (let i = 0; i < this.heightField.length; i++) {
        this.heightField[i] += (this.targetField[i] - this.heightField[i]) * interpSpeed;
      }
    }
  }

  private calculateHeightField(frequencies: Uint8Array, amplitude: number): void {
    if (!this.targetField) return;

    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        const idx = y * this.cols + x;
        const px = x * this.gridSize;
        const py = y * this.gridSize;

        // Base height from noise
        let height = this.noise2D(px * 0.003 + this.time * 0.1, py * 0.003) * 0.3;

        // Add FFT contribution - map x position to frequency bin
        const freqIdx = Math.floor((x / this.cols) * Math.min(frequencies.length, 256));
        const freqContrib = frequencies[freqIdx] / 255;
        height += freqContrib * 0.4;

        // Add peaks
        for (const peak of this.peaks) {
          const dx = px - peak.x;
          const dy = py - peak.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // Age-based decay
          const lifeRatio = 1 - peak.age / peak.maxAge;

          if (dist < peak.radius) {
            // Gaussian falloff
            const falloff = Math.exp(-(dist * dist) / (peak.radius * peak.radius * 0.5));
            height += peak.height * falloff * lifeRatio;
          }
        }

        // Add some animation waves
        height += Math.sin(px * 0.01 + this.time) * Math.cos(py * 0.01 + this.time * 0.7) * 0.1 * amplitude;

        this.targetField[idx] = Math.max(0, Math.min(1, height));
      }
    }
  }

  /** Simple 2D noise using sin-based hash */
  private noise2D(x: number, y: number): number {
    const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    return (n - Math.floor(n)) * 2 - 1;
  }

  draw(): void {
    const ctx = this.ctx;

    // Dark background
    ctx.fillStyle = 'rgb(10, 10, 10)';
    ctx.fillRect(0, 0, this.width, this.height);

    // Draw contour lines using marching squares
    for (let level = 0; level < this.numLevels; level++) {
      const threshold = (level + 1) / (this.numLevels + 1);
      const color = pitchTempoToColor(threshold, 0.5, 0.3 + threshold * 0.5);

      ctx.strokeStyle = color;
      ctx.lineWidth = level === this.numLevels - 1 ? 2 : 1;

      this.drawContourLevel(ctx, threshold);
    }

    // Draw peak centers
    for (const peak of this.peaks) {
      const lifeRatio = 1 - peak.age / peak.maxAge;
      const alpha = lifeRatio * 0.5;

      const gradient = ctx.createRadialGradient(
        peak.x, peak.y, 0,
        peak.x, peak.y, 20,
      );
      gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
      gradient.addColorStop(1, 'transparent');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(peak.x, peak.y, 20, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private drawContourLevel(ctx: CanvasRenderingContext2D, threshold: number): void {
    if (!this.heightField) return;

    // Marching squares algorithm
    ctx.beginPath();

    for (let y = 0; y < this.rows - 1; y++) {
      for (let x = 0; x < this.cols - 1; x++) {
        const idx = y * this.cols + x;

        // Get corner values
        const v0 = this.heightField[idx];
        const v1 = this.heightField[idx + 1];
        const v2 = this.heightField[idx + this.cols + 1];
        const v3 = this.heightField[idx + this.cols];

        // Calculate case index
        let caseIndex = 0;
        if (v0 > threshold) caseIndex |= 1;
        if (v1 > threshold) caseIndex |= 2;
        if (v2 > threshold) caseIndex |= 4;
        if (v3 > threshold) caseIndex |= 8;

        // Skip empty and full cells
        if (caseIndex === 0 || caseIndex === 15) continue;

        // Cell coordinates
        const px = x * this.gridSize;
        const py = y * this.gridSize;

        // Interpolate edge crossings
        const edges = this.getMarchingSquaresEdges(caseIndex, v0, v1, v2, v3, threshold, px, py);

        for (let i = 0; i < edges.length; i += 2) {
          ctx.moveTo(edges[i].x, edges[i].y);
          ctx.lineTo(edges[i + 1].x, edges[i + 1].y);
        }
      }
    }

    ctx.stroke();
  }

  private getMarchingSquaresEdges(
    caseIndex: number,
    v0: number,
    v1: number,
    v2: number,
    v3: number,
    threshold: number,
    px: number,
    py: number,
  ): Point2D[] {
    const s = this.gridSize;
    const edges: Point2D[] = [];

    // Linear interpolation helpers
    const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
    const getT = (a: number, b: number): number => (threshold - a) / (b - a);

    // Edge midpoints with interpolation
    const top: Point2D = { x: px + lerp(0, s, getT(v0, v1)), y: py };
    const right: Point2D = { x: px + s, y: py + lerp(0, s, getT(v1, v2)) };
    const bottom: Point2D = { x: px + lerp(0, s, getT(v3, v2)), y: py + s };
    const left: Point2D = { x: px, y: py + lerp(0, s, getT(v0, v3)) };

    // Marching squares lookup
    switch (caseIndex) {
      case 1: edges.push(left, top); break;
      case 2: edges.push(top, right); break;
      case 3: edges.push(left, right); break;
      case 4: edges.push(right, bottom); break;
      case 5: edges.push(left, top, right, bottom); break;
      case 6: edges.push(top, bottom); break;
      case 7: edges.push(left, bottom); break;
      case 8: edges.push(bottom, left); break;
      case 9: edges.push(bottom, top); break;
      case 10: edges.push(top, right, bottom, left); break;
      case 11: edges.push(bottom, right); break;
      case 12: edges.push(right, left); break;
      case 13: edges.push(right, top); break;
      case 14: edges.push(top, left); break;
    }

    return edges;
  }

  clear(): void {
    this.peaks = [];
    this.time = 0;
    this.smoothBass = 0;
    this.smoothMid = 0;
    this.smoothHigh = 0;

    if (this.heightField) {
      this.heightField.fill(0);
    }
    if (this.targetField) {
      this.targetField.fill(0);
    }

    this.ctx.fillStyle = 'rgb(10, 10, 10)';
    this.ctx.fillRect(0, 0, this.width, this.height);
  }
}
