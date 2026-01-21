import { useState, useEffect } from 'react'
import { useDisplayStore } from '../../stores/displayStore.js'
import { useSettingsStore, applyTypographySettings } from '../../stores/settingsStore.js'
import { useThemeStore, themes } from '../../stores/themeStore.js'
import { useOnboardingStore } from '../../stores/onboardingStore.js'
import { useSimulationStore } from '../../stores/simulationStore.js'
import { Select } from '../ui/Select.js'
import { open } from '@tauri-apps/plugin-dialog'
import { convertFileSrc } from '@tauri-apps/api/core'

type SettingsTab = 'display' | 'theme' | 'wallpaper' | 'typography' | 'graphics' | 'audio' | 'accessibility' | 'developer'

// Font families organized by category
const fontFamilies = [
  { name: 'System Default', value: 'system-ui', category: 'System' },
  { name: 'Inter', value: 'Inter, sans-serif', category: 'Sans-Serif' },
  { name: 'Roboto', value: 'Roboto, sans-serif', category: 'Sans-Serif' },
  { name: 'Open Sans', value: 'Open Sans, sans-serif', category: 'Sans-Serif' },
  { name: 'Lato', value: 'Lato, sans-serif', category: 'Sans-Serif' },
  { name: 'Montserrat', value: 'Montserrat, sans-serif', category: 'Sans-Serif' },
  { name: 'Poppins', value: 'Poppins, sans-serif', category: 'Sans-Serif' },
  { name: 'Merriweather', value: 'Merriweather, serif', category: 'Serif' },
  { name: 'Playfair Display', value: 'Playfair Display, serif', category: 'Serif' },
  { name: 'Lora', value: 'Lora, serif', category: 'Serif' },
  { name: 'Crimson Text', value: 'Crimson Text, serif', category: 'Serif' },
  { name: 'Fira Code', value: 'Fira Code, monospace', category: 'Monospace' },
  { name: 'JetBrains Mono', value: 'JetBrains Mono, monospace', category: 'Monospace' },
  { name: 'Source Code Pro', value: 'Source Code Pro, monospace', category: 'Monospace' },
  { name: 'IBM Plex Mono', value: 'IBM Plex Mono, monospace', category: 'Monospace' },
  { name: 'Comic Sans MS', value: 'Comic Sans MS, cursive', category: 'Playful' },
  { name: 'Papyrus', value: 'Papyrus, fantasy', category: 'Playful' },
  { name: 'Pacifico', value: 'Pacifico, cursive', category: 'Playful' },
  { name: 'Caveat', value: 'Caveat, cursive', category: 'Playful' },
  { name: 'Press Start 2P', value: 'Press Start 2P, cursive', category: 'Playful' },
]

const groupedFonts = fontFamilies.reduce(
  (acc, font) => {
    if (!acc[font.category]) acc[font.category] = []
    acc[font.category].push(font)
    return acc
  },
  {} as Record<string, typeof fontFamilies>
)

// Reusable Components
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

function RangeControl({
  value,
  min,
  max,
  step = 1,
  defaultValue,
  unit = '',
  onChange,
  marks,
}: {
  value: number
  min: number
  max: number
  step?: number
  defaultValue: number
  unit?: string
  onChange: (value: number) => void
  marks?: Record<number | string, string>
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
          {value}
          {unit}
        </span>
        <button
          onClick={() => onChange(defaultValue)}
          className="text-xs hover:underline"
          style={{ color: 'var(--color-primary)' }}
        >
          Reset
        </button>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
      />

      {marks && (
        <div className="flex justify-between text-xs" style={{ color: 'var(--color-textMuted)' }}>
          {Object.entries(marks).map(([val, label]) => (
            <span key={val}>{label}</span>
          ))}
        </div>
      )}
    </div>
  )
}

function VolumeControl({
  label,
  description,
  volume,
  muted,
  onVolumeChange,
  onMuteToggle,
  disabled = false,
}: {
  label: string
  description: string
  volume: number
  muted: boolean
  onVolumeChange: (volume: number) => void
  onMuteToggle: () => void
  disabled?: boolean
}) {
  return (
    <SettingsCard title={label} description={description}>
      <div className="flex gap-3 items-center">
        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={(e) => onVolumeChange(Number(e.target.value))}
          disabled={disabled || muted}
          className="flex-1"
        />
        <button
          onClick={onMuteToggle}
          disabled={disabled}
          className="w-12 h-12 rounded flex items-center justify-center transition-colors text-2xl"
          style={{
            background: muted ? 'var(--color-error)/20' : 'var(--color-bgTertiary)',
            color: muted ? 'var(--color-error)' : 'var(--color-text)',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.5 : 1,
          }}
        >
          {muted ? '🔇' : '🔊'}
        </button>
        <span className="text-sm font-mono w-12 text-right" style={{ color: 'var(--color-textMuted)' }}>
          {muted ? 'Muted' : `${volume}%`}
        </span>
      </div>
    </SettingsCard>
  )
}

function SidebarNav({
  items,
  activeItem,
  onItemClick,
}: {
  items: { id: SettingsTab; label: string; icon: string }[]
  activeItem: SettingsTab
  onItemClick: (id: SettingsTab) => void
}) {
  return (
    <nav
      className="w-48 p-4 overflow-y-auto"
      style={{
        background: 'var(--color-bgSecondary)',
        borderRight: '1px solid var(--color-border)',
      }}
    >
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onItemClick(item.id)}
          className="w-full px-4 py-3 rounded text-left flex items-center gap-3 transition-all"
          style={{
            background: activeItem === item.id ? 'var(--color-primary)/10' : 'transparent',
            color: activeItem === item.id ? 'var(--color-primary)' : 'var(--color-text)',
            borderLeft: activeItem === item.id ? '3px solid var(--color-primary)' : '3px solid transparent',
            marginTop: '2px',
            marginBottom: '2px',
          }}
        >
          <span className="text-xl">{item.icon}</span>
          <span className="text-sm">{item.label}</span>
        </button>
      ))}
    </nav>
  )
}

// Section Components
function DisplaySection() {
  const { fullscreen, monitorName, monitors, loadMonitors, setFullscreen, setMonitor } = useDisplayStore()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadMonitorsData = async () => {
      try {
        console.log('DisplaySection: Loading monitors...')
        await loadMonitors()
        console.log('DisplaySection: Monitors loaded:', useDisplayStore.getState().monitors)
        setError(null)
      } catch (err) {
        console.error('DisplaySection: Failed to load monitors:', err)
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

function ThemeSection() {
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

function WallpaperSection() {
  const { wallpaper, setWallpaper } = useSettingsStore()
  const [inputMethod, setInputMethod] = useState<'file' | 'url'>('file')
  const [urlInput, setUrlInput] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = async () => {
    try {
      const file = await open({
        multiple: false,
        filters: [
          {
            name: 'Images',
            extensions: ['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp', 'svg'],
          },
        ],
      })

      if (file && typeof file === 'string') {
        const assetUrl = convertFileSrc(file)

        // Check file size (warn if > 5MB)
        const fileSize = new Blob([file]).size
        if (fileSize > 5 * 1024 * 1024) {
          console.warn('File size is large, may impact performance')
        }

        setWallpaper({
          type: 'custom',
          customPath: assetUrl,
          customSource: 'file',
        })
        setError(null)
      }
    } catch (err) {
      console.error('Error selecting file:', err)
      setError('Failed to select file')
    }
  }

  const handleUrlSubmit = (url: string) => {
    try {
      new URL(url)
      setWallpaper({
        type: 'custom',
        customPath: url,
        customSource: 'url',
      })
      setUrlInput('')
      setError(null)
    } catch {
      setError('Invalid URL format')
    }
  }

  return (
    <div className="space-y-6">
      <SettingsCard title="Desktop Wallpaper" description="Customize your desktop background">
        <div className="space-y-4">
          {/* Wallpaper type selection */}
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 rounded cursor-pointer transition-colors" style={{background: 'var(--color-bg)', border: '1px solid var(--color-border)'}}>
              <input
                type="radio"
                checked={wallpaper.type === 'theme'}
                onChange={() => setWallpaper({ type: 'theme', customPath: null })}
                className="w-4 h-4 cursor-pointer"
              />
              <div>
                <div className="font-medium" style={{ color: 'var(--color-text)' }}>
                  Use Theme Gradient
                </div>
                <div className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
                  Match current theme colors
                </div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded cursor-pointer transition-colors" style={{background: 'var(--color-bg)', border: '1px solid var(--color-border)'}}>
              <input
                type="radio"
                checked={wallpaper.type === 'custom'}
                onChange={() => setWallpaper({ type: 'custom' })}
                className="w-4 h-4 cursor-pointer"
              />
              <div>
                <div className="font-medium" style={{ color: 'var(--color-text)' }}>
                  Custom Wallpaper
                </div>
                <div className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
                  Upload an image or use a URL
                </div>
              </div>
            </label>
          </div>

          {/* Custom wallpaper options */}
          {wallpaper.type === 'custom' && (
            <div className="mt-4 space-y-4 p-4 rounded" style={{ background: 'var(--color-bgTertiary)', border: '1px solid var(--color-border)' }}>
              {/* Input method tabs */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setInputMethod('file')
                    setError(null)
                  }}
                  className="flex-1 py-2 px-4 rounded text-sm font-medium transition-colors"
                  style={{
                    background: inputMethod === 'file' ? 'var(--color-primary)' : 'var(--color-bg)',
                    color: inputMethod === 'file' ? 'white' : 'var(--color-text)',
                  }}
                >
                  📁 Upload File
                </button>
                <button
                  onClick={() => {
                    setInputMethod('url')
                    setError(null)
                  }}
                  className="flex-1 py-2 px-4 rounded text-sm font-medium transition-colors"
                  style={{
                    background: inputMethod === 'url' ? 'var(--color-primary)' : 'var(--color-bg)',
                    color: inputMethod === 'url' ? 'white' : 'var(--color-text)',
                  }}
                >
                  🌐 Image URL
                </button>
              </div>

              {/* File upload */}
              {inputMethod === 'file' && (
                <button
                  onClick={handleFileSelect}
                  className="w-full py-8 border-2 border-dashed rounded hover:border-primary transition-colors"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                >
                  <div className="text-4xl mb-2">🖼️</div>
                  <div className="font-medium">Click to select image</div>
                  <div className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
                    PNG, JPG, WEBP, GIF, SVG supported
                  </div>
                </button>
              )}

              {/* URL input */}
              {inputMethod === 'url' && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                    Image URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://example.com/wallpaper.jpg"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleUrlSubmit(urlInput)
                      }
                    }}
                    className="w-full"
                  />
                  <div className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
                    Press Enter to apply • Use direct image links
                  </div>
                </div>
              )}

              {/* Fit options */}
              <div className="space-y-2">
                <label className="block text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                  Background Fit
                </label>
                <Select
                  value={wallpaper.customFit}
                  onChange={(val) => setWallpaper({ customFit: val as any })}
                  options={[
                    { value: 'cover', label: 'Cover (Fill entire screen)' },
                    { value: 'contain', label: 'Contain (Fit entire image)' },
                    { value: 'fill', label: 'Fill (Stretch to fit)' },
                    { value: 'tile', label: 'Tile (Repeat pattern)' },
                  ]}
                />
              </div>

              {/* Preview */}
              {wallpaper.customPath && (
                <div className="space-y-2">
                  <div className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                    Preview
                  </div>
                  <div
                    className="w-full h-32 rounded"
                    style={{
                      backgroundImage: `url(${wallpaper.customPath})`,
                      backgroundSize: wallpaper.customFit,
                      backgroundPosition: 'center',
                      backgroundRepeat: wallpaper.customFit === 'tile' ? 'repeat' : 'no-repeat',
                      border: '1px solid var(--color-border)',
                    }}
                  />
                  <button
                    onClick={() => setWallpaper({ type: 'theme', customPath: null })}
                    className="text-xs hover:underline"
                    style={{ color: 'var(--color-error)' }}
                  >
                    Remove wallpaper
                  </button>
                </div>
              )}

              {/* Error message */}
              {error && (
                <div
                  className="p-2 rounded text-sm"
                  style={{
                    background: 'var(--color-error)/10',
                    color: 'var(--color-error)',
                    border: '1px solid var(--color-error)/30',
                  }}
                >
                  ⚠️ {error}
                </div>
              )}
            </div>
          )}
        </div>
      </SettingsCard>
    </div>
  )
}

function TypographySection() {
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

function GraphicsSection() {
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

function AudioSection() {
  const { audio, setAudio } = useSettingsStore()

  return (
    <div className="space-y-6">
      <VolumeControl
        label="Master Volume"
        description="Overall audio level"
        volume={audio.masterVolume}
        muted={audio.masterMuted}
        onVolumeChange={(v) => setAudio({ masterVolume: v })}
        onMuteToggle={() => setAudio({ masterMuted: !audio.masterMuted })}
      />

      <VolumeControl
        label="Music Volume"
        description="Background music level"
        volume={audio.musicVolume}
        muted={audio.musicMuted}
        onVolumeChange={(v) => setAudio({ musicVolume: v })}
        onMuteToggle={() => setAudio({ musicMuted: !audio.musicMuted })}
        disabled={audio.masterMuted}
      />

      <VolumeControl
        label="Sound Effects Volume"
        description="UI sounds and effects"
        volume={audio.sfxVolume}
        muted={audio.sfxMuted}
        onVolumeChange={(v) => setAudio({ sfxVolume: v })}
        onMuteToggle={() => setAudio({ sfxMuted: !audio.sfxMuted })}
        disabled={audio.masterMuted}
      />

      <div className="flex justify-end">
        <button
          onClick={() => {
            setAudio({
              masterVolume: 80,
              musicVolume: 70,
              sfxVolume: 60,
              masterMuted: false,
              musicMuted: false,
              sfxMuted: false,
            })
          }}
          className="px-4 py-2 rounded text-sm font-medium transition-colors"
          style={{
            background: 'var(--color-bgTertiary)',
            color: 'var(--color-text)',
            border: '1px solid var(--color-border)',
          }}
        >
          Reset to Defaults
        </button>
      </div>

      <div
        className="p-4 rounded"
        style={{
          background: 'var(--color-info)/10',
          border: '1px solid var(--color-info)/30',
        }}
      >
        <p className="text-sm" style={{ color: 'var(--color-info)' }}>
          ℹ️ Audio settings will apply to future game sounds. No audio is currently playing.
        </p>
      </div>
    </div>
  )
}

function AccessibilitySection() {
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

function DeveloperSection() {
  const { reset } = useOnboardingStore()
  const {
    isRunning,
    isPaused,
    speedMultiplier,
    totalTicksProcessed,
    start,
    stop,
    pause,
    resume,
    tick,
    setSpeed,
    getGameTimeFormatted,
  } = useSimulationStore()

  const handleResetOnboarding = () => {
    if (confirm('Reset onboarding? This will reload the page.')) {
      reset()
      window.location.reload()
    }
  }

  const speedOptions = [0.5, 1, 2, 4, 8]

  return (
    <div className="space-y-6">
      {/* Simulation Controls */}
      <SettingsCard
        title="Simulation Controls"
        description="Control the game simulation that drives NPC behavior"
      >
        <div className="space-y-4">
          {/* Status Display */}
          <div
            className="p-4 rounded flex items-center justify-between"
            style={{
              background: 'var(--color-bg)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  background: isRunning
                    ? isPaused
                      ? 'var(--color-warning)'
                      : 'var(--color-success)'
                    : 'var(--color-textMuted)',
                }}
              />
              <div>
                <div className="font-medium" style={{ color: 'var(--color-text)' }}>
                  {isRunning ? (isPaused ? 'Paused' : 'Running') : 'Stopped'}
                </div>
                <div className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
                  {getGameTimeFormatted()}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-mono" style={{ color: 'var(--color-text)' }}>
                {speedMultiplier}x speed
              </div>
              <div className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
                {totalTicksProcessed} ticks
              </div>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex gap-2">
            {!isRunning ? (
              <button
                onClick={start}
                className="flex-1 px-4 py-2 rounded text-sm font-medium transition-colors text-white"
                style={{ background: 'var(--color-success)' }}
              >
                Start Simulation
              </button>
            ) : (
              <>
                {isPaused ? (
                  <button
                    onClick={resume}
                    className="flex-1 px-4 py-2 rounded text-sm font-medium transition-colors text-white"
                    style={{ background: 'var(--color-success)' }}
                  >
                    Resume
                  </button>
                ) : (
                  <button
                    onClick={pause}
                    className="flex-1 px-4 py-2 rounded text-sm font-medium transition-colors text-white"
                    style={{ background: 'var(--color-warning)' }}
                  >
                    Pause
                  </button>
                )}
                <button
                  onClick={stop}
                  className="flex-1 px-4 py-2 rounded text-sm font-medium transition-colors text-white"
                  style={{ background: 'var(--color-error)' }}
                >
                  Stop
                </button>
              </>
            )}
          </div>

          {/* Speed Control */}
          <div className="space-y-2">
            <label className="block text-sm font-medium" style={{ color: 'var(--color-text)' }}>
              Simulation Speed
            </label>
            <div className="flex gap-2">
              {speedOptions.map((speed) => (
                <button
                  key={speed}
                  onClick={() => setSpeed(speed)}
                  className="flex-1 px-3 py-2 rounded text-sm font-medium transition-colors"
                  style={{
                    background: speedMultiplier === speed ? 'var(--color-primary)' : 'var(--color-bg)',
                    color: speedMultiplier === speed ? 'white' : 'var(--color-text)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  {speed}x
                </button>
              ))}
            </div>
            <div className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
              At 1x: 1 real second = 15 in-game minutes (~4 real minutes = 1 in-game day)
            </div>
          </div>

          {/* Manual Tick Button */}
          <div className="pt-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
            <button
              onClick={tick}
              className="px-4 py-2 rounded text-sm font-medium transition-colors"
              style={{
                background: 'var(--color-bgTertiary)',
                color: 'var(--color-text)',
                border: '1px solid var(--color-border)',
              }}
            >
              Manual Tick (Debug)
            </button>
            <div className="text-xs mt-1" style={{ color: 'var(--color-textMuted)' }}>
              Advances game time by 15 minutes and triggers all systems
            </div>
          </div>
        </div>
      </SettingsCard>

      {/* Other Developer Options */}
      <SettingsCard
        title="Developer Options"
        description="Testing and debugging tools"
      >
        <button
          onClick={handleResetOnboarding}
          className="px-4 py-2 rounded text-sm font-medium transition-colors text-white"
          style={{
            background: 'var(--color-error)',
          }}
        >
          Reset Onboarding
        </button>
      </SettingsCard>
    </div>
  )
}

// Main Settings Window Component
export function SettingsWindow() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('display')

  const navItems = [
    { id: 'display' as const, label: 'Display', icon: '🖥️' },
    { id: 'theme' as const, label: 'Theme', icon: '🎨' },
    { id: 'wallpaper' as const, label: 'Wallpaper', icon: '🖼️' },
    { id: 'typography' as const, label: 'Typography', icon: '✏️' },
    { id: 'graphics' as const, label: 'Graphics', icon: '✨' },
    { id: 'audio' as const, label: 'Audio', icon: '🔊' },
    { id: 'accessibility' as const, label: 'Accessibility', icon: '♿' },
    { id: 'developer' as const, label: 'Developer', icon: '🛠️' },
  ]

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
              {activeTab === 'display' && <DisplaySection />}
              {activeTab === 'theme' && <ThemeSection />}
              {activeTab === 'wallpaper' && <WallpaperSection />}
              {activeTab === 'typography' && <TypographySection />}
              {activeTab === 'graphics' && <GraphicsSection />}
              {activeTab === 'audio' && <AudioSection />}
              {activeTab === 'accessibility' && <AccessibilitySection />}
              {activeTab === 'developer' && <DeveloperSection />}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
