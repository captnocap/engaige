/**
 * TaskbarSystemTray
 *
 * System tray icons: phone toggle, wifi, volume, notification bell, clock.
 * Each icon opens a functional popup panel.
 */

import { useState, useRef, useCallback } from 'react'
import { Tooltip } from '../../ui/Tooltip.js'
import { useSettingsStore } from '../../../stores/settingsStore.js'
import { useSimulationStore } from '../../../stores/simulationStore.js'
import { useNotificationStore } from '../../../stores/notificationStore.js'
import { TaskbarClock } from './TaskbarClock.js'
import { TaskbarWifiPanel } from './TaskbarWifiPanel.js'
import { TaskbarVolumePanel } from './TaskbarVolumePanel.js'
import { TaskbarNotificationPanel } from './TaskbarNotificationPanel.js'

interface TaskbarSystemTrayProps {
  phoneVisible?: boolean
  onPhoneToggle?: () => void
}

type OpenPanel = null | 'wifi' | 'volume' | 'notifications'

function TrayIcon({ children, tooltip, onClick, active, badge, iconRef }: {
  children: React.ReactNode
  tooltip: string
  onClick?: () => void
  active?: boolean
  badge?: number
  iconRef?: React.RefObject<HTMLButtonElement | null>
}) {
  return (
    <Tooltip content={tooltip} placement="top">
      <button
        ref={iconRef}
        onClick={onClick}
        className={`
          relative p-1.5 rounded-md transition-colors duration-150
          ${active
            ? 'text-[#00ff88] bg-[#00ff88]/10'
            : 'text-white/50 hover:text-white/80 hover:bg-white/8'
          }
          cursor-pointer
        `}
      >
        {children}
        {badge !== undefined && badge > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center px-0.5">
            {badge > 9 ? '9+' : badge}
          </span>
        )}
      </button>
    </Tooltip>
  )
}

// SVG Icons
function PhoneIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="1" width="8" height="14" rx="1.5" />
      <line x1="7" y1="12.5" x2="9" y2="12.5" />
    </svg>
  )
}

function WifiIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 5.5C3.7 2.8 6.2 1.5 8 1.5C9.8 1.5 12.3 2.8 15 5.5" />
      <path d="M3.5 8C5.3 6.2 6.7 5.3 8 5.3C9.3 5.3 10.7 6.2 12.5 8" />
      <path d="M6 10.5C6.8 9.7 7.4 9.2 8 9.2C8.6 9.2 9.2 9.7 10 10.5" />
      <circle cx="8" cy="13" r="0.5" fill="currentColor" />
    </svg>
  )
}

function WifiOffIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 5.5C3.7 2.8 6.2 1.5 8 1.5C9.8 1.5 12.3 2.8 15 5.5" opacity="0.3" />
      <path d="M3.5 8C5.3 6.2 6.7 5.3 8 5.3C9.3 5.3 10.7 6.2 12.5 8" opacity="0.3" />
      <path d="M6 10.5C6.8 9.7 7.4 9.2 8 9.2C8.6 9.2 9.2 9.7 10 10.5" opacity="0.3" />
      <circle cx="8" cy="13" r="0.5" fill="currentColor" opacity="0.3" />
      <line x1="2" y1="2" x2="14" y2="14" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function VolumeIcon({ muted }: { muted: boolean }) {
  if (muted) {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 6.5V9.5H4.5L8 13V3L4.5 6.5H2Z" fill="currentColor" opacity="0.15" />
        <line x1="10" y1="6" x2="14" y2="10" />
        <line x1="14" y1="6" x2="10" y2="10" />
      </svg>
    )
  }
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 6.5V9.5H4.5L8 13V3L4.5 6.5H2Z" fill="currentColor" opacity="0.3" />
      <path d="M10.5 5C11.5 6 11.5 10 10.5 11" />
      <path d="M12.5 3C14.5 5 14.5 11 12.5 13" />
    </svg>
  )
}

function BellIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 1.5C5.5 1.5 4 3.5 4 6V9L2.5 11.5H13.5L12 9V6C12 3.5 10.5 1.5 8 1.5Z" />
      <path d="M6.5 12.5C6.5 13.3 7.2 14 8 14C8.8 14 9.5 13.3 9.5 12.5" />
    </svg>
  )
}

export function TaskbarSystemTray({ phoneVisible, onPhoneToggle }: TaskbarSystemTrayProps) {
  const [openPanel, setOpenPanel] = useState<OpenPanel>(null)

  const wifiRef = useRef<HTMLButtonElement>(null)
  const volumeRef = useRef<HTMLButtonElement>(null)
  const bellRef = useRef<HTMLButtonElement>(null)

  const masterMuted = useSettingsStore(s => s.audio.masterMuted)
  const masterVolume = useSettingsStore(s => s.audio.masterVolume)
  const isPaused = useSimulationStore(s => s.isPaused)
  const isRunning = useSimulationStore(s => s.isRunning)
  const notifUnread = useNotificationStore(s => s.unreadCount())

  // WiFi is "connected" when simulation is not paused (or not running)
  const wifiConnected = !isRunning || !isPaused

  const togglePanel = useCallback((panel: OpenPanel) => {
    setOpenPanel(prev => prev === panel ? null : panel)
  }, [])

  const closePanel = useCallback(() => {
    setOpenPanel(null)
  }, [])

  const volumeTooltip = masterMuted ? 'Volume: Muted' : `Volume: ${masterVolume}%`

  return (
    <div className="flex items-center gap-0.5" data-no-drag>
      <TrayIcon tooltip="Toggle Phone (P)" onClick={onPhoneToggle} active={phoneVisible}>
        <PhoneIcon />
      </TrayIcon>

      <TrayIcon
        tooltip={wifiConnected ? 'WiFi: Connected' : 'WiFi: Disconnected'}
        onClick={() => togglePanel('wifi')}
        active={openPanel === 'wifi'}
        iconRef={wifiRef}
      >
        {wifiConnected ? <WifiIcon /> : <WifiOffIcon />}
      </TrayIcon>

      <TrayIcon
        tooltip={volumeTooltip}
        onClick={() => togglePanel('volume')}
        active={openPanel === 'volume'}
        iconRef={volumeRef}
      >
        <VolumeIcon muted={masterMuted} />
      </TrayIcon>

      <TrayIcon
        tooltip="Notifications"
        onClick={() => togglePanel('notifications')}
        active={openPanel === 'notifications'}
        badge={notifUnread}
        iconRef={bellRef}
      >
        <BellIcon />
      </TrayIcon>

      <div className="w-px h-5 bg-white/10 mx-1" />

      <TaskbarClock />

      {/* Panels */}
      {openPanel === 'wifi' && wifiRef.current && (
        <TaskbarWifiPanel
          anchorRect={wifiRef.current.getBoundingClientRect()}
          onClose={closePanel}
        />
      )}
      {openPanel === 'volume' && volumeRef.current && (
        <TaskbarVolumePanel
          anchorRect={volumeRef.current.getBoundingClientRect()}
          onClose={closePanel}
        />
      )}
      {openPanel === 'notifications' && bellRef.current && (
        <TaskbarNotificationPanel
          anchorRect={bellRef.current.getBoundingClientRect()}
          onClose={closePanel}
        />
      )}
    </div>
  )
}
