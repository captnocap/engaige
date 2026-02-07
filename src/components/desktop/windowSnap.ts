export type SnapZone =
  | 'left'
  | 'right'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | null

const EDGE_THRESHOLD = 8
const CORNER_SIZE = 150
const TASKBAR_HEIGHT = 48
const SNAP_GAP = 4

/**
 * Detect which snap zone the cursor is in based on screen position.
 * Corners take priority over edges.
 */
export function detectSnapZone(
  clientX: number,
  clientY: number,
  viewportW: number,
  viewportH: number,
): SnapZone {
  const bottomBound = viewportH - TASKBAR_HEIGHT

  // Must be near an edge to trigger any zone
  const nearLeft = clientX <= EDGE_THRESHOLD
  const nearRight = clientX >= viewportW - EDGE_THRESHOLD
  const nearTop = clientY <= EDGE_THRESHOLD
  const nearBottom = clientY >= bottomBound - EDGE_THRESHOLD

  // Corner detection (corners take priority)
  if (nearLeft && clientY < CORNER_SIZE) return 'top-left'
  if (nearRight && clientY < CORNER_SIZE) return 'top-right'
  if (nearLeft && clientY > bottomBound - CORNER_SIZE) return 'bottom-left'
  if (nearRight && clientY > bottomBound - CORNER_SIZE) return 'bottom-right'

  // Also detect corners from top/bottom edges
  if (nearTop && clientX < CORNER_SIZE) return 'top-left'
  if (nearTop && clientX > viewportW - CORNER_SIZE) return 'top-right'
  if (nearBottom && clientX < CORNER_SIZE) return 'bottom-left'
  if (nearBottom && clientX > viewportW - CORNER_SIZE) return 'bottom-right'

  // Edge detection
  if (nearLeft) return 'left'
  if (nearRight) return 'right'

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

  switch (zone) {
    case 'left':
      return { x: SNAP_GAP, y: SNAP_GAP, width: halfW - SNAP_GAP * 2, height: usableH - SNAP_GAP * 2 }
    case 'right':
      return { x: halfW + SNAP_GAP, y: SNAP_GAP, width: halfW - SNAP_GAP * 2, height: usableH - SNAP_GAP * 2 }
    case 'top-left':
      return { x: SNAP_GAP, y: SNAP_GAP, width: halfW - SNAP_GAP * 2, height: halfH - SNAP_GAP * 2 }
    case 'top-right':
      return { x: halfW + SNAP_GAP, y: SNAP_GAP, width: halfW - SNAP_GAP * 2, height: halfH - SNAP_GAP * 2 }
    case 'bottom-left':
      return { x: SNAP_GAP, y: halfH + SNAP_GAP, width: halfW - SNAP_GAP * 2, height: halfH - SNAP_GAP * 2 }
    case 'bottom-right':
      return { x: halfW + SNAP_GAP, y: halfH + SNAP_GAP, width: halfW - SNAP_GAP * 2, height: halfH - SNAP_GAP * 2 }
  }
}
