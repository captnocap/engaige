/**
 * STALK Language Module
 *
 * Re-exports shared STALK modules and adds server-only interpreter exports.
 */

// ============================================================================
// Shared modules (tokens, ast, lexer, parser, pop-safety, compile helpers)
// ============================================================================

export * from "../../../shared/stalk/index.js";

// ============================================================================
// Interpreter (server-only - requires GameStateProvider, UIBridge, SocialBridge)
// ============================================================================

export {
  Interpreter,
  createInterpreter,
} from "./interpreter.js";

export type {
  RuntimeValue,
  GameStateProvider,
  UIBridge,
  SocialBridge,
  InterpreterConfig,
  InterpreterState,
  PredictionState,
  ExecutionResult,
  RuntimeError,
  RuntimeWarning,
  SideEffect,
} from "./interpreter.js";
