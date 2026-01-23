import { useState, useEffect } from 'react'
import { useDisplayStore } from '../../../stores/displayStore.js'
import { Select } from '../../ui/Select.js'
import { SettingsCard } from '../components/SettingsCard.js'

export default function DisplaySettings() {
  const { fullscreen, monitorName, monitors, loadMonitors, setFullscreen, setMonitor } = useDisplayStore()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadMonitorsData = async () => {
      try {
        console.log('DisplaySettings: Loading monitors...')
        await loadMonitors()
        console.log('DisplaySettings: Monitors loaded:', useDisplayStore.getState().monitors)
        setError(null)
      } catch (err) {
        console.error('DisplaySettings: Failed to load monitors:', err)
        setError('Failed to load monitors')
      } finally {
        setLoading(false)
      }
    }
    loadMonitorsData()
  }, [])

  return (
    <div className="space-y-6">
      <SettingsCard title="Fullscreen Mode" description="Run the game in fullscreen">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold" style={{ color: 'var(--color-text)' }}>
              Enable Fullscreen
            </div>
            <div className="text-xs mt-1" style={{ color: 'var(--color-textMuted)' }}>
              Maximize window to fullscreen
            </div>
          </div>
          <input
            type="checkbox"
            checked={fullscreen}
            onChange={(e) => setFullscreen(e.target.checked)}
            className="w-5 h-5 cursor-pointer"
          />
        </div>
      </SettingsCard>

      <SettingsCard title="Monitor Selection" description="Choose which monitor to use">
        {error && (
          <div
            className="p-2 rounded text-sm mb-4"
            style={{
              background: 'var(--color-error)/10',
              color: 'var(--color-error)',
              border: '1px solid var(--color-error)/30',
            }}
          >
            ⚠️ {error}
          </div>
        )}
        {loading ? (
          <div className="text-sm" style={{ color: 'var(--color-textMuted)' }}>
            Loading monitors...
          </div>
        ) : monitors.length === 0 ? (
          <div className="space-y-2">
            <div className="text-sm" style={{ color: 'var(--color-textMuted)' }}>
              Using primary monitor (no additional monitors detected)
            </div>
            <button
              onClick={() => {
                setLoading(true)
                loadMonitors().finally(() => setLoading(false))
              }}
              className="text-xs px-3 py-1 rounded"
              style={{
                background: 'var(--color-bgTertiary)',
                color: 'var(--color-primary)',
                border: '1px solid var(--color-border)',
              }}
            >
              🔄 Refresh Monitors
            </button>
          </div>
        ) : (
          <Select
            value={monitorName || ''}
            onChange={(val) => setMonitor(val || null)}
            options={[
              { value: '', label: 'Primary Monitor' },
              ...monitors.map((m) => ({
                value: m.name,
                label: `${m.name} (${m.size.width}×${m.size.height})`,
              })),
            ]}
          />
        )}
      </SettingsCard>
    </div>
  )
}
