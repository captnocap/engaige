/**
 * PinballTable - Table geometry data for Space Cadet Pinball
 *
 * Defines all static geometry in a 400x700 unit space.
 * Physics engine and renderer consume this data to build the table.
 */

export const TABLE_WIDTH = 400;
export const TABLE_HEIGHT = 700;

export const BALL_RADIUS = 8;

// Wall definitions (arrays of vertices for Matter.js Bodies.fromVertices or rectangles)
export const walls = {
  // Outer walls
  left: { x: 5, y: 350, width: 10, height: 700 },
  right: { x: 395, y: 350, width: 10, height: 700 },
  top: { x: 200, y: 5, width: 400, height: 10 },

  // Plunger lane wall (separates plunger from main area)
  plungerLane: { x: 360, y: 500, width: 6, height: 380 },

  // Guide walls near flippers
  leftGuide: { x: 60, y: 580, width: 80, height: 6, angle: 0.5 },
  rightGuide: { x: 310, y: 580, width: 80, height: 6, angle: -0.5 },

  // Top arch walls
  topLeftCurve: { x: 50, y: 80, width: 60, height: 6, angle: -0.8 },
  topRightCurve: { x: 320, y: 80, width: 60, height: 6, angle: 0.8 },
};

// Flipper positions
export const flippers = {
  left: {
    x: 145,
    y: 640,
    width: 70,
    height: 12,
    pivotX: 115,
    pivotY: 640,
    restAngle: 0.45,
    activeAngle: -0.45,
  },
  right: {
    x: 255,
    y: 640,
    width: 70,
    height: 12,
    pivotX: 285,
    pivotY: 640,
    restAngle: -0.45,
    activeAngle: 0.45,
  },
};

// Plunger
export const plunger = {
  x: 380,
  y: 660,
  width: 20,
  height: 30,
  minY: 660,
  maxY: 690,
  launchForceMultiplier: 0.035,
};

// Ball spawn position (in plunger lane)
export const ballSpawn = {
  x: 380,
  y: 620,
};

// Pop bumpers (circles that bounce the ball with force)
export interface Bumper {
  x: number;
  y: number;
  radius: number;
  points: number;
  restitution: number;
}

export const bumpers: Bumper[] = [
  { x: 150, y: 180, radius: 22, points: 100, restitution: 1.5 },
  { x: 250, y: 160, radius: 22, points: 100, restitution: 1.5 },
  { x: 200, y: 250, radius: 22, points: 100, restitution: 1.5 },
];

// Side lane rollovers (thin sensor zones)
export interface Rollover {
  x: number;
  y: number;
  width: number;
  height: number;
  points: number;
  label: string;
}

export const rollovers: Rollover[] = [
  { x: 40, y: 300, width: 20, height: 40, points: 50, label: 'L1' },
  { x: 40, y: 400, width: 20, height: 40, points: 50, label: 'L2' },
  { x: 360, y: 300, width: 20, height: 40, points: 50, label: 'R1' },
  { x: 360, y: 400, width: 20, height: 40, points: 50, label: 'R2' },
];

// Drop targets (small rectangular targets that "drop" when hit)
export interface DropTarget {
  x: number;
  y: number;
  width: number;
  height: number;
  points: number;
  group: string;
}

export const dropTargets: DropTarget[] = [
  // Left bank
  { x: 80, y: 200, width: 6, height: 20, points: 200, group: 'left' },
  { x: 80, y: 230, width: 6, height: 20, points: 200, group: 'left' },
  { x: 80, y: 260, width: 6, height: 20, points: 200, group: 'left' },
  // Right bank
  { x: 320, y: 200, width: 6, height: 20, points: 200, group: 'right' },
  { x: 320, y: 230, width: 6, height: 20, points: 200, group: 'right' },
  { x: 320, y: 260, width: 6, height: 20, points: 200, group: 'right' },
];

// Ramp entry
export const ramp = {
  x: 200,
  y: 120,
  width: 40,
  height: 12,
  points: 500,
};

// Skill shot lane (narrow lane at top)
export const skillShot = {
  x: 370,
  y: 60,
  width: 30,
  height: 60,
  points: 1000,
};

// Drain (bottom gap between flippers)
export const drain = {
  x: 200,
  y: 695,
  width: 120,
  height: 10,
};

// Slingshot triangles (bounce pads above flippers)
export const slingshots = [
  { x: 85, y: 590, width: 40, height: 50, angle: 0.3, restitution: 1.3 },
  { x: 315, y: 590, width: 40, height: 50, angle: -0.3, restitution: 1.3 },
];

// Combo thresholds
export const comboThresholds = {
  2: 3,  // 2x after 3 rapid hits
  3: 5,  // 3x after 5 rapid hits
  5: 10, // 5x after 10 rapid hits
};

// Set bonus for clearing all drop targets in a group
export const DROP_TARGET_SET_BONUS = 1000;

// Balls per game
export const BALLS_PER_GAME = 3;
