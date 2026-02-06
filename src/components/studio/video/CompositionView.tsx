/**
 * Composition View
 *
 * Center workspace for video mode. Contains:
 * - Centered MediaRenderer preview (aspect-ratio correct)
 * - Transport bar (play/pause/seek/loop)
 * - Timeline (layer rows + playhead)
 */

import { useMemo } from 'react';
import { MediaRenderer } from '../../ui/MediaRenderer/MediaRenderer.js';
import { useVideoComposition } from '../hooks/useVideoComposition.js';
import { TransportBar } from './TransportBar.js';
import { VideoTimeline } from './VideoTimeline.js';

export function CompositionView() {
  const { composition, renderConfig } = useVideoComposition();

  // Build a "live" config that tracks the composition's currentTime
  // MediaRenderer handles its own animation, but we sync isPlaying state
  const liveConfig = useMemo(() => ({
    ...renderConfig,
    // Intent is informational, not needed by renderer
  }), [renderConfig]);

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--studio-bg, #1e1e1e)' }}>
      {/* Preview Area */}
      <div
        className="flex-1 flex items-center justify-center overflow-hidden"
        style={{
          minHeight: 0,
          background: 'var(--studio-bg-darkest, #1a1a1a)',
        }}
      >
        <div
          style={{
            aspectRatio: renderConfig.viewport.aspect.replace(':', '/'),
            maxHeight: '100%',
            maxWidth: '100%',
            height: '100%',
            width: 'auto',
            position: 'relative',
          }}
        >
          <MediaRenderer
            config={liveConfig}
            autoplay={composition.isPlaying}
            controls={false}
            className="w-full h-full"
          />
        </div>
      </div>

      {/* Transport */}
      <TransportBar />

      {/* Timeline */}
      <VideoTimeline />
    </div>
  );
}
