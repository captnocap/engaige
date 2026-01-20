import { useState, useCallback, useEffect, type ReactNode } from 'react'
import { Window, type WindowState } from './Window'
import { Taskbar, type TaskbarWindow } from './Taskbar'
import { DesktopIcon } from './DesktopIcon'
import { Onboarding, type OnboardingData } from '../onboarding/Onboarding'
import { useOnboardingStore } from '../../stores/onboardingStore'
import { useThemeStore } from '../../stores/themeStore'
import { useSettingsStore } from '../../stores/settingsStore.js'
import { FilesWindow } from './FilesWindow'
import { SettingsWindow } from './SettingsWindow'

interface WindowConfig {
  id: string
  title: string
  icon: ReactNode
  component: ReactNode
  defaultState: Partial<WindowState>
}

interface DesktopIconConfig {
  id: string
  icon: ReactNode
  label: string
  opensWindow?: string
  action?: () => void
}

export function Desktop() {
  const { completed: onboardingCompleted, setCompleted } = useOnboardingStore()
  const { currentTheme } = useThemeStore()
  const { wallpaper } = useSettingsStore()
  const [openWindows, setOpenWindows] = useState<Set<string>>(new Set(onboardingCompleted ? ['browser'] : []))
  const [windowStates, setWindowStates] = useState<Record<string, WindowState>>({})
  const [activeWindow, setActiveWindow] = useState<string | null>(onboardingCompleted ? 'browser' : null)
  const [nextZIndex, setNextZIndex] = useState(10)
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null)
  const [phoneVisible, setPhoneVisible] = useState(false)

  const handleOnboardingComplete = useCallback((data: OnboardingData) => {
    console.log('Onboarding data:', data)
    // TODO: Send to backend API when integrated
    // For now, just mark as complete with a mock player ID
    setCompleted('mock-player-id')
    // Open browser after onboarding
    setOpenWindows(new Set(['browser']))
    setActiveWindow('browser')
  }, [setCompleted])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key.toLowerCase() === 'p') setPhoneVisible(prev => !prev)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const windows: WindowConfig[] = [
    {
      id: 'browser',
      title: 'Browser',
      icon: '🌐',
      component: <BrowserPlaceholder />,
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
  ]

  const desktopIcons: DesktopIconConfig[] = [
    { id: 'browser', icon: '🌐', label: 'Browser', opensWindow: 'browser' },
    { id: 'files', icon: '📁', label: 'Files', opensWindow: 'files' },
    { id: 'settings', icon: '⚙️', label: 'Settings', opensWindow: 'settings' },
  ]

  const openWindow = useCallback((windowId: string) => {
    setOpenWindows(prev => new Set([...prev, windowId]))
    setActiveWindow(windowId)
    setNextZIndex(z => z + 1)
    setWindowStates(prev => ({
      ...prev,
      [windowId]: { ...prev[windowId], isMinimized: false, zIndex: nextZIndex },
    }))
  }, [nextZIndex])

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
    setNextZIndex(z => z + 1)
    setWindowStates(prev => ({
      ...prev,
      [windowId]: { ...prev[windowId], zIndex: nextZIndex, isMinimized: false },
    }))
  }, [nextZIndex])

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
    if (icon.opensWindow) openWindow(icon.opensWindow)
    else if (icon.action) icon.action()
  }, [openWindow])

  const handleDesktopClick = useCallback(() => setSelectedIcon(null), [])

  const handleTaskbarWindowClick = useCallback((windowId: string) => {
    const state = windowStates[windowId]
    if (state?.isMinimized || activeWindow !== windowId) focusWindow(windowId)
    else minimizeWindow(windowId)
  }, [windowStates, activeWindow, focusWindow, minimizeWindow])

  const taskbarWindows: TaskbarWindow[] = Array.from(openWindows).map(id => {
    const config = windows.find(w => w.id === id)
    const state = windowStates[id]
    return {
      id,
      title: config?.title ?? id,
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
          const config = windows.find(w => w.id === windowId)
          if (!config) return null
          const state = windowStates[windowId]

          return (
            <Window
              key={windowId}
              id={windowId}
              title={config.title}
              icon={config.icon}
              initialState={{ ...config.defaultState, ...state }}
              isActive={activeWindow === windowId}
              onFocus={() => focusWindow(windowId)}
              onClose={() => closeWindow(windowId)}
              onMinimize={() => minimizeWindow(windowId)}
              onStateChange={s => handleWindowStateChange(windowId, s)}
            >
              {config.component}
            </Window>
          )
        })}
      </div>

      {phoneVisible && (
        <div className="absolute right-4 bottom-16 w-[340px] h-[680px] z-50">
          <PhonePlaceholder onClose={() => setPhoneVisible(false)} />
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

function BrowserPlaceholder() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center p-8" style={{ background: 'var(--color-bg)' }}>
      <span className="text-6xl mb-4">🌐</span>
      <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>Browser</h1>
      <p style={{ color: 'var(--color-textMuted)' }}>A modern browser window component</p>
    </div>
  )
}

function PhonePlaceholder({ onClose }: { onClose: () => void }) {
  return (
    <div className="relative w-full h-full rounded-[40px] shadow-2xl flex flex-col overflow-hidden" style={{ background: 'var(--color-bg)', border: '4px solid var(--color-border)' }}>
      <div className="relative h-12 flex items-center justify-center no-select" style={{ background: 'var(--color-bgSecondary)' }}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 rounded-b-2xl" style={{ background: 'var(--color-bgSecondary)' }} />
        <button onClick={onClose} className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center transition-colors" style={{ background: 'var(--color-bgTertiary)', color: 'var(--color-text)' }}>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 12 12">
            <path strokeLinecap="round" strokeWidth="2" d="M2 2l8 8M10 2L2 10" />
          </svg>
        </button>
      </div>
      <div className="flex-1 flex items-center justify-center" style={{ background: 'var(--color-bgSecondary)' }}>
        <span className="text-4xl">📱</span>
      </div>
      <div className="h-8 flex items-center justify-center" style={{ background: 'var(--color-bgSecondary)' }}>
        <div className="w-32 h-1 rounded-full" style={{ background: 'var(--color-border)' }} />
      </div>
    </div>
  )
}