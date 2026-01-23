import { SettingsCard } from './SettingsCard.js'

/**
 * Props for the VolumeControl component
 */
export interface VolumeControlProps {
  /** Label for the volume control */
  label: string
  /** Description shown below the label */
  description: string
  /** Current volume level (0-100) */
  volume: number
  /** Whether the volume is muted */
  muted: boolean
  /** Callback when volume slider changes */
  onVolumeChange: (volume: number) => void
  /** Callback when mute button is clicked */
  onMuteToggle: () => void
  /** Whether the control is disabled (default: false) */
  disabled?: boolean
}

/**
 * VolumeControl Component
 *
 * A specialized volume control with range slider, mute button, and percentage display.
 * Wraps the volume slider in a SettingsCard for consistent styling.
 * Slider is disabled when muted or when the control is disabled.
 *
 * Usage:
 * ```tsx
 * <VolumeControl
 *   label="Master Volume"
 *   description="Overall audio level"
 *   volume={80}
 *   muted={false}
 *   onVolumeChange={(v) => setVolume(v)}
 *   onMuteToggle={() => setMuted(!muted)}
 * />
 * ```
 */
export function VolumeControl({
  label,
  description,
  volume,
  muted,
  onVolumeChange,
  onMuteToggle,
  disabled = false,
}: VolumeControlProps) {
  return (
    <SettingsCard title={label} description={description}>
      <div className="flex gap-3 items-center">
        {/* Volume slider */}
        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={(e) => onVolumeChange(Number(e.target.value))}
          disabled={disabled || muted}
          className="flex-1"
        />

        {/* Mute button */}
        <button
          onClick={onMuteToggle}
          disabled={disabled}
          className="w-12 h-12 rounded flex items-center justify-center transition-colors text-2xl"
          style={{
            background: muted ? 'var(--color-error)/20' : 'var(--color-bgTertiary)',
            color: muted ? 'var(--color-error)' : 'var(--color-text)',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.5 : 1,
          }}
        >
          {muted ? '🔇' : '🔊'}
        </button>

        {/* Volume percentage display */}
        <span className="text-sm font-mono w-12 text-right" style={{ color: 'var(--color-textMuted)' }}>
          {muted ? 'Muted' : `${volume}%`}
        </span>
      </div>
    </SettingsCard>
  )
}
