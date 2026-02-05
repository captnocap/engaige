/**
 * MediaRenderer
 *
 * Universal media rendering component for NPC-generated content.
 * Composes base layers, overlay effects, and animated text.
 *
 * Usage:
 *   <MediaRenderer config={renderConfig} autoplay />
 *   <MediaRenderer config={renderConfig} mode="thumbnail" thumbnailTime={2.5} />
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { RenderConfig, MediaRendererProps, SafeZone } from './types.js';
import { PLATFORM_SAFE_ZONES, ASPECT_RATIOS } from './types.js';
import { BaseLayerRenderer } from './BaseLayerRenderer.js';
import { OverlayLayerRenderer } from './OverlayLayerRenderer.js';
import { TextLayerRenderer } from './TextLayerRenderer.js';

export function MediaRenderer({
  config,
  mode = 'play',
  autoplay = true,
  muted = true,
  controls = false,
  thumbnailTime = 0,
  className = '',
  onTimeUpdate,
  onComplete,
  onError,
}: MediaRendererProps) {
  // State
  const [isPlaying, setIsPlaying] = useState(autoplay && mode === 'play');
  const [currentTime, setCurrentTime] = useState(mode === 'thumbnail' ? thumbnailTime : 0);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<number | null>(null);
  const animationRef = useRef<number | null>(null);

  // Calculate safe zones
  const safeZone: SafeZone = useMemo(() => {
    if (config.viewport.safe_zone) {
      return config.viewport.safe_zone;
    }
    if (config.viewport.platform_hint) {
      return PLATFORM_SAFE_ZONES[config.viewport.platform_hint];
    }
    return { top: 0, bottom: 0, left: 0, right: 0 };
  }, [config.viewport]);

  // Calculate aspect ratio
  const aspectRatio = ASPECT_RATIOS[config.viewport.aspect] ?? 1;

  // Handle resize
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateDimensions = () => {
      const rect = container.getBoundingClientRect();
      const containerAspect = rect.width / rect.height;

      let width: number;
      let height: number;

      if (config.viewport.fit === 'fill') {
        width = rect.width;
        height = rect.height;
      } else if (config.viewport.fit === 'cover') {
        if (containerAspect > aspectRatio) {
          width = rect.width;
          height = rect.width / aspectRatio;
        } else {
          height = rect.height;
          width = rect.height * aspectRatio;
        }
      } else {
        // contain
        if (containerAspect > aspectRatio) {
          height = rect.height;
          width = rect.height * aspectRatio;
        } else {
          width = rect.width;
          height = rect.width / aspectRatio;
        }
      }

      setDimensions({ width, height });
    };

    updateDimensions();

    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, [aspectRatio, config.viewport.fit]);

  // Animation loop
  const animate = useCallback(() => {
    if (!isPlaying || mode === 'thumbnail') return;

    const now = performance.now();
    if (startTimeRef.current === null) {
      startTimeRef.current = now;
    }

    const elapsed = (now - startTimeRef.current) / 1000;

    if (elapsed >= config.duration) {
      if (config.loop) {
        startTimeRef.current = now;
        setCurrentTime(0);
      } else {
        setIsPlaying(false);
        setCurrentTime(config.duration);
        onComplete?.();
        return;
      }
    } else {
      setCurrentTime(elapsed);
      onTimeUpdate?.(elapsed);
    }

    animationRef.current = requestAnimationFrame(animate);
  }, [isPlaying, mode, config.duration, config.loop, onTimeUpdate, onComplete]);

  // Start/stop animation
  useEffect(() => {
    if (isPlaying && mode === 'play') {
      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, mode, animate]);

  // Controls handlers
  const handlePlayPause = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      if (currentTime >= config.duration) {
        startTimeRef.current = null;
        setCurrentTime(0);
      }
      setIsPlaying(true);
    }
  };

  const handleSeek = (time: number) => {
    setCurrentTime(time);
    startTimeRef.current = performance.now() - time * 1000;
  };

  // Compute inner styles for the actual content area
  const innerStyles: React.CSSProperties = {
    width: dimensions.width,
    height: dimensions.height,
    position: 'relative',
    overflow: 'hidden',
  };

  // Container styles for letterboxing
  const containerStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: config.viewport.letterbox_color ?? '#000000',
    width: '100%',
    height: '100%',
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={containerStyles}
    >
      <div style={innerStyles}>
        {/* Base Layer */}
        <BaseLayerRenderer
          layer={config.layers.base}
          width={dimensions.width || 100}
          height={dimensions.height || 100}
          time={currentTime}
          isPaused={!isPlaying && mode === 'play'}
        />

        {/* Overlay Layer */}
        {config.layers.overlay && (
          <OverlayLayerRenderer
            layer={config.layers.overlay}
            width={dimensions.width || 100}
            height={dimensions.height || 100}
            time={currentTime}
            isPaused={!isPlaying && mode === 'play'}
          />
        )}

        {/* Text Layer */}
        {config.layers.text && (
          <TextLayerRenderer
            layer={config.layers.text}
            time={currentTime}
            duration={config.duration}
            safeZone={safeZone}
            isPaused={!isPlaying && mode === 'play'}
          />
        )}

        {/* Controls Overlay */}
        {controls && mode === 'play' && (
          <ControlsOverlay
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={config.duration}
            onPlayPause={handlePlayPause}
            onSeek={handleSeek}
          />
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Controls Overlay
// ============================================================================

interface ControlsOverlayProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
}

function ControlsOverlay({
  isPlaying,
  currentTime,
  duration,
  onPlayPause,
  onSeek,
}: ControlsOverlayProps) {
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="absolute inset-0 flex flex-col justify-end pointer-events-none">
      {/* Progress bar */}
      <div className="p-2 bg-gradient-to-t from-black/60 to-transparent pointer-events-auto">
        <div
          className="h-1 bg-white/30 rounded-full cursor-pointer mb-2"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            onSeek(percent * duration);
          }}
        >
          <div
            className="h-full bg-white rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Controls row */}
        <div className="flex items-center gap-3 text-white text-sm">
          <button
            onClick={onPlayPause}
            className="w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded"
          >
            {isPlaying ? '⏸' : '▶'}
          </button>

          <span className="font-mono text-xs">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
      </div>
    </div>
  );
}

export default MediaRenderer;
