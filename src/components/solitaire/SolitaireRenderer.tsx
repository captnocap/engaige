/**
 * Solitaire Card Renderer
 *
 * Renders cards with pointer-based drag-and-drop support.
 * Uses onPointerDown/Move/Up for reliable cross-browser dragging.
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import {
  type Card, type GameState,
  getCardColor, RANK_NAMES, SUIT_SYMBOLS,
  drawFromStock, moveWasteToTableau, moveWasteToFoundation,
  moveTableauToTableau, moveTableauToFoundation, autoMoveToFoundation,
  canMoveToTableau, canMoveToFoundation,
} from './SolitaireGame.js'

interface RendererProps {
  game: GameState
  onGameUpdate: (state: GameState) => void
}

const CARD_W = 82
const CARD_H = 116
const STACK_OFFSET = 26
const FACE_DOWN_OFFSET = 10
const GAP = 10
const START_X = GAP
const START_Y = GAP
const COL_W = CARD_W + GAP
const TABLEAU_Y = START_Y + CARD_H + GAP * 2

const SUIT_COLOR: Record<string, string> = {
  red: '#dc2626',
  black: '#1a1a1a',
}

interface DragState {
  source: 'waste' | number
  cardIndex: number
  cards: Card[]
  offsetX: number
  offsetY: number
  currentX: number
  currentY: number
}

function CardFace({ card, style, onClick, onDoubleClick, onPointerDown, isDragging, className = '' }: {
  card: Card
  style?: React.CSSProperties
  onClick?: () => void
  onDoubleClick?: () => void
  onPointerDown?: (e: React.PointerEvent) => void
  isDragging?: boolean
  className?: string
}) {
  const color = SUIT_COLOR[getCardColor(card)]
  const symbol = SUIT_SYMBOLS[card.suit]
  const rank = RANK_NAMES[card.rank]

  if (!card.faceUp) {
    return (
      <div
        className={`absolute rounded-lg border border-[#1a4a2a] shadow-md ${className}`}
        style={{
          width: CARD_W, height: CARD_H,
          background: `
            linear-gradient(135deg, #1a5c34 0%, #0d4a28 100%)
          `,
          backgroundSize: '100% 100%',
          boxShadow: 'inset 0 0 0 2px #2a7a4a, inset 0 0 0 4px #1a5c34',
          ...style,
        }}
        onClick={onClick}
      >
        {/* Diamond pattern for card back */}
        <div className="absolute inset-[5px] rounded overflow-hidden opacity-30"
          style={{
            background: `repeating-conic-gradient(#fff 0% 25%, transparent 0% 50%) 0 0 / 10px 10px`,
          }}
        />
      </div>
    )
  }

  return (
    <div
      className={`absolute bg-white rounded-lg border border-[#bbb] select-none shadow-md ${isDragging ? 'opacity-50' : 'cursor-pointer'} ${className}`}
      style={{ width: CARD_W, height: CARD_H, ...style }}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onPointerDown={onPointerDown}
    >
      {/* Top-left rank and suit */}
      <div className="absolute top-1 left-1.5 font-bold leading-tight" style={{ color, fontSize: '13px' }}>
        <div>{rank}</div>
        <div className="-mt-1" style={{ fontSize: '14px' }}>{symbol}</div>
      </div>
      {/* Center suit large */}
      <div className="absolute inset-0 flex items-center justify-center" style={{ color, fontSize: '28px' }}>
        {symbol}
      </div>
      {/* Bottom-right rank and suit (rotated) */}
      <div className="absolute bottom-1 right-1.5 font-bold leading-tight rotate-180" style={{ color, fontSize: '13px' }}>
        <div>{rank}</div>
        <div className="-mt-1" style={{ fontSize: '14px' }}>{symbol}</div>
      </div>
    </div>
  )
}

function EmptyPile({ label, style, onClick, highlighted }: {
  label?: string
  style?: React.CSSProperties
  onClick?: () => void
  highlighted?: boolean
}) {
  return (
    <div
      className={`absolute rounded-lg border-2 border-dashed flex items-center justify-center transition-colors duration-150 ${
        highlighted ? 'border-[#00ff88] bg-[#00ff8820]' : 'border-[#2a6a4a]'
      }`}
      style={{ width: CARD_W, height: CARD_H, ...style }}
      onClick={onClick}
    >
      {label && <span className="text-[#3a8a5a] text-lg opacity-60">{label}</span>}
    </div>
  )
}

/** Get the card at the top of a foundation or the dropped card to check highlights */
function getDropTarget(game: GameState, drag: DragState | null): { foundations: boolean[]; tableau: boolean[] } {
  const result = { foundations: [false, false, false, false], tableau: [false, false, false, false, false, false, false] }
  if (!drag) return result
  const topCard = drag.cards[0]
  if (!topCard) return result

  // Only single cards can go to foundations
  if (drag.cards.length === 1) {
    for (let i = 0; i < 4; i++) {
      result.foundations[i] = canMoveToFoundation(topCard, game.foundations[i])
    }
  }
  for (let i = 0; i < 7; i++) {
    result.tableau[i] = canMoveToTableau(topCard, game.tableau[i])
  }
  return result
}

export function SolitaireRenderer({ game, onGameUpdate }: RendererProps) {
  const [drag, setDrag] = useState<DragState | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<DragState | null>(null)

  // Keep ref in sync for pointer handlers
  useEffect(() => { dragRef.current = drag }, [drag])

  const startDrag = useCallback((e: React.PointerEvent, source: 'waste' | number, cardIndex: number, cards: Card[]) => {
    e.preventDefault()
    e.stopPropagation()
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Calculate where in the card the user grabbed
    let cardX: number, cardY: number
    if (source === 'waste') {
      cardX = START_X + COL_W
      cardY = START_Y
    } else {
      cardX = START_X + source * COL_W
      const col = game.tableau[source]
      let offsetY = 0
      for (let i = 0; i < cardIndex; i++) {
        offsetY += col[i].faceUp ? STACK_OFFSET : FACE_DOWN_OFFSET
      }
      cardY = TABLEAU_Y + offsetY
    }

    setDrag({
      source,
      cardIndex,
      cards,
      offsetX: x - cardX,
      offsetY: y - cardY,
      currentX: x,
      currentY: y,
    })
  }, [game])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current) return
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    setDrag(prev => prev ? { ...prev, currentX: x, currentY: y } : null)
  }, [])

  const handlePointerUp = useCallback(() => {
    const d = dragRef.current
    if (!d) return

    // Determine drop target based on position
    const dropX = d.currentX - d.offsetX + CARD_W / 2
    const dropY = d.currentY - d.offsetY + CARD_H / 2

    let newState: GameState | null = null

    // Check foundation drop
    for (let i = 0; i < 4; i++) {
      const fx = START_X + (3 + i) * COL_W
      const fy = START_Y
      if (dropX >= fx && dropX <= fx + CARD_W && dropY >= fy && dropY <= fy + CARD_H) {
        if (d.cards.length === 1) {
          if (d.source === 'waste') {
            newState = moveWasteToFoundation(game, i)
          } else {
            newState = moveTableauToFoundation(game, d.source, i)
          }
        }
        break
      }
    }

    // Check tableau drop
    if (!newState) {
      for (let colIndex = 0; colIndex < 7; colIndex++) {
        const tx = START_X + colIndex * COL_W
        const col = game.tableau[colIndex]

        // Calculate the column's vertical extent
        const colTop = TABLEAU_Y
        let colBottom = TABLEAU_Y + CARD_H
        if (col.length > 0) {
          let offsetY = 0
          for (let i = 0; i < col.length; i++) {
            offsetY += col[i].faceUp ? STACK_OFFSET : FACE_DOWN_OFFSET
          }
          colBottom = TABLEAU_Y + offsetY + CARD_H
        }

        if (dropX >= tx && dropX <= tx + CARD_W && dropY >= colTop && dropY <= colBottom + 30) {
          if (d.source === 'waste') {
            newState = moveWasteToTableau(game, colIndex)
          } else {
            newState = moveTableauToTableau(game, d.source, d.cardIndex, colIndex)
          }
          break
        }
      }
    }

    if (newState) onGameUpdate(newState)
    setDrag(null)
  }, [game, onGameUpdate])

  const handleDoubleClick = useCallback((card: Card, source: 'waste' | number) => {
    const newState = autoMoveToFoundation(game, card, source)
    if (newState) onGameUpdate(newState)
  }, [game, onGameUpdate])

  // Compute which piles are valid drop targets
  const targets = getDropTarget(game, drag)

  // Determine which cards are being dragged (for dimming originals)
  const draggedCardIds = new Set(drag ? drag.cards.map(c => c.id) : [])

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full select-none"
      style={{ minWidth: 7 * COL_W + GAP * 2, minHeight: 600 }}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* Stock pile */}
      {game.stock.length > 0 ? (
        <CardFace
          card={{ ...game.stock[game.stock.length - 1], faceUp: false } as Card}
          style={{ left: START_X, top: START_Y, cursor: 'pointer' }}
          onClick={() => onGameUpdate(drawFromStock(game))}
        />
      ) : (
        <EmptyPile
          label="↻"
          style={{ left: START_X, top: START_Y, cursor: 'pointer' }}
          onClick={() => onGameUpdate(drawFromStock(game))}
        />
      )}

      {/* Waste pile - show up to 3 fanned cards */}
      {game.waste.length > 0 ? (
        (() => {
          const topCard = game.waste[game.waste.length - 1]
          const isDragged = draggedCardIds.has(topCard.id)
          return (
            <CardFace
              card={topCard}
              style={{
                left: START_X + COL_W,
                top: START_Y,
                zIndex: 10,
                opacity: isDragged ? 0.3 : 1,
              }}
              onDoubleClick={() => handleDoubleClick(topCard, 'waste')}
              onPointerDown={(e) => startDrag(e, 'waste', game.waste.length - 1, [topCard])}
            />
          )
        })()
      ) : (
        <EmptyPile style={{ left: START_X + COL_W, top: START_Y }} />
      )}

      {/* Foundations */}
      {game.foundations.map((foundation, i) => {
        const x = START_X + (3 + i) * COL_W
        const highlighted = targets.foundations[i]
        return foundation.length > 0 ? (
          <div key={`f-${i}`}>
            {highlighted && (
              <div
                className="absolute rounded-lg border-2 border-[#00ff88] bg-[#00ff8820] pointer-events-none"
                style={{ left: x - 2, top: START_Y - 2, width: CARD_W + 4, height: CARD_H + 4, zIndex: 50 }}
              />
            )}
            <CardFace
              card={foundation[foundation.length - 1]}
              style={{ left: x, top: START_Y, zIndex: 5 }}
            />
          </div>
        ) : (
          <EmptyPile
            key={`f-${i}`}
            label={(['♥', '♦', '♣', '♠'] as const)[i]}
            style={{ left: x, top: START_Y }}
            highlighted={highlighted}
          />
        )
      })}

      {/* Tableau columns */}
      {game.tableau.map((column, colIndex) => {
        const x = START_X + colIndex * COL_W
        const highlighted = targets.tableau[colIndex] && column.length === 0

        if (column.length === 0) {
          return (
            <EmptyPile
              key={`t-${colIndex}`}
              label="K"
              style={{ left: x, top: TABLEAU_Y }}
              highlighted={highlighted}
            />
          )
        }

        return (
          <div key={`t-${colIndex}`}>
            {/* Highlight indicator for non-empty columns */}
            {targets.tableau[colIndex] && drag && (
              <div
                className="absolute rounded-lg border-2 border-[#00ff88] pointer-events-none"
                style={{
                  left: x - 2,
                  top: TABLEAU_Y - 2,
                  width: CARD_W + 4,
                  height: (() => {
                    let h = 0
                    for (let i = 0; i < column.length; i++) {
                      h += column[i].faceUp ? STACK_OFFSET : FACE_DOWN_OFFSET
                    }
                    return h + CARD_H + 4
                  })(),
                  zIndex: 50,
                }}
              />
            )}
            {column.map((card, cardIndex) => {
              let offsetY = 0
              for (let i = 0; i < cardIndex; i++) {
                offsetY += column[i].faceUp ? STACK_OFFSET : FACE_DOWN_OFFSET
              }
              const y = TABLEAU_Y + offsetY
              const isDragged = draggedCardIds.has(card.id)
              const isLastCard = cardIndex === column.length - 1

              return (
                <CardFace
                  key={card.id}
                  card={card}
                  style={{
                    left: x,
                    top: y,
                    zIndex: cardIndex + 1,
                    opacity: isDragged ? 0.3 : 1,
                    transition: isDragged ? 'none' : undefined,
                  }}
                  onDoubleClick={card.faceUp && isLastCard
                    ? () => handleDoubleClick(card, colIndex)
                    : undefined}
                  onPointerDown={card.faceUp
                    ? (e) => {
                        const cardsToMove = column.slice(cardIndex)
                        startDrag(e, colIndex, cardIndex, cardsToMove)
                      }
                    : undefined}
                />
              )
            })}
          </div>
        )
      })}

      {/* Drag overlay - floating cards following cursor */}
      {drag && (
        <div
          className="pointer-events-none"
          style={{
            position: 'absolute',
            left: drag.currentX - drag.offsetX,
            top: drag.currentY - drag.offsetY,
            zIndex: 100,
          }}
        >
          {drag.cards.map((card, i) => (
            <CardFace
              key={card.id}
              card={card}
              style={{
                left: 0,
                top: i * STACK_OFFSET,
                zIndex: 100 + i,
                filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))',
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
