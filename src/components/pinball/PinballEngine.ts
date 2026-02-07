/**
 * PinballEngine - Planck.js (Box2D) physics for Cob Cadet Pinball
 *
 * Revolute joints for flippers (no setAngle hacking), CCD bullet ball,
 * proper collision categories, contact-based scoring.
 */

import { World, Vec2, Circle, Box, Edge, Body, RevoluteJoint, Contact, Fixture } from 'planck';
import * as Table from './PinballTable.js';

// ── Scale: 100 table-units = 1 meter ───────────────────────────────────────
const S = 0.01; // table→world (multiply)
const IS = 100;  // world→table (multiply)

function tv(x: number, y: number): Vec2 { return Vec2(x * S, y * S); }

// ── Exported types ─────────────────────────────────────────────────────────

export interface ScoreEvent {
  points: number;
  x: number;
  y: number;
  label: string;
  timestamp: number;
}

export interface EngineState {
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

export interface BodyPositions {
  ball: { x: number; y: number } | null;
  leftFlipper: { x: number; y: number; angle: number };
  rightFlipper: { x: number; y: number; angle: number };
}

// ── Internal objects ───────────────────────────────────────────────────────

interface EngineObjects {
  world: InstanceType<typeof World>;
  ball: InstanceType<typeof Body> | null;
  leftFlipper: InstanceType<typeof Body>;
  rightFlipper: InstanceType<typeof Body>;
  leftFlipperJoint: InstanceType<typeof RevoluteJoint>;
  rightFlipperJoint: InstanceType<typeof RevoluteJoint>;
  bumperBodies: InstanceType<typeof Body>[];
  dropTargetBodies: InstanceType<typeof Body>[];
  slingshotBodies: InstanceType<typeof Body>[];
}

export interface PinballEngine {
  step(dt: number): void;
  activateFlipper(isLeft: boolean): void;
  deactivateFlipper(isLeft: boolean): void;
  spawnBall(): void;
  launchBall(charge: number): void;
  nudge(): void;
  resetDropTargets(): void;
  getPositions(): BodyPositions;
  getState(): EngineState;
  destroy(): void;
}

const COMBO_WINDOW_MS = 2000;

// Collision categories (bitmask)
const CAT_WALL = 0x0001;
const CAT_BALL = 0x0002;
const CAT_FLIPPER = 0x0004;
const CAT_BUMPER = 0x0008;
const CAT_SENSOR = 0x0010;
const CAT_SLINGSHOT = 0x0020;

// ── Factory ────────────────────────────────────────────────────────────────

export function createEngine(): PinballEngine {
  const world = new World({ gravity: Vec2(0, 12) });

  const state: EngineState = {
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

  // ── Walls ──

  const createWallRect = (
    x: number, y: number, w: number, h: number, angle = 0,
  ) => {
    const body = world.createBody({ type: 'static', position: tv(x, y), angle });
    body.createFixture({
      shape: new Box(w * S * 0.5, h * S * 0.5),
      friction: 0.1,
      restitution: 0.4,
      filterCategoryBits: CAT_WALL,
      filterMaskBits: CAT_BALL,
    });
    return body;
  };

  // Outer walls
  createWallRect(Table.walls.left.x, Table.walls.left.y, Table.walls.left.width, Table.walls.left.height);
  createWallRect(Table.walls.right.x, Table.walls.right.y, Table.walls.right.width, Table.walls.right.height);
  createWallRect(Table.walls.top.x, Table.walls.top.y, Table.walls.top.width, Table.walls.top.height);
  createWallRect(Table.walls.plungerLane.x, Table.walls.plungerLane.y, Table.walls.plungerLane.width, Table.walls.plungerLane.height);
  // Guides
  createWallRect(Table.walls.leftGuide.x, Table.walls.leftGuide.y, Table.walls.leftGuide.width, Table.walls.leftGuide.height, Table.walls.leftGuide.angle);
  createWallRect(Table.walls.rightGuide.x, Table.walls.rightGuide.y, Table.walls.rightGuide.width, Table.walls.rightGuide.height, Table.walls.rightGuide.angle);
  // Top curves
  createWallRect(Table.walls.topLeftCurve.x, Table.walls.topLeftCurve.y, Table.walls.topLeftCurve.width, Table.walls.topLeftCurve.height, Table.walls.topLeftCurve.angle);
  createWallRect(Table.walls.topRightCurve.x, Table.walls.topRightCurve.y, Table.walls.topRightCurve.width, Table.walls.topRightCurve.height, Table.walls.topRightCurve.angle);

  // Bottom walls (flanking drain gap) to keep ball from escaping sides
  // Left of drain
  createWallRect(110, 695, 100, 10);
  // Right of drain (but before plunger lane)
  createWallRect(295, 695, 50, 10);

  // ── Flippers ──

  const createFlipper = (isLeft: boolean) => {
    const f = isLeft ? Table.flippers.left : Table.flippers.right;
    const pivotPos = tv(f.pivotX, f.pivotY);

    // Static pivot anchor
    const anchor = world.createBody({ type: 'static', position: pivotPos });

    // Dynamic flipper body
    const flipperBody = world.createBody({
      type: 'dynamic',
      position: tv(f.x, f.y),
      angle: f.restAngle,
      bullet: true,
    });
    flipperBody.createFixture({
      shape: new Box(f.width * S * 0.5, f.height * S * 0.5),
      density: 5.0,
      friction: 0.3,
      restitution: 0.6,
      filterCategoryBits: CAT_FLIPPER,
      filterMaskBits: CAT_BALL,
    });

    const joint = world.createJoint(new RevoluteJoint({
      enableMotor: true,
      maxMotorTorque: 80,
      motorSpeed: 0,
      enableLimit: true,
      lowerAngle: isLeft ? f.activeAngle : f.restAngle,
      upperAngle: isLeft ? f.restAngle : f.activeAngle,
    }, anchor, flipperBody, pivotPos))!;

    // Set motor to rest position initially
    (joint as RevoluteJoint).setMotorSpeed(isLeft ? 20 : -20);

    return { body: flipperBody, joint: joint as RevoluteJoint };
  };

  const leftFlipper = createFlipper(true);
  const rightFlipper = createFlipper(false);

  // ── Bumpers ──

  const bumperBodies = Table.bumpers.map((b, i) => {
    const body = world.createBody({ type: 'static', position: tv(b.x, b.y) });
    const fixture = body.createFixture({
      shape: new Circle(b.radius * S),
      restitution: 1.3,
      friction: 0,
      filterCategoryBits: CAT_BUMPER,
      filterMaskBits: CAT_BALL,
    });
    fixture.setUserData({ type: 'bumper', index: i });
    return body;
  });

  // ── Rollovers (sensors) ──

  Table.rollovers.forEach((r, i) => {
    const body = world.createBody({ type: 'static', position: tv(r.x, r.y) });
    const fixture = body.createFixture({
      shape: new Box(r.width * S * 0.5, r.height * S * 0.5),
      isSensor: true,
      filterCategoryBits: CAT_SENSOR,
      filterMaskBits: CAT_BALL,
    });
    fixture.setUserData({ type: 'rollover', index: i });
  });

  // ── Drop targets ──

  const dropTargetBodies = Table.dropTargets.map((dt, i) => {
    const body = world.createBody({ type: 'static', position: tv(dt.x, dt.y) });
    const fixture = body.createFixture({
      shape: new Box(dt.width * S * 0.5, dt.height * S * 0.5),
      restitution: 0.3,
      filterCategoryBits: CAT_WALL,
      filterMaskBits: CAT_BALL,
    });
    fixture.setUserData({ type: 'droptarget', index: i });
    return body;
  });

  // ── Ramp sensor ──

  {
    const body = world.createBody({ type: 'static', position: tv(Table.ramp.x, Table.ramp.y) });
    const fixture = body.createFixture({
      shape: new Box(Table.ramp.width * S * 0.5, Table.ramp.height * S * 0.5),
      isSensor: true,
      filterCategoryBits: CAT_SENSOR,
      filterMaskBits: CAT_BALL,
    });
    fixture.setUserData({ type: 'ramp' });
  }

  // ── Skill shot sensor ──

  {
    const body = world.createBody({ type: 'static', position: tv(Table.skillShot.x, Table.skillShot.y) });
    const fixture = body.createFixture({
      shape: new Box(Table.skillShot.width * S * 0.5, Table.skillShot.height * S * 0.5),
      isSensor: true,
      filterCategoryBits: CAT_SENSOR,
      filterMaskBits: CAT_BALL,
    });
    fixture.setUserData({ type: 'skillshot' });
  }

  // ── Drain sensor ──

  {
    const body = world.createBody({ type: 'static', position: tv(Table.drain.x, Table.drain.y) });
    const fixture = body.createFixture({
      shape: new Box(Table.drain.width * S * 0.5, Table.drain.height * S * 0.5),
      isSensor: true,
      filterCategoryBits: CAT_SENSOR,
      filterMaskBits: CAT_BALL,
    });
    fixture.setUserData({ type: 'drain' });
  }

  // ── Slingshots ──

  const slingshotBodies = Table.slingshots.map((s, i) => {
    const body = world.createBody({ type: 'static', position: tv(s.x, s.y), angle: s.angle });
    const fixture = body.createFixture({
      shape: new Box(s.width * S * 0.5, s.height * S * 0.5),
      restitution: 1.3,
      friction: 0,
      filterCategoryBits: CAT_SLINGSHOT,
      filterMaskBits: CAT_BALL,
    });
    fixture.setUserData({ type: 'slingshot', index: i });
    return body;
  });

  // ── Plunger wall (static stopper at bottom of lane) ──

  {
    const body = world.createBody({ type: 'static', position: tv(Table.plunger.x, Table.plunger.maxY + 15) });
    body.createFixture({
      shape: new Box(Table.plunger.width * S * 0.5, 10 * S * 0.5),
      filterCategoryBits: CAT_WALL,
      filterMaskBits: CAT_BALL,
    });
  }

  const objects: EngineObjects = {
    world,
    ball: null,
    leftFlipper: leftFlipper.body,
    rightFlipper: rightFlipper.body,
    leftFlipperJoint: leftFlipper.joint,
    rightFlipperJoint: rightFlipper.joint,
    bumperBodies,
    dropTargetBodies,
    slingshotBodies,
  };

  // ── Contact listener ──

  world.on('begin-contact', (contact: Contact) => {
    const fA = contact.getFixtureA();
    const fB = contact.getFixtureB();
    const bodyA = fA.getBody();
    const bodyB = fB.getBody();

    // Identify ball
    const isBallA = fA.getUserData() && (fA.getUserData() as any).type === 'ball';
    const isBallB = fB.getUserData() && (fB.getUserData() as any).type === 'ball';
    if (!isBallA && !isBallB) return;

    const ballFixture = isBallA ? fA : fB;
    const otherFixture = isBallA ? fB : fA;
    const ballBody = ballFixture.getBody();
    const otherData = otherFixture.getUserData() as any;

    if (!otherData || !otherData.type) return;

    const now = Date.now();

    // Update combo
    if (now - state.comboTimer < COMBO_WINDOW_MS) {
      state.combo = Math.min(state.combo + 1, 10);
    } else {
      state.combo = 1;
    }
    state.comboTimer = now;
    state.maxCombo = Math.max(state.maxCombo, state.combo);

    const ballPos = ballBody.getPosition();
    const ballTableX = ballPos.x * IS;
    const ballTableY = ballPos.y * IS;

    switch (otherData.type) {
      case 'bumper': {
        const idx = otherData.index;
        const pts = Table.bumpers[idx].points * state.combo;
        addScore(state, pts, Table.bumpers[idx].x, Table.bumpers[idx].y, `${pts}`);
        state.bumperFlashTimes[idx] = now;

        // Apply impulse away from bumper center
        const bumperPos = objects.bumperBodies[idx].getPosition();
        const dx = ballPos.x - bumperPos.x;
        const dy = ballPos.y - bumperPos.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.01;
        const impulseStrength = 0.15;
        ballBody.applyLinearImpulse(
          Vec2((dx / dist) * impulseStrength, (dy / dist) * impulseStrength),
          ballBody.getWorldCenter(),
          true,
        );
        break;
      }

      case 'rollover': {
        const idx = otherData.index;
        const pts = Table.rollovers[idx].points * state.combo;
        addScore(state, pts, Table.rollovers[idx].x, Table.rollovers[idx].y, `${pts}`);
        break;
      }

      case 'droptarget': {
        const idx = otherData.index;
        const dt = Table.dropTargets[idx];
        const groupIdx = dt.group === 'left' ? idx : idx - 3;
        if (!state.dropTargetState[dt.group][groupIdx]) {
          state.dropTargetState[dt.group][groupIdx] = true;
          const pts = dt.points * state.combo;
          addScore(state, pts, dt.x, dt.y, `${pts}`);

          // Deactivate the drop target
          objects.dropTargetBodies[idx].setActive(false);

          // Check set completion
          if (state.dropTargetState[dt.group].every(Boolean)) {
            addScore(state, Table.DROP_TARGET_SET_BONUS, dt.x, dt.y - 30, `SET BONUS ${Table.DROP_TARGET_SET_BONUS}`);
          }
        }
        break;
      }

      case 'ramp': {
        const pts = Table.ramp.points * state.combo;
        addScore(state, pts, Table.ramp.x, Table.ramp.y, `RAMP ${pts}`);
        break;
      }

      case 'skillshot': {
        const pts = Table.skillShot.points * state.combo;
        addScore(state, pts, Table.skillShot.x, Table.skillShot.y, `SKILL SHOT ${pts}`);
        break;
      }

      case 'slingshot': {
        const idx = otherData.index;
        const pts = 10 * state.combo;
        addScore(state, pts, Table.slingshots[idx].x, Table.slingshots[idx].y, `${pts}`);
        state.slingshotFlashTimes[idx] = now;

        // Apply impulse away from slingshot
        const slingshotPos = objects.slingshotBodies[idx].getPosition();
        const dx = ballPos.x - slingshotPos.x;
        const dy = ballPos.y - slingshotPos.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.01;
        const impulseStrength = 0.08;
        ballBody.applyLinearImpulse(
          Vec2((dx / dist) * impulseStrength, (dy / dist) * impulseStrength),
          ballBody.getWorldCenter(),
          true,
        );
        break;
      }

      case 'drain': {
        state.ballInPlay = false;
        break;
      }
    }
  });

  // ── Max speed constant (in world units per second) ──
  const MAX_BALL_SPEED = 12 * S; // 12 table units → world units

  // ── Public API ───────────────────────────────────────────────────────────

  return {
    step(dt: number) {
      // Fixed timestep - Planck expects seconds
      world.step(dt);

      // Clamp ball velocity
      if (objects.ball) {
        const vel = objects.ball.getLinearVelocity();
        const speed = vel.length();
        if (speed > MAX_BALL_SPEED) {
          const scale = MAX_BALL_SPEED / speed;
          objects.ball.setLinearVelocity(Vec2(vel.x * scale, vel.y * scale));
        }

        // Bounds check
        const pos = objects.ball.getPosition();
        const tx = pos.x * IS;
        const ty = pos.y * IS;
        if (tx < -10 || tx > Table.TABLE_WIDTH + 10 || ty < -10 || ty > Table.TABLE_HEIGHT + 20) {
          state.ballInPlay = false;
        }
      }
    },

    activateFlipper(isLeft: boolean) {
      const joint = isLeft ? objects.leftFlipperJoint : objects.rightFlipperJoint;
      // Motor speed toward active angle: left flippers go negative (up), right go positive
      joint.setMotorSpeed(isLeft ? -20 : 20);
    },

    deactivateFlipper(isLeft: boolean) {
      const joint = isLeft ? objects.leftFlipperJoint : objects.rightFlipperJoint;
      // Motor speed toward rest angle: left flippers go positive (down), right go negative
      joint.setMotorSpeed(isLeft ? 20 : -20);
    },

    spawnBall() {
      // Remove existing ball
      if (objects.ball) {
        world.destroyBody(objects.ball);
        objects.ball = null;
      }

      const ball = world.createBody({
        type: 'dynamic',
        position: tv(Table.ballSpawn.x, Table.ballSpawn.y),
        bullet: true, // CCD - prevents tunneling
      });
      const fixture = ball.createFixture({
        shape: new Circle(Table.BALL_RADIUS * S),
        density: 2.0,
        friction: 0.02,
        restitution: 0.5,
        filterCategoryBits: CAT_BALL,
        filterMaskBits: CAT_WALL | CAT_FLIPPER | CAT_BUMPER | CAT_SENSOR | CAT_SLINGSHOT,
      });
      fixture.setUserData({ type: 'ball' });

      objects.ball = ball;
    },

    launchBall(charge: number) {
      if (!objects.ball) return;
      const force = charge * Table.plunger.launchForceMultiplier * 200;
      objects.ball.applyLinearImpulse(
        Vec2(0, -force * S),
        objects.ball.getWorldCenter(),
        true,
      );
    },

    nudge() {
      if (!objects.ball) return;
      const fx = (Math.random() - 0.5) * 0.06;
      const fy = (Math.random() - 0.5) * 0.04;
      objects.ball.applyLinearImpulse(
        Vec2(fx, fy),
        objects.ball.getWorldCenter(),
        true,
      );
    },

    resetDropTargets() {
      state.dropTargetState = {
        left: [false, false, false],
        right: [false, false, false],
      };
      objects.dropTargetBodies.forEach((body) => {
        body.setActive(true);
      });
    },

    getPositions(): BodyPositions {
      const lfPos = objects.leftFlipper.getPosition();
      const rfPos = objects.rightFlipper.getPosition();

      return {
        ball: objects.ball ? {
          x: objects.ball.getPosition().x * IS,
          y: objects.ball.getPosition().y * IS,
        } : null,
        leftFlipper: {
          x: lfPos.x * IS,
          y: lfPos.y * IS,
          angle: objects.leftFlipper.getAngle(),
        },
        rightFlipper: {
          x: rfPos.x * IS,
          y: rfPos.y * IS,
          angle: objects.rightFlipper.getAngle(),
        },
      };
    },

    getState(): EngineState {
      return state;
    },

    destroy() {
      // Planck doesn't have a formal destroy - just nullify references
      if (objects.ball) {
        world.destroyBody(objects.ball);
        objects.ball = null;
      }
    },
  };
}

function addScore(state: EngineState, points: number, x: number, y: number, label: string) {
  state.score += points;
  state.scoreEvents.push({ points, x, y, label, timestamp: Date.now() });

  // Keep only recent events
  const cutoff = Date.now() - 2000;
  state.scoreEvents = state.scoreEvents.filter(e => e.timestamp > cutoff);
}
