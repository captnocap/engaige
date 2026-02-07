/**
 * CobSnip - Snipping Tool
 *
 * Screen capture tool with region selection.
 * Uses html2canvas-style canvas capture.
 */

import { useState, useRef, useCallback, useEffect } from 'react'

type SnipMode = 'idle' | 'selecting' | 'preview'

interface Selection {
  startX: number
  startY: number
  endX: number
  endY: number
}

export function CobSnip() {
  const [mode, setMode] = useState<SnipMode>('idle')
  const [selection, setSelection] = useState<Selection | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [snipHistory, setSnipHistory] = useState<string[]>([])
  const overlayRef = useRef<HTMLDivElement>(null)

  const startSnip = useCallback(() => {
    setMode('selecting')
    setSelection(null)
    setPreviewUrl(null)
  }, [])

  const handleOverlayMouseDown = useCallback((e: React.MouseEvent) => {
    if (mode !== 'selecting') return
    setSelection({
      startX: e.clientX,
      startY: e.clientY,
      endX: e.clientX,
      endY: e.clientY,
    })
  }, [mode])

  const handleOverlayMouseMove = useCallback((e: React.MouseEvent) => {
    if (mode !== 'selecting' || !selection) return
    setSelection(prev => prev ? { ...prev, endX: e.clientX, endY: e.clientY } : null)
  }, [mode, selection])

  const handleOverlayMouseUp = useCallback(async () => {
    if (mode !== 'selecting' || !selection) return

    const x = Math.min(selection.startX, selection.endX)
    const y = Math.min(selection.startY, selection.endY)
    const w = Math.abs(selection.endX - selection.startX)
    const h = Math.abs(selection.endY - selection.startY)

    if (w < 10 || h < 10) {
      setMode('idle')
      setSelection(null)
      return
    }

    // Capture the selected region from the screen
    setMode('idle')

    try {
      // Create a canvas to capture the region
      const canvas = document.createElement('canvas')
      canvas.width = w * window.devicePixelRatio
      canvas.height = h * window.devicePixelRatio
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // Use the document body to render
      // We'll use a simpler approach: capture from existing render
      // @ts-ignore - html2canvas is an optional dependency
      const html2canvasModule = await import('html2canvas')
      const html2canvas = html2canvasModule.default
      const fullCapture = await html2canvas(document.body, {
        x, y, width: w, height: h,
        scale: window.devicePixelRatio,
        useCORS: true,
        logging: false,
      })

      const dataUrl = fullCapture.toDataURL('image/png')
      setPreviewUrl(dataUrl)
      setSnipHistory(prev => [dataUrl, ...prev.slice(0, 9)])
      setMode('preview')
    } catch {
      // html2canvas may not be available - fallback to a colored placeholder
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')!
      ctx.fillStyle = '#1a1a1a'
      ctx.fillRect(0, 0, w, h)
      ctx.fillStyle = '#00ff88'
      ctx.font = '14px monospace'
      ctx.fillText(`Snip: ${w}x${h}px`, 10, 25)
      ctx.fillStyle = '#888'
      ctx.font = '11px monospace'
      ctx.fillText('(Install html2canvas for real captures)', 10, 45)

      const dataUrl = canvas.toDataURL('image/png')
      setPreviewUrl(dataUrl)
      setSnipHistory(prev => [dataUrl, ...prev.slice(0, 9)])
      setMode('preview')
    }

    setSelection(null)
  }, [mode, selection])

  const handleSave = useCallback(() => {
    if (!previewUrl) return
    const link = document.createElement('a')
    link.download = `cobsnip-${Date.now()}.png`
    link.href = previewUrl
    link.click()
  }, [previewUrl])

  const handleCopy = useCallback(async () => {
    if (!previewUrl) return
    try {
      const response = await fetch(previewUrl)
      const blob = await response.blob()
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
    } catch {
      // Clipboard API may not be available
    }
  }, [previewUrl])

  // ESC to cancel
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mode === 'selecting') {
        setMode('idle')
        setSelection(null)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [mode])

  // Selection rectangle
  const selRect = selection ? {
    left: Math.min(selection.startX, selection.endX),
    top: Math.min(selection.startY, selection.endY),
    width: Math.abs(selection.endX - selection.startX),
    height: Math.abs(selection.endY - selection.startY),
  } : null

  return (
    <>
      {/* Main toolbar window */}
      <div className="flex flex-col h-full bg-[var(--color-bg)]">
        <div className="p-4 flex flex-col items-center gap-4">
          <div className="text-4xl">✂️</div>
          <button
            onClick={startSnip}
            className="px-6 py-2.5 bg-[#00ff88] text-[#0a0a0a] rounded-lg font-medium hover:bg-[#00dd77] text-sm"
          >
            New Snip
          </button>
          <div className="text-xs text-[var(--color-textSecondary)] text-center">
            Click and drag to select a region of the screen
          </div>
        </div>

        {/* Preview */}
        {mode === 'preview' && previewUrl && (
          <div className="flex-1 flex flex-col border-t border-[var(--color-border)] p-3 min-h-0">
            <div className="flex-1 overflow-auto bg-[#111] rounded-lg border border-[var(--color-border)] flex items-center justify-center p-2">
              <img src={previewUrl} alt="Snip" className="max-w-full max-h-full object-contain" />
            </div>
            <div className="flex gap-2 mt-2 justify-center">
              <button onClick={handleSave}
                className="px-4 py-1.5 text-sm bg-[var(--color-bgSecondary)] border border-[var(--color-border)] rounded hover:bg-[var(--color-border)]">
                Save
              </button>
              <button onClick={handleCopy}
                className="px-4 py-1.5 text-sm bg-[var(--color-bgSecondary)] border border-[var(--color-border)] rounded hover:bg-[var(--color-border)]">
                Copy
              </button>
              <button onClick={startSnip}
                className="px-4 py-1.5 text-sm bg-[var(--color-bgSecondary)] border border-[var(--color-border)] rounded hover:bg-[var(--color-border)]">
                New
              </button>
            </div>
          </div>
        )}

        {/* History */}
        {snipHistory.length > 0 && mode !== 'preview' && (
          <div className="border-t border-[var(--color-border)] p-3">
            <div className="text-xs text-[var(--color-textSecondary)] mb-2">Recent Snips</div>
            <div className="flex gap-1 flex-wrap">
              {snipHistory.map((url, i) => (
                <button
                  key={i}
                  onClick={() => { setPreviewUrl(url); setMode('preview') }}
                  className="w-12 h-12 rounded border border-[var(--color-border)] overflow-hidden hover:border-[#00ff88]"
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Full-screen overlay for selection */}
      {mode === 'selecting' && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-[9999] cursor-crosshair"
          style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
          onMouseDown={handleOverlayMouseDown}
          onMouseMove={handleOverlayMouseMove}
          onMouseUp={handleOverlayMouseUp}
        >
          {selRect && selRect.width > 0 && selRect.height > 0 && (
            <>
              {/* Clear area inside selection */}
              <div
                className="absolute border-2 border-[#00ff88]"
                style={{
                  left: selRect.left,
                  top: selRect.top,
                  width: selRect.width,
                  height: selRect.height,
                  backgroundColor: 'rgba(0,255,136,0.05)',
                }}
              />
              {/* Size label */}
              <div
                className="absolute text-xs text-[#00ff88] bg-black/70 px-2 py-0.5 rounded"
                style={{ left: selRect.left, top: selRect.top + selRect.height + 4 }}
              >
                {selRect.width} × {selRect.height}
              </div>
            </>
          )}

          {/* Instructions */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white bg-black/70 px-4 py-2 rounded-lg text-sm">
            Click and drag to select • ESC to cancel
          </div>
        </div>
      )}
    </>
  )
}
