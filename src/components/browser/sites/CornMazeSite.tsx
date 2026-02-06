/**
 * Corn Maze Site
 *
 * A raw index of all .corn sites and their content paths.
 * Like viewing the entire search index in a browsable sitemap format.
 * Fetches page data from the server (sites:getSiteIndex).
 *
 * URL: corn:maze (special protocol, not www.maze.corn)
 */

import { useState, useMemo, useEffect } from 'react'
import type { SiteComponentProps } from '../../../router/types.js'
import { getAllManifests } from '../../../router/site-registry.js'
import type { SiteManifest } from '../../../router/types.js'
import { useWSStore } from '../../../stores/wsStore.js'

// ============================================================================
// Theme
// ============================================================================

const THEME = {
  bg: '#0a0a0a',
  surface: '#141414',
  surfaceHover: '#1a1a1a',
  border: '#2a2a2a',
  text: '#e0e0e0',
  textMuted: '#888888',
  textDim: '#555555',
  accent: '#4ade80', // Green for corn theme
  accentDim: '#166534',
  link: '#60a5fa',
  linkHover: '#93c5fd',
}

// ============================================================================
// Helper: Category Colors
// ============================================================================

const CATEGORY_COLORS: Record<string, string> = {
  social: '#f472b6',
  forum: '#fb923c',
  wiki: '#a78bfa',
  news: '#60a5fa',
  video: '#f87171',
  product: '#4ade80',
  blog: '#fbbf24',
  entertainment: '#e879f9',
  website: '#94a3b8',
  article: '#60a5fa',
  thread: '#fb923c',
  question: '#a78bfa',
  business: '#4ade80',
  campaign: '#fbbf24',
  show: '#e879f9',
  recipe: '#f472b6',
  market: '#34d399',
  listing: '#f87171',
  place: '#94a3b8',
  repo: '#a78bfa',
  board: '#fb923c',
}

function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] || THEME.textMuted
}

// ============================================================================
// Types
// ============================================================================

interface SiteIndexPage {
  url: string
  title: string
  type: string
  description: string
}

interface SiteIndexEntry {
  domain: string
  pages: SiteIndexPage[]
}

// ============================================================================
// Main Component
// ============================================================================

export function CornMazeSite({ onNavigateToUrl }: SiteComponentProps) {
  const [expandedSites, setExpandedSites] = useState<Set<string>>(new Set())
  const [filter, setFilter] = useState('')
  const [serverIndex, setServerIndex] = useState<Record<string, SiteIndexEntry> | null>(null)
  const [loading, setLoading] = useState(true)

  const ws = useWSStore()

  // Get manifests for site identity (icon, name, seoScore, homepage)
  const manifests = useMemo(() => getAllManifests(), [])
  const manifestMap = useMemo(() => {
    const map = new Map<string, SiteManifest>()
    for (const m of manifests) {
      map.set(m.id, m)
      // Also index by domain for matching
      map.set(m.domain, m)
    }
    return map
  }, [manifests])

  // Fetch DB-driven page data from server
  useEffect(() => {
    if (!ws.connected) return

    let cancelled = false

    ws.request<{}, { sites: Record<string, SiteIndexEntry> }>('sites:getSiteIndex', {})
      .then(response => {
        if (!cancelled) {
          setServerIndex(response.sites)
          setLoading(false)
        }
      })
      .catch(err => {
        console.error('[CornMaze] Failed to fetch site index:', err)
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [ws.connected])

  // Merge manifests with server page data
  const siteEntries = useMemo(() => {
    return manifests.map(manifest => {
      const serverData = serverIndex?.[manifest.id]
      const pages = serverData?.pages || []
      return { manifest, pages }
    })
  }, [manifests, serverIndex])

  // Filter
  const filteredEntries = useMemo(() => {
    if (!filter.trim()) return siteEntries

    const searchTerm = filter.toLowerCase()
    return siteEntries.filter(({ manifest, pages }) => {
      if (manifest.domain.toLowerCase().includes(searchTerm)) return true
      if (manifest.homepage.title.toLowerCase().includes(searchTerm)) return true
      if (pages.some(p => p.title.toLowerCase().includes(searchTerm))) return true
      return false
    })
  }, [siteEntries, filter])

  // Stats
  const stats = useMemo(() => {
    let totalPages = 0
    const contentTypes = new Set<string>()

    for (const { pages } of siteEntries) {
      totalPages += pages.length + 1 // +1 for homepage
      for (const p of pages) contentTypes.add(p.type)
    }
    contentTypes.add('website') // homepages

    return {
      sites: siteEntries.length,
      pages: totalPages,
      categories: contentTypes.size,
    }
  }, [siteEntries])

  const toggleSite = (domain: string) => {
    setExpandedSites(prev => {
      const next = new Set(prev)
      if (next.has(domain)) {
        next.delete(domain)
      } else {
        next.add(domain)
      }
      return next
    })
  }

  const expandAll = () => {
    setExpandedSites(new Set(manifests.map(m => m.domain)))
  }

  const collapseAll = () => {
    setExpandedSites(new Set())
  }

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: THEME.bg,
        overflow: 'auto',
        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
      }}
    >
      {/* Header */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          background: THEME.bg,
          borderBottom: `1px solid ${THEME.border}`,
          padding: '16px 24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
          <h1 style={{ color: THEME.accent, fontSize: '24px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🌽</span>
            <span>corn:maze</span>
          </h1>
          <span style={{ color: THEME.textDim, fontSize: '14px' }}>
            .corn internet index
          </span>
          {loading && (
            <span style={{ color: THEME.accent, fontSize: '12px', opacity: 0.7 }}>
              loading pages...
            </span>
          )}
        </div>

        {/* Stats Bar */}
        <div style={{ display: 'flex', gap: '24px', marginBottom: '16px', fontSize: '13px' }}>
          <span style={{ color: THEME.textMuted }}>
            <span style={{ color: THEME.accent }}>{stats.sites}</span> sites
          </span>
          <span style={{ color: THEME.textMuted }}>
            <span style={{ color: THEME.accent }}>{stats.pages}</span> pages indexed
          </span>
          <span style={{ color: THEME.textMuted }}>
            <span style={{ color: THEME.accent }}>{stats.categories}</span> content types
          </span>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter sites..."
            style={{
              flex: 1,
              maxWidth: '300px',
              padding: '8px 12px',
              borderRadius: '6px',
              border: `1px solid ${THEME.border}`,
              background: THEME.surface,
              color: THEME.text,
              fontSize: '13px',
              outline: 'none',
            }}
          />
          <button
            onClick={expandAll}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: `1px solid ${THEME.border}`,
              background: THEME.surface,
              color: THEME.textMuted,
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: `1px solid ${THEME.border}`,
              background: THEME.surface,
              color: THEME.textMuted,
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Site List */}
      <div style={{ padding: '16px 24px' }}>
        {filteredEntries.length === 0 ? (
          <div style={{ color: THEME.textMuted, padding: '32px', textAlign: 'center' }}>
            No sites match "{filter}"
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filteredEntries.map(({ manifest, pages }) => (
              <SiteEntry
                key={manifest.domain}
                manifest={manifest}
                pages={pages}
                expanded={expandedSites.has(manifest.domain)}
                onToggle={() => toggleSite(manifest.domain)}
                onNavigate={onNavigateToUrl}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          borderTop: `1px solid ${THEME.border}`,
          padding: '16px 24px',
          marginTop: '32px',
          color: THEME.textDim,
          fontSize: '12px',
          textAlign: 'center',
        }}
      >
        corn:maze v1.0 - The .corn internet directory
      </div>
    </div>
  )
}

// ============================================================================
// Site Entry Component
// ============================================================================

interface SiteEntryProps {
  manifest: SiteManifest
  pages: SiteIndexPage[]
  expanded: boolean
  onToggle: () => void
  onNavigate: (url: string) => void
}

function SiteEntry({ manifest, pages, expanded, onToggle, onNavigate }: SiteEntryProps) {
  return (
    <div
      style={{
        border: `1px solid ${THEME.border}`,
        borderRadius: '8px',
        overflow: 'hidden',
        background: THEME.surface,
      }}
    >
      {/* Site Header */}
      <div
        onClick={onToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 16px',
          cursor: 'pointer',
          transition: 'background 0.15s',
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = THEME.surfaceHover}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
      >
        {/* Expand Icon */}
        <span
          style={{
            color: THEME.textDim,
            fontSize: '12px',
            width: '16px',
            textAlign: 'center',
            transition: 'transform 0.15s',
            transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
          }}
        >
          ▶
        </span>

        {/* Site Icon */}
        <span style={{ fontSize: '18px' }}>{manifest.icon || '🌐'}</span>

        {/* Domain */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onNavigate(`www.${manifest.domain}`)
          }}
          style={{
            background: 'none',
            border: 'none',
            color: THEME.link,
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            padding: 0,
            fontFamily: 'inherit',
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = THEME.linkHover}
          onMouseLeave={(e) => e.currentTarget.style.color = THEME.link}
        >
          {manifest.domain}
        </button>

        {/* Site Name */}
        <span style={{ color: THEME.textMuted, fontSize: '13px' }}>
          {manifest.name}
        </span>

        {/* Page Count */}
        <span
          style={{
            marginLeft: 'auto',
            color: THEME.textDim,
            fontSize: '12px',
            background: THEME.bg,
            padding: '2px 8px',
            borderRadius: '4px',
          }}
        >
          {pages.length + 1} pages
        </span>

        {/* SEO Score */}
        {manifest.seoScore && (
          <span
            style={{
              color: THEME.accentDim,
              fontSize: '11px',
              background: `${THEME.accent}15`,
              padding: '2px 6px',
              borderRadius: '4px',
            }}
          >
            SEO: {manifest.seoScore}
          </span>
        )}
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div
          style={{
            borderTop: `1px solid ${THEME.border}`,
            padding: '12px 16px 12px 44px',
            background: THEME.bg,
          }}
        >
          {/* Homepage */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span
                style={{
                  fontSize: '10px',
                  padding: '2px 6px',
                  borderRadius: '3px',
                  background: `${getCategoryColor('website')}20`,
                  color: getCategoryColor('website'),
                  textTransform: 'uppercase',
                }}
              >
                home
              </span>
              <button
                onClick={() => onNavigate(`www.${manifest.domain}`)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: THEME.link,
                  fontSize: '13px',
                  cursor: 'pointer',
                  padding: 0,
                  fontFamily: 'inherit',
                }}
              >
                /
              </button>
            </div>
            <div style={{ color: THEME.text, fontSize: '13px', marginBottom: '2px' }}>
              {manifest.homepage.title}
            </div>
            <div style={{ color: THEME.textDim, fontSize: '12px' }}>
              {manifest.homepage.description.slice(0, 120)}
              {manifest.homepage.description.length > 120 ? '...' : ''}
            </div>
          </div>

          {/* DB-driven pages */}
          {pages.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {pages.map((page, i) => {
                // Extract the path from the full URL (remove www.domain.corn prefix)
                const pathMatch = page.url.match(/www\.[^/]+(\/.*)?$/)
                const displayPath = pathMatch?.[1] || '/'

                return (
                  <div key={i}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                      <span
                        style={{
                          fontSize: '10px',
                          padding: '2px 6px',
                          borderRadius: '3px',
                          background: `${getCategoryColor(page.type)}20`,
                          color: getCategoryColor(page.type),
                          textTransform: 'uppercase',
                        }}
                      >
                        {page.type}
                      </span>
                      <button
                        onClick={() => onNavigate(page.url)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: THEME.link,
                          fontSize: '13px',
                          cursor: 'pointer',
                          padding: 0,
                          fontFamily: 'inherit',
                        }}
                      >
                        {displayPath}
                      </button>
                    </div>
                    <div style={{ color: THEME.text, fontSize: '12px' }}>
                      {page.title}
                    </div>
                    {page.description && (
                      <div style={{ color: THEME.textDim, fontSize: '11px' }}>
                        {page.description.slice(0, 100)}
                        {page.description.length > 100 ? '...' : ''}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {pages.length === 0 && (
            <div style={{ color: THEME.textDim, fontSize: '12px', fontStyle: 'italic' }}>
              Homepage only
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default CornMazeSite
