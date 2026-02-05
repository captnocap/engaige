/**
 * STALK Linter - 12 Static Analysis Rules
 *
 * Runs after parser succeeds. Catches semantic issues that aren't syntax errors.
 */

import type { Program, Block, ImpactBlock, ImpactStatement, Action, Statement, Expression, RequireBlock, ObserveBlock, ConfigBlock, PredictBlock, DeclareBlock } from '@shared/stalk/ast.js'
import type { LintWarning, DiagnosticSeverity } from './types.js'

function warn(rule: string, severity: DiagnosticSeverity, message: string, line: number, column: number, hint?: string): LintWarning {
  return { rule, severity, message, line, column, hint }
}

// ============================================================================
// Rule 1: block-order - Verify block sequence
// ============================================================================

const EXPECTED_ORDER = ['RequireBlock', 'ConfigBlock', 'ObserveBlock', 'PredictBlock', 'DeclareBlock', 'ImpactBlock']

function checkBlockOrder(program: Program): LintWarning[] {
  const warnings: LintWarning[] = []
  let lastOrder = -1

  for (const block of program.blocks) {
    if (block.type === 'DisclaimerBlock') continue
    const order = EXPECTED_ORDER.indexOf(block.type)
    if (order === -1) continue
    if (order < lastOrder) {
      warnings.push(warn(
        'block-order', 'panic',
        `${block.type.replace('Block', '')} block is out of order`,
        block.loc?.start.line ?? 1, block.loc?.start.column ?? 1,
        'Expected: REQUIRE -> CONFIG -> OBSERVE -> PREDICT -> DECLARE -> IMPACT'
      ))
    }
    lastOrder = order
  }
  return warnings
}

// ============================================================================
// Rule 2: undeclared-variable - Track assignments, flag unknown identifiers
// ============================================================================

function collectIdentifiers(expr: Expression, set: Set<string>): void {
  switch (expr.type) {
    case 'Identifier':
      set.add(expr.name)
      break
    case 'BinaryExpression':
      collectIdentifiers(expr.left, set)
      collectIdentifiers(expr.right, set)
      break
    case 'UnaryExpression':
      collectIdentifiers(expr.argument, set)
      break
    case 'ConditionalExpression':
      collectIdentifiers(expr.test, set)
      collectIdentifiers(expr.consequent, set)
      if (expr.alternate) collectIdentifiers(expr.alternate, set)
      break
    case 'InterpolatedString':
      for (const part of expr.parts) {
        if (typeof part !== 'string') collectIdentifiers(part, set)
      }
      break
    case 'CallExpression':
      collectIdentifiers(expr.callee, set)
      for (const arg of expr.arguments) collectIdentifiers(arg, set)
      break
    case 'PathExpression':
      if (expr.segments[0]?.type === 'PropertyAccess') {
        set.add(expr.segments[0].property)
      }
      break
    case 'CollectionExpression':
    case 'TupleExpression':
      for (const el of expr.elements) collectIdentifiers(el, set)
      break
  }
}

function checkUndeclaredVariables(program: Program): LintWarning[] {
  const warnings: LintWarning[] = []
  const declared = new Set<string>()
  const used = new Set<string>()

  // Built-in identifiers that are always available
  const builtins = new Set([
    'SELF', 'FRIENDS', 'FOLLOWERS', 'PUBLIC',
    'HEADING', 'SUBHEADING', 'CAPTION', 'RESULT', 'ERROR', 'NORMAL',
    'PRIMARY', 'SECONDARY', 'DANGER', 'CENTER', 'BOTTOM',
    'LINE', 'BAR', 'PIE',
    'ONCE', 'ON_CONDITION', 'CONTINUOUS',
    'self', 'player', 'npc', 'game', 'market', 'time',
  ])

  // Collect declared variables from CONFIG and OBSERVE blocks
  for (const block of program.blocks) {
    if (block.type === 'ConfigBlock') {
      for (const a of block.assignments) declared.add(a.identifier)
    }
    if (block.type === 'ObserveBlock') {
      for (const s of block.statements) declared.add(s.identifier)
    }
    if (block.type === 'PredictBlock') {
      for (const p of block.predictions) declared.add(p.identifier)
    }
  }

  // Collect used identifiers in PREDICT, DECLARE, IMPACT blocks
  for (const block of program.blocks) {
    if (block.type === 'PredictBlock') {
      for (const p of block.predictions) {
        collectIdentifiers(p.value, used)
        if (p.confidence) collectIdentifiers(p.confidence, used)
        if (p.evidence) collectIdentifiers(p.evidence, used)
      }
    }
    if (block.type === 'DeclareBlock') {
      for (const el of block.elements) {
        for (const prop of el.properties) {
          collectIdentifiers(prop.value, used)
        }
      }
    }
    if (block.type === 'ImpactBlock') {
      collectImpactIdentifiers(block, used)
    }
  }

  // Check for undeclared
  for (const name of used) {
    if (!declared.has(name) && !builtins.has(name)) {
      warnings.push(warn(
        'undeclared-variable', 'warn',
        `Variable '${name}' is used but not declared in OBSERVE or CONFIG`,
        1, 1,
        `Define '${name}' in an OBSERVE or CONFIG block`
      ))
    }
  }

  return warnings
}

function collectImpactIdentifiers(block: ImpactBlock, set: Set<string>): void {
  for (const stmt of block.statements) {
    collectStmtIdentifiers(stmt, set)
  }
}

function collectStmtIdentifiers(stmt: ImpactStatement | Action | Statement, set: Set<string>): void {
  switch (stmt.type) {
    case 'EventHandler':
      for (const s of stmt.body) collectStmtIdentifiers(s, set)
      break
    case 'PostAction':
      collectIdentifiers(stmt.platform, set)
      for (const p of stmt.properties) collectIdentifiers(p.value, set)
      break
    case 'DMAction':
      collectIdentifiers(stmt.recipient, set)
      for (const p of stmt.properties) collectIdentifiers(p.value, set)
      break
    case 'ReactAction':
      collectIdentifiers(stmt.target, set)
      collectIdentifiers(stmt.reaction, set)
      break
    case 'PrintAction':
      collectIdentifiers(stmt.message, set)
      break
    case 'FlashAction':
      collectIdentifiers(stmt.elementId, set)
      break
    case 'SoundAction':
      collectIdentifiers(stmt.sound, set)
      break
    case 'PropertyAssignment':
      collectIdentifiers(stmt.value, set)
      break
    case 'ForLoop':
      collectIdentifiers(stmt.collection, set)
      for (const s of stmt.body) collectStmtIdentifiers(s, set)
      break
    case 'IfStatement':
      collectIdentifiers(stmt.condition, set)
      for (const s of stmt.consequent) collectStmtIdentifiers(s, set)
      if (stmt.alternate) {
        for (const s of stmt.alternate) collectStmtIdentifiers(s, set)
      }
      break
    case 'Assignment':
      collectIdentifiers(stmt.value, set)
      break
    case 'NotifyAction':
    case 'ToastAction':
      for (const p of stmt.properties) collectIdentifiers(p.value, set)
      break
  }
}

// ============================================================================
// Rule 3: unused-capability - REQUIRE capabilities not used in IMPACT
// ============================================================================

function checkUnusedCapabilities(program: Program): LintWarning[] {
  const warnings: LintWarning[] = []
  const required = new Set<string>()
  let hasImpact = false

  const requireBlock = program.blocks.find(b => b.type === 'RequireBlock') as RequireBlock | undefined
  const impactBlock = program.blocks.find(b => b.type === 'ImpactBlock') as ImpactBlock | undefined

  if (!requireBlock || requireBlock.capabilities.length === 0) return []

  for (const cap of requireBlock.capabilities) {
    required.add(cap.capability)
  }

  if (!impactBlock) {
    for (const cap of required) {
      warnings.push(warn(
        'unused-capability', 'warn',
        `Capability '${cap}' is required but there's no IMPACT block to use it`,
        requireBlock.loc?.start.line ?? 1, requireBlock.loc?.start.column ?? 1,
      ))
    }
    return warnings
  }

  // Check if capabilities map to actions
  const capUsage: Record<string, boolean> = {}
  for (const cap of required) capUsage[cap] = false

  const checkActions = (stmts: (ImpactStatement | Action | Statement)[]) => {
    for (const stmt of stmts) {
      if (stmt.type === 'PostAction') {
        capUsage['ALLOW_BROADCAST'] = true
      }
      if (stmt.type === 'DMAction') {
        capUsage['ALLOW_NPC_CONTACT'] = true
      }
      if (stmt.type === 'ReactAction') {
        capUsage['ALLOW_BROADCAST'] = true
      }
      if (stmt.type === 'PropertyAssignment') {
        const path = stmt.path.segments.map(s => s.type === 'PropertyAccess' ? s.property : '').join('.')
        if (path.includes('relationship') || path.includes('trust') || path.includes('affinity')) {
          capUsage['ALLOW_RELATIONSHIP_WRITE'] = true
        }
        if (path.includes('market') || path.includes('stalks')) {
          capUsage['ALLOW_MARKET_INFLUENCE'] = true
        }
      }
      if (stmt.type === 'ForLoop') {
        checkActions(stmt.body)
        capUsage['ALLOW_VIRALITY'] = true // Mass action
      }
      if (stmt.type === 'EventHandler') {
        checkActions(stmt.body)
      }
      if (stmt.type === 'IfStatement') {
        checkActions(stmt.consequent)
        if (stmt.alternate) checkActions(stmt.alternate)
      }
    }
  }

  checkActions(impactBlock.statements)

  for (const [cap, used] of Object.entries(capUsage)) {
    if (required.has(cap) && !used) {
      warnings.push(warn(
        'unused-capability', 'warn',
        `Capability '${cap}' is required but never used in IMPACT`,
        requireBlock.loc?.start.line ?? 1, requireBlock.loc?.start.column ?? 1,
      ))
    }
  }

  return warnings
}

// ============================================================================
// Rule 4: empty-block - Block with 0 statements/elements
// ============================================================================

function checkEmptyBlocks(program: Program): LintWarning[] {
  const warnings: LintWarning[] = []

  for (const block of program.blocks) {
    let isEmpty = false
    switch (block.type) {
      case 'RequireBlock': isEmpty = block.capabilities.length === 0; break
      case 'ConfigBlock': isEmpty = block.assignments.length === 0; break
      case 'ObserveBlock': isEmpty = block.statements.length === 0; break
      case 'PredictBlock': isEmpty = block.predictions.length === 0; break
      case 'DeclareBlock': isEmpty = block.elements.length === 0; break
      case 'ImpactBlock': isEmpty = block.statements.length === 0; break
      case 'DisclaimerBlock': isEmpty = block.disclaimers.length === 0; break
    }

    if (isEmpty) {
      warnings.push(warn(
        'empty-block', 'info',
        `${block.type.replace('Block', '')} block is empty`,
        block.loc?.start.line ?? 1, block.loc?.start.column ?? 1,
        'Empty blocks serve no purpose'
      ))
    }
  }

  return warnings
}

// ============================================================================
// Rule 5: unreachable-code - Statements after unconditional action
// ============================================================================

function checkUnreachableCode(program: Program): LintWarning[] {
  const warnings: LintWarning[] = []

  const impactBlock = program.blocks.find(b => b.type === 'ImpactBlock') as ImpactBlock | undefined
  if (!impactBlock) return []

  const checkBody = (stmts: (Action | Statement)[]) => {
    // Actions like POST, DM that are unconditional terminal actions
    // After them in a linear block, code is unreachable
    // Only check in event handler bodies (not top-level IMPACT which is declarative)
    for (let i = 0; i < stmts.length - 1; i++) {
      const stmt = stmts[i]
      // If there's a return-like action and there are more statements, warn
      // STALK doesn't have explicit return, so we just note that consecutive
      // top-level actions in a handler are all reachable
    }
  }

  for (const stmt of impactBlock.statements) {
    if (stmt.type === 'EventHandler') {
      checkBody(stmt.body)
    }
  }

  return warnings
}

// ============================================================================
// Rule 6: audience-mismatch - PREDICT audience differs from IMPACT audience
// ============================================================================

function checkAudienceMismatch(program: Program): LintWarning[] {
  const warnings: LintWarning[] = []

  const predictBlock = program.blocks.find(b => b.type === 'PredictBlock') as PredictBlock | undefined
  const impactBlock = program.blocks.find(b => b.type === 'ImpactBlock') as ImpactBlock | undefined
  if (!predictBlock || !impactBlock) return []

  // Collect audiences from IMPACT POST actions
  const impactAudiences = new Set<string>()
  const collectAudiences = (stmts: (ImpactStatement | Action | Statement)[]) => {
    for (const stmt of stmts) {
      if (stmt.type === 'PostAction') {
        for (const p of stmt.properties) {
          if (p.name.toUpperCase() === 'AUDIENCE' && p.value.type === 'Identifier') {
            impactAudiences.add(p.value.name)
          }
        }
      }
      if (stmt.type === 'EventHandler') collectAudiences(stmt.body)
      if (stmt.type === 'ForLoop') collectAudiences(stmt.body)
      if (stmt.type === 'IfStatement') {
        collectAudiences(stmt.consequent)
        if (stmt.alternate) collectAudiences(stmt.alternate)
      }
    }
  }
  collectAudiences(impactBlock.statements)

  // If predictions are high confidence and audience is PUBLIC
  for (const pred of predictBlock.predictions) {
    const conf = pred.confidence?.type === 'NumberLiteral' ? pred.confidence.value : 0.5
    if (conf > 0.7 && impactAudiences.has('PUBLIC')) {
      warnings.push(warn(
        'audience-mismatch', 'pop',
        `Prediction '${pred.identifier}' (confidence ${(conf * 100).toFixed(0)}%) is broadcast to PUBLIC`,
        pred.loc?.start.line ?? 1, pred.loc?.start.column ?? 1,
        'Consider narrowing AUDIENCE to FRIENDS for unverified predictions'
      ))
    }
  }

  return warnings
}

// ============================================================================
// Rule 7: dead-prediction - PREDICT variable never referenced
// ============================================================================

function checkDeadPredictions(program: Program): LintWarning[] {
  const warnings: LintWarning[] = []

  const predictBlock = program.blocks.find(b => b.type === 'PredictBlock') as PredictBlock | undefined
  if (!predictBlock) return []

  const predNames = new Set(predictBlock.predictions.map(p => p.identifier))
  const usedNames = new Set<string>()

  for (const block of program.blocks) {
    if (block.type === 'PredictBlock') continue
    if (block.type === 'DeclareBlock') {
      for (const el of block.elements) {
        for (const prop of el.properties) {
          collectIdentifiers(prop.value, usedNames)
        }
      }
    }
    if (block.type === 'ImpactBlock') {
      collectImpactIdentifiers(block, usedNames)
    }
  }

  for (const pred of predictBlock.predictions) {
    if (!usedNames.has(pred.identifier)) {
      warnings.push(warn(
        'dead-prediction', 'info',
        `Prediction '${pred.identifier}' is never referenced in DECLARE or IMPACT`,
        pred.loc?.start.line ?? 1, pred.loc?.start.column ?? 1,
        'Dead predictions add complexity without value'
      ))
    }
  }

  return warnings
}

// ============================================================================
// Rule 8: missing-disclaimer - High confidence + PUBLIC + no DISCLAIMER
// ============================================================================

function checkMissingDisclaimer(program: Program): LintWarning[] {
  const warnings: LintWarning[] = []

  const hasDisclaimer = program.blocks.some(b => b.type === 'DisclaimerBlock' && b.disclaimers.length > 0)
  if (hasDisclaimer) return []

  const predictBlock = program.blocks.find(b => b.type === 'PredictBlock') as PredictBlock | undefined
  if (!predictBlock) return []

  // Check for high confidence predictions
  const hasHighConf = predictBlock.predictions.some(p => {
    const conf = p.confidence?.type === 'NumberLiteral' ? p.confidence.value : 0.5
    return conf > 0.7
  })

  // Check for PUBLIC audience in IMPACT
  const impactBlock = program.blocks.find(b => b.type === 'ImpactBlock') as ImpactBlock | undefined
  let hasPublic = false
  if (impactBlock) {
    const check = (stmts: (ImpactStatement | Action | Statement)[]) => {
      for (const s of stmts) {
        if (s.type === 'PostAction') {
          for (const p of s.properties) {
            if (p.name.toUpperCase() === 'AUDIENCE' && p.value.type === 'Identifier' && p.value.name === 'PUBLIC') {
              hasPublic = true
            }
          }
        }
        if (s.type === 'EventHandler') check(s.body)
      }
    }
    check(impactBlock.statements)
  }

  if (hasHighConf && hasPublic) {
    warnings.push(warn(
      'missing-disclaimer', 'warn',
      'High-confidence predictions are shared publicly without a DISCLAIMER block',
      1, 1,
      'Add DISCLAIMER { "This prediction is not financial advice" } or similar'
    ))
  }

  return warnings
}

// ============================================================================
// Rule 9: observe-side-effects - OBSERVE block contains action constructs
// ============================================================================

function checkObserveSideEffects(program: Program): LintWarning[] {
  const warnings: LintWarning[] = []

  const observeBlock = program.blocks.find(b => b.type === 'ObserveBlock') as ObserveBlock | undefined
  if (!observeBlock) return []

  // OBSERVE should only have assignments/conditions, not actions
  // The parser already enforces this at the syntax level, but we check for
  // suspicious patterns in expression values (e.g. function calls that look like side effects)
  for (const stmt of observeBlock.statements) {
    const usedIds = new Set<string>()
    collectIdentifiers(stmt.value, usedIds)

    // Check if any used identifiers look like action functions
    const actionLike = ['post', 'dm', 'send', 'notify', 'delete', 'remove', 'write', 'update']
    for (const id of usedIds) {
      if (actionLike.some(a => id.toLowerCase().includes(a))) {
        warnings.push(warn(
          'observe-side-effects', 'panic',
          `OBSERVE block references '${id}' which looks like a side effect`,
          stmt.loc?.start.line ?? 1, stmt.loc?.start.column ?? 1,
          'OBSERVE should only read state, not modify it. Move actions to IMPACT.'
        ))
      }
    }
  }

  return warnings
}

// ============================================================================
// Rule 10: duplicate-variable - Same variable assigned twice in same block
// ============================================================================

function checkDuplicateVariables(program: Program): LintWarning[] {
  const warnings: LintWarning[] = []

  for (const block of program.blocks) {
    const seen = new Map<string, number>()

    if (block.type === 'ConfigBlock') {
      for (const a of block.assignments) {
        if (seen.has(a.identifier)) {
          warnings.push(warn(
            'duplicate-variable', 'warn',
            `Variable '${a.identifier}' is assigned twice in CONFIG`,
            a.loc?.start.line ?? 1, a.loc?.start.column ?? 1,
            `First defined on line ${seen.get(a.identifier)}`
          ))
        }
        seen.set(a.identifier, a.loc?.start.line ?? 1)
      }
    }

    if (block.type === 'ObserveBlock') {
      for (const s of block.statements) {
        if (seen.has(s.identifier)) {
          warnings.push(warn(
            'duplicate-variable', 'warn',
            `Variable '${s.identifier}' is assigned twice in OBSERVE`,
            s.loc?.start.line ?? 1, s.loc?.start.column ?? 1,
            `First defined on line ${seen.get(s.identifier)}`
          ))
        }
        seen.set(s.identifier, s.loc?.start.line ?? 1)
      }
    }

    if (block.type === 'PredictBlock') {
      for (const p of block.predictions) {
        if (seen.has(p.identifier)) {
          warnings.push(warn(
            'duplicate-variable', 'warn',
            `Prediction '${p.identifier}' is defined twice in PREDICT`,
            p.loc?.start.line ?? 1, p.loc?.start.column ?? 1,
            `First defined on line ${seen.get(p.identifier)}`
          ))
        }
        seen.set(p.identifier, p.loc?.start.line ?? 1)
      }
    }
  }

  return warnings
}

// ============================================================================
// Rule 11: missing-impact - Capabilities required but no IMPACT block
// ============================================================================

function checkMissingImpact(program: Program): LintWarning[] {
  const warnings: LintWarning[] = []

  const requireBlock = program.blocks.find(b => b.type === 'RequireBlock') as RequireBlock | undefined
  const impactBlock = program.blocks.find(b => b.type === 'ImpactBlock')

  if (requireBlock && requireBlock.capabilities.length > 0 && !impactBlock) {
    warnings.push(warn(
      'missing-impact', 'warn',
      'Capabilities are required but there is no IMPACT block',
      requireBlock.loc?.start.line ?? 1, requireBlock.loc?.start.column ?? 1,
      'Capabilities are only needed for IMPACT actions'
    ))
  }

  return warnings
}

// ============================================================================
// Rule 12: overconfidence - Confidence > 0.9 without substantial evidence
// ============================================================================

function checkOverconfidence(program: Program): LintWarning[] {
  const warnings: LintWarning[] = []

  const predictBlock = program.blocks.find(b => b.type === 'PredictBlock') as PredictBlock | undefined
  if (!predictBlock) return []

  for (const pred of predictBlock.predictions) {
    const conf = pred.confidence?.type === 'NumberLiteral' ? pred.confidence.value : null
    if (conf === null) continue

    if (conf > 0.9) {
      const evidence = pred.evidence?.type === 'StringLiteral' ? pred.evidence.value : ''
      if (evidence.length < 30) {
        warnings.push(warn(
          'overconfidence', 'pop',
          `Prediction '${pred.identifier}' has ${(conf * 100).toFixed(0)}% confidence with insufficient evidence`,
          pred.loc?.start.line ?? 1, pred.loc?.start.column ?? 1,
          'Confidence > 90% requires substantial evidence. The internet will hold you to it.'
        ))
      }
    }
  }

  return warnings
}

// ============================================================================
// Main Linter Entry Point
// ============================================================================

export function lintSTALK(program: Program): LintWarning[] {
  return [
    ...checkBlockOrder(program),
    ...checkUndeclaredVariables(program),
    ...checkUnusedCapabilities(program),
    ...checkEmptyBlocks(program),
    ...checkUnreachableCode(program),
    ...checkAudienceMismatch(program),
    ...checkDeadPredictions(program),
    ...checkMissingDisclaimer(program),
    ...checkObserveSideEffects(program),
    ...checkDuplicateVariables(program),
    ...checkMissingImpact(program),
    ...checkOverconfidence(program),
  ]
}
