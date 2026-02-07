/**
 * Solitaire Game Logic - Klondike
 *
 * Pure game state management. No React dependencies.
 */

export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades'
export type Color = 'red' | 'black'
export type Rank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13

export interface Card {
  suit: Suit
  rank: Rank
  faceUp: boolean
  id: string
}

export interface GameState {
  stock: Card[]          // Draw pile
  waste: Card[]          // Drawn cards
  foundations: Card[][]  // 4 foundation piles (ace to king)
  tableau: Card[][]      // 7 tableau columns
  moves: number
  startTime: number
  won: boolean
}

const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades']
const SUIT_COLORS: Record<Suit, Color> = {
  hearts: 'red', diamonds: 'red', clubs: 'black', spades: 'black',
}

export const RANK_NAMES: Record<number, string> = {
  1: 'A', 2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7',
  8: '8', 9: '9', 10: '10', 11: 'J', 12: 'Q', 13: 'K',
}

export const SUIT_SYMBOLS: Record<Suit, string> = {
  hearts: '♥', diamonds: '♦', clubs: '♣', spades: '♠',
}

export function getCardColor(card: Card): Color {
  return SUIT_COLORS[card.suit]
}

function createDeck(): Card[] {
  const deck: Card[] = []
  for (const suit of SUITS) {
    for (let rank = 1; rank <= 13; rank++) {
      deck.push({ suit, rank: rank as Rank, faceUp: false, id: `${suit}-${rank}` })
    }
  }
  return deck
}

function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function createNewGame(): GameState {
  const deck = shuffleDeck(createDeck())
  const tableau: Card[][] = [[], [], [], [], [], [], []]
  let cardIndex = 0

  // Deal tableau: column i gets i+1 cards, top card face up
  for (let i = 0; i < 7; i++) {
    for (let j = 0; j <= i; j++) {
      const card = { ...deck[cardIndex], faceUp: j === i }
      tableau[i].push(card)
      cardIndex++
    }
  }

  // Remaining cards go to stock
  const stock = deck.slice(cardIndex).map(c => ({ ...c, faceUp: false }))

  return {
    stock,
    waste: [],
    foundations: [[], [], [], []],
    tableau,
    moves: 0,
    startTime: Date.now(),
    won: false,
  }
}

export function drawFromStock(state: GameState): GameState {
  const newState = deepClone(state)
  if (newState.stock.length === 0) {
    // Reset stock from waste
    newState.stock = newState.waste.reverse().map(c => ({ ...c, faceUp: false }))
    newState.waste = []
  } else {
    const card = newState.stock.pop()!
    card.faceUp = true
    newState.waste.push(card)
  }
  newState.moves++
  return newState
}

export function canMoveToFoundation(card: Card, foundation: Card[]): boolean {
  if (foundation.length === 0) return card.rank === 1
  const top = foundation[foundation.length - 1]
  return card.suit === top.suit && card.rank === top.rank + 1
}

export function canMoveToTableau(card: Card, column: Card[]): boolean {
  if (column.length === 0) return card.rank === 13
  const top = column[column.length - 1]
  if (!top.faceUp) return false
  return getCardColor(card) !== getCardColor(top) && card.rank === top.rank - 1
}

export function moveWasteToFoundation(state: GameState, foundationIndex: number): GameState | null {
  if (state.waste.length === 0) return null
  const card = state.waste[state.waste.length - 1]
  if (!canMoveToFoundation(card, state.foundations[foundationIndex])) return null

  const newState = deepClone(state)
  newState.waste.pop()
  newState.foundations[foundationIndex].push(card)
  newState.moves++
  newState.won = checkWin(newState)
  return newState
}

export function moveWasteToTableau(state: GameState, colIndex: number): GameState | null {
  if (state.waste.length === 0) return null
  const card = state.waste[state.waste.length - 1]
  if (!canMoveToTableau(card, state.tableau[colIndex])) return null

  const newState = deepClone(state)
  newState.waste.pop()
  newState.tableau[colIndex].push(card)
  newState.moves++
  return newState
}

export function moveTableauToFoundation(state: GameState, fromCol: number, foundationIndex: number): GameState | null {
  const column = state.tableau[fromCol]
  if (column.length === 0) return null
  const card = column[column.length - 1]
  if (!canMoveToFoundation(card, state.foundations[foundationIndex])) return null

  const newState = deepClone(state)
  newState.tableau[fromCol].pop()
  // Flip the new top card
  const newTop = newState.tableau[fromCol][newState.tableau[fromCol].length - 1]
  if (newTop && !newTop.faceUp) newTop.faceUp = true
  newState.foundations[foundationIndex].push(card)
  newState.moves++
  newState.won = checkWin(newState)
  return newState
}

export function moveTableauToTableau(state: GameState, fromCol: number, startCardIndex: number, toCol: number): GameState | null {
  const fromColumn = state.tableau[fromCol]
  if (startCardIndex < 0 || startCardIndex >= fromColumn.length) return null
  const movingCard = fromColumn[startCardIndex]
  if (!movingCard.faceUp) return null
  if (!canMoveToTableau(movingCard, state.tableau[toCol])) return null

  const newState = deepClone(state)
  const cards = newState.tableau[fromCol].splice(startCardIndex)
  newState.tableau[toCol].push(...cards)
  // Flip the new top card
  const newTop = newState.tableau[fromCol][newState.tableau[fromCol].length - 1]
  if (newTop && !newTop.faceUp) newTop.faceUp = true
  newState.moves++
  return newState
}

export function autoMoveToFoundation(state: GameState, card: Card, fromSource: 'waste' | number): GameState | null {
  for (let i = 0; i < 4; i++) {
    if (canMoveToFoundation(card, state.foundations[i])) {
      if (fromSource === 'waste') {
        return moveWasteToFoundation(state, i)
      } else {
        return moveTableauToFoundation(state, fromSource, i)
      }
    }
  }
  return null
}

function checkWin(state: GameState): boolean {
  return state.foundations.every(f => f.length === 13)
}

function deepClone(state: GameState): GameState {
  return {
    stock: state.stock.map(c => ({ ...c })),
    waste: state.waste.map(c => ({ ...c })),
    foundations: state.foundations.map(f => f.map(c => ({ ...c }))),
    tableau: state.tableau.map(col => col.map(c => ({ ...c }))),
    moves: state.moves,
    startTime: state.startTime,
    won: state.won,
  }
}

// Stats persistence
const STATS_KEY = 'solitaire-stats'

export interface SolitaireStats {
  wins: number
  losses: number
  bestTime: number | null
  fewestMoves: number | null
}

export function loadStats(): SolitaireStats {
  try {
    const stored = localStorage.getItem(STATS_KEY)
    if (stored) return JSON.parse(stored)
  } catch { /* ignore */ }
  return { wins: 0, losses: 0, bestTime: null, fewestMoves: null }
}

export function saveStats(stats: SolitaireStats) {
  localStorage.setItem(STATS_KEY, JSON.stringify(stats))
}
