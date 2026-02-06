/**
 * Reusable Tooltip Component
 *
 * Portal-rendered tooltip with configurable delay and placement.
 * Shows on hover after a delay, disappears on mouse leave.
 */

import { useState, useRef, useCallback, useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface TooltipProps {
  content: ReactNode
  children: ReactNode
  delay?: number
  placement?: 'top' | 'bottom' | 'left' | 'right'
  className?: string
}

export function Tooltip({
  content,
  children,
  delay = 500,
  placement = 'top',
  className = '',
}: TooltipProps) {
  const [visible, setVisible] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const triggerRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const show = useCallback(() => {
    timerRef.current = setTimeout(() => {
      if (!triggerRef.current) return
      const rect = triggerRef.current.getBoundingClientRect()

      let x = rect.left + rect.width / 2
      let y: number

      switch (placement) {
        case 'top':
          y = rect.top - 8
          break
        case 'bottom':
          y = rect.bottom + 8
          break
        case 'left':
          x = rect.left - 8
          y = rect.top + rect.height / 2
          break
        case 'right':
          x = rect.right + 8
          y = rect.top + rect.height / 2
          break
      }

      setPosition({ x, y: y! })
      setVisible(true)
    }, delay)
  }, [delay, placement])

  const hide = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    setVisible(false)
  }, [])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  // Adjust tooltip position to stay within viewport
  useEffect(() => {
    if (!visible || !tooltipRef.current) return
    const tooltip = tooltipRef.current
    const rect = tooltip.getBoundingClientRect()

    let adjustedX = position.x
    let adjustedY = position.y

    // Keep within horizontal bounds
    if (rect.left < 8) adjustedX += 8 - rect.left
    if (rect.right > window.innerWidth - 8) adjustedX -= rect.right - window.innerWidth + 8

    // Keep within vertical bounds
    if (rect.top < 8) adjustedY += 8 - rect.top
    if (rect.bottom > window.innerHeight - 8) adjustedY -= rect.bottom - window.innerHeight + 8

    if (adjustedX !== position.x || adjustedY !== position.y) {
      setPosition({ x: adjustedX, y: adjustedY })
    }
  }, [visible, position.x, position.y])

  const placementStyles: Record<string, React.CSSProperties> = {
    top: { left: position.x, top: position.y, transform: 'translate(-50%, -100%)' },
    bottom: { left: position.x, top: position.y, transform: 'translate(-50%, 0)' },
    left: { left: position.x, top: position.y, transform: 'translate(-100%, -50%)' },
    right: { left: position.x, top: position.y, transform: 'translate(0, -50%)' },
  }

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={show}
        onMouseLeave={hide}
        className="inline-flex"
      >
        {children}
      </div>
      {visible && createPortal(
        <div
          ref={tooltipRef}
          className={`
            fixed z-[9999] pointer-events-none
            px-2.5 py-1.5 rounded-lg text-xs font-medium
            bg-[#1a1a2e]/95 text-white/90 backdrop-blur-sm
            border border-white/10 shadow-lg
            animate-in fade-in duration-150
            ${className}
          `}
          style={placementStyles[placement]}
        >
          {content}
        </div>,
        document.body,
      )}
    </>
  )
}
