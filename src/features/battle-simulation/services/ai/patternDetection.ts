// CONTEXT: AI Pattern Detection
// RESPONSIBILITY: Detect repeating move patterns in battle history

/**
 * @description Checks if a sequence of moves contains a repeating pattern.
 * @param {string[]} moves - The move history to analyze.
 * @param {number} repeatLength - The length of the pattern to check for.
 * @returns {boolean} True if a repeating pattern is detected.
 */
export function isRepeatingPattern(moves: string[], repeatLength: number = 2): boolean {
  if (moves.length < repeatLength * 2) return false;
  
  const recent = moves.slice(-repeatLength * 2);
  for (let i = 0; i < repeatLength; i++) {
    if (recent[i] !== recent[i + repeatLength]) return false;
  }
  return true;
}

/**
 * @description Detects multiple pattern lengths in move history.
 * @param {string[]} moves - The move history to analyze.
 * @returns {{isInLoop2: boolean, isInLoop3: boolean, isInLoop4: boolean, stuckLoop: boolean}} Pattern detection results.
 */
export function detectPatterns(moves: string[]): {
  isInLoop2: boolean;
  isInLoop3: boolean;
  isInLoop4: boolean;
  stuckLoop: boolean;
} {
  const isInLoop2 = isRepeatingPattern(moves, 2);
  const isInLoop3 = isRepeatingPattern(moves, 3);
  const isInLoop4 = isRepeatingPattern(moves, 4);
  const stuckLoop = isInLoop2 || isInLoop3 || isInLoop4;
  
  return {
    isInLoop2,
    isInLoop3,
    isInLoop4,
    stuckLoop
  };
}

/**
 * @description Gets the most recent moves from history.
 * @param {string[]} moves - The move history.
 * @param {number} count - Number of recent moves to get.
 * @returns {string[]} The most recent moves.
 */
export function getRecentMoves(moves: string[], count: number = 3): string[] {
  return moves.slice(-count);
}

/**
 * @description Checks if a move was used recently.
 * @param {string} moveName - The move to check.
 * @param {string[]} moves - The move history.
 * @param {number} recentCount - How many recent moves to check.
 * @returns {boolean} True if the move was used recently.
 */
export function wasMoveUsedRecently(moveName: string, moves: string[], recentCount: number = 3): boolean {
  const recentMoves = getRecentMoves(moves, recentCount);
  return recentMoves.includes(moveName);
} 