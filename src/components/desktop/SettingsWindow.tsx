import { useState, useEffect } from 'react'
import { useDisplayStore } from '../../stores/displayStore.js'
import { useSettingsStore, applyTypographySettings } from '../../stores/settingsStore.js'
import { useThemeStore, themes } from '../../stores/themeStore.js'
import { useOnboardingStore } from '../../stores/onboardingStore.js'
import { useSimulationStore } from '../../stores/simulationStore.js'
import { useAIProviders, useImageGenProviders, useVisionProxy, type AIProvider, type ImageGenProvider, type VisionProxyConfig } from '../../stores/aiProviderStore.js'
import { useWSConnection } from '../../stores/wsStore.js'
import { Select } from '../ui/Select.js'
import { open } from '@tauri-apps/plugin-dialog'
import { convertFileSrc } from '@tauri-apps/api/core'

type SettingsTab = 'display' | 'theme' | 'wallpaper' | 'typography' | 'graphics' | 'audio' | 'accessibility' | 'ai-providers' | 'developer'

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

function VisionProxySection() {
  const { connected } = useWSConnection()
  const { config, loading, fetchConfig, updateConfig } = useVisionProxy()
  const [localConfig, setLocalConfig] = useState<Partial<VisionProxyConfig>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (connected) {
      fetchConfig()
    }
  }, [connected])

  useEffect(() => {
    if (config) {
      setLocalConfig(config)
    }
  }, [config])

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateConfig(localConfig)
    } finally {
      setSaving(false)
    }
  }

  if (!connected) {
    return null
  }

  return (
    <SettingsCard title="Vision Proxy" description="Configure the model used to analyze images for NPCs that don't have native vision support">
      {loading ? (
        <div className="text-center py-4" style={{ color: 'var(--color-textMuted)' }}>Loading...</div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>
              Provider
            </label>
            <Select
              value={localConfig.provider || 'openai'}
              onChange={(val) => setLocalConfig({ ...localConfig, provider: val as any })}
              options={[
                { value: 'openai', label: 'OpenAI' },
                { value: 'openai-compatible', label: 'OpenAI Compatible' },
                { value: 'anthropic', label: 'Anthropic' },
              ]}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>
              Model
            </label>
            <input
              type="text"
              value={localConfig.model || ''}
              onChange={(e) => setLocalConfig({ ...localConfig, model: e.target.value })}
              placeholder="gpt-4o-mini"
              className="w-full px-3 py-2 rounded"
              style={{
                background: 'var(--color-bgSecondary)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text)',
              }}
            />
            <div className="text-xs mt-1" style={{ color: 'var(--color-textMuted)' }}>
              Must be a vision-capable model (e.g., gpt-4o-mini, gpt-4o, claude-sonnet-4-20250514)
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>
              API Key
            </label>
            <input
              type="password"
              value={localConfig.apiKey || ''}
              onChange={(e) => setLocalConfig({ ...localConfig, apiKey: e.target.value })}
              placeholder="Enter API key"
              className="w-full px-3 py-2 rounded"
              style={{
                background: 'var(--color-bgSecondary)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text)',
              }}
            />
          </div>
          {(localConfig.provider === 'openai-compatible') && (
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>
                Base URL
              </label>
              <input
                type="text"
                value={localConfig.baseUrl || ''}
                onChange={(e) => setLocalConfig({ ...localConfig, baseUrl: e.target.value })}
                placeholder="https://api.openai.com/v1"
                className="w-full px-3 py-2 rounded"
                style={{
                  background: 'var(--color-bgSecondary)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text)',
                }}
              />
            </div>
          )}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 rounded text-sm text-white"
              style={{ background: 'var(--color-primary)' }}
            >
              {saving ? 'Saving...' : 'Save Vision Proxy Config'}
            </button>
          </div>
          <div
            className="p-3 rounded text-sm"
            style={{
              background: 'var(--color-info)/10',
              border: '1px solid var(--color-info)/30',
              color: 'var(--color-info)',
            }}
          >
            When a user sends an image to an NPC whose model doesn't support vision, this proxy model will analyze the image and provide a description to the NPC.
          </div>
        </div>
      )}
    </SettingsCard>
  )
}

function AIProvidersSection() {
  const { connected } = useWSConnection()
  const {
    providers: aiProviders,
    activeProvider: activeAIProvider,
    loading: aiLoading,
    error: aiError,
    fetchProviders: fetchAIProviders,
    fetchActive: fetchActiveAI,
    setActive: setActiveAI,
    test: testAI,
    update: updateAI,
  } = useAIProviders()

  const {
    providers: imageGenProviders,
    activeProvider: activeImageGenProvider,
    loading: imageGenLoading,
    error: imageGenError,
    fetchProviders: fetchImageGenProviders,
    fetchActive: fetchActiveImageGen,
    setActive: setActiveImageGen,
    test: testImageGen,
    update: updateImageGen,
    create: createImageGen,
  } = useImageGenProviders()

  const [testingProvider, setTestingProvider] = useState<string | null>(null)
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; latency_ms?: number; error?: string }>>({})
  const [editingProvider, setEditingProvider] = useState<AIProvider | ImageGenProvider | null>(null)
  const [editingType, setEditingType] = useState<'ai' | 'imageGen' | null>(null)
  const [showAddImageGen, setShowAddImageGen] = useState(false)

  // New image gen provider form state
  const [newImageGen, setNewImageGen] = useState({
    name: '',
    display_name: '',
    base_url: '',
    api_key: '',
    default_payload: '{\n  "model": "your-model-name",\n  "n": 1\n}',
    prompt_key: 'prompt',
    reference_images_key: '',
    response_path: 'data.0.url',
    cost_per_image: 5,
  })

  // Load providers on mount
  useEffect(() => {
    if (connected) {
      fetchAIProviders()
      fetchActiveAI()
      fetchImageGenProviders()
      fetchActiveImageGen()
    }
  }, [connected])

  const handleTest = async (type: 'ai' | 'imageGen', name: string) => {
    setTestingProvider(`${type}:${name}`)
    try {
      const result = type === 'ai' ? await testAI(name) : await testImageGen(name)
      setTestResults((prev) => ({ ...prev, [`${type}:${name}`]: result }))
    } catch (err: any) {
      setTestResults((prev) => ({ ...prev, [`${type}:${name}`]: { success: false, error: err.message } }))
    } finally {
      setTestingProvider(null)
    }
  }

  const handleSaveEdit = async () => {
    if (!editingProvider || !editingType) return

    try {
      if (editingType === 'ai') {
        await updateAI(editingProvider as AIProvider)
      } else {
        await updateImageGen(editingProvider as ImageGenProvider)
      }
      setEditingProvider(null)
      setEditingType(null)
    } catch (err: any) {
      alert(`Failed to save: ${err.message}`)
    }
  }

  const handleCreateImageGen = async () => {
    try {
      let parsedPayload: Record<string, any>
      try {
        parsedPayload = JSON.parse(newImageGen.default_payload)
      } catch {
        alert('Invalid JSON in payload')
        return
      }

      await createImageGen({
        name: newImageGen.name,
        display_name: newImageGen.display_name,
        base_url: newImageGen.base_url,
        api_key: newImageGen.api_key || undefined,
        default_payload: parsedPayload,
        prompt_key: newImageGen.prompt_key,
        reference_images_key: newImageGen.reference_images_key || undefined,
        response_path: newImageGen.response_path,
        cost_per_image: newImageGen.cost_per_image,
      })

      setShowAddImageGen(false)
      setNewImageGen({
        name: '',
        display_name: '',
        base_url: '',
        api_key: '',
        default_payload: '{\n  "model": "your-model-name",\n  "n": 1\n}',
        prompt_key: 'prompt',
        reference_images_key: '',
        response_path: 'data.0.url',
        cost_per_image: 5,
      })
    } catch (err: any) {
      alert(`Failed to create: ${err.message}`)
    }
  }

  if (!connected) {
    return (
      <div className="space-y-6">
        <SettingsCard title="AI Providers" description="Not connected to server">
          <div className="text-center py-8" style={{ color: 'var(--color-textMuted)' }}>
            Connect to the server to manage AI providers
          </div>
        </SettingsCard>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* AI Text Providers */}
      <SettingsCard title="AI Text Providers" description="Configure providers for NPC conversations and text generation">
        {aiLoading ? (
          <div className="text-center py-4" style={{ color: 'var(--color-textMuted)' }}>Loading...</div>
        ) : aiError ? (
          <div className="text-center py-4" style={{ color: 'var(--color-error)' }}>{aiError}</div>
        ) : (
          <div className="space-y-3">
            {aiProviders.map((provider) => (
              <div
                key={provider.id}
                className="p-4 rounded flex items-center justify-between"
                style={{
                  background: provider.is_active ? 'var(--color-primary)/10' : 'var(--color-bg)',
                  border: provider.is_active ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      background: provider.is_active ? 'var(--color-success)' : 'var(--color-textMuted)',
                    }}
                  />
                  <div>
                    <div className="font-medium" style={{ color: 'var(--color-text)' }}>
                      {provider.display_name}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
                      {provider.provider_type} • {provider.default_model}
                      {provider.api_key ? ' • Key set' : ' • No key'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {testResults[`ai:${provider.name}`] && (
                    <span
                      className="text-xs px-2 py-1 rounded"
                      style={{
                        background: testResults[`ai:${provider.name}`].success
                          ? 'var(--color-success)/20'
                          : 'var(--color-error)/20',
                        color: testResults[`ai:${provider.name}`].success
                          ? 'var(--color-success)'
                          : 'var(--color-error)',
                      }}
                    >
                      {testResults[`ai:${provider.name}`].success
                        ? `${testResults[`ai:${provider.name}`].latency_ms}ms`
                        : 'Failed'}
                    </span>
                  )}
                  <button
                    onClick={() => handleTest('ai', provider.name)}
                    disabled={testingProvider === `ai:${provider.name}`}
                    className="px-3 py-1 text-xs rounded"
                    style={{
                      background: 'var(--color-bgTertiary)',
                      color: 'var(--color-text)',
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    {testingProvider === `ai:${provider.name}` ? '...' : 'Test'}
                  </button>
                  <button
                    onClick={() => {
                      setEditingProvider(provider)
                      setEditingType('ai')
                    }}
                    className="px-3 py-1 text-xs rounded"
                    style={{
                      background: 'var(--color-bgTertiary)',
                      color: 'var(--color-text)',
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    Edit
                  </button>
                  {!provider.is_active && (
                    <button
                      onClick={() => setActiveAI(provider.name)}
                      className="px-3 py-1 text-xs rounded text-white"
                      style={{ background: 'var(--color-primary)' }}
                    >
                      Set Active
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </SettingsCard>

      {/* Image Generation Providers */}
      <SettingsCard title="Image Generation Providers" description="Configure providers for NPC image generation">
        {imageGenLoading ? (
          <div className="text-center py-4" style={{ color: 'var(--color-textMuted)' }}>Loading...</div>
        ) : imageGenError ? (
          <div className="text-center py-4" style={{ color: 'var(--color-error)' }}>{imageGenError}</div>
        ) : (
          <div className="space-y-3">
            {imageGenProviders.map((provider) => (
              <div
                key={provider.id}
                className="p-4 rounded flex items-center justify-between"
                style={{
                  background: provider.is_active ? 'var(--color-primary)/10' : 'var(--color-bg)',
                  border: provider.is_active ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      background: provider.is_active ? 'var(--color-success)' : 'var(--color-textMuted)',
                    }}
                  />
                  <div>
                    <div className="font-medium" style={{ color: 'var(--color-text)' }}>
                      {provider.display_name}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
                      ${(provider.cost_per_image / 100).toFixed(2)}/image
                      {provider.api_key ? ' • Key set' : ' • No key'}
                      {provider.reference_images_key ? ' • img2img' : ''}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {testResults[`imageGen:${provider.name}`] && (
                    <span
                      className="text-xs px-2 py-1 rounded"
                      style={{
                        background: testResults[`imageGen:${provider.name}`].success
                          ? 'var(--color-success)/20'
                          : 'var(--color-error)/20',
                        color: testResults[`imageGen:${provider.name}`].success
                          ? 'var(--color-success)'
                          : 'var(--color-error)',
                      }}
                    >
                      {testResults[`imageGen:${provider.name}`].success
                        ? `${testResults[`imageGen:${provider.name}`].latency_ms}ms`
                        : 'Failed'}
                    </span>
                  )}
                  <button
                    onClick={() => handleTest('imageGen', provider.name)}
                    disabled={testingProvider === `imageGen:${provider.name}`}
                    className="px-3 py-1 text-xs rounded"
                    style={{
                      background: 'var(--color-bgTertiary)',
                      color: 'var(--color-text)',
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    {testingProvider === `imageGen:${provider.name}` ? '...' : 'Test'}
                  </button>
                  <button
                    onClick={() => {
                      setEditingProvider(provider)
                      setEditingType('imageGen')
                    }}
                    className="px-3 py-1 text-xs rounded"
                    style={{
                      background: 'var(--color-bgTertiary)',
                      color: 'var(--color-text)',
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    Edit
                  </button>
                  {!provider.is_active && (
                    <button
                      onClick={() => setActiveImageGen(provider.name)}
                      className="px-3 py-1 text-xs rounded text-white"
                      style={{ background: 'var(--color-primary)' }}
                    >
                      Set Active
                    </button>
                  )}
                </div>
              </div>
            ))}

            <button
              onClick={() => setShowAddImageGen(true)}
              className="w-full py-3 rounded text-sm font-medium transition-colors"
              style={{
                background: 'var(--color-bgTertiary)',
                color: 'var(--color-primary)',
                border: '1px dashed var(--color-border)',
              }}
            >
              + Add Image Generation Provider
            </button>
          </div>
        )}
      </SettingsCard>

      {/* Vision Proxy Configuration */}
      <VisionProxySection />

      {/* Edit Modal for AI Provider */}
      {editingProvider && editingType === 'ai' && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setEditingProvider(null)}
        >
          <div
            className="p-6 rounded-lg w-full max-w-md"
            style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
              Edit {(editingProvider as AIProvider).display_name}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>
                  API Key
                </label>
                <input
                  type="password"
                  value={(editingProvider as AIProvider).api_key || ''}
                  onChange={(e) =>
                    setEditingProvider({ ...editingProvider, api_key: e.target.value } as AIProvider)
                  }
                  placeholder="Enter API key"
                  className="w-full px-3 py-2 rounded"
                  style={{
                    background: 'var(--color-bgSecondary)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text)',
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>
                  Base URL
                </label>
                <input
                  type="text"
                  value={(editingProvider as AIProvider).base_url || ''}
                  onChange={(e) =>
                    setEditingProvider({ ...editingProvider, base_url: e.target.value } as AIProvider)
                  }
                  placeholder="https://api.openai.com/v1"
                  className="w-full px-3 py-2 rounded"
                  style={{
                    background: 'var(--color-bgSecondary)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text)',
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>
                  Default Model
                </label>
                <input
                  type="text"
                  value={(editingProvider as AIProvider).default_model}
                  onChange={(e) =>
                    setEditingProvider({ ...editingProvider, default_model: e.target.value } as AIProvider)
                  }
                  placeholder="gpt-4o"
                  className="w-full px-3 py-2 rounded"
                  style={{
                    background: 'var(--color-bgSecondary)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text)',
                  }}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setEditingProvider(null)}
                className="px-4 py-2 rounded text-sm"
                style={{
                  background: 'var(--color-bgTertiary)',
                  color: 'var(--color-text)',
                  border: '1px solid var(--color-border)',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 rounded text-sm text-white"
                style={{ background: 'var(--color-primary)' }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal for Image Gen Provider */}
      {editingProvider && editingType === 'imageGen' && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setEditingProvider(null)}
        >
          <div
            className="p-6 rounded-lg w-full max-w-lg max-h-[80vh] overflow-y-auto"
            style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
              Edit {(editingProvider as ImageGenProvider).display_name}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>
                  API Key
                </label>
                <input
                  type="password"
                  value={(editingProvider as ImageGenProvider).api_key || ''}
                  onChange={(e) =>
                    setEditingProvider({ ...editingProvider, api_key: e.target.value } as ImageGenProvider)
                  }
                  placeholder="Enter API key"
                  className="w-full px-3 py-2 rounded"
                  style={{
                    background: 'var(--color-bgSecondary)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text)',
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>
                  Base URL
                </label>
                <input
                  type="text"
                  value={(editingProvider as ImageGenProvider).base_url}
                  onChange={(e) =>
                    setEditingProvider({ ...editingProvider, base_url: e.target.value } as ImageGenProvider)
                  }
                  className="w-full px-3 py-2 rounded"
                  style={{
                    background: 'var(--color-bgSecondary)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text)',
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>
                  Default Payload (JSON)
                </label>
                <textarea
                  value={JSON.stringify((editingProvider as ImageGenProvider).default_payload, null, 2)}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value)
                      setEditingProvider({ ...editingProvider, default_payload: parsed } as ImageGenProvider)
                    } catch {
                      // Invalid JSON, don't update
                    }
                  }}
                  rows={6}
                  className="w-full px-3 py-2 rounded font-mono text-sm"
                  style={{
                    background: 'var(--color-bgSecondary)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text)',
                  }}
                />
                <div className="text-xs mt-1" style={{ color: 'var(--color-textMuted)' }}>
                  All settings baked in. Prompt will be injected at runtime.
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>
                    Prompt Key
                  </label>
                  <input
                    type="text"
                    value={(editingProvider as ImageGenProvider).prompt_key}
                    onChange={(e) =>
                      setEditingProvider({ ...editingProvider, prompt_key: e.target.value } as ImageGenProvider)
                    }
                    className="w-full px-3 py-2 rounded"
                    style={{
                      background: 'var(--color-bgSecondary)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text)',
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>
                    Reference Images Key
                  </label>
                  <input
                    type="text"
                    value={(editingProvider as ImageGenProvider).reference_images_key || ''}
                    onChange={(e) =>
                      setEditingProvider({
                        ...editingProvider,
                        reference_images_key: e.target.value || undefined,
                      } as ImageGenProvider)
                    }
                    placeholder="imageDataUrls (optional)"
                    className="w-full px-3 py-2 rounded"
                    style={{
                      background: 'var(--color-bgSecondary)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text)',
                    }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>
                    Response Path
                  </label>
                  <input
                    type="text"
                    value={(editingProvider as ImageGenProvider).response_path}
                    onChange={(e) =>
                      setEditingProvider({ ...editingProvider, response_path: e.target.value } as ImageGenProvider)
                    }
                    placeholder="data.0.url"
                    className="w-full px-3 py-2 rounded"
                    style={{
                      background: 'var(--color-bgSecondary)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text)',
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>
                    Cost per Image (cents)
                  </label>
                  <input
                    type="number"
                    value={(editingProvider as ImageGenProvider).cost_per_image}
                    onChange={(e) =>
                      setEditingProvider({
                        ...editingProvider,
                        cost_per_image: parseFloat(e.target.value) || 0,
                      } as ImageGenProvider)
                    }
                    className="w-full px-3 py-2 rounded"
                    style={{
                      background: 'var(--color-bgSecondary)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text)',
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setEditingProvider(null)}
                className="px-4 py-2 rounded text-sm"
                style={{
                  background: 'var(--color-bgTertiary)',
                  color: 'var(--color-text)',
                  border: '1px solid var(--color-border)',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 rounded text-sm text-white"
                style={{ background: 'var(--color-primary)' }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Image Gen Provider Modal */}
      {showAddImageGen && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setShowAddImageGen(false)}
        >
          <div
            className="p-6 rounded-lg w-full max-w-lg max-h-[80vh] overflow-y-auto"
            style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
              Add Image Generation Provider
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>
                    Name (ID)
                  </label>
                  <input
                    type="text"
                    value={newImageGen.name}
                    onChange={(e) => setNewImageGen({ ...newImageGen, name: e.target.value })}
                    placeholder="my-model"
                    className="w-full px-3 py-2 rounded"
                    style={{
                      background: 'var(--color-bgSecondary)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text)',
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={newImageGen.display_name}
                    onChange={(e) => setNewImageGen({ ...newImageGen, display_name: e.target.value })}
                    placeholder="My Model"
                    className="w-full px-3 py-2 rounded"
                    style={{
                      background: 'var(--color-bgSecondary)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text)',
                    }}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>
                  Base URL
                </label>
                <input
                  type="text"
                  value={newImageGen.base_url}
                  onChange={(e) => setNewImageGen({ ...newImageGen, base_url: e.target.value })}
                  placeholder="https://api.example.com/v1/images/generations"
                  className="w-full px-3 py-2 rounded"
                  style={{
                    background: 'var(--color-bgSecondary)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text)',
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>
                  API Key
                </label>
                <input
                  type="password"
                  value={newImageGen.api_key}
                  onChange={(e) => setNewImageGen({ ...newImageGen, api_key: e.target.value })}
                  placeholder="Enter API key"
                  className="w-full px-3 py-2 rounded"
                  style={{
                    background: 'var(--color-bgSecondary)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text)',
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>
                  Default Payload (JSON)
                </label>
                <textarea
                  value={newImageGen.default_payload}
                  onChange={(e) => setNewImageGen({ ...newImageGen, default_payload: e.target.value })}
                  rows={6}
                  className="w-full px-3 py-2 rounded font-mono text-sm"
                  style={{
                    background: 'var(--color-bgSecondary)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text)',
                  }}
                />
                <div className="text-xs mt-1" style={{ color: 'var(--color-textMuted)' }}>
                  Define all model settings here. Prompt injected via prompt_key.
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>
                    Prompt Key
                  </label>
                  <input
                    type="text"
                    value={newImageGen.prompt_key}
                    onChange={(e) => setNewImageGen({ ...newImageGen, prompt_key: e.target.value })}
                    className="w-full px-3 py-2 rounded"
                    style={{
                      background: 'var(--color-bgSecondary)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text)',
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>
                    Reference Images Key
                  </label>
                  <input
                    type="text"
                    value={newImageGen.reference_images_key}
                    onChange={(e) => setNewImageGen({ ...newImageGen, reference_images_key: e.target.value })}
                    placeholder="imageDataUrls (optional)"
                    className="w-full px-3 py-2 rounded"
                    style={{
                      background: 'var(--color-bgSecondary)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text)',
                    }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>
                    Response Path
                  </label>
                  <input
                    type="text"
                    value={newImageGen.response_path}
                    onChange={(e) => setNewImageGen({ ...newImageGen, response_path: e.target.value })}
                    className="w-full px-3 py-2 rounded"
                    style={{
                      background: 'var(--color-bgSecondary)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text)',
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>
                    Cost per Image (cents)
                  </label>
                  <input
                    type="number"
                    value={newImageGen.cost_per_image}
                    onChange={(e) =>
                      setNewImageGen({ ...newImageGen, cost_per_image: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 rounded"
                    style={{
                      background: 'var(--color-bgSecondary)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text)',
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowAddImageGen(false)}
                className="px-4 py-2 rounded text-sm"
                style={{
                  background: 'var(--color-bgTertiary)',
                  color: 'var(--color-text)',
                  border: '1px solid var(--color-border)',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateImageGen}
                className="px-4 py-2 rounded text-sm text-white"
                style={{ background: 'var(--color-primary)' }}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
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
    { id: 'ai-providers' as const, label: 'AI Providers', icon: '🤖' },
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
              {activeTab === 'ai-providers' && <AIProvidersSection />}
              {activeTab === 'developer' && <DeveloperSection />}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
