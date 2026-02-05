/**
 * Publish Modal
 *
 * All PostComposerMode logic (media preview, caption, platform toggles,
 * char counts, post button) wrapped in a modal overlay.
 * Triggered from Menu > File > Publish or Ctrl+Shift+P.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useStudio } from '../StudioContext.js';
import { useStudioAssets, type MediaFile } from '../useStudioAssets.js';
import { useWSStore } from '../../../stores/wsStore.js';
import { CloseIcon } from '../icons/StudioIcons.js';

// Character limits per platform
const PLATFORM_LIMITS: Record<string, number> = {
  myface: 280,
  chirp: 280,
  instasnap: 2200,
};

const PLATFORMS: { id: 'myface' | 'chirp' | 'instasnap'; label: string }[] = [
  { id: 'myface', label: 'MyFace' },
  { id: 'chirp', label: 'Chirp' },
  { id: 'instasnap', label: 'InstaSnap' },
];

interface PublishModalProps {
  onClose: () => void;
}

export function PublishModal({ onClose }: PublishModalProps) {
  const { state, dispatch, setCaption, togglePlatform, clearDraft } = useStudio();
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
    const cached = getCachedMany(state.currentDraft.mediaIds);
    if (cached.length === state.currentDraft.mediaIds.length) {
      setResolvedMedia(cached);
      return;
    }
    resolveAssets(state.currentDraft.mediaIds).then(setResolvedMedia);
  }, [state.currentDraft.mediaIds, getCachedMany, resolveAssets, cacheVersion]);

  // Character counts
  const charCounts = useMemo(() => {
    const len = state.currentDraft.caption.length;
    return {
      myface: { count: len, limit: PLATFORM_LIMITS.myface, over: len > PLATFORM_LIMITS.myface },
      chirp: { count: len, limit: PLATFORM_LIMITS.chirp, over: len > PLATFORM_LIMITS.chirp },
      instasnap: { count: len, limit: PLATFORM_LIMITS.instasnap, over: len > PLATFORM_LIMITS.instasnap },
    };
  }, [state.currentDraft.caption]);

  const canPost = useMemo(() => {
    if (state.currentDraft.platforms.length === 0) return false;
    if (!state.currentDraft.caption.trim() && resolvedMedia.length === 0) return false;
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
      for (const platform of state.currentDraft.platforms) {
        await request('social:createPost', {
          platform,
          content: state.currentDraft.caption,
          mediaUrls: resolvedMedia.map((m) => m.file_url),
        });
      }
      clearDraft();
      onClose();
    } catch (e) {
      setPostError(e instanceof Error ? e.message : 'Failed to post');
    } finally {
      setIsPosting(false);
    }
  }, [canPost, isPosting, state.currentDraft, resolvedMedia, request, clearDraft, onClose]);

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
        className="w-[520px] max-h-[80%] rounded-lg overflow-hidden flex flex-col"
        style={{ background: 'var(--studio-panel)', border: '1px solid var(--studio-border)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ background: 'var(--studio-panel-header)', borderBottom: '1px solid var(--studio-border-subtle)' }}
        >
          <span style={{ color: 'var(--studio-text-bright)', fontWeight: 600, fontSize: '13px' }}>
            Publish to Feed
          </span>
          <button className="studio-toolbar-btn" onClick={onClose}>
            <CloseIcon size={14} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Media Preview */}
          {resolvedMedia.length > 0 && (
            <div>
              <label style={{ color: 'var(--studio-text-muted)', fontSize: '11px', display: 'block', marginBottom: 4 }}>
                Media
              </label>
              <div className="flex gap-2 flex-wrap">
                {resolvedMedia.map((file) => (
                  <div
                    key={file.id}
                    className="relative w-16 h-16 rounded overflow-hidden group"
                    style={{ background: 'var(--studio-bg)' }}
                  >
                    <img src={file.file_url} alt={file.filename} className="w-full h-full object-cover" />
                    <button
                      onClick={() => dispatch({ type: 'REMOVE_FROM_DRAFT', payload: file.id })}
                      className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100"
                      style={{ background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: '10px' }}
                    >
                      x
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Caption */}
          <div>
            <label style={{ color: 'var(--studio-text-muted)', fontSize: '11px', display: 'block', marginBottom: 4 }}>
              Caption
            </label>
            <textarea
              value={state.currentDraft.caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full resize-none"
              style={{
                height: 80,
                background: 'var(--studio-bg)',
                border: '1px solid var(--studio-border)',
                color: 'var(--studio-text)',
                borderRadius: 3,
                padding: '6px 8px',
                fontSize: '12px',
              }}
            />
            {/* Char counts */}
            <div className="flex gap-3 mt-1">
              {state.currentDraft.platforms.map((p) => {
                const info = charCounts[p];
                return (
                  <span
                    key={p}
                    style={{
                      fontSize: '10px',
                      color: info.over ? 'var(--studio-error)' : 'var(--studio-text-muted)',
                    }}
                  >
                    {PLATFORMS.find(pl => pl.id === p)?.label}: {info.count}/{info.limit}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Platforms */}
          <div>
            <label style={{ color: 'var(--studio-text-muted)', fontSize: '11px', display: 'block', marginBottom: 4 }}>
              Post to
            </label>
            <div className="flex gap-2">
              {PLATFORMS.map((p) => {
                const isActive = state.currentDraft.platforms.includes(p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => togglePlatform(p.id)}
                    className="px-3 py-1.5 rounded text-xs"
                    style={{
                      background: isActive ? 'var(--studio-accent)' : 'var(--studio-bg)',
                      color: isActive ? '#fff' : 'var(--studio-text)',
                      border: `1px solid ${isActive ? 'var(--studio-accent)' : 'var(--studio-border)'}`,
                      cursor: 'pointer',
                    }}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Error */}
          {postError && (
            <div style={{ color: 'var(--studio-error)', fontSize: '11px' }}>
              {postError}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="px-4 py-3 flex justify-end gap-2"
          style={{ borderTop: '1px solid var(--studio-border-subtle)' }}
        >
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded text-sm"
            style={{
              background: 'var(--studio-surface)',
              color: 'var(--studio-text)',
              border: '1px solid var(--studio-border)',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handlePost}
            disabled={!canPost || isPosting}
            className="px-4 py-1.5 rounded text-sm font-medium"
            style={{
              background: 'var(--studio-accent)',
              color: '#fff',
              border: 'none',
              cursor: !canPost || isPosting ? 'default' : 'pointer',
              opacity: !canPost || isPosting ? 0.5 : 1,
            }}
          >
            {isPosting
              ? 'Posting...'
              : `Publish to ${state.currentDraft.platforms.length} platform${state.currentDraft.platforms.length !== 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
}
