import type { IconPosition } from '../../stores/settingsStore.js'
import { settleIcons } from './iconPhysics.js'

// Desktop icon layout constants
export const ICON_SIZE = 80
export const ICON_GAP = 8
export const ICON_PADDING = 16
export const TASKBAR_RESERVE = 60
export const COLUMN_WIDTH = ICON_SIZE + ICON_GAP

export function getDefaultIconPosition(index: number, viewportW?: number, viewportH?: number): IconPosition {
  const vw = viewportW ?? (typeof window !== 'undefined' ? window.innerWidth : 1920)
  const vh = viewportH ?? (typeof window !== 'undefined' ? window.innerHeight : 1080)
  const availableHeight = vh - TASKBAR_RESERVE - ICON_PADDING * 2
  const iconsPerColumn = Math.max(1, Math.floor(availableHeight / (ICON_SIZE + ICON_GAP)))
  const column = Math.floor(index / iconsPerColumn)
  const row = index % iconsPerColumn
  return {
    x: ICON_PADDING + column * COLUMN_WIDTH,
    y: ICON_PADDING + row * (ICON_SIZE + ICON_GAP),
  }
}

// --- Coordinate conversion ---

export function normalizedToPixel(norm: IconPosition, vw: number, vh: number): IconPosition {
  const maxX = vw - ICON_SIZE
  const maxY = vh - TASKBAR_RESERVE - ICON_SIZE
  return {
    x: Math.max(0, Math.min(maxX, Math.round(norm.x * vw))),
    y: Math.max(0, Math.min(maxY, Math.round(norm.y * vh))),
  }
}

export function pixelToNormalized(px: IconPosition, vw: number, vh: number): IconPosition {
  return {
    x: vw > 0 ? Math.max(0, Math.min(1, px.x / vw)) : 0,
    y: vh > 0 ? Math.max(0, Math.min(1, px.y / vh)) : 0,
  }
}

// --- Breakpoint keys ---

export function getBreakpointKey(vw: number): string {
  if (vw < 1024) return 'sm'
  if (vw < 1440) return 'md'
  if (vw < 1920) return 'lg'
  return 'xl'
}

// --- Conflict detection ---

// Physics body collision range (must match iconPhysics.ts spacing)
const PHYSICS_BODY_SIZE = ICON_SIZE + ICON_GAP + 8

/**
 * Find the set of icon IDs that are in conflict (overlapping or OOB)
 * plus any neighbors within physics-body range of a conflicting icon.
 * Returns empty set if no conflicts exist.
 */
function findConflictCluster(
  positions: Record<string, { x: number; y: number }>,
  iconIds: string[],
  maxX: number,
  maxY: number,
): Set<string> {
  const conflicting = new Set<string>()

  // Pass 1: find directly conflicting icons (OOB or overlapping)
  for (let i = 0; i < iconIds.length; i++) {
    const a = positions[iconIds[i]]
    if (!a) continue

    if (a.x < 0 || a.x > maxX || a.y < 0 || a.y > maxY) {
      conflicting.add(iconIds[i])
    }

    for (let j = i + 1; j < iconIds.length; j++) {
      const b = positions[iconIds[j]]
      if (!b) continue
      if (Math.abs(a.x - b.x) < PHYSICS_BODY_SIZE && Math.abs(a.y - b.y) < PHYSICS_BODY_SIZE) {
        conflicting.add(iconIds[i])
        conflicting.add(iconIds[j])
      }
    }
  }

  if (conflicting.size === 0) return conflicting

  // Pass 2: expand to include any non-conflicting icon within physics range
  // of a conflicting icon (they'd get pushed by the physics engine anyway)
  for (const id of iconIds) {
    if (conflicting.has(id)) continue
    const a = positions[id]
    if (!a) continue
    for (const cid of conflicting) {
      const b = positions[cid]
      if (!b) continue
      if (Math.abs(a.x - b.x) < PHYSICS_BODY_SIZE && Math.abs(a.y - b.y) < PHYSICS_BODY_SIZE) {
        conflicting.add(id)
        break
      }
    }
  }

  return conflicting
}

// --- Auto-grid threshold ---

function shouldAutoGrid(
  before: Record<string, { x: number; y: number }>,
  after: Record<string, { x: number; y: number }>,
  iconIds: string[],
): boolean {
  const threshold30 = ICON_SIZE * 0.3
  const threshold20 = ICON_SIZE * 0.2
  let totalDisplacement = 0
  let countExceeding30 = 0
  let count = 0

  for (const id of iconIds) {
    const b = before[id]
    const a = after[id]
    if (!b || !a) continue
    const dx = a.x - b.x
    const dy = a.y - b.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    totalDisplacement += dist
    if (dist > threshold30) countExceeding30++
    count++
  }

  if (count === 0) return false
  const avgDisplacement = totalDisplacement / count
  const pctExceeding30 = countExceeding30 / count

  return pctExceeding30 > 0.5 || avgDisplacement > threshold20
}

// --- Main reflow ---

export interface ReflowResult {
  pixelPositions: Record<string, IconPosition>
  autoGridNormalized?: Record<string, IconPosition>
}

/**
 * Physics-based desktop icon reflow.
 *
 * Takes canonical normalized (0-1) positions, converts to pixels for the
 * current viewport, and runs Planck.js collision resolution if any icons
 * are out of bounds or overlapping.
 *
 * Returns pixel positions for rendering. If the auto-grid threshold is
 * triggered (too much displacement), returns autoGridNormalized so the
 * caller can update the canonical store.
 */
export function reflowIcons(
  canonical: Record<string, IconPosition>,
  iconIds: string[],
  viewportW: number,
  viewportH: number,
  snapshotHint?: Record<string, IconPosition>,
): ReflowResult {
  const maxX = viewportW - ICON_SIZE
  const maxY = viewportH - TASKBAR_RESERVE - ICON_SIZE

  // Build pixel positions from canonical (or defaults for missing icons)
  const pixelPositions: Record<string, IconPosition> = {}
  for (let i = 0; i < iconIds.length; i++) {
    const id = iconIds[i]
    if (canonical[id]) {
      pixelPositions[id] = normalizedToPixel(canonical[id], viewportW, viewportH)
    } else {
      pixelPositions[id] = getDefaultIconPosition(i, viewportW, viewportH)
    }
  }

  // Viewport too small to fit even one icon — just clamp and bail
  if (maxX < 0 || maxY < 0) {
    for (const id of iconIds) {
      pixelPositions[id] = { x: 0, y: 0 }
    }
    return { pixelPositions }
  }

  // Use snapshot hints as starting positions if available
  const startPositions: Record<string, IconPosition> = {}
  for (const id of iconIds) {
    if (snapshotHint?.[id]) {
      startPositions[id] = normalizedToPixel(snapshotHint[id], viewportW, viewportH)
    } else {
      startPositions[id] = pixelPositions[id]
    }
  }

  // Find which icons are actually in conflict (overlapping, OOB, or neighbors of those)
  const conflictSet = findConflictCluster(startPositions, iconIds, maxX, maxY)

  if (conflictSet.size === 0) {
    // No conflicts — use start positions directly
    return { pixelPositions: startPositions }
  }

  // Only feed conflicting icons into physics, keep the rest untouched
  const conflictIds = iconIds.filter(id => conflictSet.has(id))
  const physicsInput = conflictIds.map(id => ({
    id,
    x: startPositions[id].x,
    y: startPositions[id].y,
  }))

  const settled = settleIcons(
    physicsInput,
    viewportW,
    viewportH,
    TASKBAR_RESERVE,
    ICON_SIZE,
    ICON_GAP,
  )

  // Merge: physics-settled positions for conflicts, original positions for everyone else
  const merged: Record<string, IconPosition> = {}
  for (const id of iconIds) {
    merged[id] = settled[id] ?? startPositions[id]
  }

  // Check auto-grid threshold (only against the conflict cluster, not all icons)
  if (shouldAutoGrid(startPositions, merged, conflictIds)) {
    const gridPixels: Record<string, IconPosition> = {}
    const gridNormalized: Record<string, IconPosition> = {}
    for (let i = 0; i < iconIds.length; i++) {
      const id = iconIds[i]
      const pos = getDefaultIconPosition(i, viewportW, viewportH)
      gridPixels[id] = pos
      gridNormalized[id] = pixelToNormalized(pos, viewportW, viewportH)
    }
    return { pixelPositions: gridPixels, autoGridNormalized: gridNormalized }
  }

  return { pixelPositions: merged }
}
