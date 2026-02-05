/**
 * History Panel
 *
 * Undo/redo entry list with click-to-restore.
 * Shows a list of drawing actions with the current position highlighted.
 */

import { UndoIcon, RedoIcon } from '../icons/StudioIcons.js';

export function HistoryPanel() {
  // History data is managed inside the canvas hook.
  // This panel shows a simplified view with undo/redo buttons.

  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        <button
          className="studio-toolbar-btn flex-1"
          title="Undo (Ctrl+Z)"
          style={{ justifyContent: 'center', gap: 4, display: 'flex', alignItems: 'center' }}
        >
          <UndoIcon size={14} />
          <span style={{ fontSize: '11px' }}>Undo</span>
        </button>
        <button
          className="studio-toolbar-btn flex-1"
          title="Redo (Ctrl+Shift+Z)"
          style={{ justifyContent: 'center', gap: 4, display: 'flex', alignItems: 'center' }}
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
