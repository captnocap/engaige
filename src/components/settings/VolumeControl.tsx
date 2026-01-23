import { SettingsCard } from './SettingsCard.js'

export function VolumeControl({
  label,
  description,
  volume,
  muted,
  onVolumeChange,
  onMuteToggle,
  disabled = false,
}: {
  label: string
  description: string
  volume: number
  muted: boolean
  onVolumeChange: (volume: number) => void
  onMuteToggle: () => void
  disabled?: boolean
}) {
  return (
    <SettingsCard title={label} description={description}>
      <div className="flex gap-3 items-center">
        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={(e) => onVolumeChange(Number(e.target.value))}
          disabled={disabled || muted}
          className="flex-1"
        />
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
        <span className="text-sm font-mono w-12 text-right" style={{ color: 'var(--color-textMuted)' }}>
          {muted ? 'Muted' : `${volume}%`}
        </span>
      </div>
    </SettingsCard>
  )
}
