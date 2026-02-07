/**
 * Root Taskbar Component
 *
 * Floating pill-style taskbar combining Windows 11/KDE Plasma 6 UX
 * with Sims-style NPC relationship tracking.
 *
 * Layout: [Plumbob][Start] | [Windows...] | [NPC Portraits] | [Tray][Clock]
 *         Zone A           | Zone B       | Zone C          | Zone D
 */

import { getCurrentWindow } from '@tauri-apps/api/window'
import { Tooltip } from '../../ui/Tooltip.js'
import { useOSThemeStore } from '../../../stores/osThemeStore.js'
import type { TaskbarProps } from './types.js'
import { TaskbarSimsHub } from './TaskbarSimsHub.js'
import { TaskbarStartButton } from './TaskbarStartButton.js'
import { TaskbarWindowList } from './TaskbarWindowList.js'
import { TaskbarNPCStrip } from './TaskbarNPCStrip.js'
import { TaskbarSystemTray } from './TaskbarSystemTray.js'

export function Taskbar({
  windows,
  onWindowClick,
  onWindowClose,
  onOpenApp,
  apps,
  phoneVisible,
  onPhoneToggle,
  onOpenNPCConversation,
  onShowDesktop,
  onSnapToGrid,
  className,
}: TaskbarProps) {
  const showHub = useOSThemeStore(s => s.taskbar.showHub)

  const handleDragStart = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return
    if ((e.target as HTMLElement).closest('[data-no-drag]')) return
    getCurrentWindow().startDragging()
  }

  return (
    <div
      onMouseDown={handleDragStart}
      onContextMenu={e => e.preventDefault()}
      className={`
        relative z-40
        mx-1 mb-1 h-12 px-2
        flex items-center gap-1.5
        bg-[rgba(20,20,30,0.75)] backdrop-blur-[20px] backdrop-saturate-[180%]
        border border-white/[0.08]
        rounded-xl
        shadow-[0_8px_32px_rgba(0,0,0,0.4)]
        cursor-grab active:cursor-grabbing
        ${className ?? ''}
      `}
    >
      {/* Zone A: Plumbob + Start + Desktop utils */}
      <div className="flex items-center gap-1 shrink-0">
        {showHub && <TaskbarSimsHub />}
        <TaskbarStartButton apps={apps} onAppClick={onOpenApp} />

        <Tooltip content="Show Desktop" placement="top">
          <button
            onClick={onShowDesktop}
            className="p-1.5 rounded-md text-white/50 hover:text-white/80 hover:bg-white/8 transition-colors duration-150 cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="2" width="14" height="10" rx="1" />
              <line x1="5" y1="14" x2="11" y2="14" />
            </svg>
          </button>
        </Tooltip>

        <Tooltip content="Snap Icons to Grid" placement="top">
          <button
            onClick={onSnapToGrid}
            className="p-1.5 rounded-md text-white/50 hover:text-white/80 hover:bg-white/8 transition-colors duration-150 cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="1" width="4" height="4" rx="0.5" />
              <rect x="1" y="11" width="4" height="4" rx="0.5" />
              <rect x="6" y="1" width="4" height="4" rx="0.5" />
              <rect x="6" y="11" width="4" height="4" rx="0.5" />
              <rect x="11" y="1" width="4" height="4" rx="0.5" />
              <rect x="11" y="11" width="4" height="4" rx="0.5" />
            </svg>
          </button>
        </Tooltip>
      </div>

      <div className="w-px h-6 bg-white/10 shrink-0" />

      {/* Zone B: Open windows */}
      <TaskbarWindowList
        windows={windows}
        onWindowClick={onWindowClick}
        onWindowClose={onWindowClose}
      />

      {/* Zone C: NPC portraits */}
      <TaskbarNPCStrip onOpenNPCConversation={onOpenNPCConversation} />

      <div className="w-px h-6 bg-white/10 shrink-0" />

      {/* Zone D: System tray + clock */}
      <TaskbarSystemTray
        phoneVisible={phoneVisible}
        onPhoneToggle={onPhoneToggle}
      />
    </div>
  )
}
