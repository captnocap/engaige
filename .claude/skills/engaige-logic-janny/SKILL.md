---
name: engaige-logic-janny
description: Performs linting, deduplication, and style checks on engAIge codebase. Use when asked to "lint code", "check for duplicates", "clean up imports", or "verify style compliance".
metadata:
  author: engAIge
  version: 1.0.0
  category: maintenance
---

# engAIge Logic Janny

The Logic Janny ensures the codebase stays clean, DRY (Don't Repeat Yourself), and follows project-specific style conventions.

## 1. Project-Specific Linting Rules

### 🚫 No Native Selects
**Rule**: NEVER use native HTML `<select>` elements.
- **Check**: Search for `<select` or `HTMLSelectElement`.
- **Fix**: Replace with the custom `<Select>` component from `src/components/ui/Select.tsx`.

### 📦 Barrel Export Compliance
**Rule**: ALWAYS import from barrel (`index.ts`) files instead of direct sub-files.
- **Check**: Look for imports from `../../ui/Message/MessageThread.js` or similar deeply nested paths.
- **Fix**: Redirect imports to the nearest `index.ts` barrel.
- **Barrel Locations**:
  - `components/ui/Message`
  - `components/settings`
  - `components/onboarding`
  - `server/src/events`

### 🎨 Tailwind 4 Utility Check
**Rule**: Ensure Tailwind 4 patterns are used correctly.
- **Check**: Verify `@tailwindcss/vite` configuration if changing styles.
- **Check**: Avoid legacy Tailwind 3 specific hacks if native CSS variables can do it better.

### 🧹 Console Log Hygiene
**Rule**: Ensure `console.log` is not used in production-ready server code.
- **Fix**: Use `errorLogger` for errors or `eventBus` for tracking significant events.

## 2. Deduplication Checks

### 🔄 Component Deduplication
Before creating a new UI component, check:
- `src/components/ui/` for existing primitives.
- `src/components/desktop/` for existing window patterns.

### 🧩 Logic Deduplication
Before adding new NPC behavior or game logic:
- Check `server/src/services/npc-personality.ts` for existing traits/quirks.
- Check `server/src/services/message-formatter.ts` for existing text processing logic.
- Check `server/src/utils/` for shared helper functions.

## 3. Regular Maintenance Procedures

### Import Sorting
Ensure imports are grouped:
1. React/External Libraries
2. Internal Shared Components/Utils
3. Local Components/Constants
4. Types

### Dead Code Removal
- Unused functions or variables.
- Commented out blocks of code (remove them, they are in git history).
- Unused theme variables in `index.css`.

## 4. Usage Instructions

When invoked, the Janny will:
1. Scan the targeted files for the violations listed above.
2. Report specific line numbers and files that need attention.
3. Propose a refactor plan to consolidate duplicated logic.
