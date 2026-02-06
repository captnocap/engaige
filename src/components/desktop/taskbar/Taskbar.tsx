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
      {/* Zone A: Plumbob + Start */}
      <div className="flex items-center gap-1 shrink-0">
        {showHub && <TaskbarSimsHub />}
        <TaskbarStartButton apps={apps} onAppClick={onOpenApp} />
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
