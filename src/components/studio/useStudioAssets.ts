/**
 * Studio Assets Hook
 *
 * Resolves asset IDs to full MediaFile objects with caching.
 * State stores references (IDs), this hook resolves them on demand.
 */

import { useCallback, useRef, useState } from 'react';
import { useWSStore } from '../../stores/wsStore.js';

// ============================================================================
// Types
// ============================================================================

export interface MediaFile {
  id: string;
  filename: string;
  file_path: string;
  file_url: string;
  file_type: string;
  file_size: number;
  mime_type: string;
  owner_type: 'player' | 'npc' | 'system';
  owner_id?: string;
  category: string;
  tags?: string[];
  npc_id?: string;
  conversation_id?: string;
  post_id?: string;
  width?: number;
  height?: number;
  generated_prompt?: string;
  description?: string;
  content_rating?: string;
  metadata?: Record<string, unknown>;
  created_at: number;
  uploaded_at?: number;
}

// ============================================================================
// Hook
// ============================================================================

export function useStudioAssets() {
  const request = useWSStore((state) => state.request);

  // Cache of resolved assets: ID -> MediaFile
  const assetCache = useRef<Map<string, MediaFile>>(new Map());

  // Version counter to trigger re-renders when cache updates
  const [cacheVersion, setCacheVersion] = useState(0);

  /**
   * Resolve a single asset ID to a MediaFile.
   * Returns from cache if available, otherwise fetches from server.
   */
  const resolveAsset = useCallback(
    async (id: string): Promise<MediaFile | null> => {
      // Check cache first
      if (assetCache.current.has(id)) {
        return assetCache.current.get(id)!;
      }

      try {
        const response = await request<{ id: string }, { file: MediaFile }>('media:get', { id });
        if (response && 'file' in response) {
          assetCache.current.set(id, response.file);
          setCacheVersion((v) => v + 1);
          return response.file;
        }
        return null;
      } catch (error) {
        console.warn(`[StudioAssets] Failed to resolve asset ${id}:`, error);
        return null;
      }
    },
    [request]
  );

  /**
   * Resolve multiple asset IDs in parallel.
   * Returns array of resolved MediaFiles (nulls filtered out).
   */
  const resolveAssets = useCallback(
    async (ids: string[]): Promise<MediaFile[]> => {
      if (ids.length === 0) return [];

      // Split into cached and uncached
      const cached: MediaFile[] = [];
      const uncachedIds: string[] = [];

      for (const id of ids) {
        const cachedAsset = assetCache.current.get(id);
        if (cachedAsset) {
          cached.push(cachedAsset);
        } else {
          uncachedIds.push(id);
        }
      }

      // Fetch uncached in parallel
      if (uncachedIds.length > 0) {
        const fetched = await Promise.all(uncachedIds.map(resolveAsset));
        const validFetched = fetched.filter((f): f is MediaFile => f !== null);
        return [...cached, ...validFetched];
      }

      return cached;
    },
    [resolveAsset]
  );

  /**
   * Get a cached asset synchronously.
   * Returns null if not in cache (use resolveAsset to fetch).
   */
  const getCached = useCallback((id: string): MediaFile | null => {
    return assetCache.current.get(id) ?? null;
  }, []);

  /**
   * Get multiple cached assets synchronously.
   * Returns only assets that are in cache.
   */
  const getCachedMany = useCallback((ids: string[]): MediaFile[] => {
    return ids.map((id) => assetCache.current.get(id)).filter((f): f is MediaFile => f !== undefined);
  }, []);

  /**
   * Invalidate a cached asset (e.g., after update or delete).
   */
  const invalidate = useCallback((id: string) => {
    if (assetCache.current.has(id)) {
      assetCache.current.delete(id);
      setCacheVersion((v) => v + 1);
    }
  }, []);

  /**
   * Invalidate multiple cached assets.
   */
  const invalidateMany = useCallback((ids: string[]) => {
    let changed = false;
    for (const id of ids) {
      if (assetCache.current.has(id)) {
        assetCache.current.delete(id);
        changed = true;
      }
    }
    if (changed) {
      setCacheVersion((v) => v + 1);
    }
  }, []);

  /**
   * Clear entire cache.
   */
  const clearCache = useCallback(() => {
    assetCache.current.clear();
    setCacheVersion((v) => v + 1);
  }, []);

  /**
   * Pre-populate cache with assets (e.g., from a list fetch).
   */
  const populateCache = useCallback((assets: MediaFile[]) => {
    let changed = false;
    for (const asset of assets) {
      if (!assetCache.current.has(asset.id)) {
        assetCache.current.set(asset.id, asset);
        changed = true;
      }
    }
    if (changed) {
      setCacheVersion((v) => v + 1);
    }
  }, []);

  return {
    // Async resolution
    resolveAsset,
    resolveAssets,

    // Sync cache access
    getCached,
    getCachedMany,

    // Cache management
    invalidate,
    invalidateMany,
    clearCache,
    populateCache,

    // For dependency tracking in useMemo
    cacheVersion,
  };
}
