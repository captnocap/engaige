/**
 * Mode Selector Panel
 *
 * Visual grid of available generative art modes, grouped by category.
 * Click to select a mode for the video background.
 */

import { useMemo } from 'react';
import { useVideoComposition } from '../hooks/useVideoComposition.js';
import { MODE_LIST, getModesByCategory } from '../../../lib/genart/mode-registry.js';
import type { ModeCategory } from '../../../lib/genart/types.js';

// ============================================================================
// Category Labels
// ============================================================================

const CATEGORY_LABELS: Record<ModeCategory, string> = {
  abstract: 'Abstract',
  geometric: 'Geometric',
  organic: 'Organic',
  '3d': '3D',
};

const CATEGORY_ORDER: ModeCategory[] = ['abstract', 'geometric', 'organic', '3d'];

// ============================================================================
// Component
// ============================================================================

export function ModeSelector() {
  const { composition, setGenArtMode } = useVideoComposition();

  const grouped = useMemo(() => {
    return CATEGORY_ORDER.map(cat => ({
      category: cat,
      label: CATEGORY_LABELS[cat],
      modes: getModesByCategory(cat),
    })).filter(g => g.modes.length > 0);
  }, []);

  return (
    <div className="space-y-3">
      {grouped.map(group => (
        <div key={group.category}>
          <div
            className="text-xs font-medium mb-1.5"
            style={{ color: 'var(--studio-text-muted, #888)' }}
          >
            {group.label}
          </div>
          <div className="grid grid-cols-2 gap-1">
            {group.modes.map(mode => {
              const isActive = composition.mode === mode.id;
              return (
                <button
                  key={mode.id}
                  onClick={() => setGenArtMode(mode.id)}
                  className="px-2 py-2 rounded text-left transition-colors"
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
                  <div className="text-xs font-medium">{mode.name}</div>
                  <div
                    className="text-[10px] mt-0.5 leading-tight"
                    style={{
                      color: isActive
                        ? 'rgba(255,255,255,0.7)'
                        : 'var(--studio-text-muted, #666)',
                    }}
                  >
                    {mode.description}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
