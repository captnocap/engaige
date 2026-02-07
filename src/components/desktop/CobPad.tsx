/**
 * CobPad - Notepad
 *
 * Simple text editor with file management, find, and word wrap.
 * Documents saved to localStorage.
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { ContextMenu } from '../ui/ContextMenu.js'
import { useContextMenu } from '../../hooks/useContextMenu.js'
import { textEditorPreset } from '../../hooks/useContextMenuPresets.js'

interface CobPadDocument {
  name: string
  content: string
  lastModified: number
}

const STORAGE_KEY = 'cobpad-documents'

const DEFAULT_README = `=== Welcome to CobOS v8.47 ===

SYSTEM NOTES:

1. Quantum Coffee Update
   The Martinez Study results are in: productivity increased 847% among
   regular drinkers. Derek from Floor 3 now owes $2,847 to the break room
   honor system. At $47/cup, that's only 60.6 cups. We believe him.

2. Hartwell Building Notice
   The 13th floor remains inaccessible. Omnicorp denies its existence.
   Maintenance reports echo sounds from the stairwell between 12 and 14.
   Building was constructed in 1923. The architect's notes stop at floor 12.

3. The Underground - Upcoming Shows
   Mars has announced Velvet Algorithms are ending their meditation hiatus
   for a one-night show. Neon Requiem will NOT be reuniting (again). Trust
   Fall Tim may perform if someone catches him (current rate: 78.5%).

4. IT Reminder
   Please stop reporting "ghost processes" in Task Manager. They are
   background services. The one labeled "watching.exe" is a screensaver.
   We think.

--- END OF FILE ---`

function loadDocuments(): CobPadDocument[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch { /* ignore */ }
  return [{ name: 'readme.txt', content: DEFAULT_README, lastModified: Date.now() }]
}

function saveDocuments(docs: CobPadDocument[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(docs))
}

export function CobPad() {
  const [documents, setDocuments] = useState<CobPadDocument[]>(loadDocuments)
  const [currentDocIndex, setCurrentDocIndex] = useState(0)
  const [wordWrap, setWordWrap] = useState(true)
  const [fontSize, setFontSize] = useState(14)
  const [showFind, setShowFind] = useState(false)
  const [findText, setFindText] = useState('')
  const [showFileMenu, setShowFileMenu] = useState(false)
  const [showEditMenu, setShowEditMenu] = useState(false)
  const [showViewMenu, setShowViewMenu] = useState(false)
  const [dirty, setDirty] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const findRef = useRef<HTMLInputElement>(null)
  const ctx = useContextMenu()

  const currentDoc = documents[currentDocIndex] ?? documents[0]

  useEffect(() => {
    saveDocuments(documents)
  }, [documents])

  useEffect(() => {
    if (showFind && findRef.current) findRef.current.focus()
  }, [showFind])

  const updateContent = useCallback((content: string) => {
    setDocuments(prev => {
      const next = [...prev]
      next[currentDocIndex] = { ...next[currentDocIndex], content, lastModified: Date.now() }
      return next
    })
    setDirty(true)
  }, [currentDocIndex])

  const handleNew = useCallback(() => {
    const name = `untitled-${Date.now().toString(36)}.txt`
    setDocuments(prev => [...prev, { name, content: '', lastModified: Date.now() }])
    setCurrentDocIndex(documents.length)
    setDirty(false)
    setShowFileMenu(false)
  }, [documents.length])

  const handleOpen = useCallback((index: number) => {
    setCurrentDocIndex(index)
    setDirty(false)
    setShowFileMenu(false)
  }, [])

  const handleSave = useCallback(() => {
    setDirty(false)
    setShowFileMenu(false)
  }, [])

  const handleDelete = useCallback(() => {
    if (documents.length <= 1) return
    setDocuments(prev => prev.filter((_, i) => i !== currentDocIndex))
    setCurrentDocIndex(prev => Math.max(0, prev - 1))
    setShowFileMenu(false)
  }, [currentDocIndex, documents.length])

  const handleFind = useCallback(() => {
    if (!findText || !textareaRef.current) return
    const textarea = textareaRef.current
    const text = textarea.value.toLowerCase()
    const searchFrom = textarea.selectionEnd || 0
    let index = text.indexOf(findText.toLowerCase(), searchFrom)
    if (index === -1) index = text.indexOf(findText.toLowerCase())
    if (index !== -1) {
      textarea.setSelectionRange(index, index + findText.length)
      textarea.focus()
    }
  }, [findText])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!textareaRef.current?.closest('[data-cobpad]')?.contains(e.target as Node)) return
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'f') { e.preventDefault(); setShowFind(prev => !prev) }
        else if (e.key === 'n') { e.preventDefault(); handleNew() }
        else if (e.key === 's') { e.preventDefault(); handleSave() }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleNew, handleSave])

  const MenuButton = ({ label, isOpen, onToggle, children }: {
    label: string; isOpen: boolean; onToggle: () => void; children: React.ReactNode
  }) => (
    <div className="relative">
      <button
        onClick={onToggle}
        className={`px-3 py-1 text-sm hover:bg-[var(--color-bgSecondary)] rounded ${
          isOpen ? 'bg-[var(--color-bgSecondary)]' : ''
        }`}
      >
        {label}
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => { setShowFileMenu(false); setShowEditMenu(false); setShowViewMenu(false) }} />
          <div className="absolute left-0 top-full mt-0.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md shadow-lg z-50 min-w-[180px] py-1">
            {children}
          </div>
        </>
      )}
    </div>
  )

  const MenuItem = ({ label, shortcut, onClick, disabled }: {
    label: string; shortcut?: string; onClick: () => void; disabled?: boolean
  }) => (
    <button
      onClick={disabled ? undefined : onClick}
      className={`w-full text-left px-4 py-1.5 text-sm flex justify-between ${
        disabled ? 'text-[var(--color-textSecondary)] opacity-50' : 'hover:bg-[var(--color-bgSecondary)]'
      }`}
    >
      <span>{label}</span>
      {shortcut && <span className="text-[var(--color-textSecondary)] ml-4">{shortcut}</span>}
    </button>
  )

  const lineCount = currentDoc.content.split('\n').length
  const charCount = currentDoc.content.length

  return (
    <div data-cobpad className="flex flex-col h-full bg-[var(--color-bg)]">
      {/* Menu bar */}
      <div className="flex items-center gap-0.5 px-2 py-0.5 border-b border-[var(--color-border)] bg-[var(--color-bg)]">
        <MenuButton label="File" isOpen={showFileMenu} onToggle={() => { setShowFileMenu(!showFileMenu); setShowEditMenu(false); setShowViewMenu(false) }}>
          <MenuItem label="New" shortcut="Ctrl+N" onClick={handleNew} />
          <MenuItem label="Save" shortcut="Ctrl+S" onClick={handleSave} />
          <div className="border-t border-[var(--color-border)] my-1" />
          <div className="px-4 py-1 text-xs text-[var(--color-textSecondary)]">Open Document</div>
          {documents.map((doc, i) => (
            <MenuItem key={i} label={doc.name} onClick={() => handleOpen(i)} />
          ))}
          <div className="border-t border-[var(--color-border)] my-1" />
          <MenuItem label="Delete Current" onClick={handleDelete} disabled={documents.length <= 1} />
        </MenuButton>

        <MenuButton label="Edit" isOpen={showEditMenu} onToggle={() => { setShowEditMenu(!showEditMenu); setShowFileMenu(false); setShowViewMenu(false) }}>
          <MenuItem label="Find" shortcut="Ctrl+F" onClick={() => { setShowFind(true); setShowEditMenu(false) }} />
          <MenuItem label="Select All" shortcut="Ctrl+A" onClick={() => { textareaRef.current?.select(); setShowEditMenu(false) }} />
        </MenuButton>

        <MenuButton label="View" isOpen={showViewMenu} onToggle={() => { setShowViewMenu(!showViewMenu); setShowFileMenu(false); setShowEditMenu(false) }}>
          <MenuItem label={`Word Wrap: ${wordWrap ? 'On' : 'Off'}`} onClick={() => { setWordWrap(!wordWrap); setShowViewMenu(false) }} />
          <div className="border-t border-[var(--color-border)] my-1" />
          <MenuItem label="Font Size: Small" onClick={() => { setFontSize(12); setShowViewMenu(false) }} />
          <MenuItem label="Font Size: Medium" onClick={() => { setFontSize(14); setShowViewMenu(false) }} />
          <MenuItem label="Font Size: Large" onClick={() => { setFontSize(18); setShowViewMenu(false) }} />
        </MenuButton>
      </div>

      {/* Find bar */}
      {showFind && (
        <div className="flex items-center gap-2 px-3 py-1.5 border-b border-[var(--color-border)] bg-[var(--color-bgSecondary)]">
          <input
            ref={findRef}
            type="text"
            value={findText}
            onChange={e => setFindText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleFind(); if (e.key === 'Escape') setShowFind(false) }}
            placeholder="Find..."
            className="flex-1 bg-[var(--color-bg)] border border-[var(--color-border)] rounded px-2 py-1 text-sm text-[var(--color-text)] outline-none focus:border-[#00ff88]"
          />
          <button onClick={handleFind} className="px-3 py-1 text-sm bg-[var(--color-bg)] border border-[var(--color-border)] rounded hover:bg-[var(--color-border)]">
            Find Next
          </button>
          <button onClick={() => setShowFind(false)} className="px-2 py-1 text-sm text-[var(--color-textSecondary)] hover:text-[var(--color-text)]">
            ✕
          </button>
        </div>
      )}

      {/* Text area */}
      <textarea
        ref={textareaRef}
        value={currentDoc.content}
        onChange={e => updateContent(e.target.value)}
        onContextMenu={(e) => ctx.show(e)}
        spellCheck={false}
        className="flex-1 resize-none bg-[var(--color-bg)] text-[var(--color-text)] p-4 outline-none font-mono border-none"
        style={{
          fontSize: `${fontSize}px`,
          whiteSpace: wordWrap ? 'pre-wrap' : 'pre',
          overflowWrap: wordWrap ? 'break-word' : 'normal',
          overflowX: wordWrap ? 'hidden' : 'auto',
        }}
      />

      {/* Status bar */}
      <div className="flex items-center justify-between px-3 py-1 border-t border-[var(--color-border)] bg-[var(--color-bgSecondary)] text-xs text-[var(--color-textSecondary)]">
        <span>{currentDoc.name}{dirty ? ' •' : ''}</span>
        <span>Ln {lineCount} | Ch {charCount} | {fontSize}px</span>
      </div>

      {/* Context Menu */}
      {ctx.visible && (
        <ContextMenu
          items={textEditorPreset({
            onNew: handleNew,
            onSave: handleSave,
            onFind: () => setShowFind(true),
            wordWrap,
            onToggleWordWrap: () => setWordWrap(prev => !prev),
          })}
          x={ctx.x}
          y={ctx.y}
          onClose={ctx.hide}
        />
      )}
    </div>
  )
}
