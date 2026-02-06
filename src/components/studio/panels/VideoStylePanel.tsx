/**
 * Video Style Panel
 *
 * Sidebar panel for choosing base preset, overlay preset, and text style preset.
 * Replaces ContentCreator's StyleStep in the AE-style layout.
 */

import { useVideoComposition } from '../hooks/useVideoComposition.js';
import { BASE_PRESETS, OVERLAY_PRESETS, TEXT_STYLE_PRESETS, INTENT_STYLE_SUGGESTIONS } from '../../ui/MediaRenderer/presets.js';
import type { BasePreset, OverlayPreset, TextStylePreset } from '../../ui/MediaRenderer/types.js';

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
  const suggestion = INTENT_STYLE_SUGGESTIONS[composition.intent];

  const basePresets = Object.keys(BASE_PRESETS) as BasePreset[];
  const overlayPresets = Object.keys(OVERLAY_PRESETS) as OverlayPreset[];
  const textPresets = Object.keys(TEXT_STYLE_PRESETS) as TextStylePreset[];

  return (
    <div className="space-y-3">
      {/* Background */}
      <div>
        <div
          className="text-xs font-medium mb-1.5"
          style={{ color: 'var(--studio-text-muted, #888)' }}
        >
          Background
        </div>
        <div className="grid grid-cols-2 gap-1">
          {basePresets.map((preset) => {
            const isActive = composition.basePreset === preset;
            const isSuggested = suggestion?.base === preset;
            return (
              <button
                key={preset}
                onClick={() => setComposition({ basePreset: preset })}
                className="px-2 py-1.5 rounded text-xs text-left transition-colors"
                style={{
                  background: isActive ? 'var(--studio-accent, #4a6cf7)' : 'var(--studio-bg-darkest, #1a1a1a)',
                  color: isActive ? '#fff' : 'var(--studio-text, #ccc)',
                  border: `1px solid ${isActive ? 'var(--studio-accent, #4a6cf7)' : 'var(--studio-border-subtle, #333)'}`,
                }}
              >
                {formatPresetName(preset)}{isSuggested ? ' *' : ''}
              </button>
            );
          })}
        </div>
      </div>

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
            const isSuggested = suggestion?.overlay === preset;
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
                {formatPresetName(preset)}{isSuggested ? ' *' : ''}
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
            const isSuggested = suggestion?.text === preset;
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
                {formatPresetName(preset)}{isSuggested ? ' *' : ''}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
