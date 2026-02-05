/**
 * Diagnostics Panel
 *
 * Collapsible bottom panel showing errors, warnings, and info messages.
 * Click a row to scroll editor to that line.
 */

import { THEME } from './stalk-theme.js'
import type { Diagnostic, DiagnosticSeverity } from './types.js'

interface DiagnosticsPanelProps {
  diagnostics: Diagnostic[]
  isOpen: boolean
  onToggle: () => void
  onClickDiagnostic: (line: number) => void
  height: number
  onResizeStart?: (e: React.MouseEvent) => void
}

const SEVERITY_CONFIG: Record<DiagnosticSeverity, { icon: string; color: string; label: string }> = {
  panic: { icon: '\u2718', color: THEME.panic, label: 'PANIC' },
  pop: { icon: '!', color: THEME.pop, label: 'POP' },
  warn: { icon: '\u26A0', color: THEME.warn, label: 'WARN' },
  info: { icon: 'i', color: THEME.info, label: 'INFO' },
}

export function DiagnosticsPanel({ diagnostics, isOpen, onToggle, onClickDiagnostic, height, onResizeStart }: DiagnosticsPanelProps) {
  const panicCount = diagnostics.filter(d => d.severity === 'panic').length
  const popCount = diagnostics.filter(d => d.severity === 'pop').length
  const warnCount = diagnostics.filter(d => d.severity === 'warn').length
  const infoCount = diagnostics.filter(d => d.severity === 'info').length

  return (
    <div style={{
      borderTop: `1px solid ${THEME.border}`,
      background: THEME.bgSurface,
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Resize handle */}
      {isOpen && onResizeStart && (
        <div
          onMouseDown={onResizeStart}
          style={{
            height: '4px',
            cursor: 'ns-resize',
            background: 'transparent',
          }}
        />
      )}

      {/* Header bar */}
      <div
        onClick={onToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '4px 12px',
          cursor: 'pointer',
          borderBottom: isOpen ? `1px solid ${THEME.border}` : 'none',
          userSelect: 'none',
          fontSize: '12px',
          fontFamily: "'Fira Code', monospace",
        }}
      >
        <span style={{ color: THEME.textMuted }}>
          {isOpen ? '\u25BC' : '\u25B6'} Diagnostics
        </span>

        {panicCount > 0 && (
          <span style={{ color: THEME.panic, fontWeight: 'bold' }}>
            {SEVERITY_CONFIG.panic.icon} {panicCount}
          </span>
        )}
        {popCount > 0 && (
          <span style={{ color: THEME.pop }}>
            ! {popCount}
          </span>
        )}
        {warnCount > 0 && (
          <span style={{ color: THEME.warn }}>
            {SEVERITY_CONFIG.warn.icon} {warnCount}
          </span>
        )}
        {infoCount > 0 && (
          <span style={{ color: THEME.info }}>
            i {infoCount}
          </span>
        )}

        {diagnostics.length === 0 && (
          <span style={{ color: THEME.success }}>No issues</span>
        )}
      </div>

      {/* Diagnostic rows */}
      {isOpen && (
        <div style={{
          height: `${height}px`,
          overflow: 'auto',
          fontSize: '12px',
          fontFamily: "'Fira Code', monospace",
        }}>
          {diagnostics.length === 0 ? (
            <div style={{
              padding: '16px',
              color: THEME.textMuted,
              textAlign: 'center',
            }}>
              Pop-safe. No issues detected.
            </div>
          ) : (
            diagnostics.map((d, i) => {
              const cfg = SEVERITY_CONFIG[d.severity]
              return (
                <div
                  key={i}
                  onClick={() => onClickDiagnostic(d.line)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                    padding: '4px 12px',
                    cursor: 'pointer',
                    borderBottom: `1px solid ${THEME.border}`,
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLDivElement).style.background = THEME.bgElevated
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLDivElement).style.background = 'transparent'
                  }}
                >
                  {/* Severity badge */}
                  <span style={{
                    color: cfg.color,
                    minWidth: '18px',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    flexShrink: 0,
                  }}>
                    {cfg.icon}
                  </span>

                  {/* Message */}
                  <span style={{ color: THEME.text, flex: 1 }}>
                    {d.message}
                    {d.hint && (
                      <span style={{ color: THEME.textMuted, marginLeft: '8px' }}>
                        {d.hint}
                      </span>
                    )}
                  </span>

                  {/* Location */}
                  <span style={{
                    color: THEME.textMuted,
                    flexShrink: 0,
                    whiteSpace: 'nowrap',
                  }}>
                    {d.line}:{d.column}
                  </span>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
