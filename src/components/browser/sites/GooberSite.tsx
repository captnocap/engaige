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
// Mock Search (until WebSocket is connected)
// ============================================================================

// Static content for client-side search fallback
const MOCK_CONTENT = [
  { id: 'q1', url: 'www.dailybuzz.corn/article/quantum-cafe-opens', title: 'New Quantum Cafe Opens Downtown, Charges $47 Per Cup', snippet: 'Qubit Coffee opens in Hartwell Building with quantum brewing technology...', contentType: 'article', siteDomain: 'dailybuzz.corn' },
  { id: 'q2', url: 'www.wikiknow.corn/wiki/Quantum_Coffee_Brewing', title: 'Quantum Coffee Brewing - WikiKnow', snippet: 'Controversial preparation method claiming to use quantum mechanics...', contentType: 'article', siteDomain: 'wikiknow.corn' },
  { id: 'q3', url: 'www.wikiknow.corn/wiki/Hartwell_Building', title: 'Hartwell Building - WikiKnow', snippet: 'Historic downtown building notable for its "missing" 13th floor mystery...', contentType: 'article', siteDomain: 'wikiknow.corn' },
  { id: 'q4', url: 'www.wikiknow.corn/wiki/Trust_Fall_Tim', title: 'Trust Fall Tim - WikiKnow', snippet: 'Performance artist known for daily public trust falls since 2018...', contentType: 'article', siteDomain: 'wikiknow.corn' },
  { id: 'q5', url: 'www.dailybuzz.corn/article/trust-fall-record', title: 'Local Man Breaks Trust Fall Record with 2,847 Consecutive Falls', snippet: 'Trust Fall Tim achieves 78.5% catch rate over eight-year experiment...', contentType: 'article', siteDomain: 'dailybuzz.corn' },
  { id: 'q6', url: 'www.wikiknow.corn/wiki/The_Underground_(venue)', title: 'The Underground (venue) - WikiKnow', snippet: 'Experimental music venue known for hosting avant-garde performances...', contentType: 'article', siteDomain: 'wikiknow.corn' },
  { id: 'q7', url: 'www.dailybuzz.corn/article/local-band-cancels-show', title: 'Local Band Cancels Show Due to "Ongoing Existential Crisis"', snippet: 'The Velvet Algorithms cite "fundamental questioning of musical purpose"...', contentType: 'article', siteDomain: 'dailybuzz.corn' },
  { id: 'q8', url: 'www.vidtube.corn/watch/hartwell_floor_13', title: 'We Snuck Into the Hartwell Building\'s Missing Floor 13', snippet: 'Urban exploration of the mysterious missing floor...', contentType: 'video', siteDomain: 'vidtube.corn' },
  { id: 'q9', url: 'www.threadit.corn/t/floor_13_theory', title: '[THEORY] The Hartwell Building Floor 13 is a dimensional pocket', snippet: 'Conspiracy theory about the true nature of the missing floor...', contentType: 'thread', siteDomain: 'threadit.corn' },
  { id: 'q10', url: 'www.cobfundme.corn/campaign/quantum-coffee-research', title: 'Fund Derek\'s Quantum Coffee Research', snippet: 'Crowdfunding campaign to fund independent quantum coffee research...', contentType: 'campaign', siteDomain: 'cobfundme.corn' },
]

function mockSearch(query: string): SearchResult[] {
  if (!query.trim()) return []
  const terms = query.toLowerCase().split(/\s+/)
  return MOCK_CONTENT
    .filter(item => {
      const text = `${item.title} ${item.snippet}`.toLowerCase()
      return terms.some(term => text.includes(term))
    })
    .map((item, i) => ({
      ...item,
      author: null,
      tags: null,
      metadata: null,
      source: 'static',
      createdAt: null,
      rank: i,
    }))
    .slice(0, 10)
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
                onSelectSuggestion?.(item)
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
    if (!path || path === '/') {
      return { view: 'home' as const, query: '' }
    }
    if (path.startsWith('/search')) {
      // Parse query from path: /search?q=...
      const match = path.match(/[?&]q=([^&]+)/)
      const q = match ? decodeURIComponent(match[1].replace(/\+/g, ' ')) : ''
      return { view: 'results' as const, query: q }
    }
    return { view: 'home' as const, query: '' }
  }, [path])

  // Sync query state with URL
  useEffect(() => {
    if (parsedPath.query && parsedPath.query !== query) {
      setQuery(parsedPath.query)
    }
  }, [parsedPath.query])

  // Execute search when on results page
  useEffect(() => {
    if (parsedPath.view === 'results' && parsedPath.query) {
      executeSearch(parsedPath.query)
    }
  }, [parsedPath.view, parsedPath.query])

  const executeSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setIsLoading(true)
    const startTime = Date.now()

    try {
      // For now, use mock search (WebSocket not connected in browser context)
      // In production, this would use the WebSocket to call search:query
      const mockResults = mockSearch(searchQuery)
      setResults(mockResults)
      setSearchTime(Date.now() - startTime)
    } catch (error) {
      console.error('[Goober] Search error:', error)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleSearch = useCallback(() => {
    if (!query.trim()) return
    const encodedQuery = encodeURIComponent(query).replace(/%20/g, '+')
    onPathChange(`/search?q=${encodedQuery}`)
  }, [query, onPathChange])

  const handleNavigateToResult = useCallback((url: string) => {
    if (onNavigateToUrl) {
      onNavigateToUrl(url)
    }
  }, [onNavigateToUrl])

  const handleSelectSuggestion = useCallback((item: AutocompleteItem) => {
    if (onNavigateToUrl) {
      onNavigateToUrl(item.url)
    }
  }, [onNavigateToUrl])

  const handleFeelingCorny = useCallback(() => {
    // Navigate to a random result from mock content
    const random = MOCK_CONTENT[Math.floor(Math.random() * MOCK_CONTENT.length)]
    if (random && onNavigateToUrl) {
      onNavigateToUrl(random.url)
    }
  }, [onNavigateToUrl])

  // Generate autocomplete suggestions
  useEffect(() => {
    if (query.length >= 2) {
      const mockSuggestions = MOCK_CONTENT
        .filter(item => item.title.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 5)
        .map(item => ({
          title: item.title,
          url: item.url,
          contentType: item.contentType,
        }))
      setSuggestions(mockSuggestions)
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
