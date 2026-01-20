import { useState, useEffect, type ReactNode } from 'react'
import { getCurrentWindow } from '@tauri-apps/api/window'

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

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  const handleDragStart = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return
    getCurrentWindow().startDragging()
  }

  const timeStr = time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  const dateStr = time.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  return (
    <div onMouseDown={handleDragStart} className={`h-12 bg-[#1a1a1a]/95 backdrop-blur-sm border-t border-[#333] flex items-center px-2 gap-1 cursor-grab active:cursor-grabbing ${className ?? ''}`}>
      <button onClick={onStartClick} className="h-9 px-3 rounded flex items-center gap-2 hover:bg-[#333] active:bg-[#444] transition-colors">
        <span className="text-lg">🪙</span>
        <span className="text-sm font-medium text-white">Start</span>
      </button>

      <div className="w-px h-6 bg-[#333] mx-1" />

      <div className="flex-1 flex items-center gap-1 overflow-x-auto">
        {windows.map(win => (
          <button
            key={win.id}
            onClick={() => onWindowClick(win.id)}
            className={`h-9 px-3 rounded flex items-center gap-2 min-w-[140px] max-w-[200px] transition-colors ${win.isActive ? 'bg-[#333] border-b-2 border-[#00ff88]' : 'hover:bg-[#2a2a2a]'} ${win.isMinimized ? 'opacity-60' : ''}`}
          >
            <span className="text-sm shrink-0">{win.icon}</span>
            <span className="text-sm text-white truncate">{win.title}</span>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 px-2">
        <button
          onClick={onPhoneToggle}
          className={`p-1.5 rounded transition-colors ${phoneVisible ? 'bg-[#00ff88]/20 text-[#00ff88]' : 'text-[#888] hover:bg-[#333] hover:text-white'}`}
          title="Toggle Phone (P)"
        >
          <span className="text-lg">📱</span>
        </button>

        <div className="w-px h-6 bg-[#333]" />

        <div className="flex items-center gap-1 text-[#888]">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3C7.46 3 3.34 4.78.29 7.67c-.18.18-.29.43-.29.71 0 .28.11.53.29.71l11 11c.39.39 1.02.39 1.41 0l11-11c.18-.18.29-.43.29-.71 0-.28-.11-.53-.29-.71C20.66 4.78 16.54 3 12 3z" />
          </svg>
        </div>

        <div className="text-[#888]">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
          </svg>
        </div>

        <div className="flex items-center gap-1 text-[#00ff88]">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4z" />
          </svg>
          <span className="text-xs">69%</span>
        </div>

        <div className="w-px h-6 bg-[#333]" />

        <div className="text-right min-w-[60px]">
          <div className="text-xs text-white">{timeStr}</div>
          <div className="text-[10px] text-[#888]">{dateStr}</div>
        </div>
      </div>
    </div>
  )
}