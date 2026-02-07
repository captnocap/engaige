/**
 * PinballGame - React integration for Planck/PixiJS/GSAP/Howler pinball engine
 *
 * Mounts PixiJS to a container div, drives the game loop via PixiJS ticker,
 * handles keyboard input, WebSocket communication, and parent callbacks.
 */

import { useRef, useEffect, useState, useCallback } from 'react';
import { useWSRequest } from '../../stores/wsStore.js';
import { createEngine, type PinballEngine } from './PinballEngine.js';
import { createScene, type PinballScene } from './PinballScene.js';
import { createAudio, type PinballAudio } from './PinballAudio.js';
import { BALLS_PER_GAME } from './PinballTable.js';

interface GameDisplayState {
  score: number;
  ballsRemaining: number;
  combo: number;
  benchmark: number;
  gameState: 'idle' | 'playing' | 'over';
}

interface PinballGameProps {
  onGameEnd?: (result: { score: number; eloChange: number; result: string }) => void;
  onScoreUpdate?: (state: GameDisplayState) => void;
}

const TABLE_RENDER_WIDTH = 600;
const TABLE_RENDER_HEIGHT = 1050;
const PHYSICS_DT = 1 / 60;

export function PinballGame({ onGameEnd, onScoreUpdate }: PinballGameProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { request } = useWSRequest();

  // Refs for engine/scene/audio (not React state - they live outside React lifecycle)
  const engineRef = useRef<PinballEngine | null>(null);
  const sceneRef = useRef<PinballScene | null>(null);
  const audioRef = useRef<PinballAudio | null>(null);
  const gameIdRef = useRef<string | null>(null);
  const startTimeRef = useRef<number>(0);
  const keysRef = useRef<Set<string>>(new Set());
  const benchmarkRef = useRef<number>(500000);
  const onScoreUpdateRef = useRef(onScoreUpdate);
  onScoreUpdateRef.current = onScoreUpdate;
  const onGameEndRef = useRef(onGameEnd);
  onGameEndRef.current = onGameEnd;

  // Track flipper state to avoid redundant audio
  const leftFlipperActiveRef = useRef(false);
  const rightFlipperActiveRef = useRef(false);

  // Drain respawn state
  const drainHandledRef = useRef(false);
  const respawnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [gameState, setGameState] = useState<'idle' | 'playing' | 'over'>('idle');
  const gameStateRef = useRef<'idle' | 'playing' | 'over'>('idle');

  const [message, setMessage] = useState('Press SPACE to start');

  // ── Push display state ──

  const pushDisplayState = useCallback((
    score: number,
    ballsRemaining: number,
    combo: number,
    state: 'idle' | 'playing' | 'over',
  ) => {
    onScoreUpdateRef.current?.({
      score,
      ballsRemaining: Math.max(0, ballsRemaining),
      combo,
      benchmark: benchmarkRef.current,
      gameState: state,
    });
  }, []);

  // ── End game ──

  const endGame = useCallback(async (score: number, maxCombo: number) => {
    if (!gameIdRef.current) return;

    const durationSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);

    try {
      const result = await request<any, any>('pinball:endGame', {
        game_id: gameIdRef.current,
        score,
        balls_used: BALLS_PER_GAME,
        max_combo: maxCombo,
        duration_seconds: durationSeconds,
      });

      if (result) {
        const eloChange = result.elo_change || 0;
        const msg =
          `GAME OVER! Score: ${score.toLocaleString()} ` +
          `(${score >= benchmarkRef.current ? 'BEAT' : 'MISSED'} benchmark) ` +
          `${eloChange >= 0 ? '+' : ''}${eloChange} ELO\n` +
          `Press SPACE to play again`;
        setMessage(msg);
        sceneRef.current?.showGameOverScreen(msg);
        onGameEndRef.current?.({ score, eloChange, result: result.result });
      }
    } catch (err) {
      const msg = 'Score: ' + score.toLocaleString() + '\nPress SPACE to play again';
      setMessage(msg);
      sceneRef.current?.showGameOverScreen(msg);
    }

    gameIdRef.current = null;
    setGameState('over');
    gameStateRef.current = 'over';
    pushDisplayState(score, 0, 0, 'over');

    audioRef.current?.play('drain');
  }, [request, pushDisplayState]);

  const endGameRef = useRef(endGame);
  endGameRef.current = endGame;

  // ── Start new game ──

  const startNewGame = useCallback(async () => {
    if (gameStateRef.current === 'playing') return;

    try {
      const game = await request<{}, any>('pinball:startGame', {});
      if (!game) return;

      gameIdRef.current = game.id;
      benchmarkRef.current = game.benchmark_score;
      startTimeRef.current = Date.now();

      // Reset or create engine
      if (engineRef.current) {
        engineRef.current.destroy();
      }
      const engine = createEngine();
      engineRef.current = engine;

      // Spawn first ball
      engine.spawnBall();
      const state = engine.getState();
      state.ballInPlay = true;
      state.ballsRemaining = BALLS_PER_GAME - 1;

      drainHandledRef.current = false;

      sceneRef.current?.clearTrail();
      sceneRef.current?.hideOverlay();

      setGameState('playing');
      gameStateRef.current = 'playing';
      setMessage('');
      pushDisplayState(0, BALLS_PER_GAME - 1, 0, 'playing');
    } catch (err) {
      setMessage('Failed to connect to server');
    }
  }, [request, pushDisplayState]);

  // ── Initialize scene + audio on mount ──

  useEffect(() => {
    let mounted = true;

    async function init() {
      if (!containerRef.current) return;

      // Create PixiJS scene
      const scene = await createScene(TABLE_RENDER_WIDTH, TABLE_RENDER_HEIGHT);
      if (!mounted) {
        scene.destroy();
        return;
      }
      sceneRef.current = scene;
      scene.mount(containerRef.current);

      // Style the canvas
      const canvas = scene.app.canvas as HTMLCanvasElement;
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.objectFit = 'contain';

      // Create audio
      const audio = createAudio();
      audioRef.current = audio;

      // Show idle screen
      scene.showIdleScreen();
      pushDisplayState(0, BALLS_PER_GAME, 0, 'idle');

      // ── Game loop via PixiJS ticker ──
      let accumulator = 0;

      scene.app.ticker.add((ticker) => {
        if (gameStateRef.current !== 'playing' || !engineRef.current) return;

        const engine = engineRef.current;
        const state = engine.getState();

        // Fixed timestep accumulation
        const dtSec = ticker.deltaMS / 1000;
        accumulator += Math.min(dtSec, 0.05); // Cap to prevent spiral of death

        while (accumulator >= PHYSICS_DT) {
          // Handle flippers
          const leftActive = keysRef.current.has('z') || keysRef.current.has('arrowleft');
          const rightActive = keysRef.current.has('/') || keysRef.current.has('arrowright');

          if (leftActive) {
            engine.activateFlipper(true);
            if (!leftFlipperActiveRef.current) {
              audio.play('flipperUp');
              leftFlipperActiveRef.current = true;
            }
          } else {
            engine.deactivateFlipper(true);
            if (leftFlipperActiveRef.current) {
              audio.play('flipperDown');
              leftFlipperActiveRef.current = false;
            }
          }

          if (rightActive) {
            engine.activateFlipper(false);
            if (!rightFlipperActiveRef.current) {
              audio.play('flipperUp');
              rightFlipperActiveRef.current = true;
            }
          } else {
            engine.deactivateFlipper(false);
            if (rightFlipperActiveRef.current) {
              audio.play('flipperDown');
              rightFlipperActiveRef.current = false;
            }
          }

          // Handle plunger charging
          if (keysRef.current.has(' ') && state.ballInPlay) {
            state.isPlungerCharging = true;
            state.plungerCharge = Math.min(state.plungerCharge + PHYSICS_DT * 1.0, 1);
          }

          engine.step(PHYSICS_DT);
          accumulator -= PHYSICS_DT;
        }

        // ── Audio for bumper/slingshot hits ──
        // Check flash times to detect new hits
        for (let i = 0; i < state.bumperFlashTimes.length; i++) {
          if (state.bumperFlashTimes[i] > 0 && Date.now() - state.bumperFlashTimes[i] < 50) {
            audio.play('bumperHit');
          }
        }
        for (let i = 0; i < state.slingshotFlashTimes.length; i++) {
          if (state.slingshotFlashTimes[i] > 0 && Date.now() - state.slingshotFlashTimes[i] < 50) {
            audio.play('slingshotHit');
          }
        }

        // ── Check drain ──
        if (!state.ballInPlay && !state.gameOver && !drainHandledRef.current) {
          drainHandledRef.current = true;

          if (state.ballsRemaining > 0) {
            respawnTimerRef.current = setTimeout(() => {
              if (!engineRef.current || gameStateRef.current !== 'playing') return;
              const e = engineRef.current;
              const s = e.getState();
              e.spawnBall();
              s.ballInPlay = true;
              s.ballsRemaining--;
              drainHandledRef.current = false;
              sceneRef.current?.clearTrail();
              e.resetDropTargets();
            }, 800);
          } else {
            state.gameOver = true;
            endGameRef.current(state.score, state.maxCombo);
          }
        }

        // ── Update scene ──
        const positions = engine.getPositions();
        scene.update(state, positions);

        // ── Push state to parent ──
        pushDisplayState(state.score, Math.max(0, state.ballsRemaining), state.combo, 'playing');
      });
    }

    init();

    return () => {
      mounted = false;
      if (respawnTimerRef.current) clearTimeout(respawnTimerRef.current);
      engineRef.current?.destroy();
      sceneRef.current?.destroy();
      audioRef.current?.destroy();
      engineRef.current = null;
      sceneRef.current = null;
      audioRef.current = null;
    };
  }, [pushDisplayState]);

  // ── Keyboard handlers ──

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keysRef.current.add(key);

      // Start game on space when idle/over
      if (key === ' ' && (gameStateRef.current === 'idle' || gameStateRef.current === 'over')) {
        e.preventDefault();
        startNewGame();
        return;
      }

      // Nudge
      if (key === 'n' && gameStateRef.current === 'playing' && engineRef.current) {
        engineRef.current.nudge();
      }

      // Prevent scrolling
      if (['arrowleft', 'arrowright', 'arrowup', 'arrowdown', ' '].includes(key)) {
        e.preventDefault();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keysRef.current.delete(key);

      // Launch ball on space release
      if (key === ' ' && gameStateRef.current === 'playing' && engineRef.current) {
        const state = engineRef.current.getState();
        if (state.isPlungerCharging) {
          engineRef.current.launchBall(state.plungerCharge);
          state.isPlungerCharging = false;
          state.plungerCharge = 0;
          audioRef.current?.play('plungerRelease');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [startNewGame]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full flex items-center justify-center"
      style={{ background: '#0a0a12', overflow: 'hidden' }}
      tabIndex={0}
    />
  );
}
