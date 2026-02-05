/**
 * Image Generator Mode
 *
 * AI-powered image generation with prompt input, style/mood selectors,
 * and results gallery.
 */

import { useState, useCallback, useEffect } from 'react';
import { useStudio } from '../StudioContext.js';
import { useStudioAssets, type MediaFile } from '../useStudioAssets.js';
import { useWSStore } from '../../../stores/wsStore.js';
import { Select } from '../../ui/Select.js';

const STYLE_OPTIONS = [
  { value: '', label: 'Default' },
  { value: 'realistic', label: 'Realistic' },
  { value: 'artistic', label: 'Artistic' },
  { value: 'anime', label: 'Anime' },
  { value: 'sketch', label: 'Sketch' },
  { value: 'digital art', label: 'Digital Art' },
  { value: 'oil painting', label: 'Oil Painting' },
  { value: 'watercolor', label: 'Watercolor' },
];

const MOOD_OPTIONS = [
  { value: '', label: 'Default' },
  { value: 'vibrant', label: 'Vibrant' },
  { value: 'moody', label: 'Moody' },
  { value: 'calm', label: 'Calm' },
  { value: 'energetic', label: 'Energetic' },
  { value: 'dramatic', label: 'Dramatic' },
  { value: 'ethereal', label: 'Ethereal' },
  { value: 'nostalgic', label: 'Nostalgic' },
];

export function ImageGeneratorMode() {
  const { state, dispatch, addToDraft } = useStudio();
  const { getCachedMany, populateCache } = useStudioAssets();
  const request = useWSStore((s) => s.request);
  const connected = useWSStore((s) => s.connected);

  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('');
  const [mood, setMood] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim() || isGenerating || !connected) return;

    setIsGenerating(true);
    setError(null);
    dispatch({ type: 'SET_PENDING_GENERATION', payload: { requestId: Date.now().toString(), prompt } });

    try {
      const response = await request<
        { prompt: string; style?: string; mood?: string },
        { mediaFile: MediaFile; promptUsed: string }
      >('studio:generateImage', {
        prompt: prompt.trim(),
        style: style || undefined,
        mood: mood || undefined,
      });

      if (response && response.mediaFile) {
        // Cache the new media file
        populateCache([response.mediaFile]);
        // Add to recent generations
        dispatch({ type: 'ADD_RECENT_GENERATION', payload: response.mediaFile.id });
        // Clear prompt on success
        setPrompt('');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Image generation failed');
    } finally {
      setIsGenerating(false);
      dispatch({ type: 'SET_PENDING_GENERATION', payload: null });
    }
  }, [prompt, style, mood, isGenerating, connected, request, dispatch, populateCache]);

  const handleAddToDraft = useCallback((imageId: string) => {
    addToDraft(imageId);
  }, [addToDraft]);

  return (
    <div className="h-full flex flex-col p-6 overflow-y-auto">
      {/* Prompt Input */}
      <div className="space-y-4 mb-6">
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: 'var(--color-text)' }}
          >
            Describe your image
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="A serene mountain landscape at sunset with purple clouds..."
            className="w-full h-24 px-4 py-3 rounded-lg resize-none"
            style={{
              background: 'var(--color-bgSecondary)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text)',
            }}
          />
        </div>

        {/* Style & Mood Selectors */}
        <div className="flex gap-4">
          <div className="flex-1">
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--color-text)' }}
            >
              Style
            </label>
            <Select
              value={style}
              onChange={(v) => setStyle(v)}
              options={STYLE_OPTIONS}
              placeholder="Select style"
            />
          </div>
          <div className="flex-1">
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--color-text)' }}
            >
              Mood
            </label>
            <Select
              value={mood}
              onChange={(v) => setMood(v)}
              options={MOOD_OPTIONS}
              placeholder="Select mood"
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div
            className="p-3 rounded"
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444',
            }}
          >
            {error}
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={!prompt.trim() || isGenerating || !connected}
          className="w-full py-3 rounded-lg font-medium transition-opacity"
          style={{
            background: 'var(--color-primary)',
            color: '#fff',
            opacity: !prompt.trim() || isGenerating || !connected ? 0.5 : 1,
          }}
        >
          {isGenerating ? 'Generating...' : 'Generate Image'}
        </button>

        {/* Cost indicator */}
        {state.budget && (
          <p className="text-sm text-center" style={{ color: 'var(--color-textSecondary)' }}>
            Cost: ~${(state.budget.costPerImage / 100).toFixed(2)} per image
            {state.budget.remaining > 0 && (
              <span> (${(state.budget.remaining / 100).toFixed(2)} remaining)</span>
            )}
          </p>
        )}
      </div>

      {/* Recent Generations */}
      <div className="flex-1">
        <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--color-text)' }}>
          Recent Generations
        </h3>

        {recentImages.length === 0 ? (
          <div
            className="text-center py-12 rounded-lg"
            style={{
              background: 'var(--color-bgSecondary)',
              border: '1px dashed var(--color-border)',
            }}
          >
            <p style={{ color: 'var(--color-textSecondary)' }}>
              No images generated yet.
            </p>
            <p className="text-sm mt-1" style={{ color: 'var(--color-textSecondary)' }}>
              Enter a prompt above to get started.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {recentImages.map((image) => (
              <div
                key={image.id}
                className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer"
                style={{ background: 'var(--color-bgSecondary)' }}
                onClick={() => handleAddToDraft(image.id)}
              >
                <img
                  src={image.file_url}
                  alt={image.description || 'Generated image'}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {/* Hover overlay */}
                <div
                  className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: 'rgba(0,0,0,0.6)' }}
                >
                  <span className="text-white text-sm font-medium px-3 py-1 rounded"
                    style={{ background: 'var(--color-primary)' }}>
                    Add to Post
                  </span>
                </div>
                {/* Prompt tooltip */}
                {image.generated_prompt && (
                  <div
                    className="absolute bottom-0 left-0 right-0 p-2 text-xs truncate"
                    style={{
                      background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                      color: '#fff',
                    }}
                  >
                    {image.generated_prompt}
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

export default ImageGeneratorMode;
