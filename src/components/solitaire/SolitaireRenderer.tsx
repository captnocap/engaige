/**
 * Solitaire Card Renderer
 *
 * Renders cards with drag-and-drop support.
 */

import { useState, useCallback } from 'react'
import {
  type Card, type GameState, type Suit,
  getCardColor, RANK_NAMES, SUIT_SYMBOLS,
  drawFromStock, moveWasteToTableau, moveWasteToFoundation,
  moveTableauToTableau, moveTableauToFoundation, autoMoveToFoundation,
} from './SolitaireGame.js'

interface RendererProps {
  game: GameState
  onGameUpdate: (state: GameState) => void
}

const CARD_W = 72
const CARD_H = 100
const STACK_OFFSET = 22
const FACE_DOWN_OFFSET = 8

const SUIT_COLOR: Record<string, string> = {
  red: '#ef4444',
  black: '#111',
}

function CardFace({ card, className = '', style, onClick, onDoubleClick, onDragStart, draggable }: {
  card: Card
  className?: string
  style?: React.CSSProperties
  onClick?: () => void
  onDoubleClick?: () => void
  onDragStart?: (e: React.DragEvent) => void
  draggable?: boolean
}) {
  const color = SUIT_COLOR[getCardColor(card)]
  const symbol = SUIT_SYMBOLS[card.suit]
  const rank = RANK_NAMES[card.rank]

  if (!card.faceUp) {
    return (
      <div
        className={`absolute rounded-md border border-[#555] ${className}`}
        style={{ width: CARD_W, height: CARD_H, background: 'repeating-linear-gradient(45deg, #1a4a2a, #1a4a2a 4px, #0d5e38 4px, #0d5e38 8px)', ...style }}
        onClick={onClick}
      />
    )
  }

  return (
    <div
      className={`absolute bg-white rounded-md border border-[#ccc] cursor-pointer select-none shadow-sm ${className}`}
      style={{ width: CARD_W, height: CARD_H, ...style }}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      draggable={draggable}
      onDragStart={onDragStart}
    >
      <div className="absolute top-1 left-1.5 text-xs font-bold leading-tight" style={{ color }}>
        <div>{rank}</div>
        <div className="-mt-0.5">{symbol}</div>
      </div>
      <div className="absolute inset-0 flex items-center justify-center text-2xl" style={{ color }}>
        {symbol}
      </div>
      <div className="absolute bottom-1 right-1.5 text-xs font-bold leading-tight rotate-180" style={{ color }}>
        <div>{rank}</div>
        <div className="-mt-0.5">{symbol}</div>
      </div>
    </div>
  )
}

function EmptyPile({ label, className = '', style, onClick, onDragOver, onDrop }: {
  label?: string
  className?: string
  style?: React.CSSProperties
  onClick?: () => void
  onDragOver?: (e: React.DragEvent) => void
  onDrop?: (e: React.DragEvent) => void
}) {
  return (
    <div
      className={`absolute rounded-md border-2 border-dashed border-[#2a5a3a] flex items-center justify-center ${className}`}
      style={{ width: CARD_W, height: CARD_H, ...style }}
      onClick={onClick}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {label && <span className="text-[#2a5a3a] text-xs">{label}</span>}
    </div>
  )
}

export function SolitaireRenderer({ game, onGameUpdate }: RendererProps) {
  const [dragData, setDragData] = useState<{ source: 'waste' | number; cardIndex: number } | null>(null)

  const handleDragStart = useCallback((e: React.DragEvent, source: 'waste' | number, cardIndex: number) => {
    setDragData({ source, cardIndex })
    e.dataTransfer.effectAllowed = 'move'
    // Set a transparent drag image
    const ghost = document.createElement('div')
    ghost.style.opacity = '0'
    document.body.appendChild(ghost)
    e.dataTransfer.setDragImage(ghost, 0, 0)
    setTimeout(() => document.body.removeChild(ghost), 0)
  }, [])

  const handleDrop = useCallback((target: 'foundation' | 'tableau', index: number) => {
    if (!dragData) return
    let newState: GameState | null = null

    if (target === 'foundation') {
      if (dragData.source === 'waste') {
        newState = moveWasteToFoundation(game, index)
      } else {
        newState = moveTableauToFoundation(game, dragData.source, index)
      }
    } else {
      if (dragData.source === 'waste') {
        newState = moveWasteToTableau(game, index)
      } else {
        newState = moveTableauToTableau(game, dragData.source, dragData.cardIndex, index)
      }
    }

    if (newState) onGameUpdate(newState)
    setDragData(null)
  }, [dragData, game, onGameUpdate])

  const handleDoubleClick = useCallback((card: Card, source: 'waste' | number) => {
    const newState = autoMoveToFoundation(game, card, source)
    if (newState) onGameUpdate(newState)
  }, [game, onGameUpdate])

  const allowDrop = (e: React.DragEvent) => e.preventDefault()

  // Layout: gap of 12px, starting at 12px
  const GAP = 12
  const START_X = GAP
  const START_Y = GAP
  const COL_W = CARD_W + GAP

  return (
    <div className="relative w-full h-full" style={{ minWidth: 7 * COL_W + GAP, minHeight: 600 }}>
      {/* Stock pile */}
      {game.stock.length > 0 ? (
        <CardFace
          card={{ ...game.stock[game.stock.length - 1], faceUp: false } as Card}
          style={{ left: START_X, top: START_Y }}
          onClick={() => onGameUpdate(drawFromStock(game))}
        />
      ) : (
        <EmptyPile
          label="↻"
          style={{ left: START_X, top: START_Y }}
          onClick={() => onGameUpdate(drawFromStock(game))}
        />
      )}

      {/* Waste pile */}
      {game.waste.length > 0 ? (
        <CardFace
          card={game.waste[game.waste.length - 1]}
          style={{ left: START_X + COL_W, top: START_Y }}
          onDoubleClick={() => handleDoubleClick(game.waste[game.waste.length - 1], 'waste')}
          draggable
          onDragStart={(e) => handleDragStart(e, 'waste', game.waste.length - 1)}
        />
      ) : (
        <EmptyPile style={{ left: START_X + COL_W, top: START_Y }} />
      )}

      {/* Foundations */}
      {game.foundations.map((foundation, i) => {
        const x = START_X + (3 + i) * COL_W
        return foundation.length > 0 ? (
          <div key={`f-${i}`} onDragOver={allowDrop} onDrop={() => handleDrop('foundation', i)}>
            <CardFace
              card={foundation[foundation.length - 1]}
              style={{ left: x, top: START_Y }}
            />
          </div>
        ) : (
          <EmptyPile
            key={`f-${i}`}
            label={(['♥', '♦', '♣', '♠'] as const)[i]}
            style={{ left: x, top: START_Y }}
            onDragOver={allowDrop}
            onDrop={() => handleDrop('foundation', i)}
          />
        )
      })}

      {/* Tableau */}
      {game.tableau.map((column, colIndex) => {
        const x = START_X + colIndex * COL_W
        const baseY = START_Y + CARD_H + GAP * 2

        if (column.length === 0) {
          return (
            <EmptyPile
              key={`t-${colIndex}`}
              label="K"
              style={{ left: x, top: baseY }}
              onDragOver={allowDrop}
              onDrop={() => handleDrop('tableau', colIndex)}
            />
          )
        }

        return column.map((card, cardIndex) => {
          const offsetY = column.slice(0, cardIndex).reduce(
            (sum, c) => sum + (c.faceUp ? STACK_OFFSET : FACE_DOWN_OFFSET), 0
          )
          const y = baseY + offsetY

          return (
            <div
              key={card.id}
              onDragOver={cardIndex === column.length - 1 ? allowDrop : undefined}
              onDrop={cardIndex === column.length - 1 ? () => handleDrop('tableau', colIndex) : undefined}
            >
              <CardFace
                card={card}
                style={{ left: x, top: y, zIndex: cardIndex }}
                onDoubleClick={card.faceUp && cardIndex === column.length - 1
                  ? () => handleDoubleClick(card, colIndex)
                  : undefined}
                draggable={card.faceUp}
                onDragStart={card.faceUp ? (e) => handleDragStart(e, colIndex, cardIndex) : undefined}
              />
            </div>
          )
        })
      })}
    </div>
  )
}
