/**
 * Properties Panel
 *
 * Brush size, opacity controls for the canvas drawing mode.
 * Extracted from CanvasMode toolbar.
 */

import { useStudio } from '../StudioContext.js';

export function PropertiesPanel() {
  const { state, dispatch } = useStudio();

  return (
    <div className="space-y-3">
      {/* Brush Size */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span style={{ color: 'var(--studio-text-muted)', fontSize: '11px' }}>Size</span>
          <span style={{ color: 'var(--studio-text)', fontSize: '11px' }}>
            {/* Brush size is managed locally in the canvas hook; this is a placeholder */}
            --
          </span>
        </div>
        <input
          type="range"
          min="1"
          max="50"
          defaultValue={8}
          className="w-full"
          style={{ accentColor: 'var(--studio-accent)' }}
        />
      </div>

      {/* Canvas Size */}
      {state.canvasSize && (
        <div>
          <span style={{ color: 'var(--studio-text-muted)', fontSize: '11px' }}>Canvas</span>
          <div
            className="mt-1 px-2 py-1 rounded"
            style={{ background: 'var(--studio-bg)', fontSize: '11px', color: 'var(--studio-text)' }}
          >
            {state.canvasSize.width} x {state.canvasSize.height}
          </div>
        </div>
      )}

      {/* Zoom */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span style={{ color: 'var(--studio-text-muted)', fontSize: '11px' }}>Zoom</span>
          <span style={{ color: 'var(--studio-text)', fontSize: '11px' }}>
            {Math.round(state.zoomLevel * 100)}%
          </span>
        </div>
        <input
          type="range"
          min="25"
          max="400"
          step="25"
          value={Math.round(state.zoomLevel * 100)}
          onChange={(e) => dispatch({ type: 'SET_ZOOM', payload: Number(e.target.value) / 100 })}
          className="w-full"
          style={{ accentColor: 'var(--studio-accent)' }}
        />
      </div>
    </div>
  );
}
