export type SnapZone =
  | 'left'
  | 'right'
  | 'top'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | null

export const TASKBAR_HEIGHT = 48
const SNAP_GAP = 4

/**
 * Detect snap zone based on the window hitting the desktop boundaries.
 *
 * Uses the unclamped (raw) window position to detect when the window
 * is being pushed against a desktop edge. The mouse position is used
 * to distinguish corners from edges (e.g., left-edge + mouse near top = top-left).
 */
export function detectSnapZone(
  unclampedX: number,
  unclampedY: number,
  mouseX: number,
  mouseY: number,
  windowWidth: number,
  viewportW: number,
  viewportH: number,
): SnapZone {
  const usableH = viewportH - TASKBAR_HEIGHT

  // Window is being pushed against a desktop boundary
  const atLeft = unclampedX < 0
  const atRight = unclampedX + windowWidth > viewportW
  const atTop = unclampedY < 0

  if (!atLeft && !atRight && !atTop) return null

  // Use mouse position to determine corner vs edge.
  // Corners = mouse in top/bottom 30% of usable height, or left/right 30% of width.
  const cornerH = usableH * 0.3
  const cornerW = viewportW * 0.3
  const mouseNearTop = mouseY < cornerH
  const mouseNearBottom = mouseY > usableH - cornerH
  const mouseNearLeft = mouseX < cornerW
  const mouseNearRight = mouseX > viewportW - cornerW

  // Multiple edges hit simultaneously → definite corner
  if (atLeft && atTop) return 'top-left'
  if (atRight && atTop) return 'top-right'

  // Single edge + mouse position → corner or edge
  if (atLeft && mouseNearTop) return 'top-left'
  if (atLeft && mouseNearBottom) return 'bottom-left'
  if (atRight && mouseNearTop) return 'top-right'
  if (atRight && mouseNearBottom) return 'bottom-right'
  if (atTop && mouseNearLeft) return 'top-left'
  if (atTop && mouseNearRight) return 'top-right'

  // Pure edges
  if (atLeft) return 'left'
  if (atRight) return 'right'
  if (atTop) return 'top'

  return null
}

/**
 * Get the geometry (position + size) for a given snap zone.
 */
export function getSnapGeometry(
  zone: NonNullable<SnapZone>,
  viewportW: number,
  viewportH: number,
): { x: number; y: number; width: number; height: number } {
  const usableH = viewportH - TASKBAR_HEIGHT
  const halfW = Math.floor(viewportW / 2)
  const halfH = Math.floor(usableH / 2)
  const g = SNAP_GAP       // outer gap (from viewport edge)
  const hg = SNAP_GAP / 2  // half gap (between adjacent snapped windows)

  switch (zone) {
    case 'left':
      return { x: g, y: g, width: halfW - g - hg, height: usableH - g * 2 }
    case 'right':
      return { x: halfW + hg, y: g, width: halfW - hg - g, height: usableH - g * 2 }
    case 'top':
      return { x: g, y: g, width: viewportW - g * 2, height: usableH - g * 2 }
    case 'top-left':
      return { x: g, y: g, width: halfW - g - hg, height: halfH - g - hg }
    case 'top-right':
      return { x: halfW + hg, y: g, width: halfW - hg - g, height: halfH - g - hg }
    case 'bottom-left':
      return { x: g, y: halfH + hg, width: halfW - g - hg, height: halfH - hg - g }
    case 'bottom-right':
      return { x: halfW + hg, y: halfH + hg, width: halfW - hg - g, height: halfH - hg - g }
  }
}
