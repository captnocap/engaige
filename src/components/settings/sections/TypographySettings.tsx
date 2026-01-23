import { useSettingsStore } from '../../../stores/settingsStore.js'
import { Select } from '../../ui/Select.js'
import { SettingsCard } from '../SettingsCard.js'
import { RangeControl } from '../RangeControl.js'
import { fontFamilies } from '../typography-constants.js'

export default function TypographySettings() {
  const { typography, setTypography } = useSettingsStore()

  return (
    <div className="space-y-6">
      {/* Font Family */}
      <SettingsCard title="Font Family" description="Choose your preferred typeface">
        <Select
          value={typography.fontFamily}
          onChange={(val) => setTypography({ fontFamily: val })}
          className="w-full mb-4"
          options={fontFamilies.map((font) => ({
            value: font.value,
            label: font.name,
          }))}
        />

        {/* Live preview */}
        <div
          className="p-4 rounded"
          style={{
            background: 'var(--color-bg)',
            border: '1px solid var(--color-border)',
            fontFamily: typography.fontFamily,
            color: 'var(--color-text)',
          }}
        >
          <div className="text-lg font-semibold mb-2">The quick brown fox jumps over the lazy dog</div>
          <div className="text-sm">AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz</div>
          <div className="text-sm">0123456789 !@#$%^&*()</div>
        </div>
      </SettingsCard>

      {/* Font Size */}
      <SettingsCard title="Font Size" description="Adjust text size globally">
        <RangeControl
          value={typography.fontSize}
          min={80}
          max={120}
          defaultValue={100}
          unit="%"
          onChange={(v) => setTypography({ fontSize: v })}
          marks={{ 80: 'Small', 100: 'Default', 120: 'Large' }}
        />
      </SettingsCard>

      {/* Line Height */}
      <SettingsCard title="Line Height" description="Spacing between lines of text">
        <RangeControl
          value={typography.lineHeight}
          min={1.2}
          max={2.0}
          step={0.1}
          defaultValue={1.5}
          onChange={(v) => setTypography({ lineHeight: v })}
          marks={{ 1.2: 'Tight', 1.5: 'Normal', 2.0: 'Loose' }}
        />
      </SettingsCard>

      {/* Letter Spacing */}
      <SettingsCard title="Letter Spacing" description="Space between individual letters">
        <RangeControl
          value={typography.letterSpacing}
          min={-0.05}
          max={0.1}
          step={0.005}
          defaultValue={0}
          unit="em"
          onChange={(v) => setTypography({ letterSpacing: v })}
          marks={{ '-0.05': 'Tight', 0: 'Normal', 0.1: 'Wide' }}
        />
      </SettingsCard>

      {/* Font Weight */}
      <SettingsCard title="Font Weight" description="Thickness of text">
        <div className="grid grid-cols-4 gap-2">
          {['normal', 'medium', 'semibold', 'bold'].map((weight) => (
            <button
              key={weight}
              onClick={() => setTypography({ fontWeight: weight as any })}
              className="p-3 rounded text-sm font-medium transition-all"
              style={{
                background: typography.fontWeight === weight ? 'var(--color-primary)' : 'var(--color-bg)',
                color: typography.fontWeight === weight ? 'white' : 'var(--color-text)',
                border: '1px solid var(--color-border)',
                fontWeight: weight,
              }}
            >
              {weight.charAt(0).toUpperCase() + weight.slice(1)}
            </button>
          ))}
        </div>
      </SettingsCard>

      {/* Kinetic Typography */}
      <SettingsCard title="Active Typography" description="Animated text effects">
        <div className="space-y-4">
          {/* Enable toggle */}
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium" style={{ color: 'var(--color-text)' }}>
                Enable Kinetic Typography
              </div>
              <div className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
                Add life to text with animations
              </div>
            </div>
            <input
              type="checkbox"
              checked={typography.enableAnimations}
              onChange={(e) => setTypography({ enableAnimations: e.target.checked })}
              className="w-5 h-5 cursor-pointer"
            />
          </div>

          {/* Animation style */}
          {typography.enableAnimations && (
            <div className="space-y-2">
              <label className="block text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                Animation Intensity
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['subtle', 'moderate', 'energetic'] as const).map((style) => (
                  <button
                    key={style}
                    onClick={() => setTypography({ animationStyle: style })}
                    className="p-3 rounded text-sm font-medium transition-all"
                    style={{
                      background: typography.animationStyle === style ? 'var(--color-primary)' : 'var(--color-bg)',
                      color: typography.animationStyle === style ? 'white' : 'var(--color-text)',
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    {style.charAt(0).toUpperCase() + style.slice(1)}
                  </button>
                ))}
              </div>
              <div className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
                {typography.animationStyle === 'subtle' && 'Gentle hover effects and transitions'}
                {typography.animationStyle === 'moderate' && 'Gradient animations and smooth motion'}
                {typography.animationStyle === 'energetic' && 'Glitch effects, rainbow colors, heavy animation'}
              </div>
            </div>
          )}
        </div>
      </SettingsCard>
    </div>
  )
}
