import { Chess } from 'chess.js';

/**
 * Chess Engine Service
 *
 * Handles chess move validation, generation, and game state management using chess.js library.
 * NPCs generate moves based on their skill level (1-10) and playstyle.
 *
 * Zero AI budget impact - all move generation is local computation.
 */

export type Playstyle = 'aggressive' | 'defensive' | 'balanced' | 'tactical' | 'positional';

// Piece values for material evaluation
const PIECE_VALUES: Record<string, number> = {
  p: 1,   // pawn
  n: 3,   // knight
  b: 3,   // bishop
  r: 5,   // rook
  q: 9,   // queen
  k: 0,   // king (infinite value, not counted)
};

// Center squares for positional evaluation
const CENTER_SQUARES = ['e4', 'e5', 'd4', 'd5'];
const EXTENDED_CENTER = ['c3', 'c4', 'c5', 'c6', 'd3', 'd6', 'e3', 'e6', 'f3', 'f4', 'f5', 'f6'];

/**
 * Validate if a move is legal
 */
export function validateMove(fen: string, move: string): boolean {
  try {
    const chess = new Chess(fen);
    const result = chess.move(move);
    return result !== null;
  } catch {
    return false;
  }
}

/**
 * Get all legal moves for the current position
 */
export function getLegalMoves(fen: string): string[] {
  try {
    const chess = new Chess(fen);
    return chess.moves();
  } catch {
    return [];
  }
}

/**
 * Apply a move and get the resulting FEN
 */
export function getFenAfterMove(fen: string, move: string): string | null {
  try {
    const chess = new Chess(fen);
    const result = chess.move(move);
    if (result === null) return null;
    return chess.fen();
  } catch {
    return null;
  }
}

/**
 * Check if the current position is checkmate
 */
export function isCheckmate(fen: string): boolean {
  try {
    const chess = new Chess(fen);
    return chess.isCheckmate();
  } catch {
    return false;
  }
}

/**
 * Check if the current position is stalemate
 */
export function isStalemate(fen: string): boolean {
  try {
    const chess = new Chess(fen);
    return chess.isStalemate();
  } catch {
    return false;
  }
}

/**
 * Check if the current position is a draw (stalemate, insufficient material, threefold rep, 50-move rule)
 */
export function isDraw(fen: string): boolean {
  try {
    const chess = new Chess(fen);
    return chess.isStalemate() || chess.isThreefoldRepetition() || chess.isInsufficientMaterial() || chess.isDraw();
  } catch {
    return false;
  }
}

/**
 * Check if the current position is in check
 */
export function isCheck(fen: string): boolean {
  try {
    const chess = new Chess(fen);
    return chess.isCheck();
  } catch {
    return false;
  }
}

/**
 * Evaluate a position (positive = white advantage, negative = black advantage)
 */
function evaluatePosition(fen: string): number {
  try {
    const chess = new Chess(fen);

    // Checkmate evaluation
    if (chess.isCheckmate()) {
      return chess.turn() === 'w' ? -1000 : 1000;
    }

    // Draw evaluation
    if (isDraw(fen)) return 0;

    let score = 0;

    // Material count
    const board = chess.board();
    for (const row of board) {
      for (const square of row) {
        if (square) {
          const value = PIECE_VALUES[square.type] || 0;
          score += square.color === 'w' ? value : -value;
        }
      }
    }

    // Center control bonus
    const pieces = chess.board().flat().filter(Boolean);
    for (const square of CENTER_SQUARES) {
      const piece = chess.get(square as any);
      if (piece) {
        score += piece.color === 'w' ? 0.3 : -0.3;
      }
    }

    return score;
  } catch {
    return 0;
  }
}

/**
 * Generate a move based on skill level and playstyle
 *
 * Skill levels:
 * 1-3: Random moves with blunders
 * 4-6: Basic material evaluation
 * 7-9: Minimax search (2-4 ply)
 * 10: Deeper search (6 ply) with alpha-beta pruning
 */
export function generateMove(fen: string, skillLevel: number, playstyle: Playstyle = 'balanced'): string | null {
  try {
    const chess = new Chess(fen);
    const moves = chess.moves({ verbose: true });

    if (moves.length === 0) return null;

    // Skill level 1-3: Random moves with blunders
    if (skillLevel <= 3) {
      // 30% chance to blunder (pick worst move)
      if (Math.random() < 0.3) {
        return pickWorstMove(fen, moves);
      }
      // Otherwise random
      return moves[Math.floor(Math.random() * moves.length)].san;
    }

    // Skill level 4-6: Material-based evaluation with some randomness
    if (skillLevel <= 6) {
      return pickMaterialMove(fen, moves, playstyle);
    }

    // Skill level 7-9: Minimax search (2-4 ply depth)
    if (skillLevel <= 9) {
      const depth = 2 + Math.floor((skillLevel - 7) / 1.5); // 2-3 ply
      return pickMinimaxMove(fen, moves, depth, playstyle);
    }

    // Skill level 10: Deeper minimax (6 ply)
    const depth = 6;
    return pickMinimaxMove(fen, moves, depth, playstyle);

  } catch (error) {
    console.error('Error generating move:', error);
    return null;
  }
}

/**
 * Pick the worst move (for blunders)
 */
function pickWorstMove(fen: string, moves: any[]): string {
  const chess = new Chess(fen);
  const isWhite = chess.turn() === 'w';

  let worstMove = moves[0].san;
  let worstScore = isWhite ? 1000 : -1000;

  for (const move of moves) {
    const testChess = new Chess(fen);
    testChess.move(move.san);
    const score = evaluatePosition(testChess.fen());

    if ((isWhite && score < worstScore) || (!isWhite && score > worstScore)) {
      worstScore = score;
      worstMove = move.san;
    }
  }

  return worstMove;
}

/**
 * Pick a move based on material evaluation with playstyle modifiers
 */
function pickMaterialMove(fen: string, moves: any[], playstyle: Playstyle): string {
  const chess = new Chess(fen);
  const isWhite = chess.turn() === 'w';

  // Evaluate each move
  const moveScores = moves.map(move => {
    const testChess = new Chess(fen);
    testChess.move(move.san);
    let score = evaluatePosition(testChess.fen());

    // Apply playstyle modifiers
    score += applyPlaystyleBonus(move, playstyle);

    return { move: move.san, score };
  });

  // Sort by score (best first)
  moveScores.sort((a, b) => isWhite ? b.score - a.score : a.score - b.score);

  // Pick from top 3 moves with some randomness
  const topMoves = moveScores.slice(0, 3);
  const weights = [0.6, 0.3, 0.1]; // Favor best move but allow variety
  const rand = Math.random();
  let cumulative = 0;

  for (let i = 0; i < topMoves.length; i++) {
    cumulative += weights[i];
    if (rand < cumulative) {
      return topMoves[i].move;
    }
  }

  return topMoves[0].move;
}

/**
 * Minimax search with alpha-beta pruning
 */
function pickMinimaxMove(fen: string, moves: any[], depth: number, playstyle: Playstyle): string {
  const chess = new Chess(fen);
  const isWhite = chess.turn() === 'w';

  let bestMove = moves[0].san;
  let bestScore = isWhite ? -10000 : 10000;
  let alpha = -10000;
  let beta = 10000;

  for (const move of moves) {
    const testChess = new Chess(fen);
    testChess.move(move.san);

    const score = minimax(testChess.fen(), depth - 1, alpha, beta, !isWhite, playstyle);

    if ((isWhite && score > bestScore) || (!isWhite && score < bestScore)) {
      bestScore = score;
      bestMove = move.san;
    }

    // Alpha-beta pruning
    if (isWhite) {
      alpha = Math.max(alpha, score);
    } else {
      beta = Math.min(beta, score);
    }

    if (beta <= alpha) break;
  }

  return bestMove;
}

/**
 * Minimax algorithm with alpha-beta pruning
 */
function minimax(fen: string, depth: number, alpha: number, beta: number, isMaximizing: boolean, playstyle: Playstyle): number {
  // Terminal conditions
  if (depth === 0 || isCheckmate(fen) || isDraw(fen)) {
    return evaluatePosition(fen);
  }

  const chess = new Chess(fen);
  const moves = chess.moves({ verbose: true });

  if (moves.length === 0) {
    return evaluatePosition(fen);
  }

  if (isMaximizing) {
    let maxScore = -10000;
    for (const move of moves) {
      const testChess = new Chess(fen);
      testChess.move(move.san);
      const score = minimax(testChess.fen(), depth - 1, alpha, beta, false, playstyle);
      maxScore = Math.max(maxScore, score);
      alpha = Math.max(alpha, score);
      if (beta <= alpha) break;
    }
    return maxScore;
  } else {
    let minScore = 10000;
    for (const move of moves) {
      const testChess = new Chess(fen);
      testChess.move(move.san);
      const score = minimax(testChess.fen(), depth - 1, alpha, beta, true, playstyle);
      minScore = Math.min(minScore, score);
      beta = Math.min(beta, score);
      if (beta <= alpha) break;
    }
    return minScore;
  }
}

/**
 * Apply playstyle-specific bonuses to move scores
 */
function applyPlaystyleBonus(move: any, playstyle: Playstyle): number {
  let bonus = 0;

  switch (playstyle) {
    case 'aggressive':
      // Favor captures and attacks
      if (move.captured) bonus += 1.5;
      if (move.san.includes('+')) bonus += 0.5; // Check
      if (move.san.includes('#')) bonus += 3; // Checkmate
      break;

    case 'defensive':
      // Favor king safety and pawn structures
      if (move.piece === 'p') bonus += 0.3;
      if (move.san === 'O-O' || move.san === 'O-O-O') bonus += 1; // Castling
      break;

    case 'tactical':
      // Favor complex positions, captures, checks
      if (move.captured) bonus += 1;
      if (move.san.includes('+')) bonus += 1;
      break;

    case 'positional':
      // Favor center control and piece development
      if (CENTER_SQUARES.includes(move.to)) bonus += 0.5;
      if (EXTENDED_CENTER.includes(move.to)) bonus += 0.3;
      if (move.piece === 'n' || move.piece === 'b') bonus += 0.2; // Develop minor pieces
      break;

    case 'balanced':
    default:
      // No specific bias
      if (move.captured) bonus += 0.5;
      break;
  }

  return bonus;
}

/**
 * Get move details (check, checkmate, capture, etc.)
 */
export function getMoveDetails(fen: string, move: string): {
  isCheck: boolean;
  isCheckmate: boolean;
  isCapture: boolean;
  isCastling: boolean;
  isPromotion: boolean;
} {
  try {
    const chess = new Chess(fen);
    const result = chess.move(move);

    if (!result) {
      return { isCheck: false, isCheckmate: false, isCapture: false, isCastling: false, isPromotion: false };
    }

    return {
      isCheck: chess.isCheck(),
      isCheckmate: chess.isCheckmate(),
      isCapture: !!result.captured,
      isCastling: result.flags.includes('k') || result.flags.includes('q'),
      isPromotion: result.flags.includes('p'),
    };
  } catch {
    return { isCheck: false, isCheckmate: false, isCapture: false, isCastling: false, isPromotion: false };
  }
}

/**
 * Convert move to UCI notation (e.g., e2e4)
 */
export function moveToUCI(fen: string, move: string): string | null {
  try {
    const chess = new Chess(fen);
    const result = chess.move(move);
    if (!result) return null;
    return result.from + result.to + (result.promotion || '');
  } catch {
    return null;
  }
}

export default {
  validateMove,
  getLegalMoves,
  getFenAfterMove,
  isCheckmate,
  isStalemate,
  isDraw,
  isCheck,
  generateMove,
  getMoveDetails,
  moveToUCI,
};
