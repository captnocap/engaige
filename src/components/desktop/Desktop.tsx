import { useState, useCallback, useEffect, type ReactNode } from 'react'
import { Window, type WindowState } from './Window'
import { Taskbar, type TaskbarWindow } from './Taskbar'
import { DesktopIcon } from './DesktopIcon'
import { Onboarding, type OnboardingData } from '../onboarding/Onboarding'
import { useOnboardingStore } from '../../stores/onboardingStore'
import { useThemeStore } from '../../stores/themeStore'
import { useSettingsStore } from '../../stores/settingsStore.js'
import { useAwarenessStore } from '../../stores/awarenessStore.js'
import { useSocialStore } from '../../stores/socialStore.js'
import { FilesWindow } from './FilesWindow'
import { SettingsWindow } from './SettingsWindow'
import { WalletWindow } from './WalletWindow'
import { LogsWindow } from './LogsWindow'
import { Phone } from '../phone/Phone.js'
import { Browser } from '../browser/Browser.js'
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
  allowMultiple?: boolean // Allow opening multiple instances
  action?: () => void
}

export function Desktop() {
  const { completed: onboardingCompleted, setCompleted } = useOnboardingStore()
  const { currentTheme } = useThemeStore()
  const { wallpaper } = useSettingsStore()
  const [openWindows, setOpenWindows] = useState<Set<string>>(new Set(onboardingCompleted ? ['browser-1'] : []))
  const [windowStates, setWindowStates] = useState<Record<string, WindowState>>({})
  const [activeWindow, setActiveWindow] = useState<string | null>(onboardingCompleted ? 'browser-1' : null)
  const [nextZIndex, setNextZIndex] = useState(10)
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null)
  const [phoneVisible, setPhoneVisible] = useState(false)
  const [windowInstanceCounter, setWindowInstanceCounter] = useState(1)

  const handleOnboardingComplete = useCallback((data: OnboardingData) => {
    console.log('Onboarding data:', data)
    // TODO: Send to backend API when integrated
    // For now, just mark as complete with a mock player ID
    setCompleted('mock-player-id')
    // Open browser after onboarding
    setOpenWindows(new Set(['browser-1']))
    setActiveWindow('browser-1')
    setWindowInstanceCounter(2)
  }, [setCompleted])

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
  ]

  const desktopIcons: DesktopIconConfig[] = [
    { id: 'browser', icon: CornCobIconLarge, label: 'The Corn Cob', opensWindow: 'browser', allowMultiple: true },
    { id: 'files', icon: '📁', label: 'Files', opensWindow: 'files' },
    { id: 'wallet', icon: '💰', label: 'Wallet', opensWindow: 'wallet' },
    { id: 'settings', icon: '⚙️', label: 'Settings', opensWindow: 'settings' },
    { id: 'logs', icon: '📊', label: 'Logs', opensWindow: 'logs' },
  ]

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
        // Create a new instance with a unique ID
        const newId = `${icon.opensWindow}-${windowInstanceCounter}`
        setWindowInstanceCounter(prev => prev + 1)
        openWindow(newId)
      } else {
        // Single instance - open or focus existing
        openWindow(icon.opensWindow)
      }
    } else if (icon.action) {
      icon.action()
    }
  }, [openWindow, windowInstanceCounter])

  const handleDesktopClick = useCallback(() => setSelectedIcon(null), [])

  const handleTaskbarWindowClick = useCallback((windowId: string) => {
    const state = windowStates[windowId]
    if (state?.isMinimized || activeWindow !== windowId) focusWindow(windowId)
    else minimizeWindow(windowId)
  }, [windowStates, activeWindow, focusWindow, minimizeWindow])

  const taskbarWindows: TaskbarWindow[] = Array.from(openWindows).map(id => {
    // Extract base window type from ID (e.g., "browser-1" -> "browser")
    const baseType = id.replace(/-\d+$/, '')
    const config = windows.find(w => w.id === baseType)
    const state = windowStates[id]

    // For multi-instance windows, show instance number in title
    const instanceMatch = id.match(/-(\d+)$/)
    const instanceNum = instanceMatch ? parseInt(instanceMatch[1]) : null
    const title = instanceNum && instanceNum > 1 ? `${config?.title ?? baseType} (${instanceNum})` : (config?.title ?? baseType)

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
      className="fixed inset-0 flex flex-col overflow-hidden select-none"
      style={backgroundStyle}
      onClick={handleDesktopClick}
    >
      <div className="flex-1 relative">
        <div className="absolute top-4 left-4 flex flex-col gap-2" onClick={e => e.stopPropagation()}>
          {desktopIcons.map(icon => (
            <DesktopIcon
              key={icon.id}
              icon={icon.icon}
              label={icon.label}
              isSelected={selectedIcon === icon.id}
              onClick={() => setSelectedIcon(icon.id)}
              onDoubleClick={() => handleIconDoubleClick(icon)}
            />
          ))}
        </div>

        {Array.from(openWindows).map(windowId => {
          // Extract base window type from ID (e.g., "browser-1" -> "browser")
          const baseType = windowId.replace(/-\d+$/, '')
          const config = windows.find(w => w.id === baseType)
          if (!config) return null
          const state = windowStates[windowId]

          // For multi-instance windows, show instance number in title
          const instanceMatch = windowId.match(/-(\d+)$/)
          const instanceNum = instanceMatch ? parseInt(instanceMatch[1]) : null
          const title = instanceNum && instanceNum > 1 ? `${config.title} (${instanceNum})` : config.title

          // Offset position slightly for new instances to avoid exact overlap
          const positionOffset = instanceNum ? (instanceNum - 1) * 30 : 0
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
        onStartClick={() => console.log('Start menu')}
        phoneVisible={phoneVisible}
        onPhoneToggle={() => setPhoneVisible(prev => !prev)}
      />
    </div>
  )
}
