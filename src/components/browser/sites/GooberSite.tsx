/**
 * Goober Site
 *
 * Google-style search engine for the .corn internet.
 * Uses server-side FTS5 full-text search with BM25 ranking.
 *
 * URL Routing:
 * - Homepage: path = null or '/'
 * - Search results: path = '/search?q=query'
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import type { SiteComponentProps } from '../../../router/types.js'
import { useWSStore } from '../../../stores/wsStore.js'

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

interface AutocompleteResponse {
  prefix: string
  suggestions: AutocompleteItem[]
}

interface AIOverviewState {
  loading: boolean
  content: string | null
  sources: Array<{ title: string; url: string; domain: string }>
  error: string | null
}

// ============================================================================
// Sponsored/Fallback Results
// ============================================================================

const SPONSORED_SITES: Array<{
  url: string
  title: string
  snippet: string
  domain: string
  contentType: string
  isSponsored: true
}> = [
  {
    url: 'www.wikiknow.corn',
    title: 'WikiKnow - The Free Encyclopedia',
    snippet: 'The free encyclopedia that anyone can edit. Millions of articles on every topic.',
    domain: 'wikiknow.corn',
    contentType: 'wiki',
    isSponsored: true,
  },
  {
    url: 'www.threadit.corn',
    title: 'Threadit - The Front Page of the Fake Internet',
    snippet: 'Dive into anything. Communities for every interest, upvotes, downvotes, and endless discussions.',
    domain: 'threadit.corn',
    contentType: 'forum',
    isSponsored: true,
  },
  {
    url: 'www.dailybuzz.corn',
    title: 'DailyBuzz - All The News That Fits',
    snippet: 'Breaking news, local stories, and everything in between. Your source for what\'s happening.',
    domain: 'dailybuzz.corn',
    contentType: 'news',
    isSponsored: true,
  },
  {
    url: 'www.vidtube.corn',
    title: 'VidTube - Broadcast Yourself',
    snippet: 'Share and discover videos. Upload, watch, and comment on the latest content.',
    domain: 'vidtube.corn',
    contentType: 'video',
    isSponsored: true,
  },
  {
    url: 'www.amaize.corn',
    title: 'Amaize - Everything Store',
    snippet: 'Shop millions of products with fast shipping. From corn to quantum coffee brewers.',
    domain: 'amaize.corn',
    contentType: 'product',
    isSponsored: true,
  },
]

function getSponsoredResults(_query: string): SearchResult[] {
  return SPONSORED_SITES.map((site, i) => ({
    id: `sponsored-${i}`,
    url: site.url,
    siteDomain: site.domain,
    contentType: site.contentType,
    title: site.title,
    snippet: site.snippet,
    author: null,
    tags: null,
    metadata: null,
    source: 'sponsored',
    createdAt: null,
    rank: 100 - i,
  }))
}

// Random common search terms for "I'm Feeling Corny"
const RANDOM_TERMS = [
  'coffee', 'quantum', 'music', 'hartwell', 'trust fall',
  'underground', 'corn', 'recipe', 'podcast', 'mystery',
  'band', 'review', 'derek', 'building', 'floor 13',
]

// ============================================================================
// Components
// ============================================================================

// ============================================================================
// AI Overview Component
// ============================================================================

interface AIOverviewProps {
  state: AIOverviewState
  onSourceClick: (url: string) => void
}

function AIOverview({ state, onSourceClick }: AIOverviewProps) {
  if (state.loading) {
    return (
      <div
        style={{
          marginBottom: '24px',
          padding: '16px 20px',
          borderRadius: '12px',
          border: `1px solid ${THEME.border}`,
          background: `linear-gradient(135deg, ${THEME.surface} 0%, #e8f0fe 100%)`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${THEME.logoBlue}, ${THEME.logoGreen})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'pulse 1.5s infinite',
            }}
          >
            <span style={{ fontSize: '14px' }}>✨</span>
          </div>
          <span style={{ fontWeight: 500, color: THEME.text }}>AI Overview</span>
          <span style={{ fontSize: '12px', color: THEME.textMuted }}>generating...</span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[1, 2, 3].map(i => (
            <div
              key={i}
              style={{
                height: '12px',
                borderRadius: '6px',
                background: THEME.border,
                animation: `shimmer 1.5s infinite ${i * 0.2}s`,
                flex: i === 1 ? 3 : i === 2 ? 2 : 1,
              }}
            />
          ))}
        </div>
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          @keyframes shimmer {
            0% { opacity: 0.3; }
            50% { opacity: 0.6; }
            100% { opacity: 0.3; }
          }
        `}</style>
      </div>
    )
  }

  if (state.error || !state.content) return null

  return (
    <div
      style={{
        marginBottom: '24px',
        padding: '16px 20px',
        borderRadius: '12px',
        border: `1px solid ${THEME.border}`,
        background: `linear-gradient(135deg, ${THEME.surface} 0%, #e8f0fe 100%)`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
        <div
          style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${THEME.logoBlue}, ${THEME.logoGreen})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={{ fontSize: '14px' }}>✨</span>
        </div>
        <span style={{ fontWeight: 500, color: THEME.text }}>AI Overview</span>
        <span style={{ fontSize: '11px', color: THEME.textMuted, marginLeft: 'auto' }}>
          Powered by CornGPT
        </span>
      </div>

      <div style={{ fontSize: '14px', lineHeight: 1.6, color: THEME.text, whiteSpace: 'pre-wrap' }}>
        {state.content}
      </div>

      {state.sources.length > 0 && (
        <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: `1px solid ${THEME.border}` }}>
          <div style={{ fontSize: '12px', color: THEME.textMuted, marginBottom: '8px' }}>Sources</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {state.sources.slice(0, 3).map((source, i) => (
              <button
                key={i}
                onClick={() => onSourceClick(source.url)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '16px',
                  border: `1px solid ${THEME.border}`,
                  background: THEME.background,
                  cursor: 'pointer',
                  fontSize: '12px',
                  color: THEME.linkBlue,
                }}
              >
                <span style={{ color: THEME.textMuted }}>🔗</span>
                {source.domain}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

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
      setShowSuggestions(false)
      inputRef.current?.blur()
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        onSelectSuggestion?.(suggestions[selectedIndex])
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
      inputRef.current?.blur()
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
  const renderSnippet = () => {
    if (!result.snippet) return null
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
    show: '🎧',
    recipe: '🍳',
    market: '📈',
    place: '📍',
    board: '📋',
    repo: '📦',
  }

  return (
    <div style={{ padding: '12px 0', borderBottom: `1px solid ${THEME.border}` }}>
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

      <p style={{ fontSize: '14px', marginTop: '4px', lineHeight: 1.58, color: THEME.text }}>
        {renderSnippet()}
      </p>

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

export function GooberSite({ siteId, path, params, query, onNavigate, onPathChange, onNavigateToUrl }: SiteComponentProps) {
  const [searchInput, setSearchInput] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTime, setSearchTime] = useState(0)
  const [suggestions, setSuggestions] = useState<AutocompleteItem[]>([])
  const [showingSponsored, setShowingSponsored] = useState(false)
  const [aiOverview, setAiOverview] = useState<AIOverviewState>({
    loading: false,
    content: null,
    sources: [],
    error: null,
  })

  const ws = useWSStore()

  const parsedPath = useMemo(() => {
    if (!path || path === '/') {
      return { view: 'home' as const, query: '' }
    }
    if (path.startsWith('/search')) {
      const q = query?.get('q') || ''
      return { view: 'results' as const, query: q }
    }
    return { view: 'home' as const, query: '' }
  }, [path, query])

  useEffect(() => {
    if (parsedPath.query) {
      setSearchInput(parsedPath.query)
    }
  }, [parsedPath.query])

  const executeSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      setShowingSponsored(false)
      setAiOverview({ loading: false, content: null, sources: [], error: null })
      return
    }

    setIsLoading(true)
    setAiOverview({ loading: false, content: null, sources: [], error: null })
    const startTime = Date.now()

    try {
      if (!ws.connected) {
        throw new Error('Not connected')
      }

      const response = await ws.request<
        { query: string; limit?: number },
        SearchResponse
      >('search:query', { query: searchQuery, limit: 20 })

      if (response.results.length === 0) {
        setResults(getSponsoredResults(searchQuery))
        setShowingSponsored(true)
      } else {
        setResults(response.results)
        setShowingSponsored(false)
      }
      setSearchTime(response.took || (Date.now() - startTime))
    } catch (error) {
      console.error('[Goober] Search error:', error)
      setResults(getSponsoredResults(searchQuery))
      setShowingSponsored(true)
    } finally {
      setIsLoading(false)
    }
  }, [ws])

  // Request AI Overview when we have search results
  const requestAIOverview = useCallback(async (searchQuery: string, searchResults: SearchResult[]) => {
    if (showingSponsored || !ws.connected || searchResults.length === 0) return

    setAiOverview({ loading: true, content: null, sources: [], error: null })

    try {
      const topResults = searchResults.slice(0, 5)
      const context = topResults
        .map(r => `[${r.siteDomain}] ${r.title}: ${r.snippet}`)
        .join('\n\n')

      const prompt = `Based on these search results from the .corn internet, provide a brief, helpful overview answering the query "${searchQuery}". Be concise (2-3 sentences max). Use a helpful, informative tone like Google's AI Overview.

Search results:
${context}

Respond naturally as if you're summarizing what you found. Don't mention that these are "search results" - just answer the query directly.`

      const response = await ws.request<
        { message: string; history?: Array<{ role: 'user' | 'assistant'; content: string }> },
        { message: string; sources?: Array<{ title: string; url: string; snippet: string; domain: string }> }
      >('ai:directChat', {
        message: prompt,
        history: [],
      })

      const sources = topResults.map(r => ({
        title: r.title,
        url: r.url,
        domain: r.siteDomain,
      }))

      setAiOverview({
        loading: false,
        content: response.message,
        sources,
        error: null,
      })
    } catch (error) {
      console.error('[Goober] AI Overview error:', error)
      setAiOverview({
        loading: false,
        content: null,
        sources: [],
        error: error instanceof Error ? error.message : 'Failed to generate overview',
      })
    }
  }, [ws, showingSponsored])

  // Trigger AI overview when results change
  useEffect(() => {
    if (results.length > 0 && !showingSponsored && parsedPath.query) {
      requestAIOverview(parsedPath.query, results)
    }
  }, [results, showingSponsored, parsedPath.query, requestAIOverview])

  // Execute search when on results page
  useEffect(() => {
    if (parsedPath.view === 'results' && parsedPath.query) {
      executeSearch(parsedPath.query)
    }
  }, [parsedPath.view, parsedPath.query, executeSearch])

  const handleSearch = useCallback(() => {
    if (!searchInput.trim()) return
    const encodedQuery = encodeURIComponent(searchInput).replace(/%20/g, '+')
    onPathChange(`/search?q=${encodedQuery}`)
  }, [searchInput, onPathChange])

  const handleNavigateToResult = useCallback((url: string) => {
    onNavigateToUrl(url)
  }, [onNavigateToUrl])

  const handleSelectSuggestion = useCallback((item: AutocompleteItem) => {
    onNavigateToUrl(item.url)
  }, [onNavigateToUrl])

  const handleFeelingCorny = useCallback(async () => {
    if (!ws.connected) return
    try {
      const term = RANDOM_TERMS[Math.floor(Math.random() * RANDOM_TERMS.length)]
      const response = await ws.request<
        { query: string; limit?: number },
        SearchResponse
      >('search:query', { query: term, limit: 10 })

      if (response.results.length > 0) {
        const random = response.results[Math.floor(Math.random() * response.results.length)]
        onNavigateToUrl(random.url)
      }
    } catch (error) {
      console.error('[Goober] Feeling Corny error:', error)
    }
  }, [ws, onNavigateToUrl])

  // Server-side autocomplete
  useEffect(() => {
    if (searchInput.length < 2 || !ws.connected) {
      setSuggestions([])
      return
    }

    let cancelled = false
    const timeout = setTimeout(async () => {
      try {
        const response = await ws.request<
          { prefix: string; limit?: number },
          AutocompleteResponse
        >('search:autocomplete', { prefix: searchInput, limit: 5 })

        if (!cancelled) {
          setSuggestions(response.suggestions || [])
        }
      } catch {
        if (!cancelled) setSuggestions([])
      }
    }, 150) // debounce

    return () => {
      cancelled = true
      clearTimeout(timeout)
    }
  }, [searchInput, ws])

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
          <GooberLogo size="large" />

          <SearchBox
            value={searchInput}
            onChange={setSearchInput}
            onSubmit={handleSearch}
            autoFocus
            size="large"
            suggestions={suggestions}
            onSelectSuggestion={handleSelectSuggestion}
          />

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
            value={searchInput}
            onChange={setSearchInput}
            onSubmit={handleSearch}
            suggestions={suggestions}
            onSelectSuggestion={handleSelectSuggestion}
          />
        </div>
      </div>

      <div style={{ maxWidth: '700px', padding: '16px 24px 16px 150px' }}>
        {!isLoading && results.length > 0 && !showingSponsored && (
          <div style={{ fontSize: '14px', color: THEME.textMuted, marginBottom: '16px' }}>
            About {results.length} results ({(searchTime / 1000).toFixed(2)} seconds)
          </div>
        )}

        {isLoading && (
          <div style={{ padding: '32px 0', textAlign: 'center', color: THEME.textMuted }}>
            Searching...
          </div>
        )}

        {!isLoading && showingSponsored && (
          <div
            style={{
              padding: '16px',
              marginBottom: '16px',
              borderRadius: '8px',
              background: '#fff3cd',
              border: '1px solid #ffc107',
            }}
          >
            <p style={{ color: '#856404', margin: 0 }}>
              No results found for <strong>{searchInput}</strong>
            </p>
            <p style={{ color: '#856404', margin: '8px 0 0', fontSize: '14px' }}>
              Here are some popular sites you might find helpful:
            </p>
          </div>
        )}

        {!isLoading && !showingSponsored && (aiOverview.loading || aiOverview.content) && (
          <AIOverview state={aiOverview} onSourceClick={handleNavigateToResult} />
        )}

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
