/**
 * Library Panel
 *
 * Compact asset grid with search/filters.
 * Extracted from AssetLibraryMode for panel sidebar.
 */

import { useState, useEffect, useCallback } from 'react';
import { useStudio } from '../StudioContext.js';
import { useStudioAssets, type MediaFile } from '../useStudioAssets.js';
import { useWSStore } from '../../../stores/wsStore.js';

export function LibraryPanel() {
  const { addToDraft } = useStudio();
  const { populateCache } = useStudioAssets();
  const request = useWSStore((s) => s.request);
  const connected = useWSStore((s) => s.connected);

  const [assets, setAssets] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchAssets = useCallback(async () => {
    if (!connected) return;
    setLoading(true);
    try {
      const filters: Record<string, unknown> = {};
      if (search) filters.search = search;

      const response = await request<object, { files: MediaFile[]; total: number }>(
        'media:getAll',
        { filters, limit: 30 }
      );
      if (response?.files) {
        setAssets(response.files.filter(f => f.file_type?.startsWith('image') || !f.file_type));
        populateCache(response.files);
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }, [connected, request, search, populateCache]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  return (
    <div className="space-y-2">
      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search..."
        className="w-full"
        style={{
          background: 'var(--studio-bg)',
          border: '1px solid var(--studio-border)',
          color: 'var(--studio-text)',
          borderRadius: 3,
          padding: '4px 8px',
          fontSize: '11px',
        }}
      />

      {/* Grid */}
      {loading ? (
        <div style={{ color: 'var(--studio-text-muted)', fontSize: '11px', textAlign: 'center', padding: '16px 0' }}>
          Loading...
        </div>
      ) : assets.length === 0 ? (
        <div style={{ color: 'var(--studio-text-muted)', fontSize: '11px', textAlign: 'center', padding: '16px 0' }}>
          No assets found
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-1">
          {assets.map(asset => (
            <button
              key={asset.id}
              onClick={() => addToDraft(asset.id)}
              className="aspect-square rounded overflow-hidden"
              style={{ background: 'var(--studio-bg)' }}
              title={asset.filename}
            >
              <img
                src={asset.file_url}
                alt={asset.filename}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
