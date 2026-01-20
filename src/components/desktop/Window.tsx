import { useState, useRef, type ReactNode } from 'react'

export interface WindowState {
  x: number
  y: number
  width: number
  height: number
  isMaximized: boolean
  isMinimized: boolean
  zIndex: number
}

interface WindowProps {
  id: string
  title: string
  icon?: ReactNode
  children: ReactNode
  initialState?: Partial<WindowState>
  minWidth?: number
  minHeight?: number
  isActive?: boolean
  onFocus?: () => void
  onClose?: () => void
  onMinimize?: () => void
  onStateChange?: (state: WindowState) => void
  showControls?: boolean
  resizable?: boolean
  className?: string
}

const DEFAULT_STATE: WindowState = {
  x: 100,
  y: 50,
  width: 900,
  height: 600,
  isMaximized: false,
  isMinimized: false,
  zIndex: 1,
}

export function Window({
  id,
  title,
  icon,
  children,
  initialState,
  minWidth = 400,
  minHeight = 300,
  isActive = false,
  onFocus,
  onClose,
  onMinimize,
  onStateChange,
  showControls = true,
  resizable = true,
  className,
}: WindowProps) {
  const [state, setState] = useState<WindowState>({ ...DEFAULT_STATE, ...initialState })
  const windowRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{ startX: number; startY: number; startPosX: number; startPosY: number } | null>(null)
  const resizeRef = useRef<{ startX: number; startY: number; startW: number; startH: number; edge: string } | null>(null)
  const restoreStateRef = useRef<{ x: number; y: number; width: number; height: number } | null>(null)

  const updateState = (updates: Partial<WindowState>) => {
    setState(prev => {
      const next = { ...prev, ...updates }
      onStateChange?.(next)
      return next
    })
  }

  const handleTitleBarMouseDown = (e: React.MouseEvent) => {
    if (state.isMaximized) return
    e.preventDefault()
    onFocus?.()

    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startPosX: state.x,
      startPosY: state.y,
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragRef.current) return
      const dx = e.clientX - dragRef.current.startX
      const dy = e.clientY - dragRef.current.startY
      updateState({
        x: Math.max(0, dragRef.current.startPosX + dx),
        y: Math.max(0, dragRef.current.startPosY + dy),
      })
    }

    const handleMouseUp = () => {
      dragRef.current = null
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  const handleResizeMouseDown = (e: React.MouseEvent, edge: string) => {
    if (state.isMaximized || !resizable) return
    e.preventDefault()
    e.stopPropagation()
    onFocus?.()

    resizeRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startW: state.width,
      startH: state.height,
      edge,
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!resizeRef.current) return
      const dx = e.clientX - resizeRef.current.startX
      const dy = e.clientY - resizeRef.current.startY
      const { edge, startW, startH } = resizeRef.current

      const updates: Partial<WindowState> = {}

      if (edge.includes('e')) updates.width = Math.max(minWidth, startW + dx)
      if (edge.includes('w')) {
        const newWidth = Math.max(minWidth, startW - dx)
        if (newWidth !== startW) {
          updates.width = newWidth
          updates.x = state.x + (startW - newWidth)
        }
      }
      if (edge.includes('s')) updates.height = Math.max(minHeight, startH + dy)
      if (edge.includes('n')) {
        const newHeight = Math.max(minHeight, startH - dy)
        if (newHeight !== startH) {
          updates.height = newHeight
          updates.y = state.y + (startH - newHeight)
        }
      }

      updateState(updates)
    }

    const handleMouseUp = () => {
      resizeRef.current = null
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  const handleMaximize = () => {
    if (state.isMaximized) {
      if (restoreStateRef.current) {
        updateState({ ...restoreStateRef.current, isMaximized: false })
        restoreStateRef.current = null
      }
    } else {
      restoreStateRef.current = { x: state.x, y: state.y, width: state.width, height: state.height }
      updateState({ x: 0, y: 0, width: window.innerWidth, height: window.innerHeight - 48, isMaximized: true })
    }
  }

  const handleMinimize = () => {
    updateState({ isMinimized: true })
    onMinimize?.()
  }

  if (state.isMinimized) return null

  return (
    <div
      ref={windowRef}
      className={`absolute flex flex-col ${className ?? ''}`}
      style={{
        left: state.x,
        top: state.y,
        width: state.width,
        height: state.height,
        zIndex: state.zIndex,
      }}
      onMouseDown={onFocus}
    >
      <div className={`flex flex-col h-full rounded-lg overflow-hidden border shadow-2xl ${isActive ? 'border-[#444] shadow-black/50' : 'border-[#333] shadow-black/30'}`}>
        <div
          className={`flex items-center gap-2 px-3 h-9 shrink-0 select-none ${isActive ? 'bg-[#2a2a2a]' : 'bg-[#222]'}`}
          onMouseDown={handleTitleBarMouseDown}
          onDoubleClick={handleMaximize}
        >
          {icon && <div className="w-4 h-4 flex items-center justify-center text-sm">{icon}</div>}
          <span className={`text-sm flex-1 truncate ${isActive ? 'text-white' : 'text-[#888]'}`}>{title}</span>

          {showControls && (
            <div className="flex items-center gap-1" onMouseDown={e => e.stopPropagation()}>
              <button onClick={handleMinimize} className="w-6 h-6 rounded flex items-center justify-center hover:bg-[#444] text-[#888] hover:text-white transition-colors">
                <svg className="w-3 h-3" viewBox="0 0 12 12" fill="currentColor"><rect x="2" y="5.5" width="8" height="1" /></svg>
              </button>
              <button onClick={handleMaximize} className="w-6 h-6 rounded flex items-center justify-center hover:bg-[#444] text-[#888] hover:text-white transition-colors">
                {state.isMaximized ? (
                  <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1"><rect x="3" y="1" width="7" height="7" /><path d="M1 4v6h6" /></svg>
                ) : (
                  <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1"><rect x="2" y="2" width="8" height="8" /></svg>
                )}
              </button>
              <button onClick={onClose} className="w-6 h-6 rounded flex items-center justify-center hover:bg-[#e81123] text-[#888] hover:text-white transition-colors">
                <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 2l8 8M10 2l-8 8" /></svg>
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 min-h-0 bg-[#1a1a1a] overflow-hidden">{children}</div>
      </div>

      {resizable && !state.isMaximized && (
        <>
          <div className="absolute top-0 left-2 right-2 h-1 cursor-n-resize" onMouseDown={e => handleResizeMouseDown(e, 'n')} />
          <div className="absolute bottom-0 left-2 right-2 h-1 cursor-s-resize" onMouseDown={e => handleResizeMouseDown(e, 's')} />
          <div className="absolute left-0 top-2 bottom-2 w-1 cursor-w-resize" onMouseDown={e => handleResizeMouseDown(e, 'w')} />
          <div className="absolute right-0 top-2 bottom-2 w-1 cursor-e-resize" onMouseDown={e => handleResizeMouseDown(e, 'e')} />
          <div className="absolute top-0 left-0 w-2 h-2 cursor-nw-resize" onMouseDown={e => handleResizeMouseDown(e, 'nw')} />
          <div className="absolute top-0 right-0 w-2 h-2 cursor-ne-resize" onMouseDown={e => handleResizeMouseDown(e, 'ne')} />
          <div className="absolute bottom-0 left-0 w-2 h-2 cursor-sw-resize" onMouseDown={e => handleResizeMouseDown(e, 'sw')} />
          <div className="absolute bottom-0 right-0 w-2 h-2 cursor-se-resize" onMouseDown={e => handleResizeMouseDown(e, 'se')} />
        </>
      )}
    </div>
  )
}