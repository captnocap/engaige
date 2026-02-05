/**
 * Artifact Panel - DECLARE Block Preview
 *
 * Renders DECLARE block UIElements as React stubs.
 * Shows live preview of the program's UI declaration.
 */

import type { Program, DeclareBlock, UIElement, UIProperty, Expression } from '@shared/stalk/ast.js'
import { THEME } from './stalk-theme.js'

interface ArtifactPanelProps {
  program: Program | null
  isOpen: boolean
  onClose: () => void
  hasParseErrors: boolean
}

function extractPropValue(prop: UIProperty): string {
  return expressionToString(prop.value)
}

function expressionToString(expr: Expression): string {
  switch (expr.type) {
    case 'StringLiteral': return expr.value
    case 'NumberLiteral': return String(expr.value)
    case 'BooleanLiteral': return String(expr.value)
    case 'NullLiteral': return 'null'
    case 'UnknownLiteral': return 'unknown'
    case 'Identifier': return `{${expr.name}}`
    case 'InterpolatedString':
      return expr.parts.map(p => typeof p === 'string' ? p : `{${expressionToString(p)}}`).join('')
    case 'PathExpression':
      return `{${expr.segments.map(s => s.type === 'PropertyAccess' ? s.property : s.type === 'FunctionCall' ? `${s.name}()` : '[]').join('.')}}`
    case 'TupleExpression':
      return `(${expr.elements.map(expressionToString).join(', ')})`
    case 'BinaryExpression':
      return `${expressionToString(expr.left)} ${expr.operator} ${expressionToString(expr.right)}`
    default:
      return '...'
  }
}

function getProps(element: UIElement): Record<string, string> {
  const result: Record<string, string> = {}
  for (const prop of element.properties) {
    result[prop.name.toLowerCase()] = extractPropValue(prop)
  }
  return result
}

function RenderElement({ element }: { element: UIElement }) {
  const props = getProps(element)

  switch (element.type) {
    case 'WindowElement':
      return (
        <div style={{
          border: `1px solid ${THEME.border}`,
          borderRadius: '6px',
          margin: '8px 0',
          overflow: 'hidden',
        }}>
          {props.title && (
            <div style={{
              background: THEME.bgElevated,
              padding: '6px 12px',
              borderBottom: `1px solid ${THEME.border}`,
              fontSize: '12px',
              fontWeight: 'bold',
              color: THEME.text,
            }}>
              {props.title}
            </div>
          )}
          <div style={{ padding: '12px' }}>
            {props.size && (
              <span style={{ color: THEME.textMuted, fontSize: '10px' }}>
                Size: {props.size}
              </span>
            )}
          </div>
        </div>
      )

    case 'TextElement': {
      const style = props.style?.toUpperCase()
      const align = props.align?.toLowerCase()
      let fontSize = '13px'
      let fontWeight: string = 'normal'
      let color = THEME.text

      if (style === 'HEADING') { fontSize = '18px'; fontWeight = 'bold' }
      else if (style === 'SUBHEADING') { fontSize = '15px'; fontWeight = '600' }
      else if (style === 'CAPTION') { fontSize = '11px'; color = THEME.textMuted }
      else if (style === 'RESULT') { color = THEME.success; fontWeight = 'bold' }
      else if (style === 'ERROR') { color = THEME.panic }

      return (
        <div style={{
          fontSize,
          fontWeight,
          color,
          padding: '4px 0',
          textAlign: align === 'center' ? 'center' : 'left',
        }}>
          {props.content || props.value || '(empty text)'}
        </div>
      )
    }

    case 'ButtonElement': {
      const variant = props.style?.toUpperCase()
      let bg = THEME.borderFocus
      let textColor = '#fff'
      if (variant === 'SECONDARY') { bg = THEME.bgElevated; textColor = THEME.text }
      else if (variant === 'DANGER') { bg = THEME.panic }

      return (
        <button
          disabled
          style={{
            background: bg,
            color: textColor,
            border: 'none',
            borderRadius: '4px',
            padding: '6px 16px',
            fontSize: '12px',
            fontFamily: "'Fira Code', monospace",
            cursor: 'not-allowed',
            opacity: 0.8,
            margin: '4px 0',
          }}
        >
          {props.label || props.text || 'Button'}
        </button>
      )
    }

    case 'SliderElement':
      return (
        <div style={{ margin: '8px 0' }}>
          {props.label && (
            <div style={{ fontSize: '11px', color: THEME.textMuted, marginBottom: '4px' }}>
              {props.label}
            </div>
          )}
          <input
            type="range"
            disabled
            min={props.min || '0'}
            max={props.max || '100'}
            defaultValue={props.value || '50'}
            style={{
              width: '100%',
              accentColor: THEME.accent,
              opacity: 0.7,
            }}
          />
        </div>
      )

    case 'InputElement':
      return (
        <div style={{ margin: '8px 0' }}>
          {props.label && (
            <div style={{ fontSize: '11px', color: THEME.textMuted, marginBottom: '4px' }}>
              {props.label}
            </div>
          )}
          <input
            type="text"
            disabled
            placeholder={props.placeholder || props.label || ''}
            style={{
              width: '100%',
              background: THEME.bg,
              border: `1px solid ${THEME.border}`,
              borderRadius: '4px',
              padding: '6px 8px',
              color: THEME.textMuted,
              fontSize: '12px',
              fontFamily: "'Fira Code', monospace",
              boxSizing: 'border-box',
            }}
          />
        </div>
      )

    case 'ChartElement': {
      const chartType = props.type?.toUpperCase() || 'BAR'
      return (
        <div style={{
          border: `1px dashed ${THEME.border}`,
          borderRadius: '4px',
          padding: '16px',
          margin: '8px 0',
          textAlign: 'center',
          color: THEME.textMuted,
          fontSize: '12px',
        }}>
          [{chartType} Chart]{props.data ? ` data: ${props.data}` : ''}
        </div>
      )
    }

    case 'NotifyElement':
      return (
        <div style={{
          background: THEME.bgElevated,
          border: `1px solid ${THEME.borderFocus}`,
          borderRadius: '4px',
          padding: '8px 12px',
          margin: '8px 0',
          fontSize: '12px',
          color: THEME.text,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <span style={{ color: THEME.info }}>i</span>
          {props.message || props.content || 'Notification'}
        </div>
      )

    case 'ToastElement':
      return (
        <div style={{
          background: THEME.bgElevated,
          borderLeft: `3px solid ${THEME.accent}`,
          borderRadius: '4px',
          padding: '8px 12px',
          margin: '8px 0',
          fontSize: '12px',
          color: THEME.text,
        }}>
          {props.message || props.content || 'Toast message'}
        </div>
      )

    case 'ModalElement':
      return (
        <div style={{
          border: `1px solid ${THEME.border}`,
          borderRadius: '8px',
          margin: '8px 0',
          overflow: 'hidden',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        }}>
          <div style={{
            background: THEME.bgElevated,
            padding: '8px 12px',
            borderBottom: `1px solid ${THEME.border}`,
            fontSize: '13px',
            fontWeight: 'bold',
            color: THEME.text,
          }}>
            {props.title || 'Modal'}
          </div>
          <div style={{ padding: '12px', fontSize: '12px', color: THEME.text }}>
            {props.content || props.message || '(modal content)'}
          </div>
        </div>
      )

    default:
      return null
  }
}

export function ArtifactPanel({ program, isOpen, onClose, hasParseErrors }: ArtifactPanelProps) {
  if (!isOpen) return null

  const declareBlock = program?.blocks.find(b => b.type === 'DeclareBlock') as DeclareBlock | undefined

  return (
    <div style={{
      width: '300px',
      minWidth: '300px',
      borderLeft: `1px solid ${THEME.border}`,
      background: THEME.bgSurface,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '6px 12px',
        borderBottom: `1px solid ${THEME.border}`,
        fontSize: '12px',
        fontFamily: "'Fira Code', monospace",
      }}>
        <span style={{ color: THEME.accent }}>DECLARE Preview</span>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: THEME.textMuted,
            cursor: 'pointer',
            fontSize: '14px',
            padding: '2px 6px',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = THEME.text)}
          onMouseLeave={e => (e.currentTarget.style.color = THEME.textMuted)}
        >
          {'\u2715'}
        </button>
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '12px',
      }}>
        {hasParseErrors ? (
          <div style={{
            color: THEME.panic,
            fontSize: '12px',
            textAlign: 'center',
            padding: '24px',
          }}>
            Parse errors - preview unavailable
          </div>
        ) : !declareBlock ? (
          <div style={{
            color: THEME.textMuted,
            fontSize: '12px',
            textAlign: 'center',
            padding: '24px',
          }}>
            No DECLARE block found.
            <br /><br />
            <span style={{ fontSize: '11px' }}>
              Add a DECLARE block to preview UI elements.
            </span>
          </div>
        ) : declareBlock.elements.length === 0 ? (
          <div style={{
            color: THEME.textMuted,
            fontSize: '12px',
            textAlign: 'center',
            padding: '24px',
          }}>
            DECLARE block is empty.
          </div>
        ) : (
          declareBlock.elements.map((el, i) => (
            <RenderElement key={i} element={el} />
          ))
        )}
      </div>
    </div>
  )
}
