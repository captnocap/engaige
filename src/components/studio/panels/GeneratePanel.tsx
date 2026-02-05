/**
 * Generate Panel
 *
 * Prompt textarea, style/mood selects, generate button, cost indicator.
 * Extracted from ImageGeneratorMode.
 */

import { useState, useCallback } from 'react';
import { useStudio } from '../StudioContext.js';
import { useWSStore } from '../../../stores/wsStore.js';
import { useStudioAssets, type MediaFile } from '../useStudioAssets.js';
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

export function GeneratePanel() {
  const { state, dispatch } = useStudio();
  const { populateCache } = useStudioAssets();
  const request = useWSStore((s) => s.request);
  const connected = useWSStore((s) => s.connected);

  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('');
  const [mood, setMood] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim() || isGenerating || !connected) return;

    setIsGenerating(true);
    setError(null);
    dispatch({ type: 'SET_PENDING_GENERATION', payload: { requestId: Date.now().toString(), prompt, startedAt: Date.now() } });

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
        populateCache([response.mediaFile]);
        dispatch({ type: 'ADD_RECENT_GENERATION', payload: response.mediaFile.id });
        setPrompt('');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Image generation failed');
    } finally {
      setIsGenerating(false);
      dispatch({ type: 'SET_PENDING_GENERATION', payload: null });
    }
  }, [prompt, style, mood, isGenerating, connected, request, dispatch, populateCache]);

  return (
    <div className="space-y-3">
      {/* Prompt */}
      <div>
        <label style={{ color: 'var(--studio-text-muted)', fontSize: '11px', display: 'block', marginBottom: 4 }}>
          Prompt
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your image..."
          className="w-full resize-none"
          style={{
            height: 64,
            background: 'var(--studio-bg)',
            border: '1px solid var(--studio-border)',
            color: 'var(--studio-text)',
            borderRadius: 3,
            padding: '6px 8px',
            fontSize: '12px',
          }}
        />
      </div>

      {/* Style */}
      <div>
        <label style={{ color: 'var(--studio-text-muted)', fontSize: '11px', display: 'block', marginBottom: 4 }}>
          Style
        </label>
        <Select
          value={style}
          onChange={(v) => setStyle(v)}
          options={STYLE_OPTIONS}
          placeholder="Default"
        />
      </div>

      {/* Mood */}
      <div>
        <label style={{ color: 'var(--studio-text-muted)', fontSize: '11px', display: 'block', marginBottom: 4 }}>
          Mood
        </label>
        <Select
          value={mood}
          onChange={(v) => setMood(v)}
          options={MOOD_OPTIONS}
          placeholder="Default"
        />
      </div>

      {/* Error */}
      {error && (
        <div style={{ color: 'var(--studio-error)', fontSize: '11px' }}>{error}</div>
      )}

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={!prompt.trim() || isGenerating || !connected}
        className="w-full py-2 rounded text-sm font-medium"
        style={{
          background: 'var(--studio-accent)',
          color: '#fff',
          border: 'none',
          cursor: !prompt.trim() || isGenerating || !connected ? 'default' : 'pointer',
          opacity: !prompt.trim() || isGenerating || !connected ? 0.5 : 1,
        }}
      >
        {isGenerating ? 'Generating...' : 'Generate'}
      </button>

      {/* Cost */}
      {state.budget && (
        <div style={{ color: 'var(--studio-text-muted)', fontSize: '10px', textAlign: 'center' }}>
          ~${(state.budget.costPerImage / 100).toFixed(2)}/image
        </div>
      )}
    </div>
  );
}
