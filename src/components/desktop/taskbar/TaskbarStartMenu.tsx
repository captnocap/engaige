/**
 * TaskbarStartMenu
 *
 * Start menu with all desktop apps as launchers plus power options
 * (logout, power down/quit, restart).
 */

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { useAccountStore } from '../../../stores/accountStore.js'
import { useSimulationStore } from '../../../stores/simulationStore.js'
import type { StartMenuApp } from './types.js'

interface TaskbarStartMenuProps {
  anchorRect: DOMRect
  apps: StartMenuApp[]
  onAppClick: (appId: string) => void
  onClose: () => void
}

function PowerButton({ icon, label, sublabel, onClick, danger }: {
  icon: string
  label: string
  sublabel?: string
  onClick: () => void
  danger?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-3 w-full px-3 py-2.5 rounded-lg
        transition-colors text-left
        ${danger
          ? 'hover:bg-red-500/15 text-red-400'
          : 'hover:bg-white/8 text-white/70'
        }
      `}
    >
      <span className="text-base w-6 text-center">{icon}</span>
      <div>
        <div className="text-sm">{label}</div>
        {sublabel && <div className="text-[10px] text-white/30">{sublabel}</div>}
      </div>
    </button>
  )
}

export function TaskbarStartMenu({ anchorRect, apps, onAppClick, onClose }: TaskbarStartMenuProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)
  const setActiveAccountId = useAccountStore(s => s.setActiveAccountId)
  const stopSimulation = useSimulationStore(s => s.stop)

  // Focus search on open
  useEffect(() => {
    setTimeout(() => searchRef.current?.focus(), 100)
  }, [])

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', handleClick, true)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClick, true)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  const filteredApps = searchQuery
    ? apps.filter(app => app.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : apps

  const handleQuit = async () => {
    try {
      await getCurrentWindow().close()
    } catch {
      // Fallback: if Tauri API not available (dev mode)
      window.close()
    }
  }

  const handleRestart = async () => {
    try {
      // In Tauri, reload the webview to simulate restart
      window.location.reload()
    } catch {
      window.location.reload()
    }
  }

  const handleLogout = () => {
    stopSimulation()
    setActiveAccountId(null)
    // Reload to go back to onboarding/account selection
    window.location.reload()
  }

  return createPortal(
    <div
      ref={panelRef}
      className="
        fixed z-[9998] w-80
        bg-[#1a1a2e]/95 backdrop-blur-xl
        border border-white/10 rounded-xl shadow-2xl
        animate-in fade-in slide-in-from-bottom-2 duration-150
        overflow-hidden
      "
      style={{
        left: Math.max(8, anchorRect.left),
        top: anchorRect.top - 8,
        transform: 'translateY(-100%)',
      }}
    >
      {/* Search */}
      <div className="p-3 pb-2">
        <input
          ref={searchRef}
          type="text"
          placeholder="Search apps..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="
            w-full px-3 py-2 rounded-lg
            bg-white/8 border border-white/10
            text-sm text-white/90 placeholder-white/30
            outline-none focus:border-white/20 focus:bg-white/10
            transition-colors
          "
        />
      </div>

      {/* App grid */}
      <div className="px-3 pb-2 max-h-[280px] overflow-y-auto">
        <div className="grid grid-cols-3 gap-1">
          {filteredApps.map(app => (
            <button
              key={app.id}
              onClick={() => { onAppClick(app.id); onClose() }}
              className="
                flex flex-col items-center gap-1.5 py-3 px-2 rounded-lg
                hover:bg-white/8 active:bg-white/12
                transition-colors group
              "
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">
                {app.icon}
              </span>
              <span className="text-[10px] text-white/60 text-center leading-tight truncate w-full">
                {app.label}
              </span>
            </button>
          ))}
          {filteredApps.length === 0 && (
            <div className="col-span-3 py-6 text-center text-sm text-white/30">
              No apps found
            </div>
          )}
        </div>
      </div>

      {/* Power options */}
      <div className="border-t border-white/8 p-2">
        <PowerButton
          icon="🔄"
          label="Restart"
          sublabel="Reload the application"
          onClick={handleRestart}
        />
        <PowerButton
          icon="🚪"
          label="Log Out"
          sublabel="Return to account selection"
          onClick={handleLogout}
        />
        <PowerButton
          icon="⏻"
          label="Shut Down"
          sublabel="Close the application"
          onClick={handleQuit}
          danger
        />
      </div>
    </div>,
    document.body,
  )
}
