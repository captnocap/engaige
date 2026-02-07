/**
 * Mandala Visualization Mode
 *
 * Onset slicing mandala - each beat spawns a radial slice.
 * Builds up like tree rings, creating a circular timeline.
 * Ported from audio-canvas mandala.js.
 */

import { VisualizationMode } from '../mode-base.js';
import { pitchTempoToColor, pitchTempoToRGB } from '../palette.js';
import type { AudioFeatures, BeatInfo } from '../types.js';
import type { RGB } from '../palette.js';

/** A single radial slice in the mandala ring pattern */
interface MandalaSlice {
  angle: number;
  startRadius: number;
  endRadius: number;
  width: number;
  color: string;
  rgb: RGB;
  intensity: number;
  /** Frame number when this slice was created */
  birth: number;
}

export class MandalaMode extends VisualizationMode {
  slices: MandalaSlice[];
  currentRadius: number;
  maxRadius: number;
  rotationOffset: number;
  centerX: number;
  centerY: number;
  /** Monotonically increasing frame counter, used for birth timestamps */
  frameCount: number;

  constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
    super(ctx, width, height);
    this.name = 'mandala';
    this.description = 'Radial slices on each beat build a mandala timeline like tree rings';
    this.slices = [];
    this.currentRadius = 50;
    this.maxRadius = 0;
    this.rotationOffset = 0;
    this.centerX = 0;
    this.centerY = 0;
    this.frameCount = 0;
  }

  init(): void {
    this.centerX = this.width / 2;
    this.centerY = this.height / 2;
    this.maxRadius = Math.min(this.width, this.height) * 0.45;
    this.currentRadius = 50;
    this.slices = [];
    this.rotationOffset = 0;
    this.frameCount = 0;
  }

  resize(width: number, height: number): void {
    super.resize(width, height);
    this.centerX = width / 2;
    this.centerY = height / 2;
    this.maxRadius = Math.min(width, height) * 0.45;
  }

  update(audioFeatures: AudioFeatures, beatInfo: BeatInfo): void {
    this.frameCount++;

    const p = this.tunerParams;
    const weighted = this.getWeightedAudio(audioFeatures);
    const { amplitude, centroid, bass, mid, high } = weighted;
    const { onBeat, beatIntensity, normalizedTempo } = beatInfo;

    // Slowly rotate the whole mandala (chaos adds variation)
    this.rotationOffset += 0.001 * (1 + normalizedTempo) * (0.5 + p.chaos);

    // On each beat, add a new slice
    if (onBeat && this.currentRadius < this.maxRadius) {
      const sliceCount = Math.floor(8 + beatIntensity * 8); // 8-16 slices per ring
      const sliceAngle = (Math.PI * 2) / sliceCount;

      for (let i = 0; i < sliceCount; i++) {
        const angle = i * sliceAngle + this.rotationOffset;

        // Vary the slice based on frequency content
        const freqMix = (i % 3 === 0) ? bass : (i % 3 === 1) ? mid : high;
        const pitch = centroid + (Math.random() - 0.5) * 0.2;

        this.slices.push({
          angle,
          startRadius: this.currentRadius,
          endRadius: this.currentRadius + 5 + beatIntensity * 15,
          width: sliceAngle * 0.8,
          color: pitchTempoToColor(pitch, normalizedTempo, freqMix),
          rgb: pitchTempoToRGB(pitch, normalizedTempo, freqMix),
          intensity: freqMix,
          birth: this.frameCount,
        });
      }

      // Expand radius for next ring
      this.currentRadius += 3 + beatIntensity * 10;
    }

    // Also add subtle continuous growth based on amplitude
    if (amplitude > 0.2 && Math.random() < amplitude * 0.3) {
      const angle = Math.random() * Math.PI * 2;
      const pitch = centroid;
      const rgb = pitchTempoToRGB(pitch, normalizedTempo, amplitude);

      this.slices.push({
        angle,
        startRadius: this.currentRadius - 5,
        endRadius: this.currentRadius + amplitude * 10,
        width: 0.05 + amplitude * 0.1,
        color: pitchTempoToColor(pitch, normalizedTempo, amplitude),
        rgb,
        intensity: amplitude,
        birth: this.frameCount,
      });
    }
  }

  draw(): void {
    // Use clearBackground for tuner-controlled decay
    this.clearBackground(0.005);

    // Draw all slices
    for (const slice of this.slices) {
      this.drawSlice(slice);
    }
  }

  /** Render a single radial arc slice */
  private drawSlice(slice: MandalaSlice): void {
    const { angle, startRadius, endRadius, width, rgb, intensity } = slice;

    this.ctx.save();
    this.ctx.translate(this.centerX, this.centerY);

    // Draw arc slice
    this.ctx.beginPath();
    this.ctx.arc(0, 0, startRadius, angle - width / 2, angle + width / 2);
    this.ctx.arc(0, 0, endRadius, angle + width / 2, angle - width / 2, true);
    this.ctx.closePath();

    // Fill with gradient from inner to outer
    const gradient = this.ctx.createRadialGradient(0, 0, startRadius, 0, 0, endRadius);
    gradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${intensity * 0.8})`);
    gradient.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${intensity * 0.3})`);

    this.ctx.fillStyle = gradient;
    this.ctx.fill();

    // Subtle stroke
    this.ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${intensity * 0.2})`;
    this.ctx.lineWidth = 0.5;
    this.ctx.stroke();

    this.ctx.restore();
  }

  clear(): void {
    this.ctx.fillStyle = '#0a0a0a';
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.slices = [];
    this.currentRadius = 50;
    this.rotationOffset = 0;
  }
}
