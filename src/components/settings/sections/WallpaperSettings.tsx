import { useState } from 'react'
import { useSettingsStore } from '../../../stores/settingsStore.js'
import { Select } from '../../ui/Select.js'
import { open } from '@tauri-apps/plugin-dialog'
import { convertFileSrc } from '@tauri-apps/api/core'
import { SettingsCard } from '../components/SettingsCard.js'

export default function WallpaperSettings() {
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
