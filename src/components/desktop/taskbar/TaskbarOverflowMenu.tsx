/**
 * TaskbarOverflowMenu
 *
 * Chevron dropdown that shows hidden windows when the window list overflows.
 */

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import type { TaskbarWindow } from './types.js'
import { Tooltip } from '../../ui/Tooltip.js'

interface TaskbarOverflowMenuProps {
  windows: TaskbarWindow[]
  onWindowClick: (id: string) => void
}

export function TaskbarOverflowMenu({ windows, onWindowClick }: TaskbarOverflowMenuProps) {
  const [open, setOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  if (windows.length === 0) return null

  const buttonRect = buttonRef.current?.getBoundingClientRect()

  return (
    <>
      <Tooltip content={`${windows.length} more window${windows.length > 1 ? 's' : ''}`} placement="top">
        <button
          ref={buttonRef}
          onClick={() => setOpen(!open)}
          className="
            h-9 w-8 rounded-lg flex items-center justify-center
            text-white/50 hover:text-white/80 hover:bg-white/10
            transition-colors duration-150
          "
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          </svg>
        </button>
      </Tooltip>

      {open && buttonRect && createPortal(
        <div
          ref={menuRef}
          className="
            fixed z-[9998] min-w-[200px] max-w-[280px]
            bg-[#1a1a2e]/95 backdrop-blur-xl
            border border-white/10 rounded-lg shadow-2xl
            py-1 animate-in fade-in slide-in-from-bottom-2 duration-150
          "
          style={{
            left: buttonRect.left,
            top: buttonRect.top - 8,
            transform: 'translateY(-100%)',
          }}
        >
          {windows.map(win => (
            <button
              key={win.id}
              onClick={() => {
                onWindowClick(win.id)
                setOpen(false)
              }}
              className={`
                w-full px-3 py-2 text-left flex items-center gap-2
                hover:bg-white/10 transition-colors
                ${win.isActive ? 'bg-white/8' : ''}
                ${win.isMinimized ? 'opacity-60' : ''}
              `}
            >
              <span className="text-sm shrink-0">{win.icon}</span>
              <span className="text-sm text-white/80 truncate">{win.title}</span>
              {win.isMinimized && (
                <span className="text-[10px] text-white/40 ml-auto">minimized</span>
              )}
            </button>
          ))}
        </div>,
        document.body,
      )}
    </>
  )
}
