/**
 * Image Generator Mode
 *
 * AI-powered image generation with prompt input, style/mood selectors,
 * and results gallery.
 */

import { useState, useCallback } from 'react';
import { useStudio } from '../StudioContext.js';

export function ImageGeneratorMode() {
  const { state, dispatch, addToDraft } = useStudio();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    // TODO: Implement actual generation via WebSocket
    // For now, just simulate
    setTimeout(() => {
      setIsGenerating(false);
      setPrompt('');
    }, 2000);
  }, [prompt, isGenerating]);

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

        {/* Style & Mood Selectors (placeholder) */}
        <div className="flex gap-4">
          <div className="flex-1">
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--color-text)' }}
            >
              Style
            </label>
            <select
              className="w-full px-3 py-2 rounded"
              style={{
                background: 'var(--color-bgSecondary)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text)',
              }}
            >
              <option value="">Default</option>
              <option value="realistic">Realistic</option>
              <option value="artistic">Artistic</option>
              <option value="anime">Anime</option>
              <option value="sketch">Sketch</option>
            </select>
          </div>
          <div className="flex-1">
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--color-text)' }}
            >
              Mood
            </label>
            <select
              className="w-full px-3 py-2 rounded"
              style={{
                background: 'var(--color-bgSecondary)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text)',
              }}
            >
              <option value="">Default</option>
              <option value="vibrant">Vibrant</option>
              <option value="moody">Moody</option>
              <option value="calm">Calm</option>
              <option value="energetic">Energetic</option>
            </select>
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={!prompt.trim() || isGenerating}
          className="w-full py-3 rounded-lg font-medium transition-opacity"
          style={{
            background: 'var(--color-primary)',
            color: '#fff',
            opacity: !prompt.trim() || isGenerating ? 0.5 : 1,
          }}
        >
          {isGenerating ? 'Generating...' : 'Generate Image'}
        </button>

        {/* Cost indicator */}
        {state.budget && (
          <p className="text-sm text-center" style={{ color: 'var(--color-textSecondary)' }}>
            Cost: ~${(state.budget.costPerImage / 100).toFixed(2)} per image
          </p>
        )}
      </div>

      {/* Recent Generations */}
      <div className="flex-1">
        <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--color-text)' }}>
          Recent Generations
        </h3>

        {state.recentGenerationIds.length === 0 ? (
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
            {/* TODO: Render actual generated images */}
            <div
              className="aspect-square rounded-lg"
              style={{ background: 'var(--color-bgSecondary)' }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default ImageGeneratorMode;
