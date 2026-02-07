/**
 * CobSnip - Snipping Tool
 *
 * Screen capture tool with region selection.
 * Captures a snapshot of the page before showing the overlay,
 * then crops the selected region from that snapshot.
 * Right-click context menu for copy/save/delete.
 */

import { useState, useRef, useCallback, useEffect } from 'react'
import { ContextMenu } from '../ui/ContextMenu.js'
import { useContextMenu } from '../../hooks/useContextMenu.js'
import { snipPreset } from '../../hooks/useContextMenuPresets.js'

type SnipMode = 'idle' | 'capturing' | 'selecting' | 'preview'

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
  const snapshotRef = useRef<HTMLCanvasElement | null>(null)
  const ctx = useContextMenu<number | null>()

  const startSnip = useCallback(async () => {
    setSelection(null)
    setPreviewUrl(null)
    setMode('capturing')

    // Brief delay so UI can hide the snip window before capture
    await new Promise(r => setTimeout(r, 50))

    // Take a snapshot of the current page using a canvas clone of the DOM
    try {
      const dpr = window.devicePixelRatio || 1
      const vw = window.innerWidth
      const vh = window.innerHeight

      // Try the Screen Capture API first (works in Electron/Tauri WebView)
      if (navigator.mediaDevices && 'getDisplayMedia' in navigator.mediaDevices) {
        try {
          const stream = await navigator.mediaDevices.getDisplayMedia({ video: true } as any)
          const video = document.createElement('video')
          video.srcObject = stream
          await video.play()

          const canvas = document.createElement('canvas')
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
          const ctx = canvas.getContext('2d')!
          ctx.drawImage(video, 0, 0)

          stream.getTracks().forEach(t => t.stop())
          snapshotRef.current = canvas
          setMode('selecting')
          return
        } catch {
          // User cancelled or API unavailable - fall through to fallback
        }
      }

      // Fallback: render a simple screenshot placeholder
      const canvas = document.createElement('canvas')
      canvas.width = vw * dpr
      canvas.height = vh * dpr
      const canvasCtx = canvas.getContext('2d')!
      canvasCtx.scale(dpr, dpr)

      // Draw a representation of the current viewport
      canvasCtx.fillStyle = '#111'
      canvasCtx.fillRect(0, 0, vw, vh)
      canvasCtx.fillStyle = '#00ff88'
      canvasCtx.font = 'bold 18px monospace'
      canvasCtx.fillText('CobSnip Capture', 20, 36)
      canvasCtx.fillStyle = '#888'
      canvasCtx.font = '13px monospace'
      canvasCtx.fillText(`Viewport: ${vw}x${vh} @ ${dpr}x`, 20, 60)
      canvasCtx.fillText(`${new Date().toLocaleTimeString()}`, 20, 80)

      snapshotRef.current = canvas
    } catch {
      snapshotRef.current = null
    }

    setMode('selecting')
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

  const handleOverlayMouseUp = useCallback(() => {
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

    setMode('idle')

    // Crop the selected region from the snapshot
    const dpr = window.devicePixelRatio || 1
    const canvas = document.createElement('canvas')
    canvas.width = w * dpr
    canvas.height = h * dpr
    const canvasCtx = canvas.getContext('2d')!

    if (snapshotRef.current) {
      // Scale coordinates to match snapshot resolution
      const scaleX = snapshotRef.current.width / window.innerWidth
      const scaleY = snapshotRef.current.height / window.innerHeight
      canvasCtx.drawImage(
        snapshotRef.current,
        x * scaleX, y * scaleY, w * scaleX, h * scaleY,
        0, 0, w * dpr, h * dpr,
      )
    } else {
      // No snapshot available - draw placeholder
      canvasCtx.scale(dpr, dpr)
      canvasCtx.fillStyle = '#1a1a1a'
      canvasCtx.fillRect(0, 0, w, h)
      canvasCtx.fillStyle = '#00ff88'
      canvasCtx.font = '14px monospace'
      canvasCtx.fillText(`Snip: ${w}x${h}px`, 10, 25)
    }

    const dataUrl = canvas.toDataURL('image/png')
    setPreviewUrl(dataUrl)
    setSnipHistory(prev => [dataUrl, ...prev.slice(0, 9)])
    setMode('preview')
    setSelection(null)
  }, [mode, selection])

  const handleSave = useCallback((url?: string) => {
    const target = url || previewUrl
    if (!target) return
    const link = document.createElement('a')
    link.download = `cobsnip-${Date.now()}.png`
    link.href = target
    link.click()
  }, [previewUrl])

  const handleCopy = useCallback(async (url?: string) => {
    const target = url || previewUrl
    if (!target) return
    try {
      const response = await fetch(target)
      const blob = await response.blob()
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
    } catch {
      // Clipboard API may not be available
    }
  }, [previewUrl])

  const handleDeleteFromHistory = useCallback((index: number) => {
    setSnipHistory(prev => prev.filter((_, i) => i !== index))
    if (previewUrl === snipHistory[index]) {
      setPreviewUrl(null)
      setMode('idle')
    }
  }, [previewUrl, snipHistory])

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
      <div
        className="flex flex-col h-full bg-[var(--color-bg)]"
        onContextMenu={(e) => ctx.show(e, null)}
      >
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
              <button onClick={() => handleSave()}
                className="px-4 py-1.5 text-sm bg-[var(--color-bgSecondary)] border border-[var(--color-border)] rounded hover:bg-[var(--color-border)]">
                Save
              </button>
              <button onClick={() => handleCopy()}
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
                  onContextMenu={(e) => {
                    e.stopPropagation()
                    ctx.show(e, i)
                  }}
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
            Click and drag to select · ESC to cancel
          </div>
        </div>
      )}

      {/* Context Menu */}
      {ctx.visible && (
        <ContextMenu
          items={snipPreset({
            onNewSnip: startSnip,
            onCopy: previewUrl ? () => handleCopy() : undefined,
            onSave: previewUrl ? () => handleSave() : undefined,
            hasPreview: !!previewUrl && mode === 'preview',
            onDeleteFromHistory: ctx.data !== null && ctx.data !== undefined
              ? () => handleDeleteFromHistory(ctx.data as number)
              : undefined,
          })}
          x={ctx.x}
          y={ctx.y}
          onClose={ctx.hide}
        />
      )}
    </>
  )
}
