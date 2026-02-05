/**
 * Canvas Mode - Drawing workspace
 *
 * Thin wrapper that renders the canvas element and delegates
 * all drawing logic to useCanvasDrawing hook.
 * Toolbar, colors, and history moved to panels.
 */

import { useRef } from 'react';
import { useCanvasDrawing, CANVAS_PRESETS } from '../hooks/useCanvasDrawing.js';
import { ImportImageModal } from '../modals/ImportImageModal.js';

export function CanvasMode() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {
    startDrawing,
    draw,
    stopDrawing,
    zoom,
    canvasPreset,
    showImportModal,
    setShowImportModal,
    loadImageToCanvas,
    error,
  } = useCanvasDrawing(canvasRef);

  return (
    <div className="h-full flex flex-col relative">
      {/* Error */}
      {error && (
        <div
          className="px-4 py-2 text-xs"
          style={{ background: 'rgba(244, 67, 54, 0.15)', color: 'var(--studio-error)' }}
        >
          {error}
        </div>
      )}

      {/* Canvas Area */}
      <div
        className="flex-1 overflow-auto flex items-center justify-center"
        style={{ background: 'var(--studio-bg)' }}
      >
        <div
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'center center',
          }}
        >
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            className="cursor-crosshair"
            style={{
              border: '1px solid var(--studio-border)',
              background: '#fff',
              boxShadow: '0 2px 16px rgba(0,0,0,0.3)',
            }}
          />
        </div>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <ImportImageModal
          onSelect={loadImageToCanvas}
          onClose={() => setShowImportModal(false)}
        />
      )}
    </div>
  );
}

export default CanvasMode;
