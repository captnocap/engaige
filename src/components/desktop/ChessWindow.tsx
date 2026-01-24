import { useState, useEffect } from 'react';
import { useWSRequest } from '../../stores/wsStore.js';
import { LeaderboardView } from '../chess/LeaderboardView.js';
import { PlayView } from '../chess/PlayView.js';
import { MatchHistoryView } from '../chess/MatchHistoryView.js';

/**
 * ChessWindow Component
 *
 * Main chess interface with three tabs:
 * - Leaderboard: ELO rankings and recent matches
 * - Play: Challenge NPCs and view active games
 * - My Games: Match history and statistics
 */

type Tab = 'leaderboard' | 'play' | 'history';

export function ChessWindow() {
  const [activeTab, setActiveTab] = useState<Tab>('leaderboard');
  const { connected } = useWSRequest();

  if (!connected) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-[var(--color-textMuted)] mb-2">Connecting to server...</div>
          <div className="text-sm text-[var(--color-textMuted)]">Please wait</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[var(--color-bg)]">
      {/* Header */}
      <div
        className="shrink-0 px-6 py-4"
        style={{ borderBottom: '1px solid var(--color-border)' }}
      >
        <h1 className="text-2xl font-bold text-[var(--color-text)] mb-1">Chess.cob</h1>
        <p className="text-sm text-[var(--color-textMuted)]">
          Compete against NPCs in the ultimate strategy game
        </p>
      </div>

      {/* Tabs */}
      <div
        className="shrink-0 flex gap-1 px-6 py-2"
        style={{ borderBottom: '1px solid var(--color-border)' }}
      >
        <TabButton
          active={activeTab === 'leaderboard'}
          onClick={() => setActiveTab('leaderboard')}
        >
          ♔ Leaderboard
        </TabButton>
        <TabButton
          active={activeTab === 'play'}
          onClick={() => setActiveTab('play')}
        >
          ♟️ Play
        </TabButton>
        <TabButton
          active={activeTab === 'history'}
          onClick={() => setActiveTab('history')}
        >
          📊 My Games
        </TabButton>
      </div>

      {/* Content Area */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {activeTab === 'leaderboard' && <LeaderboardView />}
        {activeTab === 'play' && <PlayView />}
        {activeTab === 'history' && <MatchHistoryView />}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        px-4 py-2 rounded-lg text-sm font-medium transition-all
        ${active
          ? 'bg-[var(--color-primary)] text-white shadow-lg'
          : 'bg-[var(--color-bgSecondary)] text-[var(--color-textMuted)] hover:bg-[var(--color-bgTertiary)] hover:text-[var(--color-text)]'
        }
      `}
    >
      {children}
    </button>
  );
}
