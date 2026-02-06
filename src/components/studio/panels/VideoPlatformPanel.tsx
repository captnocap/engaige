/**
 * Video Platform Panel
 *
 * Sidebar panel for selecting the target platform.
 * Changes platform → updates duration/maxDuration defaults.
 * Includes Publish button at bottom.
 */

import { useState, useCallback } from 'react';
import { useVideoComposition, PLATFORM_DEFAULTS } from '../hooks/useVideoComposition.js';
import type { PlatformHint } from '../../ui/MediaRenderer/types.js';

// ============================================================================
// Data
// ============================================================================

const PLATFORMS: { id: PlatformHint; label: string; aspect: string; description: string }[] = [
  { id: 'instasnap_story', label: 'InstaSnap Story', aspect: '9:16', description: 'Vertical, up to 15s' },
  { id: 'instasnap_reel', label: 'InstaSnap Reel', aspect: '9:16', description: 'Vertical, up to 90s' },
  { id: 'vidtube_short', label: 'VidTube Short', aspect: '9:16', description: 'Vertical, up to 60s' },
  { id: 'vidtube_video', label: 'VidTube Video', aspect: '16:9', description: 'Horizontal' },
  { id: 'myface_story', label: 'MyFace Story', aspect: '9:16', description: 'Vertical stories' },
  { id: 'myface_post', label: 'MyFace Post', aspect: '1:1', description: 'Square format' },
];

// ============================================================================
// Component
// ============================================================================

export function VideoPlatformPanel() {
  const { composition, setPlatform, handlePublish, connected } = useVideoComposition();
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onPublish = useCallback(async () => {
    if (!connected) {
      setError('Not connected to server');
      return;
    }
    setIsPublishing(true);
    setError(null);
    const success = await handlePublish();
    setIsPublishing(false);
    if (!success) {
      setError('Failed to save video');
    }
  }, [connected, handlePublish]);

  return (
    <div className="space-y-2">
      {/* Platform list */}
      {PLATFORMS.map((p) => {
        const isActive = composition.platform === p.id;
        return (
          <button
            key={p.id}
            onClick={() => setPlatform(p.id)}
            className="w-full text-left px-2.5 py-2 rounded transition-colors"
            style={{
              background: isActive ? 'var(--studio-accent, #4a6cf7)' : 'var(--studio-bg-darkest, #1a1a1a)',
              color: isActive ? '#fff' : 'var(--studio-text, #ccc)',
              border: `1px solid ${isActive ? 'var(--studio-accent, #4a6cf7)' : 'var(--studio-border-subtle, #333)'}`,
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">{p.label}</span>
              <span
                className="text-xs px-1 py-0.5 rounded"
                style={{
                  background: isActive ? 'rgba(255,255,255,0.2)' : 'var(--studio-panel, #252525)',
                  fontSize: 9,
                }}
              >
                {p.aspect}
              </span>
            </div>
            <div className="text-xs mt-0.5" style={{ opacity: 0.6 }}>
              {p.description}
            </div>
          </button>
        );
      })}

      {/* Error */}
      {error && (
        <div
          className="text-xs px-2 py-1.5 rounded"
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#ef4444',
          }}
        >
          {error}
        </div>
      )}

      {/* Publish button */}
      <button
        onClick={onPublish}
        disabled={!connected || isPublishing}
        className="w-full py-2 rounded text-xs font-medium transition-opacity"
        style={{
          background: 'var(--studio-accent, #4a6cf7)',
          color: '#fff',
          opacity: !connected || isPublishing ? 0.5 : 1,
        }}
      >
        {isPublishing ? 'Publishing...' : 'Publish'}
      </button>
    </div>
  );
}
