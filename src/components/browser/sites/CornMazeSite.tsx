/**
 * Corn Maze Site
 *
 * A raw index of all .corn sites and their content paths.
 * Like viewing the entire search index in a browsable sitemap format.
 *
 * URL: corn:maze (special protocol, not www.maze.corn)
 */

import { useState, useMemo } from 'react'
import type { SiteComponentProps } from '../../../router/types.js'
import { getAllManifests } from '../../../router/site-registry.js'
import type { SiteManifest } from '../../../router/types.js'

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
}

function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] || THEME.textMuted
}

// ============================================================================
// Main Component
// ============================================================================

export function CornMazeSite({ onNavigateToUrl }: SiteComponentProps) {
  const [expandedSites, setExpandedSites] = useState<Set<string>>(new Set())
  const [filter, setFilter] = useState('')

  // Get all manifests
  const manifests = useMemo(() => getAllManifests(), [])

  // Filter manifests based on search
  const filteredManifests = useMemo(() => {
    if (!filter.trim()) return manifests

    const searchTerm = filter.toLowerCase()
    return manifests.filter(manifest => {
      // Check domain
      if (manifest.domain.toLowerCase().includes(searchTerm)) return true
      // Check homepage title
      if (manifest.homepage.title.toLowerCase().includes(searchTerm)) return true
      // Check any page titles
      if (manifest.pages.some(p => p.title.toLowerCase().includes(searchTerm))) return true
      return false
    })
  }, [manifests, filter])

  // Stats
  const stats = useMemo(() => {
    let totalPages = 0
    const categories = new Set<string>()

    for (const manifest of manifests) {
      totalPages += manifest.pages.length + 1 // +1 for homepage
      categories.add('website')
      manifest.pages.forEach(p => categories.add(p.type))
    }

    return {
      sites: manifests.length,
      pages: totalPages,
      categories: categories.size,
    }
  }, [manifests])

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
        {filteredManifests.length === 0 ? (
          <div style={{ color: THEME.textMuted, padding: '32px', textAlign: 'center' }}>
            No sites match "{filter}"
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filteredManifests.map(manifest => (
              <SiteEntry
                key={manifest.domain}
                manifest={manifest}
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
  expanded: boolean
  onToggle: () => void
  onNavigate: (url: string) => void
}

function SiteEntry({ manifest, expanded, onToggle, onNavigate }: SiteEntryProps) {
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
          {manifest.pages.length + 1} pages
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

          {/* Pages - hierarchical display */}
          {manifest.pages.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* Top-level pages (no parent) */}
              {manifest.pages
                .filter(page => !page.parent)
                .map((page, i) => {
                  // Find child pages for this parent
                  const children = manifest.pages.filter(p => p.parent === page.path)

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
                          onClick={() => onNavigate(`www.${manifest.domain}${page.path}`)}
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
                          {page.path}
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

                      {/* Nested child pages */}
                      {children.length > 0 && (
                        <div style={{
                          marginTop: '8px',
                          marginLeft: '16px',
                          paddingLeft: '12px',
                          borderLeft: `2px solid ${THEME.border}`,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px',
                        }}>
                          {children.map((child, j) => (
                            <div key={j}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                                <span
                                  style={{
                                    fontSize: '9px',
                                    padding: '1px 4px',
                                    borderRadius: '2px',
                                    background: `${THEME.textDim}20`,
                                    color: THEME.textDim,
                                    textTransform: 'uppercase',
                                  }}
                                >
                                  thread
                                </span>
                                <button
                                  onClick={() => onNavigate(`www.${manifest.domain}${child.path}`)}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    color: THEME.link,
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                    padding: 0,
                                    fontFamily: 'inherit',
                                  }}
                                >
                                  {child.path}
                                </button>
                              </div>
                              <div style={{ color: THEME.textMuted, fontSize: '11px' }}>
                                {child.title}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}

              {/* Pages without a parent that aren't parents themselves (orphan pages) */}
              {manifest.pages
                .filter(page => page.parent && !manifest.pages.some(p => p.path === page.parent))
                .map((page, i) => (
                  <div key={`orphan-${i}`} style={{ marginLeft: '16px', opacity: 0.7 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                      <span
                        style={{
                          fontSize: '9px',
                          padding: '1px 4px',
                          borderRadius: '2px',
                          background: `${THEME.textDim}20`,
                          color: THEME.textDim,
                          textTransform: 'uppercase',
                        }}
                      >
                        {page.type}
                      </span>
                      <button
                        onClick={() => onNavigate(`www.${manifest.domain}${page.path}`)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: THEME.link,
                          fontSize: '12px',
                          cursor: 'pointer',
                          padding: 0,
                          fontFamily: 'inherit',
                        }}
                      >
                        {page.path}
                      </button>
                    </div>
                    <div style={{ color: THEME.textMuted, fontSize: '11px' }}>
                      {page.title}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default CornMazeSite
