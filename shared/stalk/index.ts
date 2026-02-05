/**
 * STALK Language - Shared Module
 *
 * Pure TypeScript modules shared between server and frontend.
 * Does NOT include the interpreter (server-only due to bridge dependencies).
 */

// ============================================================================
// AST Types
// ============================================================================

export * from "./ast.js";

// ============================================================================
// Tokens
// ============================================================================

export { TokenType, KEYWORDS, isCapabilityKeyword, isUIElementKeyword, isActionKeyword, isTriggerKeyword } from "./tokens.js";
export type { Token } from "./tokens.js";

// ============================================================================
// Lexer
// ============================================================================

export { Lexer, tokenize } from "./lexer.js";
export type { LexerError, LexerResult } from "./lexer.js";

// ============================================================================
// Parser
// ============================================================================

export { Parser, parse } from "./parser.js";
export type { ParseError, ParseResult } from "./parser.js";

// ============================================================================
// Pop-Safety Analyzer
// ============================================================================

export {
  PopSafetyAnalyzer,
  analyzePopSafety,
  isPopSafe,
  formatDiagnostics,
} from "./pop-safety.js";

export type {
  PopWarning,
  SocialFalloutPrediction,
  PopSafetyReport,
  AnalysisContext,
} from "./pop-safety.js";

// ============================================================================
// Convenience Functions
// ============================================================================

import { Lexer } from "./lexer.js";
import { Parser } from "./parser.js";
import { analyzePopSafety } from "./pop-safety.js";
import type { Program } from "./ast.js";
import type { LexerError } from "./lexer.js";
import type { ParseError } from "./parser.js";
import type { PopSafetyReport } from "./pop-safety.js";

export interface CompileResult {
  success: boolean;
  program: Program | null;
  errors: (LexerError | ParseError)[];
}

/**
 * Compile STALK source code to AST in one step
 */
export function compile(source: string): CompileResult {
  const lexer = new Lexer(source);
  const lexResult = lexer.tokenize();

  if (lexResult.errors.length > 0) {
    return {
      success: false,
      program: null,
      errors: lexResult.errors,
    };
  }

  const parser = new Parser(lexResult.tokens);
  const parseResult = parser.parse();

  return {
    success: parseResult.program !== null && parseResult.errors.length === 0,
    program: parseResult.program,
    errors: parseResult.errors,
  };
}

/**
 * Compile and validate STALK source code with pop-safety check
 */
export function compileWithSafetyCheck(
  source: string,
  safetyThreshold = 0.5
): CompileResult & { safetyReport?: PopSafetyReport } {
  const result = compile(source);

  if (!result.success || !result.program) {
    return result;
  }

  const safetyReport = analyzePopSafety(result.program);

  if (safetyReport.score < safetyThreshold) {
    return {
      ...result,
      success: false,
      errors: [
        ...result.errors,
        {
          message: `Pop-safety score (${(safetyReport.score * 100).toFixed(0)}%) below threshold (${(safetyThreshold * 100).toFixed(0)}%)`,
          line: 1,
          column: 1,
        },
      ],
      safetyReport,
    };
  }

  return {
    ...result,
    safetyReport,
  };
}

// ============================================================================
// Version
// ============================================================================

export const STALK_VERSION = "0.1.0";
