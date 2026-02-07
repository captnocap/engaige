/**
 * Video Style Panel
 *
 * Sidebar panel for choosing overlay preset and text style preset.
 * Background is now handled by the ModeSelector + TunerPanel + EnergyPanel.
 */

import { useVideoComposition } from '../hooks/useVideoComposition.js';
import { OVERLAY_PRESETS, TEXT_STYLE_PRESETS } from '../../ui/MediaRenderer/presets.js';
import type { OverlayPreset, TextStylePreset } from '../../ui/MediaRenderer/types.js';

// ============================================================================
// Helpers
// ============================================================================

function formatPresetName(name: string): string {
  return name.replace(/_/g, ' ');
}

// ============================================================================
// Component
// ============================================================================

export function VideoStylePanel() {
  const { composition, setComposition } = useVideoComposition();

  const overlayPresets = Object.keys(OVERLAY_PRESETS) as OverlayPreset[];
  const textPresets = Object.keys(TEXT_STYLE_PRESETS) as TextStylePreset[];

  return (
    <div className="space-y-3">
      {/* Overlay */}
      <div>
        <div
          className="text-xs font-medium mb-1.5"
          style={{ color: 'var(--studio-text-muted, #888)' }}
        >
          Overlay
        </div>
        <div className="flex flex-wrap gap-1">
          {overlayPresets.map((preset) => {
            const isActive = composition.overlayPreset === preset;
            return (
              <button
                key={preset}
                onClick={() => setComposition({ overlayPreset: preset })}
                className="px-2 py-1.5 rounded text-xs transition-colors"
                style={{
                  background: isActive ? 'var(--studio-accent, #4a6cf7)' : 'var(--studio-bg-darkest, #1a1a1a)',
                  color: isActive ? '#fff' : 'var(--studio-text, #ccc)',
                  border: `1px solid ${isActive ? 'var(--studio-accent, #4a6cf7)' : 'var(--studio-border-subtle, #333)'}`,
                }}
              >
                {formatPresetName(preset)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Text Style */}
      <div>
        <div
          className="text-xs font-medium mb-1.5"
          style={{ color: 'var(--studio-text-muted, #888)' }}
        >
          Text Style
        </div>
        <div className="flex flex-wrap gap-1">
          {textPresets.map((preset) => {
            const isActive = composition.textStylePreset === preset;
            return (
              <button
                key={preset}
                onClick={() => setComposition({ textStylePreset: preset })}
                className="px-2 py-1.5 rounded text-xs transition-colors"
                style={{
                  background: isActive ? 'var(--studio-accent, #4a6cf7)' : 'var(--studio-bg-darkest, #1a1a1a)',
                  color: isActive ? '#fff' : 'var(--studio-text, #ccc)',
                  border: `1px solid ${isActive ? 'var(--studio-accent, #4a6cf7)' : 'var(--studio-border-subtle, #333)'}`,
                }}
              >
                {formatPresetName(preset)}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
