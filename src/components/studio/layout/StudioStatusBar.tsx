/**
 * Studio Status Bar
 *
 * 24px bottom bar with contextual info per mode.
 * Draw: Tool | Size | X: Y: | Zoom slider
 * Generate: Budget remaining | Cost per image
 * Library: N assets | M selected
 */

import { useStudio } from '../StudioContext.js';

interface StudioStatusBarProps {
  assetCount?: number;
}

export function StudioStatusBar({ assetCount = 0 }: StudioStatusBarProps) {
  const { state, dispatch } = useStudio();

  return (
    <div
      className="flex items-center justify-between px-3"
      style={{
        height: 'var(--studio-statusbar-height)',
        background: 'var(--studio-panel-header)',
        borderTop: '1px solid var(--studio-border-subtle)',
        fontSize: '11px',
        color: 'var(--studio-text-muted)',
      }}
    >
      {state.activeMode === 'draw' && (
        <>
          <div className="flex items-center gap-4">
            <span>
              Tool: <strong style={{ color: 'var(--studio-text)' }}>
                {state.activeTool.charAt(0).toUpperCase() + state.activeTool.slice(1)}
              </strong>
            </span>
            {state.canvasSize && (
              <span>
                Canvas: {state.canvasSize.width} x {state.canvasSize.height}
              </span>
            )}
            {state.cursorPosition && (
              <span>
                X: {state.cursorPosition.x} Y: {state.cursorPosition.y}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span>Zoom:</span>
            <input
              type="range"
              min="25"
              max="400"
              step="25"
              value={Math.round(state.zoomLevel * 100)}
              onChange={(e) => dispatch({ type: 'SET_ZOOM', payload: Number(e.target.value) / 100 })}
              style={{ width: 80 }}
            />
            <span style={{ width: 36, textAlign: 'right' }}>
              {Math.round(state.zoomLevel * 100)}%
            </span>
          </div>
        </>
      )}

      {state.activeMode === 'generate' && (
        <>
          <div className="flex items-center gap-4">
            <span>Image Generator</span>
          </div>
          <div className="flex items-center gap-4">
            {state.budget && (
              <>
                <span>
                  Cost/image: ~${(state.budget.costPerImage / 100).toFixed(2)}
                </span>
                <span>
                  Remaining: <strong style={{ color: 'var(--studio-text)' }}>
                    ${(state.budget.remaining / 100).toFixed(2)}
                  </strong>
                </span>
              </>
            )}
          </div>
        </>
      )}

      {state.activeMode === 'video' && (
        <>
          <div className="flex items-center gap-4">
            <span>Video Creator</span>
            <span>
              Platform: <strong style={{ color: 'var(--studio-text)' }}>
                {state.videoComposition.platform.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
              </strong>
            </span>
            <span>
              {(() => {
                const aspects: Record<string, string> = {
                  instasnap_story: '9:16', instasnap_reel: '9:16', vidtube_short: '9:16',
                  vidtube_video: '16:9', myface_story: '9:16', myface_post: '1:1',
                  instasnap_post: '1:1', threadit_embed: '16:9', thumbnail: '16:9',
                };
                return aspects[state.videoComposition.platform] || '9:16';
              })()}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span>
              {Math.floor(state.videoComposition.currentTime / 60)}:{Math.floor(state.videoComposition.currentTime % 60).toString().padStart(2, '0')}
              {' / '}
              {Math.floor(state.videoComposition.duration / 60)}:{Math.floor(state.videoComposition.duration % 60).toString().padStart(2, '0')}
            </span>
            <span>
              Loop: {state.videoComposition.loop ? 'On' : 'Off'}
            </span>
          </div>
        </>
      )}

      {state.activeMode === 'library' && (
        <>
          <span>{assetCount} asset{assetCount !== 1 ? 's' : ''}</span>
          <span>
            {state.selectedAssetIds.length > 0
              ? `${state.selectedAssetIds.length} selected`
              : 'Click to select, Ctrl+click for multi-select'}
          </span>
        </>
      )}
    </div>
  );
}
