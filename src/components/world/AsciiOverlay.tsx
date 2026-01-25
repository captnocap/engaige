/**
 * ASCII Overlay
 *
 * Renders an ASCII art filter over the 3D city view.
 * Characters light up based on activity in different areas.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { useWorldStore } from '../../stores/worldStore.js';

// ASCII characters ordered from dark to light (sparse to dense)
// Using a carefully selected gradient for better visual distinction
const ASCII_CHARS = ' .·:;+*#@';

// Block characters for high activity areas
const GLOW_CHARS = '░▒▓';

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

    // Character cell size - larger for better readability
    const charWidth = 10;
    const charHeight = 14;
    const cols = Math.floor(width / charWidth);
    const rows = Math.floor(height / charHeight);

    // Clear canvas - very dark background
    ctx.fillStyle = '#050508';
    ctx.fillRect(0, 0, width, height);

    // Get activity hotspots
    const hotspots = getActivityHotspots();

    // Create intensity map based on hotspots
    const getIntensityAt = (col: number, row: number): number => {
      // Map canvas position to grid position
      const gridX = (col / cols) * (city?.gridSize.width || 200);
      const gridY = (row / rows) * (city?.gridSize.height || 150);

      // Very low base intensity - most of the screen should be dark
      let intensity = 0.02;

      // Add intensity from nearby hotspots with steep falloff
      hotspots.forEach(hotspot => {
        const dx = gridX - hotspot.x;
        const dy = gridY - hotspot.y;
        const distanceSq = dx * dx + dy * dy;
        const distance = Math.sqrt(distanceSq);

        // Steep falloff - only very close areas light up
        const falloffRadius = 15; // Grid units
        if (distance < falloffRadius) {
          const falloff = Math.pow(1 - distance / falloffRadius, 2); // Quadratic falloff
          intensity += hotspot.intensity * falloff * 0.15; // Reduced multiplier
        }
      });

      return Math.min(1, intensity);
    };

    // Time-based animation
    const time = Date.now() / 1000;

    // Draw ASCII grid
    ctx.font = `${charHeight - 2}px "Courier New", monospace`;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const intensity = getIntensityAt(col, row);

        // Add subtle noise/variation for organic feel
        const noise = Math.sin(col * 0.5 + time * 0.5) * Math.cos(row * 0.4 + time * 0.3) * 0.02;
        const adjustedIntensity = Math.max(0, Math.min(1, intensity + noise));

        // Pick character based on intensity
        let char: string;
        let color: string;

        if (adjustedIntensity > 0.4) {
          // High activity - use glow characters
          const glowIndex = Math.floor((adjustedIntensity - 0.4) / 0.6 * GLOW_CHARS.length);
          char = GLOW_CHARS[Math.min(glowIndex, GLOW_CHARS.length - 1)];

          // Pulsing glow effect - bright cyan/green
          const pulse = Math.sin(time * 3 + col * 0.1 + row * 0.1) * 0.2 + 0.8;
          const green = Math.floor(180 + 75 * pulse);
          const blue = Math.floor(120 + 60 * pulse);
          color = `rgb(40, ${green}, ${blue})`;
        } else if (adjustedIntensity > 0.15) {
          // Medium activity - visible ASCII characters
          const charIndex = Math.floor((adjustedIntensity - 0.15) / 0.25 * (ASCII_CHARS.length - 2)) + 2;
          char = ASCII_CHARS[Math.min(charIndex, ASCII_CHARS.length - 1)];

          const brightness = Math.floor(80 + adjustedIntensity * 150);
          color = `rgb(${brightness * 0.2}, ${brightness}, ${brightness * 0.4})`;
        } else if (adjustedIntensity > 0.05) {
          // Low activity - sparse dots
          const charIndex = Math.floor((adjustedIntensity - 0.05) / 0.1 * 2) + 1;
          char = ASCII_CHARS[Math.min(charIndex, 2)];

          const brightness = Math.floor(30 + adjustedIntensity * 100);
          color = `rgb(${brightness * 0.3}, ${brightness * 0.8}, ${brightness * 0.3})`;
        } else {
          // Very low/no activity - mostly spaces with occasional dots
          char = Math.random() > 0.95 ? '.' : ' ';
          color = 'rgb(15, 30, 20)';
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

    // Subtle scanline effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
    for (let y = 0; y < height; y += 4) {
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

  // Handle resize - runs always to keep canvas sized correctly
  useEffect(() => {
    const canvas = asciiCanvasRef.current;
    if (!canvas) return;

    let resizeAttempts = 0;
    const maxAttempts = 20;

    const updateSize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        const rect = parent.getBoundingClientRect();
        console.log('[AsciiOverlay] updateSize - parent rect:', rect.width, 'x', rect.height);

        if (rect.width > 0 && rect.height > 0) {
          canvas.width = rect.width;
          canvas.height = rect.height;
          console.log('[AsciiOverlay] Canvas sized to:', canvas.width, 'x', canvas.height);
        } else if (resizeAttempts < maxAttempts) {
          // Parent not sized yet, retry
          resizeAttempts++;
          setTimeout(updateSize, 100);
        }
      }
    };

    // Initial size with small delay to ensure parent is measured
    // Use multiple attempts in case parent takes time to size
    let attempts = 0;
    const initialSizeInterval = setInterval(() => {
      attempts++;
      const parent = canvas.parentElement;
      if (parent) {
        const rect = parent.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          canvas.width = rect.width;
          canvas.height = rect.height;
          console.log('[AsciiOverlay] Initial canvas size set:', canvas.width, 'x', canvas.height);
          clearInterval(initialSizeInterval);
        } else if (attempts >= 10) {
          // Fallback: use parent's offsetWidth/offsetHeight or window dimensions
          const width = parent.offsetWidth || window.innerWidth;
          const height = parent.offsetHeight || window.innerHeight;
          if (width > 0 && height > 0) {
            canvas.width = width;
            canvas.height = height;
            console.log('[AsciiOverlay] Fallback canvas size:', canvas.width, 'x', canvas.height);
            clearInterval(initialSizeInterval);
          }
        }
      }
    }, 50);

    // Clear interval after 2 seconds to avoid infinite polling
    setTimeout(() => clearInterval(initialSizeInterval), 2000);

    // Also update on window resize
    window.addEventListener('resize', updateSize);

    const observer = new ResizeObserver(() => {
      requestAnimationFrame(updateSize);
    });
    if (canvas.parentElement) {
      observer.observe(canvas.parentElement);
    }

    return () => {
      clearInterval(initialSizeInterval);
      window.removeEventListener('resize', updateSize);
      observer.disconnect();
    };
  }, [enabled]); // Re-run when enabled changes to ensure proper sizing

  return (
    <canvas
      ref={asciiCanvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{
        display: enabled ? 'block' : 'none',
        // Use normal blend mode - the ASCII layer replaces the view entirely
        opacity: 1,
      }}
    />
  );
}
