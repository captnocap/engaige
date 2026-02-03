/**
 * useCornRouter Hook
 *
 * React hook providing navigation, history, and autocomplete for the browser.
 */

import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import {
  parseURL,
  buildURL,
  matchRoute,
  normalizeUserInput,
  getAutocompleteSuggestions,
  getSiteByDomain,
  getAllSites,
} from './index.js'
import type {
  CornSite,
  RouteParams,
  HistoryEntry,
  ParsedURL,
} from './types.js'

// ============================================================================
// Types
// ============================================================================

export interface BrowserTab {
  id: string
  url: string                    // Full URL (e.g., 'www.threadit.corn/r/coffee')
  site: CornSite | null          // Resolved site
  path: string                   // Path within site
  params: RouteParams            // Route params
  query: URLSearchParams         // Query params
  title: string                  // Tab title
  history: HistoryEntry[]        // Tab history
  historyIndex: number           // Current position in history
}

export interface RouterState {
  tabs: BrowserTab[]
  activeTabId: string
}

export interface AutocompleteSuggestion {
  url: string
  title: string
  source: 'site' | 'history'
}

// ============================================================================
// Hook
// ============================================================================

export function useCornRouter() {
  // -------------------------------------------------------------------------
  // State
  // -------------------------------------------------------------------------

  const [tabs, setTabs] = useState<BrowserTab[]>(() => [createNewTab()])
  const [activeTabId, setActiveTabId] = useState<string>(() => tabs[0].id)

  // Global history for autocomplete
  const [globalHistory, setGlobalHistory] = useState<HistoryEntry[]>([])

  // All registered sites (for autocomplete)
  const allSites = useMemo(() => getAllSites(), [])

  // Active tab
  const activeTab = useMemo(
    () => tabs.find(t => t.id === activeTabId) || tabs[0],
    [tabs, activeTabId]
  )

  // -------------------------------------------------------------------------
  // Tab Management
  // -------------------------------------------------------------------------

  const updateTab = useCallback((tabId: string, updates: Partial<BrowserTab>) => {
    setTabs(prev => prev.map(tab =>
      tab.id === tabId ? { ...tab, ...updates } : tab
    ))
  }, [])

  const addTab = useCallback(() => {
    const newTab = createNewTab()
    setTabs(prev => [...prev, newTab])
    setActiveTabId(newTab.id)
    return newTab.id
  }, [])

  const closeTab = useCallback((tabId: string) => {
    setTabs(prev => {
      if (prev.length === 1) {
        // Don't close last tab, just reset it
        return [createNewTab()]
      }

      const tabIndex = prev.findIndex(t => t.id === tabId)
      const newTabs = prev.filter(t => t.id !== tabId)

      // If closing active tab, switch to adjacent
      if (tabId === activeTabId) {
        const newActiveIndex = Math.min(tabIndex, newTabs.length - 1)
        setActiveTabId(newTabs[newActiveIndex].id)
      }

      return newTabs
    })
  }, [activeTabId])

  // -------------------------------------------------------------------------
  // Navigation
  // -------------------------------------------------------------------------

  /**
   * Navigate to a URL
   */
  const navigateTo = useCallback((
    url: string,
    options: { tabId?: string; addToHistory?: boolean } = {}
  ) => {
    const targetTabId = options.tabId || activeTabId
    const addToHistory = options.addToHistory !== false

    // Normalize and parse URL
    const normalizedUrl = normalizeUserInput(url)
    const parsed = parseURL(normalizedUrl)

    // Resolve site
    const site = getSiteByDomain(parsed.domain)

    // Build display URL
    const displayUrl = buildURL(parsed.domain, parsed.path, parsed.query, parsed.hash)

    // Match route and get title
    let title = site?.name || parsed.domain
    let params: RouteParams = {}

    if (site) {
      const match = matchRoute(site.routes, parsed.path)
      if (match) {
        params = match.params
        if (match.route.metadata?.title) {
          const titleMeta = match.route.metadata.title
          title = typeof titleMeta === 'function' ? titleMeta(params) : titleMeta
        }
      }
    }

    // Create history entry
    const historyEntry: HistoryEntry = {
      url: displayUrl,
      domain: parsed.domain,
      path: parsed.path,
      params,
      title,
      timestamp: Date.now(),
    }

    // Update tab
    setTabs(prev => prev.map(tab => {
      if (tab.id !== targetTabId) return tab

      let newHistory = tab.history
      let newHistoryIndex = tab.historyIndex

      if (addToHistory) {
        // Truncate forward history and add new entry
        newHistory = [...tab.history.slice(0, tab.historyIndex + 1), historyEntry]
        newHistoryIndex = newHistory.length - 1
      }

      return {
        ...tab,
        url: displayUrl,
        site: site || null,
        path: parsed.path,
        params,
        query: parsed.query,
        title,
        history: newHistory,
        historyIndex: newHistoryIndex,
      }
    }))

    // Add to global history (for autocomplete)
    if (addToHistory && site) {
      setGlobalHistory(prev => {
        // Remove duplicate if exists
        const filtered = prev.filter(h => h.url !== displayUrl)
        // Add new entry at front, limit to 100
        return [historyEntry, ...filtered].slice(0, 100)
      })
    }

    return { site, parsed, params }
  }, [activeTabId])

  /**
   * Navigate by site ID (legacy compatibility)
   */
  const navigateToSite = useCallback((siteId: string, tabId?: string) => {
    const site = allSites.find(s => s.id === siteId)
    if (site) {
      navigateTo(`www.${site.domain}`, { tabId })
    } else {
      // Fallback: assume siteId is the domain
      navigateTo(`www.${siteId}.corn`, { tabId })
    }
  }, [allSites, navigateTo])

  /**
   * Navigate within current site (path change)
   * Note: path may include query string (e.g., '/search?q=test')
   */
  const navigateToPath = useCallback((path: string, tabId?: string) => {
    const targetTabId = tabId || activeTabId
    const tab = tabs.find(t => t.id === targetTabId)

    if (!tab?.site) return

    // Parse query from path if present, otherwise don't include old query
    let pathOnly = path
    let queryParams: URLSearchParams | undefined

    const queryIndex = path.indexOf('?')
    if (queryIndex !== -1) {
      pathOnly = path.slice(0, queryIndex)
      queryParams = new URLSearchParams(path.slice(queryIndex + 1))
    }

    const newUrl = buildURL(tab.site.domain, pathOnly, queryParams)
    navigateTo(newUrl, { tabId: targetTabId })
  }, [activeTabId, tabs, navigateTo])

  // -------------------------------------------------------------------------
  // History Navigation
  // -------------------------------------------------------------------------

  const canGoBack = useMemo(() => {
    return activeTab.historyIndex > 0
  }, [activeTab])

  const canGoForward = useMemo(() => {
    return activeTab.historyIndex < activeTab.history.length - 1
  }, [activeTab])

  const goBack = useCallback(() => {
    const tab = activeTab

    if (tab.historyIndex > 0) {
      // Go to previous history entry
      const newIndex = tab.historyIndex - 1
      const entry = tab.history[newIndex]

      // Handle about:blank (home page) entries
      if (entry.url === ABOUT_BLANK) {
        updateTab(tab.id, {
          url: ABOUT_BLANK,
          site: null,
          path: '/',
          params: {},
          query: new URLSearchParams(),
          title: 'New Tab',
          historyIndex: newIndex,
        })
      } else {
        const site = getSiteByDomain(entry.domain)
        updateTab(tab.id, {
          url: entry.url,
          site,
          path: entry.path,
          params: entry.params,
          query: new URLSearchParams(),
          title: entry.title,
          historyIndex: newIndex,
        })
      }
    }
  }, [activeTab, updateTab])

  const goForward = useCallback(() => {
    const tab = activeTab

    if (tab.historyIndex < tab.history.length - 1) {
      const newIndex = tab.historyIndex + 1
      const entry = tab.history[newIndex]

      // Handle about:blank (home page) entries
      if (entry.url === ABOUT_BLANK) {
        updateTab(tab.id, {
          url: ABOUT_BLANK,
          site: null,
          path: '/',
          params: {},
          query: new URLSearchParams(),
          title: 'New Tab',
          historyIndex: newIndex,
        })
      } else {
        const site = getSiteByDomain(entry.domain)
        updateTab(tab.id, {
          url: entry.url,
          site,
          path: entry.path,
          params: entry.params,
          query: new URLSearchParams(),
          title: entry.title,
          historyIndex: newIndex,
        })
      }
    }
  }, [activeTab, updateTab])

  const goHome = useCallback(() => {
    const tab = activeTab

    // Create home history entry
    const homeEntry: HistoryEntry = {
      url: ABOUT_BLANK,
      domain: '',
      path: '/',
      params: {},
      title: 'New Tab',
      timestamp: Date.now(),
    }

    // Truncate forward history and add home entry
    const newHistory = [...tab.history.slice(0, tab.historyIndex + 1), homeEntry]

    updateTab(activeTabId, {
      url: ABOUT_BLANK,
      site: null,
      path: '/',
      params: {},
      query: new URLSearchParams(),
      title: 'New Tab',
      history: newHistory,
      historyIndex: newHistory.length - 1,
    })
  }, [activeTab, activeTabId, updateTab])

  const refresh = useCallback(() => {
    if (activeTab.url) {
      navigateTo(activeTab.url, { addToHistory: false })
    }
  }, [activeTab.url, navigateTo])

  // -------------------------------------------------------------------------
  // Autocomplete
  // -------------------------------------------------------------------------

  const getAutocomplete = useCallback((input: string): AutocompleteSuggestion[] => {
    if (!input.trim()) return []

    return getAutocompleteSuggestions(input, allSites, globalHistory, 8)
  }, [allSites, globalHistory])

  // -------------------------------------------------------------------------
  // Return API
  // -------------------------------------------------------------------------

  return {
    // Tab state
    tabs,
    activeTab,
    activeTabId,
    setActiveTabId,

    // Tab management
    addTab,
    closeTab,
    updateTab,

    // Navigation
    navigateTo,
    navigateToSite,
    navigateToPath,

    // History
    canGoBack,
    canGoForward,
    goBack,
    goForward,
    goHome,
    refresh,

    // Autocomplete
    getAutocomplete,
    allSites,
    globalHistory,
  }
}

// ============================================================================
// Helpers
// ============================================================================

let tabCounter = 0

/** Special URL for the new tab / home page */
export const ABOUT_BLANK = 'about:blank'

function createNewTab(): BrowserTab {
  tabCounter++
  const homeEntry: HistoryEntry = {
    url: ABOUT_BLANK,
    domain: '',
    path: '/',
    params: {},
    title: 'New Tab',
    timestamp: Date.now(),
  }
  return {
    id: `tab-${Date.now()}-${tabCounter}`,
    url: ABOUT_BLANK,
    site: null,
    path: '/',
    params: {},
    query: new URLSearchParams(),
    title: 'New Tab',
    history: [homeEntry],
    historyIndex: 0,
  }
}

export default useCornRouter
