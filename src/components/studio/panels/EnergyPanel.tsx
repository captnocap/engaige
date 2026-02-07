/**
 * Energy Panel
 *
 * Energy curve selector, BPM slider, and pitch slider.
 * Controls the "feel" of the generative art animation.
 */

import { useCallback } from 'react';
import { useVideoComposition } from '../hooks/useVideoComposition.js';
import type { EnergyCurveType } from '../../../lib/genart/types.js';

// ============================================================================
// Curve Definitions
// ============================================================================

interface CurveDef {
  id: EnergyCurveType;
  label: string;
  description: string;
  icon: string;
}

const CURVES: CurveDef[] = [
  { id: 'steady', label: 'Steady', description: 'Gentle sine variation', icon: '~' },
  { id: 'build_up', label: 'Build Up', description: 'Ramps from calm to intense', icon: '/' },
  { id: 'pulse', label: 'Pulse', description: 'Rhythmic oscillation', icon: '∿' },
  { id: 'chaotic', label: 'Chaotic', description: 'Random spikes', icon: '⚡' },
  { id: 'calm_to_storm', label: 'Calm→Storm', description: 'Slow build with chaos', icon: '🌊' },
  { id: 'drop', label: 'Drop', description: 'Build, drop, rebuild', icon: '⌄' },
  { id: 'breathe', label: 'Breathe', description: 'Slow sine cycle', icon: '◠' },
];

// ============================================================================
// Component
// ============================================================================

export function EnergyPanel() {
  const { composition, setEnergyCurve, setBPM, setPitch } = useVideoComposition();

  return (
    <div className="space-y-3">
      {/* Energy Curve */}
      <div>
        <div
          className="text-xs font-medium mb-1.5"
          style={{ color: 'var(--studio-text-muted, #888)' }}
        >
          Energy Curve
        </div>
        <div className="grid grid-cols-2 gap-1">
          {CURVES.map(curve => {
            const isActive = composition.energyCurve === curve.id;
            return (
              <button
                key={curve.id}
                onClick={() => setEnergyCurve(curve.id)}
                className="px-2 py-1.5 rounded text-left transition-colors"
                style={{
                  background: isActive
                    ? 'var(--studio-accent, #4a6cf7)'
                    : 'var(--studio-bg-darkest, #1a1a1a)',
                  color: isActive ? '#fff' : 'var(--studio-text, #ccc)',
                  border: `1px solid ${
                    isActive
                      ? 'var(--studio-accent, #4a6cf7)'
                      : 'var(--studio-border-subtle, #333)'
                  }`,
                }}
              >
                <div className="text-xs">
                  <span className="mr-1 opacity-70">{curve.icon}</span>
                  {curve.label}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* BPM */}
      <div>
        <div className="flex items-center justify-between mb-0.5">
          <span
            className="text-xs font-medium"
            style={{ color: 'var(--studio-text-muted, #888)' }}
          >
            BPM
          </span>
          <span
            className="text-[10px] tabular-nums"
            style={{ color: 'var(--studio-text-muted, #888)' }}
          >
            {composition.bpm}
          </span>
        </div>
        <input
          type="range"
          min={40}
          max={200}
          step={1}
          value={composition.bpm}
          onChange={(e) => setBPM(parseInt(e.target.value, 10))}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, var(--studio-accent, #4a6cf7) ${((composition.bpm - 40) / 160) * 100}%, var(--studio-bg-darkest, #1a1a1a) ${((composition.bpm - 40) / 160) * 100}%)`,
          }}
        />
        <div
          className="flex justify-between text-[9px] mt-0.5"
          style={{ color: 'var(--studio-text-muted, #666)' }}
        >
          <span>40</span>
          <span>200</span>
        </div>
      </div>

      {/* Pitch */}
      <div>
        <div className="flex items-center justify-between mb-0.5">
          <span
            className="text-xs font-medium"
            style={{ color: 'var(--studio-text-muted, #888)' }}
          >
            Color Temperature
          </span>
          <span
            className="text-[10px] tabular-nums"
            style={{ color: 'var(--studio-text-muted, #888)' }}
          >
            {composition.pitch < 0.33 ? 'Warm' : composition.pitch < 0.66 ? 'Neutral' : 'Cool'}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={composition.pitch}
          onChange={(e) => setPitch(parseFloat(e.target.value))}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #ff6b35, #f7dc6f, #48c9b0, #5dade2, #8e44ad)`,
          }}
        />
        <div
          className="flex justify-between text-[9px] mt-0.5"
          style={{ color: 'var(--studio-text-muted, #666)' }}
        >
          <span>Warm</span>
          <span>Cool</span>
        </div>
      </div>
    </div>
  );
}
