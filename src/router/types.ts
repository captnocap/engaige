/**
 * Corn Stack Router Types
 *
 * Core type definitions for the URL-based content system.
 * Every .corn site uses these types to define routes and metadata.
 */

import type { ComponentType } from 'react'

// ============================================================================
// URL Types
// ============================================================================

/**
 * Parsed URL structure
 */
export interface ParsedURL {
  raw: string                    // Original URL string
  domain: string                 // e.g., 'threadit.corn'
  path: string                   // e.g., '/r/QuantumCoffee/post/847'
  pathSegments: string[]         // e.g., ['r', 'QuantumCoffee', 'post', '847']
  query: URLSearchParams         // Query parameters
  hash?: string                  // Fragment identifier
}

// ============================================================================
// Route Types
// ============================================================================

/**
 * Route parameter extracted from URL
 * e.g., '/r/:subreddit/post/:postId' -> { subreddit: 'QuantumCoffee', postId: '847' }
 */
export type RouteParams = Record<string, string>

/**
 * Route definition - maps URL patterns to metadata
 */
export interface RouteDefinition {
  // Pattern matching
  pattern: string               // e.g., '/r/:subreddit', '/r/:subreddit/post/:postId'

  // Metadata for this route (for search index)
  metadata?: {
    title?: string | ((params: RouteParams) => string)
    description?: string | ((params: RouteParams) => string)
    keywords?: string[] | ((params: RouteParams) => string[])
    category?: ContentCategory
  }

  // Nested routes (for deep linking)
  children?: RouteDefinition[]
}

/**
 * Result of matching a URL against routes
 */
export interface RouteMatch {
  route: RouteDefinition
  params: RouteParams
  path: string                  // The matched path portion
  remainingPath: string         // Any unmatched path (for nested routes)
}

// ============================================================================
// Content Types
// ============================================================================

/**
 * Content categories for filtering/search
 */
export type ContentCategory =
  | 'website'      // General web page
  | 'social'       // Social media post/profile
  | 'forum'        // Discussion/forum post
  | 'news'         // News article
  | 'video'        // Video content
  | 'blog'         // Blog post
  | 'product'      // Product/shopping
  | 'profile'      // User profile
  | 'wiki'         // Wiki/reference article
  | 'entertainment' // Games, music, etc.

/**
 * SEO configuration for a site
 */
export interface SiteSEO {
  baseScore: number             // 0-100, default ranking factor
  keywords: string[]            // Site-wide keywords
}

// ============================================================================
// Site Definition
// ============================================================================

/**
 * Props passed to site components
 */
export interface SiteComponentProps {
  /** The site ID */
  siteId: string
  /** Current path within the site (e.g., '/r/coffee') */
  path: string | null
  /** Route params extracted from URL (e.g., { subreddit: 'coffee' }) */
  params: RouteParams
  /** Query parameters from URL */
  query: URLSearchParams
  /** Navigate to a different site by ID */
  onNavigate: (siteId: string) => void
  /** Update the current path (triggers URL update) */
  onPathChange: (path: string | null) => void
  /** Navigate to a full URL (can be same site or different) */
  onNavigateToUrl: (url: string) => void
}

/**
 * Complete site definition - single source of truth
 */
export interface CornSite {
  // Identity
  id: string                    // Unique identifier (e.g., 'threadit')
  domain: string                // Full domain (e.g., 'threadit.corn')
  name: string                  // Display name (e.g., 'Threadit')

  // Display
  icon: string                  // Emoji icon
  iconImage?: string            // Optional high-res image path
  description: string           // Site description

  // Component
  component: ComponentType<SiteComponentProps>

  // Routing
  routes: RouteDefinition[]

  // SEO (for search index)
  seo: SiteSEO

  // Optional theme
  theme?: {
    primaryColor?: string
    secondaryColor?: string
    favicon?: string
  }
}

// ============================================================================
// Navigation Types
// ============================================================================

/**
 * How the user got to this page (for analytics/tracking)
 */
export interface NavigationReferrer {
  type: 'direct' | 'search' | 'npc_share' | 'link_click' | 'bookmark' | 'history'
  source?: string               // Search query, NPC ID, referring URL, etc.
}

/**
 * Navigation options
 */
export interface NavigateOptions {
  newTab?: boolean              // Open in new browser tab
  replace?: boolean             // Replace history instead of push
  referrer?: NavigationReferrer // How user got here
}

/**
 * History entry for browser back/forward
 */
export interface HistoryEntry {
  url: string                   // Full URL
  domain: string                // Site domain
  path: string                  // Path within site
  params: RouteParams           // Extracted params
  title: string                 // Page title
  timestamp: number             // When visited
}

// ============================================================================
// Site Manifest Types (for Search Indexing)
// ============================================================================

/**
 * A single indexable page/content within a site.
 * This is what Goober sees when it "crawls" a site.
 */
export interface IndexablePage {
  /** Path within the site (e.g., '/wiki/Quantum_Coffee') */
  path: string
  /** Page title - what shows in search results */
  title: string
  /** Full body text for search indexing (can be long) */
  body?: string
  /** Short description/snippet for search results */
  description: string
  /** Content type for filtering */
  type: ContentCategory
  /** Author name if applicable */
  author?: string
  /** Tags/keywords for better search matching */
  tags?: string[]
  /** Additional metadata (price, rating, date, etc.) */
  metadata?: Record<string, unknown>
  /** When this content was "created" (for freshness ranking) */
  createdAt?: number
}

/**
 * Site manifest - declares all searchable content for a site.
 * Like a sitemap.xml but for the .corn internet.
 *
 * This is the SINGLE SOURCE OF TRUTH for site metadata.
 * All other systems (site-registry, app-registry) derive from this.
 */
export interface SiteManifest {
  /** Unique identifier (e.g., 'threadit') - derived from domain if not provided */
  id: string
  /** Site domain (e.g., 'threadit.corn') */
  domain: string
  /** Display name (e.g., 'Threadit') */
  name: string
  /** Emoji icon */
  icon: string
  /** Optional high-res image path */
  iconImage?: string
  /** Homepage info - what shows when you search for the site itself */
  homepage: {
    title: string
    description: string
    keywords?: string[]
  }
  /** All indexable pages within the site */
  pages: IndexablePage[]
  /** Base SEO score for this site (0-100) - affects ranking */
  seoScore?: number
}

/**
 * Transform a site manifest into search index entries.
 * Used by both frontend (client-side fallback) and backend (FTS5 index).
 */
export function manifestToSearchEntries(manifest: SiteManifest): SearchIndexEntry[] {
  const baseScore = manifest.seoScore ?? 50
  const entries: SearchIndexEntry[] = []

  // Add homepage as first entry
  entries.push({
    url: `www.${manifest.domain}`,
    domain: manifest.domain,
    title: manifest.homepage.title,
    snippet: manifest.homepage.description,
    keywords: manifest.homepage.keywords ?? [],
    category: 'website',
    seoScore: baseScore + 10, // Homepages get slight boost
    indexedAt: Date.now(),
  })

  // Add all pages
  for (const page of manifest.pages) {
    entries.push({
      url: `www.${manifest.domain}${page.path}`,
      domain: manifest.domain,
      title: page.title,
      snippet: page.description,
      keywords: page.tags ?? [],
      category: page.type,
      seoScore: baseScore,
      indexedAt: page.createdAt ?? Date.now(),
    })
  }

  return entries
}

// ============================================================================
// Search Index Types
// ============================================================================

/**
 * Entry in the search index
 */
export interface SearchIndexEntry {
  url: string                   // Full URL (primary key)
  domain: string                // Site domain
  title: string                 // Page title
  snippet: string               // Description/excerpt
  keywords: string[]            // Searchable keywords
  category: ContentCategory     // Content type
  seoScore: number              // Ranking factor
  indexedAt: number             // Timestamp
  /** Optional: full body text for FTS (not stored in results) */
  body?: string
  /** Optional: author name */
  author?: string
}

/**
 * Search result
 */
export interface SearchResult extends SearchIndexEntry {
  score: number                 // Calculated relevance score
  highlighted?: {
    title?: string              // Title with <mark> tags
    snippet?: string            // Snippet with <mark> tags
  }
}
