/**
 * CobHub IDE Types
 */

import type { Token } from '@shared/stalk/tokens.js'
import type { Program } from '@shared/stalk/ast.js'
import type { LexerError } from '@shared/stalk/lexer.js'
import type { ParseError } from '@shared/stalk/parser.js'
import type { PopSafetyReport, PopWarning } from '@shared/stalk/pop-safety.js'

export type DiagnosticSeverity = 'info' | 'warn' | 'pop' | 'panic'

export interface Diagnostic {
  severity: DiagnosticSeverity
  message: string
  line: number
  column: number
  hint?: string
  source: 'lexer' | 'parser' | 'pop-safety' | 'linter'
}

export interface LintWarning {
  rule: string
  severity: DiagnosticSeverity
  message: string
  line: number
  column: number
  hint?: string
}

export type BlockName = 'REQUIRE' | 'CONFIG' | 'OBSERVE' | 'PREDICT' | 'DECLARE' | 'IMPACT' | 'DISCLAIMER'

export type BlockStatus = 'empty' | 'content' | 'error'

export interface BlockInfo {
  name: BlockName
  status: BlockStatus
  startLine: number
  lineCount: number
}

export interface AnalysisResult {
  tokens: Token[]
  lexerErrors: LexerError[]
  program: Program | null
  parseErrors: ParseError[]
  popSafetyReport: PopSafetyReport | null
  lintWarnings: LintWarning[]
  blockInfos: BlockInfo[]
  diagnostics: Diagnostic[]
}
