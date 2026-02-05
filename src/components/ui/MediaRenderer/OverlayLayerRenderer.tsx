/**
 * OverlayLayerRenderer
 *
 * Renders overlay effects on top of the base layer.
 * Effects: vhs_noise, film_grain, scan_lines, vignette, glitch, etc.
 */

import { useRef, useEffect, useCallback } from 'react';
import type { OverlayLayer, OverlayEffectType } from './types.js';

interface OverlayLayerRendererProps {
  layer: OverlayLayer;
  width: number;
  height: number;
  time: number;
  isPaused: boolean;
}

export function OverlayLayerRenderer({
  layer,
  width,
  height,
  time,
  isPaused,
}: OverlayLayerRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(performance.now());

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const elapsed = (performance.now() - startTimeRef.current) / 1000;

    // Clear with transparency
    ctx.clearRect(0, 0, width, height);

    // Render each effect
    for (const effect of layer.effects) {
      renderOverlayEffect(ctx, effect.type, effect.intensity ?? 0.5, effect.params ?? {}, elapsed, width, height);
    }

    if (!isPaused) {
      animationRef.current = requestAnimationFrame(render);
    }
  }, [layer, width, height, isPaused]);

  useEffect(() => {
    if (!isPaused && layer.effects.length > 0) {
      animationRef.current = requestAnimationFrame(render);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [render, isPaused, layer.effects.length]);

  if (layer.effects.length === 0) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute inset-0 pointer-events-none"
      style={{ width: '100%', height: '100%', mixBlendMode: 'normal' }}
    />
  );
}

// ============================================================================
// Effect Renderers
// ============================================================================

function renderOverlayEffect(
  ctx: CanvasRenderingContext2D,
  type: OverlayEffectType,
  intensity: number,
  params: Record<string, unknown>,
  time: number,
  width: number,
  height: number
) {
  switch (type) {
    case 'vhs_noise':
      renderVhsNoise(ctx, intensity, time, width, height);
      break;
    case 'film_grain':
      renderFilmGrain(ctx, intensity, time, width, height);
      break;
    case 'scan_lines':
      renderScanLines(ctx, intensity, time, width, height);
      break;
    case 'vignette':
      renderVignette(ctx, intensity, width, height);
      break;
    case 'chromatic_aberration':
      renderChromaticAberration(ctx, intensity, time, width, height);
      break;
    case 'glitch':
      renderGlitch(ctx, intensity, time, width, height);
      break;
    case 'dust_scratches':
      renderDustScratches(ctx, intensity, time, width, height);
      break;
    case 'light_leak':
      renderLightLeak(ctx, intensity, time, width, height);
      break;
    case 'rain':
      renderRain(ctx, intensity, time, width, height);
      break;
    case 'snow':
      renderSnow(ctx, intensity, time, width, height);
      break;
  }
}

function renderVhsNoise(
  ctx: CanvasRenderingContext2D,
  intensity: number,
  time: number,
  width: number,
  height: number
) {
  // Random horizontal noise lines
  const lineCount = Math.floor(intensity * 20);

  ctx.fillStyle = `rgba(255, 255, 255, ${intensity * 0.1})`;

  for (let i = 0; i < lineCount; i++) {
    const y = Math.random() * height;
    const lineHeight = 1 + Math.random() * 3;
    ctx.fillRect(0, y, width, lineHeight);
  }

  // Tracking line
  const trackingY = ((time * 100) % (height + 50)) - 25;
  ctx.fillStyle = `rgba(255, 255, 255, ${intensity * 0.3})`;
  ctx.fillRect(0, trackingY, width, 5 + Math.random() * 10);

  // Occasional color shift band
  if (Math.random() < 0.1 * intensity) {
    const bandY = Math.random() * height;
    const bandHeight = 10 + Math.random() * 30;
    ctx.fillStyle = `rgba(255, 0, 0, ${intensity * 0.1})`;
    ctx.fillRect(0, bandY, width, bandHeight);
  }
}

function renderFilmGrain(
  ctx: CanvasRenderingContext2D,
  intensity: number,
  time: number,
  width: number,
  height: number
) {
  // Sample every 4 pixels for performance
  const step = 4;
  const alpha = intensity * 0.15;

  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const noise = Math.random();
      if (noise < 0.5) continue;

      const brightness = Math.floor(noise * 255);
      ctx.fillStyle = `rgba(${brightness}, ${brightness}, ${brightness}, ${alpha * noise})`;
      ctx.fillRect(x, y, step, step);
    }
  }
}

function renderScanLines(
  ctx: CanvasRenderingContext2D,
  intensity: number,
  time: number,
  width: number,
  height: number
) {
  ctx.fillStyle = `rgba(0, 0, 0, ${intensity * 0.3})`;

  const lineSpacing = 3;
  for (let y = 0; y < height; y += lineSpacing) {
    ctx.fillRect(0, y, width, 1);
  }
}

function renderVignette(
  ctx: CanvasRenderingContext2D,
  intensity: number,
  width: number,
  height: number
) {
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.max(width, height) * 0.7;

  const gradient = ctx.createRadialGradient(cx, cy, radius * 0.3, cx, cy, radius);
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
  gradient.addColorStop(0.5, `rgba(0, 0, 0, ${intensity * 0.3})`);
  gradient.addColorStop(1, `rgba(0, 0, 0, ${intensity * 0.8})`);

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

function renderChromaticAberration(
  ctx: CanvasRenderingContext2D,
  intensity: number,
  time: number,
  width: number,
  height: number
) {
  // Create edge RGB split effect
  const offset = intensity * 5;

  // Red channel shift (left edge)
  ctx.fillStyle = `rgba(255, 0, 0, ${intensity * 0.15})`;
  ctx.fillRect(0, 0, offset, height);

  // Cyan channel shift (right edge)
  ctx.fillStyle = `rgba(0, 255, 255, ${intensity * 0.15})`;
  ctx.fillRect(width - offset, 0, offset, height);

  // Blue channel shift (top/bottom)
  ctx.fillStyle = `rgba(0, 0, 255, ${intensity * 0.1})`;
  ctx.fillRect(0, 0, width, offset / 2);
  ctx.fillRect(0, height - offset / 2, width, offset / 2);
}

function renderGlitch(
  ctx: CanvasRenderingContext2D,
  intensity: number,
  time: number,
  width: number,
  height: number
) {
  // Occasional glitch blocks
  if (Math.random() > intensity * 0.3) return;

  const blockCount = Math.floor(intensity * 10);

  for (let i = 0; i < blockCount; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const w = 20 + Math.random() * 100;
    const h = 5 + Math.random() * 20;

    // Random color
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);

    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${intensity * 0.5})`;
    ctx.fillRect(x, y, w, h);

    // Horizontal offset copy
    if (Math.random() < 0.5) {
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${intensity * 0.3})`;
      ctx.fillRect(x + (Math.random() - 0.5) * 50, y, w, h);
    }
  }
}

function renderDustScratches(
  ctx: CanvasRenderingContext2D,
  intensity: number,
  time: number,
  width: number,
  height: number
) {
  // Dust particles
  ctx.fillStyle = `rgba(255, 255, 255, ${intensity * 0.3})`;
  const dustCount = Math.floor(intensity * 30);

  for (let i = 0; i < dustCount; i++) {
    if (Math.random() > 0.7) continue;

    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = 1 + Math.random() * 2;

    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }

  // Scratches (vertical lines)
  ctx.strokeStyle = `rgba(255, 255, 255, ${intensity * 0.2})`;
  ctx.lineWidth = 1;

  const scratchCount = Math.floor(intensity * 5);
  for (let i = 0; i < scratchCount; i++) {
    if (Math.random() > 0.3) continue;

    const x = Math.random() * width;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + (Math.random() - 0.5) * 10, height);
    ctx.stroke();
  }
}

function renderLightLeak(
  ctx: CanvasRenderingContext2D,
  intensity: number,
  time: number,
  width: number,
  height: number
) {
  // Warm light leak from corner
  const leakX = width * (0.7 + Math.sin(time * 0.5) * 0.2);
  const leakY = height * (0.2 + Math.cos(time * 0.3) * 0.1);
  const radius = Math.max(width, height) * 0.5;

  const gradient = ctx.createRadialGradient(leakX, leakY, 0, leakX, leakY, radius);
  gradient.addColorStop(0, `rgba(255, 200, 100, ${intensity * 0.4})`);
  gradient.addColorStop(0.3, `rgba(255, 150, 50, ${intensity * 0.2})`);
  gradient.addColorStop(1, 'rgba(255, 100, 0, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

function renderRain(
  ctx: CanvasRenderingContext2D,
  intensity: number,
  time: number,
  width: number,
  height: number
) {
  ctx.strokeStyle = `rgba(150, 180, 255, ${intensity * 0.5})`;
  ctx.lineWidth = 1;

  const dropCount = Math.floor(intensity * 100);

  for (let i = 0; i < dropCount; i++) {
    const seed = i * 17.3;
    const x = ((Math.sin(seed) + 1) / 2) * width;
    const baseY = ((Math.sin(seed * 2.1) + 1) / 2);
    const y = ((baseY + time * 2) % 1.2 - 0.1) * height;
    const length = 10 + Math.sin(seed * 3) * 10;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - 2, y + length);
    ctx.stroke();
  }
}

function renderSnow(
  ctx: CanvasRenderingContext2D,
  intensity: number,
  time: number,
  width: number,
  height: number
) {
  ctx.fillStyle = `rgba(255, 255, 255, ${intensity * 0.8})`;

  const flakeCount = Math.floor(intensity * 80);

  for (let i = 0; i < flakeCount; i++) {
    const seed = i * 31.7;
    const x = ((Math.sin(seed) + 1) / 2) * width + Math.sin(time + i) * 20;
    const baseY = ((Math.sin(seed * 1.7) + 1) / 2);
    const y = ((baseY + time * 0.3) % 1.1 - 0.05) * height;
    const size = 2 + Math.sin(seed * 2.3) * 2;

    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
}

export default OverlayLayerRenderer;
