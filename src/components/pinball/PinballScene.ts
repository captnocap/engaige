/**
 * PinballScene - PixiJS v8 renderer + GSAP animations for Cob Cadet Pinball
 *
 * Layered container hierarchy: background → playfield art → rails →
 * elements → ball → effects. GSAP drives score popups and bumper flashes.
 */

import { Application, Container, Graphics, Text, TextStyle, BlurFilter } from 'pixi.js';
import gsap from 'gsap';
import * as Table from './PinballTable.js';
import type { EngineState, BodyPositions, ScoreEvent } from './PinballEngine.js';

// ── Color Palette ──────────────────────────────────────────────────────────
const C = {
  amber: 0xf0a030,
  amberGlow: 0xffc040,
  amberDim: 0x604010,
  blue: 0x4488ff,
  blueGlow: 0x66bbff,
  blueDim: 0x1a2244,
  pink: 0xff4488,
  pinkGlow: 0xff88bb,
  pinkDim: 0x662244,
  cyan: 0x00ffcc,
  cyanGlow: 0x44ffdd,
  purple: 0x9944ff,
  purpleGlow: 0xbb77ff,
  green: 0x44ff88,
  greenGlow: 0x88ffbb,
  red: 0xff2244,
  white: 0xffffff,
  chrome: 0xaaaacc,
  chromeBright: 0xddddf0,
  chromeDark: 0x444466,
  bg1: 0x080818,
  bg2: 0x0a0a24,
  bg3: 0x060614,
};

// ── Particle ───────────────────────────────────────────────────────────────
interface Particle {
  gfx: Graphics;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}

// ── Ball trail point ───────────────────────────────────────────────────────
interface TrailPoint {
  x: number;
  y: number;
}

export interface PinballScene {
  app: Application;
  mount(el: HTMLElement): void;
  unmount(): void;
  update(state: EngineState, positions: BodyPositions): void;
  clearTrail(): void;
  showIdleScreen(): void;
  showGameOverScreen(message: string): void;
  hideOverlay(): void;
  destroy(): void;
}

export async function createScene(width: number, height: number): Promise<PinballScene> {
  const app = new Application();
  await app.init({
    width,
    height,
    background: 0x080818,
    antialias: true,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
  });

  const scaleX = width / Table.TABLE_WIDTH;
  const scaleY = height / Table.TABLE_HEIGHT;

  // ── Layer containers ──
  const root = new Container();
  root.scale.set(scaleX, scaleY);
  app.stage.addChild(root);

  const bgLayer = new Container();
  const artLayer = new Container();
  const railLayer = new Container();
  const elementLayer = new Container();
  const ballLayer = new Container();
  const effectLayer = new Container();
  const overlayLayer = new Container();

  root.addChild(bgLayer, artLayer, railLayer, elementLayer, ballLayer, effectLayer, overlayLayer);

  // ── Pre-build static graphics ──

  // Background
  const bgGfx = new Graphics();
  bgGfx.rect(0, 0, Table.TABLE_WIDTH, Table.TABLE_HEIGHT);
  bgGfx.fill(C.bg1);
  // Dot grid
  for (let x = 15; x < Table.TABLE_WIDTH - 15; x += 12) {
    for (let y = 15; y < Table.TABLE_HEIGHT - 15; y += 12) {
      bgGfx.rect(x, y, 0.8, 0.8);
      bgGfx.fill({ color: 0x5064a0, alpha: 0.025 });
    }
  }
  bgLayer.addChild(bgGfx);

  // Stars
  const stars: { x: number; y: number; size: number; brightness: number; gfx: Graphics }[] = [];
  for (let i = 0; i < 40; i++) {
    const s = {
      x: Math.random() * Table.TABLE_WIDTH,
      y: Math.random() * Table.TABLE_HEIGHT,
      size: Math.random() * 1.2 + 0.3,
      brightness: Math.random() * 0.25 + 0.08,
      gfx: new Graphics(),
    };
    s.gfx.circle(s.x, s.y, s.size);
    s.gfx.fill({ color: C.white, alpha: s.brightness });
    bgLayer.addChild(s.gfx);
    stars.push(s);
  }

  // Playfield Art
  buildPlayfieldArt(artLayer);

  // Rails
  buildRails(railLayer);

  // Lane guides
  buildLaneGuides(railLayer);

  // Static elements: rollovers, ramp, skill shot, drain
  buildRollovers(elementLayer);
  buildRamp(elementLayer);
  buildSkillShot(elementLayer);
  buildDrain(elementLayer);

  // ── Dynamic element containers ──

  // Bumpers
  const bumperContainers = Table.bumpers.map((b, i) => {
    const container = new Container();
    container.position.set(b.x, b.y);

    // Base dome
    const dome = new Graphics();
    dome.circle(0, 0, b.radius - 2);
    dome.fill({ color: C.pinkGlow, alpha: 0.2 });
    dome.circle(0, 0, b.radius);
    dome.stroke({ color: C.chrome, width: 2.5 });
    dome.circle(0, 0, b.radius * 0.55);
    dome.stroke({ color: C.pink, width: 0.8, alpha: 0.5 });
    // Center cap
    dome.circle(0, 0, 6);
    dome.fill({ color: C.pinkGlow, alpha: 0.6 });
    container.addChild(dome);

    // Flash overlay (hidden by default)
    const flash = new Graphics();
    flash.circle(0, 0, b.radius - 2);
    flash.fill({ color: C.amberGlow, alpha: 0.7 });
    flash.circle(0, 0, b.radius);
    flash.stroke({ color: C.amberGlow, width: 2.5 });
    flash.circle(0, 0, 6);
    flash.fill({ color: C.white, alpha: 0.9 });
    flash.alpha = 0;
    container.addChild(flash);

    // Points label
    const pts = new Text({
      text: `${b.points}`,
      style: new TextStyle({
        fontFamily: 'monospace',
        fontSize: 8,
        fontWeight: 'bold',
        fill: C.white,
        align: 'center',
      }),
    });
    pts.anchor.set(0.5, 0);
    pts.position.set(0, b.radius + 4);
    pts.alpha = 0.6;
    container.addChild(pts);

    elementLayer.addChild(container);
    return { container, flash };
  });

  // Slingshots
  const slingshotContainers = Table.slingshots.map((s, i) => {
    const container = new Container();
    container.position.set(s.x, s.y);
    container.rotation = s.angle;

    const hw = s.width / 2;
    const hh = s.height / 2;

    const base = new Graphics();
    // Triangle fill
    base.moveTo(-hw, hh);
    base.lineTo(0, -hh);
    base.lineTo(hw, hh);
    base.closePath();
    base.fill({ color: C.purple, alpha: 0.12 });
    // Rubber edges
    base.moveTo(-hw, hh);
    base.lineTo(0, -hh);
    base.stroke({ color: C.purple, width: 1.8 });
    base.moveTo(hw, hh);
    base.lineTo(0, -hh);
    base.stroke({ color: C.purple, width: 1.8 });
    // Bottom bar
    base.moveTo(-hw, hh);
    base.lineTo(hw, hh);
    base.stroke({ color: C.chrome, width: 1.5 });
    // Posts
    base.circle(0, -hh, 1.8);
    base.fill(C.chrome);
    base.circle(-hw, hh, 1.3);
    base.fill(C.chrome);
    base.circle(hw, hh, 1.3);
    base.fill(C.chrome);
    container.addChild(base);

    // Flash overlay
    const flash = new Graphics();
    flash.moveTo(-hw, hh);
    flash.lineTo(0, -hh);
    flash.lineTo(hw, hh);
    flash.closePath();
    flash.fill({ color: C.purpleGlow, alpha: 0.5 });
    flash.alpha = 0;
    container.addChild(flash);

    elementLayer.addChild(container);
    return { container, flash };
  });

  // Drop targets
  const dropTargetGfxs = Table.dropTargets.map((dt, i) => {
    const container = new Container();
    container.position.set(dt.x, dt.y);

    const vw = 12;
    const vh = dt.height;

    // Target plate
    const plate = new Graphics();
    plate.rect(-vw / 2, -vh / 2, vw, vh);
    plate.fill(C.amber);
    plate.rect(-vw / 2, -vh / 2, vw, vh);
    plate.stroke({ color: C.chromeDark, width: 0.5 });
    // Center line
    plate.moveTo(0, -vh / 2 + 2);
    plate.lineTo(0, vh / 2 - 2);
    plate.stroke({ color: C.amberGlow, width: 0.5, alpha: 0.5 });
    container.addChild(plate);

    // Indicator light
    const indicator = new Graphics();
    indicator.circle(0, -vh / 2 - 7, 2.5);
    indicator.fill({ color: C.amber, alpha: 0.1 });
    container.addChild(indicator);

    elementLayer.addChild(container);
    return { container, plate, indicator };
  });

  // Plunger
  const plungerContainer = new Container();
  const plungerTrack = new Graphics();
  const plungerHandle = new Graphics();
  buildPlungerTrack(plungerTrack);
  plungerContainer.addChild(plungerTrack, plungerHandle);
  elementLayer.addChild(plungerContainer);

  // Flippers
  const leftFlipperGfx = buildFlipperGraphics(true);
  const rightFlipperGfx = buildFlipperGraphics(false);
  elementLayer.addChild(leftFlipperGfx);
  elementLayer.addChild(rightFlipperGfx);

  // Ball
  const ballGfx = new Graphics();
  ballGfx.visible = false;
  buildBallGraphics(ballGfx);
  ballLayer.addChild(ballGfx);

  // Ball trail
  const trail: TrailPoint[] = [];
  const MAX_TRAIL = 12;
  const trailGfx = new Graphics();
  ballLayer.addChild(trailGfx);
  // Move ball on top of trail
  ballLayer.setChildIndex(ballGfx, ballLayer.children.length - 1);

  // Particles
  const particles: Particle[] = [];
  const lastParticleSpawn: Record<string, number> = {};

  // Score popup tracking
  const activePopups = new Set<Container>();
  const processedEvents = new Set<number>(); // Track by timestamp

  // Overlay graphics
  const overlayBg = new Graphics();
  const overlayText1 = new Text({ text: '', style: new TextStyle({
    fontFamily: 'monospace', fontSize: 20, fontWeight: 'bold', fill: 0x00ff88, align: 'center',
  }) });
  const overlayText2 = new Text({ text: '', style: new TextStyle({
    fontFamily: 'monospace', fontSize: 11, fill: 0x888888, align: 'center',
  }) });
  const overlayText3 = new Text({ text: '', style: new TextStyle({
    fontFamily: 'monospace', fontSize: 8, fill: 0x555555, align: 'center',
  }) });
  overlayText1.anchor.set(0.5);
  overlayText2.anchor.set(0.5);
  overlayText3.anchor.set(0.5);
  overlayLayer.addChild(overlayBg, overlayText1, overlayText2, overlayText3);
  overlayLayer.visible = false;

  // ── Helpers ──────────────────────────────────────────────────────────────

  function spawnParticles(x: number, y: number, color: number, count = 6) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const spd = 0.4 + Math.random() * 1.5;
      const life = 200 + Math.random() * 300;
      const gfx = new Graphics();
      const size = 1 + Math.random() * 1.5;
      gfx.circle(0, 0, size);
      gfx.fill(color);
      gfx.position.set(x, y);
      effectLayer.addChild(gfx);
      particles.push({
        gfx,
        vx: Math.cos(a) * spd,
        vy: Math.sin(a) * spd,
        life,
        maxLife: life,
      });
    }
  }

  function createScorePopup(evt: ScoreEvent) {
    const color = evt.points >= 1000 ? C.cyan : evt.points >= 500 ? C.pinkGlow : C.amberGlow;
    const text = new Text({
      text: evt.label,
      style: new TextStyle({
        fontFamily: 'monospace',
        fontSize: 10,
        fontWeight: 'bold',
        fill: color,
        align: 'center',
        dropShadow: {
          alpha: 0.5,
          blur: 2,
          distance: 1,
          color: 0x000000,
        },
      }),
    });
    text.anchor.set(0.5);
    text.position.set(evt.x, evt.y);

    const container = new Container();
    container.addChild(text);
    effectLayer.addChild(container);
    activePopups.add(container);

    gsap.to(container, {
      y: -40,
      alpha: 0,
      duration: 1.2,
      ease: 'power2.out',
      onComplete: () => {
        effectLayer.removeChild(container);
        container.destroy();
        activePopups.delete(container);
      },
    });
    gsap.to(container.scale, {
      x: 1.3,
      y: 1.3,
      duration: 1.2,
      ease: 'power2.out',
    });
  }

  function flashBumper(index: number) {
    const bumper = bumperContainers[index];
    if (!bumper) return;
    bumper.flash.alpha = 1;
    gsap.to(bumper.flash, { alpha: 0, duration: 0.25, ease: 'power2.out' });

    // Expanding ring effect
    const ring = new Graphics();
    const b = Table.bumpers[index];
    ring.circle(b.x, b.y, b.radius);
    ring.stroke({ color: C.amberGlow, width: 2 });
    effectLayer.addChild(ring);
    gsap.to(ring, {
      alpha: 0,
      duration: 0.3,
      ease: 'power2.out',
      onComplete: () => {
        effectLayer.removeChild(ring);
        ring.destroy();
      },
    });
    gsap.to(ring.scale, { x: 1.8, y: 1.8, duration: 0.3, ease: 'power2.out' });
    ring.pivot.set(b.x, b.y);
    ring.position.set(b.x, b.y);

    spawnParticles(b.x, b.y, C.pink, 8);
  }

  function flashSlingshot(index: number) {
    const ss = slingshotContainers[index];
    if (!ss) return;
    ss.flash.alpha = 1;
    gsap.to(ss.flash, { alpha: 0, duration: 0.2, ease: 'power2.out' });
    spawnParticles(Table.slingshots[index].x, Table.slingshots[index].y, C.purple, 6);
  }

  // ── Build plunger handle per-frame ──

  function updatePlunger(state: EngineState) {
    const p = Table.plunger;
    const chargeOffset = state.plungerCharge * (p.maxY - p.minY);
    const handleY = p.minY + chargeOffset;
    const handleColor = state.isPlungerCharging ? C.amberGlow : C.chrome;

    plungerHandle.clear();
    plungerHandle.rect(p.x - p.width / 2 + 3, handleY, p.width - 6, p.height);
    plungerHandle.fill(handleColor);
    plungerHandle.rect(p.x - p.width / 2 + 2, handleY, p.width - 4, 2.5);
    plungerHandle.fill(state.isPlungerCharging ? C.amberGlow : C.chromeBright);

    // Spring coils
    if (chargeOffset > 2) {
      const springTop = p.minY;
      const coilCount = 6;
      const coilSpacing = chargeOffset / coilCount;
      for (let i = 0; i <= coilCount; i++) {
        const cy = springTop + i * coilSpacing;
        plungerHandle.moveTo(p.x - p.width / 2 + 3, cy);
        plungerHandle.lineTo(p.x + p.width / 2 - 3, cy);
        plungerHandle.stroke({ color: C.chrome, width: 0.8, alpha: 0.5 });
      }
    }
  }

  // ── Previous flash times for detecting new hits ──
  let prevBumperFlashes = Table.bumpers.map(() => 0);
  let prevSlingshotFlashes = Table.slingshots.map(() => 0);

  // ── Scene API ────────────────────────────────────────────────────────────

  return {
    app,

    mount(el: HTMLElement) {
      el.appendChild(app.canvas as HTMLCanvasElement);
    },

    unmount() {
      const canvas = app.canvas as HTMLCanvasElement;
      if (canvas.parentElement) {
        canvas.parentElement.removeChild(canvas);
      }
    },

    update(state: EngineState, positions: BodyPositions) {
      // ── Detect new bumper/slingshot hits ──
      for (let i = 0; i < state.bumperFlashTimes.length; i++) {
        if (state.bumperFlashTimes[i] > prevBumperFlashes[i]) {
          flashBumper(i);
        }
      }
      prevBumperFlashes = [...state.bumperFlashTimes];

      for (let i = 0; i < state.slingshotFlashTimes.length; i++) {
        if (state.slingshotFlashTimes[i] > prevSlingshotFlashes[i]) {
          flashSlingshot(i);
        }
      }
      prevSlingshotFlashes = [...state.slingshotFlashTimes];

      // ── Score events → popups ──
      for (const evt of state.scoreEvents) {
        if (!processedEvents.has(evt.timestamp)) {
          processedEvents.add(evt.timestamp);
          createScorePopup(evt);
        }
      }
      // Cleanup old timestamps
      const cutoff = Date.now() - 3000;
      for (const ts of processedEvents) {
        if (ts < cutoff) processedEvents.delete(ts);
      }

      // ── Update flippers ──
      leftFlipperGfx.position.set(positions.leftFlipper.x, positions.leftFlipper.y);
      leftFlipperGfx.rotation = positions.leftFlipper.angle;
      rightFlipperGfx.position.set(positions.rightFlipper.x, positions.rightFlipper.y);
      rightFlipperGfx.rotation = positions.rightFlipper.angle;

      // ── Update ball ──
      if (positions.ball && state.ballInPlay) {
        ballGfx.visible = true;
        ballGfx.position.set(positions.ball.x, positions.ball.y);

        // Trail
        trail.push({ x: positions.ball.x, y: positions.ball.y });
        if (trail.length > MAX_TRAIL) trail.shift();
      } else {
        ballGfx.visible = false;
      }

      // Draw trail
      trailGfx.clear();
      for (let i = 0; i < trail.length; i++) {
        const progress = i / trail.length;
        const alpha = progress * 0.35;
        const radius = Table.BALL_RADIUS * (0.2 + progress * 0.5);
        trailGfx.circle(trail[i].x, trail[i].y, radius);
        trailGfx.fill({ color: C.blueGlow, alpha });
      }

      // ── Update particles ──
      const dt = 16.67; // approximate frame time
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.gfx.x += p.vx * dt * 0.06;
        p.gfx.y += p.vy * dt * 0.06;
        p.life -= dt;
        p.gfx.alpha = Math.max(0, p.life / p.maxLife);
        if (p.life <= 0) {
          effectLayer.removeChild(p.gfx);
          p.gfx.destroy();
          particles.splice(i, 1);
        }
      }

      // ── Update drop targets ──
      Table.dropTargets.forEach((dt, i) => {
        const groupIdx = dt.group === 'left' ? i : i - 3;
        const isHit = state.dropTargetState[dt.group][groupIdx];
        const dtGfx = dropTargetGfxs[i];
        dtGfx.plate.visible = !isHit;
        dtGfx.indicator.clear();
        dtGfx.indicator.circle(0, -dt.height / 2 - 7, 2.5);
        dtGfx.indicator.fill({ color: C.amber, alpha: isHit ? 0.7 : 0.1 });
      });

      // ── Update plunger ──
      updatePlunger(state);

      // ── Twinkling stars ──
      const now = Date.now();
      for (const s of stars) {
        const twinkle = s.brightness + Math.sin(now * 0.002 + s.x * 0.5) * 0.04;
        s.gfx.alpha = Math.max(0, twinkle);
      }
    },

    clearTrail() {
      trail.length = 0;
      trailGfx.clear();
      // Remove all particles
      for (const p of particles) {
        effectLayer.removeChild(p.gfx);
        p.gfx.destroy();
      }
      particles.length = 0;
    },

    showIdleScreen() {
      overlayLayer.visible = true;
      overlayBg.clear();
      overlayBg.rect(50, Table.TABLE_HEIGHT / 2 - 60, Table.TABLE_WIDTH - 100, 130);
      overlayBg.fill({ color: 0x000000, alpha: 0.6 });

      overlayText1.text = 'COB CADET\nPINBALL';
      overlayText1.position.set(Table.TABLE_WIDTH / 2, Table.TABLE_HEIGHT / 2 - 10);
      overlayText1.style.fill = 0x00ff88;

      overlayText2.text = 'Press SPACE to start';
      overlayText2.position.set(Table.TABLE_WIDTH / 2, Table.TABLE_HEIGHT / 2 + 35);

      overlayText3.text = 'Z/\u2190 Left  \u2022  //\u2192 Right  \u2022  N Nudge';
      overlayText3.position.set(Table.TABLE_WIDTH / 2, Table.TABLE_HEIGHT / 2 + 52);
    },

    showGameOverScreen(message: string) {
      overlayLayer.visible = true;
      overlayBg.clear();
      overlayBg.rect(50, Table.TABLE_HEIGHT / 2 - 60, Table.TABLE_WIDTH - 100, 130);
      overlayBg.fill({ color: 0x000000, alpha: 0.6 });

      const lines = message.split('\n');
      overlayText1.text = lines[0] || '';
      overlayText1.position.set(Table.TABLE_WIDTH / 2, Table.TABLE_HEIGHT / 2 - 15);
      overlayText1.style.fill = 0xffaa00;
      overlayText1.style.fontSize = 12;

      overlayText2.text = lines[1] || '';
      overlayText2.position.set(Table.TABLE_WIDTH / 2, Table.TABLE_HEIGHT / 2 + 10);

      overlayText3.text = lines.slice(2).join('\n') || '';
      overlayText3.position.set(Table.TABLE_WIDTH / 2, Table.TABLE_HEIGHT / 2 + 35);
    },

    hideOverlay() {
      overlayLayer.visible = false;
    },

    destroy() {
      // Kill all GSAP tweens on popup containers
      for (const popup of activePopups) {
        gsap.killTweensOf(popup);
        gsap.killTweensOf(popup.scale);
      }
      for (const b of bumperContainers) gsap.killTweensOf(b.flash);
      for (const s of slingshotContainers) gsap.killTweensOf(s.flash);

      app.destroy(true, { children: true });
    },
  };
}

// ════════════════════════════════════════════════════════════════════════════
// Static builders
// ════════════════════════════════════════════════════════════════════════════

function buildPlayfieldArt(layer: Container) {
  const gfx = new Graphics();
  const cx = 200;
  const cy = 370;

  // Decorative rings
  gfx.circle(cx, cy, 60);
  gfx.stroke({ color: C.amber, width: 1, alpha: 0.06 });
  gfx.circle(cx, cy, 50);
  gfx.stroke({ color: C.amber, width: 1, alpha: 0.04 });
  gfx.circle(cx, cy, 70);
  gfx.stroke({ color: C.blue, width: 1, alpha: 0.03 });

  // Subtle orbit curves
  gfx.moveTo(30, 500);
  gfx.quadraticCurveTo(20, 200, 80, 60);
  gfx.stroke({ color: C.blue, width: 1, alpha: 0.04 });
  gfx.moveTo(340, 500);
  gfx.quadraticCurveTo(350, 200, 290, 60);
  gfx.stroke({ color: C.blue, width: 1, alpha: 0.04 });

  layer.addChild(gfx);

  // "COB CADET" watermark
  const title = new Text({
    text: 'COB',
    style: new TextStyle({ fontFamily: 'monospace', fontSize: 20, fontWeight: 'bold', fill: C.amber, align: 'center' }),
  });
  title.anchor.set(0.5);
  title.position.set(cx, cy - 4);
  title.alpha = 0.055;
  layer.addChild(title);

  const subtitle = new Text({
    text: 'CADET',
    style: new TextStyle({ fontFamily: 'monospace', fontSize: 11, fill: C.amber, align: 'center' }),
  });
  subtitle.anchor.set(0.5);
  subtitle.position.set(cx, cy + 12);
  subtitle.alpha = 0.055;
  layer.addChild(subtitle);

  // Top lane labels
  const topLanes = [
    { x: 120, y: 42, label: 'C' },
    { x: 200, y: 32, label: 'O' },
    { x: 280, y: 42, label: 'B' },
  ];
  for (const lane of topLanes) {
    const arrow = new Graphics();
    arrow.moveTo(lane.x, lane.y - 8);
    arrow.lineTo(lane.x + 6, lane.y + 4);
    arrow.lineTo(lane.x - 6, lane.y + 4);
    arrow.closePath();
    arrow.fill({ color: C.amber, alpha: 0.1 });
    arrow.stroke({ color: C.amber, width: 0.6, alpha: 0.2 });
    layer.addChild(arrow);

    const lbl = new Text({
      text: lane.label,
      style: new TextStyle({ fontFamily: 'monospace', fontSize: 7, fontWeight: 'bold', fill: C.amber }),
    });
    lbl.anchor.set(0.5);
    lbl.position.set(lane.x, lane.y + 14);
    lbl.alpha = 0.2;
    layer.addChild(lbl);
  }

  // Bonus multiplier inserts
  const bonusInserts = [
    { x: 155, y: 430, label: '2X' },
    { x: 200, y: 448, label: '3X' },
    { x: 245, y: 430, label: '5X' },
  ];
  for (const ins of bonusInserts) {
    const g = new Graphics();
    g.circle(ins.x, ins.y, 9);
    g.fill({ color: C.cyan, alpha: 0.06 });
    g.circle(ins.x, ins.y, 9);
    g.stroke({ color: C.cyan, width: 0.5, alpha: 0.12 });
    layer.addChild(g);

    const lbl = new Text({
      text: ins.label,
      style: new TextStyle({ fontFamily: 'monospace', fontSize: 5, fontWeight: 'bold', fill: C.cyan }),
    });
    lbl.anchor.set(0.5);
    lbl.position.set(ins.x, ins.y + 2);
    lbl.alpha = 0.18;
    layer.addChild(lbl);
  }

  // "BALL SAVE" near drain
  const ballSave = new Text({
    text: 'BALL SAVE',
    style: new TextStyle({ fontFamily: 'monospace', fontSize: 5, fill: C.red }),
  });
  ballSave.anchor.set(0.5);
  ballSave.position.set(200, 682);
  ballSave.alpha = 0.07;
  layer.addChild(ballSave);

  // Bank labels
  const leftBank = new Text({
    text: 'LEFT\nBANK',
    style: new TextStyle({ fontFamily: 'monospace', fontSize: 5, fill: C.amber, align: 'center' }),
  });
  leftBank.anchor.set(0.5, 1);
  leftBank.position.set(80, 192);
  leftBank.alpha = 0.12;
  layer.addChild(leftBank);

  const rightBank = new Text({
    text: 'RIGHT\nBANK',
    style: new TextStyle({ fontFamily: 'monospace', fontSize: 5, fill: C.amber, align: 'center' }),
  });
  rightBank.anchor.set(0.5, 1);
  rightBank.position.set(320, 192);
  rightBank.alpha = 0.12;
  layer.addChild(rightBank);
}

function drawChromeRail(gfx: Graphics, x1: number, y1: number, x2: number, y2: number, width: number) {
  // Dark edge
  gfx.moveTo(x1, y1);
  gfx.lineTo(x2, y2);
  gfx.stroke({ color: C.chromeDark, width: width + 2, cap: 'round' });
  // Chrome body
  gfx.moveTo(x1, y1);
  gfx.lineTo(x2, y2);
  gfx.stroke({ color: C.chrome, width, cap: 'round' });
  // Highlight
  gfx.moveTo(x1, y1);
  gfx.lineTo(x2, y2);
  gfx.stroke({ color: C.chromeBright, width: width * 0.3, alpha: 0.4, cap: 'round' });
}

function drawNeonLine(gfx: Graphics, x1: number, y1: number, x2: number, y2: number, color: number, width = 1.5, glowAlpha = 0.12) {
  // Outer glow
  gfx.moveTo(x1, y1);
  gfx.lineTo(x2, y2);
  gfx.stroke({ color, width: 6, alpha: glowAlpha, cap: 'round' });
  // Core
  gfx.moveTo(x1, y1);
  gfx.lineTo(x2, y2);
  gfx.stroke({ color, width, alpha: 0.6, cap: 'round' });
}

function buildRails(layer: Container) {
  const gfx = new Graphics();

  // Outer border
  drawChromeRail(gfx, 10, 10, 10, 690, 4);
  drawChromeRail(gfx, 390, 10, 390, 690, 4);
  drawChromeRail(gfx, 10, 10, 390, 10, 4);

  // Plunger lane
  drawChromeRail(gfx, 357, 310, 357, 690, 3);

  // Neon accents
  drawNeonLine(gfx, 13, 13, 13, 688, C.blue, 0.8);
  drawNeonLine(gfx, 387, 13, 387, 688, C.blue, 0.8);
  drawNeonLine(gfx, 13, 13, 387, 13, C.blue, 0.8);

  // Guide walls
  const guides = [Table.walls.leftGuide, Table.walls.rightGuide];
  for (const g of guides) {
    const cos = Math.cos(g.angle);
    const sin = Math.sin(g.angle);
    const hw = g.width / 2;
    drawChromeRail(gfx, g.x - cos * hw, g.y - sin * hw, g.x + cos * hw, g.y + sin * hw, 3);
  }

  // Top curves
  const curves = [Table.walls.topLeftCurve, Table.walls.topRightCurve];
  for (const c of curves) {
    const cos = Math.cos(c.angle);
    const sin = Math.sin(c.angle);
    const hw = c.width / 2;
    drawChromeRail(gfx, c.x - cos * hw, c.y - sin * hw, c.x + cos * hw, c.y + sin * hw, 3);
  }

  // Rail post caps
  const posts = [
    { x: 10, y: 10 }, { x: 390, y: 10 },
    { x: 10, y: 690 }, { x: 390, y: 690 },
    { x: 357, y: 310 },
  ];
  for (const p of posts) {
    gfx.circle(p.x, p.y, 3);
    gfx.fill(C.chrome);
    gfx.circle(p.x - 0.5, p.y - 0.5, 1.2);
    gfx.fill({ color: C.chromeBright, alpha: 0.6 });
  }

  layer.addChild(gfx);
}

function buildLaneGuides(layer: Container) {
  const gfx = new Graphics();
  // Left rollover lane
  drawNeonLine(gfx, 30, 270, 30, 440, C.green, 0.5);
  drawNeonLine(gfx, 50, 270, 50, 440, C.green, 0.5);
  // Right rollover lane
  drawNeonLine(gfx, 350, 270, 350, 440, C.green, 0.5);
  drawNeonLine(gfx, 370, 270, 370, 440, C.green, 0.5);
  // Drop target lanes
  drawNeonLine(gfx, 73, 190, 73, 280, C.amber, 0.4);
  drawNeonLine(gfx, 87, 190, 87, 280, C.amber, 0.4);
  drawNeonLine(gfx, 313, 190, 313, 280, C.amber, 0.4);
  drawNeonLine(gfx, 327, 190, 327, 280, C.amber, 0.4);
  layer.addChild(gfx);
}

function buildRollovers(layer: Container) {
  for (const r of Table.rollovers) {
    const gfx = new Graphics();
    // Lane bg
    gfx.rect(r.x - r.width / 2, r.y - r.height / 2, r.width, r.height);
    gfx.fill({ color: C.green, alpha: 0.03 });
    // Arrow
    gfx.moveTo(r.x, r.y - r.height / 2 + 2);
    gfx.lineTo(r.x + 8, r.y + r.height / 2 - 2);
    gfx.lineTo(r.x - 8, r.y + r.height / 2 - 2);
    gfx.closePath();
    gfx.fill({ color: C.green, alpha: 0.1 });
    gfx.stroke({ color: C.green, width: 1 });
    layer.addChild(gfx);

    const lbl = new Text({
      text: r.label,
      style: new TextStyle({ fontFamily: 'monospace', fontSize: 6, fontWeight: 'bold', fill: C.green }),
    });
    lbl.anchor.set(0.5);
    lbl.position.set(r.x, r.y + 2);
    layer.addChild(lbl);

    const pts = new Text({
      text: `${r.points}`,
      style: new TextStyle({ fontFamily: 'monospace', fontSize: 4, fill: C.green }),
    });
    pts.anchor.set(0.5);
    pts.position.set(r.x, r.y + r.height / 2 + 8);
    pts.alpha = 0.3;
    layer.addChild(pts);
  }
}

function buildRamp(layer: Container) {
  const r = Table.ramp;
  const gfx = new Graphics();

  // Guide rails
  drawChromeRail(gfx, r.x - 25, r.y + 25, r.x - 5, r.y - 6, 2);
  drawChromeRail(gfx, r.x + 25, r.y + 25, r.x + 5, r.y - 6, 2);

  // Arrow
  gfx.moveTo(r.x, r.y - 12);
  gfx.lineTo(r.x + 10, r.y + 4);
  gfx.lineTo(r.x - 10, r.y + 4);
  gfx.closePath();
  gfx.fill({ color: C.cyan, alpha: 0.15 });
  gfx.stroke({ color: C.cyan, width: 1.2 });

  layer.addChild(gfx);

  const rampLabel = new Text({
    text: 'RAMP',
    style: new TextStyle({ fontFamily: 'monospace', fontSize: 7, fontWeight: 'bold', fill: C.cyan }),
  });
  rampLabel.anchor.set(0.5);
  rampLabel.position.set(r.x, r.y + 20);
  layer.addChild(rampLabel);

  const pts = new Text({
    text: `${r.points}`,
    style: new TextStyle({ fontFamily: 'monospace', fontSize: 5, fill: C.cyan }),
  });
  pts.anchor.set(0.5);
  pts.position.set(r.x, r.y + 28);
  pts.alpha = 0.4;
  layer.addChild(pts);
}

function buildSkillShot(layer: Container) {
  const ss = Table.skillShot;
  const gfx = new Graphics();

  // Lane boundary
  gfx.rect(ss.x - ss.width / 2, ss.y - ss.height / 2, ss.width, ss.height);
  gfx.stroke({ color: C.amber, width: 1, alpha: 0.15 });
  gfx.rect(ss.x - ss.width / 2, ss.y - ss.height / 2, ss.width, ss.height);
  gfx.fill({ color: C.amber, alpha: 0.03 });

  // Arrows
  for (let j = 0; j < 3; j++) {
    const ay = ss.y + ss.height / 2 - 12 - j * 16;
    gfx.moveTo(ss.x, ay - 5);
    gfx.lineTo(ss.x + 6, ay + 3);
    gfx.lineTo(ss.x - 6, ay + 3);
    gfx.closePath();
    gfx.fill({ color: C.amber, alpha: 0.12 });
    gfx.stroke({ color: C.amber, width: 0.6, alpha: 0.3 });
  }

  layer.addChild(gfx);

  const lbl = new Text({
    text: 'SKILL\nSHOT',
    style: new TextStyle({ fontFamily: 'monospace', fontSize: 5, fontWeight: 'bold', fill: C.amber, align: 'center' }),
  });
  lbl.anchor.set(0.5, 0);
  lbl.position.set(ss.x, ss.y - ss.height / 2 + 4);
  lbl.alpha = 0.5;
  layer.addChild(lbl);

  const pts = new Text({
    text: `${ss.points}`,
    style: new TextStyle({ fontFamily: 'monospace', fontSize: 4, fill: C.amber }),
  });
  pts.anchor.set(0.5);
  pts.position.set(ss.x, ss.y + ss.height / 2 - 4);
  pts.alpha = 0.25;
  layer.addChild(pts);
}

function buildDrain(layer: Container) {
  const d = Table.drain;
  const gfx = new Graphics();

  gfx.rect(d.x - d.width / 2, d.y - d.height / 2, d.width, d.height);
  gfx.fill({ color: C.red, alpha: 0.04 });

  // Hazard markers
  gfx.circle(d.x - d.width / 2 + 5, d.y, 2.5);
  gfx.fill({ color: C.red, alpha: 0.18 });
  gfx.circle(d.x + d.width / 2 - 5, d.y, 2.5);
  gfx.fill({ color: C.red, alpha: 0.18 });

  // Dashed danger line
  const dashLen = 3;
  for (let x = d.x - d.width / 2; x < d.x + d.width / 2; x += dashLen * 2) {
    gfx.moveTo(x, d.y);
    gfx.lineTo(Math.min(x + dashLen, d.x + d.width / 2), d.y);
    gfx.stroke({ color: C.red, width: 0.5, alpha: 0.08 });
  }

  layer.addChild(gfx);
}

function buildPlungerTrack(gfx: Graphics) {
  const p = Table.plunger;
  gfx.rect(p.x - p.width / 2, p.minY - 8, p.width, p.maxY - p.minY + p.height + 16);
  gfx.fill(0x12121e);
  gfx.rect(p.x - p.width / 2, p.minY - 8, p.width, p.maxY - p.minY + p.height + 16);
  gfx.stroke({ color: C.chromeDark, width: 0.8 });
}

function buildFlipperGraphics(isLeft: boolean): Graphics {
  const f = isLeft ? Table.flippers.left : Table.flippers.right;
  const w = f.width;
  const pivotR = 7;
  const tipR = 4;

  const gfx = new Graphics();

  // Shadow
  gfx.fill({ color: 0x000000, alpha: 0.25 });
  if (isLeft) {
    gfx.arc(w / 2, 2, tipR + 1, -Math.PI / 2, Math.PI / 2);
    gfx.arc(-w / 2, 2, pivotR + 1, Math.PI / 2, -Math.PI / 2);
  } else {
    gfx.arc(-w / 2, 2, tipR + 1, Math.PI / 2, -Math.PI / 2);
    gfx.arc(w / 2, 2, pivotR + 1, -Math.PI / 2, Math.PI / 2);
  }
  gfx.closePath();
  gfx.fill({ color: 0x000000, alpha: 0.25 });

  // Main body
  if (isLeft) {
    gfx.arc(w / 2, 0, tipR, -Math.PI / 2, Math.PI / 2);
    gfx.arc(-w / 2, 0, pivotR, Math.PI / 2, -Math.PI / 2);
  } else {
    gfx.arc(-w / 2, 0, tipR, Math.PI / 2, -Math.PI / 2);
    gfx.arc(w / 2, 0, pivotR, -Math.PI / 2, Math.PI / 2);
  }
  gfx.closePath();
  gfx.fill(C.blue);

  // Edge stroke
  if (isLeft) {
    gfx.arc(w / 2, 0, tipR, -Math.PI / 2, Math.PI / 2);
    gfx.arc(-w / 2, 0, pivotR, Math.PI / 2, -Math.PI / 2);
  } else {
    gfx.arc(-w / 2, 0, tipR, Math.PI / 2, -Math.PI / 2);
    gfx.arc(w / 2, 0, pivotR, -Math.PI / 2, Math.PI / 2);
  }
  gfx.closePath();
  gfx.stroke({ color: C.blueGlow, width: 0.7, alpha: 0.5 });

  // Pivot point
  const px = isLeft ? -w / 2 : w / 2;
  gfx.circle(px, 0, 3.5);
  gfx.fill(C.chromeDark);
  gfx.circle(px, 0, 1.8);
  gfx.fill(C.chrome);
  gfx.circle(px - 0.5, -0.5, 0.8);
  gfx.fill({ color: C.chromeBright, alpha: 0.5 });

  return gfx;
}

function buildBallGraphics(gfx: Graphics) {
  const r = Table.BALL_RADIUS;

  // Shadow
  gfx.ellipse(1, 2, r * 0.9, r * 0.5);
  gfx.fill({ color: 0x000000, alpha: 0.3 });

  // Ball body
  gfx.circle(0, 0, r);
  gfx.fill(0xaaaacc);

  // Specular highlight
  gfx.circle(-r * 0.25, -r * 0.25, r * 0.3);
  gfx.fill({ color: C.white, alpha: 0.65 });

  // Edge ring
  gfx.circle(0, 0, r);
  gfx.stroke({ color: C.chromeDark, width: 0.5, alpha: 0.4 });
}
