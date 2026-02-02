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
  const fontSize = size === 'large' ? 'text-6xl' : 'text-2xl'
  return (
    <div className={`font-bold ${fontSize} select-none`} style={{ fontFamily: 'system-ui' }}>
      <span style={{ color: THEME.logoBlue }}>G</span>
      <span style={{ color: THEME.logoRed }}>o</span>
      <span style={{ color: THEME.logoYellow }}>o</span>
      <span style={{ color: THEME.logoBlue }}>b</span>
      <span style={{ color: THEME.logoGreen }}>e</span>
      <span style={{ color: THEME.logoRed }}>r</span>
      <span className="ml-1">🌽</span>
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

  const height = size === 'large' ? 'h-12' : 'h-10'
  const textSize = size === 'large' ? 'text-lg' : 'text-base'

  return (
    <div className="relative w-full max-w-xl">
      <div
        className={`flex items-center ${height} px-4 rounded-full border hover:shadow-md focus-within:shadow-md transition-shadow`}
        style={{ borderColor: THEME.border, background: THEME.background }}
      >
        <span className="text-gray-400 mr-3">🔍</span>
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
          className={`flex-1 outline-none bg-transparent ${textSize}`}
          style={{ color: THEME.text }}
          placeholder="Search the corn internet..."
        />
        {value && (
          <button
            onClick={() => onChange('')}
            className="text-gray-400 hover:text-gray-600 mx-2"
          >
            ✕
          </button>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div
          className="absolute top-full left-0 right-0 mt-1 rounded-lg shadow-lg border overflow-hidden z-10"
          style={{ background: THEME.background, borderColor: THEME.border }}
        >
          {suggestions.map((item, i) => (
            <button
              key={item.url}
              className={`w-full px-4 py-2 text-left flex items-center gap-3 ${
                i === selectedIndex ? 'bg-gray-100' : ''
              }`}
              style={{ background: i === selectedIndex ? THEME.hoverBg : undefined }}
              onMouseEnter={() => setSelectedIndex(i)}
              onClick={() => {
                onSelectSuggestion?.(item)
                setShowSuggestions(false)
              }}
            >
              <span className="text-gray-400">🔍</span>
              <div className="flex-1 min-w-0">
                <div className="truncate" style={{ color: THEME.text }}>{item.title}</div>
                <div className="text-xs truncate" style={{ color: THEME.textMuted }}>{item.url}</div>
              </div>
              <span
                className="text-xs px-2 py-0.5 rounded"
                style={{ background: THEME.surface, color: THEME.textMuted }}
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
    <div className="py-4">
      {/* URL breadcrumb */}
      <div className="flex items-center gap-2 text-sm mb-1">
        <span>{contentTypeIcons[result.contentType] || '📄'}</span>
        <span style={{ color: THEME.urlGreen }}>{result.url}</span>
      </div>

      {/* Title */}
      <button
        onClick={() => onNavigate(result.url)}
        className="text-xl hover:underline text-left"
        style={{ color: THEME.linkBlue }}
      >
        {result.title}
      </button>

      {/* Snippet */}
      <p className="text-sm mt-1 leading-relaxed" style={{ color: THEME.text }}>
        {renderSnippet()}
      </p>

      {/* Metadata */}
      {(result.author || result.contentType) && (
        <div className="flex items-center gap-3 mt-2 text-xs" style={{ color: THEME.textMuted }}>
          {result.author && <span>By {result.author}</span>}
          <span className="capitalize">{result.contentType}</span>
          <span>{result.siteDomain}</span>
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
        className="min-h-full flex flex-col items-center justify-center"
        style={{ background: THEME.background }}
      >
        <div className="flex flex-col items-center gap-8 -mt-20">
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
          <div className="flex gap-4">
            <button
              onClick={handleSearch}
              className="px-4 py-2 rounded text-sm"
              style={{
                background: THEME.surface,
                color: THEME.text,
                border: `1px solid ${THEME.border}`,
              }}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
            >
              Goober Search
            </button>
            <button
              onClick={handleFeelingCorny}
              className="px-4 py-2 rounded text-sm"
              style={{
                background: THEME.surface,
                color: THEME.text,
                border: `1px solid ${THEME.border}`,
              }}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
            >
              I'm Feeling Corny
            </button>
          </div>

          {/* Footer info */}
          <div className="text-sm mt-12" style={{ color: THEME.textMuted }}>
            Searching the entire .corn internet
          </div>
        </div>
      </div>
    )
  }

  // Results view
  return (
    <div className="min-h-full" style={{ background: THEME.background }}>
      {/* Header */}
      <div
        className="sticky top-0 z-10 border-b px-6 py-4"
        style={{ background: THEME.background, borderColor: THEME.border }}
      >
        <div className="flex items-center gap-6">
          <button onClick={() => onPathChange(null)}>
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
      <div className="max-w-3xl px-6 py-4">
        {/* Stats */}
        {!isLoading && results.length > 0 && (
          <div className="text-sm mb-4" style={{ color: THEME.textMuted }}>
            About {results.length} results ({(searchTime / 1000).toFixed(2)} seconds)
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="py-8 text-center" style={{ color: THEME.textMuted }}>
            Searching...
          </div>
        )}

        {/* No results */}
        {!isLoading && results.length === 0 && query && (
          <div className="py-8">
            <p style={{ color: THEME.text }}>
              No results found for <strong>{query}</strong>
            </p>
            <p className="mt-2" style={{ color: THEME.textMuted }}>
              Try different keywords or check your spelling.
            </p>
          </div>
        )}

        {/* Results list */}
        <div className="divide-y" style={{ borderColor: THEME.border }}>
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
        className="border-t py-4 px-6 mt-8"
        style={{ borderColor: THEME.border, background: THEME.surface }}
      >
        <div className="flex justify-center gap-8 text-sm" style={{ color: THEME.textMuted }}>
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
