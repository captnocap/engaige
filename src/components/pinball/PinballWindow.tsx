import { useState, useCallback } from 'react';
import { useWSRequest } from '../../stores/wsStore.js';
import { PinballGame } from './PinballGame.js';
import { PinballLeaderboard } from './PinballLeaderboard.js';
import { PinballHistory } from './PinballHistory.js';

/**
 * PinballWindow - Pinball cabinet UI
 *
 * The entire window IS the cabinet:
 * - Backglass (top): DMD score display, title, nav icons
 * - Main area: Playfield canvas with side panels
 * - Leaderboard/History overlay the playfield when selected
 */

type View = 'game' | 'leaderboard' | 'history';

interface GameDisplayState {
  score: number;
  ballsRemaining: number;
  combo: number;
  benchmark: number;
  gameState: 'idle' | 'playing' | 'over';
}

export function PinballWindow() {
  const [activeView, setActiveView] = useState<View>('game');
  const { connected } = useWSRequest();
  const [display, setDisplay] = useState<GameDisplayState>({
    score: 0,
    ballsRemaining: 3,
    combo: 0,
    benchmark: 500000,
    gameState: 'idle',
  });

  const handleScoreUpdate = useCallback((state: GameDisplayState) => {
    setDisplay(state);
  }, []);

  if (!connected) {
    return (
      <div className="h-full flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="text-lg mb-2" style={{ color: '#f0a030', fontFamily: 'monospace' }}>
            CONNECTING...
          </div>
          <div className="text-sm" style={{ color: '#805020', fontFamily: 'monospace' }}>
            Please wait
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col" style={{ background: '#0a0a12' }}>
      {/* === BACKGLASS === */}
      <Backglass display={display} activeView={activeView} onViewChange={setActiveView} />

      {/* === MAIN AREA === */}
      <div className="flex-1 min-h-0 relative">
        {/* Game is always mounted (keeps physics alive) */}
        <div className={`absolute inset-0 ${activeView === 'game' ? '' : 'invisible'}`}>
          <PinballGame onScoreUpdate={handleScoreUpdate} />
        </div>

        {/* Leaderboard/History overlay */}
        {activeView === 'leaderboard' && (
          <div className="absolute inset-0 z-10">
            <PinballLeaderboard />
          </div>
        )}
        {activeView === 'history' && (
          <div className="absolute inset-0 z-10">
            <PinballHistory />
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Backglass Bar ─── */

function Backglass({
  display,
  activeView,
  onViewChange,
}: {
  display: GameDisplayState;
  activeView: View;
  onViewChange: (v: View) => void;
}) {
  return (
    <div
      className="shrink-0 flex items-center gap-3 px-3"
      style={{
        height: 72,
        background: 'linear-gradient(180deg, #1a1a2e 0%, #0f0f1e 50%, #1a1a2e 100%)',
        borderBottom: '2px solid #2a2a3a',
        boxShadow: 'inset 0 -1px 0 rgba(255,255,255,0.03), 0 2px 8px rgba(0,0,0,0.6)',
      }}
    >
      {/* Title */}
      <div className="shrink-0 flex flex-col justify-center" style={{ minWidth: 100 }}>
        <div
          className="text-sm font-bold tracking-widest leading-tight"
          style={{
            color: '#f0a030',
            fontFamily: 'monospace',
            textShadow: '0 0 6px rgba(240,160,48,0.5)',
          }}
        >
          COB CADET
        </div>
        <div
          className="text-[10px] tracking-wider"
          style={{
            color: '#805020',
            fontFamily: 'monospace',
          }}
        >
          PINBALL
        </div>
      </div>

      {/* DMD Display */}
      <DMDDisplay display={display} />

      {/* Nav Buttons */}
      <div className="shrink-0 flex gap-1.5">
        <CabinetButton
          active={activeView === 'game'}
          onClick={() => onViewChange('game')}
          title="Play"
        >
          {/* Pinball icon */}
          <svg viewBox="0 0 16 16" className="w-4 h-4" fill="currentColor">
            <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="8" cy="8" r="2" />
          </svg>
        </CabinetButton>
        <CabinetButton
          active={activeView === 'leaderboard'}
          onClick={() => onViewChange('leaderboard')}
          title="Leaderboard"
        >
          {/* Trophy icon */}
          <svg viewBox="0 0 16 16" className="w-4 h-4" fill="currentColor">
            <path d="M4 2h8v5a4 4 0 01-8 0V2zM2 3h2V5H2a1 1 0 010-2zM12 3h2a1 1 0 010 2h-2V3zM7 11h2v2H7zM5 13h6v1H5z" />
          </svg>
        </CabinetButton>
        <CabinetButton
          active={activeView === 'history'}
          onClick={() => onViewChange('history')}
          title="My Games"
        >
          {/* Clock icon */}
          <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="8" cy="8" r="6" />
            <path d="M8 4v4l3 2" />
          </svg>
        </CabinetButton>
      </div>
    </div>
  );
}

/* ─── DMD (Dot Matrix Display) ─── */

function DMDDisplay({ display }: { display: GameDisplayState }) {
  const { score, ballsRemaining, combo, benchmark, gameState } = display;
  const isPlaying = gameState === 'playing';

  return (
    <div
      className="flex-1 min-w-0 flex items-center justify-between px-4 py-2"
      style={{
        height: 52,
        background: '#0a0800',
        border: '2px solid #222',
        borderRadius: 4,
        boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.8), 0 1px 0 rgba(255,255,255,0.04)',
        backgroundImage: 'radial-gradient(circle, rgba(255,170,40,0.03) 1px, transparent 1px)',
        backgroundSize: '4px 4px',
        fontFamily: 'monospace',
      }}
    >
      {/* Score */}
      <div className="flex flex-col justify-center min-w-0">
        <div
          className="text-lg font-bold leading-none truncate"
          style={{
            color: isPlaying ? '#f0a030' : '#604010',
            textShadow: isPlaying
              ? '0 0 4px rgba(240,160,48,0.6), 0 0 8px rgba(240,160,48,0.3)'
              : 'none',
          }}
        >
          {isPlaying ? score.toLocaleString() : gameState === 'over' ? score.toLocaleString() : '0'}
        </div>
        {isPlaying && (
          <div className="text-[10px] leading-none mt-0.5" style={{ color: '#604010' }}>
            TARGET: {benchmark.toLocaleString()}
          </div>
        )}
        {gameState === 'idle' && (
          <div className="text-[10px] leading-none mt-0.5" style={{ color: '#604010' }}>
            PRESS SPACE TO START
          </div>
        )}
        {gameState === 'over' && (
          <div className="text-[10px] leading-none mt-0.5" style={{ color: '#604010' }}>
            GAME OVER
          </div>
        )}
      </div>

      {/* Right side: balls + combo */}
      <div className="shrink-0 flex items-center gap-3">
        {/* Combo */}
        {combo > 1 && (
          <div
            className="text-sm font-bold"
            style={{
              color: '#f0c040',
              textShadow: '0 0 6px rgba(240,192,64,0.6)',
            }}
          >
            {combo}x
          </div>
        )}

        {/* Balls remaining */}
        <div className="flex gap-1">
          {Array.from({ length: Math.max(0, ballsRemaining) }).map((_, i) => (
            <div
              key={i}
              className="w-2.5 h-2.5 rounded-full"
              style={{
                background: '#f0a030',
                boxShadow: '0 0 4px rgba(240,160,48,0.5)',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Cabinet Nav Button ─── */

function CabinetButton({
  active,
  onClick,
  children,
  title,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="flex items-center justify-center transition-all"
      style={{
        width: 32,
        height: 32,
        borderRadius: 4,
        background: active
          ? 'linear-gradient(180deg, #2a2010 0%, #1a1408 100%)'
          : 'linear-gradient(180deg, #1a1a24 0%, #12121a 100%)',
        border: active ? '1px solid #f0a030' : '1px solid #333',
        color: active ? '#f0a030' : '#555',
        boxShadow: active
          ? '0 0 8px rgba(240,160,48,0.3), inset 0 1px 0 rgba(255,255,255,0.05)'
          : 'inset 0 1px 0 rgba(255,255,255,0.03)',
      }}
    >
      {children}
    </button>
  );
}
