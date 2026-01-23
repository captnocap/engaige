import { useSettingsStore } from '../../../stores/settingsStore.js'

function SettingsCard({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div
      className="rounded-lg"
      style={{
        background: 'var(--color-bgSecondary)',
        border: '1px solid var(--color-border)',
        padding: '24px',
      }}
    >
      <div className="mb-6">
        <div className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
          {title}
        </div>
        {description && (
          <div className="text-sm mt-2" style={{ color: 'var(--color-textMuted)' }}>
            {description}
          </div>
        )}
      </div>
      {children}
    </div>
  )
}

export default function AccessibilitySettings() {
  const { accessibility, setAccessibility } = useSettingsStore()

  return (
    <div className="space-y-6">
      <SettingsCard title="High Contrast Mode" description="Improve visibility for visual impairments">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold" style={{ color: 'var(--color-text)' }}>
              Enable High Contrast
            </div>
            <div className="text-xs mt-1" style={{ color: 'var(--color-textMuted)' }}>
              Increase color contrast for better readability
            </div>
          </div>
          <input
            type="checkbox"
            checked={accessibility.highContrast}
            onChange={(e) => setAccessibility({ highContrast: e.target.checked })}
            className="w-5 h-5 cursor-pointer"
          />
        </div>
      </SettingsCard>

      <div
        className="p-4 rounded"
        style={{
          background: 'var(--color-info)/10',
          border: '1px solid var(--color-info)/30',
        }}
      >
        <p className="text-sm" style={{ color: 'var(--color-info)' }}>
          ℹ️ All settings are keyboard accessible. Use Tab to navigate, Enter to activate buttons, and arrow keys to adjust sliders.
        </p>
      </div>
    </div>
  )
}
