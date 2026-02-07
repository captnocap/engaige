/**
 * useVideoComposition Hook
 *
 * Convenience hook for video composition state.
 * Reads from StudioContext, provides builders for RenderConfig and ContentIntent,
 * and wraps segment CRUD operations.
 */

import { useMemo, useCallback, useRef, useEffect } from 'react';
import { useStudio, type TextSegmentDraft, type VideoComposition } from '../StudioContext.js';
import { useWSStore } from '../../../stores/wsStore.js';
import { OVERLAY_PRESETS, TEXT_STYLE_PRESETS, INTENT_STYLE_SUGGESTIONS } from '../../ui/MediaRenderer/presets.js';
import type {
  RenderConfig,
  ContentIntent,
  TextSegment,
  AspectRatio,
  PlatformHint,
} from '../../ui/MediaRenderer/types.js';
import type { TunerParams, EnergyCurveType, Keyframe } from '../../../lib/genart/types.js';

// ============================================================================
// Platform Defaults
// ============================================================================

const PLATFORM_DEFAULTS: Record<PlatformHint, { aspect: AspectRatio; duration: number; maxDuration: number }> = {
  instasnap_story: { aspect: '9:16', duration: 10, maxDuration: 15 },
  instasnap_post: { aspect: '1:1', duration: 10, maxDuration: 60 },
  instasnap_reel: { aspect: '9:16', duration: 30, maxDuration: 90 },
  vidtube_video: { aspect: '16:9', duration: 60, maxDuration: 300 },
  vidtube_short: { aspect: '9:16', duration: 30, maxDuration: 60 },
  myface_post: { aspect: '1:1', duration: 8, maxDuration: 30 },
  myface_story: { aspect: '9:16', duration: 10, maxDuration: 15 },
  threadit_embed: { aspect: '16:9', duration: 15, maxDuration: 60 },
  thumbnail: { aspect: '16:9', duration: 0, maxDuration: 0 },
};

export { PLATFORM_DEFAULTS };

// ============================================================================
// Hook
// ============================================================================

export function useVideoComposition() {
  const { state, dispatch, addToDraft, setMode } = useStudio();
  const request = useWSStore((s) => s.request);
  const connected = useWSStore((s) => s.connected);
  const vc = state.videoComposition;

  // Animation ref for playback loop
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // ---- Computed values ----

  const platformDefaults = useMemo(() => PLATFORM_DEFAULTS[vc.platform], [vc.platform]);

  const renderConfig = useMemo((): RenderConfig => {
    const textSegments: TextSegment[] = vc.segments
      .filter((s) => s.text.trim())
      .map((s) => ({
        start: s.start,
        end: s.end,
        text: s.text,
        position: s.position,
        enter_effect: s.effect,
      }));

    return {
      render_type: 'video',
      viewport: {
        aspect: platformDefaults.aspect,
        platform_hint: vc.platform,
        fit: 'cover',
      },
      duration: vc.duration,
      loop: vc.loop,
      layers: {
        base: {
          type: 'genart',
          config: {
            mode: vc.mode,
            tunerParams: vc.tunerParams,
            energyCurve: vc.energyCurve,
            bpm: vc.bpm,
            pitch: vc.pitch,
            keyframes: vc.keyframes.length > 0 ? vc.keyframes : undefined,
          },
        },
        overlay: OVERLAY_PRESETS[vc.overlayPreset].effects.length > 0
          ? OVERLAY_PRESETS[vc.overlayPreset]
          : undefined,
        text: textSegments.length > 0
          ? {
              default_style: TEXT_STYLE_PRESETS[vc.textStylePreset],
              segments: textSegments,
            }
          : undefined,
      },
    };
  }, [vc.segments, vc.mode, vc.tunerParams, vc.energyCurve, vc.bpm, vc.pitch, vc.keyframes, vc.overlayPreset, vc.textStylePreset, vc.duration, vc.loop, vc.platform, platformDefaults.aspect]);

  const contentIntent = useMemo((): ContentIntent => ({
    primary: vc.intent,
    energy: vc.energy,
  }), [vc.intent, vc.energy]);

  // ---- Setters ----

  const setComposition = useCallback((updates: Partial<VideoComposition>) => {
    dispatch({ type: 'SET_VIDEO_COMPOSITION', payload: updates });
  }, [dispatch]);

  const setPlatform = useCallback((platform: PlatformHint) => {
    const defaults = PLATFORM_DEFAULTS[platform];
    dispatch({
      type: 'SET_VIDEO_COMPOSITION',
      payload: {
        platform,
        duration: defaults.duration,
        maxDuration: defaults.maxDuration,
      },
    });
  }, [dispatch]);

  const setPlaying = useCallback((playing: boolean) => {
    dispatch({ type: 'SET_VIDEO_PLAYING', payload: playing });
  }, [dispatch]);

  const setTime = useCallback((time: number) => {
    dispatch({ type: 'SET_VIDEO_TIME', payload: time });
    startTimeRef.current = performance.now() - time * 1000;
  }, [dispatch]);

  const togglePlayPause = useCallback(() => {
    if (vc.isPlaying) {
      dispatch({ type: 'SET_VIDEO_PLAYING', payload: false });
    } else {
      if (vc.currentTime >= vc.duration) {
        dispatch({ type: 'SET_VIDEO_TIME', payload: 0 });
        startTimeRef.current = null;
      }
      dispatch({ type: 'SET_VIDEO_PLAYING', payload: true });
    }
  }, [dispatch, vc.isPlaying, vc.currentTime, vc.duration]);

  // ---- Playback animation loop ----

  useEffect(() => {
    if (!vc.isPlaying) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }

    const animate = () => {
      const now = performance.now();
      if (startTimeRef.current === null) {
        startTimeRef.current = now;
      }

      const elapsed = (now - startTimeRef.current) / 1000;

      if (elapsed >= vc.duration) {
        if (vc.loop) {
          startTimeRef.current = now;
          dispatch({ type: 'SET_VIDEO_TIME', payload: 0 });
        } else {
          dispatch({ type: 'SET_VIDEO_PLAYING', payload: false });
          dispatch({ type: 'SET_VIDEO_TIME', payload: vc.duration });
          return;
        }
      } else {
        dispatch({ type: 'SET_VIDEO_TIME', payload: elapsed });
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [vc.isPlaying, vc.duration, vc.loop, dispatch]);

  // ---- Segment CRUD ----

  const addSegment = useCallback((atTime?: number) => {
    const lastSegment = vc.segments[vc.segments.length - 1];
    const newStart = atTime ?? (lastSegment ? lastSegment.start + 2 : 0);
    dispatch({
      type: 'ADD_VIDEO_SEGMENT',
      payload: {
        id: String(Date.now()),
        text: '',
        start: Math.min(newStart, vc.duration - 1),
        position: 'center',
        effect: 'fade_in',
      },
    });
  }, [dispatch, vc.segments, vc.duration]);

  const updateSegment = useCallback((id: string, updates: Partial<TextSegmentDraft>) => {
    dispatch({ type: 'UPDATE_VIDEO_SEGMENT', payload: { id, updates } });
  }, [dispatch]);

  const removeSegment = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_VIDEO_SEGMENT', payload: id });
  }, [dispatch]);

  // ---- Intent suggestion ----

  const applySuggestedStyle = useCallback(() => {
    const suggestion = INTENT_STYLE_SUGGESTIONS[vc.intent];
    if (suggestion) {
      dispatch({
        type: 'SET_VIDEO_COMPOSITION',
        payload: {
          overlayPreset: suggestion.overlay,
          textStylePreset: suggestion.text,
        },
      });
    }
  }, [dispatch, vc.intent]);

  // ---- GenArt setters ----

  const setGenArtMode = useCallback((mode: string) => {
    dispatch({ type: 'SET_GENART_MODE', payload: mode });
  }, [dispatch]);

  const setTunerParams = useCallback((params: Partial<TunerParams>) => {
    dispatch({ type: 'SET_TUNER_PARAMS', payload: params });
  }, [dispatch]);

  const setEnergyCurve = useCallback((curve: EnergyCurveType) => {
    dispatch({ type: 'SET_ENERGY_CURVE', payload: curve });
  }, [dispatch]);

  const setBPM = useCallback((bpm: number) => {
    dispatch({ type: 'SET_BPM', payload: bpm });
  }, [dispatch]);

  const setPitch = useCallback((pitch: number) => {
    dispatch({ type: 'SET_PITCH', payload: pitch });
  }, [dispatch]);

  // ---- Keyframe CRUD ----

  const addKeyframe = useCallback((keyframe: Keyframe) => {
    dispatch({ type: 'ADD_KEYFRAME', payload: keyframe });
  }, [dispatch]);

  const updateKeyframe = useCallback((index: number, keyframe: Keyframe) => {
    dispatch({ type: 'UPDATE_KEYFRAME', payload: { index, keyframe } });
  }, [dispatch]);

  const removeKeyframe = useCallback((index: number) => {
    dispatch({ type: 'REMOVE_KEYFRAME', payload: index });
  }, [dispatch]);

  // ---- Publish ----

  const handlePublish = useCallback(async (): Promise<boolean> => {
    if (!connected) return false;

    try {
      const response = await request<
        { config: RenderConfig; intent: ContentIntent },
        { mediaFileId: string; mediaFile: { id: string; file_url: string } }
      >('studio:saveVideoConfig', {
        config: renderConfig,
        intent: contentIntent,
      });

      if (response && response.mediaFileId) {
        addToDraft(response.mediaFileId);
        setMode('compose');
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [connected, request, renderConfig, contentIntent, addToDraft, setMode]);

  return {
    // State
    composition: vc,
    platformDefaults,

    // Computed
    renderConfig,
    contentIntent,

    // Setters
    setComposition,
    setPlatform,
    setPlaying,
    setTime,
    togglePlayPause,

    // GenArt setters
    setGenArtMode,
    setTunerParams,
    setEnergyCurve,
    setBPM,
    setPitch,

    // Keyframe CRUD
    addKeyframe,
    updateKeyframe,
    removeKeyframe,

    // Segment CRUD
    addSegment,
    updateSegment,
    removeSegment,

    // Actions
    applySuggestedStyle,
    handlePublish,

    // Connection
    connected,
  };
}
