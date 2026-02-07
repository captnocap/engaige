/**
 * PinballRenderer - Premium neon-arcade visuals for Cob Cadet Pinball
 *
 * Chrome rails, dome bumpers, tapered flippers, playfield art,
 * particle effects, and multi-layer neon glow on Canvas 2D.
 */

import * as Table from './PinballTable.js';
import type { PhysicsState, ScoreEvent } from './PinballPhysics.js';
import type Matter from 'matter-js';

// ── Color Palette ──────────────────────────────────────────────────────────
const C = {
  amber: '#f0a030',
  amberGlow: '#ffc040',
  amberDim: '#604010',
  blue: '#4488ff',
  blueGlow: '#66bbff',
  blueDim: '#1a2244',
  pink: '#ff4488',
  pinkGlow: '#ff88bb',
  pinkDim: '#662244',
  cyan: '#00ffcc',
  cyanGlow: '#44ffdd',
  purple: '#9944ff',
  purpleGlow: '#bb77ff',
  green: '#44ff88',
  greenGlow: '#88ffbb',
  red: '#ff2244',
  white: '#ffffff',
  chrome: '#aaaacc',
  chromeBright: '#ddddf0',
  chromeDark: '#444466',
};

// ── Particle System ────────────────────────────────────────────────────────
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

const particles: Particle[] = [];

function spawnParticles(x: number, y: number, color: string, count = 6) {
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const spd = 0.4 + Math.random() * 1.5;
    const life = 200 + Math.random() * 300;
    particles.push({
      x,
      y,
      vx: Math.cos(a) * spd,
      vy: Math.sin(a) * spd,
      life,
      maxLife: life,
      color,
      size: 1 + Math.random() * 1.5,
    });
  }
}

function updateParticles(delta: number) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx * delta * 0.06;
    p.y += p.vy * delta * 0.06;
    p.life -= delta;
    if (p.life <= 0) particles.splice(i, 1);
  }
}

// ── Ball Trail ─────────────────────────────────────────────────────────────
const ballTrail: { x: number; y: number }[] = [];
const MAX_TRAIL = 12;

// ── Star Field ─────────────────────────────────────────────────────────────
let stars: { x: number; y: number; size: number; brightness: number }[] = [];
function initStars() {
  if (stars.length > 0) return;
  stars = Array.from({ length: 40 }, () => ({
    x: Math.random() * Table.TABLE_WIDTH,
    y: Math.random() * Table.TABLE_HEIGHT,
    size: Math.random() * 1.2 + 0.3,
    brightness: Math.random() * 0.25 + 0.08,
  }));
}

// ── Hit tracking for particle spawning ─────────────────────────────────────
const lastParticleSpawn: Record<string, number> = {};

function checkNewHits(state: PhysicsState) {
  const now = Date.now();
  // Bumpers
  for (let i = 0; i < state.bumperFlashTimes.length; i++) {
    const t = state.bumperFlashTimes[i];
    if (t > 0 && now - t < 50) {
      const key = `b${i}`;
      if (!lastParticleSpawn[key] || now - lastParticleSpawn[key] > 150) {
        spawnParticles(Table.bumpers[i].x, Table.bumpers[i].y, C.pink, 8);
        lastParticleSpawn[key] = now;
      }
    }
  }
  // Slingshots
  for (let i = 0; i < state.slingshotFlashTimes.length; i++) {
    const t = state.slingshotFlashTimes[i];
    if (t > 0 && now - t < 50) {
      const key = `s${i}`;
      if (!lastParticleSpawn[key] || now - lastParticleSpawn[key] > 150) {
        spawnParticles(Table.slingshots[i].x, Table.slingshots[i].y, C.purple, 6);
        lastParticleSpawn[key] = now;
      }
    }
  }
}

// ── Utility ────────────────────────────────────────────────────────────────
function rgba(hex: string, a: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
}

function drawGlow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string,
  intensity = 0.3,
) {
  const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
  grad.addColorStop(0, rgba(color, intensity));
  grad.addColorStop(0.5, rgba(color, intensity * 0.3));
  grad.addColorStop(1, rgba(color, 0));
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

function drawChromeRail(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  width: number,
) {
  ctx.lineCap = 'round';
  // Dark edge
  ctx.strokeStyle = C.chromeDark;
  ctx.lineWidth = width + 2;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  // Chrome body
  ctx.strokeStyle = C.chrome;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  // Bright highlight
  ctx.strokeStyle = rgba(C.chromeBright, 0.4);
  ctx.lineWidth = width * 0.3;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function drawNeonLine(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
  width = 1.5,
  glowWidth = 6,
) {
  // Outer glow
  ctx.strokeStyle = rgba(color, 0.12);
  ctx.lineWidth = glowWidth;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  // Core line
  ctx.strokeStyle = rgba(color, 0.6);
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

// ════════════════════════════════════════════════════════════════════════════
// MAIN RENDER
// ════════════════════════════════════════════════════════════════════════════
export function render(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  state: PhysicsState,
  ball: Matter.Body | null,
  leftFlipper: Matter.Body,
  rightFlipper: Matter.Body,
  _bumperBodies: Matter.Body[],
  _dropTargetBodies: Matter.Body[],
  _benchmark: number,
) {
  const scaleX = canvasWidth / Table.TABLE_WIDTH;
  const scaleY = canvasHeight / Table.TABLE_HEIGHT;
  ctx.save();
  ctx.scale(scaleX, scaleY);
  initStars();

  // Detect new hits → spawn particles
  checkNewHits(state);
  updateParticles(16.67);

  // ── Layer 1: Background ──
  drawBackground(ctx);

  // ── Layer 2: Playfield Art ──
  drawPlayfieldArt(ctx);

  // ── Layer 3: Rails ──
  drawRails(ctx);

  // ── Layer 4: Lane Guides ──
  drawLaneGuides(ctx);

  // ── Layer 5: Static Elements ──
  drawDropTargets(ctx, state);
  drawRollovers(ctx);
  drawRamp(ctx);
  drawSkillShot(ctx);

  // ── Layer 6: Interactive Elements ──
  drawSlingshots(ctx, state);
  drawBumpers(ctx, state);
  drawFlipper(ctx, leftFlipper, true);
  drawFlipper(ctx, rightFlipper, false);
  drawPlunger(ctx, state);
  drawDrain(ctx);

  // ── Layer 7: Ball ──
  if (ball && state.ballInPlay) {
    ballTrail.push({ x: ball.position.x, y: ball.position.y });
    if (ballTrail.length > MAX_TRAIL) ballTrail.shift();
  }
  drawBallTrail(ctx);
  if (ball && state.ballInPlay) drawBall(ctx, ball);

  // ── Layer 8: Effects ──
  drawParticlesLayer(ctx);
  drawScorePopups(ctx, state.scoreEvents);

  ctx.restore();
}

// ════════════════════════════════════════════════════════════════════════════
// BACKGROUND
// ════════════════════════════════════════════════════════════════════════════
function drawBackground(ctx: CanvasRenderingContext2D) {
  // Deep playfield gradient
  const grad = ctx.createLinearGradient(0, 0, 0, Table.TABLE_HEIGHT);
  grad.addColorStop(0, '#080818');
  grad.addColorStop(0.3, '#0a0a24');
  grad.addColorStop(0.6, '#0c0c20');
  grad.addColorStop(1, '#060614');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, Table.TABLE_WIDTH, Table.TABLE_HEIGHT);

  // Subtle playfield dot grid texture
  ctx.fillStyle = 'rgba(80, 100, 160, 0.025)';
  for (let x = 15; x < Table.TABLE_WIDTH - 15; x += 12) {
    for (let y = 15; y < Table.TABLE_HEIGHT - 15; y += 12) {
      ctx.fillRect(x, y, 0.8, 0.8);
    }
  }

  // Twinkling stars
  const now = Date.now();
  for (const s of stars) {
    const twinkle = s.brightness + Math.sin(now * 0.002 + s.x * 0.5) * 0.04;
    ctx.fillStyle = rgba(C.white, Math.max(0, twinkle));
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ════════════════════════════════════════════════════════════════════════════
// PLAYFIELD ART
// ════════════════════════════════════════════════════════════════════════════
function drawPlayfieldArt(ctx: CanvasRenderingContext2D) {
  const cx = 200;
  const cy = 370;

  // Outer decorative rings
  ctx.strokeStyle = rgba(C.amber, 0.06);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(cx, cy, 60, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = rgba(C.amber, 0.04);
  ctx.beginPath();
  ctx.arc(cx, cy, 50, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = rgba(C.blue, 0.03);
  ctx.beginPath();
  ctx.arc(cx, cy, 70, 0, Math.PI * 2);
  ctx.stroke();

  // "COB CADET" watermark
  ctx.fillStyle = rgba(C.amber, 0.055);
  ctx.font = 'bold 20px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('COB', cx, cy - 4);
  ctx.font = '11px monospace';
  ctx.fillText('CADET', cx, cy + 12);

  // Top lane labels: C-O-B
  const topLanes = [
    { x: 120, y: 42 },
    { x: 200, y: 32 },
    { x: 280, y: 42 },
  ];
  const labels = ['C', 'O', 'B'];
  topLanes.forEach((lane, i) => {
    // Arrow insert
    ctx.fillStyle = rgba(C.amber, 0.1);
    ctx.beginPath();
    ctx.moveTo(lane.x, lane.y - 8);
    ctx.lineTo(lane.x + 6, lane.y + 4);
    ctx.lineTo(lane.x - 6, lane.y + 4);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = rgba(C.amber, 0.2);
    ctx.lineWidth = 0.6;
    ctx.stroke();

    // Letter
    ctx.fillStyle = rgba(C.amber, 0.2);
    ctx.font = 'bold 7px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(labels[i], lane.x, lane.y + 14);
  });

  // Bonus multiplier inserts
  const bonusInserts = [
    { x: 155, y: 430, label: '2X' },
    { x: 200, y: 448, label: '3X' },
    { x: 245, y: 430, label: '5X' },
  ];
  bonusInserts.forEach((ins) => {
    ctx.fillStyle = rgba(C.cyan, 0.06);
    ctx.beginPath();
    ctx.arc(ins.x, ins.y, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = rgba(C.cyan, 0.12);
    ctx.lineWidth = 0.5;
    ctx.stroke();

    ctx.fillStyle = rgba(C.cyan, 0.18);
    ctx.font = 'bold 5px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(ins.label, ins.x, ins.y + 2);
  });

  // Subtle orbit guide curves
  ctx.strokeStyle = rgba(C.blue, 0.04);
  ctx.lineWidth = 1;
  // Left orbit
  ctx.beginPath();
  ctx.moveTo(30, 500);
  ctx.quadraticCurveTo(20, 200, 80, 60);
  ctx.stroke();
  // Right orbit
  ctx.beginPath();
  ctx.moveTo(340, 500);
  ctx.quadraticCurveTo(350, 200, 290, 60);
  ctx.stroke();

  // "BALL SAVE" near drain
  ctx.fillStyle = rgba(C.red, 0.07);
  ctx.font = '5px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('BALL SAVE', 200, 682);
}

// ════════════════════════════════════════════════════════════════════════════
// RAILS (WALLS)
// ════════════════════════════════════════════════════════════════════════════
function drawRails(ctx: CanvasRenderingContext2D) {
  // Outer border rails
  drawChromeRail(ctx, 10, 10, 10, 690, 4);
  drawChromeRail(ctx, 390, 10, 390, 690, 4);
  drawChromeRail(ctx, 10, 10, 390, 10, 4);

  // Plunger lane separator
  drawChromeRail(ctx, 357, 310, 357, 690, 3);

  // Inner neon accent edges
  drawNeonLine(ctx, 13, 13, 13, 688, C.blue, 0.8, 5);
  drawNeonLine(ctx, 387, 13, 387, 688, C.blue, 0.8, 5);
  drawNeonLine(ctx, 13, 13, 387, 13, C.blue, 0.8, 5);

  // Guide walls near flippers
  const guides = [Table.walls.leftGuide, Table.walls.rightGuide];
  guides.forEach((g) => {
    ctx.save();
    ctx.translate(g.x, g.y);
    ctx.rotate(g.angle);
    drawChromeRail(ctx, -g.width / 2, 0, g.width / 2, 0, 3);
    ctx.restore();
  });

  // Top curve walls
  const curves = [Table.walls.topLeftCurve, Table.walls.topRightCurve];
  curves.forEach((c) => {
    ctx.save();
    ctx.translate(c.x, c.y);
    ctx.rotate(c.angle);
    drawChromeRail(ctx, -c.width / 2, 0, c.width / 2, 0, 3);
    ctx.restore();
  });

  // Rail post caps at key junctions
  const posts = [
    { x: 10, y: 10 },
    { x: 390, y: 10 },
    { x: 10, y: 690 },
    { x: 390, y: 690 },
    { x: 357, y: 310 },
  ];
  posts.forEach((p) => {
    ctx.fillStyle = C.chrome;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = rgba(C.chromeBright, 0.6);
    ctx.beginPath();
    ctx.arc(p.x - 0.5, p.y - 0.5, 1.2, 0, Math.PI * 2);
    ctx.fill();
  });
}

// ════════════════════════════════════════════════════════════════════════════
// LANE GUIDES
// ════════════════════════════════════════════════════════════════════════════
function drawLaneGuides(ctx: CanvasRenderingContext2D) {
  // Left rollover lane guide
  drawNeonLine(ctx, 30, 270, 30, 440, C.green, 0.5, 4);
  drawNeonLine(ctx, 50, 270, 50, 440, C.green, 0.5, 4);

  // Right rollover lane guide
  drawNeonLine(ctx, 350, 270, 350, 440, C.green, 0.5, 4);
  drawNeonLine(ctx, 370, 270, 370, 440, C.green, 0.5, 4);

  // Drop target lane guides
  drawNeonLine(ctx, 73, 190, 73, 280, C.amber, 0.4, 3);
  drawNeonLine(ctx, 87, 190, 87, 280, C.amber, 0.4, 3);
  drawNeonLine(ctx, 313, 190, 313, 280, C.amber, 0.4, 3);
  drawNeonLine(ctx, 327, 190, 327, 280, C.amber, 0.4, 3);
}

// ════════════════════════════════════════════════════════════════════════════
// BUMPERS
// ════════════════════════════════════════════════════════════════════════════
function drawBumpers(ctx: CanvasRenderingContext2D, state: PhysicsState) {
  const now = Date.now();

  Table.bumpers.forEach((b, i) => {
    const flashAge = now - (state.bumperFlashTimes?.[i] ?? 0);
    const isFlashing = flashAge < 250;
    const flashProg = isFlashing ? flashAge / 250 : 0;

    const baseColor = isFlashing ? C.amberGlow : C.pink;
    const glowColor = isFlashing ? C.amber : C.pinkGlow;

    // Ambient glow
    drawGlow(ctx, b.x, b.y, b.radius + (isFlashing ? 22 : 14), glowColor, isFlashing ? 0.45 : 0.2);

    // Expanding hit ring
    if (isFlashing) {
      const expandR = b.radius + flashProg * 18;
      ctx.strokeStyle = rgba(C.amberGlow, 0.6 * (1 - flashProg));
      ctx.lineWidth = 2 * (1 - flashProg);
      ctx.beginPath();
      ctx.arc(b.x, b.y, expandR, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Outer chrome ring
    ctx.strokeStyle = C.chromeDark;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = isFlashing ? C.amberGlow : C.chrome;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
    ctx.stroke();

    // Ring highlight (top)
    ctx.strokeStyle = rgba(C.chromeBright, isFlashing ? 0.6 : 0.3);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.radius, -Math.PI * 0.8, -Math.PI * 0.2);
    ctx.stroke();

    // Dome (radial gradient)
    const domeGrad = ctx.createRadialGradient(
      b.x - b.radius * 0.3,
      b.y - b.radius * 0.3,
      2,
      b.x,
      b.y,
      b.radius - 2,
    );
    if (isFlashing) {
      domeGrad.addColorStop(0, rgba(C.amberGlow, 0.7));
      domeGrad.addColorStop(0.4, rgba(C.amber, 0.35));
      domeGrad.addColorStop(1, rgba(C.amberDim, 0.1));
    } else {
      domeGrad.addColorStop(0, rgba(C.pinkGlow, 0.35));
      domeGrad.addColorStop(0.4, rgba(C.pink, 0.18));
      domeGrad.addColorStop(1, rgba(C.pinkDim, 0.05));
    }
    ctx.fillStyle = domeGrad;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.radius - 2, 0, Math.PI * 2);
    ctx.fill();

    // Inner accent ring
    ctx.strokeStyle = rgba(baseColor, 0.5);
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.radius * 0.55, 0, Math.PI * 2);
    ctx.stroke();

    // Center cap
    const capGrad = ctx.createRadialGradient(b.x - 1, b.y - 1, 0, b.x, b.y, 6);
    capGrad.addColorStop(0, isFlashing ? C.white : rgba(C.white, 0.9));
    capGrad.addColorStop(0.5, isFlashing ? C.amberGlow : rgba(C.pinkGlow, 0.6));
    capGrad.addColorStop(1, isFlashing ? rgba(C.amber, 0.3) : rgba(C.pink, 0.2));
    ctx.fillStyle = capGrad;
    ctx.beginPath();
    ctx.arc(b.x, b.y, 6, 0, Math.PI * 2);
    ctx.fill();

    // Points value below
    ctx.fillStyle = rgba(C.white, 0.6);
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${b.points}`, b.x, b.y + b.radius + 12);
  });
}

// ════════════════════════════════════════════════════════════════════════════
// SLINGSHOTS
// ════════════════════════════════════════════════════════════════════════════
function drawSlingshots(ctx: CanvasRenderingContext2D, state: PhysicsState) {
  const now = Date.now();

  Table.slingshots.forEach((s, i) => {
    const flashAge = now - (state.slingshotFlashTimes?.[i] ?? 0);
    const isFlashing = flashAge < 200;

    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate(s.angle);

    const hw = s.width / 2;
    const hh = s.height / 2;

    // Glow underneath
    if (isFlashing) {
      drawGlow(ctx, 0, 0, 35, C.purple, 0.5);
    } else {
      drawGlow(ctx, 0, 0, 20, C.purple, 0.08);
    }

    // Base plate gradient
    const plateGrad = ctx.createLinearGradient(0, -hh, 0, hh);
    plateGrad.addColorStop(0, isFlashing ? rgba(C.purpleGlow, 0.5) : rgba(C.purple, 0.12));
    plateGrad.addColorStop(1, isFlashing ? rgba(C.purple, 0.25) : rgba(C.purple, 0.03));

    ctx.beginPath();
    ctx.moveTo(-hw, hh);
    ctx.lineTo(0, -hh);
    ctx.lineTo(hw, hh);
    ctx.closePath();
    ctx.fillStyle = plateGrad;
    ctx.fill();

    // Rubber band edges (neon lines along sides)
    ctx.strokeStyle = isFlashing ? C.purpleGlow : C.purple;
    ctx.lineWidth = isFlashing ? 2.5 : 1.8;
    ctx.shadowColor = C.purple;
    ctx.shadowBlur = isFlashing ? 8 : 4;

    ctx.beginPath();
    ctx.moveTo(-hw, hh);
    ctx.lineTo(0, -hh);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(hw, hh);
    ctx.lineTo(0, -hh);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Bottom chrome bar
    ctx.strokeStyle = C.chromeDark;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-hw, hh);
    ctx.lineTo(hw, hh);
    ctx.stroke();

    ctx.strokeStyle = C.chrome;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-hw, hh);
    ctx.lineTo(hw, hh);
    ctx.stroke();

    // Kicker post at apex
    ctx.fillStyle = C.chromeDark;
    ctx.beginPath();
    ctx.arc(0, -hh, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = C.chrome;
    ctx.beginPath();
    ctx.arc(0, -hh, 1.8, 0, Math.PI * 2);
    ctx.fill();

    // Chrome posts at base corners
    [-hw, hw].forEach((px) => {
      ctx.fillStyle = C.chromeDark;
      ctx.beginPath();
      ctx.arc(px, hh, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = C.chrome;
      ctx.beginPath();
      ctx.arc(px, hh, 1.3, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  });
}

// ════════════════════════════════════════════════════════════════════════════
// FLIPPERS
// ════════════════════════════════════════════════════════════════════════════
function drawFlipper(
  ctx: CanvasRenderingContext2D,
  flipper: Matter.Body,
  isLeft: boolean,
) {
  ctx.save();
  ctx.translate(flipper.position.x, flipper.position.y);
  ctx.rotate(flipper.angle);

  const w = isLeft ? Table.flippers.left.width : Table.flippers.right.width;
  const pivotR = 7;
  const tipR = 4;

  // Shadow beneath
  ctx.fillStyle = rgba('#000000', 0.25);
  ctx.beginPath();
  if (isLeft) {
    ctx.arc(w / 2, 2, tipR + 1, -Math.PI / 2, Math.PI / 2);
    ctx.arc(-w / 2, 2, pivotR + 1, Math.PI / 2, -Math.PI / 2);
  } else {
    ctx.arc(-w / 2, 2, tipR + 1, Math.PI / 2, -Math.PI / 2);
    ctx.arc(w / 2, 2, pivotR + 1, -Math.PI / 2, Math.PI / 2);
  }
  ctx.closePath();
  ctx.fill();

  // Glow underneath
  ctx.shadowColor = C.blueGlow;
  ctx.shadowBlur = 8;

  // Tapered capsule shape
  ctx.beginPath();
  if (isLeft) {
    ctx.arc(w / 2, 0, tipR, -Math.PI / 2, Math.PI / 2);
    ctx.arc(-w / 2, 0, pivotR, Math.PI / 2, -Math.PI / 2);
  } else {
    ctx.arc(-w / 2, 0, tipR, Math.PI / 2, -Math.PI / 2);
    ctx.arc(w / 2, 0, pivotR, -Math.PI / 2, Math.PI / 2);
  }
  ctx.closePath();

  // Chrome gradient fill
  const grad = ctx.createLinearGradient(0, -pivotR, 0, pivotR);
  grad.addColorStop(0, C.chromeBright);
  grad.addColorStop(0.15, C.blueGlow);
  grad.addColorStop(0.5, C.blue);
  grad.addColorStop(0.85, C.blueGlow);
  grad.addColorStop(1, C.blueDim);
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.shadowBlur = 0;

  // Edge stroke
  ctx.strokeStyle = rgba(C.blueGlow, 0.5);
  ctx.lineWidth = 0.7;
  ctx.stroke();

  // Top highlight line
  ctx.strokeStyle = rgba(C.white, 0.25);
  ctx.lineWidth = 0.5;
  const hlY = -pivotR * 0.5;
  ctx.beginPath();
  if (isLeft) {
    ctx.moveTo(-w / 2 + 5, hlY);
    ctx.lineTo(w / 2 - 2, hlY * (tipR / pivotR));
  } else {
    ctx.moveTo(w / 2 - 5, hlY);
    ctx.lineTo(-w / 2 + 2, hlY * (tipR / pivotR));
  }
  ctx.stroke();

  // Pivot point
  const px = isLeft ? -w / 2 : w / 2;
  ctx.fillStyle = C.chromeDark;
  ctx.beginPath();
  ctx.arc(px, 0, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = C.chrome;
  ctx.beginPath();
  ctx.arc(px, 0, 1.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = rgba(C.chromeBright, 0.5);
  ctx.beginPath();
  ctx.arc(px - 0.5, -0.5, 0.8, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// ════════════════════════════════════════════════════════════════════════════
// DROP TARGETS
// ════════════════════════════════════════════════════════════════════════════
function drawDropTargets(ctx: CanvasRenderingContext2D, state: PhysicsState) {
  // Bank labels
  ctx.fillStyle = rgba(C.amber, 0.12);
  ctx.font = '5px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('LEFT', 80, 186);
  ctx.fillText('BANK', 80, 192);
  ctx.fillText('RIGHT', 320, 186);
  ctx.fillText('BANK', 320, 192);

  Table.dropTargets.forEach((dt, i) => {
    const groupIdx = dt.group === 'left' ? i : i - 3;
    const isHit = state.dropTargetState[dt.group][groupIdx];

    // Indicator light above target
    const indicatorY = dt.y - dt.height / 2 - 7;
    if (isHit) {
      drawGlow(ctx, dt.x, indicatorY, 8, C.amber, 0.3);
    }
    ctx.fillStyle = isHit ? rgba(C.amber, 0.7) : rgba(C.amber, 0.1);
    ctx.beginPath();
    ctx.arc(dt.x, indicatorY, 2.5, 0, Math.PI * 2);
    ctx.fill();

    if (isHit) return;

    // Wider visual target plate (physics body is thin)
    const vw = 12;
    const vh = dt.height;

    // Chrome plate gradient
    const plateGrad = ctx.createLinearGradient(dt.x - vw / 2, 0, dt.x + vw / 2, 0);
    plateGrad.addColorStop(0, C.chromeDark);
    plateGrad.addColorStop(0.25, C.amber);
    plateGrad.addColorStop(0.5, C.amberGlow);
    plateGrad.addColorStop(0.75, C.amber);
    plateGrad.addColorStop(1, C.chromeDark);

    ctx.fillStyle = plateGrad;
    ctx.fillRect(dt.x - vw / 2, dt.y - vh / 2, vw, vh);

    // Edge
    ctx.strokeStyle = C.chromeDark;
    ctx.lineWidth = 0.5;
    ctx.strokeRect(dt.x - vw / 2, dt.y - vh / 2, vw, vh);

    // Center accent line
    ctx.strokeStyle = rgba(C.amberGlow, 0.5);
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(dt.x, dt.y - vh / 2 + 2);
    ctx.lineTo(dt.x, dt.y + vh / 2 - 2);
    ctx.stroke();
  });

  // Bank completion glow
  ['left', 'right'].forEach((group) => {
    const allHit = state.dropTargetState[group].every(Boolean);
    if (allHit) {
      const x = group === 'left' ? 80 : 320;
      drawGlow(ctx, x, 230, 30, C.amber, 0.2);
    }
  });
}

// ════════════════════════════════════════════════════════════════════════════
// ROLLOVERS
// ════════════════════════════════════════════════════════════════════════════
function drawRollovers(ctx: CanvasRenderingContext2D) {
  Table.rollovers.forEach((r) => {
    // Lane background
    ctx.fillStyle = rgba(C.green, 0.03);
    ctx.fillRect(r.x - r.width / 2, r.y - r.height / 2, r.width, r.height);

    // Arrow insert (triangle pointing up)
    ctx.beginPath();
    ctx.moveTo(r.x, r.y - r.height / 2 + 2);
    ctx.lineTo(r.x + 8, r.y + r.height / 2 - 2);
    ctx.lineTo(r.x - 8, r.y + r.height / 2 - 2);
    ctx.closePath();

    ctx.fillStyle = rgba(C.green, 0.1);
    ctx.fill();

    ctx.strokeStyle = C.green;
    ctx.lineWidth = 1;
    ctx.shadowColor = C.green;
    ctx.shadowBlur = 4;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Label
    ctx.fillStyle = C.green;
    ctx.font = 'bold 6px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(r.label, r.x, r.y + 2);

    // Points below
    ctx.fillStyle = rgba(C.green, 0.3);
    ctx.font = '4px monospace';
    ctx.fillText(`${r.points}`, r.x, r.y + r.height / 2 + 8);
  });
}

// ════════════════════════════════════════════════════════════════════════════
// RAMP
// ════════════════════════════════════════════════════════════════════════════
function drawRamp(ctx: CanvasRenderingContext2D) {
  const r = Table.ramp;

  // Guide rails (V entrance)
  drawChromeRail(ctx, r.x - 25, r.y + 25, r.x - 5, r.y - 6, 2);
  drawChromeRail(ctx, r.x + 25, r.y + 25, r.x + 5, r.y - 6, 2);

  // Arrow insert at entrance
  ctx.beginPath();
  ctx.moveTo(r.x, r.y - 12);
  ctx.lineTo(r.x + 10, r.y + 4);
  ctx.lineTo(r.x - 10, r.y + 4);
  ctx.closePath();

  ctx.fillStyle = rgba(C.cyan, 0.15);
  ctx.fill();

  ctx.strokeStyle = C.cyan;
  ctx.lineWidth = 1.2;
  ctx.shadowColor = C.cyan;
  ctx.shadowBlur = 8;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // "RAMP" label with glow
  drawGlow(ctx, r.x, r.y + 18, 14, C.cyan, 0.1);
  ctx.fillStyle = C.cyan;
  ctx.font = 'bold 7px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('RAMP', r.x, r.y + 20);

  // Points
  ctx.fillStyle = rgba(C.cyan, 0.4);
  ctx.font = '5px monospace';
  ctx.fillText(`${r.points}`, r.x, r.y + 28);
}

// ════════════════════════════════════════════════════════════════════════════
// SKILL SHOT
// ════════════════════════════════════════════════════════════════════════════
function drawSkillShot(ctx: CanvasRenderingContext2D) {
  const ss = Table.skillShot;
  const now = Date.now();
  const pulse = 0.5 + Math.sin(now * 0.004) * 0.3;

  // Lane boundary
  ctx.strokeStyle = rgba(C.amber, 0.12 + pulse * 0.08);
  ctx.lineWidth = 1;
  ctx.strokeRect(ss.x - ss.width / 2, ss.y - ss.height / 2, ss.width, ss.height);

  // Lane fill
  ctx.fillStyle = rgba(C.amber, 0.02 + pulse * 0.02);
  ctx.fillRect(ss.x - ss.width / 2, ss.y - ss.height / 2, ss.width, ss.height);

  // Arrow inserts stacked
  for (let j = 0; j < 3; j++) {
    const ay = ss.y + ss.height / 2 - 12 - j * 16;
    ctx.beginPath();
    ctx.moveTo(ss.x, ay - 5);
    ctx.lineTo(ss.x + 6, ay + 3);
    ctx.lineTo(ss.x - 6, ay + 3);
    ctx.closePath();

    ctx.fillStyle = rgba(C.amber, 0.08 + pulse * 0.08);
    ctx.fill();
    ctx.strokeStyle = rgba(C.amber, 0.25 + pulse * 0.15);
    ctx.lineWidth = 0.6;
    ctx.stroke();
  }

  // Labels
  ctx.fillStyle = rgba(C.amber, 0.4 + pulse * 0.3);
  ctx.font = 'bold 5px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('SKILL', ss.x, ss.y - ss.height / 2 + 10);
  ctx.fillText('SHOT', ss.x, ss.y - ss.height / 2 + 18);

  ctx.fillStyle = rgba(C.amber, 0.25);
  ctx.font = '4px monospace';
  ctx.fillText(`${ss.points}`, ss.x, ss.y + ss.height / 2 - 4);
}

// ════════════════════════════════════════════════════════════════════════════
// PLUNGER
// ════════════════════════════════════════════════════════════════════════════
function drawPlunger(ctx: CanvasRenderingContext2D, state: PhysicsState) {
  const p = Table.plunger;

  // Barrel track
  ctx.fillStyle = '#12121e';
  ctx.fillRect(p.x - p.width / 2, p.minY - 8, p.width, p.maxY - p.minY + p.height + 16);

  // Track edges
  ctx.strokeStyle = C.chromeDark;
  ctx.lineWidth = 0.8;
  ctx.strokeRect(p.x - p.width / 2, p.minY - 8, p.width, p.maxY - p.minY + p.height + 16);

  // Spring coils
  const chargeOffset = state.plungerCharge * (p.maxY - p.minY);
  const springTop = p.minY;
  const springBottom = p.minY + chargeOffset;
  const coilCount = 6;

  if (chargeOffset > 2) {
    const coilSpacing = (springBottom - springTop) / coilCount;
    ctx.strokeStyle = rgba(C.chrome, 0.5);
    ctx.lineWidth = 0.8;
    for (let i = 0; i <= coilCount; i++) {
      const cy = springTop + i * coilSpacing;
      ctx.beginPath();
      ctx.moveTo(p.x - p.width / 2 + 3, cy);
      ctx.lineTo(p.x + p.width / 2 - 3, cy);
      ctx.stroke();
    }
  }

  // Charge glow
  if (state.isPlungerCharging) {
    drawGlow(
      ctx,
      p.x,
      p.minY + chargeOffset + p.height / 2,
      12 + state.plungerCharge * 12,
      C.amber,
      0.15 + state.plungerCharge * 0.35,
    );
  }

  // Plunger handle
  const handleY = p.minY + chargeOffset;
  const handleGrad = ctx.createLinearGradient(
    p.x - p.width / 2 + 3,
    0,
    p.x + p.width / 2 - 3,
    0,
  );
  handleGrad.addColorStop(0, C.chromeDark);
  handleGrad.addColorStop(0.3, state.isPlungerCharging ? C.amber : C.chrome);
  handleGrad.addColorStop(0.5, state.isPlungerCharging ? C.amberGlow : C.chromeBright);
  handleGrad.addColorStop(0.7, state.isPlungerCharging ? C.amber : C.chrome);
  handleGrad.addColorStop(1, C.chromeDark);

  ctx.fillStyle = handleGrad;
  ctx.fillRect(p.x - p.width / 2 + 3, handleY, p.width - 6, p.height);

  // Handle top cap
  ctx.fillStyle = state.isPlungerCharging ? C.amberGlow : C.chromeBright;
  ctx.fillRect(p.x - p.width / 2 + 2, handleY, p.width - 4, 2.5);
}

// ════════════════════════════════════════════════════════════════════════════
// DRAIN
// ════════════════════════════════════════════════════════════════════════════
function drawDrain(ctx: CanvasRenderingContext2D) {
  const d = Table.drain;

  // Danger zone fill
  ctx.fillStyle = rgba(C.red, 0.04);
  ctx.fillRect(d.x - d.width / 2, d.y - d.height / 2, d.width, d.height);

  // Hazard markers
  [d.x - d.width / 2 + 5, d.x + d.width / 2 - 5].forEach((mx) => {
    ctx.fillStyle = rgba(C.red, 0.18);
    ctx.beginPath();
    ctx.arc(mx, d.y, 2.5, 0, Math.PI * 2);
    ctx.fill();
  });

  // Dashed danger line
  ctx.strokeStyle = rgba(C.red, 0.08);
  ctx.lineWidth = 0.5;
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.moveTo(d.x - d.width / 2, d.y);
  ctx.lineTo(d.x + d.width / 2, d.y);
  ctx.stroke();
  ctx.setLineDash([]);
}

// ════════════════════════════════════════════════════════════════════════════
// BALL
// ════════════════════════════════════════════════════════════════════════════
function drawBall(ctx: CanvasRenderingContext2D, ball: Matter.Body) {
  const x = ball.position.x;
  const y = ball.position.y;
  const r = Table.BALL_RADIUS;

  // Shadow on playfield
  ctx.fillStyle = rgba('#000000', 0.3);
  ctx.beginPath();
  ctx.ellipse(x + 1, y + 2, r * 0.9, r * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Outer glow halo
  drawGlow(ctx, x, y, r * 3, C.white, 0.12);

  // Ball body (chrome gradient)
  const grad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.25, '#e8e8f4');
  grad.addColorStop(0.55, '#aaaacc');
  grad.addColorStop(1, '#555580');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();

  // Specular highlight
  ctx.fillStyle = rgba(C.white, 0.65);
  ctx.beginPath();
  ctx.arc(x - r * 0.25, y - r * 0.25, r * 0.3, 0, Math.PI * 2);
  ctx.fill();

  // Edge ring
  ctx.strokeStyle = rgba(C.chromeDark, 0.4);
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
}

function drawBallTrail(ctx: CanvasRenderingContext2D) {
  for (let i = 0; i < ballTrail.length; i++) {
    const progress = i / ballTrail.length;
    const alpha = progress * 0.35;
    const radius = Table.BALL_RADIUS * (0.2 + progress * 0.5);

    // Blue-white gradient trail
    ctx.fillStyle = rgba(C.blueGlow, alpha);
    ctx.beginPath();
    ctx.arc(ballTrail[i].x, ballTrail[i].y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ════════════════════════════════════════════════════════════════════════════
// PARTICLES
// ════════════════════════════════════════════════════════════════════════════
function drawParticlesLayer(ctx: CanvasRenderingContext2D) {
  for (const p of particles) {
    const alpha = Math.max(0, p.life / p.maxLife);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * (0.3 + alpha * 0.7), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// ════════════════════════════════════════════════════════════════════════════
// SCORE POPUPS
// ════════════════════════════════════════════════════════════════════════════
function drawScorePopups(ctx: CanvasRenderingContext2D, events: ScoreEvent[]) {
  const now = Date.now();

  for (const evt of events) {
    const age = now - evt.timestamp;
    if (age > 1500) continue;

    const progress = age / 1500;
    const alpha = 1 - progress;
    const yOffset = -progress * 40;
    const scale = 1 + progress * 0.3;

    ctx.save();
    ctx.translate(evt.x, evt.y + yOffset);
    ctx.scale(scale, scale);

    // Outline/shadow
    ctx.fillStyle = rgba('#000000', alpha * 0.5);
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(evt.label, 0.5, 0.5);

    // Main text (color by value)
    let color = C.amberGlow;
    if (evt.points >= 1000) color = C.cyan;
    else if (evt.points >= 500) color = C.pinkGlow;

    ctx.fillStyle = rgba(color, alpha);
    ctx.shadowColor = rgba(color, alpha * 0.5);
    ctx.shadowBlur = 4;
    ctx.fillText(evt.label, 0, 0);
    ctx.shadowBlur = 0;

    ctx.restore();
  }
}

// ════════════════════════════════════════════════════════════════════════════
// EXPORTS (API compatibility)
// ════════════════════════════════════════════════════════════════════════════
export function triggerBumperFlash(_index: number) {
  // Now handled via PhysicsState.bumperFlashTimes
}

export function clearTrail() {
  ballTrail.length = 0;
  particles.length = 0;
}
