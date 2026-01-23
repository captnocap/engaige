import { useSettingsStore } from '../../../stores/settingsStore.js'
import { SettingsCard } from '../components/SettingsCard.js'
import { RangeControl } from '../components/RangeControl.js'

export default function GraphicsSettings() {
  const { graphics, setGraphics } = useSettingsStore()

  return (
    <div className="space-y-6">
      {/* Brightness */}
      <SettingsCard title="Brightness" description="Adjust screen brightness">
        <RangeControl
          value={graphics.brightness}
          min={50}
          max={150}
          defaultValue={100}
          unit="%"
          onChange={(v) => setGraphics({ brightness: v })}
          marks={{ 50: 'Darker', 100: 'Default', 150: 'Brighter' }}
        />
      </SettingsCard>

      {/* Contrast */}
      <SettingsCard title="Contrast" description="Adjust color contrast">
        <RangeControl
          value={graphics.contrast}
          min={50}
          max={150}
          defaultValue={100}
          unit="%"
          onChange={(v) => setGraphics({ contrast: v })}
          marks={{ 50: 'Low', 100: 'Normal', 150: 'High' }}
        />
      </SettingsCard>

      {/* Saturation */}
      <SettingsCard title="Saturation" description="Adjust color vibrancy">
        <RangeControl
          value={graphics.saturation}
          min={0}
          max={200}
          defaultValue={100}
          unit="%"
          onChange={(v) => setGraphics({ saturation: v })}
          marks={{ 0: 'Gray', 100: 'Normal', 200: 'Vibrant' }}
        />
      </SettingsCard>

      {/* Reduce Motion */}
      <SettingsCard title="Reduce Motion" description="Minimize animations (accessibility)">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold" style={{ color: 'var(--color-text)' }}>
              Disable Animations
            </div>
            <div className="text-xs mt-1" style={{ color: 'var(--color-textMuted)' }}>
              Turn off transitions and animations for better accessibility
            </div>
          </div>
          <input
            type="checkbox"
            checked={graphics.reduceMotion}
            onChange={(e) => setGraphics({ reduceMotion: e.target.checked })}
            className="w-5 h-5 cursor-pointer"
          />
        </div>
      </SettingsCard>
    </div>
  )
}
