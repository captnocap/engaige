/**
 * CobNotes - Sticky Notes
 *
 * Colored sticky notes that live on the desktop surface.
 * Draggable, editable, right-click for color/delete.
 * Uses the shared ContextMenu component.
 * Persisted to localStorage.
 */

import { useState, useEffect, useCallback } from 'react'
import { ContextMenu } from '../ui/ContextMenu.js'
import { useContextMenu } from '../../hooks/useContextMenu.js'
import { stickyNotePreset } from '../../hooks/useContextMenuPresets.js'

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
  const ctx = useContextMenu<string>()

  useEffect(() => {
    saveNotes(notes)
  }, [notes])

  const updateNote = useCallback((id: string, updates: Partial<StickyNote>) => {
    onNotesChange(notes.map(n => n.id === id ? { ...n, ...updates } : n))
  }, [notes, onNotesChange])

  const deleteNote = useCallback((id: string) => {
    onNotesChange(notes.filter(n => n.id !== id))
  }, [notes, onNotesChange])

  const duplicateNote = useCallback((id: string) => {
    const source = notes.find(n => n.id === id)
    if (!source) return
    const dup: StickyNote = {
      ...source,
      id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      x: source.x + 20,
      y: source.y + 20,
    }
    onNotesChange([...notes, dup])
  }, [notes, onNotesChange])

  const changeColor = useCallback((id: string, color: string) => {
    updateNote(id, { color })
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
            ctx.show(e, note.id)
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

      {/* Context Menu */}
      {ctx.visible && ctx.data && (
        <ContextMenu
          items={stickyNotePreset({
            noteId: ctx.data,
            onDuplicate: () => duplicateNote(ctx.data!),
            onDelete: () => deleteNote(ctx.data!),
            colors: NOTE_COLORS,
            onChangeColor: (color) => changeColor(ctx.data!, color),
          })}
          x={ctx.x}
          y={ctx.y}
          onClose={ctx.hide}
        />
      )}
    </>
  )
}
