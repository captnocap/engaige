import { useSettingsStore } from '../../../stores/settingsStore.js'
import { VolumeControl } from '../VolumeControl.js'

export default function AudioSettings() {
  const { audio, setAudio } = useSettingsStore()

  return (
    <div className="space-y-6">
      <VolumeControl
        label="Master Volume"
        description="Overall audio level"
        volume={audio.masterVolume}
        muted={audio.masterMuted}
        onVolumeChange={(v) => setAudio({ masterVolume: v })}
        onMuteToggle={() => setAudio({ masterMuted: !audio.masterMuted })}
      />

      <VolumeControl
        label="Music Volume"
        description="Background music level"
        volume={audio.musicVolume}
        muted={audio.musicMuted}
        onVolumeChange={(v) => setAudio({ musicVolume: v })}
        onMuteToggle={() => setAudio({ musicMuted: !audio.musicMuted })}
        disabled={audio.masterMuted}
      />

      <VolumeControl
        label="Sound Effects Volume"
        description="UI sounds and effects"
        volume={audio.sfxVolume}
        muted={audio.sfxMuted}
        onVolumeChange={(v) => setAudio({ sfxVolume: v })}
        onMuteToggle={() => setAudio({ sfxMuted: !audio.sfxMuted })}
        disabled={audio.masterMuted}
      />

      <div className="flex justify-end">
        <button
          onClick={() => {
            setAudio({
              masterVolume: 80,
              musicVolume: 70,
              sfxVolume: 60,
              masterMuted: false,
              musicMuted: false,
              sfxMuted: false,
            })
          }}
          className="px-4 py-2 rounded text-sm font-medium transition-colors"
          style={{
            background: 'var(--color-bgTertiary)',
            color: 'var(--color-text)',
            border: '1px solid var(--color-border)',
          }}
        >
          Reset to Defaults
        </button>
      </div>

      <div
        className="p-4 rounded"
        style={{
          background: 'var(--color-info)/10',
          border: '1px solid var(--color-info)/30',
        }}
      >
        <p className="text-sm" style={{ color: 'var(--color-info)' }}>
          ℹ️ Audio settings will apply to future game sounds. No audio is currently playing.
        </p>
      </div>
    </div>
  )
}
