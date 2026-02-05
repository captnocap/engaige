/**
 * Video Creator Mode
 *
 * Wraps the existing ContentCreator component for video creation.
 * Saves video configs as first-class media items.
 */

import { useState, useCallback } from 'react';
import { useStudio } from '../StudioContext.js';
// import { ContentCreator } from '../../ui/MediaRenderer/ContentCreator.js';
// import type { RenderConfig, ContentIntent } from '../../ui/MediaRenderer/types.js';

type PlatformType = 'instasnap_story' | 'instasnap_reel' | 'vidtube_short' | 'vidtube_video' | 'myface_story';

const PLATFORMS: { id: PlatformType; label: string; aspect: string }[] = [
  { id: 'instasnap_story', label: 'InstaSnap Story', aspect: '9:16' },
  { id: 'instasnap_reel', label: 'InstaSnap Reel', aspect: '9:16' },
  { id: 'vidtube_short', label: 'VidTube Short', aspect: '9:16' },
  { id: 'vidtube_video', label: 'VidTube Video', aspect: '16:9' },
  { id: 'myface_story', label: 'MyFace Story', aspect: '9:16' },
];

export function VideoCreatorMode() {
  const { dispatch, addToDraft } = useStudio();
  const [platform, setPlatform] = useState<PlatformType>('instasnap_story');
  const [showCreator, setShowCreator] = useState(false);

  const handlePublish = useCallback(
    async (config: unknown, intent: unknown) => {
      // TODO: Save video config as media item via WebSocket
      // const response = await request('studio:saveVideoConfig', { config, intent });
      // dispatch({ type: 'SET_VIDEO_CONFIG', payload: response.mediaFileId });
      // addToDraft(response.mediaFileId);
      setShowCreator(false);
    },
    [dispatch, addToDraft]
  );

  const selectedPlatform = PLATFORMS.find((p) => p.id === platform);

  return (
    <div className="h-full flex flex-col p-6 overflow-y-auto">
      {!showCreator ? (
        <>
          {/* Platform Selector */}
          <div className="mb-6">
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--color-text)' }}
            >
              Target Platform
            </label>
            <div className="grid grid-cols-2 gap-3">
              {PLATFORMS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPlatform(p.id)}
                  className="p-4 rounded-lg text-left transition-all"
                  style={{
                    background:
                      platform === p.id ? 'var(--color-primary)' : 'var(--color-bgSecondary)',
                    color: platform === p.id ? '#fff' : 'var(--color-text)',
                    border: `1px solid ${platform === p.id ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  }}
                >
                  <div className="font-medium">{p.label}</div>
                  <div
                    className="text-sm mt-1"
                    style={{
                      opacity: 0.7,
                    }}
                  >
                    {p.aspect}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Create Button */}
          <button
            onClick={() => setShowCreator(true)}
            className="w-full py-4 rounded-lg font-medium text-lg"
            style={{
              background: 'var(--color-primary)',
              color: '#fff',
            }}
          >
            Create {selectedPlatform?.label} Content
          </button>

          {/* Info */}
          <div
            className="mt-6 p-4 rounded-lg"
            style={{
              background: 'var(--color-bgSecondary)',
              border: '1px solid var(--color-border)',
            }}
          >
            <h3 className="font-medium mb-2" style={{ color: 'var(--color-text)' }}>
              About Video Creation
            </h3>
            <p className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
              Create animated video content with text overlays, effects, and backgrounds.
              Videos are rendered in real-time and can be used in posts across all platforms.
            </p>
          </div>
        </>
      ) : (
        <>
          {/* Back Button */}
          <button
            onClick={() => setShowCreator(false)}
            className="mb-4 px-4 py-2 rounded self-start"
            style={{
              background: 'var(--color-bgSecondary)',
              color: 'var(--color-text)',
              border: '1px solid var(--color-border)',
            }}
          >
            ← Back to Platform Selection
          </button>

          {/* ContentCreator would go here */}
          <div
            className="flex-1 flex items-center justify-center rounded-lg"
            style={{
              background: 'var(--color-bgSecondary)',
              border: '1px dashed var(--color-border)',
            }}
          >
            <div className="text-center">
              <p style={{ color: 'var(--color-textSecondary)' }}>
                ContentCreator component will be embedded here
              </p>
              <p className="text-sm mt-1" style={{ color: 'var(--color-textSecondary)' }}>
                Platform: {selectedPlatform?.label}
              </p>
              <button
                onClick={() => handlePublish({}, {})}
                className="mt-4 px-6 py-2 rounded"
                style={{
                  background: 'var(--color-primary)',
                  color: '#fff',
                }}
              >
                Save Video (placeholder)
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default VideoCreatorMode;
