// CONTEXT: AI, // FOCUS: WeightedChoice
import type { BattleState, BattleCharacter, BattleLogEntry } from '../../types';
import type { Move } from '../../types/move.types';
import type { Location } from '@/common/types';
import { getAvailableMovesSimple } from './helpers/conditionHelpers';

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
  move: Move;
  weightFn: WeightFunction;
  description: string;
};

/**
 * @description Fallback move type for when no weighted moves are available
 */
type FallbackMove = {
  move: Move;
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
 * @returns {Array<{move: Move, weight: number, description: string}>} Available moves with weights
 */
export function getAvailableMovesWithWeights(
  self: BattleCharacter,
  weightedMoves: WeightedMove[],
  state: BattleState,
  opp: BattleCharacter,
  log: BattleLogEntry[]
): Array<{move: Move, weight: number, description: string}> {
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
 * @param {Location} location - Optional battle location for collateral damage checks
 * @returns {{move: Move, weights: Array<{move: string, weight: number, description: string}>} | null} Selected move and debug info
 */
export function selectWeightedMove(
  self: BattleCharacter,
  weightedMoves: WeightedMove[],
  state: BattleState,
  opp: BattleCharacter,
  log: BattleLogEntry[],
  location?: Location
): {move: Move, weights: Array<{move: string, weight: number, description: string}>} | null {
  const availableMoves = getAvailableMovesWithWeights(self, weightedMoves, state, opp, log);
  
  // If no weighted moves available, add fallback moves with minimum weight
  if (availableMoves.length === 0) {
    const allMoves = getAvailableMovesSimple(self, location);
    
    // Enhanced fallback logic: prioritize signature moves and damaging moves over basic strikes
    const signatureMoves = ['Wind Slice', 'Blue Fire', 'Blazing Counter', 'Flowing Evasion'];
    const damagingMoves = ['Fire Dash', 'Air Glide', 'Lightning Strike'];
    
    // During escalation, be even more aggressive about avoiding Basic Strike
    const isInEscalation = self.flags?.forcedEscalation === 'true';
    
    const fallbackMoves = allMoves.map((move: Move) => {
      let weight = 1; // Base weight
      let description = 'Fallback move';
      
      // Prioritize signature moves
      if (signatureMoves.includes(move.name)) {
        weight = isInEscalation ? 50 : 30; // Even higher priority during escalation
        description = isInEscalation ? 'FORCED ESCALATION - Signature move fallback' : 'Signature move fallback';
      }
      // Prioritize damaging moves
      else if (damagingMoves.includes(move.name)) {
        weight = isInEscalation ? 25 : 15;
        description = isInEscalation ? 'FORCED ESCALATION - Damaging move fallback' : 'Damaging move fallback';
      }
      // Heavy penalty for Basic Strike during escalation
      else if (move.name === 'Basic Strike' && isInEscalation) {
        weight = 0; // Effectively disable Basic Strike during escalation
        description = 'Basic Strike disabled during escalation';
      }
      // Normal weight for other moves
      else {
        weight = 5;
        description = 'Standard fallback move';
      }
      
      return { move, weight, description };
    }).filter(item => item.weight > 0); // Remove disabled moves
    
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
 * @param {Array<{move: Move, weight: number}>} movesWithWeights - Moves with calculated weights
 * @param {number} minWeight - Minimum weight to ensure unpredictability (default: 1)
 * @returns {Array<{move: Move, weight: number}>} Moves with adjusted weights
 */
export function ensureMinimumWeights(
  movesWithWeights: Array<{move: Move, weight: number}>,
  minWeight: number = 1
): Array<{move: Move, weight: number}> {
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