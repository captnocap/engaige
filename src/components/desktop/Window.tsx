import { useState, useRef, useEffect, useCallback, type ReactNode } from 'react'
import { useOSThemeStore, type WindowButtonStyle } from '../../stores/osThemeStore.js'
import { detectSnapZone, type SnapZone } from './windowSnap.js'

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
  zIndex?: number
  minWidth?: number
  minHeight?: number
  isActive?: boolean
  onFocus?: () => void
  onClose?: () => void
  onMinimize?: () => void
  onStateChange?: (state: WindowState) => void
  onSnapZoneChange?: (zone: SnapZone) => void
  onSnapApply?: (zone: SnapZone) => void
  preSnapSize?: { width: number; height: number }
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
  zIndex = 1,
  minWidth = 400,
  minHeight = 300,
  isActive = false,
  onFocus,
  onClose,
  onMinimize,
  onStateChange,
  onSnapZoneChange,
  onSnapApply,
  preSnapSize,
  showControls = true,
  resizable = true,
  className,
}: WindowProps) {
  const [state, setState] = useState<WindowState>({ ...DEFAULT_STATE, ...initialState })
  const [isHoveringControls, setIsHoveringControls] = useState(false)
  const windowRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{ startX: number; startY: number; startPosX: number; startPosY: number } | null>(null)
  const resizeRef = useRef<{ startX: number; startY: number; startW: number; startH: number; edge: string } | null>(null)
  const restoreStateRef = useRef<{ x: number; y: number; width: number; height: number } | null>(null)

  // Get OS theme config
  const windowChrome = useOSThemeStore(s => s.windowChrome)

  // Sync isMinimized state from parent (for taskbar restore)
  useEffect(() => {
    if (initialState?.isMinimized !== undefined && initialState.isMinimized !== state.isMinimized) {
      setState(prev => ({ ...prev, isMinimized: initialState.isMinimized! }))
    }
  }, [initialState?.isMinimized])

  // Notify parent of state changes after render commits
  const onStateChangeRef = useRef(onStateChange)
  onStateChangeRef.current = onStateChange
  useEffect(() => {
    onStateChangeRef.current?.(state)
  }, [state])

  // Update maximized window dimensions when viewport resizes (e.g., fullscreen toggle)
  useEffect(() => {
    if (!state.isMaximized) return

    const handleResize = () => {
      setState(prev => {
        if (!prev.isMaximized) return prev
        return {
          ...prev,
          width: window.innerWidth,
          height: window.innerHeight - 48, // Account for taskbar
        }
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [state.isMaximized])

  const updateState = useCallback((updates: Partial<WindowState>) => {
    setState(prev => ({ ...prev, ...updates }))
  }, [])

  const handleTitleBarMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    onFocus?.()

    // If maximized, we'll restore on first move
    const wasMaximized = state.isMaximized
    // If snapped (has preSnapSize), we'll un-snap on first move
    const wasSnapped = !!preSnapSize
    const restoreWidth = preSnapSize?.width ?? restoreStateRef.current?.width ?? DEFAULT_STATE.width
    const restoreHeight = preSnapSize?.height ?? restoreStateRef.current?.height ?? DEFAULT_STATE.height

    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startPosX: state.x,
      startPosY: state.y,
    }

    // Track current width during drag (changes after un-snap restore)
    let dragWidth = state.width
    const vW = window.innerWidth
    const vH = window.innerHeight
    const maxY = vH - 48 - 36 // keep title bar above taskbar (48 = taskbar height)

    console.log(`[SNAP-DEBUG] titlebar mousedown: window="${id}" mouse=(${e.clientX},${e.clientY}) windowPos=(${state.x},${state.y}) windowSize=(${state.width}x${state.height}) viewport=(${vW}x${vH})`)

    let hasRestored = false
    let currentSnapZone: SnapZone = null
    let moveCount = 0

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragRef.current) return
      const dx = e.clientX - dragRef.current.startX
      const dy = e.clientY - dragRef.current.startY

      // If maximized/snapped and user starts dragging, restore the window
      if ((wasMaximized || wasSnapped) && !hasRestored && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
        hasRestored = true
        dragWidth = restoreWidth

        const cursorRatioX = (e.clientX - (wasMaximized ? 0 : state.x)) / (wasMaximized ? vW : state.width)
        const newX = e.clientX - (restoreWidth * Math.min(Math.max(cursorRatioX, 0), 1))
        const newY = e.clientY - 15

        dragRef.current.startX = e.clientX
        dragRef.current.startY = e.clientY
        dragRef.current.startPosX = newX
        dragRef.current.startPosY = newY

        const maxX = Math.max(0, vW - restoreWidth)
        updateState({
          x: Math.max(0, Math.min(maxX, newX)),
          y: Math.max(0, Math.min(maxY, newY)),
          width: restoreWidth,
          height: restoreHeight,
          isMaximized: false,
        })
        restoreStateRef.current = null
        // Clear snap state
        if (wasSnapped) onSnapApply?.(null)
        return
      }

      // Normal dragging (not maximized/snapped or already restored)
      if ((!wasMaximized && !wasSnapped) || hasRestored) {
        const unclampedX = dragRef.current.startPosX + dx
        const unclampedY = dragRef.current.startPosY + dy
        const maxX = Math.max(0, vW - dragWidth)
        const newX = Math.max(0, Math.min(maxX, unclampedX))
        const newY = Math.max(0, Math.min(maxY, unclampedY))
        updateState({ x: newX, y: newY })

        // Detect snap zone: when the window hits a desktop boundary,
        // feed detectSnapZone coordinates that are at the edge
        let snapX = e.clientX
        let snapY = e.clientY
        if (unclampedX < 0) snapX = 0                          // window hit left wall
        if (unclampedX + dragWidth > vW) snapX = vW            // window hit right wall
        if (unclampedY < 0) snapY = 0                          // window hit top wall
        const zone = detectSnapZone(snapX, snapY, vW, vH)

        moveCount++
        if (moveCount % 10 === 0) {
          console.log(`[SNAP-DEBUG] dragging: mouse=(${e.clientX},${e.clientY}) unclamped=(${Math.round(unclampedX)},${Math.round(unclampedY)}) windowPos=(${Math.round(newX)},${Math.round(newY)}) snapCoords=(${snapX},${snapY}) zone=${zone}`)
        }

        if (zone !== currentSnapZone) {
          currentSnapZone = zone
          console.log(`[SNAP-DEBUG] snap zone changed: ${zone} at unclamped=(${Math.round(unclampedX)},${Math.round(unclampedY)}) snapCoords=(${snapX},${snapY})`)
          onSnapZoneChange?.(zone)
        }
      }
    }

    const handleMouseUp = (e: MouseEvent) => {
      console.log(`[SNAP-DEBUG] mouseup: mouse=(${e.clientX},${e.clientY}) snapZone=${currentSnapZone}`)
      // If releasing over a snap zone, apply it
      if (currentSnapZone) {
        console.log(`[SNAP-DEBUG] applying snap zone: ${currentSnapZone}`)
        onSnapApply?.(currentSnapZone)
      }
      // Always clear the preview
      onSnapZoneChange?.(null)
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

    // If resizing a snapped window, clear the snap state
    // so the user's resize is treated as the new "real" size
    if (preSnapSize) {
      onSnapApply?.(null)
    }

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
        zIndex,
      }}
      onMouseDown={onFocus}
    >
      <div
        className={`flex flex-col h-full overflow-hidden border shadow-2xl ${isActive ? 'border-[#444] shadow-black/50' : 'border-[#333] shadow-black/30'}`}
        style={{ borderRadius: windowChrome.cornerRadius }}
      >
        {/* Title Bar */}
        <div
          className={`flex items-center gap-2 px-3 shrink-0 select-none ${isActive ? 'bg-[#2a2a2a]' : 'bg-[#222]'}`}
          style={{ height: windowChrome.titleBarHeight }}
          onMouseDown={handleTitleBarMouseDown}
          onDoubleClick={handleMaximize}
          onContextMenu={e => e.preventDefault()}
        >
          {/* Left side controls (Mac style) */}
          {showControls && windowChrome.buttonPosition === 'left' && (
            <WindowControls
              style={windowChrome.buttonStyle}
              isActive={isActive}
              isHovering={isHoveringControls}
              onHoverChange={setIsHoveringControls}
              onMinimize={handleMinimize}
              onMaximize={handleMaximize}
              onClose={onClose}
              isMaximized={state.isMaximized}
            />
          )}

          {/* Icon */}
          {icon && windowChrome.buttonPosition === 'right' && (
            <div className="w-4 h-4 flex items-center justify-center text-sm">{icon}</div>
          )}

          {/* Title */}
          <span className={`text-sm flex-1 truncate ${windowChrome.buttonPosition === 'left' ? 'text-center' : ''} ${isActive ? 'text-white' : 'text-[#888]'}`}>
            {title}
          </span>

          {/* Icon for Mac (centered title, icon on right of controls) */}
          {icon && windowChrome.buttonPosition === 'left' && (
            <div className="w-4 h-4 flex items-center justify-center text-sm opacity-0">{icon}</div>
          )}

          {/* Right side controls (Windows/Linux style) */}
          {showControls && windowChrome.buttonPosition === 'right' && (
            <WindowControls
              style={windowChrome.buttonStyle}
              isActive={isActive}
              isHovering={isHoveringControls}
              onHoverChange={setIsHoveringControls}
              onMinimize={handleMinimize}
              onMaximize={handleMaximize}
              onClose={onClose}
              isMaximized={state.isMaximized}
            />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 bg-[#1a1a1a] overflow-hidden">{children}</div>
      </div>

      {/* Resize handles */}
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

// ============================================================================
// Window Controls Component
// ============================================================================

interface WindowControlsProps {
  style: WindowButtonStyle
  isActive: boolean
  isHovering: boolean
  onHoverChange: (hovering: boolean) => void
  onMinimize: () => void
  onMaximize: () => void
  onClose?: () => void
  isMaximized: boolean
}

function WindowControls({
  style,
  isActive,
  isHovering,
  onHoverChange,
  onMinimize,
  onMaximize,
  onClose,
  isMaximized,
}: WindowControlsProps) {
  if (style === 'traffic-light') {
    return <MacTrafficLights isActive={isActive} isHovering={isHovering} onHoverChange={onHoverChange} onMinimize={onMinimize} onMaximize={onMaximize} onClose={onClose} />
  }

  if (style === 'windows') {
    return <WindowsControls onMinimize={onMinimize} onMaximize={onMaximize} onClose={onClose} isMaximized={isMaximized} />
  }

  // Linux style - similar to Windows but with different icons
  return <LinuxControls onMinimize={onMinimize} onMaximize={onMaximize} onClose={onClose} isMaximized={isMaximized} />
}

// ============================================================================
// Mac Traffic Light Buttons
// ============================================================================

interface MacTrafficLightsProps {
  isActive: boolean
  isHovering: boolean
  onHoverChange: (hovering: boolean) => void
  onMinimize: () => void
  onMaximize: () => void
  onClose?: () => void
}

function MacTrafficLights({ isActive, isHovering, onHoverChange, onMinimize, onMaximize, onClose }: MacTrafficLightsProps) {
  return (
    <div
      className="flex items-center gap-2"
      onMouseEnter={() => onHoverChange(true)}
      onMouseLeave={() => onHoverChange(false)}
      onMouseDown={e => e.stopPropagation()}
    >
      {/* Close - Red */}
      <button
        onClick={onClose}
        className="w-3 h-3 rounded-full flex items-center justify-center transition-colors group"
        style={{ background: isActive ? '#ff5f57' : '#3c3c3c' }}
      >
        {isHovering && (
          <svg className="w-2 h-2 text-black/60" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 3l6 6M9 3l-6 6" />
          </svg>
        )}
      </button>

      {/* Minimize - Yellow */}
      <button
        onClick={onMinimize}
        className="w-3 h-3 rounded-full flex items-center justify-center transition-colors"
        style={{ background: isActive ? '#febc2e' : '#3c3c3c' }}
      >
        {isHovering && (
          <svg className="w-2 h-2 text-black/60" viewBox="0 0 12 12" fill="currentColor">
            <rect x="2" y="5" width="8" height="2" />
          </svg>
        )}
      </button>

      {/* Maximize - Green */}
      <button
        onClick={onMaximize}
        className="w-3 h-3 rounded-full flex items-center justify-center transition-colors"
        style={{ background: isActive ? '#28c840' : '#3c3c3c' }}
      >
        {isHovering && (
          <svg className="w-2 h-2 text-black/60" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M2 4l4-2 4 2M2 8l4 2 4-2M2 4v4M10 4v4" />
          </svg>
        )}
      </button>
    </div>
  )
}

// ============================================================================
// Windows Style Buttons
// ============================================================================

interface WindowsControlsProps {
  onMinimize: () => void
  onMaximize: () => void
  onClose?: () => void
  isMaximized: boolean
}

function WindowsControls({ onMinimize, onMaximize, onClose, isMaximized }: WindowsControlsProps) {
  return (
    <div className="flex items-center" onMouseDown={e => e.stopPropagation()}>
      {/* Minimize */}
      <button
        onClick={onMinimize}
        className="w-11 h-8 flex items-center justify-center hover:bg-[#404040] text-[#888] hover:text-white transition-colors"
      >
        <svg className="w-3 h-3" viewBox="0 0 12 12" fill="currentColor">
          <rect x="2" y="5.5" width="8" height="1" />
        </svg>
      </button>

      {/* Maximize/Restore */}
      <button
        onClick={onMaximize}
        className="w-11 h-8 flex items-center justify-center hover:bg-[#404040] text-[#888] hover:text-white transition-colors"
      >
        {isMaximized ? (
          <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1">
            <rect x="3" y="1" width="7" height="7" />
            <path d="M1 4v6h6" />
          </svg>
        ) : (
          <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1">
            <rect x="2" y="2" width="8" height="8" />
          </svg>
        )}
      </button>

      {/* Close */}
      <button
        onClick={onClose}
        className="w-11 h-8 flex items-center justify-center hover:bg-[#e81123] text-[#888] hover:text-white transition-colors"
      >
        <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M2 2l8 8M10 2l-8 8" />
        </svg>
      </button>
    </div>
  )
}

// ============================================================================
// Linux Style Buttons
// ============================================================================

function LinuxControls({ onMinimize, onMaximize, onClose, isMaximized }: WindowsControlsProps) {
  return (
    <div className="flex items-center gap-1" onMouseDown={e => e.stopPropagation()}>
      {/* Minimize */}
      <button
        onClick={onMinimize}
        className="w-6 h-6 rounded flex items-center justify-center hover:bg-[#444] text-[#888] hover:text-white transition-colors"
      >
        <svg className="w-3 h-3" viewBox="0 0 12 12" fill="currentColor">
          <rect x="2" y="9" width="8" height="1" />
        </svg>
      </button>

      {/* Maximize/Restore */}
      <button
        onClick={onMaximize}
        className="w-6 h-6 rounded flex items-center justify-center hover:bg-[#444] text-[#888] hover:text-white transition-colors"
      >
        {isMaximized ? (
          <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1">
            <rect x="1" y="3" width="6" height="6" />
            <path d="M5 3V1h6v6h-2" />
          </svg>
        ) : (
          <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1">
            <rect x="2" y="2" width="8" height="8" />
          </svg>
        )}
      </button>

      {/* Close */}
      <button
        onClick={onClose}
        className="w-6 h-6 rounded flex items-center justify-center hover:bg-[#c42b1c] text-[#888] hover:text-white transition-colors"
      >
        <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M2 2l8 8M10 2l-8 8" />
        </svg>
      </button>
    </div>
  )
}
