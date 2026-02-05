/**
 * CobHub IDE - Main Component
 *
 * VSCode-like layout with sidebar, editor, artifact panel, and diagnostics.
 * CobHub-branded STALK programming environment.
 */

import { useState, useCallback, useRef } from 'react'
import { EditorPane } from './EditorPane.js'
import { DiagnosticsPanel } from './DiagnosticsPanel.js'
import { BlockNavigator } from './BlockNavigator.js'
import { PopSafetyGauge } from './PopSafetyGauge.js'
import { ArtifactPanel } from './ArtifactPanel.js'
import { useSTALKAnalysis } from './useSTALKAnalysis.js'
import { formatSTALK } from './stalk-formatter.js'
import { THEME } from './stalk-theme.js'

interface CobHubIDEProps {
  onClose?: () => void
}

const DEFAULT_CODE = `STALK "hello-world" {

REQUIRE {
  ALLOW_BROADCAST
}

CONFIG {
  version     = "1.0"
  author      = "you"
  trigger     = ONCE
  description = "My first STALK program"
}

OBSERVE {
  mood      = player.mood
  followers = player.followers.count()
  time      = time.hour
}

PREDICT {
  will_engage = mood > 0.5 AND followers > 10
  CONFIDENCE = 0.7
  EVIDENCE = "Positive mood correlates with engagement"
}

DECLARE {
  WINDOW {
    title = "Hello World"
    size  = (400, 300)
  }

  TEXT {
    content = "Welcome to STALK!"
    style   = HEADING
  }

  TEXT {
    content = "Your mood: {mood}"
    style   = NORMAL
  }

  BUTTON {
    label = "Post Update"
    style = PRIMARY
  }
}

IMPACT {
  ON CLICK "Post Update" {
    IF will_engage {
      POST TO "threadit" {
        content  = "Feeling good today!"
        AUDIENCE = FRIENDS
      }
    } ELSE {
      TOAST {
        message = "Maybe wait until you're in a better mood"
      }
    }
  }
}

DISCLAIMER {
  "This is just a demo program"
  "Predictions are for entertainment only"
}

}
`

export function CobHubIDE({ onClose }: CobHubIDEProps) {
  const [code, setCode] = useState(DEFAULT_CODE)
  const [diagnosticsPanelOpen, setDiagnosticsPanelOpen] = useState(true)
  const [diagnosticsHeight, setDiagnosticsHeight] = useState(150)
  const [artifactOpen, setArtifactOpen] = useState(true)
  const [cursorLine, setCursorLine] = useState(1)
  const [scrollToLine, setScrollToLine] = useState<number | null>(null)
  const resizingRef = useRef(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const analysis = useSTALKAnalysis(code)

  const handleScrollToLine = useCallback((line: number) => {
    setScrollToLine(line)
    // Reset after a tick so it can be set again
    setTimeout(() => setScrollToLine(null), 100)
  }, [])

  const handleFormat = useCallback(() => {
    setCode(formatSTALK(code))
  }, [code])

  // Diagnostics panel resize
  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    resizingRef.current = true
    const startY = e.clientY
    const startHeight = diagnosticsHeight

    const handleMouseMove = (e: MouseEvent) => {
      if (!resizingRef.current) return
      const delta = startY - e.clientY
      setDiagnosticsHeight(Math.max(80, Math.min(400, startHeight + delta)))
    }

    const handleMouseUp = () => {
      resizingRef.current = false
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [diagnosticsHeight])

  const popScore = analysis.popSafetyReport?.score ?? null
  const worstCase = analysis.popSafetyReport?.worstCase

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: THEME.bg,
        color: THEME.text,
        fontFamily: "'Fira Code', 'JetBrains Mono', monospace",
        fontSize: '13px',
        overflow: 'hidden',
      }}
    >
      {/* Toolbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '4px 12px',
        background: THEME.bgSurface,
        borderBottom: `1px solid ${THEME.border}`,
        fontSize: '12px',
        minHeight: '32px',
      }}>
        {/* CobHub branding */}
        <span style={{ color: THEME.accent, fontWeight: 'bold', marginRight: '8px' }}>
          CobHub IDE
        </span>
        <span style={{ color: THEME.textMuted }}>|</span>

        {/* Format button */}
        <button
          onClick={handleFormat}
          style={{
            background: THEME.bgElevated,
            color: THEME.text,
            border: `1px solid ${THEME.border}`,
            borderRadius: '4px',
            padding: '2px 10px',
            cursor: 'pointer',
            fontSize: '11px',
            fontFamily: 'inherit',
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = THEME.borderFocus)}
          onMouseLeave={e => (e.currentTarget.style.borderColor = THEME.border)}
        >
          Format
        </button>

        {/* Artifact panel toggle */}
        <button
          onClick={() => setArtifactOpen(!artifactOpen)}
          style={{
            background: artifactOpen ? THEME.bgElevated : 'transparent',
            color: artifactOpen ? THEME.accent : THEME.textMuted,
            border: `1px solid ${artifactOpen ? THEME.accent : THEME.border}`,
            borderRadius: '4px',
            padding: '2px 10px',
            cursor: 'pointer',
            fontSize: '11px',
            fontFamily: 'inherit',
          }}
        >
          Preview
        </button>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* File info */}
        <span style={{ color: THEME.textMuted }}>
          {code.split('\n').length} lines
        </span>

        {/* Pop-safety badge */}
        {popScore !== null && (
          <span style={{
            color: popScore >= 0.8 ? THEME.success : popScore >= 0.4 ? THEME.warn : THEME.panic,
            fontWeight: 'bold',
          }}>
            {Math.round(popScore * 100)}% safe
          </span>
        )}
      </div>

      {/* Main content area */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left sidebar - Block Navigator + Gauge */}
        <div style={{
          width: '130px',
          minWidth: '130px',
          background: THEME.bgSurface,
          borderRight: `1px solid ${THEME.border}`,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          <div style={{ flex: 1, overflow: 'auto' }}>
            <BlockNavigator
              blockInfos={analysis.blockInfos}
              cursorLine={cursorLine}
              onClickBlock={handleScrollToLine}
            />
          </div>

          {/* Pop-safety gauge at bottom */}
          <div style={{ borderTop: `1px solid ${THEME.border}` }}>
            <PopSafetyGauge score={popScore} worstCase={worstCase} />
          </div>
        </div>

        {/* Editor pane */}
        <EditorPane
          code={code}
          onChange={setCode}
          onCursorLine={setCursorLine}
          scrollToLine={scrollToLine}
        />

        {/* Artifact panel (right) */}
        <ArtifactPanel
          program={analysis.program}
          isOpen={artifactOpen}
          onClose={() => setArtifactOpen(false)}
          hasParseErrors={analysis.parseErrors.length > 0}
        />
      </div>

      {/* Diagnostics panel (bottom) */}
      <DiagnosticsPanel
        diagnostics={analysis.diagnostics}
        isOpen={diagnosticsPanelOpen}
        onToggle={() => setDiagnosticsPanelOpen(!diagnosticsPanelOpen)}
        onClickDiagnostic={handleScrollToLine}
        height={diagnosticsHeight}
        onResizeStart={handleResizeStart}
      />
    </div>
  )
}
