/**
 * CobMedia - Media Player
 *
 * Music player with playlist sidebar featuring game-world tracks.
 * Simulates playback with progress timer.
 * Right-click context menus on tracks and player area.
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import { ContextMenu } from '../ui/ContextMenu.js'
import { useContextMenu } from '../../hooks/useContextMenu.js'
import { mediaPlayerTrackPreset, mediaPlayerPreset } from '../../hooks/useContextMenuPresets.js'

interface Track {
  id: string
  title: string
  artist: string
  album: string
  duration: number // seconds
  art: string // emoji
}

const PLAYLIST: Track[] = [
  { id: '1', title: 'Concrete Lullaby', artist: 'Neon Requiem', album: 'Final Transmission', duration: 234, art: '🎸' },
  { id: '2', title: 'Broken Neon Signs', artist: 'Neon Requiem', album: 'Final Transmission', duration: 198, art: '🎸' },
  { id: '3', title: 'Last Show at The Underground', artist: 'Neon Requiem', album: 'Final Transmission', duration: 312, art: '🎸' },
  { id: '4', title: 'Sine Wave Meditation', artist: 'Velvet Algorithms', album: 'Digital Dharma', duration: 427, art: '🎧' },
  { id: '5', title: 'Binary Sunset (Remix)', artist: 'Velvet Algorithms', album: 'Digital Dharma', duration: 356, art: '🎧' },
  { id: '6', title: 'Quantum Entanglement', artist: 'Velvet Algorithms', album: 'Probability Clouds', duration: 289, art: '🎧' },
  { id: '7', title: 'Fall With Me', artist: 'Trust Fall Tim', album: 'Catching Feelings', duration: 203, art: '🙆' },
  { id: '8', title: '78.5% (Catch Rate)', artist: 'Trust Fall Tim', album: 'Catching Feelings', duration: 178, art: '🙆' },
  { id: '9', title: 'Small Kevin Blues', artist: 'Trust Fall Tim', album: 'Catching Feelings', duration: 245, art: '🙆' },
  { id: '10', title: 'Floor 13 (Does Not Exist)', artist: 'The Hartwell Tapes', album: 'Omnicorp Sessions', duration: 847, art: '🏢' },
  { id: '11', title: '$47 Drip', artist: 'DJ Quantum', album: 'Coffee Break EP', duration: 192, art: '☕' },
  { id: '12', title: 'Martinez Study Results', artist: 'DJ Quantum', album: 'Coffee Break EP', duration: 167, art: '☕' },
]

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function CobMedia() {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0) // 0-1
  const [volume, setVolume] = useState(0.7)
  const [shuffle, setShuffle] = useState(false)
  const [repeat, setRepeat] = useState(false)
  const progressInterval = useRef<number>(0)
  const trackCtx = useContextMenu<Track>()
  const playerCtx = useContextMenu()

  const playTrack = useCallback((track: Track) => {
    setCurrentTrack(track)
    setProgress(0)
    setPlaying(true)
  }, [])

  const handleNext = useCallback(() => {
    if (!currentTrack) return
    const idx = PLAYLIST.findIndex(t => t.id === currentTrack.id)
    let nextIdx: number
    if (shuffle) {
      nextIdx = Math.floor(Math.random() * PLAYLIST.length)
    } else if (repeat) {
      nextIdx = idx
    } else {
      nextIdx = (idx + 1) % PLAYLIST.length
    }
    playTrack(PLAYLIST[nextIdx])
  }, [currentTrack, shuffle, repeat, playTrack])

  const handlePrev = useCallback(() => {
    if (!currentTrack) return
    if (progress > 0.1) {
      setProgress(0)
      return
    }
    const idx = PLAYLIST.findIndex(t => t.id === currentTrack.id)
    const prevIdx = idx <= 0 ? PLAYLIST.length - 1 : idx - 1
    playTrack(PLAYLIST[prevIdx])
  }, [currentTrack, progress, playTrack])

  const togglePlay = useCallback(() => {
    if (!currentTrack && PLAYLIST.length > 0) {
      playTrack(PLAYLIST[0])
    } else {
      setPlaying(prev => !prev)
    }
  }, [currentTrack, playTrack])

  // Simulate playback with progress timer
  useEffect(() => {
    if (playing && currentTrack) {
      const stepMs = 100
      const increment = stepMs / (currentTrack.duration * 1000)
      progressInterval.current = window.setInterval(() => {
        setProgress(prev => {
          if (prev >= 1) {
            handleNext()
            return 0
          }
          return Math.min(prev + increment, 1)
        })
      }, stepMs)
      return () => clearInterval(progressInterval.current)
    } else {
      clearInterval(progressInterval.current)
    }
  }, [playing, currentTrack, handleNext])

  const handleCopyTrackInfo = useCallback((track: Track) => {
    navigator.clipboard.writeText(`${track.title} - ${track.artist} (${track.album})`).catch(() => {})
  }, [])

  const currentTime = currentTrack ? Math.floor(progress * currentTrack.duration) : 0

  return (
    <div className="flex h-full bg-[#111]">
      {/* Playlist sidebar */}
      <div className="w-64 border-r border-[#333] flex flex-col bg-[#0d0d0d]">
        <div className="p-3 border-b border-[#333]">
          <div className="text-sm font-medium text-white">Library</div>
          <div className="text-xs text-[#888]">{PLAYLIST.length} tracks</div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {PLAYLIST.map(track => (
            <button
              key={track.id}
              onClick={() => playTrack(track)}
              onContextMenu={(e) => {
                e.stopPropagation()
                trackCtx.show(e, track)
              }}
              className={`w-full text-left px-3 py-2 flex items-center gap-3 hover:bg-[#1a1a1a] transition-colors ${
                currentTrack?.id === track.id ? 'bg-[#1a1a1a] border-l-2 border-[#00ff88]' : ''
              }`}
            >
              <span className="text-lg flex-shrink-0">{track.art}</span>
              <div className="min-w-0 flex-1">
                <div className={`text-sm truncate ${
                  currentTrack?.id === track.id ? 'text-[#00ff88]' : 'text-white'
                }`}>
                  {track.title}
                </div>
                <div className="text-xs text-[#888] truncate">{track.artist}</div>
              </div>
              <span className="text-xs text-[#666] flex-shrink-0">{formatDuration(track.duration)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main player area */}
      <div
        className="flex-1 flex flex-col"
        onContextMenu={(e) => playerCtx.show(e)}
      >
        {/* Album art / now playing */}
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          {currentTrack ? (
            <>
              <div className={`w-48 h-48 rounded-xl bg-[#1a1a1a] border border-[#333] flex items-center justify-center text-8xl mb-6 ${
                playing ? 'animate-pulse' : ''
              }`}>
                {currentTrack.art}
              </div>
              <div className="text-xl font-semibold text-white text-center">{currentTrack.title}</div>
              <div className="text-sm text-[#888] mt-1">{currentTrack.artist}</div>
              <div className="text-xs text-[#666] mt-0.5">{currentTrack.album}</div>
            </>
          ) : (
            <div className="text-center">
              <div className="text-6xl mb-4">🎵</div>
              <div className="text-[#888]">Select a track to play</div>
            </div>
          )}
        </div>

        {/* Player controls */}
        <div className="border-t border-[#333] bg-[#0d0d0d] p-4">
          {/* Progress bar */}
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs text-[#888] font-mono w-10 text-right">
              {currentTrack ? formatDuration(currentTime) : '0:00'}
            </span>
            <div
              className="flex-1 h-1.5 bg-[#333] rounded-full cursor-pointer group"
              onClick={e => {
                if (!currentTrack) return
                const rect = e.currentTarget.getBoundingClientRect()
                setProgress((e.clientX - rect.left) / rect.width)
              }}
            >
              <div
                className="h-full bg-[#00ff88] rounded-full relative"
                style={{ width: `${progress * 100}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
            <span className="text-xs text-[#888] font-mono w-10">
              {currentTrack ? formatDuration(currentTrack.duration) : '0:00'}
            </span>
          </div>

          {/* Control buttons */}
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={() => setShuffle(!shuffle)}
              className={`text-sm ${shuffle ? 'text-[#00ff88]' : 'text-[#888] hover:text-white'}`}
              title="Shuffle"
            >
              🔀
            </button>
            <button onClick={handlePrev} className="text-xl text-white hover:text-[#00ff88]">⏮</button>
            <button
              onClick={togglePlay}
              className="w-12 h-12 rounded-full bg-[#00ff88] text-[#0a0a0a] flex items-center justify-center text-xl hover:bg-[#00dd77]"
            >
              {playing ? '⏸' : '▶'}
            </button>
            <button onClick={handleNext} className="text-xl text-white hover:text-[#00ff88]">⏭</button>
            <button
              onClick={() => setRepeat(!repeat)}
              className={`text-sm ${repeat ? 'text-[#00ff88]' : 'text-[#888] hover:text-white'}`}
              title="Repeat"
            >
              🔁
            </button>
          </div>

          {/* Volume */}
          <div className="flex items-center justify-center gap-2 mt-3">
            <span className="text-xs text-[#888]">🔊</span>
            <input
              type="range"
              min={0} max={1} step={0.01}
              value={volume}
              onChange={e => setVolume(parseFloat(e.target.value))}
              className="w-24 accent-[#00ff88]"
            />
          </div>
        </div>
      </div>

      {/* Track Context Menu */}
      {trackCtx.visible && trackCtx.data && (
        <ContextMenu
          items={mediaPlayerTrackPreset({
            trackTitle: trackCtx.data.title,
            onPlay: () => playTrack(trackCtx.data!),
            onCopyTrackInfo: () => handleCopyTrackInfo(trackCtx.data!),
          })}
          x={trackCtx.x}
          y={trackCtx.y}
          onClose={trackCtx.hide}
        />
      )}

      {/* Player Context Menu */}
      {playerCtx.visible && !trackCtx.visible && (
        <ContextMenu
          items={mediaPlayerPreset({
            isPlaying: playing,
            shuffle,
            repeat,
            onTogglePlay: togglePlay,
            onToggleShuffle: () => setShuffle(prev => !prev),
            onToggleRepeat: () => setRepeat(prev => !prev),
            onNext: currentTrack ? handleNext : undefined,
            onPrev: currentTrack ? handlePrev : undefined,
          })}
          x={playerCtx.x}
          y={playerCtx.y}
          onClose={playerCtx.hide}
        />
      )}
    </div>
  )
}
