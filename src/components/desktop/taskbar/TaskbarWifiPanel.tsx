/**
 * TaskbarWifiPanel
 *
 * WiFi popup showing connected network, toggle, and filler networks.
 * Disconnecting pauses the game simulation while still letting the user
 * interact with the UI (browse settings, etc).
 */

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useSimulationStore } from '../../../stores/simulationStore.js'

interface TaskbarWifiPanelProps {
  anchorRect: DOMRect
  onClose: () => void
}

interface FakeNetwork {
  name: string
  signal: 'strong' | 'medium' | 'weak'
  locked: boolean
}

const FILLER_NETWORKS: FakeNetwork[] = [
  { name: 'CornField_5G', signal: 'strong', locked: true },
  { name: 'Hartwell_Guest', signal: 'medium', locked: false },
  { name: 'OMNICORP_SECURE', signal: 'strong', locked: true },
  { name: 'The_Underground_WiFi', signal: 'medium', locked: true },
  { name: 'QuantumBrew_Free', signal: 'weak', locked: false },
  { name: 'FBI_Surveillance_Van_847', signal: 'weak', locked: true },
  { name: 'Floor13DoesNotExist', signal: 'medium', locked: true },
  { name: 'TrustFallTim_Hotspot', signal: 'weak', locked: false },
]

const SIGNAL_BARS: Record<string, number> = {
  strong: 4,
  medium: 3,
  weak: 1,
}

function SignalIcon({ strength }: { strength: 'strong' | 'medium' | 'weak' }) {
  const bars = SIGNAL_BARS[strength]
  return (
    <svg width="14" height="12" viewBox="0 0 14 12" className="shrink-0">
      {[0, 1, 2, 3].map(i => (
        <rect
          key={i}
          x={i * 3.5}
          y={12 - (i + 1) * 3}
          width="2.5"
          height={(i + 1) * 3}
          rx="0.5"
          fill="currentColor"
          opacity={i < bars ? 1 : 0.2}
        />
      ))}
    </svg>
  )
}

function LockIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" className="text-white/40 shrink-0">
      <rect x="1.5" y="4.5" width="7" height="5" rx="1" />
      <path d="M3 4.5V3C3 1.9 3.9 1 5 1C6.1 1 7 1.9 7 3V4.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  )
}

export function TaskbarWifiPanel({ anchorRect, onClose }: TaskbarWifiPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  const isRunning = useSimulationStore(s => s.isRunning)
  const isPaused = useSimulationStore(s => s.isPaused)
  const pause = useSimulationStore(s => s.pause)
  const resume = useSimulationStore(s => s.resume)

  const [connected, setConnected] = useState(true)
  const [connectingTo, setConnectingTo] = useState<string | null>(null)

  // Clamp panel within viewport after render
  useEffect(() => {
    if (!panelRef.current) return
    const el = panelRef.current
    const rect = el.getBoundingClientRect()
    if (rect.right > window.innerWidth - 8) {
      el.style.left = `${window.innerWidth - rect.width - 8}px`
    }
    if (rect.left < 8) {
      el.style.left = '8px'
    }
  })

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

  const handleToggle = () => {
    if (connected) {
      setConnected(false)
      if (isRunning && !isPaused) {
        pause()
      }
    } else {
      setConnected(true)
      setConnectingTo(null)
      if (isRunning && isPaused) {
        resume()
      }
    }
  }

  const handleConnectToNetwork = (networkName: string) => {
    if (!connected) return
    setConnectingTo(networkName)
    setTimeout(() => {
      setConnectingTo(null)
    }, 2000)
  }

  return createPortal(
    <div
      ref={panelRef}
      className="
        fixed z-[9998] w-72
        bg-[#1a1a2e]/95 backdrop-blur-xl
        border border-white/10 rounded-xl shadow-2xl
        animate-in fade-in slide-in-from-bottom-2 duration-150
        overflow-hidden
      "
      style={{
        left: anchorRect.left + anchorRect.width / 2 - 144,
        top: anchorRect.top - 8,
        transform: 'translateY(-100%)',
      }}
    >
      {/* Header */}
      <div className="px-3 pt-3 pb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-white/90">WiFi</span>
        <button
          onClick={handleToggle}
          className={`
            w-10 h-5 rounded-full transition-colors duration-200 relative
            ${connected ? 'bg-[#00ff88]' : 'bg-white/20'}
          `}
        >
          <div
            className={`
              absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm
              transition-transform duration-200
              ${connected ? 'translate-x-5' : 'translate-x-0.5'}
            `}
          />
        </button>
      </div>

      {/* Connected network */}
      {connected && (
        <div className="mx-3 mb-2 px-3 py-2.5 rounded-lg bg-[#00ff88]/10 border border-[#00ff88]/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-[#00ff88] font-medium">Connected</div>
              <div className="text-sm text-white/90">CornField_5G</div>
            </div>
            <div className="text-[#00ff88]">
              <SignalIcon strength="strong" />
            </div>
          </div>
        </div>
      )}

      {!connected && (
        <div className="mx-3 mb-2 px-3 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20">
          <div className="text-xs text-red-400 font-medium">Disconnected</div>
          <div className="text-[10px] text-white/40">Game simulation paused</div>
        </div>
      )}

      {/* Available networks */}
      <div className="border-t border-white/8">
        <div className="px-3 pt-2 pb-1">
          <span className="text-[10px] text-white/40 uppercase tracking-wider">Available Networks</span>
        </div>
        <div className="max-h-[200px] overflow-y-auto pb-2">
          {FILLER_NETWORKS.map(network => (
            <button
              key={network.name}
              onClick={() => handleConnectToNetwork(network.name)}
              disabled={!connected}
              className={`
                w-full px-3 py-2 flex items-center gap-2 text-left
                transition-colors
                ${connected
                  ? 'hover:bg-white/8 cursor-pointer'
                  : 'opacity-40 cursor-not-allowed'
                }
                ${connectingTo === network.name ? 'bg-white/5' : ''}
              `}
            >
              <div className="text-white/60">
                <SignalIcon strength={network.signal} />
              </div>
              <span className="text-sm text-white/70 flex-1 truncate">{network.name}</span>
              {network.locked && <LockIcon />}
              {connectingTo === network.name && (
                <span className="text-[10px] text-white/40 animate-pulse">Connecting...</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body,
  )
}
