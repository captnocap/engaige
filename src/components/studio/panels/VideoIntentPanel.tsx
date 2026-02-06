/**
 * Video Intent Panel
 *
 * Sidebar panel for selecting content intent and energy level.
 * Replaces ContentCreator's IntentStep in the AE-style layout.
 */

import { useVideoComposition } from '../hooks/useVideoComposition.js';
import type { IntentType } from '../../ui/MediaRenderer/types.js';

// ============================================================================
// Data
// ============================================================================

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
  seek_validation: { label: 'Validation', emoji: '🥺' },
  seek_advice: { label: 'Advice', emoji: '❓' },
  subtweet: { label: 'Subtweet', emoji: '👀' },
  call_out: { label: 'Call Out', emoji: '📢' },
  flex: { label: 'Flex', emoji: '💪' },
  rage_bait: { label: 'Rage Bait', emoji: '🔥' },
  humble_brag: { label: 'Humble Brag', emoji: '😇' },
  pity_farm: { label: 'Pity Farm', emoji: '😢' },
  stir_drama: { label: 'Stir Drama', emoji: '🍿' },
  defend_self: { label: 'Defend', emoji: '🛡️' },
  clap_back: { label: 'Clap Back', emoji: '👏' },
  thirst_trap: { label: 'Thirst Trap', emoji: '🔥' },
  mark_territory: { label: 'Territory', emoji: '💕' },
  make_jealous: { label: 'Jealousy', emoji: '😏' },
  love_bomb: { label: 'Love Bomb', emoji: '💗' },
  soft_launch: { label: 'Soft Launch', emoji: '🌅' },
  hard_launch: { label: 'Hard Launch', emoji: '🚀' },
};

const CATEGORIES: Record<string, IntentType[]> = {
  'Positive': ['share_joy', 'inform', 'entertain', 'create_art', 'promote', 'connect'],
  'Processing': ['vent', 'cope', 'confess', 'seek_validation', 'seek_advice'],
  'Drama': ['subtweet', 'call_out', 'flex', 'rage_bait', 'humble_brag', 'pity_farm', 'stir_drama'],
  'Relationship': ['thirst_trap', 'mark_territory', 'make_jealous', 'soft_launch', 'hard_launch'],
};

const ENERGIES = ['low', 'medium', 'high', 'unhinged'] as const;
const ENERGY_LABELS: Record<string, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  unhinged: 'Unhinged',
};

// ============================================================================
// Component
// ============================================================================

export function VideoIntentPanel() {
  const { composition, setComposition, applySuggestedStyle } = useVideoComposition();

  return (
    <div className="space-y-3">
      {/* Intent categories */}
      {Object.entries(CATEGORIES).map(([category, intents]) => (
        <div key={category}>
          <div
            className="text-xs font-medium mb-1.5"
            style={{ color: 'var(--studio-text-muted, #888)' }}
          >
            {category}
          </div>
          <div className="flex flex-wrap gap-1">
            {intents.map((i) => {
              const { label, emoji } = INTENT_LABELS[i];
              const isActive = composition.intent === i;
              return (
                <button
                  key={i}
                  onClick={() => setComposition({ intent: i })}
                  className="px-2 py-1 rounded text-xs transition-colors"
                  style={{
                    background: isActive ? 'var(--studio-accent, #4a6cf7)' : 'var(--studio-bg-darkest, #1a1a1a)',
                    color: isActive ? '#fff' : 'var(--studio-text, #ccc)',
                    border: `1px solid ${isActive ? 'var(--studio-accent, #4a6cf7)' : 'var(--studio-border-subtle, #333)'}`,
                  }}
                >
                  {emoji} {label}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Energy selector */}
      <div>
        <div
          className="text-xs font-medium mb-1.5"
          style={{ color: 'var(--studio-text-muted, #888)' }}
        >
          Energy
        </div>
        <div className="flex gap-1">
          {ENERGIES.map((e) => {
            const isActive = composition.energy === e;
            return (
              <button
                key={e}
                onClick={() => setComposition({ energy: e })}
                className="flex-1 px-2 py-1.5 rounded text-xs transition-colors"
                style={{
                  background: isActive ? 'var(--studio-accent, #4a6cf7)' : 'var(--studio-bg-darkest, #1a1a1a)',
                  color: isActive ? '#fff' : 'var(--studio-text, #ccc)',
                  border: `1px solid ${isActive ? 'var(--studio-accent, #4a6cf7)' : 'var(--studio-border-subtle, #333)'}`,
                }}
              >
                {ENERGY_LABELS[e]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Apply suggestion button */}
      <button
        onClick={applySuggestedStyle}
        className="w-full py-1.5 rounded text-xs font-medium transition-colors"
        style={{
          background: 'var(--studio-bg-darkest, #1a1a1a)',
          color: 'var(--studio-text, #ccc)',
          border: '1px solid var(--studio-border-subtle, #333)',
        }}
      >
        Apply Suggested Style
      </button>
    </div>
  );
}
