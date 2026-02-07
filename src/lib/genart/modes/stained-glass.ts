/**
 * Stained Glass Mosaic Visualization Mode
 *
 * Delaunay-like triangulation with colored fills.
 * Vertices oscillate with FFT, colors ripple through cells
 * like medieval rose windows.
 * Ported from audio-canvas stainedglass.js.
 */

import { VisualizationMode } from '../mode-base.js';
import type { AudioFeatures, BeatInfo } from '../types.js';

/** HSL color representation for triangle fills */
interface HSLColor {
  h: number;
  s: number;
  l: number;
}

/** A color wave that propagates outward from a point, recoloring triangles */
interface ColorWave {
  x: number;
  y: number;
  radius: number;
  speed: number;
  hue: number;
  saturation: number;
  lightness: number;
  maxRadius: number;
}

/** A mesh vertex with spring-return physics */
class Vertex {
  x: number;
  y: number;
  homeX: number;
  homeY: number;
  vx: number;
  vy: number;

  constructor(x: number, y: number, homeX: number, homeY: number) {
    this.x = x;
    this.y = y;
    this.homeX = homeX;
    this.homeY = homeY;
    this.vx = 0;
    this.vy = 0;
  }

  /** Apply spring force back toward home position and update velocity/position */
  update(returnStrength: number): void {
    // Spring back to home
    const dx = this.homeX - this.x;
    const dy = this.homeY - this.y;

    this.vx += dx * returnStrength;
    this.vy += dy * returnStrength;

    // Damping
    this.vx *= 0.9;
    this.vy *= 0.9;

    this.x += this.vx;
    this.y += this.vy;
  }

  /** Apply an impulse force to the vertex */
  disturb(fx: number, fy: number): void {
    this.vx += fx;
    this.vy += fy;
  }
}

/** A triangle in the stained glass mesh with smoothly interpolated color */
class Triangle {
  vertices: [Vertex, Vertex, Vertex];
  color: HSLColor;
  targetColor: HSLColor;

  constructor(v0: Vertex, v1: Vertex, v2: Vertex) {
    this.vertices = [v0, v1, v2];
    this.color = { h: 0, s: 50, l: 50 };
    this.targetColor = { h: 0, s: 50, l: 50 };
  }

  /** Geometric centroid of this triangle */
  get centroid(): { x: number; y: number } {
    const [v0, v1, v2] = this.vertices;
    return {
      x: (v0.x + v1.x + v2.x) / 3,
      y: (v0.y + v1.y + v2.y) / 3,
    };
  }

  /** Smoothly interpolate current color toward target color */
  updateColor(speed: number = 0.1): void {
    this.color.h += (this.targetColor.h - this.color.h) * speed;
    this.color.s += (this.targetColor.s - this.color.s) * speed;
    this.color.l += (this.targetColor.l - this.color.l) * speed;
  }
}

export class StainedGlassMode extends VisualizationMode {
  private meshVertices: Vertex[];
  private triangles: Triangle[];
  private colorWaves: ColorWave[];

  // Smoothed audio
  private smoothBass: number;
  private smoothMid: number;
  private smoothHigh: number;

  constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
    super(ctx, width, height);
    this.name = 'stainedglass';
    this.description = 'Delaunay triangulation with rippling colors';

    this.meshVertices = [];
    this.triangles = [];
    this.colorWaves = [];

    this.smoothBass = 0;
    this.smoothMid = 0;
    this.smoothHigh = 0;
  }

  init(): void {
    this.clear();
    this.createMesh();
  }

  /** Build the triangulated mesh grid with jittered vertices */
  private createMesh(): void {
    this.meshVertices = [];
    this.triangles = [];

    // Create grid of vertices with some randomness
    const spacing = 60;
    const jitter = 20;

    const cols = Math.ceil(this.width / spacing) + 2;
    const rows = Math.ceil(this.height / spacing) + 2;

    // Create vertices
    for (let y = -1; y <= rows; y++) {
      for (let x = -1; x <= cols; x++) {
        const baseX = x * spacing;
        const baseY = y * spacing;

        // Add jitter except for edge vertices
        const isEdge = x === -1 || y === -1 || x === cols || y === rows;
        const jx = isEdge ? 0 : (Math.random() - 0.5) * jitter * 2;
        const jy = isEdge ? 0 : (Math.random() - 0.5) * jitter * 2;

        this.meshVertices.push(new Vertex(
          baseX + jx,
          baseY + jy,
          baseX + jx,
          baseY + jy,
        ));
      }
    }

    // Triangulate using regular grid triangulation
    const gridCols = cols + 2;

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols + 1; x++) {
        const i0 = y * gridCols + x;
        const i1 = i0 + 1;
        const i2 = i0 + gridCols;
        const i3 = i2 + 1;

        if (i3 < this.meshVertices.length) {
          // Two triangles per quad
          this.triangles.push(new Triangle(
            this.meshVertices[i0],
            this.meshVertices[i1],
            this.meshVertices[i2],
          ));

          this.triangles.push(new Triangle(
            this.meshVertices[i1],
            this.meshVertices[i3],
            this.meshVertices[i2],
          ));
        }
      }
    }

    // Initialize triangle colors based on position
    for (const tri of this.triangles) {
      const c = tri.centroid;
      const hue = (c.x / this.width * 180 + c.y / this.height * 180) % 360;
      tri.color = { h: hue, s: 60, l: 40 };
      tri.targetColor = { ...tri.color };
    }
  }

  resize(width: number, height: number): void {
    super.resize(width, height);
    this.init();
  }

  /** Spawn a color wave from a point that will ripple outward recoloring triangles */
  private spawnColorWave(
    x: number,
    y: number,
    hue: number,
    saturation: number,
    lightness: number,
  ): void {
    this.colorWaves.push({
      x,
      y,
      radius: 0,
      speed: 8,
      hue,
      saturation,
      lightness,
      maxRadius: Math.max(this.width, this.height) * 1.5,
    });

    // Limit waves
    if (this.colorWaves.length > 10) {
      this.colorWaves.shift();
    }
  }

  update(audioFeatures: AudioFeatures, beatInfo: BeatInfo): void {
    const weighted = this.getWeightedAudio(audioFeatures);
    const { bass, mid, high, amplitude, centroid, frequencies } = weighted;
    const { normalizedTempo, onBeat, beatIntensity } = beatInfo;

    // Smooth audio values
    const smoothing = 0.15;
    this.smoothBass += (bass - this.smoothBass) * smoothing;
    this.smoothMid += (mid - this.smoothMid) * smoothing;
    this.smoothHigh += (high - this.smoothHigh) * smoothing;

    // Vertex disturbance based on FFT
    const numFreqs = Math.min(frequencies.length, this.meshVertices.length);
    for (let i = 0; i < this.meshVertices.length; i++) {
      const v = this.meshVertices[i];

      // Map vertex to frequency bin
      const freqIdx = Math.floor((i / this.meshVertices.length) * numFreqs);
      const freqMag = frequencies[freqIdx] / 255;

      // Disturb based on frequency magnitude
      const angle = Math.atan2(v.y - this.height / 2, v.x - this.width / 2);
      const force = freqMag * this.smoothBass * 3;

      v.disturb(
        Math.cos(angle) * force,
        Math.sin(angle) * force,
      );
    }

    // High frequency adds random jitter
    if (this.smoothHigh > 0.3) {
      const jitterAmount = (this.smoothHigh - 0.3) * 5;
      for (const v of this.meshVertices) {
        v.disturb(
          (Math.random() - 0.5) * jitterAmount,
          (Math.random() - 0.5) * jitterAmount,
        );
      }
    }

    // Return strength based on mid (higher mid = more stable)
    const returnStrength = 0.05 + this.smoothMid * 0.1;

    // Update vertices
    for (const v of this.meshVertices) {
      v.update(returnStrength);
    }

    // Spawn color wave on beat
    if (onBeat && beatIntensity > 0.3) {
      // Spawn from random position or center
      const spawnX = Math.random() < 0.5 ? this.width / 2 : Math.random() * this.width;
      const spawnY = Math.random() < 0.5 ? this.height / 2 : Math.random() * this.height;

      // Color based on audio
      const hue = centroid * 360;
      const saturation = 50 + beatIntensity * 40;
      const lightness = 30 + amplitude * 40;

      this.spawnColorWave(spawnX, spawnY, hue, saturation, lightness);
    }

    // Update color waves
    for (let i = this.colorWaves.length - 1; i >= 0; i--) {
      const wave = this.colorWaves[i];
      wave.radius += wave.speed * (1 + normalizedTempo);

      if (wave.radius > wave.maxRadius) {
        this.colorWaves.splice(i, 1);
        continue;
      }

      // Affect triangles within wave radius
      const waveWidth = 100;
      for (const tri of this.triangles) {
        const c = tri.centroid;
        const dx = c.x - wave.x;
        const dy = c.y - wave.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Check if triangle is within wave band
        if (dist > wave.radius - waveWidth && dist < wave.radius + waveWidth) {
          const intensity = 1 - Math.abs(dist - wave.radius) / waveWidth;
          const fadeOut = 1 - wave.radius / wave.maxRadius;

          // Blend toward wave color
          tri.targetColor.h = wave.hue + (Math.random() - 0.5) * 20;
          tri.targetColor.s = wave.saturation * intensity * fadeOut + tri.targetColor.s * (1 - intensity * fadeOut);
          tri.targetColor.l = wave.lightness * intensity * fadeOut + tri.targetColor.l * (1 - intensity * fadeOut);
        }
      }
    }

    // Update triangle colors
    const colorSpeed = 0.05 + normalizedTempo * 0.1;
    for (const tri of this.triangles) {
      tri.updateColor(colorSpeed);
    }
  }

  draw(): void {
    const ctx = this.ctx;

    // Draw triangles with colored fills
    for (const tri of this.triangles) {
      const [v0, v1, v2] = tri.vertices;

      ctx.beginPath();
      ctx.moveTo(v0.x, v0.y);
      ctx.lineTo(v1.x, v1.y);
      ctx.lineTo(v2.x, v2.y);
      ctx.closePath();

      // Fill with HSL color
      const h = ((tri.color.h % 360) + 360) % 360;
      ctx.fillStyle = `hsl(${h}, ${tri.color.s}%, ${tri.color.l}%)`;
      ctx.fill();
    }

    // Draw "leading" (dark edges like stained glass leading strips)
    ctx.strokeStyle = 'rgba(10, 10, 10, 0.9)';
    ctx.lineWidth = 3;

    for (const tri of this.triangles) {
      const [v0, v1, v2] = tri.vertices;

      ctx.beginPath();
      ctx.moveTo(v0.x, v0.y);
      ctx.lineTo(v1.x, v1.y);
      ctx.lineTo(v2.x, v2.y);
      ctx.closePath();
      ctx.stroke();
    }

    // Draw vertex points as small circles (like solder joints)
    ctx.fillStyle = 'rgba(30, 30, 30, 0.8)';
    for (const v of this.meshVertices) {
      ctx.beginPath();
      ctx.arc(v.x, v.y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  clear(): void {
    this.colorWaves = [];
    this.smoothBass = 0;
    this.smoothMid = 0;
    this.smoothHigh = 0;
    this.ctx.fillStyle = 'rgb(10, 10, 10)';
    this.ctx.fillRect(0, 0, this.width, this.height);
  }
}
