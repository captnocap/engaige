/**
 * Browser Component
 *
 * Desktop browser window with tabbed browsing.
 * Has URL bar, back/forward navigation, tabs, and routes to site components.
 */

import { useState, useCallback, useEffect, useRef } from 'react'
import { getAppsForSurface, type AppDefinition } from '../../config/app-registry.js'
import { BrowserSiteContainer } from './BrowserSiteContainer.js'
import { useBrowserStore } from '../../stores/browserStore.js'
import cornCobIcon from '../../assets/thecorncobb-icon.png'

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
  'bellasplayhouse': 'www.bellasplayhouse.corn',
  'graintruth': 'www.graintruth.corn',
  'cornhub': 'www.cornhub.corn',
  'onlyfarms': 'www.onlyfarms.corn',
  'corndr': 'www.corndr.corn',
  'deaddrop': 'www.deaddrop.corn',
  'cornarchive': 'www.cornarchive.corn',
}

// Reverse lookup - URL to app ID
const URL_TO_APP: Record<string, string> = Object.fromEntries(
  Object.entries(SITE_URLS).map(([appId, url]) => [url, appId])
)

// History entry tracks both site and path
interface HistoryEntry {
  siteId: string
  path: string | null
}

// Tab interface
interface BrowserTab {
  id: string
  siteId: string | null
  path: string | null  // Current path within site (e.g., "/r/coffee", "/profile/123")
  url: string
  history: HistoryEntry[]
  historyIndex: number
  title: string
}

// TODO: Tab drag-to-new-window feature
// To implement dragging a tab out to create a new browser window:
// 1. Create a shared browserTabStore (Zustand) to manage tabs across browser instances
// 2. On drag start, store the tab data in dataTransfer
// 3. Detect when tab is dragged outside the tab bar (use dragend coordinates)
// 4. If dropped outside, emit an event/action to Desktop to spawn a new browser window
// 5. Pass the tab data to the new browser instance via the store
// 6. Remove the tab from the source browser (close browser if it was the last tab)

// Generate unique tab ID
function generateTabId(): string {
  return `tab-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

// Create a new empty tab
function createNewTab(): BrowserTab {
  return {
    id: generateTabId(),
    siteId: null,
    path: null,
    url: '',
    history: [],
    historyIndex: -1,
    title: 'New Tab',
  }
}

// Build full URL from site ID and path
function buildUrl(siteId: string, path: string | null): string {
  const baseUrl = SITE_URLS[siteId] || `www.${siteId}.corn`
  if (!path) return baseUrl
  // Remove leading slash from path if base URL already has a path component
  if (baseUrl.includes('/')) {
    return baseUrl + path
  }
  return baseUrl + path
}

// Get display title for a tab
function getTabTitle(tab: BrowserTab, apps: AppDefinition[]): string {
  if (!tab.siteId) return 'New Tab'
  const app = apps.find(a => a.id === tab.siteId)
  return app?.name || tab.siteId
}

interface BrowserProps {
  onClose?: () => void
}

export function Browser({ onClose }: BrowserProps) {
  const [tabs, setTabs] = useState<BrowserTab[]>([createNewTab()])
  const [activeTabId, setActiveTabId] = useState<string>(tabs[0].id)
  const [urlInput, setUrlInput] = useState('')
  const urlInputRef = useRef<HTMLInputElement>(null)
  const [draggedBookmarkId, setDraggedBookmarkId] = useState<string | null>(null)
  const [draggedTabId, setDraggedTabId] = useState<string | null>(null)
  const [zoom, setZoom] = useState(100)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Get apps available in browser
  const browserApps = getAppsForSurface('browser')

  // Bookmark store
  const {
    bookmarks,
    showBookmarksBar,
    addBookmark,
    removeBookmark,
    reorderBookmark,
    isBookmarked,
  } = useBrowserStore()

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

  // Navigate within the active tab (to a new site, resets path)
  const navigateTo = useCallback((appId: string, tabId?: string) => {
    const targetTabId = tabId || activeTabId
    const tab = tabs.find(t => t.id === targetTabId)
    if (!tab) return

    const url = SITE_URLS[appId] || `www.${appId}.corn`
    const app = browserApps.find(a => a.id === appId)

    // Add to history (new site navigation always resets path)
    const newHistory = tab.history.slice(0, tab.historyIndex + 1)
    newHistory.push({ siteId: appId, path: null })

    updateTab(targetTabId, {
      siteId: appId,
      path: null,
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
      // Go to previous page in history
      const newIndex = activeTab.historyIndex - 1
      const entry = activeTab.history[newIndex]
      const app = browserApps.find(a => a.id === entry.siteId)

      updateTab(activeTabId, {
        historyIndex: newIndex,
        siteId: entry.siteId,
        path: entry.path,
        url: buildUrl(entry.siteId, entry.path),
        title: app?.name || entry.siteId,
      })
    } else if (activeTab.historyIndex === 0 && activeTab.siteId) {
      // Go back to homepage (we're at the first page in history)
      updateTab(activeTabId, {
        historyIndex: -1,
        siteId: null,
        path: null,
        url: '',
        title: 'New Tab',
      })
    }
  }, [activeTab, activeTabId, browserApps, updateTab])

  // Go forward in history
  const goForward = useCallback(() => {
    // Check if we can go forward (including from homepage where historyIndex is -1)
    const canGoForward = activeTab.historyIndex < activeTab.history.length - 1
    const canGoForwardFromHome = activeTab.historyIndex === -1 && activeTab.history.length > 0

    if (canGoForward || canGoForwardFromHome) {
      const newIndex = activeTab.historyIndex + 1
      const entry = activeTab.history[newIndex]
      const app = browserApps.find(a => a.id === entry.siteId)

      updateTab(activeTabId, {
        historyIndex: newIndex,
        siteId: entry.siteId,
        path: entry.path,
        url: buildUrl(entry.siteId, entry.path),
        title: app?.name || entry.siteId,
      })
    }
  }, [activeTab, activeTabId, browserApps, updateTab])

  // Go to home page
  const goHome = useCallback(() => {
    updateTab(activeTabId, {
      siteId: null,
      path: null,
      url: '',
      title: 'New Tab',
    })
    setUrlInput('')
  }, [activeTabId, updateTab])

  // Handle path change from site components (internal navigation)
  const handlePathChange = useCallback((newPath: string | null) => {
    const tab = tabs.find(t => t.id === activeTabId)
    if (!tab || !tab.siteId) return

    // Don't update if path hasn't changed
    if (tab.path === newPath) return

    const url = buildUrl(tab.siteId, newPath)

    // Add new history entry for path change
    const newHistory = tab.history.slice(0, tab.historyIndex + 1)
    newHistory.push({ siteId: tab.siteId, path: newPath })

    updateTab(activeTabId, {
      path: newPath,
      url,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    })

    setUrlInput(url)
  }, [activeTabId, tabs, updateTab])

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

  // Toggle bookmark for current page
  const toggleBookmark = useCallback(() => {
    if (!activeTab.siteId || !activeTab.url) return

    if (isBookmarked(activeTab.url)) {
      const bookmark = bookmarks.find(b => b.url === activeTab.url)
      if (bookmark) {
        removeBookmark(bookmark.id)
      }
    } else {
      const app = browserApps.find(a => a.id === activeTab.siteId)
      const icon = app?.icon || ''
      addBookmark(activeTab.url, activeTab.title, typeof icon === 'string' ? icon : '')
    }
  }, [activeTab, isBookmarked, bookmarks, removeBookmark, addBookmark, browserApps])

  // Navigate to bookmark
  const navigateToBookmark = useCallback((url: string) => {
    const appId = URL_TO_APP[url]
    if (appId) {
      navigateTo(appId)
    }
  }, [navigateTo])

  // Drag and drop handlers for bookmarks
  const handleBookmarkDragStart = useCallback((e: React.DragEvent, bookmarkId: string) => {
    setDraggedBookmarkId(bookmarkId)
    e.dataTransfer.effectAllowed = 'move'
  }, [])

  const handleBookmarkDragOver = useCallback((e: React.DragEvent, targetBookmarkId: string) => {
    e.preventDefault()
    if (!draggedBookmarkId || draggedBookmarkId === targetBookmarkId) return

    const targetBookmark = bookmarks.find(b => b.id === targetBookmarkId)
    if (targetBookmark) {
      reorderBookmark(draggedBookmarkId, targetBookmark.position)
    }
  }, [draggedBookmarkId, bookmarks, reorderBookmark])

  const handleBookmarkDragEnd = useCallback(() => {
    setDraggedBookmarkId(null)
  }, [])

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
      // If closing last tab, close the browser window
      if (prev.length === 1) {
        onClose?.()
        return prev // Return unchanged (window will close anyway)
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
  }, [activeTabId, onClose])

  // Tab drag handlers for reordering
  const handleTabDragStart = useCallback((e: React.DragEvent, tabId: string) => {
    setDraggedTabId(tabId)
    e.dataTransfer.effectAllowed = 'move'
  }, [])

  const handleTabDragOver = useCallback((e: React.DragEvent, targetTabId: string) => {
    e.preventDefault()
    if (!draggedTabId || draggedTabId === targetTabId) return

    setTabs(prev => {
      const draggedIndex = prev.findIndex(t => t.id === draggedTabId)
      const targetIndex = prev.findIndex(t => t.id === targetTabId)
      if (draggedIndex === -1 || targetIndex === -1) return prev

      const newTabs = [...prev]
      const [removed] = newTabs.splice(draggedIndex, 1)
      newTabs.splice(targetIndex, 0, removed)
      return newTabs
    })
  }, [draggedTabId])

  const handleTabDragEnd = useCallback(() => {
    setDraggedTabId(null)
  }, [])

  // Zoom controls
  const zoomIn = useCallback(() => setZoom(z => Math.min(200, z + 10)), [])
  const zoomOut = useCallback(() => setZoom(z => Math.max(50, z - 10)), [])
  const resetZoom = useCallback(() => setZoom(100), [])

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [menuOpen])

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
      } else if (isMod && e.key === 'd') {
        e.preventDefault()
        // Toggle bookmark
        toggleBookmark()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [addTab, closeTab, activeTabId, tabs, toggleBookmark])

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
              draggable
              onClick={() => setActiveTabId(tab.id)}
              onMouseDown={(e) => handleTabMouseDown(tab.id, e)}
              onDragStart={(e) => handleTabDragStart(e, tab.id)}
              onDragOver={(e) => handleTabDragOver(e, tab.id)}
              onDragEnd={handleTabDragEnd}
              className={`
                group relative flex items-center gap-2 px-3 py-1.5 rounded-t-lg min-w-[120px] max-w-[200px]
                transition-colors text-left
                ${tab.id === activeTabId
                  ? 'bg-[var(--color-bg)]'
                  : 'bg-[var(--color-bgTertiary)] hover:bg-[var(--color-bgTertiary)]/80'
                }
                ${draggedTabId === tab.id ? 'opacity-50' : ''}
              `}
              style={{
                borderTop: tab.id === activeTabId ? '2px solid var(--color-primary)' : '2px solid transparent',
              }}
            >
              {/* Tab icon */}
              <span className="text-sm shrink-0 flex items-center">
                {(() => {
                  const app = tab.siteId ? browserApps.find(a => a.id === tab.siteId) : null
                  if (app?.iconImage) {
                    return <img src={app.iconImage} alt="" className="w-4 h-4 object-cover rounded-sm" />
                  }
                  return app?.icon || <img src={cornCobIcon} alt="" className="w-4 h-4" />
                })()}
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

          {/* New Tab button - inside scrollable container to stay next to rightmost tab */}
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
            disabled={!activeTab.siteId}
            className="w-8 h-8 rounded-md flex items-center justify-center transition-colors disabled:opacity-30 hover:bg-[var(--color-bgTertiary)]"
            style={{ color: 'var(--color-text)' }}
            title="Back"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={goForward}
            disabled={!(activeTab.historyIndex < activeTab.history.length - 1 || (activeTab.historyIndex === -1 && activeTab.history.length > 0))}
            className="w-8 h-8 rounded-md flex items-center justify-center transition-colors disabled:opacity-30 hover:bg-[var(--color-bgTertiary)]"
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

            {/* Bookmark star - only show when on a valid site */}
            {activeTab.siteId && (
              <button
                type="button"
                onClick={toggleBookmark}
                className="w-5 h-5 flex items-center justify-center shrink-0 transition-colors hover:scale-110"
                style={{ color: isBookmarked(activeTab.url) ? 'var(--color-primary)' : 'var(--color-textMuted)' }}
                title={isBookmarked(activeTab.url) ? 'Remove bookmark (Cmd+D)' : 'Add bookmark (Cmd+D)'}
              >
                <svg
                  className="w-4 h-4"
                  fill={isBookmarked(activeTab.url) ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
              </button>
            )}
          </div>
        </form>

        {/* Menu button with dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(prev => !prev)}
            className="w-8 h-8 rounded-md flex items-center justify-center transition-colors hover:bg-[var(--color-bgTertiary)]"
            style={{ color: 'var(--color-text)' }}
            title="Menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>

          {/* Dropdown menu */}
          {menuOpen && (
            <div
              className="absolute right-0 top-10 w-48 rounded-lg shadow-xl border py-1 z-50"
              style={{
                background: 'var(--color-bgSecondary)',
                borderColor: 'var(--color-border)',
              }}
            >
              {/* Zoom controls */}
              <div className="px-3 py-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
                <div className="text-xs font-medium mb-2" style={{ color: 'var(--color-textMuted)' }}>
                  Zoom
                </div>
                <div className="flex items-center justify-between">
                  <button
                    onClick={zoomOut}
                    className="w-8 h-8 rounded flex items-center justify-center hover:bg-[var(--color-bgTertiary)]"
                    style={{ color: 'var(--color-text)' }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <button
                    onClick={resetZoom}
                    className="text-sm px-2 py-1 rounded hover:bg-[var(--color-bgTertiary)]"
                    style={{ color: 'var(--color-text)' }}
                  >
                    {zoom}%
                  </button>
                  <button
                    onClick={zoomIn}
                    className="w-8 h-8 rounded flex items-center justify-center hover:bg-[var(--color-bgTertiary)]"
                    style={{ color: 'var(--color-text)' }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Other menu items */}
              <button
                onClick={() => { addTab(); setMenuOpen(false) }}
                className="w-full px-3 py-2 text-sm text-left hover:bg-[var(--color-bgTertiary)] flex items-center gap-2"
                style={{ color: 'var(--color-text)' }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Tab
              </button>
              <button
                onClick={() => { toggleBookmark(); setMenuOpen(false) }}
                className="w-full px-3 py-2 text-sm text-left hover:bg-[var(--color-bgTertiary)] flex items-center gap-2"
                style={{ color: 'var(--color-text)' }}
                disabled={!activeTab.siteId}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                {isBookmarked(activeTab.url) ? 'Remove Bookmark' : 'Add Bookmark'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bookmarks Bar */}
      {showBookmarksBar && bookmarks.length > 0 && (
        <div
          className="flex items-center gap-1 px-3 py-1.5 overflow-x-auto scrollbar-none"
          style={{
            background: 'var(--color-bgSecondary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          {bookmarks
            .sort((a, b) => a.position - b.position)
            .map(bookmark => (
              <div
                key={bookmark.id}
                draggable
                onDragStart={e => handleBookmarkDragStart(e, bookmark.id)}
                onDragOver={e => handleBookmarkDragOver(e, bookmark.id)}
                onDragEnd={handleBookmarkDragEnd}
                className={`
                  group relative flex items-center gap-1.5 px-2 py-1 rounded-md cursor-pointer
                  transition-colors hover:bg-[var(--color-bgTertiary)]
                  ${draggedBookmarkId === bookmark.id ? 'opacity-50' : ''}
                `}
                onClick={() => navigateToBookmark(bookmark.url)}
              >
                {/* Bookmark icon */}
                <span className="text-sm shrink-0">{bookmark.icon || '🔖'}</span>

                {/* Bookmark title */}
                <span
                  className="text-xs truncate max-w-[100px]"
                  style={{ color: 'var(--color-text)' }}
                >
                  {bookmark.title}
                </span>

                {/* Delete button - shows on hover */}
                <button
                  onClick={e => {
                    e.stopPropagation()
                    removeBookmark(bookmark.id)
                  }}
                  className="
                    absolute -top-1 -right-1 w-4 h-4 rounded-full
                    flex items-center justify-center
                    opacity-0 group-hover:opacity-100
                    transition-opacity
                  "
                  style={{
                    background: 'var(--color-bgTertiary)',
                    color: 'var(--color-textMuted)',
                  }}
                  title="Remove bookmark"
                >
                  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 overflow-auto">
        <div
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top left',
            width: `${10000 / zoom}%`,
            minHeight: `${10000 / zoom}%`,
          }}
        >
          {activeTab.siteId ? (
            <BrowserSiteContainer
              siteId={activeTab.siteId}
              path={activeTab.path}
              onNavigate={navigateTo}
              onPathChange={handlePathChange}
            />
          ) : (
            <BrowserHomePage
              apps={browserApps}
              onNavigate={navigateTo}
            />
          )}
        </div>
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
      <img src={cornCobIcon} alt="The Corn Cob" className="w-24 h-24 mb-4" />
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
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-transform group-hover:scale-105 shadow-sm"
                style={{ background: 'var(--color-bgTertiary)' }}
              >
                {app.iconImage ? (
                  <img
                    src={app.iconImage}
                    alt={app.name}
                    className="w-full h-full object-cover shadow-sm"
                    style={{ borderRadius: '22%' }}
                  />
                ) : (
                  app.icon
                )}
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
