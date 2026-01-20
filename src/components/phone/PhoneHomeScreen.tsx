/**
 * Phone Home Screen
 *
 * iOS-style app grid with icons.
 */

import type { AppDefinition } from '../../config/app-registry.js'

interface PhoneHomeScreenProps {
  apps: AppDefinition[]
  onAppOpen: (appId: string) => void
}

// App icon background colors (iOS-style gradients)
const APP_ICON_COLORS: Record<string, string> = {
  'messages': 'linear-gradient(180deg, #5BF675 0%, #00C853 100%)',
  'myface-chat': 'linear-gradient(180deg, #4A90D9 0%, #003366 100%)',
  'myface': 'linear-gradient(180deg, #6B8DD6 0%, #003366 100%)',
  'chirp-dm': 'linear-gradient(180deg, #1DA1F2 0%, #0A66C2 100%)',
  'chirp': 'linear-gradient(180deg, #1DA1F2 0%, #0077B5 100%)',
  'instasnap-dm': 'linear-gradient(45deg, #833AB4 0%, #FD1D1D 50%, #FCB045 100%)',
  'instasnap': 'linear-gradient(45deg, #833AB4 0%, #FD1D1D 50%, #FCB045 100%)',
  'lovelink-chat': 'linear-gradient(180deg, #FF6B6B 0%, #FE3C72 100%)',
  'lovelink': 'linear-gradient(180deg, #FF6B6B 0%, #FE3C72 100%)',
  'spark': 'linear-gradient(180deg, #FE3C72 0%, #FF8C5A 100%)',
  'spark-chat': 'linear-gradient(180deg, #FE3C72 0%, #FF8C5A 100%)',
  'settings': 'linear-gradient(180deg, #8E8E93 0%, #636366 100%)',
  'photos': 'linear-gradient(180deg, #FFFFFF 0%, #F5F5F7 100%)',
  'calendar': 'linear-gradient(180deg, #FFFFFF 0%, #F5F5F7 100%)',
  'music': 'linear-gradient(180deg, #FA2D48 0%, #A30F23 100%)',
  'games': 'linear-gradient(180deg, #5856D6 0%, #32127A 100%)',
}

// Organize apps into categories for display
function organizeApps(apps: AppDefinition[]) {
  // First row: main messaging apps
  const messaging = apps.filter(a => a.category === 'messaging')
  // Second row: social apps
  const social = apps.filter(a => a.category === 'social')
  // Third row: dating
  const dating = apps.filter(a => a.category === 'dating')
  // Rest: utility, entertainment
  const other = apps.filter(a =>
    a.category === 'utility' ||
    a.category === 'entertainment'
  )

  return [...messaging, ...social, ...dating, ...other]
}

export function PhoneHomeScreen({ apps, onAppOpen }: PhoneHomeScreenProps) {
  const sortedApps = organizeApps(apps)

  // Split into pages if needed (16 apps per page for 4x4 grid)
  // For now, just show all on one page

  return (
    <div className="min-h-full flex flex-col px-4 py-8">
      {/* App Grid */}
      <div className="flex-1 grid grid-cols-4 gap-x-4 gap-y-6 content-start">
        {sortedApps.map(app => (
          <AppIcon
            key={app.id}
            app={app}
            onClick={() => onAppOpen(app.id)}
          />
        ))}
      </div>

      {/* Dock */}
      <div className="mt-auto pt-4">
        <div
          className="flex justify-center gap-4 px-4 py-2 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(20px)' }}
        >
          {/* Quick access dock - show first 4 messaging apps */}
          {sortedApps.filter(a => a.category === 'messaging').slice(0, 4).map(app => (
            <AppIcon
              key={`dock-${app.id}`}
              app={app}
              onClick={() => onAppOpen(app.id)}
              size="dock"
            />
          ))}
        </div>
      </div>
    </div>
  )
}

interface AppIconProps {
  app: AppDefinition
  onClick: () => void
  size?: 'normal' | 'dock'
}

function AppIcon({ app, onClick, size = 'normal' }: AppIconProps) {
  const iconSize = size === 'dock' ? 'w-14 h-14' : 'w-16 h-16'
  const textSize = size === 'dock' ? 'hidden' : 'text-[10px]'

  const bgStyle = APP_ICON_COLORS[app.id] || 'linear-gradient(180deg, #999 0%, #666 100%)'

  // Badge count (placeholder - would come from store)
  const badgeCount = 0

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1 group"
    >
      <div
        className={`${iconSize} rounded-[22%] flex items-center justify-center text-2xl relative shadow-lg transition-transform group-active:scale-95`}
        style={{ background: bgStyle }}
      >
        <span className="drop-shadow-sm">{app.icon}</span>

        {/* Notification Badge */}
        {badgeCount > 0 && (
          <div className="absolute -top-1 -right-1 min-w-5 h-5 px-1.5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
            {badgeCount > 99 ? '99+' : badgeCount}
          </div>
        )}
      </div>
      <span className={`${textSize} text-white font-medium truncate max-w-full`}>
        {app.name}
      </span>
    </button>
  )
}

export default PhoneHomeScreen
