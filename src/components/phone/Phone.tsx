/**
 * Phone Component
 *
 * iPhone-style shell that hosts phone apps.
 * Shows app drawer (home screen) and can navigate to individual apps.
 */

import { useState, useCallback } from 'react'
import { getAppsForSurface, type AppDefinition } from '../../config/app-registry.js'
import { PhoneStatusBar } from './PhoneStatusBar.js'
import { PhoneHomeScreen } from './PhoneHomeScreen.js'
import { PhoneAppContainer } from './PhoneAppContainer.js'

interface PhoneProps {
  onClose: () => void
}

export function Phone({ onClose }: PhoneProps) {
  const [currentApp, setCurrentApp] = useState<string | null>(null)
  const [appHistory, setAppHistory] = useState<string[]>([])

  // Get apps available on phone surface
  const phoneApps = getAppsForSurface('phone')

  const openApp = useCallback((appId: string) => {
    if (currentApp) {
      setAppHistory(prev => [...prev, currentApp])
    }
    setCurrentApp(appId)
  }, [currentApp])

  const goHome = useCallback(() => {
    setCurrentApp(null)
    setAppHistory([])
  }, [])

  const goBack = useCallback(() => {
    if (appHistory.length > 0) {
      const prevApp = appHistory[appHistory.length - 1]
      setAppHistory(prev => prev.slice(0, -1))
      setCurrentApp(prevApp)
    } else {
      setCurrentApp(null)
    }
  }, [appHistory])

  return (
    <div
      className="relative w-full h-full rounded-[40px] shadow-2xl flex flex-col overflow-hidden"
      style={{
        background: '#000',
        border: '4px solid #1a1a1a',
      }}
    >
      {/* Dynamic Island / Notch */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-7 rounded-full bg-black z-20" />

      {/* Close button (outside phone UI) */}
      <button
        onClick={onClose}
        className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center transition-colors z-30 shadow-lg"
        style={{
          background: 'var(--color-bgTertiary)',
          color: 'var(--color-text)',
          border: '1px solid var(--color-border)',
        }}
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 12 12">
          <path strokeLinecap="round" strokeWidth="2" d="M2 2l8 8M10 2L2 10" />
        </svg>
      </button>

      {/* Status Bar */}
      <PhoneStatusBar />

      {/* Main Content Area */}
      <div
        className="flex-1 overflow-hidden"
        style={{
          background: currentApp ? 'var(--color-bg)' : 'linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        }}
      >
        {currentApp ? (
          <PhoneAppContainer
            appId={currentApp}
            onBack={goBack}
            onHome={goHome}
          />
        ) : (
          <PhoneHomeScreen
            apps={phoneApps}
            onAppOpen={openApp}
          />
        )}
      </div>

      {/* Home Indicator */}
      <div
        className="h-8 flex items-center justify-center"
        style={{ background: currentApp ? 'var(--color-bgSecondary)' : 'transparent' }}
      >
        <button
          onClick={goHome}
          className="w-32 h-1 rounded-full transition-colors hover:opacity-80"
          style={{ background: currentApp ? 'var(--color-border)' : 'rgba(255,255,255,0.3)' }}
        />
      </div>
    </div>
  )
}

export default Phone
