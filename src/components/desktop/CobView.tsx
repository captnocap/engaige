/**
 * CobView - Photo Viewer
 *
 * Image gallery viewer that fetches media from the server.
 * Dark background, zoom controls, thumbnail strip.
 */

import { useState, useEffect, useCallback } from 'react'
import { useWSRequest } from '../../stores/wsStore.js'

interface MediaFile {
  id: string
  filename: string
  file_path: string
  mime_type: string
  category: string
  owner_type: string
  npc_id?: string
  created_at: string
}

export function CobView() {
  const { request, connected } = useWSRequest()
  const [images, setImages] = useState<MediaFile[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [zoom, setZoom] = useState<'fit' | 'actual' | number>('fit')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!connected) return
    setLoading(true)
    request<any, any>('media:getAll', {
      filters: { category: 'image' },
      limit: 200,
    }).then(res => {
      const files = (res?.files || []).filter((f: MediaFile) =>
        f.mime_type?.startsWith('image/') || f.filename?.match(/\.(png|jpg|jpeg|gif|webp|svg)$/i)
      )
      setImages(files)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [connected, request])

  const currentImage = images[selectedIndex]

  const navigate = useCallback((delta: number) => {
    setSelectedIndex(prev => {
      const next = prev + delta
      if (next < 0) return images.length - 1
      if (next >= images.length) return 0
      return next
    })
    setZoom('fit')
  }, [images.length])

  // Keyboard nav
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') navigate(-1)
      else if (e.key === 'ArrowRight') navigate(1)
      else if (e.key === '+' || e.key === '=') setZoom(prev => typeof prev === 'number' ? Math.min(prev + 0.25, 5) : 1.25)
      else if (e.key === '-') setZoom(prev => typeof prev === 'number' ? Math.max(prev - 0.25, 0.25) : 0.75)
      else if (e.key === '0') setZoom('fit')
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [navigate])

  const getImageSrc = (file: MediaFile) => {
    // Use the file path directly - server serves static files
    return `http://localhost:4269/media/${file.id}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-[#111]">
        <div className="text-[var(--color-textSecondary)]">Loading images...</div>
      </div>
    )
  }

  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#111] gap-3">
        <span className="text-4xl">🖼️</span>
        <div className="text-[var(--color-textSecondary)]">No images found</div>
        <div className="text-xs text-[var(--color-textSecondary)]">
          Images will appear here as they're created in the game
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-[#111]">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#333] bg-[#1a1a1a]">
        <div className="text-sm text-[var(--color-textSecondary)] truncate max-w-[300px]">
          {currentImage?.filename || 'No image'}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setZoom('fit')}
            className={`px-2 py-0.5 text-xs rounded ${zoom === 'fit' ? 'bg-[#333] text-white' : 'text-[#888] hover:text-white'}`}>
            Fit
          </button>
          <button onClick={() => setZoom('actual')}
            className={`px-2 py-0.5 text-xs rounded ${zoom === 'actual' ? 'bg-[#333] text-white' : 'text-[#888] hover:text-white'}`}>
            100%
          </button>
          <button onClick={() => setZoom(prev => typeof prev === 'number' ? Math.min(prev + 0.25, 5) : 1.5)}
            className="px-2 py-0.5 text-xs text-[#888] hover:text-white">+</button>
          <button onClick={() => setZoom(prev => typeof prev === 'number' ? Math.max(prev - 0.25, 0.25) : 0.75)}
            className="px-2 py-0.5 text-xs text-[#888] hover:text-white">-</button>
          <span className="text-xs text-[#666] ml-2">
            {selectedIndex + 1} / {images.length}
          </span>
        </div>
      </div>

      {/* Main image area */}
      <div className="flex-1 relative overflow-auto flex items-center justify-center">
        {/* Nav arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => navigate(-1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 z-10"
            >
              ‹
            </button>
            <button
              onClick={() => navigate(1)}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 z-10"
            >
              ›
            </button>
          </>
        )}

        {currentImage && (
          <img
            src={getImageSrc(currentImage)}
            alt={currentImage.filename}
            className="max-h-full"
            style={{
              ...(zoom === 'fit' ? { maxWidth: '100%', objectFit: 'contain' } : {}),
              ...(zoom === 'actual' ? { maxWidth: 'none', maxHeight: 'none' } : {}),
              ...(typeof zoom === 'number' ? { transform: `scale(${zoom})`, transformOrigin: 'center' } : {}),
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><text x="50%" y="50%" text-anchor="middle" dy="0.3em" font-size="48">🖼️</text></svg>'
            }}
          />
        )}
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="flex gap-1 px-2 py-2 border-t border-[#333] bg-[#1a1a1a] overflow-x-auto">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => { setSelectedIndex(i); setZoom('fit') }}
              className={`flex-shrink-0 w-14 h-14 rounded overflow-hidden border-2 transition-colors ${
                i === selectedIndex ? 'border-[#00ff88]' : 'border-transparent hover:border-[#555]'
              }`}
            >
              <img
                src={getImageSrc(img)}
                alt=""
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none'
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
