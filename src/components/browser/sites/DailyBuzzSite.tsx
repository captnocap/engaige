/**
 * DailyBuzz Site
 *
 * News site for the engAIge browser.
 * Features satirical headlines and breaking news about the game world.
 *
 * URL Routing:
 * - Main feed: path = null or '/'
 * - Article view: path = '/article/{article-slug}'
 */

import { useState, useEffect, useMemo } from 'react'
import type { SiteProps } from '../BrowserSiteContainer.js'
import { FILLER_SITES } from '../../../config/filler-sites.js'
import { SidebarAdWidget, InlineAd } from '../ads/index.js'
import { useNewsArticles, useNewsArticle, type NewsArticle as DBNewsArticle } from '../../../hooks/useSiteContent.js'

const site = FILLER_SITES.news

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Converts an article headline to a URL-friendly slug.
 * Example: "Local Band Cancels Show" -> "local-band-cancels-show"
 */
function createSlug(headline: string): string {
  return headline
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Collapse multiple hyphens
    .trim()
}

// ============================================================================
// Types
// ============================================================================

interface NewsArticle {
  id: string
  headline: string
  subheadline?: string
  category: string
  author: string
  date: string
  readTime: number
  image?: string
  content: string
  tags: string[]
  relatedArticles: string[]
  /** URL-friendly slug, present on DB-sourced articles */
  slug?: string
}

/**
 * Adapt a DB NewsArticle to the local NewsArticle interface.
 * Computes readTime from word count and formats the date string.
 */
function dbToNewsArticle(a: DBNewsArticle): NewsArticle {
  const wordCount = a.content ? a.content.split(/\s+/).length : 0
  const readTime = Math.max(1, Math.round(wordCount / 250))
  return {
    id: a.id,
    headline: a.headline,
    subheadline: a.subheadline || '',
    category: a.category,
    author: a.author,
    date: a.publishedAt
      ? new Date(a.publishedAt * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      : '',
    readTime,
    image: a.imageEmoji || '📰',
    content: a.content,
    tags: a.tags,
    relatedArticles: [],
    slug: a.slug,
  }
}

const CATEGORIES = ['All', 'Local', 'Tech', 'Entertainment', 'Politics', 'Opinion']

const BREAKING_NEWS = [
  'BREAKING: Quantum cafe reports first case of "over-observed" coffee',
  'UPDATE: City council meme ban delayed indefinitely',
  'JUST IN: The Velvet Algorithms spotted at local meditation retreat',
  'DEVELOPING: Tech startup claims AI asked for day off',
]

// ============================================================================
// Components
// ============================================================================

export function DailyBuzzSite({ siteId, path, onNavigate, onPathChange }: SiteProps) {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [breakingIndex, setBreakingIndex] = useState(0)

  // Fetch articles from DB (database is the sole source of truth)
  const { articles: dbArticles } = useNewsArticles({ limit: 50 })

  const articles = useMemo(() => dbArticles.map(dbToNewsArticle), [dbArticles])

  // Build a slug-to-article lookup from the active articles list
  const articlesBySlug = useMemo(() => {
    const map: Record<string, NewsArticle> = {}
    for (const article of articles) {
      const slug = article.slug || createSlug(article.headline)
      map[slug] = article
    }
    return map
  }, [articles])

  // Extract slug from current path for single-article DB fetch
  const currentSlug = useMemo(() => {
    if (!path || path === '/') return null
    const match = path.match(/^\/article\/(.+)$/)
    return match ? match[1] : null
  }, [path])

  // Fetch single article from DB (used for detail view)
  const { article: dbSingleArticle } = useNewsArticle(currentSlug)

  // Derive the selected article from the path prop
  // Path format: /article/{slug} or null/empty for main feed
  const selectedArticle = useMemo<NewsArticle | null>(() => {
    if (!currentSlug) return null

    // Prefer DB single-article fetch, then fall back to local lookup
    if (dbSingleArticle) return dbToNewsArticle(dbSingleArticle)
    return articlesBySlug[currentSlug] || null
  }, [currentSlug, dbSingleArticle, articlesBySlug])

  /**
   * Navigate to an article by updating the path
   */
  const handleSelectArticle = (article: NewsArticle) => {
    const slug = article.slug || createSlug(article.headline)
    onPathChange(`/article/${slug}`)
  }

  /**
   * Navigate back to the main feed
   */
  const handleBackToFeed = () => {
    onPathChange(null)
  }

  // Rotate breaking news
  useEffect(() => {
    const interval = setInterval(() => {
      setBreakingIndex(i => (i + 1) % BREAKING_NEWS.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const filteredArticles = selectedCategory === 'All'
    ? articles
    : articles.filter(a => a.category === selectedCategory)

  const featuredArticle = articles[0]
  const otherArticles = filteredArticles.filter(a => a.id !== featuredArticle?.id)

  return (
    <div className="min-h-full" style={{ background: site.theme.background }}>
      {/* Breaking News Ticker */}
      <div
        className="py-2 px-4 overflow-hidden"
        style={{ background: site.theme.primary }}
      >
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <span className="text-xs font-bold text-white uppercase tracking-wider shrink-0">
            Breaking
          </span>
          <span className="text-sm text-white truncate">
            {BREAKING_NEWS[breakingIndex]}
          </span>
        </div>
      </div>

      {/* Header */}
      <header
        className="py-4"
        style={{ background: site.theme.surface, borderBottom: `1px solid ${site.theme.border}` }}
      >
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            {/* Logo */}
            <button
              onClick={() => {
                handleBackToFeed()
                setSelectedCategory('All')
              }}
              className="hover:opacity-80"
            >
              <div className="flex items-center gap-3">
                <span className="text-4xl">{site.icon}</span>
                <div>
                  <h1
                    className="text-3xl font-bold tracking-tight"
                    style={{ color: site.theme.secondary }}
                  >
                    {site.name}
                  </h1>
                  <p className="text-xs" style={{ color: site.theme.textMuted }}>
                    {site.tagline}
                  </p>
                </div>
              </div>
            </button>

            {/* Date & Subscribe */}
            <div className="flex items-center gap-6">
              <span className="text-sm" style={{ color: site.theme.textMuted }}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
              <button
                className="px-4 py-2 text-sm font-medium rounded"
                style={{ background: site.theme.primary, color: 'white' }}
              >
                Subscribe
              </button>
            </div>
          </div>

          {/* Category Tabs */}
          <nav className="flex gap-6">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => {
                  setSelectedCategory(category)
                  handleBackToFeed()
                }}
                className="text-sm font-medium pb-2 transition-colors"
                style={{
                  color: selectedCategory === category ? site.theme.primary : site.theme.textMuted,
                  borderBottom: selectedCategory === category ? `2px solid ${site.theme.primary}` : '2px solid transparent',
                }}
              >
                {category}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {selectedArticle ? (
          <ArticleView
            article={selectedArticle}
            onBack={handleBackToFeed}
            onSelectRelated={(title) => {
              const found = articles.find(a => a.headline.includes(title))
              if (found) handleSelectArticle(found)
            }}
          />
        ) : (
          <div className="grid grid-cols-3 gap-6">
            {/* Main Column */}
            <div className="col-span-2 space-y-6">
              {/* Featured Article */}
              {selectedCategory === 'All' && (
                <FeaturedCard
                  article={featuredArticle}
                  onClick={() => handleSelectArticle(featuredArticle)}
                />
              )}

              {/* Article Grid */}
              <div className="grid grid-cols-2 gap-4">
                {otherArticles.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    onClick={() => handleSelectArticle(article)}
                  />
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">
              {/* Trending */}
              <div
                className="rounded-lg overflow-hidden"
                style={{ background: site.theme.surface, border: `1px solid ${site.theme.border}` }}
              >
                <div
                  className="px-4 py-3 font-bold text-sm"
                  style={{ background: site.theme.secondary, color: 'white' }}
                >
                  Trending Now
                </div>
                <div className="p-4">
                  {articles.slice(0, 5).map((article, i) => (
                    <button
                      key={article.id}
                      onClick={() => handleSelectArticle(article)}
                      className="w-full flex gap-3 py-3 text-left border-b last:border-0 hover:bg-gray-50"
                      style={{ borderColor: site.theme.border }}
                    >
                      <span
                        className="text-2xl font-bold"
                        style={{ color: site.theme.primary }}
                      >
                        {i + 1}
                      </span>
                      <div>
                        <p
                          className="text-sm font-medium line-clamp-2"
                          style={{ color: site.theme.text }}
                        >
                          {article.headline}
                        </p>
                        <p className="text-xs mt-1" style={{ color: site.theme.textMuted }}>
                          {article.readTime} min read
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Newsletter */}
              <div
                className="rounded-lg p-4"
                style={{ background: site.theme.surface, border: `1px solid ${site.theme.border}` }}
              >
                <h3 className="font-bold mb-2" style={{ color: site.theme.text }}>
                  Daily Digest
                </h3>
                <p className="text-sm mb-3" style={{ color: site.theme.textMuted }}>
                  Get the top stories delivered to your inbox every morning.
                </p>
                <input
                  type="email"
                  placeholder="your@email.corn"
                  className="w-full px-3 py-2 text-sm rounded mb-2"
                  style={{
                    background: site.theme.background,
                    border: `1px solid ${site.theme.border}`,
                    color: site.theme.text,
                  }}
                />
                <button
                  className="w-full px-4 py-2 text-sm font-medium rounded"
                  style={{ background: site.theme.primary, color: 'white' }}
                >
                  Subscribe
                </button>
              </div>

              {/* Weather Widget */}
              <div
                className="rounded-lg p-4 text-center"
                style={{ background: site.theme.surface, border: `1px solid ${site.theme.border}` }}
              >
                <p className="text-4xl mb-2">🌤️</p>
                <p className="font-bold text-2xl" style={{ color: site.theme.text }}>72°F</p>
                <p className="text-sm" style={{ color: site.theme.textMuted }}>Partly Cloudy</p>
                <p className="text-xs mt-1" style={{ color: site.theme.textMuted }}>
                  High: 78° • Low: 65°
                </p>
              </div>

              {/* Sponsored Ads */}
              <SidebarAdWidget
                siteId="dailybuzz"
                onNavigate={onNavigate}
                title="Sponsored"
                count={3}
              />
            </aside>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer
        className="mt-8 py-6"
        style={{ background: site.theme.secondary }}
      >
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">{site.name}</h2>
              <p className="text-sm text-white/60">{site.tagline}</p>
            </div>
            <div className="flex gap-6 text-sm text-white/60">
              <a href="#" className="hover:text-white">About</a>
              <a href="#" className="hover:text-white">Contact</a>
              <a href="#" className="hover:text-white">Advertise</a>
              <a href="#" className="hover:text-white">Privacy</a>
              <a href="#" className="hover:text-white">Terms</a>
            </div>
          </div>
          <p className="text-xs text-white/40 mt-4">
            © 2026 {site.name}. All rights reserved. Any resemblance to real events is purely coincidental and probably funnier that way.
          </p>
        </div>
      </footer>
    </div>
  )
}

// ============================================================================
// Featured Card
// ============================================================================

interface FeaturedCardProps {
  article: NewsArticle
  onClick: () => void
}

function FeaturedCard({ article, onClick }: FeaturedCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-lg overflow-hidden text-left transition-shadow hover:shadow-lg"
      style={{ background: site.theme.surface, border: `1px solid ${site.theme.border}` }}
    >
      {/* Image */}
      <div
        className="h-64 flex items-center justify-center text-8xl"
        style={{ background: site.theme.background }}
      >
        {article.image || '📰'}
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-center gap-2 mb-2">
          <span
            className="text-xs font-bold uppercase"
            style={{ color: site.theme.primary }}
          >
            {article.category}
          </span>
          <span className="text-xs" style={{ color: site.theme.textMuted }}>
            • {article.readTime} min read
          </span>
        </div>
        <h2
          className="text-2xl font-bold mb-2"
          style={{ color: site.theme.text }}
        >
          {article.headline}
        </h2>
        {article.subheadline && (
          <p className="text-lg mb-3" style={{ color: site.theme.textMuted }}>
            {article.subheadline}
          </p>
        )}
        <div className="flex items-center gap-2 text-sm" style={{ color: site.theme.textMuted }}>
          <span>By {article.author}</span>
          <span>•</span>
          <span>{article.date}</span>
        </div>
      </div>
    </button>
  )
}

// ============================================================================
// Article Card
// ============================================================================

interface ArticleCardProps {
  article: NewsArticle
  onClick: () => void
}

function ArticleCard({ article, onClick }: ArticleCardProps) {
  return (
    <button
      onClick={onClick}
      className="rounded-lg overflow-hidden text-left transition-shadow hover:shadow-md"
      style={{ background: site.theme.surface, border: `1px solid ${site.theme.border}` }}
    >
      {/* Image */}
      <div
        className="h-32 flex items-center justify-center text-4xl"
        style={{ background: site.theme.background }}
      >
        {article.image || '📰'}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-1">
          <span
            className="text-xs font-bold uppercase"
            style={{ color: site.theme.primary }}
          >
            {article.category}
          </span>
        </div>
        <h3
          className="font-bold line-clamp-2 mb-2"
          style={{ color: site.theme.text }}
        >
          {article.headline}
        </h3>
        <div className="flex items-center gap-2 text-xs" style={{ color: site.theme.textMuted }}>
          <span>{article.author}</span>
          <span>•</span>
          <span>{article.readTime} min</span>
        </div>
      </div>
    </button>
  )
}

// ============================================================================
// Article View
// ============================================================================

interface ArticleViewProps {
  article: NewsArticle
  onBack: () => void
  onSelectRelated: (title: string) => void
}

function ArticleView({ article, onBack, onSelectRelated }: ArticleViewProps) {
  return (
    <div className="max-w-3xl mx-auto">
      <button
        onClick={onBack}
        className="text-sm mb-4 hover:underline"
        style={{ color: site.theme.accent }}
      >
        ← Back to {site.name}
      </button>

      <article>
        {/* Header */}
        <header className="mb-6">
          <span
            className="text-xs font-bold uppercase"
            style={{ color: site.theme.primary }}
          >
            {article.category}
          </span>
          <h1
            className="text-4xl font-bold mt-2 mb-3"
            style={{ color: site.theme.text }}
          >
            {article.headline}
          </h1>
          {article.subheadline && (
            <p className="text-xl mb-4" style={{ color: site.theme.textMuted }}>
              {article.subheadline}
            </p>
          )}
          <div className="flex items-center gap-4 py-4 border-y" style={{ borderColor: site.theme.border }}>
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
              style={{ background: site.theme.secondary }}
            >
              {article.author[0]}
            </div>
            <div>
              <p className="font-medium" style={{ color: site.theme.text }}>
                {article.author}
              </p>
              <p className="text-sm" style={{ color: site.theme.textMuted }}>
                {article.date} • {article.readTime} min read
              </p>
            </div>
          </div>
        </header>

        {/* Image */}
        <div
          className="h-64 rounded-lg flex items-center justify-center text-8xl mb-6"
          style={{ background: site.theme.background }}
        >
          {article.image || '📰'}
        </div>

        {/* Content */}
        <div
          className="prose prose-lg max-w-none"
          style={{ color: site.theme.text }}
        >
          {article.content.split('\n\n').map((paragraph, i) => {
            if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
              return (
                <h3
                  key={i}
                  className="text-xl font-bold mt-6 mb-3"
                  style={{ color: site.theme.text }}
                >
                  {paragraph.replace(/\*\*/g, '')}
                </h3>
              )
            }
            return (
              <p
                key={i}
                className="mb-4 leading-relaxed"
                style={{ color: site.theme.text }}
              >
                {paragraph}
              </p>
            )
          })}
        </div>

        {/* Tags */}
        <div className="mt-8 pt-6 border-t" style={{ borderColor: site.theme.border }}>
          <p className="text-sm font-medium mb-2" style={{ color: site.theme.text }}>
            Tags:
          </p>
          <div className="flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 text-sm rounded-full"
                style={{ background: site.theme.background, color: site.theme.textMuted }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Related Articles */}
        <div className="mt-8 pt-6 border-t" style={{ borderColor: site.theme.border }}>
          <h3 className="font-bold mb-4" style={{ color: site.theme.text }}>
            Related Stories
          </h3>
          <ul className="space-y-2">
            {article.relatedArticles.map((title) => (
              <li key={title}>
                <button
                  onClick={() => onSelectRelated(title)}
                  className="text-sm hover:underline"
                  style={{ color: site.theme.accent }}
                >
                  {title}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </article>
    </div>
  )
}

export default DailyBuzzSite
