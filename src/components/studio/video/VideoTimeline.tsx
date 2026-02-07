/**
 * Video Timeline
 *
 * After Effects-style timeline with time ruler, playhead,
 * and layer rows for Base, Overlay, and Text segments.
 */

import { useCallback, useRef } from 'react';
import { useVideoComposition } from '../hooks/useVideoComposition.js';

// ============================================================================
// Constants
// ============================================================================

const LABEL_WIDTH = 80;
const ROW_HEIGHT = 24;
const RULER_HEIGHT = 20;
const TIMELINE_HEIGHT = 160;

const COLORS = {
  base: '#4a6cf7',
  overlay: '#9b59b6',
  text: '#e67e22',
  keyframe: '#2ecc71',
  playhead: '#ff0000',
  ruler: 'var(--studio-panel, #252525)',
  bg: 'var(--studio-bg-darkest, #1a1a1a)',
  label: 'var(--studio-text-muted, #888)',
  border: 'var(--studio-border-subtle, #333)',
};

// ============================================================================
// Component
// ============================================================================

export function VideoTimeline() {
  const {
    composition,
    setTime,
    setComposition,
    updateSegment,
    addSegment,
    addKeyframe,
    removeKeyframe,
  } = useVideoComposition();

  const timelineRef = useRef<HTMLDivElement>(null);

  const timeToPercent = useCallback((time: number) => {
    return composition.duration > 0 ? (time / composition.duration) * 100 : 0;
  }, [composition.duration]);

  const handleTimelineClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - LABEL_WIDTH;
    const trackWidth = rect.width - LABEL_WIDTH;
    if (offsetX < 0 || trackWidth <= 0) return;
    const percent = Math.max(0, Math.min(1, offsetX / trackWidth));
    setTime(percent * composition.duration);
  }, [setTime, composition.duration]);

  const handleRulerDoubleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - LABEL_WIDTH;
    const trackWidth = rect.width - LABEL_WIDTH;
    if (offsetX < 0 || trackWidth <= 0) return;
    const percent = Math.max(0, Math.min(1, offsetX / trackWidth));
    const time = percent * composition.duration;
    addSegment(Math.floor(time));
  }, [addSegment, composition.duration]);

  // Generate tick marks
  const ticks: { time: number; label?: string }[] = [];
  const step = composition.duration <= 15 ? 1 : composition.duration <= 60 ? 5 : 10;
  for (let t = 0; t <= composition.duration; t += step) {
    ticks.push({ time: t, label: `${t}s` });
  }

  const playheadPercent = timeToPercent(composition.currentTime);
  const showOverlay = composition.overlayPreset !== 'clean';

  return (
    <div
      ref={timelineRef}
      style={{
        height: TIMELINE_HEIGHT,
        background: COLORS.bg,
        borderTop: `1px solid ${COLORS.border}`,
        display: 'flex',
        flexDirection: 'column',
        userSelect: 'none',
        overflow: 'hidden',
      }}
    >
      {/* Time Ruler */}
      <div
        style={{
          height: RULER_HEIGHT,
          display: 'flex',
          background: COLORS.ruler,
          borderBottom: `1px solid ${COLORS.border}`,
          cursor: 'pointer',
          position: 'relative',
        }}
        onClick={handleTimelineClick}
        onDoubleClick={handleRulerDoubleClick}
      >
        <div style={{ width: LABEL_WIDTH, flexShrink: 0 }} />
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          {ticks.map((tick) => (
            <span
              key={tick.time}
              style={{
                position: 'absolute',
                left: `${timeToPercent(tick.time)}%`,
                top: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                fontSize: 9,
                color: COLORS.label,
                transform: 'translateX(-50%)',
                pointerEvents: 'none',
              }}
            >
              <span style={{
                width: 1,
                height: tick.label ? 8 : 4,
                background: COLORS.label,
                marginRight: 2,
                opacity: 0.5,
              }} />
              {tick.label}
            </span>
          ))}
        </div>
      </div>

      {/* Layer Rows */}
      <div
        style={{ flex: 1, position: 'relative', overflow: 'auto', cursor: 'pointer' }}
        onClick={handleTimelineClick}
      >
        {/* Base Layer */}
        <LayerRow label="Base" color={COLORS.base}>
          <div style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 3,
            bottom: 3,
            background: COLORS.base,
            borderRadius: 3,
            opacity: 0.7,
          }} />
        </LayerRow>

        {/* Keyframe Track */}
        {composition.keyframes.length > 0 && (
          <LayerRow label="Keyframes" color={COLORS.keyframe}>
            {composition.keyframes.map((kf, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: `calc(${timeToPercent(kf.time)}% - 5px)`,
                  top: 4,
                  width: 10,
                  height: 10,
                  background: COLORS.keyframe,
                  transform: 'rotate(45deg)',
                  borderRadius: 1,
                  cursor: 'pointer',
                  zIndex: 2,
                }}
                title={`Keyframe at ${kf.time.toFixed(1)}s`}
                onClick={(e) => {
                  e.stopPropagation();
                  setTime(kf.time);
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  removeKeyframe(i);
                }}
              />
            ))}
          </LayerRow>
        )}

        {/* Overlay Layer */}
        {showOverlay && (
          <LayerRow label="Overlay" color={COLORS.overlay}>
            <div style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 3,
              bottom: 3,
              background: COLORS.overlay,
              borderRadius: 3,
              opacity: 0.7,
            }} />
          </LayerRow>
        )}

        {/* Text Segments */}
        {composition.segments.map((seg, i) => (
          <LayerRow
            key={seg.id}
            label={`Text ${i + 1}`}
            color={COLORS.text}
          >
            <div
              style={{
                position: 'absolute',
                left: `${timeToPercent(seg.start)}%`,
                right: seg.end != null ? `${100 - timeToPercent(seg.end)}%` : `${100 - timeToPercent(Math.min(seg.start + 3, composition.duration))}%`,
                top: 3,
                bottom: 3,
                background: COLORS.text,
                borderRadius: 3,
                opacity: 0.8,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                paddingLeft: 4,
                fontSize: 9,
                color: '#fff',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
              }}
              title={seg.text || `Segment ${i + 1}`}
              onClick={(e) => e.stopPropagation()}
            >
              {seg.text || '...'}
            </div>
          </LayerRow>
        ))}

        {/* Playhead */}
        <div
          style={{
            position: 'absolute',
            left: `calc(${LABEL_WIDTH}px + ${playheadPercent}% * (100% - ${LABEL_WIDTH}px) / 100)`,
            top: 0,
            bottom: 0,
            width: 2,
            background: COLORS.playhead,
            pointerEvents: 'none',
            zIndex: 10,
            boxShadow: `0 0 4px ${COLORS.playhead}`,
          }}
        >
          <div style={{
            position: 'absolute',
            top: -2,
            left: -4,
            width: 0,
            height: 0,
            borderLeft: '5px solid transparent',
            borderRight: '5px solid transparent',
            borderTop: `6px solid ${COLORS.playhead}`,
          }} />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Layer Row
// ============================================================================

interface LayerRowProps {
  label: string;
  color: string;
  children: React.ReactNode;
}

function LayerRow({ label, color, children }: LayerRowProps) {
  return (
    <div
      style={{
        height: ROW_HEIGHT,
        display: 'flex',
        borderBottom: `1px solid ${COLORS.border}`,
      }}
    >
      <div
        style={{
          width: LABEL_WIDTH,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          paddingLeft: 8,
          gap: 4,
          fontSize: 10,
          color: COLORS.label,
        }}
      >
        <span style={{
          width: 8,
          height: 8,
          borderRadius: 2,
          background: color,
          flexShrink: 0,
        }} />
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {label}
        </span>
      </div>
      <div style={{ flex: 1, position: 'relative' }}>
        {children}
      </div>
    </div>
  );
}
