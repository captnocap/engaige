/**
 * Corn Site Registry
 *
 * Single source of truth for all .corn sites.
 * Replaces the triple duplication of:
 * - APP_REGISTRY (app-registry.ts)
 * - SITE_URLS (Browser.tsx)
 * - SITE_COMPONENTS (BrowserSiteContainer.tsx)
 *
 * New sites should be registered here. Legacy sites are auto-migrated
 * from the old system until fully transitioned.
 */

import type { CornSite, RouteDefinition, SiteComponentProps, SiteManifest, SearchIndexEntry } from './types.js'
import { manifestToSearchEntries } from './types.js'
import type { ComponentType } from 'react'

// ============================================================================
// Registry State
// ============================================================================

/** Map of domain -> site definition */
const sitesByDomain = new Map<string, CornSite>()

/** Map of id -> site definition (for backwards compatibility) */
const sitesById = new Map<string, CornSite>()

/** All registered sites in registration order */
const allSites: CornSite[] = []

/** Map of domain -> site manifest (for search indexing) */
const manifestsByDomain = new Map<string, SiteManifest>()

// ============================================================================
// Registration API
// ============================================================================

/**
 * Register a new .corn site
 *
 * @param site - Complete site definition
 */
export function registerSite(site: CornSite): void {
  // Validate domain
  if (!site.domain.endsWith('.corn')) {
    throw new Error(`Site domain must end with .corn: ${site.domain}`)
  }

  // Normalize domain
  const domain = site.domain.toLowerCase()
  const normalizedSite = { ...site, domain }

  // Check for duplicates
  if (sitesByDomain.has(domain)) {
    console.warn(`Site already registered for domain: ${domain}. Overwriting.`)
  }

  // Register
  sitesByDomain.set(domain, normalizedSite)
  sitesById.set(site.id, normalizedSite)

  // Add to ordered list (remove old if exists)
  const existingIndex = allSites.findIndex(s => s.id === site.id)
  if (existingIndex !== -1) {
    allSites.splice(existingIndex, 1)
  }
  allSites.push(normalizedSite)
}

/**
 * Register multiple sites at once
 */
export function registerSites(sites: CornSite[]): void {
  sites.forEach(registerSite)
}

// ============================================================================
// Query API
// ============================================================================

/**
 * Get a site by its domain
 */
export function getSiteByDomain(domain: string): CornSite | undefined {
  // Normalize: remove www. and lowercase
  let normalized = domain.toLowerCase()
  if (normalized.startsWith('www.')) {
    normalized = normalized.slice(4)
  }
  if (!normalized.endsWith('.corn')) {
    normalized = normalized + '.corn'
  }

  return sitesByDomain.get(normalized)
}

/**
 * Get a site by its ID (for backwards compatibility)
 */
export function getSiteById(id: string): CornSite | undefined {
  return sitesById.get(id)
}

/**
 * Get all registered sites
 */
export function getAllSites(): CornSite[] {
  return [...allSites]
}

/**
 * Get the site registry map (for router)
 */
export function getSiteRegistry(): Map<string, CornSite> {
  return sitesByDomain
}

/**
 * Check if a domain is registered
 */
export function hasSite(domain: string): boolean {
  return getSiteByDomain(domain) !== undefined
}

// ============================================================================
// Legacy Compatibility
// ============================================================================

/**
 * Get URL for a site by ID (legacy compatibility)
 */
export function getUrlForSite(siteId: string): string {
  const site = sitesById.get(siteId)
  if (site) {
    return `www.${site.domain}`
  }
  // Fallback: assume siteId is the subdomain
  return `www.${siteId}.corn`
}

/**
 * Get site ID from URL (legacy compatibility)
 */
export function getSiteIdFromUrl(url: string): string | undefined {
  // Parse domain from URL
  let domain = url.toLowerCase()
    .replace(/^(browser:\/\/|https?:\/\/)?/, '')
    .replace(/^www\./, '')

  // Extract just the domain part
  const slashIndex = domain.indexOf('/')
  if (slashIndex !== -1) {
    domain = domain.slice(0, slashIndex)
  }

  // Add .corn if missing
  if (!domain.endsWith('.corn')) {
    domain = domain + '.corn'
  }

  const site = sitesByDomain.get(domain)
  return site?.id
}

// ============================================================================
// Helper: Create Simple Site
// ============================================================================

/**
 * Create a simple site definition with sensible defaults
 *
 * For quick migration of existing sites that don't need complex routing yet.
 */
export function createSimpleSite(config: {
  id: string
  domain: string
  name: string
  icon: string
  iconImage?: string
  description: string
  component: ComponentType<SiteComponentProps>
  keywords?: string[]
  seoScore?: number
  /** Site manifest for search indexing - declares all searchable content */
  manifest?: SiteManifest
}): CornSite {
  const normalizedDomain = config.domain.endsWith('.corn') ? config.domain : config.domain + '.corn'

  // Store manifest if provided
  if (config.manifest) {
    manifestsByDomain.set(normalizedDomain, config.manifest)
  }

  return {
    id: config.id,
    domain: normalizedDomain,
    name: config.name,
    icon: config.icon,
    iconImage: config.iconImage,
    description: config.description,
    component: config.component,
    routes: [
      {
        pattern: '/',
        metadata: {
          title: config.name,
          description: config.description,
          keywords: config.keywords || [],
        },
      },
      {
        pattern: '*',
        metadata: {
          title: (params) => `${config.name} - ${params['*'] || ''}`,
          description: config.description,
        },
      },
    ],
    seo: {
      baseScore: config.seoScore || 50,
      keywords: config.keywords || [],
    },
  }
}

// ============================================================================
// Helper: Create Site with Routes
// ============================================================================

/**
 * Create a site with explicit route definitions
 *
 * For sites that need URL-based navigation (Threadit, WikiKnow, etc.)
 */
export function createRoutedSite(config: {
  id: string
  domain: string
  name: string
  icon: string
  iconImage?: string
  description: string
  component: ComponentType<SiteComponentProps>
  routes: RouteDefinition[]
  keywords: string[]
  seoScore?: number
  theme?: CornSite['theme']
}): CornSite {
  return {
    id: config.id,
    domain: config.domain.endsWith('.corn') ? config.domain : config.domain + '.corn',
    name: config.name,
    icon: config.icon,
    iconImage: config.iconImage,
    description: config.description,
    component: config.component,
    routes: config.routes,
    seo: {
      baseScore: config.seoScore || 50,
      keywords: config.keywords,
    },
    theme: config.theme,
  }
}

// ============================================================================
// Search Index API (Manifests)
// ============================================================================

/**
 * Register a site manifest directly (for sites that export manifests separately)
 */
export function registerManifest(manifest: SiteManifest): void {
  const domain = manifest.domain.toLowerCase()
  manifestsByDomain.set(domain, manifest)
}

/**
 * Get all registered site manifests
 */
export function getAllManifests(): SiteManifest[] {
  return Array.from(manifestsByDomain.values())
}

/**
 * Get a manifest by domain
 */
export function getManifestByDomain(domain: string): SiteManifest | undefined {
  let normalized = domain.toLowerCase()
  if (normalized.startsWith('www.')) {
    normalized = normalized.slice(4)
  }
  if (!normalized.endsWith('.corn')) {
    normalized = normalized + '.corn'
  }
  return manifestsByDomain.get(normalized)
}

/**
 * Get all search index entries from all manifests
 * This is what Goober consumes for its search index.
 */
export function getAllSearchEntries(): SearchIndexEntry[] {
  const entries: SearchIndexEntry[] = []

  for (const manifest of manifestsByDomain.values()) {
    entries.push(...manifestToSearchEntries(manifest))
  }

  return entries
}

/**
 * Get count of indexed content
 */
export function getManifestStats(): { sites: number; pages: number } {
  let pages = 0
  for (const manifest of manifestsByDomain.values()) {
    pages += manifest.pages.length + 1 // +1 for homepage
  }
  return {
    sites: manifestsByDomain.size,
    pages,
  }
}

// ============================================================================
// Export Registry for Direct Access
// ============================================================================

export const siteRegistry = {
  register: registerSite,
  registerAll: registerSites,
  getByDomain: getSiteByDomain,
  getById: getSiteById,
  getAll: getAllSites,
  getMap: getSiteRegistry,
  has: hasSite,
  // Legacy
  getUrl: getUrlForSite,
  getSiteId: getSiteIdFromUrl,
  // Search/Manifests
  registerManifest,
  getAllManifests,
  getManifestByDomain,
  getAllSearchEntries,
  getManifestStats,
}

export default siteRegistry
