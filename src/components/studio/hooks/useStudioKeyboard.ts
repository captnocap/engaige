/**
 * Studio Keyboard Shortcuts
 *
 * Ctrl+Z Undo, Ctrl+Shift+Z Redo, Ctrl+S Save,
 * B Brush, E Eraser, P Pencil, G Fill, I Eyedropper,
 * L Line, R Rectangle, O Ellipse,
 * Ctrl+Shift+P Publish
 */

import { useEffect, useCallback } from 'react';
import { useStudio, type Tool } from '../StudioContext.js';

interface UseStudioKeyboardOptions {
  onUndo?: () => void;
  onRedo?: () => void;
  onSave?: () => void;
  onPublish?: () => void;
}

export function useStudioKeyboard({ onUndo, onRedo, onSave, onPublish }: UseStudioKeyboardOptions) {
  const { state, dispatch, setMode } = useStudio();

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Don't capture when typing in inputs
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      // Allow Ctrl shortcuts even in inputs
      if (!e.ctrlKey && !e.metaKey) return;
    }

    const ctrl = e.ctrlKey || e.metaKey;

    // Ctrl+Z = Undo
    if (ctrl && !e.shiftKey && e.key === 'z') {
      e.preventDefault();
      onUndo?.();
      return;
    }

    // Ctrl+Shift+Z = Redo
    if (ctrl && e.shiftKey && e.key === 'Z') {
      e.preventDefault();
      onRedo?.();
      return;
    }

    // Ctrl+S = Save
    if (ctrl && e.key === 's') {
      e.preventDefault();
      onSave?.();
      return;
    }

    // Ctrl+Shift+P = Publish
    if (ctrl && e.shiftKey && e.key === 'P') {
      e.preventDefault();
      onPublish?.();
      return;
    }

    // Tool shortcuts (only when not in input)
    if (!ctrl && !e.altKey) {
      const toolMap: Record<string, Tool> = {
        'b': 'brush',
        'e': 'eraser',
        'p': 'pencil',
        'g': 'fill',
        'i': 'eyedropper',
        'l': 'line',
        'r': 'rectangle',
        'o': 'ellipse',
      };

      const tool = toolMap[e.key.toLowerCase()];
      if (tool && state.activeMode === 'draw') {
        dispatch({ type: 'SET_TOOL', payload: tool });
        return;
      }
    }
  }, [state.activeMode, dispatch, onUndo, onRedo, onSave, onPublish]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
