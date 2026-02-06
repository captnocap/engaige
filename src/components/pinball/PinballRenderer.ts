/**
 * PinballRenderer - Canvas 2D render: space theme, neon bumpers, LED score, ball trail
 */

import * as Table from './PinballTable.js';
import type { PhysicsState, ScoreEvent } from './PinballPhysics.js';
import type Matter from 'matter-js';

interface BumperFlash {
  index: number;
  start: number;
}

// Track bumper flash animations
const bumperFlashes: BumperFlash[] = [];

// Ball trail (last N positions)
const ballTrail: { x: number; y: number }[] = [];
const MAX_TRAIL = 8;

// Star field for background
let stars: { x: number; y: number; size: number; brightness: number }[] = [];

function initStars(width: number, height: number) {
  if (stars.length > 0) return;
  stars = Array.from({ length: 60 }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    size: Math.random() * 1.5 + 0.5,
    brightness: Math.random() * 0.5 + 0.3,
  }));
}

export function triggerBumperFlash(index: number) {
  bumperFlashes.push({ index, start: Date.now() });
}

export function render(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  state: PhysicsState,
  ball: Matter.Body | null,
  leftFlipper: Matter.Body,
  rightFlipper: Matter.Body,
  bumperBodies: Matter.Body[],
  dropTargetBodies: Matter.Body[],
  benchmark: number,
) {
  const scaleX = canvasWidth / Table.TABLE_WIDTH;
  const scaleY = canvasHeight / Table.TABLE_HEIGHT;

  ctx.save();
  ctx.scale(scaleX, scaleY);

  initStars(Table.TABLE_WIDTH, Table.TABLE_HEIGHT);

  // Background
  drawBackground(ctx);

  // Walls
  drawWalls(ctx);

  // Slingshots
  drawSlingshots(ctx);

  // Drop targets
  drawDropTargets(ctx, state, dropTargetBodies);

  // Rollovers
  drawRollovers(ctx);

  // Bumpers
  drawBumpers(ctx, bumperBodies);

  // Ramp
  drawRamp(ctx);

  // Skill shot
  drawSkillShot(ctx);

  // Flippers
  drawFlipper(ctx, leftFlipper, true);
  drawFlipper(ctx, rightFlipper, false);

  // Plunger
  drawPlunger(ctx, state);

  // Drain zone
  drawDrain(ctx);

  // Ball trail
  if (ball && state.ballInPlay) {
    ballTrail.push({ x: ball.position.x, y: ball.position.y });
    if (ballTrail.length > MAX_TRAIL) ballTrail.shift();
  }
  drawBallTrail(ctx);

  // Ball
  if (ball && state.ballInPlay) {
    drawBall(ctx, ball);
  }

  // Score popups
  drawScorePopups(ctx, state.scoreEvents);

  ctx.restore();
}

function drawBackground(ctx: CanvasRenderingContext2D) {
  // Deep space gradient
  const grad = ctx.createLinearGradient(0, 0, 0, Table.TABLE_HEIGHT);
  grad.addColorStop(0, '#0a0a1a');
  grad.addColorStop(0.5, '#0d0d24');
  grad.addColorStop(1, '#050510');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, Table.TABLE_WIDTH, Table.TABLE_HEIGHT);

  // Stars
  for (const star of stars) {
    ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness + Math.sin(Date.now() * 0.001 + star.x) * 0.1})`;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawWalls(ctx: CanvasRenderingContext2D) {
  ctx.strokeStyle = '#3344aa';
  ctx.lineWidth = 2;
  ctx.shadowColor = '#4466ff';
  ctx.shadowBlur = 6;

  for (const [, wall] of Object.entries(Table.walls)) {
    ctx.save();
    ctx.translate(wall.x, wall.y);
    if ('angle' in wall && wall.angle) ctx.rotate(wall.angle);
    ctx.strokeRect(-wall.width / 2, -wall.height / 2, wall.width, wall.height);
    ctx.restore();
  }

  ctx.shadowBlur = 0;
}

function drawSlingshots(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = 'rgba(100, 50, 200, 0.3)';
  ctx.strokeStyle = '#8844ff';
  ctx.lineWidth = 2;
  ctx.shadowColor = '#aa66ff';
  ctx.shadowBlur = 6;

  for (const s of Table.slingshots) {
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate(s.angle);
    ctx.beginPath();
    ctx.moveTo(-s.width / 2, s.height / 2);
    ctx.lineTo(0, -s.height / 2);
    ctx.lineTo(s.width / 2, s.height / 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  ctx.shadowBlur = 0;
}

function drawBumpers(ctx: CanvasRenderingContext2D, bumperBodies: Matter.Body[]) {
  const now = Date.now();

  // Clean old flashes
  while (bumperFlashes.length > 0 && now - bumperFlashes[0].start > 200) {
    bumperFlashes.shift();
  }

  Table.bumpers.forEach((b, i) => {
    const isFlashing = bumperFlashes.some(f => f.index === i);

    ctx.save();
    ctx.shadowColor = isFlashing ? '#ffff00' : '#ff4488';
    ctx.shadowBlur = isFlashing ? 20 : 10;

    // Outer ring
    ctx.strokeStyle = isFlashing ? '#ffff00' : '#ff4488';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
    ctx.stroke();

    // Inner fill
    ctx.fillStyle = isFlashing ? 'rgba(255, 255, 0, 0.4)' : 'rgba(255, 68, 136, 0.15)';
    ctx.fill();

    // Center dot
    ctx.fillStyle = isFlashing ? '#ffff00' : '#ff6699';
    ctx.beginPath();
    ctx.arc(b.x, b.y, 5, 0, Math.PI * 2);
    ctx.fill();

    // Points label
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${b.points}`, b.x, b.y + 3);

    ctx.restore();
  });
}

function drawRollovers(ctx: CanvasRenderingContext2D) {
  ctx.shadowColor = '#44ff88';
  ctx.shadowBlur = 4;

  Table.rollovers.forEach(r => {
    ctx.strokeStyle = '#44ff88';
    ctx.lineWidth = 1;
    ctx.strokeRect(r.x - r.width / 2, r.y - r.height / 2, r.width, r.height);

    ctx.fillStyle = 'rgba(68, 255, 136, 0.1)';
    ctx.fillRect(r.x - r.width / 2, r.y - r.height / 2, r.width, r.height);

    ctx.fillStyle = '#44ff88';
    ctx.font = '7px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(r.label, r.x, r.y + 3);
  });

  ctx.shadowBlur = 0;
}

function drawDropTargets(ctx: CanvasRenderingContext2D, state: PhysicsState, dropTargetBodies: Matter.Body[]) {
  Table.dropTargets.forEach((dt, i) => {
    const groupIdx = dt.group === 'left' ? i : i - 3;
    const isHit = state.dropTargetState[dt.group][groupIdx];

    if (isHit) return; // Don't draw hit targets

    ctx.save();
    ctx.shadowColor = '#ffaa00';
    ctx.shadowBlur = 6;
    ctx.fillStyle = '#ffaa00';
    ctx.fillRect(dt.x - dt.width / 2, dt.y - dt.height / 2, dt.width, dt.height);
    ctx.restore();
  });
}

function drawRamp(ctx: CanvasRenderingContext2D) {
  ctx.save();
  ctx.shadowColor = '#00ffcc';
  ctx.shadowBlur = 10;
  ctx.strokeStyle = '#00ffcc';
  ctx.lineWidth = 2;

  const r = Table.ramp;
  ctx.beginPath();
  ctx.moveTo(r.x - r.width / 2, r.y + r.height / 2);
  ctx.lineTo(r.x, r.y - r.height / 2);
  ctx.lineTo(r.x + r.width / 2, r.y + r.height / 2);
  ctx.stroke();

  ctx.fillStyle = '#00ffcc';
  ctx.font = 'bold 8px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('RAMP', r.x, r.y + 20);

  ctx.restore();
}

function drawSkillShot(ctx: CanvasRenderingContext2D) {
  ctx.save();
  ctx.shadowColor = '#ff00ff';
  ctx.shadowBlur = 8;
  ctx.strokeStyle = '#ff00ff';
  ctx.lineWidth = 2;

  const ss = Table.skillShot;
  ctx.strokeRect(ss.x - ss.width / 2, ss.y - ss.height / 2, ss.width, ss.height);

  ctx.fillStyle = 'rgba(255, 0, 255, 0.1)';
  ctx.fillRect(ss.x - ss.width / 2, ss.y - ss.height / 2, ss.width, ss.height);

  ctx.fillStyle = '#ff00ff';
  ctx.font = 'bold 7px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('SKILL', ss.x, ss.y - 5);
  ctx.fillText('SHOT', ss.x, ss.y + 5);

  ctx.restore();
}

function drawFlipper(ctx: CanvasRenderingContext2D, flipper: Matter.Body, isLeft: boolean) {
  ctx.save();
  ctx.translate(flipper.position.x, flipper.position.y);
  ctx.rotate(flipper.angle);

  ctx.shadowColor = '#44aaff';
  ctx.shadowBlur = 8;
  ctx.fillStyle = '#4488ff';
  ctx.strokeStyle = '#66aaff';
  ctx.lineWidth = 1;

  const w = isLeft ? Table.flippers.left.width : Table.flippers.right.width;
  const h = isLeft ? Table.flippers.left.height : Table.flippers.right.height;

  // Rounded flipper shape
  ctx.beginPath();
  ctx.roundRect(-w / 2, -h / 2, w, h, h / 2);
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

function drawPlunger(ctx: CanvasRenderingContext2D, state: PhysicsState) {
  const p = Table.plunger;

  ctx.save();
  ctx.shadowColor = '#ff6600';
  ctx.shadowBlur = state.isPlungerCharging ? 12 : 4;

  // Track
  ctx.fillStyle = '#333';
  ctx.fillRect(p.x - p.width / 2, p.minY - 5, p.width, p.maxY - p.minY + 10 + p.height);

  // Plunger handle
  const chargeOffset = state.plungerCharge * (p.maxY - p.minY);
  ctx.fillStyle = state.isPlungerCharging
    ? `rgb(255, ${Math.floor(100 + state.plungerCharge * 155)}, 0)`
    : '#cc5500';
  ctx.fillRect(p.x - p.width / 2 + 2, p.minY + chargeOffset, p.width - 4, p.height);

  ctx.restore();
}

function drawDrain(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = 'rgba(255, 0, 0, 0.15)';
  const d = Table.drain;
  ctx.fillRect(d.x - d.width / 2, d.y - d.height / 2, d.width, d.height);
}

function drawBall(ctx: CanvasRenderingContext2D, ball: Matter.Body) {
  ctx.save();

  // Glow
  ctx.shadowColor = '#ffffff';
  ctx.shadowBlur = 12;

  // Ball
  const grad = ctx.createRadialGradient(
    ball.position.x - 2, ball.position.y - 2, 1,
    ball.position.x, ball.position.y, Table.BALL_RADIUS
  );
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.4, '#ccccee');
  grad.addColorStop(1, '#8888aa');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(ball.position.x, ball.position.y, Table.BALL_RADIUS, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawBallTrail(ctx: CanvasRenderingContext2D) {
  for (let i = 0; i < ballTrail.length; i++) {
    const alpha = (i / ballTrail.length) * 0.4;
    const radius = Table.BALL_RADIUS * (0.3 + (i / ballTrail.length) * 0.5);

    ctx.fillStyle = `rgba(180, 180, 255, ${alpha})`;
    ctx.beginPath();
    ctx.arc(ballTrail[i].x, ballTrail[i].y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawScorePopups(ctx: CanvasRenderingContext2D, events: ScoreEvent[]) {
  const now = Date.now();

  for (const evt of events) {
    const age = now - evt.timestamp;
    if (age > 1500) continue;

    const progress = age / 1500;
    const alpha = 1 - progress;
    const yOffset = -progress * 40;

    ctx.save();
    ctx.fillStyle = `rgba(255, 255, 100, ${alpha})`;
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(255, 200, 0, 0.5)';
    ctx.shadowBlur = 4;
    ctx.fillText(evt.label, evt.x, evt.y + yOffset);
    ctx.restore();
  }
}


export function clearTrail() {
  ballTrail.length = 0;
}
