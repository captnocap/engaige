/**
 * TaskbarVolumePanel
 *
 * Quick volume control popup from the system tray.
 * Reads/writes from the settings store's audio settings.
 */

import { useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useSettingsStore } from '../../../stores/settingsStore.js'

interface TaskbarVolumePanelProps {
  anchorRect: DOMRect
  onClose: () => void
}

function VolumeSlider({ label, value, muted, onChange, onToggleMute }: {
  label: string
  value: number
  muted: boolean
  onChange: (v: number) => void
  onToggleMute: () => void
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onToggleMute}
        className={`
          w-6 h-6 rounded flex items-center justify-center text-xs
          transition-colors shrink-0
          ${muted ? 'text-red-400 bg-red-500/15' : 'text-white/60 hover:text-white/80 hover:bg-white/8'}
        `}
      >
        {muted ? '🔇' : label === 'Master' ? '🔊' : label === 'Music' ? '🎵' : '🔔'}
      </button>
      <div className="flex-1 flex flex-col gap-0.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-white/40">{label}</span>
          <span className="text-[10px] text-white/50 font-mono">
            {muted ? 'Muted' : `${value}%`}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          disabled={muted}
          className="w-full h-1 appearance-none rounded-full bg-white/10 accent-[#00ff88] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#00ff88] [&::-webkit-slider-thumb]:shadow-[0_0_4px_#00ff88]
          "
        />
      </div>
    </div>
  )
}

export function TaskbarVolumePanel({ anchorRect, onClose }: TaskbarVolumePanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  const audio = useSettingsStore(s => s.audio)
  const setAudio = useSettingsStore(s => s.setAudio)

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClick, true)
    return () => document.removeEventListener('mousedown', handleClick, true)
  }, [onClose])

  return createPortal(
    <div
      ref={panelRef}
      className="
        fixed z-[9998] w-56
        bg-[#1a1a2e]/95 backdrop-blur-xl
        border border-white/10 rounded-xl shadow-2xl
        p-3 animate-in fade-in slide-in-from-bottom-2 duration-150
      "
      style={{
        left: Math.max(8, Math.min(anchorRect.left - 80, window.innerWidth - 232)),
        top: anchorRect.top - 8,
        transform: 'translateY(-100%)',
      }}
    >
      <div className="text-xs text-white/50 font-medium mb-3">Volume</div>

      <div className="space-y-3">
        <VolumeSlider
          label="Master"
          value={audio.masterVolume}
          muted={audio.masterMuted}
          onChange={(v) => setAudio({ masterVolume: v })}
          onToggleMute={() => setAudio({ masterMuted: !audio.masterMuted })}
        />
        <VolumeSlider
          label="Music"
          value={audio.musicVolume}
          muted={audio.musicMuted}
          onChange={(v) => setAudio({ musicVolume: v })}
          onToggleMute={() => setAudio({ musicMuted: !audio.musicMuted })}
        />
        <VolumeSlider
          label="SFX"
          value={audio.sfxVolume}
          muted={audio.sfxMuted}
          onChange={(v) => setAudio({ sfxVolume: v })}
          onToggleMute={() => setAudio({ sfxMuted: !audio.sfxMuted })}
        />
      </div>
    </div>,
    document.body,
  )
}
