/**
 * TaskbarSystemTray
 *
 * System tray icons: phone toggle, decorative wifi/volume, notification bell, clock.
 */

import { Tooltip } from '../../ui/Tooltip.js'
import { TaskbarClock } from './TaskbarClock.js'

interface TaskbarSystemTrayProps {
  phoneVisible?: boolean
  onPhoneToggle?: () => void
  totalUnread?: number
}

function TrayIcon({ children, tooltip, onClick, active, badge }: {
  children: React.ReactNode
  tooltip: string
  onClick?: () => void
  active?: boolean
  badge?: number
}) {
  return (
    <Tooltip content={tooltip} placement="top">
      <button
        onClick={onClick}
        className={`
          relative p-1.5 rounded-md transition-colors duration-150
          ${active
            ? 'text-[#00ff88] bg-[#00ff88]/10'
            : 'text-white/50 hover:text-white/80 hover:bg-white/8'
          }
          ${onClick ? 'cursor-pointer' : 'cursor-default'}
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

// Phone icon SVG
function PhoneIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="1" width="8" height="14" rx="1.5" />
      <line x1="7" y1="12.5" x2="9" y2="12.5" />
    </svg>
  )
}

// Wifi icon SVG (decorative)
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

// Volume icon SVG (decorative)
function VolumeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 6.5V9.5H4.5L8 13V3L4.5 6.5H2Z" fill="currentColor" opacity="0.3" />
      <path d="M10.5 5C11.5 6 11.5 10 10.5 11" />
      <path d="M12.5 3C14.5 5 14.5 11 12.5 13" />
    </svg>
  )
}

// Bell icon SVG
function BellIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 1.5C5.5 1.5 4 3.5 4 6V9L2.5 11.5H13.5L12 9V6C12 3.5 10.5 1.5 8 1.5Z" />
      <path d="M6.5 12.5C6.5 13.3 7.2 14 8 14C8.8 14 9.5 13.3 9.5 12.5" />
    </svg>
  )
}

export function TaskbarSystemTray({ phoneVisible, onPhoneToggle, totalUnread = 0 }: TaskbarSystemTrayProps) {
  return (
    <div className="flex items-center gap-0.5">
      <TrayIcon tooltip="Toggle Phone (P)" onClick={onPhoneToggle} active={phoneVisible}>
        <PhoneIcon />
      </TrayIcon>

      <TrayIcon tooltip="WiFi: Connected">
        <WifiIcon />
      </TrayIcon>

      <TrayIcon tooltip="Volume: 80%">
        <VolumeIcon />
      </TrayIcon>

      <TrayIcon tooltip="Notifications" badge={totalUnread}>
        <BellIcon />
      </TrayIcon>

      <div className="w-px h-5 bg-white/10 mx-1" />

      <TaskbarClock />
    </div>
  )
}
