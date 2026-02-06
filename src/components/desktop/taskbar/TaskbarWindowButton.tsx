/**
 * TaskbarWindowButton
 *
 * Single window button with running dot indicator.
 * - Focused: Wide accent pill dot (5px)
 * - Running unfocused: Medium white dot (2.5px)
 * - Minimized: Small dim dot (1.5px)
 */

import type { TaskbarWindow, ContextMenuItem } from './types.js'
import { Tooltip } from '../../ui/Tooltip.js'
import { ContextMenu } from '../../ui/ContextMenu.js'
import { useContextMenu } from '../../../hooks/useContextMenu.js'

interface TaskbarWindowButtonProps {
  window: TaskbarWindow
  onClick: () => void
  onClose?: () => void
}

export function TaskbarWindowButton({ window: win, onClick, onClose }: TaskbarWindowButtonProps) {
  const ctx = useContextMenu()

  const contextItems: ContextMenuItem[] = [
    {
      label: win.isMinimized ? 'Restore' : 'Minimize',
      onClick,
    },
    ...(onClose ? [{
      label: 'Close',
      danger: true,
      onClick: () => onClose(),
    }] : []),
  ]

  // Dot indicator style
  const dotClass = win.isActive
    ? 'w-[5px] h-[3px] bg-[#00ff88] rounded-full shadow-[0_0_4px_#00ff88]'
    : win.isMinimized
      ? 'w-[3px] h-[3px] bg-white/30 rounded-full'
      : 'w-[3px] h-[3px] bg-white/60 rounded-full'

  return (
    <>
      <Tooltip content={win.title} placement="top">
        <button
          onClick={onClick}
          onContextMenu={ctx.show}
          className={`
            relative h-9 px-3 rounded-lg flex items-center gap-2
            min-w-[120px] max-w-[180px] transition-all duration-150
            ${win.isActive
              ? 'bg-white/12'
              : 'hover:bg-white/8'
            }
            ${win.isMinimized ? 'opacity-60' : ''}
          `}
        >
          <span className="text-sm shrink-0">{win.icon}</span>
          <span className="text-sm text-white/90 truncate">{win.title}</span>

          {/* Running dot indicator */}
          <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2">
            <div className={dotClass} />
          </div>
        </button>
      </Tooltip>

      {ctx.visible && (
        <ContextMenu
          items={contextItems}
          x={ctx.x}
          y={ctx.y}
          onClose={ctx.hide}
        />
      )}
    </>
  )
}
