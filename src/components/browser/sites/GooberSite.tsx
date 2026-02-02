/**
 * Goober Site
 *
 * Google-style search engine for the .corn internet.
 * Features FTS5 full-text search with BM25 ranking and proximity boosting.
 *
 * URL Routing:
 * - Homepage: path = null or '/'
 * - Search results: path = '/search?q=query'
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import type { SiteProps } from '../BrowserSiteContainer.js'
import { getAllSearchEntries } from '../../../router/site-registry.js'
import type { SearchIndexEntry } from '../../../router/types.js'

// ============================================================================
// Theme
// ============================================================================

const THEME = {
  // Google-inspired colors
  background: '#ffffff',
  surface: '#f8f9fa',
  text: '#202124',
  textMuted: '#5f6368',
  linkBlue: '#1a0dab',
  urlGreen: '#006621',
  border: '#dfe1e5',
  hoverBg: '#f1f3f4',
  // Logo colors
  logoBlue: '#4285f4',
  logoRed: '#ea4335',
  logoYellow: '#fbbc05',
  logoGreen: '#34a853',
}

// ============================================================================
// Types
// ============================================================================

interface SearchResult {
  id: string
  url: string
  siteDomain: string
  contentType: string
  title: string
  snippet: string
  author: string | null
  tags: string | null
  metadata: string | null
  source: string
  createdAt: number | null
  rank: number
}

interface SearchResponse {
  query: string
  results: SearchResult[]
  total: number
  took: number
  stats?: {
    indexed: number
    byDomain: Record<string, number>
    byType: Record<string, number>
  }
}

interface AutocompleteItem {
  title: string
  url: string
  contentType: string
}

// ============================================================================
// Client-Side Search (using site manifests)
// ============================================================================

/**
 * Get searchable content from site manifests.
 * This is called lazily to ensure manifests are registered first.
 */
function getSearchableContent(): SearchIndexEntry[] {
  const entries = getAllSearchEntries()
  console.log('[Goober] getSearchableContent:', entries.length, 'entries')
  return entries
}

/**
 * Client-side search function.
 * Searches through all registered site manifests.
 */
function clientSearch(query: string): SearchResult[] {
  console.log('[Goober] clientSearch called with query:', query)
  if (!query.trim()) {
    console.log('[Goober] Empty query, returning empty results')
    return []
  }

  const entries = getSearchableContent()
  console.log('[Goober] Searching through', entries.length, 'entries for:', query)

  if (entries.length === 0) {
    console.error('[Goober] WARNING: No entries in search index! Manifests may not be registered.')
    return []
  }

  // Log first few entries to verify content
  console.log('[Goober] First 3 entries:', entries.slice(0, 3))

  const terms = query.toLowerCase().split(/\s+/)
  console.log('[Goober] Search terms:', terms)

  // Score and filter results
  const allScored = entries.map(entry => {
    const titleLower = entry.title.toLowerCase()
    const snippetLower = entry.snippet.toLowerCase()
    const keywordsLower = entry.keywords.join(' ').toLowerCase()

    // Calculate match score
    let score = 0
    for (const term of terms) {
      // Title matches are worth more
      if (titleLower.includes(term)) score += 10
      // Snippet matches
      if (snippetLower.includes(term)) score += 5
      // Keyword matches
      if (keywordsLower.includes(term)) score += 3
    }

    // Apply SEO score as a multiplier
    score = score * (entry.seoScore / 50)

    return { entry, score }
  })

  // Log scoring details for debugging
  const matchingEntries = allScored.filter(({ score }) => score > 0)
  console.log('[Goober] Matching entries before filter:', matchingEntries.length)
  if (matchingEntries.length > 0) {
    console.log('[Goober] Top matches:', matchingEntries.slice(0, 5).map(m => ({ title: m.entry.title, score: m.score })))
  }

  const scored = allScored
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 15)

  // Convert to SearchResult format
  return scored.map(({ entry, score }, i) => ({
    id: entry.url,
    url: entry.url,
    siteDomain: entry.domain,
    contentType: entry.category,
    title: entry.title,
    snippet: entry.snippet,
    author: entry.author || null,
    tags: entry.keywords.join(', ') || null,
    metadata: null,
    source: 'manifest',
    createdAt: entry.indexedAt || null,
    rank: score,
  }))
}

// ============================================================================
// Components
// ============================================================================

function GooberLogo({ size = 'large' }: { size?: 'small' | 'large' }) {
  const fontSize = size === 'large' ? '92px' : '24px'
  const cornSize = size === 'large' ? '72px' : '20px'
  return (
    <div
      style={{
        fontFamily: 'Product Sans, Arial, sans-serif',
        fontWeight: 400,
        fontSize,
        userSelect: 'none',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <span style={{ color: THEME.logoBlue }}>G</span>
      <span style={{ color: THEME.logoRed }}>o</span>
      <span style={{ color: THEME.logoYellow }}>o</span>
      <span style={{ color: THEME.logoBlue }}>b</span>
      <span style={{ color: THEME.logoGreen }}>e</span>
      <span style={{ color: THEME.logoRed }}>r</span>
      <span style={{ marginLeft: size === 'large' ? '8px' : '4px', fontSize: cornSize }}>🌽</span>
    </div>
  )
}

interface SearchBoxProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  autoFocus?: boolean
  size?: 'normal' | 'large'
  suggestions?: AutocompleteItem[]
  onSelectSuggestion?: (item: AutocompleteItem) => void
}

function SearchBox({
  value,
  onChange,
  onSubmit,
  autoFocus,
  size = 'normal',
  suggestions = [],
  onSelectSuggestion,
}: SearchBoxProps) {
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        onSelectSuggestion?.(suggestions[selectedIndex])
        setShowSuggestions(false)
      } else {
        onSubmit()
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => Math.max(prev - 1, -1))
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
    }
  }

  const height = size === 'large' ? '46px' : '40px'
  const fontSize = size === 'large' ? '16px' : '14px'

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '584px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          height,
          padding: '0 16px',
          borderRadius: '24px',
          border: `1px solid ${THEME.border}`,
          background: THEME.background,
          boxShadow: '0 1px 6px rgba(32,33,36,.28)',
        }}
        onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 1px 6px rgba(32,33,36,.28), 0 2px 4px rgba(32,33,36,.1)'}
        onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 1px 6px rgba(32,33,36,.28)'}
      >
        <span style={{ color: '#9aa0a6', marginRight: '12px', fontSize: '20px' }}>🔍</span>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value)
            setShowSuggestions(true)
            setSelectedIndex(-1)
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          onKeyDown={handleKeyDown}
          autoFocus={autoFocus}
          style={{
            flex: 1,
            outline: 'none',
            border: 'none',
            background: 'transparent',
            fontSize,
            color: THEME.text,
          }}
          placeholder="Search the corn internet..."
        />
        {value && (
          <button
            onClick={() => onChange('')}
            style={{
              color: '#70757a',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0 8px',
              fontSize: '14px',
            }}
          >
            ✕
          </button>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '4px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            border: `1px solid ${THEME.border}`,
            overflow: 'hidden',
            zIndex: 10,
            background: THEME.background,
          }}
        >
          {suggestions.map((item, i) => (
            <button
              key={item.url}
              style={{
                width: '100%',
                padding: '8px 16px',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                border: 'none',
                cursor: 'pointer',
                background: i === selectedIndex ? THEME.hoverBg : THEME.background,
              }}
              onMouseEnter={() => setSelectedIndex(i)}
              onClick={() => {
                console.log('[Goober SearchBox] Suggestion clicked:', item)
                console.log('[Goober SearchBox] onSelectSuggestion is:', typeof onSelectSuggestion)
                if (onSelectSuggestion) {
                  onSelectSuggestion(item)
                } else {
                  console.error('[Goober SearchBox] onSelectSuggestion is not defined!')
                }
                setShowSuggestions(false)
              }}
            >
              <span style={{ color: '#9aa0a6' }}>🔍</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: THEME.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</div>
                <div style={{ fontSize: '12px', color: THEME.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.url}</div>
              </div>
              <span
                style={{
                  fontSize: '11px',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  background: THEME.surface,
                  color: THEME.textMuted,
                }}
              >
                {item.contentType}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

interface SearchResultCardProps {
  result: SearchResult
  onNavigate: (url: string) => void
}

function SearchResultCard({ result, onNavigate }: SearchResultCardProps) {
  // Parse highlighted snippet
  const renderSnippet = () => {
    if (!result.snippet) return null
    // Replace <mark> tags with styled spans
    const parts = result.snippet.split(/(<mark>|<\/mark>)/)
    let inMark = false
    return parts.map((part, i) => {
      if (part === '<mark>') {
        inMark = true
        return null
      }
      if (part === '</mark>') {
        inMark = false
        return null
      }
      if (inMark) {
        return <strong key={i} style={{ fontWeight: 'bold' }}>{part}</strong>
      }
      return <span key={i}>{part}</span>
    })
  }

  const contentTypeIcons: Record<string, string> = {
    article: '📰',
    video: '🎬',
    question: '❓',
    thread: '💬',
    business: '🏪',
    campaign: '💰',
    podcast: '🎙️',
    product: '🛒',
    repository: '📦',
    listing: '🏠',
  }

  return (
    <div style={{ padding: '12px 0', borderBottom: `1px solid ${THEME.border}` }}>
      {/* URL breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', marginBottom: '4px' }}>
        <span
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: THEME.surface,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
          }}
        >
          {contentTypeIcons[result.contentType] || '📄'}
        </span>
        <div>
          <div style={{ fontSize: '12px', color: THEME.text }}>{result.siteDomain}</div>
          <div style={{ fontSize: '12px', color: THEME.urlGreen }}>{result.url}</div>
        </div>
      </div>

      {/* Title */}
      <button
        onClick={() => onNavigate(result.url)}
        style={{
          display: 'block',
          fontSize: '20px',
          color: THEME.linkBlue,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          padding: 0,
          marginTop: '4px',
          lineHeight: 1.3,
        }}
        onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
        onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
      >
        {result.title}
      </button>

      {/* Snippet */}
      <p style={{ fontSize: '14px', marginTop: '4px', lineHeight: 1.58, color: THEME.text }}>
        {renderSnippet()}
      </p>

      {/* Metadata */}
      {(result.author || result.contentType) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px', fontSize: '12px', color: THEME.textMuted }}>
          {result.author && <span>By {result.author}</span>}
          <span style={{ textTransform: 'capitalize' }}>{result.contentType}</span>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// Main Component
// ============================================================================

export function GooberSite({ siteId, path, onNavigate, onPathChange, onNavigateToUrl }: SiteProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTime, setSearchTime] = useState(0)
  const [suggestions, setSuggestions] = useState<AutocompleteItem[]>([])

  // Parse path to determine view
  const parsedPath = useMemo(() => {
    console.log('[Goober] Parsing path:', path)
    if (!path || path === '/') {
      console.log('[Goober] Path is home')
      return { view: 'home' as const, query: '' }
    }
    if (path.startsWith('/search')) {
      // Parse query from path: /search?q=...
      const match = path.match(/[?&]q=([^&]+)/)
      const q = match ? decodeURIComponent(match[1].replace(/\+/g, ' ')) : ''
      console.log('[Goober] Path is search, query:', q)
      return { view: 'results' as const, query: q }
    }
    console.log('[Goober] Unknown path, defaulting to home')
    return { view: 'home' as const, query: '' }
  }, [path])

  // Sync query state with URL (only when URL changes, not when query changes)
  useEffect(() => {
    console.log('[Goober] Query sync effect - parsedPath.query:', parsedPath.query)
    if (parsedPath.query) {
      console.log('[Goober] Syncing query from URL:', parsedPath.query)
      setQuery(parsedPath.query)
    }
  }, [parsedPath.query])

  const executeSearch = useCallback(async (searchQuery: string) => {
    console.log('[Goober] executeSearch called with:', searchQuery)
    if (!searchQuery.trim()) {
      console.log('[Goober] Empty query, clearing results')
      setResults([])
      return
    }

    setIsLoading(true)
    const startTime = Date.now()

    try {
      // Use client-side search from site manifests
      // In production, this could also use WebSocket to call search:query for dynamic content
      const searchResults = clientSearch(searchQuery)
      console.log('[Goober] Search returned', searchResults.length, 'results:', searchResults)
      setResults(searchResults)
      setSearchTime(Date.now() - startTime)
    } catch (error) {
      console.error('[Goober] Search error:', error)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Execute search when on results page
  useEffect(() => {
    console.log('[Goober] Search effect - view:', parsedPath.view, 'query:', parsedPath.query)
    if (parsedPath.view === 'results' && parsedPath.query) {
      console.log('[Goober] On results page with query, executing search')
      executeSearch(parsedPath.query)
    }
  }, [parsedPath.view, parsedPath.query, executeSearch])

  const handleSearch = useCallback(() => {
    console.log('[Goober] handleSearch called with query:', query)
    if (!query.trim()) {
      console.log('[Goober] Empty query, not searching')
      return
    }
    const encodedQuery = encodeURIComponent(query).replace(/%20/g, '+')
    const newPath = `/search?q=${encodedQuery}`
    console.log('[Goober] Navigating to path:', newPath)
    onPathChange(newPath)
  }, [query, onPathChange])

  const handleNavigateToResult = useCallback((url: string) => {
    console.log('[Goober] handleNavigateToResult called with url:', url)
    console.log('[Goober] onNavigateToUrl is:', typeof onNavigateToUrl, onNavigateToUrl ? 'defined' : 'undefined')
    if (onNavigateToUrl) {
      onNavigateToUrl(url)
    } else {
      console.error('[Goober] onNavigateToUrl is not defined!')
    }
  }, [onNavigateToUrl])

  const handleSelectSuggestion = useCallback((item: AutocompleteItem) => {
    console.log('[Goober] handleSelectSuggestion called with item:', item)
    console.log('[Goober] onNavigateToUrl is:', typeof onNavigateToUrl, onNavigateToUrl ? 'defined' : 'undefined')
    if (onNavigateToUrl) {
      onNavigateToUrl(item.url)
    } else {
      console.error('[Goober] onNavigateToUrl is not defined!')
    }
  }, [onNavigateToUrl])

  const handleFeelingCorny = useCallback(() => {
    // Navigate to a random result from site manifests
    const entries = getSearchableContent()
    const random = entries[Math.floor(Math.random() * entries.length)]
    if (random && onNavigateToUrl) {
      onNavigateToUrl(random.url)
    }
  }, [onNavigateToUrl])

  // Generate autocomplete suggestions from site manifests
  useEffect(() => {
    if (query.length >= 2) {
      const entries = getSearchableContent()
      console.log('[Goober] Autocomplete - searching', entries.length, 'entries for:', query)
      const matching = entries.filter(entry => entry.title.toLowerCase().includes(query.toLowerCase()))
      console.log('[Goober] Autocomplete - found', matching.length, 'matches')
      const newSuggestions = matching
        .slice(0, 5)
        .map(entry => ({
          title: entry.title,
          url: entry.url,
          contentType: entry.category,
        }))
      console.log('[Goober] Autocomplete - showing', newSuggestions.length, 'suggestions:', newSuggestions)
      setSuggestions(newSuggestions)
    } else {
      setSuggestions([])
    }
  }, [query])

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  // Homepage view
  if (parsedPath.view === 'home') {
    return (
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: THEME.background,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem', marginTop: '-5rem' }}>
          {/* Logo */}
          <GooberLogo size="large" />

          {/* Search Box */}
          <SearchBox
            value={query}
            onChange={setQuery}
            onSubmit={handleSearch}
            autoFocus
            size="large"
            suggestions={suggestions}
            onSelectSuggestion={handleSelectSuggestion}
          />

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
            <button
              onClick={handleSearch}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                fontSize: '14px',
                background: THEME.surface,
                color: THEME.text,
                border: `1px solid ${THEME.border}`,
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)'
                e.currentTarget.style.borderColor = '#c6c6c6'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.borderColor = THEME.border
              }}
            >
              Goober Search
            </button>
            <button
              onClick={handleFeelingCorny}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                fontSize: '14px',
                background: THEME.surface,
                color: THEME.text,
                border: `1px solid ${THEME.border}`,
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)'
                e.currentTarget.style.borderColor = '#c6c6c6'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.borderColor = THEME.border
              }}
            >
              I'm Feeling Corny
            </button>
          </div>

          {/* Footer info */}
          <div style={{ fontSize: '14px', color: THEME.textMuted, marginTop: '3rem' }}>
            Searching the entire .corn internet
          </div>
        </div>
      </div>
    )
  }

  // Results view
  return (
    <div style={{ position: 'absolute', inset: 0, background: THEME.background, overflow: 'auto' }}>
      {/* Header */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          borderBottom: `1px solid ${THEME.border}`,
          padding: '16px 24px',
          background: THEME.background,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <button
            onClick={() => onPathChange(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <GooberLogo size="small" />
          </button>
          <SearchBox
            value={query}
            onChange={setQuery}
            onSubmit={handleSearch}
            suggestions={suggestions}
            onSelectSuggestion={handleSelectSuggestion}
          />
        </div>
      </div>

      {/* Results */}
      <div style={{ maxWidth: '700px', padding: '16px 24px 16px 150px' }}>
        {/* Stats */}
        {!isLoading && results.length > 0 && (
          <div style={{ fontSize: '14px', color: THEME.textMuted, marginBottom: '16px' }}>
            About {results.length} results ({(searchTime / 1000).toFixed(2)} seconds)
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div style={{ padding: '32px 0', textAlign: 'center', color: THEME.textMuted }}>
            Searching...
          </div>
        )}

        {/* No results */}
        {!isLoading && results.length === 0 && query && (
          <div style={{ padding: '32px 0' }}>
            <p style={{ color: THEME.text }}>
              No results found for <strong>{query}</strong>
            </p>
            <p style={{ marginTop: '8px', color: THEME.textMuted }}>
              Try different keywords or check your spelling.
            </p>
          </div>
        )}

        {/* Results list */}
        <div>
          {results.map((result) => (
            <SearchResultCard
              key={result.id}
              result={result}
              onNavigate={handleNavigateToResult}
            />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          borderTop: `1px solid ${THEME.border}`,
          padding: '16px 24px',
          marginTop: '32px',
          background: THEME.surface,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', fontSize: '14px', color: THEME.textMuted }}>
          <span>Cornfield, KS</span>
          <span>•</span>
          <span>Privacy</span>
          <span>•</span>
          <span>Terms</span>
          <span>•</span>
          <span>Settings</span>
        </div>
      </div>
    </div>
  )
}

export default GooberSite
