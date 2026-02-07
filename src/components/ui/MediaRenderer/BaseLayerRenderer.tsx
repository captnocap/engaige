/**
 * BaseLayerRenderer
 *
 * Renders the base layer of the media composition.
 * Handles: solid colors, gradients (animated), canvas effects, images.
 */

import { useRef, useEffect, useCallback } from 'react';
import type { BaseLayer, BaseEffectType } from './types.js';
import { GenArtRenderer } from './GenArtRenderer.js';

interface BaseLayerRendererProps {
  layer: BaseLayer;
  width: number;
  height: number;
  time: number;
  isPaused: boolean;
}

export function BaseLayerRenderer({
  layer,
  width,
  height,
  time,
  isPaused,
}: BaseLayerRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  // Render solid color
  if (layer.type === 'solid') {
    return (
      <div
        className="absolute inset-0"
        style={{ backgroundColor: layer.color }}
      />
    );
  }

  // Render static gradient
  if (layer.type === 'gradient' && !layer.animated) {
    const gradientStyle = {
      background: `linear-gradient(${layer.angle ?? 180}deg, ${layer.colors.join(', ')})`,
    };
    return <div className="absolute inset-0" style={gradientStyle} />;
  }

  // Render image
  if (layer.type === 'image_url') {
    return (
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${layer.url})` }}
      />
    );
  }

  // Render image by ID (would need to resolve from media_files)
  if (layer.type === 'image') {
    // TODO: Resolve image_id to URL via media service
    return (
      <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
        <span className="text-gray-500">Image: {layer.image_id}</span>
      </div>
    );
  }

  // Render placeholder (stub)
  if (layer.type === 'placeholder') {
    return <PlaceholderRenderer placeholder={layer.placeholder} time={time} />;
  }

  // Render generative art
  if (layer.type === 'genart') {
    return (
      <GenArtRenderer
        config={layer.config}
        width={width}
        height={height}
        isPlaying={!isPaused}
        currentTime={time}
      />
    );
  }

  // Render animated gradient or canvas effect
  return (
    <CanvasEffectRenderer
      layer={layer}
      width={width}
      height={height}
      time={time}
      isPaused={isPaused}
    />
  );
}

// ============================================================================
// Canvas Effect Renderer
// ============================================================================

interface CanvasEffectRendererProps {
  layer: BaseLayer;
  width: number;
  height: number;
  time: number;
  isPaused: boolean;
}

function CanvasEffectRenderer({
  layer,
  width,
  height,
  time,
  isPaused,
}: CanvasEffectRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startTimeRef = useRef<number>(performance.now());
  const animationRef = useRef<number | null>(null);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const elapsed = (performance.now() - startTimeRef.current) / 1000;

    // Clear
    ctx.clearRect(0, 0, width, height);

    if (layer.type === 'gradient' && layer.animated) {
      renderAnimatedGradient(ctx, layer.colors, layer.angle ?? 180, elapsed, width, height);
    } else if (layer.type === 'effect') {
      renderEffect(ctx, layer.effect, layer.params ?? {}, elapsed, width, height);
    }

    if (!isPaused) {
      animationRef.current = requestAnimationFrame(render);
    }
  }, [layer, width, height, isPaused]);

  useEffect(() => {
    if (!isPaused) {
      animationRef.current = requestAnimationFrame(render);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [render, isPaused]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute inset-0"
      style={{ width: '100%', height: '100%' }}
    />
  );
}

// ============================================================================
// Effect Renderers
// ============================================================================

function renderAnimatedGradient(
  ctx: CanvasRenderingContext2D,
  colors: string[],
  angle: number,
  time: number,
  width: number,
  height: number
) {
  // Animate the gradient angle or color positions
  const animatedAngle = angle + Math.sin(time * 0.5) * 30;
  const radians = (animatedAngle * Math.PI) / 180;

  const x1 = width / 2 - Math.cos(radians) * width;
  const y1 = height / 2 - Math.sin(radians) * height;
  const x2 = width / 2 + Math.cos(radians) * width;
  const y2 = height / 2 + Math.sin(radians) * height;

  const gradient = ctx.createLinearGradient(x1, y1, x2, y2);

  // Animate color stops
  const offset = (Math.sin(time * 0.3) + 1) / 4; // 0 to 0.5

  colors.forEach((color, i) => {
    const baseStop = i / (colors.length - 1);
    const animatedStop = Math.max(0, Math.min(1, baseStop + (i % 2 === 0 ? offset : -offset) * 0.2));
    gradient.addColorStop(animatedStop, color);
  });

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

function renderEffect(
  ctx: CanvasRenderingContext2D,
  effect: BaseEffectType,
  params: Record<string, unknown>,
  time: number,
  width: number,
  height: number
) {
  switch (effect) {
    case 'noise_static':
      renderNoiseStatic(ctx, params, time, width, height);
      break;
    case 'plasma':
      renderPlasma(ctx, params, time, width, height);
      break;
    case 'gradient_flow':
      renderGradientFlow(ctx, params, time, width, height);
      break;
    case 'particles':
      renderParticles(ctx, params, time, width, height);
      break;
    case 'matrix_rain':
      renderMatrixRain(ctx, params, time, width, height);
      break;
    case 'starfield':
      renderStarfield(ctx, params, time, width, height);
      break;
    case 'color_pulse':
      renderColorPulse(ctx, params, time, width, height);
      break;
    case 'geometric':
      renderGeometric(ctx, params, time, width, height);
      break;
    case 'wave_distortion':
      renderWaveDistortion(ctx, params, time, width, height);
      break;
    case 'audio_visualizer':
      renderAudioVisualizer(ctx, params, time, width, height);
      break;
    default:
      // Fallback to dark background
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, width, height);
  }
}

// --- Individual Effect Implementations ---

function renderNoiseStatic(
  ctx: CanvasRenderingContext2D,
  params: Record<string, unknown>,
  time: number,
  width: number,
  height: number
) {
  const intensity = (params.intensity as number) ?? 0.5;
  const imageData = ctx.createImageData(width, height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const value = Math.random() * 255 * intensity;
    data[i] = value;
    data[i + 1] = value;
    data[i + 2] = value;
    data[i + 3] = 255;
  }

  ctx.putImageData(imageData, 0, 0);
}

function renderPlasma(
  ctx: CanvasRenderingContext2D,
  params: Record<string, unknown>,
  time: number,
  width: number,
  height: number
) {
  const speed = (params.speed as number) ?? 1;
  const t = time * speed;

  const imageData = ctx.createImageData(width, height);
  const data = imageData.data;

  for (let y = 0; y < height; y += 2) {
    for (let x = 0; x < width; x += 2) {
      const value =
        Math.sin(x / 16 + t) +
        Math.sin(y / 16 + t) +
        Math.sin((x + y) / 16 + t) +
        Math.sin(Math.sqrt(x * x + y * y) / 8 + t);

      const r = Math.sin(value * Math.PI) * 127 + 128;
      const g = Math.sin(value * Math.PI + 2) * 127 + 128;
      const b = Math.sin(value * Math.PI + 4) * 127 + 128;

      // Fill 2x2 block for performance
      for (let dy = 0; dy < 2 && y + dy < height; dy++) {
        for (let dx = 0; dx < 2 && x + dx < width; dx++) {
          const idx = ((y + dy) * width + (x + dx)) * 4;
          data[idx] = r;
          data[idx + 1] = g;
          data[idx + 2] = b;
          data[idx + 3] = 255;
        }
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

function renderGradientFlow(
  ctx: CanvasRenderingContext2D,
  params: Record<string, unknown>,
  time: number,
  width: number,
  height: number
) {
  const colors = (params.colors as string[]) ?? ['#667eea', '#764ba2'];
  const speed = (params.speed as number) ?? 0.5;

  const offset = time * speed;
  const gradient = ctx.createLinearGradient(
    Math.sin(offset) * width,
    Math.cos(offset) * height,
    width - Math.sin(offset) * width,
    height - Math.cos(offset) * height
  );

  colors.forEach((color, i) => {
    gradient.addColorStop(i / (colors.length - 1), color);
  });

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

function renderParticles(
  ctx: CanvasRenderingContext2D,
  params: Record<string, unknown>,
  time: number,
  width: number,
  height: number
) {
  const count = (params.count as number) ?? 50;
  const color = (params.color as string) ?? '#ffffff';

  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = color;

  for (let i = 0; i < count; i++) {
    // Deterministic "random" based on index
    const seed = i * 127.1 + time * 0.1;
    const x = ((Math.sin(seed) + 1) / 2) * width;
    const y = ((Math.sin(seed * 1.3 + i) + 1) / 2) * height;
    const size = 2 + Math.sin(seed * 2) * 2;
    const alpha = 0.3 + Math.sin(time + i) * 0.3;

    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalAlpha = 1;
}

function renderMatrixRain(
  ctx: CanvasRenderingContext2D,
  params: Record<string, unknown>,
  time: number,
  width: number,
  height: number
) {
  const color = (params.color as string) ?? '#00ff00';
  const speed = (params.speed as number) ?? 1;
  const density = (params.density as number) ?? 0.8;

  // Fade effect
  ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = color;
  ctx.font = '14px monospace';

  const columns = Math.floor(width / 14);
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*';

  for (let i = 0; i < columns; i++) {
    if (Math.random() > density) continue;

    const x = i * 14;
    const y = ((time * 100 * speed + i * 50) % (height + 100)) - 50;
    const char = chars[Math.floor(Math.random() * chars.length)];

    ctx.globalAlpha = Math.random() * 0.5 + 0.5;
    ctx.fillText(char, x, y);
  }

  ctx.globalAlpha = 1;
}

function renderStarfield(
  ctx: CanvasRenderingContext2D,
  params: Record<string, unknown>,
  time: number,
  width: number,
  height: number
) {
  const speed = (params.speed as number) ?? 1;
  const starCount = (params.count as number) ?? 100;

  ctx.fillStyle = '#000011';
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = '#ffffff';

  for (let i = 0; i < starCount; i++) {
    const seed = i * 73.7;
    const baseX = (Math.sin(seed) + 1) / 2;
    const baseY = (Math.sin(seed * 1.7) + 1) / 2;
    const z = (Math.sin(seed * 2.3) + 1) / 2;

    // Move stars toward viewer
    const moveZ = ((time * speed * 0.1 + z) % 1);
    const scale = 1 + moveZ * 3;

    const x = width / 2 + (baseX - 0.5) * width * scale;
    const y = height / 2 + (baseY - 0.5) * height * scale;
    const size = moveZ * 3;

    if (x >= 0 && x < width && y >= 0 && y < height) {
      ctx.globalAlpha = moveZ;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.globalAlpha = 1;
}

function renderColorPulse(
  ctx: CanvasRenderingContext2D,
  params: Record<string, unknown>,
  time: number,
  width: number,
  height: number
) {
  const colors = (params.colors as string[]) ?? ['#ff0000', '#00ff00', '#0000ff'];
  const speed = (params.speed as number) ?? 1;

  const colorIndex = Math.floor(time * speed) % colors.length;
  const nextIndex = (colorIndex + 1) % colors.length;
  const blend = (time * speed) % 1;

  // Simple color interpolation
  const current = colors[colorIndex];
  const next = colors[nextIndex];

  ctx.fillStyle = current;
  ctx.fillRect(0, 0, width, height);

  ctx.globalAlpha = blend;
  ctx.fillStyle = next;
  ctx.fillRect(0, 0, width, height);
  ctx.globalAlpha = 1;
}

function renderGeometric(
  ctx: CanvasRenderingContext2D,
  params: Record<string, unknown>,
  time: number,
  width: number,
  height: number
) {
  const color = (params.color as string) ?? '#ffffff';
  const bgColor = (params.bgColor as string) ?? '#1a1a2e';

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = color;
  ctx.lineWidth = 2;

  const cx = width / 2;
  const cy = height / 2;
  const size = Math.min(width, height) * 0.3;

  // Rotating hexagon
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(time * 0.5);

  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const x = Math.cos(angle) * size;
    const y = Math.sin(angle) * size;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();

  // Inner triangle
  ctx.rotate(-time * 0.3);
  ctx.beginPath();
  for (let i = 0; i < 3; i++) {
    const angle = (i / 3) * Math.PI * 2 - Math.PI / 2;
    const x = Math.cos(angle) * size * 0.5;
    const y = Math.sin(angle) * size * 0.5;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();

  ctx.restore();
}

function renderWaveDistortion(
  ctx: CanvasRenderingContext2D,
  params: Record<string, unknown>,
  time: number,
  width: number,
  height: number
) {
  const color = (params.color as string) ?? '#4a90d9';
  const bgColor = (params.bgColor as string) ?? '#0a0a1a';
  const waveCount = (params.waves as number) ?? 5;

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = color;
  ctx.lineWidth = 2;

  for (let w = 0; w < waveCount; w++) {
    ctx.beginPath();
    const yOffset = (height / (waveCount + 1)) * (w + 1);

    for (let x = 0; x < width; x += 5) {
      const y = yOffset + Math.sin((x / 50) + time * 2 + w) * 20;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }

    ctx.globalAlpha = 0.3 + (w / waveCount) * 0.5;
    ctx.stroke();
  }

  ctx.globalAlpha = 1;
}

function renderAudioVisualizer(
  ctx: CanvasRenderingContext2D,
  params: Record<string, unknown>,
  time: number,
  width: number,
  height: number
) {
  const color = (params.color as string) ?? '#00ffff';
  const bgColor = (params.bgColor as string) ?? '#0a0a0a';
  const barCount = (params.bars as number) ?? 32;

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);

  const barWidth = width / barCount;

  for (let i = 0; i < barCount; i++) {
    // Fake audio data using sine waves
    const freq1 = Math.sin(time * 3 + i * 0.5) * 0.5 + 0.5;
    const freq2 = Math.sin(time * 5 + i * 0.3) * 0.3 + 0.3;
    const freq3 = Math.sin(time * 7 + i * 0.7) * 0.2 + 0.2;

    const barHeight = (freq1 + freq2 + freq3) * height * 0.4;

    ctx.fillStyle = color;
    ctx.globalAlpha = 0.7 + freq1 * 0.3;
    ctx.fillRect(
      i * barWidth + 2,
      height - barHeight,
      barWidth - 4,
      barHeight
    );
  }

  ctx.globalAlpha = 1;
}

// ============================================================================
// Placeholder Renderer (stub for gameplay backgrounds)
// ============================================================================

interface PlaceholderRendererProps {
  placeholder: string;
  time: number;
}

function PlaceholderRenderer({ placeholder, time }: PlaceholderRendererProps) {
  // For now, just show a labeled placeholder
  // In the future, these could be actual mini-games or pre-rendered loops
  const labels: Record<string, string> = {
    subway_surfers: '🏃 Gameplay',
    minecraft_parkour: '⛏️ Parkour',
    satisfying_soap: '🧼 Satisfying',
    slime_stretch: '🟢 Slime',
    hydraulic_press: '🔨 Press',
  };

  return (
    <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
      <div className="text-center text-gray-500">
        <div className="text-4xl mb-2">{labels[placeholder]?.split(' ')[0] ?? '🎮'}</div>
        <div className="text-sm">{labels[placeholder]?.split(' ')[1] ?? placeholder}</div>
      </div>
    </div>
  );
}

export default BaseLayerRenderer;
