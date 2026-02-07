/**
 * Paint Canvas
 *
 * HTML Canvas 2D drawing surface with tool implementations.
 */

import { useRef, useEffect, useCallback, useState } from 'react'
import type { PaintTool } from './PaintTools.js'

interface PaintCanvasProps {
  tool: PaintTool
  color: string
  brushSize: number
  historyRef: React.MutableRefObject<ImageData[]>
  historyIndexRef: React.MutableRefObject<number>
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  onHistoryChange: () => void
}

export function PaintCanvas({
  tool, color, brushSize, historyRef, historyIndexRef, canvasRef, onHistoryChange,
}: PaintCanvasProps) {
  const [drawing, setDrawing] = useState(false)
  const lastPosRef = useRef<{ x: number; y: number } | null>(null)
  const shapeStartRef = useRef<{ x: number; y: number } | null>(null)
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)

  const getCtx = useCallback(() => canvasRef.current?.getContext('2d') ?? null, [canvasRef])

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Size to container
    const rect = canvas.parentElement?.getBoundingClientRect()
    if (rect) {
      canvas.width = rect.width
      canvas.height = rect.height
    }

    // Guard against zero-size canvas (window not yet visible)
    if (canvas.width < 1 || canvas.height < 1) return

    // White background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Save initial state
    historyRef.current = [ctx.getImageData(0, 0, canvas.width, canvas.height)]
    historyIndexRef.current = 0
    onHistoryChange()
  }, [])

  const saveToHistory = useCallback(() => {
    const ctx = getCtx()
    if (!ctx || !canvasRef.current) return
    const data = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height)
    // Remove any redo states
    historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1)
    historyRef.current.push(data)
    // Keep max 50 states
    if (historyRef.current.length > 50) historyRef.current.shift()
    historyIndexRef.current = historyRef.current.length - 1
    onHistoryChange()
  }, [getCtx, canvasRef, historyRef, historyIndexRef, onHistoryChange])

  const getCanvasPos = useCallback((e: React.MouseEvent): { x: number; y: number } => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return { x: 0, y: 0 }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }, [canvasRef])

  const drawLine = useCallback((ctx: CanvasRenderingContext2D, from: { x: number; y: number }, to: { x: number; y: number }) => {
    ctx.beginPath()
    ctx.moveTo(from.x, from.y)
    ctx.lineTo(to.x, to.y)
    ctx.stroke()
  }, [])

  const floodFill = useCallback((startX: number, startY: number, fillColor: string) => {
    const canvas = canvasRef.current
    const ctx = getCtx()
    if (!canvas || !ctx) return

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data
    const w = canvas.width

    // Parse fill color
    const tempCtx = document.createElement('canvas').getContext('2d')!
    tempCtx.fillStyle = fillColor
    tempCtx.fillRect(0, 0, 1, 1)
    const fc = tempCtx.getImageData(0, 0, 1, 1).data

    const startIdx = (Math.floor(startY) * w + Math.floor(startX)) * 4
    const targetR = data[startIdx], targetG = data[startIdx + 1], targetB = data[startIdx + 2]

    if (targetR === fc[0] && targetG === fc[1] && targetB === fc[2]) return

    const match = (idx: number) =>
      data[idx] === targetR && data[idx + 1] === targetG && data[idx + 2] === targetB

    const stack = [[Math.floor(startX), Math.floor(startY)]]
    const visited = new Set<number>()

    while (stack.length > 0) {
      const [x, y] = stack.pop()!
      const idx = (y * w + x) * 4
      if (x < 0 || x >= w || y < 0 || y >= canvas.height) continue
      if (visited.has(idx)) continue
      if (!match(idx)) continue

      visited.add(idx)
      data[idx] = fc[0]
      data[idx + 1] = fc[1]
      data[idx + 2] = fc[2]
      data[idx + 3] = 255

      stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1])
    }

    ctx.putImageData(imageData, 0, 0)
  }, [canvasRef, getCtx])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const pos = getCanvasPos(e)
    const ctx = getCtx()
    if (!ctx) return

    setDrawing(true)
    lastPosRef.current = pos

    if (tool === 'fill') {
      floodFill(pos.x, pos.y, color)
      saveToHistory()
      return
    }

    if (tool === 'text') {
      const text = prompt('Enter text:')
      if (text) {
        ctx.font = `${brushSize + 10}px sans-serif`
        ctx.fillStyle = color
        ctx.fillText(text, pos.x, pos.y)
        saveToHistory()
      }
      setDrawing(false)
      return
    }

    if (['line', 'rect', 'circle'].includes(tool)) {
      shapeStartRef.current = pos
      return
    }

    // Start drawing point
    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color
    ctx.lineWidth = brushSize
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over'
    if (tool === 'eraser') {
      ctx.strokeStyle = 'rgba(0,0,0,1)'
      ctx.globalCompositeOperation = 'destination-out'
    }

    ctx.beginPath()
    ctx.arc(pos.x, pos.y, brushSize / 2, 0, Math.PI * 2)
    ctx.fill()
  }, [tool, color, brushSize, getCanvasPos, getCtx, floodFill, saveToHistory])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!drawing) return
    const pos = getCanvasPos(e)
    const ctx = getCtx()
    if (!ctx) return

    if (['line', 'rect', 'circle'].includes(tool) && shapeStartRef.current) {
      // Draw preview on overlay canvas
      const preview = previewCanvasRef.current?.getContext('2d')
      if (preview && previewCanvasRef.current) {
        preview.clearRect(0, 0, previewCanvasRef.current.width, previewCanvasRef.current.height)
        preview.strokeStyle = color
        preview.lineWidth = brushSize
        preview.lineCap = 'round'

        const start = shapeStartRef.current
        if (tool === 'line') {
          preview.beginPath()
          preview.moveTo(start.x, start.y)
          preview.lineTo(pos.x, pos.y)
          preview.stroke()
        } else if (tool === 'rect') {
          preview.strokeRect(start.x, start.y, pos.x - start.x, pos.y - start.y)
        } else if (tool === 'circle') {
          const rx = Math.abs(pos.x - start.x) / 2
          const ry = Math.abs(pos.y - start.y) / 2
          const cx = start.x + (pos.x - start.x) / 2
          const cy = start.y + (pos.y - start.y) / 2
          preview.beginPath()
          preview.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2)
          preview.stroke()
        }
      }
      return
    }

    if (lastPosRef.current && (tool === 'pencil' || tool === 'brush' || tool === 'eraser')) {
      ctx.strokeStyle = tool === 'eraser' ? 'rgba(0,0,0,1)' : color
      ctx.lineWidth = tool === 'brush' ? brushSize * 2 : brushSize
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over'

      drawLine(ctx, lastPosRef.current, pos)
      lastPosRef.current = pos
    }
  }, [drawing, tool, color, brushSize, getCanvasPos, getCtx, drawLine])

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (!drawing) return
    setDrawing(false)

    const ctx = getCtx()
    if (ctx) {
      ctx.globalCompositeOperation = 'source-over'

      if (['line', 'rect', 'circle'].includes(tool) && shapeStartRef.current) {
        const pos = getCanvasPos(e)
        const start = shapeStartRef.current
        ctx.strokeStyle = color
        ctx.lineWidth = brushSize
        ctx.lineCap = 'round'

        if (tool === 'line') {
          ctx.beginPath()
          ctx.moveTo(start.x, start.y)
          ctx.lineTo(pos.x, pos.y)
          ctx.stroke()
        } else if (tool === 'rect') {
          ctx.strokeRect(start.x, start.y, pos.x - start.x, pos.y - start.y)
        } else if (tool === 'circle') {
          const rx = Math.abs(pos.x - start.x) / 2
          const ry = Math.abs(pos.y - start.y) / 2
          const cx = start.x + (pos.x - start.x) / 2
          const cy = start.y + (pos.y - start.y) / 2
          ctx.beginPath()
          ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2)
          ctx.stroke()
        }

        // Clear preview
        const preview = previewCanvasRef.current?.getContext('2d')
        if (preview && previewCanvasRef.current) {
          preview.clearRect(0, 0, previewCanvasRef.current.width, previewCanvasRef.current.height)
        }
        shapeStartRef.current = null
      }
    }

    lastPosRef.current = null
    saveToHistory()
  }, [drawing, tool, color, brushSize, getCanvasPos, getCtx, saveToHistory])

  // Sync preview canvas size
  useEffect(() => {
    const canvas = canvasRef.current
    const preview = previewCanvasRef.current
    if (canvas && preview) {
      preview.width = canvas.width
      preview.height = canvas.height
    }
  })

  const cursor = tool === 'eraser' ? 'cell' : tool === 'fill' ? 'crosshair' : tool === 'text' ? 'text' : 'crosshair'

  return (
    <div className="flex-1 relative overflow-hidden bg-[#e5e5e5]" style={{ cursor }}>
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="absolute inset-0"
      />
      <canvas
        ref={previewCanvasRef}
        className="absolute inset-0 pointer-events-none"
      />
    </div>
  )
}
