/**
 * PinballPhysics - Matter.js engine setup, flippers, collisions, scoring events
 *
 * Creates and manages the physics world for the pinball table.
 */

import Matter from 'matter-js';
import * as Table from './PinballTable.js';

const { Engine, World, Bodies, Body, Constraint, Events, Composite } = Matter;

export interface ScoreEvent {
  points: number;
  x: number;
  y: number;
  label: string;
  timestamp: number;
}

export interface PhysicsState {
  score: number;
  ballsRemaining: number;
  ballInPlay: boolean;
  combo: number;
  comboTimer: number;
  maxCombo: number;
  gameOver: boolean;
  scoreEvents: ScoreEvent[];
  dropTargetState: Record<string, boolean[]>;
  plungerCharge: number;
  isPlungerCharging: boolean;
  bumperFlashTimes: number[];
  slingshotFlashTimes: number[];
}

interface PhysicsObjects {
  engine: Matter.Engine;
  ball: Matter.Body | null;
  leftFlipper: Matter.Body;
  rightFlipper: Matter.Body;
  leftFlipperConstraint: Matter.Constraint;
  rightFlipperConstraint: Matter.Constraint;
  bumperBodies: Matter.Body[];
  rolloverSensors: Matter.Body[];
  dropTargetBodies: Matter.Body[];
  rampSensor: Matter.Body;
  skillShotSensor: Matter.Body;
  drainSensor: Matter.Body;
  plungerBody: Matter.Body;
  walls: Matter.Body[];
  slingshotBodies: Matter.Body[];
}

// Collision categories
const CAT_WALL = 0x0001;
const CAT_BALL = 0x0002;
const CAT_FLIPPER = 0x0004;
const CAT_BUMPER = 0x0008;
const CAT_SENSOR = 0x0010;

const COMBO_WINDOW_MS = 2000;

export function createPhysicsEngine(): { objects: PhysicsObjects; state: PhysicsState } {
  const engine = Engine.create({
    gravity: { x: 0, y: 1.2, scale: 0.001 },
  });

  const state: PhysicsState = {
    score: 0,
    ballsRemaining: Table.BALLS_PER_GAME,
    ballInPlay: false,
    combo: 1,
    comboTimer: 0,
    maxCombo: 1,
    gameOver: false,
    scoreEvents: [],
    dropTargetState: {
      left: [false, false, false],
      right: [false, false, false],
    },
    plungerCharge: 0,
    isPlungerCharging: false,
    bumperFlashTimes: Table.bumpers.map(() => 0),
    slingshotFlashTimes: Table.slingshots.map(() => 0),
  };

  // Create walls
  const wallBodies = [
    Bodies.rectangle(Table.walls.left.x, Table.walls.left.y, Table.walls.left.width, Table.walls.left.height, { isStatic: true, label: 'wall' }),
    Bodies.rectangle(Table.walls.right.x, Table.walls.right.y, Table.walls.right.width, Table.walls.right.height, { isStatic: true, label: 'wall' }),
    Bodies.rectangle(Table.walls.top.x, Table.walls.top.y, Table.walls.top.width, Table.walls.top.height, { isStatic: true, label: 'wall' }),
    Bodies.rectangle(Table.walls.plungerLane.x, Table.walls.plungerLane.y, Table.walls.plungerLane.width, Table.walls.plungerLane.height, { isStatic: true, label: 'wall' }),
    // Guide walls
    Bodies.rectangle(Table.walls.leftGuide.x, Table.walls.leftGuide.y, Table.walls.leftGuide.width, Table.walls.leftGuide.height, {
      isStatic: true, angle: Table.walls.leftGuide.angle, label: 'wall',
    }),
    Bodies.rectangle(Table.walls.rightGuide.x, Table.walls.rightGuide.y, Table.walls.rightGuide.width, Table.walls.rightGuide.height, {
      isStatic: true, angle: Table.walls.rightGuide.angle, label: 'wall',
    }),
    // Top curves
    Bodies.rectangle(Table.walls.topLeftCurve.x, Table.walls.topLeftCurve.y, Table.walls.topLeftCurve.width, Table.walls.topLeftCurve.height, {
      isStatic: true, angle: Table.walls.topLeftCurve.angle, label: 'wall',
    }),
    Bodies.rectangle(Table.walls.topRightCurve.x, Table.walls.topRightCurve.y, Table.walls.topRightCurve.width, Table.walls.topRightCurve.height, {
      isStatic: true, angle: Table.walls.topRightCurve.angle, label: 'wall',
    }),
  ];

  wallBodies.forEach(w => {
    w.restitution = 0.4;
    w.friction = 0.1;
    w.collisionFilter = { group: 0, category: CAT_WALL, mask: CAT_BALL };
  });

  // Flippers
  const leftFlipper = Bodies.rectangle(
    Table.flippers.left.x, Table.flippers.left.y,
    Table.flippers.left.width, Table.flippers.left.height,
    {
      isStatic: false, label: 'leftFlipper',
      density: 0.02,
      collisionFilter: { group: 0, category: CAT_FLIPPER, mask: CAT_BALL },
      restitution: 0.6,
    }
  );
  Body.setAngle(leftFlipper, Table.flippers.left.restAngle);

  const rightFlipper = Bodies.rectangle(
    Table.flippers.right.x, Table.flippers.right.y,
    Table.flippers.right.width, Table.flippers.right.height,
    {
      isStatic: false, label: 'rightFlipper',
      density: 0.02,
      collisionFilter: { group: 0, category: CAT_FLIPPER, mask: CAT_BALL },
      restitution: 0.6,
    }
  );
  Body.setAngle(rightFlipper, Table.flippers.right.restAngle);

  const leftFlipperConstraint = Constraint.create({
    bodyA: leftFlipper,
    pointA: { x: -35, y: 0 },
    pointB: { x: Table.flippers.left.pivotX, y: Table.flippers.left.pivotY },
    stiffness: 1,
    length: 0,
  });

  const rightFlipperConstraint = Constraint.create({
    bodyA: rightFlipper,
    pointA: { x: 35, y: 0 },
    pointB: { x: Table.flippers.right.pivotX, y: Table.flippers.right.pivotY },
    stiffness: 1,
    length: 0,
  });

  // Bumpers
  const bumperBodies = Table.bumpers.map((b, i) =>
    Bodies.circle(b.x, b.y, b.radius, {
      isStatic: true,
      label: `bumper_${i}`,
      restitution: b.restitution,
      collisionFilter: { group: 0, category: CAT_BUMPER, mask: CAT_BALL },
    })
  );

  // Rollover sensors
  const rolloverSensors = Table.rollovers.map((r, i) =>
    Bodies.rectangle(r.x, r.y, r.width, r.height, {
      isStatic: true,
      isSensor: true,
      label: `rollover_${i}`,
      collisionFilter: { group: 0, category: CAT_SENSOR, mask: CAT_BALL },
    })
  );

  // Drop targets
  const dropTargetBodies = Table.dropTargets.map((dt, i) =>
    Bodies.rectangle(dt.x, dt.y, dt.width, dt.height, {
      isStatic: true,
      label: `droptarget_${i}`,
      restitution: 0.3,
      collisionFilter: { group: 0, category: CAT_WALL, mask: CAT_BALL },
    })
  );

  // Ramp sensor
  const rampSensor = Bodies.rectangle(Table.ramp.x, Table.ramp.y, Table.ramp.width, Table.ramp.height, {
    isStatic: true,
    isSensor: true,
    label: 'ramp',
    collisionFilter: { group: 0, category: CAT_SENSOR, mask: CAT_BALL },
  });

  // Skill shot sensor
  const skillShotSensor = Bodies.rectangle(Table.skillShot.x, Table.skillShot.y, Table.skillShot.width, Table.skillShot.height, {
    isStatic: true,
    isSensor: true,
    label: 'skillshot',
    collisionFilter: { group: 0, category: CAT_SENSOR, mask: CAT_BALL },
  });

  // Drain sensor
  const drainSensor = Bodies.rectangle(Table.drain.x, Table.drain.y, Table.drain.width, Table.drain.height, {
    isStatic: true,
    isSensor: true,
    label: 'drain',
    collisionFilter: { group: 0, category: CAT_SENSOR, mask: CAT_BALL },
  });

  // Plunger
  const plungerBody = Bodies.rectangle(Table.plunger.x, Table.plunger.y, Table.plunger.width, Table.plunger.height, {
    isStatic: true,
    label: 'plunger',
    collisionFilter: { group: 0, category: CAT_WALL, mask: CAT_BALL },
  });

  // Slingshots
  const slingshotBodies = Table.slingshots.map((s, i) =>
    Bodies.rectangle(s.x, s.y, s.width, s.height, {
      isStatic: true,
      angle: s.angle,
      label: `slingshot_${i}`,
      restitution: s.restitution,
      collisionFilter: { group: 0, category: CAT_WALL, mask: CAT_BALL },
    })
  );

  // Add everything to world
  Composite.add(engine.world, [
    ...wallBodies,
    leftFlipper, rightFlipper,
    leftFlipperConstraint, rightFlipperConstraint,
    ...bumperBodies,
    ...rolloverSensors,
    ...dropTargetBodies,
    rampSensor, skillShotSensor, drainSensor,
    plungerBody,
    ...slingshotBodies,
  ]);

  // Set up collision handling
  setupCollisions(engine, state, bumperBodies, rolloverSensors, dropTargetBodies, rampSensor, skillShotSensor, drainSensor, slingshotBodies);

  const objects: PhysicsObjects = {
    engine,
    ball: null,
    leftFlipper,
    rightFlipper,
    leftFlipperConstraint,
    rightFlipperConstraint,
    bumperBodies,
    rolloverSensors,
    dropTargetBodies,
    rampSensor,
    skillShotSensor,
    drainSensor,
    plungerBody,
    walls: wallBodies,
    slingshotBodies,
  };

  return { objects, state };
}

function setupCollisions(
  engine: Matter.Engine,
  state: PhysicsState,
  bumperBodies: Matter.Body[],
  rolloverSensors: Matter.Body[],
  dropTargetBodies: Matter.Body[],
  rampSensor: Matter.Body,
  skillShotSensor: Matter.Body,
  drainSensor: Matter.Body,
  slingshotBodies: Matter.Body[],
) {
  Events.on(engine, 'collisionStart', (event) => {
    for (const pair of event.pairs) {
      const bodyA = pair.bodyA;
      const bodyB = pair.bodyB;

      // Check if ball is involved
      const ball = bodyA.label === 'ball' ? bodyA : (bodyB.label === 'ball' ? bodyB : null);
      const other = ball === bodyA ? bodyB : bodyA;

      if (!ball) continue;

      const now = Date.now();

      // Update combo
      if (now - state.comboTimer < COMBO_WINDOW_MS) {
        // Check thresholds
        const entries = Object.entries(Table.comboThresholds) as [string, number][];
        for (const [mult, hits] of entries.reverse()) {
          if (state.combo >= hits) {
            state.combo = Math.max(state.combo, Number(mult));
            break;
          }
        }
        state.combo = Math.min(state.combo + 1, 10);
      } else {
        state.combo = 1;
      }
      state.comboTimer = now;
      state.maxCombo = Math.max(state.maxCombo, state.combo);

      // Bumper hit
      const bumperIdx = bumperBodies.indexOf(other);
      if (bumperIdx >= 0) {
        const pts = Table.bumpers[bumperIdx].points * state.combo;
        addScore(state, pts, other.position.x, other.position.y, `${pts}`);
        state.bumperFlashTimes[bumperIdx] = now;
        // Apply extra force away from bumper
        const dx = ball.position.x - other.position.x;
        const dy = ball.position.y - other.position.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        Body.applyForce(ball, ball.position, {
          x: (dx / dist) * 0.008,
          y: (dy / dist) * 0.008,
        });
        continue;
      }

      // Rollover
      const rolloverIdx = rolloverSensors.indexOf(other);
      if (rolloverIdx >= 0) {
        const pts = Table.rollovers[rolloverIdx].points * state.combo;
        addScore(state, pts, other.position.x, other.position.y, `${pts}`);
        continue;
      }

      // Drop target
      const dtIdx = dropTargetBodies.indexOf(other);
      if (dtIdx >= 0) {
        const dt = Table.dropTargets[dtIdx];
        const groupIdx = dt.group === 'left' ? dtIdx : dtIdx - 3;
        if (!state.dropTargetState[dt.group][groupIdx]) {
          state.dropTargetState[dt.group][groupIdx] = true;
          const pts = dt.points * state.combo;
          addScore(state, pts, other.position.x, other.position.y, `${pts}`);

          // Make target invisible (move off screen)
          Body.setPosition(other, { x: -100, y: -100 });

          // Check for set completion
          if (state.dropTargetState[dt.group].every(Boolean)) {
            addScore(state, Table.DROP_TARGET_SET_BONUS, dt.x, dt.y - 30, `SET BONUS ${Table.DROP_TARGET_SET_BONUS}`);
          }
        }
        continue;
      }

      // Ramp
      if (other === rampSensor) {
        const pts = Table.ramp.points * state.combo;
        addScore(state, pts, other.position.x, other.position.y, `RAMP ${pts}`);
        continue;
      }

      // Skill shot
      if (other === skillShotSensor) {
        const pts = Table.skillShot.points * state.combo;
        addScore(state, pts, other.position.x, other.position.y, `SKILL SHOT ${pts}`);
        continue;
      }

      // Slingshot
      const slingshotIdx = slingshotBodies.indexOf(other);
      if (slingshotIdx >= 0) {
        const pts = 10 * state.combo;
        addScore(state, pts, other.position.x, other.position.y, `${pts}`);
        state.slingshotFlashTimes[slingshotIdx] = now;
        const dx = ball.position.x - other.position.x;
        const dy = ball.position.y - other.position.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        Body.applyForce(ball, ball.position, {
          x: (dx / dist) * 0.005,
          y: (dy / dist) * 0.005,
        });
        continue;
      }

      // Drain
      if (other === drainSensor) {
        state.ballInPlay = false;
        continue;
      }
    }
  });
}

function addScore(state: PhysicsState, points: number, x: number, y: number, label: string) {
  state.score += points;
  state.scoreEvents.push({
    points,
    x,
    y,
    label,
    timestamp: Date.now(),
  });

  // Keep only recent score events (last 2 seconds)
  const cutoff = Date.now() - 2000;
  state.scoreEvents = state.scoreEvents.filter(e => e.timestamp > cutoff);
}

export function spawnBall(objects: PhysicsObjects, engine: Matter.Engine): Matter.Body {
  if (objects.ball) {
    Composite.remove(engine.world, objects.ball);
  }

  const ball = Bodies.circle(Table.ballSpawn.x, Table.ballSpawn.y, Table.BALL_RADIUS, {
    label: 'ball',
    restitution: 0.5,
    friction: 0.02,
    density: 0.004,
    collisionFilter: { group: 0, category: CAT_BALL, mask: CAT_WALL | CAT_FLIPPER | CAT_BUMPER | CAT_SENSOR },
  });

  Composite.add(engine.world, ball);
  objects.ball = ball;
  return ball;
}

export function activateFlipper(flipper: Matter.Body, isLeft: boolean) {
  const targetAngle = isLeft ? Table.flippers.left.activeAngle : Table.flippers.right.activeAngle;
  Body.setAngle(flipper, targetAngle);
  Body.setAngularVelocity(flipper, isLeft ? -0.3 : 0.3);
}

export function deactivateFlipper(flipper: Matter.Body, isLeft: boolean) {
  const restAngle = isLeft ? Table.flippers.left.restAngle : Table.flippers.right.restAngle;
  Body.setAngle(flipper, restAngle);
  Body.setAngularVelocity(flipper, isLeft ? 0.15 : -0.15);
}

export function launchBall(ball: Matter.Body, charge: number) {
  const force = charge * Table.plunger.launchForceMultiplier;
  Body.applyForce(ball, ball.position, { x: 0, y: -force });
}

export function nudgeTable(ball: Matter.Body | null) {
  if (!ball) return;
  const fx = (Math.random() - 0.5) * 0.003;
  const fy = (Math.random() - 0.5) * 0.002;
  Body.applyForce(ball, ball.position, { x: fx, y: fy });
}

export function resetDropTargets(state: PhysicsState, objects: PhysicsObjects) {
  state.dropTargetState = {
    left: [false, false, false],
    right: [false, false, false],
  };

  // Move drop targets back to position
  objects.dropTargetBodies.forEach((body, i) => {
    const dt = Table.dropTargets[i];
    Body.setPosition(body, { x: dt.x, y: dt.y });
  });
}

const MAX_BALL_SPEED = 12;

export function stepEngine(engine: Matter.Engine, delta: number, objects?: PhysicsObjects, state?: PhysicsState) {
  Engine.update(engine, delta);

  // Clamp ball velocity to prevent tunneling through walls
  if (objects?.ball) {
    const ball = objects.ball;
    const vx = ball.velocity.x;
    const vy = ball.velocity.y;
    const speed = Math.sqrt(vx * vx + vy * vy);
    if (speed > MAX_BALL_SPEED) {
      const scale = MAX_BALL_SPEED / speed;
      Body.setVelocity(ball, { x: vx * scale, y: vy * scale });
    }

    // Bounds check - drain the ball if it escapes the table
    if (state && (
      ball.position.x < -10 ||
      ball.position.x > Table.TABLE_WIDTH + 10 ||
      ball.position.y < -10 ||
      ball.position.y > Table.TABLE_HEIGHT + 20
    )) {
      state.ballInPlay = false;
    }
  }
}

export function destroyEngine(engine: Matter.Engine) {
  World.clear(engine.world, false);
  Engine.clear(engine);
}
