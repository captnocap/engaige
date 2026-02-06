import { useState, useRef, useEffect, type ReactNode } from 'react'

interface DesktopIconProps {
  icon: ReactNode
  label: string
  onClick?: (e: React.MouseEvent) => void
  onDoubleClick?: () => void
  onDragStart?: (e: React.MouseEvent) => void
  onContextMenu?: (e: React.MouseEvent) => void
  isSelected?: boolean
  isDragging?: boolean
  className?: string
  style?: React.CSSProperties
}

export function DesktopIcon({
  icon,
  iconImage,
  label,
  onClick,
  onDoubleClick,
  onDragStart,
  onContextMenu,
  isSelected = false,
  isDragging = false,
  className,
  style,
}: DesktopIconProps & { iconImage?: string }) {
  const [lastClick, setLastClick] = useState(0)
  const mouseDownPos = useRef<{ x: number; y: number } | null>(null)
  const hasDragged = useRef(false)

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only handle left mouse button
    if (e.button !== 0) return

    mouseDownPos.current = { x: e.clientX, y: e.clientY }
    hasDragged.current = false

    // Notify parent about potential drag start
    onDragStart?.(e)
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    if (hasDragged.current) {
      // Don't trigger click if we were dragging
      mouseDownPos.current = null
      hasDragged.current = false
      return
    }

    // Handle click/double-click
    const now = Date.now()
    const isDoubleClick = now - lastClick < 300
    setLastClick(now)

    if (isDoubleClick) {
      onDoubleClick?.()
    } else {
      onClick?.(e)
    }

    mouseDownPos.current = null
  }

  // Track if we've moved enough to consider it a drag
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (mouseDownPos.current) {
        const dx = Math.abs(e.clientX - mouseDownPos.current.x)
        const dy = Math.abs(e.clientY - mouseDownPos.current.y)
        if (dx > 5 || dy > 5) {
          hasDragged.current = true
        }
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <button
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onContextMenu={onContextMenu}
      className={`
        flex flex-col items-center gap-1 p-2 rounded-lg w-20 transition-colors select-none group
        ${isSelected ? 'bg-[#00ff88]/20 outline outline-1 outline-[#00ff88]/50' : 'hover:bg-white/5'}
        ${isDragging ? 'opacity-50 pointer-events-none' : ''}
        ${className ?? ''}
      `}
      style={style}
    >
      <div className={`relative flex items-center justify-center transition-transform group-hover:scale-105 ${iconImage ? 'w-12 h-12' : 'text-4xl'} drop-shadow-lg`}>
        {iconImage ? (
          <img
            src={iconImage}
            alt={label}
            className="w-full h-full object-cover rounded-xl shadow-md"
            style={{ borderRadius: '22%' }}
          />
        ) : (
          icon
        )}
      </div>
      <span
        className={`text-xs text-center leading-tight px-1 py-0.5 rounded ${isSelected ? 'bg-[#00ff88] text-black' : 'text-white drop-shadow-md'}`}
        style={{ textShadow: isSelected ? 'none' : '0 1px 2px rgba(0,0,0,0.8)' }}
      >
        {label}
      </span>
    </button>
  )
}

export function BrowserIcon() {
  return (
    <div className="relative">
      <span>🌐</span>
      <span className="absolute -bottom-1 -right-1 text-lg">💩</span>
    </div>
  )
}

export function SettingsIcon() {
  return <span>⚙️</span>
}

export function FilesIcon() {
  return <span>📁</span>
}

export function TerminalIcon() {
  return <span>💻</span>
}

export function PhoneIcon() {
  return <span>📱</span>
}
