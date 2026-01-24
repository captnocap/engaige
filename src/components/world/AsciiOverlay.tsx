/**
 * ASCII Overlay
 *
 * Renders an ASCII art filter over the 3D city view.
 * Characters light up based on activity in different areas.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { useWorldStore } from '../../stores/worldStore.js';

// ASCII characters from dark to light
const ASCII_CHARS = ' .\'`^",:;Il!i><~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$';

// Brighter set for activity hotspots
const GLOW_CHARS = '░▒▓█';

interface AsciiOverlayProps {
  enabled: boolean;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

interface ActivityHotspot {
  x: number;
  y: number;
  intensity: number;
  label?: string;
}

export default function AsciiOverlay({ enabled, canvasRef }: AsciiOverlayProps) {
  const asciiCanvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  const { city, aiNPCs, backgroundNPCs, gameTime } = useWorldStore();

  // Calculate activity hotspots based on NPC positions
  const getActivityHotspots = useCallback((): ActivityHotspot[] => {
    if (!city) return [];

    const hotspots: Map<string, ActivityHotspot> = new Map();

    // Group NPCs by grid cell (10x10 grid cells)
    const cellSize = 20; // Grid units per cell

    // AI NPCs create stronger hotspots
    aiNPCs.forEach(npc => {
      const cellX = Math.floor(npc.position.x / cellSize);
      const cellY = Math.floor(npc.position.y / cellSize);
      const key = `${cellX},${cellY}`;

      const existing = hotspots.get(key);
      if (existing) {
        existing.intensity += 0.5;
      } else {
        hotspots.set(key, {
          x: cellX * cellSize + cellSize / 2,
          y: cellY * cellSize + cellSize / 2,
          intensity: 0.5,
        });
      }
    });

    // Background NPCs create weaker hotspots
    backgroundNPCs.forEach(npc => {
      const cellX = Math.floor(npc.position.x / cellSize);
      const cellY = Math.floor(npc.position.y / cellSize);
      const key = `${cellX},${cellY}`;

      const existing = hotspots.get(key);
      if (existing) {
        existing.intensity += 0.1;
      } else {
        hotspots.set(key, {
          x: cellX * cellSize + cellSize / 2,
          y: cellY * cellSize + cellSize / 2,
          intensity: 0.1,
        });
      }
    });

    return Array.from(hotspots.values());
  }, [city, aiNPCs, backgroundNPCs]);

  // Render ASCII frame
  const renderAscii = useCallback(() => {
    const canvas = asciiCanvasRef.current;
    if (!canvas || !enabled) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Character cell size
    const charWidth = 8;
    const charHeight = 12;
    const cols = Math.floor(width / charWidth);
    const rows = Math.floor(height / charHeight);

    // Clear canvas
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, width, height);

    // Get activity hotspots
    const hotspots = getActivityHotspots();

    // Create intensity map based on hotspots
    const getIntensityAt = (col: number, row: number): number => {
      // Map canvas position to grid position
      const gridX = (col / cols) * (city?.gridSize.width || 200);
      const gridY = (row / rows) * (city?.gridSize.height || 150);

      let intensity = 0.1; // Base intensity

      // Add intensity from nearby hotspots
      hotspots.forEach(hotspot => {
        const dx = gridX - hotspot.x;
        const dy = gridY - hotspot.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const falloff = Math.max(0, 1 - distance / 30);
        intensity += hotspot.intensity * falloff;
      });

      return Math.min(1, intensity);
    };

    // Time-based animation
    const time = Date.now() / 1000;

    // Draw ASCII grid
    ctx.font = `${charHeight}px "Courier New", monospace`;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const intensity = getIntensityAt(col, row);

        // Add some noise/variation
        const noise = Math.sin(col * 0.3 + time) * Math.cos(row * 0.2 + time * 0.7) * 0.1;
        const adjustedIntensity = Math.max(0, Math.min(1, intensity + noise));

        // Pick character based on intensity
        let char: string;
        let color: string;

        if (adjustedIntensity > 0.6) {
          // High activity - use glow characters
          const glowIndex = Math.floor((adjustedIntensity - 0.6) / 0.4 * GLOW_CHARS.length);
          char = GLOW_CHARS[Math.min(glowIndex, GLOW_CHARS.length - 1)];

          // Pulsing glow effect
          const pulse = Math.sin(time * 3 + col * 0.1 + row * 0.1) * 0.2 + 0.8;
          const green = Math.floor(200 + 55 * pulse);
          const blue = Math.floor(100 + 50 * pulse);
          color = `rgb(50, ${green}, ${blue})`;
        } else if (adjustedIntensity > 0.3) {
          // Medium activity - ASCII with color
          const charIndex = Math.floor(adjustedIntensity * ASCII_CHARS.length);
          char = ASCII_CHARS[Math.min(charIndex, ASCII_CHARS.length - 1)];

          const brightness = Math.floor(adjustedIntensity * 200 + 55);
          color = `rgb(${brightness * 0.3}, ${brightness}, ${brightness * 0.5})`;
        } else {
          // Low activity - dim ASCII
          const charIndex = Math.floor(adjustedIntensity * ASCII_CHARS.length * 0.5);
          char = ASCII_CHARS[Math.max(0, charIndex)];

          const brightness = Math.floor(adjustedIntensity * 100 + 20);
          color = `rgb(${brightness * 0.5}, ${brightness}, ${brightness * 0.3})`;
        }

        ctx.fillStyle = color;
        ctx.fillText(char, col * charWidth, row * charHeight + charHeight);
      }
    }

    // Draw district labels
    if (city?.districts) {
      ctx.font = 'bold 14px "Courier New", monospace';
      ctx.fillStyle = '#00ff88';
      ctx.shadowColor = '#00ff88';
      ctx.shadowBlur = 10;

      city.districts.forEach(district => {
        // Find center of district
        const points = district.bounds.points;
        const centerX = points.reduce((sum, p) => sum + p[0], 0) / points.length;
        const centerY = points.reduce((sum, p) => sum + p[1], 0) / points.length;

        // Map to canvas position
        const canvasX = (centerX / (city.gridSize.width || 200)) * width;
        const canvasY = (centerY / (city.gridSize.height || 150)) * height;

        // Draw district name
        ctx.fillText(district.name.toUpperCase(), canvasX - 40, canvasY);
      });

      ctx.shadowBlur = 0;
    }

    // Draw landmark labels with icons
    if (city?.landmarks) {
      ctx.font = '12px "Courier New", monospace';

      city.landmarks.forEach(landmark => {
        const building = city.buildings.find(b => b.id === landmark.buildingId);
        if (!building) return;

        const canvasX = (building.position.x / (city.gridSize.width || 200)) * width;
        const canvasY = (building.position.y / (city.gridSize.height || 150)) * height;

        // Pulsing effect for landmarks
        const pulse = Math.sin(time * 2 + canvasX * 0.01) * 0.3 + 0.7;
        ctx.fillStyle = `rgba(255, 200, 50, ${pulse})`;
        ctx.shadowColor = '#ffcc00';
        ctx.shadowBlur = 8;

        const label = `${landmark.iconEmoji || '★'} ${landmark.name}`;
        ctx.fillText(label, canvasX, canvasY);
      });

      ctx.shadowBlur = 0;
    }

    // Draw status text at bottom
    ctx.font = '12px "Courier New", monospace';
    ctx.fillStyle = '#00ff00';
    ctx.shadowColor = '#00ff00';
    ctx.shadowBlur = 5;

    const statusText = `> PINEWOOD_CITY.EXE :: ${gameTime?.dayName?.toUpperCase() || 'MONDAY'} ${gameTime?.hour || 0}:${String(gameTime?.minute || 0).padStart(2, '0')} :: NPCS_ACTIVE: ${aiNPCs.length + backgroundNPCs.length}`;
    ctx.fillText(statusText, 10, height - 10);

    // Scanline effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.03)';
    for (let y = 0; y < height; y += 3) {
      ctx.fillRect(0, y, width, 1);
    }

    ctx.shadowBlur = 0;

    // Continue animation
    animationRef.current = requestAnimationFrame(renderAscii);
  }, [enabled, city, aiNPCs, backgroundNPCs, gameTime, getActivityHotspots]);

  // Start/stop animation based on enabled state
  useEffect(() => {
    if (enabled) {
      renderAscii();
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [enabled, renderAscii]);

  // Handle resize
  useEffect(() => {
    const canvas = asciiCanvasRef.current;
    if (!canvas) return;

    const updateSize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };

    updateSize();

    const observer = new ResizeObserver(updateSize);
    if (canvas.parentElement) {
      observer.observe(canvas.parentElement);
    }

    return () => observer.disconnect();
  }, []);

  if (!enabled) return null;

  return (
    <canvas
      ref={asciiCanvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{
        mixBlendMode: 'screen',
        opacity: 0.95,
      }}
    />
  );
}
