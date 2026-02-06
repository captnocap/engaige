import { useState, useEffect } from 'react';
import { useWSRequest } from '../../stores/wsStore.js';

interface PinballGame {
  id: string;
  status: 'completed' | 'abandoned';
  result?: 'win' | 'loss' | 'abandoned';
  score: number;
  benchmark_score: number;
  balls_used: number;
  max_combo: number;
  duration_seconds: number;
  elo_before?: number;
  elo_after?: number;
  elo_change: number;
  started_at: number;
  completed_at?: number;
}

interface PlayerProfile {
  elo_rating: number;
  peak_elo: number;
  total_games: number;
  wins: number;
  losses: number;
  high_score: number;
  win_rate: number;
  current_streak: number;
  best_streak: number;
  benchmark: number;
}

export function PinballHistory() {
  const { request } = useWSRequest();
  const [history, setHistory] = useState<PinballGame[]>([]);
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'wins' | 'losses'>('all');

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const [games, prof] = await Promise.all([
        request<{ limit?: number }, PinballGame[]>('pinball:getGameHistory', { limit: 50 }),
        request<{}, PlayerProfile>('pinball:getProfile', {}),
      ]);
      setHistory(games || []);
      setProfile(prof || null);
    } catch (error) {
      console.error('Failed to fetch pinball history:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredHistory = history.filter(game => {
    if (filter === 'all') return true;
    if (filter === 'wins') return game.result === 'win';
    if (filter === 'losses') return game.result === 'loss';
    return true;
  });

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-[var(--color-textMuted)]">Loading history...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Stats summary */}
      {profile && (
        <div
          className="shrink-0 px-6 py-4"
          style={{ borderBottom: '1px solid var(--color-border)' }}
        >
          <div className="grid grid-cols-5 gap-4">
            <StatCard label="ELO" value={profile.elo_rating.toString()} sub={`Peak: ${profile.peak_elo}`} />
            <StatCard label="High Score" value={profile.high_score.toLocaleString()} sub={`Target: ${profile.benchmark.toLocaleString()}`} />
            <StatCard label="Record" value={`${profile.wins}-${profile.losses}`} sub={`${profile.win_rate}% win rate`} />
            <StatCard label="Games" value={profile.total_games.toString()} sub={`${profile.wins} wins`} />
            <StatCard label="Streak" value={profile.current_streak.toString()} sub={`Best: ${profile.best_streak}`} />
          </div>
        </div>
      )}

      {/* Filter bar */}
      <div className="shrink-0 px-6 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <h3 className="text-lg font-semibold text-[var(--color-text)]">Game History</h3>
        <div className="flex gap-2">
          <FilterButton active={filter === 'all'} onClick={() => setFilter('all')}>All</FilterButton>
          <FilterButton active={filter === 'wins'} onClick={() => setFilter('wins')}>Wins</FilterButton>
          <FilterButton active={filter === 'losses'} onClick={() => setFilter('losses')}>Losses</FilterButton>
        </div>
      </div>

      {/* History list */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {filteredHistory.length === 0 && (
          <div className="text-center py-12 text-[var(--color-textMuted)]">
            {filter === 'all'
              ? 'No completed games yet. Start playing!'
              : `No ${filter} yet.`}
          </div>
        )}

        <div className="space-y-2 mt-4">
          {filteredHistory.map(game => (
            <div
              key={game.id}
              className="p-4 rounded-lg bg-[var(--color-bgSecondary)]"
              style={{ border: '1px solid var(--color-border)' }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className={`
                    px-3 py-1 rounded-full text-sm font-semibold
                    ${game.result === 'win' ? 'bg-green-500 text-white' : ''}
                    ${game.result === 'loss' ? 'bg-red-500 text-white' : ''}
                    ${game.result === 'abandoned' ? 'bg-gray-500 text-white' : ''}
                  `}>
                    {game.result === 'win' && 'WIN'}
                    {game.result === 'loss' && 'LOSS'}
                    {game.result === 'abandoned' && 'DNF'}
                  </div>

                  <div className="text-sm font-mono text-[var(--color-text)]">
                    {game.score.toLocaleString()} pts
                  </div>

                  {game.elo_change !== 0 && (
                    <div className={`text-sm font-medium ${game.elo_change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {game.elo_change > 0 ? '+' : ''}{game.elo_change} ELO
                    </div>
                  )}
                </div>

                <div className="text-sm text-[var(--color-textMuted)]">
                  {game.completed_at
                    ? new Date(game.completed_at * 1000).toLocaleDateString()
                    : new Date(game.started_at * 1000).toLocaleDateString()
                  }
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-[var(--color-textMuted)]">
                <div className="flex gap-4">
                  <span>Benchmark: {game.benchmark_score.toLocaleString()}</span>
                  <span>Combo: {game.max_combo}x</span>
                  <span>{Math.floor(game.duration_seconds / 60)}:{(game.duration_seconds % 60).toString().padStart(2, '0')}</span>
                </div>
                <div>
                  ELO: {game.elo_before} → {game.elo_after}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="text-center">
      <div className="text-xs text-[var(--color-textMuted)] mb-1">{label}</div>
      <div className="text-lg font-bold text-[var(--color-text)]">{value}</div>
      <div className="text-xs text-[var(--color-textMuted)]">{sub}</div>
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
