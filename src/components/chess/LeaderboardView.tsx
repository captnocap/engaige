import { useState, useEffect } from 'react';
import { useWSRequest } from '../../stores/wsStore.js';

interface LeaderboardEntry {
  rank: number;
  player_id: string;
  player_type: 'player' | 'npc';
  display_name: string;
  elo: number;
  wins: number;
  losses: number;
  draws: number;
  win_rate: number;
  streak: number;
  is_player?: boolean;
}

export function LeaderboardView() {
  const { request } = useWSRequest();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();

    // Refresh every 30 seconds
    const interval = setInterval(fetchLeaderboard, 30000);
    return () => clearInterval(interval);
  }, []);

  async function fetchLeaderboard() {
    try {
      setLoading(true);
      const data = await request<{ limit?: number }, LeaderboardEntry[]>('chess:getLeaderboard', {
        limit: 50,
      });
      setLeaderboard(data || []);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading && leaderboard.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-[var(--color-textMuted)]">Loading leaderboard...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="shrink-0 px-6 py-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[var(--color-text)]">Global Rankings</h2>
        <button
          onClick={fetchLeaderboard}
          className="px-3 py-1 text-sm rounded bg-[var(--color-bgSecondary)] hover:bg-[var(--color-bgTertiary)] text-[var(--color-textMuted)] transition-colors"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Leaderboard Table */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <table className="w-full">
          <thead className="sticky top-0 bg-[var(--color-bg)] z-10">
            <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
              <th className="text-left py-3 pr-4 text-sm font-semibold text-[var(--color-textMuted)]">Rank</th>
              <th className="text-left py-3 pr-4 text-sm font-semibold text-[var(--color-textMuted)]">Player</th>
              <th className="text-right py-3 pr-4 text-sm font-semibold text-[var(--color-textMuted)]">ELO</th>
              <th className="text-right py-3 pr-4 text-sm font-semibold text-[var(--color-textMuted)]">W-L-D</th>
              <th className="text-right py-3 pr-4 text-sm font-semibold text-[var(--color-textMuted)]">Win %</th>
              <th className="text-right py-3 text-sm font-semibold text-[var(--color-textMuted)]">Streak</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((entry) => (
              <tr
                key={`${entry.player_type}-${entry.player_id}`}
                className={`
                  ${entry.is_player ? 'bg-[var(--color-primary)]/10' : ''}
                  hover:bg-[var(--color-bgSecondary)] transition-colors
                `}
                style={{ borderBottom: '1px solid var(--color-border)' }}
              >
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2">
                    <span
                      className={`
                        text-sm font-bold
                        ${entry.rank === 1 ? 'text-yellow-400' : ''}
                        ${entry.rank === 2 ? 'text-gray-400' : ''}
                        ${entry.rank === 3 ? 'text-orange-600' : ''}
                        ${entry.rank > 3 ? 'text-[var(--color-textMuted)]' : ''}
                      `}
                    >
                      #{entry.rank}
                    </span>
                    {entry.rank === 1 && <span>🏆</span>}
                    {entry.rank === 2 && <span>🥈</span>}
                    {entry.rank === 3 && <span>🥉</span>}
                  </div>
                </td>
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${entry.is_player ? 'text-[var(--color-primary)]' : 'text-[var(--color-text)]'}`}>
                      {entry.display_name}
                    </span>
                    {entry.is_player && (
                      <span className="px-2 py-0.5 text-xs rounded bg-[var(--color-primary)] text-white">
                        You
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-3 pr-4 text-right">
                  <span className="text-sm font-semibold text-[var(--color-text)]">
                    {entry.elo}
                  </span>
                </td>
                <td className="py-3 pr-4 text-right">
                  <span className="text-sm text-[var(--color-textMuted)]">
                    {entry.wins}-{entry.losses}-{entry.draws}
                  </span>
                </td>
                <td className="py-3 pr-4 text-right">
                  <span className="text-sm text-[var(--color-textMuted)]">
                    {entry.win_rate}%
                  </span>
                </td>
                <td className="py-3 text-right">
                  {entry.streak > 0 && (
                    <span className="text-sm font-medium text-green-500">
                      🔥 {entry.streak}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {leaderboard.length === 0 && !loading && (
          <div className="text-center py-12 text-[var(--color-textMuted)]">
            No rankings yet. Start playing to appear on the leaderboard!
          </div>
        )}
      </div>
    </div>
  );
}
