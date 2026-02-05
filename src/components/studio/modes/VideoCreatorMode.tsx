/**
 * Video Creator Mode
 *
 * Integrates the ContentCreator wizard for video creation.
 * Saves video configs as first-class media items.
 */

import { useState, useCallback } from 'react';
import { useStudio } from '../StudioContext.js';
import { useWSStore } from '../../../stores/wsStore.js';
import {
  ContentCreator,
  type RenderConfig,
  type ContentIntent,
  type PlatformHint,
} from '../../ui/MediaRenderer/index.js';

// Platform configurations
const PLATFORMS: { id: PlatformHint; label: string; aspect: string; description: string }[] = [
  { id: 'instasnap_story', label: 'InstaSnap Story', aspect: '9:16', description: 'Vertical stories, up to 15s' },
  { id: 'instasnap_reel', label: 'InstaSnap Reel', aspect: '9:16', description: 'Vertical reels, up to 90s' },
  { id: 'vidtube_short', label: 'VidTube Short', aspect: '9:16', description: 'Vertical shorts, up to 60s' },
  { id: 'vidtube_video', label: 'VidTube Video', aspect: '16:9', description: 'Standard horizontal video' },
  { id: 'myface_story', label: 'MyFace Story', aspect: '9:16', description: 'Vertical stories' },
  { id: 'myface_post', label: 'MyFace Post', aspect: '1:1', description: 'Square post format' },
];

export function VideoCreatorMode() {
  const { dispatch, addToDraft, setMode } = useStudio();
  const request = useWSStore((s) => s.request);
  const connected = useWSStore((s) => s.connected);

  const [platform, setPlatform] = useState<PlatformHint>('instasnap_story');
  const [showCreator, setShowCreator] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePublish = useCallback(
    async (config: RenderConfig, intent: ContentIntent) => {
      if (!connected) {
        setError('Not connected to server');
        return;
      }

      setIsSaving(true);
      setError(null);

      try {
        // Save video config to server as a media item
        const response = await request<
          { config: RenderConfig; intent: ContentIntent },
          { mediaFileId: string; mediaFile: { id: string; file_url: string } }
        >('studio:saveVideoConfig', {
          config,
          intent,
        });

        if (response && response.mediaFileId) {
          // Add the video config to the current draft
          addToDraft(response.mediaFileId);
          // Switch to compose mode so user can create a post with it
          setMode('compose');
        }

        setShowCreator(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to save video');
      } finally {
        setIsSaving(false);
      }
    },
    [connected, request, addToDraft, setMode]
  );

  const handleCancel = useCallback(() => {
    setShowCreator(false);
  }, []);

  const selectedPlatform = PLATFORMS.find((p) => p.id === platform);

  // Show ContentCreator in full-screen mode when active
  if (showCreator) {
    return (
      <div className="h-full relative">
        <ContentCreator
          platform={platform}
          onPublish={handlePublish}
          onCancel={handleCancel}
        />
        {isSaving && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.5)' }}
          >
            <div
              className="px-6 py-4 rounded-lg"
              style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}
            >
              Saving video...
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-6 overflow-y-auto">
      {/* Platform Selector */}
      <div className="mb-6">
        <label
          className="block text-sm font-medium mb-3"
          style={{ color: 'var(--color-text)' }}
        >
          Choose Target Platform
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
                className="text-sm mt-1 flex items-center gap-2"
                style={{ opacity: 0.7 }}
              >
                <span className="px-1.5 py-0.5 rounded text-xs" style={{
                  background: platform === p.id ? 'rgba(255,255,255,0.2)' : 'var(--color-bg)',
                }}>
                  {p.aspect}
                </span>
                <span>{p.description}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div
          className="mb-4 p-3 rounded"
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#ef4444',
          }}
        >
          {error}
        </div>
      )}

      {/* Create Button */}
      <button
        onClick={() => setShowCreator(true)}
        disabled={!connected}
        className="w-full py-4 rounded-lg font-medium text-lg transition-opacity"
        style={{
          background: 'var(--color-primary)',
          color: '#fff',
          opacity: !connected ? 0.5 : 1,
        }}
      >
        Create {selectedPlatform?.label} Content
      </button>

      {/* Info Section */}
      <div
        className="mt-6 p-4 rounded-lg"
        style={{
          background: 'var(--color-bgSecondary)',
          border: '1px solid var(--color-border)',
        }}
      >
        <h3 className="font-medium mb-2" style={{ color: 'var(--color-text)' }}>
          How Video Creation Works
        </h3>
        <ul className="text-sm space-y-2" style={{ color: 'var(--color-textSecondary)' }}>
          <li>1. <strong>Choose your intent</strong> - What emotion or message?</li>
          <li>2. <strong>Pick a style</strong> - Background, effects, and text style</li>
          <li>3. <strong>Add your text</strong> - With timing and animations</li>
          <li>4. <strong>Preview & publish</strong> - See the result before saving</li>
        </ul>
        <p className="text-sm mt-3" style={{ color: 'var(--color-textSecondary)' }}>
          Videos are saved to your library and can be used in posts across all platforms.
        </p>
      </div>

      {/* Recent Videos Section (placeholder) */}
      <div className="mt-6">
        <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--color-text)' }}>
          Recent Video Configs
        </h3>
        <div
          className="text-center py-8 rounded-lg"
          style={{
            background: 'var(--color-bgSecondary)',
            border: '1px dashed var(--color-border)',
          }}
        >
          <p style={{ color: 'var(--color-textSecondary)' }}>
            No video configs yet.
          </p>
          <p className="text-sm mt-1" style={{ color: 'var(--color-textSecondary)' }}>
            Create your first video to see it here.
          </p>
        </div>
      </div>
    </div>
  );
}

export default VideoCreatorMode;
