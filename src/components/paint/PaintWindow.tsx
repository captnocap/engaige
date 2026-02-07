/**
 * CobPaint - Paint Application
 *
 * Main layout combining toolbar and canvas.
 */

import { useState, useRef, useCallback } from 'react'
import { PaintToolbar, type PaintTool } from './PaintTools.js'
import { PaintCanvas } from './PaintCanvas.js'

export function PaintWindow() {
  const [tool, setTool] = useState<PaintTool>('pencil')
  const [color, setColor] = useState('#000000')
  const [brushSize, setBrushSize] = useState(3)
  const [, forceUpdate] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const historyRef = useRef<ImageData[]>([])
  const historyIndexRef = useRef(0)

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

  const handleSave = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `cobpaint-${Date.now()}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }, [])

  return (
    <div className="flex flex-col h-full bg-[var(--color-bg)]">
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
        onSave={handleSave}
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
    </div>
  )
}
