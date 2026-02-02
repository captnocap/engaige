/**
 * Corn Router
 *
 * URL parsing and route matching for the .corn internet.
 * Handles parsing URLs, matching routes, and extracting parameters.
 */

import type {
  ParsedURL,
  RouteDefinition,
  RouteMatch,
  RouteParams,
  CornSite,
  HistoryEntry,
} from './types.js'

// ============================================================================
// URL Parsing
// ============================================================================

/**
 * Parse a .corn URL into its components
 *
 * Accepts formats:
 * - 'threadit.corn/r/coffee'
 * - 'www.threadit.corn/r/coffee'
 * - 'browser://threadit.corn/r/coffee'
 *
 * @param url - The URL string to parse
 * @returns Parsed URL object
 */
export function parseURL(url: string): ParsedURL {
  let normalized = url.trim()

  // Strip browser:// protocol if present
  if (normalized.startsWith('browser://')) {
    normalized = normalized.slice('browser://'.length)
  }

  // Strip www. prefix if present
  if (normalized.startsWith('www.')) {
    normalized = normalized.slice(4)
  }

  // Split into domain and path
  const firstSlash = normalized.indexOf('/')
  let domain: string
  let pathWithQuery: string

  if (firstSlash === -1) {
    domain = normalized
    pathWithQuery = '/'
  } else {
    domain = normalized.slice(0, firstSlash)
    pathWithQuery = normalized.slice(firstSlash)
  }

  // Ensure domain ends with .corn
  if (!domain.endsWith('.corn')) {
    domain = domain + '.corn'
  }

  // Parse path, query, and hash
  let path = pathWithQuery
  let queryString = ''
  let hash: string | undefined

  // Extract hash
  const hashIndex = path.indexOf('#')
  if (hashIndex !== -1) {
    hash = path.slice(hashIndex + 1)
    path = path.slice(0, hashIndex)
  }

  // Extract query
  const queryIndex = path.indexOf('?')
  if (queryIndex !== -1) {
    queryString = path.slice(queryIndex + 1)
    path = path.slice(0, queryIndex)
  }

  // Normalize path
  if (!path.startsWith('/')) {
    path = '/' + path
  }

  // Remove trailing slash (except for root)
  if (path.length > 1 && path.endsWith('/')) {
    path = path.slice(0, -1)
  }

  // Split path into segments
  const pathSegments = path === '/'
    ? []
    : path.slice(1).split('/').filter(Boolean)

  return {
    raw: url,
    domain: domain.toLowerCase(),
    path,
    pathSegments,
    query: new URLSearchParams(queryString),
    hash,
  }
}

/**
 * Build a URL string from components
 */
export function buildURL(
  domain: string,
  path: string = '/',
  query?: URLSearchParams | Record<string, string>,
  hash?: string
): string {
  let url = `www.${domain}${path}`

  if (query) {
    const params = query instanceof URLSearchParams
      ? query
      : new URLSearchParams(query)
    const queryStr = params.toString()
    if (queryStr) {
      url += '?' + queryStr
    }
  }

  if (hash) {
    url += '#' + hash
  }

  return url
}

// ============================================================================
// Route Matching
// ============================================================================

/**
 * Match a path against a route pattern
 *
 * Patterns use :param syntax for dynamic segments:
 * - '/r/:subreddit' matches '/r/coffee' -> { subreddit: 'coffee' }
 * - '/r/:subreddit/post/:id' matches '/r/coffee/post/123' -> { subreddit: 'coffee', id: '123' }
 * - '*' matches anything (catch-all)
 *
 * @param pattern - Route pattern to match against
 * @param path - Actual path to match
 * @returns Params object if matched, null otherwise
 */
export function matchPattern(pattern: string, path: string): RouteParams | null {
  // Normalize paths
  const normalizedPattern = pattern.startsWith('/') ? pattern : '/' + pattern
  const normalizedPath = path.startsWith('/') ? path : '/' + path

  // Split into segments
  const patternSegments = normalizedPattern === '/'
    ? []
    : normalizedPattern.slice(1).split('/')
  const pathSegments = normalizedPath === '/'
    ? []
    : normalizedPath.slice(1).split('/')

  // Root pattern matches root path
  if (patternSegments.length === 0) {
    return pathSegments.length === 0 ? {} : null
  }

  // Check if last segment is catch-all
  const hasCatchAll = patternSegments[patternSegments.length - 1] === '*'

  // Without catch-all, must have same number of segments
  if (!hasCatchAll && patternSegments.length !== pathSegments.length) {
    return null
  }

  // With catch-all, path must have at least pattern segments - 1
  if (hasCatchAll && pathSegments.length < patternSegments.length - 1) {
    return null
  }

  const params: RouteParams = {}

  for (let i = 0; i < patternSegments.length; i++) {
    const patternSeg = patternSegments[i]
    const pathSeg = pathSegments[i]

    // Catch-all matches rest of path
    if (patternSeg === '*') {
      params['*'] = pathSegments.slice(i).join('/')
      return params
    }

    // Dynamic segment
    if (patternSeg.startsWith(':')) {
      const paramName = patternSeg.slice(1)
      params[paramName] = decodeURIComponent(pathSeg)
      continue
    }

    // Static segment must match exactly (case insensitive)
    if (patternSeg.toLowerCase() !== pathSeg.toLowerCase()) {
      return null
    }
  }

  return params
}

/**
 * Find the best matching route for a path
 *
 * Routes are matched in order, first match wins.
 * More specific routes should be listed first.
 */
export function matchRoute(
  routes: RouteDefinition[],
  path: string
): RouteMatch | null {
  for (const route of routes) {
    const params = matchPattern(route.pattern, path)
    if (params !== null) {
      // Calculate remaining path for nested routes
      const patternSegments = route.pattern === '/'
        ? 0
        : route.pattern.split('/').filter(Boolean).length
      const pathSegments = path === '/'
        ? []
        : path.slice(1).split('/').filter(Boolean)
      const remainingPath = '/' + pathSegments.slice(patternSegments).join('/')

      return {
        route,
        params,
        path,
        remainingPath: remainingPath === '/' ? '' : remainingPath,
      }
    }
  }

  return null
}

/**
 * Match nested routes (for deep linking)
 */
export function matchNestedRoute(
  routes: RouteDefinition[],
  path: string
): { matches: RouteMatch[]; params: RouteParams } {
  const matches: RouteMatch[] = []
  let combinedParams: RouteParams = {}
  let currentPath = path

  const matchRecursive = (routeList: RouteDefinition[]) => {
    const match = matchRoute(routeList, currentPath)
    if (match) {
      matches.push(match)
      combinedParams = { ...combinedParams, ...match.params }

      if (match.remainingPath && match.route.children) {
        currentPath = match.remainingPath
        matchRecursive(match.route.children)
      }
    }
  }

  matchRecursive(routes)

  return { matches, params: combinedParams }
}

// ============================================================================
// Site Resolution
// ============================================================================

/**
 * Resolve a URL to a site and route match
 */
export function resolveURL(
  url: string,
  siteRegistry: Map<string, CornSite>
): { site: CornSite; parsed: ParsedURL; match: RouteMatch | null } | null {
  const parsed = parseURL(url)
  const site = siteRegistry.get(parsed.domain)

  if (!site) {
    return null
  }

  const match = matchRoute(site.routes, parsed.path)

  return { site, parsed, match }
}

// ============================================================================
// History Management
// ============================================================================

/**
 * Create a history entry from navigation
 */
export function createHistoryEntry(
  site: CornSite,
  parsed: ParsedURL,
  match: RouteMatch | null
): HistoryEntry {
  // Get title from route metadata or site name
  let title = site.name
  if (match?.route.metadata?.title) {
    const titleMeta = match.route.metadata.title
    title = typeof titleMeta === 'function'
      ? titleMeta(match.params)
      : titleMeta
  }

  return {
    url: buildURL(parsed.domain, parsed.path, parsed.query, parsed.hash),
    domain: parsed.domain,
    path: parsed.path,
    params: match?.params || {},
    title,
    timestamp: Date.now(),
  }
}

// ============================================================================
// URL Utilities
// ============================================================================

/**
 * Check if a string looks like a .corn URL
 */
export function isCornURL(input: string): boolean {
  const normalized = input.trim().toLowerCase()

  // Direct .corn domain
  if (normalized.includes('.corn')) {
    return true
  }

  // Check if it could be a domain without the TLD
  // (e.g., 'threadit' might mean 'threadit.corn')
  if (/^[a-z0-9-]+$/.test(normalized)) {
    return true
  }

  return false
}

/**
 * Normalize user input to a valid URL
 *
 * Handles:
 * - 'threadit' -> 'www.threadit.corn'
 * - 'threadit.corn' -> 'www.threadit.corn'
 * - 'www.threadit.corn' -> 'www.threadit.corn'
 * - 'threadit.corn/r/coffee' -> 'www.threadit.corn/r/coffee'
 */
export function normalizeUserInput(input: string): string {
  let normalized = input.trim()

  // Strip protocols
  if (normalized.startsWith('browser://')) {
    normalized = normalized.slice('browser://'.length)
  }
  if (normalized.startsWith('http://') || normalized.startsWith('https://')) {
    normalized = normalized.replace(/^https?:\/\//, '')
  }

  // If it doesn't contain a dot, assume it's a site name
  if (!normalized.includes('.')) {
    normalized = normalized + '.corn'
  }

  // Ensure .corn TLD
  if (!normalized.includes('.corn')) {
    // Has a dot but not .corn - probably invalid, but try anyway
    const dotIndex = normalized.indexOf('.')
    normalized = normalized.slice(0, dotIndex) + '.corn' + normalized.slice(normalized.indexOf('/', dotIndex))
  }

  // Add www. prefix if not present
  if (!normalized.startsWith('www.')) {
    normalized = 'www.' + normalized
  }

  return normalized
}

/**
 * Get autocomplete suggestions for partial URL input
 */
export function getAutocompleteSuggestions(
  input: string,
  sites: CornSite[],
  history: HistoryEntry[],
  limit: number = 8
): Array<{ url: string; title: string; source: 'site' | 'history' }> {
  const normalized = input.toLowerCase().trim()
  const suggestions: Array<{ url: string; title: string; source: 'site' | 'history'; score: number }> = []

  // Match against sites
  for (const site of sites) {
    const domainMatch = site.domain.toLowerCase().includes(normalized)
    const nameMatch = site.name.toLowerCase().includes(normalized)

    if (domainMatch || nameMatch) {
      suggestions.push({
        url: `www.${site.domain}`,
        title: site.name,
        source: 'site',
        // Boost exact prefix matches
        score: site.domain.startsWith(normalized) ? 100 : (domainMatch ? 80 : 60),
      })
    }
  }

  // Match against history
  for (const entry of history) {
    const urlMatch = entry.url.toLowerCase().includes(normalized)
    const titleMatch = entry.title.toLowerCase().includes(normalized)

    if (urlMatch || titleMatch) {
      // Check if already suggested from sites
      if (!suggestions.some(s => s.url === entry.url)) {
        suggestions.push({
          url: entry.url,
          title: entry.title,
          source: 'history',
          // History entries are slightly lower priority than sites
          score: urlMatch ? 70 : 50,
        })
      }
    }
  }

  // Sort by score and return top results
  return suggestions
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ url, title, source }) => ({ url, title, source }))
}
