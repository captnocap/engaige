import { useState } from 'react';
import { Chessboard } from 'react-chessboard';
import { useWSRequest } from '../../stores/wsStore.js';

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
}

interface ChessBoardProps {
  match: ChessMatch;
  onUpdate: () => void;
}

export function ChessBoard({ match, onUpdate }: ChessBoardProps) {
  const { request } = useWSRequest();
  const [making Move, setMakingMove] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isPlayerWhite = match.white_player_type === 'player';
  const isPlayerTurn = (match.move_count % 2 === 0) === isPlayerWhite;
  const playerColor = isPlayerWhite ? 'white' : 'black';

  async function handleMove(sourceSquare: string, targetSquare: string): Promise<boolean> {
    if (!isPlayerTurn || makingMove || match.status !== 'active') {
      return false;
    }

    try {
      setMakingMove(true);
      setError(null);

      // Simple algebraic notation (we'll let the server validate)
      const move = sourceSquare + targetSquare;

      const result = await request<{ match_id: string; move: string }, any>('chess:makeMove', {
        match_id: match.id,
        move,
      });

      if (result && result.success) {
        onUpdate();
        return true;
      } else {
        setError(result?.error || 'Invalid move');
        return false;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to make move');
      return false;
    } finally {
      setMakingMove(false);
    }
  }

  async function handleResign() {
    if (match.status !== 'active') return;

    if (!confirm('Are you sure you want to resign this match?')) return;

    try {
      await request<{ match_id: string }, any>('chess:resign', {
        match_id: match.id,
      });
      onUpdate();
    } catch (err) {
      console.error('Failed to resign:', err);
      alert('Failed to resign match');
    }
  }

  return (
    <div className="h-full flex">
      {/* Chess Board */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-[600px] w-full">
          <Chessboard
            position={match.current_fen}
            onPieceDrop={handleMove}
            boardOrientation={playerColor}
            customBoardStyle={{
              borderRadius: '4px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            }}
            arePiecesDraggable={isPlayerTurn && !makingMove && match.status === 'active'}
          />

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 rounded bg-red-500/10 border border-red-500/50 text-red-500 text-sm">
              {error}
            </div>
          )}

          {/* Status Message */}
          <div className="mt-4 text-center">
            {match.status === 'completed' && (
              <div className="text-lg font-semibold text-[var(--color-text)]">
                Game Over
              </div>
            )}
            {match.status === 'active' && (
              <div className="text-sm text-[var(--color-textMuted)]">
                {isPlayerTurn ? (
                  <span className="text-green-500 font-medium">Your turn</span>
                ) : (
                  <span>Opponent's turn...</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Move History Sidebar */}
      <div
        className="w-80 flex flex-col"
        style={{ borderLeft: '1px solid var(--color-border)' }}
      >
        {/* Match Info */}
        <div className="shrink-0 p-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <h3 className="text-sm font-semibold text-[var(--color-text)] mb-2">Match Info</h3>
          <div className="space-y-2 text-sm text-[var(--color-textMuted)]">
            <div className="flex justify-between">
              <span>⚪ White:</span>
              <span className="font-medium text-[var(--color-text)]">
                {isPlayerWhite ? 'You' : 'Opponent'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>⚫ Black:</span>
              <span className="font-medium text-[var(--color-text)]">
                {!isPlayerWhite ? 'You' : 'Opponent'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Moves:</span>
              <span className="font-medium text-[var(--color-text)]">{match.move_count}</span>
            </div>
          </div>
        </div>

        {/* Move History */}
        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="text-sm font-semibold text-[var(--color-text)] mb-2">Move History</h3>
          {match.moves.length === 0 && (
            <div className="text-sm text-[var(--color-textMuted)]">No moves yet</div>
          )}
          <div className="space-y-1">
            {match.moves.map((move, index) => (
              <div
                key={index}
                className="flex gap-2 text-sm"
              >
                <span className="text-[var(--color-textMuted)] w-8">{Math.floor(index / 2) + 1}.</span>
                <span className={`font-mono ${index % 2 === 0 ? 'text-[var(--color-text)]' : 'text-[var(--color-textMuted)]'}`}>
                  {move}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        {match.status === 'active' && (
          <div className="shrink-0 p-4" style={{ borderTop: '1px solid var(--color-border)' }}>
            <button
              onClick={handleResign}
              className="w-full px-4 py-2 rounded bg-red-500 hover:bg-red-600 text-white font-medium transition-colors"
            >
              Resign Match
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
