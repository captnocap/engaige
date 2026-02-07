/**
 * Paint Toolbar
 *
 * Left toolbar with drawing tools and top bar with size/color controls.
 */

export type PaintTool = 'pencil' | 'brush' | 'eraser' | 'fill' | 'text' | 'line' | 'rect' | 'circle'

const TOOLS: { id: PaintTool; icon: string; label: string }[] = [
  { id: 'pencil', icon: '✏️', label: 'Pencil' },
  { id: 'brush', icon: '🖌️', label: 'Brush' },
  { id: 'eraser', icon: '🧹', label: 'Eraser' },
  { id: 'fill', icon: '🪣', label: 'Fill' },
  { id: 'text', icon: 'T', label: 'Text' },
  { id: 'line', icon: '╱', label: 'Line' },
  { id: 'rect', icon: '▭', label: 'Rectangle' },
  { id: 'circle', icon: '○', label: 'Circle' },
]

const PALETTE = [
  '#000000', '#ffffff', '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#78716c', '#0d5e38',
  '#1e3a5f', '#7c2d12', '#854d0e', '#166534', '#1e40af', '#581c87',
  '#9f1239', '#44403c', '#00ff88', '#fde68a', '#bfdbfe', '#fecdd3',
]

interface ToolbarProps {
  activeTool: PaintTool
  onToolChange: (tool: PaintTool) => void
  color: string
  onColorChange: (color: string) => void
  brushSize: number
  onBrushSizeChange: (size: number) => void
  onUndo: () => void
  onRedo: () => void
  onClear: () => void
  onSave: () => void
  canUndo: boolean
  canRedo: boolean
  children?: React.ReactNode
}

export function PaintToolbar({
  activeTool, onToolChange, color, onColorChange,
  brushSize, onBrushSizeChange, onUndo, onRedo, onClear, onSave,
  canUndo, canRedo, children,
}: ToolbarProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-3 py-1.5 border-b border-[var(--color-border)] bg-[var(--color-bgSecondary)]">
        <div className="flex gap-1">
          <button onClick={onUndo} disabled={!canUndo}
            className="px-2 py-1 text-sm rounded hover:bg-[var(--color-border)] disabled:opacity-30" title="Undo">
            ↩
          </button>
          <button onClick={onRedo} disabled={!canRedo}
            className="px-2 py-1 text-sm rounded hover:bg-[var(--color-border)] disabled:opacity-30" title="Redo">
            ↪
          </button>
        </div>

        <div className="w-px h-5 bg-[var(--color-border)]" />

        <div className="flex items-center gap-2">
          <label className="text-xs text-[var(--color-textSecondary)]">Size</label>
          <input
            type="range" min={1} max={40} value={brushSize}
            onChange={e => onBrushSizeChange(parseInt(e.target.value))}
            className="w-20 accent-[#00ff88]"
          />
          <span className="text-xs text-[var(--color-textSecondary)] w-6">{brushSize}</span>
        </div>

        <div className="w-px h-5 bg-[var(--color-border)]" />

        {/* Color palette */}
        <div className="flex flex-wrap gap-0.5 max-w-[300px]">
          {PALETTE.map(c => (
            <button
              key={c}
              onClick={() => onColorChange(c)}
              className={`w-5 h-5 rounded-sm border ${
                color === c ? 'border-white ring-1 ring-[#00ff88]' : 'border-[#333]'
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        <div className="flex-1" />

        <button onClick={onClear}
          className="px-3 py-1 text-xs bg-red-500/20 text-red-400 rounded hover:bg-red-500/30">
          Clear
        </button>
        <button onClick={onSave}
          className="px-3 py-1 text-xs bg-[#00ff88]/20 text-[#00ff88] rounded hover:bg-[#00ff88]/30">
          Save PNG
        </button>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Left tool panel */}
        <div className="w-12 shrink-0 border-r border-[var(--color-border)] bg-[var(--color-bgSecondary)] flex flex-col items-center py-2 gap-1">
          {TOOLS.map(tool => (
            <button
              key={tool.id}
              onClick={() => onToolChange(tool.id)}
              className={`w-9 h-9 rounded flex items-center justify-center text-sm transition-colors ${
                activeTool === tool.id
                  ? 'bg-[#00ff88]/20 text-[#00ff88] ring-1 ring-[#00ff88]'
                  : 'text-[var(--color-textSecondary)] hover:bg-[var(--color-border)]'
              }`}
              title={tool.label}
            >
              {tool.icon}
            </button>
          ))}

          {/* Current color preview */}
          <div className="mt-auto">
            <div
              className="w-8 h-8 rounded border border-[#555]"
              style={{ backgroundColor: color }}
            />
          </div>
        </div>

        {/* Canvas area */}
        {children}
      </div>
    </div>
  )
}
