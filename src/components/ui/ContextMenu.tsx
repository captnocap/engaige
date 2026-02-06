/**
 * Reusable Context Menu Component
 *
 * Portal-rendered right-click context menu.
 * Use with the useContextMenu hook for easy state management.
 */

import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import type { ContextMenuItem } from '../desktop/taskbar/types.js'

interface ContextMenuProps {
  items: ContextMenuItem[]
  x: number
  y: number
  onClose: () => void
}

export function ContextMenu({ items, x, y, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  // Adjust position to stay within viewport
  useEffect(() => {
    if (!menuRef.current) return
    const rect = menuRef.current.getBoundingClientRect()
    const el = menuRef.current

    if (rect.right > window.innerWidth - 8) {
      el.style.left = `${x - rect.width}px`
    }
    if (rect.bottom > window.innerHeight - 8) {
      el.style.top = `${y - rect.height}px`
    }
  }, [x, y])

  // Close on outside click or Escape
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    // Use capture phase so the click handler fires before any other handlers
    document.addEventListener('mousedown', handleClick, true)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClick, true)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  return createPortal(
    <div
      ref={menuRef}
      className="
        fixed z-[9998] min-w-[160px]
        bg-[#1a1a2e]/95 backdrop-blur-xl
        border border-white/10 rounded-lg shadow-2xl
        py-1 animate-in fade-in zoom-in-95 duration-100
      "
      style={{ left: x, top: y }}
    >
      {items.map((item, i) => {
        if (item.separator) {
          return <div key={i} className="my-1 border-t border-white/10" />
        }

        return (
          <button
            key={i}
            onClick={() => {
              if (!item.disabled) {
                item.onClick()
                onClose()
              }
            }}
            disabled={item.disabled}
            className={`
              w-full px-3 py-1.5 text-left text-sm flex items-center gap-2
              transition-colors
              ${item.disabled
                ? 'text-white/30 cursor-not-allowed'
                : item.danger
                  ? 'text-red-400 hover:bg-red-500/20'
                  : 'text-white/80 hover:bg-white/10'
              }
            `}
          >
            {item.icon && <span className="w-4 text-center">{item.icon}</span>}
            {item.label}
          </button>
        )
      })}
    </div>,
    document.body,
  )
}
