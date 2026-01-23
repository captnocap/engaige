import { useThemeStore, themes } from '../../../stores/themeStore.js'
import { SettingsCard } from '../components/SettingsCard.js'

export default function ThemeSettings() {
  const { currentTheme, setTheme } = useThemeStore()

  return (
    <div>
      <SettingsCard title="Theme" description="Choose your preferred color scheme">
        <div className="grid grid-cols-1 gap-2 max-h-96 overflow-y-auto">
          {themes.map((theme) => (
            <button
              key={theme.name}
              onClick={() => setTheme(theme.name)}
              className="flex items-center justify-between p-3 rounded transition-all text-left"
              style={{
                background: currentTheme.name === theme.name ? 'var(--color-bgTertiary)' : 'var(--color-bg)',
                border:
                  currentTheme.name === theme.name ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
              }}
            >
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  <div className="w-3 h-3 rounded-full" style={{ background: theme.colors.primary }} />
                  <div className="w-3 h-3 rounded-full" style={{ background: theme.colors.secondary }} />
                  <div className="w-3 h-3 rounded-full" style={{ background: theme.colors.accent }} />
                </div>
                <span style={{ color: 'var(--color-text)' }}>{theme.displayName}</span>
              </div>
              {currentTheme.name === theme.name && <span style={{ color: 'var(--color-primary)' }}>✓</span>}
            </button>
          ))}
        </div>
      </SettingsCard>
    </div>
  )
}
