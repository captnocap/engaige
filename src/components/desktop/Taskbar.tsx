import { useState, useEffect, type ReactNode } from 'react'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { useSimulationStore } from '../../stores/simulationStore.js'
import { useNPCStore } from '../../stores/npcStore.js'
import { useOSThemeStore } from '../../stores/osThemeStore.js'

export interface TaskbarWindow {
  id: string
  title: string
  icon: ReactNode
  isMinimized: boolean
  isActive: boolean
}

interface TaskbarProps {
  windows: TaskbarWindow[]
  onWindowClick: (id: string) => void
  onStartClick?: () => void
  phoneVisible?: boolean
  onPhoneToggle?: () => void
  className?: string
}

export function Taskbar({ windows, onWindowClick, onStartClick, phoneVisible, onPhoneToggle, className }: TaskbarProps) {
  const [time, setTime] = useState(new Date())
  const [hubExpanded, setHubExpanded] = useState(false)

  // Simulation store
  const isRunning = useSimulationStore(s => s.isRunning)
  const isPaused = useSimulationStore(s => s.isPaused)
  const speed = useSimulationStore(s => s.speed)
  const getGameTimeFormatted = useSimulationStore(s => s.getGameTimeFormatted)
  const togglePause = useSimulationStore(s => s.togglePause)
  const setSpeed = useSimulationStore(s => s.setSpeed)

  // NPC store for relationship stats
  const npcs = useNPCStore(s => s.npcs)

  // OS theme
  const taskbarConfig = useOSThemeStore(s => s.taskbar)

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  const handleDragStart = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return
    if ((e.target as HTMLElement).closest('.hub-panel')) return
    getCurrentWindow().startDragging()
  }

  // Calculate relationship stats - npcs is a Record<string, NPC>, convert to array
  const npcArray = Object.values(npcs)

  const friendCount = npcArray.filter(n => {
    const rel = n.relationship
    return rel && (rel.level === 'friend' || rel.level === 'close_friend' || rel.level === 'best_friend')
  }).length

  const romanticCount = npcArray.filter(n => {
    const rel = n.relationship
    return rel && rel.level === 'romantic'
  }).length

  const totalNPCs = npcArray.length

  return (
    <div
      onMouseDown={handleDragStart}
      className={`relative h-14 flex items-end cursor-grab active:cursor-grabbing ${className ?? ''}`}
    >
      {/* Hub Panel - Sims-style circular area that melds with taskbar */}
      {taskbarConfig.showHub && (
        <div
          className={`hub-panel absolute bottom-0 z-10 ${taskbarConfig.hubPosition === 'left' ? 'left-0' : 'right-0'}`}
        >
          <SimsHub
            position={taskbarConfig.hubPosition}
            expanded={hubExpanded}
            onToggleExpand={() => setHubExpanded(!hubExpanded)}
            isRunning={isRunning}
            isPaused={isPaused}
            speed={speed}
            gameTime={getGameTimeFormatted()}
            onTogglePause={togglePause}
            onSetSpeed={setSpeed}
            friendCount={friendCount}
            romanticCount={romanticCount}
            totalNPCs={totalNPCs}
          />
        </div>
      )}

      {/* Main Taskbar */}
      <div
        className={`
          flex-1 h-12 bg-[#1a1a1a]/95 backdrop-blur-sm border-t border-[#333] flex items-center px-2 gap-1
          ${taskbarConfig.showHub && taskbarConfig.hubPosition === 'left' ? 'ml-[88px]' : ''}
          ${taskbarConfig.showHub && taskbarConfig.hubPosition === 'right' ? 'mr-[88px]' : ''}
        `}
      >
        {/* Start Button */}
        <button
          onClick={onStartClick}
          className="h-9 px-3 rounded flex items-center gap-2 hover:bg-[#333] active:bg-[#444] transition-colors"
        >
          <span className="text-lg">🪙</span>
          <span className="text-sm font-medium text-white">Start</span>
        </button>

        <div className="w-px h-6 bg-[#333] mx-1" />

        {/* Open Windows */}
        <div className="flex-1 flex items-center gap-1 overflow-x-auto">
          {windows.map(win => (
            <button
              key={win.id}
              onClick={() => onWindowClick(win.id)}
              className={`
                h-9 px-3 rounded flex items-center gap-2 min-w-[140px] max-w-[200px] transition-colors
                ${win.isActive ? 'bg-[#333] border-b-2 border-[#00ff88]' : 'hover:bg-[#2a2a2a]'}
                ${win.isMinimized ? 'opacity-60' : ''}
              `}
            >
              <span className="text-sm shrink-0">{win.icon}</span>
              <span className="text-sm text-white truncate">{win.title}</span>
            </button>
          ))}
        </div>

        {/* Right side - Phone toggle & time */}
        <div className="flex items-center gap-2 px-2">
          <button
            onClick={onPhoneToggle}
            className={`
              p-1.5 rounded transition-colors
              ${phoneVisible ? 'bg-[#00ff88]/20 text-[#00ff88]' : 'text-[#888] hover:bg-[#333] hover:text-white'}
            `}
            title="Toggle Phone (P)"
          >
            <span className="text-lg">📱</span>
          </button>

          <div className="w-px h-6 bg-[#333]" />

          {/* Clock */}
          <div className="text-right min-w-[60px]">
            <div className="text-xs text-white">
              {time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
            </div>
            <div className="text-[10px] text-[#888]">
              {time.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Sims-Style Hub Component
// ============================================================================

interface SimsHubProps {
  position: 'left' | 'right'
  expanded: boolean
  onToggleExpand: () => void
  isRunning: boolean
  isPaused: boolean
  speed: number
  gameTime: string
  onTogglePause: () => void
  onSetSpeed: (speed: number) => void
  friendCount: number
  romanticCount: number
  totalNPCs: number
}

function SimsHub({
  position,
  expanded,
  onToggleExpand,
  isRunning,
  isPaused,
  speed,
  gameTime,
  onTogglePause,
  onSetSpeed,
  friendCount,
  romanticCount,
  totalNPCs,
}: SimsHubProps) {
  const isLeft = position === 'left'

  return (
    <div className={`flex items-end ${isLeft ? '' : 'flex-row-reverse'}`}>
      {/* Curved connector that melds into taskbar */}
      <svg
        className="h-12 w-6"
        viewBox="0 0 24 48"
        fill="#1a1a1a"
        style={{ opacity: 0.95 }}
      >
        {isLeft ? (
          <path d="M24 0 L24 48 L0 48 Q24 48 24 24 Q24 0 0 0 Z" />
        ) : (
          <path d="M0 0 L0 48 L24 48 Q0 48 0 24 Q0 0 24 0 Z" />
        )}
      </svg>

      {/* Main Hub Circle */}
      <div
        className={`
          relative w-20 h-20 -mb-2 rounded-full bg-[#1a1a1a]/95 backdrop-blur-sm
          border-2 border-[#333] shadow-lg cursor-pointer
          transition-all duration-200
          ${expanded ? 'scale-110' : 'hover:scale-105'}
        `}
        onClick={onToggleExpand}
      >
        {/* Plumbob-style indicator */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <div
            className={`
              w-4 h-6 transition-colors
              ${isRunning ? (isPaused ? 'text-yellow-400' : 'text-green-400') : 'text-gray-500'}
            `}
            style={{
              filter: isRunning && !isPaused ? 'drop-shadow(0 0 4px currentColor)' : 'none',
            }}
          >
            <svg viewBox="0 0 16 24" fill="currentColor">
              <path d="M8 0 L16 8 L8 24 L0 8 Z" />
            </svg>
          </div>
        </div>

        {/* Hub Content */}
        <div className="absolute inset-2 rounded-full bg-[#252525] flex flex-col items-center justify-center">
          {/* Relationship stats ring */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 64 64">
            {/* Background ring */}
            <circle cx="32" cy="32" r="28" fill="none" stroke="#333" strokeWidth="4" />

            {/* Friends arc (green) */}
            {totalNPCs > 0 && friendCount > 0 && (
              <circle
                cx="32" cy="32" r="28"
                fill="none"
                stroke="#22c55e"
                strokeWidth="4"
                strokeDasharray={`${(friendCount / totalNPCs) * 176} 176`}
                strokeDashoffset="0"
                transform="rotate(-90 32 32)"
                style={{ filter: 'drop-shadow(0 0 2px #22c55e)' }}
              />
            )}

            {/* Romantic arc (pink) */}
            {totalNPCs > 0 && romanticCount > 0 && (
              <circle
                cx="32" cy="32" r="28"
                fill="none"
                stroke="#ec4899"
                strokeWidth="4"
                strokeDasharray={`${(romanticCount / totalNPCs) * 176} 176`}
                strokeDashoffset={`${-((friendCount / totalNPCs) * 176)}`}
                transform="rotate(-90 32 32)"
                style={{ filter: 'drop-shadow(0 0 2px #ec4899)' }}
              />
            )}
          </svg>

          {/* Center content */}
          <div className="relative z-10 text-center">
            <div className="text-lg">👤</div>
            {isRunning && (
              <div className="text-[8px] text-[#888] leading-tight">
                {isPaused ? 'PAUSED' : `${speed}x`}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Expanded Panel */}
      {expanded && (
        <div
          className={`
            absolute bottom-full mb-2 bg-[#1a1a1a]/95 backdrop-blur-sm
            rounded-lg border border-[#333] shadow-xl p-3 w-48
            ${isLeft ? 'left-0' : 'right-0'}
          `}
        >
          {/* Game Time */}
          <div className="text-center mb-3 pb-2 border-b border-[#333]">
            <div className="text-xs text-[#888]">Game Time</div>
            <div className="text-sm text-white font-medium">
              {isRunning ? gameTime : 'Not Running'}
            </div>
          </div>

          {/* Speed Controls */}
          <div className="mb-3">
            <div className="text-xs text-[#888] mb-1">Speed</div>
            <div className="flex gap-1">
              <button
                onClick={(e) => { e.stopPropagation(); onTogglePause(); }}
                className={`
                  flex-1 py-1 rounded text-xs transition-colors
                  ${isPaused || !isRunning ? 'bg-[#333] text-white' : 'bg-[#252525] text-[#888] hover:bg-[#333]'}
                `}
              >
                {isPaused ? '▶' : '⏸'}
              </button>
              {[1, 2, 3].map(s => (
                <button
                  key={s}
                  onClick={(e) => { e.stopPropagation(); onSetSpeed(s); }}
                  className={`
                    flex-1 py-1 rounded text-xs transition-colors
                    ${speed === s && !isPaused ? 'bg-[#00ff88] text-black' : 'bg-[#252525] text-[#888] hover:bg-[#333]'}
                  `}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>

          {/* Relationship Stats */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-[#888]">Total NPCs</span>
              <span className="text-white">{totalNPCs}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-green-400">Friends</span>
              <span className="text-white">{friendCount}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-pink-400">Romantic</span>
              <span className="text-white">{romanticCount}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
