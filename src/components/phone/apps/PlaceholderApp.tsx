/**
 * Placeholder App
 *
 * Shown when an app component hasn't been implemented yet.
 */

import { getApp } from '../../../config/app-registry.js'
import type { AppProps } from '../PhoneAppContainer.js'

export function PlaceholderApp({ appId, onBack }: AppProps) {
  const app = getApp(appId)

  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--color-bg)' }}>
      {/* Nav Bar */}
      <div
        className="h-11 px-4 flex items-center gap-3"
        style={{ background: 'var(--color-bgSecondary)', borderBottom: '1px solid var(--color-border)' }}
      >
        <button
          onClick={onBack}
          className="text-[var(--color-primary)] text-sm font-medium"
        >
          Back
        </button>
        <span className="flex-1 text-center font-semibold" style={{ color: 'var(--color-text)' }}>
          {app?.name || 'App'}
        </span>
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8">
        <span className="text-6xl">{app?.icon || '📱'}</span>
        <h2 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>
          {app?.name || 'Unknown App'}
        </h2>
        <p className="text-center text-sm" style={{ color: 'var(--color-textMuted)' }}>
          {app?.description || 'This app is coming soon.'}
        </p>
        <div
          className="mt-4 px-4 py-2 rounded-full text-xs"
          style={{ background: 'var(--color-bgSecondary)', color: 'var(--color-textMuted)' }}
        >
          Coming Soon
        </div>
      </div>
    </div>
  )
}

export default PlaceholderApp
