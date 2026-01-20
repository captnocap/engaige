/**
 * Placeholder Site
 *
 * Shown when a site hasn't been implemented yet.
 */

import { getApp } from '../../../config/app-registry.js'
import type { SiteProps } from '../BrowserSiteContainer.js'

export function PlaceholderSite({ siteId }: SiteProps) {
  const app = getApp(siteId)

  return (
    <div
      className="h-full flex flex-col items-center justify-center gap-4 p-8"
      style={{ background: 'var(--color-bg)' }}
    >
      <span className="text-6xl">{app?.icon || '🌐'}</span>
      <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
        {app?.name || 'Unknown Site'}
      </h1>
      <p className="text-center max-w-md" style={{ color: 'var(--color-textMuted)' }}>
        {app?.description || 'This site is under construction.'}
      </p>
      <div
        className="mt-4 px-4 py-2 rounded-full text-sm"
        style={{ background: 'var(--color-bgSecondary)', color: 'var(--color-textMuted)' }}
      >
        Coming Soon
      </div>
    </div>
  )
}

export default PlaceholderSite
