/**
 * CobHub IDE Theme - Hardcoded dark theme colors
 * Matches CobHubSite.tsx pattern (inline styles, NOT CSS variables)
 */

import { TokenType } from '@shared/stalk/tokens.js'

// ============================================================================
// Base Colors
// ============================================================================

export const THEME = {
  bg: '#0d1117',
  bgSurface: '#161b22',
  bgElevated: '#1c2129',
  border: '#30363d',
  borderFocus: '#58a6ff',
  text: '#c9d1d9',
  textMuted: '#8b949e',
  textLink: '#58a6ff',
  accent: '#f0b429',

  // Diagnostics
  info: '#58a6ff',
  warn: '#f0b429',
  pop: '#ffa657',
  panic: '#da3633',
  success: '#26a641',

  // Gauge
  gaugeGreen: '#26a641',
  gaugeYellow: '#f0b429',
  gaugeRed: '#da3633',

  // Editor
  lineNumber: '#484f58',
  lineNumberActive: '#c9d1d9',
  gutterBg: '#0d1117',
  selectionBg: '#264f78',
  cursorLine: '#161b22',
} as { [K: string]: string }

// ============================================================================
// Token Colors
// ============================================================================

export const TOKEN_COLORS: Partial<Record<TokenType, string>> = {
  // Block keywords - corn gold
  [TokenType.STALK]: '#f0b429',
  [TokenType.REQUIRE]: '#f0b429',
  [TokenType.CONFIG]: '#f0b429',
  [TokenType.OBSERVE]: '#f0b429',
  [TokenType.PREDICT]: '#f0b429',
  [TokenType.DECLARE]: '#f0b429',
  [TokenType.IMPACT]: '#f0b429',
  [TokenType.DISCLAIMER]: '#f0b429',

  // Logic - red coral
  [TokenType.IF]: '#ff7b72',
  [TokenType.THEN]: '#ff7b72',
  [TokenType.ELSE]: '#ff7b72',
  [TokenType.AND]: '#ff7b72',
  [TokenType.OR]: '#ff7b72',
  [TokenType.NOT]: '#ff7b72',
  [TokenType.UNLESS]: '#ff7b72',
  [TokenType.END]: '#ff7b72',

  // Literals - red coral
  [TokenType.TRUE]: '#ff7b72',
  [TokenType.FALSE]: '#ff7b72',
  [TokenType.NULL]: '#ff7b72',
  [TokenType.UNKNOWN]: '#ff7b72',

  // UI elements - green
  [TokenType.WINDOW]: '#7ee787',
  [TokenType.TEXT]: '#7ee787',
  [TokenType.BUTTON]: '#7ee787',
  [TokenType.SLIDER]: '#7ee787',
  [TokenType.INPUT]: '#7ee787',
  [TokenType.CHART]: '#7ee787',
  [TokenType.NOTIFY]: '#7ee787',
  [TokenType.TOAST]: '#7ee787',
  [TokenType.MODAL]: '#7ee787',

  // Actions - purple
  [TokenType.POST]: '#d2a8ff',
  [TokenType.DM]: '#d2a8ff',
  [TokenType.REACT]: '#d2a8ff',
  [TokenType.PRINT]: '#d2a8ff',
  [TokenType.FLASH]: '#d2a8ff',
  [TokenType.SOUND]: '#d2a8ff',

  // Capabilities - orange
  [TokenType.ALLOW_BROADCAST]: '#ffa657',
  [TokenType.ALLOW_RELATIONSHIP_WRITE]: '#ffa657',
  [TokenType.ALLOW_NPC_CONTACT]: '#ffa657',
  [TokenType.ALLOW_MARKET_INFLUENCE]: '#ffa657',
  [TokenType.ALLOW_VIRALITY]: '#ffa657',
  [TokenType.ALLOW_SYSTEMIC]: '#ffa657',

  // Strings - light blue
  [TokenType.STRING]: '#a5d6ff',
  [TokenType.INTERPOLATED_STRING]: '#a5d6ff',

  // Numbers - blue
  [TokenType.NUMBER]: '#79c0ff',

  // Identifiers - default text
  [TokenType.IDENTIFIER]: '#c9d1d9',

  // Events
  [TokenType.ON]: '#ff7b72',
  [TokenType.CLICK]: '#d2a8ff',
  [TokenType.CHANGE]: '#d2a8ff',
  [TokenType.SUBMIT]: '#d2a8ff',
  [TokenType.TICK]: '#d2a8ff',

  // Prepositions - muted
  [TokenType.TO]: '#8b949e',
  [TokenType.FROM]: '#8b949e',
  [TokenType.AS]: '#8b949e',
  [TokenType.WITH]: '#8b949e',
  [TokenType.FOR]: '#ff7b72',
  [TokenType.UNTIL]: '#8b949e',
  [TokenType.IN]: '#8b949e',

  // Prediction metadata
  [TokenType.CONFIDENCE]: '#ffa657',
  [TokenType.EVIDENCE]: '#ffa657',
  [TokenType.TIMEFRAME]: '#ffa657',
  [TokenType.AUDIENCE]: '#ffa657',

  // Audience
  [TokenType.SELF]: '#79c0ff',
  [TokenType.FRIENDS]: '#79c0ff',
  [TokenType.FOLLOWERS]: '#79c0ff',
  [TokenType.PUBLIC]: '#79c0ff',

  // UI Styles
  [TokenType.HEADING]: '#7ee787',
  [TokenType.SUBHEADING]: '#7ee787',
  [TokenType.CAPTION]: '#7ee787',
  [TokenType.RESULT]: '#7ee787',
  [TokenType.ERROR]: '#7ee787',
  [TokenType.NORMAL]: '#7ee787',
  [TokenType.PRIMARY]: '#7ee787',
  [TokenType.SECONDARY]: '#7ee787',
  [TokenType.DANGER]: '#7ee787',
  [TokenType.CENTER]: '#7ee787',
  [TokenType.BOTTOM]: '#7ee787',
  [TokenType.LINE]: '#7ee787',
  [TokenType.BAR]: '#7ee787',
  [TokenType.PIE]: '#7ee787',

  // Trigger modes
  [TokenType.ONCE]: '#d2a8ff',
  [TokenType.ON_CONDITION]: '#d2a8ff',
  [TokenType.CONTINUOUS]: '#d2a8ff',
}

export const COMMENT_COLOR = '#8b949e'
export const OPERATOR_COLOR = '#c9d1d9'
export const PUNCTUATION_COLOR = '#c9d1d9'
