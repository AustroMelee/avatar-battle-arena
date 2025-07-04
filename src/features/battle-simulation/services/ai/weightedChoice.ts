// CONTEXT: AI, // FOCUS: WeightedChoice
import type { BattleState, BattleCharacter, BattleLogEntry } from '../../types';
import type { Ability } from '@/common/types';
import { getAvailableMoves } from './helpers/conditionHelpers';

/**
 * @description Weight function type for move selection
 */
export type WeightFunction = (
  state: BattleState,
  self: BattleCharacter,
  opp: BattleCharacter,
  log: BattleLogEntry[]
) => number;

/**
 * @description Move with associated weight function
 */
export type WeightedMove = {
  id: string;
  move: Ability;
  weightFn: WeightFunction;
  description: string;
};

/**
 * @description Fallback move type for when no weighted moves are available
 */
type FallbackMove = {
  move: Ability;
  weight: number;
  description: string;
};

/**
 * @description Weighted random choice selection
 * @param {T[]} items - Array of items to choose from
 * @param {(item: T) => number} getWeight - Function to get weight for each item
 * @returns {T | undefined} Selected item or undefined if no valid choices
 */
export function weightedRandomChoice<T>(
  items: T[], 
  getWeight: (item: T) => number
): T | undefined {
  if (items.length === 0) return undefined;
  
  const total = items.reduce((sum, item) => sum + getWeight(item), 0);
  if (total === 0) return undefined;
  
  let threshold = Math.random() * total;
  
  for (const item of items) {
    threshold -= getWeight(item);
    if (threshold <= 0) {
      return item;
    }
  }
  
  // Fallback to last item (shouldn't happen with proper weights)
  return items[items.length - 1];
}

/**
 * @description Get available moves with weights for a character
 * @param {BattleCharacter} self - The AI character
 * @param {WeightedMove[]} weightedMoves - Available weighted moves
 * @param {BattleState} state - Current battle state
 * @param {BattleCharacter} opp - Opponent character
 * @param {BattleLogEntry[]} log - Battle log
 * @returns {Array<{move: Ability, weight: number, description: string}>} Available moves with weights
 */
export function getAvailableMovesWithWeights(
  self: BattleCharacter,
  weightedMoves: WeightedMove[],
  state: BattleState,
  opp: BattleCharacter,
  log: BattleLogEntry[]
): Array<{move: Ability, weight: number, description: string}> {
  const movesWithWeights = weightedMoves
    .map(({ move, weightFn, description }) => {
      const weight = weightFn(state, self, opp, log);
      return { move, weight, description };
    })
    .filter(({ weight }) => weight > 0);
  
  // Ensure all legal moves have at least weight 1 for unpredictability
  const movesWithMinWeights = movesWithWeights.map(({ move, weight, description }) => ({
    move,
    weight: Math.max(weight, 1), // Minimum weight of 1
    description
  }));
  
  return movesWithMinWeights.sort((a, b) => b.weight - a.weight); // Sort by weight descending
}

/**
 * @description Select a move using weighted random choice
 * @param {BattleCharacter} self - The AI character
 * @param {WeightedMove[]} weightedMoves - Available weighted moves
 * @param {BattleState} state - Current battle state
 * @param {BattleCharacter} opp - Opponent character
 * @param {BattleLogEntry[]} log - Battle log
 * @returns {{move: Ability, weights: Array<{move: string, weight: number, description: string}>} | null} Selected move and debug info
 */
export function selectWeightedMove(
  self: BattleCharacter,
  weightedMoves: WeightedMove[],
  state: BattleState,
  opp: BattleCharacter,
  log: BattleLogEntry[]
): {move: Ability, weights: Array<{move: string, weight: number, description: string}>} | null {
  const availableMoves = getAvailableMovesWithWeights(self, weightedMoves, state, opp, log);
  
  // If no weighted moves available, add fallback moves with minimum weight
  if (availableMoves.length === 0) {
    const fallbackMoves = getAvailableMoves(self).map((move: Ability) => ({
      move,
      weight: 1, // Minimum weight for unpredictability
      description: 'Fallback move'
    }));
    
    if (fallbackMoves.length === 0) return null;
    
    console.log(`[WEIGHTED CHOICE] ${self.name} using fallback moves:`, fallbackMoves.map((f: FallbackMove) => f.move.name));
    
    const selected = weightedRandomChoice(fallbackMoves, (item: FallbackMove) => item.weight);
    if (selected) {
      const weights = fallbackMoves.map(({ move, weight, description }: FallbackMove) => ({
        move: move.name,
        weight,
        description
      }));
      return { move: selected.move, weights };
    }
    return null;
  }
  
  // Log weights for debugging
  const weights = availableMoves.map(({ move, weight, description }) => ({
    move: move.name,
    weight,
    description
  }));
  
  console.log(`[WEIGHTED CHOICE] ${self.name} available moves:`, weights);
  console.log(`[WEIGHTED CHOICE] ${self.name} total weight: ${availableMoves.reduce((sum, item) => sum + item.weight, 0)}`);
  
  // Select using weighted random choice
  const selected = weightedRandomChoice(availableMoves, item => item.weight);
  
  if (selected) {
    console.log(`[WEIGHTED CHOICE] ${self.name} selected: ${selected.move.name} (weight: ${selected.weight})`);
    console.log(`[WEIGHTED CHOICE] ${self.name} selection probability: ${((selected.weight / availableMoves.reduce((sum, item) => sum + item.weight, 0)) * 100).toFixed(1)}%`);
    return { move: selected.move, weights };
  }
  
  return null;
}

/**
 * @description Ensure all legal moves have a minimum weight for unpredictability
 * @param {Array<{move: Ability, weight: number}>} movesWithWeights - Moves with calculated weights
 * @param {number} minWeight - Minimum weight to ensure unpredictability (default: 1)
 * @returns {Array<{move: Ability, weight: number}>} Moves with adjusted weights
 */
export function ensureMinimumWeights(
  movesWithWeights: Array<{move: Ability, weight: number}>,
  minWeight: number = 1
): Array<{move: Ability, weight: number}> {
  return movesWithWeights.map(({ move, weight }) => ({
    move,
    weight: Math.max(weight, minWeight)
  }));
}

/**
 * @description Debug function to log all move weights for a character
 * @param {BattleCharacter} self - The AI character
 * @param {WeightedMove[]} weightedMoves - Available weighted moves
 * @param {BattleState} state - Current battle state
 * @param {BattleCharacter} opp - Opponent character
 * @param {BattleLogEntry[]} log - Battle log
 */
export function debugMoveWeights(
  self: BattleCharacter,
  weightedMoves: WeightedMove[],
  state: BattleState,
  opp: BattleCharacter,
  log: BattleLogEntry[]
): void {
  console.log(`[DEBUG WEIGHTS] ${self.name} move analysis:`);
  
  weightedMoves.forEach(({ move, weightFn, description }) => {
    const weight = weightFn(state, self, opp, log);
    console.log(`  ${move.name}: ${weight} (${description})`);
  });
} 