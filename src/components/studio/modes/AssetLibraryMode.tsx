/**
 * Asset Library Mode
 *
 * Browse, search, and manage player assets (images, video configs).
 * Supports filtering by source and usage.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useStudio, type AssetSource, type AssetUsage } from '../StudioContext.js';
import { useStudioAssets, type MediaFile } from '../useStudioAssets.js';
import { useWSStore } from '../../../stores/wsStore.js';

// ============================================================================
// Filter Chips
// ============================================================================

const SOURCE_OPTIONS: { id: AssetSource; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'generated', label: 'Generated' },
  { id: 'imported', label: 'Imported' },
  { id: 'npc', label: 'From NPCs' },
  { id: 'system', label: 'System' },
];

const USAGE_OPTIONS: { id: AssetUsage; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'used', label: 'Used' },
  { id: 'unused', label: 'Unused' },
];

// ============================================================================
// Component
// ============================================================================

export function AssetLibraryMode() {
  const { state, dispatch, addToDraft, selectAsset, deselectAsset } = useStudio();
  const { populateCache } = useStudioAssets();
  const request = useWSStore((s) => s.request);
  const connected = useWSStore((s) => s.connected);

  const [assets, setAssets] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debounced search
  const [searchInput, setSearchInput] = useState(state.filters.search);
  useEffect(() => {
    const timeout = setTimeout(() => {
      dispatch({ type: 'SET_FILTERS', payload: { search: searchInput } });
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchInput, dispatch]);

  // Fetch assets
  const fetchAssets = useCallback(async () => {
    if (!connected) return;

    setLoading(true);
    setError(null);

    try {
      // Build filters for server
      const filters: Record<string, unknown> = {};
      if (state.filters.source !== 'all') {
        // Map source to owner_type or category
        if (state.filters.source === 'generated') {
          filters.category = 'generated';
        } else if (state.filters.source === 'imported') {
          filters.category = 'upload';
        } else if (state.filters.source === 'npc') {
          filters.owner_type = 'npc';
        } else if (state.filters.source === 'system') {
          filters.owner_type = 'system';
        }
      }
      if (state.filters.search) {
        filters.search = state.filters.search;
      }
      // TODO: Add usage filter support on server

      const response = await request<object, { files: MediaFile[]; total: number }>(
        'media:getAll',
        { filters, limit: 100 }
      );

      if (response && 'files' in response) {
        setAssets(response.files);
        populateCache(response.files);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load assets');
    } finally {
      setLoading(false);
    }
  }, [connected, state.filters, request, populateCache]);

  // Fetch on mount and when filters change
  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  // Filtered assets (client-side usage filter for now)
  const filteredAssets = useMemo(() => {
    if (state.filters.usage === 'all') return assets;
    // TODO: Implement proper usage filtering with server support
    return assets;
  }, [assets, state.filters.usage]);

  // Handle asset click
  const handleAssetClick = useCallback(
    (asset: MediaFile, e: React.MouseEvent) => {
      if (e.shiftKey || e.metaKey || e.ctrlKey) {
        // Multi-select
        if (state.selectedAssetIds.includes(asset.id)) {
          deselectAsset(asset.id);
        } else {
          selectAsset(asset.id);
        }
      } else {
        // Single select (clear others)
        dispatch({ type: 'CLEAR_SELECTION' });
        selectAsset(asset.id);
      }
    },
    [state.selectedAssetIds, selectAsset, deselectAsset, dispatch]
  );

  // Add selected to draft
  const handleAddToDraft = useCallback(() => {
    for (const id of state.selectedAssetIds) {
      addToDraft(id);
    }
    dispatch({ type: 'CLEAR_SELECTION' });
  }, [state.selectedAssetIds, addToDraft, dispatch]);

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div
        className="p-4 border-b flex flex-wrap gap-4 items-center"
        style={{
          background: 'var(--color-bgSecondary)',
          borderBottomColor: 'var(--color-border)',
        }}
      >
        {/* Search */}
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search assets..."
            className="w-full px-3 py-2 rounded"
            style={{
              background: 'var(--color-bg)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text)',
            }}
          />
        </div>

        {/* Source Filter */}
        <div className="flex gap-1">
          {SOURCE_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => dispatch({ type: 'SET_FILTERS', payload: { source: opt.id } })}
              className="px-3 py-1.5 rounded text-sm transition-all"
              style={{
                background:
                  state.filters.source === opt.id ? 'var(--color-primary)' : 'transparent',
                color: state.filters.source === opt.id ? '#fff' : 'var(--color-text)',
                border: `1px solid ${state.filters.source === opt.id ? 'var(--color-primary)' : 'var(--color-border)'}`,
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Usage Filter */}
        <div className="flex gap-1">
          {USAGE_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => dispatch({ type: 'SET_FILTERS', payload: { usage: opt.id } })}
              className="px-3 py-1.5 rounded text-sm transition-all"
              style={{
                background:
                  state.filters.usage === opt.id ? 'var(--color-primary)' : 'transparent',
                color: state.filters.usage === opt.id ? '#fff' : 'var(--color-text)',
                border: `1px solid ${state.filters.usage === opt.id ? 'var(--color-primary)' : 'var(--color-border)'}`,
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Selection Actions */}
      {state.selectedAssetIds.length > 0 && (
        <div
          className="px-4 py-2 flex items-center justify-between"
          style={{
            background: 'var(--color-primary)',
            color: '#fff',
          }}
        >
          <span>{state.selectedAssetIds.length} selected</span>
          <div className="flex gap-2">
            <button
              onClick={handleAddToDraft}
              className="px-3 py-1 rounded text-sm"
              style={{
                background: 'rgba(255,255,255,0.2)',
              }}
            >
              Add to Post
            </button>
            <button
              onClick={() => dispatch({ type: 'CLEAR_SELECTION' })}
              className="px-3 py-1 rounded text-sm"
              style={{
                background: 'rgba(255,255,255,0.2)',
              }}
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p style={{ color: 'var(--color-textSecondary)' }}>Loading assets...</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p style={{ color: 'var(--color-error, #ef4444)' }}>{error}</p>
              <button
                onClick={fetchAssets}
                className="mt-2 px-4 py-2 rounded"
                style={{
                  background: 'var(--color-bgSecondary)',
                  color: 'var(--color-text)',
                  border: '1px solid var(--color-border)',
                }}
              >
                Retry
              </button>
            </div>
          </div>
        ) : filteredAssets.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p style={{ color: 'var(--color-textSecondary)' }}>No assets found</p>
              <p className="text-sm mt-1" style={{ color: 'var(--color-textSecondary)' }}>
                {state.filters.search
                  ? 'Try a different search term'
                  : 'Generate some images to get started'}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-4">
            {filteredAssets.map((asset) => (
              <div
                key={asset.id}
                onClick={(e) => handleAssetClick(asset, e)}
                className="relative aspect-square rounded-lg overflow-hidden cursor-pointer transition-all hover:ring-2 ring-blue-500"
                style={{
                  background: 'var(--color-bgSecondary)',
                  boxShadow: state.selectedAssetIds.includes(asset.id)
                    ? '0 0 0 3px var(--color-primary)'
                    : 'none',
                }}
              >
                {asset.file_type?.startsWith('image') || !asset.file_type ? (
                  <img
                    src={asset.file_url}
                    alt={asset.filename}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-4xl">🎬</span>
                  </div>
                )}

                {/* Category badge */}
                <div
                  className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-xs"
                  style={{
                    background: 'rgba(0,0,0,0.7)',
                    color: '#fff',
                  }}
                >
                  {asset.category || 'media'}
                </div>

                {/* Selection indicator */}
                {state.selectedAssetIds.includes(asset.id) && (
                  <div
                    className="absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ background: 'var(--color-primary)', color: '#fff' }}
                  >
                    ✓
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AssetLibraryMode;
