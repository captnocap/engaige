/**
 * ContentCreator
 *
 * In-game authoring tool for players to create their own content.
 * Used for InstaSnap stories, MyFace posts, etc.
 */

import { useState, useCallback } from 'react';
import { MediaRenderer } from './MediaRenderer.js';
import { BASE_PRESETS, OVERLAY_PRESETS, TEXT_STYLE_PRESETS, INTENT_STYLE_SUGGESTIONS } from './presets.js';
import type {
  RenderConfig,
  BasePreset,
  OverlayPreset,
  TextStylePreset,
  TextSegment,
  TextEffectType,
  AspectRatio,
  PlatformHint,
  IntentType,
  ContentIntent,
} from './types.js';

// ============================================================================
// Types
// ============================================================================

interface ContentCreatorProps {
  platform: PlatformHint;
  onPublish: (config: RenderConfig, intent: ContentIntent) => void;
  onCancel: () => void;
  initialConfig?: Partial<RenderConfig>;
}

interface TextSegmentEditor {
  id: string;
  text: string;
  start: number;
  position: 'top' | 'center' | 'bottom';
  effect: TextEffectType;
}

// ============================================================================
// Platform Defaults
// ============================================================================

const PLATFORM_DEFAULTS: Record<PlatformHint, { aspect: AspectRatio; duration: number; maxDuration: number }> = {
  instasnap_story: { aspect: '9:16', duration: 10, maxDuration: 15 },
  instasnap_post: { aspect: '1:1', duration: 10, maxDuration: 60 },
  instasnap_reel: { aspect: '9:16', duration: 30, maxDuration: 90 },
  vidtube_video: { aspect: '16:9', duration: 60, maxDuration: 300 },
  vidtube_short: { aspect: '9:16', duration: 30, maxDuration: 60 },
  myface_post: { aspect: '1:1', duration: 8, maxDuration: 30 },
  myface_story: { aspect: '9:16', duration: 10, maxDuration: 15 },
  threadit_embed: { aspect: '16:9', duration: 15, maxDuration: 60 },
  thumbnail: { aspect: '16:9', duration: 0, maxDuration: 0 },
};

const PLATFORM_NAMES: Record<PlatformHint, string> = {
  instasnap_story: 'InstaSnap Story',
  instasnap_post: 'InstaSnap Post',
  instasnap_reel: 'InstaSnap Reel',
  vidtube_video: 'VidTube Video',
  vidtube_short: 'VidTube Short',
  myface_post: 'MyFace Post',
  myface_story: 'MyFace Story',
  threadit_embed: 'Threadit Video',
  thumbnail: 'Thumbnail',
};

const INTENT_LABELS: Record<IntentType, { label: string; emoji: string }> = {
  share_joy: { label: 'Share Joy', emoji: '😊' },
  inform: { label: 'Inform', emoji: '📢' },
  entertain: { label: 'Entertain', emoji: '🎭' },
  create_art: { label: 'Create Art', emoji: '🎨' },
  promote: { label: 'Promote', emoji: '📣' },
  connect: { label: 'Connect', emoji: '🤝' },
  vent: { label: 'Vent', emoji: '😤' },
  cope: { label: 'Cope', emoji: '💭' },
  confess: { label: 'Confess', emoji: '🤫' },
  seek_validation: { label: 'Seek Validation', emoji: '🥺' },
  seek_advice: { label: 'Seek Advice', emoji: '❓' },
  subtweet: { label: 'Subtweet', emoji: '👀' },
  call_out: { label: 'Call Out', emoji: '📢' },
  flex: { label: 'Flex', emoji: '💪' },
  rage_bait: { label: 'Rage Bait', emoji: '🔥' },
  humble_brag: { label: 'Humble Brag', emoji: '😇' },
  pity_farm: { label: 'Pity Farm', emoji: '😢' },
  stir_drama: { label: 'Stir Drama', emoji: '🍿' },
  defend_self: { label: 'Defend Self', emoji: '🛡️' },
  clap_back: { label: 'Clap Back', emoji: '👏' },
  thirst_trap: { label: 'Thirst Trap', emoji: '🔥' },
  mark_territory: { label: 'Mark Territory', emoji: '💕' },
  make_jealous: { label: 'Make Jealous', emoji: '😏' },
  love_bomb: { label: 'Love Bomb', emoji: '💗' },
  soft_launch: { label: 'Soft Launch', emoji: '🌅' },
  hard_launch: { label: 'Hard Launch', emoji: '🚀' },
};

const TEXT_EFFECTS: { value: TextEffectType; label: string }[] = [
  { value: 'fade_in', label: 'Fade In' },
  { value: 'typewriter', label: 'Typewriter' },
  { value: 'slam', label: 'Slam' },
  { value: 'bounce', label: 'Bounce' },
  { value: 'slide_up', label: 'Slide Up' },
  { value: 'slide_down', label: 'Slide Down' },
  { value: 'zoom_in', label: 'Zoom In' },
  { value: 'shake', label: 'Shake' },
  { value: 'glitch', label: 'Glitch' },
  { value: 'rainbow', label: 'Rainbow' },
  { value: 'float', label: 'Float' },
];

// ============================================================================
// Main Component
// ============================================================================

export function ContentCreator({
  platform,
  onPublish,
  onCancel,
  initialConfig,
}: ContentCreatorProps) {
  const defaults = PLATFORM_DEFAULTS[platform];

  // State
  const [step, setStep] = useState<'intent' | 'style' | 'text' | 'preview'>('intent');

  // Intent
  const [intent, setIntent] = useState<IntentType>('share_joy');
  const [energy, setEnergy] = useState<'low' | 'medium' | 'high' | 'unhinged'>('medium');

  // Style
  const [basePreset, setBasePreset] = useState<BasePreset>('chill_gradient');
  const [overlayPreset, setOverlayPreset] = useState<OverlayPreset>('clean');
  const [textStylePreset, setTextStylePreset] = useState<TextStylePreset>('tiktok_caption');

  // Text segments
  const [segments, setSegments] = useState<TextSegmentEditor[]>([
    { id: '1', text: '', start: 0, position: 'center', effect: 'fade_in' },
  ]);

  // Duration
  const [duration, setDuration] = useState(defaults.duration);

  // Apply intent suggestion
  const applySuggestedStyle = useCallback(() => {
    const suggestion = INTENT_STYLE_SUGGESTIONS[intent];
    if (suggestion) {
      setBasePreset(suggestion.base);
      setOverlayPreset(suggestion.overlay);
      setTextStylePreset(suggestion.text);
    }
  }, [intent]);

  // Build config
  const buildConfig = useCallback((): RenderConfig => {
    const textSegments: TextSegment[] = segments
      .filter((s) => s.text.trim())
      .map((s) => ({
        start: s.start,
        text: s.text,
        position: s.position,
        enter_effect: s.effect,
      }));

    return {
      render_type: 'video',
      viewport: {
        aspect: defaults.aspect,
        platform_hint: platform,
        fit: 'cover',
      },
      duration,
      loop: true,
      layers: {
        base: BASE_PRESETS[basePreset],
        overlay: OVERLAY_PRESETS[overlayPreset].effects.length > 0
          ? OVERLAY_PRESETS[overlayPreset]
          : undefined,
        text: textSegments.length > 0
          ? {
              default_style: TEXT_STYLE_PRESETS[textStylePreset],
              segments: textSegments,
            }
          : undefined,
      },
    };
  }, [segments, basePreset, overlayPreset, textStylePreset, duration, defaults.aspect, platform]);

  // Build intent
  const buildIntent = useCallback((): ContentIntent => ({
    primary: intent,
    energy,
  }), [intent, energy]);

  // Handlers
  const handleAddSegment = () => {
    const lastSegment = segments[segments.length - 1];
    const newStart = lastSegment ? lastSegment.start + 2 : 0;
    setSegments([
      ...segments,
      {
        id: String(Date.now()),
        text: '',
        start: Math.min(newStart, duration - 1),
        position: 'center',
        effect: 'fade_in',
      },
    ]);
  };

  const handleRemoveSegment = (id: string) => {
    if (segments.length > 1) {
      setSegments(segments.filter((s) => s.id !== id));
    }
  };

  const handleUpdateSegment = (id: string, updates: Partial<TextSegmentEditor>) => {
    setSegments(segments.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const handlePublish = () => {
    onPublish(buildConfig(), buildIntent());
  };

  // Render steps
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Create {PLATFORM_NAMES[platform]}</h2>
            <p className="text-sm text-gray-400">
              Step {step === 'intent' ? 1 : step === 'style' ? 2 : step === 'text' ? 3 : 4} of 4
            </p>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-white p-2"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {step === 'intent' && (
            <IntentStep
              intent={intent}
              setIntent={setIntent}
              energy={energy}
              setEnergy={setEnergy}
            />
          )}

          {step === 'style' && (
            <StyleStep
              basePreset={basePreset}
              setBasePreset={setBasePreset}
              overlayPreset={overlayPreset}
              setOverlayPreset={setOverlayPreset}
              textStylePreset={textStylePreset}
              setTextStylePreset={setTextStylePreset}
              onApplySuggested={applySuggestedStyle}
              intent={intent}
            />
          )}

          {step === 'text' && (
            <TextStep
              segments={segments}
              duration={duration}
              setDuration={setDuration}
              maxDuration={defaults.maxDuration}
              onAddSegment={handleAddSegment}
              onRemoveSegment={handleRemoveSegment}
              onUpdateSegment={handleUpdateSegment}
            />
          )}

          {step === 'preview' && (
            <PreviewStep
              config={buildConfig()}
              intent={buildIntent()}
            />
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 flex justify-between">
          <button
            onClick={() => {
              if (step === 'intent') onCancel();
              else if (step === 'style') setStep('intent');
              else if (step === 'text') setStep('style');
              else setStep('text');
            }}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white"
          >
            {step === 'intent' ? 'Cancel' : 'Back'}
          </button>

          <button
            onClick={() => {
              if (step === 'intent') setStep('style');
              else if (step === 'style') setStep('text');
              else if (step === 'text') setStep('preview');
              else handlePublish();
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-white font-semibold"
          >
            {step === 'preview' ? 'Publish' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Step Components
// ============================================================================

interface IntentStepProps {
  intent: IntentType;
  setIntent: (i: IntentType) => void;
  energy: 'low' | 'medium' | 'high' | 'unhinged';
  setEnergy: (e: 'low' | 'medium' | 'high' | 'unhinged') => void;
}

function IntentStep({ intent, setIntent, energy, setEnergy }: IntentStepProps) {
  const categories = {
    'Positive': ['share_joy', 'inform', 'entertain', 'create_art', 'promote', 'connect'] as IntentType[],
    'Processing': ['vent', 'cope', 'confess', 'seek_validation', 'seek_advice'] as IntentType[],
    'Drama': ['subtweet', 'call_out', 'flex', 'rage_bait', 'humble_brag', 'pity_farm', 'stir_drama'] as IntentType[],
    'Relationship': ['thirst_trap', 'mark_territory', 'make_jealous', 'soft_launch', 'hard_launch'] as IntentType[],
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">What's your vibe?</h3>
        <p className="text-gray-400 text-sm">This helps set the mood and style suggestions.</p>
      </div>

      {Object.entries(categories).map(([category, intents]) => (
        <div key={category}>
          <h4 className="text-sm font-medium text-gray-400 mb-2">{category}</h4>
          <div className="flex flex-wrap gap-2">
            {intents.map((i) => {
              const { label, emoji } = INTENT_LABELS[i];
              return (
                <button
                  key={i}
                  onClick={() => setIntent(i)}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                    intent === i
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {emoji} {label}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div>
        <h4 className="text-sm font-medium text-gray-400 mb-2">Energy Level</h4>
        <div className="flex gap-2">
          {(['low', 'medium', 'high', 'unhinged'] as const).map((e) => (
            <button
              key={e}
              onClick={() => setEnergy(e)}
              className={`px-4 py-2 rounded-lg text-sm capitalize transition-colors ${
                energy === e
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {e === 'unhinged' ? '🌀 Unhinged' : e}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

interface StyleStepProps {
  basePreset: BasePreset;
  setBasePreset: (p: BasePreset) => void;
  overlayPreset: OverlayPreset;
  setOverlayPreset: (p: OverlayPreset) => void;
  textStylePreset: TextStylePreset;
  setTextStylePreset: (p: TextStylePreset) => void;
  onApplySuggested: () => void;
  intent: IntentType;
}

function StyleStep({
  basePreset,
  setBasePreset,
  overlayPreset,
  setOverlayPreset,
  textStylePreset,
  setTextStylePreset,
  onApplySuggested,
  intent,
}: StyleStepProps) {
  const suggestion = INTENT_STYLE_SUGGESTIONS[intent];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Choose your style</h3>
          <p className="text-gray-400 text-sm">Pick backgrounds, effects, and text style.</p>
        </div>
        <button
          onClick={onApplySuggested}
          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 rounded text-sm text-white"
        >
          ✨ Use suggested for "{INTENT_LABELS[intent].label}"
        </button>
      </div>

      {/* Base Preset */}
      <div>
        <h4 className="text-sm font-medium text-gray-400 mb-2">Background</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(Object.keys(BASE_PRESETS) as BasePreset[]).map((preset) => (
            <button
              key={preset}
              onClick={() => setBasePreset(preset)}
              className={`p-3 rounded-lg text-sm text-left transition-colors ${
                basePreset === preset
                  ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {preset.replace(/_/g, ' ')}
              {suggestion?.base === preset && ' ✨'}
            </button>
          ))}
        </div>
      </div>

      {/* Overlay Preset */}
      <div>
        <h4 className="text-sm font-medium text-gray-400 mb-2">Effects Overlay</h4>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {(Object.keys(OVERLAY_PRESETS) as OverlayPreset[]).map((preset) => (
            <button
              key={preset}
              onClick={() => setOverlayPreset(preset)}
              className={`p-3 rounded-lg text-sm transition-colors ${
                overlayPreset === preset
                  ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {preset.replace(/_/g, ' ')}
              {suggestion?.overlay === preset && ' ✨'}
            </button>
          ))}
        </div>
      </div>

      {/* Text Style Preset */}
      <div>
        <h4 className="text-sm font-medium text-gray-400 mb-2">Text Style</h4>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {(Object.keys(TEXT_STYLE_PRESETS) as TextStylePreset[]).map((preset) => (
            <button
              key={preset}
              onClick={() => setTextStylePreset(preset)}
              className={`p-3 rounded-lg text-sm transition-colors ${
                textStylePreset === preset
                  ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {preset.replace(/_/g, ' ')}
              {suggestion?.text === preset && ' ✨'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

interface TextStepProps {
  segments: TextSegmentEditor[];
  duration: number;
  setDuration: (d: number) => void;
  maxDuration: number;
  onAddSegment: () => void;
  onRemoveSegment: (id: string) => void;
  onUpdateSegment: (id: string, updates: Partial<TextSegmentEditor>) => void;
}

function TextStep({
  segments,
  duration,
  setDuration,
  maxDuration,
  onAddSegment,
  onRemoveSegment,
  onUpdateSegment,
}: TextStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white">Add your text</h3>
        <p className="text-gray-400 text-sm">Add text segments that appear at different times.</p>
      </div>

      {/* Duration */}
      <div>
        <label className="text-sm text-gray-400">Duration: {duration}s</label>
        <input
          type="range"
          min={3}
          max={maxDuration}
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          className="w-full mt-1"
        />
      </div>

      {/* Segments */}
      <div className="space-y-4">
        {segments.map((segment, index) => (
          <div key={segment.id} className="bg-gray-800 p-4 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Segment {index + 1}</span>
              {segments.length > 1 && (
                <button
                  onClick={() => onRemoveSegment(segment.id)}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  Remove
                </button>
              )}
            </div>

            <input
              type="text"
              value={segment.text}
              onChange={(e) => onUpdateSegment(segment.id, { text: e.target.value })}
              placeholder="Enter text..."
              className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white"
            />

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-xs text-gray-500">Start (s)</label>
                <input
                  type="number"
                  min={0}
                  max={duration - 1}
                  value={segment.start}
                  onChange={(e) => onUpdateSegment(segment.id, { start: Number(e.target.value) })}
                  className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-white"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Position</label>
                <select
                  value={segment.position}
                  onChange={(e) => onUpdateSegment(segment.id, { position: e.target.value as 'top' | 'center' | 'bottom' })}
                  className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-white"
                >
                  <option value="top">Top</option>
                  <option value="center">Center</option>
                  <option value="bottom">Bottom</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500">Effect</label>
                <select
                  value={segment.effect}
                  onChange={(e) => onUpdateSegment(segment.id, { effect: e.target.value as TextEffectType })}
                  className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-white"
                >
                  {TEXT_EFFECTS.map((effect) => (
                    <option key={effect.value} value={effect.value}>
                      {effect.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={onAddSegment}
          className="w-full py-2 border-2 border-dashed border-gray-700 rounded-lg text-gray-400 hover:border-gray-500 hover:text-gray-300 transition-colors"
        >
          + Add Text Segment
        </button>
      </div>
    </div>
  );
}

interface PreviewStepProps {
  config: RenderConfig;
  intent: ContentIntent;
}

function PreviewStep({ config, intent }: PreviewStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white">Preview</h3>
        <p className="text-gray-400 text-sm">
          Ready to publish? Here's how it will look.
        </p>
      </div>

      <div className="flex justify-center">
        <div
          className="bg-black rounded-lg overflow-hidden"
          style={{
            aspectRatio: config.viewport.aspect.replace(':', '/'),
            maxHeight: '50vh',
            width: 'auto',
          }}
        >
          <MediaRenderer
            config={config}
            autoplay
            controls
          />
        </div>
      </div>

      <div className="bg-gray-800 p-4 rounded-lg">
        <div className="text-sm text-gray-400">
          <span className="text-white font-medium">Intent:</span>{' '}
          {INTENT_LABELS[intent.primary].emoji} {INTENT_LABELS[intent.primary].label}
          {' • '}
          <span className="capitalize">{intent.energy}</span> energy
        </div>
      </div>
    </div>
  );
}

export default ContentCreator;
