# Creative Suite Redesign — Adobe CC-Inspired

> **Status**: Design spec approved, pending implementation
> **Date**: 2026-02-05
> **Problem**: Creative Studio feels like a settings menu because it literally reuses `SidebarNav` from the Settings window

---

## Diagnosis: Why It Feels Like a Settings Menu

The root cause is **structural reuse**. The Creative Studio imports `SidebarNav` from `src/components/settings/` — the exact same component that renders the Settings window sidebar.

| What Settings Does | What Studio Copies |
|---|---|
| Left sidebar with icon + label rows | Identical sidebar, same `w-48`, same hover/active states |
| Content pane fills the right side | Identical layout — sidebar → content |
| Form-like inputs (dropdowns, sliders, textareas) | Same form vocabulary: label → input → label → input |
| Emoji icons for navigation | Same emoji icons (✨🎨🎬📝🖼️) |
| Flat hierarchy, no depth | Same flat gray panels, no layering |

Opening the "Creative Studio" feels identical to opening Settings with different labels. No visual identity shift. No "I'm now in a creative tool" moment.

---

## The Core Layout Transformation

### Current layout (settings pattern):
```
┌──────────────────────────────────────────┐
│  Creative Studio  │  Generate Images     │
│  ─ subtitle ──────┤  ─ budget ───────    │
├──────────┬────────┴──────────────────────┤
│ ✨ Gen   │  [Form inputs fill entire     │
│ 🎨 Draw  │   content area vertically,    │
│ 🎬 Video │   scrolling down like a       │
│ 📝 Comp  │   settings page...]           │
│ 🖼️ Lib   │                               │
└──────────┴───────────────────────────────┘
```

### Proposed layout (Adobe CC pattern):
```
┌─────────────────────────────────────────────────────┐
│ File  Edit  View  Filter  Generate  Window    [$$$] │ ← Menu Bar
├─────┬───────────────────────────────────┬───────────┤
│ [S] │                                   │ ≡ Props   │
│ [B] │                                   ├───────────┤
│ [E] │                                   │ ≡ Layers  │
│ [L] │         CANVAS / WORKSPACE        ├───────────┤
│ [R] │         (dominates the view)      │ ≡ History │
│ [C] │                                   ├───────────┤
│ [F] │                                   │ ≡ Library │
│ [P] │                                   │           │
│     │                                   │           │
├─────┴───────────────────────────────────┴───────────┤
│ Brush: 12px  │  X: 247  Y: 183  │  Zoom: 100%  │ ⊞ │ ← Status Bar
└─────────────────────────────────────────────────────┘
```

---

## Feature Tier List

### Tier 1 — Crucial (Sells the Illusion)

| Feature | Why It Matters |
|---|---|
| **Vertical left toolbar** | THE defining visual of Adobe. Single-column icons, active tool highlighted blue, tooltips on hover |
| **Right-side collapsible panels** | Layers, Properties, History stacked vertically with collapse/expand headers. Separates "creative tool" from "settings page" |
| **Top menu bar** | `File Edit View Filter Generate Window` — even if most items are simple, the menu bar screams "professional application" |
| **Bottom status bar** | Zoom slider, cursor coordinates, document dimensions. Always visible, always informative |
| **Dark creative theme** | Override the game theme inside the studio: `#1E1E1E` background, `#2D2D2D` panels, `#0D66D0` blue accent. Should feel like stepping into a different app |
| **Canvas-dominant workspace** | Center area should be 60-70% of the window. No scrolling forms. The canvas IS the app |
| **SVG tool icons** | Replace emoji with crisp monochrome SVG icons (pencil, brush, eraser, selection, shapes, text, eyedropper, fill) |

### Tier 2 — Nice-to-Have (Deepens the Illusion)

| Feature | Why It Matters |
|---|---|
| **Panel tab groups** | Multiple panels can share a tab group (click "Layers" tab vs "Channels" tab) |
| **Workspace presets** | "Drawing", "Photo Edit", "Compose" presets that rearrange which panels are visible |
| **Tool options bar** | Below menu bar, context-sensitive options for the active tool (brush size, opacity, blend mode) |
| **Splash/welcome screen** | On first open: recent projects, quick-start templates, featured art. Feels like launching Photoshop |
| **Keyboard shortcuts in menus** | `Ctrl+Z Undo`, `Ctrl+S Save` displayed in menu items |
| **Drag-to-resize panels** | Grab panel edges to resize right panel width |

### Tier 3 — Overkill (Don't Build)

| Feature | Why |
|---|---|
| Full panel docking/undocking | Too complex for the immersion payoff |
| Multi-document tabs | We're always working on one thing |
| Custom workspace saving | Presets are enough |
| Nested tool flyouts (click-and-hold) | Simple icon switching is sufficient |
| Actual Pen tool / Bezier curves | Our canvas tools are draw/paint, not vector |

---

## Panel System Design (Right Sidebar)

Each panel has a collapsible header with optional close button:

```
┌─────────────────────────┐
│ ▼ Properties        [×] │  ← Header (click to collapse, × to hide)
├─────────────────────────┤
│  Brush Size: ═══●═══    │
│  Opacity:    ═══════●   │
│  Blend Mode: [Normal ▾] │
│  Color:      [■ #FF0000]│
└─────────────────────────┘
┌─────────────────────────┐
│ ▶ Layers            [×] │  ← Collapsed (click ▶ to expand)
└─────────────────────────┘
┌─────────────────────────┐
│ ▼ History           [×] │
├─────────────────────────┤
│  ● Brush Stroke         │
│  ○ Fill Region          │
│  ○ New Layer            │
│  ○ Document Created     │
└─────────────────────────┘
```

### Panel content changes contextually by active mode:

| Active Mode | Left Toolbar | Right Panels |
|---|---|---|
| **Draw** | Pencil, Brush, Eraser, Shapes, Fill, Eyedropper, Select, Line | Properties, Colors, Layers, History |
| **Generate** | (minimal/hidden toolbar) | Prompt, Style, Gallery, History |
| **Compose** | (hidden) | Media, Caption, Platforms, Preview |
| **Library** | (hidden) | Filters, Details, Tags |
| **Video** | (hidden) | Timeline, Layers, Preview, Export |

---

## Color System (Studio-Specific Dark Theme)

The studio overrides the game's theme variables within its container:

```css
--studio-bg:           #1E1E1E;   /* darkest - canvas surround */
--studio-panel:        #252525;   /* panel backgrounds */
--studio-panel-header: #2D2D2D;   /* panel headers, toolbar bg */
--studio-border:       #3A3A3A;   /* subtle separators */
--studio-hover:        #404040;   /* hover states */
--studio-active:       #505050;   /* pressed states */
--studio-accent:       #0D66D0;   /* active tool, selections, focus */
--studio-accent-hover: #1B7FEB;   /* accent hover */
--studio-text:         #CCCCCC;   /* primary text */
--studio-text-dim:     #888888;   /* secondary text */
--studio-text-bright:  #FFFFFF;   /* emphasized text */
--studio-danger:       #E05050;   /* errors, destructive */
--studio-success:      #4CAF50;   /* confirmations */
```

---

## Game Integration Points

| Integration | How It Works |
|---|---|
| **NPC Reactions** | When player posts created art, NPCs react based on personality (art critic NPC vs supportive friend) |
| **Relationship Impact** | Sharing art with an NPC: +3 trust, +2 affinity. NPC remembers "you made art for me" |
| **Budget Tracking** | AI generation costs shown in status bar. Menu bar > View > Budget Dashboard |
| **NPC Commissions** | NPCs can request art ("draw me something!") — shows as a task in the studio |
| **AI Assist** | "Generate" mode lives inside the studio as one tool among many, not as the primary mode |

---

## UX Flow

1. **Entry**: Double-click "Creative Suite" desktop icon (rename from "Creative Studio")
2. **First Launch**: Brief splash showing recent work / quick-start presets
3. **Default View**: Canvas mode with Draw tools active, Properties + History panels open
4. **Creative Loop**: Pick tool → work on canvas → adjust properties → check history → save/export
5. **Publish Flow**: Menu bar > File > "Publish to Feed..." opens a modal (not a separate mode) with platform selector + caption
6. **Exit**: Close window, draft auto-saved

**Key shift**: Compose/Publish becomes a **modal action from the menu bar**, not a separate "mode." You don't switch modes in Photoshop to export — you go to File > Export. Same principle here.

---

## Structural Changes Summary

| Current | Proposed |
|---|---|
| `SidebarNav` from settings | New `StudioToolbar` (vertical left, custom component) |
| 5 "modes" swapping the entire content area | Canvas always visible; right panels change contextually |
| Mode = page (Generate page, Draw page, Library page) | Mode = which tool/workflow is active on the same canvas |
| Flat form layouts | Panel-based property editors |
| Emoji icons | SVG icons (monochrome, 20x20) |
| Game theme colors | Studio-specific dark theme overlay |
| "Creative Studio" name | "Creative Suite" name |

---

## Files Affected

### New Files
- `src/components/studio/StudioMenuBar.tsx` — Top menu bar component
- `src/components/studio/StudioToolbar.tsx` — Vertical left toolbar
- `src/components/studio/StudioStatusBar.tsx` — Bottom status/info bar
- `src/components/studio/StudioPanel.tsx` — Collapsible panel container
- `src/components/studio/panels/` — Individual panel content components
- `src/components/studio/icons/` — SVG tool icons (or single icons file)
- `src/components/studio/studio-theme.css` — Studio-specific dark theme variables

### Modified Files
- `src/components/studio/CreativeStudioWindow.tsx` — Complete layout rewrite
- `src/components/studio/StudioContext.tsx` — Add panel visibility state, active tool state
- `src/components/studio/modes/CanvasMode.tsx` — Extract toolbar into StudioToolbar, extract properties into panels
- `src/components/studio/modes/ImageGeneratorMode.tsx` — Restructure as panel content, not full-page form
- `src/components/studio/modes/PostComposerMode.tsx` — Convert to modal dialog
- `src/components/studio/modes/AssetLibraryMode.tsx` — Convert to panel or modal
- `src/components/desktop/Desktop.tsx` — Rename window title, increase default size
