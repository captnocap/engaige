/**
 * TaskbarWindowList
 *
 * Maps open windows to buttons with overflow detection via ResizeObserver.
 * When there are too many windows to fit, shows a chevron overflow menu.
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import type { TaskbarWindow } from './types.js'
import { TaskbarWindowButton } from './TaskbarWindowButton.js'
import { TaskbarOverflowMenu } from './TaskbarOverflowMenu.js'

interface TaskbarWindowListProps {
  windows: TaskbarWindow[]
  onWindowClick: (id: string) => void
  onWindowClose?: (id: string) => void
}

const BUTTON_MIN_WIDTH = 120
const BUTTON_GAP = 4

export function TaskbarWindowList({ windows, onWindowClick, onWindowClose }: TaskbarWindowListProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [visibleCount, setVisibleCount] = useState(windows.length)

  const calculateVisibleCount = useCallback(() => {
    if (!containerRef.current) return
    const containerWidth = containerRef.current.clientWidth
    // Reserve space for the overflow chevron (32px + gap)
    const available = containerWidth - 36
    const maxFit = Math.max(1, Math.floor(available / (BUTTON_MIN_WIDTH + BUTTON_GAP)))
    setVisibleCount(Math.min(maxFit, windows.length))
  }, [windows.length])

  useEffect(() => {
    calculateVisibleCount()

    const container = containerRef.current
    if (!container) return

    const observer = new ResizeObserver(calculateVisibleCount)
    observer.observe(container)
    return () => observer.disconnect()
  }, [calculateVisibleCount])

  const visibleWindows = windows.slice(0, visibleCount)
  const overflowWindows = windows.slice(visibleCount)

  return (
    <div ref={containerRef} className="flex-1 flex items-center gap-1 min-w-0">
      {visibleWindows.map(win => (
        <TaskbarWindowButton
          key={win.id}
          window={win}
          onClick={() => onWindowClick(win.id)}
          onClose={onWindowClose ? () => onWindowClose(win.id) : undefined}
        />
      ))}

      {overflowWindows.length > 0 && (
        <TaskbarOverflowMenu
          windows={overflowWindows}
          onWindowClick={onWindowClick}
        />
      )}
    </div>
  )
}
