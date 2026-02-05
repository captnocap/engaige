/**
 * Import Image Modal
 *
 * Shows a grid of library assets for importing into the canvas.
 * Extracted from CanvasMode.
 */

import { useState, useEffect, useCallback } from 'react';
import { useWSStore } from '../../../stores/wsStore.js';
import { CloseIcon } from '../icons/StudioIcons.js';
import type { MediaFile } from '../useStudioAssets.js';

interface ImportImageModalProps {
  onSelect: (imageUrl: string) => void;
  onClose: () => void;
}

export function ImportImageModal({ onSelect, onClose }: ImportImageModalProps) {
  const request = useWSStore((s) => s.request);
  const connected = useWSStore((s) => s.connected);

  const [assets, setAssets] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAssets = useCallback(async () => {
    if (!connected) return;
    setLoading(true);
    try {
      const response = await request<object, { files: MediaFile[] }>(
        'media:getAll',
        { filters: { category: 'generated' }, limit: 50 }
      );
      if (response?.files) {
        setAssets(response.files.filter(f => f.file_type?.startsWith('image') || !f.file_type));
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }, [connected, request]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div
      className="absolute inset-0 flex items-center justify-center z-50"
      style={{ background: 'rgba(0, 0, 0, 0.6)' }}
      onClick={onClose}
    >
      <div
        className="w-[600px] max-h-[80%] rounded-lg overflow-hidden flex flex-col"
        style={{ background: 'var(--studio-panel)', border: '1px solid var(--studio-border)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ background: 'var(--studio-panel-header)', borderBottom: '1px solid var(--studio-border-subtle)' }}
        >
          <span style={{ color: 'var(--studio-text-bright)', fontWeight: 600, fontSize: '13px' }}>
            Import Image
          </span>
          <button className="studio-toolbar-btn" onClick={onClose}>
            <CloseIcon size={14} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div style={{ color: 'var(--studio-text-muted)', textAlign: 'center', padding: '32px 0' }}>
              Loading...
            </div>
          ) : assets.length === 0 ? (
            <div style={{ color: 'var(--studio-text-muted)', textAlign: 'center', padding: '32px 0' }}>
              No images in library
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-3">
              {assets.map(asset => (
                <button
                  key={asset.id}
                  onClick={() => onSelect(asset.file_url)}
                  className="aspect-square rounded overflow-hidden hover:ring-2 ring-blue-500"
                  style={{
                    background: 'var(--studio-bg)',
                  }}
                >
                  <img
                    src={asset.file_url}
                    alt={asset.filename}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
