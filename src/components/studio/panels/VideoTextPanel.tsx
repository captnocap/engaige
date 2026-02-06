/**
 * Video Text Panel
 *
 * Sidebar panel for managing text segments: duration, text input,
 * start time, position, effect, and add/remove controls.
 * Uses custom Select component per CLAUDE.md rules.
 */

import { useVideoComposition } from '../hooks/useVideoComposition.js';
import { Select } from '../../ui/Select.js';
import type { TextEffectType } from '../../ui/MediaRenderer/types.js';

// ============================================================================
// Data
// ============================================================================

const TEXT_EFFECTS: { value: string; label: string }[] = [
  { value: 'fade_in', label: 'Fade In' },
  { value: 'typewriter', label: 'Typewriter' },
  { value: 'slam', label: 'Slam' },
  { value: 'bounce', label: 'Bounce' },
  { value: 'slide_up', label: 'Slide Up' },
  { value: 'slide_down', label: 'Slide Down' },
  { value: 'zoom_in', label: 'Zoom In' },
  { value: 'shake', label: 'Shake' },
  { value: 'glitch', label: 'Glitch' },
  { value: 'rainbow', label: 'Rainbow' },
  { value: 'float', label: 'Float' },
];

const POSITIONS = ['top', 'center', 'bottom'] as const;

// ============================================================================
// Component
// ============================================================================

export function VideoTextPanel() {
  const {
    composition,
    setComposition,
    addSegment,
    updateSegment,
    removeSegment,
  } = useVideoComposition();

  return (
    <div className="space-y-3">
      {/* Duration slider */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs" style={{ color: 'var(--studio-text-muted, #888)' }}>
            Duration
          </span>
          <span className="text-xs font-mono" style={{ color: 'var(--studio-text, #ccc)' }}>
            {composition.duration}s
          </span>
        </div>
        <input
          type="range"
          min={3}
          max={composition.maxDuration}
          value={composition.duration}
          onChange={(e) => setComposition({ duration: Number(e.target.value) })}
          className="w-full"
          style={{ accentColor: 'var(--studio-accent, #4a6cf7)' }}
        />
      </div>

      {/* Segments */}
      <div className="space-y-2">
        {composition.segments.map((segment, index) => (
          <div
            key={segment.id}
            className="rounded p-2 space-y-2"
            style={{
              background: 'var(--studio-bg-darkest, #1a1a1a)',
              border: '1px solid var(--studio-border-subtle, #333)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <span className="text-xs" style={{ color: 'var(--studio-text-muted, #888)' }}>
                Segment {index + 1}
              </span>
              {composition.segments.length > 1 && (
                <button
                  onClick={() => removeSegment(segment.id)}
                  className="text-xs px-1.5 py-0.5 rounded"
                  style={{ color: '#ef4444', background: 'rgba(239,68,68,0.1)' }}
                >
                  Remove
                </button>
              )}
            </div>

            {/* Text input */}
            <input
              type="text"
              value={segment.text}
              onChange={(e) => updateSegment(segment.id, { text: e.target.value })}
              placeholder="Enter text..."
              className="w-full px-2 py-1.5 rounded text-xs"
              style={{
                background: 'var(--studio-panel, #252525)',
                color: 'var(--studio-text, #ccc)',
                border: '1px solid var(--studio-border-subtle, #333)',
                outline: 'none',
              }}
            />

            {/* Controls row */}
            <div className="grid grid-cols-3 gap-1.5">
              {/* Start time */}
              <div>
                <label className="text-xs block mb-0.5" style={{ color: 'var(--studio-text-muted, #888)', fontSize: 9 }}>
                  Start (s)
                </label>
                <input
                  type="number"
                  min={0}
                  max={composition.duration - 1}
                  value={segment.start}
                  onChange={(e) => updateSegment(segment.id, { start: Number(e.target.value) })}
                  className="w-full px-1.5 py-1 rounded text-xs"
                  style={{
                    background: 'var(--studio-panel, #252525)',
                    color: 'var(--studio-text, #ccc)',
                    border: '1px solid var(--studio-border-subtle, #333)',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Position - button group */}
              <div>
                <label className="text-xs block mb-0.5" style={{ color: 'var(--studio-text-muted, #888)', fontSize: 9 }}>
                  Position
                </label>
                <div className="flex gap-0.5">
                  {POSITIONS.map((pos) => {
                    const isActive = segment.position === pos;
                    return (
                      <button
                        key={pos}
                        onClick={() => updateSegment(segment.id, { position: pos })}
                        className="flex-1 py-1 rounded text-center transition-colors"
                        style={{
                          fontSize: 9,
                          background: isActive ? 'var(--studio-accent, #4a6cf7)' : 'var(--studio-panel, #252525)',
                          color: isActive ? '#fff' : 'var(--studio-text-muted, #888)',
                          border: `1px solid ${isActive ? 'var(--studio-accent, #4a6cf7)' : 'var(--studio-border-subtle, #333)'}`,
                        }}
                      >
                        {pos.charAt(0).toUpperCase()}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Effect - custom Select */}
              <div>
                <label className="text-xs block mb-0.5" style={{ color: 'var(--studio-text-muted, #888)', fontSize: 9 }}>
                  Effect
                </label>
                <Select
                  value={segment.effect}
                  onChange={(val) => updateSegment(segment.id, { effect: val as TextEffectType })}
                  options={TEXT_EFFECTS}
                  className="text-xs"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add segment button */}
      <button
        onClick={() => addSegment()}
        className="w-full py-1.5 rounded text-xs transition-colors"
        style={{
          background: 'transparent',
          color: 'var(--studio-text-muted, #888)',
          border: '1px dashed var(--studio-border-subtle, #333)',
        }}
      >
        + Add Text Segment
      </button>
    </div>
  );
}
