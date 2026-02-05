/**
 * Image Generator Mode
 *
 * When activeMode === 'generate': workspace shows large preview
 * of the latest generation. Generation controls are in the
 * GeneratePanel sidebar panel.
 */

import { useState, useEffect } from 'react';
import { useStudio } from '../StudioContext.js';
import { useStudioAssets, type MediaFile } from '../useStudioAssets.js';

export function ImageGeneratorMode() {
  const { state, addToDraft } = useStudio();
  const { getCachedMany } = useStudioAssets();
  const [recentImages, setRecentImages] = useState<MediaFile[]>([]);

  // Resolve recent generation IDs to actual media files
  useEffect(() => {
    if (state.recentGenerationIds.length === 0) {
      setRecentImages([]);
      return;
    }
    const cached = getCachedMany(state.recentGenerationIds);
    setRecentImages(cached);
  }, [state.recentGenerationIds, getCachedMany]);

  const latestImage = recentImages[0] || null;

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 overflow-y-auto">
      {latestImage ? (
        /* Latest generation preview */
        <div className="max-w-lg w-full">
          <div
            className="rounded-lg overflow-hidden"
            style={{
              background: 'var(--studio-panel)',
              boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
            }}
          >
            <img
              src={latestImage.file_url}
              alt={latestImage.description || 'Generated image'}
              className="w-full"
              style={{ display: 'block' }}
            />
            {/* Info bar */}
            <div
              className="px-4 py-3 flex items-center justify-between"
              style={{ borderTop: '1px solid var(--studio-border-subtle)' }}
            >
              <span style={{ color: 'var(--studio-text-muted)', fontSize: '11px' }} className="truncate flex-1 mr-2">
                {latestImage.generated_prompt || latestImage.description || 'Generated image'}
              </span>
              <button
                onClick={() => addToDraft(latestImage.id)}
                className="px-3 py-1 rounded text-xs font-medium"
                style={{
                  background: 'var(--studio-accent)',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                Add to Post
              </button>
            </div>
          </div>

          {/* Previous generations */}
          {recentImages.length > 1 && (
            <div className="mt-4">
              <span style={{ color: 'var(--studio-text-muted)', fontSize: '11px', display: 'block', marginBottom: 6 }}>
                Previous Generations
              </span>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {recentImages.slice(1).map((image) => (
                  <button
                    key={image.id}
                    onClick={() => addToDraft(image.id)}
                    className="w-16 h-16 rounded overflow-hidden flex-shrink-0 hover:ring-2 ring-blue-500"
                    style={{
                      background: 'var(--studio-bg)',
                    }}
                  >
                    <img
                      src={image.file_url}
                      alt={image.description || 'Generated'}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Empty state */
        <div className="text-center">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: 'var(--studio-panel)' }}
          >
            <span style={{ fontSize: 40, opacity: 0.5 }}>&#10024;</span>
          </div>
          <p style={{ color: 'var(--studio-text-muted)', fontSize: '13px' }}>
            Enter a prompt in the Generate panel to create images.
          </p>
          <p style={{ color: 'var(--studio-text-muted)', fontSize: '11px', marginTop: 4 }}>
            Use the panel on the right to describe what you want.
          </p>
        </div>
      )}
    </div>
  );
}

export default ImageGeneratorMode;
