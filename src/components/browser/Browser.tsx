/**
 * Browser Component
 *
 * Desktop browser window with tabbed browsing.
 * Has URL bar, back/forward navigation, tabs, and routes to site components.
 */

import { useState, useCallback, useEffect, useRef } from 'react'
import { getAppsForSurface, type AppDefinition } from '../../config/app-registry.js'
import { BrowserSiteContainer } from './BrowserSiteContainer.js'

// Site URL mappings
const SITE_URLS: Record<string, string> = {
  'myface': 'www.myface.corn',
  'myface-chat': 'www.myface.corn/messages',
  'chirp': 'www.chirp.corn',
  'chirp-dm': 'www.chirp.corn/messages',
  'instasnap': 'www.instasnap.corn',
  'instasnap-dm': 'www.instasnap.corn/direct',
  // Filler content sites
  'wikiknow': 'www.wikiknow.corn',
  'threadit': 'www.threadit.corn',
  'dailybuzz': 'www.dailybuzz.corn',
  'vidtube': 'www.vidtube.corn',
  'forchan': 'www.forchan.corn',
  'vitalityrx': 'www.vitalityrx.corn',
  'nestfinder': 'www.nestfinder.corn',
  'bargainbay': 'www.bargainbay.corn',
  'oddsoracle': 'www.oddsoracle.corn',
  'strangerzone': 'www.strangerzone.corn',
  'wealthwisdom': 'www.wealthwisdom.corn',
  // Easter egg sites
  'popuphell': 'www.free-prizes-click-here.corn',
  'millionpixels': 'www.millionpixels.corn',
  'quantumbrewblog': 'www.quantumbrewblog.corn',
  'hartwellfiles': 'www.hartwellfiles.corn',
  'trustfalltim': 'www.trustfalltim.corn',
  'onlyfans': 'www.onlyfans.corn',
  'bandsnotintown': 'www.bandsnotintown.corn',
}

// Reverse lookup - URL to app ID
const URL_TO_APP: Record<string, string> = Object.fromEntries(
  Object.entries(SITE_URLS).map(([appId, url]) => [url, appId])
)

// Tab interface
interface BrowserTab {
  id: string
  siteId: string | null
  url: string
  history: string[]
  historyIndex: number
  title: string
}

// Generate unique tab ID
function generateTabId(): string {
  return `tab-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

// Create a new empty tab
function createNewTab(): BrowserTab {
  return {
    id: generateTabId(),
    siteId: null,
    url: '',
    history: [],
    historyIndex: -1,
    title: 'New Tab',
  }
}

// Get display title for a tab
function getTabTitle(tab: BrowserTab, apps: AppDefinition[]): string {
  if (!tab.siteId) return 'New Tab'
  const app = apps.find(a => a.id === tab.siteId)
  return app?.name || tab.siteId
}

export function Browser() {
  const [tabs, setTabs] = useState<BrowserTab[]>([createNewTab()])
  const [activeTabId, setActiveTabId] = useState<string>(tabs[0].id)
  const [urlInput, setUrlInput] = useState('')
  const urlInputRef = useRef<HTMLInputElement>(null)

  // Get apps available in browser
  const browserApps = getAppsForSurface('browser')

  // Get active tab
  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0]

  // Sync URL input with active tab
  useEffect(() => {
    setUrlInput(activeTab.url)
  }, [activeTab.url, activeTab.id])

  // Update a specific tab
  const updateTab = useCallback((tabId: string, updates: Partial<BrowserTab>) => {
    setTabs(prev => prev.map(tab =>
      tab.id === tabId ? { ...tab, ...updates } : tab
    ))
  }, [])

  // Navigate within the active tab
  const navigateTo = useCallback((appId: string, tabId?: string) => {
    const targetTabId = tabId || activeTabId
    const tab = tabs.find(t => t.id === targetTabId)
    if (!tab) return

    const url = SITE_URLS[appId] || `www.${appId}.corn`
    const app = browserApps.find(a => a.id === appId)

    // Add to history
    const newHistory = tab.history.slice(0, tab.historyIndex + 1)
    newHistory.push(appId)

    updateTab(targetTabId, {
      siteId: appId,
      url,
      history: newHistory,
      historyIndex: newHistory.length - 1,
      title: app?.name || appId,
    })

    if (targetTabId === activeTabId) {
      setUrlInput(url)
    }
  }, [activeTabId, tabs, browserApps, updateTab])

  // Go back in history
  const goBack = useCallback(() => {
    if (activeTab.historyIndex > 0) {
      const newIndex = activeTab.historyIndex - 1
      const appId = activeTab.history[newIndex]
      const app = browserApps.find(a => a.id === appId)

      updateTab(activeTabId, {
        historyIndex: newIndex,
        siteId: appId,
        url: SITE_URLS[appId] || `www.${appId}.corn`,
        title: app?.name || appId,
      })
    }
  }, [activeTab, activeTabId, browserApps, updateTab])

  // Go forward in history
  const goForward = useCallback(() => {
    if (activeTab.historyIndex < activeTab.history.length - 1) {
      const newIndex = activeTab.historyIndex + 1
      const appId = activeTab.history[newIndex]
      const app = browserApps.find(a => a.id === appId)

      updateTab(activeTabId, {
        historyIndex: newIndex,
        siteId: appId,
        url: SITE_URLS[appId] || `www.${appId}.corn`,
        title: app?.name || appId,
      })
    }
  }, [activeTab, activeTabId, browserApps, updateTab])

  // Go to home page
  const goHome = useCallback(() => {
    updateTab(activeTabId, {
      siteId: null,
      url: '',
      title: 'New Tab',
    })
    setUrlInput('')
  }, [activeTabId, updateTab])

  // Handle URL submission
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

  // Refresh current page
  const refresh = useCallback(() => {
    if (activeTab.siteId) {
      const siteId = activeTab.siteId
      updateTab(activeTabId, { siteId: null })
      setTimeout(() => updateTab(activeTabId, { siteId }), 0)
    }
  }, [activeTab.siteId, activeTabId, updateTab])

  // Add new tab
  const addTab = useCallback(() => {
    const newTab = createNewTab()
    setTabs(prev => [...prev, newTab])
    setActiveTabId(newTab.id)
    setUrlInput('')
    // Focus URL bar
    setTimeout(() => urlInputRef.current?.focus(), 0)
  }, [])

  // Close a tab
  const closeTab = useCallback((tabId: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    e?.preventDefault()

    setTabs(prev => {
      // Don't close last tab
      if (prev.length === 1) {
        // Reset the tab instead
        return [createNewTab()]
      }

      const tabIndex = prev.findIndex(t => t.id === tabId)
      const newTabs = prev.filter(t => t.id !== tabId)

      // If closing active tab, switch to adjacent tab
      if (tabId === activeTabId) {
        const newActiveIndex = Math.min(tabIndex, newTabs.length - 1)
        setActiveTabId(newTabs[newActiveIndex].id)
      }

      return newTabs
    })
  }, [activeTabId])

  // Handle middle-click on tab to close
  const handleTabMouseDown = useCallback((tabId: string, e: React.MouseEvent) => {
    if (e.button === 1) { // Middle click
      e.preventDefault()
      closeTab(tabId)
    }
  }, [closeTab])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey

      if (isMod && e.key === 't') {
        e.preventDefault()
        addTab()
      } else if (isMod && e.key === 'w') {
        e.preventDefault()
        closeTab(activeTabId)
      } else if (isMod && e.key === 'l') {
        e.preventDefault()
        urlInputRef.current?.focus()
        urlInputRef.current?.select()
      } else if (isMod && e.shiftKey && e.key === 'Tab') {
        e.preventDefault()
        // Previous tab
        const currentIndex = tabs.findIndex(t => t.id === activeTabId)
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1
        setActiveTabId(tabs[prevIndex].id)
      } else if (isMod && e.key === 'Tab') {
        e.preventDefault()
        // Next tab
        const currentIndex = tabs.findIndex(t => t.id === activeTabId)
        const nextIndex = (currentIndex + 1) % tabs.length
        setActiveTabId(tabs[nextIndex].id)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [addTab, closeTab, activeTabId, tabs])

  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--color-bg)' }}>
      {/* Tab Bar */}
      <div
        className="flex items-center gap-1 px-2 pt-2 pb-0"
        style={{ background: 'var(--color-bgSecondary)' }}
      >
        {/* Tabs */}
        <div className="flex-1 flex items-center gap-1 min-w-0 overflow-x-auto scrollbar-none">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTabId(tab.id)}
              onMouseDown={(e) => handleTabMouseDown(tab.id, e)}
              className={`
                group relative flex items-center gap-2 px-3 py-1.5 rounded-t-lg min-w-[120px] max-w-[200px]
                transition-colors text-left
                ${tab.id === activeTabId
                  ? 'bg-[var(--color-bg)]'
                  : 'bg-[var(--color-bgTertiary)] hover:bg-[var(--color-bgTertiary)]/80'
                }
              `}
              style={{
                borderTop: tab.id === activeTabId ? '2px solid var(--color-primary)' : '2px solid transparent',
              }}
            >
              {/* Tab icon */}
              <span className="text-sm shrink-0">
                {tab.siteId ? (browserApps.find(a => a.id === tab.siteId)?.icon || '🌐') : '🌐'}
              </span>

              {/* Tab title */}
              <span
                className="text-xs truncate flex-1"
                style={{ color: 'var(--color-text)' }}
              >
                {getTabTitle(tab, browserApps)}
              </span>

              {/* Close button */}
              <span
                onClick={(e) => closeTab(tab.id, e)}
                className={`
                  w-4 h-4 rounded-sm flex items-center justify-center shrink-0
                  opacity-0 group-hover:opacity-100 hover:bg-[var(--color-bgSecondary)]
                  transition-opacity cursor-pointer
                `}
                style={{ color: 'var(--color-textMuted)' }}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </span>
            </button>
          ))}
        </div>

        {/* New Tab button */}
        <button
          onClick={addTab}
          className="w-7 h-7 rounded-md flex items-center justify-center transition-colors hover:bg-[var(--color-bgTertiary)] shrink-0"
          style={{ color: 'var(--color-textMuted)' }}
          title="New Tab (Cmd+T)"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Browser Chrome */}
      <div
        className="flex items-center gap-2 px-3 py-2"
        style={{ background: 'var(--color-bgSecondary)', borderBottom: '1px solid var(--color-border)' }}
      >
        {/* Navigation buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={goBack}
            disabled={activeTab.historyIndex <= 0}
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
            disabled={activeTab.historyIndex >= activeTab.history.length - 1}
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
              ref={urlInputRef}
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
        {activeTab.siteId ? (
          <BrowserSiteContainer
            siteId={activeTab.siteId}
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
        The Corn Cob
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
                {SITE_URLS[app.id] || `${app.id}.corn`}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Browser
