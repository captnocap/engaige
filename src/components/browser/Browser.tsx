/**
 * Browser Component
 *
 * Desktop browser window that hosts "websites" (MySpace, Chirp, etc.)
 * Has URL bar, back/forward navigation, and routes to site components.
 */

import { useState, useCallback } from 'react'
import { getAppsForSurface, getApp, type AppDefinition } from '../../config/app-registry.js'
import { BrowserSiteContainer } from './BrowserSiteContainer.js'

// Site URL mappings
const SITE_URLS: Record<string, string> = {
  'myface': 'www.myface.fake',
  'myface-chat': 'www.myface.fake/messages',
  'chirp': 'www.chirp.fake',
  'chirp-dm': 'www.chirp.fake/messages',
  'instasnap': 'www.instasnap.fake',
  'instasnap-dm': 'www.instasnap.fake/direct',
}

// Reverse lookup - URL to app ID
const URL_TO_APP: Record<string, string> = Object.fromEntries(
  Object.entries(SITE_URLS).map(([appId, url]) => [url, appId])
)

export function Browser() {
  const [currentSite, setCurrentSite] = useState<string | null>(null)
  const [urlInput, setUrlInput] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  // Get apps available in browser
  const browserApps = getAppsForSurface('browser')

  const navigateTo = useCallback((appId: string) => {
    const url = SITE_URLS[appId] || `www.${appId}.fake`

    // Add to history
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(appId)
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)

    setCurrentSite(appId)
    setUrlInput(url)
  }, [history, historyIndex])

  const goBack = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      const appId = history[newIndex]
      setCurrentSite(appId)
      setUrlInput(SITE_URLS[appId] || `www.${appId}.fake`)
    }
  }, [history, historyIndex])

  const goForward = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      const appId = history[newIndex]
      setCurrentSite(appId)
      setUrlInput(SITE_URLS[appId] || `www.${appId}.fake`)
    }
  }, [history, historyIndex])

  const goHome = useCallback(() => {
    setCurrentSite(null)
    setUrlInput('')
  }, [])

  const handleUrlSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    const url = urlInput.toLowerCase().trim()

    // Check if URL matches a known site
    const appId = URL_TO_APP[url] || Object.entries(SITE_URLS).find(
      ([_, siteUrl]) => url.includes(siteUrl.split('.')[1])
    )?.[0]

    if (appId) {
      navigateTo(appId)
    }
  }, [urlInput, navigateTo])

  const refresh = useCallback(() => {
    // Just trigger a re-render by setting the same site
    if (currentSite) {
      setCurrentSite(null)
      setTimeout(() => setCurrentSite(currentSite), 0)
    }
  }, [currentSite])

  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--color-bg)' }}>
      {/* Browser Chrome */}
      <div
        className="flex items-center gap-2 px-3 py-2"
        style={{ background: 'var(--color-bgSecondary)', borderBottom: '1px solid var(--color-border)' }}
      >
        {/* Navigation buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={goBack}
            disabled={historyIndex <= 0}
            className="w-8 h-8 rounded-md flex items-center justify-center transition-colors disabled:opacity-30"
            style={{ color: 'var(--color-text)' }}
            title="Back"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={goForward}
            disabled={historyIndex >= history.length - 1}
            className="w-8 h-8 rounded-md flex items-center justify-center transition-colors disabled:opacity-30"
            style={{ color: 'var(--color-text)' }}
            title="Forward"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button
            onClick={refresh}
            className="w-8 h-8 rounded-md flex items-center justify-center transition-colors hover:bg-[var(--color-bgTertiary)]"
            style={{ color: 'var(--color-text)' }}
            title="Refresh"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <button
            onClick={goHome}
            className="w-8 h-8 rounded-md flex items-center justify-center transition-colors hover:bg-[var(--color-bgTertiary)]"
            style={{ color: 'var(--color-text)' }}
            title="Home"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </button>
        </div>

        {/* URL Bar */}
        <form onSubmit={handleUrlSubmit} className="flex-1">
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{ background: 'var(--color-bgTertiary)' }}
          >
            <svg className="w-4 h-4 shrink-0" style={{ color: 'var(--color-textMuted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
            </svg>
            <input
              type="text"
              value={urlInput}
              onChange={e => setUrlInput(e.target.value)}
              placeholder="Enter a web address..."
              className="flex-1 bg-transparent text-sm outline-none"
              style={{ color: 'var(--color-text)' }}
            />
          </div>
        </form>

        {/* Menu button */}
        <button
          className="w-8 h-8 rounded-md flex items-center justify-center transition-colors hover:bg-[var(--color-bgTertiary)]"
          style={{ color: 'var(--color-text)' }}
          title="Menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        {currentSite ? (
          <BrowserSiteContainer
            siteId={currentSite}
            onNavigate={navigateTo}
          />
        ) : (
          <BrowserHomePage
            apps={browserApps}
            onNavigate={navigateTo}
          />
        )}
      </div>
    </div>
  )
}

interface BrowserHomePageProps {
  apps: AppDefinition[]
  onNavigate: (appId: string) => void
}

function BrowserHomePage({ apps, onNavigate }: BrowserHomePageProps) {
  // Filter to only show main apps (not DM variants)
  const mainApps = apps.filter(app => !app.id.endsWith('-dm') && !app.id.endsWith('-chat'))

  return (
    <div
      className="min-h-full flex flex-col items-center pt-16 px-8 pb-8"
      style={{ background: 'linear-gradient(180deg, var(--color-bgSecondary) 0%, var(--color-bg) 100%)' }}
    >
      {/* Logo */}
      <div className="text-6xl mb-4">🌐</div>
      <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
        NetScape
      </h1>
      <p className="text-sm mb-8" style={{ color: 'var(--color-textMuted)' }}>
        Your gateway to the social web
      </p>

      {/* Quick Links */}
      <div className="w-full max-w-2xl">
        <h2 className="text-sm font-medium mb-3" style={{ color: 'var(--color-textMuted)' }}>
          Popular Sites
        </h2>
        <div className="grid grid-cols-4 gap-4">
          {mainApps.map(app => (
            <button
              key={app.id}
              onClick={() => onNavigate(app.id)}
              className="flex flex-col items-center gap-2 p-4 rounded-xl transition-colors hover:bg-[var(--color-bgSecondary)]"
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
                style={{ background: 'var(--color-bgTertiary)' }}
              >
                {app.icon}
              </div>
              <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                {app.name}
              </span>
              <span className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
                {SITE_URLS[app.id] || `${app.id}.fake`}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Browser
