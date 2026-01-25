import { useState } from 'react'
import { SidebarNav } from '../settings/components/index.js'
import {
  DisplaySettings,
  ThemeSettings,
  WallpaperSettings,
  TypographySettings,
  GraphicsSettings,
  AudioSettings,
  AccessibilitySettings,
  AIProviderSettings,
  DeveloperSettings,
  ContentRatingSettings,
} from '../settings/sections/index.js'

type SettingsTab = 'display' | 'theme' | 'wallpaper' | 'typography' | 'graphics' | 'audio' | 'accessibility' | 'content-rating' | 'ai-providers' | 'developer'

const navItems: { id: SettingsTab; label: string; icon: string }[] = [
  { id: 'display', label: 'Display', icon: '🖥️' },
  { id: 'theme', label: 'Theme', icon: '🎨' },
  { id: 'wallpaper', label: 'Wallpaper', icon: '🖼️' },
  { id: 'typography', label: 'Typography', icon: '✏️' },
  { id: 'graphics', label: 'Graphics', icon: '✨' },
  { id: 'audio', label: 'Audio', icon: '🔊' },
  { id: 'accessibility', label: 'Accessibility', icon: '♿' },
  { id: 'content-rating', label: 'Content Rating', icon: '🛡️' },
  { id: 'ai-providers', label: 'AI Providers', icon: '🤖' },
  { id: 'developer', label: 'Developer', icon: '🛠️' },
]

// Map tabs to their section components
const sectionComponents: Record<SettingsTab, React.ComponentType> = {
  'display': DisplaySettings,
  'theme': ThemeSettings,
  'wallpaper': WallpaperSettings,
  'typography': TypographySettings,
  'graphics': GraphicsSettings,
  'audio': AudioSettings,
  'accessibility': AccessibilitySettings,
  'content-rating': ContentRatingSettings,
  'ai-providers': AIProviderSettings,
  'developer': DeveloperSettings,
}

export function SettingsWindow() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('display')

  const ActiveSection = sectionComponents[activeTab]

  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--color-bg)' }}>
      {/* Header */}
      <div
        className="px-8 py-6 border-b"
        style={{
          background: 'var(--color-bgSecondary)',
          borderBottomColor: 'var(--color-border)',
        }}
      >
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
          Settings
        </h1>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <SidebarNav items={navItems} activeItem={activeTab} onItemClick={setActiveTab} />

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto flex justify-center" style={{ background: 'var(--color-bg)' }}>
          <div
            className="py-10"
            style={{
              width: '100%',
              maxWidth: '700px',
              paddingLeft: '40px',
              paddingRight: '40px',
            }}
          >
            <div className="space-y-6">
              <ActiveSection />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
