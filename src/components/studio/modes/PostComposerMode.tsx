/**
 * Post Composer Mode
 *
 * Multi-platform post composition with media selection,
 * caption editing, and platform previews.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useStudio } from '../StudioContext.js';
import { useStudioAssets, type MediaFile } from '../useStudioAssets.js';
import { useWSStore } from '../../../stores/wsStore.js';

// Character limits per platform
const PLATFORM_LIMITS: Record<string, number> = {
  myface: 280,
  chirp: 280,
  instasnap: 2200,
};

// Platform display info
const PLATFORMS: { id: 'myface' | 'chirp' | 'instasnap'; label: string; icon: string }[] = [
  { id: 'myface', label: 'MyFace', icon: '👤' },
  { id: 'chirp', label: 'Chirp', icon: '🐦' },
  { id: 'instasnap', label: 'InstaSnap', icon: '📸' },
];

export function PostComposerMode() {
  const { state, dispatch, setCaption, togglePlatform, clearDraft, setMode } = useStudio();
  const { resolveAssets, getCachedMany, cacheVersion } = useStudioAssets();
  const request = useWSStore((s) => s.request);

  const [resolvedMedia, setResolvedMedia] = useState<MediaFile[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);

  // Resolve media IDs to objects
  useEffect(() => {
    if (state.currentDraft.mediaIds.length === 0) {
      setResolvedMedia([]);
      return;
    }

    // Try cache first
    const cached = getCachedMany(state.currentDraft.mediaIds);
    if (cached.length === state.currentDraft.mediaIds.length) {
      setResolvedMedia(cached);
      return;
    }

    // Fetch missing
    resolveAssets(state.currentDraft.mediaIds).then(setResolvedMedia);
  }, [state.currentDraft.mediaIds, getCachedMany, resolveAssets, cacheVersion]);

  // Debounced caption for preview
  const [debouncedCaption, setDebouncedCaption] = useState(state.currentDraft.caption);
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedCaption(state.currentDraft.caption);
    }, 300);
    return () => clearTimeout(timeout);
  }, [state.currentDraft.caption]);

  // Character counts
  const charCounts = useMemo(() => {
    const len = debouncedCaption.length;
    return {
      myface: { count: len, limit: PLATFORM_LIMITS.myface, over: len > PLATFORM_LIMITS.myface },
      chirp: { count: len, limit: PLATFORM_LIMITS.chirp, over: len > PLATFORM_LIMITS.chirp },
      instasnap: { count: len, limit: PLATFORM_LIMITS.instasnap, over: len > PLATFORM_LIMITS.instasnap },
    };
  }, [debouncedCaption]);

  // Can post?
  const canPost = useMemo(() => {
    if (state.currentDraft.platforms.length === 0) return false;
    if (!state.currentDraft.caption.trim() && resolvedMedia.length === 0) return false;
    // Check char limits for selected platforms
    for (const p of state.currentDraft.platforms) {
      if (charCounts[p].over) return false;
    }
    return true;
  }, [state.currentDraft, resolvedMedia, charCounts]);

  const handlePost = useCallback(async () => {
    if (!canPost || isPosting) return;

    setIsPosting(true);
    setPostError(null);

    try {
      // Post to each selected platform
      for (const platform of state.currentDraft.platforms) {
        await request('social:createPost', {
          platform,
          content: state.currentDraft.caption,
          mediaUrls: resolvedMedia.map((m) => m.file_url),
        });
      }

      // Clear draft on success
      clearDraft();
    } catch (e) {
      setPostError(e instanceof Error ? e.message : 'Failed to post');
    } finally {
      setIsPosting(false);
    }
  }, [canPost, isPosting, state.currentDraft, resolvedMedia, request, clearDraft]);

  return (
    <div className="h-full flex flex-col p-6 overflow-y-auto">
      {/* Media Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
            Media
          </label>
          <button
            onClick={() => setMode('library')}
            className="text-sm px-3 py-1 rounded"
            style={{
              background: 'var(--color-bgSecondary)',
              color: 'var(--color-primary)',
              border: '1px solid var(--color-border)',
            }}
          >
            + Add from Library
          </button>
        </div>

        {resolvedMedia.length === 0 ? (
          <div
            className="p-8 rounded-lg text-center"
            style={{
              background: 'var(--color-bgSecondary)',
              border: '1px dashed var(--color-border)',
            }}
          >
            <p style={{ color: 'var(--color-textSecondary)' }}>No media selected</p>
            <p className="text-sm mt-1" style={{ color: 'var(--color-textSecondary)' }}>
              Add images or videos from your library
            </p>
          </div>
        ) : (
          <div className="flex gap-2 flex-wrap">
            {resolvedMedia.map((file) => (
              <div
                key={file.id}
                className="relative w-20 h-20 rounded overflow-hidden group"
                style={{ background: 'var(--color-bgSecondary)' }}
              >
                <img
                  src={file.file_url}
                  alt={file.filename}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => dispatch({ type: 'REMOVE_FROM_DRAFT', payload: file.id })}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: 'rgba(0,0,0,0.7)', color: '#fff' }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Caption */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
          Caption
        </label>
        <textarea
          value={state.currentDraft.caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full h-32 px-4 py-3 rounded-lg resize-none"
          style={{
            background: 'var(--color-bgSecondary)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text)',
          }}
        />
        {/* Character counts */}
        <div className="flex gap-4 mt-2 text-xs">
          {state.currentDraft.platforms.map((p) => {
            const info = charCounts[p];
            return (
              <span
                key={p}
                style={{
                  color: info.over ? 'var(--color-error, #ef4444)' : 'var(--color-textSecondary)',
                }}
              >
                {PLATFORMS.find((pl) => pl.id === p)?.label}: {info.count}/{info.limit}
              </span>
            );
          })}
        </div>
      </div>

      {/* Platforms */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
          Post to
        </label>
        <div className="flex gap-2">
          {PLATFORMS.map((p) => (
            <button
              key={p.id}
              onClick={() => togglePlatform(p.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all"
              style={{
                background: state.currentDraft.platforms.includes(p.id)
                  ? 'var(--color-primary)'
                  : 'var(--color-bgSecondary)',
                color: state.currentDraft.platforms.includes(p.id) ? '#fff' : 'var(--color-text)',
                border: `1px solid ${state.currentDraft.platforms.includes(p.id) ? 'var(--color-primary)' : 'var(--color-border)'}`,
              }}
            >
              <span>{p.icon}</span>
              <span>{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {postError && (
        <div
          className="mb-4 p-3 rounded"
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#ef4444',
          }}
        >
          {postError}
        </div>
      )}

      {/* Post Button */}
      <button
        onClick={handlePost}
        disabled={!canPost || isPosting}
        className="w-full py-3 rounded-lg font-medium transition-opacity"
        style={{
          background: 'var(--color-primary)',
          color: '#fff',
          opacity: !canPost || isPosting ? 0.5 : 1,
        }}
      >
        {isPosting
          ? 'Posting...'
          : `Post to ${state.currentDraft.platforms.length} platform${state.currentDraft.platforms.length !== 1 ? 's' : ''}`}
      </button>
    </div>
  );
}

export default PostComposerMode;
