/**
 * Corn Stack Router
 *
 * URL-based content system for the .corn internet.
 *
 * @example
 * ```typescript
 * import { parseURL, siteRegistry, matchRoute } from './router'
 *
 * // Parse a URL
 * const parsed = parseURL('threadit.corn/r/QuantumCoffee')
 * // { domain: 'threadit.corn', path: '/r/QuantumCoffee', ... }
 *
 * // Get site
 * const site = siteRegistry.getByDomain('threadit.corn')
 *
 * // Match route
 * const match = matchRoute(site.routes, parsed.path)
 * // { params: { subreddit: 'QuantumCoffee' }, ... }
 * ```
 */

// Types
export type {
  ParsedURL,
  RouteDefinition,
  RouteMatch,
  RouteParams,
  CornSite,
  ContentCategory,
  SiteSEO,
  SiteComponentProps,
  NavigationReferrer,
  NavigateOptions,
  HistoryEntry,
  SearchIndexEntry,
  SearchResult,
} from './types.js'

// Router functions
export {
  parseURL,
  buildURL,
  matchPattern,
  matchRoute,
  matchNestedRoute,
  resolveURL,
  createHistoryEntry,
  isCornURL,
  normalizeUserInput,
  getAutocompleteSuggestions,
} from './corn-router.js'

// Site registry
export {
  registerSite,
  registerSites,
  getSiteByDomain,
  getSiteById,
  getAllSites,
  getSiteRegistry,
  hasSite,
  getUrlForSite,
  getSiteIdFromUrl,
  createSimpleSite,
  createRoutedSite,
  siteRegistry,
} from './site-registry.js'

// Legacy sites (call registerLegacySites() at app startup)
export { registerLegacySites } from './legacy-sites.js'

// React hook
export { useCornRouter } from './use-corn-router.js'
export type { BrowserTab, RouterState, AutocompleteSuggestion } from './use-corn-router.js'
