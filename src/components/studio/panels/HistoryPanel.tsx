/**
 * History Panel
 *
 * Undo/redo buttons wired to canvas callbacks via context ref.
 */

import { useStudio } from '../StudioContext.js';
import { UndoIcon, RedoIcon } from '../icons/StudioIcons.js';

export function HistoryPanel() {
  const { canvasCallbacksRef } = useStudio();

  const handleUndo = () => canvasCallbacksRef.current?.undo();
  const handleRedo = () => canvasCallbacksRef.current?.redo();

  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        <button
          className="studio-toolbar-btn flex-1"
          title="Undo (Ctrl+Z)"
          style={{ justifyContent: 'center', gap: 4, display: 'flex', alignItems: 'center' }}
          onClick={handleUndo}
        >
          <UndoIcon size={14} />
          <span style={{ fontSize: '11px' }}>Undo</span>
        </button>
        <button
          className="studio-toolbar-btn flex-1"
          title="Redo (Ctrl+Shift+Z)"
          style={{ justifyContent: 'center', gap: 4, display: 'flex', alignItems: 'center' }}
          onClick={handleRedo}
        >
          <RedoIcon size={14} />
          <span style={{ fontSize: '11px' }}>Redo</span>
        </button>
      </div>

      <div
        className="rounded px-2 py-3 text-center"
        style={{
          background: 'var(--studio-bg)',
          color: 'var(--studio-text-muted)',
          fontSize: '11px',
        }}
      >
        History entries appear here as you draw.
      </div>
    </div>
  );
}
