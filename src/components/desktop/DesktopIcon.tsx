import { useState, type ReactNode } from 'react'

interface DesktopIconProps {
  icon: ReactNode
  label: string
  onClick?: () => void
  onDoubleClick?: () => void
  isSelected?: boolean
  className?: string
}

export function DesktopIcon({
  icon,
  label,
  onClick,
  onDoubleClick,
  isSelected = false,
  className,
}: DesktopIconProps) {
  const [lastClick, setLastClick] = useState(0)

  const handleClick = (e: React.MouseEvent) => {
    const now = Date.now()
    const isDoubleClick = now - lastClick < 300
    setLastClick(now)

    if (isDoubleClick) onDoubleClick?.()
    else onClick?.()
  }

  return (
    <button
      onClick={handleClick}
      className={`flex flex-col items-center gap-1 p-2 rounded-lg w-20 transition-colors select-none ${isSelected ? 'bg-[#00ff88]/20 outline outline-1 outline-[#00ff88]/50' : 'hover:bg-white/5'} ${className ?? ''}`}
    >
      <div className="text-4xl drop-shadow-lg">{icon}</div>
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