import type { IconPosition } from '../../stores/settingsStore.js'

// Desktop icon layout constants
export const ICON_SIZE = 80
export const ICON_GAP = 8
export const ICON_PADDING = 16
export const TASKBAR_RESERVE = 60
export const COLUMN_WIDTH = ICON_SIZE + ICON_GAP

export function getDefaultIconPosition(index: number): IconPosition {
  const availableHeight = (typeof window !== 'undefined' ? window.innerHeight : 800) - TASKBAR_RESERVE - ICON_PADDING * 2
  const iconsPerColumn = Math.max(1, Math.floor(availableHeight / (ICON_SIZE + ICON_GAP)))
  const column = Math.floor(index / iconsPerColumn)
  const row = index % iconsPerColumn
  return {
    x: ICON_PADDING + column * COLUMN_WIDTH,
    y: ICON_PADDING + row * (ICON_SIZE + ICON_GAP),
  }
}

interface Rect {
  x: number
  y: number
  w: number
  h: number
}

function rectsOverlap(a: Rect, b: Rect, gap: number = ICON_GAP): boolean {
  return !(
    a.x + a.w + gap <= b.x ||
    b.x + b.w + gap <= a.x ||
    a.y + a.h + gap <= b.y ||
    b.y + b.h + gap <= a.y
  )
}

function findNonOverlappingPosition(
  targetX: number,
  targetY: number,
  occupied: Rect[],
  minX: number,
  minY: number,
  maxX: number,
  maxY: number,
): IconPosition {
  const candidate: Rect = { x: targetX, y: targetY, w: ICON_SIZE, h: ICON_SIZE }
  if (!occupied.some(r => rectsOverlap(candidate, r))) {
    return { x: targetX, y: targetY }
  }

  const step = ICON_SIZE + ICON_GAP
  for (let radius = 1; radius <= 30; radius++) {
    for (let dx = -radius; dx <= radius; dx++) {
      for (let dy = -radius; dy <= radius; dy++) {
        if (Math.abs(dx) !== radius && Math.abs(dy) !== radius) continue

        const cx = targetX + dx * step
        const cy = targetY + dy * step

        if (cx < minX || cx > maxX || cy < minY || cy > maxY) continue

        const test: Rect = { x: cx, y: cy, w: ICON_SIZE, h: ICON_SIZE }
        if (!occupied.some(r => rectsOverlap(test, r))) {
          return { x: cx, y: cy }
        }
      }
    }
  }

  // Fallback: return clamped position even if overlapping
  return { x: targetX, y: targetY }
}

/**
 * Reflow desktop icons so that out-of-bounds icons are brought back on-screen.
 * Icons already within bounds are not moved. Returns only changed positions,
 * or null if nothing needs to change.
 */
export function reflowIcons(
  currentPositions: Record<string, IconPosition>,
  iconIds: string[],
  viewportW: number,
  viewportH: number,
): Record<string, IconPosition> | null {
  const minX = 0
  const minY = 0
  const maxX = viewportW - ICON_SIZE
  const maxY = viewportH - TASKBAR_RESERVE - ICON_SIZE

  if (maxX < 0 || maxY < 0) return null

  const inBounds: string[] = []
  const outOfBounds: string[] = []

  for (const id of iconIds) {
    const pos = currentPositions[id]
    if (!pos) continue
    if (pos.x >= minX && pos.x <= maxX && pos.y >= minY && pos.y <= maxY) {
      inBounds.push(id)
    } else {
      outOfBounds.push(id)
    }
  }

  if (outOfBounds.length === 0) return null

  // Sort by distance from bounds (least displaced first gets priority for best spots)
  outOfBounds.sort((a, b) => {
    const posA = currentPositions[a]!
    const posB = currentPositions[b]!
    const distA = Math.max(0, posA.x - maxX) + Math.max(0, posA.y - maxY) +
                  Math.max(0, minX - posA.x) + Math.max(0, minY - posA.y)
    const distB = Math.max(0, posB.x - maxX) + Math.max(0, posB.y - maxY) +
                  Math.max(0, minX - posB.x) + Math.max(0, minY - posB.y)
    return distA - distB
  })

  const occupied: Rect[] = inBounds.map(id => {
    const pos = currentPositions[id]!
    return { x: pos.x, y: pos.y, w: ICON_SIZE, h: ICON_SIZE }
  })

  const result: Record<string, IconPosition> = {}

  for (const id of outOfBounds) {
    const pos = currentPositions[id]!
    const clampedX = Math.max(minX, Math.min(maxX, pos.x))
    const clampedY = Math.max(minY, Math.min(maxY, pos.y))

    const newPos = findNonOverlappingPosition(clampedX, clampedY, occupied, minX, minY, maxX, maxY)
    result[id] = newPos
    occupied.push({ x: newPos.x, y: newPos.y, w: ICON_SIZE, h: ICON_SIZE })
  }

  return result
}
