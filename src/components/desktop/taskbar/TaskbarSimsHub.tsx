/**
 * TaskbarSimsHub
 *
 * Inline plumbob indicator that expands into a popup with
 * game time, speed controls, and relationship summary.
 */

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useSimulationStore } from '../../../stores/simulationStore.js'
import { useNPCStore } from '../../../stores/npcStore.js'
import { Tooltip } from '../../ui/Tooltip.js'

export function TaskbarSimsHub() {
  const [expanded, setExpanded] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const isRunning = useSimulationStore(s => s.isRunning)
  const isPaused = useSimulationStore(s => s.isPaused)
  const speedMultiplier = useSimulationStore(s => s.speedMultiplier)
  const getGameTimeFormatted = useSimulationStore(s => s.getGameTimeFormatted)
  const pause = useSimulationStore(s => s.pause)
  const resume = useSimulationStore(s => s.resume)
  const setSpeed = useSimulationStore(s => s.setSpeed)

  const npcs = useNPCStore(s => s.npcs)
  const npcArray = Object.values(npcs)

  const friendCount = npcArray.filter(n => {
    const rel = n.relationship
    return rel && (rel.level === 'friend' || rel.level === 'close_friend' || rel.level === 'best_friend')
  }).length

  const romanticCount = npcArray.filter(n => {
    const rel = n.relationship
    return rel && (rel.level === 'romantic_interest' || rel.level === 'partner')
  }).length

  const totalNPCs = npcArray.length

  // Plumbob color logic
  const plumbobColor = !isRunning
    ? 'text-gray-500'
    : isPaused
      ? 'text-yellow-400'
      : 'text-green-400'

  const plumbobGlow = isRunning && !isPaused

  // Clamp panel within viewport after render
  useEffect(() => {
    if (!expanded || !panelRef.current) return
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
    if (!expanded) return
    const handleClick = (e: MouseEvent) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(e.target as Node)
      ) {
        setExpanded(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [expanded])

  const togglePause = () => {
    if (isPaused) resume()
    else pause()
  }

  const buttonRect = buttonRef.current?.getBoundingClientRect()

  return (
    <>
      <Tooltip content={isRunning ? (isPaused ? 'Paused' : `${speedMultiplier}x Speed`) : 'Simulation Off'} placement="top">
        <button
          ref={buttonRef}
          onClick={() => setExpanded(!expanded)}
          className={`
            h-9 w-9 rounded-lg flex items-center justify-center
            hover:bg-white/10 active:bg-white/15
            transition-all duration-150
            ${expanded ? 'bg-white/12' : ''}
          `}
        >
          <div
            className={plumbobColor}
            style={{
              filter: plumbobGlow ? 'drop-shadow(0 0 4px currentColor)' : 'none',
              transition: 'filter 0.3s',
            }}
          >
            <svg width="16" height="24" viewBox="0 0 16 24" fill="currentColor">
              <path d="M8 0 L16 8 L8 24 L0 8 Z" />
            </svg>
          </div>
        </button>
      </Tooltip>

      {expanded && buttonRect && createPortal(
        <div
          ref={panelRef}
          className="
            fixed z-[9997] w-52
            bg-[#1a1a2e]/95 backdrop-blur-xl
            border border-white/10 rounded-xl shadow-2xl
            p-3 animate-in fade-in slide-in-from-bottom-2 duration-150
          "
          style={{
            left: buttonRect.left + buttonRect.width / 2 - 104,
            top: buttonRect.top - 8,
            transform: 'translateY(-100%)',
          }}
        >
          {/* Game Time */}
          <div className="text-center mb-3 pb-2 border-b border-white/10">
            <div className="text-[10px] text-white/40 uppercase tracking-wider">Game Time</div>
            <div className="text-sm text-white/90 font-medium">
              {isRunning ? getGameTimeFormatted() : 'Not Running'}
            </div>
          </div>

          {/* Speed Controls */}
          <div className="mb-3">
            <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1.5">Speed</div>
            <div className="flex gap-1">
              <button
                onClick={(e) => { e.stopPropagation(); togglePause() }}
                className={`
                  flex-1 py-1.5 rounded-md text-xs font-medium transition-colors
                  ${isPaused || !isRunning
                    ? 'bg-white/15 text-white/90'
                    : 'bg-white/5 text-white/50 hover:bg-white/10'
                  }
                `}
              >
                {isPaused ? '▶' : '⏸'}
              </button>
              {[1, 2, 3].map(s => (
                <button
                  key={s}
                  onClick={(e) => { e.stopPropagation(); setSpeed(s) }}
                  className={`
                    flex-1 py-1.5 rounded-md text-xs font-medium transition-colors
                    ${speedMultiplier === s && !isPaused
                      ? 'bg-[#00ff88]/20 text-[#00ff88]'
                      : 'bg-white/5 text-white/50 hover:bg-white/10'
                    }
                  `}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>

          {/* Relationship Stats */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-white/40">Total NPCs</span>
              <span className="text-white/80">{totalNPCs}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-green-400/80">Friends</span>
              <span className="text-white/80">{friendCount}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-pink-400/80">Romantic</span>
              <span className="text-white/80">{romanticCount}</span>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  )
}
