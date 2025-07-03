// CONTEXT: AI Move Selection
// RESPONSIBILITY: Weighted random selection from scored moves
import { Ability } from '@/common/types';
import { MetaState } from './metaState';
import { MoveScore } from './moveScoring';

export interface WeightedMove {
  move: Ability;
  weight: number;
  reasons: string[];
}

/**
 * @description Applies variance to move scores based on meta-state.
 * @param {MoveScore[]} moveScores - The scored moves.
 * @param {MetaState} meta - The current meta-state.
 * @returns {WeightedMove[]} The weighted moves.
 */
export function applyVariance(moveScores: MoveScore[], meta: MetaState): WeightedMove[] {
  return moveScores.map(({ move, score, reasons }) => {
    let weight = Math.max(0.1, score);
    
    // Emotional variance
    if (meta.bored && move.power > 40) {
      weight *= 1.5;
    }
    if (meta.frustrated && move.tags?.includes('high-damage')) {
      weight *= 1.8;
    }
    if (meta.desperate && move.power > 60) {
      weight *= 2.0;
    }
    
    // Tactical variance
    if (meta.stuckLoop && move.power > 40) {
      weight *= 1.6;
    }
    if (meta.finishingTime && move.power > 60) {
      weight *= 2.2;
    }
    
    return { move, weight, reasons };
  });
}

/**
 * @description Performs weighted random selection from the top moves.
 * @param {WeightedMove[]} weightedMoves - The weighted moves.
 * @returns {WeightedMove} The selected move.
 */
export function weightedRandom(weightedMoves: WeightedMove[]): WeightedMove {
  const topMoves = weightedMoves.slice(0, 3);
  const totalWeight = topMoves.reduce((sum, move) => sum + move.weight, 0);
  
  // Normalize weights
  topMoves.forEach(move => {
    move.weight = move.weight / totalWeight;
  });
  
  // Weighted random selection
  const random = Math.random();
  let cumulativeWeight = 0;
  
  for (const move of topMoves) {
    cumulativeWeight += move.weight;
    if (random <= cumulativeWeight) {
      return move;
    }
  }
  
  return topMoves[0]; // Fallback
}

/**
 * @description Selects a move using the complete weighted selection pipeline.
 * @param {MoveScore[]} moveScores - The scored moves.
 * @param {MetaState} meta - The current meta-state.
 * @returns {WeightedMove} The selected move with reasons.
 */
export function selectMove(moveScores: MoveScore[], meta: MetaState): WeightedMove {
  const weightedMoves = applyVariance(moveScores, meta);
  return weightedRandom(weightedMoves);
} 