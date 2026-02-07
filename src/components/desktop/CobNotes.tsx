/**
 * CobNotes - Sticky Notes
 *
 * Colored sticky notes that live on the desktop surface.
 * Draggable, editable, right-click for color/delete.
 * Persisted to localStorage.
 */

import { useState, useEffect, useRef, useCallback } from 'react'

export interface StickyNote {
  id: string
  x: number
  y: number
  width: number
  height: number
  content: string
  color: string
}

const STORAGE_KEY = 'cobnotes-data'
const NOTE_COLORS = [
  { label: 'Yellow', value: '#fef08a' },
  { label: 'Green', value: '#86efac' },
  { label: 'Blue', value: '#93c5fd' },
  { label: 'Pink', value: '#f9a8d4' },
  { label: 'Orange', value: '#fdba74' },
  { label: 'Purple', value: '#c4b5fd' },
]

function loadNotes(): StickyNote[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch { /* ignore */ }
  return []
}

function saveNotes(notes: StickyNote[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
}

export function createNewNote(existingNotes: StickyNote[]): StickyNote {
  const offsetX = (existingNotes.length % 5) * 30
  const offsetY = (existingNotes.length % 5) * 30
  return {
    id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    x: 200 + offsetX,
    y: 100 + offsetY,
    width: 200,
    height: 200,
    content: '',
    color: NOTE_COLORS[existingNotes.length % NOTE_COLORS.length].value,
  }
}

interface CobNotesProps {
  notes: StickyNote[]
  onNotesChange: (notes: StickyNote[]) => void
}

export function CobNotes({ notes, onNotesChange }: CobNotesProps) {
  const [dragging, setDragging] = useState<{ id: string; offsetX: number; offsetY: number } | null>(null)
  const [contextMenu, setContextMenu] = useState<{ noteId: string; x: number; y: number } | null>(null)

  useEffect(() => {
    saveNotes(notes)
  }, [notes])

  const updateNote = useCallback((id: string, updates: Partial<StickyNote>) => {
    onNotesChange(notes.map(n => n.id === id ? { ...n, ...updates } : n))
  }, [notes, onNotesChange])

  const deleteNote = useCallback((id: string) => {
    onNotesChange(notes.filter(n => n.id !== id))
    setContextMenu(null)
  }, [notes, onNotesChange])

  const changeColor = useCallback((id: string, color: string) => {
    updateNote(id, { color })
    setContextMenu(null)
  }, [updateNote])

  // Mouse move/up for dragging
  useEffect(() => {
    if (!dragging) return

    const handleMouseMove = (e: MouseEvent) => {
      updateNote(dragging.id, {
        x: Math.max(0, e.clientX - dragging.offsetX),
        y: Math.max(0, e.clientY - dragging.offsetY),
      })
    }

    const handleMouseUp = () => setDragging(null)

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [dragging, updateNote])

  // Close context menu on click outside
  useEffect(() => {
    if (!contextMenu) return
    const close = () => setContextMenu(null)
    window.addEventListener('click', close)
    return () => window.removeEventListener('click', close)
  }, [contextMenu])

  if (notes.length === 0) return null

  return (
    <>
      {notes.map(note => (
        <div
          key={note.id}
          className="absolute shadow-lg rounded-sm flex flex-col"
          style={{
            left: note.x,
            top: note.y,
            width: note.width,
            height: note.height,
            backgroundColor: note.color,
            zIndex: 5,
          }}
          onContextMenu={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setContextMenu({ noteId: note.id, x: e.clientX, y: e.clientY })
          }}
        >
          {/* Drag handle */}
          <div
            className="h-6 cursor-move flex items-center justify-between px-2 rounded-t-sm"
            style={{ backgroundColor: 'rgba(0,0,0,0.1)' }}
            onMouseDown={e => {
              e.preventDefault()
              e.stopPropagation()
              setDragging({
                id: note.id,
                offsetX: e.clientX - note.x,
                offsetY: e.clientY - note.y,
              })
            }}
          >
            <span className="text-[10px] font-medium text-black/40 select-none">Note</span>
            <button
              onClick={(e) => { e.stopPropagation(); deleteNote(note.id) }}
              className="w-4 h-4 flex items-center justify-center text-black/40 hover:text-black/70 text-xs"
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <textarea
            value={note.content}
            onChange={e => updateNote(note.id, { content: e.target.value })}
            onClick={e => e.stopPropagation()}
            onMouseDown={e => e.stopPropagation()}
            className="flex-1 bg-transparent border-none outline-none resize-none p-2 text-sm text-black/80 placeholder:text-black/30"
            placeholder="Type a note..."
            spellCheck={false}
          />
        </div>
      ))}

      {/* Context menu */}
      {contextMenu && (
        <div
          className="fixed bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md shadow-xl py-1 min-w-[140px]"
          style={{ left: contextMenu.x, top: contextMenu.y, zIndex: 9999 }}
          onClick={e => e.stopPropagation()}
        >
          <div className="px-3 py-1 text-xs text-[var(--color-textSecondary)]">Color</div>
          <div className="flex gap-1 px-3 py-1.5">
            {NOTE_COLORS.map(c => (
              <button
                key={c.value}
                onClick={() => changeColor(contextMenu.noteId, c.value)}
                className="w-5 h-5 rounded-full border border-black/20 hover:scale-125 transition-transform"
                style={{ backgroundColor: c.value }}
                title={c.label}
              />
            ))}
          </div>
          <div className="border-t border-[var(--color-border)] my-1" />
          <button
            onClick={() => deleteNote(contextMenu.noteId)}
            className="w-full text-left px-3 py-1.5 text-sm text-red-400 hover:bg-[var(--color-bgSecondary)]"
          >
            Delete Note
          </button>
        </div>
      )}
    </>
  )
}
