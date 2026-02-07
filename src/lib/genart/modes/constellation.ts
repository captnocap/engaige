/**
 * Constellation Visualization Mode
 *
 * Stars spawn on beats, connect to nearby stars, twinkle effect.
 * Builds a constellation/star map over time.
 * Ported from audio-canvas constellation.js.
 */

import { VisualizationMode } from '../mode-base.js';
import { pitchTempoToColor, pitchTempoToRGB } from '../palette.js';
import type { AudioFeatures, BeatInfo } from '../types.js';
import type { RGB } from '../palette.js';

/** A single star in the constellation field */
interface Star {
  x: number;
  y: number;
  size: number;
  rgb: RGB;
  color: string;
  baseAlpha: number;
  alpha: number;
  twinkle: number;
  /** Random phase offset for twinkle sine wave */
  phase: number;
  /** Frame number when this star was created */
  birth: number;
}

/** A line connecting two nearby stars */
interface Connection {
  a: Star;
  b: Star;
  dist: number;
  alpha: number;
}

export class ConstellationMode extends VisualizationMode {
  stars: Star[];
  connections: Connection[];
  maxStars: number;
  connectionDistance: number;
  /** Monotonically increasing frame counter for twinkle and birth timestamps */
  frameCount: number;

  constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
    super(ctx, width, height);
    this.name = 'constellation';
    this.description = 'Stars spawn on beats and connect to nearby stars';
    this.stars = [];
    this.connections = [];
    this.maxStars = 500;
    this.connectionDistance = 150;
    this.frameCount = 0;
  }

  init(): void {
    this.stars = [];
    this.connections = [];
    this.frameCount = 0;
  }

  resize(width: number, height: number): void {
    super.resize(width, height);
    this.connectionDistance = Math.min(width, height) * 0.12;
  }

  update(audioFeatures: AudioFeatures, beatInfo: BeatInfo): void {
    this.frameCount++;

    const p = this.tunerParams;
    const weighted = this.getWeightedAudio(audioFeatures);
    const { amplitude } = weighted;
    const { onBeat, beatIntensity, isSaturated } = beatInfo;

    // Spawn stars on beat
    if (onBeat) {
      const count = 1 + Math.floor(beatIntensity * 3);
      for (let i = 0; i < count; i++) {
        this.spawnStar(audioFeatures, beatInfo);
      }
    }

    // More aggressive spawning during sustained intensity (blast beats)
    if (isSaturated) {
      const saturationSpawns = Math.floor(2 + amplitude * 3);
      for (let i = 0; i < saturationSpawns; i++) {
        if (Math.random() < 0.4) {
          this.spawnStar(audioFeatures, beatInfo);
        }
      }
    }

    // Continuous spawning based on amplitude (sensitivity controls threshold)
    const threshold = 0.5 - p.sensitivity * 0.4;
    if (amplitude > threshold && Math.random() < amplitude * (0.1 + p.sensitivity * 0.2)) {
      this.spawnStar(weighted, beatInfo);
    }

    // Update star twinkle using frame counter
    for (const star of this.stars) {
      star.twinkle = 0.5 + Math.sin(this.frameCount * 0.08 + star.phase) * 0.5;
      star.alpha = star.baseAlpha * star.twinkle;
    }

    // Limit stars
    if (this.stars.length > this.maxStars) {
      this.stars = this.stars.slice(-this.maxStars);
      this.rebuildConnections();
    }
  }

  /** Spawn a new star at a random position, avoiding clusters */
  private spawnStar(audioFeatures: AudioFeatures, beatInfo: BeatInfo): void {
    const { centroid, amplitude } = audioFeatures;
    const { normalizedTempo, beatIntensity } = beatInfo;

    // Position - weighted toward areas with fewer stars
    let x: number;
    let y: number;
    let attempts = 0;
    do {
      x = Math.random() * this.width;
      y = Math.random() * this.height;
      attempts++;
    } while (this.hasNearbyStar(x, y, 30) && attempts < 10);

    const star: Star = {
      x,
      y,
      size: 1 + amplitude * 3 + (beatIntensity || 0) * 2,
      rgb: pitchTempoToRGB(centroid, normalizedTempo, amplitude),
      color: pitchTempoToColor(centroid, normalizedTempo, amplitude),
      baseAlpha: 0.6 + amplitude * 0.4,
      alpha: 0.8,
      twinkle: 1,
      phase: Math.random() * Math.PI * 2,
      birth: this.frameCount,
    };

    this.stars.push(star);

    // Find connections to nearby stars
    for (const other of this.stars) {
      if (other === star) continue;
      const dist = Math.hypot(star.x - other.x, star.y - other.y);
      if (dist < this.connectionDistance) {
        this.connections.push({
          a: star,
          b: other,
          dist,
          alpha: 0.3 * (1 - dist / this.connectionDistance),
        });
      }
    }
  }

  /** Check if there is already a star within minDist of the given coordinates */
  private hasNearbyStar(x: number, y: number, minDist: number): boolean {
    for (const star of this.stars) {
      if (Math.hypot(star.x - x, star.y - y) < minDist) {
        return true;
      }
    }
    return false;
  }

  /** Rebuild all connection edges from scratch (used after trimming stars) */
  private rebuildConnections(): void {
    this.connections = [];
    for (let i = 0; i < this.stars.length; i++) {
      for (let j = i + 1; j < this.stars.length; j++) {
        const a = this.stars[i];
        const b = this.stars[j];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (dist < this.connectionDistance) {
          this.connections.push({
            a,
            b,
            dist,
            alpha: 0.3 * (1 - dist / this.connectionDistance),
          });
        }
      }
    }
  }

  draw(): void {
    // Very subtle fade for accumulation (tuner decay controls)
    this.clearBackground(0.01);

    // Draw connections
    for (const conn of this.connections) {
      const avgAlpha = (conn.a.alpha + conn.b.alpha) / 2 * conn.alpha;
      this.ctx.beginPath();
      this.ctx.moveTo(conn.a.x, conn.a.y);
      this.ctx.lineTo(conn.b.x, conn.b.y);

      // Gradient line between two star colors
      const gradient = this.ctx.createLinearGradient(conn.a.x, conn.a.y, conn.b.x, conn.b.y);
      gradient.addColorStop(0, `rgba(${conn.a.rgb.r}, ${conn.a.rgb.g}, ${conn.a.rgb.b}, ${avgAlpha})`);
      gradient.addColorStop(1, `rgba(${conn.b.rgb.r}, ${conn.b.rgb.g}, ${conn.b.rgb.b}, ${avgAlpha})`);

      this.ctx.strokeStyle = gradient;
      this.ctx.lineWidth = 0.5;
      this.ctx.stroke();
    }

    // Draw stars
    for (const star of this.stars) {
      // Glow
      const gradient = this.ctx.createRadialGradient(
        star.x, star.y, 0,
        star.x, star.y, star.size * 3,
      );
      gradient.addColorStop(0, `rgba(${star.rgb.r}, ${star.rgb.g}, ${star.rgb.b}, ${star.alpha})`);
      gradient.addColorStop(1, `rgba(${star.rgb.r}, ${star.rgb.g}, ${star.rgb.b}, 0)`);

      this.ctx.beginPath();
      this.ctx.arc(star.x, star.y, star.size * 3, 0, Math.PI * 2);
      this.ctx.fillStyle = gradient;
      this.ctx.fill();

      // Core
      this.ctx.beginPath();
      this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
      this.ctx.fill();
    }
  }

  clear(): void {
    this.ctx.fillStyle = '#0a0a0a';
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.stars = [];
    this.connections = [];
  }
}
