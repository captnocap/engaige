import { useState, useEffect } from 'react';
import { useWSRequest } from '../../stores/wsStore.js';

interface ChessMatch {
  id: string;
  white_player_id: string;
  white_player_type: 'player' | 'npc';
  black_player_id: string;
  black_player_type: 'player' | 'npc';
  status: 'active' | 'completed' | 'abandoned';
  result?: 'white_win' | 'black_win' | 'draw' | 'abandoned';
  termination_reason?: string;
  moves: string[];
  move_count: number;
  white_elo_before: number;
  black_elo_before: number;
  white_elo_after?: number;
  black_elo_after?: number;
  elo_change?: number;
  started_at: number;
  completed_at?: number;
}

export function MatchHistoryView() {
  const { request } = useWSRequest();
  const [history, setHistory] = useState<ChessMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'wins' | 'losses' | 'draws'>('all');

  useEffect(() => {
    fetchHistory();
  }, []);

  async function fetchHistory() {
    try {
      setLoading(true);
      const matches = await request<{ limit?: number }, ChessMatch[]>('chess:getMatchHistory', {
        limit: 50,
      });
      setHistory(matches || []);
    } catch (error) {
      console.error('Failed to fetch match history:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredHistory = history.filter(match => {
    if (filter === 'all') return true;

    const isPlayerWhite = match.white_player_type === 'player';
    const playerWon = (isPlayerWhite && match.result === 'white_win') ||
                      (!isPlayerWhite && match.result === 'black_win');
    const playerLost = (isPlayerWhite && match.result === 'black_win') ||
                       (!isPlayerWhite && match.result === 'white_win');

    if (filter === 'wins') return playerWon;
    if (filter === 'losses') return playerLost;
    if (filter === 'draws') return match.result === 'draw';

    return true;
  });

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-[var(--color-textMuted)]">Loading match history...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header with filters */}
      <div className="shrink-0 px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <h3 className="text-lg font-semibold text-[var(--color-text)]">Match History</h3>
        <div className="flex gap-2">
          <FilterButton active={filter === 'all'} onClick={() => setFilter('all')}>
            All
          </FilterButton>
          <FilterButton active={filter === 'wins'} onClick={() => setFilter('wins')}>
            Wins
          </FilterButton>
          <FilterButton active={filter === 'losses'} onClick={() => setFilter('losses')}>
            Losses
          </FilterButton>
          <FilterButton active={filter === 'draws'} onClick={() => setFilter('draws')}>
            Draws
          </FilterButton>
        </div>
      </div>

      {/* History Table */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {filteredHistory.length === 0 && (
          <div className="text-center py-12 text-[var(--color-textMuted)]">
            {filter === 'all'
              ? 'No completed games yet. Start playing to build your history!'
              : `No ${filter} yet.`}
          </div>
        )}

        <div className="space-y-2 mt-4">
          {filteredHistory.map(match => {
            const isPlayerWhite = match.white_player_type === 'player';
            const playerWon = (isPlayerWhite && match.result === 'white_win') ||
                            (!isPlayerWhite && match.result === 'black_win');
            const playerLost = (isPlayerWhite && match.result === 'black_win') ||
                             (!isPlayerWhite && match.result === 'white_win');
            const isDraw = match.result === 'draw';

            const playerEloChange = isPlayerWhite
              ? (match.white_elo_after || match.white_elo_before) - match.white_elo_before
              : (match.black_elo_after || match.black_elo_before) - match.black_elo_before;

            return (
              <div
                key={match.id}
                className="p-4 rounded-lg bg-[var(--color-bgSecondary)]"
                style={{ border: '1px solid var(--color-border)' }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    {/* Result Badge */}
                    <div className={`
                      px-3 py-1 rounded-full text-sm font-semibold
                      ${playerWon ? 'bg-green-500 text-white' : ''}
                      ${playerLost ? 'bg-red-500 text-white' : ''}
                      ${isDraw ? 'bg-gray-500 text-white' : ''}
                    `}>
                      {playerWon && '✓ Win'}
                      {playerLost && '✗ Loss'}
                      {isDraw && '= Draw'}
                    </div>

                    {/* Match Info */}
                    <div className="text-sm text-[var(--color-text)]">
                      {isPlayerWhite ? '⚪ You' : '⚫ You'} vs {isPlayerWhite ? '⚫ Opponent' : '⚪ Opponent'}
                    </div>

                    {/* ELO Change */}
                    {playerEloChange !== 0 && (
                      <div className={`text-sm font-medium ${playerEloChange > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {playerEloChange > 0 ? '+' : ''}{playerEloChange} ELO
                      </div>
                    )}
                  </div>

                  {/* Date */}
                  <div className="text-sm text-[var(--color-textMuted)]">
                    {match.completed_at
                      ? new Date(match.completed_at * 1000).toLocaleDateString()
                      : new Date(match.started_at * 1000).toLocaleDateString()
                    }
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-[var(--color-textMuted)]">
                  <div>
                    {match.move_count} moves • {match.termination_reason || 'Game ended'}
                  </div>
                  <div>
                    ELO: {match.white_elo_before} vs {match.black_elo_before}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        px-3 py-1 rounded text-sm font-medium transition-colors
        ${active
          ? 'bg-[var(--color-primary)] text-white'
          : 'bg-[var(--color-bgSecondary)] text-[var(--color-textMuted)] hover:bg-[var(--color-bgTertiary)]'
        }
      `}
    >
      {children}
    </button>
  );
}
