/**
 * Browser Component
 *
 * Desktop browser window with tabbed browsing.
 * Uses the Corn Stack router for URL-based navigation with history and autocomplete.
 */

import { useState, useCallback, useEffect, useRef } from 'react'
import { getAppsForSurface, type AppDefinition } from '../../config/app-registry.js'
import { BrowserSiteContainer } from './BrowserSiteContainer.js'
import { useBrowserStore } from '../../stores/browserStore.js'
import { useCornRouter, getAllSites, getUrlForSite } from '../../router/index.js'
import type { CornSite, AutocompleteSuggestion } from '../../router/index.js'
import cornCobIcon from '../../assets/thecorncobb-icon.png'

interface BrowserProps {
  onClose?: () => void
}

export function Browser({ onClose }: BrowserProps) {
  // -------------------------------------------------------------------------
  // Router Hook
  // -------------------------------------------------------------------------

  const router = useCornRouter()
  const {
    tabs,
    activeTab,
    activeTabId,
    setActiveTabId,
    addTab,
    closeTab,
    navigateTo,
    navigateToSite,
    navigateToPath,
    canGoBack,
    canGoForward,
    goBack,
    goForward,
    goHome,
    refresh,
    getAutocomplete,
    allSites,
  } = router

  // -------------------------------------------------------------------------
  // Local State
  // -------------------------------------------------------------------------

  const [urlInput, setUrlInput] = useState('')
  const [autocompleteResults, setAutocompleteResults] = useState<AutocompleteSuggestion[]>([])
  const [showAutocomplete, setShowAutocomplete] = useState(false)
  const [autocompleteIndex, setAutocompleteIndex] = useState(-1)
  const urlInputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<HTMLDivElement>(null)

  const [draggedBookmarkId, setDraggedBookmarkId] = useState<string | null>(null)
  const [draggedTabId, setDraggedTabId] = useState<string | null>(null)
  const [zoom, setZoom] = useState(100)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Legacy: Get apps from old registry for home page icons
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

  // -------------------------------------------------------------------------
  // Sync URL Input with Active Tab
  // -------------------------------------------------------------------------

  useEffect(() => {
    setUrlInput(activeTab.url)
    setShowAutocomplete(false)
  }, [activeTab.url, activeTab.id])

  // -------------------------------------------------------------------------
  // Autocomplete
  // -------------------------------------------------------------------------

  const updateAutocomplete = useCallback((input: string) => {
    if (input.trim().length < 2) {
      setAutocompleteResults([])
      setShowAutocomplete(false)
      return
    }

    const results = getAutocomplete(input)
    setAutocompleteResults(results)
    setShowAutocomplete(results.length > 0)
    setAutocompleteIndex(-1)
  }, [getAutocomplete])

  const handleUrlInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setUrlInput(value)
    updateAutocomplete(value)
  }, [updateAutocomplete])

  const selectAutocomplete = useCallback((suggestion: AutocompleteSuggestion) => {
    setUrlInput(suggestion.url)
    setShowAutocomplete(false)
    navigateTo(suggestion.url)
    urlInputRef.current?.blur()
  }, [navigateTo])

  // -------------------------------------------------------------------------
  // URL Submission
  // -------------------------------------------------------------------------

  const handleUrlSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()

    // If autocomplete is open and item selected, use that
    if (showAutocomplete && autocompleteIndex >= 0 && autocompleteResults[autocompleteIndex]) {
      selectAutocomplete(autocompleteResults[autocompleteIndex])
      return
    }

    // Otherwise navigate to input
    if (urlInput.trim()) {
      navigateTo(urlInput)
      setShowAutocomplete(false)
      urlInputRef.current?.blur()
    }
  }, [urlInput, showAutocomplete, autocompleteIndex, autocompleteResults, selectAutocomplete, navigateTo])

  // -------------------------------------------------------------------------
  // Keyboard Navigation for Autocomplete
  // -------------------------------------------------------------------------

  const handleUrlKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!showAutocomplete || autocompleteResults.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setAutocompleteIndex(prev =>
        prev < autocompleteResults.length - 1 ? prev + 1 : 0
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setAutocompleteIndex(prev =>
        prev > 0 ? prev - 1 : autocompleteResults.length - 1
      )
    } else if (e.key === 'Escape') {
      setShowAutocomplete(false)
      setAutocompleteIndex(-1)
    }
  }, [showAutocomplete, autocompleteResults])

  // -------------------------------------------------------------------------
  // Click Outside to Close Autocomplete
  // -------------------------------------------------------------------------

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        autocompleteRef.current &&
        !autocompleteRef.current.contains(e.target as Node) &&
        !urlInputRef.current?.contains(e.target as Node)
      ) {
        setShowAutocomplete(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // -------------------------------------------------------------------------
  // Path Change Handler (for internal site navigation)
  // -------------------------------------------------------------------------

  const handlePathChange = useCallback((newPath: string | null) => {
    if (!activeTab.site) return
    if (activeTab.path === newPath) return

    navigateToPath(newPath || '/')
  }, [activeTab.site, activeTab.path, navigateToPath])

  // -------------------------------------------------------------------------
  // Bookmarks
  // -------------------------------------------------------------------------

  const toggleBookmark = useCallback(() => {
    if (!activeTab.site || !activeTab.url) return

    if (isBookmarked(activeTab.url)) {
      const bookmark = bookmarks.find(b => b.url === activeTab.url)
      if (bookmark) {
        removeBookmark(bookmark.id)
      }
    } else {
      addBookmark(activeTab.url, activeTab.title, activeTab.site.icon || '')
    }
  }, [activeTab, isBookmarked, bookmarks, removeBookmark, addBookmark])

  const navigateToBookmark = useCallback((url: string) => {
    navigateTo(url)
  }, [navigateTo])

  // -------------------------------------------------------------------------
  // Bookmark Drag & Drop
  // -------------------------------------------------------------------------

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

  // -------------------------------------------------------------------------
  // Tab Management
  // -------------------------------------------------------------------------

  const handleAddTab = useCallback(() => {
    addTab()
    setUrlInput('')
    setTimeout(() => urlInputRef.current?.focus(), 0)
  }, [addTab])

  const handleCloseTab = useCallback((tabId: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    e?.preventDefault()

    if (tabs.length === 1) {
      onClose?.()
      return
    }

    closeTab(tabId)
  }, [tabs.length, closeTab, onClose])

  const handleTabMouseDown = useCallback((tabId: string, e: React.MouseEvent) => {
    if (e.button === 1) {
      e.preventDefault()
      handleCloseTab(tabId)
    }
  }, [handleCloseTab])

  // -------------------------------------------------------------------------
  // Tab Drag & Drop
  // -------------------------------------------------------------------------

  const handleTabDragStart = useCallback((e: React.DragEvent, tabId: string) => {
    setDraggedTabId(tabId)
    e.dataTransfer.effectAllowed = 'move'
  }, [])

  const handleTabDragOver = useCallback((e: React.DragEvent, targetTabId: string) => {
    e.preventDefault()
    // Tab reordering could be added here
  }, [])

  const handleTabDragEnd = useCallback(() => {
    setDraggedTabId(null)
  }, [])

  // -------------------------------------------------------------------------
  // Zoom
  // -------------------------------------------------------------------------

  const zoomIn = useCallback(() => setZoom(z => Math.min(200, z + 10)), [])
  const zoomOut = useCallback(() => setZoom(z => Math.max(50, z - 10)), [])
  const resetZoom = useCallback(() => setZoom(100), [])

  // -------------------------------------------------------------------------
  // Menu
  // -------------------------------------------------------------------------

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

  // -------------------------------------------------------------------------
  // Keyboard Shortcuts
  // -------------------------------------------------------------------------

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey

      if (isMod && e.key === 't') {
        e.preventDefault()
        handleAddTab()
      } else if (isMod && e.key === 'w') {
        e.preventDefault()
        handleCloseTab(activeTabId)
      } else if (isMod && e.key === 'l') {
        e.preventDefault()
        urlInputRef.current?.focus()
        urlInputRef.current?.select()
      } else if (isMod && e.shiftKey && e.key === 'Tab') {
        e.preventDefault()
        const currentIndex = tabs.findIndex(t => t.id === activeTabId)
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1
        setActiveTabId(tabs[prevIndex].id)
      } else if (isMod && e.key === 'Tab') {
        e.preventDefault()
        const currentIndex = tabs.findIndex(t => t.id === activeTabId)
        const nextIndex = (currentIndex + 1) % tabs.length
        setActiveTabId(tabs[nextIndex].id)
      } else if (isMod && e.key === 'd') {
        e.preventDefault()
        toggleBookmark()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleAddTab, handleCloseTab, activeTabId, tabs, toggleBookmark, setActiveTabId])

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--color-bg)' }}>
      {/* Tab Bar */}
      <div
        className="flex items-center gap-1 px-2 pt-2 pb-0"
        style={{ background: 'var(--color-bgSecondary)' }}
      >
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
                {tab.site?.iconImage ? (
                  <img src={tab.site.iconImage} alt="" className="w-4 h-4 object-cover rounded-sm" />
                ) : (
                  tab.site?.icon || <img src={cornCobIcon} alt="" className="w-4 h-4" />
                )}
              </span>

              {/* Tab title */}
              <span
                className="text-xs truncate flex-1"
                style={{ color: 'var(--color-text)' }}
              >
                {tab.title}
              </span>

              {/* Close button */}
              <span
                onClick={(e) => handleCloseTab(tab.id, e)}
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

          {/* New Tab button */}
          <button
            onClick={handleAddTab}
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
            disabled={!canGoBack}
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
            disabled={!canGoForward}
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

        {/* URL Bar with Autocomplete */}
        <div className="flex-1 relative">
          <form onSubmit={handleUrlSubmit}>
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
                onChange={handleUrlInputChange}
                onKeyDown={handleUrlKeyDown}
                onFocus={() => urlInput.length >= 2 && updateAutocomplete(urlInput)}
                placeholder="Enter a .corn address or search..."
                className="flex-1 bg-transparent text-sm outline-none"
                style={{ color: 'var(--color-text)' }}
                autoComplete="off"
              />

              {/* Bookmark star */}
              {activeTab.site && (
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

          {/* Autocomplete Dropdown */}
          {showAutocomplete && autocompleteResults.length > 0 && (
            <div
              ref={autocompleteRef}
              className="absolute top-full left-0 right-0 mt-1 rounded-lg shadow-xl border overflow-hidden z-50"
              style={{
                background: 'var(--color-bgSecondary)',
                borderColor: 'var(--color-border)',
              }}
            >
              {autocompleteResults.map((suggestion, index) => (
                <button
                  key={suggestion.url}
                  onClick={() => selectAutocomplete(suggestion)}
                  className={`
                    w-full px-3 py-2 text-left flex items-center gap-3
                    ${index === autocompleteIndex ? 'bg-[var(--color-bgTertiary)]' : 'hover:bg-[var(--color-bgTertiary)]'}
                  `}
                >
                  <span className="text-sm" style={{ color: 'var(--color-textMuted)' }}>
                    {suggestion.source === 'history' ? '🕒' : '🌐'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm truncate" style={{ color: 'var(--color-text)' }}>
                      {suggestion.title}
                    </div>
                    <div className="text-xs truncate" style={{ color: 'var(--color-textMuted)' }}>
                      {suggestion.url}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Menu button */}
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

              <button
                onClick={() => { handleAddTab(); setMenuOpen(false) }}
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
                disabled={!activeTab.site}
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
                <span className="text-sm shrink-0">{bookmark.icon || '🔖'}</span>
                <span
                  className="text-xs truncate max-w-[100px]"
                  style={{ color: 'var(--color-text)' }}
                >
                  {bookmark.title}
                </span>
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
          {activeTab.site ? (
            <BrowserSiteContainer
              site={activeTab.site}
              path={activeTab.path}
              params={activeTab.params}
              query={activeTab.query}
              onNavigate={navigateToSite}
              onPathChange={handlePathChange}
              onNavigateToUrl={navigateTo}
            />
          ) : (
            <BrowserHomePage
              sites={allSites}
              onNavigate={navigateTo}
            />
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Home Page Component
// ============================================================================

interface BrowserHomePageProps {
  sites: CornSite[]
  onNavigate: (url: string) => void
}

function BrowserHomePage({ sites, onNavigate }: BrowserHomePageProps) {
  // Show popular sites - sorted by SEO score
  const popularSites = sites
    .filter(site => site.seo.baseScore >= 50)
    .sort((a, b) => b.seo.baseScore - a.seo.baseScore)
    .slice(0, 12)

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
        Your gateway to the .corn web
      </p>

      {/* Quick Links */}
      <div className="w-full max-w-2xl">
        <h2 className="text-sm font-medium mb-3" style={{ color: 'var(--color-textMuted)' }}>
          Popular Sites
        </h2>
        <div className="grid grid-cols-4 gap-4">
          {popularSites.map(site => (
            <button
              key={site.id}
              onClick={() => onNavigate(`www.${site.domain}`)}
              className="flex flex-col items-center gap-2 p-4 rounded-xl transition-colors hover:bg-[var(--color-bgSecondary)]"
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-transform hover:scale-105 shadow-sm"
                style={{ background: 'var(--color-bgTertiary)' }}
              >
                {site.iconImage ? (
                  <img
                    src={site.iconImage}
                    alt={site.name}
                    className="w-full h-full object-cover"
                    style={{ borderRadius: '22%' }}
                  />
                ) : (
                  site.icon
                )}
              </div>
              <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                {site.name}
              </span>
              <span className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
                {site.domain}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Browser
