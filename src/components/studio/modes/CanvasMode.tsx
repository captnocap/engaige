/**
 * Canvas Mode - MS Paint-style drawing tool
 *
 * Features:
 * - Draw on blank canvas or imported images
 * - Tools: pencil, brush, eraser, shapes, fill, text
 * - Undo/redo stack
 * - Save as new media item
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { useStudio } from '../StudioContext.js';
import { useStudioAssets, type MediaFile } from '../useStudioAssets.js';
import { useWSStore } from '../../../stores/wsStore.js';

// ============================================================================
// Types
// ============================================================================

type Tool = 'pencil' | 'brush' | 'eraser' | 'line' | 'rectangle' | 'ellipse' | 'fill' | 'text' | 'eyedropper';
type CanvasPreset = '1:1' | '4:5' | '9:16' | '16:9';

interface DrawState {
  isDrawing: boolean;
  lastX: number;
  lastY: number;
  startX: number;
  startY: number;
}

interface HistoryEntry {
  imageData: ImageData;
}

const CANVAS_PRESETS: Record<CanvasPreset, { width: number; height: number; label: string }> = {
  '1:1': { width: 512, height: 512, label: 'Square (1:1)' },
  '4:5': { width: 480, height: 600, label: 'Portrait (4:5)' },
  '9:16': { width: 405, height: 720, label: 'Story (9:16)' },
  '16:9': { width: 720, height: 405, label: 'Landscape (16:9)' },
};

const DEFAULT_COLORS = [
  '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff',
  '#ffff00', '#ff00ff', '#00ffff', '#ff8800', '#8800ff',
  '#008800', '#880000', '#888888', '#cccccc', '#ffcccc',
];

// ============================================================================
// Component
// ============================================================================

export function CanvasMode() {
  const { state: studioState, addToDraft, setMode } = useStudio();
  const { getCachedMany, resolveAssets } = useStudioAssets();
  const request = useWSStore((s) => s.request);
  const connected = useWSStore((s) => s.connected);

  // Canvas refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Tool state
  const [tool, setTool] = useState<Tool>('brush');
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(8);
  const [recentColors, setRecentColors] = useState<string[]>(DEFAULT_COLORS);

  // Canvas state
  const [canvasPreset, setCanvasPreset] = useState<CanvasPreset>('1:1');
  const [zoom, setZoom] = useState(1);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Drawing state
  const drawStateRef = useRef<DrawState>({
    isDrawing: false,
    lastX: 0,
    lastY: 0,
    startX: 0,
    startY: 0,
  });

  // History for undo/redo
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const maxHistory = 50;

  // UI state
  const [showImportModal, setShowImportModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Library assets for import
  const [libraryAssets, setLibraryAssets] = useState<MediaFile[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(false);

  // ============================================================================
  // Canvas Setup
  // ============================================================================

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const preset = CANVAS_PRESETS[canvasPreset];
    canvas.width = preset.width;
    canvas.height = preset.height;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      saveToHistory();
    }
  }, [canvasPreset]);

  // ============================================================================
  // History Management
  // ============================================================================

  const saveToHistory = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    setHistory(prev => {
      // Remove any redo states
      const newHistory = prev.slice(0, historyIndex + 1);
      // Add new state
      newHistory.push({ imageData });
      // Limit history size
      if (newHistory.length > maxHistory) {
        newHistory.shift();
      }
      return newHistory;
    });
    setHistoryIndex(prev => Math.min(prev + 1, maxHistory - 1));
    setHasUnsavedChanges(true);
  }, [historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex <= 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const newIndex = historyIndex - 1;
    const entry = history[newIndex];
    if (entry) {
      ctx.putImageData(entry.imageData, 0, 0);
      setHistoryIndex(newIndex);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex >= history.length - 1) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const newIndex = historyIndex + 1;
    const entry = history[newIndex];
    if (entry) {
      ctx.putImageData(entry.imageData, 0, 0);
      setHistoryIndex(newIndex);
    }
  }, [history, historyIndex]);

  // ============================================================================
  // Drawing Functions
  // ============================================================================

  const getCanvasCoords = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }, []);

  const startDrawing = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasCoords(e);
    const state = drawStateRef.current;

    state.isDrawing = true;
    state.lastX = x;
    state.lastY = y;
    state.startX = x;
    state.startY = y;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    // Handle eyedropper
    if (tool === 'eyedropper') {
      const pixel = ctx.getImageData(x, y, 1, 1).data;
      const newColor = `#${pixel[0].toString(16).padStart(2, '0')}${pixel[1].toString(16).padStart(2, '0')}${pixel[2].toString(16).padStart(2, '0')}`;
      setColor(newColor);
      addRecentColor(newColor);
      setTool('brush');
      return;
    }

    // Handle fill
    if (tool === 'fill') {
      floodFill(Math.floor(x), Math.floor(y), color);
      saveToHistory();
      return;
    }

    // Start line for brush/pencil
    if (tool === 'brush' || tool === 'pencil' || tool === 'eraser') {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  }, [getCanvasCoords, tool, color, saveToHistory]);

  const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const state = drawStateRef.current;
    if (!state.isDrawing) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCanvasCoords(e);

    if (tool === 'brush' || tool === 'pencil') {
      ctx.strokeStyle = color;
      ctx.lineWidth = tool === 'pencil' ? 1 : brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y);
    } else if (tool === 'eraser') {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y);
    }

    state.lastX = x;
    state.lastY = y;
  }, [getCanvasCoords, tool, color, brushSize]);

  const stopDrawing = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const state = drawStateRef.current;
    if (!state.isDrawing) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCanvasCoords(e);

    // Handle shape tools
    if (tool === 'line') {
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(state.startX, state.startY);
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (tool === 'rectangle') {
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      const width = x - state.startX;
      const height = y - state.startY;
      ctx.strokeRect(state.startX, state.startY, width, height);
    } else if (tool === 'ellipse') {
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      const centerX = (state.startX + x) / 2;
      const centerY = (state.startY + y) / 2;
      const radiusX = Math.abs(x - state.startX) / 2;
      const radiusY = Math.abs(y - state.startY) / 2;
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
      ctx.stroke();
    }

    state.isDrawing = false;

    if (tool !== 'eyedropper' && tool !== 'fill') {
      saveToHistory();
    }
  }, [getCanvasCoords, tool, color, brushSize, saveToHistory]);

  // Flood fill algorithm
  const floodFill = useCallback((startX: number, startY: number, fillColor: string) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const width = canvas.width;
    const height = canvas.height;

    // Parse fill color
    const fillR = parseInt(fillColor.slice(1, 3), 16);
    const fillG = parseInt(fillColor.slice(3, 5), 16);
    const fillB = parseInt(fillColor.slice(5, 7), 16);

    // Get target color
    const startIdx = (startY * width + startX) * 4;
    const targetR = data[startIdx];
    const targetG = data[startIdx + 1];
    const targetB = data[startIdx + 2];

    // Don't fill if same color
    if (targetR === fillR && targetG === fillG && targetB === fillB) return;

    const stack: [number, number][] = [[startX, startY]];
    const visited = new Set<string>();

    while (stack.length > 0) {
      const [x, y] = stack.pop()!;
      const key = `${x},${y}`;

      if (x < 0 || x >= width || y < 0 || y >= height) continue;
      if (visited.has(key)) continue;

      const idx = (y * width + x) * 4;
      if (data[idx] !== targetR || data[idx + 1] !== targetG || data[idx + 2] !== targetB) continue;

      visited.add(key);

      data[idx] = fillR;
      data[idx + 1] = fillG;
      data[idx + 2] = fillB;
      data[idx + 3] = 255;

      stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }

    ctx.putImageData(imageData, 0, 0);
  }, []);

  // ============================================================================
  // Color Management
  // ============================================================================

  const addRecentColor = useCallback((newColor: string) => {
    setRecentColors(prev => {
      const filtered = prev.filter(c => c !== newColor);
      return [newColor, ...filtered].slice(0, 15);
    });
  }, []);

  // ============================================================================
  // Import/Export
  // ============================================================================

  const loadImageToCanvas = useCallback(async (imageUrl: string) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      // Resize canvas to fit image while maintaining aspect ratio
      const maxSize = 720;
      let width = img.width;
      let height = img.height;

      if (width > maxSize || height > maxSize) {
        if (width > height) {
          height = (height / width) * maxSize;
          width = maxSize;
        } else {
          width = (width / height) * maxSize;
          height = maxSize;
        }
      }

      canvas.width = Math.floor(width);
      canvas.height = Math.floor(height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      saveToHistory();
      setShowImportModal(false);
    };

    img.onerror = () => {
      setError('Failed to load image');
    };

    img.src = imageUrl;
  }, [saveToHistory]);

  const fetchLibraryAssets = useCallback(async () => {
    if (!connected) return;

    setLoadingAssets(true);
    try {
      const response = await request<object, { files: MediaFile[] }>(
        'media:getAll',
        { filters: { category: 'generated' }, limit: 50 }
      );
      if (response?.files) {
        setLibraryAssets(response.files.filter(f => f.file_type?.startsWith('image') || !f.file_type));
      }
    } catch (e) {
      console.warn('Failed to fetch library assets:', e);
    } finally {
      setLoadingAssets(false);
    }
  }, [connected, request]);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveToHistory();
  }, [saveToHistory]);

  const saveCanvas = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas || !connected) return;

    setIsSaving(true);
    setError(null);

    try {
      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(b => b ? resolve(b) : reject(new Error('Failed to create blob')), 'image/png');
      });

      // Convert to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      // Send to server
      const response = await request<
        { imageData: string; filename: string },
        { mediaFile: MediaFile }
      >('studio:saveCanvas', {
        imageData: base64,
        filename: `canvas_${Date.now()}.png`,
      });

      if (response?.mediaFile) {
        addToDraft(response.mediaFile.id);
        setHasUnsavedChanges(false);
        setMode('compose');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save canvas');
    } finally {
      setIsSaving(false);
    }
  }, [connected, request, addToDraft, setMode]);

  // ============================================================================
  // Render
  // ============================================================================

  const preset = CANVAS_PRESETS[canvasPreset];

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div
        className="flex items-center gap-4 px-4 py-3 border-b flex-wrap"
        style={{
          background: 'var(--color-bgSecondary)',
          borderBottomColor: 'var(--color-border)',
        }}
      >
        {/* Tools */}
        <div className="flex gap-1">
          {[
            { id: 'pencil', icon: '✏️', label: 'Pencil' },
            { id: 'brush', icon: '🖌️', label: 'Brush' },
            { id: 'eraser', icon: '🧹', label: 'Eraser' },
            { id: 'line', icon: '📏', label: 'Line' },
            { id: 'rectangle', icon: '⬜', label: 'Rectangle' },
            { id: 'ellipse', icon: '⭕', label: 'Ellipse' },
            { id: 'fill', icon: '🪣', label: 'Fill' },
            { id: 'eyedropper', icon: '💧', label: 'Eyedropper' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTool(t.id as Tool)}
              title={t.label}
              className="w-9 h-9 rounded flex items-center justify-center text-lg"
              style={{
                background: tool === t.id ? 'var(--color-primary)' : 'transparent',
                border: `1px solid ${tool === t.id ? 'var(--color-primary)' : 'var(--color-border)'}`,
              }}
            >
              {t.icon}
            </button>
          ))}
        </div>

        {/* Brush Size */}
        <div className="flex items-center gap-2">
          <span className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>Size:</span>
          <input
            type="range"
            min="1"
            max="50"
            value={brushSize}
            onChange={e => setBrushSize(Number(e.target.value))}
            className="w-24"
          />
          <span className="text-sm w-6" style={{ color: 'var(--color-text)' }}>{brushSize}</span>
        </div>

        {/* Color Picker */}
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={color}
            onChange={e => {
              setColor(e.target.value);
              addRecentColor(e.target.value);
            }}
            className="w-9 h-9 rounded cursor-pointer"
            style={{ border: '1px solid var(--color-border)' }}
          />
          <div className="flex gap-0.5 flex-wrap" style={{ maxWidth: '150px' }}>
            {recentColors.slice(0, 10).map((c, i) => (
              <button
                key={i}
                onClick={() => setColor(c)}
                className="w-4 h-4 rounded-sm"
                style={{
                  background: c,
                  border: color === c ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                }}
              />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 ml-auto">
          <button
            onClick={undo}
            disabled={historyIndex <= 0}
            className="px-3 py-1.5 rounded text-sm"
            style={{
              background: 'var(--color-bg)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text)',
              opacity: historyIndex <= 0 ? 0.5 : 1,
            }}
          >
            Undo
          </button>
          <button
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            className="px-3 py-1.5 rounded text-sm"
            style={{
              background: 'var(--color-bg)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text)',
              opacity: historyIndex >= history.length - 1 ? 0.5 : 1,
            }}
          >
            Redo
          </button>
          <button
            onClick={clearCanvas}
            className="px-3 py-1.5 rounded text-sm"
            style={{
              background: 'var(--color-bg)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text)',
            }}
          >
            Clear
          </button>
          <button
            onClick={() => {
              setShowImportModal(true);
              fetchLibraryAssets();
            }}
            className="px-3 py-1.5 rounded text-sm"
            style={{
              background: 'var(--color-bg)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text)',
            }}
          >
            Import
          </button>
          <button
            onClick={saveCanvas}
            disabled={!connected || isSaving}
            className="px-4 py-1.5 rounded text-sm font-medium"
            style={{
              background: 'var(--color-primary)',
              color: '#fff',
              opacity: !connected || isSaving ? 0.5 : 1,
            }}
          >
            {isSaving ? 'Saving...' : 'Save & Use'}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          className="px-4 py-2 text-sm"
          style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}
        >
          {error}
        </div>
      )}

      {/* Canvas Area */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto flex items-center justify-center p-4"
        style={{ background: 'var(--color-bg)' }}
      >
        <div
          className="relative shadow-lg"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'center center',
          }}
        >
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            className="cursor-crosshair"
            style={{
              border: '1px solid var(--color-border)',
              background: '#fff',
            }}
          />
        </div>
      </div>

      {/* Bottom Bar */}
      <div
        className="flex items-center justify-between px-4 py-2 border-t text-sm"
        style={{
          background: 'var(--color-bgSecondary)',
          borderTopColor: 'var(--color-border)',
          color: 'var(--color-textSecondary)',
        }}
      >
        <div className="flex items-center gap-4">
          <span>Canvas: {preset.width}×{preset.height}</span>
          <div className="flex items-center gap-2">
            <span>Zoom:</span>
            <button onClick={() => setZoom(z => Math.max(0.25, z - 0.25))} className="px-2 py-0.5 rounded" style={{ background: 'var(--color-bg)' }}>-</button>
            <span>{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(z => Math.min(4, z + 0.25))} className="px-2 py-0.5 rounded" style={{ background: 'var(--color-bg)' }}>+</button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span>Preset:</span>
          {Object.entries(CANVAS_PRESETS).map(([key, value]) => (
            <button
              key={key}
              onClick={() => setCanvasPreset(key as CanvasPreset)}
              className="px-2 py-0.5 rounded text-xs"
              style={{
                background: canvasPreset === key ? 'var(--color-primary)' : 'var(--color-bg)',
                color: canvasPreset === key ? '#fff' : 'var(--color-text)',
              }}
            >
              {key}
            </button>
          ))}
        </div>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div
          className="absolute inset-0 flex items-center justify-center z-50"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setShowImportModal(false)}
        >
          <div
            className="w-[600px] max-h-[80%] rounded-lg overflow-hidden flex flex-col"
            style={{ background: 'var(--color-bg)' }}
            onClick={e => e.stopPropagation()}
          >
            <div
              className="px-4 py-3 border-b flex items-center justify-between"
              style={{ borderBottomColor: 'var(--color-border)' }}
            >
              <h3 className="font-medium" style={{ color: 'var(--color-text)' }}>
                Import Image
              </h3>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-xl"
                style={{ color: 'var(--color-textSecondary)' }}
              >
                ×
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {loadingAssets ? (
                <p style={{ color: 'var(--color-textSecondary)' }}>Loading...</p>
              ) : libraryAssets.length === 0 ? (
                <p style={{ color: 'var(--color-textSecondary)' }}>No images in library</p>
              ) : (
                <div className="grid grid-cols-4 gap-3">
                  {libraryAssets.map(asset => (
                    <button
                      key={asset.id}
                      onClick={() => loadImageToCanvas(asset.file_url)}
                      className="aspect-square rounded overflow-hidden hover:ring-2"
                      style={{
                        background: 'var(--color-bgSecondary)',
                        ringColor: 'var(--color-primary)',
                      }}
                    >
                      <img
                        src={asset.file_url}
                        alt={asset.filename}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CanvasMode;
