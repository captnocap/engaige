/**
 * Browser Site Container
 *
 * Routes to the appropriate site component based on site definition.
 * Uses the Corn Stack router for URL-based navigation.
 */

import { getSiteByDomain, getSiteById, type CornSite, type SiteComponentProps } from '../../router/index.js'
import { PlaceholderSite } from './sites/PlaceholderSite.js'

interface BrowserSiteContainerProps {
  /** Site object from router (preferred) */
  site?: CornSite | null
  /** Site ID for legacy compatibility */
  siteId?: string
  /** Current path within the site */
  path: string | null
  /** Route params extracted from URL */
  params?: Record<string, string>
  /** Query parameters */
  query?: URLSearchParams
  /** Navigate to a different site by ID */
  onNavigate: (appId: string) => void
  /** Update the current path */
  onPathChange: (path: string | null) => void
  /** Navigate to a full URL */
  onNavigateToUrl?: (url: string) => void
}

export function BrowserSiteContainer({
  site,
  siteId,
  path,
  params = {},
  query,
  onNavigate,
  onPathChange,
  onNavigateToUrl,
}: BrowserSiteContainerProps) {
  // Resolve site from siteId if not provided directly
  const resolvedSite = site || (siteId ? getSiteById(siteId) : null)

  if (!resolvedSite) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-6xl mb-4">🔍</p>
          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
            Site Not Found
          </h2>
          <p style={{ color: 'var(--color-textMuted)' }}>
            We couldn't find that website.
          </p>
          <p className="text-sm mt-4" style={{ color: 'var(--color-textMuted)' }}>
            Looking for: {siteId || 'unknown'}
          </p>
        </div>
      </div>
    )
  }

  // Get the component from the site definition
  const SiteComponent = resolvedSite.component || PlaceholderSite

  // Build props for the site component
  const siteProps: SiteComponentProps = {
    siteId: resolvedSite.id,
    path,
    params,
    query: query || new URLSearchParams(),
    onNavigate,
    onPathChange,
    onNavigateToUrl: onNavigateToUrl || ((url: string) => {
      // Default: try to extract site from URL and navigate
      console.log('[BrowserSiteContainer] onNavigateToUrl not provided, URL:', url)
    }),
  }

  return (
    <div className="h-full overflow-y-auto select-text">
      <SiteComponent {...siteProps} />
    </div>
  )
}

export default BrowserSiteContainer

// Legacy SiteProps type for backwards compatibility
export interface SiteProps {
  siteId: string
  path: string | null
  onNavigate: (appId: string) => void
  onPathChange: (path: string | null) => void
  onNavigateToUrl?: (url: string) => void
}
