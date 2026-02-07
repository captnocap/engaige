/**
 * VoronoiMode - Cellular patterns that fracture on beats
 *
 * Ported from audio-canvas voronoi.js.
 * Sites explode outward on beats and spring back to home positions.
 * Uses brute-force nearest-neighbor Voronoi on an offscreen canvas,
 * then draws cell edges by detecting pixel color boundaries.
 */

import { VisualizationMode } from '../mode-base.js';
import { pitchTempoToColor, pitchTempoToRGB } from '../palette.js';
import type { RGB } from '../palette.js';
import type { AudioFeatures, BeatInfo } from '../types.js';

// ============================================================================
// VoronoiSite - a single Voronoi cell center with spring physics
// ============================================================================

class VoronoiSite {
  x: number;
  y: number;
  homeX: number;
  homeY: number;
  vx: number;
  vy: number;
  color: string;
  rgb: RGB;

  constructor(x: number, y: number, color: string, rgb: RGB) {
    this.x = x;
    this.y = y;
    this.homeX = x;
    this.homeY = y;
    this.vx = 0;
    this.vy = 0;
    this.color = color;
    this.rgb = rgb;
  }

  update(attractStrength: number): void {
    // Spring back to home position
    const dx = this.homeX - this.x;
    const dy = this.homeY - this.y;

    this.vx += dx * attractStrength;
    this.vy += dy * attractStrength;

    // Damping
    this.vx *= 0.92;
    this.vy *= 0.92;

    this.x += this.vx;
    this.y += this.vy;
  }

  explode(centerX: number, centerY: number, force: number): void {
    const dx = this.x - centerX;
    const dy = this.y - centerY;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;

    this.vx += (dx / dist) * force;
    this.vy += (dy / dist) * force;
  }
}

// ============================================================================
// VoronoiMode
// ============================================================================

export class VoronoiMode extends VisualizationMode {
  private sites: VoronoiSite[];
  private numSites: number;

  // Smoothed audio
  private smoothBass: number;
  private smoothMid: number;
  private smoothHigh: number;
  private smoothAmplitude: number;

  // Offscreen canvas for pixel-level Voronoi rendering
  private offscreenCanvas: HTMLCanvasElement | null;
  private offscreenCtx: CanvasRenderingContext2D | null;

  constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
    super(ctx, width, height);
    this.name = 'voronoi';
    this.description = 'Cellular patterns that fracture on beats';

    this.sites = [];
    this.numSites = 60; // Fewer but larger cells look better

    this.smoothBass = 0;
    this.smoothMid = 0;
    this.smoothHigh = 0;
    this.smoothAmplitude = 0;

    this.offscreenCanvas = null;
    this.offscreenCtx = null;
  }

  init(): void {
    this.clear();
    this.createSites();

    // Create offscreen canvas for Voronoi rendering
    this.offscreenCanvas = document.createElement('canvas');
    this.offscreenCanvas.width = this.width;
    this.offscreenCanvas.height = this.height;
    this.offscreenCtx = this.offscreenCanvas.getContext('2d');
  }

  private createSites(): void {
    this.sites = [];

    // Use Poisson disk sampling for better distribution
    const minDist = Math.sqrt((this.width * this.height) / this.numSites) * 0.8;
    const candidates: Array<{ x: number; y: number }> = [];

    // Start with random point
    candidates.push({
      x: Math.random() * this.width,
      y: Math.random() * this.height,
    });

    while (this.sites.length < this.numSites && candidates.length > 0) {
      const idx = Math.floor(Math.random() * candidates.length);
      const candidate = candidates[idx];

      // Check distance to existing sites
      let valid = true;
      for (const site of this.sites) {
        const dx = site.x - candidate.x;
        const dy = site.y - candidate.y;
        if (dx * dx + dy * dy < minDist * minDist * 0.5) {
          valid = false;
          break;
        }
      }

      if (valid) {
        const hue = (candidate.x / this.width + candidate.y / this.height) / 2;
        const color = pitchTempoToColor(hue, 0.5, 0.7);
        const rgb = pitchTempoToRGB(hue, 0.5, 0.7);

        this.sites.push(new VoronoiSite(
          candidate.x, candidate.y,
          color, rgb,
        ));

        // Add new candidates around this point
        for (let i = 0; i < 10; i++) {
          const angle = Math.random() * Math.PI * 2;
          const dist = minDist + Math.random() * minDist;
          candidates.push({
            x: candidate.x + Math.cos(angle) * dist,
            y: candidate.y + Math.sin(angle) * dist,
          });
        }
      }

      candidates.splice(idx, 1);
    }

    // Fill remaining with random
    while (this.sites.length < this.numSites) {
      const x = Math.random() * this.width;
      const y = Math.random() * this.height;
      const hue = (x / this.width + y / this.height) / 2;
      const color = pitchTempoToColor(hue, 0.5, 0.7);
      const rgb = pitchTempoToRGB(hue, 0.5, 0.7);
      this.sites.push(new VoronoiSite(x, y, color, rgb));
    }
  }

  resize(width: number, height: number): void {
    super.resize(width, height);
    this.init();
  }

  update(audioFeatures: AudioFeatures, beatInfo: BeatInfo): void {
    const p = this.tunerParams;
    const weighted = this.getWeightedAudio(audioFeatures);
    const { bass, mid, high, amplitude, centroid } = weighted;
    const { normalizedTempo, onBeat, beatIntensity, isSaturated } = beatInfo;

    // Smooth audio values
    const smoothing = 0.15;
    this.smoothBass += (bass - this.smoothBass) * smoothing;
    this.smoothMid += (mid - this.smoothMid) * smoothing;
    this.smoothHigh += (high - this.smoothHigh) * smoothing;
    this.smoothAmplitude += (amplitude - this.smoothAmplitude) * smoothing;

    // Shatter on beat (chaos increases force, sensitivity lowers threshold)
    if (onBeat && beatIntensity > (0.5 - p.sensitivity * 0.4)) {
      const force = beatIntensity * (15 + p.chaos * 30);
      const centerX = this.width / 2;
      const centerY = this.height / 2;

      for (const site of this.sites) {
        site.explode(centerX, centerY, force);
      }
    }

    // Continuous disturbance during saturation (chaos amplifies)
    if (isSaturated) {
      const disturbance = 2 + p.chaos * 6;
      for (const site of this.sites) {
        site.vx += (Math.random() - 0.5) * disturbance;
        site.vy += (Math.random() - 0.5) * disturbance;
      }
    }

    // High frequency adds jitter
    if (this.smoothHigh > 0.4) {
      const jitter = (this.smoothHigh - 0.4) * 8;
      for (const site of this.sites) {
        site.x += (Math.random() - 0.5) * jitter;
        site.y += (Math.random() - 0.5) * jitter;
      }
    }

    // Attraction strength based on bass (heavy bass = slower return)
    const attractStrength = 0.02 + (1 - this.smoothBass) * 0.05;

    // Update site colors based on current audio
    for (let i = 0; i < this.sites.length; i++) {
      const site = this.sites[i];
      site.update(attractStrength);

      // Gradually shift colors based on audio
      const localPitch = (site.x / this.width * 0.5 + centroid * 0.5);
      site.color = pitchTempoToColor(localPitch, normalizedTempo, this.smoothAmplitude);
      site.rgb = pitchTempoToRGB(localPitch, normalizedTempo, this.smoothAmplitude);
    }
  }

  draw(): void {
    const ctx = this.ctx;

    // Draw Voronoi cells using brute force nearest-neighbor
    this.renderVoronoi();

    // Draw the cached result
    if (this.offscreenCanvas) {
      ctx.drawImage(this.offscreenCanvas, 0, 0);
    }

    // Draw cell edges with dark lines
    this.drawEdges(ctx);

    // Draw site centers as small dots
    for (const site of this.sites) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.beginPath();
      ctx.arc(site.x, site.y, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private renderVoronoi(): void {
    // Guard: need sites to render
    if (!this.sites || this.sites.length === 0) {
      this.createSites();
      if (this.sites.length === 0) return;
    }

    const ctx = this.offscreenCtx;
    if (!ctx) return;

    const imageData = ctx.createImageData(this.width, this.height);
    const data = imageData.data;

    // For each pixel, find nearest site (step=1 for full quality)
    const step = 1;
    for (let y = 0; y < this.height; y += step) {
      for (let x = 0; x < this.width; x += step) {
        let minDist = Infinity;
        let nearestSite = this.sites[0];

        for (const site of this.sites) {
          const dx = x - site.x;
          const dy = y - site.y;
          const dist = dx * dx + dy * dy;

          if (dist < minDist) {
            minDist = dist;
            nearestSite = site;
          }
        }

        // Fill the block with nearest site's color
        for (let dy = 0; dy < step && y + dy < this.height; dy++) {
          for (let dx = 0; dx < step && x + dx < this.width; dx++) {
            const idx = ((y + dy) * this.width + (x + dx)) * 4;
            data[idx] = nearestSite.rgb.r;
            data[idx + 1] = nearestSite.rgb.g;
            data[idx + 2] = nearestSite.rgb.b;
            data[idx + 3] = 255;
          }
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }

  private drawEdges(ctx: CanvasRenderingContext2D): void {
    // Draw cell boundaries by detecting color changes
    const imageData = ctx.getImageData(0, 0, this.width, this.height);
    const data = imageData.data;

    ctx.strokeStyle = 'rgba(20, 20, 30, 0.9)';
    ctx.lineWidth = 2;
    ctx.beginPath();

    // Scan for edges (where adjacent pixels have different colors)
    for (let y = 1; y < this.height - 1; y += 2) {
      for (let x = 1; x < this.width - 1; x += 2) {
        const idx = (y * this.width + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];

        // Check right neighbor
        const rightIdx = (y * this.width + x + 1) * 4;
        const rightR = data[rightIdx];
        const rightG = data[rightIdx + 1];
        const rightB = data[rightIdx + 2];

        // Check bottom neighbor
        const bottomIdx = ((y + 1) * this.width + x) * 4;
        const bottomR = data[bottomIdx];
        const bottomG = data[bottomIdx + 1];
        const bottomB = data[bottomIdx + 2];

        // If color differs significantly, it's an edge
        const diffRight = Math.abs(r - rightR) + Math.abs(g - rightG) + Math.abs(b - rightB);
        const diffBottom = Math.abs(r - bottomR) + Math.abs(g - bottomG) + Math.abs(b - bottomB);

        if (diffRight > 30) {
          ctx.moveTo(x + 0.5, y - 1);
          ctx.lineTo(x + 0.5, y + 2);
        }
        if (diffBottom > 30) {
          ctx.moveTo(x - 1, y + 0.5);
          ctx.lineTo(x + 2, y + 0.5);
        }
      }
    }
    ctx.stroke();
  }

  clear(): void {
    this.sites = [];
    this.smoothBass = 0;
    this.smoothMid = 0;
    this.smoothHigh = 0;
    this.smoothAmplitude = 0;
    this.ctx.fillStyle = 'rgb(10, 10, 10)';
    this.ctx.fillRect(0, 0, this.width, this.height);
  }
}
