import { useState, useCallback, useEffect, useRef, type ReactNode } from 'react'
import { Window, type WindowState } from './Window'
import { Taskbar, type TaskbarWindow } from './taskbar'
import { DesktopIcon } from './DesktopIcon'
import { Onboarding, type OnboardingData } from '../onboarding'
import { useOnboardingStore } from '../../stores/onboardingStore'
import { useAccountStore } from '../../stores/accountStore'
import { useThemeStore } from '../../stores/themeStore'
import { useSettingsStore, type IconPosition } from '../../stores/settingsStore.js'
import { useAwarenessStore } from '../../stores/awarenessStore.js'
import { useSocialStore } from '../../stores/socialStore.js'
import { FilesWindow } from './FilesWindow'
import { SettingsWindow } from './SettingsWindow'
import { WalletWindow } from './WalletWindow'
import { LogsWindow } from './LogsWindow'
import { ChessWindow } from './ChessWindow.js'
import { Phone } from '../phone/Phone.js'
import { Browser } from '../browser/Browser.js'
import { WorldWindow } from '../world/index.js'
import { CreativeStudioWindow } from '../studio/index.js'
import { CobHubIDE } from '../ide/index.js'
import { ServerConnectionOverlay } from '../ui/ServerConnectionOverlay.js'
import cornCobIcon from '../../assets/thecorncobb-icon.png'

interface WindowConfig {
  id: string
  title: string
  icon: ReactNode
  component: ReactNode | ((props: { onClose: () => void }) => ReactNode)
  defaultState: Partial<WindowState>
}

interface DesktopIconConfig {
  id: string
  icon: ReactNode
  label: string
  opensWindow?: string
  allowMultiple?: boolean
  action?: () => void
}

// Selection box state for rubber-band selection
interface SelectionBox {
  startX: number
  startY: number
  currentX: number
  currentY: number
}

// Default icon positions (column layout like original)
const ICON_SIZE = 80 // Width of icon
const ICON_GAP = 8 // Gap between icons
const ICON_PADDING = 16 // Padding from edge

function getDefaultIconPosition(index: number): IconPosition {
  return {
    x: ICON_PADDING,
    y: ICON_PADDING + index * (ICON_SIZE + ICON_GAP),
  }
}

export function Desktop() {
  const { completed: legacyOnboardingCompleted, setCompleted } = useOnboardingStore()
  const { activeAccountId, accounts, markOnboardingComplete } = useAccountStore()
  const { currentTheme } = useThemeStore()
  const { wallpaper, developer, desktopLayout, setIconPositions } = useSettingsStore()

  // Check if current account has completed onboarding
  const activeAccount = accounts.find((a) => a.id === activeAccountId)
  const accountOnboardingComplete = activeAccount?.hasCompletedOnboarding ?? false
  const onboardingCompleted = accountOnboardingComplete || legacyOnboardingCompleted || developer.skipBootSequence

  const [openWindows, setOpenWindows] = useState<Set<string>>(new Set())
  const [windowStates, setWindowStates] = useState<Record<string, WindowState>>({})
  const [activeWindow, setActiveWindow] = useState<string | null>(null)
  const [nextZIndex, setNextZIndex] = useState(10)
  const [selectedIcons, setSelectedIcons] = useState<Set<string>>(new Set())
  const [phoneVisible, setPhoneVisible] = useState(false)
  const [windowInstanceCounter, setWindowInstanceCounter] = useState(1)

  // Drag state for moving icons
  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef<{ x: number; y: number; iconPositions: Record<string, IconPosition> } | null>(null)

  // Selection box state for rubber-band selection
  const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null)
  const desktopRef = useRef<HTMLDivElement>(null)

  // Track which icon initiated the drag (for selection during drag)
  const dragInitiatorRef = useRef<string | null>(null)

  const handleOnboardingComplete = useCallback((data: OnboardingData) => {
    console.log('Onboarding data:', data)
    if (activeAccountId) {
      markOnboardingComplete(activeAccountId)
    }
    setCompleted(activeAccountId || 'mock-player-id')
    setOpenWindows(new Set(['browser-1']))
    setActiveWindow('browser-1')
    setWindowInstanceCounter(2)
  }, [setCompleted, activeAccountId, markOnboardingComplete])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key.toLowerCase() === 'p') setPhoneVisible(prev => !prev)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Initialize drama automation stores
  useEffect(() => {
    if (onboardingCompleted) {
      console.log('[Desktop] Initializing drama automation stores...')
      useAwarenessStore.getState().initialize()
      useSocialStore.getState().initialize()
      console.log('[Desktop] Drama automation stores initialized')
    }
  }, [onboardingCompleted])

  const CornCobIcon = <img src={cornCobIcon} alt="" className="w-5 h-5" />
  const CornCobIconLarge = <img src={cornCobIcon} alt="" className="w-12 h-12" />

  const windows: WindowConfig[] = [
    {
      id: 'browser',
      title: 'The Corn Cob',
      icon: CornCobIcon,
      component: ({ onClose }) => <Browser onClose={onClose} />,
      defaultState: { x: 50, y: 30, width: 1000, height: 650 },
    },
    {
      id: 'files',
      title: 'Files',
      icon: '📁',
      component: <FilesWindow />,
      defaultState: { x: 100, y: 80, width: 900, height: 600 },
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: '⚙️',
      component: <SettingsWindow />,
      defaultState: { x: 300, y: 100, width: 1000, height: 700 },
    },
    {
      id: 'wallet',
      title: 'Wallet',
      icon: '💰',
      component: <WalletWindow />,
      defaultState: { x: 150, y: 50, width: 600, height: 700 },
    },
    {
      id: 'logs',
      title: 'Logs',
      icon: '📊',
      component: <LogsWindow />,
      defaultState: { x: 100, y: 50, width: 900, height: 600 },
    },
    {
      id: 'chess',
      title: 'Chess.cob',
      icon: '♟️',
      component: ({ onClose }) => <ChessWindow onClose={onClose} />,
      defaultState: { x: 100, y: 50, width: 900, height: 700 },
    },
    {
      id: 'world',
      title: 'World Map',
      icon: '🗺️',
      component: ({ onClose }) => <WorldWindow onClose={onClose} />,
      defaultState: { x: 50, y: 30, width: 1100, height: 750 },
    },
    {
      id: 'studio',
      title: 'Creative Suite',
      icon: '🎨',
      component: ({ onClose }) => <CreativeStudioWindow onClose={onClose} />,
      defaultState: { x: 60, y: 20, width: 1280, height: 800 },
    },
    {
      id: 'cobhub-ide',
      title: 'CobHub IDE',
      icon: '🌽',
      component: ({ onClose }) => <CobHubIDE onClose={onClose} />,
      defaultState: { x: 50, y: 30, width: 1100, height: 750 },
    },
  ]

  const desktopIcons: DesktopIconConfig[] = [
    { id: 'browser', icon: CornCobIconLarge, label: 'The Corn Cob', opensWindow: 'browser', allowMultiple: true },
    { id: 'files', icon: '📁', label: 'Files', opensWindow: 'files' },
    { id: 'wallet', icon: '💰', label: 'Wallet', opensWindow: 'wallet' },
    { id: 'chess', icon: '♟️', label: 'Chess.cob', opensWindow: 'chess' },
    { id: 'world', icon: '🗺️', label: 'World Map', opensWindow: 'world' },
    { id: 'settings', icon: '⚙️', label: 'Settings', opensWindow: 'settings' },
    { id: 'logs', icon: '📊', label: 'Logs', opensWindow: 'logs' },
    { id: 'studio', icon: '🎨', label: 'Creative Suite', opensWindow: 'studio' },
    { id: 'cobhub-ide', icon: '🌽', label: 'CobHub IDE', opensWindow: 'cobhub-ide' },
  ]

  // Get icon position from store or use default
  const getIconPosition = useCallback((iconId: string, index: number): IconPosition => {
    return desktopLayout.iconPositions[iconId] ?? getDefaultIconPosition(index)
  }, [desktopLayout.iconPositions])

  const openWindow = useCallback((windowId: string) => {
    setOpenWindows(prev => new Set([...prev, windowId]))
    setActiveWindow(windowId)
    setNextZIndex(z => {
      setWindowStates(prev => ({
        ...prev,
        [windowId]: { ...prev[windowId], isMinimized: false, zIndex: z + 1 },
      }))
      return z + 1
    })
  }, [])

  const closeWindow = useCallback((windowId: string) => {
    setOpenWindows(prev => {
      const next = new Set(prev)
      next.delete(windowId)
      return next
    })
    if (activeWindow === windowId) setActiveWindow(null)
  }, [activeWindow])

  const focusWindow = useCallback((windowId: string) => {
    setActiveWindow(windowId)
    setNextZIndex(z => {
      setWindowStates(prev => ({
        ...prev,
        [windowId]: { ...prev[windowId], zIndex: z + 1, isMinimized: false },
      }))
      return z + 1
    })
  }, [])

  const minimizeWindow = useCallback((windowId: string) => {
    setWindowStates(prev => ({
      ...prev,
      [windowId]: { ...prev[windowId], isMinimized: true },
    }))
    if (activeWindow === windowId) setActiveWindow(null)
  }, [activeWindow])

  const handleWindowStateChange = useCallback((windowId: string, state: WindowState) => {
    setWindowStates(prev => ({ ...prev, [windowId]: state }))
  }, [])

  const handleIconDoubleClick = useCallback((icon: DesktopIconConfig) => {
    if (icon.opensWindow) {
      if (icon.allowMultiple) {
        const newId = `${icon.opensWindow}-${windowInstanceCounter}`
        setWindowInstanceCounter(prev => prev + 1)
        openWindow(newId)
      } else {
        openWindow(icon.opensWindow)
      }
    } else if (icon.action) {
      icon.action()
    }
  }, [openWindow, windowInstanceCounter])

  // Handle icon click with multi-select support
  const handleIconClick = useCallback((iconId: string, e: React.MouseEvent) => {
    if (e.ctrlKey || e.metaKey) {
      // Ctrl+Click: Toggle selection
      setSelectedIcons(prev => {
        const next = new Set(prev)
        if (next.has(iconId)) {
          next.delete(iconId)
        } else {
          next.add(iconId)
        }
        return next
      })
    } else if (e.shiftKey && selectedIcons.size > 0) {
      // Shift+Click: Range select (based on visual order)
      const iconIds = desktopIcons.map(i => i.id)
      const lastSelected = Array.from(selectedIcons).pop()!
      const lastIndex = iconIds.indexOf(lastSelected)
      const clickedIndex = iconIds.indexOf(iconId)

      const start = Math.min(lastIndex, clickedIndex)
      const end = Math.max(lastIndex, clickedIndex)

      setSelectedIcons(prev => {
        const next = new Set(prev)
        for (let i = start; i <= end; i++) {
          next.add(iconIds[i])
        }
        return next
      })
    } else {
      // Regular click: Select only this icon
      setSelectedIcons(new Set([iconId]))
    }
  }, [selectedIcons, desktopIcons])

  // Handle drag start on an icon
  const handleIconDragStart = useCallback((iconId: string, e: React.MouseEvent) => {
    // Store which icon initiated the drag
    dragInitiatorRef.current = iconId

    // Get current positions for all icons
    const currentPositions: Record<string, IconPosition> = {}
    desktopIcons.forEach((icon, index) => {
      currentPositions[icon.id] = getIconPosition(icon.id, index)
    })

    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      iconPositions: currentPositions,
    }
  }, [desktopIcons, getIconPosition])

  // Handle desktop mouse down for rubber-band selection
  const handleDesktopMouseDown = useCallback((e: React.MouseEvent) => {
    // Only start selection if clicking on empty desktop area
    if (e.target === desktopRef.current || (e.target as HTMLElement).dataset.desktopArea === 'true') {
      // Clear selection if not holding Ctrl
      if (!e.ctrlKey && !e.metaKey) {
        setSelectedIcons(new Set())
      }

      // Start selection box
      setSelectionBox({
        startX: e.clientX,
        startY: e.clientY,
        currentX: e.clientX,
        currentY: e.clientY,
      })
    }
  }, [])

  // Handle mouse move for both icon dragging and selection box
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Handle icon dragging
      if (dragStartRef.current && dragInitiatorRef.current) {
        const dx = e.clientX - dragStartRef.current.x
        const dy = e.clientY - dragStartRef.current.y

        // Start actual dragging after threshold
        if (!isDragging && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
          setIsDragging(true)

          // If the drag initiator wasn't selected, select only it
          if (!selectedIcons.has(dragInitiatorRef.current)) {
            setSelectedIcons(new Set([dragInitiatorRef.current]))
          }
        }

        if (isDragging) {
          // Update positions of all selected icons
          const iconsToMove = selectedIcons.size > 0 && selectedIcons.has(dragInitiatorRef.current)
            ? selectedIcons
            : new Set([dragInitiatorRef.current])

          const newPositions: Record<string, IconPosition> = {}
          iconsToMove.forEach(iconId => {
            const originalPos = dragStartRef.current!.iconPositions[iconId]
            if (originalPos) {
              newPositions[iconId] = {
                x: Math.max(0, originalPos.x + dx),
                y: Math.max(0, originalPos.y + dy),
              }
            }
          })

          setIconPositions(newPositions)
        }
      }

      // Handle selection box
      if (selectionBox) {
        setSelectionBox(prev => prev ? {
          ...prev,
          currentX: e.clientX,
          currentY: e.clientY,
        } : null)
      }
    }

    const handleMouseUp = () => {
      // End icon dragging
      if (isDragging) {
        setIsDragging(false)
      }
      dragStartRef.current = null
      dragInitiatorRef.current = null

      // End selection box and select icons within it
      if (selectionBox) {
        const rect = {
          left: Math.min(selectionBox.startX, selectionBox.currentX),
          right: Math.max(selectionBox.startX, selectionBox.currentX),
          top: Math.min(selectionBox.startY, selectionBox.currentY),
          bottom: Math.max(selectionBox.startY, selectionBox.currentY),
        }

        // Find icons within the selection box
        const iconsInBox: string[] = []
        desktopIcons.forEach((icon, index) => {
          const pos = getIconPosition(icon.id, index)
          const iconRect = {
            left: pos.x,
            right: pos.x + ICON_SIZE,
            top: pos.y,
            bottom: pos.y + ICON_SIZE,
          }

          // Check if icon overlaps with selection box
          if (!(iconRect.right < rect.left ||
                iconRect.left > rect.right ||
                iconRect.bottom < rect.top ||
                iconRect.top > rect.bottom)) {
            iconsInBox.push(icon.id)
          }
        })

        if (iconsInBox.length > 0) {
          setSelectedIcons(prev => {
            const next = new Set(prev)
            iconsInBox.forEach(id => next.add(id))
            return next
          })
        }

        setSelectionBox(null)
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, selectionBox, selectedIcons, desktopIcons, getIconPosition, setIconPositions])

  const handleDesktopClick = useCallback((e: React.MouseEvent) => {
    // Only clear selection if clicking on empty desktop (not on icon)
    if (e.target === desktopRef.current || (e.target as HTMLElement).dataset.desktopArea === 'true') {
      if (!e.ctrlKey && !e.metaKey) {
        setSelectedIcons(new Set())
      }
    }
  }, [])

  const handleTaskbarWindowClick = useCallback((windowId: string) => {
    const state = windowStates[windowId]
    if (state?.isMinimized || activeWindow !== windowId) focusWindow(windowId)
    else minimizeWindow(windowId)
  }, [windowStates, activeWindow, focusWindow, minimizeWindow])

  // Count open windows per base type for display numbering
  const openWindowsByType = new Map<string, string[]>()
  Array.from(openWindows).forEach(id => {
    const baseType = id.replace(/-\d+$/, '')
    const list = openWindowsByType.get(baseType) ?? []
    list.push(id)
    openWindowsByType.set(baseType, list)
  })

  const taskbarWindows: TaskbarWindow[] = Array.from(openWindows).map(id => {
    const baseType = id.replace(/-\d+$/, '')
    const config = windows.find(w => w.id === baseType)
    const state = windowStates[id]

    const siblings = openWindowsByType.get(baseType) ?? []
    const siblingIndex = siblings.indexOf(id)
    const title = siblings.length > 1 ? `${config?.title ?? baseType} (${siblingIndex + 1})` : (config?.title ?? baseType)

    return {
      id,
      title,
      icon: config?.icon ?? '📄',
      isMinimized: state?.isMinimized ?? false,
      isActive: activeWindow === id,
    }
  })

  // Determine background style based on wallpaper settings
  const backgroundStyle = wallpaper.type === 'custom' && wallpaper.customPath
    ? {
        backgroundImage: `url(${wallpaper.customPath})`,
        backgroundSize: wallpaper.customFit,
        backgroundPosition: 'center',
        backgroundRepeat: wallpaper.customFit === 'tile' ? 'repeat' : 'no-repeat' as const,
        backgroundColor: 'var(--color-bgSecondary)',
      }
    : { background: currentTheme.colors.gradient }

  // Calculate selection box rectangle
  const selectionRect = selectionBox ? {
    left: Math.min(selectionBox.startX, selectionBox.currentX),
    top: Math.min(selectionBox.startY, selectionBox.currentY),
    width: Math.abs(selectionBox.currentX - selectionBox.startX),
    height: Math.abs(selectionBox.currentY - selectionBox.startY),
  } : null

  // Show onboarding if not completed
  if (!onboardingCompleted) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center"
        style={{ background: currentTheme.colors.gradient }}
      >
        <div className="w-[800px] h-[600px] rounded-lg shadow-2xl overflow-hidden" style={{ background: 'var(--color-bg)' }}>
          <Onboarding onComplete={handleOnboardingComplete} />
        </div>
      </div>
    )
  }

  return (
    <div
      ref={desktopRef}
      className="fixed inset-0 flex flex-col overflow-hidden select-none"
      style={backgroundStyle}
      onClick={handleDesktopClick}
      onMouseDown={handleDesktopMouseDown}
    >
      <div className="flex-1 relative" data-desktop-area="true">
        {/* Desktop Icons with free positioning */}
        {desktopIcons.map((icon, index) => {
          const pos = getIconPosition(icon.id, index)
          return (
            <DesktopIcon
              key={icon.id}
              icon={icon.icon}
              label={icon.label}
              isSelected={selectedIcons.has(icon.id)}
              isDragging={isDragging && selectedIcons.has(icon.id)}
              onClick={(e) => handleIconClick(icon.id, e)}
              onDoubleClick={() => handleIconDoubleClick(icon)}
              onDragStart={(e) => handleIconDragStart(icon.id, e)}
              style={{
                position: 'absolute',
                left: pos.x,
                top: pos.y,
              }}
            />
          )
        })}

        {/* Selection Box */}
        {selectionRect && selectionRect.width > 5 && selectionRect.height > 5 && (
          <div
            className="absolute border border-[#00ff88] bg-[#00ff88]/10 pointer-events-none"
            style={{
              left: selectionRect.left,
              top: selectionRect.top,
              width: selectionRect.width,
              height: selectionRect.height,
            }}
          />
        )}

        {Array.from(openWindows).map(windowId => {
          const baseType = windowId.replace(/-\d+$/, '')
          const config = windows.find(w => w.id === baseType)
          if (!config) return null
          const state = windowStates[windowId]

          const siblings = openWindowsByType.get(baseType) ?? []
          const siblingIndex = siblings.indexOf(windowId)
          const title = siblings.length > 1 ? `${config.title} (${siblingIndex + 1})` : config.title

          const positionOffset = siblingIndex > 0 ? siblingIndex * 30 : 0
          const adjustedDefaultState = {
            ...config.defaultState,
            x: (config.defaultState.x ?? 50) + positionOffset,
            y: (config.defaultState.y ?? 30) + positionOffset,
          }

          return (
            <Window
              key={windowId}
              id={windowId}
              title={title}
              icon={config.icon}
              initialState={{ ...adjustedDefaultState, ...state }}
              zIndex={state?.zIndex ?? 1}
              isActive={activeWindow === windowId}
              onFocus={() => focusWindow(windowId)}
              onClose={() => closeWindow(windowId)}
              onMinimize={() => minimizeWindow(windowId)}
              onStateChange={s => handleWindowStateChange(windowId, s)}
            >
              {typeof config.component === 'function'
                ? config.component({ onClose: () => closeWindow(windowId) })
                : config.component}
            </Window>
          )
        })}
      </div>

      {phoneVisible && (
        <div className="absolute right-4 bottom-16 w-[340px] h-[680px] z-50">
          <Phone onClose={() => setPhoneVisible(false)} />
        </div>
      )}

      <Taskbar
        windows={taskbarWindows}
        onWindowClick={handleTaskbarWindowClick}
        onWindowClose={closeWindow}
        onStartClick={() => console.log('Start menu')}
        phoneVisible={phoneVisible}
        onPhoneToggle={() => setPhoneVisible(prev => !prev)}
        onOpenNPCConversation={(npcId) => {
          setPhoneVisible(true)
          console.log('[Desktop] Open conversation with NPC:', npcId)
        }}
      />

      {/* Server Connection Overlay - Blocks entire game when disconnected */}
      <ServerConnectionOverlay />
    </div>
  )
}
