/**
 * CobPaint - Paint Application
 *
 * Main layout combining toolbar and canvas.
 */

import { useState, useRef, useCallback, useEffect } from 'react'
import { PaintToolbar, type PaintTool } from './PaintTools.js'
import { PaintCanvas } from './PaintCanvas.js'
import { useWSRequest } from '../../stores/wsStore.js'

export function PaintWindow() {
  const [tool, setTool] = useState<PaintTool>('pencil')
  const [color, setColor] = useState('#000000')
  const [brushSize, setBrushSize] = useState(3)
  const [, forceUpdate] = useState(0)
  const [saving, setSaving] = useState(false)
  const [saveDialog, setSaveDialog] = useState(false)
  const [saveFilename, setSaveFilename] = useState('')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const historyRef = useRef<ImageData[]>([])
  const historyIndexRef = useRef(0)
  const filenameInputRef = useRef<HTMLInputElement>(null)
  const { request } = useWSRequest()

  const triggerUpdate = useCallback(() => forceUpdate(n => n + 1), [])

  const handleUndo = useCallback(() => {
    if (historyIndexRef.current <= 0) return
    historyIndexRef.current--
    const ctx = canvasRef.current?.getContext('2d')
    if (ctx) {
      ctx.putImageData(historyRef.current[historyIndexRef.current], 0, 0)
    }
    triggerUpdate()
  }, [triggerUpdate])

  const handleRedo = useCallback(() => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return
    historyIndexRef.current++
    const ctx = canvasRef.current?.getContext('2d')
    if (ctx) {
      ctx.putImageData(historyRef.current[historyIndexRef.current], 0, 0)
    }
    triggerUpdate()
  }, [triggerUpdate])

  const handleClear = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    // Save to history
    historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1)
    historyRef.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height))
    historyIndexRef.current = historyRef.current.length - 1
    triggerUpdate()
  }, [triggerUpdate])

  const handleSaveClick = useCallback(() => {
    if (!canvasRef.current || saving) return
    setSaveFilename(`painting-${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).replace(' ', '-').toLowerCase()}`)
    setSaveStatus('idle')
    setSaveDialog(true)
  }, [saving])

  const handleSaveConfirm = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || !saveFilename.trim()) return

    const name = saveFilename.trim().endsWith('.png') ? saveFilename.trim() : `${saveFilename.trim()}.png`
    const dataUrl = canvas.toDataURL('image/png')

    setSaving(true)
    setSaveStatus('saving')
    request('media:save', {
      data: dataUrl,
      filename: name,
      mimeType: 'image/png',
      category: 'upload',
      description: 'Created in CobPaint',
    })
      .then(() => {
        setSaveStatus('saved')
        setTimeout(() => setSaveDialog(false), 1200)
      })
      .catch(() => setSaveStatus('error'))
      .finally(() => setSaving(false))
  }, [saveFilename, request])

  // Focus input when dialog opens
  useEffect(() => {
    if (saveDialog) {
      requestAnimationFrame(() => filenameInputRef.current?.select())
    }
  }, [saveDialog])

  return (
    <div className="flex flex-col h-full bg-[var(--color-bg)] relative">
      <PaintToolbar
        activeTool={tool}
        onToolChange={setTool}
        color={color}
        onColorChange={setColor}
        brushSize={brushSize}
        onBrushSizeChange={setBrushSize}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onClear={handleClear}
        onSave={handleSaveClick}
        canUndo={historyIndexRef.current > 0}
        canRedo={historyIndexRef.current < historyRef.current.length - 1}
      >
        <PaintCanvas
          tool={tool}
          color={color}
          brushSize={brushSize}
          historyRef={historyRef}
          historyIndexRef={historyIndexRef}
          canvasRef={canvasRef}
          onHistoryChange={triggerUpdate}
        />
      </PaintToolbar>

      {/* Save Dialog */}
      {saveDialog && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
          <div
            className="w-80 rounded-lg border shadow-2xl overflow-hidden"
            style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)' }}
          >
            <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--color-border)', background: 'var(--color-bgSecondary)' }}>
              <div className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Save to Files</div>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="text-xs mb-1 block" style={{ color: 'var(--color-textSecondary)' }}>Filename</label>
                <div className="flex items-center gap-1">
                  <input
                    ref={filenameInputRef}
                    type="text"
                    value={saveFilename}
                    onChange={e => setSaveFilename(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleSaveConfirm(); if (e.key === 'Escape') setSaveDialog(false); }}
                    disabled={saveStatus === 'saving' || saveStatus === 'saved'}
                    className="flex-1 px-3 py-1.5 rounded text-sm outline-none"
                    style={{
                      background: 'var(--color-bgSecondary)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text)',
                    }}
                  />
                  <span className="text-xs" style={{ color: 'var(--color-textMuted)' }}>.png</span>
                </div>
              </div>

              {saveStatus === 'saved' && (
                <div className="text-xs text-center py-1" style={{ color: '#00ff88' }}>
                  Saved to My Files
                </div>
              )}
              {saveStatus === 'error' && (
                <div className="text-xs text-center py-1" style={{ color: 'var(--color-error)' }}>
                  Save failed. Try again.
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 px-4 py-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
              <button
                onClick={() => setSaveDialog(false)}
                className="px-4 py-1.5 rounded text-sm"
                style={{ background: 'var(--color-bgTertiary)', color: 'var(--color-text)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveConfirm}
                disabled={!saveFilename.trim() || saveStatus === 'saving' || saveStatus === 'saved'}
                className="px-4 py-1.5 rounded text-sm font-medium disabled:opacity-40"
                style={{ background: '#00ff88', color: '#000' }}
              >
                {saveStatus === 'saving' ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
