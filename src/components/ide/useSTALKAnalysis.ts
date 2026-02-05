/**
 * Core analysis hook for the STALK IDE
 *
 * Debounced pipeline: Lexer -> Parser -> PopSafety -> Linter
 * All sync, all pure CPU - no server calls needed.
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { Lexer } from '@shared/stalk/lexer.js'
import { Parser } from '@shared/stalk/parser.js'
import { analyzePopSafety } from '@shared/stalk/pop-safety.js'
import type { AnalysisResult, Diagnostic, BlockInfo, BlockName, LintWarning } from './types.js'
import { lintSTALK } from './stalk-linter.js'

const DEBOUNCE_MS = 400

const BLOCK_ORDER: BlockName[] = ['REQUIRE', 'CONFIG', 'OBSERVE', 'PREDICT', 'DECLARE', 'IMPACT', 'DISCLAIMER']

const BLOCK_TYPE_MAP: Record<string, BlockName> = {
  RequireBlock: 'REQUIRE',
  ConfigBlock: 'CONFIG',
  ObserveBlock: 'OBSERVE',
  PredictBlock: 'PREDICT',
  DeclareBlock: 'DECLARE',
  ImpactBlock: 'IMPACT',
  DisclaimerBlock: 'DISCLAIMER',
}

function analyze(code: string): AnalysisResult {
  // Step 1: Lex
  const lexer = new Lexer(code)
  const lexResult = lexer.tokenize()
  const tokens = lexResult.tokens
  const lexerErrors = lexResult.errors

  // Early exit if lexer errors
  const diagnostics: Diagnostic[] = lexerErrors.map(e => ({
    severity: 'panic' as const,
    message: e.message,
    line: e.line,
    column: e.column,
    source: 'lexer' as const,
  }))

  if (lexerErrors.length > 0) {
    return {
      tokens,
      lexerErrors,
      program: null,
      parseErrors: [],
      popSafetyReport: null,
      lintWarnings: [],
      blockInfos: BLOCK_ORDER.map(name => ({ name, status: 'empty', startLine: 0, lineCount: 0 })),
      diagnostics,
    }
  }

  // Step 2: Parse
  const parser = new Parser(tokens)
  const parseResult = parser.parse()
  const parseErrors = parseResult.errors
  const program = parseResult.program

  diagnostics.push(...parseErrors.map(e => ({
    severity: 'panic' as const,
    message: e.message,
    line: e.line,
    column: e.column,
    hint: e.hint,
    source: 'parser' as const,
  })))

  // Step 3: Compute block infos
  const blockInfos: BlockInfo[] = BLOCK_ORDER.map(name => ({
    name,
    status: 'empty' as const,
    startLine: 0,
    lineCount: 0,
  }))

  if (program) {
    // Map blocks present in the program
    const errorLines = new Set(diagnostics.map(d => d.line))

    for (const block of program.blocks) {
      const blockName = BLOCK_TYPE_MAP[block.type]
      if (!blockName) continue

      const info = blockInfos.find(b => b.name === blockName)
      if (!info) continue

      const startLine = block.loc?.start.line ?? 0
      const endLine = block.loc?.end.line ?? 0
      info.startLine = startLine
      info.lineCount = Math.max(1, endLine - startLine + 1)

      // Check if any errors fall in this block's range
      let hasError = false
      for (const errLine of errorLines) {
        if (errLine >= startLine && errLine <= endLine) {
          hasError = true
          break
        }
      }
      info.status = hasError ? 'error' : 'content'
    }
  }

  // Step 4: Pop-safety analysis
  let popSafetyReport = null
  if (program) {
    try {
      popSafetyReport = analyzePopSafety(program)
      for (const warning of popSafetyReport.warnings) {
        diagnostics.push({
          severity: warning.severity,
          message: warning.message,
          line: warning.loc?.start.line ?? 1,
          column: warning.loc?.start.column ?? 1,
          hint: warning.hint,
          source: 'pop-safety',
        })
      }
    } catch {
      // Pop-safety analysis failed, not critical
    }
  }

  // Step 5: Lint
  let lintWarnings: LintWarning[] = []
  if (program) {
    try {
      lintWarnings = lintSTALK(program)
      for (const warning of lintWarnings) {
        diagnostics.push({
          severity: warning.severity,
          message: `[${warning.rule}] ${warning.message}`,
          line: warning.line,
          column: warning.column,
          hint: warning.hint,
          source: 'linter',
        })
      }
    } catch {
      // Linter failed, not critical
    }
  }

  // Sort diagnostics by severity (panic first) then by line
  const severityOrder = { panic: 0, pop: 1, warn: 2, info: 3 }
  diagnostics.sort((a, b) => {
    const sev = severityOrder[a.severity] - severityOrder[b.severity]
    if (sev !== 0) return sev
    return a.line - b.line
  })

  return {
    tokens,
    lexerErrors,
    program,
    parseErrors,
    popSafetyReport,
    lintWarnings,
    blockInfos,
    diagnostics,
  }
}

export function useSTALKAnalysis(code: string): AnalysisResult {
  const [result, setResult] = useState<AnalysisResult>(() => analyze(code))
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    timerRef.current = setTimeout(() => {
      setResult(analyze(code))
    }, DEBOUNCE_MS)

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [code])

  return result
}
