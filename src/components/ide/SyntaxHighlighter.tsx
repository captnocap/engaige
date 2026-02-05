/**
 * STALK Syntax Highlighter
 *
 * Token-based syntax highlighting with comment gap detection.
 * Runs lexer on source code and maps tokens to colored spans.
 */

import { useMemo } from 'react'
import { Lexer } from '@shared/stalk/lexer.js'
import { TokenType } from '@shared/stalk/tokens.js'
import type { Token } from '@shared/stalk/tokens.js'
import { TOKEN_COLORS, COMMENT_COLOR, OPERATOR_COLOR, PUNCTUATION_COLOR } from './stalk-theme.js'

interface SyntaxHighlighterProps {
  code: string
}

const OPERATOR_TYPES = new Set([
  TokenType.PLUS, TokenType.MINUS, TokenType.STAR, TokenType.SLASH, TokenType.PERCENT,
  TokenType.EQ, TokenType.NEQ, TokenType.GT, TokenType.LT, TokenType.GTE, TokenType.LTE,
  TokenType.VIBES_EQ, TokenType.ASSIGN, TokenType.PLUS_ASSIGN, TokenType.MINUS_ASSIGN,
])

const PUNCTUATION_TYPES = new Set([
  TokenType.LBRACE, TokenType.RBRACE, TokenType.LPAREN, TokenType.RPAREN,
  TokenType.LBRACKET, TokenType.RBRACKET, TokenType.DOT, TokenType.COMMA, TokenType.COLON,
])

function getTokenColor(type: TokenType): string {
  if (TOKEN_COLORS[type]) return TOKEN_COLORS[type]!
  if (OPERATOR_TYPES.has(type)) return OPERATOR_COLOR
  if (PUNCTUATION_TYPES.has(type)) return PUNCTUATION_COLOR
  return '#c9d1d9'
}

function isCommentStart(code: string, offset: number): boolean {
  if (offset >= code.length) return false
  const c = code[offset]
  if (c === '/' && offset + 1 < code.length && code[offset + 1] === '/') return true
  if (c === '#') return true
  return false
}

export function SyntaxHighlighter({ code }: SyntaxHighlighterProps) {
  const elements = useMemo(() => {
    if (!code) return []

    const lexer = new Lexer(code)
    const result = lexer.tokenize()
    const tokens = result.tokens.filter(t => t.type !== TokenType.EOF)
    const spans: { text: string; color: string; key: number }[] = []
    let lastEnd = 0
    let keyIdx = 0

    for (const token of tokens) {
      const tokenStart = token.offset
      const tokenEnd = tokenStart + token.value.length

      // Check gap between last token end and this token start
      if (tokenStart > lastEnd) {
        const gapText = code.slice(lastEnd, tokenStart)

        // Check if this gap contains a comment
        if (isCommentStart(code, lastEnd)) {
          // Find end of comment: for single-line, go to newline
          // For multi-line (#* ... *#), find the end
          if (code[lastEnd] === '#' && lastEnd + 1 < code.length && code[lastEnd + 1] === '*') {
            // Multi-line comment - the gap IS the comment
            spans.push({ text: gapText, color: COMMENT_COLOR, key: keyIdx++ })
          } else {
            // Single-line comment (// or #)
            // Split by newlines - comment goes to end of first line, rest is whitespace
            const nlIdx = gapText.indexOf('\n')
            if (nlIdx === -1) {
              spans.push({ text: gapText, color: COMMENT_COLOR, key: keyIdx++ })
            } else {
              spans.push({ text: gapText.slice(0, nlIdx), color: COMMENT_COLOR, key: keyIdx++ })
              spans.push({ text: gapText.slice(nlIdx), color: '', key: keyIdx++ })
            }
          }
        } else {
          // Regular whitespace
          spans.push({ text: gapText, color: '', key: keyIdx++ })
        }
      }

      // For NEWLINE tokens, render as actual newline
      if (token.type === TokenType.NEWLINE) {
        spans.push({ text: '\n', color: '', key: keyIdx++ })
      } else if (token.type === TokenType.STRING) {
        // Render strings with quotes
        const quote = code[tokenStart] === "'" ? "'" : '"'
        spans.push({ text: `${quote}${token.value}${quote}`, color: getTokenColor(token.type), key: keyIdx++ })
      } else if (token.type === TokenType.INTERPOLATED_STRING) {
        // Render the original source text for interpolated strings
        const originalText = code.slice(tokenStart, tokenEnd)
        spans.push({ text: originalText, color: getTokenColor(token.type), key: keyIdx++ })
      } else {
        spans.push({ text: token.value, color: getTokenColor(token.type), key: keyIdx++ })
      }

      lastEnd = tokenEnd
    }

    // Trailing content (comments at end of file, etc.)
    if (lastEnd < code.length) {
      const trailing = code.slice(lastEnd)
      if (isCommentStart(code, lastEnd)) {
        spans.push({ text: trailing, color: COMMENT_COLOR, key: keyIdx++ })
      } else {
        spans.push({ text: trailing, color: '', key: keyIdx++ })
      }
    }

    return spans
  }, [code])

  return (
    <code style={{ display: 'block', margin: 0, padding: 0, whiteSpace: 'pre' }}>
      {elements.map(span => (
        span.color
          ? <span key={span.key} style={{ color: span.color }}>{span.text}</span>
          : <span key={span.key}>{span.text}</span>
      ))}
    </code>
  )
}
