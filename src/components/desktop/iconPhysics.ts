import { World, Vec2, Box } from 'planck'

// Scale: 100px = 1 meter (matches pinball convention)
const S = 0.01
const IS = 100

const VELOCITY_THRESHOLD = 0.005 // ~0.5 px/s in world units
const DEFAULT_MAX_STEPS = 15
const TIME_STEP = 1 / 60

/**
 * On-demand Planck.js physics settle for desktop icon layout.
 *
 * Creates a throwaway world, places icon bodies at their starting positions,
 * steps until all bodies settle (velocity below threshold) or maxSteps is reached,
 * then extracts final positions and lets the world be GC'd.
 *
 * No persistent state, no per-frame ticking.
 */
export function settleIcons(
  icons: Array<{ id: string; x: number; y: number }>,
  viewportW: number,
  viewportH: number,
  taskbarReserve: number,
  iconSize: number,
  iconGap: number,
  maxSteps: number = DEFAULT_MAX_STEPS,
): Record<string, { x: number; y: number }> {
  if (icons.length === 0) return {}

  const world = new World({ gravity: Vec2(0, 0) })

  const usableW = viewportW
  const usableH = viewportH - taskbarReserve

  // Half-dimensions for the body fixture (includes gap + extra margin as spacing buffer)
  const spacing = iconGap + 8
  const bodyHalfW = (iconSize + spacing) * S * 0.5
  const bodyHalfH = (iconSize + spacing) * S * 0.5

  // Wall thickness in world units
  const wallThick = 0.5

  // Boundary walls (static edge bodies)
  // Bottom wall (above taskbar)
  const bottomWall = world.createBody({ type: 'static', position: Vec2(usableW * S * 0.5, usableH * S + wallThick * 0.5) })
  bottomWall.createFixture({ shape: new Box(usableW * S * 0.5 + wallThick, wallThick * 0.5) })

  // Top wall
  const topWall = world.createBody({ type: 'static', position: Vec2(usableW * S * 0.5, -wallThick * 0.5) })
  topWall.createFixture({ shape: new Box(usableW * S * 0.5 + wallThick, wallThick * 0.5) })

  // Left wall
  const leftWall = world.createBody({ type: 'static', position: Vec2(-wallThick * 0.5, usableH * S * 0.5) })
  leftWall.createFixture({ shape: new Box(wallThick * 0.5, usableH * S * 0.5 + wallThick) })

  // Right wall
  const rightWall = world.createBody({ type: 'static', position: Vec2(usableW * S, usableH * S * 0.5) })
  rightWall.createFixture({ shape: new Box(wallThick * 0.5, usableH * S * 0.5 + wallThick) })

  // Create icon bodies
  const bodyMap = new Map<string, ReturnType<typeof world.createBody>>()

  for (const icon of icons) {
    // Clamp starting position to be within bounds (center of icon body)
    const cx = Math.max(bodyHalfW, Math.min((usableW - iconSize * 0.5) * S, (icon.x + iconSize * 0.5) * S))
    const cy = Math.max(bodyHalfH, Math.min((usableH - iconSize * 0.5) * S, (icon.y + iconSize * 0.5) * S))

    const body = world.createBody({
      type: 'dynamic',
      position: Vec2(cx, cy),
      linearDamping: 5.0,
      fixedRotation: true,
    })

    body.createFixture({
      shape: new Box(bodyHalfW, bodyHalfH),
      density: 1.0,
      restitution: 0.0,
      friction: 0.8,
    })

    bodyMap.set(icon.id, body)
  }

  // Step until settled or max steps
  for (let step = 0; step < maxSteps; step++) {
    world.step(TIME_STEP)

    // Check if all dynamic bodies are below velocity threshold
    let allSettled = true
    for (const [, body] of bodyMap) {
      const vel = body.getLinearVelocity()
      const speed = vel.x * vel.x + vel.y * vel.y // squared, avoid sqrt
      if (speed > VELOCITY_THRESHOLD * VELOCITY_THRESHOLD) {
        allSettled = false
        break
      }
    }

    if (allSettled) break
  }

  // Extract final positions (convert body center back to top-left pixel coords)
  const maxX = viewportW - iconSize
  const maxY = usableH - iconSize
  const result: Record<string, { x: number; y: number }> = {}

  for (const [id, body] of bodyMap) {
    const pos = body.getPosition()
    const px = pos.x * IS - iconSize * 0.5
    const py = pos.y * IS - iconSize * 0.5
    result[id] = {
      x: Math.max(0, Math.min(maxX, Math.round(px))),
      y: Math.max(0, Math.min(maxY, Math.round(py))),
    }
  }

  // No explicit world.destroy() in Planck — nullify refs, let GC collect
  return result
}
