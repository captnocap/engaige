import { useState, useEffect } from 'react';
import { useWSRequest } from '../../stores/wsStore.js';
import { ChessBoard } from './ChessBoard.js';
import { Select } from '../ui/Select.js';

interface ChessMatch {
  id: string;
  white_player_id: string;
  white_player_type: 'player' | 'npc';
  black_player_id: string;
  black_player_type: 'player' | 'npc';
  status: 'active' | 'completed' | 'abandoned';
  moves: string[];
  current_fen: string;
  move_count: number;
  white_elo_before: number;
  black_elo_before: number;
  started_at: number;
}

interface NPC {
  id: string;
  display_name: string;
  elo: number;
}

export function PlayView() {
  const { request } = useWSRequest();
  const [activeMatches, setActiveMatches] = useState<ChessMatch[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<ChessMatch | null>(null);
  const [npcs, setNpcs] = useState<NPC[]>([]);
  const [selectedNPC, setSelectedNPC] = useState<string>('');
  const [challenging, setChallenging] = useState(false);

  useEffect(() => {
    fetchActiveMatches();
    fetchLeaderboard(); // To get NPC list

    // Refresh active matches every 5 seconds
    const interval = setInterval(fetchActiveMatches, 5000);
    return () => clearInterval(interval);
  }, []);

  async function fetchActiveMatches() {
    try {
      const matches = await request<void, ChessMatch[]>('chess:getActiveMatches');
      setActiveMatches(matches || []);

      // If we have a selected match, update it
      if (selectedMatch) {
        const updated = matches?.find(m => m.id === selectedMatch.id);
        if (updated) {
          setSelectedMatch(updated);
        }
      }
    } catch (error) {
      console.error('Failed to fetch active matches:', error);
    }
  }

  async function fetchLeaderboard() {
    try {
      const data = await request<{ limit?: number }, any[]>('chess:getLeaderboard', { limit: 100 });
      const npcList = (data || [])
        .filter(entry => !entry.is_player)
        .map(entry => ({
          id: entry.npc_id || entry.player_id,
          display_name: entry.display_name,
          elo: entry.elo_rating || entry.elo,
        }))
        .sort((a, b) => b.elo - a.elo);

      setNpcs(npcList);
      if (npcList.length > 0 && !selectedNPC) {
        setSelectedNPC(npcList[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch NPCs:', error);
    }
  }

  async function challengeNPC() {
    if (!selectedNPC || challenging) return;

    try {
      setChallenging(true);
      const match = await request<{ npc_id: string }, ChessMatch>('chess:challengeNPC', {
        npc_id: selectedNPC,
      });

      if (match) {
        setActiveMatches(prev => [match, ...prev]);
        setSelectedMatch(match);
      }
    } catch (error) {
      console.error('Failed to challenge NPC:', error);
      alert('Failed to challenge NPC. They might be busy with another game.');
    } finally {
      setChallenging(false);
    }
  }

  // If viewing a specific match, show the chess board
  if (selectedMatch) {
    return (
      <div className="h-full flex flex-col">
        <div className="shrink-0 px-6 py-3 flex items-center gap-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <button
            onClick={() => setSelectedMatch(null)}
            className="px-3 py-1 text-sm rounded bg-[var(--color-bgSecondary)] hover:bg-[var(--color-bgTertiary)] text-[var(--color-text)] transition-colors"
          >
            ← Back to Games
          </button>
          <div className="text-sm text-[var(--color-textMuted)]">
            Match #{selectedMatch.id.slice(0, 8)}
          </div>
        </div>
        <div className="flex-1 min-h-0">
          <ChessBoard
            match={selectedMatch}
            onUpdate={fetchActiveMatches}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Challenge Section */}
      <div className="shrink-0 px-6 py-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <h3 className="text-lg font-semibold text-[var(--color-text)] mb-3">Challenge an NPC</h3>
        <div className="flex gap-3">
          <div className="flex-1">
            <Select
              value={selectedNPC}
              onChange={setSelectedNPC}
              options={npcs.map(npc => ({
                value: npc.id,
                label: `${npc.display_name} (ELO: ${npc.elo})`
              }))}
              placeholder="Select an opponent"
              disabled={challenging}
            />
          </div>
          <button
            onClick={challengeNPC}
            disabled={challenging || !selectedNPC}
            className="px-6 py-2 rounded bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {challenging ? 'Challenging...' : '♟️ Challenge'}
          </button>
        </div>
      </div>

      {/* Active Matches */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <h3 className="text-lg font-semibold text-[var(--color-text)] mb-3">Active Games</h3>

        {activeMatches.length === 0 && (
          <div className="text-center py-12 text-[var(--color-textMuted)]">
            No active games. Challenge an NPC to start playing!
          </div>
        )}

        <div className="space-y-3">
          {activeMatches.map(match => {
            const isPlayerWhite = match.white_player_type === 'player';
            const isPlayerTurn = (match.move_count % 2 === 0) === isPlayerWhite;

            return (
              <button
                key={match.id}
                onClick={() => setSelectedMatch(match)}
                className="w-full p-4 rounded-lg bg-[var(--color-bgSecondary)] hover:bg-[var(--color-bgTertiary)] transition-colors text-left"
                style={{ border: '1px solid var(--color-border)' }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-[var(--color-text)]">
                      {isPlayerWhite ? '⚪ You' : '⚫ Opponent'} vs {isPlayerWhite ? '⚫ Opponent' : '⚪ You'}
                    </span>
                    {isPlayerTurn && (
                      <span className="px-2 py-0.5 text-xs rounded bg-green-500 text-white">
                        Your Turn
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-[var(--color-textMuted)]">
                    Move {match.move_count}
                  </span>
                </div>
                <div className="text-sm text-[var(--color-textMuted)]">
                  Started {new Date(match.started_at * 1000).toLocaleString()}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
