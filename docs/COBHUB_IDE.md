# CobHub IDE Documentation

## Overview

**CobHub IDE** is an in-game, VSCode-like code editor for authoring **STALK** (Situational Tool Authoring for Lightweight Kernels) scripts. It is branded as a CobHub product—an in-game parody of GitHub—and provides a complete development environment with real-time syntax highlighting, diagnostics, pop-safety analysis, and artifact preview.

The IDE is accessible via a desktop icon (corn emoji) and runs as a draggable, resizable window on the desktop environment.

### Key Features

- **Syntax Highlighting** - Token-colored code with real-time updates
- **Error/Warning Diagnostics** - 12 static analysis lint rules with severity levels
- **Pop-Safety Analysis** - Real-time safety gauge showing pop-safety score
- **Block Navigator** - Sidebar with visual status indicators for STALK blocks
- **Artifact Preview** - Live UI preview of DECLARE block outputs
- **Dark Theme** - CobHub-branded dark theme with corn-gold accents
- **Code Formatting** - AST-based formatter with token-level fallback
- **Line Numbers & Gutter** - VSCode-style line numbering

---

## Architecture

### Shared STALK Modules

The STALK language compiler is implemented as **pure TypeScript modules** with zero server dependencies, enabling code sharing between frontend (IDE) and backend (interpreter).

**Shared Module Files** (`shared/stalk/`)

```
shared/stalk/
├── tokens.ts              # Token type definitions and token factory
├── ast.ts                 # AST node interfaces and AST builders
├── lexer.ts               # Lexical analysis (text → tokens)
├── parser.ts              # Syntax analysis (tokens → AST)
├── pop-safety.ts          # Pop-safety score analyzer
└── index.ts               # Barrel export (no interpreter)
```

**Server-Only Re-export** (`server/src/stalk/index.ts`)

The server re-exports all shared modules plus adds the interpreter (which requires database access):

```typescript
// Re-export pure shared modules
export * from '../../../shared/stalk/index.js';

// Add server-only interpreter
export { STALKInterpreter } from './interpreter.js';
```

**Key Decisions**

1. **Parser Fix** - Line 1170 in `parser.ts` previously used `require()` for Lexer. Now uses static ES module import.
2. **AST Analysis Fix** - Line 155 in original `index.ts` previously used `require()` for pop-safety analysis. Now uses static import.
3. **Vite Alias** - `@shared` resolves to `shared/` directory for clean frontend imports
4. **tsconfig.json Updates** - Both `include` and `compilerOptions.paths` updated to support shared modules

**Frontend Import Pattern**

```typescript
import {
  Lexer,
  Parser,
  analyzePopSafety,
  type Token,
  type ASTProgram,
} from '@shared/stalk/index.js';
```

---

### IDE Components

The IDE is composed of 13 modular, single-responsibility components in `src/components/ide/`:

#### **CobHubIDE.tsx** (Main Container)

```typescript
// props: windowProps (title, z-index, onClose), defaultCode
// Default open with hello-world STALK example
// Manages layout, coordinates all sub-components
// Stores: editor state, window dimensions, scroll position
```

- Main window component and layout coordinator
- Default code: Hello-world STALK example
- Manages editor state, window props (title, close)
- Renders 4-pane layout: BlockNavigator + EditorPane + ArtifactPanel + DiagnosticsPanel

#### **EditorPane.tsx** (Code Input & Line Numbers)

```typescript
// props: code, onChange, diagnostics, lineCount
// Renders: textarea + syntax-highlighted overlay + line number gutter
// Features: line wrapping, syntax highlighting sync, scroll lock
```

- Core text editor component
- Textarea for raw input with transparent background
- Syntax-highlighted overlay (read-only) behind textarea for visual effect
- Line number gutter showing 1-based line numbers
- Scroll position synchronized between textarea and highlighter

#### **SyntaxHighlighter.tsx** (Token-to-Span Renderer)

```typescript
// props: code, tokens, className
// Renders: <span> per token, colored per token type
// Handles: missing line tokens, mixed line content
```

- Takes token array from lexer
- Creates colored `<span>` for each token
- Maps token colors from theme
- Handles edge cases: missing lines, mixed content on same line

#### **DiagnosticsPanel.tsx** (Error/Warning Table)

```typescript
// props: diagnostics (severity, line, column, rule, message)
// Features: sortable by line, clickable to jump to line
// Shows: 12 lint rule violations with full details
```

- Bottom panel showing all errors, warnings, infos
- Table format: Line | Col | Severity | Rule | Message
- Click row to jump to line in editor
- Sorts by line number by default

#### **BlockNavigator.tsx** (Sidebar Block Status)

```typescript
// props: ast, diagnostics
// Shows: STALK block tree with indicators
// Indicators: ✓ (clean), ⚠ (warning), ✗ (error)
// Drilldown: Click block to jump to definition
```

- Sidebar (left side) showing block hierarchy
- Block types: STALK, PREDICT, IMPACT, DECLARE
- Visual indicators per block:
  - `✓` Green (no issues)
  - `⚠` Yellow (warnings)
  - `✗` Red (errors)
- Click block name to jump to line in editor

#### **PopSafetyGauge.tsx** (Semi-Circular Arc)

```typescript
// props: score (0-1), showLabel (optional)
// Renders: SVG semi-circular gauge
// Colors: Red (0.0) → Yellow (0.5) → Green (1.0)
// Sizing: 120px diameter, responsive
```

- SVG semi-circular progress arc
- Score range: 0.0 (unsafe) → 1.0 (safe)
- Color gradient: Red → Yellow → Green
- Smooth SVG transitions
- Optional numeric label (e.g., "0.87")

#### **ArtifactPanel.tsx** (DECLARE Preview)

```typescript
// props: declareBlock (if found in AST)
// Shows: live UI elements from DECLARE block
// Examples: WINDOW { TEXT "Hello", BUTTON "Click" }
// Updates: in real-time as code changes
```

- Right panel showing live artifact preview
- Renders DECLARE block outputs as actual UI elements
- Example renderers:
  - WINDOW → Bordered div with title
  - TEXT → Paragraph with content
  - BUTTON → Styled button with label
  - LIST → Ul/li structure
- Live updates as code changes

#### **useSTALKAnalysis.ts** (Core Analysis Hook)

```typescript
// Debounce: 400ms
// Pipeline: Lexer → Parser → PopSafetyAnalyzer → Linter
// Returns: { tokens, ast, diagnostics, popSafety }
// All sync, no server calls
```

The central hook orchestrating the entire analysis pipeline:

1. **Lexing** - Convert code string to tokens
2. **Parsing** - Convert tokens to AST (with error recovery)
3. **Pop-Safety Analysis** - Calculate safety score per DECLARE block
4. **Linting** - Apply 12 rules, collect diagnostics with locations

```typescript
const { tokens, ast, diagnostics, popSafety } = useSTALKAnalysis(code);
```

- Debounces at 400ms to prevent lag while typing
- All operations are synchronous (pure CPU)
- No server calls, no async operations
- Errors in any stage caught and displayed in diagnostics

#### **stalk-theme.ts** (Color Definitions)

```typescript
// Token colors: keyword, logic, ui, action, capability, string, number, comment
// Background: GitHub dark #0d1117
// Accents: Corn-gold for CobHub branding
```

Dark theme inspired by GitHub's UI:

```typescript
const STALK_THEME = {
  background: '#0d1117',
  foreground: '#c9d1d9',

  token: {
    blockKeyword: '#f0b429',    // STALK, REQUIRE, DECLARE - corn-gold
    logic: '#ff7b72',           // IF, THEN, ELSE, SWITCH
    ui: '#7ee787',              // WINDOW, TEXT, BUTTON, LIST
    action: '#d2a8ff',          // POST, DM, REACT, SEND
    capability: '#ffa657',      // ALLOW_*, capability identifiers
    string: '#a5d6ff',          // "string literals"
    number: '#79c0ff',          // 42, 3.14
    comment: '#8b949e',         // // comments
  },
};
```

**Token Color Mapping**

| Token Type         | Color    | Examples                                  |
| ------------------ | -------- | ----------------------------------------- |
| Block Keywords     | Gold     | STALK, REQUIRE, IMPACT, DECLARE, PREDICT |
| Logic              | Coral    | IF, THEN, ELSE, SWITCH, CASE, DEFAULT   |
| UI Elements        | Green    | WINDOW, TEXT, BUTTON, LIST, INPUT       |
| Actions            | Purple   | POST, DM, REACT, SEND, OBSERVE          |
| Capabilities       | Orange   | ALLOW_*, capability identifiers          |
| Strings            | Light Blue | "string literals", 'quoted'             |
| Numbers            | Blue     | 42, 3.14, 0.95                           |
| Comments           | Gray     | // comment lines                          |
| Background         | Dark     | #0d1117 (GitHub dark)                    |

#### **stalk-formatter.ts** (AST-Based Formatter)

```typescript
// Input: code string or AST
// Output: formatted code with consistent indentation
// Fallback: Token-level formatting if AST unavailable
// Rules: 2-space indent, newline before blocks
```

Code formatter with two strategies:

1. **AST-based** - Parse to AST, rebuild with consistent formatting
2. **Token-level fallback** - Use tokens to maintain structure if parsing fails

Formatting rules:

- 2-space indentation per nesting level
- Newline before each block (STALK, PREDICT, IMPACT, DECLARE)
- Consistent spacing around operators and keywords
- Preserves comments

```typescript
const formatted = formatSTALK(code);
```

#### **stalk-linter.ts** (Static Analysis Rules)

```typescript
// 12 lint rules with severity: PANIC (highest) → INFO (lowest)
// Output: Diagnostic[] with line, column, rule, message, fix (optional)
// Runs after parsing, uses AST and linter context
```

Static analysis engine with 12 configurable rules:

| # | Rule Name              | Severity | Purpose                                          |
|---|------------------------|----------|--------------------------------------------------|
| 1 | `block-order`          | PANIC    | Verify STALK/PREDICT/IMPACT/DECLARE sequence    |
| 2 | `undeclared-variable`  | WARN     | Flag use of undefined variables                 |
| 3 | `unused-capability`    | WARN     | REQUIRE capabilities never used in IMPACT       |
| 4 | `empty-block`          | INFO     | Block with zero statements                      |
| 5 | `unreachable-code`     | WARN     | Code after unconditional action (e.g., POST)    |
| 6 | `audience-mismatch`    | POP*     | PREDICT audience differs from IMPACT audience   |
| 7 | `dead-prediction`      | INFO     | PREDICT variable never referenced later         |
| 8 | `missing-disclaimer`   | WARN     | High confidence + PUBLIC + no DISCLAIMER        |
| 9 | `observe-side-effects` | PANIC    | OBSERVE block contains action constructs        |
| 10| `duplicate-variable`   | WARN     | Same variable assigned twice in same block      |
| 11| `missing-impact`       | WARN     | Capabilities REQUIRED but no IMPACT block       |
| 12| `overconfidence`       | POP*     | Confidence > 0.9 without substantial evidence   |

*POP severity = User's "Maximum POP Safety Threshold" setting (customizable per game)

**Linter Context Tracking**

```typescript
class LinterContext {
  declaredVariables = new Map<string, Token>(); // variable name → token
  usedVariables = new Set<string>();             // track usage
  capabilities = new Set<string>();              // REQUIRE'd capabilities
  usedCapabilities = new Set<string>();          // used in IMPACT
  blocks = Map<BlockType, ASTNode[]>();          // track block order
}
```

#### **types.ts** (IDE-Specific Type Definitions)

```typescript
// Diagnostic, LinterContext, PopSafetyResult
// Severity enum: PANIC, WARN, POP, INFO
// Re-exports shared types where applicable
```

IDE-specific types:

```typescript
interface Diagnostic {
  line: number;          // 1-based
  column: number;        // 1-based
  severity: 'panic' | 'warn' | 'pop' | 'info';
  rule: string;          // e.g., "undeclared-variable"
  message: string;       // human-readable
  fix?: string;          // optional suggestion
}

interface PopSafetyResult {
  blocks: Map<string, number>;  // block ID → score (0-1)
  overall: number;               // combined score (0-1)
  threshold: number;             // user's max threshold
  warnings: string[];            // why it's not perfect
}

interface LinterContext {
  declaredVariables: Map<string, Token>;
  usedVariables: Set<string>;
  capabilities: Set<string>;
  usedCapabilities: Set<string>;
  blocks: Map<string, ASTNode[]>;
}
```

#### **index.ts** (Barrel Export)

```typescript
// Exports: all 13 components and hooks
// Import: import { CobHubIDE, useSTALKAnalysis } from '../ide'
```

---

### Layout Architecture

```
+----------+---------------------------------+------------------+
| Block    |                                 |  Artifact Panel  |
| Nav      |  Toolbar (Format, Run, Save)    |  (DECLARE        |
| (status  +-----+---------------------------+  preview)        |
| icons)   | L#  |                          |                  |
|          |     |    Editor Pane           |                  |
| Pop      |     |    (textarea +           |                  |
| Safety   |     |     highlights)          |                  |
| Gauge    |     |                          |                  |
|          +-----+---------------------------+------------------+
| (120px)  |              Diagnostics Panel (error table)       |
+----------+-----------------------------------------------------+
```

**Dimensions**

- **Window**: Default 1100×750px (resizable)
- **BlockNavigator**: 160px wide (fixed)
- **PopSafetyGauge**: 120px diameter
- **EditorPane**: Flex 1 (fills remaining horizontal space)
- **ArtifactPanel**: 280px wide (fixed)
- **DiagnosticsPanel**: 200px height (resizable divider)
- **Line Gutter**: 50px wide

---

## Token Color Reference

For syntax highlighting consistency, all token types map to CobHub dark theme colors:

### Block Keywords (Corn-Gold)

These define STALK script structure:

```stalk
STALK "my-script"
REQUIRE capability
PREDICT audience
IMPACT { ... }
DECLARE { ... }
```

**Color**: `#f0b429` (Corn-gold)

### Logic Keywords (Coral Red)

Control flow and conditionals:

```stalk
IF condition THEN ...
ELSE ...
SWITCH variable
CASE value
DEFAULT
```

**Color**: `#ff7b72` (Coral red)

### UI Elements (Green)

Components for DECLARE artifact output:

```stalk
WINDOW { TITLE "Name" }
TEXT "Content"
BUTTON "Label"
LIST [ item1, item2 ]
INPUT placeholder
```

**Color**: `#7ee787` (Green)

### Action Verbs (Purple)

Capability-gated actions:

```stalk
POST to_audience "content"
DM user_id "message"
REACT post_id emoji
SEND notification
OBSERVE user
```

**Color**: `#d2a8ff` (Purple)

### Capabilities (Orange)

Permission declarations:

```stalk
REQUIRE ALLOW_POST
REQUIRE ALLOW_DM
REQUIRE ALLOW_REACT
REQUIRE ALLOW_NOTIFICATION
```

**Color**: `#ffa657` (Orange)

### Literals (Blue Variants)

Strings and numbers:

```stalk
"string literal"        // #a5d6ff (light blue)
'single quoted'         // #a5d6ff
42                      // #79c0ff (blue)
3.14                    // #79c0ff
0.95                    // #79c0ff
```

### Comments (Gray)

```stalk
// This is a comment     // #8b949e (gray)
```

---

## Analysis Pipeline

The analysis pipeline is the heart of the IDE. It runs **synchronously** and **offline** (no server calls) to provide instant feedback.

### Pipeline Stages

```
Code Input
    ↓
[Stage 1] Lexer: text → tokens
    ↓
[Stage 2] Parser: tokens → AST
    ↓
[Stage 3] Pop-Safety Analyzer: AST → safety scores
    ↓
[Stage 4] Linter: AST → diagnostics
    ↓
Result: { tokens, ast, diagnostics, popSafety }
```

### Debouncing Strategy

- User stops typing
- 400ms timer starts
- User types again? Timer resets
- Timer completes? Run analysis
- Result propagates to all sub-components

**Rationale**: Prevents lag during rapid typing while keeping feedback responsive.

### Error Recovery

Each stage has error handling:

1. **Lexer fails** → Return partial tokens, mark rest as ERROR tokens
2. **Parser fails** → Return partial AST, continue linting on what we have
3. **Pop-Safety fails** → Skip that stage, return zero scores
4. **Linter fails** → Skip that rule, continue with others

Failures don't crash the IDE—they add diagnostics and move on.

### Performance Notes

- All operations are synchronous (no Promise/async)
- No database access, no network calls
- Pure CPU on typical 500-line scripts: <50ms per analysis
- Tokens cached in state to prevent re-lexing unchanged lines

---

## Linter Rules Deep Dive

### 1. Block Order (PANIC)

**Rule**: STALK block must come first. Order must be: STALK → PREDICT (optional) → IMPACT (optional) → DECLARE (optional)

**Example**:

```stalk
IMPACT { ... }  // ✗ PANIC: IMPACT before STALK
STALK "my-script"
```

**Fix**: Reorder blocks.

### 2. Undeclared Variable (WARN)

**Rule**: Variables must be assigned before use.

**Example**:

```stalk
PREDICT {
  my_var = 42        // ✓ Assigned
}
IMPACT {
  use my_var         // ✓ Safe
  use unknown_var    // ✗ WARN: undeclared-variable
}
```

**Fix**: Add assignment in PREDICT or IMPACT.

### 3. Unused Capability (WARN)

**Rule**: Every REQUIRE'd capability should be used in IMPACT block.

**Example**:

```stalk
REQUIRE ALLOW_POST
REQUIRE ALLOW_DM
IMPACT {
  POST to_audience "Hi"  // Uses ALLOW_POST ✓
  // ALLOW_DM never used ✗ WARN
}
```

**Fix**: Remove unused REQUIRE or add usage.

### 4. Empty Block (INFO)

**Rule**: Block should contain at least one statement.

**Example**:

```stalk
PREDICT { }  // ✗ INFO: empty-block
```

**Fix**: Add content or remove block.

### 5. Unreachable Code (WARN)

**Rule**: Code after unconditional actions (POST, DM, etc.) is unreachable.

**Example**:

```stalk
IMPACT {
  POST to_audience "Goodbye"
  send notification      // ✗ WARN: unreachable after POST
}
```

**Fix**: Reorder statements or make first action conditional.

### 6. Audience Mismatch (POP)

**Rule**: PREDICT's audience_var should match IMPACT's usage.

**Example**:

```stalk
PREDICT {
  audience = "PUBLIC"
}
IMPACT {
  POST to "PRIVATE"  // ✗ POP: Predicted PUBLIC, posting PRIVATE
}
```

**Fix**: Align audience variable or usage.

### 7. Dead Prediction (INFO)

**Rule**: Variables assigned in PREDICT should be used in IMPACT.

**Example**:

```stalk
PREDICT {
  unused_var = 42
}
IMPACT {
  POST to_audience "Hi"  // unused_var never used ✗ INFO
}
```

**Fix**: Use variable or remove assignment.

### 8. Missing Disclaimer (WARN)

**Rule**: If confidence > 0.8 AND audience is PUBLIC, add DISCLAIMER statement.

**Example**:

```stalk
PREDICT {
  confidence = 0.95
  audience = "PUBLIC"
}
IMPACT {
  POST to_audience "This is certain!"  // ✗ WARN: No DISCLAIMER for high confidence
}
```

**Fix**: Add DISCLAIMER { text "Important: ..." }

### 9. Observe Side Effects (PANIC)

**Rule**: OBSERVE blocks are read-only. No POST, DM, REACT allowed.

**Example**:

```stalk
OBSERVE user {
  POST to_audience "Saw you!"  // ✗ PANIC: POST in OBSERVE
}
```

**Fix**: Move action to IMPACT.

### 10. Duplicate Variable (WARN)

**Rule**: Same variable should not be assigned twice in same block.

**Example**:

```stalk
PREDICT {
  my_var = 42
  my_var = 99  // ✗ WARN: Reassigned
}
```

**Fix**: Use different variable names.

### 11. Missing Impact (WARN)

**Rule**: If capabilities are REQUIRE'd, at least one IMPACT block should exist.

**Example**:

```stalk
REQUIRE ALLOW_POST  // ✗ WARN: REQUIRE without IMPACT
```

**Fix**: Add IMPACT block or remove REQUIRE.

### 12. Overconfidence (POP)

**Rule**: Confidence > 0.9 without substantial evidence (e.g., multiple OBSERVE, explicit data) is suspicious.

**Example**:

```stalk
PREDICT {
  confidence = 0.95  // Very high!
  // No OBSERVE or evidence
}
```

**Fix**: Lower confidence or add OBSERVE evidence.

---

## Desktop Registration

The IDE is registered as a desktop window in `src/components/desktop/Desktop.tsx`.

### Window Configuration

```typescript
{
  id: 'cobhub-ide',
  title: 'CobHub IDE',
  icon: '🌽',                    // Corn emoji
  component: CobHubIDE,
  defaultWidth: 1100,
  defaultHeight: 750,
  minWidth: 800,
  minHeight: 600,
  defaultX: 50,
  defaultY: 50,
}
```

### Desktop Icon

The corn emoji (🌽) appears on the desktop and opens the IDE when double-clicked.

### Window State

- **Resizable**: Yes, min 800×600
- **Minimizable**: Yes (persists to taskbar)
- **Closeable**: Yes
- **Draggable**: Yes
- **Z-index**: Managed by Desktop component

---

## Future Work: Stage 6 (Server Execution)

Currently the IDE is **frontend-only**. Stage 6 will add server-side execution with the following features:

### Run Button in Toolbar

```typescript
<button onClick={() => executeSTALK(code)}>
  ▶ Run
</button>
```

### WebSocket Protocol

New message types added to `ws-protocol.ts`:

```typescript
type STALKMessage =
  | { type: 'stalk:run'; source: string }
  | { type: 'stalk:save'; name: string; source: string }
  | { type: 'stalk:load'; name: string }
  | { type: 'stalk:result'; success: boolean; output?: any; error?: string };
```

### Server-Side Handler

New handler in `server/src/network/ws-handlers/stalk.ts`:

```typescript
export function handleSTALKRun(source: string, userId: string) {
  // 1. Compile (frontend already did this, but validate)
  const { tokens, ast, diagnostics } = analyzeCode(source);

  // 2. Check pop-safety
  const { score, acceptable } = checkPopSafety(ast, config);
  if (!acceptable) throw new Error('Pop-safety threshold exceeded');

  // 3. Run interpreter
  const result = new STALKInterpreter(ast).execute({
    userId,
    context: getCurrentGameContext(),
  });

  // 4. Broadcast result back to frontend
  return result;
}
```

### Console Sub-Panel

New collapsible panel below editor showing:

- **Output**: Console.log results
- **Errors**: Runtime errors with stack traces
- **Events**: Game events emitted by STALK script

### Script Storage

Save/load scripts to database:

```typescript
interface StoredSTALKScript {
  id: string;
  user_id: string;
  name: string;
  source: string;
  created_at: string;
  updated_at: string;
  last_run_at: string;
  run_count: number;
}
```

### Event Bus Integration

STALK execution emits events:

```typescript
eventBus.fire(EventTypes.STALK_SCRIPT_EXECUTED, {
  script_id: id,
  user_id: userId,
  source_hash: hash(source),
  result: result,
  execution_time_ms: duration,
  pop_safety_score: score,
});
```

---

## Implementation Checklist

### Frontend Components (Completed)

- [x] CobHubIDE.tsx - Main window
- [x] EditorPane.tsx - Code input + highlights
- [x] SyntaxHighlighter.tsx - Token coloring
- [x] DiagnosticsPanel.tsx - Error table
- [x] BlockNavigator.tsx - Block sidebar
- [x] PopSafetyGauge.tsx - Safety arc
- [x] ArtifactPanel.tsx - DECLARE preview
- [x] useSTALKAnalysis.ts - Analysis hook
- [x] stalk-theme.ts - Color scheme
- [x] stalk-formatter.ts - Code formatter
- [x] stalk-linter.ts - 12 lint rules
- [x] types.ts - Type definitions
- [x] index.ts - Barrel export

### Shared Modules (Completed)

- [x] shared/stalk/tokens.ts
- [x] shared/stalk/ast.ts
- [x] shared/stalk/lexer.ts
- [x] shared/stalk/parser.ts - Fixed require() on line 1170
- [x] shared/stalk/pop-safety.ts - Fixed require() on line 155
- [x] shared/stalk/index.ts - Barrel export

### Configuration (Completed)

- [x] Vite alias: @shared → shared/
- [x] tsconfig.json: Include shared modules
- [x] Desktop registration: Window config

### Stage 6 Work (Future)

- [ ] ws-handlers/stalk.ts - Server execution handler
- [ ] ws-protocol.ts - Add stalk:* message types
- [ ] Console sub-panel component
- [ ] Database schema for stored scripts
- [ ] Event emission for STALK execution
- [ ] Error handling and recovery

---

## Troubleshooting

### Analysis Pipeline Hangs

**Symptom**: IDE becomes unresponsive when typing.

**Diagnosis**: Check console for errors in lexer/parser/linter stages.

**Solution**:
1. Clear code, start fresh
2. Check for syntax that breaks parser (unclosed blocks)
3. Restart IDE window

### Syntax Highlighting Out of Sync

**Symptom**: Highlights don't match actual tokens.

**Diagnosis**: Scroll positions differ between textarea and overlay.

**Solution**:
1. Re-run analysis (wait 400ms after typing)
2. Clear/refresh editor
3. Check EditorPane scroll lock logic

### Pop-Safety Score Not Updating

**Symptom**: Gauge doesn't reflect code changes.

**Diagnosis**: Pop-safety analyzer failed silently (error in analyzing AST).

**Solution**:
1. Check diagnostics panel for errors
2. Simplify DECLARE block
3. Verify AST parses correctly

### Linter Rules Not Triggering

**Symptom**: Expected error doesn't appear.

**Diagnosis**: Rule condition not met or linter context incomplete.

**Solution**:
1. Verify rule definition in stalk-linter.ts
2. Check variable tracking in LinterContext
3. Add console.log to rule check

---

## Related Documentation

- **[STALK_LANGUAGE.md](STALK_LANGUAGE.md)** - Complete STALK syntax and semantics
- **[EVENT_BUS_SPEC.md](EVENT_BUS_SPEC.md)** - Event emission for STALK execution
- **[CONTENT_GUARDRAILS.md](CONTENT_GUARDRAILS.md)** - Safety rules for script execution
- **[NPC_PERSONALITY_SYSTEM.md](NPC_PERSONALITY_SYSTEM.md)** - NPC context for STALK scripts

---

## Credits

- **IDE UI**: Inspired by VSCode dark theme and CobHub (in-game GitHub)
- **Color Scheme**: GitHub dark theme + corn-gold accents
- **Architecture**: Frontend-only analysis inspired by Prettier + ESLint
- **Safety**: Pop-safety system inspired by influence safety in multiagent systems

---

**Last Updated**: 2026-02-05
**Status**: Stage 5 (Frontend Complete)
**Next**: Stage 6 (Server Execution)
