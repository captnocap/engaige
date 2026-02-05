/**
 * STALK Code Formatter
 *
 * AST-based formatting when parse succeeds, token-level fallback when it fails.
 */

import { Lexer } from '@shared/stalk/lexer.js'
import { Parser } from '@shared/stalk/parser.js'
import { TokenType, KEYWORDS } from '@shared/stalk/tokens.js'
import type { Program, Block, Expression, UIElement, UIProperty, ImpactStatement, Action, Statement, Prediction } from '@shared/stalk/ast.js'

const INDENT = '  '

// ============================================================================
// Expression to string
// ============================================================================

function formatExpr(expr: Expression): string {
  switch (expr.type) {
    case 'NumberLiteral': return String(expr.value)
    case 'StringLiteral': return `"${expr.value}"`
    case 'BooleanLiteral': return expr.value ? 'TRUE' : 'FALSE'
    case 'NullLiteral': return 'NULL'
    case 'UnknownLiteral': return 'UNKNOWN'
    case 'Identifier': return expr.name
    case 'PathExpression':
      return expr.segments.map(s => {
        if (s.type === 'PropertyAccess') return s.property
        if (s.type === 'FunctionCall') return `${s.name}(${s.arguments.map(formatExpr).join(', ')})`
        if (s.type === 'IndexAccess') return `[${formatExpr(s.index)}]`
        return ''
      }).join('.')
    case 'BinaryExpression':
      return `${formatExpr(expr.left)} ${expr.operator} ${formatExpr(expr.right)}`
    case 'UnaryExpression':
      return `${expr.operator} ${formatExpr(expr.argument)}`
    case 'ConditionalExpression':
      return `IF ${formatExpr(expr.test)} THEN ${formatExpr(expr.consequent)}${expr.alternate ? ` ELSE ${formatExpr(expr.alternate)}` : ''}`
    case 'CallExpression':
      return `${formatExpr(expr.callee)}(${expr.arguments.map(formatExpr).join(', ')})`
    case 'TupleExpression':
      return `(${expr.elements.map(formatExpr).join(', ')})`
    case 'CollectionExpression':
      return `[${expr.elements.map(formatExpr).join(', ')}]`
    case 'InterpolatedString':
      return `"${expr.parts.map(p => typeof p === 'string' ? p : `{${formatExpr(p)}}`).join('')}"`
    default:
      return '...'
  }
}

// ============================================================================
// Block formatters
// ============================================================================

function formatProperties(props: UIProperty[], depth: number): string {
  if (props.length === 0) return ''
  const indent = INDENT.repeat(depth)
  const maxNameLen = Math.max(...props.map(p => p.name.length))
  return props.map(p => {
    const padded = p.name.padEnd(maxNameLen)
    return `${indent}${padded} = ${formatExpr(p.value)}`
  }).join('\n')
}

function formatAction(action: Action | Statement, depth: number): string {
  const indent = INDENT.repeat(depth)

  switch (action.type) {
    case 'PrintAction':
      return `${indent}PRINT ${formatExpr(action.message)}`
    case 'FlashAction':
      return `${indent}FLASH ${formatExpr(action.elementId)}`
    case 'SoundAction':
      return `${indent}SOUND ${formatExpr(action.sound)}`
    case 'NotifyAction':
    case 'ToastAction': {
      const keyword = action.type === 'NotifyAction' ? 'NOTIFY' : 'TOAST'
      const propStr = formatProperties(action.properties, depth + 1)
      return `${indent}${keyword} {\n${propStr}\n${indent}}`
    }
    case 'PostAction': {
      const propStr = formatProperties(action.properties, depth + 1)
      return `${indent}POST TO ${formatExpr(action.platform)} {\n${propStr}\n${indent}}`
    }
    case 'DMAction': {
      const propStr = formatProperties(action.properties, depth + 1)
      return `${indent}DM TO ${formatExpr(action.recipient)} {\n${propStr}\n${indent}}`
    }
    case 'ReactAction':
      return `${indent}REACT TO ${formatExpr(action.target)} WITH ${formatExpr(action.reaction)}`
    case 'PropertyAssignment':
      return `${indent}${formatExpr(action.path)} ${action.operator} ${formatExpr(action.value)}`
    case 'ForLoop': {
      const bodyStr = action.body.map(s => formatAction(s, depth + 1)).join('\n')
      return `${indent}FOR ${action.variable} IN ${formatExpr(action.collection)} {\n${bodyStr}\n${indent}}`
    }
    case 'IfStatement': {
      const consStr = action.consequent.map(s => formatAction(s, depth + 1)).join('\n')
      let result = `${indent}IF ${formatExpr(action.condition)} {\n${consStr}\n${indent}}`
      if (action.alternate) {
        const altStr = action.alternate.map(s => formatAction(s, depth + 1)).join('\n')
        result += ` ELSE {\n${altStr}\n${indent}}`
      }
      return result
    }
    case 'Assignment':
      return `${indent}${action.identifier} = ${formatExpr(action.value)}`
    default:
      return `${indent}// unknown action`
  }
}

function formatImpactStatement(stmt: ImpactStatement, depth: number): string {
  if (stmt.type === 'EventHandler') {
    const indent = INDENT.repeat(depth)
    let triggerStr = ''
    switch (stmt.trigger.type) {
      case 'TickTrigger': triggerStr = 'TICK'; break
      case 'ClickTrigger': triggerStr = `CLICK "${stmt.trigger.elementId}"`; break
      case 'ChangeTrigger': triggerStr = `CHANGE "${stmt.trigger.elementId}"`; break
      case 'SubmitTrigger': triggerStr = 'SUBMIT'; break
      case 'ConditionTrigger': triggerStr = formatExpr(stmt.trigger.condition); break
    }
    const bodyStr = stmt.body.map(s => formatAction(s, depth + 1)).join('\n')
    return `${indent}ON ${triggerStr} {\n${bodyStr}\n${indent}}`
  }
  return formatAction(stmt, depth)
}

function formatBlock(block: Block): string {
  switch (block.type) {
    case 'RequireBlock': {
      const caps = block.capabilities.map(c => `${INDENT}${c.capability}`).join('\n')
      return `REQUIRE {\n${caps}\n}`
    }
    case 'ConfigBlock': {
      const maxNameLen = Math.max(...block.assignments.map(a => a.identifier.length), 0)
      const assigns = block.assignments.map(a => {
        const padded = a.identifier.padEnd(maxNameLen)
        return `${INDENT}${padded} = ${formatExpr(a.value)}`
      }).join('\n')
      return `CONFIG {\n${assigns}\n}`
    }
    case 'ObserveBlock': {
      const maxNameLen = Math.max(...block.statements.map(s => s.identifier.length), 0)
      const stmts = block.statements.map(s => {
        const padded = s.identifier.padEnd(maxNameLen)
        return `${INDENT}${padded} = ${formatExpr(s.value)}`
      }).join('\n')
      return `OBSERVE {\n${stmts}\n}`
    }
    case 'PredictBlock': {
      const preds = block.predictions.map(p => {
        let str = `${INDENT}${p.identifier} = ${formatExpr(p.value)}`
        if (p.confidence) str += `\n${INDENT}CONFIDENCE = ${formatExpr(p.confidence)}`
        if (p.evidence) str += `\n${INDENT}EVIDENCE = ${formatExpr(p.evidence)}`
        if (p.timeframe) str += `\n${INDENT}TIMEFRAME = ${formatExpr(p.timeframe)}`
        return str
      }).join('\n\n')
      return `PREDICT {\n${preds}\n}`
    }
    case 'DeclareBlock': {
      const elems = block.elements.map(el => {
        const keyword = el.type.replace('Element', '').toUpperCase()
        const propStr = formatProperties(el.properties, 2)
        return `${INDENT}${keyword} {\n${propStr}\n${INDENT}}`
      }).join('\n\n')
      return `DECLARE {\n${elems}\n}`
    }
    case 'ImpactBlock': {
      const stmts = block.statements.map(s => formatImpactStatement(s, 1)).join('\n\n')
      return `IMPACT {\n${stmts}\n}`
    }
    case 'DisclaimerBlock': {
      const discs = block.disclaimers.map(d => `${INDENT}"${d}"`).join('\n')
      return `DISCLAIMER {\n${discs}\n}`
    }
  }
}

// ============================================================================
// AST-based formatter (when parse succeeds)
// ============================================================================

function formatFromAST(program: Program): string {
  const parts: string[] = []
  parts.push(`STALK "${program.name}" {`)
  parts.push('')

  for (const block of program.blocks) {
    parts.push(formatBlock(block))
    parts.push('')
  }

  parts.push('}')
  return parts.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd() + '\n'
}

// ============================================================================
// Token-level formatter (fallback when parse fails)
// ============================================================================

function formatFromTokens(code: string): string {
  const lexer = new Lexer(code)
  const result = lexer.tokenize()
  const lines = code.split('\n')

  // Simple formatting: uppercase keywords, trim trailing whitespace
  const formatted = lines.map(line => {
    let result = line

    // Uppercase known keywords
    const words = result.match(/\b[a-zA-Z_]+\b/g) || []
    for (const word of words) {
      if (KEYWORDS[word.toUpperCase()]) {
        result = result.replace(new RegExp(`\\b${word}\\b`), word.toUpperCase())
      }
    }

    return result.trimEnd()
  })

  return formatted.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd() + '\n'
}

// ============================================================================
// Public API
// ============================================================================

export function formatSTALK(code: string): string {
  // Try AST-based formatting
  const lexer = new Lexer(code)
  const lexResult = lexer.tokenize()

  if (lexResult.errors.length === 0) {
    const parser = new Parser(lexResult.tokens)
    const parseResult = parser.parse()

    if (parseResult.program && parseResult.errors.length === 0) {
      return formatFromAST(parseResult.program)
    }
  }

  // Fall back to token-level formatting
  return formatFromTokens(code)
}
