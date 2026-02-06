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

/**
 * PinballHistory - Cabinet-style game history
 * Dark DMD aesthetic with amber/orange text
 */
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
      <div className="h-full flex items-center justify-center" style={cabinetBg}>
        <div style={{ ...dmdText, color: '#604010' }}>LOADING...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden" style={cabinetBg}>
      {/* Stats DMD panel */}
      {profile && (
        <div className="shrink-0 px-4 py-3" style={{ borderBottom: '1px solid #1a1608' }}>
          <div className="grid grid-cols-5 gap-2">
            <StatBlock label="ELO" value={profile.elo_rating.toString()} sub={`PK ${profile.peak_elo}`} />
            <StatBlock label="BEST" value={formatScore(profile.high_score)} sub={`TGT ${formatScore(profile.benchmark)}`} />
            <StatBlock label="W-L" value={`${profile.wins}-${profile.losses}`} sub={`${profile.win_rate}%`} />
            <StatBlock label="GAMES" value={profile.total_games.toString()} sub={`${profile.wins}W`} />
            <StatBlock label="STREAK" value={profile.current_streak.toString()} sub={`BT ${profile.best_streak}`} />
          </div>
        </div>
      )}

      {/* Filter toggles */}
      <div className="shrink-0 px-4 py-2 flex items-center gap-2" style={{ borderBottom: '1px solid #1a1608' }}>
        <FilterToggle active={filter === 'all'} onClick={() => setFilter('all')}>ALL</FilterToggle>
        <FilterToggle active={filter === 'wins'} onClick={() => setFilter('wins')}>WINS</FilterToggle>
        <FilterToggle active={filter === 'losses'} onClick={() => setFilter('losses')}>LOSSES</FilterToggle>
      </div>

      {/* Game list */}
      <div className="flex-1 overflow-y-auto">
        {filteredHistory.length === 0 && (
          <div className="text-center py-12" style={{ ...dmdText, color: '#403010' }}>
            {filter === 'all' ? 'NO GAMES YET' : `NO ${filter.toUpperCase()} YET`}
          </div>
        )}

        {filteredHistory.map(game => {
          const isWin = game.result === 'win';
          const isLoss = game.result === 'loss';

          return (
            <div
              key={game.id}
              className="px-4 py-2"
              style={{ borderBottom: '1px solid rgba(26,22,8,0.5)' }}
            >
              {/* Top line: result + score + ELO change */}
              <div className="flex items-center justify-between" style={{ ...dmdText, fontSize: 12 }}>
                <div className="flex items-center gap-3">
                  <span
                    className="font-bold"
                    style={{
                      color: isWin ? '#40d040' : isLoss ? '#d04040' : '#808080',
                      textShadow: isWin
                        ? '0 0 4px rgba(64,208,64,0.4)'
                        : isLoss
                          ? '0 0 4px rgba(208,64,64,0.4)'
                          : 'none',
                      width: 32,
                      display: 'inline-block',
                    }}
                  >
                    {isWin ? 'WIN' : isLoss ? 'LOSS' : 'DNF'}
                  </span>
                  <span style={{ color: '#f0a030' }}>
                    {game.score.toLocaleString()}
                  </span>
                  {game.elo_change !== 0 && (
                    <span style={{ color: game.elo_change > 0 ? '#40d040' : '#d04040', fontSize: 11 }}>
                      {game.elo_change > 0 ? '+' : ''}{game.elo_change}
                    </span>
                  )}
                </div>
                <span style={{ color: '#403010', fontSize: 10 }}>
                  {game.completed_at
                    ? new Date(game.completed_at * 1000).toLocaleDateString()
                    : new Date(game.started_at * 1000).toLocaleDateString()
                  }
                </span>
              </div>

              {/* Bottom line: details */}
              <div className="flex items-center gap-4 mt-0.5" style={{ ...dmdText, color: '#504020', fontSize: 10 }}>
                <span>BM:{game.benchmark_score.toLocaleString()}</span>
                <span>CMB:{game.max_combo}x</span>
                <span>{Math.floor(game.duration_seconds / 60)}:{(game.duration_seconds % 60).toString().padStart(2, '0')}</span>
                <span>{game.elo_before}\u2192{game.elo_after}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatBlock({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="text-center">
      <div style={{ ...dmdText, color: '#504020', fontSize: 9 }}>{label}</div>
      <div style={{ ...dmdText, color: '#f0a030', fontSize: 14, fontWeight: 'bold', textShadow: '0 0 4px rgba(240,160,48,0.3)' }}>
        {value}
      </div>
      <div style={{ ...dmdText, color: '#403010', fontSize: 9 }}>{sub}</div>
    </div>
  );
}

function FilterToggle({
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
      style={{
        ...dmdText,
        fontSize: 10,
        padding: '2px 8px',
        borderRadius: 3,
        background: active ? 'rgba(240,160,48,0.12)' : 'transparent',
        border: active ? '1px solid #f0a03040' : '1px solid #222',
        color: active ? '#f0a030' : '#504020',
        cursor: 'pointer',
        letterSpacing: 1,
      }}
    >
      {children}
    </button>
  );
}

function formatScore(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(0) + 'K';
  return n.toString();
}

const cabinetBg: React.CSSProperties = {
  background: '#080604',
  backgroundImage: 'radial-gradient(circle, rgba(255,170,40,0.02) 1px, transparent 1px)',
  backgroundSize: '4px 4px',
};

const dmdText: React.CSSProperties = {
  fontFamily: 'monospace',
  letterSpacing: 1,
};
