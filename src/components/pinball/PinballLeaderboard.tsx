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
  high_score: number;
  win_rate: number;
  streak: number;
  is_player?: boolean;
}

/**
 * PinballLeaderboard - Arcade high score screen
 * DMD-style amber-on-black monospace display
 */
export function PinballLeaderboard() {
  const { request } = useWSRequest();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 30000);
    return () => clearInterval(interval);
  }, []);

  async function fetchLeaderboard() {
    try {
      setLoading(true);
      const data = await request<{ limit?: number }, LeaderboardEntry[]>('pinball:getLeaderboard', {
        limit: 50,
      });
      setLeaderboard(data || []);
    } catch (error) {
      console.error('Failed to fetch pinball leaderboard:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading && leaderboard.length === 0) {
    return (
      <div className="h-full flex items-center justify-center" style={cabinetBg}>
        <div style={{ ...dmdText, color: '#604010' }}>LOADING...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden" style={cabinetBg}>
      {/* Title bar */}
      <div className="shrink-0 px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid #1a1a1a' }}>
        <div style={{ ...dmdText, color: '#f0a030', fontSize: 14, letterSpacing: 2 }}>
          HIGH SCORES
        </div>
        <div style={{ ...dmdText, color: '#403010', fontSize: 10 }}>
          {leaderboard.length} PLAYERS
        </div>
      </div>

      {/* Column headers */}
      <div
        className="shrink-0 grid px-4 py-2"
        style={{
          gridTemplateColumns: '40px 1fr 90px 110px 60px',
          borderBottom: '1px solid #1a1608',
          ...dmdText,
          color: '#604010',
          fontSize: 10,
        }}
      >
        <span>#</span>
        <span>PLAYER</span>
        <span className="text-right">ELO</span>
        <span className="text-right">SCORE</span>
        <span className="text-right">W-L</span>
      </div>

      {/* Scores list */}
      <div className="flex-1 overflow-y-auto">
        {leaderboard.map((entry) => {
          const isPlayer = entry.is_player;
          const rankColor = entry.rank === 1
            ? '#ffd040' // gold
            : entry.rank === 2
              ? '#c0b0a0' // silver
              : entry.rank === 3
                ? '#d08030' // bronze
                : isPlayer
                  ? '#f0a030'
                  : '#907040';

          return (
            <div
              key={`${entry.player_type}-${entry.player_id}`}
              className="grid px-4 py-1.5"
              style={{
                gridTemplateColumns: '40px 1fr 90px 110px 60px',
                borderBottom: '1px solid rgba(26,22,8,0.5)',
                background: isPlayer ? 'rgba(240,160,48,0.06)' : 'transparent',
                ...dmdText,
                color: rankColor,
                fontSize: 12,
                textShadow: isPlayer
                  ? '0 0 6px rgba(240,160,48,0.4)'
                  : entry.rank <= 3
                    ? `0 0 4px ${rankColor}40`
                    : 'none',
              }}
            >
              <span className="font-bold">{entry.rank}</span>
              <span className="truncate">
                {entry.display_name}
                {isPlayer && (
                  <span style={{ color: '#f0a030', fontSize: 9, marginLeft: 6 }}>YOU</span>
                )}
              </span>
              <span className="text-right font-bold">{entry.elo}</span>
              <span className="text-right">{entry.high_score?.toLocaleString() || '0'}</span>
              <span className="text-right" style={{ color: `${rankColor}99` }}>
                {entry.wins}-{entry.losses}
              </span>
            </div>
          );
        })}

        {leaderboard.length === 0 && !loading && (
          <div className="text-center py-12" style={{ ...dmdText, color: '#403010' }}>
            NO RANKINGS YET
          </div>
        )}
      </div>
    </div>
  );
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
