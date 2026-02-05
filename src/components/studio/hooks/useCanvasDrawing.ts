/**
 * Canvas Drawing Hook
 *
 * Extracted from CanvasMode — contains all drawing logic:
 * - drawStateRef, coordinate conversion, mouse pipeline
 * - Flood fill algorithm
 * - History with ImageData snapshots
 * - Import/save logic
 *
 * Reads activeTool from StudioContext, writes cursorPosition/zoomLevel/canvasSize back.
 */

import { useState, useRef, useCallback, useEffect, type RefObject } from 'react';
import { useStudio, type Tool } from '../StudioContext.js';
import { useStudioAssets, type MediaFile } from '../useStudioAssets.js';
import { useWSStore } from '../../../stores/wsStore.js';

// ============================================================================
// Types
// ============================================================================

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

export const CANVAS_PRESETS: Record<CanvasPreset, { width: number; height: number; label: string }> = {
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
// Hook
// ============================================================================

export function useCanvasDrawing(canvasRef: RefObject<HTMLCanvasElement | null>) {
  const { state: studioState, addToDraft, setMode, dispatch } = useStudio();
  const request = useWSStore((s) => s.request);
  const connected = useWSStore((s) => s.connected);

  // Tool state
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(8);
  const [recentColors, setRecentColors] = useState<string[]>(DEFAULT_COLORS);

  // Canvas state
  const [canvasPreset, setCanvasPreset] = useState<CanvasPreset>('1:1');
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

  // Active tool from context
  const tool = studioState.activeTool;
  const zoom = studioState.zoomLevel;

  // ============================================================================
  // Canvas Setup
  // ============================================================================

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

    dispatch({ type: 'SET_CANVAS_SIZE', payload: { width: preset.width, height: preset.height } });
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
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push({ imageData });
      if (newHistory.length > maxHistory) {
        newHistory.shift();
      }
      return newHistory;
    });
    setHistoryIndex(prev => Math.min(prev + 1, maxHistory - 1));
    setHasUnsavedChanges(true);
  }, [historyIndex, canvasRef]);

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
  }, [history, historyIndex, canvasRef]);

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
  }, [history, historyIndex, canvasRef]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

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
      x: Math.round((e.clientX - rect.left) * scaleX),
      y: Math.round((e.clientY - rect.top) * scaleY),
    };
  }, [canvasRef]);

  const startDrawing = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasCoords(e);
    const state = drawStateRef.current;

    state.isDrawing = true;
    state.lastX = x;
    state.lastY = y;
    state.startX = x;
    state.startY = y;

    dispatch({ type: 'SET_CURSOR_POSITION', payload: { x, y } });

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    // Handle eyedropper
    if (tool === 'eyedropper') {
      const pixel = ctx.getImageData(x, y, 1, 1).data;
      const newColor = `#${pixel[0].toString(16).padStart(2, '0')}${pixel[1].toString(16).padStart(2, '0')}${pixel[2].toString(16).padStart(2, '0')}`;
      setColor(newColor);
      addRecentColor(newColor);
      dispatch({ type: 'SET_TOOL', payload: 'brush' });
      return;
    }

    // Handle fill
    if (tool === 'fill') {
      floodFill(Math.floor(x), Math.floor(y), color);
      saveToHistory();
      return;
    }

    // Start line for brush/pencil/eraser
    if (tool === 'brush' || tool === 'pencil' || tool === 'eraser') {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  }, [getCanvasCoords, tool, color, saveToHistory, dispatch, canvasRef]);

  const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const state = drawStateRef.current;

    const { x, y } = getCanvasCoords(e);
    dispatch({ type: 'SET_CURSOR_POSITION', payload: { x, y } });

    if (!state.isDrawing) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

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
  }, [getCanvasCoords, tool, color, brushSize, dispatch, canvasRef]);

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
  }, [getCanvasCoords, tool, color, brushSize, saveToHistory, canvasRef]);

  // Flood fill algorithm
  const floodFill = useCallback((startX: number, startY: number, fillColor: string) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const width = canvas.width;
    const height = canvas.height;

    const fillR = parseInt(fillColor.slice(1, 3), 16);
    const fillG = parseInt(fillColor.slice(3, 5), 16);
    const fillB = parseInt(fillColor.slice(5, 7), 16);

    const startIdx = (startY * width + startX) * 4;
    const targetR = data[startIdx];
    const targetG = data[startIdx + 1];
    const targetB = data[startIdx + 2];

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
  }, [canvasRef]);

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
      dispatch({ type: 'SET_CANVAS_SIZE', payload: { width: canvas.width, height: canvas.height } });
    };

    img.onerror = () => {
      setError('Failed to load image');
    };

    img.src = imageUrl;
  }, [saveToHistory, canvasRef, dispatch]);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveToHistory();
  }, [saveToHistory, canvasRef]);

  const saveCanvas = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas || !connected) return;

    setIsSaving(true);
    setError(null);

    try {
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(b => b ? resolve(b) : reject(new Error('Failed to create blob')), 'image/png');
      });

      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

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
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save canvas');
    } finally {
      setIsSaving(false);
    }
  }, [connected, request, addToDraft, canvasRef]);

  return {
    // Drawing handlers
    startDrawing,
    draw,
    stopDrawing,

    // Tool state
    color,
    setColor,
    brushSize,
    setBrushSize,
    recentColors,
    addRecentColor,

    // Canvas state
    canvasPreset,
    setCanvasPreset,
    zoom,
    hasUnsavedChanges,

    // History
    undo,
    redo,
    canUndo,
    canRedo,
    historyIndex,
    historyLength: history.length,

    // Actions
    clearCanvas,
    saveCanvas,
    loadImageToCanvas,

    // Import modal
    showImportModal,
    setShowImportModal,

    // UI state
    isSaving,
    error,
    setError,
  };
}
