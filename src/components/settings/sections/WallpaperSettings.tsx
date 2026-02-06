import { useState, useRef } from 'react'
import { useSettingsStore } from '../../../stores/settingsStore.js'
import { Select } from '../../ui/Select.js'
import { SettingsCard } from '../components/SettingsCard.js'

const MAX_FILE_SIZE = 8 * 1024 * 1024 // 8 MB
const ACCEPTED_TYPES = 'image/png,image/jpeg,image/webp,image/gif,image/bmp,image/svg+xml'

export default function WallpaperSettings() {
  const { wallpaper, setWallpaper } = useSettingsStore()
  const [inputMethod, setInputMethod] = useState<'file' | 'url'>('file')
  const [urlInput, setUrlInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Reset input so re-selecting the same file triggers change
    e.target.value = ''

    if (file.size > MAX_FILE_SIZE) {
      setError(`File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max ${MAX_FILE_SIZE / 1024 / 1024} MB.`)
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setWallpaper({
        type: 'custom',
        customPath: reader.result as string,
        customSource: 'file',
      })
      setError(null)
    }
    reader.onerror = () => {
      setError('Failed to read file')
    }
    reader.readAsDataURL(file)
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
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={ACCEPTED_TYPES}
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    onClick={handleFileSelect}
                    className="w-full py-8 border-2 border-dashed rounded hover:border-primary transition-colors"
                    style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                  >
                    <div className="text-4xl mb-2">🖼️</div>
                    <div className="font-medium">Click to select image</div>
                    <div className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
                      PNG, JPG, WEBP, GIF, SVG supported (max 8 MB)
                    </div>
                  </button>
                </>
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
