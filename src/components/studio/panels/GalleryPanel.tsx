/**
 * Gallery Panel
 *
 * Recent generations grid with "Add to Post" action.
 * Extracted from ImageGeneratorMode.
 */

import { useState, useEffect } from 'react';
import { useStudio } from '../StudioContext.js';
import { useStudioAssets, type MediaFile } from '../useStudioAssets.js';

export function GalleryPanel() {
  const { state, addToDraft } = useStudio();
  const { getCachedMany } = useStudioAssets();
  const [recentImages, setRecentImages] = useState<MediaFile[]>([]);

  useEffect(() => {
    if (state.recentGenerationIds.length === 0) {
      setRecentImages([]);
      return;
    }
    const cached = getCachedMany(state.recentGenerationIds);
    setRecentImages(cached);
  }, [state.recentGenerationIds, getCachedMany]);

  if (recentImages.length === 0) {
    return (
      <div
        className="rounded px-2 py-4 text-center"
        style={{
          background: 'var(--studio-bg)',
          color: 'var(--studio-text-muted)',
          fontSize: '11px',
        }}
      >
        No generations yet
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-1">
      {recentImages.map((image) => (
        <button
          key={image.id}
          onClick={() => addToDraft(image.id)}
          className="aspect-square rounded overflow-hidden relative group"
          style={{ background: 'var(--studio-bg)' }}
          title={image.generated_prompt || 'Add to post'}
        >
          <img
            src={image.file_url}
            alt={image.description || 'Generated'}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div
            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background: 'rgba(0,0,0,0.6)' }}
          >
            <span style={{ color: '#fff', fontSize: '10px' }}>+ Draft</span>
          </div>
        </button>
      ))}
    </div>
  );
}
