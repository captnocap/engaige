/**
 * PinballGame - React wrapper: game loop, keyboard input, server integration
 */

import { useRef, useEffect, useState, useCallback } from 'react';
import { useWSRequest } from '../../stores/wsStore.js';
import * as Physics from './PinballPhysics.js';
import * as Renderer from './PinballRenderer.js';
import { TABLE_WIDTH, TABLE_HEIGHT, BALLS_PER_GAME } from './PinballTable.js';

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

export function PinballGame({ onGameEnd, onScoreUpdate }: PinballGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { request } = useWSRequest();
  const engineRef = useRef<ReturnType<typeof Physics.createPhysicsEngine> | null>(null);
  const gameIdRef = useRef<string | null>(null);
  const animFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const keysRef = useRef<Set<string>>(new Set());
  const benchmarkRef = useRef<number>(500000);
  const onScoreUpdateRef = useRef(onScoreUpdate);
  onScoreUpdateRef.current = onScoreUpdate;

  const [gameState, setGameState] = useState<'idle' | 'playing' | 'over'>('idle');
  const [displayScore, setDisplayScore] = useState(0);
  const [message, setMessage] = useState('Press SPACE to start');

  // Push display state to parent
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

  // Push idle state on mount
  useEffect(() => {
    pushDisplayState(0, BALLS_PER_GAME, 0, 'idle');
  }, [pushDisplayState]);

  const startNewGame = useCallback(async () => {
    if (gameState === 'playing') return;

    try {
      const game = await request<{}, any>('pinball:startGame', {});
      if (!game) return;

      gameIdRef.current = game.id;
      benchmarkRef.current = game.benchmark_score;
      startTimeRef.current = Date.now();

      // Create or reset physics
      if (engineRef.current) {
        Physics.destroyEngine(engineRef.current.objects.engine);
      }
      const { objects, state } = Physics.createPhysicsEngine();
      engineRef.current = { objects, state };

      // Spawn first ball
      const ball = Physics.spawnBall(objects, objects.engine);
      state.ballInPlay = true;
      state.ballsRemaining = BALLS_PER_GAME - 1;

      Renderer.clearTrail();
      setGameState('playing');
      setDisplayScore(0);
      setMessage('');
      pushDisplayState(0, BALLS_PER_GAME - 1, 0, 'playing');
    } catch (err) {
      console.error('Failed to start pinball game:', err);
      setMessage('Failed to connect to server');
    }
  }, [gameState, request, pushDisplayState]);

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
        setMessage(
          `GAME OVER! Score: ${score.toLocaleString()} ` +
          `(${score >= benchmarkRef.current ? 'BEAT' : 'MISSED'} benchmark) ` +
          `${eloChange >= 0 ? '+' : ''}${eloChange} ELO\n` +
          `Press SPACE to play again`
        );
        onGameEnd?.({ score, eloChange, result: result.result });
      }
    } catch (err) {
      console.error('Failed to end pinball game:', err);
      setMessage('Score: ' + score.toLocaleString() + '\nPress SPACE to play again');
    }

    gameIdRef.current = null;
    setGameState('over');
    pushDisplayState(score, 0, 0, 'over');
  }, [request, onGameEnd, pushDisplayState]);

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing' || !engineRef.current) return;

    const loop = (timestamp: number) => {
      if (!engineRef.current) return;

      const { objects, state } = engineRef.current;
      const delta = lastTimeRef.current ? Math.min(timestamp - lastTimeRef.current, 33) : 16.67;
      lastTimeRef.current = timestamp;

      // Handle plunger charging
      if (keysRef.current.has(' ') && state.ballInPlay && objects.ball) {
        state.isPlungerCharging = true;
        state.plungerCharge = Math.min(state.plungerCharge + delta * 0.001, 1);
      }

      // Handle flippers
      if (keysRef.current.has('z') || keysRef.current.has('arrowleft')) {
        Physics.activateFlipper(objects.leftFlipper, true);
      } else {
        Physics.deactivateFlipper(objects.leftFlipper, true);
      }

      if (keysRef.current.has('/') || keysRef.current.has('arrowright')) {
        Physics.activateFlipper(objects.rightFlipper, false);
      } else {
        Physics.deactivateFlipper(objects.rightFlipper, false);
      }

      // Step physics
      Physics.stepEngine(objects.engine, delta);

      // Check if ball drained
      if (!state.ballInPlay && !state.gameOver) {
        if (state.ballsRemaining > 0) {
          // Respawn ball after brief delay
          setTimeout(() => {
            if (!engineRef.current) return;
            const { objects: o, state: s } = engineRef.current;
            const newBall = Physics.spawnBall(o, o.engine);
            s.ballInPlay = true;
            s.ballsRemaining--;
            Renderer.clearTrail();
            Physics.resetDropTargets(s, o);
          }, 800);
          state.ballInPlay = true; // Prevent multiple respawns
          state.ballsRemaining = -99; // Temp flag
        } else if (state.ballsRemaining !== -99) {
          state.gameOver = true;
          endGame(state.score, state.maxCombo);
        }
      }

      // Fix respawn flag
      if (state.ballsRemaining === -99 && objects.ball && state.ballInPlay) {
        // Will be set properly in the setTimeout callback
      }

      // Update display score
      setDisplayScore(state.score);
      pushDisplayState(state.score, Math.max(0, state.ballsRemaining), state.combo, 'playing');

      // Render
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          Renderer.render(
            ctx,
            canvas.width,
            canvas.height,
            state,
            objects.ball,
            objects.leftFlipper,
            objects.rightFlipper,
            objects.bumperBodies,
            objects.dropTargetBodies,
            benchmarkRef.current,
          );
        }
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [gameState, endGame, pushDisplayState]);

  // Render idle/over state
  useEffect(() => {
    if (gameState === 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw static table with message
    if (engineRef.current) {
      const { objects, state } = engineRef.current;
      Renderer.render(
        ctx, canvas.width, canvas.height, state,
        objects.ball, objects.leftFlipper, objects.rightFlipper,
        objects.bumperBodies, objects.dropTargetBodies, benchmarkRef.current,
      );
    } else {
      // Initial empty state
      const scaleX = canvas.width / TABLE_WIDTH;
      const scaleY = canvas.height / TABLE_HEIGHT;
      ctx.save();
      ctx.scale(scaleX, scaleY);

      const grad = ctx.createLinearGradient(0, 0, 0, TABLE_HEIGHT);
      grad.addColorStop(0, '#0a0a1a');
      grad.addColorStop(1, '#050510');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, TABLE_WIDTH, TABLE_HEIGHT);
      ctx.restore();
    }

    // Overlay message
    const scale = canvas.width / TABLE_WIDTH;
    ctx.save();
    ctx.scale(scale, scale);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(50, TABLE_HEIGHT / 2 - 60, TABLE_WIDTH - 100, 130);

    ctx.fillStyle = '#00ff88';
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#00ff88';
    ctx.shadowBlur = 10;

    if (gameState === 'idle') {
      ctx.fillText('COB CADET', TABLE_WIDTH / 2, TABLE_HEIGHT / 2 - 20);
      ctx.fillText('PINBALL', TABLE_WIDTH / 2, TABLE_HEIGHT / 2 + 10);
      ctx.fillStyle = '#888';
      ctx.font = '11px monospace';
      ctx.shadowBlur = 0;
      ctx.fillText('Press SPACE to start', TABLE_WIDTH / 2, TABLE_HEIGHT / 2 + 40);
      ctx.fillStyle = '#555';
      ctx.font = '8px monospace';
      ctx.fillText('Z/\u2190 Left  \u2022  //\u2192 Right  \u2022  N Nudge', TABLE_WIDTH / 2, TABLE_HEIGHT / 2 + 58);
    } else {
      const lines = message.split('\n');
      lines.forEach((line, i) => {
        ctx.fillStyle = i === 0 ? '#ffaa00' : '#888';
        ctx.font = i === 0 ? 'bold 12px monospace' : '10px monospace';
        ctx.shadowBlur = i === 0 ? 6 : 0;
        ctx.fillText(line, TABLE_WIDTH / 2, TABLE_HEIGHT / 2 - 15 + i * 22);
      });
    }

    ctx.restore();
  }, [gameState, message]);

  // Keyboard handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keysRef.current.add(key);

      // Start game on space when idle/over
      if (key === ' ' && (gameState === 'idle' || gameState === 'over')) {
        e.preventDefault();
        startNewGame();
        return;
      }

      // Nudge
      if (key === 'n' && gameState === 'playing' && engineRef.current) {
        Physics.nudgeTable(engineRef.current.objects.ball);
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
      if (key === ' ' && gameState === 'playing' && engineRef.current) {
        const { objects, state } = engineRef.current;
        if (state.isPlungerCharging && objects.ball) {
          Physics.launchBall(objects.ball, state.plungerCharge);
          state.isPlungerCharging = false;
          state.plungerCharge = 0;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, startNewGame]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (engineRef.current) {
        Physics.destroyEngine(engineRef.current.objects.engine);
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="h-full w-full flex items-center justify-center"
      style={{ background: '#0a0a12', overflow: 'hidden' }}
    >
      <canvas
        ref={canvasRef}
        width={TABLE_WIDTH * 1.5}
        height={TABLE_HEIGHT * 1.5}
        style={{
          imageRendering: 'auto',
          width: '100%',
          height: '100%',
          objectFit: 'contain',
        }}
        tabIndex={0}
      />
    </div>
  );
}
