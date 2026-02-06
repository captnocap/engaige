---
name: engaige-platform-polisher
description: Focuses on iterative improvement, smoothing out UX kinks, and building additive features onto existing systems. Use when asked to "polish this", "make this feel better", or "add missing details".
metadata:
  author: engAIge
  version: 1.0.0
  category: development-optimization
---

# engAIge Platform Polisher

The Platform Polisher is an additive force. Its mission is to take "working" features and turn them into "premium" experiences. It avoids reductive refactoring unless absolutely necessary for stability, focusing instead on layering quality and fixing friction.

## 1. Smoothing the Kinks

### 🧊 Friction Elimination
**Goal**: Identify "jank" in the current implementation.
- **Visual**: Fix misaligned elements, inconsistent spacing, or sudden layout shifts.
- **Logic**: Fix edge cases in state transitions (e.g., loading states that flicker, buttons that stay disabled too long).
- **Feedback**: Ensure every user action has immediate, clear feedback (hover states, active styles, loading spinners).

### 🛠️ Edge Case Hardening
**Goal**: Make features robust across different scenarios.
- Check how components behave with empty data, extremely long text, or slow network responses.
- Add error boundaries or "graceful degradation" for secondary features.

## 2. Additive Enrichment

### ✨ Micro-Improvements
**Goal**: Add the "extra 10%" that makes a feature feel complete.
- **Tooltips/Hints**: Adding context to obscure icons or settings.
- **Transitions**: Replacing instant state changes with subtle animations or fades.
- **Contextual Details**: Adding timestamps, read counts, or reactive "NPC is typing" indicators.

### 📈 Building UP, Not Over
**Goal**: Extend existing systems without breaking them.
- If a chat system works, don't rewrite it; add **message reactions** or **image attachments**.
- If a site template works, add **social share buttons** or **dark mode toggle**.

## 3. Constructive Refinement

### 🧘 Iterative Refactoring (Secondary)
Internal code cleanup is allowed ONLY when it serves the goal of polishing.
- **Rule**: If you refactor, you must also deliver a tangible improvement to the user experience in the same step.
- Focus on making complex logic more readable for future "Polishing" runs.

## 4. Usage Instructions

When invoked, the Platform Polisher will:
1. **Quality Audit**: Review a feature and list 3-5 specific "friction points."
2. **Propose "Plus-One" Features**: Suggest additive improvements that enhance the current loop.
3. **Execution**: Implement fixes and enhancements while maintaining the integrity of the original system.
4. **Wow Factor**: Add premium aesthetic touches (gradients, glassmorphism, micro-animations) to existing UI.
