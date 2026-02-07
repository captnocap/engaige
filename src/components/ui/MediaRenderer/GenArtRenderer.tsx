/**
 * GenArtRenderer
 *
 * React wrapper for the GenArtEngine.
 * Manages canvas ref, engine lifecycle, and resize via ResizeObserver.
 */

import { useRef, useEffect, useCallback } from 'react';
import type { GenArtConfig } from '../../../lib/genart/types.js';
import { GenArtEngine } from '../../../lib/genart/engine.js';

interface GenArtRendererProps {
  config: GenArtConfig;
  width: number;
  height: number;
  isPlaying: boolean;
  currentTime?: number;
}

export function GenArtRenderer({
  config,
  width,
  height,
  isPlaying,
  currentTime,
}: GenArtRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GenArtEngine | null>(null);
  const initPromiseRef = useRef<Promise<void> | null>(null);
  const configRef = useRef(config);
  configRef.current = config;

  // Initialize engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = width;
    canvas.height = height;

    const engine = new GenArtEngine(canvas, configRef.current);
    engineRef.current = engine;

    initPromiseRef.current = engine.init();

    return () => {
      engine.destroy();
      engineRef.current = null;
      initPromiseRef.current = null;
    };
  }, [config.mode]); // Re-create engine only when mode changes

  // Sync size
  useEffect(() => {
    const engine = engineRef.current;
    if (engine && width > 0 && height > 0) {
      engine.resize(width, height);
    }
  }, [width, height]);

  // Sync playback state
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;

    const startOrStop = async () => {
      await initPromiseRef.current;
      if (!engineRef.current) return; // Destroyed during init

      if (isPlaying) {
        engine.start();
      } else {
        engine.stop();
      }
    };

    startOrStop();
  }, [isPlaying]);

  // Sync tuner params
  useEffect(() => {
    engineRef.current?.setTunerParams(config.tunerParams);
  }, [config.tunerParams]);

  // Sync energy curve
  useEffect(() => {
    engineRef.current?.setEnergyCurve(config.energyCurve);
  }, [config.energyCurve]);

  // Sync BPM
  useEffect(() => {
    engineRef.current?.setBPM(config.bpm);
  }, [config.bpm]);

  // Sync pitch
  useEffect(() => {
    engineRef.current?.setPitch(config.pitch);
  }, [config.pitch]);

  // Sync current time (for seeking)
  useEffect(() => {
    if (currentTime !== undefined) {
      engineRef.current?.setElapsed(currentTime);
    }
  }, [currentTime]);

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

export default GenArtRenderer;
