/**
 * Tuner Panel
 *
 * 8 sliders for TunerParams + preset buttons.
 * Changes update the live preview in real-time.
 */

import { useCallback } from 'react';
import { useVideoComposition } from '../hooks/useVideoComposition.js';
import { TUNER_PRESETS, DEFAULT_TUNER_PARAMS } from '../../../lib/genart/types.js';
import type { TunerParams } from '../../../lib/genart/types.js';

// ============================================================================
// Slider Definitions
// ============================================================================

interface SliderDef {
  key: keyof TunerParams;
  label: string;
  description: string;
}

const SLIDERS: SliderDef[] = [
  { key: 'decay', label: 'Decay', description: 'Trail length' },
  { key: 'sensitivity', label: 'Sensitivity', description: 'Reactivity' },
  { key: 'feedback', label: 'Feedback', description: 'Self-reference' },
  { key: 'bassWeight', label: 'Bass', description: 'Low freq weight' },
  { key: 'midWeight', label: 'Mids', description: 'Mid freq weight' },
  { key: 'highWeight', label: 'Highs', description: 'High freq weight' },
  { key: 'colorDrift', label: 'Color Drift', description: 'Hue shift speed' },
  { key: 'chaos', label: 'Chaos', description: 'Randomness' },
];

const PRESET_LIST = [
  { id: 'reset', label: 'Reset', params: DEFAULT_TUNER_PARAMS },
  ...Object.entries(TUNER_PRESETS).map(([id, params]) => ({
    id,
    label: id.charAt(0).toUpperCase() + id.slice(1),
    params: { ...DEFAULT_TUNER_PARAMS, ...params },
  })),
];

// ============================================================================
// Component
// ============================================================================

export function TunerPanel() {
  const { composition, setTunerParams } = useVideoComposition();
  const params = composition.tunerParams;

  const handleSlider = useCallback(
    (key: keyof TunerParams, value: number) => {
      setTunerParams({ [key]: value });
    },
    [setTunerParams]
  );

  const applyPreset = useCallback(
    (presetParams: TunerParams) => {
      setTunerParams(presetParams);
    },
    [setTunerParams]
  );

  return (
    <div className="space-y-3">
      {/* Presets */}
      <div>
        <div
          className="text-xs font-medium mb-1.5"
          style={{ color: 'var(--studio-text-muted, #888)' }}
        >
          Presets
        </div>
        <div className="flex flex-wrap gap-1">
          {PRESET_LIST.map(preset => (
            <button
              key={preset.id}
              onClick={() => applyPreset(preset.params as TunerParams)}
              className="px-2 py-1 rounded text-xs transition-colors"
              style={{
                background: 'var(--studio-bg-darkest, #1a1a1a)',
                color: 'var(--studio-text, #ccc)',
                border: '1px solid var(--studio-border-subtle, #333)',
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sliders */}
      <div className="space-y-2">
        {SLIDERS.map(slider => (
          <div key={slider.key}>
            <div className="flex items-center justify-between mb-0.5">
              <span
                className="text-xs"
                style={{ color: 'var(--studio-text, #ccc)' }}
              >
                {slider.label}
              </span>
              <span
                className="text-[10px] tabular-nums"
                style={{ color: 'var(--studio-text-muted, #888)' }}
              >
                {(params[slider.key] * 100).toFixed(0)}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={params[slider.key]}
              onChange={(e) => handleSlider(slider.key, parseFloat(e.target.value))}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, var(--studio-accent, #4a6cf7) ${params[slider.key] * 100}%, var(--studio-bg-darkest, #1a1a1a) ${params[slider.key] * 100}%)`,
              }}
              title={slider.description}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
