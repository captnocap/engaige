/**
 * MediaRenderer Demo Page
 *
 * Test and preview different render configs.
 * Also serves as documentation for available effects.
 */

import { useState } from 'react';
import { MediaRenderer } from './MediaRenderer.js';
import { BASE_PRESETS, OVERLAY_PRESETS, TEXT_STYLE_PRESETS } from './presets.js';
import type { RenderConfig, BasePreset, OverlayPreset, TextStylePreset, AspectRatio } from './types.js';

const DEMO_CONFIGS: Record<string, RenderConfig> = {
  'Chill Vibes': {
    render_type: 'video',
    viewport: { aspect: '9:16', platform_hint: 'instasnap_story', fit: 'cover' },
    duration: 10,
    loop: true,
    layers: {
      base: { type: 'gradient', colors: ['#667eea', '#764ba2', '#6B8DD6'], angle: 135, animated: true },
      overlay: { effects: [{ type: 'film_grain', intensity: 0.2 }] },
      text: {
        segments: [
          { start: 0, text: 'vibes', position: 'center', enter_effect: 'fade_in', style: { size: 'huge', color: '#ffffff', shadow: true } },
        ],
      },
    },
  },
  'Chaos Energy': {
    render_type: 'video',
    viewport: { aspect: '9:16', platform_hint: 'vidtube_short', fit: 'cover' },
    duration: 8,
    loop: true,
    layers: {
      base: { type: 'effect', effect: 'noise_static', params: { intensity: 0.7 } },
      overlay: { effects: [{ type: 'glitch', intensity: 0.6 }, { type: 'chromatic_aberration', intensity: 0.4 }] },
      text: {
        segments: [
          { start: 0, text: 'OK SO', position: 'top', enter_effect: 'slam', style: { font: 'Impact', size: 'large', color: '#ff0000', stroke_color: '#000000', stroke_width: 3 } },
          { start: 1, text: 'LET ME TELL YOU', position: 'center', enter_effect: 'shake', style: { font: 'Impact', size: 'huge', color: '#ffff00', stroke_color: '#000000', stroke_width: 3 } },
          { start: 3, text: 'about this thing', position: 'bottom', enter_effect: 'typewriter', style: { size: 'medium', color: '#ffffff', shadow: true } },
        ],
      },
    },
  },
  'Aesthetic Post': {
    render_type: 'video',
    viewport: { aspect: '1:1', platform_hint: 'myface_post', fit: 'cover' },
    duration: 6,
    loop: true,
    layers: {
      base: { type: 'effect', effect: 'gradient_flow', params: { colors: ['#a8edea', '#fed6e3', '#d299c2'], speed: 0.3 } },
      overlay: { effects: [{ type: 'vignette', intensity: 0.3 }, { type: 'light_leak', intensity: 0.2 }] },
      text: {
        segments: [
          { start: 0, text: 'mood', position: 'center', enter_effect: 'fade_in', style: { font: 'Georgia, serif', size: 'large', color: '#2d3436', shadow: false } },
        ],
      },
    },
  },
  'Matrix Rain': {
    render_type: 'video',
    viewport: { aspect: '16:9', platform_hint: 'vidtube_video', fit: 'contain' },
    duration: 15,
    loop: true,
    layers: {
      base: { type: 'effect', effect: 'matrix_rain', params: { color: '#00ff00', speed: 1, density: 0.8 } },
      text: {
        segments: [
          { start: 0, text: 'Wake up, Neo...', position: 'center', enter_effect: 'typewriter', style: { font: 'monospace', size: 'large', color: '#00ff00' } },
          { start: 4, text: 'The Matrix has you', position: 'center', enter_effect: 'glitch', style: { font: 'monospace', size: 'medium', color: '#00ff00' } },
        ],
      },
    },
  },
  'Retro VHS': {
    render_type: 'video',
    viewport: { aspect: '4:3', platform_hint: 'vidtube_video', fit: 'contain', letterbox_color: '#1a1a1a' },
    duration: 10,
    loop: true,
    layers: {
      base: { type: 'effect', effect: 'plasma', params: { speed: 0.5 } },
      overlay: { effects: [{ type: 'vhs_noise', intensity: 0.5 }, { type: 'scan_lines', intensity: 0.4 }, { type: 'chromatic_aberration', intensity: 0.3 }] },
      text: {
        segments: [
          { start: 0, text: 'PLAY ▶', position: 'top', enter_effect: 'none', style: { font: 'monospace', size: 'small', color: '#ffffff' } },
          { start: 2, text: 'TRACKING...', position: 'bottom', enter_effect: 'fade_in', style: { font: 'monospace', size: 'small', color: '#cccccc' } },
        ],
      },
    },
  },
  'Starfield Journey': {
    render_type: 'video',
    viewport: { aspect: '16:9', platform_hint: 'vidtube_video', fit: 'cover' },
    duration: 20,
    loop: true,
    layers: {
      base: { type: 'effect', effect: 'starfield', params: { speed: 1.5, count: 150 } },
      text: {
        segments: [
          { start: 0, text: 'In a galaxy far, far away...', position: 'center', enter_effect: 'fade_in', style: { font: 'Georgia, serif', size: 'large', color: '#ffd700' } },
          { start: 5, text: '✨', position: 'center', enter_effect: 'zoom_in', style: { size: 'huge' } },
        ],
      },
    },
  },
  'Audio Visualizer': {
    render_type: 'video',
    viewport: { aspect: '16:9', platform_hint: 'vidtube_video', fit: 'cover' },
    duration: 15,
    loop: true,
    layers: {
      base: { type: 'effect', effect: 'audio_visualizer', params: { color: '#00ffff', bars: 32 } },
      text: {
        segments: [
          { start: 0, text: 'NOW PLAYING', position: 'top', enter_effect: 'slide_down', style: { size: 'small', color: '#ffffff', shadow: true } },
          { start: 1, text: 'Quantum Coffee Beats', position: 'center', enter_effect: 'bounce', style: { size: 'large', color: '#00ffff', shadow: true } },
        ],
      },
    },
  },
  'Rainy Day': {
    render_type: 'video',
    viewport: { aspect: '9:16', platform_hint: 'instasnap_story', fit: 'cover' },
    duration: 12,
    loop: true,
    layers: {
      base: { type: 'gradient', colors: ['#2c3e50', '#4a6572', '#2c3e50'], angle: 180, animated: true },
      overlay: { effects: [{ type: 'rain', intensity: 0.7 }, { type: 'vignette', intensity: 0.4 }] },
      text: {
        segments: [
          { start: 0, text: 'current mood:', position: 'top', enter_effect: 'fade_in', style: { size: 'small', color: '#94a3b8' } },
          { start: 1, text: '🌧️', position: 'center', enter_effect: 'float', style: { size: 'huge' } },
        ],
      },
    },
  },
};

export function MediaRendererDemo() {
  const [selectedDemo, setSelectedDemo] = useState<string>('Chill Vibes');
  const [customConfig, setCustomConfig] = useState<RenderConfig | null>(null);

  const activeConfig = customConfig ?? DEMO_CONFIGS[selectedDemo];

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-2xl font-bold mb-6">MediaRenderer Demo</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Preview */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Preview</h2>
          <div
            className="bg-black rounded-lg overflow-hidden"
            style={{
              aspectRatio: activeConfig.viewport.aspect.replace(':', '/'),
              maxHeight: '70vh',
            }}
          >
            <MediaRenderer
              key={selectedDemo + (customConfig ? '-custom' : '')}
              config={activeConfig}
              autoplay
              controls
            />
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-6">
          {/* Demo Selector */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Presets</h2>
            <div className="flex flex-wrap gap-2">
              {Object.keys(DEMO_CONFIGS).map((name) => (
                <button
                  key={name}
                  onClick={() => {
                    setSelectedDemo(name);
                    setCustomConfig(null);
                  }}
                  className={`px-3 py-1.5 rounded text-sm transition-colors ${
                    selectedDemo === name && !customConfig
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Customizer */}
          <QuickCustomizer
            onConfigChange={setCustomConfig}
            currentConfig={activeConfig}
          />

          {/* Config JSON */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Config JSON</h2>
            <pre className="bg-gray-800 p-4 rounded-lg text-xs overflow-auto max-h-64">
              {JSON.stringify(activeConfig, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Quick Customizer
// ============================================================================

interface QuickCustomizerProps {
  onConfigChange: (config: RenderConfig) => void;
  currentConfig: RenderConfig;
}

function QuickCustomizer({ onConfigChange, currentConfig }: QuickCustomizerProps) {
  const [basePreset, setBasePreset] = useState<BasePreset>('chill_gradient');
  const [overlayPreset, setOverlayPreset] = useState<OverlayPreset>('clean');
  const [textPreset, setTextPreset] = useState<TextStylePreset>('tiktok_caption');
  const [aspect, setAspect] = useState<AspectRatio>('9:16');
  const [text, setText] = useState('your text here');
  const [duration, setDuration] = useState(10);

  const applyCustom = () => {
    const baseLayer = BASE_PRESETS[basePreset];
    const overlayLayer = OVERLAY_PRESETS[overlayPreset];
    const textStyle = TEXT_STYLE_PRESETS[textPreset];

    const config: RenderConfig = {
      render_type: 'video',
      viewport: { aspect, fit: 'cover' },
      duration,
      loop: true,
      layers: {
        base: baseLayer,
        overlay: overlayLayer.effects.length > 0 ? overlayLayer : undefined,
        text: {
          default_style: textStyle,
          segments: [
            { start: 0, text, position: 'center', enter_effect: 'fade_in' },
          ],
        },
      },
    };

    onConfigChange(config);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Quick Customizer</h2>

      <div className="grid grid-cols-2 gap-4">
        {/* Base Preset */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">Base</label>
          <select
            value={basePreset}
            onChange={(e) => setBasePreset(e.target.value as BasePreset)}
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
          >
            {Object.keys(BASE_PRESETS).map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>

        {/* Overlay Preset */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">Overlay</label>
          <select
            value={overlayPreset}
            onChange={(e) => setOverlayPreset(e.target.value as OverlayPreset)}
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
          >
            {Object.keys(OVERLAY_PRESETS).map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>

        {/* Text Style */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">Text Style</label>
          <select
            value={textPreset}
            onChange={(e) => setTextPreset(e.target.value as TextStylePreset)}
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
          >
            {Object.keys(TEXT_STYLE_PRESETS).map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>

        {/* Aspect Ratio */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">Aspect Ratio</label>
          <select
            value={aspect}
            onChange={(e) => setAspect(e.target.value as AspectRatio)}
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
          >
            <option value="1:1">1:1 (Square)</option>
            <option value="4:5">4:5 (Portrait)</option>
            <option value="9:16">9:16 (Story)</option>
            <option value="16:9">16:9 (Landscape)</option>
            <option value="4:3">4:3 (Classic)</option>
          </select>
        </div>
      </div>

      {/* Text Input */}
      <div>
        <label className="block text-sm text-gray-400 mb-1">Text</label>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
          placeholder="Enter your text..."
        />
      </div>

      {/* Duration */}
      <div>
        <label className="block text-sm text-gray-400 mb-1">Duration: {duration}s</label>
        <input
          type="range"
          min={3}
          max={30}
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          className="w-full"
        />
      </div>

      <button
        onClick={applyCustom}
        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 rounded transition-colors"
      >
        Apply Custom Config
      </button>
    </div>
  );
}

export default MediaRendererDemo;
