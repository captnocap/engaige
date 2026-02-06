/**
 * WikiKnow Site
 *
 * Wikipedia clone for the engAIge browser.
 * Features encyclopedic content about absurd topics played completely straight.
 *
 * All wiki content is fetched exclusively from the database.
 */

import { useState, useEffect, useRef, useMemo } from 'react'
import type { SiteProps } from '../BrowserSiteContainer.js'
import { FILLER_SITES } from '../../../config/filler-sites.js'
import { SidebarAdWidget } from '../ads/index.js'
import { useSiteContent, type SiteContentItem } from '../../../hooks/useSiteContent.js'

const site = FILLER_SITES.wiki

// ============================================================================
// Types
// ============================================================================

interface WikiSection {
  id: string
  heading: string
  content: string
  subsections?: WikiSection[]
}

interface WikiInfobox {
  image?: string
  imageCaption?: string
  facts: Record<string, string>
}

interface WikiArticle {
  id: string
  title: string
  category: string
  summary: string
  sections: WikiSection[]
  infobox?: WikiInfobox
  relatedArticles: string[]
  references: string[]
  lastEdited: string
  views: number
}

// ============================================================================
// DB Content Adapter
// ============================================================================

/** Adapt DB content to local WikiArticle interface */
function dbToWikiArticle(item: SiteContentItem): WikiArticle {
  const m = item.metadata || {}
  return {
    id: item.slug,
    title: item.title,
    category: item.category || m.category || 'General',
    summary: item.summary || item.body?.slice(0, 300) || '',
    sections: m.sections || [{ id: 'intro', heading: 'Overview', content: item.body || item.summary || '' }],
    infobox: m.infobox,
    relatedArticles: m.relatedArticles || m.related_articles || [],
    references: m.references || [],
    lastEdited: m.lastEdited || (item.updatedAt ? new Date(item.updatedAt * 1000).toLocaleDateString() : ''),
    views: item.viewCount || m.views || 0,
  }
}

// ============================================================================
// URL Routing
// ============================================================================

/**
 * Converts an article title to a URL-friendly slug.
 * Example: "Quantum Coffee Brewing" -> "Quantum_Coffee_Brewing"
 */
function titleToSlug(title: string): string {
  return title.replace(/\s+/g, '_').replace(/[()]/g, '')
}

/**
 * Converts a URL slug back to a searchable title.
 * Example: "Quantum_Coffee_Brewing" -> "Quantum Coffee Brewing"
 */
function slugToTitle(slug: string): string {
  return slug.replace(/_/g, ' ')
}

/**
 * Finds an article by its URL slug (matches against article id or title slug).
 */
function findArticleBySlug(slug: string, articleList: WikiArticle[]): WikiArticle | undefined {
  // First try exact id match
  const byId = articleList.find(a => a.id === slug.toLowerCase())
  if (byId) return byId

  // Then try title match (convert slug to title and search)
  const title = slugToTitle(slug)
  return articleList.find(a =>
    a.title.toLowerCase() === title.toLowerCase()
  )
}

// ============================================================================
// Main Component
// ============================================================================

export function WikiKnowSite({ siteId, path, onNavigate, onPathChange }: SiteProps) {
  // Fetch from DB (database is the sole source of truth)
  const { content: dbContent } = useSiteContent('wikiknow')

  const articles = useMemo(() => dbContent.map(dbToWikiArticle), [dbContent])

  // State for current view - null means homepage, otherwise shows article
  const [selectedArticle, setSelectedArticle] = useState<WikiArticle | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Track if we're updating from path (to avoid triggering onPathChange loops)
  const isUpdatingFromPath = useRef(false)

  // Parse path and update state when path changes (from browser back/forward or direct URL)
  useEffect(() => {
    isUpdatingFromPath.current = true

    if (!path || path === '/') {
      // Homepage
      setSelectedArticle(null)
      setSelectedCategory(null)
    } else if (path.startsWith('/wiki/')) {
      // Article path: /wiki/Article_Slug
      const slug = path.slice(6) // Remove '/wiki/'
      const article = findArticleBySlug(slug, articles)
      if (article) {
        setSelectedArticle(article)
        setSelectedCategory(null)
      } else {
        // Article not found - show homepage
        setSelectedArticle(null)
        setSelectedCategory(null)
      }
    } else if (path.startsWith('/category/')) {
      // Category path: /category/CategoryName
      const category = slugToTitle(path.slice(10)) // Remove '/category/'
      setSelectedArticle(null)
      setSelectedCategory(category)
    }

    // Reset flag after state updates
    setTimeout(() => {
      isUpdatingFromPath.current = false
    }, 0)
  }, [path, articles])

  // Navigation handlers that update both state and path
  const handleSelectArticle = (article: WikiArticle) => {
    setSelectedArticle(article)
    setSelectedCategory(null)
    onPathChange('/wiki/' + titleToSlug(article.title))
  }

  const handleSelectCategory = (category: string) => {
    setSelectedArticle(null)
    setSelectedCategory(category)
    onPathChange('/category/' + titleToSlug(category))
  }

  const handleGoHome = () => {
    setSelectedArticle(null)
    setSelectedCategory(null)
    onPathChange(null)
  }

  const handleRandomArticle = () => {
    const randomIndex = Math.floor(Math.random() * articles.length)
    const article = articles[randomIndex]
    handleSelectArticle(article)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Find article by title (case-insensitive partial match)
    const found = articles.find(a =>
      a.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    if (found) {
      handleSelectArticle(found)
      setSearchQuery('')
    }
  }

  const handleRelatedClick = (title: string) => {
    const found = articles.find(a =>
      a.title.toLowerCase().includes(title.toLowerCase())
    )
    if (found) {
      handleSelectArticle(found)
    }
  }

  // Get articles filtered by category (if category is selected)
  const filteredArticles = selectedCategory
    ? articles.filter(a => a.category === selectedCategory)
    : articles

  return (
    <div className="min-h-full" style={{ background: site.theme.background }}>
      {/* Header */}
      <header
        className="sticky top-0 z-10"
        style={{ background: site.theme.surface, borderBottom: `1px solid ${site.theme.border}` }}
      >
        <div className="max-w-6xl mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            {/* Logo - Clickable to go home */}
            <button
              onClick={handleGoHome}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <span className="text-3xl">{site.icon}</span>
              <div className="text-left">
                <h1
                  className="text-xl font-serif font-bold"
                  style={{ color: site.theme.text }}
                >
                  {site.name}
                </h1>
                <p className="text-xs" style={{ color: site.theme.textMuted }}>
                  {site.tagline}
                </p>
              </div>
            </button>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 max-w-md mx-8">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search WikiKnow"
                  className="w-full px-4 py-1.5 pr-10 text-sm rounded border focus:outline-none focus:ring-2"
                  style={{
                    borderColor: site.theme.border,
                    background: site.theme.surface,
                    color: site.theme.text,
                  }}
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1"
                  style={{ color: site.theme.textMuted }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </form>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <button
                onClick={handleRandomArticle}
                className="text-sm hover:underline"
                style={{ color: site.theme.primary }}
              >
                Random article
              </button>
              <span className="text-sm" style={{ color: site.theme.textMuted }}>
                {articles.length.toLocaleString()} articles
              </span>
            </div>
          </div>
        </div>

        {/* Navigation tabs */}
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-1 -mb-px">
            {['Article', 'Talk', 'View history'].map((tab, i) => (
              <button
                key={tab}
                className="px-4 py-2 text-sm border-b-2 transition-colors"
                style={{
                  color: i === 0 ? site.theme.text : site.theme.textMuted,
                  borderColor: i === 0 ? site.theme.primary : 'transparent',
                  background: i === 0 ? site.theme.surface : 'transparent',
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content Area - Conditionally renders homepage, category, or article view */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* ================================================================ */}
            {/* HOMEPAGE VIEW - When no article or category is selected */}
            {/* ================================================================ */}
            {!selectedArticle && !selectedCategory && (
              <div>
                {/* Welcome Banner */}
                <div
                  className="p-6 mb-6 rounded text-center"
                  style={{ background: site.theme.surface, border: `1px solid ${site.theme.border}` }}
                >
                  <h1
                    className="text-3xl font-serif font-bold mb-2"
                    style={{ color: site.theme.text }}
                  >
                    Welcome to {site.name}
                  </h1>
                  <p className="text-sm mb-4" style={{ color: site.theme.textMuted }}>
                    {site.tagline}
                  </p>
                  <p className="text-sm" style={{ color: site.theme.text }}>
                    <strong>{articles.length.toLocaleString()}</strong> articles in English
                  </p>
                </div>

                {/* Featured Article */}
                <div className="mb-6">
                  <h2
                    className="text-lg font-serif font-bold border-b pb-2 mb-4"
                    style={{ color: site.theme.text, borderColor: site.theme.border }}
                  >
                    Featured Article
                  </h2>
                  <div
                    className="p-4 rounded"
                    style={{ background: site.theme.surface, border: `1px solid ${site.theme.border}` }}
                  >
                    <button
                      onClick={() => handleSelectArticle(articles[0])}
                      className="text-lg font-bold hover:underline text-left"
                      style={{ color: site.theme.primary }}
                    >
                      {articles[0].title}
                    </button>
                    <p className="text-sm mt-2" style={{ color: site.theme.text }}>
                      {articles[0].summary.slice(0, 300)}...
                    </p>
                    <button
                      onClick={() => handleSelectArticle(articles[0])}
                      className="text-sm mt-2 hover:underline"
                      style={{ color: site.theme.primary }}
                    >
                      Read more...
                    </button>
                  </div>
                </div>

                {/* Browse by Category */}
                <div className="mb-6">
                  <h2
                    className="text-lg font-serif font-bold border-b pb-2 mb-4"
                    style={{ color: site.theme.text, borderColor: site.theme.border }}
                  >
                    Browse by Category
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(new Set(articles.map(a => a.category))).map(category => (
                      <button
                        key={category}
                        onClick={() => handleSelectCategory(category)}
                        className="px-3 py-1.5 rounded text-sm hover:opacity-80 transition-opacity"
                        style={{
                          background: site.theme.surface,
                          border: `1px solid ${site.theme.border}`,
                          color: site.theme.primary,
                        }}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                {/* All Articles */}
                <div>
                  <h2
                    className="text-lg font-serif font-bold border-b pb-2 mb-4"
                    style={{ color: site.theme.text, borderColor: site.theme.border }}
                  >
                    All Articles
                  </h2>
                  <div className="space-y-3">
                    {articles.map(article => (
                      <div
                        key={article.id}
                        className="p-3 rounded"
                        style={{ background: site.theme.surface, border: `1px solid ${site.theme.border}` }}
                      >
                        <button
                          onClick={() => handleSelectArticle(article)}
                          className="font-bold hover:underline text-left"
                          style={{ color: site.theme.primary }}
                        >
                          {article.title}
                        </button>
                        <div className="flex items-center gap-3 text-xs mt-1" style={{ color: site.theme.textMuted }}>
                          <button
                            onClick={() => handleSelectCategory(article.category)}
                            className="hover:underline"
                            style={{ color: site.theme.primary }}
                          >
                            {article.category}
                          </button>
                          <span>{article.views.toLocaleString()} views</span>
                          <span>Last edited {article.lastEdited}</span>
                        </div>
                        <p className="text-sm mt-1" style={{ color: site.theme.text }}>
                          {article.summary.slice(0, 150)}...
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ================================================================ */}
            {/* CATEGORY VIEW - When a category is selected */}
            {/* ================================================================ */}
            {selectedCategory && !selectedArticle && (
              <div>
                {/* Category Header */}
                <h1
                  className="text-3xl font-serif border-b pb-2 mb-4"
                  style={{ color: site.theme.text, borderColor: site.theme.border }}
                >
                  Category: {selectedCategory}
                </h1>
                <p className="text-sm mb-6" style={{ color: site.theme.textMuted }}>
                  {filteredArticles.length} article{filteredArticles.length !== 1 ? 's' : ''} in this category
                </p>

                {/* Articles in Category */}
                <div className="space-y-3">
                  {filteredArticles.map(article => (
                    <div
                      key={article.id}
                      className="p-3 rounded"
                      style={{ background: site.theme.surface, border: `1px solid ${site.theme.border}` }}
                    >
                      <button
                        onClick={() => handleSelectArticle(article)}
                        className="font-bold hover:underline text-left"
                        style={{ color: site.theme.primary }}
                      >
                        {article.title}
                      </button>
                      <div className="flex items-center gap-3 text-xs mt-1" style={{ color: site.theme.textMuted }}>
                        <span>{article.views.toLocaleString()} views</span>
                        <span>Last edited {article.lastEdited}</span>
                      </div>
                      <p className="text-sm mt-1" style={{ color: site.theme.text }}>
                        {article.summary.slice(0, 200)}...
                      </p>
                    </div>
                  ))}
                </div>

                {/* Back to homepage link */}
                <div className="mt-6">
                  <button
                    onClick={handleGoHome}
                    className="text-sm hover:underline"
                    style={{ color: site.theme.primary }}
                  >
                    Back to Main Page
                  </button>
                </div>
              </div>
            )}

            {/* ================================================================ */}
            {/* ARTICLE VIEW - When an article is selected */}
            {/* ================================================================ */}
            {selectedArticle && (
              <article>
                {/* Title */}
                <h1
                  className="text-3xl font-serif border-b pb-2 mb-4"
                  style={{ color: site.theme.text, borderColor: site.theme.border }}
                >
                  {selectedArticle.title}
                </h1>

                {/* Article info bar */}
                <div
                  className="flex items-center gap-4 text-xs mb-4 pb-2 border-b"
                  style={{ color: site.theme.textMuted, borderColor: site.theme.border }}
                >
                  <span>From {site.name}, the free encyclopedia</span>
                  <span>|</span>
                  <span>{selectedArticle.views.toLocaleString()} views</span>
                  <span>|</span>
                  <span>Last edited {selectedArticle.lastEdited}</span>
                </div>

                {/* Summary */}
                <p className="text-sm leading-relaxed mb-6" style={{ color: site.theme.text }}>
                  <strong>{selectedArticle.title}</strong> {selectedArticle.summary.replace(selectedArticle.title, '')}
                </p>

                {/* Table of Contents */}
                <div
                  className="p-4 mb-6 rounded"
                  style={{ background: site.theme.background, border: `1px solid ${site.theme.border}` }}
                >
                  <h2 className="font-bold text-sm mb-2" style={{ color: site.theme.text }}>
                    Contents
                  </h2>
                  <ol className="list-decimal list-inside text-sm space-y-1">
                    {selectedArticle.sections.map((section, i) => (
                      <li key={section.id}>
                        <a
                          href={`#${section.id}`}
                          className="hover:underline"
                          style={{ color: site.theme.primary }}
                        >
                          {section.heading}
                        </a>
                        {section.subsections && (
                          <ol className="list-decimal list-inside ml-6 mt-1 space-y-1">
                            {section.subsections.map((sub, j) => (
                              <li key={sub.id} className="text-xs">
                                <a
                                  href={`#${sub.id}`}
                                  className="hover:underline"
                                  style={{ color: site.theme.primary }}
                                >
                                  {sub.heading}
                                </a>
                              </li>
                            ))}
                          </ol>
                        )}
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Sections */}
                {selectedArticle.sections.map((section, i) => (
                  <section key={section.id} id={section.id} className="mb-6">
                    <h2
                      className="text-xl font-serif font-bold border-b pb-1 mb-3"
                      style={{ color: site.theme.text, borderColor: site.theme.border }}
                    >
                      {section.heading}
                    </h2>
                    <div
                      className="text-sm leading-relaxed whitespace-pre-wrap"
                      style={{ color: site.theme.text }}
                    >
                      {section.content}
                    </div>

                    {/* Subsections */}
                    {section.subsections?.map((sub) => (
                      <div key={sub.id} id={sub.id} className="mt-4 ml-4">
                        <h3
                          className="text-lg font-serif font-bold mb-2"
                          style={{ color: site.theme.text }}
                        >
                          {sub.heading}
                        </h3>
                        <div
                          className="text-sm leading-relaxed whitespace-pre-wrap"
                          style={{ color: site.theme.text }}
                        >
                          {sub.content}
                        </div>
                      </div>
                    ))}
                  </section>
                ))}

                {/* References */}
                <section className="mt-8">
                  <h2
                    className="text-xl font-serif font-bold border-b pb-1 mb-3"
                    style={{ color: site.theme.text, borderColor: site.theme.border }}
                  >
                    References
                  </h2>
                  <ol className="list-decimal list-inside text-xs space-y-2" style={{ color: site.theme.textMuted }}>
                    {selectedArticle.references.map((ref, i) => (
                      <li key={i}>{ref}</li>
                    ))}
                  </ol>
                </section>

                {/* Categories */}
                <div
                  className="mt-8 p-3 text-xs"
                  style={{ background: site.theme.background, border: `1px solid ${site.theme.border}` }}
                >
                  <span style={{ color: site.theme.textMuted }}>Categories: </span>
                  <button
                    onClick={() => handleSelectCategory(selectedArticle.category)}
                    className="hover:underline"
                    style={{ color: site.theme.primary }}
                  >
                    {selectedArticle.category}
                  </button>
                </div>
              </article>
            )}
          </div>

          {/* Sidebar */}
          <aside className="w-72 shrink-0">
            {/* Infobox - Only shown when viewing an article */}
            {selectedArticle?.infobox && (
              <div
                className="mb-6 text-sm"
                style={{
                  background: site.theme.background,
                  border: `1px solid ${site.theme.border}`,
                }}
              >
                <div
                  className="px-3 py-2 font-bold text-center"
                  style={{ background: site.theme.border, color: site.theme.text }}
                >
                  {selectedArticle.title}
                </div>
                {selectedArticle.infobox.image && (
                  <div className="p-4 text-center">
                    <span className="text-6xl">{selectedArticle.infobox.image}</span>
                    {selectedArticle.infobox.imageCaption && (
                      <p className="text-xs mt-2" style={{ color: site.theme.textMuted }}>
                        {selectedArticle.infobox.imageCaption}
                      </p>
                    )}
                  </div>
                )}
                <table className="w-full text-xs">
                  <tbody>
                    {Object.entries(selectedArticle.infobox.facts).map(([key, value]) => (
                      <tr key={key} style={{ borderTop: `1px solid ${site.theme.border}` }}>
                        <th
                          className="px-3 py-1.5 text-left font-semibold"
                          style={{ background: site.theme.background, color: site.theme.textMuted }}
                        >
                          {key}
                        </th>
                        <td className="px-3 py-1.5" style={{ color: site.theme.text }}>
                          {value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Related Articles - Only shown when viewing an article */}
            {selectedArticle && (
              <div
                className="p-4"
                style={{
                  background: site.theme.surface,
                  border: `1px solid ${site.theme.border}`,
                }}
              >
                <h3 className="font-bold text-sm mb-3" style={{ color: site.theme.text }}>
                  See also
                </h3>
                <ul className="text-sm space-y-1">
                  {selectedArticle.relatedArticles.map((title) => (
                    <li key={title}>
                      <button
                        onClick={() => handleRelatedClick(title)}
                        className="hover:underline text-left"
                        style={{ color: site.theme.primary }}
                      >
                        {title}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Other articles / All articles */}
            <div
              className={selectedArticle ? "mt-6 p-4" : "p-4"}
              style={{
                background: site.theme.surface,
                border: `1px solid ${site.theme.border}`,
              }}
            >
              <h3 className="font-bold text-sm mb-3" style={{ color: site.theme.text }}>
                {selectedArticle ? 'Other articles' : 'Popular articles'}
              </h3>
              <ul className="text-sm space-y-2">
                {articles
                  .filter(a => !selectedArticle || a.id !== selectedArticle.id)
                  .slice(0, 5)
                  .map((article) => (
                    <li key={article.id}>
                      <button
                        onClick={() => handleSelectArticle(article)}
                        className="hover:underline text-left"
                        style={{ color: site.theme.primary }}
                      >
                        {article.title}
                      </button>
                      <span className="text-xs ml-2" style={{ color: site.theme.textMuted }}>
                        ({article.category})
                      </span>
                    </li>
                  ))}
              </ul>
            </div>

            {/* Sponsored Links */}
            <div className="mt-6">
              <SidebarAdWidget
                siteId="wikiknow"
                onNavigate={onNavigate}
                title="Sponsored Links"
                count={2}
              />
            </div>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer
        className="mt-8 py-4 text-center text-xs"
        style={{ background: site.theme.surface, borderTop: `1px solid ${site.theme.border}`, color: site.theme.textMuted }}
      >
        <p>Content is available under the Creative Commons Attribution-ShareAlike License.</p>
        <p className="mt-1">
          {site.name} is a project of the Totally Real Encyclopedia Foundation.
        </p>
      </footer>
    </div>
  )
}

export default WikiKnowSite
