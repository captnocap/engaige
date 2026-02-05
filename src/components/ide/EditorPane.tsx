/**
 * STALK Editor Pane
 *
 * Textarea with syntax-highlighted overlay, line number gutter, scroll sync.
 * Tab inserts 2 spaces, Ctrl+/ toggles line comments.
 */

import { useRef, useCallback, useEffect, useState } from 'react'
import { SyntaxHighlighter } from './SyntaxHighlighter.js'
import { THEME } from './stalk-theme.js'

interface EditorPaneProps {
  code: string
  onChange: (code: string) => void
  onCursorLine?: (line: number) => void
  scrollToLine?: number | null
}

const FONT_FAMILY = "'Fira Code', 'JetBrains Mono', 'Source Code Pro', 'Consolas', monospace"
const FONT_SIZE = '13px'
const LINE_HEIGHT = '20px'
const PADDING = '12px'
const TAB_SIZE = 2

export function EditorPane({ code, onChange, onCursorLine, scrollToLine }: EditorPaneProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const preRef = useRef<HTMLPreElement>(null)
  const gutterRef = useRef<HTMLDivElement>(null)
  const [cursorLine, setCursorLine] = useState(1)

  const lines = code.split('\n')
  const lineCount = lines.length

  // Scroll sync
  const handleScroll = useCallback(() => {
    const textarea = textareaRef.current
    const pre = preRef.current
    const gutter = gutterRef.current
    if (!textarea) return
    if (pre) {
      pre.scrollTop = textarea.scrollTop
      pre.scrollLeft = textarea.scrollLeft
    }
    if (gutter) {
      gutter.scrollTop = textarea.scrollTop
    }
  }, [])

  // Scroll to line
  useEffect(() => {
    if (scrollToLine != null && textareaRef.current) {
      const lineHeight = 20
      const targetScroll = (scrollToLine - 1) * lineHeight
      textareaRef.current.scrollTop = targetScroll
      handleScroll()
    }
  }, [scrollToLine, handleScroll])

  // Track cursor line
  const handleCursorChange = useCallback(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    const pos = textarea.selectionStart
    const textBefore = textarea.value.substring(0, pos)
    const line = textBefore.split('\n').length
    if (line !== cursorLine) {
      setCursorLine(line)
      onCursorLine?.(line)
    }
  }, [cursorLine, onCursorLine])

  // Key handlers
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget

    // Tab -> 2 spaces
    if (e.key === 'Tab') {
      e.preventDefault()
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const spaces = ' '.repeat(TAB_SIZE)
      const newValue = textarea.value.substring(0, start) + spaces + textarea.value.substring(end)
      onChange(newValue)
      requestAnimationFrame(() => {
        textarea.selectionStart = textarea.selectionEnd = start + TAB_SIZE
      })
      return
    }

    // Ctrl+/ -> toggle comment
    if (e.key === '/' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const lines = textarea.value.split('\n')

      // Find start and end lines
      let charCount = 0
      let startLine = 0
      let endLine = 0
      for (let i = 0; i < lines.length; i++) {
        if (charCount + lines[i].length >= start && startLine === 0 && i > 0 || charCount <= start && charCount + lines[i].length >= start) {
          startLine = i
        }
        if (charCount <= end && charCount + lines[i].length + 1 > end) {
          endLine = i
          break
        }
        charCount += lines[i].length + 1
      }

      // Toggle comment on affected lines
      const allCommented = lines.slice(startLine, endLine + 1).every(l => l.trimStart().startsWith('//'))

      for (let i = startLine; i <= endLine; i++) {
        if (allCommented) {
          lines[i] = lines[i].replace(/^(\s*)\/\/ ?/, '$1')
        } else {
          lines[i] = lines[i].replace(/^(\s*)/, '$1// ')
        }
      }

      onChange(lines.join('\n'))
      return
    }
  }, [onChange])

  const sharedTextStyle: React.CSSProperties = {
    fontFamily: FONT_FAMILY,
    fontSize: FONT_SIZE,
    lineHeight: LINE_HEIGHT,
    tabSize: TAB_SIZE,
    margin: 0,
    border: 'none',
    outline: 'none',
    whiteSpace: 'pre',
    wordWrap: 'off' as any,
    overflowWrap: 'normal',
    padding: PADDING,
  }

  return (
    <div style={{
      display: 'flex',
      flex: 1,
      overflow: 'hidden',
      background: THEME.bg,
      position: 'relative',
    }}>
      {/* Line number gutter */}
      <div
        ref={gutterRef}
        style={{
          width: '52px',
          minWidth: '52px',
          background: THEME.gutterBg,
          borderRight: `1px solid ${THEME.border}`,
          overflow: 'hidden',
          paddingTop: PADDING,
          paddingBottom: PADDING,
          userSelect: 'none',
        }}
      >
        {Array.from({ length: lineCount }, (_, i) => (
          <div
            key={i}
            style={{
              height: LINE_HEIGHT,
              lineHeight: LINE_HEIGHT,
              fontSize: FONT_SIZE,
              fontFamily: FONT_FAMILY,
              textAlign: 'right',
              paddingRight: '8px',
              color: cursorLine === i + 1 ? THEME.lineNumberActive : THEME.lineNumber,
            }}
          >
            {i + 1}
          </div>
        ))}
      </div>

      {/* Editor area */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {/* Syntax highlighted overlay (behind textarea) */}
        <pre
          ref={preRef}
          aria-hidden="true"
          style={{
            ...sharedTextStyle,
            position: 'absolute',
            inset: 0,
            overflow: 'hidden',
            pointerEvents: 'none',
            color: THEME.text,
            background: 'transparent',
          }}
        >
          <SyntaxHighlighter code={code} />
        </pre>

        {/* Textarea (transparent text, visible caret) */}
        <textarea
          ref={textareaRef}
          value={code}
          onChange={e => onChange(e.target.value)}
          onScroll={handleScroll}
          onKeyDown={handleKeyDown}
          onClick={handleCursorChange}
          onKeyUp={handleCursorChange}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          style={{
            ...sharedTextStyle,
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            resize: 'none',
            background: 'transparent',
            color: 'transparent',
            caretColor: THEME.text,
            overflow: 'auto',
          }}
        />
      </div>
    </div>
  )
}
