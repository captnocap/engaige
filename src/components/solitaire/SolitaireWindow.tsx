/**
 * Solitaire Window
 *
 * Shell component with game controls, stats, and win detection.
 */

import { useState, useCallback, useEffect } from 'react'
import {
  createNewGame, type GameState, type SolitaireStats,
  loadStats, saveStats,
} from './SolitaireGame.js'
import { SolitaireRenderer } from './SolitaireRenderer.js'

function formatElapsed(ms: number): string {
  const sec = Math.floor(ms / 1000)
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function SolitaireWindow() {
  const [game, setGame] = useState<GameState>(createNewGame)
  const [stats, setStats] = useState<SolitaireStats>(loadStats)
  const [elapsed, setElapsed] = useState(0)
  const [history, setHistory] = useState<GameState[]>([])

  // Timer
  useEffect(() => {
    if (game.won) return
    const timer = setInterval(() => {
      setElapsed(Date.now() - game.startTime)
    }, 1000)
    return () => clearInterval(timer)
  }, [game.startTime, game.won])

  const handleGameUpdate = useCallback((newState: GameState) => {
    setHistory(prev => [...prev, game])
    setGame(newState)

    if (newState.won) {
      const time = Date.now() - newState.startTime
      setStats(prev => {
        const updated = {
          ...prev,
          wins: prev.wins + 1,
          bestTime: prev.bestTime === null ? time : Math.min(prev.bestTime, time),
          fewestMoves: prev.fewestMoves === null ? newState.moves : Math.min(prev.fewestMoves, newState.moves),
        }
        saveStats(updated)
        return updated
      })
    }
  }, [game])

  const handleNewGame = useCallback(() => {
    if (!game.won && game.moves > 0) {
      setStats(prev => {
        const updated = { ...prev, losses: prev.losses + 1 }
        saveStats(updated)
        return updated
      })
    }
    setGame(createNewGame())
    setHistory([])
  }, [game.won, game.moves])

  const handleUndo = useCallback(() => {
    if (history.length === 0) return
    const prev = history[history.length - 1]
    setHistory(h => h.slice(0, -1))
    setGame(prev)
  }, [history])

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#0d5e38' }}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#0a4d2f] border-b border-[#0a3d25]">
        <div className="flex gap-2">
          <button
            onClick={handleNewGame}
            className="px-3 py-1 text-sm bg-[#0d5e38] text-white rounded hover:bg-[#10724a] border border-[#0a4d2f]"
          >
            New Game
          </button>
          <button
            onClick={handleUndo}
            disabled={history.length === 0}
            className="px-3 py-1 text-sm bg-[#0d5e38] text-white rounded hover:bg-[#10724a] border border-[#0a4d2f] disabled:opacity-40"
          >
            Undo
          </button>
        </div>
        <div className="flex gap-4 text-sm text-white/80">
          <span>Moves: {game.moves}</span>
          <span>Time: {formatElapsed(elapsed)}</span>
          <span className="text-white/50">W:{stats.wins} L:{stats.losses}</span>
        </div>
      </div>

      {/* Game area */}
      <div className="flex-1 overflow-auto relative">
        <SolitaireRenderer game={game} onGameUpdate={handleGameUpdate} />

        {/* Win overlay */}
        {game.won && (
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-50">
            <div className="text-6xl mb-4">🎉</div>
            <div className="text-3xl text-white font-bold mb-2">You Win!</div>
            <div className="text-white/70 mb-1">{game.moves} moves in {formatElapsed(elapsed)}</div>
            <button
              onClick={handleNewGame}
              className="mt-4 px-6 py-2 bg-[#00ff88] text-[#0a0a0a] rounded-lg font-medium hover:bg-[#00dd77]"
            >
              New Game
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
