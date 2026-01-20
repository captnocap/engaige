/**
 * Browser Site Container
 *
 * Routes to the appropriate site component based on siteId.
 */

import { getApp } from '../../config/app-registry.js'
import { PlaceholderSite } from './sites/PlaceholderSite.js'
import { MyFaceSite } from './sites/MyFaceSite.js'

interface BrowserSiteContainerProps {
  siteId: string
  onNavigate: (appId: string) => void
}

export interface SiteProps {
  siteId: string
  onNavigate: (appId: string) => void
}

// Map site IDs to components - PlaceholderSite used for unimplemented sites
const SITE_COMPONENTS: Record<string, React.ComponentType<SiteProps>> = {
  'myface': MyFaceSite,
  'myface-chat': MyFaceSite, // Chat is part of MyFace
  // All other sites use PlaceholderSite until implemented
}

export function BrowserSiteContainer({ siteId, onNavigate }: BrowserSiteContainerProps) {
  const app = getApp(siteId)
  const SiteComponent = SITE_COMPONENTS[siteId] || PlaceholderSite

  if (!app) {
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
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      <SiteComponent siteId={siteId} onNavigate={onNavigate} />
    </div>
  )
}

export default BrowserSiteContainer
